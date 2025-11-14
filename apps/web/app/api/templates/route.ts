import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/cache/redis'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const cacheKey = `templates:${category || 'all'}:${search || ''}`
    const cached = await redis.get<any[]>(cacheKey)

    if (cached) {
      return NextResponse.json(cached)
    }

    // Build where clause
    const where: any = { published: true }
    if (category) where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const templates = await prisma.$queryRaw`
      SELECT id, name, description, category, tags, usage_count as "usageCount",
             published, created_at as "createdAt"
      FROM templates
      WHERE published = true
      ${category ? `AND category = ${category}` : ''}
      ORDER BY usage_count DESC, created_at DESC
      LIMIT 50
    `

    await redis.set(cacheKey, templates, 300) // 5 min cache
    return NextResponse.json(templates)
  } catch (error) {
    console.error('List templates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
