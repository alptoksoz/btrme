import { AIModel, TaskComplexity, GenerationRequest } from './types'

export class ModelRouter {
  selectModel(request: GenerationRequest): AIModel {
    // If model explicitly specified, use it
    if (request.model) {
      return request.model
    }

    // Auto-select based on complexity
    const complexity = request.complexity || this.analyzeComplexity(request.prompt)

    switch (complexity) {
      case TaskComplexity.SIMPLE:
        return AIModel.GPT35_TURBO // Fastest, cheapest
      case TaskComplexity.STANDARD:
        return AIModel.CLAUDE_HAIKU // Balanced
      case TaskComplexity.COMPLEX:
        return AIModel.GPT4_TURBO // Strong reasoning
      case TaskComplexity.EXPERT:
        return AIModel.CLAUDE_OPUS // Most capable
      default:
        return AIModel.GPT4_TURBO
    }
  }

  private analyzeComplexity(prompt: string): TaskComplexity {
    const length = prompt.length
    const lowerPrompt = prompt.toLowerCase()

    // Keywords indicating complexity
    const expertKeywords = ['architecture', 'system design', 'scalable', 'microservices', 'distributed']
    const complexKeywords = ['authentication', 'database', 'api', 'integration', 'backend']
    const standardKeywords = ['component', 'function', 'utility', 'helper', 'interface']

    const hasExpertKeywords = expertKeywords.some((kw) => lowerPrompt.includes(kw))
    const hasComplexKeywords = complexKeywords.some((kw) => lowerPrompt.includes(kw))
    const hasStandardKeywords = standardKeywords.some((kw) => lowerPrompt.includes(kw))

    if (hasExpertKeywords || length > 1000) {
      return TaskComplexity.EXPERT
    } else if (hasComplexKeywords || length > 500) {
      return TaskComplexity.COMPLEX
    } else if (hasStandardKeywords || length > 200) {
      return TaskComplexity.STANDARD
    } else {
      return TaskComplexity.SIMPLE
    }
  }

  getFallbackChain(model: AIModel): AIModel[] {
    const fallbackChains: Record<AIModel, AIModel[]> = {
      [AIModel.GPT4_TURBO]: [AIModel.GPT4, AIModel.CLAUDE_SONNET],
      [AIModel.GPT4]: [AIModel.GPT4_TURBO, AIModel.CLAUDE_SONNET],
      [AIModel.GPT35_TURBO]: [AIModel.CLAUDE_HAIKU, AIModel.GPT4_TURBO],
      [AIModel.CLAUDE_OPUS]: [AIModel.CLAUDE_SONNET, AIModel.GPT4],
      [AIModel.CLAUDE_SONNET]: [AIModel.CLAUDE_HAIKU, AIModel.GPT4_TURBO],
      [AIModel.CLAUDE_HAIKU]: [AIModel.GPT35_TURBO, AIModel.CLAUDE_SONNET],
    }

    return fallbackChains[model] || [AIModel.GPT4_TURBO]
  }
}
