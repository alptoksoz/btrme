# 🔷 SPRINT 1: Foundation & Authentication
## Week 1-2 | Ultra-Detailed Breakdown

**Sprint Duration:** 10 business days (2 weeks)
**Sprint Goal:** Establish infrastructure, implement authentication, create UI foundation
**Total Story Points:** 80 SP
**Team Capacity:** 640 hours (8 people × 40h × 2 weeks)

---

## 📊 Sprint 1 Overview

### Sprint Objectives
1. ✅ Complete project setup (repo, CI/CD, environments)
2. ✅ Implement authentication (email + Google OAuth)
3. ✅ Create UI component library foundation
4. ✅ Build landing page
5. ✅ Deploy to staging environment

### Success Criteria
- [ ] CI/CD pipeline functional (all checks passing)
- [ ] Users can sign up and log in (email + Google)
- [ ] Protected routes working (auth middleware)
- [ ] Landing page live on staging
- [ ] Code coverage >70%
- [ ] No P0/P1 bugs
- [ ] All sprint stories meet DoD

### Sprint Metrics
```yaml
Planned Story Points: 80 SP
Planned Hours: 640 hours
Velocity Target: 80 SP (baseline sprint)
Team Size: 8 people
Sprint Length: 2 weeks (10 business days)

Story Distribution:
  - Epic 1.1 (Project Setup): 13 SP (16%)
  - Epic 1.2 (Authentication): 21 SP (26%)
  - Epic 1.3 (UI Foundation): 26 SP (33%)
  - Epic 1.4 (Landing Page): 20 SP (25%)
```

---

## 🗓️ Daily Schedule

### Day 1 (Monday) - Sprint Kickoff
**Morning (4 hours): Sprint Planning**
- 9:00-10:00: Review Sprint 1 backlog
- 10:00-11:30: Story point estimation (Planning Poker)
- 11:30-12:30: Task assignment & sprint commitment
- 12:30-13:00: Sprint board setup (Jira/Linear)

**Afternoon:**
- PM: Refine acceptance criteria, prepare user stories
- TL + DO: Architecture review, infrastructure planning
- BE1 + BE2: Database schema design session
- FE1 + FE2: UI component library planning
- QA: Test strategy planning, tool setup

**Assignments:**
- DO starts Story 1.1.1 (Repository Setup)
- TL starts Story 1.1.1 (Workspace Setup)
- Rest of team: Environment setup

---

### Day 2 (Tuesday)
**Morning:**
- DO continues Story 1.1.1, starts 1.1.2 (CI/CD)
- TL continues Story 1.1.1, reviews architecture
- BE1 starts Story 1.1.3 (Database Setup)
- FE1 starts Story 1.3.1 (UI Component Library)
- QA: Environment setup, begin test plan

**Afternoon:**
- Code reviews for completed tasks
- Pair programming: TL + BE1 (Prisma schema)
- Pair programming: FE1 + FE2 (Tailwind setup)

**End of Day:**
- Story 1.1.1 complete (DO + TL)
- Story 1.1.3 in progress (BE1, 50% done)

---

### Day 3 (Wednesday)
**Morning:**
- DO completes Story 1.1.2 (CI/CD)
- BE1 completes Story 1.1.3 (Database)
- BE1 starts Story 1.2.1 (NextAuth.js - backend)
- FE1 continues Story 1.3.1 (UI components)
- TL reviews all PRs from Day 2

**Afternoon:**
- Integration testing: DO + QA (CI/CD pipeline)
- Pair programming: BE1 + TL (NextAuth setup)
- FE2 starts Story 1.3.2 (Layout components)

**End of Day:**
- Epic 1.1 complete (all infrastructure stories done)
- Story 1.2.1 in progress (BE1, 40% done)
- Story 1.3.1 in progress (FE1, 60% done)

---

### Day 4 (Thursday)
**Morning:**
- BE1 continues Story 1.2.1 (NextAuth backend)
- FE1 completes Story 1.3.1 (UI components)
- FE1 starts Story 1.2.2 (Auth UI)
- FE2 continues Story 1.3.2 (Layouts)
- BE2 starts Story 1.3.3 (API foundation)

**Afternoon:**
- Code reviews
- BE1 completes Story 1.2.1
- Integration testing: BE1 + FE1 (Auth flow)
- PM reviews progress, adjusts scope if needed

**End of Day:**
- Story 1.2.1 complete (BE1)
- Story 1.3.1 complete (FE1)
- Sprint ~40% complete

---

### Day 5 (Friday) - Mid-Sprint
**Morning:**
- FE1 continues Story 1.2.2 (Auth UI, 70% done)
- FE2 completes Story 1.3.2 (Layouts)
- BE2 continues Story 1.3.3 (API foundation)
- QA: Begin testing completed stories

**Afternoon (2 hours): Mid-Sprint Review & Backlog Grooming**
- Review completed stories (Demo)
- Adjust remaining work if needed
- Groom Sprint 2 backlog
- Team health check

**After Review:**
- Address any blockers
- Continue development

**End of Day:**
- Story 1.2.2 in progress (FE1, 70% done)
- Story 1.3.2 complete (FE2)
- Sprint ~50% complete

---

### Day 6 (Monday Week 2)
**Morning:**
- FE1 completes Story 1.2.2 (Auth UI)
- BE2 completes Story 1.3.3 (API foundation)
- FE2 starts Story 1.4.1 (Landing Page Hero)
- BE1 starts Story 1.2.3 (Authorization & Permissions)
- QA: Testing Stories 1.2.1, 1.2.2, 1.3.1, 1.3.2

**Afternoon:**
- Integration testing: Full auth flow (email + Google)
- Code reviews
- Bug fixes from QA testing

**End of Day:**
- Epic 1.3 complete (UI Foundation done)
- Story 1.2.2 complete (FE1)
- Story 1.4.1 in progress (FE2, 40% done)
- Sprint ~65% complete

---

### Day 7 (Tuesday)
**Morning:**
- FE2 continues Story 1.4.1 (Landing Page Hero)
- FE1 starts Story 1.4.2 (Landing Page Features section)
- BE1 continues Story 1.2.3 (Authorization)
- TL + DO: Performance review, optimization

**Afternoon:**
- FE2 completes Story 1.4.1
- FE2 starts Story 1.4.3 (Landing Page CTA)
- QA: Regression testing
- Bug fixes

**End of Day:**
- Story 1.4.1 complete (FE2)
- Sprint ~75% complete

---

### Day 8 (Wednesday)
**Morning:**
- FE1 completes Story 1.4.2 (Features section)
- FE2 completes Story 1.4.3 (CTA section)
- FE1 starts Story 1.4.4 (Footer)
- BE1 completes Story 1.2.3 (Authorization)
- QA: Full regression testing

**Afternoon:**
- Code reviews (all remaining PRs)
- Bug fixes (P1 and P2 bugs)
- Documentation updates

**End of Day:**
- Epic 1.2 complete (Authentication done)
- Story 1.4.4 in progress (FE1, 50% done)
- Sprint ~85% complete

---

### Day 9 (Thursday)
**Morning:**
- FE1 completes Story 1.4.4 (Footer)
- All dev complete, focus on testing & polish
- QA: Final testing pass (E2E, security, performance)
- Team: Bug fixes, documentation

**Afternoon:**
- Deploy to staging
- Smoke testing on staging
- PM: Acceptance testing
- Prepare sprint review demo

**End of Day:**
- All stories complete
- All tests passing
- Staging deployment successful
- Sprint 100% complete

---

### Day 10 (Friday) - Sprint Close
**Morning:**
- Final bug fixes (if any critical issues found)
- Documentation finalization
- Code cleanup

**Afternoon (2 hours): Sprint Review**
- Demo all completed features
- Stakeholder feedback
- Acceptance criteria verification
- Celebrate wins 🎉

**Afternoon (1.5 hours): Sprint Retrospective**
- What went well
- What could improve
- Action items for Sprint 2
- Team health discussion

**After Retro:**
- Update Jira/Linear (close sprint)
- Commit to Sprint 2 work
- Prepare for Monday Sprint 2 start

---

## 📦 EPIC 1.1: Project Setup & Infrastructure
**Owner:** DevOps (DO) + Tech Lead (TL)
**Story Points:** 13 SP
**Duration:** Days 1-3
**Goal:** Establish development environment, CI/CD, and infrastructure foundation

---

### Story 1.1.1: Repository & Monorepo Setup
**ID:** BTR-101
**Assignee:** DO (Lead) + TL (Support)
**Story Points:** 5 SP
**Estimated Hours:** 12 hours
**Priority:** P0 (Critical)
**Dependencies:** None

**User Story:**
```
As a developer,
I want a properly configured repository with monorepo structure,
So that the team can collaborate effectively with consistent tooling.
```

**Acceptance Criteria:**
```gherkin
Given a new GitHub repository
When I clone the repository
Then I should have:
  - Proper folder structure (apps/, packages/)
  - Working pnpm workspace configuration
  - Turborepo build caching functional
  - Git hooks (pre-commit, commit-msg) working
  - Branch protection rules configured
  - CODEOWNERS file in place
  - Issue/PR templates available

And the following commands should work:
  - pnpm install (installs all dependencies)
  - pnpm turbo dev (starts all dev servers)
  - pnpm turbo build (builds all packages)
  - pnpm turbo lint (lints all code)
  - pnpm turbo test (runs all tests)
  - git commit (triggers pre-commit hooks)
```

---

#### Task 1.1.1.1: GitHub Repository Creation & Configuration
**Assignee:** DO
**Hours:** 3 hours
**Priority:** P0

**Implementation Steps:**

**Step 1: Create Repository (30 min)**
```bash
# On GitHub
1. Navigate to github.com/your-org
2. Click "New repository"
3. Name: btrme-platform
4. Description: "AI-Powered NoCode Builder - Transform prompts into deployed apps"
5. Visibility: Private (initially)
6. Initialize with: None (we'll push from local)
7. Create repository

# Clone locally
git clone git@github.com:your-org/btrme-platform.git
cd btrme-platform

# Initial commit
git checkout -b main
echo "# BTRMe Platform" > README.md
git add README.md
git commit -m "chore: initial commit"
git push -u origin main
```

**Step 2: Branch Protection Rules (45 min)**
```yaml
# Settings → Branches → Add rule

Branch name pattern: main

Protect matching branches:
  ✅ Require a pull request before merging
    ✅ Require approvals: 2
    ✅ Dismiss stale pull request approvals when new commits are pushed
    ✅ Require review from Code Owners

  ✅ Require status checks to pass before merging
    ✅ Require branches to be up to date before merging
    Status checks required:
      - CI / lint
      - CI / test
      - CI / build
      - CI / type-check

  ✅ Require conversation resolution before merging
  ✅ Require signed commits
  ✅ Require linear history

  ✅ Do not allow bypassing the above settings
  ✅ Restrict who can push to matching branches
    Allowed: Maintainers only

# Create develop branch
Branch name pattern: develop

Protect matching branches:
  ✅ Require a pull request before merging
    ✅ Require approvals: 1
  ✅ Require status checks to pass before merging
```

**Step 3: CODEOWNERS Configuration (30 min)**
```bash
# Create .github/CODEOWNERS

# Global owners (all files)
* @tech-lead @senior-engineer-1

# Apps
/apps/web/ @frontend-lead @frontend-engineer-1
/apps/web/app/api/ @backend-lead @backend-engineer-1

# Packages
/packages/ui/ @frontend-lead
/packages/db/ @backend-lead
/packages/ai/ @tech-lead @backend-engineer-2
/packages/auth/ @backend-lead

# Infrastructure
/infrastructure/ @devops-lead
/.github/workflows/ @devops-lead @tech-lead
/docker-compose.yml @devops-lead

# Documentation
/docs/ @product-manager
*.md @product-manager

# Configuration
/.env.example @devops-lead @tech-lead
/package.json @tech-lead
/turbo.json @tech-lead
```

**Step 4: Issue/PR Templates (45 min)**
```markdown
# .github/ISSUE_TEMPLATE/bug_report.md
---
name: Bug Report
about: Report a bug to help us improve
title: '[BUG] '
labels: bug, needs-triage
assignees: ''
---

## 🐛 Bug Description
A clear and concise description of what the bug is.

## 🔄 Steps To Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## ✅ Expected Behavior
A clear and concise description of what you expected to happen.

## ❌ Actual Behavior
What actually happened.

## 📸 Screenshots
If applicable, add screenshots to help explain your problem.

## 🌍 Environment
- OS: [e.g. macOS 13.1]
- Browser: [e.g. Chrome 108]
- Version: [e.g. v1.2.3]

## 📋 Additional Context
Add any other context about the problem here.

## 🔍 Possible Solution
If you have ideas on how to fix this, please share.
```

```markdown
# .github/ISSUE_TEMPLATE/feature_request.md
---
name: Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement, needs-triage
assignees: ''
---

## 🚀 Feature Description
A clear and concise description of the feature.

## 💡 Problem Statement
What problem does this feature solve?

## 📝 Proposed Solution
How would you implement this feature?

## 🎨 UI/UX Mockups
If applicable, add mockups or wireframes.

## ✅ Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## 🔗 Related Issues
List any related issues or PRs.

## 📊 Priority
- [ ] High (Critical for next release)
- [ ] Medium (Important but not blocking)
- [ ] Low (Nice to have)
```

```markdown
# .github/PULL_REQUEST_TEMPLATE.md
## 📝 Description
Brief description of changes in this PR.

## 🎯 Related Issue
Fixes #(issue number)

## 🔄 Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Test update

## ✅ Checklist
- [ ] My code follows the code style of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## 🧪 Testing
Describe the tests you ran and how to reproduce them.

## 📸 Screenshots (if applicable)
Add screenshots to help explain your changes.

## 🔍 Code Review Notes
Any specific areas you want reviewers to focus on?
```

**Step 5: Repository Settings (30 min)**
```yaml
# Settings → General

Features:
  ✅ Issues
  ✅ Projects
  ✅ Wiki: ❌ (use docs/ folder instead)
  ✅ Discussions: ❌ (use Slack)

Pull Requests:
  ✅ Allow squash merging
    ✅ Default to pull request title and commit details
  ❌ Allow merge commits
  ❌ Allow rebase merging
  ✅ Always suggest updating pull request branches
  ✅ Automatically delete head branches

Archives:
  ✅ Include Git LFS objects in archives

# Settings → Security

Dependabot alerts:
  ✅ Enable
  ✅ Severity: Critical, High, Medium

Dependabot security updates:
  ✅ Enable (auto-create PRs for security updates)

Code scanning:
  ✅ CodeQL analysis (setup via GitHub Actions)

Secret scanning:
  ✅ Enable
  ✅ Push protection (block commits with secrets)
```

**Testing Steps:**
```bash
# Test 1: Clone and verify structure
git clone git@github.com:your-org/btrme-platform.git
cd btrme-platform
ls -la # Should see .github/ folder

# Test 2: Branch protection
git checkout -b test-branch
touch test.txt
git add test.txt
git commit -m "test: protection"
git push origin test-branch
# Try to push to main directly (should fail)
git push origin test-branch:main # Should be rejected

# Test 3: Create test PR
# Go to GitHub, create PR from test-branch to main
# Should require 2 approvals
# Should require status checks (will fail - not set up yet)

# Test 4: CODEOWNERS
# Create PR modifying /packages/db/
# Should auto-request review from @backend-lead

# Cleanup
git push origin --delete test-branch
```

**Deliverables:**
- ✅ GitHub repository created
- ✅ Branch protection rules active
- ✅ CODEOWNERS file committed
- ✅ Issue/PR templates available
- ✅ Security features enabled

**Documentation:**
```markdown
# Add to README.md

## Repository Structure
This is a monorepo managed with pnpm workspaces and Turborepo.

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches
- `hotfix/*`: Production hotfixes

### Pull Request Process
1. Create feature branch from `develop`
2. Make changes, commit with conventional commits
3. Push to remote, open PR to `develop`
4. Ensure CI passes (lint, test, build)
5. Request reviews (2 approvals required for main, 1 for develop)
6. Address review feedback
7. Squash and merge

### Code Owners
Changes to specific files/folders require approval from designated code owners.
See `.github/CODEOWNERS` for details.
```

---

#### Task 1.1.1.2: Monorepo Structure & Workspace Setup
**Assignee:** TL
**Hours:** 4 hours
**Priority:** P0
**Dependencies:** Task 1.1.1.1

**Implementation Steps:**

**Step 1: Project Structure Creation (1 hour)**
```bash
# Create folder structure
mkdir -p apps/web
mkdir -p packages/{ui,db,ai,auth,config,email}
mkdir -p docs
mkdir -p scripts
mkdir -p infrastructure/{docker,terraform}

# Create root package.json
cat > package.json << 'EOF'
{
  "name": "btrme-platform",
  "version": "0.1.0",
  "private": true,
  "description": "AI-Powered NoCode Builder Platform",
  "keywords": ["nocode", "ai", "builder", "nextjs"],
  "license": "UNLICENSED",
  "author": "BTRMe Team",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "lint:fix": "turbo lint:fix",
    "type-check": "turbo type-check",
    "test": "turbo test",
    "test:watch": "turbo test:watch",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,md,json}\"",
    "clean": "turbo clean && rm -rf node_modules .turbo",
    "db:push": "pnpm --filter @btrme/db db:push",
    "db:migrate": "pnpm --filter @btrme/db db:migrate",
    "db:studio": "pnpm --filter @btrme/db db:studio",
    "db:seed": "pnpm --filter @btrme/db db:seed",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@commitlint/cli": "^18.6.0",
    "@commitlint/config-conventional": "^18.6.0",
    "@turbo/gen": "^1.12.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.2.0",
    "prettier": "^3.2.0",
    "turbo": "^1.12.0",
    "typescript": "^5.3.0"
  }
}
EOF

# Create pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - "apps/*"
  - "packages/*"
EOF

# Create .npmrc
cat > .npmrc << 'EOF'
# Use pnpm
package-manager=pnpm

# Strict peer dependencies
strict-peer-dependencies=true

# Auto-install peers
auto-install-peers=true

# Shamefully hoist (compatibility with Next.js)
shamefully-hoist=true

# Public hoist pattern
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*

# Save exact versions
save-exact=true

# Node linker
node-linker=isolated
EOF
```

**Step 2: Turborepo Configuration (1.5 hours)**
```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "globalEnv": [
    "NODE_ENV",
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "ANTHROPIC_API_KEY",
    "UPSTASH_REDIS_URL",
    "UPSTASH_REDIS_TOKEN"
  ],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": [
        "NEXT_PUBLIC_APP_URL",
        "NEXT_PUBLIC_API_URL"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"],
      "outputs": []
    },
    "lint:fix": {
      "dependsOn": ["^lint:fix"],
      "cache": false,
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^type-check"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts", "test/**/*.tsx"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    },
    "db:push": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:studio": {
      "cache": false,
      "persistent": true
    },
    "db:seed": {
      "cache": false
    }
  }
}
```

**Step 3: TypeScript Project References (1 hour)**
```json
// tsconfig.json (root)
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "jsx": "preserve",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "removeComments": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "incremental": true
  },
  "exclude": [
    "node_modules",
    "dist",
    ".next",
    ".turbo"
  ]
}

// Create base tsconfig for packages
// packages/tsconfig/base.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "noEmit": false
  }
}

// packages/tsconfig/nextjs.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

// packages/tsconfig/react-library.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["dom", "esnext"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "target": "es2019"
  }
}
```

**Step 4: Package Initialization (30 min)**
```bash
# Initialize pnpm workspace
pnpm install

# Create package.json for each package
cd packages/ui && cat > package.json << 'EOF'
{
  "name": "@btrme/ui",
  "version": "0.1.0",
  "private": true,
  "exports": {
    "./*": "./src/*.tsx"
  },
  "scripts": {
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@btrme/tsconfig": "workspace:*",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
EOF

cd ../db && cat > package.json << 'EOF'
{
  "name": "@btrme/db",
  "version": "0.1.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:generate": "prisma generate",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@prisma/client": "^5.9.0"
  },
  "devDependencies": {
    "@btrme/tsconfig": "workspace:*",
    "prisma": "^5.9.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  }
}
EOF

# Repeat for other packages...
# packages/ai, packages/auth, packages/config, packages/email

# Create app package.json
cd ../../apps/web && cat > package.json << 'EOF'
{
  "name": "@btrme/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@btrme/db": "workspace:*",
    "@btrme/ui": "workspace:*",
    "@btrme/auth": "workspace:*",
    "@btrme/ai": "workspace:*",
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@btrme/tsconfig": "workspace:*",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.1.0",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
EOF

cd ../..

# Install all dependencies
pnpm install
```

**Testing Steps:**
```bash
# Test 1: Workspace structure
pnpm list --depth 0
# Should show all packages

# Test 2: TypeScript compilation
pnpm turbo type-check
# Should complete without errors (once files exist)

# Test 3: Build pipeline
pnpm turbo build
# Should build in correct order (dependencies first)

# Test 4: Dev mode
pnpm turbo dev
# Should start all dev servers
```

**Deliverables:**
- ✅ Monorepo structure created
- ✅ pnpm workspace configured
- ✅ Turborepo pipeline working
- ✅ TypeScript project references set up
- ✅ All packages initialized

---

#### Task 1.1.1.3: Code Quality Tools Setup
**Assignee:** TL
**Hours:** 3 hours
**Priority:** P0
**Dependencies:** Task 1.1.1.2

**Implementation Steps:**

**Step 1: ESLint Configuration (1 hour)**
```bash
# Install ESLint dependencies
pnpm add -D eslint \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-config-next \
  eslint-config-prettier \
  eslint-plugin-import \
  eslint-plugin-jsx-a11y \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-tailwindcss

# Create root .eslintrc.json
cat > .eslintrc.json << 'EOF'
{
  "root": true,
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": true
  },
  "plugins": [
    "@typescript-eslint",
    "import"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { "prefer": "type-imports" }
    ],
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling"],
          "index",
          "object",
          "type"
        ],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }
    ],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "settings": {
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true,
        "project": ["tsconfig.json", "apps/*/tsconfig.json", "packages/*/tsconfig.json"]
      }
    }
  }
}
EOF

# Create .eslintignore
cat > .eslintignore << 'EOF'
node_modules
.next
.turbo
dist
coverage
*.config.js
*.config.ts
!prettier.config.js
!tailwind.config.ts
EOF

# Add package scripts
# Add to root package.json scripts:
# "lint": "turbo lint",
# "lint:fix": "turbo lint:fix"
```

**Step 2: Prettier Configuration (30 min)**
```bash
# Install Prettier
pnpm add -D prettier prettier-plugin-tailwindcss

# Create .prettierrc.json
cat > .prettierrc.json << 'EOF'
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "trailingComma": "es5",
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
EOF

# Create .prettierignore
cat > .prettierignore << 'EOF'
node_modules
.next
.turbo
dist
coverage
pnpm-lock.yaml
*.md
EOF
```

**Step 3: Husky & Git Hooks (1 hour)**
```bash
# Install Husky and lint-staged
pnpm add -D husky lint-staged

# Initialize Husky
pnpm exec husky install
mkdir -p .husky

# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
EOF

chmod +x .husky/pre-commit

# Create commit-msg hook
cat > .husky/commit-msg << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm commitlint --edit $1
EOF

chmod +x .husky/commit-msg

# Create lint-staged.config.js
cat > lint-staged.config.js << 'EOF'
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.{json,md,yml,yaml}': [
    'prettier --write',
  ],
  '*.{css,scss}': [
    'prettier --write',
  ],
}
EOF
```

**Step 4: Commitlint Configuration (30 min)**
```bash
# Install commitlint
pnpm add -D @commitlint/cli @commitlint/config-conventional

# Create commitlint.config.js
cat > commitlint.config.js << 'EOF'
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting
        'refactor', // Code restructuring
        'perf',     // Performance
        'test',     // Tests
        'build',    // Build system
        'ci',       // CI/CD
        'chore',    // Maintenance
        'revert',   // Revert commit
      ],
    ],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 100],
  },
}
EOF

# Create .commitlintrc.json (alternative format)
cat > .commitlintrc.json << 'EOF'
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert"
      ]
    ]
  }
}
EOF
```

**Testing Steps:**
```bash
# Test 1: ESLint
echo "const unused = 'test'" > test.ts
pnpm eslint test.ts
# Should error: 'unused' is never used

# Test 2: Prettier
echo "const  x  =  1" > test.ts
pnpm prettier --write test.ts
cat test.ts
# Should be: const x = 1

# Test 3: Pre-commit hook
echo "const x=1;console.log(x)" > test.ts
git add test.ts
git commit -m "test"
# Should auto-format before commit

# Test 4: Commit message validation
git commit --allow-empty -m "bad commit message"
# Should fail

git commit --allow-empty -m "feat: Add new feature"
# Should pass

# Cleanup
rm test.ts
```

**Deliverables:**
- ✅ ESLint configured (TypeScript, React, Next.js)
- ✅ Prettier configured (with Tailwind plugin)
- ✅ Husky git hooks working (pre-commit, commit-msg)
- ✅ lint-staged auto-formatting
- ✅ Commitlint enforcing conventional commits
- ✅ All tools integrated in CI/CD (next task)

---

#### Task 1.1.1.4: Development Environment Documentation
**Assignee:** TL
**Hours:** 2 hours
**Priority:** P1
**Dependencies:** Tasks 1.1.1.1, 1.1.1.2, 1.1.1.3

**Implementation:**
```bash
# Create comprehensive development guide
cat > docs/DEVELOPMENT.md << 'EOF'
# Development Guide

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker >= 24.0.0
- Git >= 2.40.0

## Initial Setup

### 1. Clone Repository
\```bash
git clone git@github.com:your-org/btrme-platform.git
cd btrme-platform
\```

### 2. Install Dependencies
\```bash
pnpm install
\```

### 3. Environment Configuration
\```bash
# Copy example env file
cp .env.example .env.local

# Edit with your values
nano .env.local
\```

### 4. Start Local Services
\```bash
# Start PostgreSQL, Redis, Mailhog
docker-compose up -d

# Verify services are running
docker-compose ps
\```

### 5. Database Setup
\```bash
# Push schema to database
pnpm db:push

# Seed database with test data
pnpm db:seed

# (Optional) Open Prisma Studio
pnpm db:studio
\```

### 6. Start Development Servers
\```bash
# Start all apps and packages in dev mode
pnpm dev
\```

The web app should now be running at http://localhost:3000

## Development Workflow

### Creating a New Feature

1. **Create Feature Branch**
   \```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   \```

2. **Make Changes**
   - Write code in relevant packages
   - Follow code style guidelines
   - Write tests for new functionality

3. **Commit Changes**
   \```bash
   git add .
   git commit -m "feat: Add your feature description"
   \```

   Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation
   - `style:` Formatting
   - `refactor:` Code restructuring
   - `test:` Tests
   - `chore:` Maintenance

4. **Push and Create PR**
   \```bash
   git push origin feature/your-feature-name
   \```
   Then create Pull Request on GitHub targeting `develop` branch.

### Running Tests

\```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for specific package
pnpm --filter @btrme/web test
\```

### Code Quality Checks

\```bash
# Lint all code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type check
pnpm type-check

# Format code
pnpm format
\```

### Building

\```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @btrme/web build
\```

## Monorepo Structure

\```
btrme-platform/
├── apps/
│   └── web/              # Next.js main application
├── packages/
│   ├── ui/               # Shared UI components
│   ├── db/               # Database (Prisma)
│   ├── ai/               # AI utilities (Claude API)
│   ├── auth/             # Authentication utilities
│   ├── config/           # Shared configuration
│   └── email/            # Email templates
├── docs/                 # Documentation
├── scripts/              # Utility scripts
└── infrastructure/       # Docker, Terraform
\```

## Troubleshooting

### Port Already in Use
\```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port
PORT=3001 pnpm dev
\```

### Database Connection Issues
\```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
\```

### Prisma Issues
\```bash
# Reset database (WARNING: deletes all data)
pnpm db:push --force-reset

# Regenerate Prisma Client
pnpm --filter @btrme/db db:generate
\```

### Cache Issues
\```bash
# Clear Turbo cache
rm -rf .turbo

# Clear Next.js cache
rm -rf apps/web/.next

# Clear all node_modules and reinstall
pnpm clean
pnpm install
\```

## Additional Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## Getting Help

- Check existing GitHub Issues
- Ask in Slack #engineering channel
- Contact Tech Lead (@tech-lead)
EOF

# Add to README.md
cat >> README.md << 'EOF'

## Development

See [Development Guide](./docs/DEVELOPMENT.md) for detailed setup instructions.

### Quick Start

\```bash
# Install dependencies
pnpm install

# Start local services (PostgreSQL, Redis)
docker-compose up -d

# Setup database
pnpm db:push && pnpm db:seed

# Start dev servers
pnpm dev
\```

Visit http://localhost:3000

### Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages
- `pnpm test` - Run tests
- `pnpm lint` - Lint code
- `pnpm format` - Format code
- `pnpm db:studio` - Open Prisma Studio

See `package.json` for all available scripts.
EOF
```

**Deliverables:**
- ✅ Comprehensive DEVELOPMENT.md guide
- ✅ Updated README.md with quick start
- ✅ Troubleshooting section
- ✅ Clear onboarding path for new devs

---

### ✅ Story 1.1.1 Complete

**Total Time:** 12 hours
**Deliverables:**
- [x] GitHub repository with branch protection
- [x] CODEOWNERS, issue/PR templates
- [x] Monorepo structure (pnpm + Turborepo)
- [x] TypeScript project references
- [x] ESLint, Prettier, Husky configured
- [x] Git hooks working (pre-commit, commit-msg)
- [x] Development documentation

**Testing Checklist:**
- [x] Clone repo on fresh machine
- [x] Run `pnpm install` (succeeds)
- [x] Run `docker-compose up` (services start)
- [x] Run `pnpm turbo lint` (passes)
- [x] Commit with bad message (fails)
- [x] Commit with good message (succeeds)
- [x] Create PR without required reviews (blocked)

**Next Steps:**
→ Story 1.1.2: CI/CD Pipeline Setup

---

Tamam, Sprint 1'in ilk story'sini ultra detaylı olarak tamamladım. **Bu hızda devam edersem toplam ~80,000+ kelime olacak.**

**Durum Kontrolü:**
- ✅ Story 1.1.1: Tamam (4 task, 12 hours, ultra detaylı)
- ⏳ Kalan Sprint 1: 12 story daha var
- ⏳ Sprint 2-6: Henüz başlamadı
- ⏳ 4 ek döküman: Henüz başlamadı

**Seçenekler:**
1. **Devam et** (aynı detayda): Her story bu kadar detaylı olacak, ~80K kelime
2. **Biraz hızlandır**: Task-level detay azalt ama story-level detayı koru, ~50K kelime
3. **Commit şimdi**: Bu kadarını commit edip geri kalanı yeni dosyalarda devam

Hangisini tercih edersin?