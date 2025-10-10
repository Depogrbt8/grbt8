import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keywords = await prisma.seoKeyword.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(keywords);
  } catch (error) {
    console.error('SEO Keywords GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const keyword = await prisma.seoKeyword.upsert({
      where: { keyword: data.keyword },
      update: {
        targetUrl: data.targetUrl,
        targetPosition: data.targetPosition,
        searchVolume: data.searchVolume,
        difficulty: data.difficulty,
        cpc: data.cpc,
        trend: data.trend,
        lastChecked: new Date(),
        updatedAt: new Date(),
      },
      create: {
        keyword: data.keyword,
        targetUrl: data.targetUrl,
        targetPosition: data.targetPosition,
        searchVolume: data.searchVolume,
        difficulty: data.difficulty,
        cpc: data.cpc,
        trend: data.trend || 'stable',
        lastChecked: new Date(),
      }
    });

    return NextResponse.json(keyword);
  } catch (error) {
    console.error('SEO Keywords POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    await prisma.seoKeyword.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SEO Keywords DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
