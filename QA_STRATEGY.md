# QA Strategy & Testing Methodology
## BTRMe NoCode AI Builder Platform

**Document Version:** 1.0
**Last Updated:** 2025-11-13
**Owner:** Engineering Team
**Target Audience:** Engineers, QA Engineers, Product Team

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Pyramid](#testing-pyramid)
3. [Unit Testing Strategy](#unit-testing-strategy)
4. [Integration Testing Strategy](#integration-testing-strategy)
5. [End-to-End Testing Strategy](#end-to-end-testing-strategy)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [API Testing](#api-testing)
9. [AI Model Testing](#ai-model-testing)
10. [Test Coverage Requirements](#test-coverage-requirements)
11. [QA Process & Workflows](#qa-process--workflows)
12. [Bug Tracking & Management](#bug-tracking--management)
13. [CI/CD Integration](#cicd-integration)
14. [Quality Metrics & KPIs](#quality-metrics--kpis)
15. [Testing Tools & Infrastructure](#testing-tools--infrastructure)
16. [Best Practices](#best-practices)

---

## Testing Philosophy

### Core Principles

**1. Shift-Left Testing**
- Testing begins at the design phase, not after development
- Developers write tests alongside code
- Automated tests run on every commit
- Faster feedback loops reduce bug fix costs

**2. Test Automation First**
- Automate repetitive tests to maximize efficiency
- Manual testing reserved for exploratory and usability testing
- 80% automated, 20% manual testing target
- Continuous regression protection

**3. Quality is Everyone's Responsibility**
- Developers own unit and integration tests
- QA engineers focus on E2E and exploratory testing
- Product team validates acceptance criteria
- DevOps ensures infrastructure testing

**4. Risk-Based Testing**
- Prioritize testing critical user journeys
- Focus on high-impact, high-frequency features
- AI generation pipeline receives maximum test coverage
- Payment and authentication are critical paths

**5. Test in Production**
- Feature flags enable safe production testing
- Synthetic monitoring validates user flows
- Real user monitoring (RUM) catches edge cases
- Canary deployments minimize blast radius

### Testing Goals

1. **Prevent Regressions:** Catch bugs before they reach production
2. **Enable Fast Iteration:** Quick feedback on code changes
3. **Document Behavior:** Tests serve as living documentation
4. **Build Confidence:** Deploy to production with certainty
5. **Improve Code Quality:** Test-driven design improves architecture

---

## Testing Pyramid

BTRMe follows the testing pyramid model with appropriate distribution:

```
           /\
          /  \         E2E Tests (10%)
         /    \        - Critical user journeys
        /------\       - Cross-system validation
       /        \
      /          \     Integration Tests (30%)
     /            \    - API contracts
    /              \   - Database operations
   /                \  - External service mocks
  /------------------\
 /                    \ Unit Tests (60%)
/______________________\ - Pure functions
                         - Business logic
                         - Component logic
```

### Distribution Rationale

**Unit Tests (60%)**
- Fast execution (milliseconds)
- Isolated, no dependencies
- Easy to debug and maintain
- High confidence in code correctness

**Integration Tests (30%)**
- Validate component interactions
- Test API contracts
- Database operations
- Moderate execution time (seconds)

**E2E Tests (10%)**
- Validate complete user journeys
- Cross-system integration
- Slow execution (minutes)
- Highest confidence, highest cost

---

## Unit Testing Strategy

### Scope

Unit tests validate individual functions, components, and modules in isolation.

### Tools

- **Vitest:** Fast unit test runner with TypeScript support
- **React Testing Library:** Component testing with user-centric queries
- **MSW (Mock Service Worker):** API mocking for frontend tests

### Coverage Targets

| Component Type | Coverage Target | Priority |
|---------------|----------------|----------|
| Utilities | 95% | Critical |
| Business Logic | 90% | Critical |
| React Components | 80% | High |
| API Routes | 85% | High |
| Types/Interfaces | N/A | Low |

### Unit Test Examples

#### 1. Utility Function Testing

**File:** `apps/web/lib/ai/openai-client.ts`

```typescript
// __tests__/lib/ai/openai-client.test.ts
import { describe, test, expect } from 'vitest'
import { calculateCost, countTokens } from '@/lib/ai/openai-client'

describe('OpenAI Client Utilities', () => {
  describe('calculateCost', () => {
    test('should calculate cost for gpt-4-turbo-preview correctly', () => {
      const cost = calculateCost('gpt-4-turbo-preview', 1000, 500)
      expect(cost).toBe(0.025) // (1000/1000 * 0.01) + (500/1000 * 0.03)
    })

    test('should calculate cost for gpt-3.5-turbo correctly', () => {
      const cost = calculateCost('gpt-3.5-turbo', 2000, 1000)
      expect(cost).toBe(0.0025) // (2000/1000 * 0.0005) + (1000/1000 * 0.0015)
    })

    test('should handle zero tokens', () => {
      const cost = calculateCost('gpt-4', 0, 0)
      expect(cost).toBe(0)
    })

    test('should throw error for invalid model', () => {
      expect(() => calculateCost('invalid-model', 100, 50)).toThrow()
    })
  })

  describe('countTokens', () => {
    test('should count tokens in simple text', () => {
      const count = countTokens('Hello world')
      expect(count).toBeGreaterThan(0)
      expect(count).toBeLessThan(10)
    })

    test('should count tokens in code', () => {
      const code = 'function hello() { return "world" }'
      const count = countTokens(code)
      expect(count).toBeGreaterThan(5)
    })
  })
})
```

#### 2. React Component Testing

**File:** `apps/web/components/generation/status-badge.tsx`

```typescript
// __tests__/components/generation/status-badge.test.tsx
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/generation/status-badge'

describe('StatusBadge', () => {
  test('should render pending status', () => {
    render(<StatusBadge status="PENDING" />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveClass('bg-yellow-100')
  })

  test('should render processing status with spinner', () => {
    render(<StatusBadge status="PROCESSING" />)
    expect(screen.getByText('Processing')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  test('should render completed status', () => {
    render(<StatusBadge status="COMPLETED" />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveClass('bg-green-100')
  })

  test('should render failed status with error icon', () => {
    render(<StatusBadge status="FAILED" />)
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /error/i })).toBeInTheDocument()
  })
})
```

#### 3. Business Logic Testing

**File:** `apps/web/lib/prompts/engine.ts`

```typescript
// __tests__/lib/prompts/engine.test.ts
import { describe, test, expect, beforeEach } from 'vitest'
import { PromptTemplateEngine } from '@/lib/prompts/engine'

describe('PromptTemplateEngine', () => {
  let engine: PromptTemplateEngine

  beforeEach(() => {
    engine = new PromptTemplateEngine()
  })

  describe('registerTemplate', () => {
    test('should register valid template', () => {
      const metadata = {
        id: 'test-template',
        name: 'Test Template',
        category: 'web',
        requiredVariables: ['appName'],
      }
      const template = 'Create app named {{appName}}'

      expect(() => engine.registerTemplate(metadata, template)).not.toThrow()
    })

    test('should throw error for duplicate template ID', () => {
      const metadata = { id: 'duplicate', name: 'Test', category: 'web', requiredVariables: [] }
      engine.registerTemplate(metadata, 'Template 1')

      expect(() => engine.registerTemplate(metadata, 'Template 2')).toThrow('already registered')
    })
  })

  describe('compile', () => {
    beforeEach(() => {
      engine.registerTemplate(
        {
          id: 'web-app',
          name: 'Web App',
          category: 'web',
          requiredVariables: ['appName', 'description'],
        },
        'Create {{appName}}: {{description}}'
      )
    })

    test('should compile template with valid context', () => {
      const result = engine.compile('web-app', {
        variables: { appName: 'MyApp', description: 'A todo app' },
        techStack: {},
        userInput: { description: '', features: [] },
      })

      expect(result.content).toBe('Create MyApp: A todo app')
      expect(result.metadata.id).toBe('web-app')
    })

    test('should throw error for missing required variables', () => {
      expect(() =>
        engine.compile('web-app', {
          variables: { appName: 'MyApp' }, // missing description
          techStack: {},
          userInput: { description: '', features: [] },
        })
      ).toThrow('Missing required variables')
    })

    test('should throw error for unknown template', () => {
      expect(() =>
        engine.compile('unknown-template', {
          variables: {},
          techStack: {},
          userInput: { description: '', features: [] },
        })
      ).toThrow('Template not found')
    })
  })
})
```

### Unit Test Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the function does, not how it does it
   - Avoid testing private methods directly
   - Test public APIs and observable behavior

2. **Follow AAA Pattern**
   - **Arrange:** Set up test data and conditions
   - **Act:** Execute the function under test
   - **Assert:** Verify expected outcomes

3. **Use Descriptive Test Names**
   - `should calculate cost correctly for valid input`
   - `should throw error when user not found`
   - `should render loading state while fetching`

4. **Keep Tests Isolated**
   - No shared state between tests
   - Use `beforeEach` for test setup
   - Clean up after each test

5. **Test Edge Cases**
   - Empty inputs
   - Null/undefined values
   - Boundary conditions
   - Error scenarios

---

## Integration Testing Strategy

### Scope

Integration tests validate interactions between multiple components, services, and external dependencies.

### Tools

- **Vitest:** Test runner with native TypeScript support
- **Supertest:** HTTP assertion library for API testing
- **Testcontainers:** Spin up real databases for testing
- **MSW:** Mock external APIs

### Coverage Areas

1. **API Route Testing**
   - Request/response validation
   - Authentication/authorization
   - Error handling
   - Database operations

2. **Database Integration**
   - CRUD operations
   - Complex queries
   - Transactions
   - Migrations

3. **External Service Integration**
   - OpenAI API calls
   - Anthropic API calls
   - Stripe payments
   - Email services

### Integration Test Examples

#### 1. API Route Testing

**File:** `apps/web/app/api/projects/route.ts`

```typescript
// __tests__/api/projects/route.test.ts
import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/projects/route'
import { prisma } from '@/lib/db'

describe('Projects API', () => {
  let userId: string

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    })
    userId = user.id
  })

  afterAll(async () => {
    // Cleanup
    await prisma.project.deleteMany({ where: { userId } })
    await prisma.user.delete({ where: { id: userId } })
  })

  describe('GET /api/projects', () => {
    test('should return user projects', async () => {
      // Create test projects
      await prisma.project.createMany({
        data: [
          { userId, name: 'Project 1', structure: {}, status: 'DRAFT' },
          { userId, name: 'Project 2', structure: {}, status: 'DEPLOYED' },
        ],
      })

      const { req, res } = createMocks({ method: 'GET' })
      req.headers = { authorization: `Bearer ${await generateToken(userId)}` }

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.projects).toHaveLength(2)
      expect(data.projects[0].name).toBe('Project 2') // DESC order
    })

    test('should return 401 for unauthenticated request', async () => {
      const { req } = createMocks({ method: 'GET' })

      const response = await GET(req)

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/projects', () => {
    test('should create new project', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'New Project',
          description: 'Test project',
          structure: { files: [] },
        },
      })
      req.headers = { authorization: `Bearer ${await generateToken(userId)}` }

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.project.name).toBe('New Project')
      expect(data.project.userId).toBe(userId)
    })

    test('should validate required fields', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: { description: 'Missing name' },
      })
      req.headers = { authorization: `Bearer ${await generateToken(userId)}` }

      const response = await POST(req)

      expect(response.status).toBe(400)
    })
  })
})
```

#### 2. Database Integration Testing

```typescript
// __tests__/lib/db/queries.test.ts
import { describe, test, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/db'
import { getProjectsOptimized, batchLoadProjects } from '@/lib/db/optimized-queries'

describe('Optimized Database Queries', () => {
  let userId: string

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test' },
    })
    userId = user.id

    // Create 25 projects for pagination testing
    await prisma.project.createMany({
      data: Array.from({ length: 25 }, (_, i) => ({
        userId,
        name: `Project ${i}`,
        structure: {},
        status: 'DRAFT',
      })),
    })
  })

  describe('getProjectsOptimized', () => {
    test('should return only 20 most recent projects', async () => {
      const projects = await getProjectsOptimized(userId)

      expect(projects).toHaveLength(20)
      expect(projects[0].createdAt.getTime()).toBeGreaterThan(
        projects[19].createdAt.getTime()
      )
    })

    test('should include generation count', async () => {
      const project = await prisma.project.findFirst({ where: { userId } })
      await prisma.generation.createMany({
        data: [
          { userId, projectId: project!.id, prompt: 'Test 1', aiResponse: '', status: 'COMPLETED' },
          { userId, projectId: project!.id, prompt: 'Test 2', aiResponse: '', status: 'COMPLETED' },
        ],
      })

      const projects = await getProjectsOptimized(userId)
      const projectWithGenerations = projects.find((p) => p.id === project!.id)

      expect(projectWithGenerations!._count.generations).toBe(2)
    })
  })

  describe('batchLoadProjects', () => {
    test('should load multiple projects efficiently', async () => {
      const allProjects = await prisma.project.findMany({ where: { userId }, take: 5 })
      const ids = allProjects.map((p) => p.id)

      const loaded = await batchLoadProjects(ids)

      expect(loaded).toHaveLength(5)
      expect(loaded.map((p) => p.id).sort()).toEqual(ids.sort())
    })
  })
})
```

#### 3. External Service Integration

```typescript
// __tests__/lib/ai/service.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { generateCompletion } from '@/lib/ai/service'
import { openai } from '@/lib/ai/openai-client'
import { anthropic } from '@/lib/ai/anthropic-client'

vi.mock('@/lib/ai/openai-client')
vi.mock('@/lib/ai/anthropic-client')

describe('AI Service Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should use OpenAI as primary provider', async () => {
    const mockResponse = {
      id: 'chatcmpl-123',
      choices: [{ message: { content: 'Generated code' } }],
      usage: { prompt_tokens: 100, completion_tokens: 50 },
    }

    vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse)

    const result = await generateCompletion([
      { role: 'user', content: 'Generate a React component' },
    ])

    expect(openai.chat.completions.create).toHaveBeenCalledOnce()
    expect(result.content).toBe('Generated code')
    expect(result.tokensUsed.input).toBe(100)
    expect(result.tokensUsed.output).toBe(50)
  })

  test('should fallback to Anthropic on OpenAI failure', async () => {
    vi.mocked(openai.chat.completions.create).mockRejectedValue(
      new Error('OpenAI API error')
    )

    const mockAnthropicResponse = {
      id: 'msg-123',
      content: [{ type: 'text', text: 'Generated with Claude' }],
      usage: { input_tokens: 100, output_tokens: 50 },
    }

    vi.mocked(anthropic.messages.create).mockResolvedValue(mockAnthropicResponse)

    const result = await generateCompletion([
      { role: 'user', content: 'Generate a React component' },
    ])

    expect(openai.chat.completions.create).toHaveBeenCalledOnce()
    expect(anthropic.messages.create).toHaveBeenCalledOnce()
    expect(result.content).toBe('Generated with Claude')
  })

  test('should throw error when both providers fail', async () => {
    vi.mocked(openai.chat.completions.create).mockRejectedValue(
      new Error('OpenAI error')
    )
    vi.mocked(anthropic.messages.create).mockRejectedValue(
      new Error('Anthropic error')
    )

    await expect(
      generateCompletion([{ role: 'user', content: 'Test' }])
    ).rejects.toThrow('All AI providers failed')
  })
})
```

### Integration Test Best Practices

1. **Use Test Databases**
   - Never run integration tests against production
   - Use Testcontainers or dedicated test DB
   - Reset database state between tests

2. **Mock External Services**
   - Use MSW to mock HTTP requests
   - Stub third-party SDKs
   - Test both success and failure scenarios

3. **Test Database Transactions**
   - Verify rollback behavior
   - Test concurrent operations
   - Validate data integrity

4. **Test API Contracts**
   - Validate request schemas
   - Verify response shapes
   - Test error responses

---

## End-to-End Testing Strategy

### Scope

E2E tests validate complete user journeys across the entire application stack.

### Tools

- **Cypress:** Modern E2E testing framework with great DX
- **Playwright:** Alternative for cross-browser testing
- **Percy:** Visual regression testing

### Critical User Journeys

1. **User Registration & Onboarding**
   - Sign up flow
   - Email verification
   - Onboarding tutorial
   - First project creation

2. **Code Generation Flow**
   - Template selection
   - Input form completion
   - Generation progress tracking
   - View generated files
   - Download project

3. **Project Iteration**
   - Open existing project
   - Chat with AI for modifications
   - View code changes
   - Save new version

4. **Template Marketplace**
   - Browse templates
   - Search and filter
   - Preview template
   - Use template
   - Rate and review

5. **Payment Flow**
   - Upgrade to paid tier
   - Stripe checkout
   - Subscription management
   - Invoice access

### E2E Test Examples

#### 1. Code Generation Flow

```typescript
// cypress/e2e/generation/complete-flow.cy.ts
describe('Code Generation Flow', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123')
  })

  it('should complete full generation flow', () => {
    // Navigate to generation page
    cy.visit('/generate')
    cy.url().should('include', '/generate')

    // Select template
    cy.get('[data-cy=template-select]').click()
    cy.get('[data-cy=template-option-web-app]').click()

    // Fill description
    cy.get('[data-cy=description]').type('A todo list application with user authentication and real-time updates')

    // Select features
    cy.get('[data-cy=feature-auth]').check()
    cy.get('[data-cy=feature-realtime]').check()

    // Submit generation
    cy.get('[data-cy=generate-button]').click()

    // Wait for generation
    cy.get('[data-cy=progress-bar]', { timeout: 60000 }).should('be.visible')
    cy.get('[data-cy=status]').should('contain', 'Processing')

    // Generation complete
    cy.get('[data-cy=status]', { timeout: 60000 }).should('contain', 'Complete')
    cy.get('[data-cy=success-message]').should('be.visible')

    // Verify files generated
    cy.get('[data-cy=file-tree]').should('be.visible')
    cy.get('[data-cy=file-item]').should('have.length.gt', 10)

    // Check specific files exist
    cy.get('[data-cy=file-item]').contains('package.json').should('exist')
    cy.get('[data-cy=file-item]').contains('src/app/page.tsx').should('exist')

    // Preview code
    cy.get('[data-cy=file-item]').contains('page.tsx').click()
    cy.get('[data-cy=code-preview]').should('contain', 'export default function')

    // Download project
    cy.get('[data-cy=download-button]').click()
    cy.get('[data-cy=download-format]').select('zip')
    cy.get('[data-cy=confirm-download]').click()

    // Verify download started
    cy.readFile('cypress/downloads/todo-app.zip', { timeout: 10000 }).should('exist')
  })

  it('should handle generation errors gracefully', () => {
    cy.visit('/generate')

    // Submit with minimal input
    cy.get('[data-cy=description]').type('test')
    cy.get('[data-cy=generate-button]').click()

    // Should show validation error
    cy.get('[data-cy=error-message]').should('contain', 'Description must be at least 20 characters')

    // Fix error and retry
    cy.get('[data-cy=description]').clear().type('A comprehensive todo list application with authentication')
    cy.get('[data-cy=generate-button]').click()

    // Should proceed
    cy.get('[data-cy=progress-bar]', { timeout: 10000 }).should('be.visible')
  })
})
```

#### 2. Project Iteration Flow

```typescript
// cypress/e2e/iteration/chat-modifications.cy.ts
describe('Project Iteration', () => {
  let projectId: string

  beforeEach(() => {
    cy.login('test@example.com', 'password123')

    // Create a test project
    cy.createProject({
      name: 'Test Project',
      structure: {
        files: [
          { path: 'src/app/page.tsx', content: 'export default function Home() { return <div>Hello</div> }' },
        ],
      },
    }).then((id) => {
      projectId = id
    })
  })

  it('should iterate on code via chat', () => {
    cy.visit(`/projects/${projectId}`)

    // Open chat panel
    cy.get('[data-cy=chat-button]').click()
    cy.get('[data-cy=chat-panel]').should('be.visible')

    // Send modification request
    cy.get('[data-cy=chat-input]').type('Add a button that says "Click me" with a blue background')
    cy.get('[data-cy=send-button]').click()

    // Wait for AI response
    cy.get('[data-cy=ai-message]', { timeout: 30000 }).should('contain', 'modified')

    // Verify file updated
    cy.get('[data-cy=file-tree]').contains('page.tsx').click()
    cy.get('[data-cy=code-preview]').should('contain', 'button')
    cy.get('[data-cy=code-preview]').should('contain', 'Click me')

    // Verify version created
    cy.get('[data-cy=versions-button]').click()
    cy.get('[data-cy=version-list]').should('have.length', 2)
    cy.get('[data-cy=version-item]').first().should('contain', 'Add button')

    // Continue conversation
    cy.get('[data-cy=chat-input]').type('Change the button color to red')
    cy.get('[data-cy=send-button]').click()

    cy.get('[data-cy=ai-message]', { timeout: 30000 }).should('have.length', 2)

    // Rollback to previous version
    cy.get('[data-cy=versions-button]').click()
    cy.get('[data-cy=version-item]').eq(1).find('[data-cy=rollback-button]').click()
    cy.get('[data-cy=confirm-rollback]').click()

    // Verify rollback
    cy.get('[data-cy=code-preview]').should('contain', 'blue')
    cy.get('[data-cy=code-preview]').should('not.contain', 'red')
  })
})
```

### E2E Test Best Practices

1. **Test Critical Paths Only**
   - Focus on revenue-generating features
   - Test most common user journeys
   - Avoid testing every edge case

2. **Use Custom Commands**
   - Create reusable commands (cy.login, cy.createProject)
   - Reduce code duplication
   - Improve test maintainability

3. **Implement Wait Strategies**
   - Use cy.wait for API calls
   - Set appropriate timeouts
   - Avoid arbitrary cy.wait(5000)

4. **Clean Up Test Data**
   - Reset database before tests
   - Delete created resources
   - Use unique identifiers

5. **Run in CI/CD**
   - Execute on every PR
   - Run against staging environment
   - Parallelize tests for speed

---

## Performance Testing

### Scope

Performance tests validate application speed, scalability, and resource usage.

### Tools

- **k6:** Modern load testing tool
- **Lighthouse CI:** Automated performance audits
- **Artillery:** Alternative load testing tool

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load | < 2s | LCP (Largest Contentful Paint) |
| API Response | < 500ms | P95 response time |
| Generation Time | < 30s | Average completion time |
| Throughput | > 100 req/s | Concurrent requests |
| Error Rate | < 0.1% | Failed requests / total |

### Load Testing Example

```javascript
// tests/performance/load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('errors')

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Spike to 200 users
    { duration: '5m', target: 100 },  // Return to 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],  // 95% of requests < 500ms
    'errors': ['rate<0.01'],              // Error rate < 1%
  },
}

export default function () {
  // Test generation API
  const payload = JSON.stringify({
    templateId: 'web-app',
    context: {
      variables: { appName: 'TestApp' },
      userInput: {
        description: 'A test application',
        features: ['auth', 'crud'],
      },
    },
  })

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.API_TOKEN}`,
    },
  }

  const res = http.post('https://api.btrme.com/generate', payload, params)

  const result = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has generation ID': (r) => {
      const body = JSON.parse(r.body)
      return body.generationId !== undefined
    },
  })

  errorRate.add(!result)

  sleep(1)
}

// Stress testing scenario
export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  }
}
```

### Performance Monitoring

```typescript
// apps/web/lib/monitoring/performance.ts
import { performance } from 'perf_hooks'

export async function trackGenerationPerformance(fn: () => Promise<any>) {
  const start = performance.now()
  const startMemory = process.memoryUsage()

  try {
    const result = await fn()
    const duration = performance.now() - start
    const memoryUsed = process.memoryUsage().heapUsed - startMemory.heapUsed

    // Send to monitoring service
    await sendMetric('generation.duration', duration)
    await sendMetric('generation.memory', memoryUsed)

    return result
  } catch (error) {
    await sendMetric('generation.error', 1)
    throw error
  }
}
```

---

## Security Testing

### Scope

Security tests validate authentication, authorization, input validation, and vulnerability prevention.

### Tools

- **OWASP ZAP:** Automated security scanner
- **npm audit:** Dependency vulnerability scanning
- **Snyk:** Continuous security monitoring
- **SonarQube:** Static code analysis

### Security Test Checklist

#### Authentication & Authorization

```typescript
// __tests__/security/auth.test.ts
describe('Authentication Security', () => {
  test('should reject requests without token', async () => {
    const res = await fetch('/api/projects')
    expect(res.status).toBe(401)
  })

  test('should reject expired tokens', async () => {
    const expiredToken = generateToken({ userId: 'test', exp: Date.now() - 1000 })
    const res = await fetch('/api/projects', {
      headers: { Authorization: `Bearer ${expiredToken}` },
    })
    expect(res.status).toBe(401)
  })

  test('should reject tampered tokens', async () => {
    const validToken = generateToken({ userId: 'test' })
    const tamperedToken = validToken.slice(0, -10) + 'xxxxxxxxxx'
    const res = await fetch('/api/projects', {
      headers: { Authorization: `Bearer ${tamperedToken}` },
    })
    expect(res.status).toBe(401)
  })

  test('should prevent access to other users resources', async () => {
    const user1Token = await generateToken({ userId: 'user1' })
    const user2Project = await createProject({ userId: 'user2' })

    const res = await fetch(`/api/projects/${user2Project.id}`, {
      headers: { Authorization: `Bearer ${user1Token}` },
    })

    expect(res.status).toBe(403)
  })
})
```

#### Input Validation

```typescript
// __tests__/security/validation.test.ts
describe('Input Validation Security', () => {
  test('should sanitize HTML in user input', async () => {
    const maliciousInput = '<script>alert("XSS")</script>'

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: maliciousInput }),
    })

    const project = await res.json()
    expect(project.name).not.toContain('<script>')
  })

  test('should prevent SQL injection', async () => {
    const sqlInjection = "'; DROP TABLE users; --"

    const res = await fetch(`/api/projects?name=${sqlInjection}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // Should not execute SQL
    const users = await prisma.user.count()
    expect(users).toBeGreaterThan(0)
  })

  test('should prevent command injection', async () => {
    const commandInjection = '; rm -rf /'

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ command: commandInjection }),
    })

    expect(res.status).toBe(400)
  })
})
```

### Automated Security Scanning

```bash
# Run OWASP ZAP scan
zap-cli quick-scan --self-contained https://btrme.com
zap-cli report -o security-report.html -f html

# Dependency audit
pnpm audit --audit-level=moderate

# Snyk scanning
snyk test --severity-threshold=high
snyk monitor
```

---

## AI Model Testing

### Scope

AI model testing validates generated code quality, consistency, and correctness.

### Testing Strategy

#### 1. Prompt Testing

```typescript
// __tests__/ai/prompts.test.ts
describe('AI Prompt Quality', () => {
  test('should generate valid React component', async () => {
    const result = await generateCompletion([
      { role: 'system', content: 'You are a React expert.' },
      { role: 'user', content: 'Create a button component' },
    ])

    // Parse generated code
    const code = extractCode(result.content)

    // Validate TypeScript syntax
    expect(() => typescript.transpile(code)).not.toThrow()

    // Check for React patterns
    expect(code).toContain('export default function')
    expect(code).toContain('return')
  })

  test('should maintain code style consistency', async () => {
    const results = await Promise.all([
      generateCompletion([{ role: 'user', content: 'Create a login form' }]),
      generateCompletion([{ role: 'user', content: 'Create a signup form' }]),
    ])

    const code1 = extractCode(results[0].content)
    const code2 = extractCode(results[1].content)

    // Both should use same quote style
    const quotes1 = (code1.match(/['"`]/g) || [])[0]
    const quotes2 = (code2.match(/['"`]/g) || [])[0]
    expect(quotes1).toBe(quotes2)

    // Both should use same indentation
    const indent1 = detectIndentation(code1)
    const indent2 = detectIndentation(code2)
    expect(indent1).toBe(indent2)
  })
})
```

#### 2. Generation Quality Metrics

```typescript
// apps/web/lib/ai/quality-metrics.ts
export async function evaluateGenerationQuality(code: string): Promise<QualityScore> {
  const metrics = {
    syntaxValid: await validateSyntax(code),
    lintPassed: await runESLint(code),
    typeCheckPassed: await runTypeCheck(code),
    testCoverage: await estimateTestability(code),
    complexity: calculateCyclomaticComplexity(code),
    maintainability: calculateMaintainabilityIndex(code),
  }

  const score = calculateOverallScore(metrics)

  return {
    score,
    metrics,
    passed: score >= 70,
  }
}
```

---

## Test Coverage Requirements

### Coverage Targets by Component

| Component | Line Coverage | Branch Coverage | Function Coverage |
|-----------|---------------|-----------------|-------------------|
| Critical Paths (Auth, Payment, Generation) | 95% | 90% | 95% |
| Core Business Logic | 90% | 85% | 90% |
| API Routes | 85% | 80% | 85% |
| React Components | 80% | 75% | 80% |
| Utilities | 90% | 85% | 90% |
| Configuration | 60% | 50% | 60% |

### Measuring Coverage

```bash
# Run tests with coverage
pnpm test:coverage

# Generate HTML report
pnpm test:coverage --reporter=html

# Check coverage thresholds
pnpm test:coverage --coverage-check
```

### Coverage Configuration

```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['apps/web/lib/**', 'apps/web/app/api/**', 'apps/web/components/**'],
      exclude: ['**/*.test.ts', '**/*.config.ts', '**/types.ts'],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
      },
    },
  },
})
```

---

## QA Process & Workflows

### Development Workflow

```mermaid
graph TD
    A[Developer writes code] --> B[Write unit tests]
    B --> C[Run tests locally]
    C --> D{Tests pass?}
    D -->|No| B
    D -->|Yes| E[Create PR]
    E --> F[CI runs tests]
    F --> G{CI passes?}
    G -->|No| A
    G -->|Yes| H[Code review]
    H --> I{Approved?}
    I -->|No| A
    I -->|Yes| J[Merge to main]
    J --> K[Deploy to staging]
    K --> L[E2E tests on staging]
    L --> M{E2E pass?}
    M -->|No| N[Rollback]
    M -->|Yes| O[Deploy to production]
```

### Pre-Commit Checklist

- [ ] All unit tests pass
- [ ] No linting errors
- [ ] Type checking passes
- [ ] Coverage meets threshold
- [ ] Manual testing completed

### Pre-Deploy Checklist

- [ ] All CI checks pass
- [ ] E2E tests pass on staging
- [ ] Performance tests pass
- [ ] Security scan shows no critical issues
- [ ] Database migrations tested
- [ ] Rollback plan documented

---

## Bug Tracking & Management

### Bug Severity Levels

| Severity | Definition | SLA | Example |
|----------|-----------|-----|---------|
| P0 - Critical | Production down, data loss | 1 hour | Payment processing broken |
| P1 - High | Major feature broken | 4 hours | Code generation fails for all users |
| P2 - Medium | Minor feature broken | 1 day | Template preview not loading |
| P3 - Low | Cosmetic issue | 1 week | Button misaligned |

### Bug Lifecycle

1. **Reported:** Bug discovered and logged
2. **Triaged:** Severity assigned, owner identified
3. **In Progress:** Developer working on fix
4. **Code Review:** Fix awaiting approval
5. **Testing:** QA validating fix
6. **Resolved:** Fix deployed to production
7. **Closed:** Verified in production

### Bug Report Template

```markdown
## Bug Description
[Clear description of the issue]

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Browser: Chrome 118
- OS: macOS 14
- User ID: user_123

## Screenshots/Videos
[Attach visual evidence]

## Error Logs
```
[Paste relevant logs]
```

## Severity
[P0/P1/P2/P3]
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests
        run: pnpm test:unit --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: pnpm install

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          CYPRESS_BASE_URL: https://staging.btrme.com

      - name: Upload Cypress videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-videos
          path: cypress/videos

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run npm audit
        run: pnpm audit --audit-level=high
```

---

## Quality Metrics & KPIs

### Test Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Pass Rate | > 99% | Passed / Total |
| Test Execution Time | < 10 min | CI pipeline duration |
| Code Coverage | > 80% | Lines covered / Total lines |
| Flaky Test Rate | < 1% | Intermittent failures |
| Bug Escape Rate | < 5% | Bugs found in prod / Total bugs |

### Quality Dashboards

**Weekly QA Report:**
- Total tests: 1,245
- Pass rate: 99.2%
- Coverage: 84.3%
- Critical bugs: 0
- High priority bugs: 2
- Deployment frequency: 8 per week
- Mean time to recovery (MTTR): 12 minutes

---

## Testing Tools & Infrastructure

### Tool Stack

**Test Frameworks:**
- Vitest (unit & integration)
- Cypress (E2E)
- Playwright (cross-browser)

**Code Quality:**
- ESLint (linting)
- Prettier (formatting)
- TypeScript (type checking)
- SonarQube (static analysis)

**Performance:**
- k6 (load testing)
- Lighthouse (performance audits)
- WebPageTest (real-world performance)

**Security:**
- OWASP ZAP (vulnerability scanning)
- Snyk (dependency scanning)
- npm audit (package vulnerabilities)

**Monitoring:**
- Sentry (error tracking)
- PostHog (analytics)
- Datadog (infrastructure monitoring)

### Test Infrastructure

**Test Environments:**
- Local: Developer machines
- CI: GitHub Actions runners
- Staging: Isolated environment matching production
- Production: Feature flags for testing in prod

---

## Best Practices

### General Testing Principles

1. **Write Tests First (TDD)**
   - Define expected behavior before implementation
   - Ensures code is testable
   - Provides living documentation

2. **Keep Tests Simple**
   - One assertion per test when possible
   - Clear test names
   - Minimal setup and teardown

3. **Test Behavior, Not Implementation**
   - Focus on public APIs
   - Don't test private methods
   - Refactor should not break tests

4. **Maintain Test Independence**
   - Tests should not depend on each other
   - Use beforeEach for setup
   - Clean up after tests

5. **Use Mocks Judiciously**
   - Mock external dependencies
   - Don't mock what you don't own
   - Verify mock interactions

6. **Continuous Improvement**
   - Review flaky tests weekly
   - Refactor slow tests
   - Update tests with production bugs

### Code Review Checklist for Tests

- [ ] Tests are clear and well-named
- [ ] Tests cover happy path and edge cases
- [ ] Tests are independent and isolated
- [ ] Mocks are used appropriately
- [ ] Tests run quickly
- [ ] Coverage meets target threshold
- [ ] No commented-out tests
- [ ] Test data is meaningful

---

## Conclusion

This QA strategy ensures BTRMe maintains high quality standards throughout development and deployment. By following the testing pyramid, automating critical tests, and maintaining comprehensive coverage, we can:

- Ship features with confidence
- Catch bugs early in the development cycle
- Reduce production incidents
- Enable fast iteration
- Maintain codebase health

**Key Takeaways:**
- 60% unit tests, 30% integration, 10% E2E
- 80%+ code coverage target
- Automate all regression tests
- Test in production with feature flags
- Continuous monitoring and improvement

---

**Document Owner:** Engineering Team
**Review Cadence:** Quarterly
**Last Review:** 2025-11-13
**Next Review:** 2026-02-13
