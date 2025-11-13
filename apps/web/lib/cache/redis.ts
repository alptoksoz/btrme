import { Redis } from '@upstash/redis'

export class RedisCache {
  private redis: Redis
  private prefix: string = 'btrme:'

  constructor() {
    if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
      throw new Error('Redis configuration missing')
    }

    this.redis = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    })
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get<T>(this.prefix + key)
      return value
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.redis.setex(this.prefix + key, ttl, JSON.stringify(value))
      } else {
        await this.redis.set(this.prefix + key, JSON.stringify(value))
      }
      return true
    } catch (error) {
      console.error('Redis SET error:', error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(this.prefix + key)
      return true
    } catch (error) {
      console.error('Redis DEL error:', error)
      return false
    }
  }

  async invalidateByPrefix(prefix: string): Promise<number> {
    try {
      const keys = await this.redis.keys(this.prefix + prefix + '*')
      if (keys.length === 0) return 0

      await this.redis.del(...keys)
      return keys.length
    } catch (error) {
      console.error('Redis invalidate error:', error)
      return 0
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(this.prefix + key)
    } catch (error) {
      console.error('Redis INCR error:', error)
      return 0
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      await this.redis.expire(this.prefix + key, seconds)
      return true
    } catch (error) {
      console.error('Redis EXPIRE error:', error)
      return false
    }
  }
}

export const redis = new RedisCache()
