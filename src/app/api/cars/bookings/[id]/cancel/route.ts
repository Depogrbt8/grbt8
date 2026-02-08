// Araç Rezervasyonu İptal API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Rezervasyonu kontrol et
    const booking = await prisma.carBooking.findFirst({
      where: {
        id: params.id,
        userId: user.id
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
