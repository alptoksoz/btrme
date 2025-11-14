import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AnthropicService } from '@/lib/ai/anthropic-service'
import { AIModel } from '@/lib/ai/types'
import Anthropic from '@anthropic-ai/sdk'

// Mock Anthropic client
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn(),
      },
    })),
  }
})

describe('AnthropicService', () => {
  let service: AnthropicService
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AnthropicService()
    mockClient = (service as any).client
  })

  describe('generate', () => {
    it('should generate code successfully with Claude Opus', async () => {
      const mockMessage = {
        id: 'msg_123',
        content: [
          {
            type: 'text',
            text: 'export default function Button() { return <button>Click</button> }',
          },
        ],
        usage: {
          input_tokens: 50,
          output_tokens: 100,
        },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      const result = await service.generate({
        prompt: 'Create a button component',
        model: AIModel.CLAUDE_OPUS,
      })

      expect(result.id).toBe('msg_123')
      expect(result.code).toContain('Button')
      expect(result.model).toBe(AIModel.CLAUDE_OPUS)
      expect(result.tokensUsed).toBe(150) // 50 + 100
      expect(result.cost).toBeGreaterThan(0)
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
      expect(mockClient.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        temperature: 0.7,
        system: expect.stringContaining('expert full-stack developer'),
        messages: [
          {
            role: 'user',
            content: 'Create a button component',
          },
        ],
      })
    })

    it('should generate code with Claude Sonnet', async () => {
      const mockMessage = {
        id: 'msg_456',
        content: [
          {
            type: 'text',
            text: 'const sum = (a, b) => a + b',
          },
        ],
        usage: {
          input_tokens: 20,
          output_tokens: 30,
        },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      const result = await service.generate({
        prompt: 'Create a sum function',
        model: AIModel.CLAUDE_SONNET,
      })

      expect(result.model).toBe(AIModel.CLAUDE_SONNET)
      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-sonnet-20240229',
        })
      )
    })

    it('should generate code with Claude Haiku', async () => {
      const mockMessage = {
        id: 'msg_789',
        content: [
          {
            type: 'text',
            text: 'console.log("Hello World")',
          },
        ],
        usage: {
          input_tokens: 10,
          output_tokens: 10,
        },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      const result = await service.generate({
        prompt: 'Print hello world',
        model: AIModel.CLAUDE_HAIKU,
      })

      expect(result.model).toBe(AIModel.CLAUDE_HAIKU)
      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-haiku-20240307',
        })
      )
    })

    it('should use default model (Sonnet) when not specified', async () => {
      const mockMessage = {
        id: 'msg_default',
        content: [{ type: 'text', text: 'code' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      const result = await service.generate({
        prompt: 'Create something',
      })

      expect(result.model).toBe(AIModel.CLAUDE_SONNET)
      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-sonnet-20240229',
        })
      )
    })

    it('should accept custom temperature', async () => {
      const mockMessage = {
        id: 'msg_temp',
        content: [{ type: 'text', text: 'code' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      await service.generate({
        prompt: 'Create something',
        temperature: 0.9,
      })

      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.9,
        })
      )
    })

    it('should accept custom max tokens', async () => {
      const mockMessage = {
        id: 'msg_tokens',
        content: [{ type: 'text', text: 'code' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      await service.generate({
        prompt: 'Create something',
        maxTokens: 2000,
      })

      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 2000,
        })
      )
    })

    it('should use default temperature of 0.7 when not specified', async () => {
      const mockMessage = {
        id: 'msg_default_temp',
        content: [{ type: 'text', text: 'code' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      await service.generate({
        prompt: 'Create something',
      })

      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.7,
        })
      )
    })

    it('should use default max_tokens of 4000 when not specified', async () => {
      const mockMessage = {
        id: 'msg_default_tokens',
        content: [{ type: 'text', text: 'code' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      await service.generate({
        prompt: 'Create something',
      })

      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 4000,
        })
      )
    })

    it('should handle empty code response', async () => {
      const mockMessage = {
        id: 'msg_empty',
        content: [{ type: 'text', text: '' }],
        usage: { input_tokens: 5, output_tokens: 5 },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      const result = await service.generate({
        prompt: 'Create something',
      })

      expect(result.code).toBe('')
    })

    it('should handle non-text content type', async () => {
      const mockMessage = {
        id: 'msg_non_text',
        content: [{ type: 'image', data: 'base64data' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      const result = await service.generate({
        prompt: 'Create something',
      })

      expect(result.code).toBe('')
    })

    it('should handle missing content', async () => {
      const mockMessage = {
        id: 'msg_no_content',
        content: [],
        usage: { input_tokens: 10, output_tokens: 10 },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      const result = await service.generate({
        prompt: 'Create something',
      })

      expect(result.code).toBe('')
    })

    it('should calculate total tokens correctly', async () => {
      const mockMessage = {
        id: 'msg_tokens_calc',
        content: [{ type: 'text', text: 'code' }],
        usage: {
          input_tokens: 123,
          output_tokens: 456,
        },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      const result = await service.generate({
        prompt: 'Create something',
      })

      expect(result.tokensUsed).toBe(579) // 123 + 456
    })

    it('should calculate cost correctly for Claude Opus', async () => {
      const mockMessage = {
        id: 'msg_cost_opus',
        content: [{ type: 'text', text: 'code' }],
        usage: {
          input_tokens: 1000000, // 1M input tokens
          output_tokens: 1000000, // 1M output tokens
        },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      const result = await service.generate({
        prompt: 'Create something',
        model: AIModel.CLAUDE_OPUS,
      })

      // Opus: $15/M input + $75/M output
      // 1M * $15 + 1M * $75 = $90
      expect(result.cost).toBeCloseTo(90, 2)
    })

    it('should calculate cost correctly for Claude Sonnet', async () => {
      const mockMessage = {
        id: 'msg_cost_sonnet',
        content: [{ type: 'text', text: 'code' }],
        usage: {
          input_tokens: 1000000,
          output_tokens: 1000000,
        },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      const result = await service.generate({
        prompt: 'Create something',
        model: AIModel.CLAUDE_SONNET,
      })

      // Sonnet: $3/M input + $15/M output
      // 1M * $3 + 1M * $15 = $18
      expect(result.cost).toBeCloseTo(18, 2)
    })

    it('should calculate cost correctly for Claude Haiku', async () => {
      const mockMessage = {
        id: 'msg_cost_haiku',
        content: [{ type: 'text', text: 'code' }],
        usage: {
          input_tokens: 1000000,
          output_tokens: 1000000,
        },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      const result = await service.generate({
        prompt: 'Create something',
        model: AIModel.CLAUDE_HAIKU,
      })

      // Haiku: $0.25/M input + $1.25/M output
      // 1M * $0.25 + 1M * $1.25 = $1.50
      expect(result.cost).toBeCloseTo(1.5, 2)
    })

    it('should handle zero tokens', async () => {
      const mockMessage = {
        id: 'msg_zero',
        content: [{ type: 'text', text: 'code' }],
        usage: {
          input_tokens: 0,
          output_tokens: 0,
        },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      const result = await service.generate({
        prompt: 'Create something',
      })

      expect(result.tokensUsed).toBe(0)
      expect(result.cost).toBe(0)
    })

    it('should track execution time', async () => {
      const mockMessage = {
        id: 'msg_time',
        content: [{ type: 'text', text: 'code' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }

      mockClient.messages.create.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return mockMessage
      })

      const result = await service.generate({
        prompt: 'Create something',
      })

      expect(result.executionTime).toBeGreaterThanOrEqual(10)
    })

    it('should throw error when Anthropic API fails', async () => {
      mockClient.messages.create.mockRejectedValue(new Error('API rate limit exceeded'))

      await expect(
        service.generate({
          prompt: 'Create something',
        })
      ).rejects.toThrow('Anthropic generation failed: API rate limit exceeded')
    })

    it('should throw error when Anthropic API returns invalid response', async () => {
      mockClient.messages.create.mockRejectedValue(new Error('Invalid API key'))

      await expect(
        service.generate({
          prompt: 'Create something',
        })
      ).rejects.toThrow('Anthropic generation failed: Invalid API key')
    })

    it('should include system prompt for code generation', async () => {
      const mockMessage = {
        id: 'msg_system',
        content: [{ type: 'text', text: 'code' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      await service.generate({
        prompt: 'Create a component',
      })

      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('expert full-stack developer'),
        })
      )
    })

    it('should handle OpenAI models with fallback to default Anthropic model', async () => {
      const mockMessage = {
        id: 'msg_fallback',
        content: [{ type: 'text', text: 'code' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      const result = await service.generate({
        prompt: 'Create something',
        model: AIModel.GPT4_TURBO as any, // This should fallback to default
      })

      // Should use default model name when unknown model is passed
      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-sonnet-20240229',
        })
      )
    })

    it('should calculate cost with realistic token counts', async () => {
      const mockMessage = {
        id: 'msg_realistic',
        content: [{ type: 'text', text: 'code' }],
        usage: {
          input_tokens: 500,
          output_tokens: 1500,
        },
      }

      mockClient.messages.create.mockResolvedValue(mockMessage)

      const result = await service.generate({
        prompt: 'Create something complex',
        model: AIModel.CLAUDE_SONNET,
      })

      // Sonnet: $3/M input + $15/M output
      // 500 * ($3/1M) + 1500 * ($15/1M) = $0.0015 + $0.0225 = $0.024
      expect(result.cost).toBeCloseTo(0.024, 4)
    })
  })

  describe('getModelName', () => {
    it('should map CLAUDE_OPUS to correct model name', () => {
      const modelName = (service as any).getModelName(AIModel.CLAUDE_OPUS)
      expect(modelName).toBe('claude-3-opus-20240229')
    })

    it('should map CLAUDE_SONNET to correct model name', () => {
      const modelName = (service as any).getModelName(AIModel.CLAUDE_SONNET)
      expect(modelName).toBe('claude-3-sonnet-20240229')
    })

    it('should map CLAUDE_HAIKU to correct model name', () => {
      const modelName = (service as any).getModelName(AIModel.CLAUDE_HAIKU)
      expect(modelName).toBe('claude-3-haiku-20240307')
    })

    it('should return default model for unknown models', () => {
      const modelName = (service as any).getModelName('UNKNOWN_MODEL' as any)
      expect(modelName).toBe('claude-3-sonnet-20240229')
    })
  })

  describe('calculateCost', () => {
    it('should calculate cost for Claude Opus correctly', () => {
      const cost = (service as any).calculateCost('claude-3-opus-20240229', {
        input_tokens: 1000000,
        output_tokens: 1000000,
      })
      expect(cost).toBeCloseTo(90, 2)
    })

    it('should calculate cost for Claude Sonnet correctly', () => {
      const cost = (service as any).calculateCost('claude-3-sonnet-20240229', {
        input_tokens: 1000000,
        output_tokens: 1000000,
      })
      expect(cost).toBeCloseTo(18, 2)
    })

    it('should calculate cost for Claude Haiku correctly', () => {
      const cost = (service as any).calculateCost('claude-3-haiku-20240307', {
        input_tokens: 1000000,
        output_tokens: 1000000,
      })
      expect(cost).toBeCloseTo(1.5, 2)
    })

    it('should handle zero tokens', () => {
      const cost = (service as any).calculateCost('claude-3-sonnet-20240229', {
        input_tokens: 0,
        output_tokens: 0,
      })
      expect(cost).toBe(0)
    })

    it('should handle asymmetric token usage', () => {
      const cost = (service as any).calculateCost('claude-3-sonnet-20240229', {
        input_tokens: 100000,
        output_tokens: 500000,
      })
      // 0.1M * $3 + 0.5M * $15 = $0.3 + $7.5 = $7.8
      expect(cost).toBeCloseTo(7.8, 2)
    })

    it('should use default cost for unknown models', () => {
      const cost = (service as any).calculateCost('unknown-model', {
        input_tokens: 1000000,
        output_tokens: 1000000,
      })
      expect(cost).toBeCloseTo(18, 2) // Should use Sonnet pricing
    })
  })
})
