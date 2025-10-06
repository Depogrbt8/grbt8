import * as mem from '@/lib/cache'
import { cache as redisCache } from '@/lib/redis'

const useRedis = process.env.NODE_ENV === 'production'

export async function getCached<T>(key: string): Promise<T | null> {
  if (useRedis) {
    return (await redisCache.get(key)) as T | null
  }
  return mem.cache.get<T>(key)
}

export async function getWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  if (useRedis) {
    const cached = await redisCache.get(key)
    if (cached) return cached as T
    const data = await fetcher()
    await redisCache.set(key, data, ttlSeconds)
    return data
  }
  return mem.withCache<T>(key, fetcher, ttlSeconds)
}

export async function cacheDeletePattern(pattern: string): Promise<void> {
  if (useRedis) {
    // @ts-ignore deletePattern mevcut
    if (typeof (redisCache as any).deletePattern === 'function') {
      await (redisCache as any).deletePattern(pattern)
      return
    }
  }
  // In-memory: flight-search gibi bilinen prefix'ler için seçici temizlik
  const stats = mem.cache.getStats()
  const normalized = pattern.replace(/^\^|\*$/g, '') // basit temizlik
  for (const key of stats.keys) {
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1)
      if (key.startsWith(prefix)) mem.cache.delete(key)
    } else if (key === normalized) {
      mem.cache.delete(key)
    }
  }
}


