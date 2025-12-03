# TOBB ETÜ Ekonomi ve Teknoloji Üniversitesi
## BİL 495 / YAP 495
# Software Test Plan (STP)
## BTRMe - AI-Powered NoCode Platform

**Referans:** IEEE 829-2008 / ISO/IEC/IEEE 29119-3

---

## Doküman Kontrol Tablosu

| Alan | Değer |
|------|-------|
| Doküman Başlığı | Software Test Plan (STP) |
| Doküman ID | BTRMe-STP-001 |
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
   - 1.2 Referanslar
2. [Test Öğeleri](#2-test-öğeleri)
3. [Test Edilecek / Edilmeyecek Özellikler](#3-test-edilecek--edilmeyecek-özellikler)
4. [Test Yaklaşımı](#4-test-yaklaşımı)
5. [Başarı/Başarısızlık Kriterleri](#5-başarıbaşarısızlık-kriterleri)
6. [Test Çıktıları](#6-test-çıktıları)
7. [Zaman Çizelgesi ve Sorumluluklar](#7-zaman-çizelgesi-ve-sorumluluklar)
8. [Riskler ve Acil Durum Planları](#8-riskler-ve-acil-durum-planları)
9. [Ek](#9-ek)
10. [Referanslar](#10-referanslar)

---

## 1. Giriş

### 1.1 Amaç

Bu doküman, BTRMe (AI-Powered NoCode Platform) projesinin test stratejisini, test kapsamını, test seviyelerini ve test süreçlerini IEEE 829-2008 ve ISO/IEC/IEEE 29119-3 standartlarına uygun olarak tanımlamaktadır.

**Test Hedefleri:**

1. **Fonksiyonel Doğruluk:** Tüm kullanıcı hikayeleri ve gereksinimlerin doğru implementasyonu
2. **Güvenlik:** OWASP Top 10 uyumu ve güvenlik açıklarının tespiti
3. **Performans:** Tanımlanan performans metriklerinin karşılanması
4. **Güvenilirlik:** Sistem stabilitesi ve hata toleransı
5. **Kullanılabilirlik:** Kullanıcı deneyimi ve erişilebilirlik standartları

**Kapsam:**
- BTRMe web platformu (Next.js 14 frontend ve backend)
- AI kod üretim servisleri (Claude, OpenAI entegrasyonları)
- Veritabanı işlemleri (PostgreSQL, Prisma ORM)
- Cache ve queue sistemleri (Redis, BullMQ)
- API endpoint'leri
- Kullanıcı arayüzü bileşenleri

### 1.2 Referanslar

| Doküman | Açıklama |
|---------|----------|
| BTRMe-SRS-001 | Software Requirements Specification |
| BTRMe-PKE-001 | Proje Kısıt ve Etkiler Dokümanı |
| IEEE 829-2008 | Standard for Software Test Documentation |
| ISO/IEC/IEEE 29119-3 | Software Testing - Test Documentation |
| OWASP Testing Guide v4.2 | Web Application Security Testing |
| Vitest Documentation | Unit Testing Framework |
| Playwright Documentation | E2E Testing Framework |

---

## 2. Test Öğeleri

### 2.1 Modül ve Bileşen Listesi

Aşağıdaki modüller test kapsamındadır:

#### 2.1.1 AI Servisleri

| Modül | Dosya Yolu | Test Dosyası | Açıklama |
|-------|-----------|--------------|----------|
| GenerationService | `lib/ai/generation-service.ts` | `generation-service.test.ts` | Ana kod üretim servisi |
| AnthropicService | `lib/ai/anthropic-service.ts` | `anthropic-service.test.ts` | Claude API entegrasyonu |
| OpenAIService | `lib/ai/openai-service.ts` | `openai-service.test.ts` | OpenAI API entegrasyonu |
| ModelRouter | `lib/ai/model-router.ts` | `model-router.test.ts` | Model seçim ve fallback |

#### 2.1.2 API Route'ları

| Endpoint | Dosya Yolu | Test Dosyası | Açıklama |
|----------|-----------|--------------|----------|
| POST /api/auth/signup | `app/api/auth/signup/route.ts` | `signup/route.test.ts` | Kullanıcı kayıt |
| POST /api/generation | `app/api/generation/route.ts` | `generation/route.test.ts` | Kod üretimi |
| GET /api/generation | `app/api/generation/route.ts` | `generation/route.test.ts` | Üretim geçmişi |
| POST /api/projects | `app/api/projects/route.ts` | `projects/route.test.ts` | Proje oluşturma |
| GET /api/projects | `app/api/projects/route.ts` | `projects/route.test.ts` | Proje listeleme |
| GET /api/projects/[id] | `app/api/projects/[id]/route.ts` | `projects/[id]/route.test.ts` | Proje detayı |
| GET /api/templates | `app/api/templates/route.ts` | `templates/route.test.ts` | Şablon listeleme |

#### 2.1.3 Utility Fonksiyonları

| Modül | Dosya Yolu | Test Dosyası | Açıklama |
|-------|-----------|--------------|----------|
| Utils | `lib/utils.ts` | `utils.test.ts` | Yardımcı fonksiyonlar |

#### 2.1.4 E2E Akışları

| Akış | Test Dosyası | Açıklama |
|------|--------------|----------|
| Authentication | `e2e/auth.spec.ts` | Giriş/kayıt akışları |

### 2.2 Test Ortamları

| Ortam | Amaç | Teknoloji |
|-------|------|-----------|
| Unit Test | İzole birim testleri | Vitest + vi.mock |
| Integration Test | Bileşen entegrasyonu | Vitest + MSW |
| E2E Test | Kullanıcı senaryoları | Playwright |
| Performance Test | Yük ve stres testleri | k6 / Artillery |
| Security Test | Güvenlik taraması | OWASP ZAP |

---

## 3. Test Edilecek / Edilmeyecek Özellikler

### 3.1 Test Edilecek Özellikler

#### 3.1.1 Kimlik Doğrulama (Authentication)

| Test ID | Özellik | Öncelik | Test Seviyesi |
|---------|---------|---------|---------------|
| AUTH-001 | Email/şifre ile kayıt | Yüksek | Unit, E2E |
| AUTH-002 | Email/şifre ile giriş | Yüksek | Unit, E2E |
| AUTH-003 | Şifre hash güvenliği (bcrypt) | Yüksek | Unit |
| AUTH-004 | Session yönetimi | Yüksek | Integration |
| AUTH-005 | Yetkilendirme kontrolleri | Yüksek | Unit, Integration |
| AUTH-006 | Input validasyonu | Yüksek | Unit |
| AUTH-007 | Hata mesajları güvenliği | Orta | Unit |

**Mevcut Test Sayısı:** 20+ test case

**Örnek Test Senaryoları:**
```typescript
// signup/route.test.ts'den
- should create user successfully with valid data
- should return 400 when user already exists
- should return 400 when name is missing
- should return 400 when email is invalid
- should return 400 when password is too short
- should hash password with bcrypt salt rounds of 12
- should not return password in response
- should handle database errors
- should handle special characters in name and email
```

#### 3.1.2 AI Kod Üretimi (Generation)

| Test ID | Özellik | Öncelik | Test Seviyesi |
|---------|---------|---------|---------------|
| GEN-001 | Prompt analizi ve işleme | Yüksek | Unit |
| GEN-002 | Model seçimi (complexity-based) | Yüksek | Unit |
| GEN-003 | Fallback mekanizması | Yüksek | Unit |
| GEN-004 | OpenAI entegrasyonu | Yüksek | Unit, Integration |
| GEN-005 | Anthropic (Claude) entegrasyonu | Yüksek | Unit, Integration |
| GEN-006 | Token ve maliyet hesaplama | Orta | Unit |
| GEN-007 | Hata yönetimi ve logging | Orta | Unit |
| GEN-008 | Status geçişleri (PENDING→PROCESSING→COMPLETED) | Yüksek | Unit |

**Mevcut Test Sayısı:** 45+ test case

**Örnek Test Senaryoları:**
```typescript
// generation-service.test.ts'den
- should generate code successfully with selected model
- should use OpenAI service for OpenAI models
- should use Anthropic service for Claude models
- should try first fallback model when primary fails
- should try all fallback models in order
- should throw error when all models fail
- should switch from OpenAI to Anthropic in fallback chain
- should handle complexity parameter
- should fallback from Claude to OpenAI
```

```typescript
// model-router.test.ts'den
- should select GPT35_TURBO for simple tasks
- should select CLAUDE_OPUS for expert tasks
- should respect explicit model selection
- should return fallback models for GPT4_TURBO
```

#### 3.1.3 Proje Yönetimi (Projects)

| Test ID | Özellik | Öncelik | Test Seviyesi |
|---------|---------|---------|---------------|
| PROJ-001 | Proje oluşturma | Yüksek | Unit |
| PROJ-002 | Proje listeleme | Yüksek | Unit |
| PROJ-003 | Proje detayı görüntüleme | Orta | Unit |
| PROJ-004 | Proje güncelleme | Orta | Unit |
| PROJ-005 | Proje silme | Orta | Unit |
| PROJ-006 | Yetkilendirme (user isolation) | Yüksek | Unit |
| PROJ-007 | Generation sayısı ile listeleme | Düşük | Unit |

**Mevcut Test Sayısı:** 15+ test case

**Örnek Test Senaryoları:**
```typescript
// projects/route.test.ts'den
- should return 401 when user is not authenticated
- should return 400 when name is missing
- should create project successfully with name only
- should create project successfully with name and description
- should handle database errors
- should return all user projects with generation counts
- should return empty array when user has no projects
- should order projects by updatedAt desc
```

#### 3.1.4 Şablon Yönetimi (Templates)

| Test ID | Özellik | Öncelik | Test Seviyesi |
|---------|---------|---------|---------------|
| TPL-001 | Şablon listeleme | Orta | Unit |
| TPL-002 | Kategori filtreleme | Orta | Unit |
| TPL-003 | Arama fonksiyonu | Orta | Unit |
| TPL-004 | Cache mekanizması | Orta | Unit |
| TPL-005 | Sadece published şablonlar | Yüksek | Unit |

**Mevcut Test Sayısı:** 18+ test case

**Örnek Test Senaryoları:**
```typescript
// templates/route.test.ts'den
- should return cached templates when available
- should fetch from database and cache when cache miss
- should filter by category
- should use search parameter in cache key
- should return only published templates
- should order templates by usage count and creation date
- should limit results to 50 templates
- should cache with 5 minute TTL
- should handle cache errors and still fetch from database
```

#### 3.1.5 E2E Kullanıcı Akışları

| Test ID | Akış | Öncelik | Açıklama |
|---------|------|---------|----------|
| E2E-001 | Sign In sayfası görüntüleme | Yüksek | Sayfa render kontrolü |
| E2E-002 | Sign Up sayfası görüntüleme | Yüksek | Sayfa render kontrolü |
| E2E-003 | Form validasyon hataları | Yüksek | HTML5 validasyon |
| E2E-004 | Başarılı kayıt akışı | Yüksek | Full registration flow |
| E2E-005 | Başarılı giriş akışı | Yüksek | Full login flow |
| E2E-006 | Dashboard erişimi | Orta | Authenticated routing |
| E2E-007 | Kod üretim akışı | Yüksek | End-to-end generation |

**Mevcut Test Sayısı:** 3 test case (temel)

**Örnek Test Senaryoları:**
```typescript
// e2e/auth.spec.ts'den
- should display sign in page
- should display sign up page
- should show validation errors on empty submit
```

### 3.2 Test Edilmeyecek Özellikler

| Özellik | Neden Test Edilmiyor |
|---------|---------------------|
| Fly.io Deployment Pipeline | 3rd party servis, staging ortamında manuel test |
| OAuth Provider'lar (Google, GitHub) | 3rd party servis, sandbox ortamında test |
| Email Gönderimi | 3rd party servis, mock ile test |
| Payment/Subscription | Stripe sandbox ile ayrı test döngüsü |
| CDN ve Asset Delivery | Vercel tarafından yönetilen |
| DNS ve SSL | Infrastructure seviyesi |

---

## 4. Test Yaklaşımı

### 4.1 Test Seviyeleri

```
┌─────────────────────────────────────────────────────────────┐
│                    TEST PİRAMİDİ                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌───────────┐                            │
│                    │   E2E     │  ← %10 (3 test)            │
│                    │  Tests    │                            │
│                    └─────┬─────┘                            │
│               ┌──────────┴──────────┐                       │
│               │   Integration       │  ← %20 (planlanan)    │
│               │      Tests          │                       │
│               └──────────┬──────────┘                       │
│        ┌─────────────────┴─────────────────┐                │
│        │           Unit Tests              │  ← %70 (161+)  │
│        │                                   │                │
│        └───────────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.1.1 Unit Test (Birim Testi)

**Araç:** Vitest

**Kapsam:**
- İzole fonksiyon ve metod testleri
- Mock kullanarak bağımlılık izolasyonu
- Edge case ve hata senaryoları

**Örnek Yapı:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('GenerationService', () => {
  let service: GenerationService
  let mockOpenAI: any
  let mockAnthropic: any

  beforeEach(() => {
    vi.clearAllMocks()
    // Setup mocks
  })

  describe('generate', () => {
    it('should generate code successfully with selected model', async () => {
      // Arrange
      const mockResponse = { code: '...', model: AIModel.GPT4_TURBO }
      mockOpenAI.generate.mockResolvedValue(mockResponse)

      // Act
      const result = await service.generate({ prompt: 'Create button' })

      // Assert
      expect(result).toEqual(mockResponse)
    })
  })
})
```

**Mock Stratejisi:**
```typescript
// Prisma Mock
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    project: { create: vi.fn(), findMany: vi.fn() },
    generation: { create: vi.fn(), update: vi.fn() },
  },
}))

// Auth Mock
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

// External Service Mock
vi.mock('@/lib/ai/openai-service')
vi.mock('@/lib/ai/anthropic-service')
```

#### 4.1.2 Integration Test (Entegrasyon Testi)

**Araç:** Vitest + MSW (Mock Service Worker)

**Kapsam:**
- API endpoint'leri arası iletişim
- Database işlemleri (test database)
- Cache mekanizmaları
- Authentication flow

**Test Database:**
```bash
# Test database setup
DATABASE_URL="postgresql://test:test@localhost:5432/btrme_test"
```

#### 4.1.3 E2E Test (Uçtan Uca Test)

**Araç:** Playwright

**Kapsam:**
- Kullanıcı akışları
- Tarayıcı uyumluluğu
- UI/UX doğrulama
- Full-stack entegrasyon

**Örnek Test:**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display sign in page', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  })

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.getByRole('button', { name: /sign in/i }).click()
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toHaveAttribute('required')
  })
})
```

**Tarayıcı Matrisi:**
| Tarayıcı | Versiyon | Platform |
|----------|----------|----------|
| Chrome | Latest | macOS, Windows, Linux |
| Firefox | Latest | macOS, Windows, Linux |
| Safari | Latest | macOS |
| Edge | Latest | Windows |

#### 4.1.4 Performans Testi

**Araç:** k6 / Artillery (Planlanan)

**Metrikler:**
| Metrik | Hedef | Açıklama |
|--------|-------|----------|
| Response Time (P95) | < 500ms | API endpoint yanıt süresi |
| Throughput | > 100 RPS | İstek/saniye kapasitesi |
| Error Rate | < 0.1% | Hata oranı |
| Concurrent Users | > 100 | Eşzamanlı kullanıcı |

#### 4.1.5 Güvenlik Testi

**Araç:** OWASP ZAP (Planlanan)

**Kontrol Listesi:**
- [ ] SQL Injection
- [ ] XSS (Cross-Site Scripting)
- [ ] CSRF (Cross-Site Request Forgery)
- [ ] Authentication Bypass
- [ ] Sensitive Data Exposure
- [ ] Security Misconfiguration
- [ ] Broken Access Control

### 4.2 Test Metodolojisi

#### 4.2.1 Black Box Testing
- Fonksiyonel gereksinim testleri
- Kullanıcı perspektifinden test
- Input/Output doğrulama

#### 4.2.2 White Box Testing
- Kod coverage analizi
- Branch coverage
- Path testing

#### 4.2.3 Regression Testing
- Her PR için otomatik test suite
- Kritik path'lerin sürekli doğrulanması

---

## 5. Başarı/Başarısızlık Kriterleri

### 5.1 Genel Başarı Kriterleri

| Kriter | Hedef Değer | Mevcut Durum |
|--------|-------------|--------------|
| Unit Test Coverage | > 80% | Ölçülecek |
| Tüm Unit Testler | PASS | 161/161 PASS |
| Tüm E2E Testler | PASS | 3/3 PASS |
| Kritik Bug Sayısı | 0 | 0 |
| Major Bug Sayısı | < 5 | - |
| Performance P95 | < 500ms | - |
| Security Vulnerabilities (Critical) | 0 | - |

### 5.2 Modül Bazlı Kriterler

#### Authentication Module
| Kriter | Koşul |
|--------|-------|
| PASS | Tüm 20 test başarılı |
| PASS | Şifre hash doğrulaması yapılıyor |
| PASS | Sensitive data response'da yok |
| FAIL | Herhangi bir güvenlik testi başarısız |

#### AI Generation Module
| Kriter | Koşul |
|--------|-------|
| PASS | Tüm 45 test başarılı |
| PASS | Fallback mekanizması çalışıyor |
| PASS | Model routing doğru çalışıyor |
| FAIL | Primary ve tüm fallback modeller başarısız |

#### API Endpoints
| Kriter | Koşul |
|--------|-------|
| PASS | 401 for unauthenticated requests |
| PASS | 400 for invalid input |
| PASS | 500 gracefully handled |
| PASS | Response format tutarlı |

### 5.3 Release Kriterleri

| Kriter | Release Blocker? |
|--------|-----------------|
| Unit test coverage < 80% | Hayır |
| Any unit test failing | Evet |
| Any E2E test failing | Evet |
| Critical security issue | Evet |
| P95 latency > 1000ms | Evet |
| Major functionality broken | Evet |

---

## 6. Test Çıktıları

### 6.1 Beklenen Çıktılar

| Çıktı | Format | Konum | Üretim Aracı |
|-------|--------|-------|--------------|
| Test Case Dokümanı | Markdown | `docs/test-cases/` | Manuel |
| Unit Test Raporları | HTML/JSON | `coverage/` | Vitest |
| E2E Test Raporları | HTML | `playwright-report/` | Playwright |
| Coverage Raporu | HTML/LCOV | `coverage/lcov-report/` | c8/istanbul |
| Bug Raporları | Issue | GitHub Issues | Manuel |
| Test Summary | Markdown | `docs/test-summary.md` | CI/CD |

### 6.2 Test Raporlama Formatı

#### Unit Test Raporu
```json
{
  "numTotalTests": 161,
  "numPassedTests": 161,
  "numFailedTests": 0,
  "numPendingTests": 0,
  "coverage": {
    "lines": { "pct": 85.2 },
    "statements": { "pct": 84.8 },
    "functions": { "pct": 82.1 },
    "branches": { "pct": 78.5 }
  }
}
```

#### Bug Raporu Template
```markdown
## Bug Report

**ID:** BUG-XXX
**Severity:** Critical/Major/Minor
**Module:** [Module Name]
**Reporter:** [Name]
**Date:** [Date]

### Description
[Detailed description]

### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### Expected Result
[What should happen]

### Actual Result
[What actually happened]

### Environment
- OS: [OS]
- Browser: [Browser]
- Version: [Version]

### Screenshots/Logs
[Attach if applicable]
```

---

## 7. Zaman Çizelgesi ve Sorumluluklar

### 7.1 Test Fazları

| Faz | Başlangıç | Bitiş | Sorumlu | Çıktı |
|-----|-----------|-------|---------|-------|
| Test Planı Hazırlama | Sprint 1 Week 1 | Sprint 1 Week 2 | QA Lead | STP Dokümanı |
| Unit Test Yazımı | Sprint 1 Week 2 | Sprint 3 Week 2 | Developers | 161+ Test |
| Integration Test | Sprint 2 Week 1 | Sprint 2 Week 4 | QA Team | Integration Suite |
| E2E Test | Sprint 2 Week 3 | Sprint 3 Week 2 | QA Team | E2E Suite |
| Performance Test | Sprint 3 Week 1 | Sprint 3 Week 2 | DevOps | Perf Report |
| Security Test | Sprint 3 Week 2 | Sprint 3 Week 3 | Security | Security Report |
| UAT | Sprint 3 Week 3 | Sprint 3 Week 4 | Stakeholders | UAT Sign-off |

### 7.2 Sorumluluk Matrisi (RACI)

| Aktivite | Developer | QA Lead | DevOps | PM |
|----------|-----------|---------|--------|-----|
| Unit Test Yazımı | R | A | I | I |
| Integration Test | C | R | A | I |
| E2E Test | C | R | I | I |
| Performance Test | C | I | R | A |
| Security Test | C | I | R | A |
| Test Raporlama | I | R | I | A |
| Bug Fixing | R | A | C | I |

**R:** Responsible, **A:** Accountable, **C:** Consulted, **I:** Informed

### 7.3 CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:coverage

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm exec playwright install
      - run: pnpm test:e2e

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: OWASP ZAP Scan
        uses: zaproxy/action-baseline@v0.7.0
```

---

## 8. Riskler ve Acil Durum Planları

### 8.1 Test Riskleri

| Risk ID | Risk | Olasılık | Etki | Azaltma Stratejisi |
|---------|------|----------|------|-------------------|
| TR-001 | AI API rate limiting test ortamında | Orta | Yüksek | Mock kullanımı, sandbox ortamı |
| TR-002 | Test data tutarsızlığı | Orta | Orta | Test fixtures, database seeding |
| TR-003 | Flaky tests (tutarsız testler) | Yüksek | Orta | Retry mekanizması, test izolasyonu |
| TR-004 | Yetersiz test coverage | Orta | Yüksek | Coverage threshold enforcement |
| TR-005 | E2E testlerin yavaş çalışması | Yüksek | Düşük | Paralel test çalıştırma |
| TR-006 | Cross-browser uyumsuzluk | Düşük | Orta | Browser matrix testleri |
| TR-007 | Test ortamı instabilitesi | Orta | Yüksek | Containerized test ortamı |

### 8.2 Acil Durum Planları

#### TR-001: AI API Rate Limiting
```
Tetikleyici: API rate limit hatası alınması
Plan:
1. Tüm AI testlerini mock moduna geçir
2. Rate limit reset süresini bekle
3. Kritik testleri önceliklendirerek çalıştır
```

#### TR-003: Flaky Tests
```
Tetikleyici: Aynı test 3 kez farklı sonuç verirse
Plan:
1. Testi @flaky olarak işaretle
2. Root cause analizi yap
3. Test izolasyonunu kontrol et
4. Gerekirse mock/stub ekle
```

#### TR-004: Yetersiz Coverage
```
Tetikleyici: Coverage < 70%
Plan:
1. Kritik modülleri belirle
2. Test yazım sprint'i planla
3. Coverage gate'leri ayarla
4. PR'larda coverage diff zorunlu yap
```

---

## 9. Ek

### 9.1 Test Ortamı Kurulum

```bash
# Repository clone
git clone https://github.com/btrme/btrme.git
cd btrme

# Bağımlılık kurulumu
pnpm install

# Test database kurulumu
docker-compose up -d postgres-test
pnpm prisma migrate deploy --preview-feature

# Unit testleri çalıştırma
pnpm test

# Coverage ile çalıştırma
pnpm test:coverage

# E2E testleri çalıştırma
pnpm exec playwright install
pnpm test:e2e

# Watch modunda çalıştırma
pnpm test:watch
```

### 9.2 Test Komutları

| Komut | Açıklama |
|-------|----------|
| `pnpm test` | Tüm unit testleri çalıştır |
| `pnpm test:watch` | Watch modunda çalıştır |
| `pnpm test:coverage` | Coverage raporu ile çalıştır |
| `pnpm test:e2e` | E2E testleri çalıştır |
| `pnpm test:e2e:headed` | E2E testleri tarayıcı ile çalıştır |
| `pnpm test:ui` | Vitest UI aç |

### 9.3 Mevcut Test Dosyaları

```
apps/web/__tests__/
├── app/
│   └── api/
│       ├── auth/
│       │   └── signup/
│       │       └── route.test.ts      # 20 tests
│       ├── generation/
│       │   └── route.test.ts          # 12 tests
│       ├── projects/
│       │   ├── route.test.ts          # 14 tests
│       │   └── [id]/
│       │       └── route.test.ts      # 8 tests
│       └── templates/
│           └── route.test.ts          # 18 tests
├── lib/
│   ├── ai/
│   │   ├── generation-service.test.ts # 35 tests
│   │   ├── model-router.test.ts       # 5 tests
│   │   ├── anthropic-service.test.ts  # 12 tests
│   │   └── openai-service.test.ts     # 10 tests
│   └── utils.test.ts                  # 8 tests
└── e2e/
    └── auth.spec.ts                   # 3 tests

Toplam: 161+ test
```

### 9.4 Test Coverage Hedefleri

| Modül | Mevcut | Hedef |
|-------|--------|-------|
| lib/ai/* | ~90% | 90% |
| app/api/* | ~85% | 85% |
| lib/utils | ~95% | 95% |
| components/* | ~60% | 80% |
| **Genel** | ~80% | 80% |

---

## 10. Referanslar

1. IEEE 829-2008 - IEEE Standard for Software and System Test Documentation
2. ISO/IEC/IEEE 29119-3:2021 - Software and systems engineering — Software testing — Part 3: Test documentation
3. Vitest Documentation - https://vitest.dev/
4. Playwright Documentation - https://playwright.dev/
5. OWASP Testing Guide v4.2 - https://owasp.org/www-project-web-security-testing-guide/
6. Testing Library - https://testing-library.com/
7. MSW (Mock Service Worker) - https://mswjs.io/

---

## Onay

| Rol | İsim | İmza | Tarih |
|-----|------|------|-------|
| Test Lead | | | |
| Development Lead | | | |
| Project Manager | | | |
| Quality Assurance | | | |

---

**Doküman Sonu**

*Bu doküman BTRMe projesi için hazırlanmıştır. Tüm hakları saklıdır.*
