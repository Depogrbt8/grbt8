import { NextResponse } from 'next/server';
import { validate } from '@/utils/validation';
import { userSchema } from '@/utils/validation';
import { logger } from '@/utils/error';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { createBruteForceProtection, resetLoginAttempts, getLoginAttempts } from '@/lib/authSecurity';
import { getClientIP } from '@/lib/authSecurity';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // CSRF kontrolü kaldırıldı: SameSite=strict cookie ile korunuyor
    
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
      where: { email: email }
    });
    
    if (user && user.password) {
      // Şifreyi karşılaştır
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        // Başarılı giriş - brute force sayacını sıfırla
        const ip = getClientIP(nextRequest as any);
        resetLoginAttempts(ip);
        
        logger.info(`Başarılı giriş: ${email}`);
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone
          }
        });
      }
    }

    logger.warn(`Başarısız giriş denemesi: ${email}`);
    return NextResponse.json({
      success: false,
      message: 'Geçersiz e-posta veya şifre'
    }, { status: 401 });

  } catch (error) {
    // Detaylı error bilgisini logger'a kaydet (güvenli)
    logger.error('Giriş hatası', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Kullanıcıya generic mesaj döndür (güvenli)
    return NextResponse.json({
      success: false,
      message: 'Giriş işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
      errorCode: 'LOGIN_ERROR'
    }, { status: 500 });
  }
} 