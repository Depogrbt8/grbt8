import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerNo = searchParams.get('customerNo');

    if (!customerNo) {
      return NextResponse.json({ error: 'customerNo parameter required (e.g., #619R2L)' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { customerNo: customerNo.startsWith('#') ? customerNo : `#${customerNo}` },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        customerNo: true,
        phone: true,
        countryCode: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

