// Tekil Araç Rezervasyonu API

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/jwtAuth';
import prisma from '@/lib/prisma';

/**
 * GET /api/cars/bookings/[id]
 * Rezervasyon detayını getir
 */
export async function GET(
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
    
    return NextResponse.json({
      success: true,
      data: { booking }
    });
    
  } catch (error) {
    console.error('Car booking fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/cars/bookings/[id]
 * Rezervasyonu güncelle
 */
export async function PATCH(
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
    
    const body = await request.json();
    
    // Güncellenebilir alanlar
    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.specialRequests) updateData.specialRequests = body.specialRequests;
    
    const updatedBooking = await prisma.carBooking.update({
      where: { id: params.id },
      data: updateData
    });
    
    return NextResponse.json({
      success: true,
      data: { booking: updatedBooking }
    });
    
  } catch (error) {
    console.error('Car booking update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
