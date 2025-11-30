import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { keywords } = await request.json();
    
    if (!Array.isArray(keywords)) {
      return NextResponse.json({ error: 'Keywords must be an array' }, { status: 400 });
    }

    let added = 0;
    let updated = 0;
    let errors = 0;
    const errorsList: string[] = [];

    for (const keywordText of keywords) {
      try {
        const trimmedKeyword = keywordText.trim();
        if (!trimmedKeyword) continue;

        const existing = await prisma.seoKeyword.findUnique({
          where: { keyword: trimmedKeyword },
        });

        await prisma.seoKeyword.upsert({
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
        } else {
          added++;
        }
      } catch (error: any) {
        errors++;
        errorsList.push(`${keywordText}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      added,
      updated,
      errors,
      total: keywords.length,
      errorsList: errors > 0 ? errorsList : undefined,
    });
  } catch (error) {
    console.error('Bulk keywords POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

