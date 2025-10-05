import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { validatePasswordStrength } from '@/lib/authSecurity';
import { logger } from '@/lib/logger';

const registerUserSchema = z.object({
    email: z.string().email({ message: "Geçerli bir e-posta adresi girin." }),
    password: z.string().min(8, { message: "Şifre en az 8 karakter olmalıdır." }),
    firstName: z.string().min(2, { message: "Ad en az 2 karakter olmalıdır." }),
    lastName: z.string().min(2, { message: "Soyad en az 2 karakter olmalıdır." }),
    phone: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = registerUserSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.errors.map(e => e.message).join(', ') }, { status: 400 });
        }

        const { email, password, firstName, lastName, phone } = validation.data;

        // Güçlü şifre kontrolü
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json({ 
                error: 'Şifre güvenlik gereksinimlerini karşılamıyor: ' + passwordValidation.errors.join(', ') 
            }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanılıyor.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (tx: any) => {
            // 1. Create the user
            const newUser = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    phone: phone || '',
                },
            });

            // 2. Create the associated passenger for the user
            await tx.passenger.create({
                data: {
                    userId: newUser.id,
                    firstName,
                    lastName,
                    phone,
                    birthDay: '', // Bu alanlar daha sonra kullanıcı tarafından doldurulabilir
                    birthMonth: '',
                    birthYear: '',
                    gender: '',
                    isAccountOwner: true,
                },
            });
            
            return newUser;
        });

        return NextResponse.json({ message: 'Kullanıcı başarıyla oluşturuldu.', userId: result.id }, { status: 201 });

    } catch (error) {
        logger.error('Kayıt hatası', { error });
        return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
    }
} 