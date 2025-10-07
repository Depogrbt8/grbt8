import { NextRequest, NextResponse } from 'next/server';
import { handle3DSecureCallback } from '@/lib/securePayment';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';

/**
 * 3D Secure Callback Endpoint
 * 
 * BiletDukkani 3D Secure doğrulamasından sonra buraya yönlendirir
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, callbackData } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Sipariş ID gerekli' },
        { status: 400 }
      );
    }

    logger.payment('3D Secure callback alındı', { orderId });

    // 3D Secure callback'i işle
    const result = await handle3DSecureCallback(orderId, callbackData);

    if (result.success) {
      // Önce rezervasyonu sipariş numarasından bul
      const reservation = await prisma.reservation.findFirst({
        where: { biletDukkaniOrderId: orderId },
        select: { id: true },
      });
      if (!reservation) {
        return NextResponse.json(
          { success: false, error: 'Rezervasyon bulunamadı' },
          { status: 404 }
        );
      }

      // Rezervasyonu id (unique) ile güncelle
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          status: 'confirmed',
          updatedAt: new Date(),
        },
      });

      // Payment kaydını güncelle (reservationId = reservation.id)
      await prisma.payment.updateMany({
        where: { reservationId: reservation.id },
        data: {
          status: 'completed',
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        message: 'Ödeme başarıyla tamamlandı'
      });
    }

    // Başarısız
    return NextResponse.json(
      { 
        success: false, 
        error: result.error || '3D Secure doğrulama başarısız',
        errorCode: result.errorCode
      },
      { status: 400 }
    );

  } catch (error) {
    logger.error('3D Secure callback hatası', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        success: false, 
        error: '3D Secure işlemi sırasında bir hata oluştu',
        errorCode: '3DS_CALLBACK_ERROR'
      },
      { status: 500 }
    );
  }
}

// GET method - kullanıcı tarayıcıdan redirect edilirse
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');

    if (!orderId) {
      return NextResponse.redirect('/hata?message=Geçersiz sipariş');
    }

    // Başarılı
    if (status === 'success') {
      return NextResponse.redirect(`/odeme-basarili?orderId=${orderId}`);
    }

    // Başarısız
    return NextResponse.redirect(`/odeme-basarisiz?orderId=${orderId}`);

  } catch (error) {
    logger.error('3D Secure redirect hatası', { error });
    return NextResponse.redirect('/hata?message=Ödeme işlemi sırasında bir hata oluştu');
  }
}

