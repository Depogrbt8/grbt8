// Araç Rezervasyonu İptal API

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/jwtAuth';
import prisma from '@/lib/prisma';
import { cancelBooking } from '@/modules/car/services';

/**
 * POST /api/cars/bookings/[id]/cancel
 * Rezervasyonu iptal et
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Rezervasyonu kontrol et
    const booking = await prisma.carBooking.findFirst({
      where: {
        id: params.id,
        userId
      }
    });
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Zaten iptal edilmiş mi?
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Booking already cancelled' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const reason = body.reason || 'User cancellation';
    
    // Provider API'sine iptal isteği gönder
    let refundAmount = 0;
    let message = '';
    
    try {
      const cancellationResult = await cancelBooking(booking.id, reason);
      refundAmount = cancellationResult.refundAmount || 0;
      message = cancellationResult.message || '';
    } catch (error) {
      console.error('Provider cancellation error:', error);
      // Provider hatası olsa bile DB'de iptal et
    }
    
    // DB'de iptal et
    const updatedBooking = await prisma.carBooking.update({
      where: { id: params.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason
      }
    });
    
    // İptal email ve SMS gönder (async)
    try {
      const { sendBookingCancellationEmail } = await import('@/modules/car/services/email');
      const { sendBookingCancellationSMS } = await import('@/modules/car/services/sms');
      
      const bookingForNotification = {
        ...booking,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancellationReason: reason,
        car: JSON.parse(booking.driver), // Mock - gerçekte car objesini parse etmek gerek
        route: {
          pickup: {
            location: JSON.parse(booking.pickupLocation),
            depot: JSON.parse(booking.pickupDepot || '{}'),
            datetime: booking.pickupDateTime.toISOString()
          },
          dropoff: {
            location: JSON.parse(booking.dropoffLocation),
            depot: JSON.parse(booking.dropoffDepot || '{}'),
            datetime: booking.dropoffDateTime.toISOString()
          }
        },
        driver: JSON.parse(booking.driver),
        priceBreakdown: JSON.parse(booking.priceBreakdown)
      };
      
      // Email ve SMS'i paralel gönder
      Promise.all([
        sendBookingCancellationEmail(bookingForNotification as any, refundAmount),
        sendBookingCancellationSMS(bookingForNotification as any, refundAmount)
      ]).catch(console.error);
    } catch (notificationError) {
      console.error('Bildirim gönderme hatası:', notificationError);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        booking: updatedBooking,
        refundAmount,
        message
      }
    });
    
  } catch (error) {
    console.error('Car booking cancellation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
