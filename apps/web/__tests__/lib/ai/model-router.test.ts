import { describe, it, expect } from 'vitest'
import { ModelRouter } from '@/lib/ai/model-router'
import { AIModel, TaskComplexity } from '@/lib/ai/types'

describe('ModelRouter', () => {
  const router = new ModelRouter()

  describe('selectModel', () => {
    it('should select GPT35_TURBO for simple tasks', () => {
      const model = router.selectModel({
        prompt: 'Create a simple button component',
        complexity: TaskComplexity.SIMPLE,
      })
      expect(model).toBe(AIModel.GPT35_TURBO)
    })

    it('should select CLAUDE_OPUS for expert tasks', () => {
      const model = router.selectModel({
        prompt: 'Design a distributed microservices architecture',
        complexity: TaskComplexity.EXPERT,
      })
      expect(model).toBe(AIModel.CLAUDE_OPUS)
    })

    it('should respect explicit model selection', () => {
      const model = router.selectModel({
        prompt: 'Any prompt',
        model: AIModel.GPT4,
      })
      expect(model).toBe(AIModel.GPT4)
    })
  })

  describe('getFallbackChain', () => {
    it('should return fallback models for GPT4_TURBO', () => {
      const fallbacks = router.getFallbackChain(AIModel.GPT4_TURBO)
      expect(fallbacks).toContain(AIModel.GPT4)
      expect(fallbacks).toContain(AIModel.CLAUDE_SONNET)
    })
  })
})
