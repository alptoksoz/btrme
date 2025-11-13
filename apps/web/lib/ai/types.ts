export enum AIModel {
  GPT4_TURBO = 'GPT4_TURBO',
  GPT4 = 'GPT4',
  GPT35_TURBO = 'GPT35_TURBO',
  CLAUDE_OPUS = 'CLAUDE_OPUS',
  CLAUDE_SONNET = 'CLAUDE_SONNET',
  CLAUDE_HAIKU = 'CLAUDE_HAIKU',
}

export enum TaskComplexity {
  SIMPLE = 'SIMPLE',
  STANDARD = 'STANDARD',
  COMPLEX = 'COMPLEX',
  EXPERT = 'EXPERT',
}

export interface GenerationRequest {
  prompt: string
  projectId?: string
  complexity?: TaskComplexity
  model?: AIModel
  temperature?: number
  maxTokens?: number
}

export interface GenerationResponse {
  id: string
  code: string
  model: AIModel
  tokensUsed: number
  cost: number
  executionTime: number
}

export interface AIServiceConfig {
  apiKey: string
  model: AIModel
  maxTokens: number
  temperature: number
  timeout: number
}
