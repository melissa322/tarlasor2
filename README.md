# TarlaSor Ağı

Türkiye'deki çiftçilere yönelik bölgesel ziraat asistanı ve topluluk uygulaması.

## Demo Video

- (Loom/YouTube) Link: TBD

## Yayın Linki

- (Netlify/Vercel) Link: TBD

## Özellikler

- **AI analiz asistanı**
  - Toprak / su / bitki hastalığı belirtilerini analiz eder
  - Bölge ve (varsa) hava durumuna göre prompt'u kişiselleştirir
- **Yerel forum**
  - Giriş yapan kullanıcı mesaj paylaşabilir
  - Mesajlar şehir/bölge eşleşmesine göre akıllı sıralanır
- **Kullanıcı hesabı (local, opsiyonel)**
  - **E-posta + şifre** ile kayıt/giriş
  - Misafir mod mevcut (özellikler kısıtlı)
  - **Kişiye özel geçmiş**
    - Her kullanıcının analiz geçmişi ayrı tutulur

## Teknoloji

- Frontend: **React + Vite**
- AI: **Groq API** (`groq-sdk`)
- Hava durumu: **Open‑Meteo** (şehir → geocoding → mevcut + 7 günlük tahmin)
- Veri saklama: **localStorage** (kullanıcıya özel anahtarlar)

## Kurulum

1) Bağımlılıkları yükle

```bash
npm install
```

2) Ortam değişkenleri

Proje köküne `.env` dosyası ekle (şablon: `.env.example`):

```env
VITE_GROQ_API_KEY=YOUR_GROQ_KEY
```

3) Çalıştır

```bash
npm run dev
```

Not: Hesap açmak zorunlu değil. Misafir modda uygulamayı inceleyebilirsin; geçmiş kaydı gibi özellikler kısıtlıdır.

## Local hesap / veri modeli (özet)

- Oturum:
  - `localStorage["tarlasor_session"] = { email }`
- Hesaplar:
  - `localStorage["tarlasor_accounts"]`
  - Şifreler tarayıcıda **salt + SHA-256** hash olarak tutulur (düz metin değil).
- Kullanıcı geçmişi:
  - `tarlasor_gecmis_<email>`
- Kullanıcı forum verisi:
  - `tarlasor_forum_<email>`
- Misafir forum verisi:
  - `tarlasor_forum_guest`

## Güvenlik notu

- `VITE_GROQ_API_KEY` client tarafında kullanıldığı için yayınlanan uygulamada görünür.
  - Demo için ok.
  - Üretimde: Groq çağrısını bir backend/proxy üzerinden geçirmek gerekir.

## Supabase’e geçiş

Adım adım geçiş planı: `supabase-migration.md`

## Wicked problem / “kaos” tarafı

Bu proje doğrudan şu “kötücül / karmaşık” problemlere temas ediyor:

- **Gıda güvenliği**
- **İklim krizi ve kuraklık**
- **Toprak bozunumu / verim kaybı**
- **Bilgiye erişim eşitsizliği (kırsal bölgeler)**

AI'nın yanlış/eksik yönlendirme riski olduğu için: öneriler "kesin teşhis" değil, pratik ve temkinli dille verilir.
