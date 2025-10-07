/**
 * GÜVENLİ PAYMENT SİSTEMİ
 * 
 * ✅ Kart bilgileri backend'e GELMİYOR
 * ✅ Direkt BiletDukkani Payment Gateway'e gidiyor
 * ✅ PCI-DSS uyumlu
 * ✅ 3D Secure destekli
 */

import { logger } from '@/lib/logger';

export interface SecurePaymentRequest {
  // Kart bilgileri YOK - sadece referans bilgiler
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  customerPhone: string;
  // BiletDukkani'den alınan ödeme formu token'ı (onların sistemi oluşturuyor)
  paymentToken?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  threeDSecureUrl?: string; // 3D Secure için redirect URL
  error?: string;
  errorCode?: string;
}

/**
 * Güvenli ödeme işlemi - BiletDukkani Payment Gateway
 */
export async function processSecurePayment(
  request: SecurePaymentRequest
): Promise<PaymentResult> {
  try {
    logger.payment('Güvenli ödeme başlatıldı', {
      amount: `${request.amount} ${request.currency}`,
      orderId: request.orderId
      // ⚠️ Kart bilgisi ASLA loglanmaz
    });

    // BiletDukkani'nin gerçek payment API'sini çağırın
    // NOT: Bu endpoint BiletDukkani dokümantasyonundan alınacak
    const response = await fetch('https://api.biletdukkani.com/payment/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BILETDUKKANI_API_KEY}`,
      },
      body: JSON.stringify({
        orderId: request.orderId,
        amount: request.amount,
        currency: request.currency,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        // Kart bilgileri frontend'den direkt BiletDukkani'ye gidiyor (iframe veya redirect)
        paymentToken: request.paymentToken
      })
    });

    if (!response.ok) {
      throw new Error(`Payment API error: ${response.statusText}`);
    }

    const result = await response.json();

    // 3D Secure gerekiyorsa
    if (result.requires3DSecure) {
      logger.payment('3D Secure redirect', {
        orderId: request.orderId
      });
      
      return {
        success: false, // Henüz tamamlanmadı
        threeDSecureUrl: result.threeDSecureUrl
      };
    }

    // Başarılı
    if (result.success) {
      logger.payment('Ödeme başarılı', {
        orderId: request.orderId,
        transactionId: result.transactionId
      });

      return {
        success: true,
        transactionId: result.transactionId
      };
    }

    // Başarısız
    return {
      success: false,
      error: result.error || 'Ödeme başarısız',
      errorCode: result.errorCode
    };

  } catch (error) {
    logger.error('Ödeme işlemi hatası', {
      error: error instanceof Error ? error.message : 'Unknown error',
      orderId: request.orderId
    });

    return {
      success: false,
      error: 'Ödeme işlemi sırasında bir hata oluştu',
      errorCode: 'PAYMENT_ERROR'
    };
  }
}

/**
 * 3D Secure callback handler
 */
export async function handle3DSecureCallback(
  orderId: string,
  callbackData: any
): Promise<PaymentResult> {
  try {
    // BiletDukkani'nin 3D Secure callback endpoint'ini çağır
    const response = await fetch('https://api.biletdukkani.com/payment/3ds-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BILETDUKKANI_API_KEY}`,
      },
      body: JSON.stringify({
        orderId,
        callbackData
      })
    });

    const result = await response.json();

    if (result.success) {
      logger.payment('3D Secure başarılı', {
        orderId,
        transactionId: result.transactionId
      });
    } else {
      logger.payment('3D Secure başarısız', {
        orderId,
        error: result.error
      });
    }

    return {
      success: result.success,
      transactionId: result.transactionId,
      error: result.error,
      errorCode: result.errorCode
    };

  } catch (error) {
    logger.error('3D Secure callback hatası', {
      error: error instanceof Error ? error.message : 'Unknown error',
      orderId
    });

    return {
      success: false,
      error: '3D Secure doğrulama hatası',
      errorCode: '3DS_ERROR'
    };
  }
}

/**
 * Demo ödeme (sadece development için)
 */
export async function processSecurePaymentDemo(
  request: SecurePaymentRequest
): Promise<PaymentResult> {
  logger.info('⚠️ DEMO ödeme modu aktif');

  // Demo gecikme simüle et
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    success: true,
    transactionId: `DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

