import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

function getStartTime(timeframe: string): Date {
  const now = new Date();
  const hours = timeframe === '1h' ? 1 : timeframe === '7d' ? 168 : 24;
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

export async function GET(request: NextRequest) {
  try {
    const timeframe = (request.nextUrl.searchParams.get('timeframe') || '24h') as string;
    const startTime = getStartTime(timeframe);

    const metrics = await prisma.performanceMetric.findMany({
      where: { timestamp: { gte: startTime } },
      orderBy: { timestamp: 'desc' }
    });

    const totalRequests = metrics.length;

    const avg = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const loadTimes = metrics.map(m => m.loadTime).filter(Boolean);
    const fcps = metrics.map(m => m.firstContentfulPaint).filter((v): v is number => v != null);
    const lcps = metrics.map(m => m.largestContentfulPaint).filter((v): v is number => v != null);
    const clss = metrics.map(m => m.cumulativeLayoutShift).filter((v): v is number => v != null);

    const pageSums: Record<string, { total: number; count: number }> = {};
    metrics.forEach(m => {
      if (!pageSums[m.page]) pageSums[m.page] = { total: 0, count: 0 };
      pageSums[m.page].total += m.loadTime;
      pageSums[m.page].count += 1;
    });
    const slowestPages = Object.entries(pageSums)
      .map(([page, { total, count }]) => ({
        page,
        totalTime: total,
        count,
        avgTime: total / count
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);

    const stats = {
      totalRequests,
      averageLoadTime: Math.round(avg(loadTimes)),
      averageFCP: fcps.length ? Math.round(avg(fcps)) : 0,
      averageLCP: lcps.length ? Math.round(avg(lcps)) : 0,
      averageCLS: clss.length ? parseFloat(avg(clss).toFixed(3)) : 0,
      slowestPages
    };

    const recentMetrics = metrics.slice(0, 50).map(m => ({
      timestamp: m.timestamp.toISOString(),
      page: m.page,
      loadTime: m.loadTime,
      firstContentfulPaint: m.firstContentfulPaint ?? undefined,
      largestContentfulPaint: m.largestContentfulPaint ?? undefined,
      cumulativeLayoutShift: m.cumulativeLayoutShift ?? undefined,
      userAgent: m.userAgent ?? undefined,
      deviceType: m.deviceType ?? undefined
    }));

    return NextResponse.json({
      success: true,
      data: { timeframe, stats, recentMetrics }
    });
  } catch (error) {
    logger.error('Performance metrics okuma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const page = typeof body.page === 'string' ? body.page : '/';
    const loadTime = typeof body.loadTime === 'number' ? Math.round(body.loadTime) : 0;
    const fcp = body.firstContentfulPaint != null ? Math.round(Number(body.firstContentfulPaint)) : null;
    const lcp = body.largestContentfulPaint != null ? Math.round(Number(body.largestContentfulPaint)) : null;
    const cls = body.cumulativeLayoutShift != null ? Number(body.cumulativeLayoutShift) : null;
    const userAgent = typeof body.userAgent === 'string' ? body.userAgent : null;
    const deviceType = typeof body.deviceType === 'string' ? body.deviceType : null;

    await prisma.performanceMetric.create({
      data: {
        page,
        loadTime,
        firstContentfulPaint: fcp,
        largestContentfulPaint: lcp,
        cumulativeLayoutShift: cls,
        userAgent,
        deviceType
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Performance metric kaydetme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
