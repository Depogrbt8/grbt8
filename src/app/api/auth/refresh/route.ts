import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { verifyJWTToken, createJWTToken } from '@/lib/jwtAuth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        message: 'Refresh token gerekli'
      }, { status: 400 });
    }

    // Refresh token'ı doğrula
    const userId = await verifyJWTToken(refreshToken);
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş refresh token'
      }, { status: 401 });
    }

    // Kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        status: true,
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      }, { status: 404 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({
        success: false,
        message: 'Hesabınız aktif değil'
      }, { status: 403 });
    }

    // Yeni token'ları oluştur
    // Access token: 1 saat geçerli
    const newAccessToken = await createJWTToken(
      {
        id: user.id,
        email: user.email,
      },
      '1h'
    );

    // Yeni refresh token: 30 gün geçerli
    const newRefreshToken = await createJWTToken(
      {
        id: user.id,
        email: user.email,
        type: 'refresh',
      },
      '30d'
    );

    logger.info(`Token yenilendi: ${user.email}`);

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    logger.error('Token yenileme hatası', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: false,
      message: 'Token yenileme işlemi sırasında bir hata oluştu.',
      errorCode: 'REFRESH_ERROR'
    }, { status: 500 });
  }
}

