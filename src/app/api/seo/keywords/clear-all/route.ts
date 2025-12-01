import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// DELETE - Tüm anahtar kelimeleri temizle
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin kontrolü
    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@grbt8.store,manager@grbt8.store')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    if (!adminEmails.includes(session.user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Önce sayıyı al
    const count = await prisma.seoKeyword.count();

    // Tüm keyword'leri sil
    const result = await prisma.seoKeyword.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `${result.count} anahtar kelime başarıyla silindi`,
      deletedCount: result.count,
      previousCount: count,
    });

  } catch (error: any) {
    console.error('Clear all keywords error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message,
    }, { status: 500 });
  }
}

