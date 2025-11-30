import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 100 anahtar kelime listesi
const keywords = [
  "Almanya Türkiye ucuz uçak bileti",
  "Fransa Türkiye uçuş fırsatları",
  "Belçika Türkiye uçak bileti kampanyası",
  "Hollanda Türkiye uçuşları",
  "Danimarka Türkiye tatil paketleri",
  "Avrupa Türkiye uçuş kampanyaları",
  "Avrupa'dan Türkiye'ye ucuz uçak biletleri",
  "Uygun fiyatlı Türkiye tatili",
  "Antalya ucuz otel rezervasyonu",
  "Antalya otel fırsatları",
  "Muğla otel rezervasyonu",
  "Muğla tatil fırsatları",
  "Mugla otel kampanyaları",
  "Kiralık tatil villaları Türkiye",
  "Kiralık villa Antalya",
  "Kiralık villa Muğla",
  "Kiralık villa Mugla",
  "Kiralık villa Türkiye",
  "Kiralık villa yaz tatili",
  "Türkiye kiralık villa",
  "Kiralık özel villa Türkiye",
  "Kiralık tatil villası",
  "Kiralık villa tatil paketleri",
  "Kiralık villa + uçak bileti paket",
  "Kiralık villa kampanya Türkiye",
  "Kiralık villa fırsat Avrupa gurbetçi",
  "Kiralık villa gurbetçi tatil paket",
  "Kiralık tatil villası kampanya",
  "Havalimanı teslim araç kiralama Türkiye",
  "Havaalanı teslim araç kiralama",
  "Havalimanı araç kiralama",
  "Havaalanı araç kiralama",
  "Antalya havalimanı araç kiralama",
  "Muğla havalimanı araç kiralama",
  "Uzun dönem araç kiralama Türkiye",
  "Uzun dönem araba kiralama Türkiye",
  "Aylık araç kiralama Türkiye",
  "Aylık araba kiralama Türkiye",
  "Antalya uzun dönem araç kiralama",
  "Mugla uzun dönem araç kiralama",
  "Türkiye yaz tatili kampanyası",
  "Türkiye kış tatili uçuş fırsatları",
  "Kış tatili Türkiye ucuz uçak bileti",
  "Kış tatili Türkiye uçak bileti kampanya",
  "Gurbetçi tatil paketleri",
  "Gurbetçi uçuş fırsatları",
  "Yurtdışı Türkiye uçak bileti fırsatları",
  "Avrupa gurbetçi Türkiye tatil paketleri",
  "Uçak bileti + otel paketleri Türkiye",
  "Otel + uçak bileti kampanyası",
  "Türkiye tatil paketleri ucuz",
  "Uygun fiyatlı Türkiye tatil paket",
  "Türkiye villa + uçak bileti paket",
  "Türkiye otel + uçak bileti fırsat",
  "Antalya otel rezervasyonu",
  "Antalya otelleri",
  "Antalya hotel",
  "Antalya hotels",
  "Antalya otel kampanya",
  "Mugla otel",
  "Mugla hotels",
  "Muğla otelleri",
  "Muğla tatil paketleri",
  "Kiralık villa",
  "Kiralık villa Türkiye",
  "Rent a car Türkiye",
  "Car rental Türkiye",
  "Kiralık araba",
  "Kiralık araç",
  "Araç kiralama",
  "Araba kiralama",
  "Pegasus uçuşları Türkiye",
  "Pegasus flights Turkey",
  "THY Türkiye uçuşları",
  "THY flights Turkey",
  "SunExpress Türkiye uçuşları",
  "SunExpress flights Turkey",
  "TUIFly Türkiye uçuşları",
  "TUIFly flights Turkey",
  "Corendon Türkiye uçuşları",
  "Corendon flights Turkey",
  "TatilSepeti Türkiye tatil paketleri",
  "Enuygun ucuz uçak biletleri Türkiye",
  "Yolcu360 araç kiralama Türkiye",
  "ETS Tur Türkiye tatili",
  "Villa kiralama Türkiye",
  "Kiralık villa tatili",
  "Türkiye tatil fırsatları",
  "Gurbetçilere yönelik Türkiye tatili",
  "Yurt dışından Türkiye'ye tatil paket",
  "Avrupa Türkiye tatili fırsat",
  "Türkiye otel rezervasyonu ucuz",
  "Türkiye uçuş fırsatları yaz",
  "Türkiye uçuş fırsatları kış",
  "Turkey travel deals",
  "Cheap flights to Turkey",
  "Flights to Turkey from Europe",
  "Installment flight tickets Europe Turkey",
  "Europe Turkey installment travel platform",
  "Buy now pay later flight Turkey"
];

export async function POST(request: NextRequest) {
  try {
    // Güvenlik için secret token kontrolü
    const authHeader = request.headers.get('authorization');
    const secretToken = process.env.KEYWORD_ADD_SECRET || 'temp-secret-change-me';
    
    if (authHeader !== `Bearer ${secretToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SeoKeyword tablosunu kontrol et ve oluştur
    try {
      const tableCheck = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'SeoKeyword'
        );
      `;
      
      const tableExists = (tableCheck as any)[0]?.exists || false;
      
      if (!tableExists) {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE "SeoKeyword" (
            "id" TEXT NOT NULL,
            "keyword" TEXT NOT NULL,
            "targetUrl" TEXT,
            "currentPosition" INTEGER,
            "targetPosition" INTEGER,
            "searchVolume" INTEGER,
            "difficulty" INTEGER,
            "cpc" DOUBLE PRECISION,
            "trend" TEXT,
            "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "SeoKeyword_pkey" PRIMARY KEY ("id")
          );
        `);
        
        await prisma.$executeRawUnsafe(`
          CREATE UNIQUE INDEX IF NOT EXISTS "SeoKeyword_keyword_key" ON "SeoKeyword"("keyword");
        `);
        
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "SeoKeyword_keyword_idx" ON "SeoKeyword"("keyword");
        `);
        
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "SeoKeyword_currentPosition_idx" ON "SeoKeyword"("currentPosition");
        `);
      }
    } catch (createError: any) {
      // Tablo zaten varsa veya başka hata varsa devam et
      console.log('SeoKeyword table check:', createError.message);
    }

    let added = 0;
    let updated = 0;
    let errors = 0;
    const errorsList: string[] = [];

    for (const keywordText of keywords) {
      try {
        const trimmedKeyword = keywordText.trim();
        if (!trimmedKeyword) continue;

        // SQL injection'a karşı escape et
        const escapedKeyword = trimmedKeyword.replace(/'/g, "''");
        
        // Önce kontrol et - var mı?
        const existingCheck = await prisma.$queryRawUnsafe(`
          SELECT id FROM "SeoKeyword" WHERE keyword = '${escapedKeyword}' LIMIT 1
        `) as any[];

        const exists = existingCheck && existingCheck.length > 0;

        if (exists) {
          // Güncelle
          await prisma.$executeRawUnsafe(`
            UPDATE "SeoKeyword" 
            SET "lastChecked" = NOW(), "updatedAt" = NOW()
            WHERE keyword = '${escapedKeyword}'
          `);
          updated++;
        } else {
          // Yeni ekle
          const id = require('crypto').randomUUID();
          await prisma.$executeRawUnsafe(`
            INSERT INTO "SeoKeyword" (id, keyword, trend, "lastChecked", "createdAt", "updatedAt")
            VALUES ('${id}', '${escapedKeyword}', 'stable', NOW(), NOW(), NOW())
          `);
          added++;
        }
      } catch (error: any) {
        errors++;
        errorsList.push(`${keywordText}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      added,
      updated,
      errors,
      total: keywords.length,
      errorsList: errors > 0 ? errorsList.slice(0, 10) : undefined, // İlk 10 hatayı göster
    });
  } catch (error: any) {
    console.error('Add all keywords error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

