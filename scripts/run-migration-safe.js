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

