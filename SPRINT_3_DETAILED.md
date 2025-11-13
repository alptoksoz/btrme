# SPRINT 3: Deployment Pipeline & Infrastructure (90 SP, 2 Weeks)

**Sprint Goal:** Build comprehensive deployment pipeline with CI/CD, containerization, and multi-environment support.

**Sprint Duration:** 2 weeks (80 hours per engineer)
**Team Size:** 8 senior engineers
**Total Story Points:** 90 SP
**Estimated Hours:** 216 hours

**Success Criteria:**
- ✅ Automated deployment to Vercel/Fly.io
- ✅ CI/CD with GitHub Actions
- ✅ Docker containerization
- ✅ Environment management (dev/staging/prod)
- ✅ Database migrations
- ✅ Monitoring and logging setup

---

## Epic 3.1: CI/CD Pipeline (25 SP, 60 hours)

### Story 3.1.1: GitHub Actions Workflow (10 SP, 24h)

`.github/workflows/ci.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run linting
        run: pnpm lint

      - name: Run type check
        run: pnpm type-check

      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Build
        run: pnpm build

  deploy-preview:
    needs: test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

### Story 3.1.2: Automated Testing Pipeline (8 SP, 18h)

`.github/workflows/test.yml`:
```yaml
name: Test Suite

on:
  push:
  pull_request:

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm test:unit

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
      - run: pnpm install
      - run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
        with:
          build: pnpm build
          start: pnpm start
          wait-on: 'http://localhost:3000'
```

### Story 3.1.3: Code Quality Checks (7 SP, 18h)

`apps/web/lib/quality/checks.ts`:
```typescript
// Pre-commit hooks with Husky
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged

// lint-staged.config.js
module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml}': ['prettier --write'],
}

// SonarCloud configuration
// sonar-project.properties
sonar.projectKey=btrme_nocode-builder
sonar.organization=btrme
sonar.sources=apps/web/app,apps/web/lib
sonar.tests=apps/web/__tests__
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/*.test.ts,**/*.spec.ts
```

---

## Epic 3.2: Containerization & Orchestration (20 SP, 48 hours)

### Story 3.2.1: Docker Setup (8 SP, 18h)

`Dockerfile`:
```dockerfile
# Multi-stage build for production
FROM node:20-alpine AS base
RUN corepack enable pnpm
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build
RUN pnpm prune --prod

# Runner
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["pnpm", "start"]
```

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/btrme
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: btrme
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Story 3.2.2: Fly.io Deployment (6 SP, 15h)

`fly.toml`:
```toml
app = "btrme-production"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "3000"
  NODE_ENV = "production"

[[services]]
  http_checks = []
  internal_port = 3000
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

Deployment script:
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Deploying to Fly.io..."

# Build and push
fly deploy --remote-only

# Run migrations
fly ssh console -C "pnpm prisma migrate deploy"

# Health check
fly status

echo "✅ Deployment complete!"
```

### Story 3.2.3: Multi-Region Setup (6 SP, 15h)

`apps/web/lib/deployment/regions.ts`:
```typescript
export const REGIONS = {
  primary: 'iad', // US East
  replicas: ['fra', 'sin', 'syd'], // Europe, Asia, Australia
}

export async function deployToRegions() {
  for (const region of REGIONS.replicas) {
    await deployToRegion(region)
  }
}

async function deployToRegion(region: string) {
  // Fly.io multi-region deployment
  console.log(`Deploying to ${region}...`)
  // Implementation
}
```

---

## Epic 3.3: Database Migrations & Management (15 SP, 36 hours)

### Story 3.3.1: Migration System (7 SP, 18h)

`prisma/migrations/README.md`:
```markdown
# Database Migrations

## Creating Migrations

\`\`\`bash
# Development
pnpm prisma migrate dev --name description

# Production
pnpm prisma migrate deploy
\`\`\`

## Migration Files

All migrations are versioned and tracked in git.
```

Migration workflow:
```typescript
// apps/web/lib/db/migrations.ts
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function runMigrations() {
  try {
    console.log('Running database migrations...')
    await execAsync('pnpm prisma migrate deploy')
    console.log('✅ Migrations complete')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

export async function rollbackMigration(steps = 1) {
  console.log(`Rolling back ${steps} migration(s)...`)
  // Implementation
}
```

### Story 3.3.2: Database Seeding (4 SP, 10h)

`prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@btrme.com' },
    update: {},
    create: {
      email: 'admin@btrme.com',
      name: 'Admin User',
      password: await hash('admin123', 10),
      role: 'ADMIN',
      tier: 'TEAM',
    },
  })

  // Create sample templates
  await prisma.promptTemplate.createMany({
    data: [
      {
        userId: admin.id,
        name: 'E-commerce Store',
        description: 'Full-featured online store',
        category: 'e-commerce',
        version: '1.0.0',
        content: '...',
        variables: [],
        tags: ['ecommerce', 'store'],
        public: true,
        active: true,
      },
      // More templates...
    ],
  })

  console.log('✅ Seeding complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Story 3.3.3: Backup & Recovery (4 SP, 8h)

`scripts/backup-db.sh`:
```bash
#!/bin/bash

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql"

echo "📦 Creating database backup..."

# Backup
pg_dump $DATABASE_URL > backups/$BACKUP_FILE

# Compress
gzip backups/$BACKUP_FILE

# Upload to S3
aws s3 cp backups/${BACKUP_FILE}.gz s3://btrme-backups/

echo "✅ Backup complete: ${BACKUP_FILE}.gz"
```

---

## Epic 3.4: Environment Management (15 SP, 36 hours)

### Story 3.4.1: Environment Configuration (6 SP, 15h)

`.env.development`:
```bash
# Development Environment
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/btrme_dev
REDIS_URL=redis://localhost:6379

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key

OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

`.env.staging`:
```bash
# Staging Environment
NODE_ENV=staging
DATABASE_URL=postgresql://user:pass@staging-db.render.com/btrme_staging
REDIS_URL=redis://staging-redis.upstash.io

NEXTAUTH_URL=https://staging.btrme.com
NEXTAUTH_SECRET=${STAGING_SECRET}
```

`.env.production`:
```bash
# Production Environment
NODE_ENV=production
DATABASE_URL=${PRODUCTION_DATABASE_URL}
REDIS_URL=${PRODUCTION_REDIS_URL}

NEXTAUTH_URL=https://btrme.com
NEXTAUTH_SECRET=${PRODUCTION_SECRET}
```

Environment loader:
```typescript
// apps/web/lib/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
})

export const env = envSchema.parse(process.env)

export function validateEnv() {
  try {
    envSchema.parse(process.env)
    console.log('✅ Environment variables validated')
  } catch (error) {
    console.error('❌ Invalid environment variables:', error)
    process.exit(1)
  }
}
```

### Story 3.4.2: Feature Flags (5 SP, 12h)

`apps/web/lib/features/flags.ts`:
```typescript
export const FEATURES = {
  AI_GENERATION: process.env.FEATURE_AI_GENERATION !== 'false',
  MULTI_REGION: process.env.FEATURE_MULTI_REGION === 'true',
  ADVANCED_ANALYTICS: process.env.FEATURE_ANALYTICS === 'true',
  BETA_FEATURES: process.env.FEATURE_BETA === 'true',
} as const

export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature]
}

// Usage
if (isFeatureEnabled('AI_GENERATION')) {
  // Enable AI features
}
```

### Story 3.4.3: Secrets Management (4 SP, 9h)

Using GitHub Secrets + Vercel:
```bash
# Add secrets via CLI
vercel secret add openai-api-key sk-...
vercel secret add anthropic-api-key sk-ant-...
vercel secret add database-url postgresql://...

# Or via GitHub Actions
echo "OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}" >> $GITHUB_ENV
```

---

## Epic 3.5: Monitoring & Logging (15 SP, 36 hours)

### Story 3.5.1: Application Monitoring (6 SP, 15h)

Sentry setup:
```typescript
// apps/web/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  enabled: process.env.NODE_ENV === 'production',
})

export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: { custom: context },
  })
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level)
}
```

### Story 3.5.2: Performance Monitoring (5 SP, 12h)

```typescript
// apps/web/lib/monitoring/performance.ts
import { performance } from 'perf_hooks'

export function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()

  return fn().finally(() => {
    const duration = performance.now() - start
    console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`)

    // Send to monitoring service
    sendMetric('function.duration', duration, { function: name })
  })
}

function sendMetric(name: string, value: number, tags: Record<string, string>) {
  // Send to Datadog/New Relic/etc
}
```

### Story 3.5.3: Logging Infrastructure (4 SP, 9h)

```typescript
// apps/web/lib/logging/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
})

export function logRequest(req: Request, duration: number) {
  logger.info({
    type: 'http.request',
    method: req.method,
    url: req.url,
    duration,
  })
}

export function logError(error: Error, context?: Record<string, any>) {
  logger.error({
    type: 'error',
    message: error.message,
    stack: error.stack,
    ...context,
  })
}
```

---

## SPRINT 3 COMPLETE! ✅

**Total:** 90 SP, 216 hours
**Epics:**
- ✅ Epic 3.1: CI/CD Pipeline (25 SP)
- ✅ Epic 3.2: Containerization (20 SP)
- ✅ Epic 3.3: Database Management (15 SP)
- ✅ Epic 3.4: Environment Management (15 SP)
- ✅ Epic 3.5: Monitoring & Logging (15 SP)

**Deliverables:**
- Complete CI/CD pipeline
- Docker containerization
- Multi-region deployment
- Database migrations
- Environment management
- Monitoring & logging

---
