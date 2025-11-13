# ✅ Project Decisions - Final

Bu dosya projenin tüm kritik kararlarını içerir. Geliştirme sırasında referans olarak kullanılacak.

**Karar Tarihi:** 2025-11-13
**Durum:** ✅ Onaylandı

---

## 🎨 Kullanıcı Deneyimi

### 1. Onboarding Akışı
**Karar:** Option B - Kısa tutorial (3-4 adım)

**Implementation:**
```
Step 1: "Welcome! Create apps with simple prompts"
Step 2: "Choose a template or describe your idea" (example prompts)
Step 3: "Watch your app build in real-time"
Step 4: "Deploy instantly and share your app"
```

**First-time user görür:**
- Interactive tutorial (skippable)
- Example prompts showcase
- Template gallery preview
- "Start building" CTA

---

### 2. Prompt Input Stili
**Karar:** Option C - Hybrid (chat + form wizard)

**Implementation:**
- **Primary:** Chat interface (conversational AI)
- **Secondary:** "Guided mode" button → wizard with questions
- User tercih edebilir (first-time users için wizard önerilir)

**Wizard questions:**
```
1. What type of app? (Reminder, Dashboard, Form, CRUD, Other)
2. Main features? (Multi-select + custom)
3. Design preference? (Modern, Minimal, Colorful, Professional)
4. Any integrations? (Calendar, Notifications, etc.)
```

**Chat interface:**
- Free-form prompt
- AI asks clarifying questions
- Preview updates in real-time

---

### 3. Çoklu Dil Desteği
**Karar:** Option C - Otomatik dil algılama (AI)

**Implementation:**
- Claude automatically detects language from prompt
- UI language follows browser preference (EN/TR initially)
- Generated apps follow prompt language
- Supported languages: Türkçe, English (others auto-translated)

**Benefit:** Seamless UX, no language picker needed

---

## 🏗️ Teknik Kararlar

### 4. Monorepo vs Polyrepo
**Karar:** Option B - Polyrepo

**Structure:**
```
btrme-platform/          # Main platform (Next.js)
├── apps/
│   └── web/            # Main web app
├── packages/
│   ├── ui/             # Shared components
│   ├── db/             # Prisma + DB utilities
│   ├── ai/             # AI engine
│   └── auth/           # Auth utilities

btrme-templates/         # Separate repo for templates
├── base/
├── reminder/
├── dashboard/
├── form-builder/
└── crud/

btrme-apps/             # Generated apps (Git or DB storage)
└── [user-id]/
    └── [project-id]/
```

**Rationale:**
- Clear separation of concerns
- Independent deployment cycles
- Templates can be versioned separately

---

### 5. Database Stratejisi (Generated Apps)
**Karar:** Option B - Shared PostgreSQL with schema per app

**Implementation:**
```sql
-- Platform DB
database: btrme_platform
schemas: public

-- Generated Apps DB
database: btrme_apps
schemas: app_[project_id_1], app_[project_id_2], ...

-- Each app gets isolated schema
CREATE SCHEMA app_abc123;
GRANT ALL ON SCHEMA app_abc123 TO app_user;
```

**Benefits:**
- Cost-effective (shared infrastructure)
- Proper isolation (schema-level)
- Easy backup/restore per app
- Scalable (can move to dedicated instances later)

**Security:**
- Row-level security (RLS)
- Separate connection credentials per app
- Query timeout limits
- Storage quotas per schema

---

### 6. Generated App Stack
**Karar:** Option C - AI karar verir (prompt'a göre)

**Initial Support:**
- **Next.js 14** (default for web apps)
- **Next.js + PWA** (for mobile-like experiences)
- Future: React Native, Vue, Svelte

**AI Decision Logic:**
```typescript
interface StackDecision {
  framework: 'next' | 'react' | 'vue';
  features: {
    pwa: boolean;
    ssr: boolean;
    api: boolean;
  };
  reasoning: string;
}

// AI analyzes prompt:
// "mobile app" → Next.js + PWA
// "dashboard with real-time updates" → Next.js + SSR
// "simple landing page" → Next.js (static)
```

**MVP:** Next.js only (Phase 1), expand later

---

### 7. Real-time Updates
**Karar:** Option C - Server-Sent Events (SSE)

**Implementation:**
```typescript
// Server (API route)
export async function GET(req: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send build progress
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        status: 'building',
        progress: 50,
        message: 'Installing dependencies...'
      })}\n\n`));
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}

// Client
const eventSource = new EventSource('/api/build/status?id=abc');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateUI(data);
};
```

**Benefits:**
- Simpler than WebSocket
- Auto-reconnect
- Works through proxies/firewalls
- Lower overhead

---

## 💰 İş Modeli

### 8. Pricing Model
**Karar:** Option B/D Hybrid - Freemium + Subscription tiers

**Pricing Tiers:**

#### 🆓 Free (Forever)
```
✓ 3 active projects
✓ 10 generations per month
✓ 5 deployments per month
✓ Apps auto-suspend after 7 days inactivity
✓ 100MB storage per project
✓ Community support
✓ BTRMe branding on apps
✓ Basic templates
```

#### 💎 Pro ($19/month)
```
✓ 20 active projects
✓ 100 generations per month
✓ Unlimited deployments
✓ Apps stay alive (no auto-suspend)
✓ 1GB storage per project
✓ Priority support (email)
✓ Remove BTRMe branding
✓ All templates
✓ Custom domains (5 max)
✓ Database per app (shared PostgreSQL)
✓ API access (5000 calls/mo)
```

#### 🚀 Team ($49/month)
```
✓ Unlimited projects
✓ Unlimited generations
✓ Unlimited deployments
✓ 5GB storage per project
✓ Priority support (chat)
✓ White-label option
✓ Team collaboration (5 members)
✓ Advanced templates
✓ Custom domains (unlimited)
✓ Dedicated database instances (optional +$29/mo)
✓ API access (50,000 calls/mo)
✓ Usage analytics & insights
```

#### 🏢 Enterprise (Custom)
```
✓ Everything in Team
✓ Unlimited team members
✓ SLA guarantee (99.9% uptime)
✓ Dedicated support
✓ On-premise deployment option
✓ Custom integrations
✓ Advanced security features
✓ Custom contract
```

**Additional Usage Charges (Pro & Team):**
- Extra generations: $0.50 per generation (after quota)
- Extra storage: $5 per 1GB/month
- Extra API calls: $10 per 10,000 calls

**Revenue Goal:**
- Month 1: $0 (all free beta)
- Month 3: $500 MRR (25 Pro users)
- Month 6: $2,000 MRR (50 Pro + 10 Team)
- Month 12: $10,000 MRR

---

### 9. Resource Limits (Free Tier)
**Karar:** Önerilen değerler kabul

**Free Tier Limits:**
```yaml
projects: 3
generations_per_month: 10
deployments_per_month: 5
storage_per_project_mb: 100
ai_calls: "included in generations"
app_lifetime_days: 7 # auto-suspend after inactivity
concurrent_builds: 1
max_build_time_seconds: 300
max_container_size_mb: 150
custom_domains: 0
team_members: 1 # solo only
```

**Rate Limits (API):**
```yaml
api_requests_per_minute: 30
generations_per_hour: 3
deployments_per_hour: 2
```

**Hard Limits (all tiers):**
```yaml
max_project_files: 100
max_file_size_mb: 10
max_prompt_length: 5000 # characters
max_generated_code_size_mb: 50
```

---

## 🔒 Güvenlik & Compliance

### 10. User Authentication
**Karar:** Option A - Account gerekli (zorunlu)

**Authentication Methods:**
- Email + Password (with verification)
- Google OAuth
- GitHub OAuth
- Future: Microsoft, Apple

**Session Management:**
- JWT tokens (access + refresh)
- 7 days session (with remember me)
- 1 hour access token
- Secure httpOnly cookies

**No Guest Mode Rationale:**
- Better abuse prevention
- Usage tracking for fair pricing
- Project ownership & persistence
- Support & communication channel

---

### 11. Generated Code Ownership
**Karar:** Option A - User tam sahip (MIT-like)

**License Terms:**
```
The code generated by BTRMe belongs to YOU (the user).

✓ You own all generated code
✓ You can use it commercially
✓ You can modify it freely
✓ You can distribute it
✓ No attribution required (but appreciated)

We (BTRMe) have no rights to your generated code.
```

**Legal:**
- Add to Terms of Service
- Clear IP ownership clause
- User can export & delete anytime

**Platform Code:**
- Platform itself: Proprietary
- Templates: Open source (MIT) - users can fork

---

### 12. Content Moderation
**Karar:** Hybrid - AI + manual review

**Implementation:**

**Tier 1: AI Moderation (Automated)**
```typescript
// Check prompt before generation
const moderationResult = await anthropic.moderate(prompt);

if (moderationResult.flagged) {
  return {
    error: 'Content policy violation',
    reason: moderationResult.categories,
    appeal: 'Contact support if you believe this is an error'
  };
}
```

**Blocked Content:**
- Illegal activities
- Adult/NSFW content
- Hate speech
- Scams/phishing
- Malware/exploits
- Violence

**Tier 2: Automated Scanning (Post-generation)**
- Scan generated code for malicious patterns
- Check for hardcoded credentials
- Verify no external data exfiltration

**Tier 3: User Reporting**
- "Report" button on public apps
- Community flagging
- Manual review queue

**Tier 4: Manual Review**
- Flagged content reviewed by team
- 24-48 hour response time
- Account suspension for violations
- Appeal process available

**Transparency:**
- Public content policy
- Clear violation explanations
- Appeal process documented

---

## 🚀 MVP Scope (FINALIZED)

### Must Have (P0) - Week 12 Launch Blockers
- [x] User registration/login (Email + Google)
- [x] Prompt input (Hybrid: Chat + Wizard)
- [x] AI prompt analysis & clarification
- [x] Code generation (5 templates minimum)
- [x] Security validation
- [x] Automated deployment to Fly.io
- [x] Live preview iframe
- [x] Code view (Monaco editor)
- [x] Code export (download ZIP)
- [x] Basic project management (create, list, delete)
- [x] Build progress tracking (SSE)
- [x] Subdomain management (*.btrme.app)
- [x] Free tier implementation

### Should Have (P1) - Launch with caveats
- [x] Iterative refinement ("add feature X")
- [x] Version history (last 5 versions)
- [x] Template gallery
- [x] Basic analytics (usage stats)
- [x] Database per app (shared PostgreSQL)
- [ ] Custom domains (manual setup initially)

### Nice to Have (P2) - Post-MVP (Month 2-3)
- [ ] Team collaboration
- [ ] API access for developers
- [ ] Advanced analytics dashboard
- [ ] Template marketplace (user-generated)
- [ ] AI-generated tests
- [ ] Multi-language UI (full i18n)

### Won't Have (V1)
- [ ] Mobile native apps (React Native)
- [ ] On-premise deployment
- [ ] White-label (Enterprise only)
- [ ] Video tutorials (documentation only)
- [ ] Live chat support (email only)

---

## 📱 Platform Features (Confirmed)

### 15. Mobile Support
**Karar:** Option B - PWA (Progressive Web App)

**Implementation:**
- All generated apps are responsive by default
- PWA manifest.json auto-generated
- Service worker for offline support (optional)
- "Add to Home Screen" functionality
- Push notifications API support

**Template Optimization:**
- Mobile-first design
- Touch-friendly UI components
- Responsive breakpoints (sm, md, lg, xl)

---

### 16. API Access for Developers
**Karar:** Option C - Paid feature (Pro+)

**API Endpoints:**
```typescript
// Authentication
POST /api/v1/auth/token

// Generation
POST /api/v1/projects
GET  /api/v1/projects
GET  /api/v1/projects/:id
PUT  /api/v1/projects/:id

POST /api/v1/generate
{
  "prompt": "water reminder app",
  "template": "reminder", // optional
  "autoDeploy": true
}

// Deployment
POST /api/v1/deploy/:projectId
GET  /api/v1/deploy/:projectId/status
DELETE /api/v1/deploy/:projectId

// Templates
GET /api/v1/templates
GET /api/v1/templates/:id
```

**Rate Limits:**
- Free: No API access
- Pro: 5,000 calls/month
- Team: 50,000 calls/month
- Enterprise: Custom

---

### 17. Marketplace / Template Sharing
**Karar:** Option C - Post-MVP (Phase 2)

**Roadmap:**
- **Phase 1 (MVP):** Official templates only (5 templates)
- **Phase 2 (Month 2-3):** User template export/import
- **Phase 3 (Month 4-6):** Public marketplace
  - Users publish templates
  - Rating & reviews
  - Monetization option (paid templates)
  - Revenue share: 70% creator / 30% platform

---

## 🎯 Success Metrics (CONFIRMED)

### Launch Success (First 30 Days)

**User Acquisition:**
- ✅ 100+ signups (target: 200)
- ✅ 50+ active users (DAU)
- ✅ 30+ retained users (D7 retention >60%)

**Product Usage:**
- ✅ 50+ projects created
- ✅ 30+ deployed apps live
- ✅ 10+ apps still active after 7 days

**Technical Performance:**
- ✅ 90%+ generation success rate
- ✅ 95%+ deployment success rate
- ✅ <60s average generation time
- ✅ <3min average deployment time
- ✅ 99.5%+ platform uptime

**Quality:**
- ✅ <10 critical bugs
- ✅ <5 security incidents
- ✅ NPS score >40
- ✅ <3% churn rate

**Business:**
- ✅ $0 MRR (free beta is okay)
- ✅ 10+ Pro tier interest (waitlist)
- ✅ <$500 monthly infrastructure cost

---

## 🛠️ Development Practices (CONFIRMED)

### 19. Testing Strategy
**Karar:** Option B - Critical paths only (~50%)

**Testing Pyramid:**
```
E2E Tests (10%)
├── Happy path: Prompt → Deploy
├── Auth flow
└── Payment flow (when added)

Integration Tests (30%)
├── API endpoints
├── Database operations
├── AI pipeline
└── Deployment flow

Unit Tests (60%)
├── Validators (security)
├── Utility functions
├── Template generators
└── Business logic
```

**Coverage Targets:**
- Security validators: 100%
- API routes: 80%
- Utils: 70%
- Components: 30% (critical only)

**Tools:**
- Jest (unit + integration)
- Playwright (E2E)
- Supertest (API)

---

### 20. Code Review Process
**Karar:** Option A - 1 approval required

**PR Rules:**
- 1 approval minimum (any team member)
- Critical changes (security, billing): Lead approval
- Auto-merge after approval + CI pass
- Max PR age: 48 hours (stale = close)

**Review Checklist:**
```
[ ] Code follows style guide
[ ] Tests added/updated
[ ] No console.logs
[ ] No hardcoded secrets
[ ] Documentation updated
[ ] Performance considered
```

**CI Checks (must pass):**
- Linting (ESLint)
- Type checking (TypeScript)
- Tests (unit + integration)
- Build success
- No security vulnerabilities (npm audit)

---

## 📞 Support & Community (CONFIRMED)

### 21. User Support
**Karar:** Option D + A - Help docs + Email support

**Support Channels:**

**Free Tier:**
- Documentation (comprehensive)
- FAQ / Knowledge base
- Community Discord (future)
- Email support (48h response)

**Pro Tier:**
- Everything in Free
- Email support (24h response)
- Feature requests prioritized

**Team/Enterprise:**
- Everything in Pro
- Priority email (4h response)
- Optional: Slack/Discord direct line

**Documentation Structure:**
```
/docs
├── getting-started
│   ├── quickstart
│   ├── first-app
│   └── deployment
├── guides
│   ├── templates
│   ├── customization
│   └── best-practices
├── api-reference
│   └── rest-api
├── troubleshooting
│   └── common-issues
└── faq
```

---

## 🌍 Deployment & Hosting (CONFIRMED)

### 22. Generated Apps Lifecycle
**Karar:** Option C - Free tier: 7 gün, Paid: unlimited

**Lifecycle Rules:**

**Free Tier:**
- Apps active for 7 days
- After 7 days inactivity → suspended
- User can restart anytime (counts as new deployment)
- After 30 days suspended → deleted (with 7-day warning email)

**Pro Tier:**
- Apps stay alive indefinitely
- Inactivity = okay (no auto-suspend)
- User can manually stop/start
- Deleted only on user request

**Team Tier:**
- Same as Pro
- Auto-scaling enabled
- Health monitoring included

**Inactivity Definition:**
- No HTTP requests for 7 days
- No user access to dashboard

**Warning System:**
```
Day 5: Email "Your app will suspend in 2 days"
Day 7: Suspend + email "App suspended, click to reactivate"
Day 23: Email "App will be deleted in 7 days"
Day 30: Delete + final email "App deleted, code still downloadable"
```

---

### 23. Scaling Threshold
**Karar:** Önerilen değerler kabul

**Scaling Triggers:**

**Infrastructure Scale:**
```
Trigger: 100+ active users
Action:
- Add database read replica
- Increase Redis memory
- CDN for static assets
```

```
Trigger: 50+ concurrent builds
Action:
- Add 2 more BullMQ workers
- Increase build queue capacity
- Optimize build caching
```

```
Trigger: 200+ deployed apps
Action:
- Multi-region Fly.io deployment
- Load balancer setup
- Geographic DNS routing
```

**Cost Scale:**
```
Trigger: $1000/mo AI costs
Action:
- Implement aggressive caching
- Consider fine-tuning smaller model
- Optimize prompts (reduce tokens)
- Introduce hard limits per user
```

**Performance Scale:**
```
Trigger: P95 latency >1s
Action:
- Database query optimization
- Add database indexes
- Implement Redis caching
- Code splitting & lazy loading
```

**Storage Scale:**
```
Trigger: 100GB+ storage
Action:
- S3 lifecycle policies (auto-archive)
- Compress build artifacts
- Clean up old deployments
- Implement storage quotas
```

---

## 🎨 Branding & Design (CONFIRMED)

### 24. Platform Name
**Karar:** BTRMe ✅ (Confirmed)

**Domain:**
- Primary: **btrme.app** ✅
- Backup: btrme.io, btrme.dev (register both)

**Branding:**
- Name: BTRMe
- Tagline: "Build apps with AI, instantly"
- Alternative: "Your ideas, deployed in minutes"

---

### 25. Design System
**Karar:** Code-first approach

**Approach:**
- No Figma initially (move fast)
- Tailwind CSS + shadcn/ui
- Build design system in code
- Document with Storybook (later)

**Design Tokens:**
```typescript
// colors
primary: indigo
secondary: purple
accent: pink
neutral: gray
success: green
error: red
warning: yellow

// spacing: Tailwind default (4px base)
// typography: Inter font
// radius: rounded-lg default
// shadows: Tailwind default
```

**Component Library:**
- shadcn/ui (copy-paste components)
- Custom components as needed
- Consistent props API
- Dark mode support

---

## ✅ Action Items Summary

### Week 0 (Pre-Development)
- [x] Finalize all decisions ✅
- [ ] Setup repositories (platform + templates)
- [ ] Domain registration (btrme.app)
- [ ] Team onboarding
- [ ] Development environment setup
- [ ] First sprint planning meeting

### Week 1 (Sprint 1 Start)
- [ ] Project initialization (Next.js, Prisma)
- [ ] Database setup (PostgreSQL + Redis)
- [ ] Authentication implementation
- [ ] AI API integration (Claude)
- [ ] Basic UI components

### Ongoing
- [ ] Update this doc as decisions change
- [ ] Weekly decision review
- [ ] Document lessons learned

---

## 📊 Decision Change Log

| Date | Decision | Changed To | Reason |
|------|----------|------------|---------|
| 2025-11-13 | Initial decisions | - | First planning session |
| - | - | - | - |

---

**Status:** ✅ APPROVED & LOCKED
**Next Review:** Sprint 1 Retrospective (Week 4)
**Maintained By:** Team Lead

**Note:** Decisions can be revisited during sprint retrospectives if data shows a need for change. Always document why.
