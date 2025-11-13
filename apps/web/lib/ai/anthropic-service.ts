import Anthropic from '@anthropic-ai/sdk'
import { AIModel, GenerationRequest, GenerationResponse } from './types'

export class AnthropicService {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      timeout: 60000,
      maxRetries: 3,
    })
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const startTime = Date.now()
    const model = this.getModelName(request.model || AIModel.CLAUDE_SONNET)

    try {
      const message = await this.client.messages.create({
        model,
        max_tokens: request.maxTokens ?? 4000,
        temperature: request.temperature ?? 0.7,
        system:
          'You are an expert full-stack developer. Generate production-ready, well-documented code based on the user prompt. Include error handling, TypeScript types, and best practices.',
        messages: [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
      })

      const code =
        message.content[0]?.type === 'text' ? message.content[0].text : ''
      const tokensUsed = message.usage.input_tokens + message.usage.output_tokens
      const cost = this.calculateCost(model, message.usage)
      const executionTime = Date.now() - startTime

      return {
        id: message.id,
        code,
        model: request.model || AIModel.CLAUDE_SONNET,
        tokensUsed,
        cost,
        executionTime,
      }
    } catch (error: any) {
      throw new Error(`Anthropic generation failed: ${error.message}`)
    }
  }

  private getModelName(model: AIModel): string {
    switch (model) {
      case AIModel.CLAUDE_OPUS:
        return 'claude-3-opus-20240229'
      case AIModel.CLAUDE_SONNET:
        return 'claude-3-sonnet-20240229'
      case AIModel.CLAUDE_HAIKU:
        return 'claude-3-haiku-20240307'
      default:
        return 'claude-3-sonnet-20240229'
    }
  }

  private calculateCost(
    model: string,
    usage: { input_tokens: number; output_tokens: number }
  ): number {
    const costPer1MTokens: Record<string, { input: number; output: number }> = {
      'claude-3-opus-20240229': { input: 15, output: 75 },
      'claude-3-sonnet-20240229': { input: 3, output: 15 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    }

    const cost = costPer1MTokens[model] || costPer1MTokens['claude-3-sonnet-20240229']
    return (
      (usage.input_tokens / 1000000) * cost.input +
      (usage.output_tokens / 1000000) * cost.output
    )
  }
}
