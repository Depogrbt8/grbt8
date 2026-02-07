import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/adminAuth';

// GET: Otel rezervasyonlarını listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const userId = searchParams.get('userId');

    // Admin panel veya normal kullanıcı authentication kontrolü
    const authCheck = await checkAdminAccess(request);
    if (!authCheck.authorized) {
      return authCheck.error!;
    }

    // Filtre oluştur
    const where: Record<string, unknown> = {};

    if (authCheck.isAdminPanel) {
      // Admin panel'den gelen istek - userId parametresi ile filtreleme yapılabilir
      if (userId) {
        where.userId = userId;
      }
      // Admin panel tüm rezervasyonları görebilir (userId yoksa)
    } else {
      // Normal kullanıcı isteği - session kontrolü yapıldı
      const session = await getServerSession(authOptions);
      
      // Veritabanından admin kontrolü
      const currentUser = await prisma.user.findUnique({
        where: { id: session!.user.id },
        select: { role: true }
      });

      // Normal kullanıcılar sadece kendi rezervasyonlarını görebilir
      if (currentUser?.role !== 'admin') {
        where.userId = session!.user.id;
      } else if (userId) {
        // Admin belirli bir kullanıcının rezervasyonlarını filtreleyebilir
        where.userId = userId;
      }
    }

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.hotelBooking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.hotelBooking.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Hotel bookings list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hotel bookings' },
      { status: 500 }
    );
  }
}

// POST: Yeni otel rezervasyonu oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      hotelId,
      hotelName,
      hotelLocation,
      roomType,
      roomName,
      checkIn,
      checkOut,
      nights,
      guests,
      guestInfo,
      contactInfo,
      guestDetails,
      totalPrice,
      currency,
      cancellationPolicy,
      specialRequests,
      provider
    } = body;

    // Validasyon
    if (!hotelId || !hotelName || !roomType || !roomName || !checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // contactInfo + guestDetails (yeni) veya guestInfo (eski) kabul et
    const hasNewFormat = contactInfo && Array.isArray(guestDetails);
    const guestInfoPayload = hasNewFormat
      ? JSON.stringify({
          firstName: guestDetails[0]?.firstName || '',
          lastName: guestDetails[0]?.lastName || '',
          email: contactInfo.email || '',
          phone: contactInfo.phone || '',
          countryCode: contactInfo.countryCode || '+90'
        })
      : guestInfo
        ? JSON.stringify(guestInfo)
        : null;

    // Confirmation number oluştur
    const confirmationNumber = `GRB${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const booking = await prisma.hotelBooking.create({
      data: {
        userId: session.user.id,
        hotelId,
        hotelName,
        hotelLocation: hotelLocation || '',
        roomType,
        roomName,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        nights: nights || Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)),
        guests: JSON.stringify(guests),
        guestInfo: guestInfoPayload,
        contactInfo: hasNewFormat ? JSON.stringify(contactInfo) : null,
        guestDetails: hasNewFormat ? JSON.stringify(guestDetails) : null,
        totalPrice,
        currency: currency || 'EUR',
        status: 'confirmed',
        confirmationNumber,
        cancellationPolicy,
        specialRequests,
        provider: provider || 'demo'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        booking,
        confirmationNumber
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Hotel booking create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create hotel booking' },
      { status: 500 }
    );
  }
}

