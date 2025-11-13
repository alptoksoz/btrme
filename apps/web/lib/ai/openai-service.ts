import OpenAI from 'openai'
import { AIModel, GenerationRequest, GenerationResponse } from './types'

export class OpenAIService {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      timeout: 60000,
      maxRetries: 3,
    })
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const startTime = Date.now()
    const model = this.getModelName(request.model || AIModel.GPT4_TURBO)

    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert full-stack developer. Generate production-ready, well-documented code based on the user prompt. Include error handling, TypeScript types, and best practices.',
          },
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4000,
      })

      const code = completion.choices[0]?.message?.content || ''
      const tokensUsed = completion.usage?.total_tokens || 0
      const cost = this.calculateCost(model, tokensUsed)
      const executionTime = Date.now() - startTime

      return {
        id: completion.id,
        code,
        model: request.model || AIModel.GPT4_TURBO,
        tokensUsed,
        cost,
        executionTime,
      }
    } catch (error: any) {
      throw new Error(`OpenAI generation failed: ${error.message}`)
    }
  }

  private getModelName(model: AIModel): string {
    switch (model) {
      case AIModel.GPT4_TURBO:
        return 'gpt-4-turbo-preview'
      case AIModel.GPT4:
        return 'gpt-4'
      case AIModel.GPT35_TURBO:
        return 'gpt-3.5-turbo'
      default:
        return 'gpt-4-turbo-preview'
    }
  }

  private calculateCost(model: string, tokens: number): number {
    const costPer1kTokens: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    }

    const cost = costPer1kTokens[model] || costPer1kTokens['gpt-4-turbo-preview']
    // Assuming 50/50 input/output split for estimation
    return ((tokens / 1000) * (cost.input + cost.output)) / 2
  }
}
