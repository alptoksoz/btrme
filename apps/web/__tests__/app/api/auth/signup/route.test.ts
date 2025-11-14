import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/signup/route'
import bcrypt from 'bcryptjs'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}))

import { prisma } from '@/lib/prisma'

describe('Signup API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/auth/signup', () => {
    it('should create user successfully with valid data', async () => {
      const mockUser = {
        id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null) // User doesn't exist
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as any)
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.user.id).toBe('user_123')
      expect(data.user.name).toBe('John Doe')
      expect(data.user.email).toBe('john@example.com')
      expect(data.user.password).toBeUndefined() // Password should not be returned
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashed_password',
        },
      })
    })

    it('should return 400 when user already exists', async () => {
      const existingUser = {
        id: 'user_123',
        email: 'john@example.com',
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser as any)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User already exists')
      expect(bcrypt.hash).not.toHaveBeenCalled()
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('should return 400 when name is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'john@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Name is required')
    })

    it('should return 400 when name is empty string', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: '',
          email: 'john@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Name is required')
    })

    it('should return 400 when email is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid email')
    })

    it('should return 400 when email is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('should return 400 when password is too short', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: '12345', // Less than 6 characters
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('at least 6 characters')
    })

    it('should return 400 when password is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('should hash password with bcrypt salt rounds of 12', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as any)
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
      } as any)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'mySecurePassword123',
        }),
      })

      await POST(request)

      expect(bcrypt.hash).toHaveBeenCalledWith('mySecurePassword123', 12)
    })

    it('should not return password in response', async () => {
      const mockUser = {
        id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as any)
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.user.password).toBeUndefined()
      expect(data.user).toEqual({
        id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
      })
    })

    it('should check for existing user by email', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as any)
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
      } as any)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      })

      await POST(request)

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      })
    })

    it('should handle database errors', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as any)
      vi.mocked(prisma.user.create).mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should handle bcrypt errors', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockRejectedValue(new Error('Bcrypt error'))

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('should handle invalid JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should trim and validate email case-insensitively', async () => {
      const mockUser = {
        id: 'user_123',
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        password: 'hashed_password',
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as any)
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'JOHN@EXAMPLE.COM',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.user.email).toBe('JOHN@EXAMPLE.COM')
    })

    it('should accept exactly 6 character password', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as any)
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
      } as any)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: '123456', // Exactly 6 characters
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
    })

    it('should handle special characters in name and email', async () => {
      const mockUser = {
        id: 'user_123',
        name: "John O'Doe",
        email: 'john+test@example.com',
        password: 'hashed_password',
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as any)
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: "John O'Doe",
          email: 'john+test@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.user.name).toBe("John O'Doe")
      expect(data.user.email).toBe('john+test@example.com')
    })
  })
})
