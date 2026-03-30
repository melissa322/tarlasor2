# TarlaSor — Geliştirme Görev Listesi

## Faz 1: Proje Kurulumu

- [x] **1.1** React projesi oluştur (Vite)
- [ ] **1.2** UI stil yaklaşımını netleştir (Inline CSS / CSS dosyası)
- [ ] **1.3** GROQ API anahtarını .env file'ına ekle (`VITE_GROQ_API_KEY`)
- [ ] **1.4** .env güvenliği: repo'da paylaşma (gitignore)

---

## Faz 2: Frontend Yapısı ve Komponentler

### 2.1 UI Temel Komponentleri
- [x] **2.1.1** Kart/Buton/Badge UI (App.jsx içinde)
- [x] **2.1.2** Loading spinner animasyonu

### 2.2 Sayfalar
- [x] **2.2.1** Ana Sayfa - Analiz kartları + "Nasıl Çalışır?" + Forum/Geçmiş
- [x] **2.2.2** Analiz Giriş Ekranı (Toprak/Su/Hastalık)
- [x] **2.2.3** Yükleniyor Ekranı
- [x] **2.2.4** Sonuç Ekranı
- [ ] **2.2.5** Hakkında Sayfası

### 2.3 Giriş Sayfası Alt Komponentleri
- [x] **2.3.1** Belirti Anlatımı Formu - metin alanı ve hızlı seçim etiketleri
- [x] **2.3.2** Lab Değerleri Formu
- [x] **2.3.3** "Tarla Zekasına Sor" ana butonu

---

## Faz 3: Tasarım ve UI/UX

### 3.1 Renk Paleti ve Tema
- [ ] **3.1.1** UI renk paletini standardize et (yeşil/toprak tonları, durum renkleri)
- [ ] **3.1.2** Durum kodlarını tanımla (İyi=yeşil, Dikkat=sarı, Kritik=kırmızı)
- [ ] **3.1.3** Font ailelerini tanımla (sade, okunabilir yazı tipleri)

### 3.2 Mobil Optimizasyonu
- [ ] **3.2.1** Tüm sayfalar responsive tasarım olacak şekilde kontrol et
- [ ] **3.2.2** Mobil ekranda yazı boyutları uygun mu kontrol et (okunabilirlik)
- [ ] **3.2.3** Dokunmatik butonlar yeterince büyük mü kontrol et
- [ ] **3.2.4** Başta mobil için tasarla, masaüstüne uyarla (mobile-first)

### 3.3 Animasyonlar ve Görseller
- [ ] **3.3.1** TarlaSor logosu oluştur ve entegre et
- [ ] **3.3.2** Yükleniyor animasyonu kodla
- [ ] **3.3.3** Geçiş animasyonları ekle (sayfa değişiklikleri)
- [ ] **3.3.4** Hızlı seçim etiketlerine hover efekti ekle

---

## Faz 4: Fotoğraf İşleme

- [ ] **4.1** (Opsiyonel) Fotoğraf yükleme akışı (şimdilik kapsam dışı)

---

## Faz 5: Form Yönetimi ve Validasyon

- [ ] **5.1** Toprak analizi formu validasyonu (lab değerleri için min/max kontrol)
- [ ] **5.2** Su kalitesi analizi formu validasyonu
- [ ] **5.3** Belirti metin alanı validasyonu (minimum karakter uzunluğu)
- [ ] **5.4** Fotoğraf validasyonu
- [ ] **5.5** Form hatası gösterimi ve kullanıcı geri bildirimi
- [ ] **5.6** Başarılı gönderim feedback'i

---

## Faz 6: Groq API Entegrasyonu

### 6.1 API Bağlantısı
- [x] **6.1.1** Groq API çağrısı (retry + backoff)
- [ ] **6.1.2** Environment variable'ları güvenli şekilde yönet
- [x] **6.1.3** Kullanıcı dostu hata mesajları

### 6.2 Sistem Mesajı ve Prompt Yapısı
- [ ] **6.2.1** Sistem mesajı kodla: "Sen Türkiye'deki çiftçilere yardımcı olan bir toprak ve su kalitesi uzmanısın..."
- [x] **6.2.2** Belirti analizi promptu
- [x] **6.2.3** Lab değerleri analizi promptu
- [x] **6.2.4** Hastalık/zararlı (IPM) promptu

### 6.3 Çıktı Formatı
- [ ] **6.3.1** API'den gelen yanıtı JSON formatına parse et
- [ ] **6.3.2** Yapılandırılmış çıktı şeması oluştur (durum, parametreler, öneriler)
- [ ] **6.3.3** Yanıtı frontend'de gösterim için işle

---

## Faz 7: Sonuç Ekranı Geliştirmesi

### 7.1 Sonuç Ekranı Bileşenleri
- [ ] **7.1.1** Genel Durum Kartı (İyi/Dikkat/Kritik + renk kodlama)
- [ ] **7.1.2** Parametre Kartları (parametre adı, değer, durum, açıklama)
- [ ] **7.1.3** Eylem Önerileri Bölümü (sıralı madde listesi)
- [ ] **7.1.4** "Yeni Analiz Yap" Butonu

### 7.2 Veri Gösterimi
- [ ] **7.2.1** Sonuç verilerini duruma göre renklendir
- [ ] **7.2.2** Her parametre için açıklamayı sade Türkçeyle göster (teknik terim yok)
- [ ] **7.2.3** Önerileri kolayca okunabilir formatında göster
- [ ] **7.2.4** Sonuca geri dönüş (kaydırma veya buton)

---

## Faz 8: Hakkında Sayfası

- [ ] **8.1** TarlaSor'un nedir açıklaması
- [ ] **8.2** Kimlere yönelik olduğu anlatımı
- [ ] **8.3** Nasıl kullanılır (3 adım: Gir → Analiz Et → Öğren)
- [ ] **8.4** Geri bildirim formu bağlantısı/integrasyonu
- [ ] **8.5** İletişim bilgileri (varsa)

---

## Faz 9: Veri Yönetimi ve State Management

- [x] **9.1** Analiz giriş verilerini state'te sakla (metin, lab değerleri)
- [x] **9.2** Analiz sonuçlarını kullanıcı bazlı localStorage'da sakla (geçmiş)
- [x] **9.3** İşlem sırası: ekran yönetimi
- [x] **9.4** Local auth + session yönetimi

## Faz 9B: Hava Durumu

- [x] **9B.1** Şehir adı → geocoding ile enlem/boylam bul
- [x] **9B.2** Mevcut hava + 7 günlük tahmin çek (Open‑Meteo)
- [x] **9B.3** Ana sayfada göster

## Faz 9C: Forum

- [x] **9C.1** Kullanıcı bazlı forum verisini localStorage'da sakla
- [x] **9C.2** Şehir/bölgeye göre sıralama
- [ ] **9C.3** (Plan) Supabase ile gerçek zamanlı ortak forum

---

## Faz 10: Hata Yönetimi ve Kullanıcı Geri Bildirimi

- [ ] **10.1** API hatalarının görüntülenmesi (kullanıcı dostu hata mesajları)
- [ ] **10.2** Ağ bağlantısı sorunu algılaması
- [ ] **10.3** Validation hatalarının gösterimi
- [ ] **10.4** Başarı mesajları ve animasyonları
- [ ] **10.5** Kullanıcıya yüklenme tahmini zaman göster (5-10 saniye)

---

## Faz 11: Test ve Kalite Kontrol

### 11.1 Fonksiyonel Test
- [ ] **11.1.1** Toprak analizi akışını test et (baştan sona)
- [ ] **11.1.2** Su kalitesi analizi akışını test et
- [ ] **11.1.3** Fotoğraf yükleme fonksiyonelliği test et
- [ ] **11.1.4** Lab değerleri girişi ve validasyonu test et
- [ ] **11.1.5** API entegrasyonu test et (gerçek Groq API çağrıları)

### 11.2 Responsive Tasarım Testi
- [ ] **11.2.1** Mobil cihazlarda test et (320px, 480px, 768px)
- [ ] **11.2.2** Tablet ekranlarda test et
- [ ] **11.2.3** Masaüstü ekranlarda test et
- [ ] **11.2.4** Farklı tarayıcılarla test et (Chrome, Safari, Firefox)

### 11.3 Kullanıcı Deneyimi Testi
- [ ] **11.3.1** Yazı tipleri yeterince okunabilir mi kontrol et
- [ ] **11.3.2** Butonlar dokunmatik cihazlarda uygun boyutta mı
- [ ] **11.3.3** Yükleniyor mesajları anlaşılır ve düzgün mi
- [ ] **11.3.4** Sonuç ekranı açık ve anlaşılır mı

### 11.4 Güvenlik Testi
- [ ] **11.4.1** API anahtarı emniyetli şekilde saklanıyor mu
- [ ] **11.4.2** Fotoğraf verisi güvenli şekilde gönderiliyor mu
- [ ] **11.4.3** Giriş değerleri sanitize edilmiş mi (XSS koruması)

---

## Faz 12: Optimizasyon ve Performans

- [ ] **12.1** Fotoğraf yüklemesini optimize et (sıkıştırma, boyut)
- [ ] **12.2** Bundle size'ı kontrol et ve minimize et
- [ ] **12.3** API çağrılarının hızını ölç ve iyileştir
- [ ] **12.4** Sayfa yükleme sürelerini optimize et
- [ ] **12.5** Lazy loading varsa gerekli yerlerde uygula

---

## Faz 13: Dağıtım (Deployment)

- [ ] **13.1** Projeyi Netlify/Vercel'e hazırla
- [ ] **13.2** Production environment variables'ları ayarla
- [ ] **13.3** Custom domain bağlantısı (varsa)
- [ ] **13.4** SSL sertifikası kontrol et
- [ ] **13.5** Canlı ortamda son kontrolü yap
- [ ] **13.6** Canlı yayınlama

---

## Faz 14: Kurulum Sonrası ve Bakım

- [ ] **14.1** Kullanıcı geri bildirimleri topla
- [ ] **14.2** Hata loglarını izle
- [ ] **14.3** Performans metriklerini izle
- [ ] **14.4** Gerekli hatalar ve optimizasyonlar için update planı yap

---

## Başarı Kriterleri Kontrol Listesi

- [ ] Kullanıcı uygulamayı açıp bilgisini girdikten sonra 1 dakika içinde sonuç alır
- [ ] Sonuçta ne sorun olduğu açıkça anlaşılır
- [ ] Sorunun neden kaynaklandığı sade Türkçeyle anlatılır
- [ ] Ne yapılması gerektiği (bu hafta yapılacak adımlar) somuttur
- [ ] Arayüz mobil telefonlarda tam olarak çalışır
- [ ] Tüm yazılar okunabilir boyuttadır

---

## Notlar

- **Dil:** Tüm UI ve mesajlar Türkçe olacak
- **Hızlılık:** API yanıtı 5-10 saniye içinde hedef
- **Basitlik:** Teknik terim kullanılmayacak, her şey sade ve anlaşılır olacak
- **Erişilebilirlik:** Ucuz ve erişebilir çözümler önerilecek

---

## Dokümantasyon ve Geçiş Planı

- [ ] README / PRD / Tech Stack / User Flow dokümanlarını güncel tut
- [ ] Supabase'e geçiş planı (auth + veri) ve uygulama
