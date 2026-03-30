# TarlaSor — Teknoloji Seçimi

## Kullanılan Teknolojiler

| Katman | Teknoloji | Neden Seçildi |
|---|---|---|
| Frontend | React + Vite | Hızlı geliştirme, modern toolchain, local çalıştırma kolay |
| UI | Inline CSS (App.jsx) | Ek kurulum gerektirmeden hızlı iterasyon |
| AI | Groq API (groq-sdk) | Hızlı yanıt, Türkçe çıktı, düşük gecikme |
| Hava Durumu | Open‑Meteo (Geocoding + Forecast) | Ücretsiz, API key gerektirmez, şehir bazlı tahmin |
| Auth + Veri | Local Auth + localStorage | Kurulumsuz, çevrimdışı bile çalışır (MVP) |
| Versiyon Kontrol | GitHub | Tüm dosyaları saklamak ve teslim için |

---

## Neden Bu Teknolojiler?

**React + Vite**
Geliştirme deneyimi hızlı, proje ayağa kaldırması kolay.

**Groq (groq-sdk)**
Toprak/su analizi ve hastalık/zararlı değerlendirmesi için metin tabanlı AI yanıtları üretir. Uygulama tarafında retry + kullanıcı dostu hata mesajları ile çalışır.

**Open‑Meteo**
Şehir adı ile geocoding yapıp enlem-boylam bulur; ardından mevcut hava + 7 günlük tahmin çekilir. Kullanıcının bölgesiyle birlikte önerileri bağlamsallaştırmak için kullanılır.

**Local Auth + localStorage**
Firebase/Supabase kurulumuna girmeden MVP’yi çalışır tutar. Hesaplar ve kullanıcı bazlı veriler cihazda saklanır.

---

## Kurulum Adımları

1. Groq API anahtarını al
2. `.env` dosyasına ekle: `VITE_GROQ_API_KEY=...`
3. Bağımlılıkları kur: `npm install`
4. Çalıştır: `npm run dev`

---

## Geliştirme Ortamı

- **Editör:** Cursor (AI destekli, agent modu ile hızlı geliştirme)
- **Tarayıcı önizleme:** Localhost:5173 (Vite)
- **Paket yöneticisi:** npm

---

## Yol Haritası (Plan)

- Auth + veri katmanını Supabase'e taşıma (kayıt/giriş, geçmiş, forum)
- Forum'u ortak/gerçek zamanlı hale getirme
