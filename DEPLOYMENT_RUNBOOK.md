# Deployment Runbook
## BTRMe NoCode AI Builder Platform

**Document Version:** 1.0
**Last Updated:** 2025-11-13
**Owner:** DevOps Team
**Target Audience:** Engineers, DevOps, On-Call Engineers

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Environments](#environments)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Deployment Procedures](#deployment-procedures)
5. [Database Migrations](#database-migrations)
6. [Rollback Procedures](#rollback-procedures)
7. [Health Checks & Verification](#health-checks--verification)
8. [Incident Response](#incident-response)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Monitoring & Alerting](#monitoring--alerting)
11. [Emergency Contacts](#emergency-contacts)

---

## Deployment Overview

### Architecture

BTRMe runs on a multi-service architecture:

```
┌─────────────────────────────────────────────────────┐
│                   Cloudflare CDN                     │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│              Vercel (Next.js Frontend)               │
│  - Static site generation                            │
│  - API routes (/api/*)                               │
│  - Server components                                 │
└─────────────────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
    ┌────────┐      ┌──────────┐    ┌─────────┐
    │ Neon   │      │ Upstash  │    │ OpenAI  │
    │ (DB)   │      │ (Redis)  │    │ API     │
    └────────┘      └──────────┘    └─────────┘
```

### Deployment Pipeline

```mermaid
graph LR
    A[Local Dev] --> B[Push to GitHub]
    B --> C[CI Tests Run]
    C --> D{Tests Pass?}
    D -->|No| E[Fix & Retry]
    D -->|Yes| F[Deploy to Staging]
    F --> G[E2E Tests]
    G --> H{Tests Pass?}
    H -->|No| E
    H -->|Yes| I[Manual Approval]
    I --> J[Deploy to Production]
    J --> K[Health Checks]
    K --> L{Healthy?}
    L -->|No| M[Auto Rollback]
    L -->|Yes| N[Complete]
```

### Deployment Frequency

- **Production:** 2-3 times per week (Tue, Thu)
- **Staging:** Multiple times per day (continuous)
- **Hotfixes:** As needed (any time)

### Deployment Windows

- **Regular Deployments:** 10 AM - 4 PM PST (Tuesday/Thursday)
- **Avoid:** Fridays, weekends, holidays
- **Emergency Hotfixes:** Anytime with approval

---

## Environments

### Local Development

**Purpose:** Developer workstations

**Configuration:**
```bash
# .env.local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/btrme_dev
REDIS_URL=redis://localhost:6379
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
```

**Access:**
- Database: `localhost:5432`
- Redis: `localhost:6379`
- Application: `http://localhost:3000`

### Staging

**Purpose:** Pre-production testing and QA

**Configuration:**
```bash
# Environment variables in Vercel
DATABASE_URL=postgresql://...neon.tech/btrme_staging
REDIS_URL=https://...upstash.io
NEXTAUTH_URL=https://staging.btrme.com
OPENAI_API_KEY=sk-...
```

**Access:**
- URL: `https://staging.btrme.com`
- Database: Neon (btrme_staging)
- Redis: Upstash (staging instance)

**Deployment:**
- Automatic on merge to `develop` branch
- GitHub Actions triggers deployment
- E2E tests run automatically

### Production

**Purpose:** Live customer-facing environment

**Configuration:**
```bash
# Environment variables in Vercel
DATABASE_URL=postgresql://...neon.tech/btrme_production
REDIS_URL=https://...upstash.io
NEXTAUTH_URL=https://btrme.com
OPENAI_API_KEY=sk-...
SENTRY_DSN=https://...sentry.io
```

**Access:**
- URL: `https://btrme.com`
- Database: Neon (btrme_production with read replicas)
- Redis: Upstash (production cluster)

**Deployment:**
- Manual approval required
- Merge to `main` branch
- Canary deployment (10% → 50% → 100%)

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All CI tests pass (unit, integration, E2E)
- [ ] Code review approved by at least 2 engineers
- [ ] No linting or type errors
- [ ] Code coverage meets threshold (>80%)
- [ ] Security scan passes (Snyk)

### Testing

- [ ] Manual testing completed
- [ ] E2E tests pass on staging
- [ ] Performance tests pass (load testing)
- [ ] Regression testing completed
- [ ] New features tested with real data

### Database

- [ ] Database migrations tested on staging
- [ ] Backup created before migration
- [ ] Migration is reversible (down migration exists)
- [ ] No breaking schema changes
- [ ] Indexes created for new queries

### Documentation

- [ ] CHANGELOG.md updated
- [ ] API documentation updated
- [ ] User-facing documentation updated
- [ ] Runbook updated (if procedures changed)

### Communication

- [ ] Team notified in #engineering Slack channel
- [ ] Customer-facing changes communicated to support team
- [ ] Release notes drafted
- [ ] Product team informed

### Rollback Plan

- [ ] Rollback procedure documented
- [ ] Previous deployment artifacts available
- [ ] Database rollback plan ready
- [ ] Team knows how to execute rollback

---

## Deployment Procedures

### Deploying to Staging

#### Automatic Deployment

Staging deploys automatically when you merge to `develop`:

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push to GitHub
git push origin feature/my-feature

# 4. Create PR to develop branch
gh pr create --base develop --title "Add new feature"

# 5. After approval, merge PR
# Staging deployment triggers automatically
```

#### Manual Staging Deployment

If you need to deploy without merging:

```bash
# Trigger deployment manually via Vercel CLI
pnpm vercel --prod=false
```

#### Verification

After staging deployment:

```bash
# 1. Check deployment status
curl https://staging.btrme.com/api/health

# 2. Run E2E tests
pnpm test:e2e:staging

# 3. Manual smoke testing
# - Create new project
# - Generate code
# - Iterate on code
# - Deploy project
```

### Deploying to Production

#### Standard Production Deployment

Production deploys require manual approval:

```bash
# 1. Ensure staging is stable for 24+ hours
# 2. Create PR from develop to main
git checkout develop
git pull origin develop
git checkout main
git pull origin main
git checkout -b release/v1.2.0
git merge develop
git push origin release/v1.2.0

# 3. Create release PR
gh pr create --base main --title "Release v1.2.0" --body "$(cat RELEASE_NOTES.md)"

# 4. Get approvals (requires 2 approvals)
# 5. Merge to main
# 6. Deployment triggers automatically with canary strategy
```

#### Canary Deployment Strategy

Production uses gradual rollout:

1. **10% Traffic (5 minutes)**
   - Monitor error rates
   - Check response times
   - Verify health checks

2. **50% Traffic (15 minutes)**
   - Continue monitoring
   - Check user feedback
   - Verify all services healthy

3. **100% Traffic**
   - Full rollout
   - Post-deployment verification

#### Production Deployment Command

```bash
# Via Vercel CLI (if needed)
pnpm vercel --prod

# Monitor deployment
vercel logs --prod --follow
```

### Hotfix Deployment

For critical bugs in production:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# 2. Make minimal changes to fix issue
git add .
git commit -m "fix: resolve critical bug"
git push origin hotfix/critical-bug-fix

# 3. Create PR to main (emergency approval process)
gh pr create --base main --title "HOTFIX: Critical bug" --label "hotfix"

# 4. After approval, merge and deploy
# 5. Backport to develop
git checkout develop
git merge hotfix/critical-bug-fix
git push origin develop
```

---

## Database Migrations

### Migration Strategy

**Development:**
```bash
# Create migration
pnpm prisma migrate dev --name add_user_preferences

# Preview migration SQL
pnpm prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script
```

**Staging:**
```bash
# Deploy migrations
pnpm prisma migrate deploy

# Verify migration
pnpm prisma migrate status
```

**Production:**
```bash
# 1. Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test migration on staging first
# 3. Run migration during low-traffic window
pnpm prisma migrate deploy

# 4. Verify migration
pnpm prisma migrate status

# 5. Check application health
curl https://btrme.com/api/health
```

### Migration Best Practices

#### Safe Migrations

**✅ DO: Add columns with defaults**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String
  // Safe: New column with default value
  theme     String   @default("light")
}
```

**✅ DO: Make columns nullable first**
```prisma
// Step 1: Add nullable column
model User {
  newField  String?
}

// Step 2: Backfill data
// Step 3: Make non-nullable in next release
model User {
  newField  String
}
```

**❌ DON'T: Drop columns immediately**
```prisma
// Bad: Immediate column drop
model User {
  id    String
  email String
  // name String  <- Don't drop immediately
}

// Good: Deprecate first, drop later
// Release 1: Mark as deprecated in code
// Release 2: Ensure no code uses it
// Release 3: Drop column
```

#### Rollback Migrations

Always create down migrations:

```sql
-- up.sql
ALTER TABLE users ADD COLUMN theme VARCHAR(10) DEFAULT 'light';

-- down.sql
ALTER TABLE users DROP COLUMN theme;
```

### Emergency Migration Rollback

```bash
# 1. Restore database backup
pg_restore -d $DATABASE_URL backup_YYYYMMDD_HHMMSS.sql

# 2. Revert application code
git revert <commit-hash>
git push origin main

# 3. Trigger redeployment
pnpm vercel --prod
```

---

## Rollback Procedures

### When to Rollback

Rollback immediately if:
- Error rate > 5%
- Response time > 2x baseline
- Critical feature broken
- Data integrity issues
- Security vulnerability discovered

### Automatic Rollback

Vercel automatic rollback triggers on:
- Health check failures
- Error rate threshold exceeded
- Deployment timeout

### Manual Rollback

#### Via Vercel Dashboard

1. Go to https://vercel.com/btrme/deployments
2. Find previous stable deployment
3. Click "Redeploy"
4. Confirm rollback

#### Via CLI

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>

# Verify rollback
curl https://btrme.com/api/health
```

#### Via GitHub

```bash
# Revert commit
git revert <commit-hash>
git push origin main

# Deployment triggers automatically
```

### Post-Rollback Actions

1. **Incident Report**
   - Document what went wrong
   - Timeline of events
   - Root cause analysis

2. **Communication**
   - Notify team in #engineering
   - Update status page
   - Inform affected customers

3. **Fix Forward**
   - Create issue for fix
   - Add tests to prevent recurrence
   - Deploy fix to staging

---

## Health Checks & Verification

### Health Check Endpoints

#### Basic Health Check

```bash
curl https://btrme.com/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2025-11-13T10:00:00Z",
  "version": "1.2.0",
  "uptime": 3600
}
```

#### Detailed Health Check

```bash
curl https://btrme.com/api/health/detailed

# Expected response
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 12
    },
    "redis": {
      "status": "healthy",
      "responseTime": 5
    },
    "openai": {
      "status": "healthy",
      "responseTime": 450
    }
  }
}
```

### Post-Deployment Verification

#### Automated Checks (run by CI)

```bash
#!/bin/bash
# scripts/verify-deployment.sh

echo "🔍 Verifying deployment..."

# 1. Health check
HEALTH=$(curl -s https://btrme.com/api/health | jq -r .status)
if [ "$HEALTH" != "healthy" ]; then
  echo "❌ Health check failed"
  exit 1
fi

# 2. Test generation endpoint
GENERATION=$(curl -s -X POST https://btrme.com/api/generate \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -d '{"templateId":"web-app","context":{}}' \
  | jq -r .status)

if [ "$GENERATION" != "success" ]; then
  echo "❌ Generation test failed"
  exit 1
fi

# 3. Check error rate in last 5 minutes
ERROR_RATE=$(curl -s https://api.sentry.io/... | jq -r .errorRate)
if (( $(echo "$ERROR_RATE > 0.05" | bc -l) )); then
  echo "❌ Error rate too high: $ERROR_RATE"
  exit 1
fi

echo "✅ Deployment verified successfully"
```

#### Manual Verification Checklist

- [ ] Homepage loads
- [ ] User can sign in
- [ ] Create new project works
- [ ] Code generation works
- [ ] Template marketplace loads
- [ ] Project iteration works
- [ ] Download project works
- [ ] Payment processing works (test mode)

### Smoke Testing

```typescript
// cypress/e2e/smoke.cy.ts
describe('Production Smoke Tests', () => {
  it('should load homepage', () => {
    cy.visit('https://btrme.com')
    cy.contains('Build Apps with AI')
  })

  it('should complete generation flow', () => {
    cy.login()
    cy.visit('/generate')
    cy.get('[data-cy=description]').type('A todo app')
    cy.get('[data-cy=generate]').click()
    cy.get('[data-cy=status]', { timeout: 60000 }).should('contain', 'Complete')
  })
})
```

---

## Incident Response

### Severity Levels

| Level | Definition | Response Time | Example |
|-------|-----------|---------------|---------|
| P0 - Critical | Complete outage | 15 minutes | Site down |
| P1 - High | Major feature down | 1 hour | Generations failing |
| P2 - Medium | Minor feature degraded | 4 hours | Template search slow |
| P3 - Low | Minor issue | 1 business day | Button misaligned |

### Incident Response Process

#### Phase 1: Detection (0-5 minutes)

1. **Alert Received**
   - PagerDuty alert
   - Monitoring alert (Sentry, Datadog)
   - Customer report

2. **Acknowledge**
   - On-call engineer acknowledges alert
   - Check incident severity
   - Notify team if P0/P1

#### Phase 2: Triage (5-15 minutes)

1. **Assess Impact**
   - How many users affected?
   - What functionality is broken?
   - Is data at risk?

2. **Communicate**
   ```
   #incidents Slack channel:

   🚨 INCIDENT: [P0] Code generation failing

   Status: Investigating
   Impact: All users unable to generate code
   Started: 2025-11-13 10:23 PST
   Team: @john @sarah @mike

   Will update every 15 minutes.
   ```

3. **Create Incident Channel**
   - Create dedicated Slack channel: `#incident-YYYY-MM-DD`
   - Invite relevant team members
   - Start incident log

#### Phase 3: Investigation (15-60 minutes)

1. **Check Monitoring**
   ```bash
   # Check Sentry for errors
   open https://sentry.io/btrme/errors

   # Check logs
   vercel logs --prod --since 1h

   # Check database
   psql $DATABASE_URL -c "SELECT pg_stat_activity"

   # Check Redis
   redis-cli -u $REDIS_URL info
   ```

2. **Identify Root Cause**
   - Review recent deployments
   - Check external service status
   - Analyze error patterns

#### Phase 4: Resolution (1-4 hours)

1. **Immediate Mitigation**
   - Rollback if recent deployment
   - Scale up resources if capacity issue
   - Enable feature flag to disable broken feature
   - Redirect traffic if needed

2. **Implement Fix**
   - Quick fix if possible
   - Thorough fix if more time available
   - Deploy hotfix following emergency process

3. **Verify Resolution**
   - Run health checks
   - Monitor error rates
   - Confirm with affected users

#### Phase 5: Communication

1. **Internal Updates** (every 15 minutes during incident)
   ```
   Update #1 (10:30 PST):
   - Identified issue: OpenAI API rate limit exceeded
   - Mitigation: Switched to fallback provider (Anthropic)
   - Status: Monitoring recovery

   Update #2 (10:45 PST):
   - All systems operational
   - Error rate back to normal
   - Incident resolved
   ```

2. **Customer Communication** (if customer-facing)
   - Update status page
   - Send email to affected users
   - Post on social media if major

3. **Post-Incident Review** (within 48 hours)
   - Write incident report
   - Conduct blameless postmortem
   - Identify action items
   - Update runbook

### Incident Report Template

```markdown
# Incident Report: [Title]

**Date:** 2025-11-13
**Severity:** P0
**Duration:** 1 hour 23 minutes
**Impact:** 100% of users unable to generate code

## Timeline

- 10:23 PST: Alert triggered
- 10:25 PST: On-call engineer acknowledged
- 10:30 PST: Root cause identified
- 10:45 PST: Mitigation deployed
- 11:00 PST: Systems fully recovered
- 11:46 PST: Incident closed

## Root Cause

OpenAI API rate limit exceeded due to unexpected traffic spike from viral Product Hunt post.

## Impact

- 2,450 generation attempts failed
- No data loss
- $0 revenue impact (free tier users)

## Resolution

1. Switched to Anthropic as primary provider
2. Increased rate limit buffer
3. Implemented better load balancing

## Action Items

- [ ] Add rate limit monitoring alerts
- [ ] Implement request queuing system
- [ ] Increase OpenAI rate limit quota
- [ ] Document failover procedures

## Lessons Learned

- Need better capacity planning for viral traffic
- Failover worked but took too long to trigger
- Communication to users was delayed
```

---

## Troubleshooting Guide

### Common Issues

#### Issue: Deployment Failed

**Symptoms:**
- Vercel deployment shows error
- Build fails
- Tests fail

**Diagnosis:**
```bash
# Check build logs
vercel logs <deployment-url>

# Run build locally
pnpm build

# Check for type errors
pnpm type-check

# Run tests
pnpm test
```

**Solution:**
- Fix build errors
- Ensure all tests pass
- Check environment variables
- Verify dependencies installed

#### Issue: Database Connection Errors

**Symptoms:**
- `P1001: Can't reach database server`
- API returns 500 errors
- Slow queries

**Diagnosis:**
```bash
# Check database status
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity"

# Check slow queries
psql $DATABASE_URL -c "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10"
```

**Solution:**
- Verify DATABASE_URL is correct
- Check connection pool settings
- Scale up database if needed
- Optimize slow queries
- Check Neon status page

#### Issue: Redis Connection Errors

**Symptoms:**
- Cache misses
- Slow response times
- Rate limiting not working

**Diagnosis:**
```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping

# Check memory usage
redis-cli -u $REDIS_URL info memory

# Check connected clients
redis-cli -u $REDIS_URL info clients
```

**Solution:**
- Verify REDIS_URL is correct
- Check Upstash status
- Clear cache if needed: `redis-cli -u $REDIS_URL FLUSHDB`
- Scale up Redis instance

#### Issue: High Error Rate

**Symptoms:**
- Sentry shows spike in errors
- Users reporting failures
- Monitoring alerts triggered

**Diagnosis:**
```bash
# Check Sentry errors
open https://sentry.io/btrme/issues

# Check logs for patterns
vercel logs --prod | grep ERROR

# Check external services
curl https://status.openai.com
curl https://upstash.com/status
```

**Solution:**
- Identify error pattern
- Check recent deployments
- Verify external services operational
- Rollback if recent deployment caused issue

#### Issue: Slow Performance

**Symptoms:**
- Response times > 2s
- Users report slowness
- High CPU/memory usage

**Diagnosis:**
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://btrme.com

# Check database performance
psql $DATABASE_URL -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10"

# Check Next.js performance
open https://vercel.com/btrme/analytics
```

**Solution:**
- Identify slow endpoints
- Optimize database queries
- Add caching
- Scale up resources
- Enable CDN caching

---

## Monitoring & Alerting

### Key Metrics

#### Application Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Error Rate | < 0.1% | > 1% |
| Response Time (P95) | < 500ms | > 2s |
| Availability | > 99.9% | < 99% |
| Generation Success Rate | > 95% | < 90% |

#### Infrastructure Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| CPU Usage | < 70% | > 85% |
| Memory Usage | < 80% | > 90% |
| Database Connections | < 80% of pool | > 90% |
| Redis Memory | < 80% | > 90% |

### Alert Configuration

**PagerDuty Integration:**
```yaml
# Critical alerts (P0)
- Error rate > 5%
- Site down
- Database unreachable
- Payment processing failing

# High priority alerts (P1)
- Error rate > 1%
- Response time > 2s
- Generation success rate < 90%

# Medium priority alerts (P2)
- Response time > 1s
- High memory usage
- High CPU usage
```

### Monitoring Dashboards

**Datadog Dashboard:**
- Overall health status
- Request rate and latency
- Error rates by endpoint
- Database performance
- External API health

**Sentry Dashboard:**
- Error trends
- Top errors by volume
- New errors since last release
- User-affected count

---

## Emergency Contacts

### On-Call Rotation

**Primary On-Call:**
- Week 1-2: John Doe (john@btrme.com, +1-555-0001)
- Week 3-4: Sarah Smith (sarah@btrme.com, +1-555-0002)
- Week 5-6: Mike Johnson (mike@btrme.com, +1-555-0003)

**Escalation:**
- Engineering Manager: Jane Lee (jane@btrme.com, +1-555-0010)
- CTO: Alex Chen (alex@btrme.com, +1-555-0020)

### External Service Contacts

**OpenAI:**
- Support: support@openai.com
- Status: https://status.openai.com

**Anthropic:**
- Support: support@anthropic.com
- Status: https://status.anthropic.com

**Vercel:**
- Support: support@vercel.com
- Status: https://vercel-status.com

**Neon (Database):**
- Support: support@neon.tech
- Status: https://neonstatus.com

**Upstash (Redis):**
- Support: support@upstash.com
- Status: https://status.upstash.com

---

## Appendix

### Useful Commands

```bash
# Check deployment status
vercel ls --prod

# View production logs
vercel logs --prod --follow

# Run database migrations
pnpm prisma migrate deploy

# Clear Redis cache
redis-cli -u $REDIS_URL FLUSHDB

# Check application health
curl https://btrme.com/api/health

# Trigger E2E tests
pnpm test:e2e:prod

# View error logs in Sentry
open https://sentry.io/btrme/errors
```

### Quick Reference

**Rollback:** `vercel rollback <deployment-url>`
**Health Check:** `curl https://btrme.com/api/health`
**View Logs:** `vercel logs --prod`
**Incident Channel:** `#incident-YYYY-MM-DD`
**Status Page:** https://status.btrme.com

---

## Conclusion

This runbook ensures smooth deployments and quick incident response. Keep it updated as systems evolve.

**Remember:**
- Always test on staging first
- Communicate early and often
- Document everything
- Learn from incidents
- Automate what you can

---

**Document Owner:** DevOps Team
**Review Cadence:** Monthly
**Last Review:** 2025-11-13
**Next Review:** 2025-12-13
