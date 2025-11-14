import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/cache/redis'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cacheKey = `template:${params.id}`
    const cached = await redis.get(cacheKey)

    if (cached) {
      return NextResponse.json(cached)
    }

    const template = await prisma.$queryRaw`
      SELECT * FROM templates WHERE id = ${params.id}
    `

    if (!template || (template as any[]).length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Increment usage count
    await prisma.$executeRaw`
      UPDATE templates SET usage_count = usage_count + 1 WHERE id = ${params.id}
    `

    await redis.set(cacheKey, (template as any[])[0], 3600) // 1 hour
    return NextResponse.json((template as any[])[0])
  } catch (error) {
    console.error('Get template error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
