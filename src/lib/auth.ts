import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import { User } from "@prisma/client";
import { Adapter } from "next-auth/adapters";

declare module "next-auth" {
    interface Session {
      user: DefaultSession["user"] & {
        id: string;
        phone?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        countryCode?: string | null;
        birthDay?: string | null;
        birthMonth?: string | null;
        birthYear?: string | null;
        gender?: string | null;
        identityNumber?: string | null;
        isForeigner?: boolean | null;
      };
    }
  }

declare module "next-auth/jwt" {
    interface JWT {
      id: string;
      phone?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      countryCode?: string | null;
      birthDay?: string | null;
      birthMonth?: string | null;
      birthYear?: string | null;
      gender?: string | null;
      identityNumber?: string | null;
      isForeigner?: boolean | null;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                // Giriş yaparken tüm bilgileri ekle
                token.id = user.id;
                token.phone = (user as User).phone;
                token.firstName = (user as User).firstName;
                token.lastName = (user as User).lastName;
                token.countryCode = (user as User).countryCode;
                token.birthDay = (user as User).birthDay;
                token.birthMonth = (user as User).birthMonth;
                token.birthYear = (user as User).birthYear;
                token.gender = (user as User).gender;
                token.identityNumber = (user as User).identityNumber;
                token.isForeigner = (user as User).isForeigner;
            } else if (trigger === 'update' && token.id) {
                // Session güncellendiğinde veritabanından güncel bilgileri çek
                const updatedUser = await prisma.user.findUnique({
                    where: { id: token.id },
                    select: {
                        phone: true,
                        firstName: true,
                        lastName: true,
                        countryCode: true,
                        birthDay: true,
                        birthMonth: true,
                        birthYear: true,
                        gender: true,
                        identityNumber: true,
                        isForeigner: true,
                    }
                });
                
                if (updatedUser) {
                    token.phone = updatedUser.phone;
                    token.firstName = updatedUser.firstName;
                    token.lastName = updatedUser.lastName;
                    token.countryCode = updatedUser.countryCode;
                    token.birthDay = updatedUser.birthDay;
                    token.birthMonth = updatedUser.birthMonth;
                    token.birthYear = updatedUser.birthYear;
                    token.gender = updatedUser.gender;
                    token.identityNumber = updatedUser.identityNumber;
                    token.isForeigner = updatedUser.isForeigner;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.phone = token.phone;
                session.user.firstName = token.firstName;
                session.user.lastName = token.lastName;
                session.user.countryCode = token.countryCode;
                session.user.birthDay = token.birthDay;
                session.user.birthMonth = token.birthMonth;
                session.user.birthYear = token.birthYear;
                session.user.gender = token.gender;
                session.user.identityNumber = token.identityNumber;
                session.user.isForeigner = token.isForeigner;
            }
            return session;
        }
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "email,public_profile"
                }
            }
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials.password) {
                        logger.warn('AUTH_MISSING_CREDENTIALS');
                        return null;
                    }

                    const email = credentials.email.trim().toLowerCase();
                    const password = credentials.password;

                    // Kullanıcıyı veritabanında ara
                    const user = await prisma.user.findUnique({ 
                        where: { email } 
                    });

                    if (!user) {
                        logger.warn('AUTH_USER_NOT_FOUND', { email });
                        return null;
                    }

                    if (!user.password) {
                        logger.warn('AUTH_USER_NO_PASSWORD', { email });
                        return null;
                    }

                    // Şifreyi doğrula
                    const isPasswordValid = await bcrypt.compare(password, user.password);
                    if (!isPasswordValid) {
                        logger.warn('AUTH_PASSWORD_MISMATCH', { email });
                        return null;
                    }

                    if (user.status !== 'active') {
                        logger.warn('AUTH_USER_INACTIVE', { email, status: user.status });
                        return null;
                    }

                // Başarılı giriş
                const name = (user.firstName && user.lastName) 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.email;
                
                return { 
                    ...user, 
                    name,
                    email: user.email 
                };
                } catch (e: any) {
                    logger.error('AUTH_AUTHORIZE_ERROR', { message: e?.message });
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {},
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                domain: process.env.NODE_ENV === 'production' ? '.grbt8.store' : undefined
            }
        }
    }
};

// Auth-token cookie'sinden kullanıcı bilgilerini al
export async function getUserFromAuthToken(authToken: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: authToken },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        countryCode: true,
        birthDay: true,
        birthMonth: true,
        birthYear: true,
        gender: true,
        identityNumber: true,
        isForeigner: true,
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      countryCode: user.countryCode,
      birthDay: user.birthDay,
      birthMonth: user.birthMonth,
      birthYear: user.birthYear,
      gender: user.gender,
      identityNumber: user.identityNumber,
      isForeigner: user.isForeigner,
    };
  } catch (error) {
    logger.error('Auth token user lookup error:', error);
    return null;
  }
} 