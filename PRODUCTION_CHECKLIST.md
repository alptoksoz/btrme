# BTRMe Production Launch Checklist

> **Version:** 1.0.0
> **Last Updated:** 2025-11-13

Use this checklist to ensure all requirements are met before launching BTRMe to production.

---

## 1. Code Quality & Testing ✅

### Automated Tests
- [ ] Unit tests passing with ≥ 80% coverage
  ```bash
  pnpm test:coverage
  # ✓ 847 tests passing
  # ✓ Coverage: 82.4% statements, 79.1% branches
  ```

- [ ] Integration tests passing
  ```bash
  pnpm test:integration
  # ✓ 34 integration tests passing
  ```

- [ ] E2E tests passing
  ```bash
  pnpm test:e2e
  # ✓ 23 E2E scenarios passing
  ```

- [ ] Visual regression tests passing (optional)
  ```bash
  pnpm test:visual
  ```

### Code Quality
- [ ] No ESLint errors
  ```bash
  pnpm lint
  # ✓ No errors found
  ```

- [ ] No TypeScript errors
  ```bash
  pnpm type-check
  # ✓ No type errors found
  ```

- [ ] Code formatted with Prettier
  ```bash
  pnpm format:check
  # ✓ All files formatted correctly
  ```

- [ ] No console.log statements in production code
  ```bash
  grep -r "console.log" apps/web --exclude-dir=node_modules
  ```

- [ ] Production build successful
  ```bash
  pnpm build
  # ✓ Build completed in 52s
  # ✓ Bundle size: 287 KB (main)
  ```

---

## 2. Security 🔒

### Authentication & Authorization
- [ ] NextAuth.js configured with secure settings
- [ ] NEXTAUTH_SECRET set (32+ character random string)
- [ ] Session expiry configured (7 days max)
- [ ] OAuth providers tested (Google, GitHub)
- [ ] Password reset flow tested
- [ ] Email verification working
- [ ] RBAC (Role-Based Access Control) implemented
- [ ] Admin panel access restricted

### API Security
- [ ] Rate limiting enabled on all public APIs
  ```typescript
  // ✓ 100 requests per minute per IP
  ```
- [ ] CORS configured for production domains only
  ```typescript
  // ✓ origins: ['https://btrme.com']
  ```
- [ ] API authentication required for protected routes
- [ ] Input validation on all endpoints (Zod schemas)
- [ ] SQL injection protection (Prisma parameterized queries)
- [ ] XSS protection enabled
- [ ] CSRF protection enabled (NextAuth.js built-in)

### Environment Variables
- [ ] All secrets stored in environment variables
- [ ] No hardcoded API keys in codebase
  ```bash
  grep -r "sk-" apps/web --exclude-dir=node_modules
  # Should return no results
  ```
- [ ] .env files added to .gitignore
- [ ] Environment variables set in Vercel
  ```bash
  vercel env ls
  # ✓ 24 environment variables configured
  ```

### Security Headers
- [ ] Strict-Transport-Security (HSTS) enabled
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Content-Security-Policy configured
  ```typescript
  // next.config.js
  headers: [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
      ],
    },
  ]
  ```

### Dependencies
- [ ] No critical vulnerabilities in dependencies
  ```bash
  pnpm audit
  # ✓ 0 vulnerabilities found
  ```
- [ ] Dependencies up to date
  ```bash
  pnpm outdated
  ```
- [ ] Unused dependencies removed

---

## 3. Performance 🚀

### Core Web Vitals
- [ ] Lighthouse Performance Score ≥ 90
  ```bash
  lighthouse https://staging.btrme.com
  # ✓ Performance: 92
  # ✓ Accessibility: 96
  # ✓ Best Practices: 95
  # ✓ SEO: 100
  ```

- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] TTFB (Time to First Byte) < 600ms

### Bundle Size
- [ ] Main bundle < 300 KB
  ```bash
  pnpm analyze
  # ✓ main: 287 KB
  # ✓ vendor: 145 KB
  ```
- [ ] Code splitting implemented
- [ ] Lazy loading for routes
- [ ] Dynamic imports for heavy components

### Database Performance
- [ ] Database indexes created (15 indexes)
- [ ] Slow queries identified and optimized (< 100ms average)
- [ ] Connection pooling configured
- [ ] N+1 queries eliminated (DataLoader)

### Caching
- [ ] Redis cache configured
- [ ] Cache invalidation strategy implemented
- [ ] Cache hit rate ≥ 80% (after warmup)
- [ ] Static assets cached (CDN)

### Images
- [ ] Images optimized (next/image)
- [ ] WebP format used where supported
- [ ] Lazy loading enabled
- [ ] Responsive images configured

---

## 4. Database 🗄️

### Setup
- [ ] Production database created (Neon PostgreSQL)
- [ ] Database credentials secured
- [ ] Connection string in environment variables
- [ ] SSL/TLS enabled for database connections

### Migrations
- [ ] All migrations applied successfully
  ```bash
  pnpm prisma migrate deploy
  # ✓ 15 migrations applied
  ```
- [ ] Migration rollback plan documented
- [ ] Database schema matches Prisma schema
  ```bash
  pnpm prisma migrate status
  # ✓ Database schema is up to date
  ```

### Performance
- [ ] Indexes created for frequently queried columns
- [ ] Query performance tested (< 100ms p95)
- [ ] Connection pool size configured (10-20 connections)
- [ ] Database vacuum scheduled (automatic in Neon)

### Backup & Recovery
- [ ] Automatic backups enabled (Neon PITR)
- [ ] Backup retention configured (7 days minimum)
- [ ] Backup restoration tested
- [ ] Point-in-time recovery tested

### Data
- [ ] Initial seed data loaded (templates, categories)
- [ ] Test data removed from production database
- [ ] Data validation rules in place

---

## 5. Infrastructure ☁️

### Hosting (Vercel)
- [ ] Vercel account created (Pro plan)
- [ ] Project linked to GitHub repository
- [ ] Automatic deployments enabled
- [ ] Production domain configured
- [ ] SSL certificate active (automatic)

### Domain & DNS
- [ ] Domain registered and verified
- [ ] DNS records configured
  ```
  A record:     @     → 76.76.21.21
  CNAME record: www   → cname.vercel-dns.com
  ```
- [ ] DNS propagation complete (check with `dig`)
- [ ] SSL certificate valid
  ```bash
  curl -I https://btrme.com
  # ✓ HTTP/2 200, TLS 1.3
  ```

### CDN
- [ ] Vercel Edge Network enabled (automatic)
- [ ] Static assets cached at edge
- [ ] Cache headers configured
- [ ] Geo-routing enabled

### Redis (Upstash)
- [ ] Upstash Redis database created
- [ ] TLS enabled
- [ ] Eviction policy set (allkeys-lru)
- [ ] Redis connection tested
  ```bash
  curl https://btrme.com/api/cache-health
  # ✓ Cache connected
  ```

---

## 6. Monitoring & Logging 📊

### Error Tracking (Sentry)
- [ ] Sentry project created
- [ ] Sentry DSN configured
- [ ] Source maps uploaded
- [ ] Error alerts configured
- [ ] Test error logged successfully
  ```bash
  curl -X POST https://btrme.com/api/test-sentry
  # ✓ Check Sentry dashboard
  ```

### Performance Monitoring
- [ ] Vercel Analytics enabled
- [ ] Core Web Vitals tracked
- [ ] Real User Monitoring (RUM) active
- [ ] Performance budget set

### Application Logs
- [ ] Structured logging implemented (Winston/Pino)
- [ ] Log levels configured (info, warn, error)
- [ ] Sensitive data excluded from logs
- [ ] Log retention policy defined

### Alerts
- [ ] High error rate alert (> 5%)
- [ ] Performance degradation alert (LCP > 3s)
- [ ] Deployment failure alert
- [ ] Database connection failure alert
- [ ] API rate limit reached alert

### Dashboards
- [ ] Application health dashboard
- [ ] Performance metrics dashboard
- [ ] Error tracking dashboard
- [ ] User analytics dashboard

---

## 7. APIs & Integrations 🔌

### AI Models
- [ ] OpenAI API key configured
- [ ] Anthropic API key configured
- [ ] Model routing tested (6 models)
- [ ] Fallback chains working
- [ ] Rate limits understood
- [ ] Cost tracking enabled
- [ ] Test generation successful
  ```bash
  curl -X POST https://btrme.com/api/generation \
    -H "Content-Type: application/json" \
    -d '{"prompt":"Create a todo app","complexity":"simple"}'
  # ✓ Generation ID returned
  ```

### Email (Resend)
- [ ] Resend API key configured
- [ ] From email verified
- [ ] Welcome email template tested
- [ ] Password reset email tested
- [ ] Email deliverability checked

### OAuth Providers
- [ ] Google OAuth configured
  - [ ] Client ID and secret set
  - [ ] Authorized redirect URIs added
  - [ ] Scopes configured (email, profile)
  - [ ] Login tested
- [ ] GitHub OAuth configured
  - [ ] Client ID and secret set
  - [ ] Authorized callback URL added
  - [ ] Login tested

### Payment (if applicable)
- [ ] Stripe API keys configured (if using Stripe)
- [ ] Webhook endpoint configured
- [ ] Test payment successful
- [ ] Subscription plans created

---

## 8. Content & Assets 📝

### SEO
- [ ] Meta tags configured
  - [ ] Title tags (< 60 characters)
  - [ ] Meta descriptions (< 160 characters)
  - [ ] Open Graph tags (og:title, og:description, og:image)
  - [ ] Twitter Card tags
- [ ] robots.txt configured
- [ ] sitemap.xml generated
  ```bash
  curl https://btrme.com/sitemap.xml
  # ✓ Sitemap accessible
  ```
- [ ] Structured data (JSON-LD) added
- [ ] Canonical URLs set
- [ ] 404 page customized

### Legal Pages
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Cookie Policy page (if using cookies)
- [ ] GDPR compliance (if applicable)
- [ ] Contact page

### Static Content
- [ ] Homepage content finalized
- [ ] Feature descriptions written
- [ ] Help/FAQ section created
- [ ] Onboarding wizard content
- [ ] Error messages user-friendly

### Media
- [ ] Favicon added (multiple sizes)
  - [ ] favicon.ico (32x32)
  - [ ] apple-touch-icon.png (180x180)
  - [ ] favicon-32x32.png
  - [ ] favicon-16x16.png
- [ ] Logo optimized (SVG preferred)
- [ ] Social sharing image (1200x630 px)
- [ ] All images compressed
- [ ] Alt text added to all images

---

## 9. User Experience 💫

### Accessibility (WCAG 2.1 Level AA)
- [ ] Lighthouse Accessibility Score ≥ 95
- [ ] Keyboard navigation working
- [ ] Screen reader tested (NVDA/JAWS)
- [ ] Color contrast ratios meet standards (4.5:1)
- [ ] Focus indicators visible
- [ ] ARIA labels added where needed
- [ ] Form labels associated with inputs
- [ ] Alt text on all images

### Browser Compatibility
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)
- [ ] Mobile Safari (iOS 14+)
- [ ] Chrome Mobile (Android 10+)

### Responsive Design
- [ ] Mobile (320px - 767px) tested
- [ ] Tablet (768px - 1023px) tested
- [ ] Desktop (1024px+) tested
- [ ] Large desktop (1920px+) tested
- [ ] Touch targets ≥ 44x44 px

### Loading States
- [ ] Skeleton loaders implemented
- [ ] Spinners for async operations
- [ ] Progress indicators for long operations
- [ ] Optimistic UI updates

### Error Handling
- [ ] User-friendly error messages
- [ ] Network error handling
- [ ] 404 page customized
- [ ] 500 page customized
- [ ] Form validation messages clear
- [ ] Toast notifications for errors

### Forms
- [ ] Client-side validation
- [ ] Server-side validation
- [ ] Error messages displayed inline
- [ ] Success feedback provided
- [ ] Autocomplete attributes set
- [ ] Input masking where appropriate

---

## 10. DevOps & CI/CD 🔄

### GitHub Actions
- [ ] CI pipeline configured
  - [ ] Lint check
  - [ ] Type check
  - [ ] Unit tests
  - [ ] E2E tests
  - [ ] Build check
- [ ] CD pipeline configured
  - [ ] Auto-deploy to staging on push to `develop`
  - [ ] Manual deploy to production from `main`
- [ ] Branch protection rules set
  - [ ] Require PR reviews (1+ approvals)
  - [ ] Require status checks to pass
  - [ ] Restrict who can push to main
- [ ] Secrets configured in GitHub
  ```bash
  # VERCEL_TOKEN
  # SENTRY_AUTH_TOKEN
  # CODECOV_TOKEN
  ```

### Version Control
- [ ] Main branch protected
- [ ] Develop branch for staging
- [ ] Feature branches for development
- [ ] Semantic versioning used (v1.0.0)
- [ ] Git tags for releases
- [ ] CHANGELOG.md maintained

### Deployment Process
- [ ] Deployment runbook documented
- [ ] Rollback procedure documented
- [ ] Zero-downtime deployment verified
- [ ] Deployment notifications configured (Slack)

---

## 11. Documentation 📚

### Technical Documentation
- [ ] README.md up to date
- [ ] DEPLOYMENT_GUIDE.md created
- [ ] PRODUCTION_CHECKLIST.md created
- [ ] RUNBOOK.md created
- [ ] ENVIRONMENT_SETUP.md created
- [ ] INFRASTRUCTURE.md created
- [ ] API documentation generated (OpenAPI)
  ```bash
  curl https://btrme.com/api-docs
  # ✓ Swagger UI accessible
  ```

### User Documentation
- [ ] User guide created
- [ ] FAQ section
- [ ] Troubleshooting guide
- [ ] Video tutorials (optional)

### Team Documentation
- [ ] Architecture diagram
- [ ] Database schema diagram
- [ ] Onboarding guide for new developers
- [ ] Code style guide
- [ ] Git workflow documented

---

## 12. Legal & Compliance ⚖️

### Data Privacy
- [ ] GDPR compliance (if serving EU users)
  - [ ] Cookie consent banner
  - [ ] Data deletion capability
  - [ ] Privacy policy updated
  - [ ] Data processing agreements
- [ ] CCPA compliance (if serving CA users)
- [ ] User data encrypted at rest
- [ ] User data encrypted in transit (TLS)
- [ ] Data retention policy defined
- [ ] Data backup procedure documented

### Security Compliance
- [ ] OWASP Top 10 vulnerabilities addressed
- [ ] Security audit performed (optional)
- [ ] Penetration testing completed (optional)
- [ ] Bug bounty program considered

### Terms & Policies
- [ ] Terms of Service reviewed by legal
- [ ] Privacy Policy reviewed by legal
- [ ] Acceptable Use Policy defined
- [ ] Copyright notices in place
- [ ] Open source licenses acknowledged

---

## 13. Business Readiness 💼

### Monitoring & Support
- [ ] On-call rotation defined
- [ ] Incident response plan documented
- [ ] Escalation procedures defined
- [ ] Support email configured
- [ ] Status page setup (optional)

### Marketing
- [ ] Launch announcement prepared
- [ ] Social media posts scheduled
- [ ] Email campaign ready (if applicable)
- [ ] Press release drafted (if applicable)
- [ ] Product Hunt submission prepared (optional)

### Analytics
- [ ] Google Analytics configured (if using)
- [ ] Conversion tracking setup
- [ ] User funnels defined
- [ ] KPIs identified
- [ ] Analytics dashboard created

### Cost Management
- [ ] Monthly cost estimate documented
- [ ] Billing alerts configured
- [ ] Budget approved
- [ ] Cost optimization plan

---

## 14. Final Pre-Launch Checks ✈️

### 24 Hours Before Launch
- [ ] All team members notified of launch time
- [ ] Support team briefed
- [ ] Marketing materials ready
- [ ] All stakeholders informed
- [ ] Rollback plan reviewed

### Launch Day Checklist
- [ ] Deploy to production during low-traffic hours
- [ ] Monitor error rates closely (first 2 hours)
- [ ] Monitor performance metrics
- [ ] Test critical user flows manually
- [ ] Verify all integrations working
- [ ] Check social auth providers
- [ ] Verify email delivery
- [ ] Test payment flow (if applicable)
- [ ] Monitor server resources
- [ ] Watch for any spikes in error logs

### Post-Launch (First Hour)
- [ ] Homepage loads correctly
- [ ] User signup working
- [ ] User login working
- [ ] OAuth providers working
- [ ] AI generation working
- [ ] Template marketplace loading
- [ ] No critical errors in Sentry
- [ ] Performance metrics within targets
- [ ] Database performance normal
- [ ] Cache hit rate normal

### Post-Launch (First 24 Hours)
- [ ] Monitor error rates (should be < 1%)
- [ ] Monitor performance (Core Web Vitals)
- [ ] Review user feedback
- [ ] Address any critical bugs immediately
- [ ] Prepare hotfix if needed
- [ ] Update status page if issues arise

### Post-Launch (First Week)
- [ ] Analyze user behavior (analytics)
- [ ] Review error trends (Sentry)
- [ ] Monitor cost trends
- [ ] Gather user feedback
- [ ] Prioritize bug fixes
- [ ] Plan first iteration based on feedback

---

## Sign-Off

### Team Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Tech Lead | __________ | __________ | __/__/__ |
| DevOps Engineer | __________ | __________ | __/__/__ |
| QA Lead | __________ | __________ | __/__/__ |
| Security Lead | __________ | __________ | __/__/__ |
| Product Manager | __________ | __________ | __/__/__ |
| CTO | __________ | __________ | __/__/__ |

### Final Go/No-Go Decision

**Production launch approved:** ☐ YES ☐ NO

**Approved by:** __________________

**Date:** ______________

**Launch date/time:** ______________ UTC

---

**Checklist Version:** 1.0.0
**Last Updated:** 2025-11-13
**Total Items:** 250+

**Note:** All checkboxes must be checked (✅) before production launch. Any unchecked items must be documented with a valid reason and mitigation plan.
