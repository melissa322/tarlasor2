# TarlaSor — Supabase’e Geçiş Planı (Auth + Veri)

Bu doküman mevcut TarlaSor MVP’sini (local auth + localStorage + Groq + Open‑Meteo) bozmadan, adım adım Supabase’e taşıma planıdır.

## 1) Hedef Mimari

- **Auth:** Supabase Auth (email + password)
- **Veri:** Supabase Postgres
  - Analiz geçmişi
  - Forum mesajları
  - Kullanıcı profili (şehir, bölge, gizlilik)
- **RLS:** Kullanıcı bazlı erişim (history/profile) + forum için kural seti

## 2) Supabase Projesi Kurulumu

- Supabase’te yeni proje oluştur
- Project URL ve anon key al
- Frontend için env:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Not: Bunlar da client’ta görünebilir; ama anon key zaten bu amaçla var. RLS doğru kurulmalı.

## 3) Veri Modeli (Tablolar)

### 3.1 `profiles`

- `id` uuid (PK) -> `auth.users.id` ile aynı
- `ad` text
- `sehir` text
- `bolge` text
- `gizlilik` boolean
- `created_at` timestamptz default now()

### 3.2 `analysis_history`

- `id` uuid (PK) default gen_random_uuid()
- `user_id` uuid (FK -> auth.users.id)
- `analiz_tur` text ("toprak" | "su" | "hastalik")
- `metin` text (kullanıcının yazdığı belirti)
- `lab` jsonb (lab değerleri)
- `sonuc` jsonb (AI JSON çıktısı)
- `created_at` timestamptz default now()

### 3.3 `forum_posts`

- `id` uuid (PK) default gen_random_uuid()
- `user_id` uuid (FK -> auth.users.id) nullable (misafir için opsiyonel; istenirse misafir yazma kapatılır)
- `ad` text
- `sehir` text
- `bolge` text
- `gizli` boolean
- `metin` text
- `created_at` timestamptz default now()

## 4) RLS (Row Level Security) Politikaları

### 4.1 `profiles`

- Enable RLS
- **Select:** `auth.uid() = id`
- **Insert:** `auth.uid() = id`
- **Update:** `auth.uid() = id`

### 4.2 `analysis_history`

- Enable RLS
- **Select:** `auth.uid() = user_id`
- **Insert:** `auth.uid() = user_id`
- **Delete/Update:** `auth.uid() = user_id`

### 4.3 `forum_posts`

İki seçenek:

- Seçenek A (kolay): Forum herkes okuyabilir, sadece giriş yapan yazar
  - Enable RLS
  - **Select:** `true`
  - **Insert:** `auth.uid() = user_id`
  - **Update/Delete:** `auth.uid() = user_id`

- Seçenek B (anon yazma yok): `user_id` NOT NULL ve insert tamamen auth’a bağlı

## 5) Taşıma Stratejisi (Sıra Önemli)

### Adım 1 — Supabase client (frontend)

- `@supabase/supabase-js` ekle
- `src/supabaseClient.js` oluştur
- Env’leri bağla

### Adım 2 — Auth geçişi

- Karşılama ekranındaki local auth yerine Supabase Auth:
  - `signUp({ email, password })`
  - `signInWithPassword({ email, password })`
  - `signOut()`
- Session yönetimi: Supabase session’ı dinle (`onAuthStateChange`)

### Adım 3 — Profil

- Kayıt sonrası `profiles` tablosuna insert
- Uygulama açılışında `profiles` tablosundan çek

### Adım 4 — Geçmiş

- Analiz sonucu geldikten sonra `analysis_history` insert
- Geçmiş ekranında `analysis_history` select
- LocalStorage geçmişi:
  - İlk açılışta (bir kere) localStorage’daki geçmişi Supabase’e “import” etmeyi opsiyonel yap

### Adım 5 — Forum

- Forum ekranında `forum_posts` select
- Yeni mesajda insert
- (İsteğe bağlı) realtime: `supabase.channel(...).on('postgres_changes', ...)`

## 6) Mevcut localStorage’dan Migrasyon (Opsiyonel)

- Kullanıcı ilk kez Supabase’e giriş yaptığında:
  - `tarlasor_gecmis_<email>` okunur
  - satır satır `analysis_history` insert
  - başarılı olunca local key temizlenebilir (kullanıcıya sorarak)

## 7) Güvenlik Notları

- Groq çağrısı client’ta ise `VITE_GROQ_API_KEY` görünür; prod’da ideal çözüm backend/proxy.
- Supabase’te ana güvenlik RLS’dedir; anon key sızıntı değil, yanlış RLS risktir.

## 8) Çıkış Kriteri (Done Tanımı)

- Kayıt/giriş/çıkış Supabase ile çalışıyor
- Profil Supabase’te saklanıyor
- Geçmiş kullanıcıya özel ve Supabase’ten geliyor
- Forum ortak ve güncel, en azından read/write çalışıyor
