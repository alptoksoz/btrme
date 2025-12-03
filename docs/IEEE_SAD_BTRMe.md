# TOBB ETÜ Ekonomi ve Teknoloji Üniversitesi
## BİL 495 / YAP 495
# System Architecture Document (SAD)
## BTRMe - AI-Powered NoCode Platform

**Referans:** IEEE 42010 / INCOSE SE Handbook 5th Ed.

---

## Doküman Kontrol Tablosu

| Alan | Değer |
|------|-------|
| Doküman Başlığı | System Architecture Document (SAD) |
| Doküman ID | BTRMe-SAD-001 |
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
2. [Sistem Bağlamı](#2-sistem-bağlamı)
3. [Mimari Görünümler](#3-mimari-görünümler)
   - 3.1 Mantıksal Görünüm (Logical View)
   - 3.2 Süreç Görünümü (Process View)
   - 3.3 Fiziksel Görünüm (Physical View)
   - 3.4 Geliştirme Görünümü (Development View)
4. [Tasarım Kararları](#4-tasarım-kararları)
5. [Uyumluluk ve Standartlar](#5-uyumluluk-ve-standartlar)
6. [Ek](#6-ek)
7. [Referanslar](#7-referanslar)

---

## 1. Giriş

### 1.1 Amaç

Bu doküman, BTRMe (AI-Powered NoCode Platform) sisteminin üst düzey mimarisini IEEE 42010 ve INCOSE SE Handbook 5th Edition standartlarına uygun olarak tanımlamaktadır. Doküman, sistem paydaşlarına mimarinin farklı perspektiflerden anlaşılmasını sağlamak için 4+1 Mimari Görünüm modelini kullanmaktadır.

### 1.2 Kapsam

**BTRMe**, doğal dil promptlarını tam fonksiyonel web uygulamalarına dönüştüren yapay zeka destekli bir NoCode platformudur.

**Sistem Yetenekleri:**
- Doğal dil ile uygulama tanımlama
- AI destekli otomatik kod üretimi (Claude, GPT-4)
- Güvenlik doğrulama ve kod validasyonu
- Otomatik deployment (`*.btrme.app`)
- Şablon marketplace
- Proje yönetimi

**Kapsam Sınırları:**
- Web uygulaması üretimi (React/Next.js)
- Cloud-native deployment
- Multi-tenant SaaS mimarisi

### 1.3 Paydaşlar ve Endişeleri

| Paydaş | Endişe | İlgili Görünüm |
|--------|--------|----------------|
| **Son Kullanıcılar** | Kullanılabilirlik, Performans | Mantıksal, Süreç |
| **Geliştiriciler** | Kod organizasyonu, Genişletilebilirlik | Geliştirme |
| **DevOps** | Deployment, Ölçeklenebilirlik | Fiziksel |
| **Güvenlik Ekibi** | Veri güvenliği, OWASP uyumu | Tüm görünümler |
| **Ürün Yöneticisi** | Özellik kapsamı, Time-to-market | Mantıksal |
| **Yatırımcılar** | Maliyet, Ölçeklenebilirlik | Fiziksel |

### 1.4 Referans Dokümanlar

| Doküman ID | Başlık |
|------------|--------|
| BTRMe-SRS-001 | Software Requirements Specification |
| BTRMe-SDD-001 | Software Design Description |
| BTRMe-STP-001 | Software Test Plan |
| BTRMe-PKE-001 | Proje Kısıt ve Etkiler Dokümanı |

---

## 2. Sistem Bağlamı

### 2.1 Sistem Sınırı ve Harici Arayüzler

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL CONTEXT                                    │
│                                                                                 │
│    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐ │
│    │   Users     │     │  Anthropic  │     │   OpenAI    │     │   Fly.io    │ │
│    │  (Browser)  │     │  Claude API │     │     API     │     │  (Deploy)   │ │
│    └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘ │
│           │                   │                   │                   │        │
│           │ HTTPS             │ HTTPS             │ HTTPS             │ HTTPS  │
│           │                   │                   │                   │        │
│    ┌──────┴───────────────────┴───────────────────┴───────────────────┴──────┐ │
│    │                                                                          │ │
│    │                    ╔════════════════════════════════╗                    │ │
│    │                    ║                                ║                    │ │
│    │                    ║         BTRMe SYSTEM           ║                    │ │
│    │                    ║                                ║                    │ │
│    │                    ║   ┌────────────────────────┐   ║                    │ │
│    │                    ║   │    Web Application     │   ║                    │ │
│    │                    ║   │    (Next.js 14)        │   ║                    │ │
│    │                    ║   └───────────┬────────────┘   ║                    │ │
│    │                    ║               │                ║                    │ │
│    │                    ║   ┌───────────┴────────────┐   ║                    │ │
│    │                    ║   │    AI Generation       │   ║                    │ │
│    │                    ║   │    Services            │   ║                    │ │
│    │                    ║   └───────────┬────────────┘   ║                    │ │
│    │                    ║               │                ║                    │ │
│    │                    ║   ┌───────────┴────────────┐   ║                    │ │
│    │                    ║   │    Data Layer          │   ║                    │ │
│    │                    ║   │  (PostgreSQL + Redis)  │   ║                    │ │
│    │                    ║   └────────────────────────┘   ║                    │ │
│    │                    ║                                ║                    │ │
│    │                    ╚════════════════════════════════╝                    │ │
│    │                                                                          │ │
│    └──────┬───────────────────┬───────────────────┬───────────────────┬──────┘ │
│           │                   │                   │                   │        │
│    ┌──────┴──────┐     ┌──────┴──────┐     ┌──────┴──────┐     ┌──────┴──────┐ │
│    │   Vercel    │     │  Supabase/  │     │   Upstash   │     │   GitHub    │ │
│    │  (Hosting)  │     │    Neon     │     │   Redis     │     │   (Code)    │ │
│    │             │     │  (Database) │     │   (Cache)   │     │             │ │
│    └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Harici Sistemler ve Arayüzler

| Harici Sistem | Arayüz Tipi | Protokol | Amaç |
|---------------|-------------|----------|------|
| **Anthropic Claude API** | REST API | HTTPS | AI kod üretimi (Primary) |
| **OpenAI API** | REST API | HTTPS | AI kod üretimi (Fallback) |
| **Fly.io** | REST API + Docker | HTTPS | Generated app deployment |
| **Vercel** | Git + API | HTTPS | Platform hosting |
| **Supabase/Neon** | PostgreSQL | TCP/SSL | Database |
| **Upstash** | Redis Protocol | HTTPS | Cache |
| **GitHub** | Git + API | HTTPS | Source control |

### 2.3 Context Diyagramı (C4 Level 0)

```
                                    ┌─────────────────┐
                                    │                 │
                    ┌──────────────►│   Anthropic     │
                    │               │   Claude API    │
                    │               │                 │
                    │               └─────────────────┘
                    │
                    │               ┌─────────────────┐
                    │               │                 │
                    ├──────────────►│   OpenAI API    │
                    │               │                 │
                    │               └─────────────────┘
                    │
┌─────────────┐     │               ┌─────────────────┐
│             │     │               │                 │
│    User     │◄────┼──────────────►│   BTRMe         │
│  (Browser)  │     │               │   Platform      │
│             │     │               │                 │
└─────────────┘     │               └────────┬────────┘
                    │                        │
                    │               ┌────────┴────────┐
                    │               │                 │
                    │               │  Generated      │
                    │               │  Applications   │
                    │               │  (*.btrme.app)  │
                    │               │                 │
                    │               └────────┬────────┘
                    │                        │
                    │               ┌────────┴────────┐
                    │               │                 │
                    └──────────────►│   Fly.io       │
                                    │   (Deployment)  │
                                    │                 │
                                    └─────────────────┘
```

### 2.4 Kullanıcı Akışı (User Journey)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           USER JOURNEY FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │  Visit  │───►│  Sign   │───►│ Create  │───►│ Enter   │───►│  View   │
    │ Landing │    │   Up    │    │ Project │    │ Prompt  │    │ Preview │
    └─────────┘    └─────────┘    └─────────┘    └─────────┘    └────┬────┘
                                                                     │
    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐         │
    │  Use    │◄───│  Share  │◄───│ Deploy  │◄───│Download │◄────────┘
    │   App   │    │   URL   │    │   App   │    │  Code   │
    └─────────┘    └─────────┘    └─────────┘    └─────────┘

    ─────────────────────────────────────────────────────────────────►
                              Time (~2 minutes)
```

---

## 3. Mimari Görünümler

### 3.1 Mantıksal Görünüm (Logical View)

Mantıksal görünüm, sistemin fonksiyonel yapısını ve ana bileşenler arasındaki ilişkileri gösterir.

#### 3.1.1 Üst Düzey Bileşen Diyagramı

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           LOGICAL ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         PRESENTATION LAYER                               │   │
│  │  ┌───────────────────────────────────────────────────────────────────┐  │   │
│  │  │                          Pages                                     │  │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │  │   │
│  │  │  │Landing  │ │Dashboard│ │Generate │ │Projects │ │Templates│     │  │   │
│  │  │  │  Page   │ │  Page   │ │  Page   │ │  Page   │ │  Page   │     │  │   │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘     │  │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                              │  │   │
│  │  │  │Settings │ │  Auth   │ │ Studio  │                              │  │   │
│  │  │  │  Page   │ │  Pages  │ │  Page   │                              │  │   │
│  │  │  └─────────┘ └─────────┘ └─────────┘                              │  │   │
│  │  └───────────────────────────────────────────────────────────────────┘  │   │
│  │                                    │                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────────┐  │   │
│  │  │                     Shared Components (@btrme/ui)                  │  │   │
│  │  │  Button │ Card │ Input │ Dialog │ Tabs │ Select │ Textarea │ ...  │  │   │
│  │  └───────────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│                                       ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           API LAYER                                      │   │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐  │   │
│  │  │  Auth API     │ │ Generation    │ │  Projects     │ │  Templates  │  │   │
│  │  │  /api/auth/*  │ │ API           │ │  API          │ │  API        │  │   │
│  │  │               │ │ /api/generation│ │ /api/projects │ │/api/templates│ │   │
│  │  │  • signup     │ │               │ │               │ │             │  │   │
│  │  │  • signin     │ │  • POST create│ │  • POST create│ │ • GET list  │  │   │
│  │  │  • session    │ │  • GET list   │ │  • GET list   │ │ • GET [id]  │  │   │
│  │  └───────────────┘ └───────────────┘ │  • GET [id]   │ │ • POST use  │  │   │
│  │                                      │  • PUT update │ └─────────────┘  │   │
│  │  ┌───────────────┐                   │  • DELETE     │                  │   │
│  │  │  Health API   │                   └───────────────┘                  │   │
│  │  │  /api/health  │                                                      │   │
│  │  │  /api/db-health                                                      │   │
│  │  │  /api/cache-health                                                   │   │
│  │  └───────────────┘                                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│                                       ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         SERVICE LAYER                                    │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │                   AI Generation Services                         │    │   │
│  │  │                                                                  │    │   │
│  │  │   ┌─────────────────┐                                           │    │   │
│  │  │   │ GenerationService│◄────────────────────────────┐            │    │   │
│  │  │   │   • generate()   │                             │            │    │   │
│  │  │   │   • fallback     │                             │            │    │   │
│  │  │   └────────┬─────────┘                             │            │    │   │
│  │  │            │                                       │            │    │   │
│  │  │            ▼                                       │            │    │   │
│  │  │   ┌─────────────────┐                              │            │    │   │
│  │  │   │   ModelRouter    │─────────────────────────────┘            │    │   │
│  │  │   │   • selectModel()│                                          │    │   │
│  │  │   │   • getFallback()│                                          │    │   │
│  │  │   │   • analyzeComp()│                                          │    │   │
│  │  │   └────────┬─────────┘                                          │    │   │
│  │  │            │                                                    │    │   │
│  │  │      ┌─────┴─────┐                                              │    │   │
│  │  │      ▼           ▼                                              │    │   │
│  │  │   ┌────────┐  ┌────────────┐                                    │    │   │
│  │  │   │OpenAI  │  │ Anthropic  │                                    │    │   │
│  │  │   │Service │  │  Service   │                                    │    │   │
│  │  │   │        │  │            │                                    │    │   │
│  │  │   │GPT-4   │  │ Claude     │                                    │    │   │
│  │  │   │GPT-3.5 │  │ Opus/Son/  │                                    │    │   │
│  │  │   │Turbo   │  │ Haiku      │                                    │    │   │
│  │  │   └────────┘  └────────────┘                                    │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                          │   │
│  │  ┌───────────────────────┐  ┌───────────────────────┐                   │   │
│  │  │   Authentication      │  │   Cache Service       │                   │   │
│  │  │   (NextAuth.js v5)    │  │   (Redis)             │                   │   │
│  │  │   • Credentials       │  │   • get/set/del       │                   │   │
│  │  │   • Session Mgmt      │  │   • invalidate        │                   │   │
│  │  │   • JWT               │  │   • TTL management    │                   │   │
│  │  └───────────────────────┘  └───────────────────────┘                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│                                       ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                          DATA LAYER                                      │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │                      Prisma ORM                                  │    │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────┐  │    │   │
│  │  │  │  User   │ │ Project │ │Generaton│ │Template │ │  Account  │  │    │   │
│  │  │  │  Model  │ │  Model  │ │  Model  │ │  Model  │ │  Model    │  │    │   │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────────┘  │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                          │                                               │   │
│  │                          ▼                                               │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │                    PostgreSQL Database                           │    │   │
│  │  │                    (Supabase / Neon)                             │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 3.1.2 Domain Model

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DOMAIN MODEL                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
    │      User       │         │     Project     │         │   Generation    │
    ├─────────────────┤         ├─────────────────┤         ├─────────────────┤
    │ id: string      │         │ id: string      │         │ id: string      │
    │ name: string    │ 1     N │ name: string    │ 1     N │ prompt: string  │
    │ email: string   │────────►│ description?    │────────►│ code?: string   │
    │ password?: str  │         │ userId: string  │         │ model: AIModel  │
    │ role: UserRole  │         │ createdAt: Date │         │ status: Status  │
    │ createdAt: Date │         │ updatedAt: Date │         │ tokensUsed?: int│
    └────────┬────────┘         └─────────────────┘         │ cost?: float    │
             │                                               │ error?: string  │
             │ 1                                             │ createdAt: Date │
             │                                               └─────────────────┘
             │ N
    ┌────────┴────────┐
    │    Account      │         ┌─────────────────┐
    ├─────────────────┤         │    Template     │
    │ id: string      │         ├─────────────────┤
    │ provider: str   │         │ id: string      │
    │ providerAccId   │         │ name: string    │
    │ access_token?   │         │ description: str│
    │ refresh_token?  │         │ code: string    │
    └─────────────────┘         │ category: string│
                                │ tags: string[]  │
                                │ usageCount: int │
                                │ published: bool │
                                └─────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │                            ENUMERATIONS                              │
    ├─────────────────────────────────────────────────────────────────────┤
    │                                                                      │
    │  UserRole           AIModel              GenerationStatus            │
    │  ─────────          ───────              ─────────────────           │
    │  • USER             • GPT4_TURBO         • PENDING                   │
    │  • ADMIN            • GPT4               • PROCESSING                │
    │                     • GPT35_TURBO        • COMPLETED                 │
    │  TaskComplexity     • CLAUDE_OPUS        • FAILED                    │
    │  ──────────────     • CLAUDE_SONNET                                  │
    │  • SIMPLE           • CLAUDE_HAIKU                                   │
    │  • STANDARD                                                          │
    │  • COMPLEX                                                           │
    │  • EXPERT                                                            │
    │                                                                      │
    └─────────────────────────────────────────────────────────────────────┘
```

#### 3.1.3 Fonksiyonel Decomposition

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        FUNCTIONAL DECOMPOSITION                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

BTRMe Platform
│
├── User Management
│   ├── Registration
│   │   ├── Email/Password signup
│   │   ├── Input validation (Zod)
│   │   └── Password hashing (bcrypt)
│   ├── Authentication
│   │   ├── Credentials login
│   │   ├── OAuth providers (future)
│   │   └── Session management
│   └── Profile Management
│       ├── View profile
│       ├── Update settings
│       └── Manage preferences
│
├── AI Code Generation
│   ├── Prompt Processing
│   │   ├── Input validation
│   │   ├── Complexity analysis
│   │   └── Intent detection
│   ├── Model Selection
│   │   ├── Complexity-based routing
│   │   ├── Explicit model selection
│   │   └── Fallback chain management
│   ├── Code Generation
│   │   ├── OpenAI integration
│   │   ├── Anthropic integration
│   │   └── Response parsing
│   └── Post-Processing
│       ├── Code validation
│       ├── Security scanning
│       └── Cost calculation
│
├── Project Management
│   ├── CRUD Operations
│   │   ├── Create project
│   │   ├── List projects
│   │   ├── Update project
│   │   └── Delete project
│   └── Generation History
│       ├── View generations
│       └── Filter by project
│
├── Template Marketplace
│   ├── Browse Templates
│   │   ├── Category filtering
│   │   ├── Search functionality
│   │   └── Cache management
│   └── Use Template
│       ├── One-click usage
│       └── Usage tracking
│
└── Deployment (Future)
    ├── Container Generation
    ├── Fly.io Deployment
    └── Health Monitoring
```

### 3.2 Süreç Görünümü (Process View)

Süreç görünümü, sistemin çalışma zamanı davranışını, eşzamanlılığı ve thread yapısını gösterir.

#### 3.2.1 Runtime Süreç Modeli

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           RUNTIME PROCESS MODEL                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              VERCEL EDGE NETWORK                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                         EDGE FUNCTIONS                                     │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │ │
│  │  │   Middleware    │  │   Static Gen    │  │   ISR Cache     │           │ │
│  │  │   (Auth Check)  │  │   (Pages)       │  │   (Templates)   │           │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                       │                                         │
│                                       ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                      SERVERLESS FUNCTIONS                                  │ │
│  │                                                                            │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │                    API Route Handlers                                │  │ │
│  │  │                                                                      │  │ │
│  │  │  Request ──► Auth Check ──► Validation ──► Business Logic ──► Response│ │ │
│  │  │                                │                                     │  │ │
│  │  │                                ▼                                     │  │ │
│  │  │                    ┌─────────────────────┐                           │  │ │
│  │  │                    │  Service Instances  │                           │  │ │
│  │  │                    │  (Per Request)      │                           │  │ │
│  │  │                    │  • GenerationService│                           │  │ │
│  │  │                    │  • ModelRouter      │                           │  │ │
│  │  │                    │  • OpenAIService    │                           │  │ │
│  │  │                    │  • AnthropicService │                           │  │ │
│  │  │                    └─────────────────────┘                           │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                            │ │
│  │  Characteristics:                                                          │ │
│  │  • Stateless execution                                                     │ │
│  │  • Auto-scaling (0 to N instances)                                         │ │
│  │  • Cold start: ~200-500ms                                                  │ │
│  │  • Max execution: 10s (hobby) / 60s (pro)                                  │ │
│  │  • Memory: 1024MB default                                                  │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL CONNECTIONS                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐            │
│  │   PostgreSQL     │   │   Redis Cache    │   │   AI APIs        │            │
│  │   Connection     │   │   Connection     │   │   Connection     │            │
│  │   Pool           │   │   Pool           │   │                  │            │
│  ├──────────────────┤   ├──────────────────┤   ├──────────────────┤            │
│  │ • Prisma Client  │   │ • Upstash HTTP   │   │ • HTTP Client    │            │
│  │ • Connection     │   │ • Serverless     │   │ • Timeout: 60s   │            │
│  │   Pooling        │   │ • Auto-reconnect │   │ • Retries: 3     │            │
│  │ • Max: 10 conn   │   │                  │   │                  │            │
│  └──────────────────┘   └──────────────────┘   └──────────────────┘            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 3.2.2 Request Flow - Code Generation

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    CODE GENERATION REQUEST FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

    Client                API Route              Service Layer           External
      │                      │                        │                     │
      │  POST /api/generation │                       │                     │
      │─────────────────────►│                        │                     │
      │                      │                        │                     │
      │                      │ 1. Auth Check          │                     │
      │                      │────────────────────────│                     │
      │                      │    (NextAuth.js)       │                     │
      │                      │◄───────────────────────│                     │
      │                      │                        │                     │
      │                      │ 2. Validate Input      │                     │
      │                      │    (Zod Schema)        │                     │
      │                      │                        │                     │
      │                      │ 3. Create Generation   │                     │
      │                      │    Record (PENDING)    │                     │
      │                      │───────────────────────►│                     │
      │                      │                        │──► PostgreSQL       │
      │                      │                        │◄──                  │
      │                      │                        │                     │
      │                      │ 4. Update Status       │                     │
      │                      │    (PROCESSING)        │                     │
      │                      │───────────────────────►│                     │
      │                      │                        │──► PostgreSQL       │
      │                      │                        │                     │
      │                      │ 5. Generate Code       │                     │
      │                      │───────────────────────►│                     │
      │                      │                        │                     │
      │                      │    5a. Select Model    │                     │
      │                      │    (ModelRouter)       │                     │
      │                      │                        │                     │
      │                      │    5b. Call AI API     │                     │
      │                      │                        │──────────────────► │
      │                      │                        │   Claude/GPT API   │
      │                      │                        │◄────────────────── │
      │                      │                        │                     │
      │                      │    5c. Parse Response  │                     │
      │                      │◄───────────────────────│                     │
      │                      │                        │                     │
      │                      │ 6. Update Record       │                     │
      │                      │    (COMPLETED)         │                     │
      │                      │───────────────────────►│                     │
      │                      │                        │──► PostgreSQL       │
      │                      │                        │                     │
      │  Response (201)      │                        │                     │
      │◄─────────────────────│                        │                     │
      │                      │                        │                     │

    Timeline: ~2-30 seconds (depending on AI model and complexity)
```

#### 3.2.3 State Diagram - Generation Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     GENERATION STATE MACHINE                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │                 │
                    ┌─────────│    PENDING      │
                    │         │                 │
                    │         └────────┬────────┘
                    │                  │
                    │         API call initiated
                    │                  │
                    │                  ▼
                    │         ┌─────────────────┐
                    │         │                 │
                    │         │   PROCESSING    │──────────────┐
                    │         │                 │              │
                    │         └────────┬────────┘              │
                    │                  │                       │
                    │        ┌─────────┴─────────┐             │
                    │        │                   │             │
                    │    Success              Error            │
                    │        │                   │             │
                    │        ▼                   ▼             │
                    │ ┌─────────────┐    ┌─────────────┐       │
                    │ │             │    │             │       │
                    │ │  COMPLETED  │    │   FAILED    │       │
                    │ │             │    │             │       │
                    │ │ code: "..." │    │ error: "..."|       │
                    │ │ tokensUsed  │    │             │       │
                    │ │ cost        │    └──────┬──────┘       │
                    │ └─────────────┘           │              │
                    │                           │              │
                    │                     Retry (manual)       │
                    │                           │              │
                    └───────────────────────────┴──────────────┘


    State Transitions:
    ──────────────────
    PENDING → PROCESSING     : When AI API call starts
    PROCESSING → COMPLETED   : When AI returns valid code
    PROCESSING → FAILED      : When AI call fails / validation fails
    FAILED → PENDING         : Manual retry (creates new generation)
```

#### 3.2.4 Fallback Chain Execution

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      FALLBACK CHAIN EXECUTION                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

    GenerationService              ModelRouter              AI Services
          │                            │                         │
          │  selectModel(request)      │                         │
          │───────────────────────────►│                         │
          │                            │                         │
          │  model = GPT4_TURBO        │                         │
          │◄───────────────────────────│                         │
          │                            │                         │
          │  getFallbackChain(GPT4_T)  │                         │
          │───────────────────────────►│                         │
          │                            │                         │
          │  [GPT4, CLAUDE_SONNET]     │                         │
          │◄───────────────────────────│                         │
          │                            │                         │
          │  Try Primary: GPT4_TURBO   │                         │
          │────────────────────────────────────────────────────►│
          │                            │                         │
          │  [ERROR: Rate Limited]     │                         │
          │◄────────────────────────────────────────────────────│
          │                            │                         │
          │  log("Primary failed")     │                         │
          │  Try Fallback 1: GPT4      │                         │
          │────────────────────────────────────────────────────►│
          │                            │                         │
          │  [ERROR: Timeout]          │                         │
          │◄────────────────────────────────────────────────────│
          │                            │                         │
          │  log("Fallback 1 failed")  │                         │
          │  Try Fallback 2: CLAUDE    │                         │
          │────────────────────────────────────────────────────►│
          │                            │                         │
          │  [SUCCESS: code]           │                         │
          │◄────────────────────────────────────────────────────│
          │                            │                         │
          │  return response           │                         │
          │                            │                         │


    Fallback Chains (Configured):
    ─────────────────────────────
    GPT4_TURBO    → [GPT4, CLAUDE_SONNET]
    GPT4          → [GPT4_TURBO, CLAUDE_SONNET]
    GPT35_TURBO   → [CLAUDE_HAIKU, GPT4_TURBO]
    CLAUDE_OPUS   → [CLAUDE_SONNET, GPT4]
    CLAUDE_SONNET → [CLAUDE_HAIKU, GPT4_TURBO]
    CLAUDE_HAIKU  → [GPT35_TURBO, CLAUDE_SONNET]
```

### 3.3 Fiziksel Görünüm (Physical View)

Fiziksel görünüm, sistemin donanım deployment'ını ve iletişim altyapısını gösterir.

#### 3.3.1 Deployment Diyagramı

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          PHYSICAL DEPLOYMENT                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                            │
│                                                                                 │
│     ┌─────────────┐           ┌─────────────┐           ┌─────────────┐        │
│     │   Users     │           │   Users     │           │   Users     │        │
│     │  (Turkey)   │           │  (Europe)   │           │   (USA)     │        │
│     └──────┬──────┘           └──────┬──────┘           └──────┬──────┘        │
│            │                         │                         │               │
│            └─────────────────────────┼─────────────────────────┘               │
│                                      │                                          │
│                                      ▼                                          │
│                         ┌────────────────────────┐                              │
│                         │      Cloudflare        │                              │
│                         │    (DNS + CDN + WAF)   │                              │
│                         │                        │                              │
│                         │  • DDoS Protection     │                              │
│                         │  • SSL Termination     │                              │
│                         │  • Edge Caching        │                              │
│                         └───────────┬────────────┘                              │
│                                     │                                           │
└─────────────────────────────────────┼───────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            VERCEL PLATFORM                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         EDGE NETWORK (Global)                            │   │
│  │                                                                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │   IST    │  │   AMS    │  │   FRA    │  │   IAD    │  │   SFO    │  │   │
│  │  │  Edge    │  │  Edge    │  │  Edge    │  │  Edge    │  │  Edge    │  │   │
│  │  │  Node    │  │  Node    │  │  Node    │  │  Node    │  │  Node    │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
│  │                                                                          │   │
│  │  Features: Static assets, Edge middleware, Geolocation routing          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      SERVERLESS COMPUTE (Regional)                       │   │
│  │                                                                          │   │
│  │  Region: iad1 (US East - Primary)                                        │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Lambda Functions                               │   │   │
│  │  │                                                                   │   │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │   │   │
│  │  │  │ /api/auth/* │  │/api/generate│  │/api/projects│               │   │   │
│  │  │  │             │  │             │  │             │               │   │   │
│  │  │  │ Memory: 1GB │  │ Memory: 1GB │  │ Memory: 1GB │               │   │   │
│  │  │  │ Timeout:10s │  │ Timeout:60s │  │ Timeout:10s │               │   │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘               │   │   │
│  │  │                                                                   │   │   │
│  │  │  ┌─────────────┐  ┌─────────────┐                                │   │   │
│  │  │  │/api/template│  │ /api/health │                                │   │   │
│  │  │  │             │  │             │                                │   │   │
│  │  │  │ Memory: 1GB │  │ Memory: 512M│                                │   │   │
│  │  │  │ Timeout:10s │  │ Timeout: 5s │                                │   │   │
│  │  │  └─────────────┘  └─────────────┘                                │   │   │
│  │  └──────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  Auto-scaling: 0 → 1000 concurrent executions                           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │                           │                           │
           ▼                           ▼                           ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│   SUPABASE / NEON   │   │     UPSTASH         │   │    ANTHROPIC /      │
│   (Database)        │   │     (Cache)         │   │    OPENAI           │
├─────────────────────┤   ├─────────────────────┤   ├─────────────────────┤
│                     │   │                     │   │                     │
│  PostgreSQL 15      │   │  Redis 7            │   │  Claude API         │
│                     │   │                     │   │  OpenAI API         │
│  Region: eu-west-1  │   │  Global (Edge)      │   │                     │
│  Storage: 8GB       │   │  Memory: 256MB      │   │  Rate Limits:       │
│  Connections: 60    │   │  Commands: 10K/day  │   │  • Claude: 4K RPM   │
│                     │   │                     │   │  • GPT-4: 10K RPM   │
│  Features:          │   │  Features:          │   │                     │
│  • Connection Pool  │   │  • REST API         │   │  Timeout: 60s       │
│  • Auto-backup      │   │  • Edge compatible  │   │  Retries: 3         │
│  • Point-in-time    │   │  • TTL support      │   │                     │
│    recovery         │   │                     │   │                     │
│                     │   │                     │   │                     │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                      FLY.IO (Generated Apps - Future)                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                         GENERATED APPS CLUSTER                             │ │
│  │                                                                            │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │ │
│  │  │  app-abc123     │  │  app-def456     │  │  app-ghi789     │            │ │
│  │  │  .btrme.app     │  │  .btrme.app     │  │  .btrme.app     │            │ │
│  │  │                 │  │                 │  │                 │            │ │
│  │  │  Docker: Node20 │  │  Docker: Node20 │  │  Docker: Node20 │            │ │
│  │  │  RAM: 256MB     │  │  RAM: 256MB     │  │  RAM: 256MB     │            │ │
│  │  │  CPU: shared    │  │  CPU: shared    │  │  CPU: shared    │            │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘            │ │
│  │                                                                            │ │
│  │  Features:                                                                 │ │
│  │  • Auto-suspend after 5 min idle (Free tier)                               │ │
│  │  • Wake on request (~2s cold start)                                        │ │
│  │  • Wildcard SSL (*.btrme.app)                                              │ │
│  │  • Regional deployment (closest to creator)                                │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 3.3.2 Network Topology

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           NETWORK TOPOLOGY                                       │
└─────────────────────────────────────────────────────────────────────────────────┘

                                    Internet
                                       │
                                       │ HTTPS (443)
                                       ▼
                          ┌────────────────────────┐
                          │      Cloudflare        │
                          │   (btrme.app DNS)      │
                          │                        │
                          │  A    → Vercel IP      │
                          │  AAAA → Vercel IPv6    │
                          │  *    → Wildcard       │
                          └───────────┬────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
           ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
           │   btrme.app  │  │*.btrme.app   │  │api.btrme.app │
           │   (Main)     │  │(Generated)   │  │  (Future)    │
           └──────┬───────┘  └──────┬───────┘  └──────────────┘
                  │                 │
                  │                 │
                  ▼                 ▼
           ┌──────────────┐  ┌──────────────┐
           │   Vercel     │  │   Fly.io     │
           │   Platform   │  │   Platform   │
           └──────┬───────┘  └──────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│PostgreSQL│ │  Redis   │ │  AI APIs │
│(TCP 5432)│ │(HTTPS)   │ │(HTTPS)   │
│  + SSL   │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘


    Protocol Summary:
    ─────────────────
    Client ←→ Cloudflare    : HTTPS (TLS 1.3)
    Cloudflare ←→ Vercel    : HTTPS
    Vercel ←→ PostgreSQL    : TCP + SSL
    Vercel ←→ Redis         : HTTPS (Upstash REST)
    Vercel ←→ AI APIs       : HTTPS
    Fly.io ←→ Clients       : HTTPS (TLS 1.3)
```

#### 3.3.3 Kaynak Tahsisi

| Bileşen | Kaynak | Spec | Maliyet (Aylık) |
|---------|--------|------|-----------------|
| **Vercel** | Compute | Serverless (auto) | $0-20 |
| **Vercel** | Bandwidth | 100GB | Included |
| **Supabase** | Database | 500MB, 2 CPU | $0-25 |
| **Upstash** | Redis | 256MB, 10K cmd/day | $0-10 |
| **Anthropic** | API | Pay-per-use | ~$50-200 |
| **OpenAI** | API | Pay-per-use | ~$20-100 |
| **Fly.io** | Containers | 256MB × N apps | ~$5-50 |
| **Cloudflare** | DNS + CDN | Free tier | $0 |
| **Total** | | | **~$75-405** |

### 3.4 Geliştirme Görünümü (Development View)

Geliştirme görünümü, kod organizasyonunu, modül yapısını ve build süreçlerini gösterir.

#### 3.4.1 Kod Organizasyonu

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          CODE ORGANIZATION                                       │
└─────────────────────────────────────────────────────────────────────────────────┘

btrme/                                    # Root (Monorepo)
├── .github/
│   └── workflows/
│       ├── ci.yml                        # CI Pipeline
│       ├── test.yml                      # Test Runner
│       └── deploy.yml                    # Deployment
│
├── apps/
│   └── web/                              # Main Web Application
│       ├── app/                          # Next.js App Router
│       │   ├── (auth)/                   # Auth Route Group
│       │   │   └── auth/
│       │   │       ├── signin/page.tsx
│       │   │       └── signup/page.tsx
│       │   ├── (dashboard)/              # Dashboard Route Group
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── generate/page.tsx
│       │   │   ├── studio/page.tsx
│       │   │   ├── projects/
│       │   │   │   ├── page.tsx
│       │   │   │   └── [id]/page.tsx
│       │   │   ├── templates/page.tsx
│       │   │   └── settings/page.tsx
│       │   ├── api/                      # API Routes
│       │   │   ├── auth/
│       │   │   │   ├── [...nextauth]/route.ts
│       │   │   │   └── signup/route.ts
│       │   │   ├── generation/route.ts
│       │   │   ├── projects/
│       │   │   │   ├── route.ts
│       │   │   │   └── [id]/route.ts
│       │   │   ├── templates/
│       │   │   │   ├── route.ts
│       │   │   │   └── [id]/
│       │   │   │       ├── route.ts
│       │   │   │       └── use/route.ts
│       │   │   └── health/route.ts
│       │   ├── layout.tsx                # Root Layout
│       │   ├── page.tsx                  # Landing Page
│       │   └── globals.css
│       │
│       ├── components/                   # App Components
│       │   ├── auth/
│       │   │   ├── signin-form.tsx
│       │   │   └── signup-form.tsx
│       │   └── layout/
│       │       ├── header.tsx
│       │       ├── footer.tsx
│       │       └── sidebar.tsx
│       │
│       ├── lib/                          # Core Libraries
│       │   ├── ai/
│       │   │   ├── generation-service.ts
│       │   │   ├── model-router.ts
│       │   │   ├── openai-service.ts
│       │   │   ├── anthropic-service.ts
│       │   │   └── types.ts
│       │   ├── cache/
│       │   │   └── redis.ts
│       │   ├── prisma.ts
│       │   └── utils.ts
│       │
│       ├── prisma/
│       │   ├── schema.prisma             # Database Schema
│       │   └── migrations/               # Migration Files
│       │
│       ├── __tests__/                    # Test Files
│       │   ├── app/api/                  # API Tests
│       │   ├── lib/                      # Unit Tests
│       │   └── e2e/                      # E2E Tests
│       │
│       ├── public/                       # Static Assets
│       ├── auth.ts                       # NextAuth Config
│       ├── middleware.ts                 # Edge Middleware
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── ui/                               # Shared UI Library
│       ├── src/
│       │   ├── button.tsx
│       │   ├── card.tsx
│       │   ├── input.tsx
│       │   ├── textarea.tsx
│       │   ├── select.tsx
│       │   ├── dialog.tsx
│       │   ├── tabs.tsx
│       │   └── index.ts                  # Exports
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                                 # Documentation
│   ├── IEEE_SRS_BTRMe.md
│   ├── IEEE_SDD_BTRMe.md
│   ├── IEEE_STP_BTRMe.md
│   ├── IEEE_SAD_BTRMe.md
│   └── PKE_BTRMe.md
│
├── package.json                          # Root Package
├── pnpm-workspace.yaml                   # Workspace Config
├── turbo.json                            # Turbo Config
├── .eslintrc.js                          # ESLint Config
├── .prettierrc                           # Prettier Config
└── README.md
```

#### 3.4.2 Paket Bağımlılıkları

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        PACKAGE DEPENDENCIES                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   apps/web      │
                              │   (Next.js)     │
                              └────────┬────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
              ▼                        ▼                        ▼
    ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
    │  @btrme/ui      │      │  External NPM   │      │  Dev Dependencies│
    │  (Internal)     │      │  Packages       │      │                 │
    └─────────────────┘      └────────┬────────┘      └─────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Framework     │         │   AI/Data       │         │   UI/Styling    │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ next: 14.x      │         │ @anthropic-ai/  │         │ tailwindcss     │
│ react: 18.x     │         │   sdk           │         │ @radix-ui/*     │
│ next-auth: 5.x  │         │ openai          │         │ lucide-react    │
│                 │         │ @prisma/client  │         │ class-variance- │
│                 │         │ @upstash/redis  │         │   authority     │
│                 │         │ zod             │         │ clsx            │
└─────────────────┘         └─────────────────┘         └─────────────────┘


    Dependency Tree (Simplified):
    ─────────────────────────────
    apps/web
    ├── @btrme/ui (workspace:*)
    ├── next (14.x)
    ├── react (18.x)
    ├── @anthropic-ai/sdk
    ├── openai
    ├── @prisma/client
    ├── next-auth (5.x)
    ├── @upstash/redis
    ├── zod
    ├── tailwindcss
    └── typescript

    packages/ui
    ├── react (peer)
    ├── @radix-ui/react-*
    ├── class-variance-authority
    └── tailwindcss (peer)
```

#### 3.4.3 Build Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BUILD PIPELINE                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

    Git Push
       │
       ▼
┌─────────────────┐
│   GitHub        │
│   Repository    │
└────────┬────────┘
         │
         │ Webhook
         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          GITHUB ACTIONS                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         CI WORKFLOW                                      │   │
│  │                                                                          │   │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐          │   │
│  │  │  Lint    │───►│  Type    │───►│  Unit    │───►│  Build   │          │   │
│  │  │  Check   │    │  Check   │    │  Tests   │    │  Check   │          │   │
│  │  │          │    │          │    │          │    │          │          │   │
│  │  │ eslint   │    │   tsc    │    │  vitest  │    │next build│          │   │
│  │  └──────────┘    └──────────┘    └──────────┘    └──────────┘          │   │
│  │       │               │               │               │                 │   │
│  │       └───────────────┴───────────────┴───────────────┘                 │   │
│  │                              │                                          │   │
│  │                              ▼                                          │   │
│  │                    ┌──────────────────┐                                 │   │
│  │                    │   All Passed?    │                                 │   │
│  │                    └────────┬─────────┘                                 │   │
│  │                             │                                           │   │
│  │              ┌──────────────┴──────────────┐                            │   │
│  │              │                             │                            │   │
│  │           Yes │                          No │                           │   │
│  │              ▼                             ▼                            │   │
│  │     ┌──────────────┐              ┌──────────────┐                     │   │
│  │     │   Deploy     │              │   Block      │                     │   │
│  │     │   Trigger    │              │   Merge      │                     │   │
│  │     └──────────────┘              └──────────────┘                     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │
                                       │ On main branch
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            VERCEL DEPLOYMENT                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│  │  Clone   │───►│  Install │───►│  Build   │───►│  Deploy  │                  │
│  │          │    │  Deps    │    │          │    │          │                  │
│  │  git     │    │  pnpm    │    │  turbo   │    │  edge    │                  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘                  │
│                                                                                 │
│  Build Output:                                                                  │
│  • Static pages (SSG)                                                           │
│  • Serverless functions                                                         │
│  • Edge functions                                                               │
│  • Static assets → CDN                                                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘


    Turbo Build Graph:
    ──────────────────
    @btrme/ui:build ──► apps/web:build ──► apps/web:deploy
                   │
                   └──► (cached if unchanged)
```

#### 3.4.4 Versiyon Kontrol Stratejisi

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       GIT BRANCHING STRATEGY                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

    main (production)
    ────────●────────●────────●────────●────────●────────►
            │        ▲        │        ▲        │
            │        │        │        │        │
            │   merge│        │   merge│        │
            │        │        │        │        │
    develop │        │        │        │        │
    ────────●────●───●────●───●────●───●────●───●────────►
            │    ▲        ▲        ▲        ▲
            │    │        │        │        │
            │    │merge   │merge   │merge   │merge
            │    │        │        │        │
    feature │    │        │        │        │
    ────────●────●        │        │        │
            feat-1        │        │        │
                          │        │        │
    feature               │        │        │
    ──────────────────────●        │        │
                        feat-2     │        │
                                   │        │
    bugfix                         │        │
    ───────────────────────────────●        │
                                 fix-1      │
                                            │
    hotfix                                  │
    ────────────────────────────────────────●
                                         hotfix-1


    Branch Naming Convention:
    ─────────────────────────
    feature/ABC-123-description    # New features
    bugfix/ABC-456-description     # Bug fixes
    hotfix/ABC-789-description     # Production hotfixes
    chore/update-dependencies      # Maintenance
    docs/update-readme             # Documentation

    Commit Message Format (Conventional Commits):
    ─────────────────────────────────────────────
    feat: add code generation API
    fix: resolve authentication timeout
    docs: update API documentation
    chore: upgrade dependencies
    test: add unit tests for ModelRouter
    refactor: simplify fallback logic
```

---

## 4. Tasarım Kararları

### 4.1 Kritik Mimari Kararlar

| ID | Karar | Gerekçe | Trade-offs | Alternatifler |
|----|-------|---------|------------|---------------|
| AD-001 | **Next.js 14 App Router** | SSR/SSG, API Routes, Vercel entegrasyonu, React Server Components | Learning curve, Beta features | Pages Router, Remix |
| AD-002 | **Monorepo (pnpm + Turbo)** | Kod paylaşımı, Tutarlı versiyonlama, Build caching | Complexity, Initial setup | Polyrepo, Nx |
| AD-003 | **Multi-AI Provider** | Reliability, Fallback capability, Cost optimization | Integration complexity | Single provider |
| AD-004 | **Serverless Architecture** | Auto-scaling, Cost efficiency, No server management | Cold starts, Execution limits | Traditional servers |
| AD-005 | **PostgreSQL + Prisma** | Type-safe ORM, Migrations, Relations support | ORM overhead | Raw SQL, Drizzle |
| AD-006 | **Upstash Redis** | Serverless, Edge compatible, REST API | Limited features vs full Redis | ElastiCache, Momento |
| AD-007 | **NextAuth.js v5** | Native Next.js integration, Multiple providers | Beta status | Auth0, Clerk |
| AD-008 | **Tailwind + shadcn/ui** | Utility-first, Accessible components, Customizable | Class verbosity | MUI, Chakra |

### 4.2 Karar Detayları

#### AD-001: Next.js 14 App Router

```
Problem:  Modern, performant web framework seçimi
Context:  React tabanlı, SSR/SSG destekli, API routes gerekli
Decision: Next.js 14 with App Router

Rationale:
+ React Server Components ile performans
+ Built-in API routes (ayrı backend gereksiz)
+ Vercel ile native entegrasyon
+ Streaming ve Suspense desteği
+ TypeScript first-class support

Trade-offs:
- Yeni paradigma (learning curve)
- Bazı özellikler beta
- Vendor lock-in (Vercel optimizations)

Alternatives Considered:
- Pages Router: Daha stabil ama eski
- Remix: İyi ama daha az ecosystem
- SvelteKit: Farklı paradigma
```

#### AD-003: Multi-AI Provider Strategy

```
Problem:  AI API reliability ve cost optimization
Context:  Tek provider outage riski, farklı modellerin güçlü yönleri
Decision: Claude (primary) + OpenAI (fallback) with dynamic routing

Rationale:
+ Claude: En iyi kod kalitesi
+ OpenAI: Yaygın, güvenilir fallback
+ Complexity-based routing: Cost optimization
+ Automatic failover: High availability

Trade-offs:
- Integration complexity
- Multiple API keys/accounts
- Consistent prompting challenge

Implementation:
- ModelRouter: Complexity analysis + model selection
- GenerationService: Orchestration + fallback chain
- Per-provider services: OpenAIService, AnthropicService
```

---

## 5. Uyumluluk ve Standartlar

### 5.1 Uygulanan Standartlar

| Standart | Kapsam | Uygulama |
|----------|--------|----------|
| **IEEE 42010:2022** | Mimari tanımlama | SAD dokümanı formatı |
| **IEEE 12207:2017** | Yazılım yaşam döngüsü | Development process |
| **ISO/IEC 25010:2011** | Kalite modeli | Quality attributes |
| **OWASP Top 10 2021** | Web güvenliği | Security controls |
| **WCAG 2.1 AA** | Erişilebilirlik | UI components |
| **GDPR / KVKK** | Veri koruma | Privacy by design |

### 5.2 Güvenlik Standartları Uygulaması

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY COMPLIANCE MATRIX                                │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┬─────────────────────────────────────────────────────────┐
│ OWASP Top 10       │ Uygulama                                                 │
├─────────────────────┼─────────────────────────────────────────────────────────┤
│ A01: Broken Access │ NextAuth.js sessions, API route auth checks              │
│     Control        │ User-scoped database queries                             │
├─────────────────────┼─────────────────────────────────────────────────────────┤
│ A02: Crypto        │ bcrypt (12 rounds), TLS 1.3, AES-256 at rest            │
│     Failures       │                                                          │
├─────────────────────┼─────────────────────────────────────────────────────────┤
│ A03: Injection     │ Prisma ORM (parameterized), Zod validation              │
│                    │ No raw SQL queries                                       │
├─────────────────────┼─────────────────────────────────────────────────────────┤
│ A04: Insecure      │ Not applicable (no user uploads in MVP)                  │
│     Design         │ Future: File validation planned                          │
├─────────────────────┼─────────────────────────────────────────────────────────┤
│ A05: Security      │ Environment variables, No secrets in code               │
│     Misconfig      │ Vercel secret management                                 │
├─────────────────────┼─────────────────────────────────────────────────────────┤
│ A06: Vulnerable    │ Dependabot alerts, npm audit                            │
│     Components     │ Regular dependency updates                               │
├─────────────────────┼─────────────────────────────────────────────────────────┤
│ A07: Auth          │ NextAuth.js with secure defaults                         │
│     Failures       │ httpOnly cookies, CSRF tokens                            │
├─────────────────────┼─────────────────────────────────────────────────────────┤
│ A08: Data          │ Input validation (Zod), Output encoding                  │
│     Integrity      │ React auto-escaping                                      │
├─────────────────────┼─────────────────────────────────────────────────────────┤
│ A09: Logging       │ Error logging (console), Sentry (planned)               │
│     Failures       │ No sensitive data in logs                                │
├─────────────────────┼─────────────────────────────────────────────────────────┤
│ A10: SSRF          │ No user-controlled URLs                                  │
│                    │ AI API calls to fixed endpoints                          │
└─────────────────────┴─────────────────────────────────────────────────────────┘
```

### 5.3 Kalite Nitelikleri Mapping

| Kalite Niteliği | Mimari Destek | Ölçüm |
|-----------------|---------------|-------|
| **Performans** | CDN, Edge caching, Serverless | P95 < 500ms |
| **Ölçeklenebilirlik** | Auto-scaling, Stateless design | 100+ concurrent |
| **Güvenilirlik** | Multi-provider AI, Health checks | 99.5% uptime |
| **Güvenlik** | Auth, Encryption, Input validation | 0 critical vulns |
| **Bakım Yapılabilirlik** | Monorepo, TypeScript, Tests | 80%+ coverage |
| **Taşınabilirlik** | Docker containers, Standard APIs | Multi-cloud ready |

---

## 6. Ek

### 6.1 Glossary

| Terim | Tanım |
|-------|-------|
| **App Router** | Next.js 14'ün yeni routing sistemi |
| **Edge Function** | CDN edge node'larında çalışan serverless fonksiyon |
| **Fallback Chain** | Primary AI model başarısız olunca kullanılacak alternatif modeller |
| **ISR** | Incremental Static Regeneration - build sonrası statik sayfa güncelleme |
| **Monorepo** | Birden fazla paketin tek repository'de yönetilmesi |
| **RSC** | React Server Components |
| **Serverless** | Sunucu yönetimi gerektirmeyen compute modeli |

### 6.2 Kısaltmalar

| Kısaltma | Açıklama |
|----------|----------|
| **CDN** | Content Delivery Network |
| **JWT** | JSON Web Token |
| **ORM** | Object-Relational Mapping |
| **P95** | 95th Percentile |
| **RPM** | Requests Per Minute |
| **SSG** | Static Site Generation |
| **SSR** | Server-Side Rendering |
| **WAF** | Web Application Firewall |

---

## 7. Referanslar

1. IEEE 42010:2022 - Systems and software engineering — Architecture description
2. INCOSE Systems Engineering Handbook, 5th Edition
3. Kruchten, P. (1995). The 4+1 View Model of Architecture
4. Next.js 14 Documentation - https://nextjs.org/docs
5. Vercel Architecture - https://vercel.com/docs/infrastructure
6. Fly.io Documentation - https://fly.io/docs
7. OWASP Top 10 2021 - https://owasp.org/Top10/
8. C4 Model - https://c4model.com/

---

## Onay

| Rol | İsim | İmza | Tarih |
|-----|------|------|-------|
| System Architect | | | |
| Technical Lead | | | |
| Security Lead | | | |
| Project Manager | | | |

---

**Doküman Sonu**

*Bu doküman BTRMe projesi için hazırlanmıştır. Tüm hakları saklıdır.*
