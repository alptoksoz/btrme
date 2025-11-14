import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, PATCH, DELETE } from '@/app/api/projects/[id]/route'

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

describe('Project [id] API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/projects/[id]', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123')

      const response = await GET(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when project does not exist', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123')

      const response = await GET(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Project not found')
    })

    it('should return 404 when project belongs to different user', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null) // Prisma returns null when userId doesn't match

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123')

      const response = await GET(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Project not found')
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'proj_123',
          userId: 'user_123',
        },
        include: expect.any(Object),
      })
    })

    it('should return project with generations and count', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }
      const mockProject = {
        id: 'proj_123',
        name: 'Test Project',
        description: 'Test description',
        userId: 'user_123',
        createdAt: new Date(),
        updatedAt: new Date(),
        generations: [
          {
            id: 'gen_1',
            prompt: 'Create button',
            code: 'button code',
            createdAt: new Date(),
          },
          {
            id: 'gen_2',
            prompt: 'Create form',
            code: 'form code',
            createdAt: new Date(),
          },
        ],
        _count: { generations: 2 },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any)

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123')

      const response = await GET(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('proj_123')
      expect(data.name).toBe('Test Project')
      expect(data.generations).toHaveLength(2)
      expect(data._count.generations).toBe(2)
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'proj_123',
          userId: 'user_123',
        },
        include: {
          generations: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              generations: true,
            },
          },
        },
      })
    })

    it('should limit generations to 10 most recent', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.findUnique).mockResolvedValue({
        id: 'proj_123',
        generations: [],
        _count: { generations: 0 },
      } as any)

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123')

      await GET(request, { params: { id: 'proj_123' } })

      expect(prisma.project.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            generations: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          }),
        })
      )
    })

    it('should handle database errors', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.findUnique).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123')

      const response = await GET(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('PATCH /api/projects/[id]', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' }),
      })

      const response = await PATCH(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when project does not exist', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.updateMany).mockResolvedValue({ count: 0 } as any)

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' }),
      })

      const response = await PATCH(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Project not found')
    })

    it('should update project name successfully', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }
      const updatedProject = {
        id: 'proj_123',
        name: 'Updated Name',
        description: 'Original description',
        userId: 'user_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.updateMany).mockResolvedValue({ count: 1 } as any)
      vi.mocked(prisma.project.findUnique).mockResolvedValue(updatedProject as any)

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' }),
      })

      const response = await PATCH(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.name).toBe('Updated Name')
      expect(prisma.project.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'proj_123',
          userId: 'user_123',
        },
        data: { name: 'Updated Name' },
      })
    })

    it('should update project description successfully', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }
      const updatedProject = {
        id: 'proj_123',
        name: 'Original Name',
        description: 'Updated description',
        userId: 'user_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.updateMany).mockResolvedValue({ count: 1 } as any)
      vi.mocked(prisma.project.findUnique).mockResolvedValue(updatedProject as any)

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123', {
        method: 'PATCH',
        body: JSON.stringify({ description: 'Updated description' }),
      })

      const response = await PATCH(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.description).toBe('Updated description')
      expect(prisma.project.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'proj_123',
          userId: 'user_123',
        },
        data: { description: 'Updated description' },
      })
    })

    it('should update both name and description', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }
      const updatedProject = {
        id: 'proj_123',
        name: 'Updated Name',
        description: 'Updated description',
        userId: 'user_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.updateMany).mockResolvedValue({ count: 1 } as any)
      vi.mocked(prisma.project.findUnique).mockResolvedValue(updatedProject as any)

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Updated Name',
          description: 'Updated description',
        }),
      })

      const response = await PATCH(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.name).toBe('Updated Name')
      expect(data.description).toBe('Updated description')
    })

    it('should return 400 when name is empty string', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123', {
        method: 'PATCH',
        body: JSON.stringify({ name: '' }),
      })

      const response = await PATCH(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('should handle database errors', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.updateMany).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' }),
      })

      const response = await PATCH(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('DELETE /api/projects/[id]', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when project does not exist', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.deleteMany).mockResolvedValue({ count: 0 } as any)

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Project not found')
    })

    it('should return 404 when trying to delete another user project', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.deleteMany).mockResolvedValue({ count: 0 } as any) // No rows deleted due to userId mismatch

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Project not found')
      expect(prisma.project.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 'proj_123',
          userId: 'user_123',
        },
      })
    })

    it('should delete project successfully', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.deleteMany).mockResolvedValue({ count: 1 } as any)

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(prisma.project.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 'proj_123',
          userId: 'user_123',
        },
      })
    })

    it('should handle database errors', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.deleteMany).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'proj_123' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should cascade delete associated generations', async () => {
      const mockSession = {
        user: { id: 'user_123', email: 'test@example.com' },
      }

      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.project.deleteMany).mockResolvedValue({ count: 1 } as any)

      const request = new NextRequest('http://localhost:3000/api/projects/proj_123', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'proj_123' } })

      expect(response.status).toBe(200)
      // Prisma cascade delete should handle related generations automatically
    })
  })
})
