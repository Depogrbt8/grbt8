import { NextRequest, NextResponse } from 'next/server'
import { cacheKeys, cache as memCache } from '@/lib/cache'
import { getWithCache, getCached, cacheDeletePattern } from '@/lib/cacheSwitcher'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

async function searchFlightsFromAPI(params: any) {
  // Actual BiletDukkani API call
  const response = await fetch('https://api.biletdukkani.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.BILET_DUKKANI_TOKEN}`,
    },
    body: JSON.stringify(params),
  })
  
  if (!response.ok) {
    throw new Error('BiletDukkani API error')
  }
  
  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = await request.json()
    
    // Validation
    if (!searchParams.from || !searchParams.to || !searchParams.departureDate) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Cache key generation
    const cacheKey = cacheKeys.flightSearch(searchParams)
    
    // Cache duration based on search date
    const searchDate = new Date(searchParams.departureDate)
    const today = new Date()
    const daysDiff = Math.ceil((searchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    // Dynamic cache TTL
    let cacheTTL = 300 // 5 minutes default
    if (daysDiff > 30) {
      cacheTTL = 1800 // 30 minutes for future dates
    } else if (daysDiff > 7) {
      cacheTTL = 900 // 15 minutes for near future
    } else if (daysDiff <= 1) {
      cacheTTL = 60 // 1 minute for same day
    }

    // Fetch with cache
    const results = await getWithCache(
      cacheKey,
      () => searchFlightsFromAPI(searchParams),
      cacheTTL
    )

    return NextResponse.json({
      success: true,
      data: results,
      cached: (await getCached(cacheKey)) !== null,
      cacheKey,
      ttl: cacheTTL
    })

  } catch (error: any) {
    logger.error('Flight search error:', error)
    return NextResponse.json(
      { error: 'Flight search failed' },
      { status: 500 }
    )
  }
}

// Cache management endpoint
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'clear-all') {
      // Production: Redis pattern temizliği; Development: in-memory temizliği
      await cacheDeletePattern('flight-search:*')
      try { memCache.clear() } catch {}
      return NextResponse.json({ message: 'All cache cleared' })
    }
    
    if (action === 'stats') {
      try { return NextResponse.json(memCache.getStats()) } catch { return NextResponse.json({ message: 'ok' }) }
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Cache operation failed' },
      { status: 500 }
    )
  }
}
