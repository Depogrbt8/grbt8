const { PrismaClient } = require('@prisma/client');
const { readFileSync } = require('fs');
const { join } = require('path');

const predefinedBacklinks = [
  { url: 'https://www.avrupa-postasi.com', domain: 'avrupa-postasi.com', anchorText: 'Avrupa Postası', status: 'active', type: 'dofollow', qualityScore: 70 },
  { url: 'https://www.berlinturk.de', domain: 'berlinturk.de', anchorText: 'Berlin Türk', status: 'active', type: 'dofollow', qualityScore: 65 },
  { url: 'https://www.arti33.com/', domain: 'arti33.com', anchorText: 'Artı 33', status: 'active', type: 'dofollow', qualityScore: 60 },
  { url: 'https://www.sonhaber.eu/', domain: 'sonhaber.eu', anchorText: 'Son Haber', status: 'active', type: 'dofollow', qualityScore: 65 },
  { url: 'https://www.etstur.com', domain: 'etstur.com', anchorText: 'ETS Tur', status: 'active', type: 'nofollow', qualityScore: 80 },
  { url: 'https://www.yolcu360.com/', domain: 'yolcu360.com', anchorText: 'Yolcu360', status: 'active', type: 'nofollow', qualityScore: 75 },
  { url: 'https://www.tatilsepeti.com/', domain: 'tatilsepeti.com', anchorText: 'TatilSepeti', status: 'active', type: 'nofollow', qualityScore: 85 },
  { url: 'https://www.enuygun.com', domain: 'enuygun.com', anchorText: 'Enuygun', status: 'active', type: 'nofollow', qualityScore: 90 },
  { url: 'https://www.turkishairlines.com', domain: 'turkishairlines.com', anchorText: 'Turkish Airlines', status: 'active', type: 'nofollow', qualityScore: 95 },
  { url: 'https://www.flypgs.com', domain: 'flypgs.com', anchorText: 'Pegasus', status: 'active', type: 'nofollow', qualityScore: 90 },
  { url: 'https://www.sunexpress.com', domain: 'sunexpress.com', anchorText: 'SunExpress', status: 'active', type: 'nofollow', qualityScore: 85 },
  { url: 'https://www.corendonairlines.com', domain: 'corendonairlines.com', anchorText: 'Corendon Airlines', status: 'active', type: 'nofollow', qualityScore: 80 },
  { url: 'https://www.tuifly.be', domain: 'tuifly.be', anchorText: 'TUIFly', status: 'active', type: 'nofollow', qualityScore: 75 },
];

async function checkAndCreateTable() {
  const prisma = new PrismaClient();
  
  try {
    // SeoSettings tablosunu kontrol et
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'SeoSettings'
      );
    `;
    
    const tableExists = result[0]?.exists || false;
    
    if (!tableExists) {
      console.log('📦 SeoSettings tablosu yok, oluşturuluyor...');
      
      // Migration SQL'ini oku ve çalıştır
      const migrationPath = join(process.cwd(), 'prisma/migrations/20251130160000_add_seo_settings/migration.sql');
      const migrationSQL = readFileSync(migrationPath, 'utf-8');
      
      // SQL'i çalıştır
      await prisma.$executeRawUnsafe(migrationSQL);
      
      console.log('✅ SeoSettings tablosu oluşturuldu');
    } else {
      console.log('✅ SeoSettings tablosu zaten mevcut');
    }

    // Backlink tablosunu kontrol et ve oluştur
    const backlinkTableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Backlink'
      );
    `;
    let backlinkTableExists = (backlinkTableCheck[0]?.exists || false);

    if (!backlinkTableExists) {
      console.log('📦 Backlink tablosu yok, oluşturuluyor...');
      try {
        const backlinkMigrationPath = join(process.cwd(), 'prisma/migrations/20241201_add_backlink_model/migration.sql');
        const backlinkMigrationSQL = readFileSync(backlinkMigrationPath, 'utf-8');
        await prisma.$executeRawUnsafe(backlinkMigrationSQL);
        console.log('✅ Backlink tablosu oluşturuldu');
        backlinkTableExists = true;
      } catch (error) {
        console.log('⚠️  Backlink tablosu oluşturma hatası, devam ediliyor:', error.message);
      }
    } else {
      console.log('✅ Backlink tablosu zaten mevcut');
    }

    // BlogPost tablosunu kontrol et ve oluştur
    const blogPostTableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'BlogPost'
      );
    `;
    const blogPostTableExists = (blogPostTableCheck[0]?.exists || false);

    if (!blogPostTableExists) {
      console.log('📦 BlogPost tablosu yok, oluşturuluyor...');
      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "BlogPost" (
            "id" TEXT NOT NULL,
            "slug" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "excerpt" TEXT,
            "content" TEXT NOT NULL,
            "category" TEXT NOT NULL,
            "author" TEXT NOT NULL DEFAULT 'Gurbetbiz Ekibi',
            "coverImage" TEXT,
            "tags" TEXT,
            "status" TEXT NOT NULL DEFAULT 'draft',
            "viewCount" INTEGER NOT NULL DEFAULT 0,
            "publishedAt" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            
            CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
          )
        `;

        await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "BlogPost_slug_idx" ON "BlogPost"("slug")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "BlogPost_status_idx" ON "BlogPost"("status")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "BlogPost_category_idx" ON "BlogPost"("category")`;
        
        console.log('✅ BlogPost tablosu oluşturuldu');
      } catch (error) {
        console.log('⚠️  BlogPost tablosu oluşturma hatası, devam ediliyor:', error.message);
      }
    } else {
      console.log('✅ BlogPost tablosu zaten mevcut');
    }

    // HotelFavorite tablosunu kontrol et ve oluştur
    const hotelFavoriteTableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'HotelFavorite'
      );
    `;
    const hotelFavoriteTableExists = (hotelFavoriteTableCheck[0]?.exists || false);

    if (!hotelFavoriteTableExists) {
      console.log('📦 HotelFavorite tablosu yok, oluşturuluyor...');
      try {
        // SQL komutlarını tek tek çalıştır
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "HotelFavorite" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "hotelId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "HotelFavorite_pkey" PRIMARY KEY ("id")
          )
        `);
        
        await prisma.$executeRawUnsafe(`
          CREATE UNIQUE INDEX IF NOT EXISTS "HotelFavorite_userId_hotelId_key" 
          ON "HotelFavorite"("userId", "hotelId")
        `);
        
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "HotelFavorite_userId_createdAt_idx" 
          ON "HotelFavorite"("userId", "createdAt")
        `);
        
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "HotelFavorite_hotelId_idx" 
          ON "HotelFavorite"("hotelId")
        `);
        
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "HotelFavorite" 
          ADD CONSTRAINT "HotelFavorite_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") 
          ON DELETE RESTRICT ON UPDATE CASCADE
        `).catch(() => {
          // Constraint zaten varsa devam et
        });
        
        console.log('✅ HotelFavorite tablosu oluşturuldu');
      } catch (error) {
        console.log('⚠️  HotelFavorite tablosu oluşturma hatası, devam ediliyor:', error.message);
      }
    } else {
      console.log('✅ HotelFavorite tablosu zaten mevcut');
      
      // Yeni alanları kontrol et ve ekle
      try {
        const columnCheck = await prisma.$queryRaw`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'HotelFavorite' 
          AND column_name IN ('hotelName', 'hotelLocation', 'hotelImage', 'updatedAt')
        `;
        
        const existingColumns = columnCheck.map(row => row.column_name);
        
        if (!existingColumns.includes('hotelName')) {
          console.log('📦 HotelFavorite tablosuna yeni alanlar ekleniyor...');
          
          await prisma.$executeRawUnsafe(`
            ALTER TABLE "HotelFavorite" 
            ADD COLUMN IF NOT EXISTS "hotelName" TEXT,
            ADD COLUMN IF NOT EXISTS "hotelLocation" TEXT,
            ADD COLUMN IF NOT EXISTS "hotelImage" TEXT,
            ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3)
          `);
          
          // Mevcut kayıtlar için varsayılan değerler
          await prisma.$executeRawUnsafe(`
            UPDATE "HotelFavorite" 
            SET "hotelName" = 'Unknown Hotel',
                "updatedAt" = "createdAt"
            WHERE "hotelName" IS NULL
          `);
          
          // hotelName ve updatedAt zorunlu hale getir
          await prisma.$executeRawUnsafe(`
            ALTER TABLE "HotelFavorite" 
            ALTER COLUMN "hotelName" SET NOT NULL,
            ALTER COLUMN "updatedAt" SET NOT NULL,
            ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP
          `);
          
          console.log('✅ HotelFavorite tablosu güncellendi (hotelName, hotelLocation, hotelImage, updatedAt)');
        }
      } catch (error) {
        console.log('⚠️  HotelFavorite tablo güncelleme hatası, devam ediliyor:', error.message);
      }
    }

    // HotelApiProvider tablosunu kontrol et ve oluştur (HotelBooking'dan önce)
    const hotelApiProviderCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'HotelApiProvider'
      );
    `;
    const hotelApiProviderExists = (hotelApiProviderCheck[0]?.exists || false);

    if (!hotelApiProviderExists) {
      console.log('📦 HotelApiProvider tablosu yok, oluşturuluyor...');
      try {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "HotelApiProvider" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "displayName" TEXT NOT NULL,
            "isActive" BOOLEAN NOT NULL DEFAULT false,
            "isTestMode" BOOLEAN NOT NULL DEFAULT true,
            "apiKey" TEXT,
            "apiSecret" TEXT,
            "apiUrl" TEXT,
            "accessToken" TEXT,
            "refreshToken" TEXT,
            "tokenExpiresAt" TIMESTAMP(3),
            "timeout" INTEGER NOT NULL DEFAULT 30000,
            "retryCount" INTEGER NOT NULL DEFAULT 3,
            "retryDelay" INTEGER NOT NULL DEFAULT 1000,
            "priority" INTEGER NOT NULL DEFAULT 1,
            "maxConcurrentRequests" INTEGER NOT NULL DEFAULT 10,
            "lastSyncAt" TIMESTAMP(3),
            "lastTestAt" TIMESTAMP(3),
            "healthStatus" TEXT NOT NULL DEFAULT 'unknown',
            "healthCheckUrl" TEXT,
            "errorCount" INTEGER NOT NULL DEFAULT 0,
            "lastErrorAt" TIMESTAMP(3),
            "lastErrorMessage" TEXT,
            "description" TEXT,
            "documentationUrl" TEXT,
            "supportEmail" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "HotelApiProvider_pkey" PRIMARY KEY ("id")
          )
        `);
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "HotelApiProvider_name_key" ON "HotelApiProvider"("name")`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "HotelApiProvider_name_idx" ON "HotelApiProvider"("name")`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "HotelApiProvider_isActive_idx" ON "HotelApiProvider"("isActive")`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "HotelApiProvider_healthStatus_idx" ON "HotelApiProvider"("healthStatus")`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "HotelApiProvider_priority_idx" ON "HotelApiProvider"("priority")`);
        console.log('✅ HotelApiProvider tablosu oluşturuldu');
      } catch (error) {
        console.log('⚠️  HotelApiProvider tablosu oluşturma hatası, devam ediliyor:', error.message);
      }
    } else {
      console.log('✅ HotelApiProvider tablosu zaten mevcut');
    }

    // HotelBooking tablosunu kontrol et ve oluştur
    const hotelBookingCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'HotelBooking'
      );
    `;
    const hotelBookingExists = (hotelBookingCheck[0]?.exists || false);

    if (!hotelBookingExists) {
      console.log('📦 HotelBooking tablosu yok, oluşturuluyor...');
      try {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "HotelBooking" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "hotelId" TEXT NOT NULL,
            "hotelName" TEXT NOT NULL,
            "hotelLocation" TEXT NOT NULL,
            "roomType" TEXT NOT NULL,
            "roomName" TEXT NOT NULL,
            "checkIn" TIMESTAMP(3) NOT NULL,
            "checkOut" TIMESTAMP(3) NOT NULL,
            "nights" INTEGER NOT NULL,
            "guests" TEXT NOT NULL,
            "guestInfo" TEXT,
            "contactInfo" TEXT,
            "guestDetails" TEXT,
            "totalPrice" DOUBLE PRECISION NOT NULL,
            "currency" TEXT NOT NULL DEFAULT 'EUR',
            "status" TEXT NOT NULL DEFAULT 'pending',
            "confirmationNumber" TEXT,
            "bookingReference" TEXT,
            "cancellationPolicy" TEXT,
            "specialRequests" TEXT,
            "provider" TEXT,
            "providerBookingId" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "cancelledAt" TIMESTAMP(3),
            "cancellationReason" TEXT,
            CONSTRAINT "HotelBooking_pkey" PRIMARY KEY ("id")
          )
        `);
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "HotelBooking_confirmationNumber_key" ON "HotelBooking"("confirmationNumber") WHERE "confirmationNumber" IS NOT NULL`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "HotelBooking_userId_idx" ON "HotelBooking"("userId")`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "HotelBooking_status_idx" ON "HotelBooking"("status")`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "HotelBooking_checkIn_idx" ON "HotelBooking"("checkIn")`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "HotelBooking_checkOut_idx" ON "HotelBooking"("checkOut")`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "HotelBooking_confirmationNumber_idx" ON "HotelBooking"("confirmationNumber")`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "HotelBooking_providerBookingId_idx" ON "HotelBooking"("providerBookingId")`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "HotelBooking_createdAt_idx" ON "HotelBooking"("createdAt")`);
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "HotelBooking" ADD CONSTRAINT "HotelBooking_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        `).catch(() => {});
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "HotelBooking" ADD CONSTRAINT "HotelBooking_provider_fkey"
          FOREIGN KEY ("provider") REFERENCES "HotelApiProvider"("name") ON DELETE SET NULL ON UPDATE CASCADE
        `).catch(() => {});
        console.log('✅ HotelBooking tablosu oluşturuldu');
      } catch (error) {
        console.log('⚠️  HotelBooking tablosu oluşturma hatası, devam ediliyor:', error.message);
      }
    } else {
      console.log('✅ HotelBooking tablosu zaten mevcut');
      // contactInfo, guestDetails varsa kontrol et
      try {
        const columnCheck = await prisma.$queryRaw`
          SELECT column_name FROM information_schema.columns
          WHERE table_name = 'HotelBooking' AND column_name IN ('contactInfo', 'guestDetails')
        `;
        const cols = (columnCheck || []).map(r => r.column_name);
        if (!cols.includes('contactInfo')) {
          await prisma.$executeRawUnsafe(`ALTER TABLE "HotelBooking" ADD COLUMN IF NOT EXISTS "contactInfo" TEXT`);
          console.log('✅ HotelBooking.contactInfo eklendi');
        }
        if (!cols.includes('guestDetails')) {
          await prisma.$executeRawUnsafe(`ALTER TABLE "HotelBooking" ADD COLUMN IF NOT EXISTS "guestDetails" TEXT`);
          console.log('✅ HotelBooking.guestDetails eklendi');
        }
        if (cols.includes('guestInfo')) {
          await prisma.$executeRawUnsafe(`ALTER TABLE "HotelBooking" ALTER COLUMN "guestInfo" DROP NOT NULL`).catch(() => {});
        }
      } catch (e) {
        console.log('⚠️  HotelBooking kolon kontrolü atlandı:', e.message);
      }
    }

    if (backlinkTableExists) {
      // Her backlink'i tek tek kontrol et ve eksik olanları ekle
      console.log(`📝 ${predefinedBacklinks.length} backlink kontrol ediliyor...`);
      let addedCount = 0;
      let updatedCount = 0;

      for (const backlinkData of predefinedBacklinks) {
        try {
          let extractedDomain = backlinkData.domain;
          try {
            const urlObj = new URL(backlinkData.url);
            extractedDomain = urlObj.hostname.replace('www.', '');
          } catch (e) {
            // Domain zaten verilmişse kullan
          }

          const normalizedUrl = backlinkData.url.endsWith('/') && backlinkData.url !== 'https://' 
            ? backlinkData.url.slice(0, -1) 
            : backlinkData.url;

          // Önce mevcut olup olmadığını kontrol et
          const existing = await prisma.backlink.findUnique({
            where: { url: normalizedUrl },
          });

          if (existing) {
            // Mevcut ise güncelle
            await prisma.backlink.update({
              where: { url: normalizedUrl },
              data: {
                domain: extractedDomain,
                anchorText: backlinkData.anchorText || null,
                type: backlinkData.type,
                status: backlinkData.status,
                qualityScore: backlinkData.qualityScore,
                lastChecked: new Date(),
                updatedAt: new Date(),
              },
            });
            updatedCount++;
          } else {
            // Yoksa oluştur
            await prisma.backlink.create({
              data: {
                url: normalizedUrl,
                domain: extractedDomain,
                anchorText: backlinkData.anchorText || null,
                type: backlinkData.type,
                status: backlinkData.status,
                qualityScore: backlinkData.qualityScore,
              },
            });
            addedCount++;
            console.log(`  ✅ Eklendi: ${normalizedUrl}`);
          }
        } catch (error) {
          // Hata durumunda devam et
          console.log(`⚠️  ${backlinkData.url} işlenirken hata:`, error.message);
        }
      }
      
      if (addedCount > 0 || updatedCount > 0) {
        console.log(`✅ ${addedCount} yeni backlink eklendi, ${updatedCount} backlink güncellendi`);
      } else {
        console.log(`✅ Tüm backlink'ler zaten mevcut (${predefinedBacklinks.length} adet)`);
      }
    }
  } catch (error) {
    // Tablo zaten varsa veya başka bir hata varsa devam et
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('⚠️  Tablo zaten mevcut, devam ediliyor...');
    } else {
      console.log('⚠️  Tablo kontrolü hatası, devam ediliyor:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Ana fonksiyon - await ile çalıştır
(async () => {
  try {
    await checkAndCreateTable();
  } catch (error) {
    console.log('⚠️  Migration kontrolü atlandı, build devam ediyor...');
  }
})();

