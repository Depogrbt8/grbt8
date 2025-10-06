import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { cacheDeletePattern } from '@/lib/cacheSwitcher';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    logger.api('GET', '/api/reservations', { userId: session?.user?.id });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    logger.debug('Type filter', { type });

    const reservations = await prisma.reservation.findMany({
      where: { 
        userId: session.user.id,
        ...(type && { type })
      },
      orderBy: { createdAt: 'desc' }
    });

    logger.debug('Rezervasyonlar bulundu', { count: reservations.length });
    return NextResponse.json(reservations);
  } catch (error) {
    logger.error('Rezervasyon getirme hatası', { error });
    return NextResponse.json({ error: 'Rezervasyonlar yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await request.json();
    logger.api('POST', '/api/reservations', { userId: body.userId });

    const reservation = await prisma.reservation.create({
      data: {
        userId: session.user.id,
        type: body.type,
        status: body.status,
        amount: body.amount,
        currency: body.currency,
        biletDukkaniOrderId: body.biletDukkaniOrderId,
        biletDukkaniRouteId: body.biletDukkaniRouteId,
        pnr: body.pnr,
        // Bilet Dükkanı API'sinden gelen ek bilgiler
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        passengers: body.passengers,
        flightNumber: body.flightNumber,
        origin: body.origin,
        destination: body.destination,
        departureTime: new Date(body.departureTime),
        arrivalTime: new Date(body.arrivalTime),
        airline: body.airline,
      }
    });

    // Cache invalidation: flight search sonuçlarını temizle
    try {
      await cacheDeletePattern('flight-search:*')
    } catch (e) {
      logger.warn('Cache invalidation failed for flight-search:*', { error: e instanceof Error ? e.message : String(e) })
    }

    logger.info('Rezervasyon başarıyla oluşturuldu', { reservationId: reservation.id });
    return NextResponse.json(reservation);
  } catch (error) {
    // Detaylı error bilgisini logger'a kaydet (güvenli)
    logger.error('Rezervasyon oluşturma hatası', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Kullanıcıya generic mesaj döndür (güvenli)
    return NextResponse.json({ 
      error: 'Rezervasyon oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
      errorCode: 'RESERVATION_ERROR'
    }, { status: 500 });
  }
}
