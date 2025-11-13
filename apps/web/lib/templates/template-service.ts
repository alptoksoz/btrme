import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/cache/redis'

export interface Template {
  id: string
  name: string
  description: string
  category: string
  code: string
  tags: string[]
  usageCount: number
  published: boolean
}

export class TemplateService {
  async getAll(category?: string): Promise<Template[]> {
    const cacheKey = `templates:${category || 'all'}`
    const cached = await redis.get<Template[]>(cacheKey)

    if (cached) return cached

    const where = category ? { category, published: true } : { published: true }

    const templates = await prisma.$queryRaw<Template[]>`
      SELECT * FROM templates WHERE published = true
      ${category ? `AND category = ${category}` : ''}
      ORDER BY usage_count DESC, created_at DESC
    `

    await redis.set(cacheKey, templates, 300) // 5 minutes
    return templates
  }

  async incrementUsage(id: string): Promise<void> {
    await prisma.$executeRaw`
      UPDATE templates SET usage_count = usage_count + 1 WHERE id = ${id}
    `
    await redis.invalidateByPrefix('templates:')
  }
}
