import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET: Provider istatistikleri
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin kontrolü
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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {};

    // Provider bazlı rezervasyon istatistikleri
    const providerStats = await prisma.hotelBooking.groupBy({
      by: ['provider'],
      _count: true,
      _sum: {
        totalPrice: true
      },
      where: {
        ...dateFilter,
        provider: { not: null }
      }
    });

    // Provider durumları
    const providers = await prisma.hotelApiProvider.findMany({
      select: {
        name: true,
        displayName: true,
        isActive: true,
        healthStatus: true,
        errorCount: true,
        lastTestAt: true,
        _count: {
          select: { bookings: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        providerStats: providerStats.map(item => ({
          provider: item.provider,
          bookingCount: item._count,
          totalRevenue: item._sum.totalPrice || 0
        })),
        providers: providers.map(p => ({
          name: p.name,
          displayName: p.displayName,
          isActive: p.isActive,
          healthStatus: p.healthStatus,
          errorCount: p.errorCount,
          lastTestAt: p.lastTestAt,
          bookingCount: p._count.bookings
        }))
      }
    });
  } catch (error) {
    console.error('Hotel API provider stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

