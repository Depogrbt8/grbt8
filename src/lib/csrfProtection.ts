import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { csrfToken as redisCSRFToken } from './redis'
import { logger } from '@/lib/logger'

// CSRF token store - ARTIK REDIS KULLANILIYOR!
// Memory Map sadece fallback için (Redis erişilemezse)
interface TokenData {
  token: string;
  expires: number;
}

const csrfTokens = new Map<string, TokenData>();

interface CSRFConfig {
  tokenLength: number
  tokenExpiry: number // ms
  cookieName: string
  headerName: string
  skipMethods: string[]
}

const defaultConfig: CSRFConfig = {
  tokenLength: 32,
  tokenExpiry: 60 * 60 * 1000, // 1 saat
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  skipMethods: ['GET', 'HEAD', 'OPTIONS']
}

export function createCSRFProtection(config: Partial<CSRFConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config }

  return async function csrfMiddleware(req: NextRequest) {
    // Skip methods için kontrol
    if (finalConfig.skipMethods.includes(req.method)) {
      return NextResponse.next()
    }

    // CSRF token'ı al
    const tokenFromHeader = req.headers.get(finalConfig.headerName)
    const tokenFromCookie = req.cookies.get(finalConfig.cookieName)?.value

    // Token yoksa hata
    if (!tokenFromHeader && !tokenFromCookie) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      )
    }

    const token = tokenFromHeader || tokenFromCookie

    // Token'ı doğrula
    if (!token || !(await isValidCSRFToken(token))) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    return NextResponse.next()
  }
}

// CSRF token oluştur
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

// CSRF token'ı kaydet (Redis'e)
export function storeCSRFToken(sessionId: string, token: string): void {
  const expires = Date.now() + defaultConfig.tokenExpiry;
  
  // Redis'e kaydet (1 saat TTL)
  redisCSRFToken.set(token, Math.floor(defaultConfig.tokenExpiry / 1000))
    .catch(err => {
      logger.error('CSRF token Redis kaydetme hatası', { error: err });
    });
  
  // Memory'e kaydet - TOKEN'I KEY OLARAK KULLAN!
  csrfTokens.set(token, { token, expires });
  
  // Eski token'ları temizle (basit yaklaşım)
  if (csrfTokens.size > 1000) {
    const now = Date.now();
    for (const [key, data] of csrfTokens.entries()) {
      if (data.expires <= now) {
        csrfTokens.delete(key);
      }
    }
  }
}

// CSRF token'ı doğrula (Redis'ten)
export async function isValidCSRFToken(token: string): Promise<boolean> {
  // Token formatını kontrol et
  if (!token || typeof token !== 'string' || token.length !== 64) {
    logger.debug('CSRF Token format hatası', { tokenLength: token?.length })
    return false
  }

  // Önce Redis'ten kontrol et
  const isValidInRedis = await redisCSRFToken.verify(token);
  
  if (isValidInRedis) {
    logger.debug('CSRF Token kontrolü (Redis)', { token: token.substring(0, 8) + '...', status: 'GEÇERLİ' })
    return true
  }

  // Fallback: Memory'den kontrol et
  const tokenData = csrfTokens.get(token);
  if (tokenData && tokenData.expires > Date.now()) {
    logger.debug('CSRF Token kontrolü (Memory fallback)', { token: token.substring(0, 8) + '...', status: 'GEÇERLİ' })
    return true;
  }
  
  logger.debug('CSRF Token kontrolü', { token: token.substring(0, 8) + '...', status: 'GEÇERSİZ' })
  return false
}

// Sync version for immediate validation
export function validateCSRFToken(token: string): boolean {
  if (!token) return false
  
  // Memory'de ara - token'ı key olarak kullan
  const tokenData = csrfTokens.get(token);
  if (tokenData && tokenData.expires > Date.now()) {
    return true
  }
  
  return false
}

// Eski token'ları temizle
function cleanupExpiredTokens(): void {
  const now = Date.now()
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (data.expires <= now) {
      csrfTokens.delete(sessionId)
    }
  }
}

// CSRF token'ı response'a ekle
export function addCSRFTokenToResponse(response: NextResponse, token: string): NextResponse {
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 // 1 saat
  })
  
  return response
}

// CSRF token'ı API response'unda döndür
export function createCSRFResponse(token: string): NextResponse {
  const response = NextResponse.json({ csrfToken: token })
  return addCSRFTokenToResponse(response, token)
}

// CSRF token'ı form'a ekle (client-side için)
export function getCSRFTokenScript(): string {
  return `
    <script>
      // CSRF token'ı al ve form'lara ekle
      function addCSRFTokenToForms() {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('csrf-token='))
          ?.split('=')[1];
        
        if (token) {
          // Tüm form'lara hidden input ekle
          const forms = document.querySelectorAll('form');
          forms.forEach(form => {
            if (!form.querySelector('input[name="csrf-token"]')) {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = 'csrf-token';
              input.value = token;
              form.appendChild(input);
            }
          });
          
          // AJAX isteklerine header ekle
          const originalFetch = window.fetch;
          window.fetch = function(url, options = {}) {
            options.headers = {
              ...options.headers,
              'X-CSRF-Token': token
            };
            return originalFetch(url, options);
          };
        }
      }
      
      // Sayfa yüklendiğinde çalıştır
      document.addEventListener('DOMContentLoaded', addCSRFTokenToForms);
    </script>
  `
}
