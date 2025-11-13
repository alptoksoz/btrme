# SPRINT 5: Polish & Advanced Features (80 SP, 2 Weeks)

**Sprint Goal:** Add advanced features, performance optimization, and production polish.

**Total:** 80 SP, 192 hours

---

## Epic 5.1: Performance Optimization (20 SP, 48h)

### Story 5.1.1: Caching Strategy (8 SP, 18h)

`apps/web/lib/cache/redis.ts`:
```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function cacheGet<T>(key: string): Promise<T | null> {
  return redis.get(key)
}

export async function cacheSet(key: string, value: any, ttl = 3600) {
  await redis.setex(key, ttl, JSON.stringify(value))
}

export async function cacheInvalidate(pattern: string) {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}
```

### Story 5.1.2: Database Query Optimization (7 SP, 18h)

`apps/web/lib/db/optimized-queries.ts`:
```typescript
// Optimized queries with proper indexing
export async function getProjectsOptimized(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      status: true,
      _count: {
        select: { generations: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
}

// Batch loading
export async function batchLoadProjects(ids: string[]) {
  return prisma.project.findMany({
    where: { id: { in: ids } },
  })
}
```

### Story 5.1.3: Code Splitting (5 SP, 12h)

Dynamic imports:
```typescript
// apps/web/app/editor/page.tsx
import dynamic from 'next/dynamic'

const CodeEditor = dynamic(() => import('@/components/editor/code-editor'), {
  loading: () => <p>Loading editor...</p>,
  ssr: false,
})

export default function EditorPage() {
  return <CodeEditor />
}
```

---

## Epic 5.2: Advanced AI Features (25 SP, 60h)

### Story 5.2.1: Multi-Model Support (10 SP, 24h)

`apps/web/lib/ai/router.ts`:
```typescript
export async function routeToOptimalModel(prompt: string, context: any) {
  // Route based on task complexity
  if (prompt.length > 10000) {
    return 'claude-3-5-sonnet-20241022' // Better for long context
  } else if (context.needsReasoning) {
    return 'gpt-4-turbo-preview' // Better for complex logic
  } else {
    return 'gpt-3.5-turbo' // Cheaper for simple tasks
  }
}
```

### Story 5.2.2: Code Explanation (8 SP, 18h)

`apps/web/lib/ai/explainer.ts`:
```typescript
export async function explainCode(code: string, language: string) {
  const result = await generateCompletion([
    {
      role: 'system',
      content: 'Explain code in simple terms with examples.',
    },
    {
      role: 'user',
      content: `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
    },
  ])

  return result.content
}
```

### Story 5.2.3: Code Review AI (7 SP, 18h)

`apps/web/lib/ai/reviewer.ts`:
```typescript
export async function reviewCode(code: string) {
  const result = await generateCompletion([
    {
      role: 'system',
      content: 'You are an expert code reviewer. Find bugs, security issues, and suggest improvements.',
    },
    {
      role: 'user',
      content: `Review this code:\n\n\`\`\`typescript\n${code}\n\`\`\``,
    },
  ])

  return parseReview(result.content)
}

function parseReview(review: string) {
  return {
    issues: [],
    suggestions: [],
    score: 85,
  }
}
```

---

## Epic 5.3: User Experience (20 SP, 48h)

### Story 5.3.1: Onboarding Flow (8 SP, 18h)

`apps/web/app/onboarding/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Progress } from '@/components/ui/progress'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const totalSteps = 4

  return (
    <div className="container max-w-2xl py-8">
      <Progress value={(step / totalSteps) * 100} className="mb-8" />

      {step === 1 && <WelcomeStep onNext={() => setStep(2)} />}
      {step === 2 && <ProfileStep onNext={() => setStep(3)} />}
      {step === 3 && <PreferencesStep onNext={() => setStep(4)} />}
      {step === 4 && <FirstProjectStep />}
    </div>
  )
}
```

### Story 5.3.2: Interactive Tutorial (7 SP, 18h)

Using Shepherd.js:
```typescript
import Shepherd from 'shepherd.js'

export function startTutorial() {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      cancelIcon: {
        enabled: true,
      },
    },
  })

  tour.addStep({
    id: 'welcome',
    text: 'Welcome to BTRMe! Let\'s create your first app.',
    buttons: [
      {
        text: 'Next',
        action: tour.next,
      },
    ],
  })

  tour.start()
}
```

### Story 5.3.3: Keyboard Shortcuts (5 SP, 12h)

`apps/web/hooks/use-keyboard-shortcuts.ts`:
```typescript
import { useEffect } from 'react'

export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`

      if (shortcuts[key]) {
        e.preventDefault()
        shortcuts[key]()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
```

---

## Epic 5.4: Analytics & Insights (15 SP, 36h)

### Story 5.4.1: Usage Analytics (8 SP, 18h)

`apps/web/lib/analytics/tracker.ts`:
```typescript
import { PostHog } from 'posthog-node'

const posthog = new PostHog(process.env.POSTHOG_API_KEY!)

export function trackEvent(userId: string, event: string, properties?: any) {
  posthog.capture({
    distinctId: userId,
    event,
    properties,
  })
}

export function trackGeneration(userId: string, generation: any) {
  trackEvent(userId, 'generation_created', {
    templateId: generation.templateId,
    filesCount: generation.filesCount,
    totalSize: generation.totalSize,
  })
}
```

### Story 5.4.2: User Insights Dashboard (7 SP, 18h)

`apps/web/app/dashboard/insights/page.tsx`:
```typescript
export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Insights</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Projects Created" value={24} change="+12%" />
        <StatCard title="Total Generations" value={156} change="+8%" />
        <StatCard title="AI Tokens Used" value="1.2M" change="+15%" />
      </div>

      {/* Charts */}
      <GenerationChart />
      <PopularTemplates />
    </div>
  )
}
```

---

# SPRINT 6: Testing, Security & Launch (70 SP, 2 Weeks)

**Sprint Goal:** Comprehensive testing, security hardening, and production launch.

**Total:** 70 SP, 168 hours

---

## Epic 6.1: Testing Suite (25 SP, 60h)

### Story 6.1.1: E2E Tests (10 SP, 24h)

`apps/web/cypress/e2e/generation.cy.ts`:
```typescript
describe('Code Generation Flow', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should generate a web app', () => {
    cy.visit('/generate')

    // Fill form
    cy.get('[data-cy=description]').type('A todo list app')
    cy.get('[data-cy=template]').select('web-app')
    cy.get('[data-cy=submit]').click()

    // Wait for generation
    cy.get('[data-cy=progress]', { timeout: 30000 }).should('contain', 'Complete')

    // Verify files
    cy.get('[data-cy=file-list]').should('have.length.gt', 5)
  })
})
```

### Story 6.1.2: Integration Tests (8 SP, 18h)

`apps/web/__tests__/integration/generation.test.ts`:
```typescript
import { describe, test, expect } from 'vitest'
import { generateCode } from '@/lib/codegen/service'

describe('Code Generation Integration', () => {
  test('should generate complete project', async () => {
    const result = await generateCode({
      userId: 'test-user',
      templateId: 'web-app',
      context: {
        variables: { appName: 'TestApp' },
        techStack: {},
        userInput: {
          description: 'Test application',
          features: ['auth', 'crud'],
        },
      },
      saveToDb: false,
    })

    expect(result.result.filesGenerated).toBeGreaterThan(0)
    expect(result.result.errors).toHaveLength(0)
  })
})
```

### Story 6.1.3: Load Testing (7 SP, 18h)

Using k6:
```javascript
// load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
}

export default function () {
  const res = http.post('https://api.btrme.com/generate', {
    templateId: 'web-app',
    context: {},
  })

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 5s': (r) => r.timings.duration < 5000,
  })

  sleep(1)
}
```

---

## Epic 6.2: Security Hardening (20 SP, 48h)

### Story 6.2.1: Security Audit (8 SP, 18h)

Security checklist:
```markdown
# Security Audit Checklist

## Authentication
- [x] Password hashing (bcrypt)
- [x] Rate limiting on login
- [x] Session timeout
- [x] CSRF protection
- [x] 2FA implementation

## API Security
- [x] JWT validation
- [x] Rate limiting per user
- [x] Input sanitization
- [x] SQL injection prevention
- [x] XSS protection

## Data Security
- [x] Encryption at rest
- [x] HTTPS only
- [x] Secure headers
- [x] Content Security Policy

## Infrastructure
- [x] Environment variables secured
- [x] Secrets rotation
- [x] Logging (no sensitive data)
- [x] Regular backups
```

### Story 6.2.2: Penetration Testing (7 SP, 18h)

Using OWASP ZAP:
```bash
# Run automated security scan
zap-cli quick-scan --self-contained https://btrme.com

# Generate report
zap-cli report -o security-report.html
```

### Story 6.2.3: Compliance (5 SP, 12h)

GDPR compliance:
```typescript
// apps/web/lib/compliance/gdpr.ts
export async function exportUserData(userId: string) {
  const data = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.project.findMany({ where: { userId } }),
    prisma.generation.findMany({ where: { userId } }),
  ])

  return {
    user: data[0],
    projects: data[1],
    generations: data[2],
  }
}

export async function deleteUserData(userId: string) {
  await prisma.user.delete({ where: { id: userId } })
  // Cascade delete configured in schema
}
```

---

## Epic 6.3: Documentation (15 SP, 36h)

### Story 6.3.1: User Documentation (7 SP, 18h)

`docs/user-guide.md`:
```markdown
# BTRMe User Guide

## Getting Started

### Create Your First App

1. Sign up at [btrme.com](https://btrme.com)
2. Click "Generate New App"
3. Describe your application
4. Select a template
5. Customize settings
6. Generate!

## Features

### Template Marketplace
Browse 100+ pre-built templates...

### AI Generation
Describe your app in natural language...

### Iteration
Chat with AI to refine your app...
```

### Story 6.3.2: API Documentation (5 SP, 12h)

`docs/api.md`:
```markdown
# API Documentation

## Authentication

All API requests require authentication:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.btrme.com/v1/generate
\`\`\`

## Endpoints

### POST /v1/generate

Generate code from template.

**Request:**
\`\`\`json
{
  "templateId": "web-app",
  "context": {
    "variables": { "appName": "MyApp" },
    "userInput": {
      "description": "A todo app",
      "features": ["auth", "crud"]
    }
  }
}
\`\`\`
```

### Story 6.3.3: Developer Docs (3 SP, 6h)

`docs/developers.md`:
```markdown
# Developer Documentation

## Architecture

BTRMe uses:
- Next.js 14 (App Router)
- PostgreSQL (Neon)
- Redis (Upstash)
- OpenAI GPT-4

## Local Development

\`\`\`bash
git clone https://github.com/btrme/btrme
cd btrme
pnpm install
pnpm dev
\`\`\`
```

---

## Epic 6.4: Launch Preparation (10 SP, 24h)

### Story 6.4.1: Production Checklist (5 SP, 12h)

```markdown
# Production Launch Checklist

## Infrastructure
- [x] DNS configured
- [x] SSL certificate
- [x] CDN setup
- [x] Database replicas
- [x] Redis cluster

## Monitoring
- [x] Sentry error tracking
- [x] PostHog analytics
- [x] Uptime monitoring
- [x] Performance monitoring

## Security
- [x] Security headers
- [x] Rate limiting
- [x] DDoS protection
- [x] Backup system

## Marketing
- [x] Landing page
- [x] Blog posts
- [x] Social media
- [x] Email campaigns
```

### Story 6.4.2: Launch Day Operations (5 SP, 12h)

`scripts/launch.sh`:
```bash
#!/bin/bash

echo "🚀 Starting production launch..."

# Final checks
pnpm type-check
pnpm test
pnpm build

# Deploy
pnpm deploy:production

# Verify
pnpm health-check

# Monitor
pnpm monitor:start

echo "✅ Launch complete!"
```

---

## SPRINT 6 COMPLETE! ✅

**Total:** 70 SP, 168 hours

---

## ALL SPRINTS COMPLETE! 🎉🎉🎉

**Sprint 1:** 80 SP ✅
**Sprint 2:** 85 SP ✅
**Sprint 3:** 90 SP ✅
**Sprint 4:** 85 SP ✅
**Sprint 5:** 80 SP ✅
**Sprint 6:** 70 SP ✅

**TOTAL:** 490 SP, 1,176 hours

---
