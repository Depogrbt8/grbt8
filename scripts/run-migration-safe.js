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

    if (backlinkTableExists) {
      // Mevcut backlink sayısını kontrol et
      const existingCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Backlink";`;
      const count = parseInt(existingCount[0]?.count || '0');

      if (count < predefinedBacklinks.length) {
        console.log(`📝 ${predefinedBacklinks.length} backlink ekleniyor...`);
        let addedCount = 0;

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

            // Prisma Client ile upsert (daha güvenli)
            try {
              await prisma.backlink.upsert({
                where: { url: normalizedUrl },
                update: {
                  domain: extractedDomain,
                  anchorText: backlinkData.anchorText || null,
                  type: backlinkData.type,
                  status: backlinkData.status,
                  qualityScore: backlinkData.qualityScore,
                  lastChecked: new Date(),
                  updatedAt: new Date(),
                },
                create: {
                  url: normalizedUrl,
                  domain: extractedDomain,
                  anchorText: backlinkData.anchorText || null,
                  type: backlinkData.type,
                  status: backlinkData.status,
                  qualityScore: backlinkData.qualityScore,
                },
              });
              addedCount++;
            } catch (upsertError) {
              // Hata durumunda devam et
              console.log(`⚠️  ${normalizedUrl} eklenirken hata:`, upsertError.message);
            }
          } catch (error) {
            // Hata durumunda devam et
          }
        }
        console.log(`✅ ${addedCount} backlink eklendi`);
      } else {
        console.log(`✅ Backlink'ler zaten eklenmiş (${count} adet)`);
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

