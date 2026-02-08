// Araç Rezervasyonları API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/cars/bookings
 * Kullanıcının araç rezervasyonlarını listele
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Query parametreleri
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;
    
    // Filtreler
    const where: any = { userId: user.id };
    if (status) {
      where.status = status;
    }
    
    // Rezervasyonları getir
    const [bookings, total] = await Promise.all([
      prisma.carBooking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.carBooking.count({ where })
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        bookings,
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Rezervasyon verisi
    const bookingData = {
      userId: user.id,
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
