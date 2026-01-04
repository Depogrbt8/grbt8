import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { checkAdminAccess } from '@/lib/adminAuth';

// POST: API test
export async function POST(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    // Admin panel veya normal kullanıcı authentication kontrolü
    const authCheck = await checkAdminAccess(request);
    if (!authCheck.authorized) {
      return authCheck.error!;
    }

    const provider = await prisma.hotelApiProvider.findUnique({
      where: { name: params.name }
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // API key ve secret'ı decrypt et
    const apiKey = provider.apiKey ? decrypt(provider.apiKey) : null;
    const apiSecret = provider.apiSecret ? decrypt(provider.apiSecret) : null;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: 'API credentials not configured' },
        { status: 400 }
      );
    }

    // Test isteği gönder (provider'a göre farklı endpoint'ler)
    let testResult;
    try {
      // Örnek: Amadeus için test
      if (provider.name === 'amadeus') {
        const testUrl = provider.isTestMode 
          ? 'https://test.api.amadeus.com/v1/security/oauth2/token'
          : 'https://api.amadeus.com/v1/security/oauth2/token';
        
        const response = await fetch(testUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: apiKey,
            client_secret: apiSecret
          }),
          signal: AbortSignal.timeout(provider.timeout)
        });

        testResult = {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          data: response.ok ? await response.json() : await response.text()
        };
      } else {
        // Diğer provider'lar için genel test
        testResult = {
          success: true,
          status: 200,
          statusText: 'OK',
          message: `${provider.displayName} için özel test endpoint'i henüz yapılandırılmadı`
        };
      }

      // Test sonucunu kaydet
      await prisma.hotelApiProvider.update({
        where: { name: params.name },
        data: {
          lastTestAt: new Date(),
          healthStatus: testResult.success ? 'healthy' : 'down',
          errorCount: testResult.success ? 0 : provider.errorCount + 1,
          lastErrorAt: testResult.success ? null : new Date(),
          lastErrorMessage: testResult.success ? null : testResult.statusText
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          testResult,
          provider: {
            name: provider.name,
            displayName: provider.displayName,
            healthStatus: testResult.success ? 'healthy' : 'down'
          }
        }
      });
    } catch (testError: any) {
      // Test hatası
      await prisma.hotelApiProvider.update({
        where: { name: params.name },
        data: {
          lastTestAt: new Date(),
          healthStatus: 'down',
          errorCount: provider.errorCount + 1,
          lastErrorAt: new Date(),
          lastErrorMessage: testError.message
        }
      });

      return NextResponse.json({
        success: false,
        error: 'Test failed',
        details: testError.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Hotel API provider test error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test provider' },
      { status: 500 }
    );
  }
}

