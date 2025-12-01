import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Anahtar kelime temizliği başlıyor...\n');

  try {
    // Önce mevcut keyword sayısını kontrol et
    const count = await prisma.seoKeyword.count();
    console.log(`📊 Mevcut anahtar kelime sayısı: ${count}\n`);

    if (count === 0) {
      console.log('✅ Temizlenecek keyword yok!\n');
      return;
    }

    // Onay iste
    console.log('⚠️  Tüm anahtar kelimeler silinecek!\n');

    // Tüm keyword'leri sil
    const result = await prisma.seoKeyword.deleteMany({});
    
    console.log(`✅ ${result.count} anahtar kelime başarıyla silindi!\n`);
    
    // Kontrol et
    const remainingCount = await prisma.seoKeyword.count();
    console.log(`📊 Kalan anahtar kelime: ${remainingCount}\n`);

    if (remainingCount === 0) {
      console.log('🎉 Temizlik tamamlandı!\n');
    }

  } catch (error: any) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Kritik hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

