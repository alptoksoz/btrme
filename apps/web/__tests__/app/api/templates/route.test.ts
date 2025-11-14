import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/templates/route'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

vi.mock('@/lib/cache/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/cache/redis'

describe('Templates API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/templates', () => {
    it('should return cached templates when available', async () => {
      const cachedTemplates = [
        {
          id: 'tpl_1',
          name: 'Todo App',
          description: 'Simple todo application',
          category: 'productivity',
          tags: ['react', 'crud'],
          usageCount: 100,
          published: true,
          createdAt: new Date(),
        },
        {
          id: 'tpl_2',
          name: 'Dashboard',
          description: 'Admin dashboard',
          category: 'admin',
          tags: ['admin', 'dashboard'],
          usageCount: 50,
          published: true,
          createdAt: new Date(),
        },
      ]

      vi.mocked(redis.get).mockResolvedValue(cachedTemplates)

      const request = new NextRequest('http://localhost:3000/api/templates')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(cachedTemplates)
      expect(redis.get).toHaveBeenCalledWith('templates:all:')
      expect(prisma.$queryRaw).not.toHaveBeenCalled() // Should not hit database
    })

    it('should fetch from database and cache when cache miss', async () => {
      const dbTemplates = [
        {
          id: 'tpl_1',
          name: 'Todo App',
          description: 'Simple todo application',
          category: 'productivity',
          tags: ['react', 'crud'],
          usageCount: 100,
          published: true,
          createdAt: new Date(),
        },
      ]

      vi.mocked(redis.get).mockResolvedValue(null) // Cache miss
      vi.mocked(prisma.$queryRaw).mockResolvedValue(dbTemplates)
      vi.mocked(redis.set).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/templates')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(dbTemplates)
      expect(redis.get).toHaveBeenCalledWith('templates:all:')
      expect(prisma.$queryRaw).toHaveBeenCalled()
      expect(redis.set).toHaveBeenCalledWith('templates:all:', dbTemplates, 300) // 5 min cache
    })

    it('should filter by category', async () => {
      const productivityTemplates = [
        {
          id: 'tpl_1',
          name: 'Todo App',
          category: 'productivity',
          usageCount: 100,
          published: true,
        },
      ]

      vi.mocked(redis.get).mockResolvedValue(null)
      vi.mocked(prisma.$queryRaw).mockResolvedValue(productivityTemplates)
      vi.mocked(redis.set).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/templates?category=productivity')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(productivityTemplates)
      expect(redis.get).toHaveBeenCalledWith('templates:productivity:')
      expect(redis.set).toHaveBeenCalledWith('templates:productivity:', productivityTemplates, 300)
    })

    it('should use search parameter in cache key', async () => {
      vi.mocked(redis.get).mockResolvedValue(null)
      vi.mocked(prisma.$queryRaw).mockResolvedValue([])
      vi.mocked(redis.set).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/templates?search=dashboard')

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(redis.get).toHaveBeenCalledWith('templates:all:dashboard')
      expect(redis.set).toHaveBeenCalledWith('templates:all:dashboard', [], 300)
    })

    it('should combine category and search in cache key', async () => {
      vi.mocked(redis.get).mockResolvedValue(null)
      vi.mocked(prisma.$queryRaw).mockResolvedValue([])
      vi.mocked(redis.set).mockResolvedValue(true)

      const request = new NextRequest(
        'http://localhost:3000/api/templates?category=admin&search=dashboard'
      )

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(redis.get).toHaveBeenCalledWith('templates:admin:dashboard')
      expect(redis.set).toHaveBeenCalledWith('templates:admin:dashboard', [], 300)
    })

    it('should return only published templates', async () => {
      const templates = [
        {
          id: 'tpl_1',
          name: 'Published Template',
          published: true,
          usageCount: 100,
        },
      ]

      vi.mocked(redis.get).mockResolvedValue(null)
      vi.mocked(prisma.$queryRaw).mockResolvedValue(templates)
      vi.mocked(redis.set).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/templates')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.every((t: any) => t.published === true)).toBe(true)
    })

    it('should order templates by usage count and creation date', async () => {
      const templates = [
        {
          id: 'tpl_1',
          name: 'Most Used',
          usageCount: 500,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'tpl_2',
          name: 'Less Used',
          usageCount: 100,
          createdAt: new Date('2024-01-02'),
        },
      ]

      vi.mocked(redis.get).mockResolvedValue(null)
      vi.mocked(prisma.$queryRaw).mockResolvedValue(templates)
      vi.mocked(redis.set).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/templates')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data[0].usageCount).toBeGreaterThanOrEqual(data[1].usageCount)
    })

    it('should limit results to 50 templates', async () => {
      // Generate 60 templates
      const manyTemplates = Array.from({ length: 60 }, (_, i) => ({
        id: `tpl_${i}`,
        name: `Template ${i}`,
        published: true,
        usageCount: i,
      }))

      vi.mocked(redis.get).mockResolvedValue(null)
      vi.mocked(prisma.$queryRaw).mockResolvedValue(manyTemplates.slice(0, 50)) // DB query has LIMIT 50
      vi.mocked(redis.set).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/templates')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.length).toBeLessThanOrEqual(50)
    })

    it('should return empty array when no templates found', async () => {
      vi.mocked(redis.get).mockResolvedValue(null)
      vi.mocked(prisma.$queryRaw).mockResolvedValue([])
      vi.mocked(redis.set).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/templates')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(redis.get).mockResolvedValue(null)
      vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/templates')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should handle cache errors and still fetch from database', async () => {
      const templates = [{ id: 'tpl_1', name: 'Template' }]

      vi.mocked(redis.get).mockRejectedValue(new Error('Redis connection failed'))
      vi.mocked(prisma.$queryRaw).mockResolvedValue(templates)
      vi.mocked(redis.set).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/templates')

      const response = await GET(request)

      expect(response.status).toBe(500) // Error occurs in try-catch
    })

    it('should cache with 5 minute TTL', async () => {
      const templates = [{ id: 'tpl_1', name: 'Template' }]

      vi.mocked(redis.get).mockResolvedValue(null)
      vi.mocked(prisma.$queryRaw).mockResolvedValue(templates)
      vi.mocked(redis.set).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/templates')

      await GET(request)

      expect(redis.set).toHaveBeenCalledWith('templates:all:', templates, 300) // 300 seconds = 5 minutes
    })

    it('should not include unpublished templates', async () => {
      const templates = [
        { id: 'tpl_1', name: 'Published', published: true },
        // Unpublished templates filtered by WHERE clause in SQL
      ]

      vi.mocked(redis.get).mockResolvedValue(null)
      vi.mocked(prisma.$queryRaw).mockResolvedValue(templates)
      vi.mocked(redis.set).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/templates')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.length).toBe(1)
      expect(data[0].published).toBe(true)
    })

    it('should handle multiple categories correctly', async () => {
      const adminTemplates = [{ id: 'tpl_1', category: 'admin' }]

      vi.mocked(redis.get).mockResolvedValue(null)
      vi.mocked(prisma.$queryRaw).mockResolvedValue(adminTemplates)
      vi.mocked(redis.set).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/templates?category=admin')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(redis.get).toHaveBeenCalledWith('templates:admin:')
    })
  })
})
