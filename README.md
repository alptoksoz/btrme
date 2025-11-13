# 🚀 BTRMe - AI-Powered NoCode Builder

> Transform natural language prompts into deployed applications in minutes.

**BTRMe** is an AI-powered nocode platform that allows anyone to create and deploy web applications using simple natural language prompts. No coding required.

## ✨ Features

- 🤖 **AI-Powered Generation**: Describe your app in plain language, get working code
- 🚀 **Instant Deployment**: Automatically deployed to production with a unique URL
- 🎨 **Modern Stack**: Next.js 14, React, TypeScript, Tailwind CSS
- 🔒 **Secure by Default**: Multi-layer security validation
- 📦 **Template Library**: Pre-built templates for common use cases
- 🔄 **Iterative Development**: Refine your app with follow-up prompts
- 💻 **Code Export**: Download the source code anytime

## 🎯 Use Cases

### For Non-Technical Users
```
"Su içmeyi unutuyorum, bana günlük bildirim atan bir uygulama verir misin?"
→ Get a working reminder app with notifications in 2 minutes
```

### For Developers
```
"I need a quick CRUD dashboard to test my API before building the full product"
→ Instant MVP for rapid prototyping
```

## 🏗️ Architecture

```
User Prompt → AI Analysis → Code Generation → Security Validation → Build → Deploy
     ↓            ↓               ↓                  ↓              ↓        ↓
  Natural    AppSpec         React/Next.js      OWASP Check     Docker   Fly.io
  Language   Generation       Components         ESLint         Build    (*.btrme.app)
```

**Tech Stack:**
- **Frontend:** Next.js 14, React 18, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Prisma, PostgreSQL, Redis
- **AI:** Anthropic Claude 3.5 Sonnet
- **Deployment:** Vercel (platform) + Fly.io (generated apps)

## 📚 Documentation

- [**Feasibility Study**](./FEASIBILITY.md) - Complete project analysis, timeline, and costs
- [**Architecture**](./ARCHITECTURE.md) - Technical architecture and system design
- [**Sprint Plan**](./SPRINTS.md) - 12-week development roadmap
- [**Team Roles**](./TEAM.md) - Role definitions and responsibilities

## 🚦 Project Status

**Current Phase:** Planning & Setup
**Sprint:** Pre-Sprint (Week 0)
**Target Launch:** Week 12

### Milestones
- [ ] Sprint 1: Core Infrastructure (Week 1-4)
- [ ] Sprint 2: Deployment & Templates (Week 5-8)
- [ ] Sprint 3: Polish & Scale (Week 9-12)
- [ ] 🎉 Beta Launch (Week 12)

## 🛠️ Development

### Prerequisites
```bash
Node.js >= 20
Docker >= 24
PostgreSQL >= 15
Redis >= 7
```

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd btrme

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Setup database
npx prisma migrate dev
npx prisma generate

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."

# AI
ANTHROPIC_API_KEY="sk-ant-..."

# Deployment
FLY_API_TOKEN="..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Storage
S3_BUCKET="..."
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."
```

## 🧪 Testing

```bash
# Run all tests
npm test

# E2E tests
npm run test:e2e

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration
```

## 📦 Deployment

### Platform Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Generated Apps (Fly.io)
Apps are automatically deployed via the platform. Manual deployment:
```bash
fly deploy --config fly.toml
```

## 🔐 Security

Security is our top priority. All generated code goes through:
- ✅ Static analysis (ESLint, TypeScript)
- ✅ Security scanning (OWASP rules)
- ✅ Dependency audit
- ✅ Container isolation
- ✅ Resource limits
- ✅ Rate limiting

**Report security issues:** security@btrme.app

## 🤝 Contributing

This is a private project. Team members:
- **AI/Fullstack Lead:** Prompt engine, code generation
- **Backend Developer:** API, database, security
- **Frontend Developer:** UI/UX, builder interface
- **DevOps:** Infrastructure, deployment, monitoring

See [TEAM.md](./TEAM.md) for detailed role descriptions.

## 📝 License

Proprietary - All rights reserved

## 📞 Contact

- **Website:** https://btrme.app (coming soon)
- **Email:** hello@btrme.app
- **Documentation:** [docs](./docs)

---

**Built with ❤️ by the BTRMe Team**

Last Updated: 2025-11-13
