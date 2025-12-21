import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Blog yazısının view count'unu artır
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: {
        slug: params.slug,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // View count artır
    const updatedPost = await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
      select: {
        viewCount: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      viewCount: updatedPost.viewCount 
    });
  } catch (error) {
    console.error('Blog post view increment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

