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

