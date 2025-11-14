import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GenerationService } from '@/lib/ai/generation-service'
import { AIModel, TaskComplexity } from '@/lib/ai/types'
import { OpenAIService } from '@/lib/ai/openai-service'
import { AnthropicService } from '@/lib/ai/anthropic-service'
import { ModelRouter } from '@/lib/ai/model-router'

// Mock dependencies
vi.mock('@/lib/ai/openai-service')
vi.mock('@/lib/ai/anthropic-service')
vi.mock('@/lib/ai/model-router')

describe('GenerationService', () => {
  let service: GenerationService
  let mockOpenAI: any
  let mockAnthropic: any
  let mockRouter: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup mocks
    mockOpenAI = {
      generate: vi.fn(),
    }
    mockAnthropic = {
      generate: vi.fn(),
    }
    mockRouter = {
      selectModel: vi.fn(),
      getFallbackChain: vi.fn(),
    }

    vi.mocked(OpenAIService).mockImplementation(() => mockOpenAI)
    vi.mocked(AnthropicService).mockImplementation(() => mockAnthropic)
    vi.mocked(ModelRouter).mockImplementation(() => mockRouter)

    service = new GenerationService()
  })

  describe('generate', () => {
    it('should generate code successfully with selected model', async () => {
      const mockResponse = {
        id: 'gen_123',
        code: 'export default function Button() {}',
        model: AIModel.GPT4_TURBO,
        tokensUsed: 150,
        cost: 0.015,
        executionTime: 2000,
      }

      mockRouter.selectModel.mockReturnValue(AIModel.GPT4_TURBO)
      mockRouter.getFallbackChain.mockReturnValue([AIModel.GPT4, AIModel.GPT35_TURBO])
      mockOpenAI.generate.mockResolvedValue(mockResponse)

      const result = await service.generate({
        prompt: 'Create a button component',
      })

      expect(result).toEqual(mockResponse)
      expect(mockRouter.selectModel).toHaveBeenCalledWith({
        prompt: 'Create a button component',
      })
      expect(mockOpenAI.generate).toHaveBeenCalledWith({
        prompt: 'Create a button component',
        model: AIModel.GPT4_TURBO,
      })
    })

    it('should use OpenAI service for OpenAI models', async () => {
      const mockResponse = {
        id: 'gen_openai',
        code: 'code',
        model: AIModel.GPT4,
        tokensUsed: 100,
        cost: 0.01,
        executionTime: 1000,
      }

      mockRouter.selectModel.mockReturnValue(AIModel.GPT4)
      mockRouter.getFallbackChain.mockReturnValue([])
      mockOpenAI.generate.mockResolvedValue(mockResponse)

      await service.generate({ prompt: 'Create something' })

      expect(mockOpenAI.generate).toHaveBeenCalled()
      expect(mockAnthropic.generate).not.toHaveBeenCalled()
    })

    it('should use Anthropic service for Claude models', async () => {
      const mockResponse = {
        id: 'gen_anthropic',
        code: 'code',
        model: AIModel.CLAUDE_OPUS,
        tokensUsed: 200,
        cost: 0.05,
        executionTime: 3000,
      }

      mockRouter.selectModel.mockReturnValue(AIModel.CLAUDE_OPUS)
      mockRouter.getFallbackChain.mockReturnValue([])
      mockAnthropic.generate.mockResolvedValue(mockResponse)

      await service.generate({ prompt: 'Create something' })

      expect(mockAnthropic.generate).toHaveBeenCalled()
      expect(mockOpenAI.generate).not.toHaveBeenCalled()
    })

    it('should try first fallback model when primary fails', async () => {
      const mockPrimaryError = new Error('Primary model failed')
      const mockFallbackResponse = {
        id: 'gen_fallback',
        code: 'code',
        model: AIModel.GPT4,
        tokensUsed: 100,
        cost: 0.01,
        executionTime: 1000,
      }

      mockRouter.selectModel.mockReturnValue(AIModel.GPT4_TURBO)
      mockRouter.getFallbackChain.mockReturnValue([AIModel.GPT4, AIModel.GPT35_TURBO])
      mockOpenAI.generate
        .mockRejectedValueOnce(mockPrimaryError) // Primary fails
        .mockResolvedValueOnce(mockFallbackResponse) // First fallback succeeds

      const result = await service.generate({ prompt: 'Create something' })

      expect(result).toEqual(mockFallbackResponse)
      expect(mockOpenAI.generate).toHaveBeenCalledTimes(2)
      expect(mockOpenAI.generate).toHaveBeenNthCalledWith(1, {
        prompt: 'Create something',
        model: AIModel.GPT4_TURBO,
      })
      expect(mockOpenAI.generate).toHaveBeenNthCalledWith(2, {
        prompt: 'Create something',
        model: AIModel.GPT4,
      })
    })

    it('should try all fallback models in order', async () => {
      const mockError = new Error('Model failed')
      const mockFinalResponse = {
        id: 'gen_final',
        code: 'code',
        model: AIModel.GPT35_TURBO,
        tokensUsed: 50,
        cost: 0.001,
        executionTime: 500,
      }

      mockRouter.selectModel.mockReturnValue(AIModel.GPT4_TURBO)
      mockRouter.getFallbackChain.mockReturnValue([AIModel.GPT4, AIModel.GPT35_TURBO])
      mockOpenAI.generate
        .mockRejectedValueOnce(mockError) // Primary fails
        .mockRejectedValueOnce(mockError) // First fallback fails
        .mockResolvedValueOnce(mockFinalResponse) // Second fallback succeeds

      const result = await service.generate({ prompt: 'Create something' })

      expect(result).toEqual(mockFinalResponse)
      expect(mockOpenAI.generate).toHaveBeenCalledTimes(3)
    })

    it('should throw error when all models fail', async () => {
      const mockError = new Error('Model failed')

      mockRouter.selectModel.mockReturnValue(AIModel.GPT4_TURBO)
      mockRouter.getFallbackChain.mockReturnValue([AIModel.GPT4, AIModel.GPT35_TURBO])
      mockOpenAI.generate.mockRejectedValue(mockError)

      await expect(service.generate({ prompt: 'Create something' })).rejects.toThrow(
        'All models failed. Please try again later.'
      )

      expect(mockOpenAI.generate).toHaveBeenCalledTimes(3) // Primary + 2 fallbacks
    })

    it('should switch from OpenAI to Anthropic in fallback chain', async () => {
      const mockError = new Error('OpenAI failed')
      const mockClaudeResponse = {
        id: 'gen_claude',
        code: 'code',
        model: AIModel.CLAUDE_SONNET,
        tokensUsed: 150,
        cost: 0.02,
        executionTime: 2000,
      }

      mockRouter.selectModel.mockReturnValue(AIModel.GPT4_TURBO)
      mockRouter.getFallbackChain.mockReturnValue([AIModel.GPT4, AIModel.CLAUDE_SONNET])
      mockOpenAI.generate.mockRejectedValue(mockError)
      mockAnthropic.generate.mockResolvedValue(mockClaudeResponse)

      const result = await service.generate({ prompt: 'Create something' })

      expect(result).toEqual(mockClaudeResponse)
      expect(mockOpenAI.generate).toHaveBeenCalledTimes(2) // Primary + first fallback
      expect(mockAnthropic.generate).toHaveBeenCalledTimes(1) // Second fallback
    })

    it('should pass all request parameters to selected model', async () => {
      const mockResponse = {
        id: 'gen_params',
        code: 'code',
        model: AIModel.GPT4_TURBO,
        tokensUsed: 100,
        cost: 0.01,
        executionTime: 1000,
      }

      mockRouter.selectModel.mockReturnValue(AIModel.GPT4_TURBO)
      mockRouter.getFallbackChain.mockReturnValue([])
      mockOpenAI.generate.mockResolvedValue(mockResponse)

      await service.generate({
        prompt: 'Create something',
        projectId: 'proj_123',
        complexity: TaskComplexity.EXPERT,
        temperature: 0.9,
        maxTokens: 2000,
      })

      expect(mockOpenAI.generate).toHaveBeenCalledWith({
        prompt: 'Create something',
        projectId: 'proj_123',
        complexity: TaskComplexity.EXPERT,
        temperature: 0.9,
        maxTokens: 2000,
        model: AIModel.GPT4_TURBO,
      })
    })

    it('should override model from request with router selection', async () => {
      const mockResponse = {
        id: 'gen_override',
        code: 'code',
        model: AIModel.CLAUDE_OPUS,
        tokensUsed: 100,
        cost: 0.01,
        executionTime: 1000,
      }

      // User requests GPT4, but router selects Claude Opus
      mockRouter.selectModel.mockReturnValue(AIModel.CLAUDE_OPUS)
      mockRouter.getFallbackChain.mockReturnValue([])
      mockAnthropic.generate.mockResolvedValue(mockResponse)

      await service.generate({
        prompt: 'Create something complex',
        model: AIModel.GPT4, // User requested this
      })

      // Should use router's selection, not user's request
      expect(mockAnthropic.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: AIModel.CLAUDE_OPUS, // Router selected this
        })
      )
    })

    it('should log errors when models fail', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const mockError = new Error('API rate limit')

      mockRouter.selectModel.mockReturnValue(AIModel.GPT4_TURBO)
      mockRouter.getFallbackChain.mockReturnValue([AIModel.GPT4])
      mockOpenAI.generate
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({
          id: 'gen_success',
          code: 'code',
          model: AIModel.GPT4,
          tokensUsed: 100,
          cost: 0.01,
          executionTime: 1000,
        })

      await service.generate({ prompt: 'Create something' })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Primary model GPT4_TURBO failed'),
        'API rate limit'
      )
      expect(consoleLogSpy).toHaveBeenCalledWith('Trying fallback model: GPT4')

      consoleErrorSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('should handle empty fallback chain', async () => {
      const mockError = new Error('Model failed')

      mockRouter.selectModel.mockReturnValue(AIModel.GPT4_TURBO)
      mockRouter.getFallbackChain.mockReturnValue([]) // No fallbacks
      mockOpenAI.generate.mockRejectedValue(mockError)

      await expect(service.generate({ prompt: 'Create something' })).rejects.toThrow(
        'All models failed'
      )

      expect(mockOpenAI.generate).toHaveBeenCalledTimes(1) // Only primary, no fallbacks
    })

    it('should handle complexity parameter', async () => {
      const mockResponse = {
        id: 'gen_complex',
        code: 'code',
        model: AIModel.CLAUDE_OPUS,
        tokensUsed: 500,
        cost: 0.1,
        executionTime: 5000,
      }

      mockRouter.selectModel.mockReturnValue(AIModel.CLAUDE_OPUS)
      mockRouter.getFallbackChain.mockReturnValue([])
      mockAnthropic.generate.mockResolvedValue(mockResponse)

      await service.generate({
        prompt: 'Create distributed system',
        complexity: TaskComplexity.EXPERT,
      })

      expect(mockRouter.selectModel).toHaveBeenCalledWith(
        expect.objectContaining({
          complexity: TaskComplexity.EXPERT,
        })
      )
    })

    it('should work with simple tasks', async () => {
      const mockResponse = {
        id: 'gen_simple',
        code: 'const x = 1',
        model: AIModel.GPT35_TURBO,
        tokensUsed: 10,
        cost: 0.0001,
        executionTime: 200,
      }

      mockRouter.selectModel.mockReturnValue(AIModel.GPT35_TURBO)
      mockRouter.getFallbackChain.mockReturnValue([])
      mockOpenAI.generate.mockResolvedValue(mockResponse)

      const result = await service.generate({
        prompt: 'Create a variable',
        complexity: TaskComplexity.SIMPLE,
      })

      expect(result.model).toBe(AIModel.GPT35_TURBO)
    })

    it('should fallback from Claude to OpenAI', async () => {
      const mockError = new Error('Anthropic API down')
      const mockOpenAIResponse = {
        id: 'gen_openai_fallback',
        code: 'code',
        model: AIModel.GPT4_TURBO,
        tokensUsed: 200,
        cost: 0.02,
        executionTime: 2000,
      }

      mockRouter.selectModel.mockReturnValue(AIModel.CLAUDE_OPUS)
      mockRouter.getFallbackChain.mockReturnValue([AIModel.GPT4_TURBO, AIModel.GPT4])
      mockAnthropic.generate.mockRejectedValue(mockError)
      mockOpenAI.generate.mockResolvedValue(mockOpenAIResponse)

      const result = await service.generate({ prompt: 'Create something' })

      expect(result).toEqual(mockOpenAIResponse)
      expect(mockAnthropic.generate).toHaveBeenCalledTimes(1)
      expect(mockOpenAI.generate).toHaveBeenCalledTimes(1)
    })
  })

  describe('generateWithModel', () => {
    it('should route GPT4_TURBO to OpenAI', async () => {
      const mockResponse = {
        id: 'gen_gpt4t',
        code: 'code',
        model: AIModel.GPT4_TURBO,
        tokensUsed: 100,
        cost: 0.01,
        executionTime: 1000,
      }

      mockOpenAI.generate.mockResolvedValue(mockResponse)

      const result = await (service as any).generateWithModel(
        { prompt: 'test' },
        AIModel.GPT4_TURBO
      )

      expect(result).toEqual(mockResponse)
      expect(mockOpenAI.generate).toHaveBeenCalled()
    })

    it('should route GPT4 to OpenAI', async () => {
      mockOpenAI.generate.mockResolvedValue({ code: 'code' })

      await (service as any).generateWithModel({ prompt: 'test' }, AIModel.GPT4)

      expect(mockOpenAI.generate).toHaveBeenCalled()
      expect(mockAnthropic.generate).not.toHaveBeenCalled()
    })

    it('should route GPT35_TURBO to OpenAI', async () => {
      mockOpenAI.generate.mockResolvedValue({ code: 'code' })

      await (service as any).generateWithModel({ prompt: 'test' }, AIModel.GPT35_TURBO)

      expect(mockOpenAI.generate).toHaveBeenCalled()
      expect(mockAnthropic.generate).not.toHaveBeenCalled()
    })

    it('should route CLAUDE_OPUS to Anthropic', async () => {
      mockAnthropic.generate.mockResolvedValue({ code: 'code' })

      await (service as any).generateWithModel({ prompt: 'test' }, AIModel.CLAUDE_OPUS)

      expect(mockAnthropic.generate).toHaveBeenCalled()
      expect(mockOpenAI.generate).not.toHaveBeenCalled()
    })

    it('should route CLAUDE_SONNET to Anthropic', async () => {
      mockAnthropic.generate.mockResolvedValue({ code: 'code' })

      await (service as any).generateWithModel({ prompt: 'test' }, AIModel.CLAUDE_SONNET)

      expect(mockAnthropic.generate).toHaveBeenCalled()
      expect(mockOpenAI.generate).not.toHaveBeenCalled()
    })

    it('should route CLAUDE_HAIKU to Anthropic', async () => {
      mockAnthropic.generate.mockResolvedValue({ code: 'code' })

      await (service as any).generateWithModel({ prompt: 'test' }, AIModel.CLAUDE_HAIKU)

      expect(mockAnthropic.generate).toHaveBeenCalled()
      expect(mockOpenAI.generate).not.toHaveBeenCalled()
    })
  })

  describe('isOpenAIModel', () => {
    it('should return true for GPT4_TURBO', () => {
      expect((service as any).isOpenAIModel(AIModel.GPT4_TURBO)).toBe(true)
    })

    it('should return true for GPT4', () => {
      expect((service as any).isOpenAIModel(AIModel.GPT4)).toBe(true)
    })

    it('should return true for GPT35_TURBO', () => {
      expect((service as any).isOpenAIModel(AIModel.GPT35_TURBO)).toBe(true)
    })

    it('should return false for CLAUDE_OPUS', () => {
      expect((service as any).isOpenAIModel(AIModel.CLAUDE_OPUS)).toBe(false)
    })

    it('should return false for CLAUDE_SONNET', () => {
      expect((service as any).isOpenAIModel(AIModel.CLAUDE_SONNET)).toBe(false)
    })

    it('should return false for CLAUDE_HAIKU', () => {
      expect((service as any).isOpenAIModel(AIModel.CLAUDE_HAIKU)).toBe(false)
    })
  })
})
