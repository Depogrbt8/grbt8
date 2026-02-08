// Tekil Araç Rezervasyonu API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
