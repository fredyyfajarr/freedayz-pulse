# 📜 FREEDAYZZ PULSE — CHANGELOG & PROJECT PROGRESS TRACKER
> **Project:** Freedayzz Pulse (Advanced Running Analytics & Telemetry Lab)  
> **Repository:** `running-dashboard-analytics`  
> **Course / Academic Context:** Tugas Besar Manajemen Proyek TI (MPI) — Sport-Tech SaaS Architecture  
> **Tech Stack:** Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Leaflet  
> **Standards:** [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) & Semantic Versioning  

Dokumen ini mencatat seluruh riwayat iterasi, evolusi arsitektur, perbaikan bug (*fixes*), dan penambahan fitur dari awal pengerjaan hingga versi saat ini. Berguna sebagai bukti audit kontrol perubahan (*Change Management*) untuk laporan akademik dan pengembangan berkelanjutan.

---

## 📌 Ringkasan Versi (Milestone Overview)

| Versi | Tanggal | Milestone Utama | Status |
| :--- | :--- | :--- | :--- |
| **v0.6.0** | 06 Nov 2026 | **Pro-Tier Biometrics: Jack Daniels VDOT 5-Zone Paces, GCT L/R Symmetry Injury Radar, Hydration & Fueling Lab** | ✅ Selesai |
| **v0.5.1** | 06 Nov 2026 | **Bilingual Landing Page (ID\|EN), Month Selector Export (Nov 2026), Garmin Calories & Steps, Tooltip Contrast Fix** | ✅ Selesai |
| **v0.5.0** | 04 Nov 2026 | **SaaS Landing Page, PNG Brand Commercialization & Route Decoupling (`/` vs `/dashboard`)** | ✅ Selesai |
| **v0.4.0** | 27 Okt 2026 | **Collapsible Left Sidebar (Rail/Expanded), Mobile Responsive Drawer, Layout Fixes** | ✅ Selesai |
| **v0.3.0** | 26 Okt 2026 | **Bespoke Vector Brand Logo, Light/Dark Mode Contrast Fix, IG Story Export Graphic** | ✅ Selesai |
| **v0.2.0** | 25 Okt 2026 | **Telemetry Detail View, Dynamic Strava-style Pace Bar, GPS Map & Running Dynamics** | ✅ Selesai |
| **v0.1.0** | 24 Okt 2026 | **Inisiasi Proyek, Garmin API Client, Biometrics Recovery Hub & ACWR Radar** | ✅ Selesai |

---

## 🚀 Log Rinci Perubahan (Detailed Changelog)

### [v0.6.0] — 2026-11-06 (Pro-Tier Biometrics: Jack Daniels VDOT 5-Zone Paces, GCT Foot Symmetry, Hydration & Fueling Lab)

#### 🌟 Ditambahkan (Added)
* **Jack Daniels VDOT 5-Zone Training Paces System (`VDOTTrainingZonesCard.tsx` & `VO2MaxCalculator.ts`):**
  * Fitur premium yang umumnya berbayar mahal di aplikasi kompetitor (Runna, VDOT O2, TrainingPeaks ~$15–$25/bulan) kini hadir 100% gratis berbasis filosofi BYOK.
  * Menghitung target kecepatan (*training paces*) harian presisi atlet ke dalam 5 zona standar Jack Daniels:
    * **Easy / Recovery (E) [62%–70% VO2Max]:** Membangun fondasi kapiler aerobik, lari santai & pemulihan aktif.
    * **Marathon (M) [~80% VO2Max]:** Simulasi ritme maraton dan adaptasi pembakaran asam lemak untuk 21K/42K.
    * **Threshold / Tempo (T) [~88% VO2Max]:** Meningkatkan ambang pembuangan laktat (*lactate clearance*) dengan split per km & split lap track 400m.
    * **Interval (I) [~98% VO2Max]:** Repetisi 3–5 menit untuk memaksimalkan kapasitas serapan oksigen (VO2Max).
    * **Repetition (R) [~110% VO2Max]:** Kecepatan neuromuskular murni, perbaikan ekonomi gerak langkah, dan toleransi anaerobik.
  * **Fitur Interaktif:**
    * **VDOT Simulation Slider:** Atlet dapat menggeser nilai VDOT (25–75) untuk mensimulasikan kecepatan latihan jika mencapai target kebugaran berikutnya, lengkap dengan tombol *Reset* ke kalibrasi PR aktual.
    * **Mode Split Toggle:** Beralih antara *Pace per KM* dan *Split Putaran Track 400M / 1000M*.
    * Terintegrasi langsung pada halaman Rekor Pribadi (`/records`).
* **Ground Contact Time (GCT) Balance & L/R Foot Symmetry Radar (`RunningDynamicsCard.tsx`):**
  * Memperluas entitas `RunningDynamics` pada `Activity.ts` dan mapper `GarminMappers.ts` dengan properti `avgGroundContactBalanceLeftPercent` & `avgGroundContactBalanceRightPercent`.
  * Menampilkan visual *Dual Foot Symmetry Gauge* (`50.4% L | 49.6% R`) dengan deteksi risiko cedera berbasis biomekanik klinis:
    * **Optimal Bilateral Symmetry (deviasi $\le 0.8\%$):** Badge hijau, beban impak kedua kaki seimbang.
    * **Mild Asymmetry (deviasi $0.8\%–1.8\%$):** Badge kuning, pemantauan ketegangan tendon/kemiringan jalan (*road camber*).
    * **Elevated Asymmetry // Injury Alert (deviasi $> 1.8\%$):** Badge merah berkedip (*pulsing*), peringatan kelelahan unilateral atau kompensasi cedera pada lutut/achilles.
* **Protokol Hidrasi & Nutrisi Pasca Lari / Hydration & Fueling Lab (`HydrationFuelingCard.tsx`):**
  * Ditempatkan pada rute detail sesi lari (`/activities/[id]`).
  * **Estimasi Keringat ACSM (Liters):** Menghitung laju keringat aktual berdasarkan durasi lari, suhu sensor Garmin (°C), dan intensitas denyut jantung:
    $$\text{Sweat Rate} = 750 + \max(0, \text{Suhu} - 20) \times 25 + \max(0, \text{HR} - 130) \times 6\text{ mL/jam}$$
  * **Target Rehidrasi 150% (mL):** Standar *American College of Sports Medicine* untuk memulihkan volume plasma darah dengan memperhitungkan ekskresi urine.
  * **Defisit Elektrolit & Sodium (mg Na+):** Rekomendasi asupan garam/isotonik (~720 mg Na+ per Liter keringat) guna mencegah kram dan hiponatremia.
  * **Jendela Pengisian Glikogen (Gram Karbohidrat):** Menghitung gram karbohidrat yang terbakar serta target asupan cepat 30 menit pasca lari (30–80g karbohidrat).
  * **Blueprint Fueling Long Run:** Jadwal konsumsi energi gel (tiap 40–45 menit) dan sips air (tiap 20 menit) untuk sesi lari jarak jauh berikutnya.

#### 🔄 Diubah (Changed)
* **Dukungan Penuh Tema Terang & Gelap pada Seluruh Modul Baru:**
  * Memperbarui `RecordsClient.tsx`, `RunningDynamicsCard.tsx`, dan `HydrationFuelingCard.tsx` dengan kontras warna terkalibrasi (`bg-white dark:bg-[#0d1224]`, `text-slate-900 dark:text-white`, dan bayangan brutalist dinamis).

---

### [v0.5.1] — 2026-11-06 (Bilingual Landing Page, Month Selector Export, Garmin Telemetry & Tooltip Fixes)

#### 🌟 Ditambahkan (Added)
* **Dukungan Dua Bahasa (Bilingual ID | EN) pada Landing Page (`src/context/landingTranslations.ts` & `src/app/page.tsx`):**
  * Seluruh konten Landing Page kini mendukung Bahasa Indonesia (`ID`) dan English (`EN`).
  * Menyediakan tombol *Language Switcher* interaktif (`ID | EN`) di navbar utama dengan status aktif bergaris bawah (*accent highlight*).
  * Terhubung langsung dengan `useLanguage()` dan sinkronisasi otomatis ke cookie `freedayzz_lang` & `localStorage`.
* **Pemilih Bulan Dinamis pada Export Month in Sport (`src/components/dashboard/MonthInSportExportModal.tsx`):**
  * Menghapus batasan hardcoded Oktober 2026. Kini secara otomatis mendeteksi semua bulan yang memiliki aktivitas (November 2026, Oktober 2026, September 2026, dst.).
  * Menyediakan dropdown pemilih bulan (*Month Selector*) di toolbar atas sehingga atlet bebas memilih bulan mana yang ingin diekspor.
  * Nama file hasil unduhan dinamis sesuai bulan terpilih: `freedayzz-month-in-sport-[bulan]-[tahun]-[format].png`.
* **Integrasi Metrik Biometrik Garmin pada Halaman Detail per Aktivitas (`/activities/[id]`):**
  * **Hero Header 7-Metrik Cockpit (`ActivityHeroHeader.tsx`):**
    * 🔥 **Kalori Terbakar Garmin (`detail.calories` / KCAL)** dengan ikon api oranye.
    * 👟 **Total Langkah Lari Aktual (`detail.steps` / STEPS)** dihitung dari sensor kadensi dan durasi gerak.
  * **Advanced Biomechanics 6-Grid Card (`RunningDynamicsCard.tsx`):**
    * Menambahkan kartu ke-6: **TOTAL RUN STEPS (`TOTAL_STEPS`)** bersanding dengan Cadence (SPM), Ground Contact Time (MS), Stride Length (M), Vertical Oscillation (CM), dan Vertical Ratio (%).
  * Memperbarui entitas domain `Activity.ts` dan mapper `GarminMappers.ts` untuk memetakan properti `steps`.

#### 🛠️ Diperbaiki (Fixed)
* **Perbaikan Tooltip Hover Hitam Tidak Terbaca ("Hitam Doang") pada Halaman Recovery:**
  * Di halaman `/recovery`, 4 grafik tren fisiologis 7-hari (*Resting Heart Rate*, *Overnight HRV*, *Body Battery Recharge & Drain*, dan *Sleep Duration*) sebelumnya menggunakan Recharts Tooltip default dengan background hitam pekat dan warna teks gelap/tidak eksplisit sehingga tidak terbaca pada mode terang.
  * Mengganti tooltip dengan komponen custom berkontras tinggi yang adaptif terhadap tema terang (`bg-white` dengan teks tajam) dan tema gelap (`bg-[#070a14]`).
  * Menambahkan aturan CSS universal untuk `.recharts-default-tooltip` di `src/app/globals.css` agar seluruh tooltip grafik di platform memiliki kontras sempurna.
  * Memperbaiki tooltip pada `WeeklyMileageProgressionChart.tsx` dan `PMCChart.tsx` agar teks terlihat jelas di mode terang.

---

### [v0.5.0] — 2026-11-04 (SaaS Landing Page, Brand Commercialization & BYOK Architecture)

#### 🌟 Ditambahkan (Added)
* **Halaman Publik Landing Page (`src/app/page.tsx`):**
  * Etalase komersial SaaS penuh gaya *Cyber-Athletic brutalist* untuk menarik minat pengguna dan penilaian tugas MPI.
  * **Hero Section:** Headline tajam *"Tinggalkan Analitik Terkunci. Kuasai Telemetri Lari Anda"* + Live Teaser Telemetry Cockpit.
  * **Dedicated Brand Showcase Section (`#brand`):** Memamerkan master logo brand PNG (`/logo.png`) beresolusi tinggi dengan 3 pilar filosofi visual (Kinetic Runner Waveform, Cyber-Athletic Spectrum, Data Sovereignty).
  * **Head-to-Head Comparison Table (`#comparison`):** Tabel perbandingan transparan 4-arah: **Garmin Connect (Free)** vs **Garmin Connect+ (Paid ~$7–$10/bln)** vs **Strava (Premium $12/bln)** vs **★ Freedayzz Pulse (BYOK 100% Free)**.
  * **Scientific Advantage Cards (`#features`):** Ulasan mendalam 4 fitur utama (ACWR, Garmin Recovery Hub, Bannister TRIMP/PMC, dan Social Export 9:16).
  * **BYOK Architecture Flowchart (`#byok`):** 3-langkah penjelasan filosofi *Bring Your Own Key*.
  * **Academic Footer:** Menyematkan atribusi resmi proyek *Manajemen Proyek TI (MPI)*.
* **Pemisahan Rute Platform Telemetri (`src/app/dashboard/page.tsx`):**
  * Seluruh dashboard telemetri atlet yang sudah jadi dipindahkan ke rute aman `/dashboard`.
* **Rencana Anggaran Biaya (RAB) Formal MPI:**
  * Penyusunan rancangan estimasi biaya berbasis CAPEX (SDM via Man-Month) dan OPEX (Cloud Serverless Vercel, Supabase PostgreSQL, Domain, Monitoring) dengan cadangan kontinjensi 10% (~Rp 60,7 Juta skenario industri / Rp 150rb-300rb skenario bootstrap mahasiswa).

#### 🔄 Diubah (Changed)
* **Logo Landing Page difokuskan ke PNG (`public/logo.png`):**
  * Sesuai permintaan pengguna, logo brand PNG difokuskan secara profesional pada Navbar, Section Brand Identity (`#brand`), dan Footer.
  * Bagian badge tengah Hero disederhanakan menjadi **Typography Badge murni** tanpa kotak logo gambar agar komposisi header lebih bersih dan fokus pada teks brand.
* **Layout Decoupling (`src/components/layout/AppLayoutClient.tsx`):**
  * Menggunakan `usePathname()`: Pada halaman publik (`/`, `/login`, `/register`), sidebar internal atlet disembunyikan agar tampilan landing page menjadi *full-width* bersih.
  * Pada halaman `/dashboard`, sidebar atlet otomatis aktif kembali.
* **Navigasi Sidebar (`src/components/layout/Sidebar.tsx`):**
  * Link navigasi Dashboard dan logo dialihkan dari `/` ke `/dashboard`.

#### 🛠️ Diperbaiki (Fixed)
* **Kontras Warna Teks Hero Headline:**
  * Memperbaiki warna teks `"KUASAI TELEMETRI LARI ANDA."` yang sebelumnya pudar/transparan di Light Mode. Diganti menjadi warna solid berdaya kontras tinggi (`text-violet-600 dark:text-cyan-400`) sehingga terbaca jelas 100% di semua tema.
* **Tabel Perbandingan Lengkap:**
  * Menambahkan kolom perbandingan berbayar **Garmin Connect+ (Paid ~$7–$10/bln)** sejajar dengan Garmin Free dan Strava Premium.

---

### [v0.4.0] — 2026-10-27 (Sidebar Re-architecture & Mobile Responsiveness)

#### 🌟 Ditambahkan (Added)
* **Collapsible Left Sidebar (`src/components/layout/Sidebar.tsx`):**
  * Menggantikan header horizontal atas (`Navbar.tsx`) menjadi sidebar vertikal modern kiri.
  * **Mode Expanded (`w-72`):** Menampilkan logo brand lengkap, badge PRO, link navigasi telemetri, tombol quick theme & language, dan tombol sync data.
  * **Mode Collapsed Mini-Rail (`w-16`):** Mode ramping 64px dengan icon-only navigation agar konten dashboard mendapatkan ruang maksimal (terinspirasi dari VS Code / Linear UI).
* **Komponen Tombol Morphing Hamburger-to-X (`src/components/layout/HamburgerButton.tsx`):**
  * Animasi CSS halus dari 3 baris hamburger bertransformasi menjadi tanda silang (X) dan sebaliknya.
* **State Management Sidebar (`src/context/SidebarContext.tsx`):**
  * Menyimpan status sidebar (buka/tutup) di `localStorage` (`freedayzz_sidebar_desktop`).
* **Mobile-First Navigation:**
  * Top sticky header (`h-14`) untuk layar HP dengan tombol hamburger drawer.
  * Slide-out drawer penuh dengan backdrop blur saat menu dibuka.
  * Bottom Dock Navigation Bar untuk akses cepat dengan satu jempol di layar mobile.

#### 🛠️ Diperbaiki (Fixed)
* **Masalah Tombol X "Offside":**
  * Memperlebar header sidebar ke `w-72` dan memberikan padding `px-3.5` sehingga tombol X berada rapi di dalam border kanan tanpa keluar garis.
* **Masalah Tombol Floating Menutupi Judul Halaman:**
  * Menghapus tombol floating `fixed top-4 left-4` yang sebelumnya menutupi teks `TELEMETRY_LOG // ARCHIVE`. Digantikan dengan sistem Mini Icon Rail (`w-16`) di mana konten utama otomatis bergeser (`md:pl-16`), menghilangkan 100% tumpang-tindih (zero overlap).
* **Teks Brand Terpotong Menjadi "..." (Ellipsis):**
  * Menghilangkan class `truncate` pada nama brand di header dan menggantinya dengan `whitespace-nowrap` serta ruang layout yang cukup.
* **Vercel Build Compatibility:**
  * Menambahkan proteksi `try-catch` pada operasi file I/O repository (`LocalFileActivityRepository.ts` & `AthleteSettingsManager.ts`) agar build static di Vercel serverless tidak gagal akibat sistem file *read-only*.
  * Menambahkan `outputFileTracingIncludes` di `next.config.ts` untuk memastikan berkas cache `data/` terbawa saat deployment Vercel.

---

### [v0.3.0] — 2026-10-26 (Bespoke Vector Brand & Light/Dark Mode Contrast)

#### 🌟 Ditambahkan (Added)
* **Bespoke Vector Brand Logo (`src/components/brand/BrandLogo.tsx`):**
  * Komponen SVG inline berbasis vektor murni menampilkan siluet pelari dinamis terintegrasi gelombang detak jantung (pulse line).
  * Palet warna adaptif: otomatis menyesuaikan kontras ketika berada di Dark Mode (Electric Violet `#7c3aed` & Cyan) maupun Light Mode.
* **Favicon & Metadata Browser Tab:**
  * Membuat `src/app/icon.svg` dan memperbarui `public/logo.svg` serta `public/logo-light.svg`.
  * Judul tab browser resmi diubah menjadi **"Freedayzz Pulse"**.
* **Fitur Ekspor Grafis "Month in Sport" (`src/components/dashboard/MonthInSportExportModal.tsx`):**
  * Format ekspor Instagram Story (9:16) dan format Widescreen (16:9) berbasis html-to-image.
  * Palet visual disesuaikan ke tema cyber-athletic violet/cyan (menghilangkan warna oranye yang tidak serasi).
  * Menghilangkan metrik `avgPace` pada kartu grafis sesuai arahan pengguna.

#### 🛠️ Diperbaiki (Fixed)
* **Overhaul Kontras CSS Light & Dark Mode (`src/app/globals.css`):**
  * Menghapus selector berbahaya `:not()` dan wildcard `[class*="bg-violet-7"] *` yang sebelumnya menyebabkan teks menjadi putih di atas background putih pada Light Mode.
  * Memulihkan CSS baseline standar dengan selektor kelas yang stabil dan aman untuk compiler Lightning CSS / Turbopack Next.js.

---

### [v0.2.0] — 2026-10-25 (Telemetry Deep-Dive & Dynamic Splits)

#### 🌟 Ditambahkan (Added)
* **Tabel Splits Bergaya Strava dengan Dynamic Pace Bar (`src/components/activity/SplitsTable.tsx`):**
  * Visualisasi rentang pacing dinamis 25%–100% untuk membedakan *Negative Split* (KM akhir lebih cepat) dan *Positive Split*.
  * Menghilangkan teks kalkulasi `+ / -` yang membingungkan dan menetapkan header bersih: `PACE BAR`.
* **Detail Aktivitas & Peta GPS Rute (`src/app/activities/[id]/page.tsx`):**
  * Integrasi Leaflet Map (`RouteMap.tsx`) dengan polyline koordinat lat/lon Garmin.
  * Grafik Profil Elevasi vs Pace (`ElevationPaceChart.tsx`).
  * Distribusi Zona Heart Rate (Zone 1 s/d Zone 5) dan Pace Zones.
  * Kartu Dinamika Lari: Rata-rata Cadence, Panjang Langkah (*Stride Length*), *Vertical Oscillation*, dan *Ground Contact Time*.
* **Fitur Pembanding Sesi Lari (`src/app/activities/compare/page.tsx`):**
  * Membandingkan dua sesi lari secara *side-by-side*.

---

### [v0.1.0] — 2026-10-24 (Inisiasi Proyek & Fondasi Sains Lari)

#### 🌟 Ditambahkan (Added)
* **Arsitektur Clean Architecture / DDD:**
  * Pembagian modul: `domain` (Entities, Calculators), `application` (Use Cases), `infrastructure` (Garmin API Client, Local File Persistence), `components` (UI).
* **Konektor Garmin Connect API:**
  * Autentikasi dan sinkronisasi berkas lari serta health telemetry via Personal API Key atlet.
* **ACWR Calculator (Acute-to-Chronic Workload Ratio):**
  * Deteksi rasio beban 7-hari vs 28-hari untuk pencegahan cedera (*Safe Zone 0.8–1.3*).
* **Bannister TRIMP & HRR Calculator:**
  * Penghitungan beban kardiak berdasarkan Heart Rate Reserve (Karvonen Profile).
* **Garmin Recovery Hub:**
  * Pembacaan metrik kesehatan: Skor Tidur (*Sleep Score*), HRV Status, *Resting Heart Rate*, dan estimasi VO2Max.
* **Dashboard Widgets Inti:**
  * `WeeklyHeroStats`, `MonthlyTrainingCalendar`, `FitnessFreshnessMiniWidget`, `WeeklyMileageProgressionChart`.

---

## 🔮 Rencana Milestone Berikutnya (Upcoming Sprints)

- [ ] **v0.6.0:** Setup Database Supabase & Skema Tabel Multi-Tenant (`profiles`, `garmin_credentials`, `activities`).
- [ ] **v0.7.0:** Implementasi Halaman `/login`, `/register`, dan Onboarding Gateway Input Garmin Personal API Key (`/onboarding/garmin`).
- [ ] **v0.8.0:** Konsol Monitoring Admin (`/admin`) untuk statistik platform, audit API log, dan direktori pengguna.
- [ ] **v1.0.0:** Final UAT, Security Audit, dan Deployment Produksi ke Vercel Publik.
