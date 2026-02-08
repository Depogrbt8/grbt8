import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getHotelDetails } from '@/modules/hotel/services';
import { getUserIdFromRequest } from '@/lib/jwtAuth';

// GET: Otel rezervasyonlarını listele (admin: tümü, normal kullanıcı: sadece kendi)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const userId = searchParams.get('userId');

    const where: Record<string, unknown> = {};

    // Admin panel token varsa admin olarak işle
    const adminToken = request.headers.get('x-admin-panel-token');
    const isAdminPanel = adminToken === process.env.ADMIN_PANEL_SECRET;

    if (isAdminPanel) {
      if (userId) where.userId = userId;
    } else {
      // JWT token (mobil) veya NextAuth session (web) ile userId al
      const currentUserId = await getUserIdFromRequest(request);
      if (!currentUserId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: { role: true }
      });
      if (currentUser?.role === 'admin' && userId) {
        where.userId = userId;
      } else {
        where.userId = currentUserId;
      }
    }

    if (status) {
      where.status = status;
    }

    const [bookingsRaw, total] = await Promise.all([
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

    // Her rezervasyona ilgili otelin ilk resmini ekle (DB'de saklanmaz, runtime'da doldurulur)
    const bookings = await Promise.all(
      bookingsRaw.map(async (b) => {
        try {
          const hotel = await getHotelDetails(b.hotelId);
          const firstImage = hotel?.images?.[0] || null;
          return { ...b, hotelImageUrl: firstImage };
        } catch {
          return { ...b, hotelImageUrl: null };
        }
      })
    );

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
    // JWT token (mobil) veya NextAuth session (web) ile userId al
    const currentUserId = await getUserIdFromRequest(request);
    
    if (!currentUserId) {
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

    // provider: 'demo' için null kullan - HotelApiProvider'da demo kaydı yoksa FK hatası önlenir
    const providerValue = provider && provider !== 'demo' ? provider : null;

    const guestsPayload = guests && typeof guests === 'object'
      ? JSON.stringify(guests)
      : JSON.stringify({ adults: 1, children: 0, rooms: 1 });
    const totalPriceNum = Number(totalPrice);
    if (isNaN(totalPriceNum) || totalPriceNum < 0) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz tutar' },
        { status: 400 }
      );
    }

    const bookingData = {
      userId: currentUserId,
      hotelId,
      hotelName,
      hotelLocation: hotelLocation || '',
      roomType,
      roomName,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      nights: nights || Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)),
      guests: guestsPayload,
      guestInfo: guestInfoPayload,
      contactInfo: hasNewFormat ? JSON.stringify(contactInfo) : null,
      guestDetails: hasNewFormat ? JSON.stringify(guestDetails) : null,
      totalPrice: totalPriceNum,
      currency: currency || 'EUR',
      status: 'confirmed',
      confirmationNumber,
      cancellationPolicy: cancellationPolicy || null,
      specialRequests: specialRequests || null,
      provider: providerValue
    };
    const booking = await prisma.hotelBooking.create({
      data: bookingData
    });

    return NextResponse.json({
      success: true,
      data: {
        booking,
        confirmationNumber
      }
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Hotel booking create error:', error);
    const errCode = error && typeof error === 'object' && 'code' in error ? String((error as { code?: string }).code) : '';
    const errMsg = error instanceof Error ? error.message : '';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create hotel booking',
        code: errCode || undefined,
        ...(process.env.NODE_ENV === 'development' && errMsg && { debug: errMsg })
      },
      { status: 500 }
    );
  }
}

