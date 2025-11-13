# 🤔 Detaylı Sorular ve Kararlar

Bu dosya, projenin detaylarını netleştirmek için önemli soruları içerir. Her sorunun bir kararı olmalı.

---

## 🎨 Kullanıcı Deneyimi

### 1. Onboarding Akışı
**Soru:** Kullanıcı ilk kez platforma girdiğinde ne görmelidir?
- [ ] **Option A:** Direkt prompt girme ekranı (anında başla)
- [ ] **Option B:** Kısa tutorial (3-4 adım)
- [ ] **Option C:** Template seçim ekranı
- [ ] **Option D:** Demo video + prompt ekranı

**Karar:** [Belirlenmedi]

---

### 2. Prompt Input Stili
**Soru:** Kullanıcılar promptlarını nasıl girecek?
- [ ] **Option A:** Chat interface (WhatsApp-like)
- [ ] **Option B:** Form-based wizard (adım adım sorular)
- [ ] **Option C:** Hybrid (her ikisi de mevcut)
- [ ] **Option D:** Tek satır input + AI soruları

**Karar:** [Belirlenmedi]

---

### 3. Çoklu Dil Desteği
**Soru:** İlk versiyonda hangi dilleri destekleyelim?
- [ ] **Option A:** Sadece İngilizce
- [ ] **Option B:** İngilizce + Türkçe
- [ ] **Option C:** Otomatik dil algılama (AI)
- [ ] **Option D:** Kullanıcı seçimi

**Önerilen:** Option B (İngilizce + Türkçe)

**Karar:** [Belirlenmedi]

---

## 🏗️ Teknik Kararlar

### 4. Monorepo vs Polyrepo
**Soru:** Proje yapısı nasıl olmalı?
- [ ] **Option A:** Monorepo (Turborepo/Nx) - Tek repo, multiple packages
- [ ] **Option B:** Polyrepo - Platform ve generated apps ayrı
- [ ] **Option C:** Hybrid - Ana platform monorepo, apps ayrı

**Artılar/Eksiler:**
- **Monorepo:** Kolay code sharing, tek CI/CD, büyüyünce yavaşlar
- **Polyrepo:** Bağımsız deployment, daha karmaşık setup

**Önerilen:** Option A (Monorepo with Turborepo)

**Karar:** [Belirlenmedi]

---

### 5. Database Stratejisi (Generated Apps)
**Soru:** Her generated app için database nasıl sağlanacak?
- [ ] **Option A:** SQLite per app (file-based)
- [ ] **Option B:** Shared PostgreSQL with schema per app
- [ ] **Option C:** PostgreSQL instance per app (pahalı)
- [ ] **Option D:** User seçer (free: SQLite, paid: PostgreSQL)

**Artılar/Eksiler:**
- **SQLite:** Basit, ucuz, sınırlı (no concurrency)
- **Shared PG:** Scalable, biraz karmaşık, cost-effective
- **Dedicated PG:** En iyi performance, çok pahalı

**Önerilen:** MVP için Option A, sonra Option D

**Karar:** [Belirlenmedi]

---

### 6. Generated App Stack
**Soru:** Kullanıcı uygulamaları hangi stack ile oluşturulacak?
- [ ] **Option A:** Always Next.js (standardize)
- [ ] **Option B:** User seçer (React, Vue, Svelte)
- [ ] **Option C:** AI karar verir (prompt'a göre)
- [ ] **Option D:** Template-based (template her birinin stack'i farklı)

**Önerilen:** Option A (MVP için Next.js only)

**Karar:** [Belirlenmedi]

---

### 7. Real-time Updates
**Soru:** Build/deploy progress nasıl gösterilecek?
- [ ] **Option A:** WebSocket (gerçek zamanlı)
- [ ] **Option B:** Polling (her 2 saniyede bir)
- [ ] **Option C:** Server-Sent Events (SSE)

**Önerilen:** Option C (SSE - basit, reliable)

**Karar:** [Belirlenmedi]

---

## 💰 İş Modeli

### 8. Pricing Model
**Soru:** Nasıl para kazanacağız?
- [ ] **Option A:** Tamamen ücretsiz (MVP için)
- [ ] **Option B:** Freemium (limited free, paid features)
- [ ] **Option C:** Usage-based (per generation/deployment)
- [ ] **Option D:** Subscription tiers

**Önerilen Tiers (Option B/D):**
```
Free:
- 5 projects
- 10 generations/month
- Shared hosting
- Basic templates

Pro ($19/mo):
- Unlimited projects
- 100 generations/month
- Dedicated resources
- All templates
- Custom domain

Team ($49/mo):
- Everything in Pro
- Team collaboration
- Priority support
- Advanced features
```

**Karar:** [Belirlenmedi]

---

### 9. Resource Limits (Free Tier)
**Soru:** Free tier için limitler ne olmalı?
```
Projects: ___
Generations per month: ___
Deployments: ___
Storage: ___ MB
AI calls: ___
```

**Önerilen:**
```
Projects: 3
Generations per month: 10
Deployments: 5 (auto-delete after 7 days)
Storage: 100MB
AI calls: Included in generations
```

**Karar:** [Belirlenmedi]

---

## 🔒 Güvenlik & Compliance

### 10. User Authentication
**Soru:** Authentication zorunlu mu?
- [ ] **Option A:** Evet, account gerekli
- [ ] **Option B:** Guest mode + optional account
- [ ] **Option C:** Anonymous generation (no account, limited)

**Önerilen:** Option A (tracking ve abuse prevention için)

**Karar:** [Belirlenmedi]

---

### 11. Generated Code Ownership
**Soru:** Kullanıcı generated code'un sahibi mi?
- [ ] **Option A:** Evet, user tam sahip (MIT lisans gibi)
- [ ] **Option B:** Evet ama attribution gerekli
- [ ] **Option C:** Platform'un ortak hakkı var

**Önerilen:** Option A (user retention için)

**Karar:** [Belirlenmedi]

---

### 12. Content Moderation
**Soru:** Uygunsuz içerik nasıl kontrol edilecek?
- [ ] **Automated:** AI-based moderation
- [ ] **Manual:** Report system
- [ ] **Hybrid:** AI + manual review
- [ ] **None:** Tamamen açık (riskli)

**Önerilen:** Hybrid

**Karar:** [Belirlenmedi]

---

## 🚀 MVP Scope

### 13. MVP Minimum Features
**Soru:** İlk launch için MUTLAKA olması gerekenler?

**Must Have (P0):**
- [ ] User registration/login
- [ ] Prompt input
- [ ] Code generation (3 templates minimum)
- [ ] Deployment to production
- [ ] Live preview

**Should Have (P1):**
- [ ] Iterative refinement
- [ ] Code export
- [ ] Basic analytics

**Nice to Have (P2):**
- [ ] Team collaboration
- [ ] Custom domains
- [ ] Database per app

**Won't Have (MVP):**
- [ ] Mobile app
- [ ] API access
- [ ] White-label

**Karar:** [Belirlenmedi]

---

### 14. Launch Strategy
**Soru:** İlk launch nasıl olmalı?
- [ ] **Option A:** Closed beta (invite-only, 50 users)
- [ ] **Option B:** Open beta (public, waitlist)
- [ ] **Option C:** Soft launch (no marketing)
- [ ] **Option D:** Big launch (Product Hunt, etc.)

**Önerilen:** Option A → B → D (staged approach)

**Karar:** [Belirlenmedi]

---

## 📱 Platform Features

### 15. Mobile Support
**Soru:** Generated apps mobil destekli mi?
- [ ] **Option A:** Web-only (responsive)
- [ ] **Option B:** PWA (Progressive Web App)
- [ ] **Option C:** React Native export (gelecekte)
- [ ] **Option D:** User seçer

**Önerilen:** Option B (PWA)

**Karar:** [Belirlenmedi]

---

### 16. API Access for Developers
**Soru:** API sunalım mı (developer users için)?
```typescript
// Example API
POST /api/v1/generate
{
  "prompt": "reminder app",
  "template": "reminder",
  "autoDeploy": true
}
```

- [ ] **Option A:** MVP'de yok
- [ ] **Option B:** V1 launch ile birlikte
- [ ] **Option C:** Paid feature (Pro+)

**Önerilen:** Option C

**Karar:** [Belirlenmedi]

---

### 17. Marketplace / Template Sharing
**Soru:** Users kendi templatelerini share edebilir mi?
- [ ] **Option A:** Evet, public template marketplace
- [ ] **Option B:** Sadece team içinde paylaşım
- [ ] **Option C:** İleride (post-MVP)

**Önerilen:** Option C

**Karar:** [Belirlenmedi]

---

## 🎯 Success Metrics

### 18. Launch Success Kriterleri
**Soru:** İlk ayda başarı için metrikler?

**Önerilen Targets:**
```
✅ 100+ signups
✅ 50+ active users
✅ 20+ deployed apps
✅ 80%+ generation success rate
✅ 95%+ deployment success rate
✅ <10 critical bugs
✅ NPS score >40
```

**Eklemek istediğiniz başka metrikler?**

**Karar:** [Belirlenmedi]

---

## 🛠️ Development Practices

### 19. Testing Strategy
**Soru:** Test coverage hedefi?
- [ ] **Option A:** 80%+ coverage (strict)
- [ ] **Option B:** Critical paths only (~50%)
- [ ] **Option C:** E2E tests, unit optional
- [ ] **Option D:** TDD (test-first development)

**Önerilen:** Option B (pragmatic for MVP)

**Karar:** [Belirlenmedi]

---

### 20. Code Review Process
**Soru:** PR review süreci nasıl olmalı?
- [ ] **Option A:** 1 approval required
- [ ] **Option B:** 2 approvals required
- [ ] **Option C:** Pair programming (no formal review)
- [ ] **Option D:** Lead dev onayı zorunlu

**Önerilen:** Option A (hız için)

**Karar:** [Belirlenmedi]

---

## 📞 Support & Community

### 21. User Support
**Soru:** Users nasıl yardım alacak?
- [ ] **Option A:** Email support only
- [ ] **Option B:** Discord community
- [ ] **Option C:** In-app chat (Intercom)
- [ ] **Option D:** Help docs + FAQ only

**Önerilen:** Option D + A (MVP için)

**Karar:** [Belirlenmedi]

---

## 🌍 Deployment & Hosting

### 22. Generated Apps Lifecycle
**Soru:** Generated apps ne kadar süre canlı kalacak?
- [ ] **Option A:** Sınırsız (user silene kadar)
- [ ] **Option B:** 30 gün inaktif sonra suspend
- [ ] **Option C:** Free tier: 7 gün, Paid: unlimited
- [ ] **Option D:** User seçer (pay to keep alive)

**Önerilen:** Option C

**Karar:** [Belirlenmedi]

---

### 23. Scaling Threshold
**Soru:** Ne zaman scale etmeye başlamalıyız?
```
User count: ___
Concurrent builds: ___
Deployed apps: ___
Monthly AI cost: $___
```

**Önerilen:**
```
100+ active users → Scale database
50+ concurrent builds → Add build workers
200+ deployed apps → Multi-region
$1000+/mo AI cost → Consider fine-tuning
```

**Karar:** [Belirlenmedi]

---

## 🎨 Branding & Design

### 24. Platform Name Finalized?
**Soru:** "BTRMe" final mi?
- [ ] Evet, BTRMe
- [ ] Hayır, alternatif: _______

**Domain:**
- [ ] btrme.app ✅ (available?)
- [ ] btrme.io
- [ ] btrme.dev

**Karar:** [Belirlenmedi]

---

### 25. Design System
**Soru:** Figma design hazır mı?
- [ ] Evet, hazır
- [ ] Kısmen (bazı sayfalar)
- [ ] Hayır, code-first approach

**Önerilen:** Code-first with Tailwind + shadcn/ui (hızlı)

**Karar:** [Belirlenmedi]

---

## ✅ Action Items

Yukarıdaki soruları gözden geçirip kararları güncelleyelim:

**Acil Kararlar (Hafta 0):**
1. [ ] Monorepo vs Polyrepo
2. [ ] Authentication strategy
3. [ ] MVP scope finalize
4. [ ] Pricing model (en azından free tier limits)

**Orta Vadeli (Sprint 1):**
5. [ ] Database strategy for apps
6. [ ] Real-time updates method
7. [ ] Testing strategy

**Uzun Vadeli (Sprint 2-3):**
8. [ ] Mobile support approach
9. [ ] API access
10. [ ] Marketplace features

---

**Bu dosyayı doldurup DECISIONS.md olarak finalleştirelim!**

Last Updated: 2025-11-13
