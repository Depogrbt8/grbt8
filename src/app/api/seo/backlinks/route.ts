import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Tüm backlink'leri listele
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

