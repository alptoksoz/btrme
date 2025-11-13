import { OpenAIService } from './openai-service'
import { AnthropicService } from './anthropic-service'
import { ModelRouter } from './model-router'
import { AIModel, GenerationRequest, GenerationResponse } from './types'

export class GenerationService {
  private openai: OpenAIService
  private anthropic: AnthropicService
  private router: ModelRouter

  constructor() {
    this.openai = new OpenAIService()
    this.anthropic = new AnthropicService()
    this.router = new ModelRouter()
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const model = this.router.selectModel(request)
    const fallbackChain = this.router.getFallbackChain(model)

    try {
      return await this.generateWithModel(request, model)
    } catch (error: any) {
      console.error(`Primary model ${model} failed:`, error.message)

      // Try fallback models
      for (const fallbackModel of fallbackChain) {
        try {
          console.log(`Trying fallback model: ${fallbackModel}`)
          return await this.generateWithModel(request, fallbackModel)
        } catch (fallbackError: any) {
          console.error(`Fallback model ${fallbackModel} failed:`, fallbackError.message)
        }
      }

      throw new Error('All models failed. Please try again later.')
    }
  }

  private async generateWithModel(
    request: GenerationRequest,
    model: AIModel
  ): Promise<GenerationResponse> {
    const requestWithModel = { ...request, model }

    if (this.isOpenAIModel(model)) {
      return await this.openai.generate(requestWithModel)
    } else {
      return await this.anthropic.generate(requestWithModel)
    }
  }

  private isOpenAIModel(model: AIModel): boolean {
    return [AIModel.GPT4_TURBO, AIModel.GPT4, AIModel.GPT35_TURBO].includes(model)
  }
}
