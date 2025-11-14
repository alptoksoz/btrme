import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/generation/route'
import { GenerationStatus, AIModel } from '@prisma/client'

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    generation: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/ai/generation-service', () => ({
  GenerationService: vi.fn().mockImplementation(() => ({
    generate: vi.fn(),
  })),
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { GenerationService } from '@/lib/ai/generation-service'

describe('Generation API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/generation', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/generation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Create a button', projectId: 'proj_123' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 when prompt is too short', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' },
      } as any)

      const request = new NextRequest('http://localhost:3000/api/generation', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'short', projectId: 'proj_123' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('at least 10 characters')
    })

    it('should create generation and return code successfully', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }
      const mockGeneration = {
        id: 'gen_123',
        prompt: 'Create a button component',
        projectId: 'proj_123',
        model: AIModel.GPT4_TURBO,
        status: GenerationStatus.PENDING,
      }
      const mockResult = {
        id: 'gen_123',
        code: 'export default function Button() { return <button>Click</button> }',
        model: 'GPT4_TURBO',
        tokensUsed: 150,
        cost: 0.015,
        executionTime: 2500,
      }
      const mockUpdatedGeneration = {
        ...mockGeneration,
        code: mockResult.code,
        status: GenerationStatus.COMPLETED,
        tokensUsed: mockResult.tokensUsed,
        cost: mockResult.cost,
        project: { id: 'proj_123', name: 'Test Project' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.generation.create).mockResolvedValue(mockGeneration as any)
      vi.mocked(prisma.generation.update)
        .mockResolvedValueOnce({ ...mockGeneration, status: GenerationStatus.PROCESSING } as any)
        .mockResolvedValueOnce(mockUpdatedGeneration as any)

      const mockGenerateService = new GenerationService()
      vi.mocked(mockGenerateService.generate).mockResolvedValue(mockResult as any)

      const request = new NextRequest('http://localhost:3000/api/generation', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Create a button component',
          projectId: 'proj_123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.code).toBe(mockResult.code)
      expect(data.status).toBe(GenerationStatus.COMPLETED)
      expect(prisma.generation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          prompt: 'Create a button component',
          projectId: 'proj_123',
          status: GenerationStatus.PENDING,
        }),
      })
    })

    it('should handle generation service errors and update status to FAILED', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }
      const mockGeneration = {
        id: 'gen_123',
        prompt: 'Create a button component',
        projectId: 'proj_123',
        model: AIModel.GPT4_TURBO,
        status: GenerationStatus.PENDING,
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.generation.create).mockResolvedValue(mockGeneration as any)
      vi.mocked(prisma.generation.update)
        .mockResolvedValueOnce({ ...mockGeneration, status: GenerationStatus.PROCESSING } as any)
        .mockResolvedValueOnce({ ...mockGeneration, status: GenerationStatus.FAILED } as any)

      const mockGenerateService = new GenerationService()
      vi.mocked(mockGenerateService.generate).mockRejectedValue(new Error('AI service unavailable'))

      const request = new NextRequest('http://localhost:3000/api/generation', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Create a button component',
          projectId: 'proj_123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
      expect(prisma.generation.update).toHaveBeenCalledWith({
        where: { id: 'gen_123' },
        data: {
          status: GenerationStatus.FAILED,
          error: 'AI service unavailable',
        },
      })
    })

    it('should accept optional complexity and model parameters', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }
      const mockGeneration = {
        id: 'gen_123',
        prompt: 'Create a complex dashboard',
        projectId: 'proj_123',
        model: AIModel.GPT4_TURBO,
        status: GenerationStatus.PENDING,
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.generation.create).mockResolvedValue(mockGeneration as any)
      vi.mocked(prisma.generation.update).mockResolvedValue({
        ...mockGeneration,
        status: GenerationStatus.COMPLETED,
      } as any)

      const mockGenerateService = new GenerationService()
      vi.mocked(mockGenerateService.generate).mockResolvedValue({
        id: 'gen_123',
        code: 'dashboard code',
        model: 'CLAUDE_OPUS',
        tokensUsed: 500,
        cost: 0.05,
        executionTime: 5000,
      } as any)

      const request = new NextRequest('http://localhost:3000/api/generation', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Create a complex dashboard',
          projectId: 'proj_123',
          complexity: 'EXPERT',
          model: 'CLAUDE_OPUS',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)
    })
  })

  describe('GET /api/generation', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/generation')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return all user generations', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }
      const mockGenerations = [
        {
          id: 'gen_1',
          prompt: 'Create button',
          code: 'button code',
          project: { id: 'proj_1', name: 'Project 1' },
        },
        {
          id: 'gen_2',
          prompt: 'Create form',
          code: 'form code',
          project: { id: 'proj_2', name: 'Project 2' },
        },
      ]

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.generation.findMany).mockResolvedValue(mockGenerations as any)

      const request = new NextRequest('http://localhost:3000/api/generation')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockGenerations)
      expect(prisma.generation.findMany).toHaveBeenCalledWith({
        where: {
          project: {
            userId: 'user_123',
          },
        },
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
    })

    it('should filter generations by projectId when provided', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }
      const mockGenerations = [
        {
          id: 'gen_1',
          prompt: 'Create button',
          code: 'button code',
          projectId: 'proj_123',
          project: { id: 'proj_123', name: 'Project 1' },
        },
      ]

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.generation.findMany).mockResolvedValue(mockGenerations as any)

      const request = new NextRequest('http://localhost:3000/api/generation?projectId=proj_123')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockGenerations)
      expect(prisma.generation.findMany).toHaveBeenCalledWith({
        where: {
          projectId: 'proj_123',
          project: {
            userId: 'user_123',
          },
        },
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
    })

    it('should handle database errors', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.generation.findMany).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/generation')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })
})
