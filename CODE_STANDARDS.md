# Code Standards & Best Practices
## BTRMe NoCode AI Builder Platform

**Document Version:** 1.0
**Last Updated:** 2025-11-13
**Owner:** Engineering Team
**Target Audience:** All Engineers, Contributors

---

## Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript Standards](#typescript-standards)
3. [React & Next.js Standards](#react--nextjs-standards)
4. [File Structure & Organization](#file-structure--organization)
5. [Naming Conventions](#naming-conventions)
6. [Code Formatting](#code-formatting)
7. [Error Handling](#error-handling)
8. [API Design Standards](#api-design-standards)
9. [Database Standards](#database-standards)
10. [Performance Guidelines](#performance-guidelines)
11. [Security Best Practices](#security-best-practices)
12. [Testing Standards](#testing-standards)
13. [Documentation Standards](#documentation-standards)
14. [Code Review Guidelines](#code-review-guidelines)

---

## General Principles

### Core Values

1. **Readability Over Cleverness**
   - Write code that's easy to understand
   - Favor explicitness over implicit behavior
   - Use descriptive names
   - Add comments for complex logic

2. **Consistency**
   - Follow established patterns
   - Use consistent naming
   - Maintain uniform code style
   - Follow the "principle of least surprise"

3. **Simplicity**
   - Keep functions small and focused
   - Avoid premature optimization
   - Choose simple solutions over complex ones
   - YAGNI (You Aren't Gonna Need It)

4. **Maintainability**
   - Write tests for all critical code
   - Document non-obvious decisions
   - Avoid tight coupling
   - Make dependencies explicit

5. **Performance-Conscious**
   - Measure before optimizing
   - Avoid N+1 queries
   - Use caching appropriately
   - Lazy load when possible

### Code Ownership

- **Every engineer** is responsible for code quality
- **Code reviews** are mandatory for all changes
- **Tests** must accompany all new features
- **Documentation** should be updated with code changes

---

## TypeScript Standards

### Type Safety

**✅ DO: Use strict TypeScript configuration**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**✅ DO: Define explicit types**

```typescript
// Good
interface User {
  id: string
  email: string
  name: string | null
  createdAt: Date
}

function getUser(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } })
}

// Bad
function getUser(id: any): Promise<any> {
  return prisma.user.findUnique({ where: { id } })
}
```

**✅ DO: Use union types for constrained values**

```typescript
// Good
type Status = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

interface Generation {
  id: string
  status: Status
}

// Bad
interface Generation {
  id: string
  status: string // Too broad
}
```

**❌ DON'T: Use `any` type**

```typescript
// Bad
function processData(data: any) {
  return data.value
}

// Good
interface Data {
  value: string
}

function processData(data: Data) {
  return data.value
}

// If type is truly unknown, use `unknown`
function processUnknown(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value
  }
  throw new Error('Invalid data')
}
```

**✅ DO: Use type guards**

```typescript
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    typeof value.id === 'string' &&
    typeof value.email === 'string'
  )
}

function processUser(data: unknown) {
  if (isUser(data)) {
    // TypeScript knows data is User here
    console.log(data.email)
  }
}
```

### Interfaces vs Types

**✅ DO: Use interfaces for objects**

```typescript
// Good
interface User {
  id: string
  email: string
}

interface Admin extends User {
  permissions: string[]
}
```

**✅ DO: Use types for unions and primitives**

```typescript
// Good
type Status = 'active' | 'inactive' | 'pending'
type ID = string | number
type Nullable<T> = T | null
```

### Generics

**✅ DO: Use descriptive generic names**

```typescript
// Good
interface Repository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>
  save(entity: TEntity): Promise<TEntity>
}

// Bad
interface Repository<T, U> {
  findById(id: U): Promise<T | null>
  save(entity: T): Promise<T>
}
```

**✅ DO: Add constraints to generics**

```typescript
// Good
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    result[key] = obj[key]
  }
  return result
}

// Usage
const user = { id: '1', email: 'test@example.com', name: 'Test' }
const partial = pick(user, ['id', 'email']) // Type-safe
```

### Async/Await

**✅ DO: Use async/await over promises**

```typescript
// Good
async function generateCode(prompt: string): Promise<GenerationResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
    })
    return parseResponse(completion)
  } catch (error) {
    throw new GenerationError('Failed to generate code', { cause: error })
  }
}

// Bad
function generateCode(prompt: string): Promise<GenerationResult> {
  return openai.chat.completions
    .create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
    })
    .then((completion) => parseResponse(completion))
    .catch((error) => {
      throw new GenerationError('Failed to generate code', { cause: error })
    })
}
```

**✅ DO: Use Promise.all for parallel operations**

```typescript
// Good
async function getUserData(userId: string) {
  const [user, projects, generations] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.project.findMany({ where: { userId } }),
    prisma.generation.findMany({ where: { userId } }),
  ])
  return { user, projects, generations }
}

// Bad - Sequential execution
async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const projects = await prisma.project.findMany({ where: { userId } })
  const generations = await prisma.generation.findMany({ where: { userId } })
  return { user, projects, generations }
}
```

---

## React & Next.js Standards

### Component Structure

**✅ DO: Use functional components with hooks**

```typescript
// Good
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function Button({ children, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await onClick()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn('btn', `btn-${variant}`, { 'btn-loading': isLoading })}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  )
}
```

**❌ DON'T: Use class components**

```typescript
// Bad - Use functional components instead
class Button extends React.Component<ButtonProps> {
  render() {
    return <button>{this.props.children}</button>
  }
}
```

### Server Components vs Client Components

**✅ DO: Use Server Components by default (Next.js 14)**

```typescript
// app/projects/page.tsx - Server Component
import { prisma } from '@/lib/db'
import { ProjectCard } from '@/components/projects/project-card'

export default async function ProjectsPage() {
  // Fetch data directly in server component
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

**✅ DO: Use Client Components for interactivity**

```typescript
// components/projects/project-card.tsx
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string | null
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <Button onClick={handleDelete} disabled={isDeleting}>
        Delete
      </Button>
    </Card>
  )
}
```

### Hooks Best Practices

**✅ DO: Create custom hooks for reusable logic**

```typescript
// hooks/use-generation.ts
export function useGeneration(generationId: string) {
  const [generation, setGeneration] = useState<Generation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchGeneration() {
      try {
        const res = await fetch(`/api/generations/${generationId}`)
        if (!res.ok) throw new Error('Failed to fetch generation')
        const data = await res.json()
        if (!cancelled) {
          setGeneration(data)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
          setIsLoading(false)
        }
      }
    }

    fetchGeneration()

    return () => {
      cancelled = true
    }
  }, [generationId])

  return { generation, isLoading, error }
}

// Usage
function GenerationDetail({ id }: { id: string }) {
  const { generation, isLoading, error } = useGeneration(id)

  if (isLoading) return <Spinner />
  if (error) return <Error message={error.message} />
  if (!generation) return <NotFound />

  return <div>{generation.name}</div>
}
```

**✅ DO: Use dependency arrays correctly**

```typescript
// Good
useEffect(() => {
  fetchData(userId)
}, [userId]) // Only re-run when userId changes

// Bad - Missing dependencies
useEffect(() => {
  fetchData(userId)
}, []) // eslint will warn about missing userId

// Bad - Too many dependencies
useEffect(() => {
  fetchData(userId)
}, [userId, userEmail, userName]) // Re-runs unnecessarily
```

**✅ DO: Cleanup effects**

```typescript
// Good
useEffect(() => {
  const controller = new AbortController()

  async function fetchData() {
    try {
      const res = await fetch('/api/data', {
        signal: controller.signal,
      })
      const data = await res.json()
      setData(data)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err)
      }
    }
  }

  fetchData()

  return () => {
    controller.abort()
  }
}, [])
```

### Component Composition

**✅ DO: Use composition over prop drilling**

```typescript
// Good - Using composition
function GenerationPage() {
  return (
    <GenerationProvider>
      <GenerationHeader />
      <GenerationContent />
      <GenerationActions />
    </GenerationProvider>
  )
}

function GenerationHeader() {
  const { generation } = useGenerationContext()
  return <h1>{generation.name}</h1>
}

// Bad - Prop drilling
function GenerationPage({ generation }: { generation: Generation }) {
  return (
    <>
      <GenerationHeader generation={generation} />
      <GenerationContent generation={generation} />
      <GenerationActions generation={generation} />
    </>
  )
}
```

---

## File Structure & Organization

### Project Structure

```
apps/web/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/               # Route group for auth pages
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/          # Route group for dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── projects/
│   ├── api/                  # API routes
│   │   ├── auth/
│   │   ├── projects/
│   │   └── generations/
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ui/                   # Base UI components (shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── generation/           # Feature-specific components
│   │   ├── generation-form.tsx
│   │   ├── generation-status.tsx
│   │   └── code-preview.tsx
│   └── layouts/              # Layout components
│       ├── header.tsx
│       └── sidebar.tsx
├── lib/                      # Shared utilities and logic
│   ├── ai/                   # AI service layer
│   │   ├── openai-client.ts
│   │   ├── anthropic-client.ts
│   │   └── service.ts
│   ├── db/                   # Database utilities
│   │   ├── client.ts
│   │   └── queries.ts
│   ├── api/                  # API helpers
│   │   ├── handler.ts
│   │   └── middleware.ts
│   └── utils.ts              # General utilities
├── hooks/                    # Custom React hooks
│   ├── use-generation.ts
│   └── use-user.ts
├── types/                    # TypeScript types
│   ├── api.ts
│   └── models.ts
└── __tests__/                # Tests
    ├── unit/
    ├── integration/
    └── e2e/
```

### File Naming Conventions

**✅ DO: Use kebab-case for files**

```
✅ generation-form.tsx
✅ use-generation.ts
✅ openai-client.ts

❌ GenerationForm.tsx
❌ useGeneration.ts
❌ OpenAIClient.ts
```

**✅ DO: Use descriptive names**

```
✅ user-authentication-service.ts
✅ project-list-component.tsx

❌ service.ts
❌ component.tsx
❌ utils.ts (too generic)
```

### Import Organization

**✅ DO: Order imports logically**

```typescript
// 1. External dependencies
import { useState, useEffect } from 'react'
import { prisma } from '@prisma/client'
import { z } from 'zod'

// 2. Internal modules (absolute imports)
import { Button } from '@/components/ui/button'
import { generateCode } from '@/lib/codegen/service'
import { useGeneration } from '@/hooks/use-generation'

// 3. Types
import type { Generation, Project } from '@/types/models'

// 4. Relative imports
import { helper } from './utils'
import styles from './styles.module.css'
```

**✅ DO: Use absolute imports**

```typescript
// Good
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db/client'

// Bad
import { Button } from '../../../components/ui/button'
import { prisma } from '../../lib/db/client'
```

---

## Naming Conventions

### Variables

**✅ DO: Use camelCase for variables**

```typescript
const userId = 'user_123'
const generationCount = 42
const isLoading = true
```

**✅ DO: Use descriptive names**

```typescript
// Good
const activeUserCount = users.filter((u) => u.status === 'active').length
const totalGenerationCost = generations.reduce((sum, g) => sum + g.cost, 0)

// Bad
const count = users.filter((u) => u.status === 'active').length
const total = generations.reduce((sum, g) => sum + g.cost, 0)
```

**✅ DO: Use boolean prefixes**

```typescript
const isLoading = true
const hasError = false
const canEdit = user.role === 'admin'
const shouldRetry = attemptCount < MAX_RETRIES
```

### Functions

**✅ DO: Use verb prefixes**

```typescript
function getUser(id: string): User | null
function createProject(data: ProjectInput): Promise<Project>
function updateGeneration(id: string, data: Partial<Generation>): Promise<void>
function deleteProject(id: string): Promise<void>
function validateInput(input: unknown): boolean
function calculateCost(tokens: number): number
```

**✅ DO: Name async functions clearly**

```typescript
async function fetchUserData(id: string): Promise<User>
async function saveProject(project: Project): Promise<void>
```

### Components

**✅ DO: Use PascalCase for components**

```typescript
function Button({ children }: { children: React.ReactNode }) {
  return <button>{children}</button>
}

function GenerationForm() {
  return <form>...</form>
}
```

**✅ DO: Name event handlers consistently**

```typescript
function LoginForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle submission
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleEmailChange} />
    </form>
  )
}
```

### Constants

**✅ DO: Use UPPER_SNAKE_CASE for constants**

```typescript
const MAX_RETRIES = 3
const API_BASE_URL = 'https://api.btrme.com'
const DEFAULT_TIMEOUT = 30000

const GENERATION_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const
```

---

## Code Formatting

### Prettier Configuration

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### ESLint Configuration

```javascript
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'prefer-const': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
}
```

### Line Length

**✅ DO: Keep lines under 100 characters**

```typescript
// Good
const result = await generateCode({
  templateId,
  context,
  options: { temperature: 0.7 },
})

// Bad
const result = await generateCode({ templateId, context, options: { temperature: 0.7, maxTokens: 4000, topP: 1.0 } })
```

---

## Error Handling

### Custom Error Classes

**✅ DO: Create specific error types**

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR')
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class GenerationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(message, 500, 'GENERATION_ERROR')
  }
}
```

### Error Handling Patterns

**✅ DO: Handle errors at appropriate levels**

```typescript
// Service layer - Throw specific errors
async function getProject(id: string): Promise<Project> {
  const project = await prisma.project.findUnique({ where: { id } })

  if (!project) {
    throw new NotFoundError('Project')
  }

  return project
}

// API route - Catch and return appropriate response
export const GET = apiHandler(async (req, { params }) => {
  try {
    const project = await getProject(params.id)
    return NextResponse.json({ project })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    throw error // Let global handler deal with it
  }
})
```

**✅ DO: Use Result types for expected failures**

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

async function generateCode(prompt: string): Promise<Result<GenerationResult>> {
  try {
    const result = await openai.chat.completions.create({ ... })
    return { success: true, data: parseResult(result) }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

// Usage
const result = await generateCode(prompt)
if (result.success) {
  console.log(result.data)
} else {
  console.error(result.error)
}
```

### Error Logging

**✅ DO: Log errors with context**

```typescript
import * as Sentry from '@sentry/nextjs'

async function generateCode(userId: string, prompt: string) {
  try {
    return await performGeneration(prompt)
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        operation: 'code_generation',
        userId,
      },
      extra: {
        prompt: prompt.slice(0, 100), // First 100 chars
        timestamp: new Date().toISOString(),
      },
    })
    throw new GenerationError('Failed to generate code', { cause: error })
  }
}
```

---

## API Design Standards

### RESTful API Conventions

**✅ DO: Use standard HTTP methods**

```typescript
// GET - Retrieve resources
export async function GET(req: NextRequest) {
  const projects = await prisma.project.findMany()
  return NextResponse.json({ projects })
}

// POST - Create resource
export async function POST(req: NextRequest) {
  const body = await req.json()
  const project = await prisma.project.create({ data: body })
  return NextResponse.json({ project }, { status: 201 })
}

// PATCH - Partial update
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: body,
  })
  return NextResponse.json({ project })
}

// DELETE - Remove resource
export async function DELETE(req: NextRequest) {
  await prisma.project.delete({ where: { id: req.params.id } })
  return NextResponse.json({ success: true }, { status: 204 })
}
```

### Request Validation

**✅ DO: Validate all inputs with Zod**

```typescript
import { z } from 'zod'

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  templateId: z.string().cuid(),
  visibility: z.enum(['private', 'public']).default('private'),
})

export const POST = apiHandler(
  async (req, { body }) => {
    // body is already validated
    const project = await prisma.project.create({ data: body })
    return NextResponse.json({ project }, { status: 201 })
  },
  {
    requireAuth: true,
    bodySchema: createProjectSchema,
  }
)
```

### Response Format

**✅ DO: Use consistent response structure**

```typescript
// Success response
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-13T10:00:00Z",
    "requestId": "req_123"
  }
}

// Error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  },
  "meta": {
    "timestamp": "2025-11-13T10:00:00Z",
    "requestId": "req_123"
  }
}

// Paginated response
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Database Standards

### Prisma Schema Conventions

**✅ DO: Use snake_case for table names**

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  projects   Project[]
  generations Generation[]

  @@map("users")
}
```

**✅ DO: Add indexes for frequently queried fields**

```prisma
model Project {
  id     String @id @default(cuid())
  userId String
  status Status @default(DRAFT)

  @@index([userId])
  @@index([status])
  @@index([userId, status])
  @@map("projects")
}
```

### Query Optimization

**✅ DO: Use select to fetch only needed fields**

```typescript
// Good
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
})

// Bad - Fetches all fields including large ones
const users = await prisma.user.findMany()
```

**✅ DO: Use transactions for multiple operations**

```typescript
// Good
await prisma.$transaction(async (tx) => {
  const project = await tx.project.create({ data: projectData })
  await tx.generation.create({
    data: {
      projectId: project.id,
      userId: project.userId,
      ...generationData,
    },
  })
})

// Bad - Separate operations, no atomicity
const project = await prisma.project.create({ data: projectData })
await prisma.generation.create({ data: generationData })
```

---

## Performance Guidelines

### Frontend Performance

**✅ DO: Use dynamic imports for large components**

```typescript
import dynamic from 'next/dynamic'

const CodeEditor = dynamic(() => import('@/components/editor/code-editor'), {
  loading: () => <Spinner />,
  ssr: false,
})
```

**✅ DO: Optimize images**

```typescript
import Image from 'next/image'

function ProjectCard({ project }: { project: Project }) {
  return (
    <Image
      src={project.thumbnail}
      alt={project.name}
      width={400}
      height={300}
      placeholder="blur"
      blurDataURL={project.blurDataURL}
    />
  )
}
```

**✅ DO: Implement caching**

```typescript
import { cache } from 'react'

// Cache for entire request
export const getUser = cache(async (id: string) => {
  return prisma.user.findUnique({ where: { id } })
})

// Redis caching
export async function getTemplates() {
  const cached = await redis.get('templates:all')
  if (cached) return JSON.parse(cached)

  const templates = await prisma.promptTemplate.findMany()
  await redis.setex('templates:all', 3600, JSON.stringify(templates))
  return templates
}
```

### Backend Performance

**✅ DO: Use connection pooling**

```typescript
// lib/db/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**✅ DO: Implement rate limiting**

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(req: NextRequest) {
  const ip = req.ip ?? 'anonymous'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  return NextResponse.next()
}
```

---

## Security Best Practices

### Input Sanitization

**✅ DO: Sanitize all user input**

```typescript
import DOMPurify from 'isomorphic-dompurify'

function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
  })
}
```

### SQL Injection Prevention

**✅ DO: Use Prisma parameterized queries**

```typescript
// Good - Prisma handles escaping
const user = await prisma.user.findUnique({
  where: { email: userInput },
})

// Bad - Never construct raw SQL with user input
const user = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}` // DON'T DO THIS
```

### Authentication

**✅ DO: Use NextAuth.js for authentication**

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new AuthenticationError()
  }

  return session.user
}
```

---

## Testing Standards

### Test Structure

**✅ DO: Follow AAA pattern (Arrange, Act, Assert)**

```typescript
describe('calculateCost', () => {
  test('should calculate cost for GPT-4', () => {
    // Arrange
    const model = 'gpt-4-turbo-preview'
    const inputTokens = 1000
    const outputTokens = 500

    // Act
    const cost = calculateCost(model, inputTokens, outputTokens)

    // Assert
    expect(cost).toBe(0.025)
  })
})
```

---

## Documentation Standards

### Code Comments

**✅ DO: Document why, not what**

```typescript
// Good
// Use exponential backoff to avoid rate limits during high traffic
const delay = Math.min(1000 * 2 ** attemptCount, 30000)

// Bad
// Wait for delay milliseconds
await sleep(delay)
```

### JSDoc for Public APIs

**✅ DO: Add JSDoc for exported functions**

```typescript
/**
 * Generates code based on a prompt and template.
 *
 * @param options - Generation options
 * @param options.templateId - Template to use for generation
 * @param options.context - Context variables for the template
 * @param options.userId - User ID for tracking and billing
 * @returns Promise resolving to generation result
 * @throws {GenerationError} If generation fails
 * @throws {ValidationError} If input is invalid
 *
 * @example
 * ```typescript
 * const result = await generateCode({
 *   templateId: 'web-app',
 *   context: { appName: 'MyApp' },
 *   userId: 'user_123'
 * })
 * ```
 */
export async function generateCode(options: GenerationOptions): Promise<GenerationResult> {
  // ...
}
```

---

## Code Review Guidelines

### Review Checklist

- [ ] Code follows style guide
- [ ] Tests are included and pass
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Error handling is appropriate
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] Types are correct
- [ ] Edge cases handled

### Review Comments

**✅ DO: Be constructive and specific**

```
❌ "This is wrong"
✅ "Consider using Promise.all here to run these operations in parallel, which would reduce execution time by ~50%"

❌ "Bad naming"
✅ "Consider renaming `data` to `userProjects` to make the variable's purpose clearer"
```

---

## Conclusion

Following these code standards ensures:
- Consistent, readable codebase
- Easier onboarding for new engineers
- Fewer bugs and security issues
- Better performance
- Maintainable code

**Remember:** Standards are guidelines, not rigid rules. Use judgment when exceptions make sense, but document the reasoning.

---

**Document Owner:** Engineering Team
**Review Cadence:** Quarterly
**Last Review:** 2025-11-13
**Next Review:** 2026-02-13
