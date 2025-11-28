import { randomBytes, createHash } from 'crypto';
import { logger } from '@/lib/logger';

// 3D Secure interface'leri
export interface ThreeDSecureSession {
  sessionId: string;
  cardToken: string;
  amount: number;
  currency: string;
  acsUrl?: string;
  pareq?: string;
  md?: string;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'completed' | 'failed' | 'expired';
}

export interface ThreeDSecureRequest {
  cardToken: string;
  amount: number;
  currency: string;
  orderId?: string;
  description?: string;
}

export interface ThreeDSecureResponse {
  success: boolean;
  sessionId?: string;
  acsUrl?: string;
  pareq?: string;
  md?: string;
  error?: string;
}

// Memory'de 3D Secure session store (production'da Redis kullanılmalı)
const threeDSessions = new Map<string, ThreeDSecureSession>();

// 3D Secure session süresi (10 dakika)
const SESSION_EXPIRY = 10 * 60 * 1000;

/**
 * 3D Secure işlemini başlatır
 * @param request 3D Secure isteği
 * @returns 3D Secure yanıtı
 */
export function initiate3DSecure(request: ThreeDSecureRequest): ThreeDSecureResponse {
  try {
    // Güvenli session ID oluştur
    const sessionId = generateSecureSessionId();
    
    // 3D Secure session oluştur
    const session: ThreeDSecureSession = {
      sessionId,
      cardToken: request.cardToken,
      amount: request.amount,
      currency: request.currency,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_EXPIRY,
      status: 'pending'
    };

    // Demo 3D Secure URL'leri (gerçek implementasyonda BiletDukkani API'den gelecek)
    const demoAcsUrls = [
      'https://3dsecure-demo.biletdukkani.com/acs',
      'https://secure3d-demo.biletdukkani.com/authentication',
      'https://3ds-demo.biletdukkani.com/verify'
    ];

    // Demo PAReq ve MD (gerçek implementasyonda BiletDukkani API'den gelecek)
    const pareq = generatePAReq(request);
    const md = generateMD(sessionId);

    // Session'ı kaydet
    threeDSessions.set(sessionId, session);

    // Eski session'ları temizle
    cleanupExpiredSessions();

    logger.payment(`3D Secure başlatıldı: Session ${sessionId.substring(0, 8)}... - ${request.amount} ${request.currency}`);

    return {
      success: true,
      sessionId,
      acsUrl: demoAcsUrls[Math.floor(Math.random() * demoAcsUrls.length)],
      pareq,
      md
    };

  } catch (error) {
    // Detaylı error bilgisini logger'a kaydet (güvenli)
    logger.error('3D Secure başlatma hatası', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Generic error döndür (güvenli)
    return {
      success: false,
      error: '3D Secure işlemi başlatılamadı. Lütfen daha sonra tekrar deneyin.'
    };
  }
}

/**
 * 3D Secure doğrulamasını tamamlar
 * @param sessionId Session ID
 * @param pares PARes (3D Secure yanıtı)
 * @returns Doğrulama sonucu
 */
export function complete3DSecure(sessionId: string, pares: string): {
  success: boolean;
  transactionId?: string;
  error?: string;
} {
  try {
    const session = threeDSessions.get(sessionId);
    
    if (!session) {
      return {
        success: false,
        error: 'Geçersiz 3D Secure session'
      };
    }

    if (session.status !== 'pending') {
      return {
        success: false,
        error: 'Bu session zaten işlenmiş'
      };
    }

    if (Date.now() > session.expiresAt) {
      session.status = 'expired';
      return {
        success: false,
        error: '3D Secure session süresi dolmuş'
      };
    }

    // Demo PARes doğrulaması (gerçek implementasyonda BiletDukkani API kullanılacak)
    const isValidPARes = validatePARes(pares);
    
    if (isValidPARes) {
      session.status = 'completed';
      
      // Transaction ID oluştur
      const transactionId = `TXN_3DS_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      logger.payment(`3D Secure başarılı: Session ${sessionId.substring(0, 8)}... - Transaction ${transactionId}`);
      
      return {
        success: true,
        transactionId
      };
    } else {
      session.status = 'failed';
      
      logger.payment(`3D Secure başarısız: Session ${sessionId.substring(0, 8)}... - Geçersiz PARes`);
      
      return {
        success: false,
        error: '3D Secure doğrulaması başarısız'
      };
    }

  } catch (error) {
    // Detaylı error bilgisini logger'a kaydet (güvenli)
    logger.error('3D Secure tamamlama hatası', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Generic error döndür (güvenli)
    return {
      success: false,
      error: '3D Secure doğrulaması tamamlanamadı. Lütfen daha sonra tekrar deneyin.'
    };
  }
}

/**
 * 3D Secure session'ını alır
 * @param sessionId Session ID
 * @returns Session bilgileri
 */
export function get3DSecureSession(sessionId: string): ThreeDSecureSession | null {
  const session = threeDSessions.get(sessionId);
  
  if (!session || Date.now() > session.expiresAt) {
    return null;
  }
  
  return session;
}

/**
 * Güvenli session ID oluşturur
 * @returns Güvenli session ID
 */
function generateSecureSessionId(): string {
  const randomPart = randomBytes(16).toString('hex');
  const timestamp = Date.now().toString(36);
  const hash = createHash('sha256').update(randomPart + timestamp).digest('hex').substring(0, 8);
  
  return `3ds_${timestamp}_${hash}_${randomPart}`;
}

/**
 * PAReq oluşturur (demo)
 * @param request 3D Secure isteği
 * @returns PAReq
 */
function generatePAReq(request: ThreeDSecureRequest): string {
  const paReqData = {
    messageVersion: '2.1.0',
    merchant: {
      name: 'GRBT8 Demo',
      url: 'https://gurbetbiz.app'
    },
    cardToken: request.cardToken.substring(0, 8) + '...',
    amount: request.amount,
    currency: request.currency,
    timestamp: Date.now()
  };
  
  return Buffer.from(JSON.stringify(paReqData)).toString('base64');
}

/**
 * MD (Merchant Data) oluşturur
 * @param sessionId Session ID
 * @returns MD
 */
function generateMD(sessionId: string): string {
  return Buffer.from(sessionId).toString('base64');
}

/**
 * PARes doğrular (demo)
 * @param pares PARes
 * @returns Geçerli mi?
 */
function validatePARes(pares: string): boolean {
  try {
    // Demo: PARes'de "SUCCESS" geçiyorsa başarılı
    const decoded = Buffer.from(pares, 'base64').toString('utf-8');
    return decoded.includes('SUCCESS') || decoded.includes('Y');
  } catch {
    return false;
  }
}

/**
 * Süresi dolmuş session'ları temizler
 */
function cleanupExpiredSessions(): void {
  const now = Date.now();
  
  for (const [sessionId, session] of threeDSessions.entries()) {
    if (now > session.expiresAt) {
      threeDSessions.delete(sessionId);
    }
  }
}

/**
 * 3D Secure istatistiklerini döndürür
 * @returns İstatistikler
 */
export function get3DSecureStats(): {
  activeSessions: number;
  completedSessions: number;
  failedSessions: number;
  expiredSessions: number;
} {
  let activeSessions = 0;
  let completedSessions = 0;
  let failedSessions = 0;
  let expiredSessions = 0;
  
  for (const session of threeDSessions.values()) {
    if (Date.now() > session.expiresAt) {
      expiredSessions++;
    } else {
      switch (session.status) {
        case 'pending':
          activeSessions++;
          break;
        case 'completed':
          completedSessions++;
          break;
        case 'failed':
          failedSessions++;
          break;
      }
    }
  }
  
  return {
    activeSessions,
    completedSessions,
    failedSessions,
    expiredSessions
  };
}
