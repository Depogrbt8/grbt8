import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// BlogPost tablosunu kontrol et ve gerekirse oluştur
async function ensureBlogPostTable() {
  try {
    await prisma.$queryRaw`SELECT 1 FROM "BlogPost" LIMIT 1`;
  } catch (error: any) {
    console.log('BlogPost tablosu bulunamadı, oluşturuluyor...');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "BlogPost" (
        "id" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "excerpt" TEXT,
        "content" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "author" TEXT NOT NULL DEFAULT 'Gurbetbiz Ekibi',
        "coverImage" TEXT,
        "tags" TEXT,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "viewCount" INTEGER NOT NULL DEFAULT 0,
        "publishedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
      )
    `;

    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "BlogPost_slug_idx" ON "BlogPost"("slug")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "BlogPost_status_idx" ON "BlogPost"("status")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "BlogPost_category_idx" ON "BlogPost"("category")`;
    
    console.log('BlogPost tablosu başarıyla oluşturuldu!');
  }
}

// GET - Tüm blog yazılarını listele (published olanlar)
export async function GET(request: NextRequest) {
  await ensureBlogPostTable();
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Admin kontrolü
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.email && 
      (process.env.ADMIN_EMAILS || 'admin@grbt8.store,manager@grbt8.store')
        .split(',')
        .map(s => s.trim().toLowerCase())
        .includes(session.user.email.toLowerCase());

    const where: any = {};
    
    // Admin değilse sadece published göster
    if (!isAdmin) {
      where.status = 'published';
    } else if (status && status !== 'all') {
      where.status = status;
    }
    // status='all' ise where.status ekleme (tümünü göster)

    if (category) {
      where.category = category;
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: {
        publishedAt: 'desc',
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        author: true,
        coverImage: true,
        tags: true,
        status: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Blog posts GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Yeni blog yazısı ekle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Tablo kontrolü
    await ensureBlogPostTable();

    // Admin kontrolü
    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@grbt8.store,manager@grbt8.store')
      .split(',')
      .map(s => s.trim().toLowerCase());

    if (!adminEmails.includes(session.user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const {
      slug,
      title,
      excerpt,
      content,
      category,
      author,
      coverImage,
      tags,
      status = 'draft',
    } = body;

    if (!slug || !title || !content || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Slug benzersiz mi kontrol et
    const existing = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        category,
        author: author || 'Gurbetbiz Ekibi',
        coverImage,
        tags: tags ? JSON.stringify(tags) : null,
        status,
        publishedAt: status === 'published' ? new Date() : null,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Blog posts POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Blog yazısını güncelle
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Tablo kontrolü
    await ensureBlogPostTable();

    // Admin kontrolü
    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@grbt8.store,manager@grbt8.store')
      .split(',')
      .map(s => s.trim().toLowerCase());

    if (!adminEmails.includes(session.user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Eğer status published'a çekiliyorsa publishedAt güncelle
    if (updateData.status === 'published' && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // Tags varsa JSON'a çevir
    if (updateData.tags && typeof updateData.tags !== 'string') {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Blog posts PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Blog yazısını sil
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin kontrolü
    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@grbt8.store,manager@grbt8.store')
      .split(',')
      .map(s => s.trim().toLowerCase());

    if (!adminEmails.includes(session.user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog posts DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

