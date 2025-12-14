import { NextResponse } from 'next/server';
import { validate } from '@/utils/validation';
import { userSchema } from '@/utils/validation';
import { logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { createBruteForceProtection, resetLoginAttempts, getClientIP } from '@/lib/authSecurity';
import { createJWTToken } from '@/lib/jwtAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Input validation
    await validate(userSchema.login, body);
    const { email, password } = body;

    // Brute force koruması
    const nextRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(body)
    });
    
    const bruteForceMiddleware = createBruteForceProtection({
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 dakika
      windowMs: 15 * 60 * 1000 // 15 dakika
    });

    // Brute force kontrolü
    const bruteForceResponse = await bruteForceMiddleware(nextRequest as any);
    if (bruteForceResponse.status === 429) {
      return bruteForceResponse;
    }

    // Veritabanından kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    
    if (!user || !user.password) {
      logger.warn(`Başarısız giriş denemesi: ${email}`);
      return NextResponse.json({
        success: false,
        message: 'Geçersiz e-posta veya şifre'
      }, { status: 401 });
    }

    // Şifreyi karşılaştır
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      logger.warn(`Başarısız giriş denemesi: ${email}`);
      return NextResponse.json({
        success: false,
        message: 'Geçersiz e-posta veya şifre'
      }, { status: 401 });
    }

    // Kullanıcı durumu kontrolü
    if (user.status !== 'active') {
      logger.warn(`Pasif kullanıcı giriş denemesi: ${email}`);
      return NextResponse.json({
        success: false,
        message: 'Hesabınız aktif değil'
      }, { status: 403 });
    }

    // Başarılı giriş - brute force sayacını sıfırla
    const ip = getClientIP(nextRequest as any);
    resetLoginAttempts(ip);

    // JWT token'ları oluştur
    // Access token: 1 saat geçerli
    const accessToken = await createJWTToken(
      {
        id: user.id,
        email: user.email,
      },
      '1h'
    );

    // Refresh token: 30 gün geçerli
    const refreshToken = await createJWTToken(
      {
        id: user.id,
        email: user.email,
        type: 'refresh',
      },
      '30d'
    );

    // Son giriş zamanını güncelle
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    logger.info(`Mobil uygulama başarılı giriş: ${email}`);

    return NextResponse.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        customerNo: user.customerNo,
      }
    });

  } catch (error) {
    logger.error('Mobil giriş hatası', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: false,
      message: 'Giriş işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
      errorCode: 'LOGIN_ERROR'
    }, { status: 500 });
  }
}

