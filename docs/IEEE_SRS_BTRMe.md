# TOBB ETÜ Ekonomi ve Teknoloji Üniversitesi
## BİL 495 / YAP 495
# Software Requirements Specification (SRS)
## BTRMe - AI-Powered NoCode Platform

**Referans:** IEEE 830-1998 / ISO/IEC/IEEE 29148:2018

---

## Doküman Kontrol Tablosu

| Alan | Değer |
|------|-------|
| Doküman Başlığı | Software Requirements Specification (SRS) |
| Doküman ID | BTRMe-SRS-001 |
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
   - 1.3 Tanımlar, Kısaltmalar, Akronimler
   - 1.4 Referanslar
   - 1.5 Genel Bakış
2. [Genel Açıklama](#2-genel-açıklama)
   - 2.1 Ürün Perspektifi
   - 2.2 Ürün Fonksiyonları
   - 2.3 Kullanıcı Karakteristikleri
   - 2.4 Kısıtlar
   - 2.5 Varsayımlar ve Bağımlılıklar
3. [Özel Gereksinimler](#3-özel-gereksinimler)
   - 3.1 Fonksiyonel Gereksinimler
   - 3.2 Harici Arayüz Gereksinimleri
   - 3.3 Performans Gereksinimleri
   - 3.4 Tasarım Kısıtları
   - 3.5 Yazılım Kalite Nitelikleri
   - 3.6 Diğer Gereksinimler
4. [Ekler](#4-ekler)
5. [Referanslar](#5-referanslar)

---

## 1. Giriş

### 1.1 Amaç

Bu doküman, BTRMe (AI-Powered NoCode Platform) projesinin yazılım gereksinimlerini IEEE 830-1998 ve ISO/IEC/IEEE 29148:2018 standartlarına uygun olarak tanımlamaktadır. Doküman, geliştirme ekibi, proje paydaşları, test mühendisleri ve akademik danışmanlar tarafından kullanılmak üzere hazırlanmıştır.

**Hedef Kitle:**
- Yazılım geliştiriciler
- Proje yöneticileri
- Test ve QA ekipleri
- Akademik danışmanlar
- Potansiyel yatırımcılar

### 1.2 Kapsam

**BTRMe**, doğal dil promptlarını tam fonksiyonel web uygulamalarına dönüştüren yapay zeka destekli bir NoCode platformudur.

**Ürün Adı:** BTRMe

**Ana Yetenekler:**
- Doğal dil ile uygulama tanımlama
- AI destekli otomatik kod üretimi
- Güvenlik doğrulama ve kod validasyonu
- Otomatik deployment (`*.btrme.app` subdomain)
- Şablon marketplace
- Proje yönetimi ve versiyon kontrolü

**Faydalar:**
- Kod bilgisi gerektirmeden uygulama geliştirme
- Fikirden canlı uygulamaya 2 dakikada geçiş
- %100 kod sahipliği (vendor lock-in yok)
- Maliyet ve zaman tasarrufu

**Kapsam Dışı:**
- Mobil native uygulama geliştirme
- Masaüstü uygulama geliştirme
- IoT cihaz entegrasyonları
- Blockchain/Web3 uygulamaları

### 1.3 Tanımlar, Kısaltmalar, Akronimler

| Terim | Açıklama |
|-------|----------|
| **AI** | Artificial Intelligence - Yapay Zeka |
| **NoCode** | Kod yazmadan yazılım geliştirme yaklaşımı |
| **LLM** | Large Language Model - Büyük Dil Modeli |
| **Claude** | Anthropic tarafından geliştirilen AI modeli |
| **Prompt** | AI'a verilen doğal dil komutu/talimatı |
| **SRS** | Software Requirements Specification |
| **API** | Application Programming Interface |
| **SSE** | Server-Sent Events - Gerçek zamanlı veri akışı protokolü |
| **JWT** | JSON Web Token - Kimlik doğrulama standardı |
| **OWASP** | Open Web Application Security Project |
| **MVP** | Minimum Viable Product |
| **MRR** | Monthly Recurring Revenue |
| **ARR** | Annual Recurring Revenue |
| **CAC** | Customer Acquisition Cost |
| **LTV** | Lifetime Value |
| **ORM** | Object-Relational Mapping |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **E2E** | End-to-End (Test) |

### 1.4 Referanslar

| Doküman/Standart | Açıklama |
|------------------|----------|
| IEEE 830-1998 | Software Requirements Specification Standard |
| ISO/IEC/IEEE 29148:2018 | Requirements Engineering Standard |
| ISO/IEC 25010:2011 | Software Quality Model |
| OWASP Top 10 2021 | Web Application Security Risks |
| IEEE 12207 | Software Life Cycle Processes |
| GDPR | General Data Protection Regulation |
| KVKK | Kişisel Verilerin Korunması Kanunu |

### 1.5 Genel Bakış

Bu dokümanın geri kalanı aşağıdaki şekilde organize edilmiştir:

- **Bölüm 2:** Ürünün genel tanımı, hedef kullanıcılar ve sistem kısıtları
- **Bölüm 3:** Detaylı fonksiyonel ve non-fonksiyonel gereksinimler
- **Bölüm 4:** Ek dokümanlar ve izlenebilirlik matrisi
- **Bölüm 5:** Referans kaynaklar

---

## 2. Genel Açıklama

### 2.1 Ürün Perspektifi

BTRMe, bağımsız bir SaaS (Software as a Service) platformu olarak tasarlanmıştır. Sistem, mevcut AI altyapılarını (Anthropic Claude, OpenAI GPT) kullanarak kod üretimi yapar ve Fly.io üzerinde containerized deployment sağlar.

**Sistem Mimarisi:**

```
┌─────────────────────────────────────────────────────────────┐
│                     BTRMe Platform                          │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 14)                                      │
│  ├── Landing Page                                           │
│  ├── Dashboard                                              │
│  ├── AI Studio / Quick Generate                             │
│  ├── Template Marketplace                                   │
│  └── Settings                                               │
├─────────────────────────────────────────────────────────────┤
│  Backend (Next.js API Routes)                               │
│  ├── Authentication (NextAuth.js v5)                        │
│  ├── AI Generation Service                                  │
│  ├── Project Management                                     │
│  └── Deployment Pipeline                                    │
├─────────────────────────────────────────────────────────────┤
│  AI Layer                                                   │
│  ├── Claude (Primary) ─────┐                                │
│  ├── GPT-4 (Fallback) ─────┼── Model Router                 │
│  └── GPT-3.5 (Fallback) ───┘                                │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure                                             │
│  ├── PostgreSQL (Prisma ORM)                                │
│  ├── Redis (Cache/Queue)                                    │
│  ├── Fly.io (Generated Apps)                                │
│  └── Vercel (Platform Hosting)                              │
└─────────────────────────────────────────────────────────────┘
```

**Harici Sistem Bağlantıları:**
- Anthropic Claude API
- OpenAI API
- Fly.io Deployment API
- Vercel Hosting
- PostgreSQL Database
- Redis Cache
- GitHub (kod yönetimi)

### 2.2 Ürün Fonksiyonları

**Ana Fonksiyonlar:**

1. **Kullanıcı Yönetimi**
   - Kayıt ve giriş
   - Profil yönetimi
   - Abonelik yönetimi

2. **AI Kod Üretimi**
   - Doğal dil prompt analizi
   - Otomatik kod generasyonu
   - Çoklu model desteği (Claude, GPT-4)
   - Complexity-based routing

3. **Proje Yönetimi**
   - Proje oluşturma/düzenleme/silme
   - Versiyon geçmişi
   - Kod export

4. **Template Marketplace**
   - Hazır şablon browsing
   - Kategori filtreleme
   - One-click kullanım

5. **Otomatik Deployment**
   - Container oluşturma
   - Subdomain atama
   - Health monitoring

6. **Dashboard & Analytics**
   - Kullanım istatistikleri
   - Maliyet takibi
   - Aktivite geçmişi

### 2.3 Kullanıcı Karakteristikleri

**Birincil Kullanıcı Personaları:**

| Persona | Profil | Teknik Seviye | Beklenen LTV |
|---------|--------|---------------|--------------|
| **Ayşe** | Non-technical Girişimci | Düşük | $228 |
| **Can** | Indie Hacker/Developer | Yüksek | $456 |
| **Sarah** | Freelance Developer | Orta-Yüksek | $588 |
| **Mehmet** | Küçük İşletme Sahibi | Düşük | $588 |

**Kullanıcı Profili Detayları:**

1. **Non-technical Girişimciler (Ayşe)**
   - Yaş: 28-45
   - Kod bilgisi yok
   - MVP hızlı test etmek istiyor
   - Maliyet duyarlı

2. **Indie Hackers (Can)**
   - Yaş: 22-35
   - Temel programlama bilgisi var
   - Hızlı prototipleme istiyor
   - Kod sahipliği önemli

3. **Freelance Developers (Sarah)**
   - Yaş: 25-40
   - İleri programlama bilgisi
   - Müşteri projelerini hızlandırmak istiyor
   - Kalite ve güvenilirlik öncelikli

4. **Küçük İşletme Sahipleri (Mehmet)**
   - Yaş: 35-55
   - Teknik bilgi minimal
   - İş süreçlerini dijitalleştirmek istiyor
   - Destek ve dokümantasyon önemli

### 2.4 Kısıtlar

#### 2.4.1 Ekonomik/Finansal Kısıtlar

| Kısıt | Açıklama | Etki | Çözüm Yaklaşımı |
|-------|----------|------|-----------------|
| **AI API Maliyetleri** | Claude/GPT API çağrıları token bazlı ücretlendirilir | Operasyonel maliyet | Akıllı caching, model routing, prompt optimizasyonu |
| **Hosting Maliyetleri** | Her kullanıcı uygulaması container maliyeti | Ölçekleme maliyeti | Smart suspend, shared resources |
| **Bootstrap Bütçe** | Sınırlı başlangıç sermayesi | Özellik kapsamı | MVP odaklı geliştirme |

**Maliyet Projeksiyon:**
- Yıl 1 Altyapı: ~$1,620
- Yıl 1 AI Maliyeti: $2,400 - $6,000
- Break-even: 16 kullanıcı

#### 2.4.2 Teknolojik Kısıtlar

| Kısıt | Açıklama | Etki |
|-------|----------|------|
| **AI Model Limitleri** | LLM'ler karmaşık business logic'te hata yapabilir | Kod kalitesi |
| **Rate Limiting** | API sağlayıcılarının istek limitleri | Eşzamanlı kullanıcı kapasitesi |
| **Container Cold Start** | Suspend edilmiş uygulamaların başlama süresi | Kullanıcı deneyimi |

#### 2.4.3 Yasal/Düzenleyici Kısıtlar

| Kısıt | Açıklama | Uyum Yaklaşımı |
|-------|----------|----------------|
| **KVKK** | Kişisel verilerin korunması | Privacy by design, veri minimizasyonu |
| **GDPR** | AB kullanıcıları için veri koruma | Consent management, data portability |
| **Fikri Mülkiyet** | Üretilen kodun sahipliği | Kullanıcıya %100 sahiplik |

#### 2.4.4 Zaman Kısıtları

| Kısıt | Açıklama |
|-------|----------|
| **12 Hafta Geliştirme** | MVP için belirlenen süre |
| **Sprint Döngüleri** | 4 haftalık sprint'ler |

#### 2.4.5 Güvenlik Kısıtları

| Kısıt | Açıklama | Uygulama |
|-------|----------|----------|
| **OWASP Top 10** | Web güvenlik standartları | Otomatik kod validasyonu |
| **Container İzolasyon** | Kullanıcı uygulamaları arası izolasyon | Docker + Fly.io sandboxing |
| **Veri İzolasyonu** | Multi-tenant veri güvenliği | Schema-level isolation |

### 2.5 Varsayımlar ve Bağımlılıklar

**Varsayımlar:**

1. Anthropic Claude API'nin stabil ve erişilebilir olacağı
2. Fly.io hizmetinin kesintisiz çalışacağı
3. Hedef kullanıcıların temel internet kullanım becerisine sahip olduğu
4. NoCode pazarının büyümeye devam edeceği
5. AI kod üretim kalitesinin gelişmeye devam edeceği

**Bağımlılıklar:**

| Bağımlılık | Tip | Risk Seviyesi | Alternatif |
|------------|-----|---------------|------------|
| Anthropic Claude API | Harici Servis | Orta | OpenAI GPT-4 |
| Fly.io | Hosting | Düşük | Railway, Render |
| Vercel | Platform Hosting | Düşük | Netlify, AWS |
| PostgreSQL | Veritabanı | Düşük | MySQL, MongoDB |
| Redis | Cache | Düşük | Memcached |

---

## 3. Özel Gereksinimler

### 3.1 Fonksiyonel Gereksinimler

#### 3.1.1 Kullanıcı Yönetimi (FR-UM)

| ID | Gereksinim | Öncelik |
|----|------------|---------|
| FR-UM-001 | Sistem, kullanıcıların email ve şifre ile kayıt olmasını SAĞLAMALIDIR | Yüksek |
| FR-UM-002 | Sistem, kullanıcıların email ve şifre ile giriş yapmasını SAĞLAMALIDIR | Yüksek |
| FR-UM-003 | Sistem, OAuth (Google, GitHub) ile kimlik doğrulama DESTEKLEMELİDİR | Orta |
| FR-UM-004 | Sistem, kullanıcı profil bilgilerini güncelleme imkanı SAĞLAMALIDIR | Orta |
| FR-UM-005 | Sistem, şifre sıfırlama işlevi SAĞLAMALIDIR | Yüksek |
| FR-UM-006 | Sistem, kullanıcı oturumlarını güvenli şekilde YÖNETMELİDİR | Yüksek |
| FR-UM-007 | Sistem, kullanıcı rollerini (USER, ADMIN) DESTEKLEMELİDİR | Orta |

#### 3.1.2 AI Kod Üretimi (FR-AI)

| ID | Gereksinim | Öncelik |
|----|------------|---------|
| FR-AI-001 | Sistem, doğal dil promptlarını KABUL ETMELİDİR | Yüksek |
| FR-AI-002 | Sistem, prompt'u analiz ederek intent ve özellikleri ÇIKARMALıDIR | Yüksek |
| FR-AI-003 | Sistem, belirlenen complexity'e göre uygun AI modelini SEÇMELİDİR | Yüksek |
| FR-AI-004 | Sistem, üretilen kodu güvenlik açısından DOĞRULAMALIDIR | Yüksek |
| FR-AI-005 | Sistem, kod üretim sürecini gerçek zamanlı olarak GÖSTERMELİDİR | Orta |
| FR-AI-006 | Sistem, üretilen kodu syntax highlighting ile GÖRÜNTÜLEMELİDİR | Orta |
| FR-AI-007 | Sistem, üretilen komponenti canlı önizleme olarak GÖSTERMELİDİR | Orta |
| FR-AI-008 | Sistem, üretilen kodu indirme imkanı SAĞLAMALIDIR | Yüksek |
| FR-AI-009 | Sistem, çoklu dil desteği (Türkçe prompt) SAĞLAMALIDIR | Orta |
| FR-AI-010 | Sistem, model fallback mekanizması UYGULAMALIDIR | Yüksek |

#### 3.1.3 Proje Yönetimi (FR-PM)

| ID | Gereksinim | Öncelik |
|----|------------|---------|
| FR-PM-001 | Sistem, kullanıcıların yeni proje oluşturmasını SAĞLAMALIDIR | Yüksek |
| FR-PM-002 | Sistem, proje listesini görüntüleme imkanı SAĞLAMALIDIR | Yüksek |
| FR-PM-003 | Sistem, proje detaylarını düzenleme imkanı SAĞLAMALIDIR | Orta |
| FR-PM-004 | Sistem, projeleri silme imkanı SAĞLAMALIDIR | Orta |
| FR-PM-005 | Sistem, her proje için generation geçmişini SAKLAMALIDIR | Orta |
| FR-PM-006 | Sistem, projeleri grid/list görünümünde GÖSTERMELİDİR | Düşük |

#### 3.1.4 Template Marketplace (FR-TM)

| ID | Gereksinim | Öncelik |
|----|------------|---------|
| FR-TM-001 | Sistem, hazır şablonları kategorilere göre LİSTELEMELİDİR | Orta |
| FR-TM-002 | Sistem, şablonlarda arama yapma imkanı SAĞLAMALIDIR | Orta |
| FR-TM-003 | Sistem, şablon önizleme imkanı SAĞLAMALIDIR | Orta |
| FR-TM-004 | Sistem, tek tıkla şablon kullanımı SAĞLAMALIDIR | Orta |
| FR-TM-005 | Sistem, şablon kullanım istatistiklerini TAKİP ETMELİDİR | Düşük |

#### 3.1.5 Deployment (FR-DP)

| ID | Gereksinim | Öncelik |
|----|------------|---------|
| FR-DP-001 | Sistem, üretilen uygulamaları otomatik DEPLOY ETMELİDİR | Yüksek |
| FR-DP-002 | Sistem, her uygulamaya benzersiz subdomain ATAMALIDIR | Yüksek |
| FR-DP-003 | Sistem, deployment durumunu gerçek zamanlı GÖSTERMELİDİR | Orta |
| FR-DP-004 | Sistem, uygulama health monitoring SAĞLAMALIDIR | Orta |
| FR-DP-005 | Sistem, kullanılmayan uygulamaları suspend ETMELİDİR | Orta |

#### 3.1.6 Dashboard & Analytics (FR-DA)

| ID | Gereksinim | Öncelik |
|----|------------|---------|
| FR-DA-001 | Sistem, kullanıcı istatistiklerini GÖSTERMELİDİR | Orta |
| FR-DA-002 | Sistem, son projeleri LİSTELEMELİDİR | Orta |
| FR-DA-003 | Sistem, aktivite geçmişini GÖSTERMELİDİR | Düşük |
| FR-DA-004 | Sistem, maliyet/token kullanımını TAKİP ETMELİDİR | Orta |
| FR-DA-005 | Sistem, hızlı aksiyon butonları SAĞLAMALIDIR | Düşük |

### 3.2 Harici Arayüz Gereksinimleri

#### 3.2.1 Kullanıcı Arayüzleri

| ID | Gereksinim | Açıklama |
|----|------------|----------|
| UI-001 | Responsive tasarım | Mobil, tablet, desktop uyumlu |
| UI-002 | Dark/Light mode | Kullanıcı tercihine göre tema |
| UI-003 | Erişilebilirlik | WCAG 2.1 AA uyumlu |
| UI-004 | Türkçe arayüz | Tam lokalizasyon desteği |
| UI-005 | Loading states | Tüm async işlemlerde görsel feedback |

#### 3.2.2 Donanım Arayüzleri

Sistem, standart web tarayıcısı üzerinden çalışacak olup özel donanım gereksinimi bulunmamaktadır.

**Minimum İstemci Gereksinimleri:**
- Modern web tarayıcısı (Chrome, Firefox, Safari, Edge)
- 4GB RAM
- Stabil internet bağlantısı

#### 3.2.3 Yazılım Arayüzleri

| Arayüz | Protokol | Açıklama |
|--------|----------|----------|
| Anthropic Claude API | REST/HTTPS | AI kod üretimi |
| OpenAI API | REST/HTTPS | Fallback AI |
| Fly.io API | REST/HTTPS | Container deployment |
| PostgreSQL | TCP/5432 | Veritabanı bağlantısı |
| Redis | TCP/6379 | Cache ve queue |

#### 3.2.4 İletişim Arayüzleri

| Protokol | Kullanım |
|----------|----------|
| HTTPS | Tüm web trafiği |
| WSS | Real-time updates (opsiyonel) |
| SSE | Code generation streaming |

### 3.3 Performans Gereksinimleri

| ID | Metrik | Hedef Değer | Açıklama |
|----|--------|-------------|----------|
| PR-001 | Sayfa yükleme süresi | < 3 saniye | İlk anlamlı içerik |
| PR-002 | AI yanıt süresi | < 30 saniye | Basit prompt'lar için |
| PR-003 | API yanıt süresi | < 500ms | Standard endpoint'ler |
| PR-004 | Eşzamanlı kullanıcı | 100+ | Aktif session |
| PR-005 | Uptime | %99.5 | Aylık bazda |
| PR-006 | Deployment süresi | < 2 dakika | Container oluşturma dahil |
| PR-007 | Database query | < 100ms | Ortalama query süresi |

### 3.4 Tasarım Kısıtları

| Kısıt | Açıklama |
|-------|----------|
| **Framework** | Next.js 14 (App Router) kullanılmalı |
| **Dil** | TypeScript zorunlu |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Database** | Prisma ORM ile PostgreSQL |
| **Authentication** | NextAuth.js v5 |
| **Monorepo** | pnpm workspaces + Turbo |
| **Code Style** | ESLint + Prettier kuralları |

### 3.5 Yazılım Kalite Nitelikleri

ISO/IEC 25010:2011 standardına uygun olarak:

#### 3.5.1 Güvenilirlik (Reliability)

| Metrik | Hedef | Ölçüm Yöntemi |
|--------|-------|---------------|
| **Olgunluk (Maturity)** | MTBF > 720 saat | Hata log analizi |
| **Hata Toleransı** | Graceful degradation | Fallback mekanizma testleri |
| **Kurtarılabilirlik** | RTO < 1 saat, RPO < 1 saat | Disaster recovery testleri |

#### 3.5.2 Kullanılabilirlik (Usability)

| Metrik | Hedef | Ölçüm Yöntemi |
|--------|-------|---------------|
| **Öğrenilebilirlik** | İlk uygulama < 5 dakika | Kullanıcı testleri |
| **Hata Oranı** | < %5 kullanıcı hatası | Session recording analizi |
| **Memnuniyet** | NPS > 40 | Anket |

#### 3.5.3 Güvenlik (Security)

| Metrik | Hedef | Ölçüm Yöntemi |
|--------|-------|---------------|
| **OWASP Uyumu** | Top 10 koruması | Otomatik scan |
| **Veri Şifreleme** | AES-256 (rest), TLS 1.3 (transit) | Audit |
| **Kimlik Doğrulama** | %100 session güvenliği | Penetration test |

#### 3.5.4 Bakım Yapılabilirlik (Maintainability)

| Metrik | Hedef | Ölçüm Yöntemi |
|--------|-------|---------------|
| **Kod Kapsama** | > %80 test coverage | CI/CD pipeline |
| **Kod Karmaşıklığı** | Cyclomatic < 10 | SonarQube |
| **Dokümantasyon** | %100 API docs | Swagger/OpenAPI |

#### 3.5.5 Taşınabilirlik (Portability)

| Metrik | Hedef | Ölçüm Yöntemi |
|--------|-------|---------------|
| **Tarayıcı Uyumu** | Chrome, Firefox, Safari, Edge | Cross-browser test |
| **Adaptasyon** | Container-based | Docker compliance |

#### Kalite Metrikleri Özet Tablosu

| Kalite Niteliği | Alt Özellik | Metrik | Hedef Değer | Doğrulama Yöntemi |
|-----------------|-------------|--------|-------------|-------------------|
| Güvenilirlik | Maturity | MTBF | > 720 saat | Log analizi |
| Güvenilirlik | Availability | Uptime | > %99.5 | Monitoring |
| Güvenilirlik | Recoverability | RTO | < 1 saat | DR testi |
| Performans | Response Time | API latency | < 500ms | Load test |
| Performans | Throughput | Concurrent users | > 100 | Stress test |
| Kullanılabilirlik | Learnability | Time to first app | < 5 dakika | User test |
| Kullanılabilirlik | Satisfaction | NPS | > 40 | Survey |
| Güvenlik | Confidentiality | Data encryption | AES-256 | Audit |
| Güvenlik | Integrity | OWASP compliance | Top 10 | Scan |
| Bakım | Testability | Code coverage | > %80 | CI/CD |
| Bakım | Analyzability | Documentation | %100 | Review |
| Taşınabilirlik | Adaptability | Browser support | 4 major | E2E test |

### 3.6 Diğer Gereksinimler

#### 3.6.1 Yasal Gereksinimler

- KVKK uyumu (Türkiye)
- GDPR uyumu (AB kullanıcıları)
- Kullanım koşulları ve gizlilik politikası
- Çerez politikası

#### 3.6.2 Dokümantasyon Gereksinimleri

- Kullanıcı kılavuzu
- API dokümantasyonu
- Geliştirici dokümantasyonu
- Sürüm notları

#### 3.6.3 Eğitim Gereksinimleri

- Başlangıç rehberi
- Video tutorial'lar
- Örnek projeler

---

## 4. Ekler

### 4.1 Gereksinim İzlenebilirlik Matrisi

| Gereksinim ID | Kullanım Senaryosu | Test Senaryosu | Durum |
|---------------|-------------------|----------------|-------|
| FR-UM-001 | UC-001 | TC-001 | Uygulandı |
| FR-UM-002 | UC-002 | TC-002 | Uygulandı |
| FR-AI-001 | UC-010 | TC-010 | Uygulandı |
| FR-AI-002 | UC-011 | TC-011 | Uygulandı |
| FR-PM-001 | UC-020 | TC-020 | Uygulandı |
| FR-TM-001 | UC-030 | TC-030 | Uygulandı |
| FR-DP-001 | UC-040 | TC-040 | Planlanan |
| FR-DA-001 | UC-050 | TC-050 | Uygulandı |

### 4.2 Use Case Diyagramı

```
                    ┌─────────────────────────────────────┐
                    │            BTRMe System             │
                    │                                     │
    ┌───────┐       │  ┌─────────────────────────────┐   │
    │       │       │  │      Kayıt/Giriş            │   │
    │       │───────┼─►│                             │   │
    │       │       │  └─────────────────────────────┘   │
    │       │       │                                     │
    │       │       │  ┌─────────────────────────────┐   │
    │ User  │───────┼─►│   Prompt ile Uygulama Üret  │   │
    │       │       │  └─────────────────────────────┘   │
    │       │       │                                     │
    │       │       │  ┌─────────────────────────────┐   │
    │       │───────┼─►│    Projeleri Yönet          │   │
    │       │       │  └─────────────────────────────┘   │
    │       │       │                                     │
    │       │       │  ┌─────────────────────────────┐   │
    │       │───────┼─►│   Şablon Kullan             │   │
    └───────┘       │  └─────────────────────────────┘   │
                    │                                     │
                    └─────────────────────────────────────┘
```

---

## 5. Referanslar

1. IEEE 830-1998 - IEEE Recommended Practice for Software Requirements Specifications
2. ISO/IEC/IEEE 29148:2018 - Systems and software engineering — Life cycle processes — Requirements engineering
3. ISO/IEC 25010:2011 - Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE)
4. OWASP Top 10 2021 - https://owasp.org/Top10/
5. KVKK - https://www.kvkk.gov.tr/
6. GDPR - https://gdpr.eu/
7. Next.js Documentation - https://nextjs.org/docs
8. Prisma Documentation - https://www.prisma.io/docs
9. Anthropic Claude API - https://docs.anthropic.com/

---

**Doküman Sonu**

*Bu doküman BTRMe projesi için hazırlanmıştır. Tüm hakları saklıdır.*
