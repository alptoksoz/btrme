# BTRMe Production Deployment Guide

> **Version:** 1.0.0
> **Last Updated:** 2025-11-13
> **Target Environment:** Production

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Environment Setup](#environment-setup)
5. [Database Setup](#database-setup)
6. [Service Deployment](#service-deployment)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Rollback Procedures](#rollback-procedures)
9. [Monitoring & Alerts](#monitoring--alerts)

---

## Overview

This guide provides step-by-step instructions for deploying BTRMe (NoCode AI Builder) to production. The deployment architecture uses:

- **Frontend/Backend:** Vercel (Next.js 14 App Router)
- **Database:** Neon Serverless PostgreSQL
- **Cache:** Upstash Redis
- **Monitoring:** Sentry (errors), Vercel Analytics (performance)
- **CI/CD:** GitHub Actions
- **DNS/CDN:** Vercel Edge Network

**Deployment Timeline:** ~2-3 hours (initial deployment)

---

## Prerequisites

### Required Accounts & Services

- [ ] **Vercel Account** (Pro plan recommended for production)
- [ ] **Neon PostgreSQL** (Pro plan for production databases)
- [ ] **Upstash Redis** (Pay-as-you-go plan)
- [ ] **OpenAI Account** (with API access and billing)
- [ ] **Anthropic Account** (Claude API access)
- [ ] **Sentry Account** (for error tracking)
- [ ] **GitHub Repository** (with Actions enabled)

### Required Tools

```bash
# Node.js and pnpm
node --version  # v20.x or higher
pnpm --version  # v8.x or higher

# Vercel CLI
pnpm install -g vercel

# Database migration tools
pnpm install -g prisma

# Git
git --version  # v2.x or higher
```

### Domain Setup

- [ ] Domain registered and verified
- [ ] DNS access for configuration
- [ ] SSL certificate (handled by Vercel automatically)

---

## Pre-Deployment Checklist

### Code Quality

```bash
# Run all checks locally before deploying
pnpm install
pnpm lint           # ESLint checks
pnpm format:check   # Prettier formatting
pnpm type-check     # TypeScript compilation
pnpm test           # Unit tests (80%+ coverage)
pnpm test:e2e       # E2E tests with Playwright
pnpm build          # Production build test
```

**Required Results:**
- ✅ Zero linting errors
- ✅ Zero TypeScript errors
- ✅ Test coverage ≥ 80%
- ✅ All E2E tests passing
- ✅ Build size < 300KB (main bundle)

### Security Review

- [ ] All secrets moved to environment variables
- [ ] No hardcoded API keys in codebase
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled on all public APIs
- [ ] SQL injection protection (using Prisma parameterized queries)
- [ ] XSS protection (React automatic escaping + CSP headers)
- [ ] CSRF protection (NextAuth.js built-in)
- [ ] Authentication flows tested (signup, login, password reset)
- [ ] Authorization rules tested (RBAC for admin features)

### Performance Benchmarks

```bash
# Run Lighthouse audit
pnpm lighthouse https://staging.btrme.com

# Target Scores (minimum):
# - Performance: ≥ 90
# - Accessibility: ≥ 95
# - Best Practices: ≥ 95
# - SEO: ≥ 90
```

**Core Web Vitals Targets:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- TTFB (Time to First Byte): < 600ms

---

## Environment Setup

### Step 1: Create Production Environment Variables

Create a `.env.production` file (DO NOT commit to git):

```bash
# ===================================
# Application
# ===================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://btrme.com
NEXT_PUBLIC_API_URL=https://btrme.com/api

# ===================================
# Database (Neon PostgreSQL)
# ===================================
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/btrme?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/btrme?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/btrme?sslmode=require"

# ===================================
# Redis (Upstash)
# ===================================
REDIS_URL=https://xxx.upstash.io
REDIS_TOKEN=AXxx...

# ===================================
# Authentication (NextAuth.js)
# ===================================
NEXTAUTH_URL=https://btrme.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.xxx
GITHUB_CLIENT_SECRET=xxx

# ===================================
# AI Models
# ===================================
# OpenAI
OPENAI_API_KEY=sk-proj-xxx
OPENAI_ORGANIZATION_ID=org-xxx

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-xxx

# ===================================
# Email (Resend)
# ===================================
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@btrme.com

# ===================================
# Monitoring
# ===================================
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx
SENTRY_ORG=btrme
SENTRY_PROJECT=web

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxx

# ===================================
# Feature Flags
# ===================================
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_MARKETPLACE=true
NEXT_PUBLIC_ENABLE_COLLABORATION=false

# ===================================
# Rate Limiting
# ===================================
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# ===================================
# Storage (Optional - for file uploads)
# ===================================
AWS_S3_BUCKET=btrme-production
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
```

### Step 2: Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate encryption keys if needed
openssl rand -hex 32
```

### Step 3: Configure Vercel Environment Variables

```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Add environment variables to Vercel (production)
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add OPENAI_API_KEY production
vercel env add ANTHROPIC_API_KEY production
vercel env add NEXTAUTH_SECRET production
# ... (add all variables from .env.production)

# Verify variables
vercel env ls
```

---

## Database Setup

### Step 1: Create Neon PostgreSQL Database

```bash
# 1. Go to https://console.neon.tech
# 2. Create new project: "btrme-production"
# 3. Region: Select closest to your users (e.g., us-east-1)
# 4. Compute size: 0.5 CU (can scale up later)
# 5. Copy connection strings:
#    - Pooled connection → DATABASE_URL
#    - Direct connection → DIRECT_URL
```

**Neon Production Configuration:**
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy search

-- Verify extensions
SELECT * FROM pg_extension;
```

### Step 2: Run Database Migrations

```bash
# Set production database URL
export DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/btrme?sslmode=require"

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# Verify migration status
pnpm prisma migrate status
```

**Expected Output:**
```
✔ 15 migrations applied successfully
```

### Step 3: Seed Initial Data (Optional)

```bash
# Seed production database with initial data
pnpm prisma db seed

# Seed includes:
# - Default templates (5 templates)
# - Template categories
# - Default user roles
# - System settings
```

### Step 4: Create Database Indexes

```sql
-- Performance indexes (already in migrations, verify they exist)
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON "Project"("userId");
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON "Project"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_generations_project_id ON "Generation"("projectId");
CREATE INDEX IF NOT EXISTS idx_generations_status ON "Generation"("status");
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON "Generation"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_templates_category ON "Template"("category");
CREATE INDEX IF NOT EXISTS idx_templates_published ON "Template"("published");
CREATE INDEX IF NOT EXISTS idx_users_email ON "User"("email");
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON "Session"("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON "Session"("expires");

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_templates_name_trgm ON "Template" USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_templates_description_trgm ON "Template" USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_projects_name_trgm ON "Project" USING gin(name gin_trgm_ops);

-- Verify indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Step 5: Configure Connection Pooling

```javascript
// lib/db/prisma.ts - Already configured in codebase
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Uses connection pooling
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Step 6: Database Backup Configuration

```bash
# Neon provides automatic backups
# Configure backup retention:
# 1. Go to Neon Console → Project Settings
# 2. Enable Point-in-Time Recovery (PITR)
# 3. Set retention: 7 days (recommended for production)
# 4. Enable automatic snapshots: Daily at 2 AM UTC
```

---

## Service Deployment

### Step 1: Deploy to Vercel (Staging First)

```bash
# Deploy to staging
vercel deploy --env=staging

# Expected output:
# ✔ Deployment ready [52s]
# https://btrme-staging-xxx.vercel.app
```

**Verify Staging Deployment:**
```bash
# Test key endpoints
curl https://btrme-staging-xxx.vercel.app/api/health
# Expected: {"status":"ok","timestamp":"2025-11-13T..."}

curl https://btrme-staging-xxx.vercel.app/api/auth/providers
# Expected: {"google":{...},"github":{...}}

# Test database connection
curl https://btrme-staging-xxx.vercel.app/api/db-health
# Expected: {"status":"ok","database":"connected"}
```

### Step 2: Run Smoke Tests on Staging

```bash
# Set staging URL
export PLAYWRIGHT_BASE_URL=https://btrme-staging-xxx.vercel.app

# Run E2E tests against staging
pnpm test:e2e

# Expected: All tests passing
```

**Manual Testing Checklist:**
- [ ] Homepage loads correctly
- [ ] User signup flow works
- [ ] User login flow works
- [ ] Google OAuth works
- [ ] GitHub OAuth works
- [ ] Create new project
- [ ] Generate code with AI
- [ ] View generation results
- [ ] Iterate on generation
- [ ] Template marketplace loads
- [ ] Template preview works
- [ ] User profile updates
- [ ] Settings page works
- [ ] Logout works

### Step 3: Deploy to Production

```bash
# Deploy to production (with confirmation)
vercel deploy --prod

# Confirm deployment
# ✔ Production deployment ready [52s]
# https://btrme.com
```

### Step 4: Configure Custom Domain

```bash
# Add domain in Vercel dashboard
# 1. Go to Project Settings → Domains
# 2. Add domain: btrme.com
# 3. Add domain: www.btrme.com (redirect to btrme.com)
# 4. Vercel provides DNS instructions

# Update DNS records at your domain registrar:
# A record:     @     →  76.76.21.21 (Vercel)
# CNAME record: www   →  cname.vercel-dns.com
```

**DNS Propagation Check:**
```bash
# Wait for DNS propagation (5-10 minutes)
dig btrme.com
dig www.btrme.com

# Verify SSL certificate (automatic via Vercel)
curl -I https://btrme.com
# Expected: HTTP/2 200, certificate valid
```

### Step 5: Configure Redis (Upstash)

```bash
# 1. Go to https://console.upstash.com
# 2. Create new database: "btrme-production"
# 3. Region: Select same region as Neon database
# 4. Type: Pay As You Go
# 5. TLS: Enabled
# 6. Eviction: allkeys-lru (recommended)
# 7. Copy REDIS_URL and REDIS_TOKEN

# Test Redis connection
curl https://btrme.com/api/cache-health
# Expected: {"status":"ok","cache":"connected","hitRate":0}
```

### Step 6: Configure Monitoring (Sentry)

```bash
# Install Sentry Wizard
pnpm add -g @sentry/wizard

# Configure Sentry (if not already done)
npx @sentry/wizard@latest -i nextjs

# Create production release
export SENTRY_AUTH_TOKEN=sntrys_xxx
pnpm sentry-cli releases new v1.0.0
pnpm sentry-cli releases set-commits v1.0.0 --auto
pnpm sentry-cli releases finalize v1.0.0

# Deploy release
pnpm sentry-cli releases deploys v1.0.0 new -e production
```

**Sentry Configuration Verification:**
```bash
# Test error tracking
curl -X POST https://btrme.com/api/test-sentry
# Check Sentry dashboard for test error
```

---

## Post-Deployment Verification

### Health Check Endpoints

```bash
# 1. Application health
curl https://btrme.com/api/health
# Expected: {"status":"ok","version":"1.0.0","uptime":123}

# 2. Database health
curl https://btrme.com/api/db-health
# Expected: {"status":"ok","database":"connected","latency":12}

# 3. Cache health
curl https://btrme.com/api/cache-health
# Expected: {"status":"ok","cache":"connected","hitRate":0.85}

# 4. AI models health
curl https://btrme.com/api/ai-health
# Expected: {"status":"ok","models":{"openai":"ok","anthropic":"ok"}}
```

### Performance Verification

```bash
# Run Lighthouse audit on production
lighthouse https://btrme.com --view

# Verify Core Web Vitals in Vercel Analytics
# 1. Go to Vercel Dashboard → Analytics
# 2. Check Real Experience Score (should be ≥ 90)
# 3. Monitor LCP, FID, CLS metrics
```

### Load Testing (Optional)

```bash
# Install k6
brew install k6  # macOS
# or download from https://k6.io/docs/getting-started/installation/

# Run load test
k6 run scripts/load-test.js

# Target metrics:
# - 1000 virtual users
# - 95th percentile response time < 500ms
# - Error rate < 1%
```

### Security Verification

```bash
# 1. SSL/TLS check
curl -I https://btrme.com
# Expected: TLS 1.3, valid certificate

# 2. Security headers
curl -I https://btrme.com
# Verify headers:
# - Strict-Transport-Security: max-age=31536000
# - X-Frame-Options: DENY
# - X-Content-Type-Options: nosniff
# - X-XSS-Protection: 1; mode=block
# - Content-Security-Policy: default-src 'self'

# 3. OWASP ZAP scan (optional)
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://btrme.com
```

---

## Rollback Procedures

### Immediate Rollback (< 5 minutes)

```bash
# Option 1: Rollback via Vercel CLI
vercel rollback

# Option 2: Rollback via Vercel Dashboard
# 1. Go to Deployments
# 2. Find previous stable deployment
# 3. Click "Promote to Production"

# Verify rollback
curl https://btrme.com/api/health
# Check version number matches previous deployment
```

### Database Rollback (if needed)

```bash
# CAUTION: Only if database migration caused issues

# 1. Connect to database
psql $DATABASE_URL

# 2. Check migration history
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 5;

# 3. Rollback last migration (manual - create down migration)
# Note: Prisma doesn't support automatic rollbacks
# You need to create a new migration that reverses changes

# 4. Apply rollback migration
pnpm prisma migrate deploy
```

### Cache Clear (if needed)

```bash
# Clear all Redis cache
curl -X POST https://btrme.com/api/admin/cache/clear \
  -H "Authorization: Bearer $ADMIN_API_KEY"

# Or via Upstash Console:
# 1. Go to Upstash Console
# 2. Select btrme-production database
# 3. Click "Data Browser"
# 4. Run command: FLUSHDB
```

---

## Monitoring & Alerts

### Vercel Monitoring

**Automatic Monitoring (included):**
- Deployment status
- Build logs
- Runtime logs
- Analytics (Core Web Vitals)
- Error rates

**Configure Alerts:**
```bash
# In Vercel Dashboard → Settings → Notifications:
# 1. Deployment failures → Email/Slack
# 2. Build errors → Email/Slack
# 3. High error rate (> 5%) → Email/Slack/PagerDuty
# 4. Poor Core Web Vitals → Email
```

### Sentry Error Monitoring

**Configure Alert Rules:**
```yaml
# In Sentry → Alerts → Create Alert Rule:

Alert 1: High Error Rate
- Conditions:
  - Error count > 100 in 5 minutes
- Actions:
  - Send email to on-call engineer
  - Send Slack message to #alerts

Alert 2: Critical Error
- Conditions:
  - Error level = fatal
- Actions:
  - Send PagerDuty alert
  - Send email to team

Alert 3: Performance Degradation
- Conditions:
  - P95 transaction duration > 3000ms
- Actions:
  - Send Slack message to #performance
```

### Uptime Monitoring

**Set up external monitoring (recommended):**

```bash
# Option 1: Vercel Pro includes uptime monitoring

# Option 2: Use UptimeRobot (free)
# 1. Go to https://uptimerobot.com
# 2. Add monitor:
#    - Type: HTTPS
#    - URL: https://btrme.com/api/health
#    - Interval: 5 minutes
#    - Alert contacts: Email/SMS/Slack

# Option 3: Use Pingdom or StatusPage.io
```

### Database Monitoring

**Neon Console Metrics:**
- Active connections
- Query performance
- Storage usage
- IOPS

**Set up alerts:**
```bash
# In Neon Console → Monitoring:
# 1. Active connections > 80 → Alert
# 2. Storage usage > 90% → Alert
# 3. High query latency (p95 > 100ms) → Alert
```

### Redis Monitoring

**Upstash Console Metrics:**
- Memory usage
- Commands per second
- Hit rate
- Latency

**Target metrics:**
- Hit rate > 80%
- P99 latency < 5ms
- Memory usage < 80%

---

## Maintenance Windows

### Recommended Schedule

```
- Database migrations: Tuesdays, 2-4 AM UTC (low traffic)
- Dependency updates: Weekly, automated via Dependabot
- Major version upgrades: Monthly, during maintenance window
- Security patches: ASAP (emergency deployment)
```

### Maintenance Checklist

**Weekly:**
- [ ] Review error rates in Sentry
- [ ] Check Core Web Vitals trends
- [ ] Verify backup completion
- [ ] Review security alerts

**Monthly:**
- [ ] Update dependencies
- [ ] Review and optimize slow queries
- [ ] Database vacuum and analyze
- [ ] Review and archive old data
- [ ] Load testing
- [ ] Security audit

**Quarterly:**
- [ ] Disaster recovery drill
- [ ] Capacity planning review
- [ ] Cost optimization review
- [ ] Update documentation

---

## Support Contacts

**Emergency Contacts:**
- On-call Engineer: [Email/Phone]
- DevOps Lead: [Email/Phone]
- CTO: [Email/Phone]

**Service Support:**
- Vercel Support: https://vercel.com/support (Pro plan)
- Neon Support: support@neon.tech
- Upstash Support: support@upstash.com
- OpenAI Support: https://help.openai.com
- Anthropic Support: support@anthropic.com

**Documentation:**
- BTRMe Docs: https://docs.btrme.com
- Runbook: RUNBOOK.md
- API Docs: https://btrme.com/api-docs

---

## Appendix

### Deployment Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          Internet                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Vercel Edge   │ (CDN + SSL)
              │    Network     │
              └────────┬───────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │   Next.js 14 App        │
         │   (Server + Client)     │
         │   - React 18            │
         │   - TypeScript          │
         │   - Tailwind CSS        │
         └──┬──────────┬───────┬──┘
            │          │       │
            ▼          ▼       ▼
    ┌───────────┐ ┌────────┐ ┌──────────┐
    │  Neon PG  │ │ Upstash│ │   AI     │
    │ (Database)│ │ Redis  │ │  Models  │
    │           │ │(Cache) │ │          │
    └───────────┘ └────────┘ │ OpenAI   │
                              │ Claude   │
                              └──────────┘
            │          │
            ▼          ▼
    ┌───────────┐ ┌────────┐
    │  Sentry   │ │Vercel  │
    │  (Errors) │ │Analytics│
    └───────────┘ └────────┘
```

### Cost Estimates (Monthly)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Pro | $20/user ($20 for 1 user) |
| Neon PostgreSQL | Pro | $69 (0.5 CU + storage) |
| Upstash Redis | Pay-as-you-go | ~$10-30 (based on usage) |
| OpenAI API | Pay-as-you-go | ~$100-500 (based on usage) |
| Anthropic Claude | Pay-as-you-go | ~$50-200 (based on usage) |
| Sentry | Team | $26/month |
| Total | | **~$275-845/month** |

*Note: AI costs vary significantly based on usage volume*

---

**Document Version:** 1.0.0
**Last Reviewed:** 2025-11-13
**Next Review:** 2025-12-13
