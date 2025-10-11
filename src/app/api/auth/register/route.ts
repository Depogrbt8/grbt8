import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { logger } from '@/utils/error';
import { ApiError, successResponse, ErrorCode } from '@/utils/errorResponse';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      countryCode, 
      phone, 
      birthDay, 
      birthMonth, 
      birthYear, 
      gender, 
      identityNumber, 
      isForeigner 
    } = await request.json();

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return ApiError.missingField('Tüm zorunlu alanlar');
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ApiError.invalidInput('Geçersiz email adresi');
    }

    // Email kullanımda mı kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return ApiError.alreadyExists('Email adresi');
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        countryCode,
        phone,
        birthDay,
        birthMonth,
        birthYear,
        gender,
        identityNumber,
        isForeigner: isForeigner || false,
        status: 'active'
      }
    });

    // Kullanıcıyı otomatik olarak ilk yolcu (hesap sahibi) olarak ekle
    await prisma.passenger.create({
      data: {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        identityNumber: user.identityNumber,
        isForeigner: user.isForeigner,
        birthDay: user.birthDay || '',
        birthMonth: user.birthMonth || '',
        birthYear: user.birthYear || '',
        gender: user.gender || '',
        countryCode: user.countryCode,
        phone: user.phone,
        isAccountOwner: true, // HESAP SAHİBİ - SİLİNEMEZ
        status: 'active'
      }
    });

    // NOT: Admin panel ve ana site aynı Neon PostgreSQL database'ini kullanıyor
    // Bu yüzden ayrıca HTTP sync'e gerek yok - kullanıcı zaten her iki panelde de görünüyor

    logger.info('Yeni kullanıcı ve otomatik passenger kaydedildi:', { 
      email: user.email, 
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Kullanıcıyı otomatik olarak giriş yapmış gibi yönlendir
    const response = NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu ve giriş yapıldı',
      redirect: '/hesabim',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

    // Session cookie'si oluştur (NextAuth benzeri)
    response.cookies.set('auth-token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 gün
    });

    return response;
    
  } catch (error) {
    return ApiError.databaseError(error as Error);
  }
}
