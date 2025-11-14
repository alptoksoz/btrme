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

    const template = await prisma.template.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    await redis.set(cacheKey, template, 3600) // 1 hour
    return NextResponse.json(template)
  } catch (error) {
    console.error('Get template error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
