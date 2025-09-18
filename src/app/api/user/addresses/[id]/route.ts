import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const addressSchema = z.object({
  type: z.enum(['personal', 'corporate']),
  title: z.string().optional(),
  name: z.string().optional(),
  tcNo: z.string().optional(),
  companyName: z.string().optional(),
  taxOffice: z.string().optional(),
  taxNo: z.string().optional(),
  address: z.string().min(1, 'Adres gereklidir'),
  city: z.string().min(1, 'Şehir gereklidir'),
  district: z.string().min(1, 'İlçe gereklidir'),
});

// PUT - Adresi güncelle
export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

    // Title otomatik oluştur eğer gönderilmemişse
    if (!data.title) {
      data.title = data.type === 'personal' 
        ? (data.name || 'Bireysel Adres')
        : (data.companyName || 'Kurumsal Adres');
    }

    const address = await (prisma as any).address.update({
      where: { 
        id: params.id,
        userId: user.id // Güvenlik için kullanıcının kendi adresini güncelleyebildiğinden emin ol
      },
      data: data,
    });

    return NextResponse.json(address);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Adres güncelleme hatası:', message);
    // TEMP DEBUG: detay mesajı kullanıcıya gösteriliyor (geçici)
    return NextResponse.json({ error: 'Sunucu hatası', detail: message }, { status: 500 });
  }
}

// DELETE - Adresi sil
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

    await (prisma as any).address.delete({
      where: { 
        id: params.id,
        userId: user.id // Güvenlik için kullanıcının kendi adresini silebilmesini sağla
      },
    });

    return NextResponse.json({ message: 'Adres başarıyla silindi' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Adres silme hatası:', message);
    // TEMP DEBUG: detay mesajı kullanıcıya gösteriliyor (geçici)
    return NextResponse.json({ error: 'Sunucu hatası', detail: message }, { status: 500 });
  }
}