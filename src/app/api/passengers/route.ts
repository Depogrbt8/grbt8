import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: Tüm yolcuları getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Kullanıcıyı email ile bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const passengers = await prisma.passenger.findMany({
      where: {
        userId: user.id,
        status: 'active'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(passengers);
  } catch (error) {
    console.error('Yolcu listesi getirme hatası:', error);
    return NextResponse.json(
      { error: 'Yolcu listesi alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST: Yeni yolcu ekle
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Kullanıcıyı email ile bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
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

    // Yolcu verilerini hazırla
    const passengerData = {
      userId: user.id,
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
      hasMilCard: false,
      hasPassport: false
    };

    // Yolcuyu kaydet
    const passenger = await prisma.passenger.create({
      data: passengerData
    });

    return NextResponse.json(passenger);
  } catch (error) {
    console.error('Yolcu ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Yolcu eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 