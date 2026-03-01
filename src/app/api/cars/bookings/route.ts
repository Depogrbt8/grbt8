// Araç Rezervasyonları API

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/jwtAuth';
import prisma from '@/lib/prisma';

/**
 * GET /api/cars/bookings
 * Kullanıcının araç rezervasyonlarını listele.
 * Admin: x-admin-panel-token ile tüm rezervasyonlar (userId, status filtresi destekli).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const skip = (page - 1) * limit;

    const adminToken = request.headers.get('x-admin-panel-token');
    const isAdminPanel = adminToken === process.env.ADMIN_PANEL_SECRET;

    let where: Record<string, unknown> = {};

    if (isAdminPanel) {
      if (userId) where.userId = userId;
    } else {
      const userId = await getUserIdFromRequest(request);
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    const [bookingsRaw, total] = await Promise.all([
      prisma.carBooking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: isAdminPanel
          ? {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          : undefined
      }),
      prisma.carBooking.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        bookings: bookingsRaw,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Car bookings fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cars/bookings
 * Yeni araç rezervasyonu oluştur
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Rezervasyon verisi
    const bookingData = {
      userId,
      bookingNumber: body.bookingNumber,
      bookingReference: body.bookingReference,
      
      // Araç bilgileri
      carId: body.car.id,
      carName: body.car.name,
      carCategory: body.car.category,
      carImage: body.car.imageUrl,
      transmission: body.car.transmission,
      fuelType: body.car.fuelType,
      seats: body.car.seats,
      
      // Tedarikçi
      supplierId: body.car.supplierId,
      supplierName: body.car.supplierName,
      supplierLogo: body.car.supplierLogo,
      
      // Rota
      pickupLocation: JSON.stringify(body.route.pickup.location),
      dropoffLocation: JSON.stringify(body.route.dropoff.location),
      pickupDateTime: new Date(body.route.pickup.datetime),
      dropoffDateTime: new Date(body.route.dropoff.datetime),
      pickupDepot: JSON.stringify(body.route.pickup.depot),
      dropoffDepot: JSON.stringify(body.route.dropoff.depot),
      
      // Sürücü
      driver: JSON.stringify(body.driver),
      additionalDrivers: body.additionalDrivers ? JSON.stringify(body.additionalDrivers) : null,
      
      // Ekstralar
      extras: body.extras ? JSON.stringify(body.extras) : null,
      insurance: body.insurance ? JSON.stringify(body.insurance) : null,
      
      // Fiyat
      priceBreakdown: JSON.stringify(body.priceBreakdown),
      totalPrice: body.priceBreakdown.total,
      currency: body.priceBreakdown.currency,
      depositAmount: body.priceBreakdown.deposit,
      excessAmount: body.priceBreakdown.excess,
      
      // Durum
      status: body.status || 'confirmed',
      
      // İletişim
      confirmationEmail: body.confirmationEmail,
      confirmationSms: body.confirmationSms,
      
      // Politikalar
      cancellationPolicy: body.cancellationPolicy,
      amendmentPolicy: body.amendmentPolicy,
      
      // Provider
      provider: body.provider || 'demo',
      providerBookingId: body.providerBookingId,
      searchToken: body.searchToken
    };
    
    // Rezervasyonu oluştur
    const booking = await prisma.carBooking.create({
      data: bookingData
    });
    
    // Email ve SMS gönder (async, hata olsa bile devam et)
    try {
      const { sendBookingConfirmationEmail } = await import('@/modules/car/services/email');
      const { sendBookingConfirmationSMS } = await import('@/modules/car/services/sms');
      
      // Bildirim için booking objesini oluştur
      const bookingForNotification = {
        ...body,
        id: booking.id,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString()
      };
      
      // Email ve SMS'i paralel gönder
      Promise.all([
        sendBookingConfirmationEmail(bookingForNotification),
        sendBookingConfirmationSMS(bookingForNotification)
      ]).catch(console.error);
    } catch (notificationError) {
      console.error('Bildirim gönderme hatası:', notificationError);
      // Bildirim hatası rezervasyonu etkilemez
    }
    
    return NextResponse.json({
      success: true,
      data: { booking }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Car booking creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
