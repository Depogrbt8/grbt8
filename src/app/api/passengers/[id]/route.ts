import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: Belirli bir yolcuyu getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const passenger = await prisma.passenger.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!passenger) {
      return NextResponse.json(
        { error: 'Yolcu bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(passenger);
  } catch (error) {
    console.error('Yolcu getirme hatası:', error);
    return NextResponse.json(
      { error: 'Yolcu bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT: Yolcu bilgilerini güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Basit validasyon
    if (!data.firstName || !data.lastName || !data.birthDay || !data.birthMonth || !data.birthYear || !data.gender) {
      return NextResponse.json(
        { error: 'Gerekli alanları doldurunuz' },
        { status: 400 }
      );
    }

    // TC Kimlik validasyonu (basit)
    if (!data.isForeigner && data.identityNumber && data.identityNumber.length !== 11) {
      return NextResponse.json(
        { error: 'TC Kimlik numarası 11 haneli olmalıdır' },
        { status: 400 }
      );
    }
    
    // TC vatandaşı değilse TC No'yu temizle
    if (data.isForeigner) {
      data.identityNumber = '';
    }

    // Yolcunun mevcut olduğunu ve bu kullanıcıya ait olduğunu kontrol et
    const existingPassenger = await prisma.passenger.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingPassenger) {
      return NextResponse.json(
        { error: 'Yolcu bulunamadı' },
        { status: 404 }
      );
    }

    // Yolcu verilerini güncelle
    const updatedPassenger = await prisma.passenger.update({
      where: {
        id: params.id
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        identityNumber: data.identityNumber,
        isForeigner: data.isForeigner || false,
        birthDay: data.birthDay,
        birthMonth: data.birthMonth,
        birthYear: data.birthYear,
        gender: data.gender,
        countryCode: data.countryCode,
        phone: data.phone,
        hasMilCard: data.hasMilCard || false,
        hasPassport: data.hasPassport || false,
        passportNumber: data.passportNumber,
        passportExpiry: data.passportExpiry ? new Date(data.passportExpiry) : null,
        milCardNumber: data.milCardNumber,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedPassenger);
  } catch (error) {
    console.error('Yolcu güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Yolcu bilgileri güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE: Yolcu kaydını sil (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Yolcunun mevcut olduğunu ve bu kullanıcıya ait olduğunu kontrol et
    const existingPassenger = await prisma.passenger.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingPassenger) {
      return NextResponse.json(
        { error: 'Yolcu bulunamadı' },
        { status: 404 }
      );
    }
    // Hesap sahibi yolcu silinemez
    if (existingPassenger.isAccountOwner) {
      return NextResponse.json(
        { error: 'Hesap sahibi yolcu silinemez' },
        { status: 403 }
      );
    }

    // Soft delete
    await prisma.passenger.update({
      where: {
        id: params.id
      },
      data: {
        status: 'deleted',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Yolcu silme hatası:', error);
    return NextResponse.json(
      { error: 'Yolcu silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 