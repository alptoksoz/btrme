import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OpenAIService } from '@/lib/ai/openai-service'
import { AIModel } from '@/lib/ai/types'
import OpenAI from 'openai'

// Mock OpenAI client
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    })),
  }
})

describe('OpenAIService', () => {
  let service: OpenAIService
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    service = new OpenAIService()
    mockClient = (service as any).client
  })

  describe('generate', () => {
    it('should generate code successfully with GPT-4 Turbo', async () => {
      const mockCompletion = {
        id: 'chatcmpl-123',
        choices: [
          {
            message: {
              content: 'export default function Button() { return <button>Click</button> }',
            },
          },
        ],
        usage: {
          total_tokens: 150,
        },
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      const result = await service.generate({
        prompt: 'Create a button component',
        model: AIModel.GPT4_TURBO,
      })

      expect(result.id).toBe('chatcmpl-123')
      expect(result.code).toContain('Button')
      expect(result.model).toBe(AIModel.GPT4_TURBO)
      expect(result.tokensUsed).toBe(150)
      expect(result.cost).toBeGreaterThan(0)
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
      expect(mockClient.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('expert full-stack developer'),
          },
          {
            role: 'user',
            content: 'Create a button component',
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      })
    })

    it('should generate code with GPT-4', async () => {
      const mockCompletion = {
        id: 'chatcmpl-456',
        choices: [
          {
            message: {
              content: 'const sum = (a, b) => a + b',
            },
          },
        ],
        usage: {
          total_tokens: 50,
        },
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      const result = await service.generate({
        prompt: 'Create a sum function',
        model: AIModel.GPT4,
      })

      expect(result.model).toBe(AIModel.GPT4)
      expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
        })
      )
    })

    it('should generate code with GPT-3.5 Turbo', async () => {
      const mockCompletion = {
        id: 'chatcmpl-789',
        choices: [
          {
            message: {
              content: 'console.log("Hello World")',
            },
          },
        ],
        usage: {
          total_tokens: 20,
        },
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      const result = await service.generate({
        prompt: 'Print hello world',
        model: AIModel.GPT35_TURBO,
      })

      expect(result.model).toBe(AIModel.GPT35_TURBO)
      expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-3.5-turbo',
        })
      )
    })

    it('should use default model when not specified', async () => {
      const mockCompletion = {
        id: 'chatcmpl-default',
        choices: [{ message: { content: 'code' } }],
        usage: { total_tokens: 100 },
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      const result = await service.generate({
        prompt: 'Create something',
      })

      expect(result.model).toBe(AIModel.GPT4_TURBO)
      expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4-turbo-preview',
        })
      )
    })

    it('should accept custom temperature', async () => {
      const mockCompletion = {
        id: 'chatcmpl-temp',
        choices: [{ message: { content: 'code' } }],
        usage: { total_tokens: 100 },
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      await service.generate({
        prompt: 'Create something',
        temperature: 0.9,
      })

      expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.9,
        })
      )
    })

    it('should accept custom max tokens', async () => {
      const mockCompletion = {
        id: 'chatcmpl-tokens',
        choices: [{ message: { content: 'code' } }],
        usage: { total_tokens: 100 },
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      await service.generate({
        prompt: 'Create something',
        maxTokens: 2000,
      })

      expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 2000,
        })
      )
    })

    it('should use default temperature of 0.7 when not specified', async () => {
      const mockCompletion = {
        id: 'chatcmpl-default-temp',
        choices: [{ message: { content: 'code' } }],
        usage: { total_tokens: 100 },
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      await service.generate({
        prompt: 'Create something',
      })

      expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.7,
        })
      )
    })

    it('should use default max_tokens of 4000 when not specified', async () => {
      const mockCompletion = {
        id: 'chatcmpl-default-tokens',
        choices: [{ message: { content: 'code' } }],
        usage: { total_tokens: 100 },
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      await service.generate({
        prompt: 'Create something',
      })

      expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 4000,
        })
      )
    })

    it('should handle empty code response', async () => {
      const mockCompletion = {
        id: 'chatcmpl-empty',
        choices: [{ message: { content: '' } }],
        usage: { total_tokens: 10 },
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      const result = await service.generate({
        prompt: 'Create something',
      })

      expect(result.code).toBe('')
    })

    it('should handle missing content in response', async () => {
      const mockCompletion = {
        id: 'chatcmpl-no-content',
        choices: [{ message: {} }],
        usage: { total_tokens: 10 },
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      const result = await service.generate({
        prompt: 'Create something',
      })

      expect(result.code).toBe('')
    })

    it('should handle missing usage in response', async () => {
      const mockCompletion = {
        id: 'chatcmpl-no-usage',
        choices: [{ message: { content: 'code' } }],
        usage: null,
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      const result = await service.generate({
        prompt: 'Create something',
      })

      expect(result.tokensUsed).toBe(0)
    })

    it('should calculate cost correctly for GPT-4 Turbo', async () => {
      const mockCompletion = {
        id: 'chatcmpl-cost-turbo',
        choices: [{ message: { content: 'code' } }],
        usage: { total_tokens: 1000 }, // 1000 tokens
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      const result = await service.generate({
        prompt: 'Create something',
        model: AIModel.GPT4_TURBO,
      })

      // GPT-4 Turbo: $0.01 input + $0.03 output per 1K tokens
      // Average: (0.01 + 0.03) / 2 = 0.02 per 1K tokens
      // 1000 tokens = 1K tokens * 0.02 = $0.02
      expect(result.cost).toBeCloseTo(0.02, 3)
    })

    it('should calculate cost correctly for GPT-4', async () => {
      const mockCompletion = {
        id: 'chatcmpl-cost-gpt4',
        choices: [{ message: { content: 'code' } }],
        usage: { total_tokens: 1000 },
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      const result = await service.generate({
        prompt: 'Create something',
        model: AIModel.GPT4,
      })

      // GPT-4: $0.03 input + $0.06 output per 1K tokens
      // Average: (0.03 + 0.06) / 2 = 0.045 per 1K tokens
      expect(result.cost).toBeCloseTo(0.045, 3)
    })

    it('should calculate cost correctly for GPT-3.5 Turbo', async () => {
      const mockCompletion = {
        id: 'chatcmpl-cost-35',
        choices: [{ message: { content: 'code' } }],
        usage: { total_tokens: 1000 },
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      const result = await service.generate({
        prompt: 'Create something',
        model: AIModel.GPT35_TURBO,
      })

      // GPT-3.5 Turbo: $0.0005 input + $0.0015 output per 1K tokens
      // Average: (0.0005 + 0.0015) / 2 = 0.001 per 1K tokens
      expect(result.cost).toBeCloseTo(0.001, 4)
    })

    it('should track execution time', async () => {
      const mockCompletion = {
        id: 'chatcmpl-time',
        choices: [{ message: { content: 'code' } }],
        usage: { total_tokens: 100 },
      }

      mockClient.chat.completions.create.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return mockCompletion
      })

      const result = await service.generate({
        prompt: 'Create something',
      })

      expect(result.executionTime).toBeGreaterThanOrEqual(10)
    })

    it('should throw error when OpenAI API fails', async () => {
      mockClient.chat.completions.create.mockRejectedValue(new Error('API rate limit exceeded'))

      await expect(
        service.generate({
          prompt: 'Create something',
        })
      ).rejects.toThrow('OpenAI generation failed: API rate limit exceeded')
    })

    it('should throw error when OpenAI API returns invalid response', async () => {
      mockClient.chat.completions.create.mockRejectedValue(new Error('Invalid API key'))

      await expect(
        service.generate({
          prompt: 'Create something',
        })
      ).rejects.toThrow('OpenAI generation failed: Invalid API key')
    })

    it('should include system prompt for code generation', async () => {
      const mockCompletion = {
        id: 'chatcmpl-system',
        choices: [{ message: { content: 'code' } }],
        usage: { total_tokens: 100 },
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      await service.generate({
        prompt: 'Create a component',
      })

      expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('expert full-stack developer'),
            }),
          ]),
        })
      )
    })

    it('should handle zero tokens used', async () => {
      const mockCompletion = {
        id: 'chatcmpl-zero',
        choices: [{ message: { content: 'code' } }],
        usage: { total_tokens: 0 },
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      const result = await service.generate({
        prompt: 'Create something',
      })

      expect(result.tokensUsed).toBe(0)
      expect(result.cost).toBe(0)
    })

    it('should handle Anthropic models with fallback to default OpenAI model', async () => {
      const mockCompletion = {
        id: 'chatcmpl-fallback',
        choices: [{ message: { content: 'code' } }],
        usage: { total_tokens: 100 },
      }

      mockClient.chat.completions.create.mockResolvedValue(mockCompletion)

      const result = await service.generate({
        prompt: 'Create something',
        model: AIModel.CLAUDE_OPUS as any, // This should fallback to default
      })

      // Should use default model name when unknown model is passed
      expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4-turbo-preview',
        })
      )
    })
  })

  describe('getModelName', () => {
    it('should map GPT4_TURBO to correct model name', () => {
      const modelName = (service as any).getModelName(AIModel.GPT4_TURBO)
      expect(modelName).toBe('gpt-4-turbo-preview')
    })

    it('should map GPT4 to correct model name', () => {
      const modelName = (service as any).getModelName(AIModel.GPT4)
      expect(modelName).toBe('gpt-4')
    })

    it('should map GPT35_TURBO to correct model name', () => {
      const modelName = (service as any).getModelName(AIModel.GPT35_TURBO)
      expect(modelName).toBe('gpt-3.5-turbo')
    })

    it('should return default model for unknown models', () => {
      const modelName = (service as any).getModelName('UNKNOWN_MODEL' as any)
      expect(modelName).toBe('gpt-4-turbo-preview')
    })
  })

  describe('calculateCost', () => {
    it('should calculate cost for GPT-4 Turbo correctly', () => {
      const cost = (service as any).calculateCost('gpt-4-turbo-preview', 1000)
      expect(cost).toBeCloseTo(0.02, 3)
    })

    it('should calculate cost for GPT-4 correctly', () => {
      const cost = (service as any).calculateCost('gpt-4', 1000)
      expect(cost).toBeCloseTo(0.045, 3)
    })

    it('should calculate cost for GPT-3.5 Turbo correctly', () => {
      const cost = (service as any).calculateCost('gpt-3.5-turbo', 1000)
      expect(cost).toBeCloseTo(0.001, 4)
    })

    it('should handle zero tokens', () => {
      const cost = (service as any).calculateCost('gpt-4-turbo-preview', 0)
      expect(cost).toBe(0)
    })

    it('should handle large token counts', () => {
      const cost = (service as any).calculateCost('gpt-4-turbo-preview', 100000)
      expect(cost).toBeCloseTo(2.0, 2)
    })

    it('should use default cost for unknown models', () => {
      const cost = (service as any).calculateCost('unknown-model', 1000)
      expect(cost).toBeCloseTo(0.02, 3) // Should use GPT-4 Turbo pricing
    })
  })
})
