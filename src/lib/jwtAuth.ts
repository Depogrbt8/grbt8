import { jwtVerify } from 'jose';
import { logger } from '@/lib/logger';

/**
 * JWT token'ı doğrular ve userId'yi döndürür
 * Hata durumunda null döner (sessizce başarısız olur)
 */
export async function verifyJWTToken(token: string): Promise<string | null> {
  try {
    if (!process.env.NEXTAUTH_SECRET) {
      logger.warn('NEXTAUTH_SECRET not configured');
      return null;
    }

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });

    const userId = payload.id as string | undefined;
    
    if (!userId) {
      return null;
    }

    return userId;
  } catch (error) {
    // Sessizce başarısız ol - NextAuth'a fallback yapılacak
    return null;
  }
}

/**
 * Request'ten userId'yi alır (JWT token veya NextAuth session)
 * Önce JWT dener, yoksa NextAuth session kullanır
 */
export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  // 1. Önce Authorization header'ını kontrol et (JWT token)
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const userId = await verifyJWTToken(token);
    if (userId) {
      return userId; // JWT başarılı, döndür
    }
    // JWT geçersizse sessizce devam et (NextAuth'a geç)
  }

  // 2. JWT yoksa veya geçersizse NextAuth session'ı kontrol et
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions);
    
    return session?.user?.id || null;
  } catch (error) {
    logger.error('NextAuth session check failed', { error });
    return null;
  }
}

