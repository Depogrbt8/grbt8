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

// GET - Tüm backlink'leri listele
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Tablo kontrolü
    await ensureBacklinkTable();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const domain = searchParams.get('domain');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (domain) {
      where.domain = { contains: domain, mode: 'insensitive' };
    }

    const backlinks = await prisma.backlink.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return NextResponse.json(backlinks);
  } catch (error) {
    console.error('Backlinks GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Yeni backlink ekle veya güncelle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Tablo kontrolü
    await ensureBacklinkTable();

    const body = await request.json();
    const {
      url,
      domain,
      anchorText,
      type = 'dofollow',
      status = 'active',
      qualityScore = 0,
      domainAuthority,
      pageAuthority,
      notes,
      targetPage,
    } = body;

    if (!url || !domain) {
      return NextResponse.json({ error: 'URL and domain are required' }, { status: 400 });
    }

    // URL'den domain çıkart
    let extractedDomain = domain;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      extractedDomain = urlObj.hostname.replace('www.', '');
    } catch (e) {
      // Domain zaten verilmişse kullan
    }

    const backlink = await prisma.backlink.upsert({
      where: { url: url.startsWith('http') ? url : `https://${url}` },
      update: {
        domain: extractedDomain,
        anchorText,
        type,
        status,
        qualityScore,
        domainAuthority,
        pageAuthority,
        notes,
        targetPage,
        lastChecked: new Date(),
        updatedAt: new Date(),
      },
      create: {
        url: url.startsWith('http') ? url : `https://${url}`,
        domain: extractedDomain,
        anchorText,
        type,
        status,
        qualityScore,
        domainAuthority,
        pageAuthority,
        notes,
        targetPage,
      },
    });

    return NextResponse.json(backlink);
  } catch (error: any) {
    console.error('Backlinks POST error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Backlink already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Backlink sil
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.backlink.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Backlinks DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

