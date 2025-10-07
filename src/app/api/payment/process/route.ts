import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { processSecurePayment, processSecurePaymentDemo } from '@/lib/securePayment';
import { logger } from '@/lib/logger';
import { cacheDeletePattern } from '@/lib/cacheSwitcher';

// Güvenli ödeme şeması (KART BİLGİSİ YOK!)
const processPaymentSchema = z.object({
  orderId: z.string().min(1, 'Sipariş ID gerekli'),
  amount: z.number().positive('Geçerli bir tutar girin'),
  currency: z.string().length(3, 'Geçerli bir para birimi girin'),
  customerEmail: z.string().email('Geçerli email adresi girin'),
  customerPhone: z.string().min(10, 'Geçerli telefon numarası girin'),
  paymentToken: z.string().optional() // BiletDukkani'den gelen token
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Input validation
    const validation = processPaymentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { orderId, amount, currency, customerEmail, customerPhone, paymentToken } = validation.data;

    logger.payment('Güvenli ödeme işlemi başlatıldı', {
      amount: `${amount} ${currency}`,
      orderId
      // ⚠️ KART BİLGİSİ ASLA LOGLANMAZ
    });

    // Güvenli ödeme işlemi (Kart bilgileri backend'e GELMİYOR!)
    const isDevelopment = process.env.NODE_ENV === 'development';
    const paymentResult = isDevelopment
      ? await processSecurePaymentDemo({ orderId, amount, currency, customerEmail, customerPhone, paymentToken })
      : await processSecurePayment({ orderId, amount, currency, customerEmail, customerPhone, paymentToken });

    // 3D Secure gerekiyorsa
    if (paymentResult.threeDSecureUrl) {
      return NextResponse.json({
        success: false,
        requires3DSecure: true,
        redirectUrl: paymentResult.threeDSecureUrl,
        message: '3D Secure doğrulaması gerekli'
      });
    }

    // Başarılı ödeme
    if (paymentResult.success) {
      logger.payment('Ödeme başarılı', {
        orderId,
        transactionId: paymentResult.transactionId
      });
      
      // Cache invalidation: ödeme başarılıysa rezervasyon cache'lerini temizle
      try {
        await cacheDeletePattern('reservation:*');
      } catch (e) {
        logger.warn('Cache invalidation failed', { error: e });
      }

      return NextResponse.json({
        success: true,
        transactionId: paymentResult.transactionId,
        amount: amount,
        currency: currency,
        message: 'Ödeme başarıyla tamamlandı'
      });
    }

    // Başarısız ödeme
    logger.payment('Ödeme başarısız', {
      orderId,
      error: paymentResult.error,
      errorCode: paymentResult.errorCode
    });

    return NextResponse.json(
      { 
        success: false, 
        error: paymentResult.error || 'Ödeme başarısız',
        errorCode: paymentResult.errorCode
      },
      { status: 400 }
    );

  } catch (error) {
    // Detaylı error bilgisini logger'a kaydet (güvenli)
    logger.error('Ödeme işlemi hatası', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Kullanıcıya generic mesaj döndür (güvenli)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ödeme işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        errorCode: 'PAYMENT_ERROR'
      },
      { status: 500 }
    );
  }
}

// GET method'unu devre dışı bırak
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Bu endpoint sadece POST method ile kullanılabilir.' 
    },
    { status: 405 }
  );
}
