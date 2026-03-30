# TarlaSor — Ürün Gereksinim Belgesi (PRD)

## Genel Bakış

TarlaSor, Türkiye'deki küçük ve orta ölçekli çiftçilere yönelik AI destekli bir toprak ve su kalitesi analiz asistanıdır. Çiftçi belirtilerini yazarak ve/veya lab test değerlerini girerek tarlasında ve sulama suyunda ne gibi sorunlar olduğunu öğrenir; sade Türkçeyle somut eylem önerileri alır. Teknik bilgi, sensör veya abonelik gerekmez.

TarlaSor'un bu sürümü MVP olarak **local (cihaz içi) hesap sistemi** ve **localStorage** ile çalışır. Kullanıcı isterse kayıt/giriş yapar ve geçmişi cihazında saklanır; isterse misafir olarak uygulamayı inceler.

---

## Kullanıcı Profili

- Türkiye'de küçük ve orta ölçekli araziye sahip çiftçiler
- Akıllı telefonu olan ancak teknik tarım bilgisi olmayan kullanıcılar
- İki farklı kullanıcı tipi:
  - **Belirti ile gelen:** Sararan yaprak, kuruyan bitki, verimsiz toprak gibi gözlemlerini anlatır
  - **Lab sonucu ile gelen:** Elinde pH, EC, SAR gibi değerler var ama ne anlama geldiğini bilmiyor

---

## Kapsam

Uygulama üç ana alanı kapsar:

1. **Toprak Analizi** — Belirti anlatımı ve/veya lab değerleri ile toprağın durumu
2. **Su Kalitesi Analizi** — Sulama suyunun bitkiye ve toprağa etkisi
3. **Bitki Hastalığı / Zararlı Değerlendirmesi** — Belirtiye göre olası hastalık/zararlı + önleme + entegre mücadele önerileri

Her iki alanda da AI şu üç soruyu yanıtlar:
- Ne oluyor?
- Neden oluyor?
- Ne yapmalısın?

---

## Ekranlar ve İşlevler

### Ekran 1 — Ana Sayfa
- Kullanıcı selamlama + şehir/bölge bilgisi (giriş yapıldıysa)
- Mevcut hava özeti (giriş yapıldıysa)
- **7 günlük hava tahmini** (giriş yapıldıysa)
- Analiz kartları:
  - 🌱 **Toprağımı Analiz Et**
  - 💧 **Sulama Suyumu Analiz Et**
  - 🍂 **Bitki Hastalığı Tespiti**
- "Nasıl Çalışır?" adım adım açıklama
- "Yerel Forum" ve "Geçmişim" erişimi

### Ekran 2 — Giriş Ekranı (Toprak veya Su için ayrı ayrı)
Kullanıcı iki yöntemden birini veya birden fazlasını seçebilir:

**Yöntem A — Belirti Anlat**
- Serbest metin kutusu: "Tarlada ne gözlemliyorsunuz?"
- Hızlı seçim etiketleri: Sararan yaprak / Solgun bitki / Kuruyan toprak / Beyaz leke / Diğer

**Yöntem B — Lab Değerlerini Gir**
- Toprak için: pH, EC, SAR, Organik Madde, Kireç
- Su için: pH, EC, SAR, Klor, Sodyum, Bikarbonat

Not: Bu MVP sürümünde fotoğraf yükleme akışı kapsam dışıdır.

"Analiz Et" butonu — tüm girişleri AI'ya gönderir

### Ekran 3 — Analiz Ekranı
- Yükleniyor animasyonu
- "TarlaSor analiz yapıyor..." mesajı
- Tahmini süre: 5-10 saniye

### Ekran 4 — Sonuç Ekranı
- **Genel Durum Kartı:** İyi / Dikkat / Kritik (renk kodlu: yeşil / sarı / kırmızı)
- **Parametre Listesi:** Her değer için ayrı kart
  - Değer adı + okunan değer
  - Durum rozeti (İyi / Dikkat / Kritik)
  - Bir cümle açıklama (teknik terim yok)
- **Eylem Önerileri Bölümü:**
  - Sıralı madde listesi: "1. Bu hafta şunu yap, 2. Sonra bunu yap..."
  - Ucuz, erişilebilir, uygulanabilir adımlar
- "Yeni Analiz Yap" butonu

### Ekran 5 — Hakkında
- TarlaSor nedir, kim için yapılmıştır
- Nasıl kullanılır (kısa rehber)
- Geri bildirim formu bağlantısı

### Ekran 6 — Karşılama / Giriş / Kayıt
- Local (cihaz içi) e-posta/şifre ile kayıt
- Kayıt sırasında şehir seçimi + forum gizlilik tercihi
- Misafir olarak inceleme

### Ekran 7 — Yerel Forum
- Mesajlar öncelikle kullanıcının şehrine göre, sonra bölgesine göre sıralanır
- Misafirler okuyabilir, yazmak için giriş gerekir

---

## AI Entegrasyonu

- **Model:** Groq (örn. `llama-3.3-70b-versatile`)
- **Giriş:** Serbest metin + (varsa) lab değerleri + (giriş yaptıysa) bölge/hava bağlamı
- **Çıktı formatı:** Yapılandırılmış JSON — durum, parametre listesi, eylem önerileri
- **Dil:** Türkçe

---

## Tasarım İlkeleri

- Hem kırsal çiftçiye hem genç kullanıcıya hitap eden temiz ve modern arayüz
- Büyük ve okunabilir yazı tipleri
- Yeşil ve toprak tonları renk paleti
- Mobil öncelikli tasarım (çiftçi telefondan kullanır)
- Teknik terim yok, her şey sade Türkçe

---

## Teknik Gereksinimler

- **Frontend:** React + Vite
- **AI:** Groq API
- **Deploy:** Netlify/Vercel (isteğe bağlı)
- **Mobil uyum:** Zorunlu

---

## Başarı Kriteri

Kullanıcı uygulamayı açıp bilgisini girdikten sonra 1 dakika içinde şunu anlayabilmeli:
- Toprağımda / suyumda ne sorun var
- Bu neden oluyor
- Bu hafta ne yapmalıyım
