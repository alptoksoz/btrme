import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/projects/route'

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

describe('Projects API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/projects', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Project' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 when name is missing', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' },
      } as any)

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Name is required')
    })

    it('should create project successfully with name only', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }
      const mockProject = {
        id: 'proj_123',
        name: 'Test Project',
        description: null,
        userId: 'user_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.create).mockResolvedValue(mockProject as any)

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Project' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.name).toBe('Test Project')
      expect(data.userId).toBe('user_123')
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Project',
          description: undefined,
          userId: 'user_123',
        },
      })
    })

    it('should create project successfully with name and description', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }
      const mockProject = {
        id: 'proj_123',
        name: 'Test Project',
        description: 'A test project description',
        userId: 'user_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.create).mockResolvedValue(mockProject as any)

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Project',
          description: 'A test project description',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.name).toBe('Test Project')
      expect(data.description).toBe('A test project description')
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Project',
          description: 'A test project description',
          userId: 'user_123',
        },
      })
    })

    it('should handle database errors', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.create).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Project' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should handle invalid JSON', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('GET /api/projects', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/projects')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return all user projects with generation counts', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }
      const mockProjects = [
        {
          id: 'proj_1',
          name: 'Project 1',
          description: 'First project',
          userId: 'user_123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
          _count: { generations: 5 },
        },
        {
          id: 'proj_2',
          name: 'Project 2',
          description: 'Second project',
          userId: 'user_123',
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-04'),
          _count: { generations: 2 },
        },
      ]

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any)

      const request = new NextRequest('http://localhost:3000/api/projects')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(2)
      expect(data[0].name).toBe('Project 1')
      expect(data[0]._count.generations).toBe(5)
      expect(data[1]._count.generations).toBe(2)
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user_123',
        },
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          _count: {
            select: {
              generations: true,
            },
          },
        },
      })
    })

    it('should return empty array when user has no projects', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.findMany).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/projects')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it('should handle database errors', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.findMany).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/projects')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should order projects by updatedAt desc', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }
      const mockProjects = [
        {
          id: 'proj_2',
          name: 'Project 2',
          updatedAt: new Date('2024-01-04'),
          _count: { generations: 0 },
        },
        {
          id: 'proj_1',
          name: 'Project 1',
          updatedAt: new Date('2024-01-02'),
          _count: { generations: 0 },
        },
      ]

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any)

      const request = new NextRequest('http://localhost:3000/api/projects')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data[0].id).toBe('proj_2') // Most recently updated first
      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            updatedAt: 'desc',
          },
        })
      )
    })
  })
})
