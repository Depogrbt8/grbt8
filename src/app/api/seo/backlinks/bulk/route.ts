import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Toplu backlink ekleme
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { backlinks } = await request.json();

    if (!Array.isArray(backlinks)) {
      return NextResponse.json({ error: 'Invalid input: backlinks must be an array' }, { status: 400 });
    }

    let addedCount = 0;
    let updatedCount = 0;
    const errorsList: string[] = [];

    for (const backlinkData of backlinks) {
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
      } = backlinkData;

      if (!url || !domain) {
        errorsList.push(`${url || 'N/A'}: URL and domain are required`);
        continue;
      }

      try {
        // URL'den domain çıkart
        let extractedDomain = domain;
        try {
          const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
          extractedDomain = urlObj.hostname.replace('www.', '');
        } catch (e) {
          // Domain zaten verilmişse kullan
        }

        const result = await prisma.backlink.upsert({
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

        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          addedCount++;
        } else {
          updatedCount++;
        }
      } catch (error: any) {
        errorsList.push(`${url}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      added: addedCount,
      updated: updatedCount,
      errors: errorsList.length,
      total: backlinks.length,
      errorsList: errorsList.slice(0, 10), // Sadece ilk 10 hatayı göster
    });

  } catch (error) {
    console.error('Backlinks Bulk POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

