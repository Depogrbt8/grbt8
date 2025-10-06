import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { tokenizeCard, getCardFromToken, invalidateToken, getSecureCardInfo } from '@/lib/cardTokenization';
import { getCardBinInfo } from '@/services/paymentApi';
import { logger } from '@/lib/logger';
import { cacheDeletePattern } from '@/lib/cacheSwitcher';

// Güvenli kart işleme şeması
const processPaymentSchema = z.object({
  cardToken: z.string().min(1, 'Kart token gerekli'),
  amount: z.number().positive('Geçerli bir tutar girin'),
  currency: z.string().length(3, 'Geçerli bir para birimi girin'),
  description: z.string().optional(),
  requires3D: z.boolean().optional()
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

    const { cardToken, amount, currency, description, requires3D } = validation.data;

    // Token'dan kart bilgilerini al
    const cardData = getCardFromToken(cardToken);
    if (!cardData) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veya süresi dolmuş kart token' },
        { status: 400 }
      );
    }

    // BIN bilgilerini al
    const binInfo = await getCardBinInfo(cardData.number, {
      price: amount,
      productType: 'flight',
      currencyCode: currency
    });

    // 3D Secure kontrolü
    const needs3D = requires3D || binInfo.isThreeD;
    
    if (needs3D && !binInfo.secure3dPaymentActive) {
      return NextResponse.json(
        { success: false, error: 'Bu kart için 3D Secure gerekli ama desteklenmiyor' },
        { status: 400 }
      );
    }

    // Güvenli kart bilgilerini hazırla (log için)
    const secureCardInfo = getSecureCardInfo(cardToken);
    
    // Payment processing log (güvenli)
    logger.payment('Ödeme işlemi başlatıldı', {
      amount: `${amount} ${currency}`,
      card: `${secureCardInfo?.brand} ****${secureCardInfo?.lastFour}`,
      bin: cardData.number.substring(0, 6) + '****',
      needs3D,
      description
    });

    // Demo ödeme işlemi (gerçek implementasyon için BiletDukkani API kullanılacak)
    const paymentResult = await processPaymentDemo(cardData, amount, currency, needs3D);

    // Başarılı ödeme sonrası token'ı geçersiz kıl
    if (paymentResult.success) {
      invalidateToken(cardToken);
      
      logger.payment('Ödeme başarılı', {
        amount: `${amount} ${currency}`,
        card: `${secureCardInfo?.brand} ****${secureCardInfo?.lastFour}`,
        transactionId: paymentResult.transactionId
      });
      
      return NextResponse.json({
        success: true,
        transactionId: paymentResult.transactionId,
        amount: amount,
        currency: currency,
        cardInfo: {
          brand: secureCardInfo?.brand,
          lastFour: secureCardInfo?.lastFour,
          maskedNumber: `**** **** **** ${secureCardInfo?.lastFour}`
        },
        requires3D: needs3D,
        message: 'Ödeme başarıyla tamamlandı'
      });
    } else {
      return NextResponse.json(
        { success: false, error: paymentResult.error },
        { status: 400 }
      );
    }

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

// Cache invalidation: ödeme başarıyla tamamlanınca uçuş arama cache'lerini temizle
// Not: Gerçek implementasyonda reservation oluşturma akışıyla birlikte yönetilebilir
export async function PUT() {
  try {
    await cacheDeletePattern('flight-search:*')
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

/**
 * Demo ödeme işlemi (gerçek implementasyon için BiletDukkani API kullanılacak)
 */
async function processPaymentDemo(
  cardData: any, 
  amount: number, 
  currency: string, 
  needs3D: boolean
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  
  // Demo: 3D Secure gerekli ise başarısız
  if (needs3D) {
    return {
      success: false,
      error: '3D Secure doğrulaması gerekli. Gerçek implementasyonda BiletDukkani 3D Secure API kullanılacak.'
    };
  }

  // Demo: Direkt ödeme
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
  
  const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  return {
    success: true,
    transactionId
  };
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
