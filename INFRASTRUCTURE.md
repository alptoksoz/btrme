# BTRMe Infrastructure Documentation

> **Version:** 1.0.0
> **Last Updated:** 2025-11-13

This document describes the complete infrastructure architecture, services, and configuration for BTRMe production environment.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Hosting & Compute](#hosting--compute)
3. [Database](#database)
4. [Caching Layer](#caching-layer)
5. [Authentication](#authentication)
6. [AI Services](#ai-services)
7. [Email Services](#email-services)
8. [Monitoring & Logging](#monitoring--logging)
9. [CDN & Edge Network](#cdn--edge-network)
10. [Security](#security)
11. [Backup & Disaster Recovery](#backup--disaster-recovery)
12. [Scaling Strategy](#scaling-strategy)
13. [Cost Analysis](#cost-analysis)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             Users / Clients                              │
└────────────────────────────┬───────────────────────────────────────────┘
                              │
                              │ HTTPS/TLS 1.3
                              │
┌─────────────────────────────▼───────────────────────────────────────────┐
│                        Vercel Edge Network                               │
│  - Global CDN (300+ locations)                                           │
│  - DDoS Protection                                                       │
│  - SSL/TLS Termination                                                   │
│  - Static Asset Caching                                                  │
│  - Edge Functions (Middleware)                                           │
└────────────────────────────┬───────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────────┐
│                    Next.js 14 Application (Vercel)                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  App Router (React Server Components)                            │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │  API Routes                                                       │   │
│  │  - /api/generation  - /api/templates  - /api/projects           │   │
│  │  - /api/auth/*      - /api/user       - /api/admin              │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │  Server Actions                                                   │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │  Middleware (Auth, Rate Limiting, CORS)                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└───┬──────────┬──────────┬──────────┬──────────┬──────────┬────────────┘
    │          │          │          │          │          │
    │          │          │          │          │          │
    ▼          ▼          ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  Neon  │ │Upstash │ │ OpenAI │ │Anthropic│ │Resend  │ │ Sentry │
│   PG   │ │ Redis  │ │  API   │ │ Claude  │ │ Email  │ │ Errors │
│Database│ │ Cache  │ │        │ │  API    │ │        │ │        │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         External Integrations                            │
│  - Google OAuth       - GitHub OAuth                                     │
│  - Vercel Analytics   - Web Vitals Tracking                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | React | 18.3.1 | UI Library |
| | Next.js | 14.2.x | Framework |
| | TypeScript | 5.4.x | Type Safety |
| | Tailwind CSS | 3.4.x | Styling |
| | shadcn/ui | Latest | Component Library |
| **Backend** | Next.js API Routes | 14.2.x | API Layer |
| | NextAuth.js | 5.x | Authentication |
| | Prisma | 5.x | ORM |
| **Database** | PostgreSQL | 16 | Primary Database |
| | Neon | Latest | Serverless PG Hosting |
| **Cache** | Redis | 7.x | Caching Layer |
| | Upstash | Latest | Serverless Redis |
| **AI** | OpenAI GPT-4 | Latest | Code Generation |
| | Anthropic Claude | Latest | Code Generation |
| **Email** | Resend | Latest | Transactional Email |
| **Monitoring** | Sentry | Latest | Error Tracking |
| | Vercel Analytics | Latest | Performance Monitoring |
| **DevOps** | GitHub Actions | Latest | CI/CD |
| | Vercel | Latest | Hosting & Deployment |

---

## Hosting & Compute

### Vercel Platform

**Service:** Vercel Pro
**Website:** https://vercel.com

#### Configuration

```javascript
// vercel.json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "regions": ["iad1"],  // Primary: US East (Northern Virginia)
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60  // 60 seconds max for AI operations
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

#### Compute Specifications

- **Compute Units:** Serverless (auto-scaling)
- **Memory:** Up to 3GB per function
- **Execution Time:** 60 seconds (API routes), 300 seconds (background functions)
- **Concurrent Executions:** Unlimited (Pro plan)
- **Cold Start:** < 200ms (optimized with webpack)

#### Edge Middleware

```typescript
// middleware.ts
// Runs on Vercel Edge Network (300+ locations worldwide)

export function middleware(request: NextRequest) {
  // 1. Rate limiting (IP-based)
  // 2. CORS headers
  // 3. Authentication checks
  // 4. Geo-based routing
  // 5. A/B testing
}

// Edge Regions: All (auto-deployed globally)
```

#### Deployment Configuration

```bash
# Production Branch
- Branch: main
- Auto-deploy: Yes
- Deploy Hook: https://api.vercel.com/v1/integrations/deploy/...

# Staging Branch
- Branch: develop
- Auto-deploy: Yes
- Domain: btrme-staging.vercel.app

# Preview Deployments
- Pull Requests: Enabled
- Deploy on push: Yes
- Comments: Enabled (bot comments on PRs)
```

#### Build Configuration

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "devCommand": "pnpm dev",
  "framework": "nextjs",
  "nodeVersion": "20.x",
  "buildEnv": {
    "NEXT_TELEMETRY_DISABLED": "1",
    "SKIP_TYPECHECKING": "false"
  }
}
```

---

## Database

### Neon PostgreSQL

**Service:** Neon Serverless PostgreSQL
**Website:** https://neon.tech
**Plan:** Pro ($69/month base)

#### Configuration

**Project:** btrme-production
**Region:** US East (Ohio) - `us-east-2`
**PostgreSQL Version:** 16

**Compute:**
- **Type:** Autoscaling
- **Min Compute:** 0.25 CU (Compute Units)
- **Max Compute:** 2 CU
- **Autosuspend:** After 5 minutes of inactivity

**Storage:**
- **Type:** SSD (NVMe)
- **Size:** 10 GB (initial), autoscaling to 50 GB
- **Pricing:** $0.000164/GB-hour ($3.50/month for 10GB)

**Connections:**
- **Pooled Connection:** Via PgBouncer (recommended)
- **Direct Connection:** For migrations and admin tasks
- **Max Connections:** 100 concurrent (pooled)

#### Connection Strings

```bash
# Pooled (for application)
DATABASE_URL="postgresql://btrme_user:password@ep-cool-cloud-12345.us-east-2.aws.neon.tech:5432/btrme?sslmode=require"

# Direct (for migrations)
DIRECT_URL="postgresql://btrme_user:password@ep-cool-cloud-12345.us-east-2.aws.neon.tech:5432/btrme?sslmode=require&pgbouncer=false"
```

#### Database Schema

**Tables:** 12 main tables
```sql
-- Core Tables
User              -- User accounts
Session           -- User sessions
Account           -- OAuth accounts
VerificationToken -- Email verification

Project           -- User projects
Generation        -- AI generations
GenerationIteration -- Generation history

Template          -- Code templates
TemplateCategory  -- Template categories

APIUsage          -- AI API usage tracking
UserSettings      -- User preferences
AuditLog          -- Audit trail
```

#### Indexes (Performance Optimization)

```sql
-- 15 indexes for query optimization

-- User & Auth
CREATE INDEX idx_users_email ON "User"(email);
CREATE INDEX idx_sessions_user_id ON "Session"("userId");
CREATE INDEX idx_sessions_expires ON "Session"("expires");
CREATE INDEX idx_accounts_user_id ON "Account"("userId");

-- Projects & Generations
CREATE INDEX idx_projects_user_id ON "Project"("userId");
CREATE INDEX idx_projects_created_at ON "Project"("createdAt" DESC);
CREATE INDEX idx_generations_project_id ON "Generation"("projectId");
CREATE INDEX idx_generations_status ON "Generation"("status");
CREATE INDEX idx_generations_created_at ON "Generation"("createdAt" DESC);

-- Templates
CREATE INDEX idx_templates_category ON "Template"("category");
CREATE INDEX idx_templates_published ON "Template"("published");

-- Full-text search (pg_trgm extension)
CREATE INDEX idx_templates_name_trgm ON "Template" USING gin(name gin_trgm_ops);
CREATE INDEX idx_templates_description_trgm ON "Template" USING gin(description gin_trgm_ops);
CREATE INDEX idx_projects_name_trgm ON "Project" USING gin(name gin_trgm_ops);
```

#### Database Extensions

```sql
-- Required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";  -- Query performance monitoring
```

#### Backup Configuration

- **Automatic Backups:** Enabled
- **Retention Period:** 7 days
- **Point-in-Time Recovery (PITR):** Enabled
- **Backup Schedule:** Every 24 hours at 2:00 AM UTC
- **Snapshot Storage:** Separate from main storage

#### Performance Tuning

```sql
-- Connection pooling (PgBouncer)
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20

-- Query timeout
statement_timeout = 10000  -- 10 seconds

-- Work memory
work_mem = 4MB
shared_buffers = 256MB
```

#### Monitoring Metrics

- Active connections (target: < 80% of max)
- Query performance (p95 < 100ms)
- Storage usage (alert at 80%)
- Cache hit ratio (target: > 95%)
- Replication lag (< 100ms)

---

## Caching Layer

### Upstash Redis

**Service:** Upstash Serverless Redis
**Website:** https://upstash.com
**Plan:** Pay-as-you-go

#### Configuration

**Database:** btrme-production
**Region:** US East (N. Virginia) - `us-east-1`
**Redis Version:** 7.x
**TLS:** Enabled
**Eviction Policy:** `allkeys-lru` (Least Recently Used)

#### Connection

```bash
# REST API (recommended for serverless)
REDIS_URL=https://gusc1-prime-aardvark-12345.upstash.io
REDIS_TOKEN=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Or traditional Redis protocol (optional)
REDIS_ENDPOINT=gusc1-prime-aardvark-12345.upstash.io:6379
REDIS_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Cache Strategy

```typescript
// Cache namespaces and TTLs

const CACHE_CONFIG = {
  templates: {
    ttl: 3600,           // 1 hour
    tags: ['templates']
  },
  templateById: {
    ttl: 3600,           // 1 hour
    tags: ['templates']
  },
  projects: {
    ttl: 300,            // 5 minutes
    tags: ['projects']
  },
  projectById: {
    ttl: 300,            // 5 minutes
    tags: ['projects']
  },
  user: {
    ttl: 1800,           // 30 minutes
    tags: ['users']
  },
  generations: {
    ttl: 600,            // 10 minutes
    tags: ['generations']
  },
  aiModels: {
    ttl: 86400,          // 24 hours
    tags: ['ai-models']
  }
}
```

#### Cache Invalidation

```typescript
// Tag-based invalidation

// When template is updated
await redis.invalidateByTags(['templates'])

// When project is updated
await redis.invalidateByTags(['projects', `project:${projectId}`])

// When user profile is updated
await redis.invalidateByTags(['users', `user:${userId}`])
```

#### Compression

```typescript
// Compress large cache values (> 1KB)

import zlib from 'zlib'
import { promisify } from 'util'

const gzip = promisify(zlib.gzip)
const gunzip = promisify(zlib.gunzip)

async function compress(data: string): Promise<string> {
  const compressed = await gzip(Buffer.from(data))
  return compressed.toString('base64')
}

async function decompress(data: string): Promise<string> {
  const buffer = Buffer.from(data, 'base64')
  const decompressed = await gunzip(buffer)
  return decompressed.toString()
}
```

#### Cache Patterns

**1. Cache-Aside (Lazy Loading)**
```typescript
async function getTemplates(params: TemplateParams) {
  // 1. Try cache first
  const cached = await redis.get<Template[]>(cacheKey)
  if (cached) return cached

  // 2. Cache miss - fetch from database
  const templates = await prisma.template.findMany(...)

  // 3. Store in cache
  await redis.set(cacheKey, templates, { ex: 3600 })

  return templates
}
```

**2. Write-Through Cache**
```typescript
async function updateTemplate(id: string, data: TemplateUpdate) {
  // 1. Update database
  const template = await prisma.template.update({ where: { id }, data })

  // 2. Update cache immediately
  await redis.set(`template:${id}`, template, { ex: 3600 })

  // 3. Invalidate list caches
  await redis.invalidateByTags(['templates'])

  return template
}
```

**3. Cache Warming (Proactive)**
```typescript
// Warm frequently accessed data on deployment
async function warmCache() {
  // Popular templates
  const popularTemplates = await prisma.template.findMany({
    where: { published: true },
    orderBy: { usageCount: 'desc' },
    take: 20
  })

  for (const template of popularTemplates) {
    await redis.set(`template:${template.id}`, template, { ex: 3600 })
  }
}
```

#### Memory Limits

- **Max Memory:** 256 MB (can scale up)
- **Max Key Size:** 512 MB
- **Max Value Size:** 512 MB
- **Max Keys:** Unlimited (within memory limits)

#### Monitoring

- **Hit Rate:** Target > 80%
- **Latency:** p99 < 5ms
- **Memory Usage:** Alert at 80%
- **Eviction Rate:** Monitor for cache sizing

---

## Authentication

### NextAuth.js

**Version:** 5.x (Auth.js)
**Session Strategy:** JWT (JSON Web Tokens)
**Session Duration:** 7 days

#### Providers

**1. Google OAuth 2.0**
```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authorization: {
    params: {
      prompt: "consent",
      access_type: "offline",
      response_type: "code"
    }
  }
})
```

**2. GitHub OAuth**
```typescript
GitHubProvider({
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET
})
```

**3. Email/Password (Credentials)**
```typescript
CredentialsProvider({
  async authorize(credentials) {
    // Bcrypt password hashing (12 rounds)
    const isValid = await bcrypt.compare(
      credentials.password,
      user.passwordHash
    )
    if (isValid) return user
    return null
  }
})
```

#### JWT Configuration

```typescript
jwt: {
  maxAge: 7 * 24 * 60 * 60, // 7 days
  // HS256 algorithm with secret
  secret: process.env.NEXTAUTH_SECRET,
}
```

#### Session Configuration

```typescript
session: {
  strategy: "jwt",
  maxAge: 7 * 24 * 60 * 60, // 7 days
  updateAge: 24 * 60 * 60,  // Update every 24 hours
}
```

#### Security Features

- CSRF protection (built-in)
- XSS protection (React escaping)
- Secure cookies (httpOnly, sameSite: lax)
- Password hashing (Bcrypt, 12 rounds)
- Rate limiting on auth endpoints
- Session rotation on sensitive actions

---

## AI Services

### OpenAI API

**Models Used:**
- GPT-4 Turbo (`gpt-4-turbo-preview`) - Complex tasks
- GPT-4 (`gpt-4`) - Standard tasks
- GPT-3.5 Turbo (`gpt-3.5-turbo`) - Simple tasks

**Configuration:**
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION_ID,
  timeout: 60000,  // 60 seconds
  maxRetries: 3,
})
```

**Cost per 1K tokens:**
- GPT-4 Turbo: $0.01 (input), $0.03 (output)
- GPT-4: $0.03 (input), $0.06 (output)
- GPT-3.5 Turbo: $0.0005 (input), $0.0015 (output)

**Rate Limits (Tier 3):**
- Requests: 5,000/minute
- Tokens: 160,000/minute (GPT-4)
- Tokens: 1,000,000/minute (GPT-3.5)

### Anthropic Claude API

**Models Used:**
- Claude Opus (`claude-3-opus-20240229`) - Most capable
- Claude Sonnet (`claude-3-sonnet-20240229`) - Balanced
- Claude Haiku (`claude-3-haiku-20240307`) - Fast & cheap

**Configuration:**
```typescript
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 60000,
  maxRetries: 3,
})
```

**Cost per 1M tokens:**
- Claude Opus: $15 (input), $75 (output)
- Claude Sonnet: $3 (input), $15 (output)
- Claude Haiku: $0.25 (input), $1.25 (output)

**Rate Limits (Tier 2):**
- Requests: 4,000/minute
- Tokens: 400,000/minute

### Model Router

```typescript
// Intelligent model selection based on complexity

class ModelRouter {
  selectModel(context: RequestContext): AIModel {
    const complexity = this.analyzeComplexity(context)
    const tokenCount = this.estimateTokens(context)

    if (complexity === 'expert' && tokenCount > 50000) {
      return AIModel.CLAUDE_OPUS  // Large context
    } else if (complexity === 'expert') {
      return AIModel.GPT4_TURBO   // Complex reasoning
    } else if (complexity === 'standard') {
      return AIModel.CLAUDE_SONNET // Balanced
    } else {
      return AIModel.GPT35_TURBO  // Simple & fast
    }
  }
}
```

### Fallback Chain

```typescript
// Automatic failover if primary model fails

const FALLBACK_CHAINS = {
  [AIModel.GPT4_TURBO]: [AIModel.GPT4, AIModel.CLAUDE_SONNET],
  [AIModel.CLAUDE_OPUS]: [AIModel.CLAUDE_SONNET, AIModel.GPT4],
  [AIModel.GPT35_TURBO]: [AIModel.CLAUDE_HAIKU],
}
```

---

## Email Services

### Resend

**Service:** Resend
**Website:** https://resend.com
**Plan:** Pay-as-you-go

**Configuration:**
```typescript
const resend = new Resend(process.env.RESEND_API_KEY)
```

**Verified Domain:** `btrme.com`

**Email Types:**
- Welcome email (new user signup)
- Email verification
- Password reset
- Project generation complete
- Weekly summary (optional)

**Rate Limits:**
- 100 emails/second
- 50,000 emails/day (can be increased)

**Deliverability:**
- DKIM: Configured
- SPF: Configured
- DMARC: Configured
- Bounce handling: Automatic
- Spam score monitoring: Yes

---

## Monitoring & Logging

### Sentry (Error Tracking)

**Configuration:**
```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,  // 10% of transactions
  beforeSend(event, hint) {
    // Filter sensitive data
    return event
  }
})
```

**Features:**
- Error tracking (frontend + backend)
- Performance monitoring
- User feedback
- Release tracking
- Source map support

### Vercel Analytics

**Metrics Tracked:**
- Core Web Vitals (LCP, FID, CLS, TTFB)
- Page views
- Unique visitors
- Geo distribution
- Device/browser breakdown

### Application Logs

```typescript
// Structured logging with Winston

logger.info('User signup', {
  userId: user.id,
  method: 'google',
  timestamp: new Date().toISOString()
})

logger.error('AI generation failed', {
  projectId,
  model: 'gpt-4',
  error: error.message,
  stack: error.stack
})
```

**Log Levels:**
- ERROR: Critical issues
- WARN: Potential issues
- INFO: Important events
- DEBUG: Development only (disabled in production)

---

## CDN & Edge Network

### Vercel Edge Network

**Global Coverage:** 300+ edge locations worldwide
**Primary Regions:**
- North America (IAD1, SFO1)
- Europe (FRA1, LHR1)
- Asia (HKG1, SIN1, NRT1)
- South America (GRU1)

**Cached Assets:**
- Static files (JS, CSS, images)
- Next.js static pages
- API responses (with Cache-Control headers)

**Cache Headers:**
```typescript
// next.config.js
headers: [
  {
    source: '/static/:path*',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable'
      }
    ]
  },
  {
    source: '/api/templates',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, s-maxage=300, stale-while-revalidate=600'
      }
    ]
  }
]
```

---

## Security

### SSL/TLS

- **Protocol:** TLS 1.3
- **Certificate:** Auto-managed by Vercel (Let's Encrypt)
- **Renewal:** Automatic (every 90 days)
- **HSTS:** Enabled (max-age=31536000)

### DDoS Protection

- **Provider:** Vercel (included)
- **Rate limiting:** 100 requests/minute per IP (API routes)
- **Edge throttling:** Automatic

### WAF (Web Application Firewall)

- **SQL Injection:** Protected (Prisma parameterized queries)
- **XSS:** Protected (React auto-escaping + CSP headers)
- **CSRF:** Protected (NextAuth.js tokens)

---

## Backup & Disaster Recovery

### Database Backups

- **Frequency:** Daily (automated)
- **Retention:** 7 days
- **Type:** Full backup + PITR
- **Storage:** Separate from main database
- **Restoration Time:** ~10 minutes

### Application Backups

- **Source Code:** Git (GitHub)
- **Deployments:** Immutable (can rollback instantly)
- **Environment Variables:** Stored in Vercel + 1Password

### Disaster Recovery Plan

**RTO (Recovery Time Objective):** 1 hour
**RPO (Recovery Point Objective):** 24 hours (daily backups)

**Recovery Steps:**
1. Identify issue scope
2. Switch DNS to maintenance page (if needed)
3. Restore database from backup
4. Rollback to previous deployment
5. Verify functionality
6. Update status page
7. Post-mortem

---

## Scaling Strategy

### Horizontal Scaling

**Current:** Serverless (auto-scales)
**Limit:** No practical limit (Vercel Pro)

### Database Scaling

**Current:** 0.25 - 2 CU (auto-scales)
**Next tier:** Scale to 4 CU if needed
**Read replicas:** Available if needed

### Cache Scaling

**Current:** 256 MB Redis
**Next tier:** Scale to 1 GB if needed

### Cost Scaling Triggers

- **Database:** > 2 CU average → Consider optimization
- **AI API:** > $500/month → Review usage patterns
- **Redis:** > 80% memory → Scale up

---

## Cost Analysis

### Monthly Cost Breakdown (Estimated)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Vercel | Pro (1 user) | $20 |
| Neon PostgreSQL | Pro (0.5 CU avg) | $69 |
| Upstash Redis | Pay-as-you-go | $10-30 |
| OpenAI API | Pay-as-you-go | $100-500 |
| Anthropic Claude | Pay-as-you-go | $50-200 |
| Resend | Pay-as-you-go | $5-20 |
| Sentry | Team | $26 |
| **Total** | | **$280-865/month** |

### Cost Optimization Strategies

1. **Cache aggressively** (reduce database queries)
2. **Use cheaper AI models** when possible
3. **Optimize prompts** (reduce token usage)
4. **Compress cached data** (reduce Redis memory)
5. **Monitor usage** (set up billing alerts)

---

## Infrastructure Diagram

```
                                    ┌─────────────────────┐
                                    │       Users         │
                                    └──────────┬──────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    │      Vercel Edge Network (Global CDN)              │
                    │      - 300+ locations                              │
                    │      - DDoS protection                             │
                    │      - SSL/TLS termination                         │
                    └──────────────────────────┬──────────────────────────┘
                                               │
                    ┌──────────────────────────▼──────────────────────────┐
                    │      Vercel Compute (Serverless)                    │
                    │      - Next.js 14 App Router                        │
                    │      - Auto-scaling                                 │
                    │      - Edge Middleware                              │
                    └───┬──────────┬──────────┬──────────┬───────────────┘
                        │          │          │          │
          ┌─────────────┴──────┬───┴──────┬───┴──────┬───┴─────────────┐
          │                    │          │          │                 │
    ┌─────▼─────┐      ┌──────▼──────┐ ┌─▼──────┐ ┌─▼──────┐  ┌──────▼──────┐
    │   Neon    │      │   Upstash   │ │OpenAI  │ │Anthropic│  │   Resend    │
    │    PG     │      │    Redis    │ │  API   │ │ Claude  │  │   Email     │
    │           │      │             │ │        │ │   API   │  │             │
    │ US-EAST-2 │      │  US-EAST-1  │ │US-EAST │ │ US-EAST │  │   Global    │
    │           │      │             │ │        │ │         │  │             │
    │ - Pooling │      │ - Eviction  │ │- Retry │ │- Retry  │  │ - DKIM/SPF  │
    │ - Indexes │      │ - TTL Cache │ │- Fallbk│ │- Fallbk │  │ - Bounce    │
    │ - Backups │      │ - Tag Invld │ │- Queue │ │- Queue  │  │   Handling  │
    └───────────┘      └─────────────┘ └────────┘ └─────────┘  └─────────────┘
          │                    │            │          │              │
          └────────────────────┼────────────┼──────────┼──────────────┘
                               │            │          │
                    ┌──────────▼────────────▼──────────▼──────────┐
                    │       Monitoring & Logging                   │
                    │  - Sentry (Errors)                          │
                    │  - Vercel Analytics (Performance)           │
                    │  - Application Logs                         │
                    └─────────────────────────────────────────────┘
```

---

**Document Version:** 1.0.0
**Last Reviewed:** 2025-11-13
**Next Review:** 2025-12-13
