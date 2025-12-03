# Proje Kısıt ve Etkiler Dokümanı (PKE)
## NoCodeLab - AI-Powered NoCode Platform

**Doküman Türü:** PKE-Plan (BİL495)

---

## Doküman Kontrol Tablosu

| Alan | Değer |
|------|-------|
| Doküman Başlığı | Proje Kısıt ve Etkiler Dokümanı |
| Doküman ID | NoCodeLab-PKE-001 |
| Hazırlayan | NoCodeLab Geliştirme Ekibi |
| Versiyon | 1.0 (Plan Sürümü) |
| Tarih | Aralık 2025 |

---

## İçindekiler

**PKE-Plan Kapsamı (BİL495)**
1. [Kullanılan Standartlar](#1-kullanılan-standartlar)
2. [Proje Kısıtları](#2-proje-kısıtları)
3. [Beklenen Etkiler](#3-beklenen-etkiler)

**PKE-Rapor (BİL496) - Planlanan**
4. [Standartlara Uyum Özeti](#4-standartlara-uyum-özeti)
5. [Kısıtların Yönetimi Özeti](#5-kısıtların-yönetimi-özeti)
6. [Beklenen ve Gerçekleşen Etki Sonuçları](#6-beklenen-ve-gerçekleşen-etki-sonuçları)

---

# PKE-Plan Kapsamı (BİL495)

## 1. Kullanılan Standartlar

Projeye uygulanabilir mühendislik standartları ve bunların projemize özel uygulama detayları aşağıda listelenmiştir.

### 1.1 Yazılım Mühendisliği Standartları

| Standart | Madde/Alt Madde | Uygulanabilirlik Notu | Planlanan Kanıt Kaynağı |
|----------|-----------------|----------------------|------------------------|
| **IEEE 830-1998** | Tüm bölümler | Yazılım gereksinim spesifikasyonu formatı olarak tam uygulanır | SRS dokümanı, gereksinim izlenebilirlik matrisi |
| **ISO/IEC/IEEE 29148:2018** | Bölüm 5, 6 | Requirements engineering süreçleri için referans alınır | Gereksinim toplama ve yönetim süreçleri dokümantasyonu |
| **IEEE 12207:2017** | Bölüm 6.4 | Yazılım yaşam döngüsü süreçleri için temel çerçeve | Sprint planları, CI/CD pipeline tanımları |
| **ISO/IEC 25010:2011** | Bölüm 4 | Yazılım kalite modeli - kalite nitelikleri tanımı | Kalite metrikleri tablosu, test sonuçları |

### 1.2 Güvenlik Standartları

| Standart | Madde/Alt Madde | Uygulanabilirlik Notu | Planlanan Kanıt Kaynağı |
|----------|-----------------|----------------------|------------------------|
| **OWASP Top 10 2021** | A01-A10 | Web uygulama güvenliği için zorunlu kontroller | Otomatik güvenlik tarama raporları, kod validasyon logları |
| **OWASP ASVS v4.0** | Level 1 | Uygulama güvenlik doğrulama standardı | Penetration test raporları |
| **ISO 27001:2022** | Annex A kontrolleri | Bilgi güvenliği yönetimi için rehber | Güvenlik politikaları, erişim kontrol logları |

### 1.3 Veri Koruma Standartları

| Standart | Madde/Alt Madde | Uygulanabilirlik Notu | Planlanan Kanıt Kaynağı |
|----------|-----------------|----------------------|------------------------|
| **KVKK (6698 sayılı Kanun)** | Madde 4, 5, 6, 12 | Türkiye'deki kullanıcılar için veri koruma | Aydınlatma metni, açık rıza formları, VERBİS kaydı |
| **GDPR** | Madde 5, 6, 7, 17, 20 | AB kullanıcıları için veri koruma | Gizlilik politikası, veri işleme kayıtları, DPA |

### 1.4 Web Standartları

| Standart | Madde/Alt Madde | Uygulanabilirlik Notu | Planlanan Kanıt Kaynağı |
|----------|-----------------|----------------------|------------------------|
| **WCAG 2.1** | Level AA | Web erişilebilirlik standartları | Lighthouse erişilebilirlik raporları |
| **HTTP/2, TLS 1.3** | RFC 7540, RFC 8446 | Güvenli iletişim protokolleri | SSL Labs test sonuçları |

### 1.5 Kod Kalite Standartları

| Standart | Madde/Alt Madde | Uygulanabilirlik Notu | Planlanan Kanıt Kaynağı |
|----------|-----------------|----------------------|------------------------|
| **TypeScript Strict Mode** | tsconfig strict options | Tip güvenliği için zorunlu | TypeScript compiler çıktıları |
| **ESLint + Prettier** | Airbnb style guide bazlı | Kod tutarlılığı | Lint raporları, pre-commit hooks |
| **SemVer 2.0.0** | Tüm kurallar | Versiyon yönetimi | Git tag'leri, CHANGELOG |

---

## 2. Proje Kısıtları

Projeye uygulanabilir gerçekçi kısıt kategorileri ve en kritik somut kısıtlar aşağıda tanımlanmıştır.

### 2.1 Ekonomik/Finansal Kısıtlar

#### Kısıt EK-001: AI API Maliyetleri

| Özellik | Açıklama |
|---------|----------|
| **Tanım** | Anthropic Claude ve OpenAI API'leri token bazlı ücretlendirilmektedir. Her kod üretimi işlemi ortalama 2,000-10,000 token tüketmektedir. Bu, operasyonel maliyetlerin doğrudan kullanım hacmiyle orantılı artmasına neden olmaktadır. |
| **Etki Alanı** | Operasyonel maliyet, fiyatlandırma stratejisi, kar marjı |
| **Kısıt Şiddeti** | Yüksek |
| **Mevcut Durum** | Claude Sonnet: $3/1M input, $15/1M output token |
| **Doğrulama/Kanıtlama Yöntemi** | - Token kullanım dashboard'u ile gerçek zamanlı takip<br>- Aylık maliyet raporları<br>- Prompt optimizasyon testleri ile %40 maliyet düşüşü hedefi |
| **Ele Alma Stratejisi** | 1. Prompt caching ile tekrarlayan isteklerde maliyet düşürme<br>2. Complexity-based model routing (basit işler için Haiku)<br>3. Template-based generation ile token optimizasyonu |

#### Kısıt EK-002: Bootstrap Bütçe Limiti

| Özellik | Açıklama |
|---------|----------|
| **Tanım** | Proje, sınırlı başlangıç sermayesi ile bootstrap modelde geliştirilmektedir. Yıllık altyapı bütçesi ~$5,000 ile sınırlıdır. |
| **Etki Alanı** | Özellik kapsamı, ölçekleme hızı, pazarlama bütçesi |
| **Kısıt Şiddeti** | Orta |
| **Doğrulama/Kanıtlama Yöntemi** | - Aylık bütçe takibi<br>- Break-even analizi (16 kullanıcı)<br>- Unit economics izleme (LTV:CAC ratio) |
| **Ele Alma Stratejisi** | 1. MVP odaklı geliştirme<br>2. Freemium model ile organik büyüme<br>3. Open-source araçlar tercih edilmesi |

### 2.2 Teknolojik Kısıtlar

#### Kısıt TK-001: AI Model Hallucination ve Kod Kalitesi

| Özellik | Açıklama |
|---------|----------|
| **Tanım** | Large Language Model'ler (LLM) karmaşık business logic, edge case'ler ve spesifik framework kullanımlarında hatalı veya çalışmayan kod üretebilmektedir. "Hallucination" problemi nedeniyle var olmayan API'ler veya metodlar referans edilebilir. |
| **Etki Alanı** | Ürün kalitesi, kullanıcı güveni, destek yükü |
| **Kısıt Şiddeti** | Yüksek |
| **Mevcut Durum** | Claude Sonnet kod doğruluğu: ~%85-90 (basit projeler), ~%60-70 (karmaşık projeler) |
| **Doğrulama/Kanıtlama Yöntemi** | - Otomatik kod validasyon pipeline<br>- ESLint/TypeScript hata oranları<br>- Kullanıcı geri bildirim analizi<br>- A/B test ile model karşılaştırması |
| **Ele Alma Stratejisi** | 1. Multi-layer validation (syntax, security, logic)<br>2. Template-based generation ile güvenilirlik artırma<br>3. Human-in-the-loop review önerisi<br>4. Complexity sınırlama (çok karmaşık istekleri reddetme) |

#### Kısıt TK-002: API Rate Limiting

| Özellik | Açıklama |
|---------|----------|
| **Tanım** | Anthropic ve OpenAI API'leri dakika/saat bazlı istek limitleri uygulamaktadır. Yoğun kullanım dönemlerinde bu limitler aşılabilir ve kullanıcı deneyimi olumsuz etkilenebilir. |
| **Etki Alanı** | Eşzamanlı kullanıcı kapasitesi, yanıt süreleri |
| **Kısıt Şiddeti** | Orta |
| **Mevcut Durum** | Claude: 4,000 RPM (Requests Per Minute) tier-1 |
| **Doğrulama/Kanıtlama Yöntemi** | - Rate limit hit logları<br>- Queue depth monitoring<br>- P95/P99 latency metrikleri |
| **Ele Alma Stratejisi** | 1. Request queuing (BullMQ)<br>2. Multi-provider fallback chain<br>3. Kullanıcı bazlı rate limiting<br>4. Tier upgrade planlaması |

### 2.3 Yasal/Hukuksal Kısıtlar

#### Kısıt YK-001: KVKK ve GDPR Uyumu

| Özellik | Açıklama |
|---------|----------|
| **Tanım** | Platform, Türkiye'de KVKK, AB'de GDPR kapsamında kişisel veri işleme yükümlülüklerine tabidir. Kullanıcı verileri (email, projeler, kullanım alışkanlıkları) kişisel veri niteliğindedir. |
| **Etki Alanı** | Veri işleme süreçleri, kullanıcı hakları, hukuki sorumluluk |
| **Kısıt Şiddeti** | Yüksek |
| **Yasal Gereksinimler** | - Açık rıza mekanizması<br>- Aydınlatma metni<br>- Veri silme hakkı (right to erasure)<br>- Veri taşınabilirliği |
| **Doğrulama/Kanıtlama Yöntemi** | - KVKK uyum checklist<br>- Privacy impact assessment<br>- Consent kayıtları<br>- Veri işleme envanteri |
| **Ele Alma Stratejisi** | 1. Privacy by design yaklaşımı<br>2. Veri minimizasyonu<br>3. Otomatik veri silme mekanizmaları<br>4. Consent management sistemi |

### 2.4 Zaman/Süre Kısıtları

#### Kısıt ZK-001: 12 Haftalık Geliştirme Süresi

| Özellik | Açıklama |
|---------|----------|
| **Tanım** | MVP için belirlenen toplam geliştirme süresi 12 hafta (3 sprint x 4 hafta) ile sınırlıdır. Bu süre içinde temel fonksiyonlar, güvenlik önlemleri ve production-ready deployment tamamlanmalıdır. |
| **Etki Alanı** | Özellik kapsamı, kalite düzeyi, test coverage |
| **Kısıt Şiddeti** | Yüksek |
| **Mevcut Durum** | Sprint 1 (Foundation) aktif |
| **Doğrulama/Kanıtlama Yöntemi** | - Sprint burndown charts<br>- Velocity tracking<br>- Milestone completion reports<br>- Weekly standups |
| **Ele Alma Stratejisi** | 1. Strict MVP scope (must-have vs nice-to-have)<br>2. Agile metodoloji<br>3. Paralel geliştirme (4 kişilik ekip)<br>4. Technical debt backlog yönetimi |

---

## 3. Beklenen Etkiler

Aşağıda NoCodeLab projesinin ekonomik, sosyal, çevresel, hukuki, sağlık ve güvenlik temaları boyunca ileriye dönük etki beyanı sunulmaktadır.

### 3.1 Ekonomik Etkiler

**Pozitif Etkiler:**

1. **Girişimcilik Maliyetlerinin Düşürülmesi**
   - MVP geliştirme maliyeti: Geleneksel yöntem ~$5,000-15,000 → NoCodeLab ile ~$50-200
   - Zaman tasarrufu: Haftalar → Dakikalar
   - Teknik ekip ihtiyacının azalması

2. **Freelancer ve Ajans Verimliliği**
   - Prototipleme süresinin %80 kısalması
   - Daha fazla müşteri kapasitesi
   - Rekabet avantajı

3. **İstihdam Etkisi**
   - Yeni iş modelleri: AI-assisted developer rolü
   - NoCode specialist pozisyonları
   - Düşük bariyerli teknoloji girişimciliği

**Potansiyel Negatif Etkiler:**
- Junior developer iş piyasasında rekabet artışı
- Geleneksel yazılım ajanslarında iş kaybı riski

**Etki Ölçümü:**
- Kullanıcı maliyet tasarrufu anketi
- Platform üzerinden oluşturulan iş değeri takibi
- Kullanıcı başarı hikayeleri

### 3.2 Sosyal Etkiler

**Pozitif Etkiler:**

1. **Teknoloji Demokratizasyonu**
   - Kod bilgisi olmayan bireylerin dijital ürün üretebilmesi
   - Dijital okuryazarlık eşiğinin düşürülmesi
   - Kadın ve dezavantajlı grupların teknoloji erişimi

2. **Eğitim ve Öğrenme**
   - Üretilen kodun incelenerek öğrenme fırsatı
   - Programlama kavramlarına pratik giriş
   - STEM ilgisinin artırılması

3. **Küçük İşletme Dijitalleşmesi**
   - Türkiye'deki KOBİ'lerin dijital dönüşümü
   - Yerel pazarlarda rekabet gücü artışı

**Etki Ölçümü:**
- Kullanıcı demografik analizi
- İlk kez uygulama geliştiren kullanıcı oranı
- Eğitim kurumları ile işbirlikleri

### 3.3 Çevresel Etkiler

**Nötr/Düşük Etki:**

1. **Enerji Tüketimi**
   - Cloud-based altyapı: Veri merkezi optimizasyonları
   - Serverless architecture: İhtiyaç bazlı kaynak kullanımı
   - Smart suspend: Kullanılmayan uygulamaların durdurulması

2. **Karbon Ayak İzi**
   - Vercel ve Fly.io'nun yeşil enerji taahhütleri
   - AI model çağrılarının optimize edilmesi

**Etki Azaltma:**
- Green hosting sağlayıcı tercihi
- Caching ile gereksiz AI çağrılarının önlenmesi
- Kullanıcı farkındalığı (sustainability badge)

### 3.4 Hukuki Etkiler

**Uyum Gereksinimleri:**

1. **Veri Koruma**
   - KVKK ve GDPR tam uyum
   - Kullanıcı verileri Türkiye/AB lokasyonunda
   - Şeffaf veri işleme politikaları

2. **Fikri Mülkiyet**
   - Üretilen kodun %100 kullanıcıya ait olması
   - Açık lisanslama (kullanıcı istediği lisansı seçer)
   - Platform vendor lock-in olmaması

3. **Sorumluluk**
   - Üretilen kodun güvenlik sorumluluğu (disclaimer)
   - Kullanım koşulları ve sınırlamalar
   - Kabul edilemez kullanım politikası

**Etki Ölçümü:**
- Hukuki uyum denetimleri
- Kullanıcı şikayetleri/talepleri
- Regülatör iletişimleri

### 3.5 Sağlık Etkileri

**Dolaylı Pozitif Etkiler:**

1. **İş-Yaşam Dengesi**
   - Hızlı prototipleme ile çalışma saatlerinin azalması
   - Tekrarlayan görevlerin otomasyonu
   - Stress azaltma (deadline baskısının hafiflemesi)

2. **Ergonomi**
   - Responsive tasarım ile farklı cihazlardan erişim
   - Dark mode ile göz yorgunluğunun azaltılması
   - Erişilebilirlik özellikleri (WCAG uyumu)

### 3.6 Güvenlik Etkileri

**Kritik Odak Alanı:**

1. **Kod Güvenliği**
   - OWASP Top 10 otomatik tarama
   - Injection, XSS, CSRF koruması
   - Dependency vulnerability scanning

2. **Platform Güvenliği**
   - Multi-tenant izolasyon
   - Kullanıcı verisi şifreleme
   - DDoS koruması

3. **Üretilen Uygulama Güvenliği**
   - Container sandboxing
   - Network izolasyonu
   - Güvenlik best-practice'lerin uygulanması

**Etki Ölçümü:**
- Güvenlik açığı sayısı (0 kritik hedefi)
- Penetration test sonuçları
- Security incident response time

---

# PKE-Rapor (BİL496) - Planlanan Bölümler

*Aşağıdaki bölümler BİL496 sonunda doldurulacaktır.*

## 4. Standartlara Uyum Özeti

| Standart | Durum | Kanıt Referansı |
|----------|-------|-----------------|
| IEEE 830-1998 | *(BİL496'da güncellenecek)* | |
| ISO/IEC/IEEE 29148:2018 | *(BİL496'da güncellenecek)* | |
| OWASP Top 10 2021 | *(BİL496'da güncellenecek)* | |
| KVKK | *(BİL496'da güncellenecek)* | |
| GDPR | *(BİL496'da güncellenecek)* | |
| WCAG 2.1 | *(BİL496'da güncellenecek)* | |

**Durum Seçenekleri:** Uyumlu / Kısmi Uyum / Uygulanamaz

---

## 5. Kısıtların Yönetimi Özeti

*BİL496 sonunda her kısıt için:*

| Kısıt ID | Planlanan Aksiyon | Fiilen Yapılan | Sapmalar | Sonuç |
|----------|-------------------|----------------|----------|-------|
| EK-001 | *(BİL496'da doldurulacak)* | | | |
| EK-002 | *(BİL496'da doldurulacak)* | | | |
| TK-001 | *(BİL496'da doldurulacak)* | | | |
| TK-002 | *(BİL496'da doldurulacak)* | | | |
| YK-001 | *(BİL496'da doldurulacak)* | | | |
| ZK-001 | *(BİL496'da doldurulacak)* | | | |

---

## 6. Beklenen ve Gerçekleşen Etki Sonuçları

*BİL496 sonunda her etki kategorisi için:*

### 6.1 Ekonomik Etkiler

| Beklenen | Gerçekleşen | Kanıt |
|----------|-------------|-------|
| Maliyet düşürme | *(BİL496'da doldurulacak)* | |
| Verimlilik artışı | *(BİL496'da doldurulacak)* | |

### 6.2 Sosyal Etkiler

| Beklenen | Gerçekleşen | Kanıt |
|----------|-------------|-------|
| Teknoloji demokratizasyonu | *(BİL496'da doldurulacak)* | |
| Eğitim katkısı | *(BİL496'da doldurulacak)* | |

### 6.3 Kullanıcı Geri Bildirimleri

*(BİL496 sonunda eklenecek)*

### 6.4 Kullanım Metrikleri

| Metrik | Hedef | Gerçekleşen |
|--------|-------|-------------|
| Toplam kullanıcı | 100+ | *(BİL496'da)* |
| Aktif kullanıcı | 50+ | *(BİL496'da)* |
| Oluşturulan uygulama | 30+ | *(BİL496'da)* |
| NPS skoru | > 40 | *(BİL496'da)* |

---

## Ekler

### Ek A: Kısıt Değerlendirme Matrisi

| Kısıt | Şiddet | Olasılık | Risk Skoru | Öncelik |
|-------|--------|----------|------------|---------|
| EK-001 (AI Maliyet) | Yüksek | Yüksek | 9 | 1 |
| TK-001 (AI Kalite) | Yüksek | Orta | 6 | 2 |
| YK-001 (KVKK/GDPR) | Yüksek | Düşük | 4 | 3 |
| ZK-001 (Zaman) | Yüksek | Yüksek | 9 | 1 |
| TK-002 (Rate Limit) | Orta | Orta | 4 | 4 |
| EK-002 (Bütçe) | Orta | Orta | 4 | 4 |

**Risk Skoru:** Şiddet × Olasılık (1-3 ölçeği)

### Ek B: Standart Uyum Checklist

- [ ] IEEE 830 SRS formatı tamamlandı
- [ ] OWASP tarama entegre edildi
- [ ] KVKK aydınlatma metni hazırlandı
- [ ] GDPR consent mekanizması implement edildi
- [ ] WCAG AA erişilebilirlik testleri yapıldı
- [ ] TypeScript strict mode aktif
- [ ] ESLint kuralları uygulandı
- [ ] Test coverage > %80 sağlandı

---

**Doküman Sonu**

*Bu doküman NoCodeLab projesi için hazırlanmıştır. Tüm hakları saklıdır.*
