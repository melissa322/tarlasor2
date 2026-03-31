import { useState, useEffect, useRef, memo, useMemo, useCallback } from "react";
import Groq from "groq-sdk";
import { supabase } from "./supabaseClient";
// Background image'ı lazy load için
const tarlaAi = "./assets/tarla_ai.png";

// Groq client'ı proxy ile tanımla
const getGroqClient = () => {
  return new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
    // CORS proxy kullanarak Türkiye'de çalışacak
    baseURL: import.meta.env.DEV ? 
      undefined : 
      'https://cors-anywhere.herokuapp.com/https://api.groq.com/openai/v1'
  });
};


const BOLGELER = {
  "Marmara": ["İstanbul", "Bursa", "Kocaeli", "Balıkesir", "Tekirdağ", "Çanakkale", "Edirne", "Kırklareli", "Sakarya", "Yalova", "Bilecik"],
  "Ege": ["İzmir", "Manisa", "Aydın", "Denizli", "Muğla", "Afyonkarahisar", "Kütahya", "Uşak"],
  "İç Anadolu": ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas", "Kırıkkale", "Aksaray", "Karaman", "Kırşehir", "Niğde", "Nevşehir", "Yozgat", "Çankırı"],
  "Akdeniz": ["Antalya", "Adana", "Mersin", "Hatay", "Kahramanmaraş", "Osmaniye", "Burdur", "Isparta"],
  "Karadeniz": ["Trabzon", "Samsun", "Zonguldak", "Rize", "Ordu", "Giresun", "Tokat", "Amasya", "Çorum", "Kastamonu", "Karabük", "Sinop", "Artvin", "Gümüşhane", "Bayburt", "Bartın", "Bolu", "Düzce"],
  "Doğu Anadolu": ["Erzurum", "Van", "Malatya", "Elazığ", "Erzincan", "Kars", "Ağrı", "Muş", "Bitlis", "Bingöl", "Tunceli", "Hakkari", "Iğdır", "Şırnak", "Ardahan"],
  "Güneydoğu Anadolu": ["Gaziantep", "Şanlıurfa", "Diyarbakır", "Mardin", "Batman", "Adıyaman", "Siirt", "Kilis", "Şırnak"]
};


const getBolge = (sehir) => Object.keys(BOLGELER).find(b => BOLGELER[b].includes(sehir)) || "Bilinmiyor";

const normalizeEmail = (email) => (email || "").trim().toLowerCase();

const getAccountStore = () => {
  try {
    return JSON.parse(localStorage.getItem("tarlasor_accounts") || "{}");
  } catch {
    return {};
  }
};

const setAccountStore = (data) => {
  localStorage.setItem("tarlasor_accounts", JSON.stringify(data));
};

const randomSalt = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
};

const sha256Hex = async (text) => {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
};

const historyKeyForUser = (email) => `tarlasor_gecmis_${normalizeEmail(email)}`;
const forumKeyForUser = (email) => `tarlasor_forum_${normalizeEmail(email)}`;
const sessionKey = "tarlasor_session";

const App = memo(function App() {
  // Sehirleri memoize edelim
  const SEHIRLER = useMemo(() => 
    Object.keys(BOLGELER).reduce((acc, bolge) => [...acc, ...BOLGELER[bolge]], []).sort((a,b) => a.localeCompare(b, 'tr')), []
  );

  const [ekran, setEkran] = useState("loader"); // loader -> karsilama -> anasayfa -> giris -> yukleniyor -> sonuc | gecmis | forum
  const [kullanici, setKullanici] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const guestModeRef = useRef(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const recoveryModeRef = useRef(false);
  const [analiz, setAnaliz] = useState("toprak");
  const [metin, setMetin] = useState("");
  const [labDegerleri, setLabDegerleri] = useState({ ph: "", ec: "", sar: "", organik: "", klor: "", sodyum: "" });
  const [sonuc, setSonuc] = useState(null);
  const [gecmis, setGecmis] = useState([]);
  const [forumMesajlari, setForumMesajlari] = useState([]);
  const [havaDurumu, setHavaDurumu] = useState(null);
  const [havaTahmin, setHavaTahmin] = useState([]);
  const [bilgiAcik, setBilgiAcik] = useState(false);
  const [sifreUnuttumAcik, setSifreUnuttumAcik] = useState(false);
  const [resetBilgi, setResetBilgi] = useState("");
  const [yeniSifre, setYeniSifre] = useState("");
  const [yeniSifre2, setYeniSifre2] = useState("");
  
  const [forumInput, setForumInput] = useState("");
  const [ayarSehir, setAyarSehir] = useState("Ankara");
  const [ayarTelefon, setAyarTelefon] = useState("");
  const [ayarSehirGorunsun, setAyarSehirGorunsun] = useState(true);
  const [, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [noktalar, setNoktalar] = useState(0);

  const [authMod, setAuthMod] = useState("login"); // login | register
  const [authEmail, setAuthEmail] = useState("");
  const [authSifre, setAuthSifre] = useState("");
  const [authIslemde, setAuthIslemde] = useState(false);

  // Karsilama Login Form State
  const [loginAd, setLoginAd] = useState("");
  const [loginSehir, setLoginSehir] = useState("Ankara");
  const [loginGizli, setLoginGizli] = useState(false);

  useEffect(() => {
    guestModeRef.current = guestMode;
  }, [guestMode]);

  useEffect(() => {
    recoveryModeRef.current = recoveryMode;
  }, [recoveryMode]);

  useEffect(() => {
    if (ekran === "anasayfa" && !kullanici && !guestMode) {
      setEkran("karsilama");
    }
  }, [ekran, kullanici, guestMode]);

  useEffect(() => {
    let sub = null;

    const fetchProfile = async (userId) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, ad, sehir, bolge, gizlilik")
        .eq("id", userId)
        .single();
      if (error) return null;
      return data;
    };

    const fetchForum = async () => {
      const { data, error } = await supabase
        .from("forum_posts")
        .select("id, user_id, ad, sehir, bolge, gizli, metin, created_at")
        .order("created_at", { ascending: false })
        .limit(20); // 20'ye düşürdük
      if (error) {
        setForumMesajlari([]);
        return [];
      }
      const mapped = (data || []).map((m) => ({
        id: m.id,
        ad: m.ad,
        sehir: m.sehir,
        bolge: m.bolge,
        gizli: m.gizli,
        metin: m.metin,
        tarih: m.created_at ? new Date(m.created_at).getTime() : Date.now(),
        email: null,
      }));
      setForumMesajlari(mapped);
      return mapped;
    };

    const startSupabase = async () => {
      try {
        const raw = `${window.location.search || ""}${window.location.hash || ""}`;
        const isRecovery = /type=recovery/i.test(raw) || /access_token=/i.test(raw) || /refresh_token=/i.test(raw) || /\bcode=/i.test(raw);
        if (isRecovery) {
          setRecoveryMode(true);
          setHata("");
          setResetBilgi("");
          setYeniSifre("");
          setYeniSifre2("");

          try {
            const params = new URLSearchParams(window.location.search || "");
            const code = params.get("code");
            if (code) {
              await supabase.auth.exchangeCodeForSession(code);
              try {
                window.history.replaceState({}, document.title, window.location.origin);
              } catch {
                // noop
              }
            } else {
              await supabase.auth.getSession();
            }
          } catch (e) {
            setHata(e?.message || "Şifre yenileme bağlantısı doğrulanamadı.");
          }

          setEkran("sifreYenile");
          return;
        }

        const { data } = await supabase.auth.getSession();
        const sess = data?.session || null;

        if (sess?.user) {
          setGuestMode(false);
          const email = normalizeEmail(sess.user.email || "");
          const profile = await fetchProfile(sess.user.id);
          const md = sess.user.user_metadata || {};
          const mdSehir = md?.sehir || "";
          const sehirNew = profile?.sehir || mdSehir || "";
          const bolgeNew = profile?.bolge || md?.bolge || (sehirNew ? getBolge(sehirNew) : "");
          const gizlilikNew = typeof profile?.gizlilik === "boolean" ? profile.gizlilik : (md?.gizlilik == null ? undefined : Boolean(md?.gizlilik));
          const adNew = profile?.ad || md?.ad || email.split("@")[0] || "Çiftçi";
          const telefonNew = md?.telefon || "";
          setKullanici((prev) => {
            const sehir = sehirNew || prev?.sehir || "";
            const bolge = bolgeNew || prev?.bolge || (sehir ? getBolge(sehir) : "");
            const gizlilik = typeof gizlilikNew === "boolean" ? gizlilikNew : (typeof prev?.gizlilik === "boolean" ? prev.gizlilik : false);
            return {
              email,
              id: sess.user.id,
              ad: adNew || prev?.ad || "Çiftçi",
              sehir,
              bolge,
              gizlilik,
              telefon: telefonNew || prev?.telefon || "",
            };
          });
          await fetchForum();
          setTimeout(() => setEkran("anasayfa"), 300);
          return;
        }

        setKullanici(null);
        setGecmis([]);
        await fetchForum();
        setTimeout(() => setEkran("karsilama"), 300);
      } catch {
        setKullanici(null);
        setGecmis([]);
        setForumMesajlari([]);
        setTimeout(() => setEkran("karsilama"), 300);
      }
    };

    startSupabase();

    sub = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        guestModeRef.current = false;
        recoveryModeRef.current = false;
        setGuestMode(false);
        setRecoveryMode(false);
        setKullanici(null);
        setGecmis([]);
        await fetchForum();
        setEkran("karsilama");
        return;
      }

      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
        setHata("");
        setResetBilgi("");
        setYeniSifre("");
        setYeniSifre2("");
        setEkran("sifreYenile");
        return;
      }

      if (session?.user) {
        setGuestMode(false);
        const email = normalizeEmail(session.user.email || "");
        const profile = await fetchProfile(session.user.id);
        const md = session.user.user_metadata || {};
        const mdSehir = md?.sehir || "";
        const sehirNew = profile?.sehir || mdSehir || "";
        const bolgeNew = profile?.bolge || md?.bolge || (sehirNew ? getBolge(sehirNew) : "");
        const gizlilikNew = typeof profile?.gizlilik === "boolean" ? profile.gizlilik : (md?.gizlilik == null ? undefined : Boolean(md?.gizlilik));
        const adNew = profile?.ad || md?.ad || email.split("@")[0] || "Çiftçi";
        const telefonNew = md?.telefon || "";
        setKullanici((prev) => {
          const sehir = sehirNew || prev?.sehir || "";
          const bolge = bolgeNew || prev?.bolge || (sehir ? getBolge(sehir) : "");
          const gizlilik = typeof gizlilikNew === "boolean" ? gizlilikNew : (typeof prev?.gizlilik === "boolean" ? prev.gizlilik : false);
          return {
            email,
            id: session.user.id,
            ad: adNew || prev?.ad || "Çiftçi",
            sehir,
            bolge,
            gizlilik,
            telefon: telefonNew || prev?.telefon || "",
          };
        });
        await fetchForum();
        if (recoveryModeRef.current) {
          setEkran("sifreYenile");
        } else {
          setEkran("anasayfa");
        }
        return;
      }

      setKullanici(null);
      setGecmis([]);
      await fetchForum();
      if (recoveryModeRef.current) {
        setEkran("sifreYenile");
      } else {
        setEkran(guestModeRef.current ? "anasayfa" : "karsilama");
      }
    });

    return () => {
      try {
        sub?.data?.subscription?.unsubscribe?.();
      } catch {
        // noop
      }
    };
  }, []);

  useEffect(() => {
    if (ekran === "yukleniyor") {
      const t = setInterval(() => setNoktalar(n => (n + 1) % 4), 500);
      return () => clearInterval(t);
    }
  }, [ekran]);

  // Hava Durumu Kodunu Emojili Metne Çeviren Yardımcı
  const getHavalar = (code) => {
    if(code === 0) return "☀️ Güneşli";
    if(code <= 3) return "☁️ Parçalı Bulutlu";
    if(code === 45 || code === 48) return "🌫️ Sisli";
    if(code >= 51 && code <= 67) return "🌧️ Yağmurlu";
    if(code >= 71 && code <= 77) return "❄️ Karlı";
    if(code >= 95) return "⛈️ Fırtınalı";
    return "🌤️ Açık";
  };

  useEffect(() => {
    if (kullanici && kullanici.sehir) {
       // Open-Meteo'dan sehri enlem-boylama cevir ve havayı çek
       fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${kullanici.sehir}&count=1&language=tr&format=json`)
        .then(r => r.json())
        .then(d => {
           if (d.results && d.results.length > 0) {
              const { latitude, longitude } = d.results[0];
              fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`)
               .then(r => r.json())
               .then(wd => {
                 setHavaDurumu(wd.current_weather);

                 const daily = wd?.daily;
                 if (daily?.time?.length) {
                   const list = daily.time.map((t, i) => ({
                     tarih: t,
                     weathercode: daily.weathercode?.[i],
                     max: daily.temperature_2m_max?.[i],
                     min: daily.temperature_2m_min?.[i],
                     yagis: daily.precipitation_sum?.[i],
                   }));
                   setHavaTahmin(list.slice(0, 7));
                 } else {
                   setHavaTahmin([]);
                 }
               });
           }
        })
        .catch(e => console.error("Hava durumu çekilemedi:", e));
    }
  }, [kullanici]);

  const girisYap = () => {
    setHata("Bu işlem için giriş/kayıt yapmalısınız.");
  };

  const misafirGirisi = () => {
    setKullanici(null);
    setGuestMode(true);
    setEkran("anasayfa");
  };

  const ayarlariAc = () => {
    if (!kullanici) return;
    setAyarSehir(kullanici.sehir || "Ankara");
    setAyarTelefon(kullanici.telefon || "");
    setAyarSehirGorunsun(!kullanici.gizlilik);
    setHata("");
    setResetBilgi("");
    setEkran("ayarlar");
  };

  const ayarlariKaydet = async () => {
    if (!kullanici?.id) return;
    const sehir = ayarSehir;
    const bolge = getBolge(sehir);
    const gizlilik = !ayarSehirGorunsun;

    setAuthIslemde(true);
    setHata("");
    setResetBilgi("");
    try {
      const { error: mdErr } = await supabase.auth.updateUser({
        data: {
          ad: kullanici.ad,
          sehir,
          bolge,
          gizlilik,
          telefon: (ayarTelefon || "").trim(),
        },
      });
      if (mdErr) {
        setHata(mdErr.message || "Ayarlar kaydedilemedi.");
        return;
      }

      try {
        await supabase.from("profiles").upsert({
          id: kullanici.id,
          ad: kullanici.ad,
          sehir,
          bolge,
          gizlilik,
        });
      } catch {
        // noop
      }

      setKullanici((prev) => ({
        ...(prev || {}),
        sehir,
        bolge,
        gizlilik,
        telefon: (ayarTelefon || "").trim(),
      }));
      setResetBilgi("Ayarların kaydedildi.");
      setTimeout(() => setEkran("anasayfa"), 500);
    } catch (e) {
      setHata(e?.message || "Ayarlar kaydedilemedi.");
    } finally {
      setAuthIslemde(false);
    }
  };

  const cikisYap = async () => {
    setAuthIslemde(true);
    setHata("");
    try {
      guestModeRef.current = false;
      recoveryModeRef.current = false;
      setGuestMode(false);
      setRecoveryMode(false);
      const { error } = await supabase.auth.signOut();
      if (error) {
        setHata(error.message || "Çıkış yapılamadı.");
        return;
      }
      setKullanici(null);
      setGecmis([]);
      setEkran("karsilama");
      setAuthEmail("");
      setAuthSifre("");
      setAuthMod("login");
    } catch (e) {
      setHata(e?.message || "Çıkış yapılamadı.");
    } finally {
      setAuthIslemde(false);
    }
  };

  const supabaseKayitOl = async () => {
    if (!authEmail.trim() || !authSifre.trim()) {
      setHata("Lütfen e-posta ve şifre girin.");
      return;
    }
    if (!loginAd.trim()) {
      setHata("Lütfen bir ad veya rumuz girin.");
      return;
    }

    setAuthIslemde(true);
    setHata("");
    try {
      const email = normalizeEmail(authEmail);
      const sehir = loginSehir;
      const bolge = getBolge(sehir);
      const { data, error } = await supabase.auth.signUp({
        email,
        password: authSifre,
        options: {
          data: {
            ad: loginAd.trim(),
            sehir,
            bolge,
            gizlilik: loginGizli,
          },
        },
      });
      if (error) {
        setHata(error.message || "Kayıt başarısız.");
        return;
      }

      const userId = data?.user?.id;
      if (userId) {
        const profile = {
          id: userId,
          ad: loginAd.trim(),
          sehir,
          bolge,
          gizlilik: loginGizli,
        };
        await supabase.from("profiles").upsert(profile);
      }
    } catch (e) {
      const msg = e?.message || "Kayıt başarısız.";
      setHata(msg);
    } finally {
      setAuthIslemde(false);
    }
  };

  const supabaseGirisYap = async () => {
    if (!authEmail.trim() || !authSifre.trim()) {
      setHata("Lütfen e-posta ve şifre girin.");
      return;
    }
    setAuthIslemde(true);
    setHata("");
    try {
      const email = normalizeEmail(authEmail);
      const { error } = await supabase.auth.signInWithPassword({ email, password: authSifre });
      if (error) {
        setHata(error.message || "Giriş başarısız.");
        return;
      }
    } catch (e) {
      const msg = e?.message || "Giriş başarısız.";
      setHata(msg);
    } finally {
      setAuthIslemde(false);
    }
  };

  const supabaseSifreSifirlaMailGonder = async () => {
    if (!authEmail.trim()) {
      setResetBilgi("");
      setHata("Lütfen e-posta adresinizi yazın.");
      return;
    }
    setAuthIslemde(true);
    setHata("");
    setResetBilgi("");
    try {
      const email = normalizeEmail(authEmail);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) {
        setHata(error.message || "E-posta gönderilemedi.");
        return;
      }
      setResetBilgi("Şifre sıfırlama e-postası gönderildi. Gelen kutunu (spam dahil) kontrol et.");
    } catch (e) {
      const msg = e?.message || "E-posta gönderilemedi.";
      setHata(msg);
    } finally {
      setAuthIslemde(false);
    }
  };

  const supabaseYeniSifreKaydet = async () => {
    if (!yeniSifre.trim() || yeniSifre.length < 6) {
      setHata("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (yeniSifre !== yeniSifre2) {
      setHata("Şifreler eşleşmiyor.");
      return;
    }
    setAuthIslemde(true);
    setHata("");
    setResetBilgi("");
    try {
      const { data: sessData, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) {
        setHata(sessErr.message || "Oturum doğrulanamadı.");
        return;
      }
      if (!sessData?.session?.user) {
        setHata("Şifre yenileme oturumu bulunamadı. Lütfen e-postadaki linke tekrar tıkla veya yeni link iste.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: yeniSifre });
      if (error) {
        setHata(error.message || "Şifre güncellenemedi.");
        return;
      }
      setResetBilgi("Şifren güncellendi. Şimdi giriş yapabilirsin.");
      setRecoveryMode(false);
      setAuthMod("login");
      setAuthSifre("");
      setYeniSifre("");
      setYeniSifre2("");
      setTimeout(() => setEkran("karsilama"), 700);
    } catch (e) {
      const msg = e?.message || "Şifre güncellenemedi.";
      setHata(msg);
    } finally {
      setAuthIslemde(false);
    }
  };

  const localKayitOl = async () => {
    if (!authEmail.trim() || !authSifre.trim()) {
      setHata("Lütfen e-posta ve şifre girin.");
      return;
    }
    if (!loginAd.trim()) {
      setHata("Lütfen bir ad veya rumuz girin.");
      return;
    }

    setAuthIslemde(true);
    setHata("");
    try {
      const email = normalizeEmail(authEmail);
      const accounts = getAccountStore();
      if (accounts[email]) {
        setHata("Bu e-posta ile zaten hesap var.");
        return;
      }

      const salt = randomSalt();
      const passHash = await sha256Hex(`${salt}:${authSifre}`);
      const profile = {
        ad: loginAd.trim(),
        sehir: loginSehir,
        bolge: getBolge(loginSehir),
        gizlilik: loginGizli,
      };

      accounts[email] = { salt, passHash, profile, createdAt: Date.now() };
      setAccountStore(accounts);
      localStorage.setItem(sessionKey, JSON.stringify({ email, createdAt: Date.now() }));
      setKullanici({ email, ...profile });

      const existingHistory = localStorage.getItem(historyKeyForUser(email));
      if (existingHistory) setGecmis(JSON.parse(existingHistory));
      else setGecmis([]);

      const existingForum = localStorage.getItem(forumKeyForUser(email));
      if (existingForum) setForumMesajlari(JSON.parse(existingForum));
      else {
        const mockGonderiler = [
          { id: 1, ad: "Ahmet Usta", sehir: "Konya", bolge: "İç Anadolu", gizli: false, metin: "Bu sene kuraklık çok erken başladı, buğdaylarda sararma var sizde durum nedir?", tarih: Date.now() - 100000 },
          { id: 2, ad: "Mehmet Bey", sehir: "İzmir", bolge: "Ege", gizli: true, metin: "Zeytinliklerde mantar enfeksiyonu için erken ilaçlama yapmayı unutmayın arkadaşlar, nem çok yüksek.", tarih: Date.now() - 50000 },
          { id: 3, ad: "Ali K.", sehir: "Antalya", bolge: "Akdeniz", gizli: false, metin: "Seralarda beyaz sinek popülasyonu inanılmaz arttı. TarlaSor'un önerdiği nim yağını kullanan var mı?", tarih: Date.now() - 20000 }
        ];
        setForumMesajlari(mockGonderiler);
        localStorage.setItem(forumKeyForUser(email), JSON.stringify(mockGonderiler));
      }

      setEkran("anasayfa");
    } catch (e) {
      const msg = e?.message || "Kayıt başarısız.";
      setHata(msg);
    } finally {
      setAuthIslemde(false);
    }
  };

  const localGirisYap = async () => {
    if (!authEmail.trim() || !authSifre.trim()) {
      setHata("Lütfen e-posta ve şifre girin.");
      return;
    }
    setAuthIslemde(true);
    setHata("");
    try {
      const email = normalizeEmail(authEmail);
      const accounts = getAccountStore();
      const acc = accounts[email];
      if (!acc) {
        setHata("Bu e-posta ile hesap bulunamadı.");
        return;
      }
      const passHash = await sha256Hex(`${acc.salt}:${authSifre}`);
      if (passHash !== acc.passHash) {
        setHata("Şifre hatalı.");
        return;
      }

      localStorage.setItem(sessionKey, JSON.stringify({ email, createdAt: Date.now() }));
      setKullanici({ email, ...acc.profile });

      const kayitliGecmis = localStorage.getItem(historyKeyForUser(email));
      setGecmis(kayitliGecmis ? JSON.parse(kayitliGecmis) : []);

      const kayitliForum = localStorage.getItem(forumKeyForUser(email));
      setForumMesajlari(kayitliForum ? JSON.parse(kayitliForum) : []);

      setEkran("anasayfa");
    } catch (e) {
      const msg = e?.message || "Giriş başarısız.";
      setHata(msg);
    } finally {
      setAuthIslemde(false);
    }
  };

  const resetForm = () => {
    setMetin("");
    setLabDegerleri({ ph: "", ec: "", sar: "", organik: "", klor: "", sodyum: "" });
    setSonuc(null);
    setHata("");
  };

  async function analizeEt() {
    if (!metin && !Object.values(labDegerleri).some(v => v)) {
      setHata("Lütfen bir belirti yazın veya lab değeri girin.");
      return;
    }
    
    setHata("");
    setYukleniyor(true);
    setEkran("yukleniyor");

    const labMetin = Object.entries(labDegerleri).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(", ");
    
    // AI Prompta Kişiselleştirilmiş Bölgesel ve Hava Bilgisi Ekleme
    const havaNotu = havaDurumu ? `Mevcut Hava Durumu: ${havaDurumu.temperature}°C, ${getHavalar(havaDurumu.weathercode)}.` : "";
    const bolgeNotu = kullanici ? `DİKKAT KULLANICI KONUMU: Çiftçi ${kullanici.sehir} ilinde, ${kullanici.bolge} bölgesinde yaşıyor. ${havaNotu} Önerilerini bu bölgenin iklime, mevcut hava risklerine ve toprak yapısına göre optimize et.` : "";

    // Hızlı test için mock data kullan
    console.log("🧪 Analiz test modu aktif - Mock data kullanılacak");

    let prompt = "";
    if (analiz === "hastalik") {
      prompt = `Sen uzman bir bitki patoloğu ve ziraat mühendisisin. Çiftçinin tarif ettiği belirtilere göre olası hastalığı veya zararlıyı değerlendir.
${bolgeNotu}
Kesin teşhis iddiasında bulunma; "büyük ihtimalle" dili kullan. Uygulanabilir, güvenli ve aşamalı öneriler ver.

Özellikle şu çerçeveyi izle:
- Ayırıcı tanı: Benzer görünen en az 2 ihtimal daha söyle (kısaca nasıl ayırt edilir).
- Önleme: Bir daha olmaması için kültürel önlemler (sulama, havalandırma, hijyen, münavebe, budama vb.).
- Entegre mücadele (IPM): Önce ilaçsız/organik adımlar, sonra gerekirse kimyasal; kimyasal öneriyorsan "etken madde" olarak söyle ve etikete göre uygulama uyarısı ver.
- İzleme planı: 3-7 gün içinde neyi kontrol etmeli?

Çiftçinin Tarifleri: ${metin}

Lütfen yanıtını SADECE JSON formatında ver, ekstra metin yazma:
{
  "genel_durum": "dikkat" veya "kritik",
  "genel_mesaj": "tespitin bir cümleyle özeti.",
  "parametreler": [
    {"ad": "Olası teşhis", "durum": "kritik", "aciklama": "belirtilere dayalı kısa gerekçe"},
    {"ad": "Ayırıcı tanı", "durum": "dikkat", "aciklama": "benzer 2 ihtimal ve ayırt etme ipucu"}
  ],
  "eylemler": [
    "Acil adım (bugün/yarın): ...",
    "Önleme (kültürel): ...",
    "İlaçsız/organik mücadele: ...",
    "Gerekirse kimyasal (etken madde): ...",
    "İzleme planı (3-7 gün): ..."
  ]
}`;
    } else {
      prompt = `Sen Türkiye'deki çiftçilere yardımcı olan uzman bir toprak ve su ziraat mühendisisin.
${bolgeNotu}
Teknik terim kullanmadan, sade Türkçeyle yanıt ver. Her zaman pratik, çevreci ve o bölgeye uygulanabilir öneriler sun.

Yanıtında sadece mevcut sorunu anlatma; aynı sorunun tekrar etmemesi için önleyici bakım önerileri ve kısa bir takip planı da ekle.

Analiz türü: ${analiz === "toprak" ? "Toprak Analizi" : "Sulama Suyu Analizi"}
${metin ? `Çiftçinin anlattıkları: ${metin}` : ""}
${labMetin ? `Lab değerleri: ${labMetin}` : ""}

Lütfen SADECE JSON formatında yanıt ver:
{
  "genel_durum": "iyi" veya "dikkat" veya "kritik",
  "genel_mesaj": "bir cümle özet",
  "parametreler": [{"ad": "parametre adı", "durum": "iyi" veya "dikkat" veya "kritik", "aciklama": "sade bir cümle"}],
  "eylemler": [
    "Acil (1-7 gün): ...",
    "Düzeltme (2-4 hafta): ...",
    "Önleme (rutin): ...",
    "Takip: hangi değeri/işareti ne zaman kontrol etmeli?"
  ]
}`;
    }

    
    try {
      // Gerçek AI analizi yap
      const groq = getGroqClient();
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
      });
      
      const text = completion.choices[0]?.message?.content || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const data = JSON.parse(clean);
      setSonuc(data);
      
      // Geçmişe Kaydet
      if (kullanici) {
        const yeniTarih = new Date().toLocaleDateString("tr-TR");
        const kayit = { 
          id: Date.now(), 
          analizTur: analiz === "toprak" ? "Toprak" : analiz === "su" ? "Su" : "Hastalık",
          tarih: yeniTarih, 
          metin, 
          sonuc: data 
        };
        const yeniGecmis = [kayit, ...gecmis];
        setGecmis(yeniGecmis);
        const email = kullanici.email ? normalizeEmail(kullanici.email) : "";
        if (email) localStorage.setItem(historyKeyForUser(email), JSON.stringify(yeniGecmis));
      }
      
      setEkran("sonuc");
    } catch (err) {
      console.error("Groq Hatası:", err);
      // Proxy çalışmazsa fallback
      if (err?.message?.includes("fetch") || err?.message?.includes("network")) {
        try {
          // Direkt fetch denemesi
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.3,
            })
          });
          
          const data = await response.json();
          const text = data.choices[0]?.message?.content || "";
          const clean = text.replace(/```json|```/g, "").trim();
          const result = JSON.parse(clean);
          setSonuc(result);
          setEkran("sonuc");
        } catch (fallbackErr) {
          setHata("Groq API'ye ulaşılamıyor. Düzeltmek için 'Düzelt' butonuna basın.");
          setEkran("anasayfa");
        }
      } else {
        setHata("Analiz sırasında hata oluştu. Düzeltmek için 'Düzelt' butonuna basın.");
        setEkran("anasayfa");
      }
    } finally {
      setYukleniyor(false);
    }
  }

  const forumMesajGonder = async () => {
    if (!kullanici) return;
    if (!forumInput.trim()) return;

    setAuthIslemde(true);
    setHata("");
    try {
      const { data, error } = await supabase
        .from("forum_posts")
        .insert({
          user_id: kullanici.id,
          ad: kullanici.ad,
          sehir: kullanici.sehir,
          bolge: kullanici.bolge,
          gizli: kullanici.gizlilik,
          metin: forumInput.trim(),
        })
        .select("id, user_id, ad, sehir, bolge, gizli, metin, created_at")
        .single();

      if (error) {
        setHata(error.message || "Mesaj paylaşılamadı.");
        return;
      }

      const yeniMesaj = {
        id: data.id,
        ad: data.ad,
        sehir: data.sehir,
        bolge: data.bolge,
        gizli: data.gizli,
        metin: data.metin,
        tarih: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
        email: null,
      };
      setForumMesajlari((prev) => [yeniMesaj, ...(prev || [])]);
      setForumInput("");
    } catch (e) {
      setHata(e?.message || "Mesaj paylaşılamadı.");
    } finally {
      setAuthIslemde(false);
    }
  };

  const getSiraliForum = useCallback(() => {
    return [...forumMesajlari].sort((a, b) => b.tarih - a.tarih);
  }, [forumMesajlari]);

  const gunRiskleri = (g) => {
    const riskler = [];
    const min = typeof g?.min === "number" ? g.min : Number(g?.min);
    const max = typeof g?.max === "number" ? g.max : Number(g?.max);
    const yagis = typeof g?.yagis === "number" ? g.yagis : Number(g?.yagis);
    const wc = Number(g?.weathercode);

    if (!Number.isNaN(min) && min <= 0) riskler.push({ label: "Don", renk: "#93c5fd" });
    if (!Number.isNaN(max) && max >= 35) riskler.push({ label: "Aşırı sıcak", renk: "#fca5a5" });
    if (!Number.isNaN(yagis) && yagis >= 20) riskler.push({ label: "Şiddetli yağış", renk: "#a5b4fc" });
    if (!Number.isNaN(wc) && wc >= 95) riskler.push({ label: "Fırtına", renk: "#fcd34d" });

    return riskler.slice(0, 2);
  };

  // STYLES - Memoize edelim
  const s = useMemo(() => ({
    app: { minHeight: "100vh", width: "100%", color: "#f5e6d3", fontFamily: "'Segoe UI', sans-serif", margin: 0, padding: 0 },
    sayfa: { maxWidth: 520, margin: "0 auto", padding: "32px 20px", paddingBottom: 60, minHeight: "100vh" },
    baslik: { fontSize: 38, fontWeight: 800, color: "#ffb450", margin: 0, letterSpacing: -1 },
    altyazi: { color: "#a07850", fontSize: 15, marginTop: 4, marginBottom: 36 },
    kart: { background: "rgba(212,139,58,0.06)", border: "2px solid rgba(212,139,58,0.5)", borderRadius: 18, padding: "22px 20px", marginBottom: 16, cursor: "pointer", transition: "all 0.2s" },
    kartBaslik: { fontSize: 18, fontWeight: 700, color: "#ffb450", margin: 0 },
    kartAltyazi: { fontSize: 13, color: "#d4b896", margin: "6px 0 0" },
    geriBtn: { background: "none", border: "none", color: "#d48b3a", fontSize: 15, cursor: "pointer", marginBottom: 20, padding: 0 },
    etiketler: { fontSize: 11, fontWeight: 700, color: "#a07850", letterSpacing: 1, marginBottom: 8, marginTop: 20 },
    textarea: { width: "100%", minHeight: 100, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,139,58,0.3)", borderRadius: 12, padding: 14, color: "#f5e6d3", fontSize: 14, resize: "vertical", boxSizing: "border-box", outline: "none" },
    input: { width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,139,58,0.3)", borderRadius: 10, color: "#f5e6d3", fontSize: 14, boxSizing: "border-box", outline: "none", marginBottom: 14 },
    select: { width: "100%", padding: "12px 14px", background: "rgb(55, 30, 15)", border: "1px solid rgba(212,139,58,0.3)", borderRadius: 10, color: "#f5e6d3", fontSize: 14, boxSizing: "border-box", outline: "none", marginBottom: 14, appearance: "none" },
    btn: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #d48b3a, #b8722e)", border: "none", borderRadius: 14, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8 },
    btnSec: { width: "100%", padding: "14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,139,58,0.3)", borderRadius: 14, color: "#f5e6d3", fontSize: 15, cursor: "pointer", marginTop: 10 },
    chipBtn: { padding: "6px 14px", background: "rgba(212,139,58,0.12)", border: "1px solid rgba(212,139,58,0.3)", borderRadius: 20, color: "#d4b896", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" },
  }), []);

  const durumRenk = useCallback((d) => d === "iyi" ? "#86efac" : d === "dikkat" ? "#fcd34d" : "#fca5a5", []);
  const durumBg = useCallback((d) => d === "iyi" ? "rgba(134,239,172,0.15)" : d === "dikkat" ? "rgba(252,211,77,0.15)" : "rgba(252,165,165,0.15)", []);
  const durumEmoji = useCallback((d) => d === "iyi" ? "✓" : d === "dikkat" ? "!" : "✕", []);
  const durumYazi = useCallback((d) => d === "iyi" ? "İyi" : d === "dikkat" ? "Dikkat" : "Kritik", []);

  return (
    <div style={{ ...s.app, position: "relative" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; minHeight: 100vh; background: #1a0a03; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade { animation: fadeIn 0.4s ease both; }
        .kartHover:hover { background: rgba(212,139,58,0.15) !important; transform: translateY(-2px); }
        .kartHover:active { transform: scale(0.98); }
        .pressable { transition: transform 0.06s ease, filter 0.06s ease; }
        .pressable:active { transform: translateY(1px); filter: brightness(0.95); }
        .globeSpin { display: inline-block; animation: spin 1.05s linear infinite; }
        .spinner { width: 48px; height: 48px; border: 4px solid rgba(212,139,58,0.2); border-top-color: #d48b3a; border-radius: 50%; animation: spin 0.9s linear infinite; margin: 0 auto 20px; }
        input::placeholder, textarea::placeholder { color: #6b4f35; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(212,139,58,0.3); border-radius: 10px; }
      `}</style>

      {/* Zemin */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, backgroundColor: "#1a0a03" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${tarlaAi})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.45 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(26,10,3,0.3) 0%, rgba(26,10,3,0.95) 100%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>

        {bilgiAcik && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setBilgiAcik(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 520,
                background: "rgba(26,10,3,0.98)",
                border: "1px solid rgba(212,139,58,0.35)",
                borderRadius: 18,
                padding: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <div>
                  <p style={{ color: "#ffb450", fontSize: 16, fontWeight: 900, marginBottom: 2 }}>TarlaSor nasıl çalışır?</p>
                  <p style={{ color: "#a07850", fontSize: 12 }}>Kısaca: gir, analiz et, aksiyon al.</p>
                </div>
                <button
                  onClick={() => setBilgiAcik(false)}
                  aria-label="Kapat"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#d4b896",
                    borderRadius: 12,
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  Kapat
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 10, background: "rgba(212,139,58,0.22)", border: "1px solid rgba(212,139,58,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffb450", fontWeight: 900, flexShrink: 0 }}>1</div>
                  <div>
                    <p style={{ color: "#f5e6d3", fontSize: 13, fontWeight: 800, marginBottom: 3 }}>Girdi ver</p>
                    <p style={{ color: "#a07850", fontSize: 12 }}>Belirti yaz veya lab değerlerini gir.</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 10, background: "rgba(212,139,58,0.22)", border: "1px solid rgba(212,139,58,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffb450", fontWeight: 900, flexShrink: 0 }}>2</div>
                  <div>
                    <p style={{ color: "#f5e6d3", fontSize: 13, fontWeight: 800, marginBottom: 3 }}>AI yorumlar</p>
                    <p style={{ color: "#a07850", fontSize: 12 }}>Groq modeli verini tarımsal bağlamda değerlendirir.</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 10, background: "rgba(212,139,58,0.22)", border: "1px solid rgba(212,139,58,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffb450", fontWeight: 900, flexShrink: 0 }}>3</div>
                  <div>
                    <p style={{ color: "#f5e6d3", fontSize: 13, fontWeight: 800, marginBottom: 3 }}>Sonuç + öneri al</p>
                    <p style={{ color: "#a07850", fontSize: 12 }}>Riskler, olası nedenler ve uygulanabilir adımlar listelenir.</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 10, background: "rgba(212,139,58,0.22)", border: "1px solid rgba(212,139,58,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffb450", fontWeight: 900, flexShrink: 0 }}>4</div>
                  <div>
                    <p style={{ color: "#f5e6d3", fontSize: 13, fontWeight: 800, marginBottom: 3 }}>Kayıt / geçmiş</p>
                    <p style={{ color: "#a07850", fontSize: 12 }}>Giriş yaptıysan analizlerin cihazında (localStorage) saklanır.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AYARLAR */}
        {ekran === "ayarlar" && (
          <div style={s.sayfa} className="fade">
            <button style={s.geriBtn} onClick={() => setEkran("anasayfa")}>← Ana Sayfa</button>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#ffb450", marginBottom: 16 }}>Ayarlar</h2>

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,139,58,0.3)", borderRadius: 18, padding: 18 }}>
              <p style={s.etiketler}>ŞEHİR</p>
              <select style={s.select} value={ayarSehir} onChange={(e) => setAyarSehir(e.target.value)}>
                {SEHIRLER.map(il => <option key={il} value={il}>{il}</option>)}
              </select>

              <p style={s.etiketler}>TELEFON (opsiyonel)</p>
              <input style={s.input} placeholder="05xx xxx xx xx" value={ayarTelefon} onChange={(e) => setAyarTelefon(e.target.value)} />

              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginTop: 6 }}>
                <input type="checkbox" checked={ayarSehirGorunsun} onChange={(e) => setAyarSehirGorunsun(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#d48b3a" }} />
                <span style={{ color: "#d4b896", fontSize: 13 }}>Şehrim bölgemle birlikte gözüksün</span>
              </label>

              {resetBilgi && <p style={{ color: "#86efac", fontSize: 13, marginTop: 12 }}>{resetBilgi}</p>}
              {hata && <p style={{ color: "#fca5a5", fontSize: 13, marginTop: 12 }}>{hata}</p>}

              <button className="pressable" style={s.btn} onClick={ayarlariKaydet} disabled={authIslemde}>{authIslemde ? "Kaydediliyor..." : "Kaydet"}</button>
            </div>
          </div>
        )}

        {sifreUnuttumAcik && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setSifreUnuttumAcik(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 520,
                background: "rgba(26,10,3,0.98)",
                border: "1px solid rgba(212,139,58,0.35)",
                borderRadius: 18,
                padding: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <div>
                  <p style={{ color: "#ffb450", fontSize: 16, fontWeight: 900, marginBottom: 2 }}>Şifre sıfırlama</p>
                  <p style={{ color: "#a07850", fontSize: 12 }}>E-postanı yaz, sıfırlama linki gelsin.</p>
                </div>
                <button
                  onClick={() => setSifreUnuttumAcik(false)}
                  aria-label="Kapat"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#d4b896",
                    borderRadius: 12,
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  Kapat
                </button>
              </div>

              <div style={{ marginTop: 14 }}>
                <p style={s.etiketler}>E-POSTA</p>
                <input style={s.input} placeholder="ornek@mail.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />

                {resetBilgi && <p style={{ color: "#86efac", fontSize: 12, marginTop: 10 }}>{resetBilgi}</p>}
                {hata && <p style={{ color: "#fca5a5", fontSize: 12, marginTop: 10 }}>{hata}</p>}

                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button
                    style={{ ...s.btnSec, flex: 1, marginTop: 0 }}
                    onClick={() => setSifreUnuttumAcik(false)}
                    disabled={authIslemde}
                  >
                    Vazgeç
                  </button>
                  <button
                    style={{ ...s.btn, flex: 1, marginTop: 0 }}
                    onClick={supabaseSifreSifirlaMailGonder}
                    disabled={authIslemde}
                  >
                    Link Gönder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* YÜKLENİYOR (Açılış Loader) */}
        {ekran === "loader" && (
          <div style={{ ...s.sayfa, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }} className="fade">
            <span className="globeSpin" style={{ fontSize: 60, marginBottom: 20 }}>🌍</span>
          </div>
        )}

        {/* KARŞILAMA VE GİRİŞ - Auth */}
        {ekran === "karsilama" && (
          <div style={{ ...s.sayfa, display: "flex", flexDirection: "column", justifyContent: "center" }} className="fade">
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <div style={{ fontSize: 64, marginBottom: 10 }}>🌾</div>
              <h1 style={s.baslik}>TarlaSor Ağı</h1>
              <p style={{ color: "#a07850", fontSize: 13, marginTop: 6 }}>Tarlana sor, cevabını al.</p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,139,58,0.3)", borderRadius: 18, padding: 24 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <button
                  className="pressable"
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: authMod === "login" ? "1px solid rgba(212,139,58,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    background: authMod === "login" ? "rgba(212,139,58,0.12)" : "rgba(255,255,255,0.02)",
                    color: authMod === "login" ? "#ffb450" : "#d4b896",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                  onClick={() => setAuthMod("login")}
                >
                  Giriş Yap
                </button>
                <button
                  className="pressable"
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: authMod === "register" ? "1px solid rgba(212,139,58,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    background: authMod === "register" ? "rgba(212,139,58,0.12)" : "rgba(255,255,255,0.02)",
                    color: authMod === "register" ? "#ffb450" : "#d4b896",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                  onClick={() => setAuthMod("register")}
                >
                  Kayıt Ol
                </button>
              </div>

              <p style={s.etiketler}>E-POSTA</p>
              <input style={s.input} placeholder="ornek@mail.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
              <p style={s.etiketler}>ŞİFRE</p>
              <input type="password" style={s.input} placeholder="••••••••" value={authSifre} onChange={e => setAuthSifre(e.target.value)} />

              {authMod === "register" && (
                <>
                  <p style={s.etiketler}>İSİM / RUMUZ</p>
                  <input style={s.input} placeholder="Örn: Ahmet Usta" value={loginAd} onChange={e => setLoginAd(e.target.value)} />
                  
                  <p style={s.etiketler}>BÖLGE İÇİN ŞEHRİNİZ</p>
                  <select style={s.select} value={loginSehir} onChange={e => setLoginSehir(e.target.value)}>
                    {SEHIRLER.map(il => <option key={il} value={il}>{il}</option>)}
                  </select>

                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 20 }}>
                    <input type="checkbox" checked={loginGizli} onChange={e => setLoginGizli(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#d48b3a" }} />
                    <span style={{ color: "#d4b896", fontSize: 13 }}>Forumlarda tam şehrimi gizle, sadece "Bölge" yazılsın</span>
                  </label>
                </>
              )}

              {hata && <p style={{ color: "#fca5a5", fontSize: 13, marginBottom: 14 }}>{hata}</p>}
              
              {authMod === "login" ? (
                <button className="pressable" style={s.btn} onClick={supabaseGirisYap} disabled={authIslemde}>Giriş Yap</button>
              ) : (
                <button className="pressable" style={s.btn} onClick={supabaseKayitOl} disabled={authIslemde}>Hesap Oluştur</button>
              )}

              {authMod === "login" && (
                <button
                  className="pressable"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#d4b896",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: 0,
                    marginTop: 10,
                    textAlign: "left",
                  }}
                  onClick={() => setSifreUnuttumAcik(true)}
                >
                  Şifremi unuttum
                </button>
              )}

              <button style={{ ...s.btnSec, border: "1px solid rgba(212,139,58,0.2)", background: "rgba(255,255,255,0.02)", color: "#d4b896", fontSize: 15, fontWeight: 800, marginTop: 16 }} onClick={misafirGirisi}>
                Misafir Olarak İncele
              </button>
            </div>
          </div>
        )}

        {/* ŞİFRE YENİLE (Supabase PASSWORD_RECOVERY) */}
        {ekran === "sifreYenile" && (
          <div style={{ ...s.sayfa, display: "flex", flexDirection: "column", justifyContent: "center" }} className="fade">
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 54, marginBottom: 10 }}>🔒</div>
              <h1 style={s.baslik}>Yeni Şifre</h1>
              <p style={{ color: "#a07850", fontSize: 13, marginTop: 6 }}>E-postadaki link ile geldin. Yeni şifreni belirle.</p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,139,58,0.3)", borderRadius: 18, padding: 24 }}>
              <p style={s.etiketler}>YENİ ŞİFRE</p>
              <input type="password" style={s.input} placeholder="••••••••" value={yeniSifre} onChange={(e) => setYeniSifre(e.target.value)} />

              <p style={s.etiketler}>YENİ ŞİFRE (TEKRAR)</p>
              <input type="password" style={s.input} placeholder="••••••••" value={yeniSifre2} onChange={(e) => setYeniSifre2(e.target.value)} />

              {resetBilgi && <p style={{ color: "#86efac", fontSize: 13, marginBottom: 14 }}>{resetBilgi}</p>}
              {hata && <p style={{ color: "#fca5a5", fontSize: 13, marginBottom: 14 }}>{hata}</p>}

              <button className="pressable" style={s.btn} onClick={supabaseYeniSifreKaydet} disabled={authIslemde}>{authIslemde ? "Güncelleniyor..." : "Şifreyi Güncelle"}</button>
              <button className="pressable" style={{ ...s.btnSec, marginTop: 12 }} onClick={() => { setRecoveryMode(false); setEkran("karsilama"); setAuthMod("login"); }} disabled={authIslemde}>Giriş Ekranına Dön</button>
            </div>
          </div>
        )}

        {/* ANA SAYFA */}
        {ekran === "anasayfa" && (
          <div style={s.sayfa} className="fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 }}>
              <div>
                <p style={{ color: "#ffb450", fontSize: 24, fontWeight: 800 }}>Merhaba, {kullanici ? kullanici.ad.split(' ')[0] : "Ziyaretçi"}</p>
                {kullanici && (
                   <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                      <span style={{ color: "#a07850", fontSize: 12 }}>📍 {kullanici.sehir} - {kullanici.bolge}</span>
                      {havaDurumu && (
                        <span style={{ color: "#86efac", fontSize: 12, borderLeft: "1px solid rgba(212,139,58,0.4)", paddingLeft: 10 }}>
                          {havaDurumu.temperature}°C, {getHavalar(havaDurumu.weathercode)}
                        </span>
                      )}
                   </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {kullanici && (
                  <button
                    className="pressable"
                    onClick={ayarlariAc}
                    aria-label="Ayarlar"
                    style={{
                      background: "none",
                      border: "1px solid rgba(212,139,58,0.35)",
                      borderRadius: 999,
                      padding: "4px 10px",
                      color: "#ffb450",
                      cursor: "pointer",
                      height: "fit-content",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    ⚙
                  </button>
                )}
                <button
                  onClick={() => setBilgiAcik(true)}
                  aria-label="Bilgi"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(212,139,58,0.35)",
                    color: "#ffb450",
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  i
                </button>
                {kullanici ? (
                  <button className="pressable" onClick={cikisYap} style={{ background: "none", border: "1px solid rgba(212,139,58,0.4)", borderRadius: 20, padding: "4px 10px", color: "#a07850", fontSize: 11, cursor: "pointer", height: "fit-content" }}>Çıkış</button>
                ) : guestMode ? (
                  <button className="pressable" onClick={() => { setGuestMode(false); setEkran("karsilama"); setAuthMod("register"); }} style={{ background: "rgba(212,139,58,0.2)", border: "1px solid #d48b3a", borderRadius: 20, padding: "4px 10px", color: "#ffb450", fontSize: 11, cursor: "pointer", height: "fit-content" }}>Kayıt Ol</button>
                ) : (
                  <button className="pressable" onClick={() => setEkran("karsilama")} style={{ background: "rgba(212,139,58,0.2)", border: "1px solid #d48b3a", borderRadius: 20, padding: "4px 10px", color: "#ffb450", fontSize: 11, cursor: "pointer", height: "fit-content" }}>Giriş Yap</button>
                )}
              </div>
            </div>

            {kullanici && havaTahmin.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,139,58,0.25)", borderRadius: 16, padding: 14, marginBottom: 18 }}>
                <p style={{ color: "#a07850", fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 10 }}>7 GÜNLÜK HAVA TAHMİNİ</p>
                <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
                  {havaTahmin.map((g, idx) => (
                    <div key={idx} style={{ minWidth: 110, background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 10 }}>
                      <p style={{ color: "#d4b896", fontSize: 11, marginBottom: 6 }}>
                        {new Date(g.tarih).toLocaleDateString("tr-TR", { weekday: "short", day: "2-digit", month: "2-digit" })}
                      </p>
                      <p style={{ color: "#f5e6d3", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{getHavalar(g.weathercode)}</p>
                      <p style={{ color: "#ffb450", fontSize: 12, fontWeight: 800 }}>{Math.round(g.max)}° / {Math.round(g.min)}°</p>
                      <p style={{ color: "#a07850", fontSize: 11, marginTop: 4 }}>Yağış: {Math.round(((g.yagis ?? 0) * 10)) / 10}mm</p>
                      {gunRiskleri(g).length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                          {gunRiskleri(g).map((r, i) => (
                            <span key={i} style={{ fontSize: 10, fontWeight: 800, color: r.renk, border: `1px solid ${r.renk}55`, padding: "2px 6px", borderRadius: 999, background: "rgba(0,0,0,0.18)" }}>
                              {r.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <button style={{ flex: 1, padding: "12px", background: "rgba(212,139,58,0.1)", border: "1px solid rgba(212,139,58,0.4)", borderRadius: 14, color: "#ffb450", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => setEkran("forum")}>
                <span style={{fontSize: 20}}>💬</span> Yerel Forum
              </button>
              <button style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,139,58,0.2)", borderRadius: 14, color: "#d4b896", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => {
                if(!kullanici) alert("Geçmiş analizlerinizi görmek için giriş yapmalısınız.");
                else setEkran("gecmis");
              }}>
                <span style={{fontSize: 20}}>📜</span> Geçmişim
              </button>
            </div>

            <p style={{ color: "#a07850", fontSize: 13, marginBottom: 12, fontWeight: 600 }}>YAPAY ZEKA ANALİZ ASİSTANI</p>

            <div className="kartHover" style={s.kart} onClick={() => { setAnaliz("toprak"); resetForm(); setEkran("giris"); }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 36 }}>🌱</span>
                <div>
                  <p style={s.kartBaslik}>Toprağımı Analiz Et</p>
                  <p style={s.kartAltyazi}>Verimsizliğin ve gıda krizinin kök nedeni topraktır. Toprağını kurtarmak için teste başla.</p>
                </div>
              </div>
            </div>

            <div className="kartHover" style={s.kart} onClick={() => { setAnaliz("su"); resetForm(); setEkran("giris"); }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 36 }}>💧</span>
                <div>
                  <p style={s.kartBaslik}>Sulama Suyumu Analiz Et</p>
                  <p style={s.kartAltyazi}>Suyun tuzluluğunu ve bitkiye olan etkisini test et.</p>
                </div>
              </div>
            </div>

            <div className="kartHover" style={{ ...s.kart, position: "relative", overflow: "hidden" }} onClick={() => { setAnaliz("hastalik"); resetForm(); setEkran("giris"); }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 60, height: 60, background: "rgba(212,139,58,0.15)", borderRadius: "50%", filter: "blur(20px)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 36 }}>🍂</span>
                <div>
                  <p style={s.kartBaslik}>Bitki Hastalığı Tespiti</p>
                  <p style={s.kartAltyazi}>Belirtileri yazarak hastalığı tespit et ve çözüm bul.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GİRİŞ EKRANI (Analiz Formu) */}
        {ekran === "giris" && (
          <div style={s.sayfa} className="fade">
            <button style={s.geriBtn} onClick={() => setEkran("anasayfa")}>← Geri</button>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f5e6d3", marginBottom: 4 }}>
              {analiz === "toprak" ? "🌱 Toprak Analizi" : analiz === "su" ? "💧 Su Analizi" : "🍂 Bitki Hastalığı Tespiti"}
            </h2>
            <p style={{ color: "#a07850", fontSize: 13, marginBottom: 20 }}>
              {analiz === "toprak" ? "Toprağınla ilgili tespit ettiğin belirtileri anlatır mısın?" : analiz === "su" ? "Sulama suyu hakkında ne fark ettin, kokusu veya rengi nasıl?" : "Hastalığı belirlemek için bitkinin yaprak veya gövdesindeki belirtileri tarif et."}
            </p>

            <p style={s.etiketler}>BELİRTİLERİ ANLAT (Zorunlu)</p>
            <textarea style={s.textarea} value={metin} onChange={e => setMetin(e.target.value)}
              placeholder={analiz === "toprak" ? "Örnek: Tarlada beyaz lekeler oluştu, kuruma var..." : analiz === "su" ? "Örnek: Sulamadan sonra nehir suyu çok kötü kokuyordu..." : "Örnek: Yapraklarda kahverengi benekler var ve uçlarından kurumaya başladı..."} />

            {analiz !== "hastalik" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {(analiz === "toprak"
                  ? ["Sararan yaprak", "Beyaz leke", "Kuruyan toprak", "Solgun bitki"]
                  : ["Su kokuyor", "Bitkiler soldu", "Toprak sertleşti", "Verim düştü"]
                ).map(e => (
                  <button key={e} style={s.chipBtn} onClick={() => setMetin(m => m ? m + ", " + e : e)}>{e}</button>
                ))}
              </div>
            )}

            {analiz !== "hastalik" && (
              <>
                <p style={s.etiketler}>LAB DEĞERLERİ (varsa İsteğe Bağlı)</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {(analiz === "toprak"
                    ? [["ph", "pH"], ["ec", "EC (dS/m)"], ["sar", "SAR"], ["organik", "Organik Madde %"]]
                    : [["ph", "pH"], ["ec", "EC (dS/m)"], ["sar", "SAR"], ["klor", "Klor (mg/L)"], ["sodyum", "Sodyum (mg/L)"]]
                  ).map(([key, label]) => (
                    <div key={key}>
                      <p style={{ fontSize: 11, color: "#a07850", marginBottom: 5 }}>{label}</p>
                      <input type="number" value={labDegerleri[key]}
                        onChange={e => setLabDegerleri(v => ({ ...v, [key]: e.target.value }))} style={{...s.input, marginBottom: 0}} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {hata && <p style={{ color: "#fca5a5", fontSize: 13, marginTop: 12 }}>{hata}</p>}
            <div style={{ marginTop: 24 }}>
              {kullanici && <p style={{ color: "#d4b896", fontSize: 11, marginBottom: 8, textAlign: "center", opacity: 0.8 }}>📍 Tavsiyeler {kullanici.sehir} ilinin bölgesel iklimine göre filtrelenecektir.</p>}
              <button style={s.btn} onClick={analizeEt}>Tarla Zekasına Sor ✨</button>
            </div>
          </div>
        )}

        {/* YÜKLENİYOR */}
        {ekran === "yukleniyor" && (
          <div style={{ ...s.sayfa, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }} className="fade">
            <span className="globeSpin" style={{ fontSize: 60, marginBottom: 18 }}>🌍</span>
            <h2 style={{ color: "#ffb450", fontSize: 20, marginBottom: 8 }}>{kullanici ? "Bölgenize Özel " : ""}Analiz yapılıyor</h2>
            <p style={{ color: "#a07850", fontSize: 14, letterSpacing: 2 }}>{"●".repeat(noktalar + 1)}</p>
          </div>
        )}

        {/* SONUÇ */}
        {ekran === "sonuc" && sonuc && (
          <div style={s.sayfa} className="fade">
            <button style={s.geriBtn} onClick={() => setEkran("anasayfa")}>← Ana Sayfa</button>

            <div style={{ background: durumBg(sonuc.genel_durum), border: `2px solid ${durumRenk(sonuc.genel_durum)}`, borderRadius: 18, padding: 20, marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: durumRenk(sonuc.genel_durum), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#1a1a1a", flexShrink: 0 }}>
                {durumEmoji(sonuc.genel_durum)}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, color: "#f5e6d3" }}>
                  {sonuc.genel_durum === "iyi" ? "Durum İyi" : sonuc.genel_durum === "dikkat" ? "Dikkat Gerekiyor" : "Kritik Müdahale"}
                </p>
                <p style={{ color: "#a07850", fontSize: 13, marginTop: 2 }}>{sonuc.genel_mesaj}</p>
              </div>
            </div>

            {sonuc.parametreler?.map((p, i) => (
              <div key={i} className="fade" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,139,58,0.2)", borderRadius: 14, padding: 16, marginBottom: 10, animationDelay: `${i * 0.08}s` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, color: "#f5e6d3" }}>{p.ad}</span>
                  <span style={{ background: durumRenk(p.durum), color: "#1a1a1a", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    {durumYazi(p.durum)}
                  </span>
                </div>
                <p style={{ color: "#d4b896", fontSize: 13, marginTop: 8 }}>{p.aciklama}</p>
              </div>
            ))}

            {sonuc.eylemler?.length > 0 && (
              <div style={{ background: "rgba(212,139,58,0.1)", border: "2px solid rgba(212,139,58,0.5)", borderRadius: 14, padding: 20, marginTop: 10 }}>
                <p style={{ fontWeight: 700, color: "#ffb450", marginBottom: 12, fontSize: 15 }}>🛠 Gerekli Aksiyonlar</p>
                {sonuc.eylemler.map((e, i) => (
                  <p key={i} style={{ color: "#f5e6d3", fontSize: 14, marginBottom: 8 }}>
                    <span style={{ color: "#d48b3a", fontWeight: 700 }}>{i + 1}.</span> {e}
                  </p>
                ))}
              </div>
            )}

            <button style={s.btnSec} onClick={() => { setEkran("anasayfa"); }}>← Ana Sayfa</button>
          </div>
        )}

        {/* GEÇMİŞ ANALİZLER YÖNETİMİ */}
        {ekran === "gecmis" && (
          <div style={s.sayfa} className="fade">
            <button style={s.geriBtn} onClick={() => setEkran("anasayfa")}>← Ana Sayfa</button>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#ffb450", marginBottom: 20 }}>Geçmiş Analizlerim</h2>
            
            {gecmis.length === 0 ? (
              <p style={{ color: "#a07850", textAlign: "center", marginTop: 40, fontSize: 14 }}>Henüz kaydedilmiş hiçbir analizin bulunmuyor.</p>
            ) : (
              gecmis.map(g => (
                <div key={g.id} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${durumRenk(g.sonuc.genel_durum)}`, borderRadius: 16, padding: 16, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ background: "rgba(212,139,58,0.2)", color: "#ffb450", padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{g.analizTur}</span>
                    <span style={{ color: "#a07850", fontSize: 11 }}>{g.tarih}</span>
                  </div>
                  <p style={{ color: "#f5e6d3", fontSize: 13, marginBottom: 10, fontStyle: "italic", opacity: 0.8 }}>"{g.metin || "Sadece lab değeri."}"</p>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                     <div style={{ width: 4, height: 20, borderRadius: 4, background: durumRenk(g.sonuc.genel_durum), marginTop: 2 }} />
                     <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: durumRenk(g.sonuc.genel_durum), margin: 0 }}>{g.sonuc.genel_mesaj}</p>
                     </div>
                  </div>
                </div>
              ))
            )}
            
            {gecmis.length > 0 && (
              <button style={{ ...s.btnSec, border: "none", color: "#fca5a5" }} onClick={() => {
                if(window.confirm("Geçmişi silmek istediğinize emin misiniz?")) {
                  const email = kullanici?.email ? normalizeEmail(kullanici.email) : "";
                  if (email) localStorage.removeItem(historyKeyForUser(email));
                  setGecmis([]);
                }
              }}>Tüm Geçmişi Temizle</button>
            )}
          </div>
        )}

        {/* ÇİFTÇİ FORUMU */}
        {ekran === "forum" && (
          <div style={s.sayfa} className="fade">
            <button style={s.geriBtn} onClick={() => setEkran("anasayfa")}>← Ana Sayfa</button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#ffb450" }}>Bölgesel Forum</h2>
              </div>
            </div>

            <div style={{ background: "rgba(212,139,58,0.08)", border: "1px solid rgba(212,139,58,0.4)", borderRadius: 16, padding: 16, marginBottom: 30 }}>
              {!kullanici ? (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <p style={{ color: "#d4b896", fontSize: 13, marginBottom: 10 }}>Yazıları okuyabilirsin. Topluluğa fikir danışmak ve yanıt bulmak için kayıt olmalısın.</p>
                  <button className="pressable" onClick={() => setEkran("karsilama")} style={{ background: "rgba(212,139,58,0.2)", border: "1px solid #d48b3a", borderRadius: 20, padding: "6px 14px", color: "#ffb450", fontSize: 12, cursor: "pointer" }}>Hesap Aç / Giriş Yap</button>
                </div>
              ) : (
                <>
                  <textarea style={{...s.textarea, minHeight: 80, border: "none", background: "rgba(0,0,0,0.2)"}} placeholder={`${kullanici.sehir} ağında tarlanda neler yaşıyorsun? Bölge çiftçisine danış...`} value={forumInput} onChange={e => setForumInput(e.target.value)} />
                  <div style={{ display: "flex", justifyContent: "end", marginTop: 10 }}>
                    <button className="pressable" style={{ background: "#d48b3a", color: "#1a0a03", border: "none", borderRadius: 12, padding: "8px 16px", fontWeight: 700, cursor: "pointer", opacity: authIslemde ? 0.7 : 1 }} onClick={forumMesajGonder} disabled={authIslemde}>Paylaş</button>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {getSiraliForum().length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ color: "#a07850", fontSize: 13, marginBottom: 6 }}>Henüz forumda mesaj yok.</p>
                  <p style={{ color: "#6b4f35", fontSize: 12 }}>İlk mesajı sen paylaşabilirsin.</p>
                </div>
              ) : getSiraliForum().map(m => {
                const ayniSehir = kullanici && m.sehir === kullanici.sehir;
                const ayniBolge = kullanici && m.bolge === kullanici.bolge;

                return (
                  <div key={m.id} style={{ background: "rgba(255,255,255,0.03)", border: ayniSehir ? "1px solid rgba(134,239,172,0.5)" : ayniBolge ? "1px solid rgba(212,139,58,0.4)" : "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(212,139,58,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffb450", fontWeight: 700, fontSize: 14 }}>
                          {m.ad[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{ color: "#f5e6d3", fontSize: 14, fontWeight: 700, margin: 0 }}>{m.ad}</p>
                          <p style={{ color: ayniSehir ? "#86efac" : ayniBolge ? "#ffb450" : "#a07850", fontSize: 11, margin: 0 }}>📍 {m.gizli ? m.bolge + " Çiftçisi" : m.sehir + " / " + m.bolge}</p>
                        </div>
                      </div>
                      <span style={{ color: "#6b4f35", fontSize: 10 }}>
                        {new Date(m.tarih).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <p style={{ color: "#d4b896", fontSize: 14, lineHeight: 1.5 }}>{m.metin}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
});

export default App;