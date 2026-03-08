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
    const hours = timeframe === '1h' ? 1 : timeframe === '7d' ? 168 : 24;

    const [sessionCount, perfMetrics] = await Promise.all([
      prisma.session.count(),
      prisma.performanceMetric.findMany({
        where: { timestamp: { gte: startTime } },
        select: { loadTime: true, timestamp: true }
      })
    ]);

    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    const memoryPct = memUsage.heapTotal > 0
      ? Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
      : 0;

    const loadTimes = perfMetrics.map(m => m.loadTime);
    const avgResponseTime = loadTimes.length
      ? Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length)
      : 0;

    const requestsPerMinute = hours > 0
      ? Math.round((perfMetrics.length / (hours * 60)) * 60) || 0
      : perfMetrics.length;

    const hourlyTrends: Record<number, { cpu: number | null; memory: number; responseTime: number }> = {};
    for (let i = 0; i < 24; i++) {
      const hourMetrics = perfMetrics.filter(m => new Date(m.timestamp).getHours() === i);
      const hourLoadTimes = hourMetrics.map(m => m.loadTime);
      hourlyTrends[i] = {
        cpu: null,
        memory: memoryPct,
        responseTime: hourLoadTimes.length
          ? Math.round(hourLoadTimes.reduce((a, b) => a + b, 0) / hourLoadTimes.length)
          : 0
      };
    }

    const stats = {
      totalSamples: perfMetrics.length + sessionCount,
      averageCpuUsage: null as number | null,
      averageMemoryUsage: memoryPct,
      averageDiskUsage: null as number | null,
      averageResponseTime: avgResponseTime,
      activeConnections: sessionCount,
      requestsPerMinute,
      currentUptime: Math.round(uptime),
      healthStatus: {
        cpu: 'UNKNOWN' as const,
        memory: memoryPct < 80 ? ('HEALTHY' as const) : ('WARNING' as const),
        disk: 'UNKNOWN' as const,
        responseTime: avgResponseTime < 2000 ? ('HEALTHY' as const) : ('WARNING' as const)
      },
      hourlyTrends
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentMetrics: [{
          timestamp: new Date().toISOString(),
          cpuUsage: stats.averageCpuUsage,
          memoryUsage: stats.averageMemoryUsage,
          diskUsage: stats.averageDiskUsage,
          responseTime: stats.averageResponseTime,
          activeConnections: stats.activeConnections,
          requestsPerMinute: stats.requestsPerMinute,
          uptime: stats.currentUptime
        }]
      }
    });
  } catch (error) {
    logger.error('System metrics okuma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true });
}