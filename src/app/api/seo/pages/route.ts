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

    const pages = await prisma.seoPage.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('SEO Pages GET error:', error);
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
    
    const page = await prisma.seoPage.upsert({
      where: { url: data.url },
      update: {
        title: data.title,
        description: data.description,
        keywords: data.keywords,
        h1: data.h1,
        h2: data.h2,
        h3: data.h3,
        metaRobots: data.metaRobots,
        canonical: data.canonical,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImage: data.ogImage,
        twitterTitle: data.twitterTitle,
        twitterDescription: data.twitterDescription,
        twitterImage: data.twitterImage,
        schemaJson: data.schemaJson,
        seoScore: data.seoScore || 0,
        lastChecked: new Date(),
        updatedAt: new Date(),
      },
      create: {
        url: data.url,
        title: data.title,
        description: data.description,
        keywords: data.keywords,
        h1: data.h1,
        h2: data.h2,
        h3: data.h3,
        metaRobots: data.metaRobots || 'index, follow',
        canonical: data.canonical,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImage: data.ogImage,
        twitterTitle: data.twitterTitle,
        twitterDescription: data.twitterDescription,
        twitterImage: data.twitterImage,
        schemaJson: data.schemaJson,
        seoScore: data.seoScore || 0,
        lastChecked: new Date(),
      }
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('SEO Pages POST error:', error);
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

    await prisma.seoPage.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SEO Pages DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
