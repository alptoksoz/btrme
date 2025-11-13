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

