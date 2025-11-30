const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

async function addKeywords() {
  console.log(`Toplam ${keywords.length} anahtar kelime ekleniyor...\n`);

  let added = 0;
  let updated = 0;
  let errors = 0;

  for (const keyword of keywords) {
    try {
      // Keyword'ü trim et ve boş olmayan kelimeleri kontrol et
      const trimmedKeyword = keyword.trim();
      if (!trimmedKeyword) {
        console.log(`⚠️  Boş anahtar kelime atlandı`);
        continue;
      }

      // Önce kontrol et - var mı?
      const existing = await prisma.seoKeyword.findUnique({
        where: { keyword: trimmedKeyword },
      });

      // Upsert kullan - eğer varsa güncelle, yoksa oluştur
      const result = await prisma.seoKeyword.upsert({
        where: { keyword: trimmedKeyword },
        update: {
          lastChecked: new Date(),
          updatedAt: new Date(),
        },
        create: {
          keyword: trimmedKeyword,
          trend: 'stable',
          lastChecked: new Date(),
        },
      });

      if (existing) {
        updated++;
        console.log(`🔄 Güncellendi: ${trimmedKeyword}`);
      } else {
        added++;
        console.log(`✅ Eklendi: ${trimmedKeyword}`);
      }
    } catch (error) {
      errors++;
      console.error(`❌ Hata (${keyword}):`, error.message);
    }
  }

  console.log(`\n=== Özet ===`);
  console.log(`✅ Yeni eklenen: ${added}`);
  console.log(`🔄 Güncellenen: ${updated}`);
  console.log(`❌ Hata: ${errors}`);
  console.log(`📊 Toplam: ${keywords.length}`);
}

addKeywords()
  .catch((error) => {
    console.error('Script hatası:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

