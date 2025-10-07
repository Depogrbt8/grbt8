import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { validatePasswordStrength } from '@/lib/authSecurity';

export async function POST(request: Request) {
  try {
    // 1. Session kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    // 2. Basit doğrulama
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    // 3. Yeni şifre güçlülük kontrolü
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Şifre güvenlik gereksinimlerini karşılamıyor: ' + passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // 4. Gerçek kullanıcıyı veritabanından bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // 5. Mevcut şifreyi doğrula (bcrypt ile)
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Mevcut şifre yanlış' },
        { status: 400 }
      );
    }

    // 6. Yeni şifreyi hashle
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 7. Veritabanında şifreyi güncelle
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(
      { message: 'Şifre başarıyla değiştirildi' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Şifre değiştirme hatası', { error });
    return NextResponse.json(
      { error: 'Şifre değiştirme başarısız' },
      { status: 500 }
    );
  }
} 