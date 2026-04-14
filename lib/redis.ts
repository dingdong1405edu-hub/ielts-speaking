import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as { redis: Redis }

function createRedisClient() {
  if (!process.env.REDIS_URL) return null
  try {
    const client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      enableOfflineQueue: false,
    })
    client.on('error', () => { /* silently ignore */ })
    return client
  } catch {
    return null
  }
}

export const redis = globalForRedis.redis ?? createRedisClient()
if (process.env.NODE_ENV !== 'production' && redis) globalForRedis.redis = redis

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number }> {
  if (!redis) return { success: true, remaining: limit }
  try {
    const window = Math.floor(Date.now() / (windowSeconds * 1000))
    const redisKey = `rl:${key}:${window}`
    const count = await redis.incr(redisKey)
    if (count === 1) await redis.expire(redisKey, windowSeconds)
    return { success: count <= limit, remaining: Math.max(0, limit - count) }
  } catch {
    return { success: true, remaining: limit }
  }
}

export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null
  try {
    const cached = await redis.get(key)
    return cached ? (JSON.parse(cached) as T) : null
  } catch {
    return null
  }
}

export async function setCached(
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> {
  if (!redis) return
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value))
  } catch {
    // Redis errors must not break the app
  }
}

export async function delCached(key: string): Promise<void> {
  if (!redis) return
  try {
    await redis.del(key)
  } catch { /* ignore */ }
}
