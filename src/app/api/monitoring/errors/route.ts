import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

function getStartTime(timeframe: string): Date {
  const now = new Date();
  const hours = timeframe === '1h' ? 1 : timeframe === '7d' ? 168 : 24;
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

function getPageFromLog(log: { source: string; metadata: string | null }): string {
  if (log.metadata) {
    try {
      const meta = JSON.parse(log.metadata) as Record<string, unknown>;
      if (typeof meta.page === 'string') return meta.page;
      if (typeof meta.path === 'string') return meta.path;
    } catch {
      // ignore
    }
  }
  return log.source || '/unknown';
}

export async function GET(request: NextRequest) {
  try {
    const timeframe = (request.nextUrl.searchParams.get('timeframe') || '24h') as string;
    const startTime = getStartTime(timeframe);

    const [errorLogs, criticalLogs, allUsers] = await Promise.all([
      prisma.systemLog.findMany({
        where: {
          timestamp: { gte: startTime },
          level: { in: ['error', 'warn', 'fatal'] }
        },
        orderBy: { timestamp: 'desc' },
        take: 200
      }),
      prisma.systemLog.findMany({
        where: {
          timestamp: { gte: startTime },
          level: 'fatal'
        },
        orderBy: { timestamp: 'desc' },
        take: 50
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: startTime } },
        select: { id: true }
      })
    ]);

    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };
    const pageCounts: Record<string, { count: number; criticalCount: number }> = {};

    errorLogs.forEach(log => {
      const errorType = log.source || 'Unknown';
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;

      if (log.level === 'fatal') errorsBySeverity.CRITICAL++;
      else if (log.level === 'error') errorsBySeverity.HIGH++;
      else if (log.level === 'warn') errorsBySeverity.MEDIUM++;
      else errorsBySeverity.LOW++;

      const page = getPageFromLog(log);
      if (!pageCounts[page]) pageCounts[page] = { count: 0, criticalCount: 0 };
      pageCounts[page].count++;
      if (log.level === 'fatal') pageCounts[page].criticalCount++;
    });

    const topErrorPages = Object.entries(pageCounts)
      .map(([page, { count, criticalCount }]) => ({ page, count, criticalCount }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const hourlyDistribution: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i] = errorLogs.filter(
        log => new Date(log.timestamp).getHours() === i
      ).length;
    }

    const stats = {
      totalErrors: errorLogs.length,
      criticalErrors: criticalLogs.length,
      highErrors: errorLogs.filter(log => log.level === 'error').length,
      mediumErrors: errorLogs.filter(log => log.level === 'warn').length,
      lowErrors: errorLogs.filter(log => log.level === 'info').length,
      errorsByType,
      errorsBySeverity,
      topErrorPages,
      hourlyDistribution,
      uniqueUsers: allUsers.length,
      recentCriticalErrors: criticalLogs.map(log => ({
        timestamp: log.timestamp.toISOString(),
        errorType: log.source || 'Unknown',
        message: log.message.substring(0, 100),
        severity: 'CRITICAL' as const,
        page: getPageFromLog(log)
      }))
    };

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        stats,
        recentErrors: stats.recentCriticalErrors
      }
    });
  } catch (error) {
    logger.error('Error tracking okuma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true });
}
