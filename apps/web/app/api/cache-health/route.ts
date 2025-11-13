import { NextResponse } from 'next/server'
import { redis } from '@/lib/cache/redis'

export async function GET() {
  try {
    const testKey = 'health_check_' + Date.now()
    const testValue = 'ok'

    await redis.set(testKey, testValue, 10)
    const retrieved = await redis.get(testKey)
    await redis.del(testKey)

    if (retrieved === testValue) {
      return NextResponse.json({
        status: 'ok',
        cache: 'connected',
        timestamp: new Date().toISOString(),
      })
    } else {
      throw new Error('Cache read/write failed')
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        cache: 'disconnected',
        error: 'Cache connection failed',
      },
      { status: 503 }
    )
  }
}
