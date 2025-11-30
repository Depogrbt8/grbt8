const { PrismaClient } = require('@prisma/client');
const { readFileSync } = require('fs');
const { join } = require('path');

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

