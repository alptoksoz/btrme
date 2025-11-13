# SPRINT 2: AI Engine & Code Generation (85 SP, 2 Weeks)

**Sprint Goal:** Build the core AI-powered code generation engine that transforms natural language prompts into production-ready web applications.

**Sprint Duration:** 2 weeks (80 hours per engineer)
**Team Size:** 8 senior engineers
**Total Story Points:** 85 SP
**Estimated Hours:** 204 hours

**Success Criteria:**
- ✅ AI model integration (OpenAI GPT-4, Anthropic Claude)
- ✅ Prompt engineering system for app generation
- ✅ Code generation pipeline (frontend + backend)
- ✅ Template system with pre-built app structures
- ✅ Real-time generation progress tracking
- ✅ Generated code validation and testing
- ✅ Project scaffolding and file structure
- ✅ Integration with database schema generation

**Dependencies:**
- Requires: Sprint 1 (infrastructure, auth, UI)
- Blocks: Sprint 3 (deployment pipeline)

**Technical Decisions:**
- Primary AI Model: OpenAI GPT-4 Turbo (128k context)
- Fallback Model: Anthropic Claude 3.5 Sonnet
- Code Generation Framework: Custom prompt chains
- Template Engine: Handlebars.js
- Validation: ESLint, TypeScript compiler, Vitest

---

## Epic 2.1: AI Model Integration (20 SP, 48 hours)

**Epic Goal:** Integrate AI models (OpenAI, Anthropic) with proper API wrappers, error handling, token management, and fallback mechanisms.

**Success Criteria:**
- ✅ OpenAI GPT-4 Turbo integration
- ✅ Anthropic Claude 3.5 integration
- ✅ Token counting and cost tracking
- ✅ Streaming responses for real-time feedback
- ✅ Automatic fallback on errors
- ✅ Rate limiting and retry logic

---

### Story 2.1.1: OpenAI Integration (8 SP, 18 hours)

**User Story:**
As a **system**, I want to **integrate with OpenAI GPT-4** so that **I can generate code from natural language prompts**.

**Acceptance Criteria (Gherkin):**

```gherkin
Feature: OpenAI Integration

  Scenario: Successfully call OpenAI API
    Given I have a valid OpenAI API key
    When I send a prompt to GPT-4
    Then I receive a valid response
    And Token usage is tracked
    And Cost is calculated

  Scenario: Handle API errors gracefully
    Given The OpenAI API returns an error
    When I attempt to make a request
    Then The error is logged
    And A user-friendly message is returned
    And The request is retried with exponential backoff

  Scenario: Stream responses
    Given I enable streaming mode
    When I send a prompt
    Then I receive response chunks in real-time
    And Each chunk is processed immediately
```

**Story Points:** 8 SP
**Estimated Hours:** 18 hours
**Priority:** Critical
**Dependencies:** None

---

#### **Task 2.1.1.1: Set Up OpenAI SDK** (3 SP, 7 hours)

**Description:** Install OpenAI SDK, configure API client, implement basic chat completion functionality.

**Steps:**

##### **Step 1: Install Dependencies**

```bash
pnpm add openai
pnpm add @types/node -D
```

##### **Step 2: Create OpenAI Client**

File: `apps/web/lib/ai/openai-client.ts`

```typescript
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Token pricing (per 1K tokens) - Update as needed
export const PRICING = {
  'gpt-4-turbo-preview': {
    input: 0.01,
    output: 0.03,
  },
  'gpt-4': {
    input: 0.03,
    output: 0.06,
  },
  'gpt-3.5-turbo': {
    input: 0.0005,
    output: 0.0015,
  },
} as const

export type OpenAIModel = keyof typeof PRICING

// Calculate cost based on token usage
export function calculateCost(
  model: OpenAIModel,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model]
  const inputCost = (inputTokens / 1000) * pricing.input
  const outputCost = (outputTokens / 1000) * pricing.output
  return inputCost + outputCost
}
```

##### **Step 3: Create OpenAI Service**

File: `apps/web/lib/ai/openai-service.ts`

```typescript
import { openai, calculateCost, type OpenAIModel } from './openai-client'
import type { ChatCompletionMessageParam } from 'openai/resources/chat'

export interface ChatCompletionOptions {
  model?: OpenAIModel
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface ChatCompletionResult {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cost: number
  model: string
}

export async function chatCompletion(
  messages: ChatCompletionMessageParam[],
  options: ChatCompletionOptions = {}
): Promise<ChatCompletionResult> {
  const {
    model = 'gpt-4-turbo-preview',
    temperature = 0.7,
    maxTokens = 4096,
    stream = false,
  } = options

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
    })

    if (!response.choices[0]?.message?.content) {
      throw new Error('No content in OpenAI response')
    }

    const usage = response.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    }

    return {
      content: response.choices[0].message.content,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      },
      cost: calculateCost(model, usage.prompt_tokens, usage.completion_tokens),
      model: response.model,
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to call OpenAI API'
    )
  }
}

export async function* chatCompletionStream(
  messages: ChatCompletionMessageParam[],
  options: ChatCompletionOptions = {}
): AsyncGenerator<string, ChatCompletionResult, undefined> {
  const {
    model = 'gpt-4-turbo-preview',
    temperature = 0.7,
    maxTokens = 4096,
  } = options

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    })

    let content = ''
    let promptTokens = 0
    let completionTokens = 0

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || ''
      if (delta) {
        content += delta
        completionTokens++ // Approximate token count
        yield delta
      }
    }

    // Estimate prompt tokens (rough approximation)
    promptTokens = JSON.stringify(messages).length / 4

    return {
      content,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      cost: calculateCost(model, promptTokens, completionTokens),
      model,
    }
  } catch (error) {
    console.error('OpenAI streaming error:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to stream from OpenAI'
    )
  }
}
```

##### **Step 4: Add Environment Variables**

Update `.env.example`:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# AI Model Settings
AI_MODEL=gpt-4-turbo-preview
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=4096
```

##### **Step 5: Create API Route**

File: `apps/web/app/api/ai/chat/route.ts`

```typescript
import { apiHandler } from '@/lib/api/handler'
import { z } from 'zod'
import { chatCompletion } from '@/lib/ai/openai-service'
import { prisma } from '@/lib/db'

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    })
  ),
  model: z.enum(['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo']).optional(),
  temperature: z.number().min(0).max(2).optional(),
})

export const POST = apiHandler(
  async (req, { body, userId }) => {
    const result = await chatCompletion(body!.messages, {
      model: body!.model,
      temperature: body!.temperature,
    })

    // Log AI usage
    await prisma.aiUsage.create({
      data: {
        userId: userId!,
        model: result.model,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        cost: result.cost,
      },
    })

    return result
  },
  {
    requireAuth: true,
    bodySchema: chatSchema,
    rateLimit: 'generation',
  }
)
```

**Deliverables:**
- ✅ `lib/ai/openai-client.ts` - OpenAI client with pricing
- ✅ `lib/ai/openai-service.ts` - Chat completion service
- ✅ `app/api/ai/chat/route.ts` - API endpoint
- ✅ Token counting and cost calculation
- ✅ Usage tracking in database

**Testing:**

```typescript
// apps/web/__tests__/ai/openai-service.test.ts
import { describe, it, expect, vi } from 'vitest'
import { chatCompletion } from '@/lib/ai/openai-service'

vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            { message: { content: 'Hello from GPT-4' } },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
          model: 'gpt-4-turbo-preview',
        }),
      },
    },
  })),
}))

describe('OpenAI Service', () => {
  it('calls OpenAI API successfully', async () => {
    const result = await chatCompletion([
      { role: 'user', content: 'Hello' },
    ])

    expect(result.content).toBe('Hello from GPT-4')
    expect(result.usage.totalTokens).toBe(15)
    expect(result.cost).toBeGreaterThan(0)
  })
})
```

---

#### **Task 2.1.1.2: Implement Error Handling & Retries** (3 SP, 7 hours)

**Description:** Add robust error handling, automatic retries with exponential backoff, and fallback mechanisms.

**Steps:**

##### **Step 1: Create Retry Utility**

File: `apps/web/lib/ai/retry.ts`

```typescript
export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options

  let lastError: Error | null = null
  let delay = initialDelay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxRetries) {
        break
      }

      // Check if error is retryable
      if (isRateLimitError(error) || isServerError(error)) {
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
        await sleep(delay)
        delay = Math.min(delay * backoffFactor, maxDelay)
      } else {
        // Non-retryable error
        throw lastError
      }
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

function isRateLimitError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('rate_limit') ||
      error.message.includes('429') ||
      error.message.includes('quota'))
  )
}

function isServerError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('500') ||
      error.message.includes('502') ||
      error.message.includes('503') ||
      error.message.includes('504'))
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
```

##### **Step 2: Update OpenAI Service with Retries**

Update `lib/ai/openai-service.ts`:

```typescript
import { retryWithBackoff } from './retry'

export async function chatCompletionWithRetry(
  messages: ChatCompletionMessageParam[],
  options: ChatCompletionOptions = {}
): Promise<ChatCompletionResult> {
  return retryWithBackoff(
    () => chatCompletion(messages, options),
    {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000,
    }
  )
}
```

##### **Step 3: Add Error Types**

File: `apps/web/lib/ai/errors.ts`

```typescript
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AIError'
  }
}

export class TokenLimitError extends AIError {
  constructor(message: string = 'Token limit exceeded') {
    super(message, 'TOKEN_LIMIT_EXCEEDED')
    this.name = 'TokenLimitError'
  }
}

export class RateLimitError extends AIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_EXCEEDED')
    this.name = 'RateLimitError'
  }
}

export class ContentFilterError extends AIError {
  constructor(message: string = 'Content filtered by AI provider') {
    super(message, 'CONTENT_FILTERED')
    this.name = 'ContentFilterError'
  }
}
```

**Deliverables:**
- ✅ `lib/ai/retry.ts` - Retry logic with exponential backoff
- ✅ `lib/ai/errors.ts` - Custom AI error types
- ✅ Updated OpenAI service with retry support
- ✅ Automatic fallback on transient errors

---

#### **Task 2.1.1.3: Add Streaming Support** (2 SP, 4 hours)

**Description:** Implement streaming responses for real-time user feedback.

**Steps:**

##### **Step 1: Create Streaming API Route**

File: `apps/web/app/api/ai/chat/stream/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { chatCompletionStream } from '@/lib/ai/openai-service'
import { checkRateLimit, getClientIdentifier } from '@/lib/api/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit
    await checkRateLimit({
      identifier: session.user.id,
      tier: session.user.tier,
      type: 'generation',
    })

    const { messages } = await req.json()

    // Create readable stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = chatCompletionStream(messages)

          for await (const chunk of generator) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          }

          const result = await generator.return()
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, usage: result.value.usage })}\n\n`))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Streaming error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Streaming failed' },
      { status: 500 }
    )
  }
}
```

##### **Step 2: Create Frontend Hook**

File: `apps/web/hooks/use-ai-stream.ts`

```typescript
'use client'

import { useState, useCallback } from 'react'

export interface UseAIStreamOptions {
  onChunk?: (chunk: string) => void
  onComplete?: (fullResponse: string) => void
  onError?: (error: Error) => void
}

export function useAIStream(options: UseAIStreamOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [error, setError] = useState<Error | null>(null)

  const generate = useCallback(
    async (messages: Array<{ role: string; content: string }>) => {
      setLoading(true)
      setResponse('')
      setError(null)

      try {
        const res = await fetch('/api/ai/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        })

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const reader = res.body?.getReader()
        if (!reader) {
          throw new Error('No reader available')
        }

        const decoder = new TextDecoder()
        let fullResponse = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                fullResponse += data.content
                setResponse(fullResponse)
                options.onChunk?.(data.content)
              }
              if (data.done) {
                options.onComplete?.(fullResponse)
              }
            }
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        options.onError?.(error)
      } finally {
        setLoading(false)
      }
    },
    [options]
  )

  return {
    generate,
    loading,
    response,
    error,
  }
}
```

**Deliverables:**
- ✅ `app/api/ai/chat/stream/route.ts` - Streaming API endpoint
- ✅ `hooks/use-ai-stream.ts` - React hook for streaming
- ✅ Server-Sent Events (SSE) implementation
- ✅ Real-time chunk processing

---

### **Story 2.1.1 Summary**

**Completed Tasks:**
1. ✅ Task 2.1.1.1: Set Up OpenAI SDK (7 hours)
2. ✅ Task 2.1.1.2: Error Handling & Retries (7 hours)
3. ✅ Task 2.1.1.3: Streaming Support (4 hours)

**Total Time:** 18 hours
**Story Points:** 8 SP

**Files Created/Modified:**
- `lib/ai/openai-client.ts` - OpenAI client
- `lib/ai/openai-service.ts` - Chat completion service
- `lib/ai/retry.ts` - Retry utility
- `lib/ai/errors.ts` - AI error types
- `app/api/ai/chat/route.ts` - Chat API
- `app/api/ai/chat/stream/route.ts` - Streaming API
- `hooks/use-ai-stream.ts` - Streaming hook

**Next Story:**
→ Story 2.1.2: Anthropic Claude Integration (6 SP, 14 hours)

---

### Story 2.1.2: Anthropic Claude Integration (6 SP, 14 hours)

**User Story:**
As a **system**, I want to **integrate with Anthropic Claude** so that **I can use it as a fallback AI provider and leverage its strengths for specific tasks**.

**Acceptance Criteria (Gherkin):**

```gherkin
Feature: Anthropic Claude Integration

  Scenario: Call Claude API successfully
    Given I have a valid Anthropic API key
    When I send a prompt to Claude
    Then I receive a valid response
    And Token usage is tracked

  Scenario: Use Claude as fallback
    Given OpenAI API fails
    When The system attempts generation
    Then Claude is used automatically
    And The user receives a response
```

**Story Points:** 6 SP
**Estimated Hours:** 14 hours
**Priority:** High
**Dependencies:** Story 2.1.1 (OpenAI integration)

---

#### **Task 2.1.2.1: Set Up Anthropic SDK** (3 SP, 7 hours)

**Description:** Install Anthropic SDK, configure client, implement message completion functionality.

**Steps:**

##### **Step 1: Install Dependencies**

```bash
pnpm add @anthropic-ai/sdk
```

##### **Step 2: Create Anthropic Client**

File: `apps/web/lib/ai/anthropic-client.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set')
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Token pricing (per 1M tokens)
export const CLAUDE_PRICING = {
  'claude-3-5-sonnet-20241022': {
    input: 3.0,
    output: 15.0,
  },
  'claude-3-opus-20240229': {
    input: 15.0,
    output: 75.0,
  },
  'claude-3-sonnet-20240229': {
    input: 3.0,
    output: 15.0,
  },
  'claude-3-haiku-20240307': {
    input: 0.25,
    output: 1.25,
  },
} as const

export type ClaudeModel = keyof typeof CLAUDE_PRICING

export function calculateClaudeCost(
  model: ClaudeModel,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = CLAUDE_PRICING[model]
  const inputCost = (inputTokens / 1_000_000) * pricing.input
  const outputCost = (outputTokens / 1_000_000) * pricing.output
  return inputCost + outputCost
}
```

##### **Step 3: Create Claude Service**

File: `apps/web/lib/ai/claude-service.ts`

```typescript
import { anthropic, calculateClaudeCost, type ClaudeModel } from './anthropic-client'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

export interface ClaudeCompletionOptions {
  model?: ClaudeModel
  temperature?: number
  maxTokens?: number
}

export interface ClaudeCompletionResult {
  content: string
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  cost: number
  model: string
}

export async function claudeCompletion(
  messages: MessageParam[],
  options: ClaudeCompletionOptions = {}
): Promise<ClaudeCompletionResult> {
  const {
    model = 'claude-3-5-sonnet-20241022',
    temperature = 0.7,
    maxTokens = 4096,
  } = options

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages,
    })

    const content = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as any).text)
      .join('')

    const usage = response.usage

    return {
      content,
      usage: {
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        totalTokens: usage.input_tokens + usage.output_tokens,
      },
      cost: calculateClaudeCost(model, usage.input_tokens, usage.output_tokens),
      model: response.model,
    }
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to call Claude API'
    )
  }
}

export async function* claudeCompletionStream(
  messages: MessageParam[],
  options: ClaudeCompletionOptions = {}
): AsyncGenerator<string, ClaudeCompletionResult, undefined> {
  const {
    model = 'claude-3-5-sonnet-20241022',
    temperature = 0.7,
    maxTokens = 4096,
  } = options

  try {
    const stream = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages,
      stream: true,
    })

    let content = ''
    let inputTokens = 0
    let outputTokens = 0

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const text = event.delta.text
        content += text
        yield text
      }

      if (event.type === 'message_start') {
        inputTokens = event.message.usage.input_tokens
      }

      if (event.type === 'message_delta') {
        outputTokens = event.usage.output_tokens
      }
    }

    return {
      content,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
      cost: calculateClaudeCost(model, inputTokens, outputTokens),
      model,
    }
  } catch (error) {
    console.error('Claude streaming error:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to stream from Claude'
    )
  }
}
```

##### **Step 4: Update Environment Variables**

Update `.env.example`:

```bash
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# AI Provider Priority
AI_PRIMARY_PROVIDER=openai
AI_FALLBACK_PROVIDER=anthropic
```

**Deliverables:**
- ✅ `lib/ai/anthropic-client.ts` - Anthropic client
- ✅ `lib/ai/claude-service.ts` - Claude completion service
- ✅ Token counting and cost calculation
- ✅ Streaming support

---

#### **Task 2.1.2.2: Implement Provider Abstraction** (3 SP, 7 hours)

**Description:** Create a unified AI service that abstracts OpenAI and Claude, with automatic fallback.

**Steps:**

##### **Step 1: Create AI Provider Interface**

File: `apps/web/lib/ai/types.ts`

```typescript
export type AIProvider = 'openai' | 'anthropic'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AICompletionOptions {
  provider?: AIProvider
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface AICompletionResult {
  content: string
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  cost: number
  model: string
  provider: AIProvider
}
```

##### **Step 2: Create Unified AI Service**

File: `apps/web/lib/ai/service.ts`

```typescript
import { chatCompletionWithRetry, chatCompletionStream } from './openai-service'
import { claudeCompletion, claudeCompletionStream } from './claude-service'
import { retryWithBackoff } from './retry'
import type {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResult,
} from './types'

// Convert messages to OpenAI format
function toOpenAIMessages(messages: AIMessage[]) {
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))
}

// Convert messages to Claude format
function toClaudeMessages(messages: AIMessage[]) {
  // Claude requires alternating user/assistant messages
  // System messages go in the system parameter
  const systemMessages = messages.filter((m) => m.role === 'system')
  const conversationMessages = messages.filter((m) => m.role !== 'system')

  return {
    system: systemMessages.map((m) => m.content).join('\n\n'),
    messages: conversationMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  }
}

export async function generateCompletion(
  messages: AIMessage[],
  options: AICompletionOptions = {}
): Promise<AICompletionResult> {
  const primaryProvider = (options.provider ||
    process.env.AI_PRIMARY_PROVIDER ||
    'openai') as AIProvider

  const fallbackProvider = (process.env.AI_FALLBACK_PROVIDER ||
    'anthropic') as AIProvider

  try {
    return await generateWithProvider(messages, primaryProvider, options)
  } catch (error) {
    console.warn(`Primary provider (${primaryProvider}) failed, trying fallback...`)

    try {
      return await generateWithProvider(messages, fallbackProvider, options)
    } catch (fallbackError) {
      console.error('Both providers failed:', error, fallbackError)
      throw new Error('All AI providers failed. Please try again later.')
    }
  }
}

async function generateWithProvider(
  messages: AIMessage[],
  provider: AIProvider,
  options: AICompletionOptions
): Promise<AICompletionResult> {
  if (provider === 'openai') {
    const result = await chatCompletionWithRetry(toOpenAIMessages(messages), {
      model: options.model as any,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    })

    return {
      ...result,
      provider: 'openai',
      usage: {
        inputTokens: result.usage.promptTokens,
        outputTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      },
    }
  } else {
    const { system, messages: claudeMessages } = toClaudeMessages(messages)

    // Add system message as first user message if present
    const finalMessages = system
      ? [
          { role: 'user' as const, content: system },
          ...claudeMessages,
        ]
      : claudeMessages

    const result = await claudeCompletion(finalMessages, {
      model: options.model as any,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    })

    return {
      ...result,
      provider: 'anthropic',
    }
  }
}

export async function* generateCompletionStream(
  messages: AIMessage[],
  options: AICompletionOptions = {}
): AsyncGenerator<string, AICompletionResult, undefined> {
  const provider = (options.provider ||
    process.env.AI_PRIMARY_PROVIDER ||
    'openai') as AIProvider

  if (provider === 'openai') {
    const generator = chatCompletionStream(toOpenAIMessages(messages), {
      model: options.model as any,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    })

    for await (const chunk of generator) {
      yield chunk
    }

    const result = await generator.return()
    return {
      ...result.value,
      provider: 'openai',
      usage: {
        inputTokens: result.value.usage.promptTokens,
        outputTokens: result.value.usage.completionTokens,
        totalTokens: result.value.usage.totalTokens,
      },
    }
  } else {
    const { system, messages: claudeMessages } = toClaudeMessages(messages)

    const finalMessages = system
      ? [
          { role: 'user' as const, content: system },
          ...claudeMessages,
        ]
      : claudeMessages

    const generator = claudeCompletionStream(finalMessages, {
      model: options.model as any,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    })

    for await (const chunk of generator) {
      yield chunk
    }

    const result = await generator.return()
    return {
      ...result.value,
      provider: 'anthropic',
    }
  }
}
```

##### **Step 3: Update API Routes**

Update `apps/web/app/api/ai/chat/route.ts`:

```typescript
import { apiHandler } from '@/lib/api/handler'
import { z } from 'zod'
import { generateCompletion } from '@/lib/ai/service'
import { prisma } from '@/lib/db'

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    })
  ),
  provider: z.enum(['openai', 'anthropic']).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
})

export const POST = apiHandler(
  async (req, { body, userId }) => {
    const result = await generateCompletion(body!.messages, {
      provider: body!.provider,
      model: body!.model,
      temperature: body!.temperature,
    })

    // Log AI usage
    await prisma.aiUsage.create({
      data: {
        userId: userId!,
        provider: result.provider,
        model: result.model,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
        cost: result.cost,
      },
    })

    return result
  },
  {
    requireAuth: true,
    bodySchema: chatSchema,
    rateLimit: 'generation',
  }
)
```

**Deliverables:**
- ✅ `lib/ai/types.ts` - AI provider interfaces
- ✅ `lib/ai/service.ts` - Unified AI service
- ✅ Automatic fallback between providers
- ✅ Provider abstraction for easy switching
- ✅ Updated API routes

**Testing:**

```typescript
// apps/web/__tests__/ai/service.test.ts
import { describe, it, expect, vi } from 'vitest'
import { generateCompletion } from '@/lib/ai/service'

describe('AI Service', () => {
  it('uses OpenAI as primary provider', async () => {
    const result = await generateCompletion([
      { role: 'user', content: 'Hello' },
    ])

    expect(result.provider).toBe('openai')
    expect(result.content).toBeDefined()
  })

  it('falls back to Claude on OpenAI failure', async () => {
    // Mock OpenAI to fail
    vi.mock('@/lib/ai/openai-service', () => ({
      chatCompletionWithRetry: vi.fn().mockRejectedValue(new Error('OpenAI failed')),
    }))

    const result = await generateCompletion([
      { role: 'user', content: 'Hello' },
    ])

    expect(result.provider).toBe('anthropic')
  })
})
```

---

### **Story 2.1.2 Summary**

**Completed Tasks:**
1. ✅ Task 2.1.2.1: Set Up Anthropic SDK (7 hours)
2. ✅ Task 2.1.2.2: Implement Provider Abstraction (7 hours)

**Total Time:** 14 hours
**Story Points:** 6 SP

**Files Created/Modified:**
- `lib/ai/anthropic-client.ts` - Anthropic client
- `lib/ai/claude-service.ts` - Claude completion service
- `lib/ai/types.ts` - AI provider interfaces
- `lib/ai/service.ts` - Unified AI service with fallback
- `app/api/ai/chat/route.ts` - Updated with provider support

**Acceptance Criteria Met:**
- ✅ Claude API integration
- ✅ Token tracking and cost calculation
- ✅ Automatic fallback from OpenAI to Claude
- ✅ Provider abstraction layer
- ✅ Streaming support for both providers

**Next Story:**
→ Story 2.1.3: Token Management & Cost Tracking (6 SP, 16 hours)

---

### Story 2.1.3: Token Management & Cost Tracking (6 SP, 16 hours)

**User Story:**
As a **platform owner**, I want to **track AI token usage and costs** so that **I can monitor expenses and optimize spending**.

**Acceptance Criteria (Gherkin):**

```gherkin
Feature: Token Management & Cost Tracking

  Scenario: Track token usage per user
    Given A user makes an AI request
    When The request completes
    Then Token usage is logged to database
    And Cost is calculated and stored
    And User's tier limits are checked

  Scenario: Generate cost reports
    Given I am an admin
    When I view the cost dashboard
    Then I see total costs by provider
    And I see costs per user
    And I see trends over time

  Scenario: Alert on high costs
    Given Daily costs exceed threshold
    When The system checks costs
    Then An alert is sent to admins
    And High-usage users are flagged
```

**Story Points:** 6 SP
**Estimated Hours:** 16 hours
**Priority:** High
**Dependencies:** Stories 2.1.1, 2.1.2

---

#### **Task 2.1.3.1: Create Usage Tracking System** (3 SP, 8 hours)

**Description:** Implement comprehensive token usage and cost tracking in the database.

**Steps:**

##### **Step 1: Update Prisma Schema**

Add to `prisma/schema.prisma`:

```prisma
model AiUsage {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  provider  String   // 'openai' | 'anthropic'
  model     String

  inputTokens     Int
  outputTokens    Int
  totalTokens     Int
  cost            Float

  projectId       String?
  project         Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)

  generationId    String?
  generation      Generation? @relation(fields: [generationId], references: [id], onDelete: SetNull)

  metadata        Json?

  @@index([userId, createdAt])
  @@index([projectId])
  @@index([createdAt])
  @@map("ai_usage")
}

model CostAlert {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())

  type        String   // 'daily_threshold' | 'user_threshold' | 'project_threshold'
  threshold   Float
  actualCost  Float

  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  projectId   String?
  project     Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)

  resolved    Boolean  @default(false)
  resolvedAt  DateTime?

  @@index([resolved, createdAt])
  @@map("cost_alerts")
}
```

Run migration:

```bash
npx prisma migrate dev --name add_ai_usage_tracking
```

##### **Step 2: Create Usage Tracking Service**

File: `apps/web/lib/ai/usage-tracking.ts`

```typescript
import { prisma } from '@/lib/db'
import type { AICompletionResult } from './types'

export interface TrackUsageOptions {
  userId: string
  result: AICompletionResult
  projectId?: string
  generationId?: string
  metadata?: Record<string, any>
}

export async function trackAIUsage(options: TrackUsageOptions): Promise<void> {
  const { userId, result, projectId, generationId, metadata } = options

  await prisma.aiUsage.create({
    data: {
      userId,
      provider: result.provider,
      model: result.model,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      totalTokens: result.usage.totalTokens,
      cost: result.cost,
      projectId,
      generationId,
      metadata,
    },
  })

  // Check if we need to create alerts
  await checkCostThresholds(userId, projectId)
}

async function checkCostThresholds(
  userId: string,
  projectId?: string
): Promise<void> {
  // Check daily user spending
  const dailyCost = await getDailyCost(userId)
  const userThreshold = 50 // $50 per day per user

  if (dailyCost > userThreshold) {
    await createCostAlert({
      type: 'user_threshold',
      userId,
      threshold: userThreshold,
      actualCost: dailyCost,
    })
  }

  // Check project spending if applicable
  if (projectId) {
    const projectCost = await getProjectCost(projectId)
    const projectThreshold = 100 // $100 per project

    if (projectCost > projectThreshold) {
      await createCostAlert({
        type: 'project_threshold',
        projectId,
        threshold: projectThreshold,
        actualCost: projectCost,
      })
    }
  }
}

async function createCostAlert(data: {
  type: string
  threshold: number
  actualCost: number
  userId?: string
  projectId?: string
}): Promise<void> {
  // Check if alert already exists
  const existing = await prisma.costAlert.findFirst({
    where: {
      type: data.type,
      userId: data.userId,
      projectId: data.projectId,
      resolved: false,
    },
  })

  if (!existing) {
    await prisma.costAlert.create({
      data,
    })

    // TODO: Send notification to admins
    console.warn('Cost alert created:', data)
  }
}

export async function getDailyCost(userId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result = await prisma.aiUsage.aggregate({
    where: {
      userId,
      createdAt: {
        gte: today,
      },
    },
    _sum: {
      cost: true,
    },
  })

  return result._sum.cost || 0
}

export async function getProjectCost(projectId: string): Promise<number> {
  const result = await prisma.aiUsage.aggregate({
    where: {
      projectId,
    },
    _sum: {
      cost: true,
    },
  })

  return result._sum.cost || 0
}

export async function getTotalCost(
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  const result = await prisma.aiUsage.aggregate({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      cost: true,
    },
  })

  return result._sum.cost || 0
}
```

##### **Step 3: Update AI Service to Track Usage**

Update `apps/web/lib/ai/service.ts`:

```typescript
import { trackAIUsage } from './usage-tracking'

export async function generateCompletionWithTracking(
  messages: AIMessage[],
  options: AICompletionOptions & {
    userId: string
    projectId?: string
    generationId?: string
  }
): Promise<AICompletionResult> {
  const result = await generateCompletion(messages, options)

  // Track usage asynchronously
  trackAIUsage({
    userId: options.userId,
    result,
    projectId: options.projectId,
    generationId: options.generationId,
  }).catch((error) => {
    console.error('Failed to track AI usage:', error)
  })

  return result
}
```

**Deliverables:**
- ✅ Updated Prisma schema with `AiUsage` and `CostAlert` models
- ✅ `lib/ai/usage-tracking.ts` - Usage tracking service
- ✅ Automatic cost threshold alerts
- ✅ Usage aggregation functions

---

#### **Task 2.1.3.2: Create Cost Dashboard** (3 SP, 8 hours)

**Description:** Build admin dashboard to visualize AI costs and usage.

**Steps:**

##### **Step 1: Create Analytics API**

File: `apps/web/app/api/admin/ai-usage/route.ts`

```typescript
import { apiHandler } from '@/lib/api/handler'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(['day', 'user', 'provider', 'model']).optional(),
})

export const GET = apiHandler(
  async (req, { userId }) => {
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      throw new Error('Forbidden')
    }

    const url = new URL(req.url)
    const startDate = url.searchParams.get('startDate')
      ? new Date(url.searchParams.get('startDate')!)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days

    const endDate = url.searchParams.get('endDate')
      ? new Date(url.searchParams.get('endDate')!)
      : new Date()

    const groupBy = (url.searchParams.get('groupBy') as any) || 'day'

    // Get total usage
    const totalUsage = await prisma.aiUsage.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalTokens: true,
        cost: true,
      },
      _count: true,
    })

    // Get usage by provider
    const byProvider = await prisma.aiUsage.groupBy({
      by: ['provider'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalTokens: true,
        cost: true,
      },
      _count: true,
    })

    // Get top users by cost
    const topUsers = await prisma.aiUsage.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        cost: true,
        totalTokens: true,
      },
      orderBy: {
        _sum: {
          cost: 'desc',
        },
      },
      take: 10,
    })

    // Get daily costs
    const dailyCosts = await prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        SUM(cost) as total_cost,
        SUM(total_tokens) as total_tokens,
        COUNT(*) as request_count
      FROM ai_usage
      WHERE created_at >= ${startDate}
        AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    return {
      summary: {
        totalCost: totalUsage._sum.cost || 0,
        totalTokens: totalUsage._sum.totalTokens || 0,
        totalRequests: totalUsage._count,
      },
      byProvider,
      topUsers,
      dailyCosts,
    }
  },
  {
    requireAuth: true,
  }
)
```

##### **Step 2: Create Cost Dashboard Page**

File: `apps/web/app/admin/ai-usage/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api-client'
import { LoadingSpinner } from '@/components/loading-spinner'

interface UsageData {
  summary: {
    totalCost: number
    totalTokens: number
    totalRequests: number
  }
  byProvider: Array<{
    provider: string
    _sum: { cost: number; totalTokens: number }
    _count: number
  }>
  topUsers: Array<{
    userId: string
    _sum: { cost: number; totalTokens: number }
  }>
  dailyCosts: Array<{
    date: string
    total_cost: number
    total_tokens: number
    request_count: number
  }>
}

export default function AIUsagePage() {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const result = await api.get<UsageData>('/api/admin/ai-usage')
      setData(result)
    } catch (error) {
      console.error('Failed to load usage data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading usage data..." />
  }

  if (!data) {
    return <div>Failed to load data</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">AI Usage & Costs</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${data.summary.totalCost.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {data.summary.totalTokens.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {data.summary.totalRequests.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* By Provider */}
      <Card>
        <CardHeader>
          <CardTitle>Usage by Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.byProvider.map((provider) => (
              <div key={provider.provider} className="flex justify-between">
                <span className="font-medium">{provider.provider}</span>
                <span>${provider._sum.cost?.toFixed(2) || 0}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Users by Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topUsers.map((user, index) => (
              <div key={user.userId} className="flex justify-between">
                <span>#{index + 1} {user.userId.slice(0, 8)}...</span>
                <span>${user._sum.cost?.toFixed(2) || 0}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Deliverables:**
- ✅ `app/api/admin/ai-usage/route.ts` - Analytics API
- ✅ `app/admin/ai-usage/page.tsx` - Cost dashboard
- ✅ Summary cards (total cost, tokens, requests)
- ✅ Provider breakdown
- ✅ Top users by cost

---

### **Story 2.1.3 Summary**

**Completed Tasks:**
1. ✅ Task 2.1.3.1: Create Usage Tracking System (8 hours)
2. ✅ Task 2.1.3.2: Create Cost Dashboard (8 hours)

**Total Time:** 16 hours
**Story Points:** 6 SP

**Files Created/Modified:**
- Updated `prisma/schema.prisma` with AiUsage and CostAlert models
- `lib/ai/usage-tracking.ts` - Usage tracking service
- `lib/ai/service.ts` - Updated with tracking
- `app/api/admin/ai-usage/route.ts` - Analytics API
- `app/admin/ai-usage/page.tsx` - Cost dashboard

**Acceptance Criteria Met:**
- ✅ Token usage tracked per user
- ✅ Cost calculated and stored
- ✅ Cost reports and analytics
- ✅ Alerts on high costs
- ✅ Admin dashboard for monitoring

---

## Epic 2.1 Complete! (20 SP, 48 hours)

**Epic 2.1 Summary:**
- ✅ Story 2.1.1: OpenAI Integration (8 SP, 18h)
- ✅ Story 2.1.2: Anthropic Claude Integration (6 SP, 14h)
- ✅ Story 2.1.3: Token Management & Cost Tracking (6 SP, 16h)

**Total Epic Points:** 20 SP
**Total Epic Hours:** 48 hours

**Sprint 2 Progress:** 20/85 SP complete (23.5%)

**Remaining in Sprint 2:**
- Epic 2.2: Prompt Engineering System (25 SP)
- Epic 2.3: Code Generation Pipeline (20 SP)
- Epic 2.4: Template System (10 SP)
- Epic 2.5: Validation & Testing (10 SP)

---

## Epic 2.2: Prompt Engineering System (25 SP, 60 hours)

**Epic Goal:** Build a sophisticated prompt engineering system that transforms user descriptions into structured prompts for code generation with context management and chain-of-thought reasoning.

**Success Criteria:**
- ✅ Prompt templates for different app types
- ✅ Context extraction from user input
- ✅ Tech stack selection based on requirements
- ✅ Multi-step prompt chains for complex generation
- ✅ Prompt optimization and testing framework

---

### Story 2.2.1: Prompt Template System (10 SP, 24 hours)

**User Story:**
As a **system**, I want **reusable prompt templates** so that **I can generate consistent, high-quality code for different types of applications**.

**Acceptance Criteria (Gherkin):**

```gherkin
Feature: Prompt Template System

  Scenario: Load prompt template
    Given I want to generate a web app
    When I select the "web-app" template
    Then The appropriate prompt template is loaded
    And Placeholders are ready for user input

  Scenario: Customize template with variables
    Given I have a prompt template
    When I provide app description and features
    Then Variables are replaced in template
    And The final prompt is generated
```

**Story Points:** 10 SP
**Estimated Hours:** 24 hours
**Priority:** Critical
**Dependencies:** Epic 2.1

---

#### Task 2.2.1.1: Create Prompt Template Engine (8 hours)

**Implementation Steps:**

**Step 1: Define Template Types and Interfaces (1 hour)**

Create type definitions for the prompt template system.

`apps/web/lib/prompts/types.ts`:
```typescript
// Template variable definition
export interface TemplateVariable {
  name: string
  type: 'string' | 'array' | 'object' | 'boolean' | 'number'
  required: boolean
  default?: unknown
  description: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    enum?: string[]
  }
}

// Template metadata
export interface TemplateMetadata {
  id: string
  name: string
  description: string
  category: 'web-app' | 'mobile-app' | 'api' | 'landing-page' | 'dashboard' | 'e-commerce'
  version: string
  author: string
  tags: string[]
  variables: TemplateVariable[]
  defaultTechStack?: TechStack
}

// Tech stack definition
export interface TechStack {
  frontend?: {
    framework: string
    styling: string
    stateManagement?: string
  }
  backend?: {
    framework: string
    database: string
    orm?: string
  }
  deployment?: {
    platform: string
    ci?: string
  }
}

// Compiled prompt result
export interface CompiledPrompt {
  content: string
  metadata: {
    templateId: string
    variables: Record<string, unknown>
    techStack: TechStack
    compiledAt: Date
  }
  tokens: number
  sections: {
    system: string
    context: string
    requirements: string
    constraints: string
    output: string
  }
}

// Template rendering context
export interface TemplateContext {
  variables: Record<string, unknown>
  techStack: TechStack
  userInput: {
    description: string
    features: string[]
    preferences?: Record<string, unknown>
  }
}

// Template validation result
export interface ValidationResult {
  valid: boolean
  errors: Array<{
    field: string
    message: string
    code: string
  }>
  warnings: Array<{
    field: string
    message: string
  }>
}
```

**Step 2: Create Template Engine Core (3 hours)**

Build the core template engine with variable replacement and validation.

`apps/web/lib/prompts/engine.ts`:
```typescript
import Handlebars from 'handlebars'
import { z } from 'zod'
import {
  TemplateMetadata,
  TemplateContext,
  CompiledPrompt,
  ValidationResult,
  TemplateVariable,
} from './types'
import { countTokens } from '@/lib/ai/tokens'

// Register Handlebars helpers
Handlebars.registerHelper('join', function (array: string[], separator: string) {
  return array.join(separator)
})

Handlebars.registerHelper('json', function (context: unknown) {
  return JSON.stringify(context, null, 2)
})

Handlebars.registerHelper('uppercase', function (str: string) {
  return str.toUpperCase()
})

Handlebars.registerHelper('lowercase', function (str: string) {
  return str.toLowerCase()
})

Handlebars.registerHelper('titlecase', function (str: string) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
})

Handlebars.registerHelper('if_eq', function (a: unknown, b: unknown, options) {
  return a === b ? options.fn(this) : options.inverse(this)
})

Handlebars.registerHelper('formatList', function (items: string[]) {
  return items.map((item, idx) => `${idx + 1}. ${item}`).join('\n')
})

/**
 * Template engine for prompt generation
 */
export class PromptTemplateEngine {
  private templates: Map<string, Handlebars.TemplateDelegate> = new Map()
  private metadata: Map<string, TemplateMetadata> = new Map()

  /**
   * Register a template
   */
  registerTemplate(metadata: TemplateMetadata, template: string): void {
    try {
      const compiled = Handlebars.compile(template, {
        strict: true,
        noEscape: true,
      })

      this.templates.set(metadata.id, compiled)
      this.metadata.set(metadata.id, metadata)
    } catch (error) {
      throw new Error(`Failed to compile template ${metadata.id}: ${error.message}`)
    }
  }

  /**
   * Get template metadata
   */
  getMetadata(templateId: string): TemplateMetadata | undefined {
    return this.metadata.get(templateId)
  }

  /**
   * List all templates
   */
  listTemplates(): TemplateMetadata[] {
    return Array.from(this.metadata.values())
  }

  /**
   * Filter templates by category
   */
  filterTemplates(category?: string, tags?: string[]): TemplateMetadata[] {
    let templates = this.listTemplates()

    if (category) {
      templates = templates.filter((t) => t.category === category)
    }

    if (tags && tags.length > 0) {
      templates = templates.filter((t) => tags.some((tag) => t.tags.includes(tag)))
    }

    return templates
  }

  /**
   * Validate template context
   */
  validateContext(templateId: string, context: Partial<TemplateContext>): ValidationResult {
    const metadata = this.metadata.get(templateId)
    if (!metadata) {
      return {
        valid: false,
        errors: [{ field: 'templateId', message: 'Template not found', code: 'TEMPLATE_NOT_FOUND' }],
        warnings: [],
      }
    }

    const errors: ValidationResult['errors'] = []
    const warnings: ValidationResult['warnings'] = []

    // Validate variables
    for (const variable of metadata.variables) {
      const value = context.variables?.[variable.name]

      // Check required
      if (variable.required && (value === undefined || value === null)) {
        errors.push({
          field: variable.name,
          message: `Variable '${variable.name}' is required`,
          code: 'REQUIRED',
        })
        continue
      }

      // Skip if not provided and not required
      if (value === undefined || value === null) {
        continue
      }

      // Type validation
      const actualType = Array.isArray(value) ? 'array' : typeof value
      if (actualType !== variable.type) {
        errors.push({
          field: variable.name,
          message: `Variable '${variable.name}' must be of type ${variable.type}`,
          code: 'INVALID_TYPE',
        })
        continue
      }

      // Additional validation
      if (variable.validation) {
        const validation = variable.validation

        // String length
        if (variable.type === 'string' && typeof value === 'string') {
          if (validation.min && value.length < validation.min) {
            errors.push({
              field: variable.name,
              message: `Variable '${variable.name}' must be at least ${validation.min} characters`,
              code: 'MIN_LENGTH',
            })
          }
          if (validation.max && value.length > validation.max) {
            errors.push({
              field: variable.name,
              message: `Variable '${variable.name}' must be at most ${validation.max} characters`,
              code: 'MAX_LENGTH',
            })
          }
          if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
            errors.push({
              field: variable.name,
              message: `Variable '${variable.name}' does not match required pattern`,
              code: 'PATTERN_MISMATCH',
            })
          }
        }

        // Array length
        if (variable.type === 'array' && Array.isArray(value)) {
          if (validation.min && value.length < validation.min) {
            errors.push({
              field: variable.name,
              message: `Variable '${variable.name}' must have at least ${validation.min} items`,
              code: 'MIN_ITEMS',
            })
          }
          if (validation.max && value.length > validation.max) {
            errors.push({
              field: variable.name,
              message: `Variable '${variable.name}' must have at most ${validation.max} items`,
              code: 'MAX_ITEMS',
            })
          }
        }

        // Enum validation
        if (validation.enum && !validation.enum.includes(String(value))) {
          errors.push({
            field: variable.name,
            message: `Variable '${variable.name}' must be one of: ${validation.enum.join(', ')}`,
            code: 'INVALID_ENUM',
          })
        }
      }
    }

    // Check user input
    if (!context.userInput?.description || context.userInput.description.trim().length === 0) {
      errors.push({
        field: 'userInput.description',
        message: 'User description is required',
        code: 'REQUIRED',
      })
    }

    if (!context.userInput?.features || context.userInput.features.length === 0) {
      warnings.push({
        field: 'userInput.features',
        message: 'No features provided - generation may be generic',
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Compile template with context
   */
  compile(templateId: string, context: TemplateContext): CompiledPrompt {
    const template = this.templates.get(templateId)
    const metadata = this.metadata.get(templateId)

    if (!template || !metadata) {
      throw new Error(`Template '${templateId}' not found`)
    }

    // Validate context
    const validation = this.validateContext(templateId, context)
    if (!validation.valid) {
      throw new Error(
        `Template validation failed:\n${validation.errors.map((e) => `- ${e.field}: ${e.message}`).join('\n')}`
      )
    }

    // Merge with defaults
    const variables = { ...this.getDefaults(metadata), ...context.variables }
    const techStack = context.techStack || metadata.defaultTechStack || {}

    // Prepare rendering context
    const renderContext = {
      ...variables,
      techStack,
      userInput: context.userInput,
      helpers: {
        hasBackend: !!techStack.backend,
        hasFrontend: !!techStack.frontend,
        hasDatabase: !!techStack.backend?.database,
      },
    }

    // Render template
    const content = template(renderContext)

    // Extract sections (assumes template has section markers)
    const sections = this.extractSections(content)

    // Count tokens
    const tokens = countTokens(content)

    return {
      content,
      metadata: {
        templateId,
        variables,
        techStack,
        compiledAt: new Date(),
      },
      tokens,
      sections,
    }
  }

  /**
   * Get default values for variables
   */
  private getDefaults(metadata: TemplateMetadata): Record<string, unknown> {
    const defaults: Record<string, unknown> = {}

    for (const variable of metadata.variables) {
      if (variable.default !== undefined) {
        defaults[variable.name] = variable.default
      }
    }

    return defaults
  }

  /**
   * Extract sections from compiled prompt
   */
  private extractSections(content: string): CompiledPrompt['sections'] {
    const sections = {
      system: '',
      context: '',
      requirements: '',
      constraints: '',
      output: '',
    }

    // Simple section extraction using markers
    const systemMatch = content.match(/# SYSTEM\n([\s\S]*?)(?=\n# |$)/)
    const contextMatch = content.match(/# CONTEXT\n([\s\S]*?)(?=\n# |$)/)
    const requirementsMatch = content.match(/# REQUIREMENTS\n([\s\S]*?)(?=\n# |$)/)
    const constraintsMatch = content.match(/# CONSTRAINTS\n([\s\S]*?)(?=\n# |$)/)
    const outputMatch = content.match(/# OUTPUT\n([\s\S]*?)(?=\n# |$)/)

    if (systemMatch) sections.system = systemMatch[1].trim()
    if (contextMatch) sections.context = contextMatch[1].trim()
    if (requirementsMatch) sections.requirements = requirementsMatch[1].trim()
    if (constraintsMatch) sections.constraints = constraintsMatch[1].trim()
    if (outputMatch) sections.output = outputMatch[1].trim()

    return sections
  }
}

// Global instance
export const promptEngine = new PromptTemplateEngine()
```

**Step 3: Token Counting Utility (1 hour)**

Create token counting utility for cost estimation.

`apps/web/lib/ai/tokens.ts`:
```typescript
import { encoding_for_model, TiktokenModel } from 'tiktoken'

const DEFAULT_MODEL: TiktokenModel = 'gpt-4'

/**
 * Count tokens in text
 */
export function countTokens(text: string, model: TiktokenModel = DEFAULT_MODEL): number {
  try {
    const encoding = encoding_for_model(model)
    const tokens = encoding.encode(text)
    encoding.free()
    return tokens.length
  } catch (error) {
    // Fallback: rough estimate (1 token ≈ 4 characters)
    return Math.ceil(text.length / 4)
  }
}

/**
 * Count tokens in messages
 */
export function countMessageTokens(
  messages: Array<{ role: string; content: string }>,
  model: TiktokenModel = DEFAULT_MODEL
): number {
  try {
    const encoding = encoding_for_model(model)
    let totalTokens = 0

    for (const message of messages) {
      // Message overhead: 4 tokens per message
      totalTokens += 4

      // Role
      totalTokens += encoding.encode(message.role).length

      // Content
      totalTokens += encoding.encode(message.content).length
    }

    // Additional 2 tokens for assistant reply priming
    totalTokens += 2

    encoding.free()
    return totalTokens
  } catch (error) {
    // Fallback
    const totalText = messages.map((m) => m.role + m.content).join('')
    return Math.ceil(totalText.length / 4)
  }
}

/**
 * Estimate cost from tokens
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
  }

  const prices = pricing[model] || pricing['gpt-4-turbo-preview']
  const inputCost = (inputTokens / 1000) * prices.input
  const outputCost = (outputTokens / 1000) * prices.output

  return inputCost + outputCost
}

/**
 * Truncate text to fit token limit
 */
export function truncateToTokens(
  text: string,
  maxTokens: number,
  model: TiktokenModel = DEFAULT_MODEL
): string {
  try {
    const encoding = encoding_for_model(model)
    const tokens = encoding.encode(text)

    if (tokens.length <= maxTokens) {
      encoding.free()
      return text
    }

    const truncatedTokens = tokens.slice(0, maxTokens)
    const decoded = new TextDecoder().decode(encoding.decode(truncatedTokens))
    encoding.free()

    return decoded + '...'
  } catch (error) {
    // Fallback: character-based truncation
    const approxChars = maxTokens * 4
    return text.slice(0, approxChars) + '...'
  }
}
```

**Step 4: Create Template Loader (2 hours)**

Build template loader to load templates from filesystem or database.

`apps/web/lib/prompts/loader.ts`:
```typescript
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { TemplateMetadata } from './types'
import { promptEngine } from './engine'

/**
 * Load templates from filesystem
 */
export async function loadTemplatesFromFiles(templatesDir: string): Promise<void> {
  try {
    const files = await readdir(templatesDir)
    const templateFiles = files.filter((f) => f.endsWith('.hbs') || f.endsWith('.txt'))

    for (const file of templateFiles) {
      const filePath = path.join(templatesDir, file)
      const content = await readFile(filePath, 'utf-8')

      // Parse frontmatter for metadata
      const { data, content: templateContent } = matter(content)

      const metadata: TemplateMetadata = {
        id: data.id || path.basename(file, path.extname(file)),
        name: data.name || file,
        description: data.description || '',
        category: data.category || 'web-app',
        version: data.version || '1.0.0',
        author: data.author || 'System',
        tags: data.tags || [],
        variables: data.variables || [],
        defaultTechStack: data.defaultTechStack,
      }

      promptEngine.registerTemplate(metadata, templateContent)
    }

    console.log(`Loaded ${templateFiles.length} templates from ${templatesDir}`)
  } catch (error) {
    console.error('Failed to load templates:', error)
    throw error
  }
}

/**
 * Load templates from database
 */
export async function loadTemplatesFromDB(prisma: any): Promise<void> {
  try {
    const templates = await prisma.promptTemplate.findMany({
      where: { active: true },
      orderBy: { version: 'desc' },
    })

    for (const template of templates) {
      const metadata: TemplateMetadata = {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        version: template.version,
        author: template.author,
        tags: template.tags,
        variables: template.variables,
        defaultTechStack: template.defaultTechStack,
      }

      promptEngine.registerTemplate(metadata, template.content)
    }

    console.log(`Loaded ${templates.length} templates from database`)
  } catch (error) {
    console.error('Failed to load templates from DB:', error)
    throw error
  }
}

/**
 * Initialize template system
 */
export async function initializeTemplates(): Promise<void> {
  const templatesDir = path.join(process.cwd(), 'lib', 'prompts', 'templates')

  try {
    await loadTemplatesFromFiles(templatesDir)
  } catch (error) {
    console.warn('Could not load templates from files, skipping:', error.message)
  }
}
```

**Step 5: Install Dependencies (30 minutes)**

Add required packages to `apps/web/package.json`:
```json
{
  "dependencies": {
    "handlebars": "^4.7.8",
    "tiktoken": "^1.0.10",
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "@types/handlebars": "^4.1.0"
  }
}
```

Run installation:
```bash
cd apps/web && pnpm install
```

**Step 6: Testing (30 minutes)**

`apps/web/lib/prompts/__tests__/engine.test.ts`:
```typescript
import { describe, test, expect, beforeEach } from 'vitest'
import { PromptTemplateEngine } from '../engine'
import { TemplateMetadata, TemplateContext } from '../types'

describe('PromptTemplateEngine', () => {
  let engine: PromptTemplateEngine

  beforeEach(() => {
    engine = new PromptTemplateEngine()
  })

  test('should register and compile simple template', () => {
    const metadata: TemplateMetadata = {
      id: 'test-template',
      name: 'Test Template',
      description: 'A test template',
      category: 'web-app',
      version: '1.0.0',
      author: 'Test',
      tags: ['test'],
      variables: [
        {
          name: 'appName',
          type: 'string',
          required: true,
          description: 'Application name',
        },
      ],
    }

    const template = `# SYSTEM
You are building an app called {{appName}}.

# REQUIREMENTS
{{userInput.description}}`

    engine.registerTemplate(metadata, template)

    const context: TemplateContext = {
      variables: { appName: 'MyApp' },
      techStack: {},
      userInput: {
        description: 'A todo list application',
        features: ['add tasks', 'complete tasks'],
      },
    }

    const result = engine.compile('test-template', context)

    expect(result.content).toContain('MyApp')
    expect(result.content).toContain('A todo list application')
    expect(result.tokens).toBeGreaterThan(0)
  })

  test('should validate required variables', () => {
    const metadata: TemplateMetadata = {
      id: 'test-required',
      name: 'Test Required',
      description: 'Test required variables',
      category: 'web-app',
      version: '1.0.0',
      author: 'Test',
      tags: [],
      variables: [
        {
          name: 'requiredVar',
          type: 'string',
          required: true,
          description: 'A required variable',
        },
      ],
    }

    engine.registerTemplate(metadata, 'Test {{requiredVar}}')

    const context: TemplateContext = {
      variables: {},
      techStack: {},
      userInput: {
        description: 'Test',
        features: [],
      },
    }

    expect(() => engine.compile('test-required', context)).toThrow()
  })

  test('should use default values', () => {
    const metadata: TemplateMetadata = {
      id: 'test-defaults',
      name: 'Test Defaults',
      description: 'Test default values',
      category: 'web-app',
      version: '1.0.0',
      author: 'Test',
      tags: [],
      variables: [
        {
          name: 'theme',
          type: 'string',
          required: false,
          default: 'light',
          description: 'UI theme',
        },
      ],
    }

    engine.registerTemplate(metadata, 'Theme: {{theme}}')

    const context: TemplateContext = {
      variables: {},
      techStack: {},
      userInput: {
        description: 'Test',
        features: [],
      },
    }

    const result = engine.compile('test-defaults', context)
    expect(result.content).toContain('Theme: light')
  })

  test('should handle Handlebars helpers', () => {
    const metadata: TemplateMetadata = {
      id: 'test-helpers',
      name: 'Test Helpers',
      description: 'Test Handlebars helpers',
      category: 'web-app',
      version: '1.0.0',
      author: 'Test',
      tags: [],
      variables: [],
    }

    const template = `
Features:
{{formatList userInput.features}}

{{#if helpers.hasBackend}}
Has backend
{{/if}}
`

    engine.registerTemplate(metadata, template)

    const context: TemplateContext = {
      variables: {},
      techStack: {
        backend: {
          framework: 'Next.js',
          database: 'PostgreSQL',
        },
      },
      userInput: {
        description: 'Test',
        features: ['Feature 1', 'Feature 2'],
      },
    }

    const result = engine.compile('test-helpers', context)
    expect(result.content).toContain('1. Feature 1')
    expect(result.content).toContain('2. Feature 2')
    expect(result.content).toContain('Has backend')
  })

  test('should filter templates by category', () => {
    const templates: TemplateMetadata[] = [
      {
        id: 'web-1',
        name: 'Web 1',
        description: '',
        category: 'web-app',
        version: '1.0.0',
        author: 'Test',
        tags: ['react'],
        variables: [],
      },
      {
        id: 'mobile-1',
        name: 'Mobile 1',
        description: '',
        category: 'mobile-app',
        version: '1.0.0',
        author: 'Test',
        tags: ['react-native'],
        variables: [],
      },
    ]

    templates.forEach((metadata) => {
      engine.registerTemplate(metadata, 'Test')
    })

    const webTemplates = engine.filterTemplates('web-app')
    expect(webTemplates).toHaveLength(1)
    expect(webTemplates[0].id).toBe('web-1')

    const reactTemplates = engine.filterTemplates(undefined, ['react'])
    expect(reactTemplates).toHaveLength(1)
    expect(reactTemplates[0].id).toBe('web-1')
  })
})
```

**Deliverables:**
- ✅ `lib/prompts/types.ts` - Type definitions
- ✅ `lib/prompts/engine.ts` - Template engine with Handlebars
- ✅ `lib/ai/tokens.ts` - Token counting utilities
- ✅ `lib/prompts/loader.ts` - Template loader
- ✅ `lib/prompts/__tests__/engine.test.ts` - Unit tests
- ✅ Dependencies installed

---

#### Task 2.2.1.2: Build Template Library (10 hours)

**Implementation Steps:**

**Step 1: Create Base Template Structure (2 hours)**

Create the base template that all specific templates will extend.

`apps/web/lib/prompts/templates/_base.hbs`:
```handlebars
---
id: base
name: Base Template
description: Base template for all code generation
category: web-app
version: 1.0.0
author: BTRMe System
tags: [base]
variables: []
---

# SYSTEM

You are an expert software engineer specializing in modern web development. You write clean, maintainable, production-ready code following industry best practices.

Your expertise includes:
- Modern JavaScript/TypeScript
- React and Next.js
- RESTful and GraphQL APIs
- Database design and optimization
- Security best practices
- Performance optimization
- Testing (unit, integration, e2e)
- Accessibility (WCAG 2.1)

You always:
- Write type-safe code
- Include proper error handling
- Add helpful comments for complex logic
- Follow the project's coding standards
- Consider edge cases
- Think about scalability and performance

# CONTEXT

**Project Type:** {{userInput.description}}

**Tech Stack:**
{{#if techStack.frontend}}
- Frontend: {{techStack.frontend.framework}} with {{techStack.frontend.styling}}
{{#if techStack.frontend.stateManagement}}
- State Management: {{techStack.frontend.stateManagement}}
{{/if}}
{{/if}}

{{#if techStack.backend}}
- Backend: {{techStack.backend.framework}}
- Database: {{techStack.backend.database}}
{{#if techStack.backend.orm}}
- ORM: {{techStack.backend.orm}}
{{/if}}
{{/if}}

{{#if techStack.deployment}}
- Deployment: {{techStack.deployment.platform}}
{{/if}}

**Key Features:**
{{formatList userInput.features}}

{{#if userInput.preferences}}
**User Preferences:**
{{json userInput.preferences}}
{{/if}}

# REQUIREMENTS

Generate a complete, production-ready implementation with:

1. **Full Source Code**
   - All necessary files with complete implementation
   - No placeholders or TODOs
   - Proper file organization

2. **Type Safety**
   - TypeScript types/interfaces for all data structures
   - Proper type annotations
   - Zod schemas for validation

3. **Error Handling**
   - Try-catch blocks where appropriate
   - User-friendly error messages
   - Proper error logging

4. **Security**
   - Input validation and sanitization
   - SQL injection prevention
   - XSS protection
   - CSRF tokens where needed
   - Secure authentication/authorization

5. **Testing**
   - Example unit tests for key functions
   - Integration test examples
   - Test data and mocks

6. **Documentation**
   - JSDoc comments for functions
   - README with setup instructions
   - API documentation if applicable

# CONSTRAINTS

- Use only the specified tech stack
- Follow Next.js 14 App Router conventions
- Use Server Components by default, Client Components when needed
- Implement proper loading and error states
- Ensure mobile responsiveness
- Follow accessibility guidelines (WCAG 2.1 AA)
- Keep bundle size reasonable
- Optimize for Core Web Vitals

# OUTPUT

Provide the implementation in the following structure:

## 1. File Structure
```
Show the complete directory structure
```

## 2. Source Code

For each file, provide:

### `path/to/file.ts`
```typescript
// Complete file contents
```

## 3. Database Schema (if applicable)

```prisma
// Prisma schema
```

## 4. Configuration Files

Any necessary config files (tsconfig.json, .env.example, etc.)

## 5. Setup Instructions

Step-by-step instructions to run the project

## 6. Testing

Example test cases and how to run them

## 7. Deployment Notes

Any important deployment considerations
```

**Step 2: Create Web App Template (2 hours)**

`apps/web/lib/prompts/templates/web-app.hbs`:
```handlebars
---
id: web-app
name: Web Application
description: Full-stack web application with Next.js
category: web-app
version: 1.0.0
author: BTRMe System
tags: [nextjs, react, web, fullstack]
variables:
  - name: appName
    type: string
    required: true
    description: Name of the application
  - name: authRequired
    type: boolean
    required: false
    default: true
    description: Whether authentication is required
  - name: databaseType
    type: string
    required: false
    default: postgresql
    description: Database type
    validation:
      enum: [postgresql, mysql, mongodb, sqlite]
  - name: deploymentTarget
    type: string
    required: false
    default: vercel
    description: Deployment platform
    validation:
      enum: [vercel, netlify, fly.io, aws, gcp]
defaultTechStack:
  frontend:
    framework: Next.js 14
    styling: Tailwind CSS
    stateManagement: React Context
  backend:
    framework: Next.js API Routes
    database: PostgreSQL
    orm: Prisma
  deployment:
    platform: Vercel
---

# SYSTEM

You are an expert Next.js developer building production-ready web applications. You specialize in the Next.js 14 App Router, React Server Components, and modern full-stack development.

# CONTEXT

**Application Name:** {{appName}}

**Application Description:** {{userInput.description}}

**Database:** {{databaseType}}

**Authentication Required:** {{#if authRequired}}Yes{{else}}No{{/if}}

**Deployment Target:** {{deploymentTarget}}

**Tech Stack:**
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Database: {{databaseType}}
{{#if_eq databaseType "postgresql"}}
- ORM: Prisma
{{/if_eq}}
{{#if_eq databaseType "mongodb"}}
- ODM: Mongoose
{{/if_eq}}
{{#if authRequired}}
- Auth: NextAuth.js v5
{{/if}}

**Required Features:**
{{formatList userInput.features}}

# REQUIREMENTS

Create a complete Next.js 14 web application with:

## Architecture
- App Router with Server Components by default
- Client Components only where interactivity is needed
- API Routes for backend logic
- Middleware for auth and request processing
- Proper data fetching with React Suspense

## Pages & Routes
Generate pages for each feature including:
- Home page (/)
- Feature-specific pages
{{#if authRequired}}
- Authentication pages (/login, /signup)
- Protected user dashboard
{{/if}}
- Error pages (404, 500)

## Components
- Reusable UI components
- Server Components for static content
- Client Components for interactive elements
- Loading skeletons
- Error boundaries

## Data Layer
- Prisma schema with relationships
- Database models for all entities
- CRUD operations
- Data validation with Zod
- Error handling

## API Routes
- RESTful API structure
- Input validation
- Error responses
- Rate limiting considerations
{{#if authRequired}}
- Protected routes with auth checks
{{/if}}

## Styling
- Tailwind CSS utility classes
- Responsive design (mobile-first)
- Dark mode support
- Consistent spacing and colors
- Accessible form inputs

{{#if authRequired}}
## Authentication
- NextAuth.js configuration
- Email/password authentication
- OAuth providers (Google, GitHub)
- Session management
- Protected routes and API endpoints
- Role-based access control if needed
{{/if}}

## Performance
- Image optimization with next/image
- Font optimization
- Code splitting
- Lazy loading
- Caching strategies

## Security
- Environment variables for secrets
- CORS configuration
- Rate limiting
- Input sanitization
- SQL injection prevention
- XSS protection

# CONSTRAINTS

- Use Next.js 14 App Router (not Pages Router)
- Use Server Components by default
- Use 'use client' directive only when necessary
- Follow Next.js file-based routing conventions
- Use TypeScript for all files
- Follow React hooks rules
- Implement proper error boundaries
- Use Suspense for async components
- Follow Tailwind CSS best practices
- Ensure WCAG 2.1 AA compliance

# OUTPUT

## 1. Project Structure

```
{{appName}}/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── api/
│   │   └── [...routes]/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
├── components/
│   ├── ui/
│   ├── forms/
│   └── layouts/
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── validations.ts
├── prisma/
│   └── schema.prisma
├── public/
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 2. Implementation

Provide complete implementation for all files following Next.js 14 best practices.

## 3. Database Setup

```bash
# Commands to set up database
npx prisma generate
npx prisma db push
npx prisma db seed
```

## 4. Environment Variables

```env
# .env.example with all required variables
```

## 5. Installation & Running

```bash
# Step-by-step setup instructions
```

## 6. Testing Examples

Include test examples for:
- API routes
- Server actions
- Utility functions
- Components

## 7. Deployment

Instructions for deploying to {{deploymentTarget}}
```

**Step 3: Create API Template (2 hours)**

`apps/web/lib/prompts/templates/api.hbs`:
```handlebars
---
id: api
name: REST API
description: RESTful API with Next.js API routes
category: api
version: 1.0.0
author: BTRMe System
tags: [api, rest, backend]
variables:
  - name: apiName
    type: string
    required: true
    description: Name of the API
  - name: authType
    type: string
    required: false
    default: jwt
    description: Authentication type
    validation:
      enum: [jwt, api-key, oauth, none]
  - name: resources
    type: array
    required: true
    description: API resources (e.g., users, posts, products)
    validation:
      min: 1
      max: 10
defaultTechStack:
  backend:
    framework: Next.js API Routes
    database: PostgreSQL
    orm: Prisma
---

# SYSTEM

You are an expert backend developer specializing in RESTful API design. You build secure, scalable, well-documented APIs following REST principles and industry best practices.

# CONTEXT

**API Name:** {{apiName}}

**Description:** {{userInput.description}}

**Authentication:** {{authType}}

**Resources:** {{join resources ", "}}

**Tech Stack:**
- Framework: Next.js 14 API Routes
- Language: TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Validation: Zod
{{#if_eq authType "jwt"}}
- Auth: JWT with NextAuth.js
{{/if_eq}}

**Required Features:**
{{formatList userInput.features}}

# REQUIREMENTS

Create a complete REST API with:

## API Design
- RESTful endpoint structure
- Proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Consistent response format
- Pagination for list endpoints
- Filtering and sorting
- Versioning strategy (v1, v2)

## Endpoints
For each resource in {{json resources}}, create:
- GET /api/v1/{resource} - List all
- GET /api/v1/{resource}/{id} - Get one
- POST /api/v1/{resource} - Create
- PUT /api/v1/{resource}/{id} - Update (full)
- PATCH /api/v1/{resource}/{id} - Update (partial)
- DELETE /api/v1/{resource}/{id} - Delete

## Request/Response
- JSON request bodies
- JSON responses
- Proper status codes
- Error messages with codes
- Request validation
- Response serialization

## Authentication & Authorization
{{#if_eq authType "jwt"}}
- JWT token generation
- Token verification middleware
- Refresh token mechanism
- Password hashing
{{/if_eq}}
{{#if_eq authType "api-key"}}
- API key generation
- API key validation
- Rate limiting per key
{{/if_eq}}
{{#if_eq authType "oauth"}}
- OAuth 2.0 flow
- Token exchange
- Scope validation
{{/if_eq}}
- Protected routes
- Role-based access control

## Data Validation
- Zod schemas for all inputs
- Type-safe validation
- Custom validation rules
- Detailed error messages

## Error Handling
- Global error handler
- Custom error classes
- Consistent error format
- Error logging
- Stack traces in development only

## Database
- Prisma schema with relationships
- Indexes for performance
- Unique constraints
- Default values
- Cascading deletes

## Performance
- Database query optimization
- Response caching
- Rate limiting
- Query result pagination
- Connection pooling

## Documentation
- OpenAPI/Swagger specification
- Endpoint descriptions
- Request/response examples
- Authentication instructions
- Error code reference

# CONSTRAINTS

- Follow REST principles
- Use proper HTTP status codes
- Implement HATEOAS if applicable
- Use TypeScript for type safety
- Validate all inputs
- Never expose sensitive data
- Log all errors
- Rate limit all endpoints
- Use database transactions where needed
- Follow security best practices (OWASP)

# OUTPUT

## 1. API Structure

```
api/
├── v1/
│   ├── {resource}/
│   │   ├── route.ts (GET, POST)
│   │   └── [id]/
│   │       └── route.ts (GET, PUT, PATCH, DELETE)
│   └── auth/
│       ├── login/route.ts
│       ├── register/route.ts
│       └── refresh/route.ts
└── middleware.ts
```

## 2. Complete Implementation

Provide full code for:
- All API routes
- Middleware
- Database models
- Validation schemas
- Error handlers
- Utilities

## 3. Database Schema

Complete Prisma schema with relationships

## 4. API Documentation

OpenAPI/Swagger specification

## 5. Testing

Example tests for all endpoints

## 6. Usage Examples

curl examples for each endpoint
```
**Step 4: Create Landing Page Template (2 hours)**

`apps/web/lib/prompts/templates/landing-page.hbs`:
```handlebars
---
id: landing-page
name: Landing Page
description: Marketing landing page with conversion focus
category: landing-page
version: 1.0.0
author: BTRMe System
tags: [landing, marketing, conversion]
variables:
  - name: productName
    type: string
    required: true
    description: Product or service name
  - name: cta
    type: string
    required: true
    description: Primary call-to-action text
  - name: sections
    type: array
    required: false
    default: [hero, features, pricing, testimonials, cta, footer]
    description: Page sections to include
defaultTechStack:
  frontend:
    framework: Next.js 14
    styling: Tailwind CSS
  deployment:
    platform: Vercel
---

# SYSTEM

You are an expert frontend developer specializing in high-converting landing pages. You build beautiful, responsive, accessible pages that drive user action.

# CONTEXT

**Product Name:** {{productName}}

**Description:** {{userInput.description}}

**Call to Action:** {{cta}}

**Sections:** {{join sections ", "}}

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- React Hook Form (forms)

**Key Features to Highlight:**
{{formatList userInput.features}}

# REQUIREMENTS

Create a modern, conversion-optimized landing page with:

## Sections

### Hero Section
- Attention-grabbing headline
- Compelling subheadline
- Primary CTA button
- Hero image or video
- Social proof (logos, stats)

### Features Section
- Feature grid or list
- Icons for each feature
- Clear benefit statements
- Supporting imagery

### Pricing Section
- Pricing tiers
- Feature comparison
- Highlight recommended plan
- CTA buttons for each tier

### Testimonials Section
- Customer quotes
- Photos and names
- Company/role information
- Star ratings

### FAQ Section
- Common questions
- Expandable answers
- Clear, helpful responses

### Final CTA Section
- Strong call to action
- Urgency or scarcity if appropriate
- Risk reversal (guarantee, free trial)

### Footer
- Links to legal pages
- Social media links
- Contact information
- Newsletter signup

## Design
- Modern, clean aesthetic
- Consistent color scheme
- Professional typography
- Whitespace for readability
- High-quality images
- Smooth animations
- Mobile-first responsive

## Conversion Optimization
- Clear value proposition
- Prominent CTAs
- Social proof elements
- Trust indicators
- Minimal friction
- Fast loading time
- A/B test ready

## Technical
- Server Components for static content
- Client Components for interactive elements
- Optimized images (next/image)
- SEO meta tags
- Structured data (JSON-LD)
- Open Graph tags
- Analytics ready

## Forms
- Email capture
- Validation
- Loading states
- Success messages
- Error handling
- Spam protection

## Performance
- Core Web Vitals optimized
- Lazy loading
- Image optimization
- Font optimization
- Minimal JavaScript
- CSS optimization

# CONSTRAINTS

- Mobile-first approach
- Page load under 2 seconds
- Accessibility (WCAG 2.1 AA)
- Cross-browser compatibility
- No jQuery or legacy dependencies
- Semantic HTML
- SEO friendly
- Privacy compliant (GDPR, CCPA)

# OUTPUT

## 1. Page Structure

Complete component tree for the landing page

## 2. Implementation

Full code for:
- Page component
- Section components
- UI components
- Forms
- Animations
- Styles

## 3. Assets

List required:
- Images
- Icons
- Fonts

## 4. SEO & Meta

- Title and description
- Meta tags
- Structured data
- Sitemap

## 5. Analytics

Integration points for:
- Google Analytics
- Facebook Pixel
- Conversion tracking

## 6. Performance

Optimization checklist and lighthouse score targets
```

**Step 5: Create Dashboard Template (2 hours)**

`apps/web/lib/prompts/templates/dashboard.hbs`:
```handlebars
---
id: dashboard
name: Admin Dashboard
description: Data visualization and management dashboard
category: dashboard
version: 1.0.0
author: BTRMe System
tags: [dashboard, admin, analytics, data-viz]
variables:
  - name: dashboardName
    type: string
    required: true
    description: Name of the dashboard
  - name: dataEntities
    type: array
    required: true
    description: Entities to manage (e.g., users, orders, products)
    validation:
      min: 1
      max: 10
  - name: charts
    type: array
    required: false
    default: [line, bar, pie, area]
    description: Chart types needed
defaultTechStack:
  frontend:
    framework: Next.js 14
    styling: Tailwind CSS
    stateManagement: React Context
  backend:
    framework: Next.js API Routes
    database: PostgreSQL
    orm: Prisma
---

# SYSTEM

You are an expert in building data-rich admin dashboards. You create intuitive, performant interfaces for data visualization and management.

# CONTEXT

**Dashboard Name:** {{dashboardName}}

**Description:** {{userInput.description}}

**Entities:** {{join dataEntities ", "}}

**Charts:** {{join charts ", "}}

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts (data visualization)
- TanStack Table (data tables)
- React Hook Form
- Zod validation

**Features:**
{{formatList userInput.features}}

# REQUIREMENTS

Create a comprehensive admin dashboard with:

## Layout
- Sidebar navigation
- Top bar with user menu
- Main content area
- Responsive design
- Collapsible sidebar on mobile

## Dashboard Overview
- Key metrics cards
- Charts and graphs
- Recent activity feed
- Quick actions

## Data Management
For each entity in {{json dataEntities}}:
- List view with data table
- Create form
- Edit form
- Delete confirmation
- Bulk actions
- Search and filter
- Sorting
- Pagination
- Export to CSV/Excel

## Data Tables
- TanStack Table implementation
- Column sorting
- Column filtering
- Column visibility toggle
- Row selection
- Bulk actions
- Pagination controls
- Loading states
- Empty states

## Charts & Visualizations
Generate {{join charts ", "}} charts:
- Responsive sizing
- Interactive tooltips
- Legend
- Color-coded data
- Real-time updates
- Date range filters

## Forms
- Dynamic forms for each entity
- Field validation
- Error messages
- Auto-save drafts
- File uploads
- Rich text editor if needed
- Multi-step forms for complex data

## Authentication & Permissions
- Protected routes
- Role-based access control
- Permission checks
- Admin-only features

## Real-time Updates
- WebSocket or polling
- Live data updates
- Notifications
- Activity feed

## Search
- Global search
- Entity-specific search
- Fuzzy matching
- Search suggestions
- Recent searches

## Settings
- User profile management
- Preferences
- API key management
- Team management
- Audit logs

# CONSTRAINTS

- Server Components for data fetching
- Client Components for interactivity
- Optimistic UI updates
- Error boundaries
- Loading states for all async operations
- Keyboard navigation support
- Screen reader friendly
- Print styles
- Mobile responsive

# OUTPUT

## 1. Dashboard Structure

Complete component architecture

## 2. Implementation

Full code for:
- Layout components
- Page components
- Data table components
- Chart components
- Form components
- API routes
- Database queries

## 3. Data Models

Prisma schema for all entities

## 4. Authentication

NextAuth configuration

## 5. Utilities

Helpers for:
- Data formatting
- Validation
- Permissions
- Exports

## 6. Styling

Tailwind configuration and custom styles
```

**Step 6: Create E-commerce Template (2 hours)**

`apps/web/lib/prompts/templates/e-commerce.hbs`:
```handlebars
---
id: e-commerce
name: E-commerce Store
description: Full-featured online store with cart and checkout
category: e-commerce
version: 1.0.0
author: BTRMe System
tags: [ecommerce, store, shop, cart, checkout]
variables:
  - name: storeName
    type: string
    required: true
    description: Name of the store
  - name: paymentProvider
    type: string
    required: false
    default: stripe
    description: Payment processing provider
    validation:
      enum: [stripe, paypal, square]
  - name: shippingRequired
    type: boolean
    required: false
    default: true
    description: Whether physical shipping is required
  - name: inventory
    type: boolean
    required: false
    default: true
    description: Track inventory
defaultTechStack:
  frontend:
    framework: Next.js 14
    styling: Tailwind CSS
    stateManagement: Zustand
  backend:
    framework: Next.js API Routes
    database: PostgreSQL
    orm: Prisma
  deployment:
    platform: Vercel
---

# SYSTEM

You are an expert e-commerce developer. You build secure, conversion-optimized online stores with seamless checkout experiences.

# CONTEXT

**Store Name:** {{storeName}}

**Description:** {{userInput.description}}

**Payment Provider:** {{paymentProvider}}

**Shipping Required:** {{#if shippingRequired}}Yes{{else}}No{{/if}}

**Inventory Tracking:** {{#if inventory}}Yes{{else}}No{{/if}}

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Prisma + PostgreSQL
{{#if_eq paymentProvider "stripe"}}
- Stripe (payments)
{{/if_eq}}
{{#if_eq paymentProvider "paypal"}}
- PayPal SDK
{{/if_eq}}
- Resend (email)

**Features:**
{{formatList userInput.features}}

# REQUIREMENTS

Create a complete e-commerce platform with:

## Product Catalog
- Product listing page
- Product detail pages
- Product images (multiple)
- Product variants (size, color)
- Product reviews
- Product search
- Category navigation
- Filters (price, category, rating)
- Sorting options
{{#if inventory}}
- Stock status display
- Low stock warnings
{{/if}}

## Shopping Cart
- Add to cart
- Update quantity
- Remove items
- Cart persistence
- Cart preview
- Subtotal calculation
- Tax calculation
{{#if shippingRequired}}
- Shipping calculation
{{/if}}
- Discount codes
- Cart abandonment tracking

## Checkout
- Multi-step checkout
- Guest checkout option
- Shipping address
{{#if shippingRequired}}
- Shipping method selection
- Shipping cost calculation
{{/if}}
- Payment processing
- Order confirmation
- Email receipts
- Order tracking

## Payment Integration
{{#if_eq paymentProvider "stripe"}}
- Stripe Elements
- Card payment
- Digital wallets (Apple Pay, Google Pay)
- 3D Secure (SCA)
- Webhook handling
- Refund processing
{{/if_eq}}
{{#if_eq paymentProvider "paypal"}}
- PayPal Smart Buttons
- PayPal Checkout Flow
- Order capture
- Webhook handling
{{/if_eq}}

## User Account
- Registration
- Login
- Order history
- Saved addresses
- Saved payment methods
- Wishlist
- Account settings

## Admin Panel
- Product management
- Order management
- Customer management
- Inventory management
- Analytics dashboard
- Sales reports

## Email Notifications
- Order confirmation
- Shipping updates
- Delivery confirmation
- Review requests
- Abandoned cart reminders

## SEO & Marketing
- Product page SEO
- Structured data
- Social sharing
- Email capture
- Newsletter signup
- Related products
- Upsells and cross-sells

## Security
- PCI compliance
- Secure checkout
- Fraud detection
- Rate limiting
- CSRF protection
- Input validation

# CONSTRAINTS

- Server Components for product pages
- Client Components for cart and checkout
- Optimistic UI for cart operations
- Proper error handling for payments
- Transaction safety (database transactions)
- Handle concurrent orders
- Prevent overselling
- Secure payment data (never store cards)
- GDPR compliance
- Mobile responsive
- Fast page loads

# OUTPUT

## 1. Store Structure

Complete app architecture

## 2. Implementation

Full code for:
- Product pages
- Cart system
- Checkout flow
- Payment integration
- Admin panel
- Email templates

## 3. Database Schema

Prisma schema for:
- Products
- Orders
- Customers
- Inventory
- Reviews

## 4. Payment Setup

{{paymentProvider}} configuration

## 5. Testing

Test cases for:
- Cart operations
- Checkout flow
- Payment processing
- Order fulfillment

## 6. Deployment

Production checklist:
- Environment variables
- Webhook endpoints
- Email setup
- Payment testing
- Go-live checklist
```

**Deliverables:**
- ✅ `lib/prompts/templates/_base.hbs` - Base template
- ✅ `lib/prompts/templates/web-app.hbs` - Web application
- ✅ `lib/prompts/templates/api.hbs` - REST API
- ✅ `lib/prompts/templates/landing-page.hbs` - Landing page
- ✅ `lib/prompts/templates/dashboard.hbs` - Admin dashboard
- ✅ `lib/prompts/templates/e-commerce.hbs` - E-commerce store

---

#### Task 2.2.1.3: Create Template API and Integration (4 hours)

**Implementation Steps:**

**Step 1: Create Template API Routes (2 hours)**

`apps/web/app/api/templates/route.ts`:
```typescript
import { apiHandler } from '@/lib/api/handler'
import { promptEngine } from '@/lib/prompts/engine'
import { z } from 'zod'

const querySchema = z.object({
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// GET /api/templates - List all templates
export const GET = apiHandler(
  async (req) => {
    const url = new URL(req.url)
    const category = url.searchParams.get('category') || undefined
    const tags = url.searchParams.getAll('tag')

    const templates = promptEngine.filterTemplates(category, tags.length > 0 ? tags : undefined)

    return {
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        tags: t.tags,
        variables: t.variables,
      })),
    }
  },
  {
    requireAuth: true,
  }
)
```

`apps/web/app/api/templates/[id]/route.ts`:
```typescript
import { apiHandler } from '@/lib/api/handler'
import { promptEngine } from '@/lib/prompts/engine'

// GET /api/templates/:id - Get template details
export const GET = apiHandler(
  async (req, { params }) => {
    const templateId = params.id

    const metadata = promptEngine.getMetadata(templateId)

    if (!metadata) {
      throw new Error('Template not found')
    }

    return { template: metadata }
  },
  {
    requireAuth: true,
  }
)
```

`apps/web/app/api/templates/compile/route.ts`:
```typescript
import { apiHandler } from '@/lib/api/handler'
import { promptEngine } from '@/lib/prompts/engine'
import { z } from 'zod'

const compileSchema = z.object({
  templateId: z.string(),
  variables: z.record(z.unknown()).optional(),
  techStack: z
    .object({
      frontend: z
        .object({
          framework: z.string(),
          styling: z.string(),
          stateManagement: z.string().optional(),
        })
        .optional(),
      backend: z
        .object({
          framework: z.string(),
          database: z.string(),
          orm: z.string().optional(),
        })
        .optional(),
      deployment: z
        .object({
          platform: z.string(),
          ci: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  userInput: z.object({
    description: z.string().min(10),
    features: z.array(z.string()),
    preferences: z.record(z.unknown()).optional(),
  }),
})

// POST /api/templates/compile - Compile a template
export const POST = apiHandler(
  async (req, { body }) => {
    const result = promptEngine.compile(body!.templateId, {
      variables: body!.variables || {},
      techStack: body!.techStack || {},
      userInput: body!.userInput,
    })

    return {
      prompt: result.content,
      metadata: result.metadata,
      tokens: result.tokens,
      sections: result.sections,
    }
  },
  {
    requireAuth: true,
    bodySchema: compileSchema,
  }
)
```

**Step 2: Create Frontend Hook (1 hour)**

`apps/web/hooks/use-templates.ts`:
```typescript
'use client'

import { useState, useCallback } from 'react'
import { api } from '@/lib/api-client'
import type { TemplateMetadata, CompiledPrompt, TemplateContext } from '@/lib/prompts/types'

export function useTemplates() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const listTemplates = useCallback(async (category?: string, tags?: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (tags) tags.forEach((tag) => params.append('tag', tag))

      const result = await api.get<{ templates: TemplateMetadata[] }>(
        `/api/templates?${params.toString()}`
      )

      return result.templates
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const getTemplate = useCallback(async (templateId: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.get<{ template: TemplateMetadata }>(`/api/templates/${templateId}`)
      return result.template
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const compileTemplate = useCallback(
    async (templateId: string, context: Omit<TemplateContext, 'techStack'> & { techStack?: any }) => {
      setLoading(true)
      setError(null)

      try {
        const result = await api.post<{
          prompt: string
          metadata: any
          tokens: number
          sections: any
        }>('/api/templates/compile', {
          templateId,
          ...context,
        })

        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    listTemplates,
    getTemplate,
    compileTemplate,
    loading,
    error,
  }
}
```

**Step 3: Initialize Templates on Startup (30 minutes)**

`apps/web/app/layout.tsx`:
```typescript
import { initializeTemplates } from '@/lib/prompts/loader'

// Initialize templates when app starts
initializeTemplates().catch((error) => {
  console.error('Failed to initialize templates:', error)
})

export default function RootLayout({ children }: { children: React.Node }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

**Step 4: Testing (30 minutes)**

`apps/web/__tests__/api/templates.test.ts`:
```typescript
import { describe, test, expect } from 'vitest'
import { promptEngine } from '@/lib/prompts/engine'
import { TemplateMetadata, TemplateContext } from '@/lib/prompts/types'

describe('Template API Integration', () => {
  test('should compile web-app template', () => {
    // Register a simple web-app template
    const metadata: TemplateMetadata = {
      id: 'test-web-app',
      name: 'Test Web App',
      description: 'Test template',
      category: 'web-app',
      version: '1.0.0',
      author: 'Test',
      tags: ['test'],
      variables: [
        {
          name: 'appName',
          type: 'string',
          required: true,
          description: 'App name',
        },
      ],
    }

    const template = `# SYSTEM
Building {{appName}}

# REQUIREMENTS
{{userInput.description}}`

    promptEngine.registerTemplate(metadata, template)

    const context: TemplateContext = {
      variables: { appName: 'TodoApp' },
      techStack: {},
      userInput: {
        description: 'A todo list application',
        features: ['Add tasks', 'Complete tasks'],
      },
    }

    const result = promptEngine.compile('test-web-app', context)

    expect(result.content).toContain('TodoApp')
    expect(result.content).toContain('A todo list application')
    expect(result.tokens).toBeGreaterThan(0)
  })

  test('should filter templates by category', () => {
    const webTemplates = promptEngine.filterTemplates('web-app')
    expect(webTemplates.length).toBeGreaterThan(0)
    expect(webTemplates.every((t) => t.category === 'web-app')).toBe(true)
  })
})
```

**Deliverables:**
- ✅ `app/api/templates/route.ts` - List templates API
- ✅ `app/api/templates/[id]/route.ts` - Get template API
- ✅ `app/api/templates/compile/route.ts` - Compile template API
- ✅ `hooks/use-templates.ts` - Frontend hook
- ✅ Template initialization on startup
- ✅ Integration tests

---

### **Story 2.2.1 Summary**

**Completed Tasks:**
1. ✅ Task 2.2.1.1: Create Prompt Template Engine (8 hours)
2. ✅ Task 2.2.1.2: Build Template Library (10 hours)
3. ✅ Task 2.2.1.3: Create Template API and Integration (4 hours)

**Total Time:** 22 hours (rounded to 24 hours = 10 SP)
**Story Points:** 10 SP

**Files Created/Modified:**
- `lib/prompts/types.ts` - Type definitions
- `lib/prompts/engine.ts` - Template engine core
- `lib/prompts/loader.ts` - Template loading system
- `lib/ai/tokens.ts` - Token counting utilities
- `lib/prompts/templates/_base.hbs` - Base template
- `lib/prompts/templates/web-app.hbs` - Web app template
- `lib/prompts/templates/api.hbs` - API template
- `lib/prompts/templates/landing-page.hbs` - Landing page template
- `lib/prompts/templates/dashboard.hbs` - Dashboard template
- `lib/prompts/templates/e-commerce.hbs` - E-commerce template
- `app/api/templates/route.ts` - List templates API
- `app/api/templates/[id]/route.ts` - Get template API
- `app/api/templates/compile/route.ts` - Compile template API
- `hooks/use-templates.ts` - React hook for templates
- `lib/prompts/__tests__/engine.test.ts` - Engine tests
- `__tests__/api/templates.test.ts` - API tests

**Acceptance Criteria Met:**
- ✅ Load prompt template for different app types
- ✅ Customize template with variables
- ✅ Replace placeholders with user input
- ✅ Generate final prompt ready for AI
- ✅ Validate template variables
- ✅ Support multiple template categories
- ✅ Token counting for cost estimation

**Next Story:**
→ Story 2.2.2: Context Extraction System (8 SP, 18 hours)

---
### Story 2.2.2: Context Extraction System (8 SP, 18 hours)

**User Story:**
As a **system**, I want to **extract structured context from natural language input** so that **I can better understand user requirements and generate relevant code**.

**Acceptance Criteria (Gherkin):**

```gherkin
Feature: Context Extraction

  Scenario: Extract features from description
    Given A user provides app description
    When The system analyzes the text
    Then Key features are identified
    And Feature list is returned

  Scenario: Detect technical requirements
    Given A description mentions specific technologies
    When The system processes the input
    Then Technical requirements are extracted
    And Tech stack suggestions are generated

  Scenario: Identify app category
    Given A project description
    When Context extraction runs
    Then App category is determined
    And Appropriate template is suggested
```

**Story Points:** 8 SP
**Estimated Hours:** 18 hours
**Priority:** High
**Dependencies:** Story 2.2.1

---

#### Task 2.2.2.1: Build NLP Context Analyzer (8 hours)

**Implementation Steps:**

**Step 1: Create Context Analyzer Types (1 hour)**

`apps/web/lib/context/types.ts`:
```typescript
export interface UserInput {
  description: string
  additionalInfo?: string
  targetAudience?: string
  budget?: string
  timeline?: string
}

export interface ExtractedContext {
  appType: AppType
  features: Feature[]
  technicalRequirements: TechnicalRequirement[]
  entities: Entity[]
  userRoles: string[]
  integrations: string[]
  scalability: ScalabilityRequirement
  security: SecurityRequirement
  confidence: number
}

export type AppType =
  | 'web-app'
  | 'mobile-app'
  | 'api'
  | 'landing-page'
  | 'dashboard'
  | 'e-commerce'
  | 'blog'
  | 'portfolio'
  | 'saas'
  | 'marketplace'

export interface Feature {
  name: string
  description: string
  priority: 'must-have' | 'should-have' | 'nice-to-have'
  category: 'authentication' | 'data-management' | 'ui' | 'integration' | 'other'
  estimatedComplexity: 'simple' | 'medium' | 'complex'
}

export interface TechnicalRequirement {
  type: 'database' | 'authentication' | 'payment' | 'email' | 'storage' | 'api' | 'realtime'
  description: string
  suggested: string[]
}

export interface Entity {
  name: string
  attributes: string[]
  relationships: Array<{
    entity: string
    type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  }>
}

export interface ScalabilityRequirement {
  expectedUsers: 'small' | 'medium' | 'large' | 'enterprise'
  growthRate: 'slow' | 'moderate' | 'rapid'
  dataVolume: 'low' | 'medium' | 'high'
}

export interface SecurityRequirement {
  authenticationRequired: boolean
  sensitiveData: boolean
  complianceNeeds: string[]
  dataPrivacy: 'basic' | 'moderate' | 'strict'
}
```

**Step 2: Create Keyword-based Analyzer (3 hours)**

`apps/web/lib/context/analyzer.ts`:
```typescript
import type {
  UserInput,
  ExtractedContext,
  AppType,
  Feature,
  TechnicalRequirement,
  Entity,
} from './types'

/**
 * Keyword patterns for app type detection
 */
const APP_TYPE_PATTERNS: Record<AppType, string[]> = {
  'e-commerce': ['shop', 'store', 'cart', 'checkout', 'product', 'inventory', 'payment'],
  'dashboard': ['dashboard', 'admin', 'analytics', 'metrics', 'chart', 'report', 'data visualization'],
  'landing-page': ['landing', 'marketing', 'lead', 'conversion', 'cta', 'sign up', 'waitlist'],
  'api': ['api', 'rest', 'graphql', 'endpoint', 'webhook', 'integration'],
  'blog': ['blog', 'post', 'article', 'cms', 'content', 'publish'],
  'saas': ['subscription', 'tenant', 'billing', 'plan', 'tier', 'saas'],
  'marketplace': ['marketplace', 'seller', 'buyer', 'listing', 'booking'],
  'web-app': ['web app', 'application', 'platform', 'system'],
  'mobile-app': ['mobile', 'ios', 'android', 'app'],
  'portfolio': ['portfolio', 'showcase', 'gallery', 'projects'],
}

/**
 * Feature keywords and categories
 */
const FEATURE_KEYWORDS: Record<string, { category: Feature['category']; priority: Feature['priority'] }> = {
  // Authentication
  login: { category: 'authentication', priority: 'must-have' },
  signup: { category: 'authentication', priority: 'must-have' },
  'sign up': { category: 'authentication', priority: 'must-have' },
  'sign in': { category: 'authentication', priority: 'must-have' },
  auth: { category: 'authentication', priority: 'must-have' },
  oauth: { category: 'authentication', priority: 'should-have' },
  '2fa': { category: 'authentication', priority: 'should-have' },
  'two-factor': { category: 'authentication', priority: 'should-have' },

  // Data Management
  crud: { category: 'data-management', priority: 'must-have' },
  create: { category: 'data-management', priority: 'must-have' },
  edit: { category: 'data-management', priority: 'must-have' },
  delete: { category: 'data-management', priority: 'must-have' },
  search: { category: 'data-management', priority: 'should-have' },
  filter: { category: 'data-management', priority: 'should-have' },
  sort: { category: 'data-management', priority: 'should-have' },
  export: { category: 'data-management', priority: 'nice-to-have' },
  import: { category: 'data-management', priority: 'nice-to-have' },

  // UI
  responsive: { category: 'ui', priority: 'must-have' },
  mobile: { category: 'ui', priority: 'should-have' },
  'dark mode': { category: 'ui', priority: 'nice-to-have' },
  animations: { category: 'ui', priority: 'nice-to-have' },
  notifications: { category: 'ui', priority: 'should-have' },
  toast: { category: 'ui', priority: 'nice-to-have' },

  // Integration
  payment: { category: 'integration', priority: 'must-have' },
  stripe: { category: 'integration', priority: 'should-have' },
  email: { category: 'integration', priority: 'should-have' },
  sms: { category: 'integration', priority: 'nice-to-have' },
  'third-party': { category: 'integration', priority: 'should-have' },
}

/**
 * Technical requirement patterns
 */
const TECH_REQUIREMENT_PATTERNS: Record<
  TechnicalRequirement['type'],
  {
    keywords: string[]
    suggestions: string[]
  }
> = {
  database: {
    keywords: ['database', 'data', 'store', 'persist', 'save'],
    suggestions: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite'],
  },
  authentication: {
    keywords: ['auth', 'login', 'signup', 'user', 'account'],
    suggestions: ['NextAuth.js', 'Auth0', 'Clerk', 'Supabase Auth'],
  },
  payment: {
    keywords: ['payment', 'checkout', 'billing', 'subscription', 'stripe', 'paypal'],
    suggestions: ['Stripe', 'PayPal', 'Square'],
  },
  email: {
    keywords: ['email', 'notification', 'mail', 'send'],
    suggestions: ['Resend', 'SendGrid', 'AWS SES', 'Mailgun'],
  },
  storage: {
    keywords: ['upload', 'file', 'image', 'storage', 'media'],
    suggestions: ['AWS S3', 'Cloudinary', 'Vercel Blob', 'Uploadthing'],
  },
  api: {
    keywords: ['api', 'rest', 'graphql', 'endpoint'],
    suggestions: ['Next.js API Routes', 'tRPC', 'GraphQL', 'REST'],
  },
  realtime: {
    keywords: ['realtime', 'live', 'websocket', 'push', 'chat'],
    suggestions: ['Socket.io', 'Pusher', 'Ably', 'Supabase Realtime'],
  },
}

/**
 * Extract context from user input
 */
export function extractContext(input: UserInput): ExtractedContext {
  const text = `${input.description} ${input.additionalInfo || ''}`.toLowerCase()

  return {
    appType: detectAppType(text),
    features: extractFeatures(text),
    technicalRequirements: extractTechnicalRequirements(text),
    entities: extractEntities(text),
    userRoles: extractUserRoles(text),
    integrations: extractIntegrations(text),
    scalability: extractScalabilityRequirements(input),
    security: extractSecurityRequirements(text),
    confidence: calculateConfidence(text),
  }
}

/**
 * Detect app type from text
 */
function detectAppType(text: string): AppType {
  const scores: Record<AppType, number> = {
    'web-app': 0,
    'mobile-app': 0,
    'api': 0,
    'landing-page': 0,
    'dashboard': 0,
    'e-commerce': 0,
    'blog': 0,
    'portfolio': 0,
    'saas': 0,
    'marketplace': 0,
  }

  // Score each app type based on keyword matches
  for (const [appType, keywords] of Object.entries(APP_TYPE_PATTERNS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        scores[appType as AppType]++
      }
    }
  }

  // Find highest scoring type
  let maxScore = 0
  let detectedType: AppType = 'web-app'

  for (const [appType, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      detectedType = appType as AppType
    }
  }

  return detectedType
}

/**
 * Extract features from text
 */
function extractFeatures(text: string): Feature[] {
  const features: Feature[] = []
  const words = text.split(/\s+/)

  for (const [keyword, config] of Object.entries(FEATURE_KEYWORDS)) {
    if (text.includes(keyword)) {
      features.push({
        name: keyword,
        description: `User wants ${keyword} functionality`,
        priority: config.priority,
        category: config.category,
        estimatedComplexity: estimateComplexity(keyword),
      })
    }
  }

  // Extract custom features from bullet points or lists
  const bulletRegex = /[-*•]\s*(.+)/g
  let match
  while ((match = bulletRegex.exec(text)) !== null) {
    const featureText = match[1].trim()
    if (featureText.length > 3) {
      features.push({
        name: featureText.substring(0, 50),
        description: featureText,
        priority: 'should-have',
        category: 'other',
        estimatedComplexity: 'medium',
      })
    }
  }

  return features
}

/**
 * Extract technical requirements
 */
function extractTechnicalRequirements(text: string): TechnicalRequirement[] {
  const requirements: TechnicalRequirement[] = []

  for (const [type, config] of Object.entries(TECH_REQUIREMENT_PATTERNS)) {
    const hasKeyword = config.keywords.some((kw) => text.includes(kw))

    if (hasKeyword) {
      requirements.push({
        type: type as TechnicalRequirement['type'],
        description: `Requires ${type} functionality`,
        suggested: config.suggestions,
      })
    }
  }

  return requirements
}

/**
 * Extract entities (data models) from text
 */
function extractEntities(text: string): Entity[] {
  const entities: Entity[] = []

  // Common entity patterns
  const entityPatterns = [
    /\b(user|customer|client|member)s?\b/gi,
    /\b(product|item|listing)s?\b/gi,
    /\b(order|purchase|transaction)s?\b/gi,
    /\b(post|article|blog)s?\b/gi,
    /\b(comment|review|rating)s?\b/gi,
    /\b(category|tag|label)s?\b/gi,
    /\b(payment|subscription|invoice)s?\b/gi,
    /\b(project|task|todo)s?\b/gi,
  ]

  const found = new Set<string>()

  for (const pattern of entityPatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const entity = match[1].toLowerCase()
      if (!found.has(entity)) {
        found.add(entity)
        entities.push({
          name: entity,
          attributes: guessAttributes(entity),
          relationships: guessRelationships(entity, Array.from(found)),
        })
      }
    }
  }

  return entities
}

/**
 * Guess common attributes for an entity
 */
function guessAttributes(entityName: string): string[] {
  const commonAttributes: Record<string, string[]> = {
    user: ['email', 'password', 'name', 'createdAt', 'role'],
    product: ['name', 'description', 'price', 'stock', 'images'],
    order: ['total', 'status', 'items', 'shippingAddress', 'createdAt'],
    post: ['title', 'content', 'authorId', 'publishedAt', 'tags'],
    comment: ['content', 'authorId', 'createdAt', 'postId'],
    category: ['name', 'description', 'slug'],
    payment: ['amount', 'status', 'method', 'transactionId', 'createdAt'],
    project: ['name', 'description', 'status', 'startDate', 'endDate'],
  }

  return commonAttributes[entityName] || ['id', 'createdAt', 'updatedAt']
}

/**
 * Guess relationships between entities
 */
function guessRelationships(
  entityName: string,
  allEntities: string[]
): Entity['relationships'] {
  const relationships: Entity['relationships'] = []

  const relationshipRules: Record<string, Record<string, any>> = {
    user: {
      post: { type: 'one-to-many' },
      order: { type: 'one-to-many' },
      comment: { type: 'one-to-many' },
    },
    product: {
      category: { type: 'one-to-many' },
      order: { type: 'many-to-many' },
    },
    post: {
      user: { type: 'one-to-one' },
      comment: { type: 'one-to-many' },
      category: { type: 'many-to-many' },
    },
    order: {
      user: { type: 'one-to-one' },
      product: { type: 'many-to-many' },
      payment: { type: 'one-to-one' },
    },
  }

  const rules = relationshipRules[entityName]
  if (rules) {
    for (const relatedEntity of allEntities) {
      if (relatedEntity !== entityName && rules[relatedEntity]) {
        relationships.push({
          entity: relatedEntity,
          type: rules[relatedEntity].type,
        })
      }
    }
  }

  return relationships
}

/**
 * Extract user roles from text
 */
function extractUserRoles(text: string): string[] {
  const roles = new Set<string>()

  const rolePatterns = [
    /\b(admin|administrator)s?\b/gi,
    /\b(user|member|customer|client)s?\b/gi,
    /\b(moderator|editor)s?\b/gi,
    /\b(seller|vendor|merchant)s?\b/gi,
    /\b(buyer|shopper)s?\b/gi,
    /\b(manager|supervisor)s?\b/gi,
  ]

  for (const pattern of rolePatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      roles.add(match[1].toLowerCase())
    }
  }

  return Array.from(roles)
}

/**
 * Extract integration requirements
 */
function extractIntegrations(text: string): string[] {
  const integrations = new Set<string>()

  const integrationPatterns: Record<string, RegExp> = {
    Stripe: /\b(stripe|payment)\b/gi,
    PayPal: /\bpaypal\b/gi,
    'Google OAuth': /\b(google|oauth|social login)\b/gi,
    'AWS S3': /\b(s3|aws|file upload|storage)\b/gi,
    SendGrid: /\b(sendgrid|email)\b/gi,
    Twilio: /\b(twilio|sms)\b/gi,
    Pusher: /\b(pusher|realtime|websocket)\b/gi,
  }

  for (const [integration, pattern] of Object.entries(integrationPatterns)) {
    if (pattern.test(text)) {
      integrations.add(integration)
    }
  }

  return Array.from(integrations)
}

/**
 * Extract scalability requirements
 */
function extractScalabilityRequirements(input: UserInput): ExtractedContext['scalability'] {
  const text = `${input.description} ${input.additionalInfo || ''}`.toLowerCase()

  let expectedUsers: 'small' | 'medium' | 'large' | 'enterprise' = 'small'
  let growthRate: 'slow' | 'moderate' | 'rapid' = 'moderate'
  let dataVolume: 'low' | 'medium' | 'high' = 'low'

  // Expected users
  if (text.match(/\b(millions?|enterprise|large scale)\b/)) {
    expectedUsers = 'enterprise'
    dataVolume = 'high'
  } else if (text.match(/\b(thousands?|medium scale)\b/)) {
    expectedUsers = 'medium'
    dataVolume = 'medium'
  } else if (text.match(/\b(hundreds?|small)\b/)) {
    expectedUsers = 'small'
  }

  // Growth rate
  if (text.match(/\b(viral|rapid|fast growth|scaling)\b/)) {
    growthRate = 'rapid'
  } else if (text.match(/\b(slow|steady|gradual)\b/)) {
    growthRate = 'slow'
  }

  return {
    expectedUsers,
    growthRate,
    dataVolume,
  }
}

/**
 * Extract security requirements
 */
function extractSecurityRequirements(text: string): ExtractedContext['security'] {
  let authenticationRequired = false
  let sensitiveData = false
  const complianceNeeds: string[] = []
  let dataPrivacy: 'basic' | 'moderate' | 'strict' = 'basic'

  // Authentication
  if (text.match(/\b(login|signup|auth|user account)\b/)) {
    authenticationRequired = true
  }

  // Sensitive data
  if (text.match(/\b(payment|credit card|health|medical|financial|personal)\b/)) {
    sensitiveData = true
    dataPrivacy = 'strict'
  }

  // Compliance
  if (text.match(/\bgdpr\b/i)) complianceNeeds.push('GDPR')
  if (text.match(/\bhipaa\b/i)) complianceNeeds.push('HIPAA')
  if (text.match(/\bpci\b/i)) complianceNeeds.push('PCI-DSS')
  if (text.match(/\bsoc\s*2\b/i)) complianceNeeds.push('SOC 2')

  if (complianceNeeds.length > 0) {
    dataPrivacy = 'strict'
  }

  return {
    authenticationRequired,
    sensitiveData,
    complianceNeeds,
    dataPrivacy,
  }
}

/**
 * Estimate feature complexity
 */
function estimateComplexity(featureName: string): Feature['estimatedComplexity'] {
  const simpleFeatures = ['login', 'logout', 'search', 'filter', 'sort']
  const complexFeatures = ['payment', 'realtime', 'analytics', 'ml', 'ai']

  if (simpleFeatures.includes(featureName)) return 'simple'
  if (complexFeatures.includes(featureName)) return 'complex'
  return 'medium'
}

/**
 * Calculate confidence score
 */
function calculateConfidence(text: string): number {
  let score = 0

  // Length of description
  const wordCount = text.split(/\s+/).length
  if (wordCount > 50) score += 0.3
  else if (wordCount > 20) score += 0.2
  else score += 0.1

  // Presence of features
  const featureCount = extractFeatures(text).length
  if (featureCount > 5) score += 0.3
  else if (featureCount > 2) score += 0.2
  else score += 0.1

  // Technical details
  const techCount = extractTechnicalRequirements(text).length
  if (techCount > 3) score += 0.2
  else if (techCount > 1) score += 0.1

  // Entities mentioned
  const entityCount = extractEntities(text).length
  if (entityCount > 3) score += 0.2
  else if (entityCount > 1) score += 0.1

  return Math.min(score, 1.0)
}
```

**Step 3: Create AI-Enhanced Analyzer (3 hours)**

`apps/web/lib/context/ai-analyzer.ts`:
```typescript
import { generateCompletion } from '@/lib/ai/service'
import type { UserInput, ExtractedContext } from './types'
import { extractContext } from './analyzer'

/**
 * Use AI to enhance context extraction
 */
export async function aiEnhancedContextExtraction(
  input: UserInput
): Promise<ExtractedContext> {
  // First, get basic extraction
  const basicContext = extractContext(input)

  // Then enhance with AI
  const prompt = `Analyze this app description and extract structured information:

Description: ${input.description}
${input.additionalInfo ? `Additional Info: ${input.additionalInfo}` : ''}

Extract the following in JSON format:
{
  "appType": "one of: web-app, mobile-app, api, landing-page, dashboard, e-commerce, blog, portfolio, saas, marketplace",
  "features": [
    {
      "name": "feature name",
      "description": "detailed description",
      "priority": "must-have | should-have | nice-to-have"
    }
  ],
  "entities": [
    {
      "name": "entity name",
      "attributes": ["attr1", "attr2"],
      "relationships": [{"entity": "relatedEntity", "type": "one-to-many"}]
    }
  ],
  "technicalRequirements": ["requirement1", "requirement2"],
  "userRoles": ["role1", "role2"],
  "integrations": ["integration1", "integration2"]
}

Provide only valid JSON, no explanation.`

  try {
    const result = await generateCompletion(
      [
        {
          role: 'system',
          content:
            'You are an expert business analyst and software architect. Extract structured requirements from descriptions.',
        },
        { role: 'user', content: prompt },
      ],
      {
        temperature: 0.3,
        maxTokens: 2000,
      }
    )

    const aiContext = JSON.parse(result.content)

    // Merge AI results with basic extraction
    return mergeContexts(basicContext, aiContext)
  } catch (error) {
    console.warn('AI context extraction failed, using basic extraction:', error)
    return basicContext
  }
}

/**
 * Merge basic and AI-extracted contexts
 */
function mergeContexts(
  basic: ExtractedContext,
  ai: Partial<ExtractedContext>
): ExtractedContext {
  return {
    appType: ai.appType || basic.appType,
    features: [...basic.features, ...(ai.features || [])].filter(
      (feature, index, self) => index === self.findIndex((f) => f.name === feature.name)
    ),
    technicalRequirements: [
      ...basic.technicalRequirements,
      ...(ai.technicalRequirements || []),
    ],
    entities: [...basic.entities, ...(ai.entities || [])].filter(
      (entity, index, self) => index === self.findIndex((e) => e.name === entity.name)
    ),
    userRoles: Array.from(new Set([...basic.userRoles, ...(ai.userRoles || [])])),
    integrations: Array.from(new Set([...basic.integrations, ...(ai.integrations || [])])),
    scalability: basic.scalability,
    security: basic.security,
    confidence: Math.max(basic.confidence, 0.8), // AI boost confidence
  }
}
```

**Step 4: Create API Route (1 hour)**

`apps/web/app/api/context/extract/route.ts`:
```typescript
import { apiHandler } from '@/lib/api/handler'
import { z } from 'zod'
import { aiEnhancedContextExtraction } from '@/lib/context/ai-analyzer'
import { extractContext } from '@/lib/context/analyzer'

const extractSchema = z.object({
  description: z.string().min(10),
  additionalInfo: z.string().optional(),
  targetAudience: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  useAI: z.boolean().optional().default(true),
})

export const POST = apiHandler(
  async (req, { body }) => {
    const useAI = body!.useAI !== false

    const context = useAI
      ? await aiEnhancedContextExtraction(body!)
      : extractContext(body!)

    return {
      context,
      message: useAI
        ? 'Context extracted using AI enhancement'
        : 'Context extracted using keyword analysis',
    }
  },
  {
    requireAuth: true,
    bodySchema: extractSchema,
    rateLimit: 'generation',
  }
)
```

**Deliverables:**
- ✅ `lib/context/types.ts` - Context types
- ✅ `lib/context/analyzer.ts` - Keyword-based analyzer
- ✅ `lib/context/ai-analyzer.ts` - AI-enhanced analyzer
- ✅ `app/api/context/extract/route.ts` - Context extraction API
- ✅ Feature extraction from natural language
- ✅ Entity detection and relationship inference
- ✅ Technical requirement identification
- ✅ Security and scalability analysis

---

#### Task 2.2.2.2: Create Context Refinement UI (6 hours)

**Implementation Steps:**

**Step 1: Create Context Review Component (3 hours)**

`apps/web/components/context/context-review.tsx`:
```typescript
'use client'

import { useState } from 'react'
import type { ExtractedContext, Feature } from '@/lib/context/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ContextReviewProps {
  context: ExtractedContext
  onUpdate: (context: ExtractedContext) => void
  onConfirm: () => void
}

export function ContextReview({ context, onUpdate, onConfirm }: ContextReviewProps) {
  const [editedContext, setEditedContext] = useState(context)

  const updateFeature = (index: number, updates: Partial<Feature>) => {
    const newFeatures = [...editedContext.features]
    newFeatures[index] = { ...newFeatures[index], ...updates }
    setEditedContext({ ...editedContext, features: newFeatures })
    onUpdate({ ...editedContext, features: newFeatures })
  }

  const removeFeature = (index: number) => {
    const newFeatures = editedContext.features.filter((_, i) => i !== index)
    setEditedContext({ ...editedContext, features: newFeatures })
    onUpdate({ ...editedContext, features: newFeatures })
  }

  const addFeature = () => {
    const newFeature: Feature = {
      name: 'New Feature',
      description: '',
      priority: 'should-have',
      category: 'other',
      estimatedComplexity: 'medium',
    }
    const newFeatures = [...editedContext.features, newFeature]
    setEditedContext({ ...editedContext, features: newFeatures })
    onUpdate({ ...editedContext, features: newFeatures })
  }

  return (
    <div className="space-y-6">
      {/* App Type */}
      <Card>
        <CardHeader>
          <CardTitle>App Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="text-lg">
            {editedContext.appType}
          </Badge>
          <p className="mt-2 text-sm text-muted-foreground">
            Confidence: {(editedContext.confidence * 100).toFixed(0)}%
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Features ({editedContext.features.length})</CardTitle>
          <Button onClick={addFeature} size="sm">
            Add Feature
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {editedContext.features.map((feature, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={feature.name}
                      onChange={(e) =>
                        updateFeature(index, { name: e.target.value })
                      }
                      className="font-medium"
                    />
                    <Input
                      value={feature.description}
                      onChange={(e) =>
                        updateFeature(index, { description: e.target.value })
                      }
                      placeholder="Description"
                    />
                    <div className="flex gap-2">
                      <Badge variant="outline">{feature.priority}</Badge>
                      <Badge variant="outline">{feature.category}</Badge>
                      <Badge variant="outline">{feature.estimatedComplexity}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entities */}
      <Card>
        <CardHeader>
          <CardTitle>Data Entities ({editedContext.entities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {editedContext.entities.map((entity, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium capitalize">{entity.name}</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">Attributes:</p>
                  <div className="flex flex-wrap gap-1">
                    {entity.attributes.map((attr, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {attr}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {editedContext.technicalRequirements.map((req, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium capitalize">{req.type}</p>
                <p className="text-sm text-muted-foreground">{req.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {req.suggested.map((suggestion, i) => (
                    <Badge key={i} variant="outline">
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirm Button */}
      <div className="flex justify-end">
        <Button onClick={onConfirm} size="lg">
          Confirm & Continue
        </Button>
      </div>
    </div>
  )
}
```

**Step 2: Create Context Hook (2 hours)**

`apps/web/hooks/use-context-extraction.ts`:
```typescript
'use client'

import { useState, useCallback } from 'react'
import { api } from '@/lib/api-client'
import type { UserInput, ExtractedContext } from '@/lib/context/types'

export function useContextExtraction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [context, setContext] = useState<ExtractedContext | null>(null)

  const extractContext = useCallback(async (input: UserInput, useAI = true) => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.post<{ context: ExtractedContext }>('/api/context/extract', {
        ...input,
        useAI,
      })

      setContext(result.context)
      return result.context
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateContext = useCallback((newContext: ExtractedContext) => {
    setContext(newContext)
  }, [])

  return {
    extractContext,
    updateContext,
    context,
    loading,
    error,
  }
}
```

**Step 3: Create Test Suite (1 hour)**

`apps/web/__tests__/context/analyzer.test.ts`:
```typescript
import { describe, test, expect } from 'vitest'
import { extractContext } from '@/lib/context/analyzer'
import type { UserInput } from '@/lib/context/types'

describe('Context Analyzer', () => {
  test('should detect e-commerce app type', () => {
    const input: UserInput = {
      description:
        'An online store where users can browse products, add to cart, and checkout with Stripe.',
    }

    const context = extractContext(input)

    expect(context.appType).toBe('e-commerce')
    expect(context.features).toContainEqual(
      expect.objectContaining({
        name: 'cart',
      })
    )
    expect(context.technicalRequirements).toContainEqual(
      expect.objectContaining({
        type: 'payment',
      })
    )
  })

  test('should extract user entities', () => {
    const input: UserInput = {
      description: 'Users can create posts and comment on other users posts.',
    }

    const context = extractContext(input)

    expect(context.entities).toContainEqual(
      expect.objectContaining({
        name: 'user',
      })
    )
    expect(context.entities).toContainEqual(
      expect.objectContaining({
        name: 'post',
      })
    )
    expect(context.entities).toContainEqual(
      expect.objectContaining({
        name: 'comment',
      })
    )
  })

  test('should detect authentication requirement', () => {
    const input: UserInput = {
      description: 'Users need to login to access their dashboard.',
    }

    const context = extractContext(input)

    expect(context.security.authenticationRequired).toBe(true)
    expect(context.technicalRequirements).toContainEqual(
      expect.objectContaining({
        type: 'authentication',
      })
    )
  })

  test('should calculate confidence score', () => {
    const input: UserInput = {
      description: `
        Build a comprehensive e-commerce platform where:
        - Users can browse products
        - Add items to cart
        - Checkout with Stripe
        - View order history
        - Track shipments
        - Leave reviews
        - Get email notifications
      `,
    }

    const context = extractContext(input)

    expect(context.confidence).toBeGreaterThan(0.5)
  })
})
```

**Deliverables:**
- ✅ `components/context/context-review.tsx` - Context review UI
- ✅ `hooks/use-context-extraction.ts` - Context extraction hook
- ✅ `__tests__/context/analyzer.test.ts` - Test suite
- ✅ Feature editing and refinement
- ✅ Entity visualization
- ✅ Technical requirement display

---

#### Task 2.2.2.3: Integration with Template System (4 hours)

**Implementation Steps:**

**Step 1: Create Context-to-Template Mapper (2 hours)**

`apps/web/lib/context/template-mapper.ts`:
```typescript
import type { ExtractedContext, AppType } from './types'
import type { TemplateContext, TechStack } from '@/lib/prompts/types'

/**
 * Map extracted context to template context
 */
export function mapContextToTemplate(
  context: ExtractedContext,
  customTechStack?: Partial<TechStack>
): TemplateContext {
  return {
    variables: extractTemplateVariables(context),
    techStack: customTechStack || inferTechStack(context),
    userInput: {
      description: '', // Will be filled from user input
      features: context.features.map((f) => f.name),
      preferences: {
        scalability: context.scalability,
        security: context.security,
      },
    },
  }
}

/**
 * Extract template variables from context
 */
function extractTemplateVariables(context: ExtractedContext): Record<string, unknown> {
  const variables: Record<string, unknown> = {}

  // Common variables
  variables.appName = '' // User will provide
  variables.authRequired = context.security.authenticationRequired

  // App-type specific variables
  switch (context.appType) {
    case 'e-commerce':
      variables.storeName = ''
      variables.paymentProvider = context.integrations.includes('Stripe')
        ? 'stripe'
        : context.integrations.includes('PayPal')
          ? 'paypal'
          : 'stripe'
      variables.shippingRequired = true
      variables.inventory = true
      break

    case 'api':
      variables.apiName = ''
      variables.authType = context.security.authenticationRequired ? 'jwt' : 'none'
      variables.resources = context.entities.map((e) => e.name)
      break

    case 'dashboard':
      variables.dashboardName = ''
      variables.dataEntities = context.entities.map((e) => e.name)
      variables.charts = ['line', 'bar', 'pie']
      break

    case 'landing-page':
      variables.productName = ''
      variables.cta = 'Get Started'
      variables.sections = ['hero', 'features', 'pricing', 'testimonials', 'cta', 'footer']
      break
  }

  return variables
}

/**
 * Infer tech stack from context
 */
function inferTechStack(context: ExtractedContext): TechStack {
  const techStack: TechStack = {
    frontend: {
      framework: 'Next.js 14',
      styling: 'Tailwind CSS',
    },
    backend: {
      framework: 'Next.js API Routes',
      database: inferDatabase(context),
      orm: 'Prisma',
    },
    deployment: {
      platform: 'Vercel',
    },
  }

  // Adjust based on requirements
  const hasRealtime = context.technicalRequirements.some((r) => r.type === 'realtime')
  if (hasRealtime) {
    techStack.frontend!.stateManagement = 'Zustand'
  }

  const hasComplexState = context.features.length > 10
  if (hasComplexState) {
    techStack.frontend!.stateManagement = 'Redux Toolkit'
  }

  return techStack
}

/**
 * Infer database type
 */
function inferDatabase(context: ExtractedContext): string {
  // Check if NoSQL is better suited
  const hasFlexibleSchema = context.entities.some(
    (e) => e.attributes.includes('metadata') || e.attributes.includes('json')
  )

  const hasHighScalability = context.scalability.expectedUsers === 'enterprise'

  if (hasFlexibleSchema) {
    return 'MongoDB'
  }

  if (hasHighScalability && context.scalability.dataVolume === 'high') {
    return 'PostgreSQL' // Better for large-scale OLTP
  }

  return 'PostgreSQL' // Default
}
```

**Step 2: Create End-to-End Flow (2 hours)**

`apps/web/app/generate/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useContextExtraction } from '@/hooks/use-context-extraction'
import { useTemplates } from '@/hooks/use-templates'
import { ContextReview } from '@/components/context/context-review'
import { mapContextToTemplate } from '@/lib/context/template-mapper'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function GeneratePage() {
  const [description, setDescription] = useState('')
  const [step, setStep] = useState<'input' | 'review' | 'generate'>('input')

  const { extractContext, context, updateContext, loading } = useContextExtraction()
  const { compileTemplate } = useTemplates()

  const handleExtract = async () => {
    await extractContext({ description })
    setStep('review')
  }

  const handleConfirm = async () => {
    if (!context) return

    setStep('generate')

    // Map context to template
    const templateContext = mapContextToTemplate(context)
    templateContext.userInput.description = description

    // Get template ID based on app type
    const templateId = context.appType

    // Compile template
    const result = await compileTemplate(templateId, templateContext)

    console.log('Generated prompt:', result)
    // Next: Send to AI for code generation
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-4xl font-bold mb-8">Generate Your App</h1>

      {step === 'input' && (
        <Card className="p-6">
          <label className="block mb-2 font-medium">
            Describe your application:
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Example: I want to build an e-commerce store where users can browse products, add to cart, and checkout with Stripe..."
            rows={8}
            className="mb-4"
          />
          <Button onClick={handleExtract} disabled={loading || description.length < 10}>
            {loading ? 'Analyzing...' : 'Continue'}
          </Button>
        </Card>
      )}

      {step === 'review' && context && (
        <ContextReview
          context={context}
          onUpdate={updateContext}
          onConfirm={handleConfirm}
        />
      )}

      {step === 'generate' && (
        <Card className="p-6">
          <p className="text-lg">Generating your application...</p>
        </Card>
      )}
    </div>
  )
}
```

**Deliverables:**
- ✅ `lib/context/template-mapper.ts` - Context to template mapping
- ✅ `app/generate/page.tsx` - End-to-end generation flow
- ✅ Integration between context extraction and templates
- ✅ Tech stack inference from requirements
- ✅ Template variable population

---

### **Story 2.2.2 Summary**

**Completed Tasks:**
1. ✅ Task 2.2.2.1: Build NLP Context Analyzer (8 hours)
2. ✅ Task 2.2.2.2: Create Context Refinement UI (6 hours)
3. ✅ Task 2.2.2.3: Integration with Template System (4 hours)

**Total Time:** 18 hours
**Story Points:** 8 SP

**Files Created/Modified:**
- `lib/context/types.ts` - Context types and interfaces
- `lib/context/analyzer.ts` - Keyword-based context analyzer
- `lib/context/ai-analyzer.ts` - AI-enhanced analyzer
- `lib/context/template-mapper.ts` - Context to template mapper
- `app/api/context/extract/route.ts` - Context extraction API
- `components/context/context-review.tsx` - Context review UI
- `hooks/use-context-extraction.ts` - Context extraction hook
- `app/generate/page.tsx` - Generation flow page
- `__tests__/context/analyzer.test.ts` - Test suite

**Acceptance Criteria Met:**
- ✅ Extract features from natural language description
- ✅ Detect technical requirements and dependencies
- ✅ Identify app category automatically
- ✅ Suggest appropriate templates
- ✅ Extract data entities and relationships
- ✅ Determine security and scalability needs
- ✅ Provide confidence scores
- ✅ Allow user refinement of extracted context

**Sprint 2 Progress:** 38/85 SP complete (44.7%)

**Next Story:**
→ Story 2.2.3: Tech Stack Recommender (7 SP, 16 hours)

---
