import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Backlink tablosunu kontrol et ve gerekirse oluştur
async function ensureBacklinkTable() {
  try {
    await prisma.$queryRaw`SELECT 1 FROM "Backlink" LIMIT 1`;
  } catch (error: any) {
    // Tablo yoksa oluştur
    console.log('Backlink tablosu bulunamadı, oluşturuluyor...');
    
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
    
    console.log('Backlink tablosu başarıyla oluşturuldu!');
  }
}

// Önceden tanımlanmış backlink'ler
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

// POST - Önceden tanımlanmış backlink'leri ekle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Tablo kontrolü ve otomatik oluşturma
    await ensureBacklinkTable();

    let addedCount = 0;
    let updatedCount = 0;
    const errorsList: string[] = [];

    for (const backlinkData of predefinedBacklinks) {
      try {
        // URL'den domain çıkart
        let extractedDomain = backlinkData.domain;
        try {
          const urlObj = new URL(backlinkData.url);
          extractedDomain = urlObj.hostname.replace('www.', '');
        } catch (e) {
          // Domain zaten verilmişse kullan
        }

        // URL'i normalize et (trailing slash'i kaldır)
        const normalizedUrl = backlinkData.url.endsWith('/') && backlinkData.url !== 'https://' 
          ? backlinkData.url.slice(0, -1) 
          : backlinkData.url;

        const result = await prisma.backlink.upsert({
          where: { url: normalizedUrl },
          update: {
            domain: extractedDomain,
            anchorText: backlinkData.anchorText,
            type: backlinkData.type,
            status: backlinkData.status,
            qualityScore: backlinkData.qualityScore,
            lastChecked: new Date(),
            updatedAt: new Date(),
          },
          create: {
            url: normalizedUrl,
            domain: extractedDomain,
            anchorText: backlinkData.anchorText,
            type: backlinkData.type,
            status: backlinkData.status,
            qualityScore: backlinkData.qualityScore,
          },
        });

        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          addedCount++;
        } else {
          updatedCount++;
        }
      } catch (error: any) {
        errorsList.push(`${backlinkData.url}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      added: addedCount,
      updated: updatedCount,
      errors: errorsList.length,
      total: predefinedBacklinks.length,
      errorsList: errorsList.slice(0, 10),
    });

  } catch (error: any) {
    console.error('Add predefined backlinks error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message,
    }, { status: 500 });
  }
}

