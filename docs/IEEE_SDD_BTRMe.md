# TOBB ETÜ Ekonomi ve Teknoloji Üniversitesi
## BİL 495 / YAP 495
# Software Design Description (SDD)
## BTRMe - AI-Powered NoCode Platform

**Referans:** IEEE 1016-2009

---

## Doküman Kontrol Tablosu

| Alan | Değer |
|------|-------|
| Doküman Başlığı | Software Design Description (SDD) |
| Doküman ID | BTRMe-SDD-001 |
| Hazırlayan (Yazar) | BTRMe Geliştirme Ekibi |
| İnceleyen | - |
| Onaylayan | - |
| Hazırlama Tarihi | Aralık 2025 |
| Onay Tarihi | - |
| Versiyon | 1.0 |
| Gizlilik Seviyesi | Internal |
| Referans Standartlar | IEEE 15288, IEEE 12207, INCOSE SE Handbook v5 |

---

## Değişiklik Kaydı (Revizyon Geçmişi)

| Revizyon | Tarih | Hazırlayan | İnceleyen/Onaylayan | Değişiklik Açıklaması |
|----------|-------|------------|---------------------|----------------------|
| 1.0 | Aralık 2025 | BTRMe Ekibi | - | İlk Sürüm |

---

## İçindekiler

1. [Giriş](#1-giriş)
   - 1.1 Amaç
   - 1.2 Kapsam
   - 1.3 Referanslar
2. [Sistem Genel Bakış](#2-sistem-genel-bakış)
   - 2.1 Sistem Mimarisi
   - 2.2 Tasarım Gerekçeleri
3. [Detaylı Tasarım](#3-detaylı-tasarım)
   - 3.1 Bileşen Tanımları
   - 3.2 Arayüz Tanımları
   - 3.3 Veri Tasarımı
   - 3.4 Algoritma Tasarımı
4. [İzlenebilirlik](#4-izlenebilirlik)
5. [Ek](#5-ek)
6. [Referanslar](#6-referanslar)

---

## 1. Giriş

### 1.1 Amaç

Bu doküman, BTRMe (AI-Powered NoCode Platform) projesinin yazılım tasarım detaylarını IEEE 1016-2009 standardına uygun olarak tanımlamaktadır. Doküman, sistem mimarisi, bileşen tasarımları, veri yapıları ve algoritmalar hakkında detaylı bilgi sunmaktadır.

**Hedef Kitle:**
- Yazılım geliştiriciler
- Sistem mimarları
- Test mühendisleri
- Bakım ekipleri
- Yeni ekip üyeleri (onboarding)

### 1.2 Kapsam

Bu doküman aşağıdaki alt sistemleri ve modülleri kapsamaktadır:

| Alt Sistem | Modüller |
|------------|----------|
| **Frontend** | Landing, Dashboard, AI Studio, Quick Generate, Projects, Templates, Settings |
| **Backend API** | Auth, Generation, Projects, Templates, Health |
| **AI Services** | GenerationService, ModelRouter, OpenAIService, AnthropicService |
| **Data Layer** | Prisma ORM, PostgreSQL, Redis Cache |
| **Shared** | UI Components (@btrme/ui) |

### 1.3 Referanslar

| Doküman | Açıklama |
|---------|----------|
| BTRMe-SRS-001 | Software Requirements Specification |
| BTRMe-PKE-001 | Proje Kısıt ve Etkiler Dokümanı |
| BTRMe-STP-001 | Software Test Plan |
| IEEE 1016-2009 | Software Design Description Standard |
| Next.js 14 Docs | Framework Documentation |
| Prisma Docs | ORM Documentation |

---

## 2. Sistem Genel Bakış

### 2.1 Sistem Mimarisi

#### 2.1.1 Üst Düzey Mimari Diyagramı

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Browser   │  │   Mobile    │  │    PWA      │  │   Desktop   │        │
│  │  (Chrome,   │  │  (Safari,   │  │  (Service   │  │  (Electron) │        │
│  │  Firefox)   │  │  Chrome)    │  │   Worker)   │  │  (Future)   │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │                │
│         └────────────────┴────────────────┴────────────────┘                │
│                                   │                                         │
│                                   ▼                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                           PRESENTATION LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js 14 (App Router)                           │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐            │   │
│  │  │  Landing  │ │ Dashboard │ │ AI Studio │ │  Projects │            │   │
│  │  │   Page    │ │   Page    │ │   Page    │ │   Page    │            │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘            │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐            │   │
│  │  │ Templates │ │  Settings │ │   Auth    │ │   Quick   │            │   │
│  │  │   Page    │ │   Page    │ │   Pages   │ │  Generate │            │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘            │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                    @btrme/ui Components                      │    │   │
│  │  │  Button, Card, Input, Textarea, Tabs, Dialog, Select, etc.   │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                             API LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js API Routes                                │   │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐              │   │
│  │  │ /api/auth/*   │ │ /api/projects │ │ /api/templates│              │   │
│  │  │ - signup      │ │ - POST create │ │ - GET list    │              │   │
│  │  │ - [...next]   │ │ - GET list    │ │ - GET [id]    │              │   │
│  │  └───────────────┘ │ - GET [id]    │ │ - POST use    │              │   │
│  │                    │ - PUT [id]    │ └───────────────┘              │   │
│  │  ┌───────────────┐ │ - DELETE [id] │ ┌───────────────┐              │   │
│  │  │/api/generation│ └───────────────┘ │ /api/health   │              │   │
│  │  │ - POST create │                   │ - GET status  │              │   │
│  │  │ - GET list    │                   │ - db-health   │              │   │
│  │  └───────────────┘                   │ - cache-health│              │   │
│  │                                      └───────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                           SERVICE LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      AI Generation Services                          │   │
│  │  ┌─────────────────┐                                                 │   │
│  │  │GenerationService│◄─────┐                                          │   │
│  │  │  - generate()   │      │                                          │   │
│  │  │  - fallback     │      │                                          │   │
│  │  └────────┬────────┘      │                                          │   │
│  │           │               │                                          │   │
│  │           ▼               │                                          │   │
│  │  ┌─────────────────┐      │                                          │   │
│  │  │  ModelRouter    │──────┘                                          │   │
│  │  │  - selectModel()│                                                 │   │
│  │  │  - getFallback()│                                                 │   │
│  │  └────────┬────────┘                                                 │   │
│  │           │                                                          │   │
│  │     ┌─────┴─────┐                                                    │   │
│  │     ▼           ▼                                                    │   │
│  │  ┌────────┐  ┌────────────┐                                          │   │
│  │  │OpenAI  │  │ Anthropic  │                                          │   │
│  │  │Service │  │  Service   │                                          │   │
│  │  │GPT-4   │  │  Claude    │                                          │   │
│  │  │GPT-3.5 │  │  Opus/     │                                          │   │
│  │  │Turbo   │  │  Sonnet/   │                                          │   │
│  │  │        │  │  Haiku     │                                          │   │
│  │  └────────┘  └────────────┘                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                            DATA LAYER                                       │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐   │
│  │    Prisma ORM        │  │    Redis Cache       │  │   File Storage  │   │
│  │  ┌────────────────┐  │  │  ┌────────────────┐  │  │  (Future)       │   │
│  │  │ User           │  │  │  │ Templates      │  │  │  - S3/R2        │   │
│  │  │ Account        │  │  │  │ Sessions       │  │  │  - Generated    │   │
│  │  │ Session        │  │  │  │ Rate Limits    │  │  │    Code         │   │
│  │  │ Project        │  │  │  └────────────────┘  │  └─────────────────┘   │
│  │  │ Generation     │  │  │                      │                        │
│  │  │ Template       │  │  │  Upstash Redis       │                        │
│  │  └────────────────┘  │  │  - Serverless        │                        │
│  │                      │  │  - Edge-compatible   │                        │
│  │  PostgreSQL          │  └──────────────────────┘                        │
│  │  - Supabase/Neon     │                                                  │
│  └──────────────────────┘                                                  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                         EXTERNAL SERVICES                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Anthropic │  │   OpenAI   │  │   Fly.io   │  │   Vercel   │            │
│  │  Claude API│  │    API     │  │ (Deploy)   │  │ (Hosting)  │            │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 2.1.2 Monorepo Yapısı

```
btrme/
├── apps/
│   └── web/                          # Ana web uygulaması
│       ├── app/                      # Next.js App Router
│       │   ├── (auth)/               # Auth layout group
│       │   │   ├── auth/signin/
│       │   │   └── auth/signup/
│       │   ├── (dashboard)/          # Dashboard layout group
│       │   │   ├── dashboard/
│       │   │   ├── projects/
│       │   │   ├── generate/
│       │   │   ├── studio/
│       │   │   ├── templates/
│       │   │   └── settings/
│       │   ├── api/                  # API Routes
│       │   │   ├── auth/
│       │   │   ├── generation/
│       │   │   ├── projects/
│       │   │   ├── templates/
│       │   │   └── health/
│       │   ├── layout.tsx
│       │   └── page.tsx              # Landing page
│       ├── components/               # App-specific components
│       │   ├── auth/
│       │   └── layout/
│       ├── lib/                      # Core business logic
│       │   ├── ai/                   # AI services
│       │   ├── cache/                # Redis cache
│       │   └── prisma.ts             # Database client
│       ├── prisma/
│       │   └── schema.prisma         # Database schema
│       └── __tests__/                # Test files
│
├── packages/
│   └── ui/                           # Shared UI library (@btrme/ui)
│       ├── src/
│       │   ├── button.tsx
│       │   ├── card.tsx
│       │   ├── input.tsx
│       │   └── ...
│       └── package.json
│
├── docs/                             # Documentation
├── package.json                      # Root workspace
├── pnpm-workspace.yaml              # pnpm workspaces
└── turbo.json                       # Turbo build config
```

### 2.2 Tasarım Gerekçeleri

#### 2.2.1 Teknoloji Seçimleri

| Karar | Seçim | Gerekçe | Alternatifler |
|-------|-------|---------|---------------|
| **Frontend Framework** | Next.js 14 | SSR/SSG, App Router, API Routes, Vercel entegrasyonu | React (CRA), Remix, SvelteKit |
| **UI Library** | shadcn/ui + Radix | Accessibility, Customizable, Tailwind uyumlu | MUI, Chakra, Ant Design |
| **Styling** | Tailwind CSS | Utility-first, JIT compiler, Bundle size | Styled-components, CSS Modules |
| **State Management** | React Query + Context | Server state caching, Simple client state | Redux, Zustand, Jotai |
| **Database** | PostgreSQL + Prisma | Type-safe ORM, Migrations, Relations | MongoDB, MySQL, Drizzle |
| **Cache** | Redis (Upstash) | Serverless, Edge-compatible, Fast | Memcached, DynamoDB |
| **AI Primary** | Claude (Anthropic) | Best code generation quality | GPT-4 only |
| **AI Fallback** | OpenAI GPT-4/3.5 | Reliability, Market standard | Google Gemini |
| **Auth** | NextAuth.js v5 | Next.js native, Multiple providers | Auth0, Clerk, Firebase |
| **Deployment** | Vercel + Fly.io | Edge functions, Auto-scaling containers | AWS, Railway |
| **Monorepo** | pnpm + Turbo | Fast installs, Workspace protocol, Caching | Yarn, Nx, Lerna |

#### 2.2.2 Mimari Kararlar

| Karar | Açıklama | Gerekçe |
|-------|----------|---------|
| **Monorepo** | Tek repo, çoklu paket | Kod paylaşımı, Tutarlı versiyonlama |
| **API Routes** | Next.js internal API | Basitlik, Aynı deployment, Type sharing |
| **Multi-Provider AI** | Claude + OpenAI | Reliability, Fallback chain |
| **Schema Isolation** | Per-user database isolation | Multi-tenant güvenlik |
| **Serverless Cache** | Upstash Redis | Edge compatibility, Scale to zero |
| **Component Library** | Internal @btrme/ui | Tutarlılık, Reusability |

#### 2.2.3 Trade-off Analizi

| Trade-off | Avantaj | Dezavantaj | Karar |
|-----------|---------|------------|-------|
| Next.js API vs Separate Backend | Basitlik, Type safety | Monolith riski | Accept (MVP için) |
| Serverless vs Server | Auto-scale, Cost | Cold start | Accept |
| Multi-AI Provider | Reliability | Complexity | Accept (kritik) |
| Monorepo | Code sharing | Build complexity | Accept (Turbo ile) |

---

## 3. Detaylı Tasarım

### 3.1 Bileşen Tanımları

#### 3.1.1 AI Services Layer

##### GenerationService

```typescript
// lib/ai/generation-service.ts

/**
 * Ana kod üretim servisi
 *
 * Sorumluluklar:
 * - AI model seçimi koordinasyonu
 * - Fallback mekanizması yönetimi
 * - Provider routing (OpenAI/Anthropic)
 *
 * Bağımlılıklar:
 * - OpenAIService
 * - AnthropicService
 * - ModelRouter
 */
export class GenerationService {
  private openai: OpenAIService
  private anthropic: AnthropicService
  private router: ModelRouter

  constructor()

  /**
   * Kod üretimi ana metodu
   * @param request - GenerationRequest (prompt, projectId, complexity, model)
   * @returns GenerationResponse (id, code, model, tokensUsed, cost, executionTime)
   * @throws Error - Tüm modeller başarısız olursa
   */
  async generate(request: GenerationRequest): Promise<GenerationResponse>

  /**
   * Belirli model ile üretim
   * @private
   */
  private async generateWithModel(
    request: GenerationRequest,
    model: AIModel
  ): Promise<GenerationResponse>

  /**
   * OpenAI model kontrolü
   * @private
   */
  private isOpenAIModel(model: AIModel): boolean
}
```

**Sequence Diagram - Generation Flow:**

```
┌──────┐     ┌────────────┐     ┌───────────┐     ┌────────────┐     ┌────────────┐
│Client│     │GenerationSvc│    │ModelRouter│     │OpenAIService│    │AnthropicSvc│
└──┬───┘     └─────┬──────┘     └─────┬─────┘     └──────┬─────┘     └──────┬─────┘
   │               │                  │                  │                  │
   │ generate(req) │                  │                  │                  │
   │──────────────>│                  │                  │                  │
   │               │                  │                  │                  │
   │               │ selectModel(req) │                  │                  │
   │               │─────────────────>│                  │                  │
   │               │                  │                  │                  │
   │               │  GPT4_TURBO      │                  │                  │
   │               │<─────────────────│                  │                  │
   │               │                  │                  │                  │
   │               │ getFallbackChain │                  │                  │
   │               │─────────────────>│                  │                  │
   │               │                  │                  │                  │
   │               │ [GPT4, CLAUDE]   │                  │                  │
   │               │<─────────────────│                  │                  │
   │               │                  │                  │                  │
   │               │                  generate(req)      │                  │
   │               │─────────────────────────────────────>│                  │
   │               │                  │                  │                  │
   │               │                  │     [SUCCESS]    │                  │
   │               │<─────────────────────────────────────│                  │
   │               │                  │                  │                  │
   │   response    │                  │                  │                  │
   │<──────────────│                  │                  │                  │
   │               │                  │                  │                  │
```

**Fallback Flow (Primary Fails):**

```
┌──────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│Client│     │GenerationSvc│    │OpenAIService│    │AnthropicSvc│
└──┬───┘     └─────┬──────┘     └──────┬─────┘     └──────┬─────┘
   │               │                   │                  │
   │ generate(req) │                   │                  │
   │──────────────>│                   │                  │
   │               │                   │                  │
   │               │ generate(GPT4_T)  │                  │
   │               │──────────────────>│                  │
   │               │                   │                  │
   │               │    [ERROR]        │                  │
   │               │<──────────────────│                  │
   │               │                   │                  │
   │               │ log: "Trying fallback: GPT4"         │
   │               │                   │                  │
   │               │ generate(GPT4)    │                  │
   │               │──────────────────>│                  │
   │               │                   │                  │
   │               │    [ERROR]        │                  │
   │               │<──────────────────│                  │
   │               │                   │                  │
   │               │ log: "Trying fallback: CLAUDE_SONNET"│
   │               │                   │                  │
   │               │        generate(CLAUDE_SONNET)       │
   │               │─────────────────────────────────────>│
   │               │                   │                  │
   │               │                   │    [SUCCESS]     │
   │               │<─────────────────────────────────────│
   │               │                   │                  │
   │   response    │                   │                  │
   │<──────────────│                   │                  │
```

##### ModelRouter

```typescript
// lib/ai/model-router.ts

/**
 * AI Model seçim ve fallback yöneticisi
 *
 * Sorumluluklar:
 * - Complexity-based model seçimi
 * - Fallback chain tanımlama
 * - Prompt analizi
 */
export class ModelRouter {
  /**
   * Request'e göre optimal model seçimi
   * @param request - GenerationRequest
   * @returns Seçilen AIModel
   */
  selectModel(request: GenerationRequest): AIModel

  /**
   * Prompt kompleksitesini analiz eder
   * @private
   * @param prompt - Kullanıcı prompt'u
   * @returns TaskComplexity (SIMPLE | STANDARD | COMPLEX | EXPERT)
   */
  private analyzeComplexity(prompt: string): TaskComplexity

  /**
   * Fallback model zinciri döndürür
   * @param model - Primary model
   * @returns Fallback model listesi
   */
  getFallbackChain(model: AIModel): AIModel[]
}
```

**Model Selection Matrix:**

| Complexity | Primary Model | Fallback 1 | Fallback 2 |
|------------|--------------|------------|------------|
| SIMPLE | GPT-3.5 Turbo | Claude Haiku | GPT-4 Turbo |
| STANDARD | Claude Haiku | GPT-3.5 Turbo | Claude Sonnet |
| COMPLEX | GPT-4 Turbo | GPT-4 | Claude Sonnet |
| EXPERT | Claude Opus | Claude Sonnet | GPT-4 |

**Complexity Analysis Keywords:**

```typescript
const complexityKeywords = {
  EXPERT: ['architecture', 'system design', 'scalable', 'microservices', 'distributed'],
  COMPLEX: ['authentication', 'database', 'api', 'integration', 'backend'],
  STANDARD: ['component', 'function', 'utility', 'helper', 'interface'],
  SIMPLE: [] // Default for short prompts
}

// Thresholds
if (prompt.length > 1000 || hasExpertKeywords) return EXPERT
if (prompt.length > 500 || hasComplexKeywords) return COMPLEX
if (prompt.length > 200 || hasStandardKeywords) return STANDARD
return SIMPLE
```

##### OpenAIService

```typescript
// lib/ai/openai-service.ts

/**
 * OpenAI API entegrasyonu
 *
 * Desteklenen Modeller:
 * - gpt-4-turbo-preview
 * - gpt-4
 * - gpt-3.5-turbo
 */
export class OpenAIService {
  private client: OpenAI

  constructor() // apiKey, timeout: 60s, maxRetries: 3

  async generate(request: GenerationRequest): Promise<GenerationResponse>

  private getModelName(model: AIModel): string
  private calculateCost(model: string, tokens: number): number
}
```

**OpenAI Cost Matrix:**

| Model | Input (per 1K) | Output (per 1K) |
|-------|---------------|-----------------|
| gpt-4-turbo-preview | $0.01 | $0.03 |
| gpt-4 | $0.03 | $0.06 |
| gpt-3.5-turbo | $0.0005 | $0.0015 |

##### AnthropicService

```typescript
// lib/ai/anthropic-service.ts

/**
 * Anthropic Claude API entegrasyonu
 *
 * Desteklenen Modeller:
 * - claude-3-opus-20240229
 * - claude-3-sonnet-20240229
 * - claude-3-haiku-20240307
 */
export class AnthropicService {
  private client: Anthropic

  constructor() // apiKey, timeout: 60s, maxRetries: 3

  async generate(request: GenerationRequest): Promise<GenerationResponse>

  private getModelName(model: AIModel): string
  private calculateCost(model: string, usage: TokenUsage): number
}
```

**Anthropic Cost Matrix:**

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| claude-3-opus | $15 | $75 |
| claude-3-sonnet | $3 | $15 |
| claude-3-haiku | $0.25 | $1.25 |

#### 3.1.2 API Layer

##### Generation API Route

```typescript
// app/api/generation/route.ts

/**
 * POST /api/generation
 *
 * Yeni kod üretimi başlatır
 *
 * Request Body:
 * {
 *   prompt: string (min 10 chars)
 *   projectId?: string
 *   complexity?: 'SIMPLE' | 'STANDARD' | 'COMPLEX' | 'EXPERT'
 *   model?: AIModel
 * }
 *
 * Response: Generation object
 *
 * Status Codes:
 * - 201: Created
 * - 400: Validation error
 * - 401: Unauthorized
 * - 500: Internal error
 */
export async function POST(request: NextRequest)

/**
 * GET /api/generation
 *
 * Kullanıcının generation geçmişini listeler
 *
 * Query Params:
 * - projectId?: string (filter by project)
 *
 * Response: Generation[] (max 50)
 */
export async function GET(request: NextRequest)
```

**Generation State Machine:**

```
                    ┌─────────────────────┐
                    │                     │
            ┌───────▼───────┐             │
            │    PENDING    │             │
            │               │             │
            └───────┬───────┘             │
                    │                     │
            API call to AI                │
                    │                     │
            ┌───────▼───────┐             │
            │  PROCESSING   │             │
            │               │             │
            └───────┬───────┘             │
                    │                     │
        ┌───────────┴───────────┐         │
        │                       │         │
   Success                    Error       │
        │                       │         │
┌───────▼───────┐       ┌───────▼───────┐ │
│   COMPLETED   │       │    FAILED     │ │
│               │       │               │ │
│  code: "..."  │       │ error: "..."  │ │
│  tokensUsed   │       │               │ │
│  cost         │       │               │ │
└───────────────┘       └───────────────┘ │
        │                       │         │
        └───────────────────────┴─────────┘
                                 Retry
```

##### Projects API Route

```typescript
// app/api/projects/route.ts

/**
 * POST /api/projects
 *
 * Yeni proje oluşturur
 *
 * Request: { name: string, description?: string }
 * Response: Project object
 */
export async function POST(request: NextRequest)

/**
 * GET /api/projects
 *
 * Kullanıcının projelerini listeler
 * Response: Project[] with generation counts
 */
export async function GET(request: NextRequest)

// app/api/projects/[id]/route.ts

/**
 * GET /api/projects/[id]
 * GET /api/projects/[id]
 * PUT /api/projects/[id]
 * DELETE /api/projects/[id]
 */
```

##### Templates API Route

```typescript
// app/api/templates/route.ts

/**
 * GET /api/templates
 *
 * Şablonları listeler (cached)
 *
 * Query Params:
 * - category?: string
 * - search?: string
 *
 * Cache: Redis, 5 minute TTL
 * Response: Template[] (max 50)
 */
export async function GET(request: NextRequest)
```

#### 3.1.3 Data Layer

##### Redis Cache Service

```typescript
// lib/cache/redis.ts

/**
 * Redis cache wrapper
 *
 * Provider: Upstash Redis (Serverless)
 * Prefix: 'btrme:'
 */
export class RedisCache {
  private redis: Redis
  private prefix: string = 'btrme:'

  constructor() // url, token from env

  async get<T>(key: string): Promise<T | null>
  async set(key: string, value: any, ttl?: number): Promise<boolean>
  async del(key: string): Promise<boolean>
  async invalidateByPrefix(prefix: string): Promise<number>
  async incr(key: string): Promise<number>
  async expire(key: string, seconds: number): Promise<boolean>
}

export const redis = new RedisCache()
```

**Cache Keys:**

| Key Pattern | TTL | Açıklama |
|-------------|-----|----------|
| `templates:all:` | 300s | Tüm şablonlar |
| `templates:{category}:` | 300s | Kategori bazlı |
| `templates:{category}:{search}` | 300s | Arama sonuçları |
| `ratelimit:{userId}` | 60s | Rate limiting |

### 3.2 Arayüz Tanımları

#### 3.2.1 TypeScript Interfaces

```typescript
// lib/ai/types.ts

export enum AIModel {
  GPT4_TURBO = 'GPT4_TURBO',
  GPT4 = 'GPT4',
  GPT35_TURBO = 'GPT35_TURBO',
  CLAUDE_OPUS = 'CLAUDE_OPUS',
  CLAUDE_SONNET = 'CLAUDE_SONNET',
  CLAUDE_HAIKU = 'CLAUDE_HAIKU',
}

export enum TaskComplexity {
  SIMPLE = 'SIMPLE',
  STANDARD = 'STANDARD',
  COMPLEX = 'COMPLEX',
  EXPERT = 'EXPERT',
}

export interface GenerationRequest {
  prompt: string              // Kullanıcı prompt'u (min 10 karakter)
  projectId?: string          // İlişkili proje ID
  complexity?: TaskComplexity // Manuel complexity belirtme
  model?: AIModel            // Manuel model seçimi
  temperature?: number        // 0-1 arası (default: 0.7)
  maxTokens?: number          // Max output token (default: 4000)
}

export interface GenerationResponse {
  id: string                  // Unique generation ID
  code: string               // Üretilen kod
  model: AIModel             // Kullanılan model
  tokensUsed: number         // Toplam token kullanımı
  cost: number               // Maliyet (USD)
  executionTime: number      // Süre (ms)
}

export interface AIServiceConfig {
  apiKey: string
  model: AIModel
  maxTokens: number
  temperature: number
  timeout: number
}
```

#### 3.2.2 API Request/Response Formats

**POST /api/generation**

```typescript
// Request
interface GenerationCreateRequest {
  prompt: string              // Required, min 10 chars
  projectId?: string
  complexity?: 'SIMPLE' | 'STANDARD' | 'COMPLEX' | 'EXPERT'
  model?: AIModel
}

// Response (201 Created)
interface GenerationCreateResponse {
  id: string
  projectId: string
  prompt: string
  code: string
  model: AIModel
  status: 'COMPLETED'
  tokensUsed: number
  cost: number
  createdAt: string
  updatedAt: string
  project: {
    id: string
    name: string
  }
}

// Error Response (400/401/500)
interface ErrorResponse {
  error: string
}
```

**POST /api/auth/signup**

```typescript
// Request
interface SignupRequest {
  name: string                // Required
  email: string               // Required, valid email
  password: string            // Required, min 6 chars
}

// Response (201 Created)
interface SignupResponse {
  user: {
    id: string
    name: string
    email: string
    // password excluded
  }
}
```

### 3.3 Veri Tasarımı

#### 3.3.1 Entity-Relationship Diyagramı

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │   Account   │       │   Session   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │       │ id (PK)     │
│ name        │  │    │ userId (FK) │◄──────│ userId (FK) │◄──┐
│ email (UQ)  │  │    │ type        │       │ sessionToken│   │
│ password    │  │    │ provider    │       │ expires     │   │
│ role        │  │    │ providerAccId│      └─────────────┘   │
│ createdAt   │  │    │ access_token│                         │
│ updatedAt   │  │    │ refresh_token│                        │
└─────────────┘  │    │ expires_at  │                         │
       │         │    └─────────────┘                         │
       │         │           ▲                                │
       │         └───────────┴────────────────────────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│   Project   │
├─────────────┤
│ id (PK)     │
│ name        │──┐
│ description │  │
│ userId (FK) │  │
│ createdAt   │  │
│ updatedAt   │  │
└─────────────┘  │
       │         │
       │ 1:N     │
       ▼         │
┌─────────────┐  │
│ Generation  │  │
├─────────────┤  │
│ id (PK)     │  │
│ projectId(FK)◄─┘
│ prompt      │
│ code        │
│ model       │
│ status      │
│ error       │
│ tokensUsed  │
│ cost        │
│ createdAt   │
│ updatedAt   │
└─────────────┘


┌─────────────────────┐
│     Template        │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ description         │
│ code                │
│ category            │
│ tags[]              │
│ usageCount          │
│ published           │
│ createdAt           │
│ updatedAt           │
└─────────────────────┘

┌─────────────────────┐
│ VerificationToken   │
├─────────────────────┤
│ identifier          │
│ token (UQ)          │
│ expires             │
└─────────────────────┘
```

#### 3.3.2 Prisma Schema Detayları

```prisma
// prisma/schema.prisma

// Enums
enum UserRole {
  USER
  ADMIN
}

enum AIModel {
  GPT4_TURBO
  GPT4
  GPT35_TURBO
  CLAUDE_OPUS
  CLAUDE_SONNET
  CLAUDE_HAIKU
}

enum GenerationStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

// Models
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?   // bcrypt hashed
  role          UserRole  @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]
  projects Project[]

  @@index([email])
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  generations Generation[]

  @@index([userId])
  @@index([createdAt])
}

model Generation {
  id          String           @id @default(cuid())
  projectId   String
  prompt      String           @db.Text
  code        String?          @db.Text
  model       AIModel
  status      GenerationStatus @default(PENDING)
  error       String?          @db.Text
  tokensUsed  Int?
  cost        Float?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([status])
  @@index([createdAt])
}

model Template {
  id          String   @id @default(cuid())
  name        String
  description String
  code        String   @db.Text
  category    String
  tags        String[]
  usageCount  Int      @default(0)
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@index([published])
  @@index([usageCount])
  @@map("templates")
}
```

#### 3.3.3 Index Stratejisi

| Tablo | Index | Tip | Gerekçe |
|-------|-------|-----|---------|
| User | email | Unique | Login lookup |
| Project | userId | B-tree | User projects query |
| Project | createdAt | B-tree | Sorting |
| Generation | projectId | B-tree | Project generations |
| Generation | status | B-tree | Status filtering |
| Generation | createdAt | B-tree | Timeline sorting |
| Template | category | B-tree | Category filtering |
| Template | published | B-tree | Published filter |
| Template | usageCount | B-tree | Popularity sorting |

### 3.4 Algoritma Tasarımı

#### 3.4.1 Model Selection Algorithm

```
ALGORITHM: SelectOptimalModel
INPUT: GenerationRequest (prompt, complexity?, model?)
OUTPUT: AIModel

BEGIN
  // 1. Explicit model override
  IF request.model IS NOT NULL THEN
    RETURN request.model
  END IF

  // 2. Get complexity (explicit or analyzed)
  complexity = request.complexity
  IF complexity IS NULL THEN
    complexity = AnalyzePromptComplexity(request.prompt)
  END IF

  // 3. Map complexity to model
  SWITCH complexity:
    CASE SIMPLE:
      RETURN GPT35_TURBO    // Fastest, cheapest
    CASE STANDARD:
      RETURN CLAUDE_HAIKU   // Balanced
    CASE COMPLEX:
      RETURN GPT4_TURBO     // Strong reasoning
    CASE EXPERT:
      RETURN CLAUDE_OPUS    // Most capable
    DEFAULT:
      RETURN GPT4_TURBO
  END SWITCH
END
```

#### 3.4.2 Complexity Analysis Algorithm

```
ALGORITHM: AnalyzePromptComplexity
INPUT: prompt (string)
OUTPUT: TaskComplexity

BEGIN
  length = LENGTH(prompt)
  lowerPrompt = LOWERCASE(prompt)

  // Keyword lists
  expertKeywords = ['architecture', 'system design', 'scalable',
                    'microservices', 'distributed']
  complexKeywords = ['authentication', 'database', 'api',
                     'integration', 'backend']
  standardKeywords = ['component', 'function', 'utility',
                      'helper', 'interface']

  // Check for expert indicators
  hasExpertKeywords = ANY keyword IN expertKeywords
                      WHERE keyword IN lowerPrompt
  hasComplexKeywords = ANY keyword IN complexKeywords
                       WHERE keyword IN lowerPrompt
  hasStandardKeywords = ANY keyword IN standardKeywords
                        WHERE keyword IN lowerPrompt

  // Determine complexity
  IF hasExpertKeywords OR length > 1000 THEN
    RETURN EXPERT
  ELSE IF hasComplexKeywords OR length > 500 THEN
    RETURN COMPLEX
  ELSE IF hasStandardKeywords OR length > 200 THEN
    RETURN STANDARD
  ELSE
    RETURN SIMPLE
  END IF
END
```

#### 3.4.3 Fallback Chain Algorithm

```
ALGORITHM: ExecuteWithFallback
INPUT: request, primaryModel, fallbackChain[]
OUTPUT: GenerationResponse
THROWS: AllModelsFailedError

BEGIN
  modelsToTry = [primaryModel] + fallbackChain
  lastError = NULL

  FOR EACH model IN modelsToTry DO
    TRY
      IF IsOpenAIModel(model) THEN
        response = OpenAIService.generate(request, model)
      ELSE
        response = AnthropicService.generate(request, model)
      END IF

      RETURN response

    CATCH error AS APIError
      LOG("Model {model} failed: {error.message}")
      lastError = error

      IF model != LAST(modelsToTry) THEN
        LOG("Trying fallback model: {NEXT(model)}")
      END IF

      CONTINUE
    END CATCH
  END FOR

  THROW AllModelsFailedError("All models failed. Please try again later.")
END
```

#### 3.4.4 Cache Strategy Algorithm

```
ALGORITHM: GetTemplatesWithCache
INPUT: category?, search?
OUTPUT: Template[]

BEGIN
  // 1. Build cache key
  cacheKey = "templates:" + (category OR "all") + ":" + (search OR "")

  // 2. Try cache first
  TRY
    cached = Redis.get(cacheKey)
    IF cached IS NOT NULL THEN
      RETURN cached
    END IF
  CATCH RedisError
    LOG("Cache error, falling back to DB")
  END CATCH

  // 3. Query database
  templates = Database.query(
    SELECT * FROM templates
    WHERE published = true
      AND (category = :category OR :category IS NULL)
      AND (name ILIKE :search OR :search IS NULL)
    ORDER BY usageCount DESC, createdAt DESC
    LIMIT 50
  )

  // 4. Cache result
  TRY
    Redis.set(cacheKey, templates, TTL=300) // 5 minutes
  CATCH RedisError
    LOG("Cache write error, continuing without cache")
  END CATCH

  RETURN templates
END
```

---

## 4. İzlenebilirlik

### 4.1 Gereksinim → Tasarım Matrisi

| SRS Gereksinimi | Tasarım Bileşeni | Dosya |
|-----------------|------------------|-------|
| FR-UM-001 (Kayıt) | Signup API Route | `api/auth/signup/route.ts` |
| FR-UM-002 (Giriş) | NextAuth Config | `auth.ts` |
| FR-AI-001 (Prompt kabul) | Generation API | `api/generation/route.ts` |
| FR-AI-002 (Prompt analiz) | ModelRouter | `lib/ai/model-router.ts` |
| FR-AI-003 (Model seçimi) | ModelRouter.selectModel | `lib/ai/model-router.ts` |
| FR-AI-004 (Güvenlik) | Zod Validation | `api/generation/route.ts` |
| FR-AI-010 (Fallback) | GenerationService | `lib/ai/generation-service.ts` |
| FR-PM-001 (Proje oluştur) | Projects API POST | `api/projects/route.ts` |
| FR-PM-002 (Proje listele) | Projects API GET | `api/projects/route.ts` |
| FR-TM-001 (Şablon listele) | Templates API | `api/templates/route.ts` |

### 4.2 Bileşen → Test Matrisi

| Bileşen | Test Dosyası | Test Sayısı |
|---------|--------------|-------------|
| GenerationService | `generation-service.test.ts` | 35 |
| ModelRouter | `model-router.test.ts` | 5 |
| OpenAIService | `openai-service.test.ts` | 10 |
| AnthropicService | `anthropic-service.test.ts` | 12 |
| Signup API | `signup/route.test.ts` | 20 |
| Projects API | `projects/route.test.ts` | 14 |
| Generation API | `generation/route.test.ts` | 12 |
| Templates API | `templates/route.test.ts` | 18 |

---

## 5. Ek

### 5.1 Deployment Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                      Vercel                          │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│   │  │  Edge       │  │  Serverless │  │   Static    │  │   │
│   │  │  Functions  │  │  Functions  │  │   Assets    │  │   │
│   │  │  (Middleware)│  │  (API)      │  │  (CDN)      │  │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│   ┌───────────────────────┼───────────────────────────┐    │
│   │                       ▼                           │    │
│   │   ┌─────────────┐  ┌─────────────┐               │    │
│   │   │  Supabase   │  │   Upstash   │               │    │
│   │   │  PostgreSQL │  │   Redis     │               │    │
│   │   └─────────────┘  └─────────────┘               │    │
│   │         Data Layer                                │    │
│   └───────────────────────────────────────────────────┘    │
│                                                             │
│   ┌───────────────────────────────────────────────────┐    │
│   │                    Fly.io                          │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │    │
│   │  │  Generated  │  │  Generated  │  │  ...      │  │    │
│   │  │  App #1     │  │  App #2     │  │           │  │    │
│   │  │  (Docker)   │  │  (Docker)   │  │           │  │    │
│   │  └─────────────┘  └─────────────┘  └───────────┘  │    │
│   │         Generated Apps (*.btrme.app)              │    │
│   └───────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Güvenlik Tasarımı

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Network                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • HTTPS only (TLS 1.3)                             │   │
│  │  • DDoS protection (Vercel/Cloudflare)              │   │
│  │  • Rate limiting                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  Layer 2: Application     ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • NextAuth.js session management                    │   │
│  │  • JWT tokens (httpOnly cookies)                     │   │
│  │  • CSRF protection                                   │   │
│  │  • Input validation (Zod schemas)                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  Layer 3: Data            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • Password hashing (bcrypt, 12 rounds)              │   │
│  │  • User data isolation (Prisma filters)              │   │
│  │  • Sensitive data exclusion from responses           │   │
│  │  • Database connection encryption                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  Layer 4: Generated Code  ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • OWASP validation (XSS, Injection)                │   │
│  │  • Container isolation (Docker)                     │   │
│  │  • No eval(), no fs access                          │   │
│  │  • Dependency auditing                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/btrme"
DIRECT_URL="postgresql://user:pass@host:5432/btrme"

# Authentication
NEXTAUTH_URL="https://btrme.app"
NEXTAUTH_SECRET="your-secret-key"

# AI Services
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."

# Cache
REDIS_URL="https://..."
REDIS_TOKEN="..."

# Deployment
VERCEL_URL="https://btrme.app"
FLY_API_TOKEN="..."
```

---

## 6. Referanslar

1. IEEE 1016-2009 - Software Design Description Standard
2. Next.js 14 Documentation - https://nextjs.org/docs
3. Prisma Documentation - https://www.prisma.io/docs
4. Anthropic Claude API - https://docs.anthropic.com/
5. OpenAI API Documentation - https://platform.openai.com/docs
6. NextAuth.js v5 - https://authjs.dev/
7. Upstash Redis - https://upstash.com/docs
8. Tailwind CSS - https://tailwindcss.com/docs
9. shadcn/ui - https://ui.shadcn.com/

---

## Onay

| Rol | İsim | İmza | Tarih |
|-----|------|------|-------|
| Lead Architect | | | |
| Development Lead | | | |
| Technical Reviewer | | | |
| Project Manager | | | |

---

**Doküman Sonu**

*Bu doküman BTRMe projesi için hazırlanmıştır. Tüm hakları saklıdır.*
