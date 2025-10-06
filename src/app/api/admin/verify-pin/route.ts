import { NextRequest, NextResponse } from 'next/server';
import { ApiError, successResponse } from '@/utils/errorResponse';
import { AdminPinSecurity } from '@/lib/adminSecurity';
import { logger } from '@/lib/logger';
import { getClientIP } from '@/lib/authSecurity';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();
    const clientIP = getClientIP(request);
    
    // Input validation
    if (!pin || typeof pin !== 'string') {
      return ApiError.missingField('PIN');
    }

    // PIN format kontrolü
    if (pin.length < 8 || pin.length > 50) {
      return ApiError.invalidCredentials({
        ip: clientIP,
        reason: 'Invalid PIN format'
      });
    }

    // Güvenli PIN doğrulama
    const correctPin = AdminPinSecurity.getAdminPin();
    const verification = await AdminPinSecurity.verifyPin(pin, correctPin, clientIP);

    if (verification.isLocked) {
      const remainingTime = Math.ceil((verification.lockoutTime! - Date.now()) / 1000);
      return NextResponse.json({
        success: false,
        error: 'PIN_LOCKED',
        message: `Çok fazla başarısız deneme. ${remainingTime} saniye sonra tekrar deneyin.`,
        retryAfter: remainingTime
      }, { status: 429 });
    }

    if (!verification.isValid) {
      // Güvenlik logu
      logger.security('ADMIN_PIN_FAILED', {
        ip: clientIP,
        remainingAttempts: verification.remainingAttempts
      });

      return ApiError.invalidCredentials({
        ip: clientIP,
        remainingAttempts: verification.remainingAttempts
      });
    }

    // Başarılı doğrulama
    logger.security('ADMIN_PIN_SUCCESS', {
      ip: clientIP,
      timestamp: new Date().toISOString()
    });

    return successResponse(null, 'PIN başarıyla doğrulandı');
    
  } catch (error) {
    // Güvenlik hatası - detay verme
    logger.error('Admin PIN verification error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: getClientIP(request)
    });
    
    return ApiError.internalError(new Error('PIN doğrulama hatası'));
  }
}
