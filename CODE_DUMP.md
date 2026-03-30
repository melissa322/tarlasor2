# CODE DUMP

Bu dosya, projedeki mevcut kaynak kodların (seçili dosyalar) **ham kopyasıdır**.

Not: Güvenlik için `.env` dahil edilmedi.

---

## `package.json`

```json
{
  "name": "tarlasor--2-",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "groq-sdk": "^1.1.2",
    "@supabase/supabase-js": "^2.49.1",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "vite": "^8.0.1"
  }
}
```

---

## `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>tarlasor--2-</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
```

---

## `eslint.config.js`

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
```

---

## `src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## `src/supabaseClient.js`

```js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
```

---

## `src/firebase.js`

```js
export const isFirebaseReady = false;

export const app = null;
export const auth = null;
export const db = null;
```

---

## `src/index.css`

```css
:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --code-bg: #f4f3ec;
  --accent: #aa3bff;
  --accent-bg: rgba(170, 59, 255, 0.1);
  --accent-border: rgba(170, 59, 255, 0.5);
  --social-bg: rgba(244, 243, 236, 0.5);
  --shadow:
    rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;

  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  --heading: system-ui, 'Segoe UI', Roboto, sans-serif;
  --mono: ui-monospace, Consolas, monospace;

  font: 18px/145% var(--sans);
  letter-spacing: 0.18px;
  color-scheme: light dark;
  color: var(--text);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    --text: #9ca3af;
    --text-h: #f3f4f6;
    --bg: #16171d;
    --border: #2e303a;
    --code-bg: #1f2028;
    --accent: #c084fc;
    --accent-bg: rgba(192, 132, 252, 0.15);
    --accent-border: rgba(192, 132, 252, 0.5);
    --social-bg: rgba(47, 48, 58, 0.5);
    --shadow:
      rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
  }

  #social .button-icon {
    filter: invert(1) brightness(2);
  }
}

body {
  margin: 0;
}

#root {
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  border-inline: 1px solid var(--border);
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

h1,
h2 {
  font-family: var(--heading);
  font-weight: 500;
  color: var(--text-h);
}

h1 {
  font-size: 56px;
  letter-spacing: -1.68px;
  margin: 32px 0;
  @media (max-width: 1024px) {
    font-size: 36px;
    margin: 20px 0;
  }
}
h2 {
  font-size: 24px;
  line-height: 118%;
  letter-spacing: -0.24px;
  margin: 0 0 8px;
  @media (max-width: 1024px) {
    font-size: 20px;
  }
}
p {
  margin: 0;
}

code,
.counter {
  font-family: var(--mono);
  display: inline-flex;
  border-radius: 4px;
  color: var(--text-h);
}

code {
  font-size: 15px;
  line-height: 135%;
  padding: 4px 8px;
  background: var(--code-bg);
}
```

---

## `src/App.css`

```css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}
```

---

## `src/App.jsx`

```jsx
import { useState, useEffect, useRef } from "react";
import Groq from "groq-sdk";
import { supabase } from "./supabaseClient";
import tarlaAi from "./assets/tarla_ai.png";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const BOLGELER = {
  "Marmara": ["İstanbul", "Bursa", "Kocaeli", "Balıkesir", "Tekirdağ", "Çanakkale", "Edirne", "Kırklareli", "Sakarya", "Yalova", "Bilecik"],
  "Ege": ["İzmir", "Manisa", "Aydın", "Denizli", "Muğla", "Afyonkarahisar", "Kütahya", "Uşak"],
  "İç Anadolu": ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas", "Kırıkkale", "Aksaray", "Karaman", "Kırşehir", "Niğde", "Nevşehir", "Yozgat", "Çankırı"],
  "Akdeniz": ["Antalya", "Adana", "Mersin", "Hatay", "Kahramanmaraş", "Osmaniye", "Burdur", "Isparta"],
  "Karadeniz": ["Trabzon", "Samsun", "Zonguldak", "Rize", "Ordu", "Giresun", "Tokat", "Amasya", "Çorum", "Kastamonu", "Karabük", "Sinop", "Artvin", "Gümüşhane", "Bayburt", "Bartın", "Bolu", "Düzce"],
  "Doğu Anadolu": ["Erzurum", "Van", "Malatya", "Elazığ", "Erzincan", "Kars", "Ağrı", "Muş", "Bitlis", "Bingöl", "Tunceli", "Hakkari", "Iğdır", "Şırnak", "Ardahan"],
  "Güneydoğu Anadolu": ["Gaziantep", "Şanlıurfa", "Diyarbakır", "Mardin", "Batman", "Adıyaman", "Siirt", "Kilis", "Şırnak"]
};

// Sehirleri alfabetik siralayalim
const SEHIRLER = Object.keys(BOLGELER).reduce((acc, bolge) => [...acc, ...BOLGELER[bolge]], []).sort((a,b) => a.localeCompare(b, 'tr'));

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

export default function App() {
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
        .limit(50);
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

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const groqCreateWithRetry = async () => {
      const attempts = 3;
      let lastErr = null;
      for (let i = 0; i < attempts; i++) {
        try {
          return await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
          });
        } catch (e) {
          lastErr = e;
          if (i < attempts - 1) {
            await sleep(600 * Math.pow(2, i));
            continue;
          }
        }
      }
      throw lastErr;
    };

    try {
      const completion = await groqCreateWithRetry();
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
      console.error("API Hatası:", err);
      setHata("Bağlantı sorunu oluştu. İnternetinizi kontrol edip tekrar deneyin. Sorun devam ederse VPN/proxy kapatıp deneyin.");
      setEkran("giris");
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

  const getSiraliForum = () => {
    return [...forumMesajlari].sort((a, b) => b.tarih - a.tarih);
  };

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

  // STYLES
  const durumRenk = (d) => d === "iyi" ? "#86efac" : d === "dikkat" ? "#fcd34d" : "#fca5a5";
  const durumBg = (d) => d === "iyi" ? "rgba(134,239,172,0.15)" : d === "dikkat" ? "rgba(252,211,77,0.15)" : "rgba(252,165,165,0.15)";
  const durumEmoji = (d) => d === "iyi" ? "✓" : d === "dikkat" ? "!" : "✕";
  const durumYazi = (d) => d === "iyi" ? "İyi" : d === "dikkat" ? "Dikkat" : "Kritik";
  
  const s = {
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
  };

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

        {/* ... (DEVAM) ... */}

      </div>
    </div>
  );
}
```

> Not: `src/App.jsx` çok büyük olduğu için bu dump dosyasında IDE/limit nedeniyle **kısaltılmış bir görünüm** olabilir. Tam ham içerik için `src/App.jsx` dosyası esas kaynaktır.
