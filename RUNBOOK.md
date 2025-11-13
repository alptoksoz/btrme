# BTRMe Operations Runbook

> **Version:** 1.0.0
> **Last Updated:** 2025-11-13
> **Emergency Contact:** [Add on-call engineer contact]

This runbook provides operational procedures for BTRMe production environment, including deployment, troubleshooting, incident response, and common tasks.

---

## Table of Contents

1. [Emergency Contacts](#emergency-contacts)
2. [Quick Reference](#quick-reference)
3. [Deployment Procedures](#deployment-procedures)
4. [Rollback Procedures](#rollback-procedures)
5. [Incident Response](#incident-response)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Maintenance Tasks](#maintenance-tasks)
9. [Database Operations](#database-operations)
10. [Cache Operations](#cache-operations)
11. [AI API Management](#ai-api-management)
12. [Security Procedures](#security-procedures)

---

## Emergency Contacts

### On-Call Rotation

| Role | Primary | Secondary | Phone | Email |
|------|---------|-----------|-------|-------|
| **Engineering Lead** | [Name] | [Name] | [Phone] | [Email] |
| **DevOps Engineer** | [Name] | [Name] | [Phone] | [Email] |
| **Database Admin** | [Name] | [Name] | [Phone] | [Email] |
| **Security Lead** | [Name] | [Name] | [Phone] | [Email] |

### Service Support

| Service | Support URL | Support Email | Response Time |
|---------|-------------|---------------|---------------|
| **Vercel** | https://vercel.com/support | support@vercel.com | < 1 hour (Pro) |
| **Neon** | https://neon.tech/docs/introduction/support | support@neon.tech | < 4 hours |
| **Upstash** | https://upstash.com/docs/common/help/support | support@upstash.com | < 4 hours |
| **OpenAI** | https://help.openai.com | support@openai.com | < 24 hours |
| **Anthropic** | https://support.anthropic.com | support@anthropic.com | < 24 hours |
| **Sentry** | https://sentry.io/support/ | support@sentry.io | < 24 hours |

### Communication Channels

- **Slack:** #btrme-alerts (urgent), #btrme-ops (general)
- **Email:** ops@btrme.com
- **Status Page:** https://status.btrme.com (if configured)
- **PagerDuty:** (if configured)

---

## Quick Reference

### Critical URLs

```bash
# Production
Production URL:       https://btrme.com
API Health:           https://btrme.com/api/health
Database Health:      https://btrme.com/api/db-health
Cache Health:         https://btrme.com/api/cache-health
AI Health:            https://btrme.com/api/ai-health

# Staging
Staging URL:          https://btrme-staging.vercel.app
Staging API:          https://btrme-staging.vercel.app/api

# Monitoring
Vercel Dashboard:     https://vercel.com/btrme/web
Sentry Dashboard:     https://sentry.io/organizations/btrme/issues/
Neon Console:         https://console.neon.tech
Upstash Console:      https://console.upstash.com
```

### Quick Health Check

```bash
#!/bin/bash
# health-check.sh - Run this to verify all services

echo "🔍 Checking BTRMe Production Health..."

# 1. Application health
echo "\n1. Application:"
curl -s https://btrme.com/api/health | jq

# 2. Database health
echo "\n2. Database:"
curl -s https://btrme.com/api/db-health | jq

# 3. Cache health
echo "\n3. Cache:"
curl -s https://btrme.com/api/cache-health | jq

# 4. AI services health
echo "\n4. AI Services:"
curl -s https://btrme.com/api/ai-health | jq

echo "\n✅ Health check complete"
```

### Common Commands

```bash
# Vercel CLI
vercel --version                    # Check CLI version
vercel login                        # Login to Vercel
vercel ls                           # List deployments
vercel logs                         # View logs
vercel rollback                     # Rollback to previous deployment

# Database (Prisma)
pnpm prisma studio                  # Open Prisma Studio
pnpm prisma migrate status          # Check migration status
pnpm prisma migrate deploy          # Deploy migrations
pnpm prisma db push                 # Push schema changes (dev only)

# Testing
pnpm test                           # Run unit tests
pnpm test:e2e                       # Run E2E tests
pnpm lint                           # Run linter
pnpm type-check                     # Type check
```

---

## Deployment Procedures

### Standard Deployment (Main Branch)

**Trigger:** Push to `main` branch or manual deployment

```bash
# Step 1: Ensure all checks pass locally
pnpm install
pnpm lint
pnpm type-check
pnpm test
pnpm build

# Step 2: Push to main branch
git checkout main
git pull origin main
git merge develop
git push origin main

# Step 3: Automatic deployment via GitHub Actions
# - Vercel automatically deploys when main branch updates
# - Wait for deployment to complete (~2-3 minutes)

# Step 4: Verify deployment
curl https://btrme.com/api/health

# Step 5: Monitor for errors
# - Check Sentry: https://sentry.io/organizations/btrme/issues/
# - Check Vercel logs: vercel logs
```

**Expected Timeline:**
- Build time: 1-2 minutes
- Deployment: 30 seconds
- DNS propagation: 0 seconds (instant with Vercel)
- **Total: 2-3 minutes**

### Hotfix Deployment (Emergency)

**Use Case:** Critical bug fix that can't wait for normal release cycle

```bash
# Step 1: Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# Step 2: Make minimal changes (fix only)
# ... make changes ...

# Step 3: Test locally
pnpm test
pnpm build

# Step 4: Commit and push
git add .
git commit -m "hotfix: Fix critical bug in generation endpoint"
git push origin hotfix/critical-bug-fix

# Step 5: Create PR and get urgent review
gh pr create --base main --head hotfix/critical-bug-fix --title "HOTFIX: Critical bug"

# Step 6: After approval, merge to main
gh pr merge --squash

# Step 7: Monitor deployment
vercel logs --follow

# Step 8: Verify fix
curl https://btrme.com/api/health

# Step 9: Merge back to develop
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

### Database Migration Deployment

**Use Case:** Deploying with database schema changes

```bash
# Step 1: Create migration (already done in development)
# pnpm prisma migrate dev --name add_new_field

# Step 2: Review migration file
cat prisma/migrations/YYYYMMDDHHMMSS_add_new_field/migration.sql

# Step 3: Test migration on staging first
export DATABASE_URL="<staging-database-url>"
pnpm prisma migrate deploy

# Step 4: Verify staging works
curl https://btrme-staging.vercel.app/api/health

# Step 5: Deploy to production database
export DATABASE_URL="<production-database-url>"
pnpm prisma migrate deploy

# Step 6: Verify migration
pnpm prisma migrate status
# Expected output: "Database schema is up to date!"

# Step 7: Deploy application (automatic via Git push)
git push origin main

# Step 8: Monitor for errors
vercel logs --follow
```

**⚠️ Migration Safety Checklist:**
- [ ] Migration is backward compatible (if possible)
- [ ] Tested on staging environment
- [ ] Database backup completed within last 24 hours
- [ ] Off-peak hours (low traffic time)
- [ ] Rollback plan documented
- [ ] Team notified of deployment window

---

## Rollback Procedures

### Application Rollback (Instant)

**Use Case:** New deployment has critical bug

```bash
# Option 1: Via Vercel CLI (fastest)
vercel rollback
# Confirms: "Rolled back to deployment dpl_xxx (2 hours ago)"

# Option 2: Via Vercel Dashboard
# 1. Go to https://vercel.com/btrme/web/deployments
# 2. Find last stable deployment
# 3. Click three dots (...) → "Promote to Production"

# Option 3: Via Git (if deployment issues)
# 1. Revert commit
git revert HEAD
git push origin main
# 2. Wait for automatic redeployment

# Verify rollback
curl https://btrme.com/api/health
# Check version number or timestamp
```

**Expected Rollback Time:** < 1 minute

### Database Rollback (Use with Caution)

**Use Case:** Database migration caused issues

**⚠️ WARNING:** Database rollbacks are risky. Prefer forward fixes when possible.

```bash
# Step 1: Assess the situation
# - How long has migration been live?
# - How much new data was created?
# - Is forward fix possible?

# Step 2: If rollback is necessary, create down migration
# Prisma doesn't support automatic down migrations
# You need to manually create a new migration to reverse changes

# Example: Reverting "add_email_verified_column"
pnpm prisma migrate dev --name revert_email_verified_column

# Step 3: Write SQL to undo changes
cat > prisma/migrations/YYYYMMDDHHMMSS_revert_email_verified_column/migration.sql << EOF
-- Undo the changes from previous migration
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerified";
EOF

# Step 4: Apply rollback migration
pnpm prisma migrate deploy

# Step 5: Verify
pnpm prisma migrate status

# Step 6: Rollback application code
vercel rollback
```

**Database Rollback Decision Tree:**
```
Migration deployed < 1 hour ago?
├─ Yes → Safe to rollback (low risk of data loss)
└─ No → Prefer forward fix (high risk of data loss)

Data loss acceptable?
├─ Yes → Proceed with rollback
└─ No → Create forward fix migration

Production data affected?
├─ No → Safe to rollback
└─ Yes → Consult with team, backup first
```

### Cache Rollback (Clear Cache)

**Use Case:** Cached bad data

```bash
# Option 1: Clear all cache via API
curl -X POST https://btrme.com/api/admin/cache/clear \
  -H "Authorization: Bearer $ADMIN_API_KEY"

# Option 2: Clear via Upstash Console
# 1. Go to https://console.upstash.com
# 2. Select btrme-production database
# 3. Data Browser → Run command: FLUSHDB

# Option 3: Clear specific keys via Redis CLI
redis-cli -u $REDIS_URL --pass $REDIS_PASSWORD
> DEL templates:*
> DEL projects:*

# Verify cache cleared
curl https://btrme.com/api/cache-health
# Should show hitRate: 0 (or very low)
```

---

## Incident Response

### Incident Severity Levels

| Severity | Definition | Response Time | Example |
|----------|------------|---------------|---------|
| **P0 - Critical** | Complete outage, data loss | < 15 minutes | Site down, database corrupted |
| **P1 - High** | Major feature broken | < 1 hour | AI generation failing, auth broken |
| **P2 - Medium** | Minor feature impaired | < 4 hours | Slow page load, email delays |
| **P3 - Low** | Cosmetic issue, no impact | < 1 business day | UI glitch, typo |

### Incident Response Process

#### Step 1: Detect & Alert

**Automated Detection:**
- Sentry error spike alert
- Vercel deployment failure
- Uptime monitor alert (e.g., UptimeRobot)
- High error rate in logs

**Manual Detection:**
- User report via email/Slack
- Customer support ticket
- Team member notice

#### Step 2: Acknowledge & Assess

```bash
# Acknowledge the incident
# 1. Post in #btrme-alerts Slack channel:
"🚨 Incident detected: [Brief description]
Severity: P[0-3]
On-call engineer: @[name]
Status: Investigating"

# 2. Create incident in tracking system (GitHub Issue, Jira, etc.)

# 3. Assess severity using the table above

# 4. Check health endpoints
./health-check.sh

# 5. Check recent deployments
vercel ls --limit 5

# 6. Check error logs
vercel logs | grep ERROR
# Or Sentry dashboard

# 7. Check metrics
# - Traffic spike?
# - Error rate?
# - Resource usage?
```

#### Step 3: Mitigate

**Immediate Actions (choose appropriate):**

```bash
# 1. Rollback recent deployment (if deployment caused issue)
vercel rollback

# 2. Clear cache (if cache corruption)
curl -X POST https://btrme.com/api/admin/cache/clear

# 3. Restart application (Vercel auto-restarts, but can redeploy)
vercel deploy --prod

# 4. Enable maintenance mode (if total outage)
vercel env add NEXT_PUBLIC_MAINTENANCE_MODE true production
vercel deploy --prod

# 5. Scale up resources (if performance issue)
# - Neon: Increase compute units
# - Upstash: Increase memory limit

# 6. Rate limit abusive IPs (if DDoS)
# Add to rate limit blocklist

# 7. Disable problematic feature (if specific feature broken)
vercel env add NEXT_PUBLIC_ENABLE_[FEATURE] false production
vercel deploy --prod
```

#### Step 4: Fix

```bash
# 1. Identify root cause
# - Review error logs
# - Review recent code changes
# - Review infrastructure changes

# 2. Develop fix
# - Create hotfix branch
# - Write minimal fix
# - Test locally

# 3. Deploy fix
git checkout -b hotfix/incident-[issue-number]
# ... make changes ...
git commit -m "hotfix: Fix [issue]"
git push origin hotfix/incident-[issue-number]

# 4. Create PR with "HOTFIX" label
gh pr create --label hotfix

# 5. Get expedited review and merge

# 6. Monitor fix effectiveness
vercel logs --follow
```

#### Step 5: Verify & Close

```bash
# 1. Verify issue resolved
./health-check.sh

# 2. Monitor for 30 minutes
# - Check error rates
# - Check user reports
# - Check metrics

# 3. Update incident status
"✅ Incident resolved: [Brief description]
Duration: [X] minutes
Root cause: [Brief explanation]
Fix: [Brief description]
Post-mortem: [Link to document]"

# 4. Disable maintenance mode (if enabled)
vercel env rm NEXT_PUBLIC_MAINTENANCE_MODE production

# 5. Close incident ticket
```

#### Step 6: Post-Mortem (Within 48 hours)

**Post-Mortem Template:**

```markdown
# Incident Post-Mortem: [Title]

**Date:** YYYY-MM-DD
**Duration:** X hours Y minutes
**Severity:** P[0-3]
**Impact:** [Description of user impact]

## Timeline

- HH:MM - Incident detected
- HH:MM - Incident acknowledged
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Incident resolved

## Root Cause

[Detailed explanation of what caused the incident]

## Resolution

[What was done to resolve the incident]

## Impact

- Users affected: [Number or percentage]
- Downtime: [Duration]
- Data loss: [Yes/No, details]
- Revenue impact: [If applicable]

## Action Items

- [ ] [Preventive measure 1] - Owner: [Name] - Due: [Date]
- [ ] [Preventive measure 2] - Owner: [Name] - Due: [Date]
- [ ] [Preventive measure 3] - Owner: [Name] - Due: [Date]

## Lessons Learned

**What went well:**
- [Item 1]
- [Item 2]

**What could be improved:**
- [Item 1]
- [Item 2]

**What we learned:**
- [Item 1]
- [Item 2]
```

---

## Common Issues & Solutions

### Issue: Site is Down (503 Error)

**Symptoms:**
- Users see 503 Service Unavailable
- Health check endpoint returns 503
- Vercel dashboard shows deployment failed

**Diagnosis:**
```bash
# Check deployment status
vercel ls

# Check build logs
vercel logs --output

# Check for build errors
```

**Solutions:**
```bash
# Solution 1: Rollback to previous deployment
vercel rollback

# Solution 2: Check environment variables
vercel env ls
# Ensure all required variables are set

# Solution 3: Redeploy
vercel deploy --prod --force
```

---

### Issue: Database Connection Timeouts

**Symptoms:**
- Slow page loads
- Timeout errors in logs: `Error: Connection timeout`
- Database health endpoint failing

**Diagnosis:**
```bash
# Check database health
curl https://btrme.com/api/db-health

# Check connection count
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Check for long-running queries
psql $DATABASE_URL -c "
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '5 seconds'
ORDER BY duration DESC;
"
```

**Solutions:**
```bash
# Solution 1: Kill long-running queries
psql $DATABASE_URL -c "SELECT pg_terminate_backend([pid]);"

# Solution 2: Restart database (Neon Console)
# Go to Neon Console → Compute → Restart

# Solution 3: Scale up database
# Go to Neon Console → Compute → Increase compute units

# Solution 4: Clear connection pool
# Redeploy application to reset connections
vercel deploy --prod
```

---

### Issue: Redis Cache Miss Rate High (> 50%)

**Symptoms:**
- Slow page loads
- Cache health endpoint shows low hit rate
- Database load increased

**Diagnosis:**
```bash
# Check cache health
curl https://btrme.com/api/cache-health
# Look at hitRate: should be > 0.8

# Check Redis memory usage
redis-cli -u $REDIS_URL --pass $REDIS_PASSWORD INFO memory

# Check eviction stats
redis-cli -u $REDIS_URL --pass $REDIS_PASSWORD INFO stats | grep evicted
```

**Solutions:**
```bash
# Solution 1: Warm cache
curl -X POST https://btrme.com/api/admin/cache/warm

# Solution 2: Increase cache TTL
# Update cache configuration in code and redeploy

# Solution 3: Increase Redis memory
# Go to Upstash Console → Database → Settings → Increase max memory

# Solution 4: Review cache eviction policy
# Upstash Console → Database → Settings → Eviction: allkeys-lru
```

---

### Issue: AI Generation Failing

**Symptoms:**
- Users report generation errors
- AI health endpoint failing
- Errors in logs: `OpenAI API error` or `Anthropic API error`

**Diagnosis:**
```bash
# Check AI health
curl https://btrme.com/api/ai-health

# Check recent AI errors in Sentry
# Filter by: issue.type:error AND transaction:/api/generation

# Test OpenAI API directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Anthropic API directly
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-opus-20240229","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
```

**Solutions:**
```bash
# Solution 1: Check API key validity
# Verify in OpenAI/Anthropic dashboard

# Solution 2: Check rate limits
# Review usage in OpenAI/Anthropic dashboard
# If over limit, wait or upgrade plan

# Solution 3: Check billing
# Ensure payment method is valid
# Ensure sufficient credits

# Solution 4: Switch to fallback model
# Automatic fallback should handle this, but verify
# Check logs for fallback attempts

# Solution 5: Clear AI request queue (if implemented)
# If using a queue system, clear stuck jobs
```

---

### Issue: Authentication Not Working

**Symptoms:**
- Users can't log in
- OAuth redirects fail
- Session errors in logs

**Diagnosis:**
```bash
# Check auth providers
curl https://btrme.com/api/auth/providers
# Should return Google and GitHub providers

# Check NEXTAUTH_URL
vercel env ls | grep NEXTAUTH_URL
# Should match production URL exactly

# Check OAuth callback URLs
# Google: https://console.cloud.google.com
# GitHub: https://github.com/settings/developers

# Check session in browser DevTools
# Application tab → Cookies → next-auth.session-token
```

**Solutions:**
```bash
# Solution 1: Verify NEXTAUTH_SECRET is set
vercel env ls | grep NEXTAUTH_SECRET

# Solution 2: Verify OAuth credentials
vercel env ls | grep GOOGLE_CLIENT_ID
vercel env ls | grep GITHUB_CLIENT_ID

# Solution 3: Update OAuth callback URLs
# Must match exactly: https://btrme.com/api/auth/callback/[provider]

# Solution 4: Clear sessions
# If session table corrupted, clear old sessions
psql $DATABASE_URL -c "DELETE FROM \"Session\" WHERE expires < NOW();"

# Solution 5: Restart application
vercel deploy --prod
```

---

### Issue: High Error Rate (> 5%)

**Symptoms:**
- Sentry alert: High error rate
- Many errors in logs
- User reports of issues

**Diagnosis:**
```bash
# Check Sentry for error patterns
# Group by: error.type, transaction

# Check recent deployments
vercel ls --limit 5

# Check if error rate correlates with deployment

# Check specific error types
vercel logs | grep ERROR | sort | uniq -c | sort -rn
```

**Solutions:**
```bash
# Solution 1: If errors from recent deployment, rollback
vercel rollback

# Solution 2: If specific error pattern, deploy hotfix
# (Follow hotfix deployment procedure)

# Solution 3: If transient errors (e.g., network), monitor
# May resolve automatically

# Solution 4: If errors from external service (AI, email), wait
# Check service status pages
# OpenAI: https://status.openai.com
# Anthropic: https://status.anthropic.com
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

**Application Metrics:**
- Error rate (target: < 1%)
- Response time p95 (target: < 500ms)
- Uptime (target: > 99.9%)
- Request rate (baseline + trend)

**Database Metrics:**
- Connection count (alert at 80% of max)
- Query latency p95 (target: < 100ms)
- Storage usage (alert at 80% of limit)
- Cache hit rate (target: > 95%)

**Cache Metrics:**
- Redis hit rate (target: > 80%)
- Redis memory usage (alert at 80%)
- Redis latency p99 (target: < 5ms)

**AI API Metrics:**
- Success rate (target: > 95%)
- Latency p95 (target: < 10s)
- Cost per day (alert at threshold)
- Token usage per day

**Core Web Vitals:**
- LCP (target: < 2.5s)
- FID (target: < 100ms)
- CLS (target: < 0.1)
- TTFB (target: < 600ms)

### Alert Configuration

**Sentry Alerts:**
```yaml
Alert 1: High Error Rate
- Condition: Error count > 100 in 5 minutes
- Channel: Slack #btrme-alerts, Email
- Severity: P1

Alert 2: New Issue
- Condition: New error type appears
- Channel: Slack #btrme-ops
- Severity: P2

Alert 3: Performance Degradation
- Condition: P95 response time > 3000ms
- Channel: Slack #btrme-ops
- Severity: P2
```

**Vercel Alerts:**
```yaml
Alert 1: Deployment Failed
- Channel: Slack #btrme-alerts, Email
- Severity: P1

Alert 2: Poor Core Web Vitals
- Condition: Real Experience Score < 75
- Channel: Email
- Severity: P3
```

---

## Maintenance Tasks

### Daily Tasks

```bash
# 1. Check error rates (2 minutes)
# Go to Sentry dashboard, review yesterday's errors

# 2. Check Core Web Vitals (2 minutes)
# Go to Vercel Analytics, check trends

# 3. Check cost trends (2 minutes)
# OpenAI: https://platform.openai.com/usage
# Anthropic: https://console.anthropic.com/settings/usage
# Neon: https://console.neon.tech → Billing
# Upstash: https://console.upstash.com → Billing
```

### Weekly Tasks

```bash
# 1. Review slow queries (15 minutes)
psql $DATABASE_URL -c "
SELECT calls, total_time, mean_time, query
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
"

# 2. Check database size (5 minutes)
psql $DATABASE_URL -c "
SELECT pg_size_pretty(pg_database_size('btrme')) AS database_size;
"

# 3. Review cache hit rate (5 minutes)
curl https://btrme.com/api/cache-health

# 4. Review dependency updates (10 minutes)
pnpm outdated

# 5. Review security alerts (10 minutes)
pnpm audit
# Check GitHub Dependabot alerts
```

### Monthly Tasks

```bash
# 1. Database vacuum and analyze (30 minutes)
psql $DATABASE_URL -c "VACUUM ANALYZE;"

# 2. Clean up old data (1 hour)
# Delete old generations (> 90 days)
psql $DATABASE_URL -c "
DELETE FROM \"Generation\"
WHERE \"createdAt\" < NOW() - INTERVAL '90 days'
AND status IN ('completed', 'failed');
"

# Delete old sessions (expired)
psql $DATABASE_URL -c "
DELETE FROM \"Session\" WHERE expires < NOW();
"

# 3. Review and update dependencies (2 hours)
pnpm update
pnpm test
pnpm build

# 4. Load testing (1 hour)
k6 run scripts/load-test.js

# 5. Security audit (1 hour)
pnpm audit
# Run OWASP ZAP scan (optional)

# 6. Backup verification (30 minutes)
# Test database restore from backup
# Restore to staging environment and verify

# 7. Cost optimization review (1 hour)
# Review usage patterns
# Identify opportunities to reduce costs
# Check for unused resources
```

### Quarterly Tasks

```bash
# 1. Disaster recovery drill (4 hours)
# Simulate complete outage
# Practice recovery procedures
# Document lessons learned

# 2. Capacity planning (2 hours)
# Review growth trends
# Plan for scaling needs
# Budget for infrastructure upgrades

# 3. Security review (4 hours)
# Review access controls
# Review API keys (rotate if needed)
# Review authentication logs
# Penetration testing (optional)

# 4. Documentation review (2 hours)
# Update runbook
# Update deployment guide
# Update architecture diagrams
```

---

## Database Operations

### Read-Only Queries

```bash
# Connect to database (read-only)
psql $DATABASE_URL

# Count users
SELECT COUNT(*) FROM "User";

# Count projects
SELECT COUNT(*) FROM "Project";

# Count generations today
SELECT COUNT(*) FROM "Generation"
WHERE "createdAt" > CURRENT_DATE;

# Top users by project count
SELECT u.id, u.email, COUNT(p.id) AS project_count
FROM "User" u
LEFT JOIN "Project" p ON p."userId" = u.id
GROUP BY u.id, u.email
ORDER BY project_count DESC
LIMIT 10;

# Recent generations
SELECT id, status, model, "createdAt"
FROM "Generation"
ORDER BY "createdAt" DESC
LIMIT 20;

# Error rate by AI model
SELECT model,
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed,
       ROUND(100.0 * SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) / COUNT(*), 2) AS error_rate
FROM "Generation"
WHERE "createdAt" > NOW() - INTERVAL '24 hours'
GROUP BY model;
```

### Maintenance Queries

```bash
# Vacuum and analyze (run during low traffic)
VACUUM ANALYZE;

# Reindex (if query performance degraded)
REINDEX DATABASE btrme;

# Update statistics
ANALYZE;
```

### Backup & Restore

```bash
# Manual backup (in addition to automatic backups)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup (DANGEROUS - production)
# Only in emergency, better to restore to staging first
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

---

## Cache Operations

### Redis Commands

```bash
# Connect to Redis
redis-cli -u $REDIS_URL --pass $REDIS_PASSWORD

# Get info
INFO

# Check memory usage
INFO memory

# Check hit rate
INFO stats

# List all keys (use with caution, can be slow)
KEYS *

# Get specific key
GET templates:all

# Delete specific key
DEL templates:all

# Delete keys by pattern
EVAL "return redis.call('del', unpack(redis.call('keys', 'templates:*')))" 0

# Flush all (DANGEROUS - clears all cache)
FLUSHDB
```

### Cache Warming

```bash
# Warm cache after clearing
curl -X POST https://btrme.com/api/admin/cache/warm \
  -H "Authorization: Bearer $ADMIN_API_KEY"
```

---

## AI API Management

### Check Usage

```bash
# OpenAI usage (last 30 days)
# Go to: https://platform.openai.com/usage

# Anthropic usage (last 30 days)
# Go to: https://console.anthropic.com/settings/usage

# Check API keys are valid
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Rotate API Keys

```bash
# Step 1: Generate new key in provider dashboard
# OpenAI: https://platform.openai.com/api-keys
# Anthropic: https://console.anthropic.com/settings/keys

# Step 2: Add new key to Vercel
vercel env add OPENAI_API_KEY_NEW production

# Step 3: Update application to use new key
# (Code change required if not using single env var)

# Step 4: Deploy
vercel deploy --prod

# Step 5: Verify new key works
curl https://btrme.com/api/ai-health

# Step 6: Remove old key from Vercel
vercel env rm OPENAI_API_KEY production

# Step 7: Revoke old key in provider dashboard
```

---

## Security Procedures

### Handling Security Incidents

```bash
# 1. Identify the security issue
# - Unauthorized access?
# - Data breach?
# - DDoS attack?
# - Vulnerability disclosure?

# 2. Immediate containment
# - Revoke compromised API keys
# - Block malicious IPs
# - Disable affected features
# - Enable maintenance mode if necessary

# 3. Assess impact
# - What data was accessed?
# - How many users affected?
# - Duration of incident?

# 4. Notify stakeholders
# - Internal: Engineering, Legal, Executive
# - External: Affected users (if required)
# - Regulatory: If breach reporting required

# 5. Remediate
# - Patch vulnerability
# - Rotate all secrets
# - Force password resets (if needed)

# 6. Post-incident review
# - Document timeline
# - Identify root cause
# - Implement preventive measures
```

### Rotate All Secrets (Emergency)

```bash
# Only in case of security incident

# 1. NEXTAUTH_SECRET
openssl rand -base64 32
vercel env add NEXTAUTH_SECRET production
# Force all users to re-login

# 2. Database password
# Go to Neon Console → Reset password
# Update DATABASE_URL in Vercel

# 3. Redis password
# Go to Upstash Console → Regenerate token
# Update REDIS_TOKEN in Vercel

# 4. AI API keys
# (Follow "Rotate API Keys" procedure above)

# 5. OAuth secrets
# Regenerate in Google/GitHub OAuth app settings
# Update in Vercel

# 6. Redeploy
vercel deploy --prod
```

---

## Troubleshooting Checklist

When investigating an issue, go through this checklist:

```
[ ] Check health endpoints (/api/health, /api/db-health, /api/cache-health)
[ ] Check recent deployments (vercel ls)
[ ] Check error logs (vercel logs, Sentry)
[ ] Check metrics (Vercel Analytics, Neon Console, Upstash Console)
[ ] Check external service status (OpenAI, Anthropic, Neon, Upstash)
[ ] Check recent code changes (git log)
[ ] Check environment variables (vercel env ls)
[ ] Reproduce issue locally (if possible)
[ ] Check for similar past incidents
[ ] Consult documentation
[ ] Reach out to service support (if service issue)
```

---

**Document Version:** 1.0.0
**Last Reviewed:** 2025-11-13
**Next Review:** 2025-12-13

**Reminder:** Keep this runbook up to date as the system evolves.
