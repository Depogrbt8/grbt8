import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public endpoint - authentication gerektirmiyor
export async function GET() {
  try {
    const keywords = await prisma.seoKeyword.findMany({
      select: {
        id: true,
        keyword: true,
        targetUrl: true,
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(keywords);
  } catch (error) {
    console.error('Public SEO Keywords GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

