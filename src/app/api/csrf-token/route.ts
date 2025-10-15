import { NextResponse } from 'next/server';
import { generateCSRFToken, storeCSRFToken, createCSRFResponse } from '@/lib/csrfProtection';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // CSRF token oluştur
    const token = generateCSRFToken();
    
    // Token'ı kaydet (token'ı key olarak kullan)
    storeCSRFToken(token, token);
    
    // Response oluştur
    const response = createCSRFResponse(token);
    
    logger.debug('CSRF Token oluşturuldu', { token: token.substring(0, 8) + '...' });
    
    return response;
    
  } catch (error) {
    logger.error('CSRF token oluşturma hatası', { error });
    return NextResponse.json(
      { error: 'CSRF token oluşturulamadı' },
      { status: 500 }
    );
  }
}
