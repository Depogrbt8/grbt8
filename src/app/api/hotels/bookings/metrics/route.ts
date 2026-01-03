import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET: Otel rezervasyon metrikleri (Admin için)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Admin kontrolü
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Tarih filtresi
    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {};

    // Toplam rezervasyon sayısı
    const totalBookings = await prisma.hotelBooking.count({
      where: dateFilter
    });

    // Durum bazlı sayılar
    const bookingsByStatus = await prisma.hotelBooking.groupBy({
      by: ['status'],
      _count: true,
      where: dateFilter
    });

    // Toplam gelir (onaylanmış rezervasyonlar)
    const totalRevenue = await prisma.hotelBooking.aggregate({
      _sum: {
        totalPrice: true
      },
      where: {
        status: 'confirmed',
        ...dateFilter
      }
    });

    // En popüler oteller
    const popularHotels = await prisma.hotelBooking.groupBy({
      by: ['hotelName'],
      _count: true,
      orderBy: {
        _count: {
          hotelName: 'desc'
        }
      },
      take: 10,
      where: dateFilter
    });

    // En popüler lokasyonlar
    const popularLocations = await prisma.hotelBooking.groupBy({
      by: ['hotelLocation'],
      _count: true,
      orderBy: {
        _count: {
          hotelLocation: 'desc'
        }
      },
      take: 10,
      where: dateFilter
    });

    // Son 7 günlük rezervasyon trendi
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentBookings = await prisma.hotelBooking.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        createdAt: true,
        totalPrice: true,
        status: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Günlük bazda grupla
    const dailyStats: Record<string, { count: number; revenue: number }> = {};
    recentBookings.forEach(booking => {
      const date = booking.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { count: 0, revenue: 0 };
      }
      dailyStats[date].count++;
      if (booking.status === 'confirmed') {
        dailyStats[date].revenue += booking.totalPrice;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalBookings,
        bookingsByStatus: bookingsByStatus.map(item => ({
          status: item.status,
          count: item._count
        })),
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        popularHotels: popularHotels.map(item => ({
          hotelName: item.hotelName,
          bookingCount: item._count
        })),
        popularLocations: popularLocations.map(item => ({
          location: item.hotelLocation,
          bookingCount: item._count
        })),
        dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
          date,
          ...stats
        }))
      }
    });
  } catch (error) {
    console.error('Hotel booking metrics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

