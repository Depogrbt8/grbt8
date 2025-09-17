import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const addressSchema = z.object({
  type: z.enum(['personal', 'corporate']),
  title: z.string().min(1, 'Başlık gereklidir'),
  name: z.string().optional(),
  tcNo: z.string().optional(),
  companyName: z.string().optional(),
  taxOffice: z.string().optional(),
  taxNo: z.string().optional(),
  address: z.string().min(1, 'Adres gereklidir'),
  city: z.string().min(1, 'Şehir gereklidir'),
  district: z.string().min(1, 'İlçe gereklidir'),
});

// GET - Kullanıcının adreslerini getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Adres listeleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// POST - Yeni adres ekle
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const body = await req.json();
    const validation = addressSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error.errors.map(e => e.message).join(', ') 
      }, { status: 400 });
    }

    const data = validation.data;

    // Bireysel adres için name zorunlu
    if (data.type === 'personal' && !data.name) {
      return NextResponse.json({ 
        error: 'Bireysel adres için ad soyad gereklidir' 
      }, { status: 400 });
    }

    // Kurumsal adres için companyName, taxOffice ve taxNo zorunlu
    if (data.type === 'corporate' && (!data.companyName || !data.taxOffice || !data.taxNo)) {
      return NextResponse.json({ 
        error: 'Kurumsal adres için şirket adı, vergi dairesi ve vergi no gereklidir' 
      }, { status: 400 });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        ...data,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error('Adres ekleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
