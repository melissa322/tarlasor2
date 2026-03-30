# Agents / Otomasyon Durumu

Bu repoda **agent / automation / workflow** (GitHub Actions, cron job, arka plan worker vb.) olarak çalışan ayrı bir kod bileşeni **bulunmuyor**.

## Bulunan tek otomasyon benzeri parçalar

### NPM script’leri (package.json)
- `npm run dev`
  - Vite dev server
- `npm run build`
  - Production build
- `npm run preview`
  - Build çıktılarını localde preview
- `npm run lint`
  - ESLint kontrolü

## "Agent" gibi çalışan bir şey var mı?
- Uygulama bir **React + Vite** frontend.
- “Otomatik çalışan” mantıklar sadece tarayıcıda çalışan `useEffect` akışları (Supabase session bootstrap, hava durumu fetch, forum fetch vb.).
- Repo içinde `.github/workflows` veya `.windsurf/workflows` klasörleri yok.

## İstersen agent/otomasyon ekleyebiliriz
Aşağıdaki örneklerden birini istersen ekleyebilirim:
- Supabase DB cleanup / günlük rapor (Edge Function + scheduled trigger)
- GitHub Actions: `lint` + `build` CI
- Basit bir Node script: forum seed, data migration, vb.
