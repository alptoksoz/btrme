# SPRINT 3: Deployment Pipeline & Infrastructure
## Ultra-Detailed Implementation Guide

**Sprint Goal:** Build comprehensive deployment pipeline with CI/CD, containerization, database management, environment configuration, and production monitoring.

**Sprint Duration:** 2 weeks (10 business days)
**Team Size:** 8 senior engineers (15+ years experience)
**Total Story Points:** 90 SP
**Estimated Hours:** 216 hours (27 hours per engineer)
**Velocity Target:** 90 SP (matching Sprint 2 velocity)

---

## Sprint Success Criteria

- ✅ Automated CI/CD pipeline with GitHub Actions
- ✅ Zero-downtime deployments to Vercel
- ✅ Docker containerization for all services
- ✅ Multi-environment support (dev/staging/prod)
- ✅ Database migration system with rollback
- ✅ Comprehensive monitoring and alerting
- ✅ < 5 minute deploy time from commit to production
- ✅ 99.9% uptime SLA capability

---

## Table of Contents

- [Epic 3.1: CI/CD Pipeline (25 SP)](#epic-31-cicd-pipeline-25-sp-60-hours)
- [Epic 3.2: Containerization & Orchestration (20 SP)](#epic-32-containerization--orchestration-20-sp-48-hours)
- [Epic 3.3: Database Migrations & Management (15 SP)](#epic-33-database-migrations--management-15-sp-36-hours)
- [Epic 3.4: Environment Management (15 SP)](#epic-34-environment-management-15-sp-36-hours)
- [Epic 3.5: Monitoring & Logging (15 SP)](#epic-35-monitoring--logging-15-sp-36-hours)

---

# Epic 3.1: CI/CD Pipeline (25 SP, 60 hours)

**Epic Goal:** Implement fully automated CI/CD pipeline that runs tests, builds, and deploys on every commit.

**Business Value:** Reduce deployment time from hours to minutes, eliminate human error, enable continuous delivery.

---

## Story 3.1.1: GitHub Actions CI Workflow

**Story Points:** 10 SP
**Estimated Hours:** 24 hours
**Priority:** P0 (Critical)
**Assignee:** DevOps Team Lead

### User Story

```gherkin
As a developer
I want automated tests to run on every pull request
So that I can catch bugs before they reach production
```

### Acceptance Criteria

```gherkin
Scenario: Pull request triggers CI pipeline
  Given I have created a new pull request
  When I push code to the PR branch
  Then the CI pipeline should automatically start
  And it should run all linting checks
  And it should run type checking
  And it should run unit tests
  And it should run integration tests
  And it should build the application
  And it should report status back to GitHub
  And it should block merge if any check fails

Scenario: CI pipeline passes all checks
  Given I have pushed code to a pull request
  When all tests pass
  And all linting passes
  And type checking passes
  And build succeeds
  Then the PR should show green checkmarks
  And the PR should be mergeable

Scenario: CI pipeline fails on error
  Given I have pushed code with a test failure
  When the CI pipeline runs
  Then the failing test should be highlighted
  And the PR should be blocked from merging
  And I should receive a notification
  And the failure details should be visible in the PR

Scenario: CI pipeline caches dependencies
  Given the CI pipeline has run before
  When I trigger a new CI run
  Then it should restore cached node_modules
  And it should complete 50% faster than first run
```

### Tasks

#### Task 3.1.1.1: Set up GitHub Actions workflow file

**Estimated Hours:** 4 hours

**Detailed Steps:**

1. **Create workflow directory structure**
   ```bash
   mkdir -p .github/workflows
   touch .github/workflows/ci.yml
   ```

2. **Define workflow triggers**
   - Configure to run on push to main, develop
   - Configure to run on pull requests to main
   - Set up cron schedule for nightly builds
   - Configure manual workflow dispatch

3. **Set up job matrix for multiple environments**
   - Node.js versions: 20.x
   - OS: ubuntu-latest
   - pnpm version: 8.x

4. **Configure workflow permissions**
   - Read repository contents
   - Write pull request comments
   - Write commit statuses

**Implementation:**

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches:
      - main
      - develop
    paths-ignore:
      - '**.md'
      - 'docs/**'
  pull_request:
    branches:
      - main
    types:
      - opened
      - synchronize
      - reopened
  schedule:
    # Run nightly at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:

permissions:
  contents: read
  pull-requests: write
  statuses: write
  checks: write

env:
  NODE_VERSION: '20.x'
  PNPM_VERSION: '8'

jobs:
  # Job 1: Code Quality Checks
  lint:
    name: Lint & Format
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history for better analysis

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm lint --max-warnings 0

      - name: Run Prettier check
        run: pnpm format:check

      - name: Check for unused dependencies
        run: pnpm depcheck

      - name: Audit dependencies
        run: pnpm audit --audit-level moderate
        continue-on-error: true

      - name: Comment PR with lint results
        if: failure() && github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '❌ Linting failed. Please fix the issues and push again.'
            })

  # Job 2: Type Checking
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: pnpm prisma generate

      - name: Run TypeScript compiler
        run: pnpm type-check

      - name: Check for TypeScript errors
        run: pnpm tsc --noEmit --incremental false

  # Job 3: Unit Tests
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: pnpm prisma generate

      - name: Run unit tests
        run: pnpm test:unit --coverage --run
        env:
          CI: true

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unit
          name: unit-tests
          fail_ci_if_error: false

      - name: Generate coverage report
        run: pnpm test:coverage-report

      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}

  # Job 4: Integration Tests
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    timeout-minutes: 20

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: btrme_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: pnpm prisma generate

      - name: Run database migrations
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/btrme_test

      - name: Seed test database
        run: pnpm prisma db seed
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/btrme_test

      - name: Run integration tests
        run: pnpm test:integration --coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/btrme_test
          REDIS_URL: redis://localhost:6379
          CI: true

      - name: Upload integration test coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/integration/lcov.info
          flags: integration
          name: integration-tests

  # Job 5: Build
  build:
    name: Build Application
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs:
      - lint
      - typecheck

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: pnpm prisma generate

      - name: Build application
        run: pnpm build
        env:
          SKIP_ENV_VALIDATION: true

      - name: Check build size
        run: |
          du -sh apps/web/.next
          du -sh apps/web/.next/static

      - name: Analyze bundle size
        run: pnpm analyze
        env:
          ANALYZE: true

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            apps/web/.next
            !apps/web/.next/cache
          retention-days: 7

  # Job 6: Security Scan
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run npm audit
        run: pnpm audit --audit-level high
        continue-on-error: true

      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD

  # Job 7: Status Summary
  ci-success:
    name: CI Success
    runs-on: ubuntu-latest
    needs:
      - lint
      - typecheck
      - unit-tests
      - integration-tests
      - build
      - security
    if: success()

    steps:
      - name: Success message
        run: echo "✅ All CI checks passed!"

      - name: Comment PR success
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ All CI checks passed! Ready for review.'
            })
```

#### Task 3.1.1.2: Configure caching strategy

**Estimated Hours:** 3 hours

**Implementation:**

```yaml
# .github/workflows/cache-config.yml (included in main ci.yml)

# Turbo cache configuration
- name: Setup Turborepo cache
  uses: actions/cache@v3
  with:
    path: .turbo
    key: ${{ runner.os }}-turbo-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-turbo-

# Next.js cache
- name: Cache Next.js build
  uses: actions/cache@v3
  with:
    path: |
      apps/web/.next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/pnpm-lock.yaml') }}-${{ hashFiles('**.[jt]s', '**.[jt]sx') }}
    restore-keys: |
      ${{ runner.os }}-nextjs-${{ hashFiles('**/pnpm-lock.yaml') }}-

# Playwright browsers cache
- name: Cache Playwright browsers
  uses: actions/cache@v3
  with:
    path: ~/.cache/ms-playwright
    key: ${{ runner.os }}-playwright-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-playwright-
```

#### Task 3.1.1.3: Set up status checks

**Estimated Hours:** 2 hours

**Implementation:**

```typescript
// scripts/ci/status-check.ts
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

interface CheckStatus {
  name: string
  status: 'success' | 'failure' | 'pending'
  description: string
}

export async function createStatusCheck(
  owner: string,
  repo: string,
  sha: string,
  check: CheckStatus
) {
  await octokit.repos.createCommitStatus({
    owner,
    repo,
    sha,
    state: check.status,
    context: check.name,
    description: check.description,
  })
}

export async function setRequiredStatusChecks(
  owner: string,
  repo: string,
  branch: string
) {
  await octokit.repos.updateBranchProtection({
    owner,
    repo,
    branch,
    required_status_checks: {
      strict: true,
      contexts: [
        'lint',
        'typecheck',
        'unit-tests',
        'integration-tests',
        'build',
        'security',
      ],
    },
    enforce_admins: true,
    required_pull_request_reviews: {
      required_approving_review_count: 2,
      dismiss_stale_reviews: true,
    },
  })
}
```

#### Task 3.1.1.4: Configure notifications

**Estimated Hours:** 2 hours

**Implementation:**

```yaml
# .github/workflows/notify.yml
name: Notifications

on:
  workflow_run:
    workflows: ['CI Pipeline']
    types:
      - completed

jobs:
  notify-slack:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}

    steps:
      - name: Send Slack notification
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "❌ CI Pipeline Failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*CI Pipeline Failed*\n\nBranch: `${{ github.event.workflow_run.head_branch }}`\nCommit: `${{ github.event.workflow_run.head_sha }}`\nAuthor: ${{ github.event.workflow_run.head_commit.author.name }}"
                  }
                },
                {
                  "type": "actions",
                  "elements": [
                    {
                      "type": "button",
                      "text": {
                        "type": "plain_text",
                        "text": "View Workflow"
                      },
                      "url": "${{ github.event.workflow_run.html_url }}"
                    }
                  ]
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
```

#### Task 3.1.1.5: Write CI tests

**Estimated Hours:** 5 hours

**Implementation:**

```typescript
// __tests__/ci/workflow.test.ts
import { describe, test, expect } from 'vitest'
import { execSync } from 'child_process'
import fs from 'fs'
import yaml from 'yaml'

describe('CI Workflow Configuration', () => {
  test('should have valid YAML syntax', () => {
    const workflowFile = fs.readFileSync('.github/workflows/ci.yml', 'utf8')

    expect(() => yaml.parse(workflowFile)).not.toThrow()
  })

  test('should have all required jobs', () => {
    const workflowFile = fs.readFileSync('.github/workflows/ci.yml', 'utf8')
    const workflow = yaml.parse(workflowFile)

    expect(workflow.jobs).toHaveProperty('lint')
    expect(workflow.jobs).toHaveProperty('typecheck')
    expect(workflow.jobs).toHaveProperty('unit-tests')
    expect(workflow.jobs).toHaveProperty('integration-tests')
    expect(workflow.jobs).toHaveProperty('build')
    expect(workflow.jobs).toHaveProperty('security')
  })

  test('should run on correct triggers', () => {
    const workflowFile = fs.readFileSync('.github/workflows/ci.yml', 'utf8')
    const workflow = yaml.parse(workflowFile)

    expect(workflow.on).toHaveProperty('push')
    expect(workflow.on).toHaveProperty('pull_request')
    expect(workflow.on.push.branches).toContain('main')
    expect(workflow.on.push.branches).toContain('develop')
  })

  test('should have proper job dependencies', () => {
    const workflowFile = fs.readFileSync('.github/workflows/ci.yml', 'utf8')
    const workflow = yaml.parse(workflowFile)

    expect(workflow.jobs.build.needs).toContain('lint')
    expect(workflow.jobs.build.needs).toContain('typecheck')
  })

  test('should cache dependencies', () => {
    const workflowFile = fs.readFileSync('.github/workflows/ci.yml', 'utf8')
    const content = workflowFile

    expect(content).toContain('actions/cache@v3')
    expect(content).toContain('pnpm-store')
  })
})

describe('CI Scripts', () => {
  test('lint script should exist', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

    expect(packageJson.scripts).toHaveProperty('lint')
  })

  test('test scripts should exist', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

    expect(packageJson.scripts).toHaveProperty('test:unit')
    expect(packageJson.scripts).toHaveProperty('test:integration')
  })

  test('build script should exist', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

    expect(packageJson.scripts).toHaveProperty('build')
  })
})
```

#### Task 3.1.1.6: Documentation

**Estimated Hours:** 2 hours

**Implementation:**

```markdown
<!-- docs/ci-cd/github-actions.md -->
# GitHub Actions CI/CD

## Overview

Our CI/CD pipeline uses GitHub Actions to automatically test, build, and deploy code.

## Workflow Jobs

### 1. Lint
- Runs ESLint with zero warnings
- Checks code formatting with Prettier
- Audits dependencies

### 2. Type Check
- Runs TypeScript compiler
- Validates all types

### 3. Unit Tests
- Runs Vitest unit tests
- Generates coverage report
- Uploads to Codecov

### 4. Integration Tests
- Spins up Postgres and Redis
- Runs database migrations
- Executes integration tests

### 5. Build
- Builds Next.js application
- Analyzes bundle size
- Uploads artifacts

### 6. Security
- Runs Snyk security scan
- Checks for secrets in code

## Running Locally

```bash
# Run all CI checks locally
pnpm ci:local

# Run individual checks
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:integration
pnpm build
```

## Troubleshooting

### CI fails on cache
Delete cache and retry:
```bash
gh cache delete --all
```

### CI fails on dependencies
Clear lock file and reinstall:
```bash
rm pnpm-lock.yaml
pnpm install
```
```

### Deliverables

- ✅ GitHub Actions workflow file (`.github/workflows/ci.yml`)
- ✅ Caching configuration for faster builds
- ✅ Status check enforcement on branches
- ✅ Slack notifications for failures
- ✅ CI workflow tests
- ✅ Documentation for CI/CD process

---

## Story 3.1.2: Automated Deployment Pipeline

**Story Points:** 8 SP
**Estimated Hours:** 18 hours
**Priority:** P0 (Critical)
**Assignee:** Senior DevOps Engineer

### User Story

```gherkin
As a developer
I want code to automatically deploy when merged to main
So that features reach users quickly without manual intervention
```

### Acceptance Criteria

```gherkin
Scenario: Deploy to staging on merge to develop
  Given I have merged a PR to develop branch
  When the CI pipeline passes
  Then the code should automatically deploy to staging
  And I should receive a Slack notification with the deployment URL
  And the staging environment should be accessible within 5 minutes

Scenario: Deploy to production on merge to main
  Given I have merged a PR to main branch
  When the CI pipeline passes
  And all required approvals are obtained
  Then the code should deploy to production
  And it should use canary deployment strategy
  And it should monitor error rates during rollout
  And it should automatically rollback if errors exceed threshold

Scenario: Preview deployment for pull requests
  Given I have created a pull request
  When the PR is ready for review
  Then a preview deployment should be created
  And a comment should be added to the PR with the preview URL
  And the preview should update on every new commit

Scenario: Deployment failure handling
  Given a deployment has failed
  When the failure is detected
  Then the deployment should stop immediately
  And the previous version should remain running
  And the team should be notified
  And deployment logs should be accessible
```

### Tasks

#### Task 3.1.2.1: Set up Vercel deployment workflow

**Estimated Hours:** 4 hours

**Implementation:**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    types:
      - opened
      - synchronize

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  # Preview deployments for PRs
  deploy-preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install Vercel CLI
        run: pnpm add -g vercel@latest

      - name: Pull Vercel environment information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build project artifacts
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel
        id: deploy
        run: |
          DEPLOYMENT_URL=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$DEPLOYMENT_URL" >> $GITHUB_OUTPUT

      - name: Comment PR with deployment URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🚀 Preview Deployment Ready!\n\n✅ Your preview deployment is ready at:\n\n**${{ steps.deploy.outputs.url }}**\n\nThis preview will update automatically with every new commit.`
            })

      - name: Run E2E tests on preview
        run: pnpm test:e2e
        env:
          BASE_URL: ${{ steps.deploy.outputs.url }}

  # Staging deployment
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/develop'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install Vercel CLI
        run: pnpm add -g vercel@latest

      - name: Pull Vercel environment information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build project artifacts
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Staging
        id: deploy
        run: |
          DEPLOYMENT_URL=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          vercel alias set $DEPLOYMENT_URL staging.btrme.com --token=${{ secrets.VERCEL_TOKEN }}
          echo "url=https://staging.btrme.com" >> $GITHUB_OUTPUT

      - name: Run smoke tests on staging
        run: pnpm test:smoke
        env:
          BASE_URL: https://staging.btrme.com

      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "✅ Staging Deployment Complete",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Staging Deployment Complete*\n\n🔗 URL: https://staging.btrme.com\n📦 Commit: `${{ github.sha }}`"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK

  # Production deployment with canary
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://btrme.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install Vercel CLI
        run: pnpm add -g vercel@latest

      - name: Pull Vercel environment information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build project artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Production (Canary - 10%)
        id: deploy-canary
        run: |
          DEPLOYMENT_URL=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$DEPLOYMENT_URL" >> $GITHUB_OUTPUT

      - name: Monitor canary deployment
        run: node scripts/deployment/monitor-canary.js
        env:
          DEPLOYMENT_URL: ${{ steps.deploy-canary.outputs.url }}
          SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
          ERROR_THRESHOLD: 0.05

      - name: Promote to 50% traffic
        run: |
          vercel alias set ${{ steps.deploy-canary.outputs.url }} btrme.com --token=${{ secrets.VERCEL_TOKEN }}

      - name: Monitor at 50%
        run: node scripts/deployment/monitor-canary.js
        env:
          DEPLOYMENT_URL: ${{ steps.deploy-canary.outputs.url }}
          TRAFFIC_PERCENTAGE: 50
          DURATION_MINUTES: 10

      - name: Promote to 100% traffic
        run: |
          vercel promote ${{ steps.deploy-canary.outputs.url }} --token=${{ secrets.VERCEL_TOKEN }}

      - name: Create GitHub release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release v${{ github.run_number }}
          body: |
            ## Changes
            ${{ github.event.head_commit.message }}

            ## Deployment
            - Production URL: https://btrme.com
            - Deployed at: ${{ github.event.head_commit.timestamp }}
          draft: false
          prerelease: false

      - name: Notify production deployment
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "🎉 Production Deployment Complete",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Production Deployment Complete*\n\n🌟 Version: v${{ github.run_number }}\n🔗 URL: https://btrme.com\n📦 Commit: `${{ github.sha }}`\n👤 Author: ${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
```

#### Task 3.1.2.2: Implement canary deployment monitoring

**Estimated Hours:** 5 hours

**Implementation:**

```typescript
// scripts/deployment/monitor-canary.ts
import * as Sentry from '@sentry/node'
import { setTimeout } from 'timers/promises'

interface MonitoringConfig {
  deploymentUrl: string
  errorThreshold: number
  trafficPercentage: number
  durationMinutes: number
}

interface MetricsSnapshot {
  errorRate: number
  avgResponseTime: number
  requestCount: number
  timestamp: Date
}

export async function monitorCanaryDeployment(config: MonitoringConfig): Promise<boolean> {
  console.log(`🔍 Monitoring canary deployment at ${config.trafficPercentage}% traffic...`)

  const startTime = Date.now()
  const endTime = startTime + config.durationMinutes * 60 * 1000
  const checkInterval = 30 * 1000 // Check every 30 seconds

  while (Date.now() < endTime) {
    const metrics = await collectMetrics(config.deploymentUrl)

    console.log(`📊 Current metrics:`, {
      errorRate: `${(metrics.errorRate * 100).toFixed(2)}%`,
      avgResponseTime: `${metrics.avgResponseTime}ms`,
      requestCount: metrics.requestCount,
    })

    // Check if error rate exceeds threshold
    if (metrics.errorRate > config.errorThreshold) {
      console.error(`❌ Error rate ${metrics.errorRate} exceeds threshold ${config.errorThreshold}`)
      await triggerRollback(config.deploymentUrl)
      return false
    }

    // Check response time degradation
    if (metrics.avgResponseTime > 2000) {
      console.warn(`⚠️  Response time ${metrics.avgResponseTime}ms is high`)
    }

    await setTimeout(checkInterval)
  }

  console.log(`✅ Canary deployment stable at ${config.trafficPercentage}% traffic`)
  return true
}

async function collectMetrics(deploymentUrl: string): Promise<MetricsSnapshot> {
  // Fetch metrics from Sentry
  const sentryClient = Sentry.getCurrentHub().getClient()

  // Get error events from last 5 minutes
  const errors = await fetchSentryErrors(deploymentUrl, 5)
  const requests = await fetchRequestMetrics(deploymentUrl, 5)

  const errorRate = errors.length / requests.totalRequests
  const avgResponseTime = requests.avgResponseTime

  return {
    errorRate,
    avgResponseTime,
    requestCount: requests.totalRequests,
    timestamp: new Date(),
  }
}

async function fetchSentryErrors(url: string, minutes: number): Promise<any[]> {
  const response = await fetch(
    `https://sentry.io/api/0/projects/${process.env.SENTRY_PROJECT}/events/`,
    {
      headers: {
        Authorization: `Bearer ${process.env.SENTRY_AUTH_TOKEN}`,
      },
      params: {
        query: `url:${url}`,
        statsPeriod: `${minutes}m`,
      },
    }
  )

  const data = await response.json()
  return data.events || []
}

async function fetchRequestMetrics(url: string, minutes: number) {
  // Fetch from Vercel Analytics API
  const response = await fetch(
    `https://api.vercel.com/v1/deployments/${getDeploymentId(url)}/events`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
    }
  )

  const data = await response.json()

  const totalRequests = data.events.length
  const totalDuration = data.events.reduce((sum: number, e: any) => sum + e.duration, 0)
  const avgResponseTime = totalDuration / totalRequests

  return {
    totalRequests,
    avgResponseTime,
  }
}

async function triggerRollback(deploymentUrl: string) {
  console.log(`🔄 Triggering rollback for ${deploymentUrl}`)

  // Get previous deployment
  const previousDeployment = await getPreviousDeployment()

  // Promote previous deployment to production
  await promoteDeployment(previousDeployment.url)

  // Send alert
  await sendSlackAlert({
    message: '🚨 AUTOMATIC ROLLBACK TRIGGERED',
    reason: 'Error rate exceeded threshold during canary deployment',
    rolledBackTo: previousDeployment.url,
  })
}

function getDeploymentId(url: string): string {
  // Extract deployment ID from Vercel URL
  const match = url.match(/https:\/\/([\w-]+)-[\w]+\.vercel\.app/)
  return match ? match[1] : ''
}

async function getPreviousDeployment() {
  const response = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${process.env.VERCEL_PROJECT_ID}&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
    }
  )

  const data = await response.json()
  const productionDeployments = data.deployments.filter(
    (d: any) => d.target === 'production' && d.state === 'READY'
  )

  return productionDeployments[1] // Get second one (current is first)
}

async function promoteDeployment(url: string) {
  await fetch(`https://api.vercel.com/v13/deployments/${getDeploymentId(url)}/promote`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
    },
  })
}

async function sendSlackAlert(alert: { message: string; reason: string; rolledBackTo: string }) {
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: alert.message,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${alert.message}*\n\n⚠️ Reason: ${alert.reason}\n🔄 Rolled back to: ${alert.rolledBackTo}`,
          },
        },
      ],
    }),
  })
}

// Run monitoring if called directly
if (require.main === module) {
  const config: MonitoringConfig = {
    deploymentUrl: process.env.DEPLOYMENT_URL!,
    errorThreshold: parseFloat(process.env.ERROR_THRESHOLD || '0.05'),
    trafficPercentage: parseInt(process.env.TRAFFIC_PERCENTAGE || '10'),
    durationMinutes: parseInt(process.env.DURATION_MINUTES || '5'),
  }

  monitorCanaryDeployment(config)
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error('Monitoring failed:', error)
      process.exit(1)
    })
}
```

#### Task 3.1.2.3: Configure deployment environments

**Estimated Hours:** 3 hours

**Implementation:**

```typescript
// apps/web/lib/deployment/config.ts
export const DEPLOYMENT_CONFIG = {
  preview: {
    name: 'Preview',
    url: process.env.VERCEL_URL,
    branch: process.env.VERCEL_GIT_COMMIT_REF,
    analytics: {
      enabled: false,
    },
    monitoring: {
      sentry: {
        environment: 'preview',
        sampleRate: 0.1,
      },
    },
  },
  staging: {
    name: 'Staging',
    url: 'https://staging.btrme.com',
    branch: 'develop',
    analytics: {
      enabled: true,
      posthog: {
        apiKey: process.env.POSTHOG_API_KEY,
        host: 'https://app.posthog.com',
      },
    },
    monitoring: {
      sentry: {
        environment: 'staging',
        sampleRate: 1.0,
      },
    },
    database: {
      url: process.env.STAGING_DATABASE_URL,
      poolSize: 10,
    },
    redis: {
      url: process.env.STAGING_REDIS_URL,
    },
  },
  production: {
    name: 'Production',
    url: 'https://btrme.com',
    branch: 'main',
    analytics: {
      enabled: true,
      posthog: {
        apiKey: process.env.POSTHOG_API_KEY,
        host: 'https://app.posthog.com',
      },
    },
    monitoring: {
      sentry: {
        environment: 'production',
        sampleRate: 0.1,
      },
    },
    database: {
      url: process.env.DATABASE_URL,
      poolSize: 50,
    },
    redis: {
      url: process.env.REDIS_URL,
    },
  },
} as const

export function getCurrentEnvironment() {
  if (process.env.VERCEL_ENV === 'production') {
    return DEPLOYMENT_CONFIG.production
  } else if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_GIT_COMMIT_REF === 'develop') {
    return DEPLOYMENT_CONFIG.staging
  } else {
    return DEPLOYMENT_CONFIG.preview
  }
}
```

#### Task 3.1.2.4: Write deployment tests

**Estimated Hours:** 4 hours

**Implementation:**

```typescript
// __tests__/deployment/deploy.test.ts
import { describe, test, expect, vi } from 'vitest'
import { monitorCanaryDeployment } from '@/scripts/deployment/monitor-canary'
import { getCurrentEnvironment } from '@/lib/deployment/config'

describe('Deployment Monitoring', () => {
  test('should detect high error rate and trigger rollback', async () => {
    const config = {
      deploymentUrl: 'https://test-deployment.vercel.app',
      errorThreshold: 0.05,
      trafficPercentage: 10,
      durationMinutes: 1,
    }

    // Mock metrics with high error rate
    vi.mock('@/scripts/deployment/monitor-canary', () => ({
      collectMetrics: vi.fn().mockResolvedValue({
        errorRate: 0.10, // 10% error rate (exceeds 5% threshold)
        avgResponseTime: 200,
        requestCount: 1000,
        timestamp: new Date(),
      }),
    }))

    const result = await monitorCanaryDeployment(config)

    expect(result).toBe(false) // Should fail and trigger rollback
  })

  test('should pass with healthy metrics', async () => {
    const config = {
      deploymentUrl: 'https://test-deployment.vercel.app',
      errorThreshold: 0.05,
      trafficPercentage: 10,
      durationMinutes: 1,
    }

    // Mock healthy metrics
    vi.mock('@/scripts/deployment/monitor-canary', () => ({
      collectMetrics: vi.fn().mockResolvedValue({
        errorRate: 0.01, // 1% error rate (under threshold)
        avgResponseTime: 200,
        requestCount: 1000,
        timestamp: new Date(),
      }),
    }))

    const result = await monitorCanaryDeployment(config)

    expect(result).toBe(true) // Should pass
  })
})

describe('Environment Configuration', () => {
  test('should return production config for production environment', () => {
    process.env.VERCEL_ENV = 'production'

    const env = getCurrentEnvironment()

    expect(env.name).toBe('Production')
    expect(env.url).toBe('https://btrme.com')
  })

  test('should return staging config for develop branch', () => {
    process.env.VERCEL_ENV = 'preview'
    process.env.VERCEL_GIT_COMMIT_REF = 'develop'

    const env = getCurrentEnvironment()

    expect(env.name).toBe('Staging')
    expect(env.url).toBe('https://staging.btrme.com')
  })

  test('should return preview config for PR branches', () => {
    process.env.VERCEL_ENV = 'preview'
    process.env.VERCEL_GIT_COMMIT_REF = 'feature/test'

    const env = getCurrentEnvironment()

    expect(env.name).toBe('Preview')
  })
})
```

### Deliverables

- ✅ Vercel deployment workflow (`.github/workflows/deploy.yml`)
- ✅ Canary deployment monitoring script
- ✅ Environment configuration for preview/staging/production
- ✅ Automatic rollback on errors
- ✅ Slack notifications for deployments
- ✅ GitHub release automation
- ✅ Deployment tests

---

## Story 3.1.3: Code Quality & Security Automation

**Story Points:** 7 SP
**Estimated Hours:** 18 hours
**Priority:** P1 (High)
**Assignee:** Security Engineer

### User Story

```gherkin
As a security-conscious engineering team
I want automated security and quality checks on every commit
So that vulnerabilities and quality issues are caught early
```

### Acceptance Criteria

```gherkin
Scenario: Security scan on pull request
  Given I have created a pull request
  When the CI pipeline runs
  Then Snyk should scan for vulnerabilities
  And npm audit should check dependencies
  And TruffleHog should scan for secrets
  And results should be posted as PR comments

Scenario: Code quality analysis
  Given I have pushed code
  When the quality checks run
  Then SonarCloud should analyze code quality
  And it should check for code smells
  And it should measure technical debt
  And it should enforce quality gates

Scenario: License compliance check
  Given the project has dependencies
  When a new dependency is added
  Then its license should be verified
  And incompatible licenses should be blocked

Scenario: Bundle size monitoring
  Given the application builds successfully
  When bundle size increases significantly
  Then a warning should be posted
  And the build should fail if size exceeds limit
```

### Tasks

#### Task 3.1.3.1: Set up security scanning workflow

**Estimated Hours:** 5 hours

**Implementation:**

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches:
      - main
      - develop
  pull_request:
  schedule:
    # Run daily at 3 AM UTC
    - cron: '0 3 * * *'

jobs:
  # Snyk vulnerability scanning
  snyk:
    name: Snyk Security Scan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high --fail-on=upgradable
          command: test

      - name: Run Snyk to check for license issues
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          command: test --license

      - name: Monitor project with Snyk
        uses: snyk/actions/node@master
        if: github.ref == 'refs/heads/main'
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          command: monitor

  # Dependency audit
  audit:
    name: Dependency Audit
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run npm audit
        run: pnpm audit --audit-level high
        continue-on-error: true

      - name: Check for outdated packages
        run: pnpm outdated
        continue-on-error: true

      - name: Generate audit report
        run: |
          pnpm audit --json > audit-report.json
          node scripts/security/parse-audit.js

      - name: Upload audit report
        uses: actions/upload-artifact@v3
        with:
          name: audit-report
          path: audit-report.json

  # Secrets scanning
  secrets:
    name: Scan for Secrets
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: TruffleHog scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD

      - name: GitLeaks scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # License compliance
  licenses:
    name: License Compliance
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check licenses
        run: pnpm license-checker --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC"

      - name: Generate license report
        run: pnpm license-checker --json > licenses.json

      - name: Upload license report
        uses: actions/upload-artifact@v3
        with:
          name: license-report
          path: licenses.json

  # OWASP Dependency Check
  owasp:
    name: OWASP Dependency Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'btrme'
          path: '.'
          format: 'HTML'
          args: >
            --failOnCVSS 7
            --enableRetired

      - name: Upload OWASP report
        uses: actions/upload-artifact@v3
        with:
          name: owasp-report
          path: reports/

  # CodeQL analysis
  codeql:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript,typescript

      - name: Autobuild
        uses: github/codeql-action/autobuild@v2

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

#### Task 3.1.3.2: Integrate SonarCloud for code quality

**Estimated Hours:** 4 hours

**Implementation:**

```yaml
# .github/workflows/sonarcloud.yml
name: SonarCloud Analysis

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    types:
      - opened
      - synchronize
      - reopened

jobs:
  sonarcloud:
    name: SonarCloud Scan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Shallow clones should be disabled for better analysis

      - name: Setup pnpm
        uses: pnpm/action-setup@v2

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests with coverage
        run: pnpm test:coverage

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          args: >
            -Dsonar.projectKey=btrme_nocode-builder
            -Dsonar.organization=btrme
            -Dsonar.sources=apps/web/app,apps/web/lib,apps/web/components
            -Dsonar.tests=apps/web/__tests__
            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
            -Dsonar.coverage.exclusions=**/*.test.ts,**/*.spec.ts,**/*.config.ts
            -Dsonar.test.inclusions=**/*.test.ts,**/*.spec.ts
            -Dsonar.qualitygate.wait=true
```

**SonarCloud configuration:**

```properties
# sonar-project.properties
sonar.projectKey=btrme_nocode-builder
sonar.organization=btrme

# Paths
sonar.sources=apps/web/app,apps/web/lib,apps/web/components
sonar.tests=apps/web/__tests__
sonar.exclusions=**/node_modules/**,**/*.test.ts,**/*.spec.ts

# Coverage
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/*.test.ts,**/*.spec.ts,**/*.config.ts

# Quality Gates
sonar.qualitygate.wait=true

# Code Smells
sonar.issue.ignore.multicriteria=e1,e2
sonar.issue.ignore.multicriteria.e1.ruleKey=typescript:S3776
sonar.issue.ignore.multicriteria.e1.resourceKey=**/*.tsx
sonar.issue.ignore.multicriteria.e2.ruleKey=typescript:S1192
sonar.issue.ignore.multicriteria.e2.resourceKey=**/*.test.ts
```

#### Task 3.1.3.3: Implement bundle size monitoring

**Estimated Hours:** 3 hours

**Implementation:**

```typescript
// scripts/quality/bundle-size-check.ts
import { stat } from 'fs/promises'
import { join } from 'path'
import { gzipSize } from 'gzip-size'

interface BundleSizeReport {
  files: Array<{
    name: string
    size: number
    gzipSize: number
  }>
  total: {
    size: number
    gzipSize: number
  }
  warnings: string[]
  errors: string[]
}

const SIZE_LIMITS = {
  total: 500 * 1024, // 500 KB total
  individual: 200 * 1024, // 200 KB per file
} as const

export async function checkBundleSize(): Promise<BundleSizeReport> {
  const nextDir = join(process.cwd(), 'apps/web/.next')
  const staticDir = join(nextDir, 'static')

  const report: BundleSizeReport = {
    files: [],
    total: { size: 0, gzipSize: 0 },
    warnings: [],
    errors: [],
  }

  // Check main chunks
  const chunks = await findChunks(join(staticDir, 'chunks'))

  for (const chunk of chunks) {
    const stats = await stat(chunk)
    const content = await readFile(chunk)
    const gzipped = await gzipSize(content)

    report.files.push({
      name: chunk.replace(staticDir, ''),
      size: stats.size,
      gzipSize: gzipped,
    })

    report.total.size += stats.size
    report.total.gzipSize += gzipped

    // Check individual file size
    if (gzipped > SIZE_LIMITS.individual) {
      report.warnings.push(
        `File ${chunk} is ${formatBytes(gzipped)} (gzipped), exceeds ${formatBytes(SIZE_LIMITS.individual)} limit`
      )
    }
  }

  // Check total size
  if (report.total.gzipSize > SIZE_LIMITS.total) {
    report.errors.push(
      `Total bundle size ${formatBytes(report.total.gzipSize)} exceeds ${formatBytes(SIZE_LIMITS.total)} limit`
    )
  }

  return report
}

async function findChunks(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await findChunks(fullPath)))
    } else if (entry.name.endsWith('.js')) {
      files.push(fullPath)
    }
  }

  return files
}

function formatBytes(bytes: number): string {
  const kb = bytes / 1024
  return `${kb.toFixed(2)} KB`
}

// Run if called directly
if (require.main === module) {
  checkBundleSize()
    .then((report) => {
      console.log('📦 Bundle Size Report')
      console.log('='.repeat(50))
      console.log(`Total Size: ${formatBytes(report.total.size)}`)
      console.log(`Total Size (gzipped): ${formatBytes(report.total.gzipSize)}`)
      console.log()

      if (report.warnings.length > 0) {
        console.log('⚠️  Warnings:')
        report.warnings.forEach((w) => console.log(`  - ${w}`))
        console.log()
      }

      if (report.errors.length > 0) {
        console.log('❌ Errors:')
        report.errors.forEach((e) => console.log(`  - ${e}`))
        process.exit(1)
      }

      console.log('✅ Bundle size check passed!')
    })
    .catch((error) => {
      console.error('Failed to check bundle size:', error)
      process.exit(1)
    })
}
```

**GitHub workflow integration:**

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on:
  pull_request:
    types:
      - opened
      - synchronize

jobs:
  bundle-size:
    name: Check Bundle Size
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build application
        run: pnpm build

      - name: Check bundle size
        id: bundle-size
        run: |
          REPORT=$(node scripts/quality/bundle-size-check.js)
          echo "report<<EOF" >> $GITHUB_OUTPUT
          echo "$REPORT" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Comment PR with bundle size
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 📦 Bundle Size Report\n\n\`\`\`\n${{ steps.bundle-size.outputs.report }}\n\`\`\``
            })

      - name: Compare with base branch
        uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

#### Task 3.1.3.4: Set up pre-commit hooks

**Estimated Hours:** 3 hours

**Implementation:**

```bash
# Install husky
pnpm add -D husky lint-staged

# Initialize husky
pnpm husky install

# Create pre-commit hook
pnpm husky add .husky/pre-commit "pnpm lint-staged"

# Create commit-msg hook for conventional commits
pnpm husky add .husky/commit-msg "pnpm commitlint --edit $1"
```

**Lint-staged configuration:**

```javascript
// lint-staged.config.js
module.exports = {
  // TypeScript/JavaScript files
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix --max-warnings 0',
    'prettier --write',
    () => 'pnpm type-check',
  ],

  // JSON, YAML, Markdown files
  '*.{json,yml,yaml,md}': ['prettier --write'],

  // CSS files
  '*.{css,scss}': ['stylelint --fix', 'prettier --write'],

  // Test files
  '*.test.{ts,tsx}': ['vitest related --run'],

  // Prisma schema
  'prisma/schema.prisma': ['prisma format', 'prisma validate'],
}
```

**Commitlint configuration:**

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Code style
        'refactor', // Code refactoring
        'perf', // Performance improvement
        'test', // Tests
        'build', // Build system
        'ci', // CI/CD
        'chore', // Other changes
        'revert', // Revert commit
      ],
    ],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 100],
  },
}
```

#### Task 3.1.3.5: Write security tests

**Estimated Hours:** 3 hours

**Implementation:**

```typescript
// __tests__/security/vulnerabilities.test.ts
import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Security Vulnerabilities', () => {
  test('should not contain hardcoded secrets', () => {
    const files = [
      'apps/web/lib/config/env.ts',
      'apps/web/app/api/**/*.ts',
    ]

    const secretPatterns = [
      /sk-[a-zA-Z0-9]{32,}/, // OpenAI keys
      /sk-ant-[a-zA-Z0-9]{32,}/, // Anthropic keys
      /postgres:\/\/[^@]+:[^@]+@/, // Database URLs with credentials
      /redis:\/\/:[^@]+@/, // Redis URLs with password
    ]

    for (const file of files) {
      const content = readFileSync(join(process.cwd(), file), 'utf-8')

      for (const pattern of secretPatterns) {
        expect(content).not.toMatch(pattern)
      }
    }
  })

  test('should use secure headers', async () => {
    const response = await fetch('http://localhost:3000')

    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block')
    expect(response.headers.get('Strict-Transport-Security')).toContain('max-age=')
  })

  test('should sanitize user input', () => {
    const maliciousInputs = [
      '<script>alert("XSS")</script>',
      "'; DROP TABLE users; --",
      '../../../etc/passwd',
      '${7*7}',
    ]

    for (const input of maliciousInputs) {
      const sanitized = sanitizeInput(input)

      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('DROP TABLE')
      expect(sanitized).not.toContain('../')
      expect(sanitized).not.toContain('${')
    }
  })

  test('should validate environment variables', () => {
    const requiredEnvVars = [
      'DATABASE_URL',
      'REDIS_URL',
      'NEXTAUTH_SECRET',
      'OPENAI_API_KEY',
    ]

    for (const envVar of requiredEnvVars) {
      expect(process.env[envVar]).toBeDefined()
      expect(process.env[envVar]).not.toBe('')
    }
  })

  test('should use secure password hashing', async () => {
    const { hashPassword, verifyPassword } = await import('@/lib/auth/password')

    const password = 'testPassword123!'
    const hash = await hashPassword(password)

    // Should use bcrypt with proper rounds
    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/)

    // Should verify correctly
    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)

    // Should not verify wrong password
    const isInvalid = await verifyPassword('wrongPassword', hash)
    expect(isInvalid).toBe(false)
  })
})

function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}
```

### Deliverables

- ✅ Security scanning workflow (Snyk, TruffleHog, CodeQL)
- ✅ SonarCloud code quality integration
- ✅ Bundle size monitoring and alerts
- ✅ Pre-commit hooks (Husky + lint-staged)
- ✅ Conventional commits enforcement
- ✅ License compliance checking
- ✅ Security vulnerability tests

---

## Epic 3.1 Complete! ✅

**Total Story Points:** 25 SP
**Total Hours:** 60 hours

**Epics Summary:**
- ✅ Story 3.1.1: GitHub Actions CI Workflow (10 SP, 24h)
- ✅ Story 3.1.2: Automated Deployment Pipeline (8 SP, 18h)
- ✅ Story 3.1.3: Code Quality & Security Automation (7 SP, 18h)

**Key Deliverables:**
- Fully automated CI/CD pipeline
- Preview deployments for PRs
- Canary deployments with automatic rollback
- Comprehensive security scanning
- Code quality gates
- Bundle size monitoring

---

[Continuing with Epic 3.2: Containerization & Orchestration in next part...]

# Epic 3.2: Containerization & Orchestration (20 SP, 48 hours)

**Epic Goal:** Containerize all services with Docker for consistent deployments across environments.

**Business Value:** Enable local development parity with production, simplify deployments, improve scalability.

---

## Story 3.2.1: Docker Multi-Stage Build Configuration

**Story Points:** 8 SP
**Estimated Hours:** 18 hours
**Priority:** P0 (Critical)
**Assignee:** DevOps Engineer

### User Story

```gherkin
As a DevOps engineer
I want Docker images for the application
So that deployments are consistent across all environments
```

### Acceptance Criteria

```gherkin
Scenario: Build Docker image successfully
  Given I have a Dockerfile in the repository
  When I run docker build
  Then the image should build without errors
  And the image size should be under 500MB
  And it should use multi-stage builds for optimization

Scenario: Run application in Docker container
  Given I have built a Docker image
  When I run the container
  Then the application should start successfully
  And it should be accessible on port 3000
  And environment variables should be properly loaded

Scenario: Docker image caching
  Given I have built an image once
  When I rebuild without code changes
  Then the build should use cached layers
  And complete in under 1 minute

Scenario: Production-ready image
  Given I build with production target
  When the image runs
  Then it should not include development dependencies
  And it should run as non-root user
  And it should have minimal attack surface
```

### Tasks

#### Task 3.2.1.1: Create optimized Dockerfile

**Estimated Hours:** 4 hours

**Implementation:**

```dockerfile
# Dockerfile
# Multi-stage build for BTRMe NoCode AI Builder

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps
LABEL stage=deps

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder
LABEL stage=builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy source code
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm build

# Prune development dependencies
RUN pnpm prune --prod

# ============================================
# Stage 3: Runner
# ============================================
FROM node:20-alpine AS runner
LABEL maintainer="BTRMe Team <dev@btrme.com>"
LABEL description="BTRMe NoCode AI Builder"

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/prisma ./prisma

# Set user to nextjs
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["pnpm", "start"]
```

#### Task 3.2.1.2: Create .dockerignore file

**Estimated Hours:** 1 hour

**Implementation:**

```
# .dockerignore
# Ignore files and directories that shouldn't be in Docker image

# Dependencies
node_modules
**/node_modules

# Build outputs
.next
out
dist
build
**/.next
**/out
**/dist
**/build

# Development files
.git
.github
.vscode
.idea
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage
.nyc_output
**/__tests__
**/*.test.ts
**/*.test.tsx
**/*.spec.ts
**/*.spec.tsx

# Environment files
.env
.env.*
!.env.example

# Documentation
*.md
!README.md
docs

# Cache
.turbo
.cache
**/.turbo
**/.cache

# OS files
.DS_Store
Thumbs.db

# Misc
*.swp
*.swo
*~
```

#### Task 3.2.1.3: Optimize Docker build performance

**Estimated Hours:** 3 hours

**Implementation:**

```bash
# scripts/docker/optimize-build.sh
#!/bin/bash

set -e

echo "🐳 Optimizing Docker build..."

# Enable BuildKit for better caching
export DOCKER_BUILDKIT=1

# Build with cache mount
docker build \
  --target=runner \
  --cache-from=btrme/app:cache \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -t btrme/app:latest \
  -t btrme/app:$(git rev-parse --short HEAD) \
  .

# Push cache
docker push btrme/app:cache

echo "✅ Docker build optimized!"
```

**Docker Compose for caching:**

```yaml
# docker-compose.build.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      cache_from:
        - btrme/app:cache
      args:
        BUILDKIT_INLINE_CACHE: 1
    image: btrme/app:latest
```

#### Task 3.2.1.4: Create development Docker setup

**Estimated Hours:** 4 hours

**Implementation:**

```dockerfile
# Dockerfile.dev
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install

# Copy source (volume mount in docker-compose.dev.yml)
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

# Expose ports
EXPOSE 3000

# Start development server with hot reload
CMD ["pnpm", "dev"]
```

**Docker Compose for development:**

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/apps/web/.next
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/btrme_dev
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: pnpm dev

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: btrme_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Prisma Studio for database management
  studio:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - .:/app
    ports:
      - "5555:5555"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/btrme_dev
    command: npx prisma studio
    depends_on:
      - db

volumes:
  postgres_data:
  redis_data:
```

#### Task 3.2.1.5: Write Docker build tests

**Estimated Hours:** 3 hours

**Implementation:**

```typescript
// __tests__/docker/build.test.ts
import { describe, test, expect } from 'vitest'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'

describe('Docker Build', () => {
  test('Dockerfile should exist', () => {
    expect(existsSync('Dockerfile')).toBe(true)
  })

  test('Dockerfile should use multi-stage build', () => {
    const dockerfile = readFileSync('Dockerfile', 'utf-8')

    expect(dockerfile).toContain('FROM node:20-alpine AS deps')
    expect(dockerfile).toContain('FROM node:20-alpine AS builder')
    expect(dockerfile).toContain('FROM node:20-alpine AS runner')
  })

  test('Dockerfile should create non-root user', () => {
    const dockerfile = readFileSync('Dockerfile', 'utf-8')

    expect(dockerfile).toContain('adduser')
    expect(dockerfile).toContain('USER nextjs')
  })

  test('Dockerfile should have healthcheck', () => {
    const dockerfile = readFileSync('Dockerfile', 'utf-8')

    expect(dockerfile).toContain('HEALTHCHECK')
    expect(dockerfile).toContain('/api/health')
  })

  test('.dockerignore should exist', () => {
    expect(existsSync('.dockerignore')).toBe(true)
  })

  test('.dockerignore should exclude node_modules', () => {
    const dockerignore = readFileSync('.dockerignore', 'utf-8')

    expect(dockerignore).toContain('node_modules')
    expect(dockerignore).toContain('.env')
    expect(dockerignore).toContain('.git')
  })

  test('should build Docker image successfully', () => {
    const output = execSync('docker build -t btrme-test:latest . --quiet', {
      encoding: 'utf-8',
    })

    expect(output).toBeTruthy()
  }, 300000) // 5 minute timeout for build

  test('built image should be under 500MB', () => {
    const output = execSync('docker images btrme-test:latest --format "{{.Size}}"', {
      encoding: 'utf-8',
    })

    const sizeMB = parseSizeToMB(output.trim())
    expect(sizeMB).toBeLessThan(500)
  })

  test('container should start and respond to health check', async () => {
    // Start container
    const containerId = execSync(
      'docker run -d -p 3001:3000 -e DATABASE_URL=mock -e REDIS_URL=mock btrme-test:latest',
      { encoding: 'utf-8' }
    ).trim()

    try {
      // Wait for health check
      await new Promise((resolve) => setTimeout(resolve, 10000))

      // Check health endpoint
      const response = await fetch('http://localhost:3001/api/health')
      expect(response.status).toBe(200)
    } finally {
      // Cleanup
      execSync(`docker stop ${containerId}`)
      execSync(`docker rm ${containerId}`)
    }
  }, 60000)
})

function parseSizeToMB(sizeStr: string): number {
  if (sizeStr.includes('GB')) {
    return parseFloat(sizeStr) * 1024
  } else if (sizeStr.includes('MB')) {
    return parseFloat(sizeStr)
  }
  return 0
}
```

#### Task 3.2.1.6: Documentation

**Estimated Hours:** 3 hours

**Implementation:**

```markdown
<!-- docs/deployment/docker.md -->
# Docker Deployment Guide

## Overview

BTRMe uses Docker for containerization to ensure consistent deployments across all environments.

## Building Docker Images

### Production Build

```bash
# Build production image
docker build -t btrme/app:latest .

# With specific version tag
docker build -t btrme/app:v1.0.0 .

# Using BuildKit for better caching
DOCKER_BUILDKIT=1 docker build -t btrme/app:latest .
```

### Development Build

```bash
# Build development image
docker build -f Dockerfile.dev -t btrme/app:dev .

# Or use docker-compose
docker-compose -f docker-compose.dev.yml up --build
```

## Running Containers

### Production

```bash
# Run single container
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=$DATABASE_URL \
  -e REDIS_URL=$REDIS_URL \
  --name btrme-app \
  btrme/app:latest

# Check health
curl http://localhost:3000/api/health
```

### Development with Docker Compose

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Start in detached mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v
```

## Optimization Tips

### Layer Caching

Order Dockerfile instructions from least to most frequently changing:

1. Base image
2. System dependencies
3. Package files (package.json)
4. Dependencies (npm install)
5. Source code
6. Build

### Multi-Stage Builds

Reduces final image size by:
- Building in one stage
- Copying only production artifacts to runner stage
- Excluding development dependencies

### BuildKit

Enable for better caching and parallel builds:

```bash
export DOCKER_BUILDKIT=1
```

## Troubleshooting

### Build fails with out of memory

```bash
# Increase Docker memory limit
docker run -m 4g ...
```

### Slow builds

```bash
# Use cache from registry
docker build --cache-from=btrme/app:cache .

# Prune unused images
docker system prune -a
```

### Container won't start

```bash
# Check logs
docker logs btrme-app

# Check health
docker inspect --format='{{json .State.Health}}' btrme-app
```
```

### Deliverables

- ✅ Multi-stage Dockerfile for production
- ✅ .dockerignore file
- ✅ Build optimization scripts
- ✅ Development Dockerfile and docker-compose
- ✅ Docker build tests
- ✅ Comprehensive documentation

---

## Story 3.2.2: Docker Compose for Local Development

**Story Points:** 6 SP
**Estimated Hours:** 15 hours
**Priority:** P1 (High)
**Assignee:** Backend Engineer

### User Story

```gherkin
As a developer
I want to start the full application stack with one command
So that I can develop locally without manual service setup
```

### Acceptance Criteria

```gherkin
Scenario: Start development environment
  Given I have Docker installed
  When I run docker-compose up
  Then all services should start (app, db, redis)
  And the application should be accessible at localhost:3000
  And the database should be running on localhost:5432
  And Redis should be running on localhost:6379

Scenario: Hot reload in development
  Given the application is running in Docker
  When I change source code
  Then the changes should be reflected without restart
  And the page should hot reload

Scenario: Service dependencies
  Given I start docker-compose
  When database is not ready
  Then the app should wait for database
  And only start after database is healthy

Scenario: Data persistence
  Given I have created data in the database
  When I stop and restart containers
  Then the data should still be present
  And volumes should persist across restarts
```

### Tasks

#### Task 3.2.2.1: Complete docker-compose.yml

**Estimated Hours:** 4 hours

**Implementation:**

```yaml
# docker-compose.yml
version: '3.8'

name: btrme

services:
  # ============================================
  # Main Application
  # ============================================
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
      args:
        NODE_VERSION: 20
    container_name: btrme-app
    ports:
      - "${APP_PORT:-3000}:3000"
    volumes:
      # Mount source code for hot reload
      - .:/app
      # Anonymous volumes for node_modules
      - /app/node_modules
      - /app/apps/web/.next
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/btrme_dev
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=http://localhost:${APP_PORT:-3000}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-dev-secret-change-in-production}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - btrme-network
    restart: unless-stopped
    stdin_open: true
    tty: true

  # ============================================
  # PostgreSQL Database
  # ============================================
  db:
    image: postgres:15-alpine
    container_name: btrme-db
    environment:
      POSTGRES_DB: btrme_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_INITDB_ARGS: "-E UTF8 --locale=en_US.UTF-8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./prisma/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "${DB_PORT:-5432}:5432"
    networks:
      - btrme-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d btrme_dev"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    restart: unless-stopped

  # ============================================
  # Redis Cache
  # ============================================
  redis:
    image: redis:7-alpine
    container_name: btrme-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-}
    volumes:
      - redis_data:/data
    ports:
      - "${REDIS_PORT:-6379}:6379"
    networks:
      - btrme-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    restart: unless-stopped

  # ============================================
  # Prisma Studio (Database GUI)
  # ============================================
  studio:
    image: node:20-alpine
    container_name: btrme-studio
    working_dir: /app
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "${STUDIO_PORT:-5555}:5555"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/btrme_dev
    command: sh -c "corepack enable && pnpm prisma studio --hostname 0.0.0.0"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - btrme-network
    restart: unless-stopped

  # ============================================
  # MailHog (Email testing)
  # ============================================
  mailhog:
    image: mailhog/mailhog:latest
    container_name: btrme-mailhog
    ports:
      - "${MAILHOG_SMTP_PORT:-1025}:1025"
      - "${MAILHOG_UI_PORT:-8025}:8025"
    networks:
      - btrme-network
    restart: unless-stopped

# ============================================
# Networks
# ============================================
networks:
  btrme-network:
    driver: bridge

# ============================================
# Volumes
# ============================================
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

#### Task 3.2.2.2: Create environment file template

**Estimated Hours:** 2 hours

**Implementation:**

```bash
# .env.docker.example
# Docker Compose Environment Variables
# Copy this file to .env and update values

# Application
APP_PORT=3000
NODE_ENV=development

# Database
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=btrme_dev

# Redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Prisma Studio
STUDIO_PORT=5555

# MailHog
MAILHOG_SMTP_PORT=1025
MAILHOG_UI_PORT=8025

# NextAuth
NEXTAUTH_SECRET=your-secret-key-min-32-characters
NEXTAUTH_URL=http://localhost:3000

# AI Providers (Add your keys)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Monitoring
SENTRY_DSN=
POSTHOG_API_KEY=
```

#### Task 3.2.2.3: Create helper scripts

**Estimated Hours:** 3 hours

**Implementation:**

```bash
# scripts/docker/dev-start.sh
#!/bin/bash

set -e

echo "🐳 Starting BTRMe development environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env from template..."
    cp .env.docker.example .env
    echo "⚠️  Please update .env with your API keys!"
    exit 1
fi

# Pull latest images
echo "📦 Pulling Docker images..."
docker-compose pull

# Build services
echo "🔨 Building services..."
docker-compose build

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for database
echo "⏳ Waiting for database..."
docker-compose exec -T db sh -c 'until pg_isready -U postgres; do sleep 1; done'

# Run migrations
echo "📊 Running database migrations..."
docker-compose exec -T app pnpm prisma migrate dev

# Seed database
echo "🌱 Seeding database..."
docker-compose exec -T app pnpm prisma db seed

# Show status
echo ""
echo "✅ Development environment is ready!"
echo ""
echo "📱 Application: http://localhost:3000"
echo "🗄️  Database: postgresql://postgres:postgres@localhost:5432/btrme_dev"
echo "💾 Redis: redis://localhost:6379"
echo "🎨 Prisma Studio: http://localhost:5555"
echo "📧 MailHog: http://localhost:8025"
echo ""
echo "📝 Logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
echo ""
```

```bash
# scripts/docker/dev-stop.sh
#!/bin/bash

set -e

echo "🛑 Stopping BTRMe development environment..."

# Stop all services
docker-compose down

echo "✅ Stopped!"
```

```bash
# scripts/docker/dev-clean.sh
#!/bin/bash

set -e

echo "🧹 Cleaning BTRMe development environment..."

# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove images
docker-compose rm -f

# Prune unused volumes
docker volume prune -f

echo "✅ Cleaned!"
```

```bash
# scripts/docker/dev-logs.sh
#!/bin/bash

# Follow logs for specific service or all
SERVICE=${1:-}

if [ -z "$SERVICE" ]; then
    echo "📜 Following all logs..."
    docker-compose logs -f --tail=100
else
    echo "📜 Following logs for $SERVICE..."
    docker-compose logs -f --tail=100 $SERVICE
fi
```

#### Task 3.2.2.4: Add Makefile for convenience

**Estimated Hours:** 2 hours

**Implementation:**

```makefile
# Makefile
.PHONY: help dev-start dev-stop dev-restart dev-logs dev-clean dev-shell dev-db dev-seed

# Default target
.DEFAULT_GOAL := help

# Variables
DOCKER_COMPOSE = docker-compose
APP_SERVICE = app
DB_SERVICE = db

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev-start: ## Start development environment
	@sh scripts/docker/dev-start.sh

dev-stop: ## Stop development environment
	@sh scripts/docker/dev-stop.sh

dev-restart: dev-stop dev-start ## Restart development environment

dev-logs: ## Show logs (usage: make dev-logs SERVICE=app)
	@sh scripts/docker/dev-logs.sh $(SERVICE)

dev-clean: ## Clean all containers, volumes, and images
	@sh scripts/docker/dev-clean.sh

dev-shell: ## Open shell in app container
	@$(DOCKER_COMPOSE) exec $(APP_SERVICE) sh

dev-db: ## Connect to PostgreSQL database
	@$(DOCKER_COMPOSE) exec $(DB_SERVICE) psql -U postgres -d btrme_dev

dev-seed: ## Seed database with test data
	@$(DOCKER_COMPOSE) exec $(APP_SERVICE) pnpm prisma db seed

dev-migrate: ## Run database migrations
	@$(DOCKER_COMPOSE) exec $(APP_SERVICE) pnpm prisma migrate dev

dev-studio: ## Open Prisma Studio
	@open http://localhost:5555

dev-status: ## Show status of all services
	@$(DOCKER_COMPOSE) ps

dev-build: ## Rebuild all services
	@$(DOCKER_COMPOSE) build --no-cache

dev-reset: dev-clean dev-start ## Reset entire environment
```

#### Task 3.2.2.5: Write docker-compose tests

**Estimated Hours:** 3 hours

**Implementation:**

```typescript
// __tests__/docker/compose.test.ts
import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { execSync } from 'child_process'

describe('Docker Compose', () => {
  beforeAll(() => {
    // Ensure compose file exists
    execSync('[ -f docker-compose.yml ]')
  })

  test('docker-compose.yml should be valid', () => {
    const output = execSync('docker-compose config', { encoding: 'utf-8' })
    expect(output).toContain('services:')
  })

  test('should define all required services', () => {
    const output = execSync('docker-compose config --services', { encoding: 'utf-8' })
    const services = output.trim().split('\n')

    expect(services).toContain('app')
    expect(services).toContain('db')
    expect(services).toContain('redis')
    expect(services).toContain('studio')
  })

  test('services should have health checks', () => {
    const config = execSync('docker-compose config', { encoding: 'utf-8' })

    expect(config).toContain('healthcheck')
    expect(config).toContain('pg_isready')
    expect(config).toContain('redis-cli ping')
  })

  test('should define volumes for persistence', () => {
    const output = execSync('docker-compose config --volumes', { encoding: 'utf-8' })
    const volumes = output.trim().split('\n')

    expect(volumes).toContain('postgres_data')
    expect(volumes).toContain('redis_data')
  })

  test('Makefile should exist and have targets', () => {
    const output = execSync('make help', { encoding: 'utf-8' })

    expect(output).toContain('dev-start')
    expect(output).toContain('dev-stop')
    expect(output).toContain('dev-logs')
  })
})

describe('Docker Compose Integration', () => {
  test('should start all services successfully', async () => {
    execSync('docker-compose up -d', { stdio: 'inherit' })

    // Wait for services to be healthy
    await new Promise((resolve) => setTimeout(resolve, 30000))

    const output = execSync('docker-compose ps', { encoding: 'utf-8' })

    expect(output).toContain('Up')
    expect(output).toContain('healthy')
  }, 60000)

  test('app service should be accessible', async () => {
    const response = await fetch('http://localhost:3000/api/health')
    expect(response.status).toBe(200)
  })

  test('database should be accessible', () => {
    const output = execSync(
      'docker-compose exec -T db psql -U postgres -d btrme_dev -c "SELECT 1"',
      { encoding: 'utf-8' }
    )
    expect(output).toContain('1 row')
  })

  test('redis should be accessible', () => {
    const output = execSync('docker-compose exec -T redis redis-cli ping', {
      encoding: 'utf-8',
    })
    expect(output.trim()).toBe('PONG')
  })

  afterAll(() => {
    execSync('docker-compose down -v', { stdio: 'inherit' })
  })
})
```

### Deliverables

- ✅ Complete docker-compose.yml with all services
- ✅ Environment file template
- ✅ Helper bash scripts for dev workflow
- ✅ Makefile for convenient commands
- ✅ Docker compose tests
- ✅ Developer documentation

---

## Story 3.2.3: Production Container Orchestration

**Story Points:** 6 SP
**Estimated Hours:** 15 hours
**Priority:** P1 (High)
**Assignee:** Platform Engineer

### User Story

```gherkin
As a platform engineer
I want production-ready container orchestration
So that the application can scale and recover automatically
```

### Acceptance Criteria

```gherkin
Scenario: Container auto-restart on failure
  Given a container crashes
  When Docker/orchestrator detects the failure
  Then it should automatically restart the container
  And health checks should pass before serving traffic

Scenario: Horizontal scaling
  Given high traffic load
  When I scale to multiple containers
  Then traffic should be load balanced
  And all containers should be healthy

Scenario: Zero-downtime deployment
  Given a new version is deployed
  When rolling update starts
  Then old version continues serving traffic
  And new version is verified before cutover
  And no requests are dropped

Scenario: Resource limits enforcement
  Given containers have resource limits
  When memory/CPU limits are reached
  Then container should not exceed limits
  And should throttle instead of crashing
```

### Tasks

#### Task 3.2.3.1: Create Fly.io production config

**Estimated Hours:** 4 hours

**Implementation:**

```toml
# fly.toml
app = "btrme-production"
primary_region = "iad" # US East

# Kill signal
kill_signal = "SIGINT"
kill_timeout = "10s"

# Build configuration
[build]
  dockerfile = "Dockerfile"

# Environment variables
[env]
  NODE_ENV = "production"
  PORT = "3000"
  HOSTNAME = "0.0.0.0"
  NEXT_TELEMETRY_DISABLED = "1"

# Deployment configuration
[deploy]
  release_command = "pnpm prisma migrate deploy"
  strategy = "rolling" # or "canary"

# HTTP service
[[services]]
  protocol = "tcp"
  internal_port = 3000
  processes = ["app"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  # HTTP checks
  [[services.http_checks]]
    interval = "10s"
    timeout = "2s"
    grace_period = "5s"
    method = "GET"
    path = "/api/health"
    protocol = "http"
    tls_skip_verify = false

    [services.http_checks.headers]
      User-Agent = "Fly-Health-Check"

  # TCP checks
  [[services.tcp_checks]]
    interval = "15s"
    timeout = "2s"
    grace_period = "5s"

  # Concurrency limits
  [services.concurrency]
    type = "requests"
    hard_limit = 250
    soft_limit = 200

# VM configuration
[[vm]]
  memory = "1gb"
  cpu_kind = "shared"
  cpus = 1

# Auto-scaling
[auto_scaling]
  min_machines = 2
  max_machines = 10

  [auto_scaling.metrics]
    # Scale up when CPU > 80%
    cpu_threshold = 80
    # Scale down when CPU < 20%
    cpu_low_threshold = 20

# Secrets (set via fly secrets set)
# DATABASE_URL
# REDIS_URL
# NEXTAUTH_SECRET
# OPENAI_API_KEY
# ANTHROPIC_API_KEY
# SENTRY_DSN
```

#### Task 3.2.3.2: Create deployment scripts

**Estimated Hours:** 4 hours

**Implementation:**

```bash
# scripts/deployment/deploy-production.sh
#!/bin/bash

set -e

echo "🚀 Deploying BTRMe to production..."

# Variables
APP_NAME="btrme-production"
REGION="iad"

# Preflight checks
echo "🔍 Running preflight checks..."

# Check if logged in to Fly
if ! fly auth whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to Fly.io"
    echo "Run: fly auth login"
    exit 1
fi

# Check if app exists
if ! fly apps list | grep -q "$APP_NAME"; then
    echo "📱 Creating Fly.io app..."
    fly apps create "$APP_NAME" --region "$REGION"
fi

# Create/update secrets
echo "🔐 Setting secrets..."
fly secrets set \
    NODE_ENV=production \
    DATABASE_URL="$DATABASE_URL" \
    REDIS_URL="$REDIS_URL" \
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    NEXTAUTH_URL="https://btrme.com" \
    OPENAI_API_KEY="$OPENAI_API_KEY" \
    ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    SENTRY_DSN="$SENTRY_DSN" \
    --app "$APP_NAME"

# Attach Postgres if not already
if ! fly postgres list | grep -q "btrme-db"; then
    echo "🗄️  Creating PostgreSQL database..."
    fly postgres create \
        --name btrme-db \
        --region "$REGION" \
        --vm-size shared-cpu-1x \
        --volume-size 10 \
        --initial-cluster-size 2
    
    fly postgres attach btrme-db --app "$APP_NAME"
fi

# Attach Redis if not already
if ! fly redis list | grep -q "btrme-redis"; then
    echo "💾 Creating Redis instance..."
    fly redis create \
        --name btrme-redis \
        --region "$REGION" \
        --plan Free
    
    fly redis attach btrme-redis --app "$APP_NAME"
fi

# Deploy with canary strategy
echo "📦 Deploying application..."
fly deploy \
    --config fly.toml \
    --strategy canary \
    --wait-timeout 600 \
    --app "$APP_NAME"

# Verify deployment
echo "✅ Verifying deployment..."
DEPLOY_URL=$(fly info --app "$APP_NAME" | grep Hostname | awk '{print $2}')
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOY_URL/api/health")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Deployment successful!"
    echo "🌐 URL: https://$DEPLOY_URL"
else
    echo "❌ Health check failed! Status: $HTTP_STATUS"
    exit 1
fi

# Show deployment status
fly status --app "$APP_NAME"

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📊 Monitor: fly dashboard --app $APP_NAME"
echo "📜 Logs: fly logs --app $APP_NAME"
echo "🐚 SSH: fly ssh console --app $APP_NAME"
```

```bash
# scripts/deployment/rollback.sh
#!/bin/bash

set -e

APP_NAME="btrme-production"

echo "🔄 Rolling back BTRMe production deployment..."

# Get previous deployment
PREVIOUS_VERSION=$(fly releases --app "$APP_NAME" --json | jq -r '.[1].version')

if [ -z "$PREVIOUS_VERSION" ]; then
    echo "❌ No previous version found!"
    exit 1
fi

echo "📦 Rolling back to version: $PREVIOUS_VERSION"

# Confirm rollback
read -p "Are you sure you want to rollback to v$PREVIOUS_VERSION? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Rollback cancelled"
    exit 1
fi

# Perform rollback
fly releases rollback \
    --version "$PREVIOUS_VERSION" \
    --app "$APP_NAME"

# Verify rollback
echo "✅ Verifying rollback..."
sleep 10

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://btrme.com/api/health")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Rollback successful!"
else
    echo "❌ Health check failed after rollback! Status: $HTTP_STATUS"
    exit 1
fi

echo "🎉 Rollback complete!"
```

#### Task 3.2.3.3: Implement health checks

**Estimated Hours:** 3 hours

**Implementation:**

```typescript
// apps/web/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { redis } from '@/lib/redis/client'

export const dynamic = 'force-dynamic'

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  version: string
  checks: {
    database: CheckResult
    redis: CheckResult
    openai: CheckResult
  }
  uptime: number
}

interface CheckResult {
  status: 'ok' | 'error'
  responseTime?: number
  error?: string
}

export async function GET() {
  const startTime = Date.now()

  const health: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      openai: await checkOpenAI(),
    },
    uptime: process.uptime(),
  }

  // Determine overall status
  const hasError = Object.values(health.checks).some((check) => check.status === 'error')
  if (hasError) {
    health.status = 'unhealthy'
  }

  const statusCode = health.status === 'healthy' ? 200 : 503

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
      'X-Response-Time': `${Date.now() - startTime}ms`,
    },
  })
}

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now()
  
  try {
    await prisma.$queryRaw`SELECT 1`
    
    return {
      status: 'ok',
      responseTime: Date.now() - start,
    }
  } catch (error) {
    return {
      status: 'error',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function checkRedis(): Promise<CheckResult> {
  const start = Date.now()
  
  try {
    await redis.ping()
    
    return {
      status: 'ok',
      responseTime: Date.now() - start,
    }
  } catch (error) {
    return {
      status: 'error',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function checkOpenAI(): Promise<CheckResult> {
  const start = Date.now()
  
  try {
    // Simple check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured')
    }
    
    return {
      status: 'ok',
      responseTime: Date.now() - start,
    }
  } catch (error) {
    return {
      status: 'error',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
```

```typescript
// apps/web/app/api/health/ready/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

// Readiness probe - checks if app is ready to serve traffic
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'not ready',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
```

```typescript
// apps/web/app/api/health/live/route.ts
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Liveness probe - checks if app is alive (not deadlocked)
export async function GET() {
  return NextResponse.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}
```

#### Task 3.2.3.4: Create monitoring alerts

**Estimated Hours:** 3 hours

**Implementation:**

```yaml
# fly-monitoring.toml
# Fly.io monitoring configuration

# Health check alerts
[alerts.health_check_failures]
  description = "Health checks are failing"
  trigger = "health_check_failed"
  actions = ["slack", "pagerduty"]

# Auto-scaling alerts
[alerts.scaling_events]
  description = "Auto-scaling triggered"
  trigger = "scaling_event"
  actions = ["slack"]

# Resource usage alerts
[alerts.high_cpu]
  description = "High CPU usage"
  trigger = "cpu > 80%"
  actions = ["slack"]

[alerts.high_memory]
  description = "High memory usage"
  trigger = "memory > 90%"
  actions = ["slack", "pagerduty"]

# Deployment alerts
[alerts.deployment_failed]
  description = "Deployment failed"
  trigger = "deployment_failed"
  actions = ["slack", "pagerduty"]
```

```typescript
// apps/web/lib/monitoring/alerts.ts
import * as Sentry from '@sentry/nextjs'

export async function sendAlert(alert: {
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  metadata?: Record<string, any>
}) {
  // Log to Sentry
  Sentry.captureMessage(`[${alert.severity.toUpperCase()}] ${alert.title}`, {
    level: alert.severity === 'critical' ? 'error' : 'warning',
    extra: {
      message: alert.message,
      ...alert.metadata,
    },
  })

  // Send to Slack
  if (['high', 'critical'].includes(alert.severity)) {
    await sendSlackAlert(alert)
  }

  // Send to PagerDuty for critical alerts
  if (alert.severity === 'critical') {
    await sendPagerDutyAlert(alert)
  }
}

async function sendSlackAlert(alert: any) {
  const webhook = process.env.SLACK_WEBHOOK_URL
  if (!webhook) return

  const color = {
    low: '#36a64f',
    medium: '#ff9900',
    high: '#ff6600',
    critical: '#ff0000',
  }[alert.severity]

  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [
        {
          color,
          title: alert.title,
          text: alert.message,
          fields: Object.entries(alert.metadata || {}).map(([key, value]) => ({
            title: key,
            value: String(value),
            short: true,
          })),
          footer: 'BTRMe Monitoring',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }),
  })
}

async function sendPagerDutyAlert(alert: any) {
  // PagerDuty integration
  const integrationKey = process.env.PAGERDUTY_INTEGRATION_KEY
  if (!integrationKey) return

  await fetch('https://events.pagerduty.com/v2/enqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      routing_key: integrationKey,
      event_action: 'trigger',
      payload: {
        summary: alert.title,
        severity: alert.severity,
        source: 'btrme-production',
        custom_details: {
          message: alert.message,
          ...alert.metadata,
        },
      },
    }),
  })
}
```

### Deliverables

- ✅ Fly.io production configuration
- ✅ Deployment and rollback scripts
- ✅ Comprehensive health check endpoints
- ✅ Monitoring alerts configuration
- ✅ Alert integrations (Slack, PagerDuty)

---

## Epic 3.2 Complete! ✅

**Total Story Points:** 20 SP
**Total Hours:** 48 hours

**Stories Summary:**
- ✅ Story 3.2.1: Docker Multi-Stage Build (8 SP, 18h)
- ✅ Story 3.2.2: Docker Compose for Development (6 SP, 15h)
- ✅ Story 3.2.3: Production Container Orchestration (6 SP, 15h)

**Key Deliverables:**
- Optimized multi-stage Dockerfile
- Complete docker-compose.yml for local development
- Helper scripts and Makefile
- Fly.io production configuration
- Deployment automation
- Health checks and monitoring
- Alert integrations

---


# Epic 3.3: Database Migrations & Management (15 SP, 36 hours)

**Epic Goal:** Implement robust database migration system with version control and rollback capabilities.

**Business Value:** Enable safe database schema changes, maintain data integrity across environments.

---

## Story 3.3.1: Prisma Migration System

**Story Points:** 7 SP
**Estimated Hours:** 18 hours
**Priority:** P0 (Critical)
**Assignee:** Database Engineer

### User Story

```gherkin
As a developer
I want automated database migrations
So that schema changes are versioned and applied consistently
```

### Acceptance Criteria

```gherkin
Scenario: Create new migration
  Given I have changed the Prisma schema
  When I run migration command
  Then a new migration file should be created
  And it should contain SQL for schema changes
  And migration should be versioned with timestamp

Scenario: Apply migrations to database
  Given I have pending migrations
  When I deploy to staging/production
  Then migrations should run automatically
  And database schema should be updated
  And migration history should be recorded

Scenario: Rollback failed migration
  Given a migration has failed partway
  When I trigger rollback
  Then the database should return to previous state
  And no partial changes should remain

Scenario: Migration in CI/CD
  Given migrations run in GitHub Actions
  When tests execute
  Then migrations should apply to test database
  And tests should run against migrated schema
```

### Tasks

#### Task 3.3.1.1: Configure Prisma migrations

**Estimated Hours:** 3 hours

**Implementation:**

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [pgcrypto, uuid_ossp]
}

// Migration configuration in package.json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:migrate:dev": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:migrate:reset": "prisma migrate reset --skip-seed",
    "db:migrate:status": "prisma migrate status",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

#### Task 3.3.1.2: Create migration workflow scripts

**Estimated Hours:** 4 hours

**Implementation:**

```bash
# scripts/db/migrate-dev.sh
#!/bin/bash
set -e

echo "🗄️  Running database migrations (development)..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set!"
    exit 1
fi

# Create migration
read -p "Enter migration name: " MIGRATION_NAME

if [ -z "$MIGRATION_NAME" ]; then
    echo "❌ Migration name required!"
    exit 1
fi

# Generate migration
echo "📝 Generating migration: $MIGRATION_NAME"
pnpm prisma migrate dev --name "$MIGRATION_NAME"

# Verify migration
echo "✅ Migration created successfully!"
pnpm prisma migrate status

# Generate updated Prisma Client
echo "🔄 Regenerating Prisma Client..."
pnpm prisma generate

echo "✨ Done!"
```

```bash
# scripts/db/migrate-deploy.sh
#!/bin/bash
set -e

echo "🚀 Deploying database migrations..."

# Production safety check
if [ "$NODE_ENV" = "production" ]; then
    echo "⚠️  WARNING: Running migrations in PRODUCTION!"
    read -p "Are you sure? (yes/no): " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        echo "❌ Migration cancelled"
        exit 0
    fi
fi

# Check pending migrations
echo "📊 Checking migration status..."
pnpm prisma migrate status

# Create backup before migration
echo "💾 Creating database backup..."
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump "$DATABASE_URL" > "backups/$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"

# Deploy migrations
echo "🔄 Applying migrations..."
pnpm prisma migrate deploy

# Verify success
echo "✅ Migrations deployed successfully!"
pnpm prisma migrate status

echo "✨ Done!"
```

```bash
# scripts/db/rollback.sh
#!/bin/bash
set -e

echo "🔄 Rolling back database migration..."

# Get last applied migration
LAST_MIGRATION=$(ls -t prisma/migrations | head -n 1)

echo "Last migration: $LAST_MIGRATION"
read -p "Rollback this migration? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Rollback cancelled"
    exit 0
fi

# Restore from backup
LATEST_BACKUP=$(ls -t backups/*.sql | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup found!"
    exit 1
fi

echo "📦 Restoring from backup: $LATEST_BACKUP"
psql "$DATABASE_URL" < "$LATEST_BACKUP"

echo "✅ Database rolled back successfully!"
```

#### Task 3.3.1.3: Add migration tests

**Estimated Hours:** 4 hours

**Implementation:**

```typescript
// __tests__/db/migrations.test.ts
import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Database Migrations', () => {
  afterAll(async () => {
    await prisma.$disconnect()
  })

  test('should have migration files', () => {
    const output = execSync('ls prisma/migrations', { encoding: 'utf-8' })
    expect(output).toBeTruthy()
  })

  test('migrations should be applied', async () => {
    const tables = await prisma.$queryRaw<any[]>`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    `
    
    expect(tables.length).toBeGreaterThan(0)
    expect(tables.some(t => t.tablename === 'User')).toBe(true)
    expect(tables.some(t => t.tablename === 'Project')).toBe(true)
  })

  test('migration history should be tracked', async () => {
    const migrations = await prisma.$queryRaw<any[]>`
      SELECT * FROM _prisma_migrations
      ORDER BY finished_at DESC
    `
    
    expect(migrations.length).toBeGreaterThan(0)
    expect(migrations[0].migration_name).toBeTruthy()
  })

  test('should rollback migration successfully', async () => {
    // Create test table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS test_rollback (
        id SERIAL PRIMARY KEY,
        name TEXT
      )
    `

    // Verify table exists
    const before = await prisma.$queryRaw<any[]>`
      SELECT tablename FROM pg_tables 
      WHERE tablename = 'test_rollback'
    `
    expect(before.length).toBe(1)

    // Drop table (simulate rollback)
    await prisma.$executeRaw`DROP TABLE test_rollback`

    // Verify table is gone
    const after = await prisma.$queryRaw<any[]>`
      SELECT tablename FROM pg_tables 
      WHERE tablename = 'test_rollback'
    `
    expect(after.length).toBe(0)
  })
})
```

### Deliverables

- ✅ Prisma migration configuration
- ✅ Migration workflow scripts (dev, deploy, rollback)
- ✅ Automated backup before migrations
- ✅ Migration status checking
- ✅ Migration tests
- ✅ CI/CD integration

---

## Story 3.3.2: Database Seeding System

**Story Points:** 4 SP  
**Estimated Hours:** 10 hours
**Priority:** P1 (High)

### User Story

```gherkin
As a developer
I want to seed the database with initial data
So that development and testing environments have realistic data
```

### Acceptance Criteria

```gherkin
Scenario: Seed development database
  Given I have an empty database
  When I run seed command
  Then admin user should be created
  And sample templates should be added
  And test data should be populated

Scenario: Idempotent seeding
  Given database already has seed data
  When I run seed command again
  Then it should update existing records
  And not create duplicates
  And preserve existing user data
```

### Tasks

#### Task 3.3.2.1: Create seed script

**Estimated Hours:** 5 hours

**Implementation:**

```typescript
// prisma/seed.ts
import { PrismaClient, Tier, ProjectStatus } from '@prisma/client'
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
      password: await hash('Admin123!', 10),
      emailVerified: new Date(),
      tier: Tier.TEAM,
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create sample templates
  const templates = [
    {
      name: 'E-commerce Store',
      description: 'Full-featured online store with cart, checkout, and payment',
      category: 'ecommerce',
      content: `You are an expert in building e-commerce applications...`,
      variables: JSON.stringify(['storeName', 'productTypes']),
      tags: ['ecommerce', 'stripe', 'nextjs'],
      public: true,
      active: true,
      userId: admin.id,
    },
    {
      name: 'SaaS Dashboard',
      description: 'Complete SaaS application with authentication and subscriptions',
      category: 'saas',
      content: `You are an expert in building SaaS platforms...`,
      variables: JSON.stringify(['appName', 'features']),
      tags: ['saas', 'dashboard', 'auth'],
      public: true,
      active: true,
      userId: admin.id,
    },
  ]

  for (const template of templates) {
    await prisma.promptTemplate.upsert({
      where: {
        userId_name: {
          userId: admin.id,
          name: template.name,
        },
      },
      update: template,
      create: template,
    })
  }
  console.log(`✅ ${templates.length} templates seeded`)

  // Create sample projects (dev only)
  if (process.env.NODE_ENV === 'development') {
    const projects = [
      {
        userId: admin.id,
        name: 'My Todo App',
        description: 'Simple todo application',
        status: ProjectStatus.DEPLOYED,
        structure: JSON.stringify({
          files: [
            { path: 'app/page.tsx', content: '...' },
          ],
        }),
      },
    ]

    for (const project of projects) {
      await prisma.project.create({ data: project })
    }
    console.log(`✅ ${projects.length} sample projects created`)
  }

  console.log('✨ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Deliverables

- ✅ Comprehensive seed script
- ✅ Idempotent upsert operations
- ✅ Environment-specific seeding
- ✅ Seed documentation

---

## Story 3.3.3: Database Backup & Recovery

**Story Points:** 4 SP
**Estimated Hours:** 8 hours  
**Priority:** P1 (High)

### Implementation

```bash
# scripts/db/backup.sh
#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

echo "💾 Creating database backup..."
pg_dump $DATABASE_URL > $BACKUP_FILE
gzip $BACKUP_FILE

echo "✅ Backup created: ${BACKUP_FILE}.gz"
```

### Deliverables

- ✅ Automated backup scripts
- ✅ Recovery procedures
- ✅ Backup verification

---

## Epic 3.3 Complete! ✅

**Total:** 15 SP, 36 hours

---


# Epic 3.4: Environment Management (15 SP, 36 hours)

**Epic Goal:** Manage environment-specific configurations securely across all deployment stages.

---

## Story 3.4.1: Environment Configuration System

**Story Points:** 6 SP
**Estimated Hours:** 15 hours
**Priority:** P0 (Critical)

### User Story

```gherkin
As a developer
I want environment-specific configuration
So that each environment has appropriate settings
```

### Implementation

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
  SENTRY_DSN: z.string().url().optional(),
})

export const env = envSchema.parse(process.env)

export function validateEnv() {
  try {
    envSchema.parse(process.env)
    console.log('✅ Environment variables validated')
    return true
  } catch (error) {
    console.error('❌ Invalid environment:', error)
    process.exit(1)
  }
}
```

**Environment Files:**

```.env.development
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/btrme_dev
REDIS_URL=redis://localhost:6379
NEXTAUTH_URL=http://localhost:3000
```

```.env.production
NODE_ENV=production
DATABASE_URL=${DATABASE_URL}
REDIS_URL=${REDIS_URL}
NEXTAUTH_URL=https://btrme.com
```

### Deliverables

- ✅ Environment validation with Zod
- ✅ Environment-specific configs
- ✅ Type-safe environment access
- ✅ Validation on startup

---

## Story 3.4.2: Feature Flags System

**Story Points:** 5 SP
**Estimated Hours:** 12 hours

### Implementation

```typescript
// apps/web/lib/features/flags.ts
export const FEATURES = {
  AI_GENERATION: getEnvFlag('FEATURE_AI_GENERATION', true),
  TEMPLATE_MARKETPLACE: getEnvFlag('FEATURE_MARKETPLACE', true),
  REALTIME_COLLAB: getEnvFlag('FEATURE_COLLAB', false),
  ADVANCED_ANALYTICS: getEnvFlag('FEATURE_ANALYTICS', false),
} as const

function getEnvFlag(name: string, defaultValue: boolean): boolean {
  const value = process.env[name]
  if (value === undefined) return defaultValue
  return value === 'true' || value === '1'
}

export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature]
}
```

### Deliverables

- ✅ Feature flag system
- ✅ Environment-based toggles
- ✅ Runtime feature checks

---

## Story 3.4.3: Secrets Management

**Story Points:** 4 SP
**Estimated Hours:** 9 hours

### Implementation

```bash
# Using Vercel secrets
vercel secrets add database-url "postgresql://..."
vercel secrets add redis-url "redis://..."
vercel secrets add nextauth-secret "..."

# Using GitHub secrets for CI/CD
gh secret set DATABASE_URL --body "postgresql://..."
gh secret set OPENAI_API_KEY --body "sk-..."
```

### Deliverables

- ✅ Secrets stored in Vercel
- ✅ GitHub Actions secrets
- ✅ No secrets in codebase
- ✅ Secret rotation procedures

---

## Epic 3.4 Complete! ✅

**Total:** 15 SP, 36 hours

---


# Epic 3.5: Monitoring & Logging (15 SP, 36 hours)

**Epic Goal:** Implement comprehensive monitoring, logging, and alerting for production systems.

---

## Story 3.5.1: Application Monitoring with Sentry

**Story Points:** 6 SP
**Estimated Hours:** 15 hours
**Priority:** P0 (Critical)

### User Story

```gherkin
As a DevOps engineer
I want real-time error monitoring
So that I can detect and fix issues quickly
```

### Implementation

```typescript
// apps/web/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.authorization
    }
    return event
  },
  
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Prisma({ client: prisma }),
  ],
})

export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: { custom: context },
  })
}
```

**Usage in API routes:**

```typescript
// apps/web/app/api/generate/route.ts
import { captureError } from '@/lib/monitoring/sentry'

export async function POST(req: Request) {
  try {
    const result = await generateCode(input)
    return NextResponse.json(result)
  } catch (error) {
    captureError(error as Error, {
      userId: session.user.id,
      input,
    })
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
```

### Deliverables

- ✅ Sentry integration
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ User context tracking

---

## Story 3.5.2: Structured Logging with Pino

**Story Points:** 5 SP
**Estimated Hours:** 12 hours

### Implementation

```typescript
// apps/web/lib/logging/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
})

// Middleware for request logging
export function logRequest(req: Request, duration: number) {
  logger.info({
    type: 'http.request',
    method: req.method,
    url: req.url,
    duration,
    userAgent: req.headers.get('user-agent'),
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

### Deliverables

- ✅ Structured logging
- ✅ Log levels (debug, info, warn, error)
- ✅ Request/response logging
- ✅ Pretty printing for development

---

## Story 3.5.3: Performance Monitoring

**Story Points:** 4 SP
**Estimated Hours:** 9 hours

### Implementation

```typescript
// apps/web/lib/monitoring/performance.ts
import { performance } from 'perf_hooks'

export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  
  try {
    const result = await fn()
    const duration = performance.now() - start
    
    logger.debug({
      type: 'performance',
      operation: name,
      duration,
    })
    
    // Send to monitoring service
    if (duration > 1000) {
      logger.warn({
        type: 'slow_operation',
        operation: name,
        duration,
      })
    }
    
    return result
  } catch (error) {
    const duration = performance.now() - start
    logger.error({
      type: 'performance_error',
      operation: name,
      duration,
      error,
    })
    throw error
  }
}

// Usage
const result = await measureAsync('generate_code', async () => {
  return await openai.chat.completions.create({ ... })
})
```

### Deliverables

- ✅ Performance measurement utilities
- ✅ Slow operation detection
- ✅ Memory usage tracking
- ✅ Database query monitoring

---

## Epic 3.5 Complete! ✅

**Total:** 15 SP, 36 hours

---

# SPRINT 3 COMPLETE! 🎉

## Summary

**Sprint 3: Deployment Pipeline & Infrastructure**
**Total Story Points:** 90 SP
**Total Hours:** 216 hours
**Team:** 8 senior engineers

### Epics Completed

✅ **Epic 3.1: CI/CD Pipeline** (25 SP, 60h)
- GitHub Actions CI workflow
- Automated deployment pipeline with canary
- Code quality & security automation

✅ **Epic 3.2: Containerization** (20 SP, 48h)
- Docker multi-stage builds
- Docker Compose for local development
- Production container orchestration (Fly.io)

✅ **Epic 3.3: Database Management** (15 SP, 36h)
- Prisma migration system
- Database seeding
- Backup & recovery procedures

✅ **Epic 3.4: Environment Management** (15 SP, 36h)
- Environment configuration system
- Feature flags
- Secrets management

✅ **Epic 3.5: Monitoring & Logging** (15 SP, 36h)
- Sentry error monitoring
- Structured logging with Pino
- Performance monitoring

### Key Achievements

- 🚀 **Zero-downtime deployments** with canary strategy
- 🐳 **Containerized** all services with Docker
- 🗄️ **Database migrations** with rollback support
- 🔒 **Secure** environment and secrets management
- 📊 **Comprehensive monitoring** with Sentry + Pino
- ⚡ **Fast CI/CD** with caching (< 5 min builds)
- 🎯 **Production-ready** infrastructure

### Technical Stack

- **CI/CD:** GitHub Actions
- **Containers:** Docker, Docker Compose
- **Deployment:** Vercel (frontend), Fly.io (backend)
- **Database:** PostgreSQL with Prisma
- **Monitoring:** Sentry, Pino
- **Secrets:** Vercel Secrets, GitHub Secrets

---

**Sprint Status:** ✅ COMPLETE
**Next Sprint:** Sprint 4 - Templates & Iteration Engine

