const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateGoogleAnalyticsId() {
  try {
    // Mevcut SeoSettings kaydını bul veya oluştur
    const settings = await prisma.seoSettings.findFirst();
    
    if (settings) {
      // Mevcut kaydı güncelle
      const updated = await prisma.seoSettings.update({
        where: { id: settings.id },
        data: {
          googleAnalytics: 'G-LD220JSG3H',
          updatedAt: new Date(),
        },
      });
      console.log('✅ Google Analytics ID güncellendi:', updated.googleAnalytics);
    } else {
      // Yeni kayıt oluştur
      const created = await prisma.seoSettings.create({
        data: {
          siteName: 'gurbetbiz.app',
          siteDescription: 'Avrupa\'dan Türkiye\'ye yol arkadaşınız',
          siteUrl: 'https://gurbetbiz.app',
          defaultTitle: 'gurbetbiz.app - Avrupa\'dan Türkiye\'ye yol arkadaşınız',
          defaultDescription: 'Avrupa\'dan Türkiye\'ye uçak bileti, otel rezervasyonu ve araç kiralama. En uygun fiyatlar, anında rezervasyon, güvenli ödeme, 7/24 destek.',
          defaultKeywords: 'uçak bileti, yurt dışı seyahat, otel rezervasyonu, araç kiralama, gurbet, seyahat platformu',
          googleAnalytics: 'G-LD220JSG3H',
          robotsTxt: `User-agent: *
Allow: /
Disallow: /api/
Disallow: /grbt-8/
Disallow: /admin/
Disallow: /hesabim/

Sitemap: https://gurbetbiz.app/sitemap.xml`,
        },
      });
      console.log('✅ Yeni SeoSettings kaydı oluşturuldu ve Google Analytics ID eklendi:', created.googleAnalytics);
    }
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateGoogleAnalyticsId();

