import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createCSRFProtection } from './lib/csrfProtection';
import { rateLimit } from './lib/redis';
import { getUserFromAuthToken } from './lib/auth';

// Rate limiting ayarları
const RATE_LIMIT_DURATION = 60 * 1000; // 1 dakika
const MAX_REQUESTS = 100; // 1 dakikada maksimum istek sayısı

export async function middleware(request: NextRequest) {
  // Giriş sayfasına yönlendirme kontrolü
  if (request.nextUrl.pathname === '/giris') {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Auth-token cookie kontrolü - yeni kayıt olan kullanıcıları otomatik giriş yapmış gibi yap
  const authToken = request.cookies.get('auth-token')?.value;
  if (authToken && !request.headers.get('authorization')) {
    try {
      const user = await getUserFromAuthToken(authToken);
      if (user) {
        // Kullanıcıyı NextAuth session'ına ekle
        response.headers.set('x-user-id', user.id);
        response.headers.set('x-user-email', user.email || '');
        response.headers.set('x-user-name', user.name || '');
      }
    } catch (error) {
      // Auth token geçersizse cookie'yi sil
      response.cookies.delete('auth-token');
    }
  }

  // CORS allowlist (Admin ve Ana Site domainleri)
  const allowedOrigins = new Set<string>([
    'https://www.grbt8.store',
    'https://grbt8.store',
    'https://anasite.grbt8.store',
    'http://localhost:3000',
    'http://localhost:4000',
  ]);
  const requestOrigin = request.headers.get('origin') || '';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isAllowedOrigin = allowedOrigins.has(requestOrigin);

  // CORS headers (sadece API için uygula)
  if (isApiRoute) {
    response.headers.set('Vary', 'Origin');
    response.headers.set('Access-Control-Allow-Origin', isAllowedOrigin ? requestOrigin : 'https://anasite.grbt8.store');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    // Preflight isteği ise erken dön
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
  }

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  // Not: Admin paneli (https://www.grbt8.store) iframe ile ana sitede gösterilebilsin diye frame-src'e admin domaini eklendi
  // GÜVENLİK İYİLEŞTİRMESİ: unsafe-eval kaldırıldı (sistemde kullanılmıyor)
  response.headers.set('Content-Security-Policy', `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://vercel.live https://*.vercel-scripts.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    connect-src 'self' https://vercel.live https://*.vercel-scripts.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://www.grbt8.store https://grbt8.store http://localhost:3000 http://localhost:4000;
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim());

  // API Rate Limiting ve CSRF Protection
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip || 'unknown';
    
    // Redis ile rate limiting kontrolü
    const rateLimitResult = await rateLimit.check(ip, MAX_REQUESTS, RATE_LIMIT_DURATION);
    
    if (!rateLimitResult.allowed) {
      return new NextResponse(JSON.stringify({
        error: 'Too many requests',
        message: 'Please try again later'
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'X-RateLimit-Limit': MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0'
        }
      });
    }

    // Rate limit headers ekle
    response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());

    // CSRF Protection for POST, PUT, DELETE requests
    // NextAuth endpoint'lerini CSRF kontrolünden muaf tut
    const isNextAuthEndpoint = request.nextUrl.pathname.startsWith('/api/auth/');
    // Vercel Cron tetiklemeleri ve monitoring/backup endpoint'leri CSRF'ten muaf (sunucu taraflı çağrı)
    const isCronInvocation = !!request.headers.get('x-vercel-cron');
    const isBackupScheduledEndpoint = request.nextUrl.pathname === '/api/backup/scheduled';
    const isMonitoringCronEndpoint = request.nextUrl.pathname === '/api/monitoring/cron-sample';
    const isMonitoringSystemEndpoint = request.nextUrl.pathname === '/api/monitoring/system';
    
    if (
      ['POST', 'PUT', 'DELETE'].includes(request.method) &&
      !isNextAuthEndpoint &&
      !isCronInvocation &&
      !isBackupScheduledEndpoint &&
      !isMonitoringCronEndpoint &&
      !isMonitoringSystemEndpoint
    ) {
      const csrfMiddleware = createCSRFProtection();
      const csrfResponse = await csrfMiddleware(request);
      if (csrfResponse.status === 403) {
        return csrfResponse;
      }
    }
  }

  // /admin ve /grbt-8: arama motoru engelleme ve ek sertleştirme
  if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/grbt-8')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    if (process.env.NODE_ENV === 'production' && request.nextUrl.protocol !== 'https:') {
      return NextResponse.redirect(new URL('https://' + request.nextUrl.host + request.nextUrl.pathname));
    }
  }

  return response;
}

// Middleware'in çalışacağı path'leri belirt
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 