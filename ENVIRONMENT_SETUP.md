# BTRMe Environment Setup Guide

> **Version:** 1.0.0
> **Last Updated:** 2025-11-13

This document describes all environment variables and configuration needed for BTRMe deployment.

---

## Table of Contents

1. [Environment Variables Overview](#environment-variables-overview)
2. [Application Configuration](#application-configuration)
3. [Database Configuration](#database-configuration)
4. [Redis Configuration](#redis-configuration)
5. [Authentication Configuration](#authentication-configuration)
6. [AI Models Configuration](#ai-models-configuration)
7. [Email Configuration](#email-configuration)
8. [Monitoring Configuration](#monitoring-configuration)
9. [Feature Flags](#feature-flags)
10. [Environment-Specific Configs](#environment-specific-configs)

---

## Environment Variables Overview

BTRMe uses environment variables for all sensitive configuration. **Never commit `.env` files to git.**

### Environment Files

```
.env.local          # Local development (git ignored)
.env.development    # Development defaults (can be committed)
.env.test           # Test environment (can be committed)
.env.production     # Production (NEVER commit - configure in Vercel)
```

### Required vs Optional Variables

- ✅ **Required**: Application will not start without these
- ⚠️ **Optional**: Feature-specific, application will work without them
- 🔧 **Development Only**: Only needed in development environment

---

## Application Configuration

### Core Application Settings

```bash
# ===================================
# Environment
# ===================================
# ✅ Required
NODE_ENV=production  # Options: development | test | production

# ✅ Required - Application URLs
NEXT_PUBLIC_APP_URL=https://btrme.com
NEXT_PUBLIC_API_URL=https://btrme.com/api

# ⚠️ Optional - API Version
NEXT_PUBLIC_API_VERSION=v1

# ⚠️ Optional - Application Name
NEXT_PUBLIC_APP_NAME=BTRMe
```

**Production Values:**
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://btrme.com
NEXT_PUBLIC_API_URL=https://btrme.com/api
```

**Staging Values:**
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://btrme-staging.vercel.app
NEXT_PUBLIC_API_URL=https://btrme-staging.vercel.app/api
```

**Local Development Values:**
```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Database Configuration

### PostgreSQL (Neon)

```bash
# ===================================
# Database URLs
# ===================================
# ✅ Required - Primary database URL (pooled connection)
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/btrme?sslmode=require"

# ✅ Required - Direct connection (for migrations)
DIRECT_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/btrme?sslmode=require"

# ⚠️ Optional - Unpooled connection (for Prisma Studio)
DATABASE_URL_UNPOOLED="postgresql://user:password@ep-xxx.region.aws.neon.tech/btrme?sslmode=require"
```

### How to Get Database URLs from Neon

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project → **Connection Details**
3. Copy connection strings:
   - **Pooled connection** → `DATABASE_URL`
   - **Direct connection** → `DIRECT_URL`

**Connection String Format:**
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Example:**
```bash
DATABASE_URL="postgresql://btrme_user:xK9mN2pQ7@ep-cool-cloud-12345.us-east-1.aws.neon.tech/btrme?sslmode=require"
DIRECT_URL="postgresql://btrme_user:xK9mN2pQ7@ep-cool-cloud-12345.us-east-1.aws.neon.tech/btrme?sslmode=require"
```

### Database Connection Pool Settings

```bash
# ⚠️ Optional - Prisma connection pool size
DATABASE_POOL_SIZE=10  # Default: 10, Max: 20 for Neon

# ⚠️ Optional - Connection timeout (milliseconds)
DATABASE_CONNECT_TIMEOUT=30000  # 30 seconds
```

### Database Performance Settings

```bash
# ⚠️ Optional - Query timeout (milliseconds)
DATABASE_QUERY_TIMEOUT=10000  # 10 seconds

# 🔧 Development Only - Enable query logging
DATABASE_LOG_QUERIES=false  # Set to true in development
```

---

## Redis Configuration

### Upstash Redis

```bash
# ===================================
# Redis Connection
# ===================================
# ✅ Required - Upstash REST API URL
REDIS_URL=https://xxxx.upstash.io

# ✅ Required - Upstash REST API token
REDIS_TOKEN=AXxxxxxxxxxxxxxxxxxxx

# ⚠️ Optional - Redis password (if using traditional Redis)
# REDIS_PASSWORD=your_password_here
```

### How to Get Redis Credentials from Upstash

1. Go to [Upstash Console](https://console.upstash.com)
2. Select your database
3. Go to **REST API** tab
4. Copy:
   - **UPSTASH_REDIS_REST_URL** → `REDIS_URL`
   - **UPSTASH_REDIS_REST_TOKEN** → `REDIS_TOKEN`

**Example:**
```bash
REDIS_URL=https://gusc1-prime-aardvark-12345.upstash.io
REDIS_TOKEN=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Cache Configuration

```bash
# ⚠️ Optional - Cache TTL (seconds)
CACHE_TTL_DEFAULT=300  # 5 minutes
CACHE_TTL_TEMPLATES=3600  # 1 hour for templates
CACHE_TTL_USER=1800  # 30 minutes for user data

# ⚠️ Optional - Cache key prefix
CACHE_KEY_PREFIX=btrme:prod:

# ⚠️ Optional - Enable cache compression
CACHE_COMPRESSION=true
```

---

## Authentication Configuration

### NextAuth.js Core Settings

```bash
# ===================================
# NextAuth Configuration
# ===================================
# ✅ Required - Application URL for auth callbacks
NEXTAUTH_URL=https://btrme.com

# ✅ Required - Secret for JWT encryption (32+ characters)
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# ⚠️ Optional - JWT max age (seconds)
NEXTAUTH_JWT_MAX_AGE=604800  # 7 days

# ⚠️ Optional - Session strategy
NEXTAUTH_SESSION_STRATEGY=jwt  # Options: jwt | database
```

### Generate NEXTAUTH_SECRET

```bash
# Generate a secure random secret
openssl rand -base64 32

# Example output:
# xK9mN2pQ7vL3jR8tY5hF1dW4sG6bA0cX9zT2uP4kM=

# Use this value for NEXTAUTH_SECRET
NEXTAUTH_SECRET=xK9mN2pQ7vL3jR8tY5hF1dW4sG6bA0cX9zT2uP4kM=
```

### Google OAuth

```bash
# ===================================
# Google OAuth Configuration
# ===================================
# ✅ Required for Google login
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

### How to Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - Production: `https://btrme.com/api/auth/callback/google`
   - Staging: `https://btrme-staging.vercel.app/api/auth/callback/google`
   - Local: `http://localhost:3000/api/auth/callback/google`
7. Copy **Client ID** and **Client Secret**

**Example:**
```bash
GOOGLE_CLIENT_ID=XXXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-XXXXXXXXXXXXXXXXXXXX
```

### GitHub OAuth

```bash
# ===================================
# GitHub OAuth Configuration
# ===================================
# ✅ Required for GitHub login
GITHUB_CLIENT_ID=Iv1.abcdef1234567890
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678
```

### How to Get GitHub OAuth Credentials

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: BTRMe
   - **Homepage URL**: `https://btrme.com`
   - **Authorization callback URL**: `https://btrme.com/api/auth/callback/github`
4. Click **Register application**
5. Generate a **Client Secret**
6. Copy **Client ID** and **Client Secret**

**For multiple environments, create separate OAuth apps:**
- Production: `https://btrme.com/api/auth/callback/github`
- Staging: `https://btrme-staging.vercel.app/api/auth/callback/github`
- Local: `http://localhost:3000/api/auth/callback/github`

**Example:**
```bash
GITHUB_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_CLIENT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

---

## AI Models Configuration

### OpenAI Configuration

```bash
# ===================================
# OpenAI Configuration
# ===================================
# ✅ Required - OpenAI API key
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ⚠️ Optional - OpenAI organization ID
OPENAI_ORGANIZATION_ID=org-xxxxxxxxxxxxxxxxxxxxxxxx

# ⚠️ Optional - Default model
OPENAI_DEFAULT_MODEL=gpt-4-turbo-preview

# ⚠️ Optional - Max tokens
OPENAI_MAX_TOKENS=4096

# ⚠️ Optional - Temperature
OPENAI_TEMPERATURE=0.7

# ⚠️ Optional - Request timeout (milliseconds)
OPENAI_TIMEOUT=60000  # 60 seconds
```

### How to Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign in or create account
3. Go to **API Keys** → **Create new secret key**
4. Name: "BTRMe Production"
5. Copy the key (shown only once)
6. Set up billing at [Billing Settings](https://platform.openai.com/account/billing)

**Example:**
```bash
OPENAI_API_KEY=sk-proj-Ab1Cd2Ef3Gh4Ij5Kl6Mn7Op8Qr9St0Uv1Wx2Yz3
OPENAI_ORGANIZATION_ID=org-Ab1Cd2Ef3Gh4Ij5K
```

### Anthropic Claude Configuration

```bash
# ===================================
# Anthropic Configuration
# ===================================
# ✅ Required - Anthropic API key
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ⚠️ Optional - Default Claude model
ANTHROPIC_DEFAULT_MODEL=claude-3-opus-20240229

# ⚠️ Optional - Max tokens
ANTHROPIC_MAX_TOKENS=4096

# ⚠️ Optional - Temperature
ANTHROPIC_TEMPERATURE=0.7

# ⚠️ Optional - Request timeout (milliseconds)
ANTHROPIC_TIMEOUT=60000  # 60 seconds
```

### How to Get Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com)
2. Sign in or create account
3. Go to **API Keys** → **Create Key**
4. Name: "BTRMe Production"
5. Copy the key
6. Set up billing in account settings

**Example:**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-Ab1Cd2Ef3Gh4Ij5Kl6Mn7Op8Qr9St0
```

### AI Cost Tracking

```bash
# ⚠️ Optional - Enable cost tracking
AI_COST_TRACKING=true

# ⚠️ Optional - Cost alert threshold (USD)
AI_COST_ALERT_THRESHOLD=100  # Alert when daily cost exceeds $100

# ⚠️ Optional - Model selection strategy
AI_MODEL_STRATEGY=intelligent  # Options: intelligent | cheapest | fastest
```

---

## Email Configuration

### Resend Configuration

```bash
# ===================================
# Email (Resend)
# ===================================
# ✅ Required - Resend API key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ✅ Required - From email address (must be verified)
RESEND_FROM_EMAIL=noreply@btrme.com

# ⚠️ Optional - From name
RESEND_FROM_NAME=BTRMe

# ⚠️ Optional - Reply-to email
RESEND_REPLY_TO=support@btrme.com
```

### How to Get Resend API Key

1. Go to [Resend](https://resend.com)
2. Sign up or sign in
3. Go to **API Keys** → **Create API Key**
4. Name: "BTRMe Production"
5. Permissions: **Sending access**
6. Copy the API key
7. Verify your domain at **Domains** → **Add Domain**

**Domain Verification:**
1. Add domain: `btrme.com`
2. Add DNS records (provided by Resend):
   ```
   TXT record: _resend.btrme.com → "resend_verify=xxx"
   MX record:  btrme.com → "mx.resend.com"
   ```
3. Wait for verification (5-10 minutes)

**Example:**
```bash
RESEND_API_KEY=re_Ab1Cd2Ef3Gh4Ij5Kl6Mn7Op8Qr9St0
RESEND_FROM_EMAIL=noreply@btrme.com
RESEND_FROM_NAME=BTRMe
```

### Email Templates

```bash
# ⚠️ Optional - Enable email templates
EMAIL_TEMPLATES_ENABLED=true

# ⚠️ Optional - Template IDs (if using Resend templates)
EMAIL_TEMPLATE_WELCOME=welcome-v1
EMAIL_TEMPLATE_PASSWORD_RESET=password-reset-v1
EMAIL_TEMPLATE_EMAIL_VERIFICATION=email-verification-v1
```

---

## Monitoring Configuration

### Sentry Error Tracking

```bash
# ===================================
# Sentry Configuration
# ===================================
# ✅ Required - Sentry DSN (public)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxxxx

# ✅ Required - Sentry auth token (for source maps)
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ✅ Required - Sentry organization slug
SENTRY_ORG=btrme

# ✅ Required - Sentry project slug
SENTRY_PROJECT=web

# ⚠️ Optional - Environment name
SENTRY_ENVIRONMENT=production

# ⚠️ Optional - Release version (auto-detected from git)
# SENTRY_RELEASE=v1.0.0

# ⚠️ Optional - Sample rate (0.0 to 1.0)
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions

# ⚠️ Optional - Enable performance monitoring
SENTRY_ENABLE_TRACING=true
```

### How to Get Sentry Configuration

1. Go to [Sentry](https://sentry.io)
2. Create account or sign in
3. Create organization: "btrme"
4. Create project: "web" (Platform: Next.js)
5. Copy **DSN** from project settings
6. Generate **Auth Token**:
   - Go to **Settings** → **Auth Tokens**
   - Create token with scopes: `project:releases`, `org:read`
7. Copy **Organization Slug** and **Project Slug**

**Example:**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://abc123def456ghi789@o123456.ingest.sentry.io/7890123
SENTRY_AUTH_TOKEN=sntrys_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
SENTRY_ORG=btrme
SENTRY_PROJECT=web
SENTRY_ENVIRONMENT=production
```

### Vercel Analytics

```bash
# ===================================
# Vercel Analytics
# ===================================
# ⚠️ Optional - Vercel Analytics ID (auto-configured in Vercel)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxxxxxxxxxxxxxxxxxxx

# ⚠️ Optional - Enable Web Vitals tracking
NEXT_PUBLIC_ENABLE_WEB_VITALS=true
```

**Note:** Vercel Analytics is automatically enabled when deploying to Vercel. No configuration needed.

---

## Feature Flags

```bash
# ===================================
# Feature Flags
# ===================================
# ⚠️ Optional - Enable/disable features

# Analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Template Marketplace
NEXT_PUBLIC_ENABLE_MARKETPLACE=true

# Collaboration Features
NEXT_PUBLIC_ENABLE_COLLABORATION=false

# Admin Panel
NEXT_PUBLIC_ENABLE_ADMIN_PANEL=true

# A/B Testing
NEXT_PUBLIC_ENABLE_AB_TESTING=false

# Maintenance Mode
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

---

## Rate Limiting

```bash
# ===================================
# Rate Limiting
# ===================================
# ⚠️ Optional - Rate limit settings

# Max requests per window
RATE_LIMIT_MAX_REQUESTS=100

# Time window in milliseconds
RATE_LIMIT_WINDOW_MS=60000  # 1 minute

# Rate limit strategy
RATE_LIMIT_STRATEGY=sliding  # Options: fixed | sliding

# Whitelist IPs (comma-separated)
RATE_LIMIT_WHITELIST=127.0.0.1,::1
```

---

## Storage Configuration (Optional)

### AWS S3 (for file uploads)

```bash
# ===================================
# AWS S3 Configuration (Optional)
# ===================================
# ⚠️ Optional - Only if using file uploads

AWS_S3_BUCKET=btrme-production
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1

# S3 endpoint (optional - for custom endpoints)
# AWS_S3_ENDPOINT=https://s3.us-east-1.amazonaws.com

# CloudFront CDN (optional)
# AWS_CLOUDFRONT_DOMAIN=d1234567890abc.cloudfront.net
```

---

## Environment-Specific Configs

### Production Environment

```bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://btrme.com
NEXT_PUBLIC_API_URL=https://btrme.com/api
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/btrme?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/btrme?sslmode=require"
REDIS_URL=https://xxxx.upstash.io
REDIS_TOKEN=AXxxxxxxxxxxx
NEXTAUTH_URL=https://btrme.com
NEXTAUTH_SECRET=<32-char-secret>
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GITHUB_CLIENT_ID=Iv1.xxx
GITHUB_CLIENT_SECRET=xxx
OPENAI_API_KEY=sk-proj-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@btrme.com
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx
SENTRY_ORG=btrme
SENTRY_PROJECT=web
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_MARKETPLACE=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

### Staging Environment

```bash
# .env.staging
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://btrme-staging.vercel.app
NEXT_PUBLIC_API_URL=https://btrme-staging.vercel.app/api
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/btrme_staging?sslmode=require"
# ... (same as production but with staging values)
SENTRY_ENVIRONMENT=staging
NEXT_PUBLIC_ENABLE_ANALYTICS=false  # Disable in staging
```

### Local Development

```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/btrme_dev"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/btrme_dev"
# Use test/development API keys
OPENAI_API_KEY=sk-proj-test-xxx
ANTHROPIC_API_KEY=sk-ant-test-xxx
# Disable monitoring in development
NEXT_PUBLIC_SENTRY_DSN=  # Leave empty
```

---

## Setting Environment Variables in Vercel

### Via Vercel CLI

```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Add single variable
vercel env add DATABASE_URL production

# Add from file
cat .env.production | while read line; do
  if [[ $line != \#* ]] && [[ -n $line ]]; then
    key=$(echo $line | cut -d= -f1)
    value=$(echo $line | cut -d= -f2-)
    echo "Adding $key"
    echo "$value" | vercel env add $key production
  fi
done

# List all variables
vercel env ls

# Remove variable
vercel env rm DATABASE_URL production
```

### Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Name**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Production, Preview, Development
6. Click **Save**

**Bulk Import:**
1. Click **Import** button
2. Paste all variables from `.env.production`
3. Select environments
4. Click **Import**

---

## Security Best Practices

### DO ✅

- ✅ Use strong, random secrets (32+ characters)
- ✅ Generate unique secrets for each environment
- ✅ Rotate secrets regularly (quarterly minimum)
- ✅ Use different API keys for production vs staging
- ✅ Enable 2FA on all service accounts
- ✅ Restrict API key permissions to minimum required
- ✅ Monitor API usage for anomalies
- ✅ Set up billing alerts on all services
- ✅ Use environment-specific OAuth apps
- ✅ Enable audit logs where available

### DON'T ❌

- ❌ Commit `.env` files to git
- ❌ Share secrets via email or Slack
- ❌ Use production API keys in development
- ❌ Hardcode secrets in code
- ❌ Use weak or predictable secrets
- ❌ Share API keys across multiple projects
- ❌ Disable SSL/TLS in production
- ❌ Use default passwords
- ❌ Store secrets in client-side code
- ❌ Log secrets in application logs

### Secret Storage

**For team sharing (use a secret manager):**
- [1Password](https://1password.com) (recommended)
- [LastPass](https://www.lastpass.com)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [HashiCorp Vault](https://www.vaultproject.io)

---

## Troubleshooting

### Common Issues

**Database connection fails:**
```bash
# Check connection string format
echo $DATABASE_URL
# Should start with: postgresql://

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**Redis connection fails:**
```bash
# Check Upstash credentials
curl -H "Authorization: Bearer $REDIS_TOKEN" $REDIS_URL/ping
# Should return: PONG
```

**NextAuth callback error:**
```bash
# Ensure NEXTAUTH_URL matches exactly
# Production: https://btrme.com (no trailing slash)
# Staging: https://btrme-staging.vercel.app

# Check OAuth redirect URIs match
# Google: https://btrme.com/api/auth/callback/google
# GitHub: https://btrme.com/api/auth/callback/github
```

**AI API errors:**
```bash
# Test OpenAI API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Anthropic API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-opus-20240229","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}'
```

---

## Verification Checklist

Before deploying, verify all required variables are set:

```bash
# Run verification script
pnpm run verify-env

# Or manually check:
cat > check-env.sh << 'EOF'
#!/bin/bash

required_vars=(
  "NODE_ENV"
  "NEXT_PUBLIC_APP_URL"
  "NEXT_PUBLIC_API_URL"
  "DATABASE_URL"
  "DIRECT_URL"
  "REDIS_URL"
  "REDIS_TOKEN"
  "NEXTAUTH_URL"
  "NEXTAUTH_SECRET"
  "OPENAI_API_KEY"
  "ANTHROPIC_API_KEY"
  "RESEND_API_KEY"
  "NEXT_PUBLIC_SENTRY_DSN"
)

missing=()
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing+=("$var")
  fi
done

if [ ${#missing[@]} -eq 0 ]; then
  echo "✅ All required environment variables are set"
else
  echo "❌ Missing required environment variables:"
  printf '  - %s\n' "${missing[@]}"
  exit 1
fi
EOF

chmod +x check-env.sh
./check-env.sh
```

---

**Document Version:** 1.0.0
**Last Reviewed:** 2025-11-13
**Next Review:** 2025-12-13
