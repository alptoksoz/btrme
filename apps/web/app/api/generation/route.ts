import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { GenerationService } from '@/lib/ai/generation-service'
import { z } from 'zod'
import { GenerationStatus, AIModel as PrismaAIModel } from '@prisma/client'
import { AIModel } from '@/lib/ai/types'

const generateSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  projectId: z.string().optional(),
  complexity: z.enum(['SIMPLE', 'STANDARD', 'COMPLEX', 'EXPERT']).optional(),
  model: z.nativeEnum(AIModel).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = generateSchema.parse(body)

    // Create generation record
    const generation = await prisma.generation.create({
      data: {
        prompt: validated.prompt,
        projectId: validated.projectId!,
        model: PrismaAIModel.GPT4_TURBO,
        status: GenerationStatus.PENDING,
      },
    })

    // Generate code using AI service
    const generationService = new GenerationService()

    try {
      await prisma.generation.update({
        where: { id: generation.id },
        data: { status: GenerationStatus.PROCESSING },
      })

      const result = await generationService.generate({
        prompt: validated.prompt,
        projectId: validated.projectId,
        complexity: validated.complexity,
        model: validated.model,
      })

      // Update with results
      const updatedGeneration = await prisma.generation.update({
        where: { id: generation.id },
        data: {
          code: result.code,
          model: result.model as PrismaAIModel,
          status: GenerationStatus.COMPLETED,
          tokensUsed: result.tokensUsed,
          cost: result.cost,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return NextResponse.json(updatedGeneration, { status: 201 })
    } catch (error: any) {
      // Update with error
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: GenerationStatus.FAILED,
          error: error.message,
        },
      })

      throw error
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')

    const where = projectId
      ? {
          projectId,
          project: {
            userId: session.user.id,
          },
        }
      : {
          project: {
            userId: session.user.id,
          },
        }

    const generations = await prisma.generation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(generations)
  } catch (error) {
    console.error('List generations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
