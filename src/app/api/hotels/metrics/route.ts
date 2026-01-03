import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET: Genel otel metrikleri (Admin için)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Veritabanından admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    // Bugünkü tarihler
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Toplam istatistikler
    const [
      totalBookings,
      todayBookings,
      weekBookings,
      monthBookings,
      confirmedRevenue,
      pendingCount,
      cancelledCount
    ] = await Promise.all([
      prisma.hotelBooking.count(),
      prisma.hotelBooking.count({
        where: { createdAt: { gte: startOfToday } }
      }),
      prisma.hotelBooking.count({
        where: { createdAt: { gte: startOfWeek } }
      }),
      prisma.hotelBooking.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      prisma.hotelBooking.aggregate({
        _sum: { totalPrice: true },
        where: { status: 'confirmed' }
      }),
      prisma.hotelBooking.count({
        where: { status: 'pending' }
      }),
      prisma.hotelBooking.count({
        where: { status: 'cancelled' }
      })
    ]);

    // Ortalama rezervasyon değeri
    const avgBookingValue = await prisma.hotelBooking.aggregate({
      _avg: { totalPrice: true },
      where: { status: 'confirmed' }
    });

    // Ortalama konaklama süresi
    const avgNights = await prisma.hotelBooking.aggregate({
      _avg: { nights: true },
      where: { status: 'confirmed' }
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalBookings,
          todayBookings,
          weekBookings,
          monthBookings
        },
        revenue: {
          total: confirmedRevenue._sum.totalPrice || 0,
          average: avgBookingValue._avg.totalPrice || 0
        },
        status: {
          pending: pendingCount,
          cancelled: cancelledCount,
          cancellationRate: totalBookings > 0 
            ? ((cancelledCount / totalBookings) * 100).toFixed(2) 
            : 0
        },
        averageStay: {
          nights: avgNights._avg.nights || 0
        }
      }
    });
  } catch (error) {
    console.error('Hotel metrics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hotel metrics' },
      { status: 500 }
    );
  }
}

