import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getUserFromAuthToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        countryCode: true,
        birthDay: true,
        birthMonth: true,
        birthYear: true,
        gender: true,
        identityNumber: true,
        isForeigner: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    logger.error('Kullanıcı profili hatası', { error });
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}

