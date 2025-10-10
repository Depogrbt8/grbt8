import { NextRequest, NextResponse } from 'next/server'

// Minimal cron endpoint: samples real system metrics and records them
// via /api/monitoring/system. Designed to be invoked by Vercel Cron.

export async function GET(request: NextRequest) {
  try {
    const origin = new URL(request.url).origin

    // Measure response time by fetching a lightweight endpoint
    const t0 = Date.now()
    const statusRes = await fetch(`${origin}/api/system/status`, { cache: 'no-store' })
    const t1 = Date.now()

    if (!statusRes.ok) {
      return NextResponse.json({ success: false, error: 'status endpoint failed' }, { status: 502 })
    }

    const statusJson: any = await statusRes.json()
    const sys = statusJson?.data || {}

    // Build system metric sample
    const sample = {
      timestamp: new Date().toISOString(),
      cpuUsage: typeof sys?.cpu?.loadAverage?.[0] === 'number' ? Math.min(100, Math.max(0, Math.round((sys.cpu.loadAverage[0] / (sys.cpu.cores || 1)) * 100))) : undefined,
      memoryUsage: typeof sys?.memory?.usage === 'number' ? Math.round(sys.memory.usage) : undefined,
      diskUsage: undefined as number | undefined,
      responseTime: t1 - t0,
      uptime: typeof sys?.uptime === 'number' ? Math.round(sys.uptime) : undefined,
      version: sys?.version,
      region: process.env.VERCEL_REGION || process.env.FLY_REGION || undefined,
    }

    // Persist to in-memory monitoring storage
    const recRes = await fetch(`${origin}/api/monitoring/system`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-vercel-cron': '1' // Internal cron call
      },
      body: JSON.stringify(sample),
    })

    if (!recRes.ok) {
      const err = await recRes.text()
      return NextResponse.json({ success: false, error: 'record failed', details: err }, { status: 502 })
    }

    return NextResponse.json({ success: true, data: sample })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'cron error' }, { status: 500 })
  }
}


