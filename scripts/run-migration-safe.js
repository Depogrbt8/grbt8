const { execSync } = require('child_process');

try {
  console.log('🔄 Migration çalıştırılıyor...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migration başarılı');
} catch (error) {
  // Migration hatası - tablo zaten varsa devam et
  if (error.message.includes('P3005') || error.message.includes('baseline')) {
    console.log('⚠️  Migration geçmişi yok, mevcut tablolar baseline olarak işaretleniyor...');
    try {
      // Tüm migration'ları baseline olarak işaretle
      const { readdirSync } = require('fs');
      const { join } = require('path');
      const migrationsDir = join(process.cwd(), 'prisma/migrations');
      const migrations = readdirSync(migrationsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .sort();
      
      for (const migration of migrations) {
        try {
          execSync(`npx prisma migrate resolve --applied ${migration}`, { stdio: 'ignore' });
        } catch (e) {
          // Ignore individual errors
        }
      }
      console.log('✅ Baseline tamamlandı');
    } catch (baselineError) {
      console.log('⚠️  Baseline hatası, devam ediliyor...');
    }
  } else {
    console.error('❌ Migration hatası:', error.message);
    process.exit(1);
  }
}

