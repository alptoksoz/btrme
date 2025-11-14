import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/cache/redis'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Increment usage count
    await prisma.template.update({
      where: { id: params.id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    })

    // Invalidate cache
    await redis.del(`template:${params.id}`)
    await redis.del('templates:all:')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Use template error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
