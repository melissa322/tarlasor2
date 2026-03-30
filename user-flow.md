# TarlaSor — Kullanıcı Akışı

## Genel Akış

```
Uygulama Açılır
      ↓
Karşılama / Giriş / Kayıt
      ↓
Ana Sayfa
(Hava Durumu + Forum + Geçmiş + Analiz Kartları)
      ↓
Analiz Giriş Ekranı
(Belirti Anlat / Lab Değerleri)
      ↓
Analiz Ekranı
(Yükleniyor animasyonu)
      ↓
Sonuç Ekranı
(Durum + Açıklama + Eylem Önerileri)
      ↓
"Yeni Analiz Yap" → Ana Sayfaya Döner
```

---

## Adım Adım Akış

### 1. Uygulama Açılır → Karşılama / Giriş
- Kullanıcı TarlaSor'u açar
- Giriş yapabilir, kayıt olabilir veya misafir olarak inceleyebilir
- Kayıt sırasında şehir seçilir ve forum gizlilik tercihi belirlenir

### 2. Giriş Sonrası → Ana Sayfa
- Kullanıcı selamlanır
- Giriş yapıldıysa şehir/bölge görünür
- Giriş yapıldıysa mevcut hava + 7 günlük hava tahmini görünür
- Forum ve Geçmiş ekranlarına erişim vardır
- Analiz kartlarından biri seçilir:
  - 🌱 Toprak
  - 💧 Su
  - 🍂 Hastalık/Zararlı

### 3. Analiz Girişi → Analiz
- Kullanıcı belirti yazar ve/veya lab değerlerini girer
- "Tarla Zekasına Sor" ile AI analizi başlatılır
- Yükleniyor ekranı gösterilir

### 4. Sonuç Ekranı
- **Genel Durum Kartı** — renk kodlu: 
  - 🟢 İyi
  - 🟡 Dikkat
  - 🔴 Kritik
- **Parametre Kartları** — her değer için ayrı kart, bir cümle açıklama
- **Eylem Önerileri** — sıralı madde listesi, sade Türkçe
- **"Yeni Analiz Yap"** butonu → Ana sayfaya döner

### 5. Geçmiş
- Giriş yapan kullanıcıların analizleri cihazda (localStorage) saklanır
- Geçmiş ekranından önceki sonuçlar görüntülenebilir ve istenirse temizlenebilir

### 6. Yerel Forum
- Mesajlar önce kullanıcının şehrine, sonra bölgesine göre öne çıkar
- Misafirler okuyabilir; yazmak için giriş gerekir

### 5. Hakkında Sayfası (Menüden Erişilir)
- TarlaSor nedir
- Nasıl kullanılır
- Geri bildirim formu bağlantısı

---

## Hata Durumları

| Durum | Ne Olur |
|---|---|
| Hiçbir giriş yapılmadı | "Analiz Et" butonu pasif kalır |
| AI yanıt vermedi | "Bağlantı hatası, lütfen tekrar deneyin" mesajı |
| Geçersiz lab değeri | İlgili alanın altında kırmızı uyarı çıkar |
