import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const predefinedBacklinks = [
  { url: 'https://www.avrupa-postasi.com', domain: 'avrupa-postasi.com', anchorText: 'Avrupa Postası', status: 'active', type: 'dofollow', qualityScore: 70 },
  { url: 'https://www.berlinturk.de', domain: 'berlinturk.de', anchorText: 'Berlin Türk', status: 'active', type: 'dofollow', qualityScore: 65 },
  { url: 'https://www.arti33.com', domain: 'arti33.com', anchorText: 'Artı 33', status: 'active', type: 'dofollow', qualityScore: 60 },
  { url: 'https://www.sonhaber.eu', domain: 'sonhaber.eu', anchorText: 'Son Haber', status: 'active', type: 'dofollow', qualityScore: 65 },
  { url: 'https://www.etstur.com', domain: 'etstur.com', anchorText: 'ETS Tur', status: 'active', type: 'nofollow', qualityScore: 80 },
  { url: 'https://www.yolcu360.com', domain: 'yolcu360.com', anchorText: 'Yolcu360', status: 'active', type: 'nofollow', qualityScore: 75 },
  { url: 'https://www.tatilsepeti.com', domain: 'tatilsepeti.com', anchorText: 'TatilSepeti', status: 'active', type: 'nofollow', qualityScore: 85 },
  { url: 'https://www.enuygun.com', domain: 'enuygun.com', anchorText: 'Enuygun', status: 'active', type: 'nofollow', qualityScore: 90 },
  { url: 'https://www.turkishairlines.com', domain: 'turkishairlines.com', anchorText: 'Turkish Airlines', status: 'active', type: 'nofollow', qualityScore: 95 },
  { url: 'https://www.flypgs.com', domain: 'flypgs.com', anchorText: 'Pegasus', status: 'active', type: 'nofollow', qualityScore: 90 },
  { url: 'https://www.sunexpress.com', domain: 'sunexpress.com', anchorText: 'SunExpress', status: 'active', type: 'nofollow', qualityScore: 85 },
  { url: 'https://www.corendonairlines.com', domain: 'corendonairlines.com', anchorText: 'Corendon Airlines', status: 'active', type: 'nofollow', qualityScore: 80 },
  { url: 'https://www.tuifly.be', domain: 'tuifly.be', anchorText: 'TUIFly', status: 'active', type: 'nofollow', qualityScore: 75 },
];

async function main() {
  console.log('🚀 Backlink ekleme başlıyor...\n');

  // Önce Backlink tablosunun var olup olmadığını kontrol et
  try {
    await prisma.$queryRaw`SELECT 1 FROM "Backlink" LIMIT 1`;
    console.log('✅ Backlink tablosu mevcut\n');
  } catch (error: any) {
    console.log('❌ Backlink tablosu bulunamadı, oluşturuluyor...\n');
    
    // Backlink tablosunu oluştur
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Backlink" (
        "id" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "domain" TEXT NOT NULL,
        "anchorText" TEXT,
        "type" TEXT NOT NULL DEFAULT 'dofollow',
        "status" TEXT NOT NULL DEFAULT 'active',
        "qualityScore" INTEGER NOT NULL DEFAULT 0,
        "domainAuthority" INTEGER,
        "pageAuthority" INTEGER,
        "notes" TEXT,
        "targetPage" TEXT,
        "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "Backlink_pkey" PRIMARY KEY ("id")
      )
    `;

    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "Backlink_url_key" ON "Backlink"("url")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Backlink_domain_idx" ON "Backlink"("domain")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Backlink_status_idx" ON "Backlink"("status")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Backlink_qualityScore_idx" ON "Backlink"("qualityScore")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Backlink_lastChecked_idx" ON "Backlink"("lastChecked")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Backlink_createdAt_idx" ON "Backlink"("createdAt")`;
    
    console.log('✅ Backlink tablosu oluşturuldu\n');
  }

  let added = 0;
  let updated = 0;
  let errors = 0;

  for (const backlink of predefinedBacklinks) {
    try {
      const result = await prisma.backlink.upsert({
        where: { url: backlink.url },
        update: {
          domain: backlink.domain,
          anchorText: backlink.anchorText,
          type: backlink.type,
          status: backlink.status,
          qualityScore: backlink.qualityScore,
          lastChecked: new Date(),
          updatedAt: new Date(),
        },
        create: {
          url: backlink.url,
          domain: backlink.domain,
          anchorText: backlink.anchorText,
          type: backlink.type,
          status: backlink.status,
          qualityScore: backlink.qualityScore,
        },
      });

      // Yeni mi yoksa güncelleme mi kontrol et
      const existing = await prisma.backlink.findUnique({
        where: { url: backlink.url },
        select: { createdAt: true, updatedAt: true }
      });

      if (existing && existing.createdAt.getTime() === existing.updatedAt.getTime()) {
        added++;
        console.log(`✅ Eklendi: ${backlink.domain}`);
      } else {
        updated++;
        console.log(`🔄 Güncellendi: ${backlink.domain}`);
      }
    } catch (error: any) {
      errors++;
      console.log(`❌ Hata (${backlink.domain}): ${error.message}`);
    }
  }

  console.log('\n📊 Özet:');
  console.log(`✅ Eklenen: ${added}`);
  console.log(`🔄 Güncellenen: ${updated}`);
  console.log(`❌ Hata: ${errors}`);
  console.log(`📦 Toplam: ${predefinedBacklinks.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Kritik hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

