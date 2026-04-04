import { NextResponse } from 'next/server';
import axios from 'axios';
import { logger } from '@/lib/logger';

// Serverless ortamda Redis yerine static cache - her invoke'da reset olur
let staticCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2 dakika (daha kısa süre)

export async function GET() {
  try {
    // Static cache kontrolü - sadece aynı invocation içinde çalışır
    if (staticCache && Date.now() - staticCache.timestamp < CACHE_DURATION) {
      logger.debug('Static cache\'den döviz kuru döndürülüyor', { age: Date.now() - staticCache.timestamp });
      return NextResponse.json(staticCache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300'
        }
      });
    }

    // Gerçek zamanlı döviz kuru için farklı API'ler - paralel çağrı
    const apis = [
      'https://api.frankfurter.app/latest?from=EUR&to=TRY,USD',
      'https://api.exchangerate-api.com/v4/latest/EUR',
      'https://api.ratesapi.io/api/latest?base=EUR&symbols=TRY,USD'
    ];

    // Paralel API çağrıları - Promise.allSettled kullan
    const promises = apis.map(async (apiUrl) => {
      try {
        const response = await axios.get(apiUrl, { timeout: 2000 }); // Timeout 2 saniye
        let eurTryRate = null;
        let eurUsdRate = null;

        // Farklı API formatlarını kontrol et
        if (response.data?.rates?.TRY) {
          eurTryRate = response.data.rates.TRY;
        } else if (response.data?.quotes?.EURTRY) {
          eurTryRate = response.data.quotes.EURTRY;
        } else if (response.data?.data?.TRY) {
          eurTryRate = response.data.data.TRY;
        } else if (response.data?.rates?.EURTRY) {
          eurTryRate = response.data.rates.EURTRY;
        }

        if (response.data?.rates?.USD) {
          eurUsdRate = response.data.rates.USD;
        } else if (response.data?.quotes?.EURUSD) {
          eurUsdRate = response.data.quotes.EURUSD;
        } else if (response.data?.data?.USD) {
          eurUsdRate = response.data.data.USD;
        }

        if (eurTryRate && eurTryRate > 0) {
          return {
            success: true,
            data: {
              eurTry: parseFloat(eurTryRate.toFixed(2)),
              eurUsd: eurUsdRate ? parseFloat(eurUsdRate.toFixed(2)) : null,
              source: 'live',
              timestamp: new Date().toISOString()
            },
            apiUrl
          };
        }
        return { success: false, apiUrl };
      } catch (apiError) {
        const errorMessage = apiError instanceof Error ? apiError.message : 'Bilinmeyen hata';
        logger.warn(`API hatası (${apiUrl})`, { error: errorMessage });
        return { success: false, apiUrl };
      }
    });

    // Tüm API'leri paralel çağır
    const results = await Promise.allSettled(promises);
    
    // İlk başarılı sonucu bul
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        const responseData = result.value.data;
        if (responseData && responseData.eurTry) {
          logger.info(`Döviz kuru başarıyla alındı`, { rate: responseData.eurTry, source: result.value.apiUrl });
          
          // Static cache'e kaydet
          staticCache = {
            data: responseData,
            timestamp: Date.now()
          };
        
          return NextResponse.json(responseData, {
            headers: {
              'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300'
            }
          });
        }
      }
    }

    // Tüm API'ler başarısız — sabit kur yok; istemci "Yükleniyor" gösterir
    logger.warn('Tüm döviz API\'leri başarısız, kur dönülmüyor');
    const unavailable = {
      eurTry: null as number | null,
      eurUsd: null as number | null,
      source: 'unavailable',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(unavailable, {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=30'
      }
    });

  } catch (error) {
    logger.error('Euro kuru çekilemedi', { error });
    const unavailable = {
      eurTry: null as number | null,
      eurUsd: null as number | null,
      source: 'error',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(unavailable, {
      headers: {
        'Cache-Control': 'public, max-age=15, s-maxage=15'
      }
    });
  }
}