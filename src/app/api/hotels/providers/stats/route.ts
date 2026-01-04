import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/adminAuth';

// GET: Provider istatistikleri
export async function GET(request: NextRequest) {
  try {
    // Admin panel veya normal kullanıcı authentication kontrolü
    const authCheck = await checkAdminAccess(request);
    if (!authCheck.authorized) {
      return authCheck.error!;
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

