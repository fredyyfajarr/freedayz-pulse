import { Language } from './translations';

export interface LandingTranslations {
  nav: {
    brand: string;
    comparison: string;
    features: string;
    byok: string;
    launchLab: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    btnLaunch: string;
    btnCompare: string;
    highlights: {
      byok: string;
      acwr: string;
      banister: string;
      recovery: string;
    };
    mockup: {
      windowTitle: string;
      sensorSync: string;
      metric1Label: string;
      metric1Sub: string;
      metric2Label: string;
      metric2Ratio: string;
      metric2Sub: string;
      metric3Label: string;
      metric3Sub: string;
      metric4Label: string;
      metric4Sub: string;
    };
  };
  brand: {
    badge: string;
    title: string;
    subtitle: string;
    masterLogoTitle: string;
    masterLogoSubtitle: string;
    vectorDna: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
  };
  comparison: {
    badge: string;
    title: string;
    subtitle: string;
    colDimension: string;
    colGarminFree: string;
    colGarminPlus: string;
    colStrava: string;
    colFreedayzz: string;
    rows: {
      cost: {
        dim: string;
        garminFree: string;
        garminPlus: string;
        strava: string;
        freedayzz: string;
      };
      synthesis: {
        dim: string;
        garminFree: string;
        garminPlus: string;
        strava: string;
        freedayzz: string;
      };
      acwr: {
        dim: string;
        garminFree: string;
        garminPlus: string;
        strava: string;
        freedayzz: string;
      };
      pmc: {
        dim: string;
        garminFree: string;
        garminPlus: string;
        strava: string;
        freedayzz: string;
      };
      export: {
        dim: string;
        garminFree: string;
        garminPlus: string;
        strava: string;
        freedayzz: string;
      };
      sovereignty: {
        dim: string;
        garminFree: string;
        garminPlus: string;
        strava: string;
        freedayzz: string;
      };
    };
  };
  features: {
    badge: string;
    title: string;
    subtitle: string;
    cards: Array<{
      tag: string;
      title: string;
      desc: string;
    }>;
  };
  byok: {
    badge: string;
    title: string;
    subtitle: string;
    steps: Array<{
      step: string;
      title: string;
      desc: string;
    }>;
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  footer: {
    tagline: string;
    academicCourse: string;
    rights: string;
  };
}

export const landingTranslations: Record<Language, LandingTranslations> = {
  ID: {
    nav: {
      brand: 'IDENTITAS BRAND',
      comparison: 'VS STRAVA & GARMIN',
      features: 'FITUR UTAMA',
      byok: 'FILOSOFI BYOK',
      launchLab: 'BUKA TELEMETRY LAB',
    },
    hero: {
      badge: '// ATHLETE TELEMETRY LAB',
      titleLine1: 'TINGGALKAN ANALITIK TERKUNCI.',
      titleLine2: 'KUASAI TELEMETRI LARI ANDA.',
      subtitle:
        'Platform analisis performa lari independen berbasis filosofi Bring-Your-Own-Key (BYOK). Satukan beban latihan kardiak (TRIMP, ACWR, PMC) dengan pemulihan biometrik Garmin (Sleep, HRV, Body Battery) ke dalam satu cockpit tanpa biaya langganan bulanan mahal.',
      btnLaunch: 'MASUK KE TELEMETRY LAB',
      btnCompare: 'LIHAT PERBANDINGAN VS STRAVA',
      highlights: {
        byok: '100% Kedaulatan BYOK',
        acwr: 'Radar Cedera ACWR (0.8–1.3)',
        banister: 'Model Banister TRIMP & PMC',
        recovery: 'Korelasi Tidur & Pemulihan',
      },
      mockup: {
        windowTitle: 'FREEDAYZZ_PULSE // LIVE_COCKPIT_TELEMETRI.EXE',
        sensorSync: 'SENSOR GARMIN TERHUBUNG // LATENSI 12ms',
        metric1Label: 'JARAK MINGGUAN',
        metric1Sub: '▲ +14% vs minggu lalu',
        metric2Label: 'RADAR RISIKO ACWR',
        metric2Ratio: 'RASIO',
        metric2Sub: '● SWEET SPOT // RISIKO RENDAH',
        metric3Label: 'BANNISTER TRIMP',
        metric3Sub: 'Beban Kardiak Harian',
        metric4Label: 'PEMULIHAN GARMIN',
        metric4Sub: 'HRV Seimbang • RHR 51 bpm',
      },
    },
    brand: {
      badge: 'IDENTITAS & BRANDMARK RESMI',
      title: 'FILOSOFI BRAND FREEDAYZZ PULSE',
      subtitle:
        'Dirancang dengan presisi kinetik atletik untuk merepresentasikan sinergi antara kecepatan lari dan detak jantung kardiak.',
      masterLogoTitle: 'TRADEMARK & IKON UTAMA',
      masterLogoSubtitle: 'SIMBOL RESMI TELEMETRI SAAS',
      vectorDna: 'HIGH PRECISION VECTOR DNA',
      pillar1Title: '1. KINETIC RUNNER & GELOMBANG KARDIAK',
      pillar1Desc:
        'Visual siluet pelari dinamis yang menyatu dengan osilasi gelombang denyut jantung (pulse wave), menyimbolkan keterpaduan antara tenaga mekanis lari dan pemulihan kardiak.',
      pillar2Title: '2. SPEKTRUM WARNA CYBER-ATHLETIC',
      pillar2Desc:
        'Palet Electric Violet (#7C3AED) dan Cyber Cyan (#06B6D4) dirancang untuk visibilitas tinggi dalam kondisi minim cahaya (night runs) dan tampilan antarmuka telemetry lab modern.',
      pillar3Title: '3. KEDAULATAN DATA (DATA SOVEREIGNTY)',
      pillar3Desc:
        'Identitas brand yang merepresentasikan kebebasan atlet: data lari milik Anda sendiri, dianalisis tanpa paywall mahal dan tanpa ketergantungan pada vendor sosial tunggal.',
    },
    comparison: {
      badge: 'KOMPARASI TRANSPARAN',
      title: 'MENGAPA FREEDAYZZ PULSE BERBEDA?',
      subtitle:
        'Perbandingan objektif antara aplikasi bawaan jam, langganan add-on berbayar, jejaring sosial atlet, dan lab telemetri khusus pelari.',
      colDimension: 'DIMENSI FITUR & ANALITIK',
      colGarminFree: 'GARMIN CONNECT (FREE)',
      colGarminPlus: 'GARMIN CONNECT+ (PAID)',
      colStrava: 'STRAVA (PREMIUM)',
      colFreedayzz: '★ FREEDAYZZ PULSE (BYOK)',
      rows: {
        cost: {
          dim: 'Biaya Langganan Bulanan',
          garminFree: 'Gratis (Bawaan Jam)',
          garminPlus: '~$7–$10 / bln (~Rp 130rb)',
          strava: '$12 / bln (~Rp 150rb)',
          freedayzz: '100% GRATIS (Personal Key)',
        },
        synthesis: {
          dim: 'Sintesis Lari + Kondisi Tubuh (Sleep & HRV)',
          garminFree: 'Terpisah di tab berbeda',
          garminPlus: 'Narasi teks AI (tetap menu terpisah)',
          strava: 'Tidak Ada Data Sleep/HRV',
          freedayzz: 'Terpadu di 1 Cockpit Real-time',
        },
        acwr: {
          dim: 'Radar Risiko Cedera (ACWR 0.8–1.3)',
          garminFree: 'Hanya Load 7 Hari',
          garminPlus: 'Acute Load Tertutup',
          strava: 'Tidak Tersedia',
          freedayzz: 'Safe Zone Band Alert (0.8–1.3)',
        },
        pmc: {
          dim: 'Model Kebugaran PMC (Fitness, Fatigue, Form)',
          garminFree: 'Training Status Standar',
          garminPlus: 'Prediksi Race Waktu Tertutup',
          strava: 'Terkunci di Balik Paywall',
          freedayzz: 'Model Banister Matematis (CTL/ATL/TSB)',
        },
        export: {
          dim: 'Export Grafis Media Sosial (Story 9:16)',
          garminFree: 'Standar / Kaku',
          garminPlus: 'Format Grafis Standar Garmin',
          strava: 'Peta Oranye Kasual',
          freedayzz: 'Cyber Aesthetic (9:16 & 16:9)',
        },
        sovereignty: {
          dim: 'Kedaulatan & Filosofi Akses Data',
          garminFree: 'Ekosistem Tertutup Garmin',
          garminPlus: 'Terkunci Berlangganan Ekosistem',
          strava: 'Tersimpan di Server Strava',
          freedayzz: 'BYOK (Kunci Pribadi Milik Anda)',
        },
      },
    },
    features: {
      badge: 'KEUNGGULAN ILMIAH',
      title: 'FITUR TELEMETRI FREEDAYZZ',
      subtitle:
        'Bukan sekadar mencatat jarak, tetapi memahami fisiologi tubuh Anda saat berlari.',
      cards: [
        {
          tag: 'INJURY_PREVENTION // 01',
          title: 'ACWR (Acute-to-Chronic Workload Ratio)',
          desc:
            'Algoritma pencegahan cedera standar atlet elit. Membandingkan beban latihan 7 hari terakhir (akut) terhadap beban 28 hari (kronis). Memberi peringatan dini saat rasio melompat di atas 1.5 (zona bahaya cedera).',
        },
        {
          tag: 'RECOVERY_HUB // 02',
          title: 'Garmin Biometrics & Health Hub',
          desc:
            'Ketahui mengapa pace Anda menurun hari ini. Kami menyandingkan skor tidur (Sleep Score), variabilitas detak jantung (HRV 7-hari), dan Body Battery langsung dengan metrik latihan lari pagi Anda.',
        },
        {
          tag: 'FITNESS_FRESHNESS // 03',
          title: 'Banister TRIMP & PMC Engine',
          desc:
            'Kalkulasi Training Impulse berbasis durasi dan detak jantung cadangan (HRR). Visualisasikan kurva Kebugaran (CTL), Kelelahan (ATL), dan Kesiapan Balapan (TSB/Form) untuk timing tapering akurat.',
        },
        {
          tag: 'SOCIAL_EXPORT // 04',
          title: 'Bespoke Story Export (9:16 & 16:9)',
          desc:
            'Tampilkan rekap bulanan Anda dengan visual cyber-athletic yang elegan. Ekspor instan kartu grafik format Instagram Story (9:16) dan feed landscape (16:9) tanpa watermark murah.',
        },
      ],
    },
    byok: {
      badge: 'ARSITEKTUR TANPA LANGGANAN',
      title: 'BAGAIMANA FILOSOFI BYOK BEKERJA?',
      subtitle:
        'Satu-satunya alasan Strava mahal adalah biaya penyimpanan server jutaan pengguna. Kami memangkasnya 100%.',
      steps: [
        {
          step: '01',
          title: 'Ambil Garmin Personal Key',
          desc:
            'Dapatkan Personal API Key resmi dari akun Garmin Anda secara gratis tanpa perlu persetujuan berbayar.',
        },
        {
          step: '02',
          title: 'Hubungkan ke Freedayzz',
          desc:
            'Kunci Anda disimpan secara terenkripsi di browser. Serverless API kami hanya bertindak sebagai mesin kalkulator telemetri.',
        },
        {
          step: '03',
          title: 'Akses Telemetri Elit',
          desc:
            'Nikmati fitur analisis setara aplikasi berbayar ratusan ribu rupiah per bulan tanpa tagihan berulang.',
        },
      ],
    },
    cta: {
      title: 'SIAP MENGOPTIMALKAN PERFORMA LARI ANDA?',
      subtitle:
        'Buka kokpit telemetri Anda sekarang. Lihat analitik mingguan, kalender beban bulanan, dan deteksi kelelahan secara langsung.',
      button: 'LUNCURKAN TELEMETRY LAB SEKARANG',
    },
    footer: {
      tagline: 'ADVANCED RUNNING TELEMETRY & ATHLETE RECOVERY LAB',
      academicCourse: 'MANAJEMEN PROYEK TI (MPI) • SPORT-TECH SAAS PROTOTYPE',
      rights: 'ALL RIGHTS RESERVED.',
    },
  },
  EN: {
    nav: {
      brand: 'BRAND IDENTITY',
      comparison: 'VS STRAVA & GARMIN',
      features: 'CORE FEATURES',
      byok: 'BYOK PHILOSOPHY',
      launchLab: 'OPEN TELEMETRY LAB',
    },
    hero: {
      badge: '// ATHLETE TELEMETRY LAB',
      titleLine1: 'DITCH LOCKED PAYWALLS.',
      titleLine2: 'MASTER YOUR RUNNING TELEMETRY.',
      subtitle:
        'Independent running performance telemetry powered by Bring-Your-Own-Key (BYOK) architecture. Combine cardiac training load (TRIMP, ACWR, PMC) with Garmin biometric recovery (Sleep, HRV, Body Battery) in a single unified cockpit with zero monthly subscriptions.',
      btnLaunch: 'ENTER TELEMETRY LAB',
      btnCompare: 'COMPARE VS STRAVA & GARMIN',
      highlights: {
        byok: '100% BYOK Freedom',
        acwr: 'ACWR Injury Radar (0.8–1.3)',
        banister: 'Banister TRIMP & PMC Model',
        recovery: 'Sleep & Recovery Correlation',
      },
      mockup: {
        windowTitle: 'FREEDAYZZ_PULSE // LIVE_COCKPIT_TELEMETRY.EXE',
        sensorSync: 'GARMIN SENSOR SYNCED // LATENCY 12ms',
        metric1Label: 'WEEKLY DISTANCE',
        metric1Sub: '▲ +14% vs last week',
        metric2Label: 'ACWR INJURY RADAR',
        metric2Ratio: 'RATIO',
        metric2Sub: '● SWEET SPOT // LOW RISK',
        metric3Label: 'BANNISTER TRIMP',
        metric3Sub: 'Cardiac Workload Load',
        metric4Label: 'GARMIN RECOVERY',
        metric4Sub: 'HRV Balanced • RHR 51 bpm',
      },
    },
    brand: {
      badge: 'OFFICIAL IDENTITY & BRANDMARK',
      title: 'FREEDAYZZ PULSE BRAND PHILOSOPHY',
      subtitle:
        'Engineered with kinetic athletic precision to represent the synergy between running velocity and cardiac heart rate telemetry.',
      masterLogoTitle: 'MASTER TRADEMARK & ICON',
      masterLogoSubtitle: 'OFFICIAL SAAS TELEMETRY SYMBOL',
      vectorDna: 'HIGH PRECISION VECTOR DNA',
      pillar1Title: '1. KINETIC RUNNER & CARDIAC WAVEFORM',
      pillar1Desc:
        'Dynamic runner silhouette fused with cardiac heart rate oscillations (pulse wave), symbolizing the seamless harmony of mechanical output and physiological recovery.',
      pillar2Title: '2. CYBER-ATHLETIC COLOR SPECTRUM',
      pillar2Desc:
        'Electric Violet (#7C3AED) and Cyber Cyan (#06B6D4) palette engineered for optimal visibility during low-light night runs and modern telemetry lab interfaces.',
      pillar3Title: '3. ATHLETE DATA SOVEREIGNTY',
      pillar3Desc:
        'A brand identity championing athlete autonomy: your telemetry belongs to you, analyzed without prohibitive paywalls or single-vendor lock-in.',
    },
    comparison: {
      badge: 'TRANSPARENT COMPARISON',
      title: 'WHY IS FREEDAYZZ PULSE DIFFERENT?',
      subtitle:
        'An objective breakdown across stock watch companion apps, paid add-ons, social running networks, and dedicated telemetry labs.',
      colDimension: 'FEATURE & ANALYTICS DIMENSION',
      colGarminFree: 'GARMIN CONNECT (FREE)',
      colGarminPlus: 'GARMIN CONNECT+ (PAID)',
      colStrava: 'STRAVA (PREMIUM)',
      colFreedayzz: '★ FREEDAYZZ PULSE (BYOK)',
      rows: {
        cost: {
          dim: 'Monthly Subscription Cost',
          garminFree: 'Free (Included with Device)',
          garminPlus: '~$7–$10 / mo (~Rp 130k)',
          strava: '$12 / mo (~Rp 150k)',
          freedayzz: '100% FREE (Personal Key)',
        },
        synthesis: {
          dim: 'Run + Body Recovery Synthesis (Sleep & HRV)',
          garminFree: 'Fragmented across tabs',
          garminPlus: 'AI text summaries (still separated menus)',
          strava: 'No Sleep / HRV Tracking',
          freedayzz: 'Unified in 1 Real-time Cockpit',
        },
        acwr: {
          dim: 'Injury Risk Radar (ACWR 0.8–1.3)',
          garminFree: '7-Day Training Load Only',
          garminPlus: 'Proprietary Closed Load Model',
          strava: 'Not Available',
          freedayzz: 'Active Safe Zone Band Alert (0.8–1.3)',
        },
        pmc: {
          dim: 'PMC Fitness Model (Fitness, Fatigue, Form)',
          garminFree: 'Standard Training Status',
          garminPlus: 'Closed Black-Box Predictor',
          strava: 'Locked Behind Paywall',
          freedayzz: 'Mathematical Banister Model (CTL/ATL/TSB)',
        },
        export: {
          dim: 'Social Media Graphic Export (9:16 Story)',
          garminFree: 'Basic / Rigid',
          garminPlus: 'Standard Garmin Graphic Cards',
          strava: 'Casual Orange Route Map',
          freedayzz: 'Cyber Aesthetic (9:16 & 16:9)',
        },
        sovereignty: {
          dim: 'Data Sovereignty & Access Philosophy',
          garminFree: 'Closed Garmin Ecosystem',
          garminPlus: 'Locked to Ecosystem Subscription',
          strava: 'Stored on Strava Cloud Servers',
          freedayzz: 'BYOK (You Own Your API Keys)',
        },
      },
    },
    features: {
      badge: 'SCIENTIFIC ADVANTAGE',
      title: 'FREEDAYZZ TELEMETRY SUITE',
      subtitle:
        'Beyond simple mileage: decoding your running physiology with clinical accuracy.',
      cards: [
        {
          tag: 'INJURY_PREVENTION // 01',
          title: 'ACWR (Acute-to-Chronic Workload Ratio)',
          desc:
            'Elite athlete injury prevention model. Compares 7-day fatigue (acute load) to 28-day fitness (chronic load), alerting you before crossing into high-risk injury spikes (> 1.5).',
        },
        {
          tag: 'RECOVERY_HUB // 02',
          title: 'Garmin Biometrics & Health Hub',
          desc:
            'Understand why your pace dropped today. Correlate sleep scores, 7-day resting heart rate variability (HRV), and Body Battery directly alongside morning workout splits.',
        },
        {
          tag: 'FITNESS_FRESHNESS // 03',
          title: 'Banister TRIMP & PMC Engine',
          desc:
            'Calculates Training Impulse (TRIMP) derived from heart rate reserve (HRR) and duration. Plot Chronic Training Load (CTL), Acute Training Load (ATL), and Form (TSB) for pinpoint race tapering.',
        },
        {
          tag: 'SOCIAL_EXPORT // 04',
          title: 'Bespoke Story Export (9:16 & 16:9)',
          desc:
            'Showcase monthly milestones in high-contrast cyber-athletic aesthetics. Generate high-resolution Instagram Story (9:16) and landscape (16:9) telemetry cards with zero cheap watermarks.',
        },
      ],
    },
    byok: {
      badge: 'ZERO SUBSCRIPTION ARCHITECTURE',
      title: 'HOW DOES BYOK WORK?',
      subtitle:
        'Commercial platforms charge recurring fees to store millions of user histories. We eliminate this with zero server bloat.',
      steps: [
        {
          step: '01',
          title: 'Get Your Garmin Key',
          desc:
            'Retrieve your official Garmin personal key or export tokens directly from your account without subscription fees.',
        },
        {
          step: '02',
          title: 'Connect to Freedayzz',
          desc:
            'Your keys stay client-encrypted in your browser. Our serverless compute engine merely acts as a high-speed telemetry calculator.',
        },
        {
          step: '03',
          title: 'Unlock Elite Analytics',
          desc:
            'Access pro-tier predictive modeling and cardiac metrics rivaling expensive recurring plans, free forever.',
        },
      ],
    },
    cta: {
      title: 'READY TO ELEVATE YOUR RUNNING TELEMETRY?',
      subtitle:
        'Open your telemetry cockpit today. Monitor weekly workload trends, monthly intensity distribution, and acute fatigue in real-time.',
      button: 'LAUNCH TELEMETRY LAB NOW',
    },
    footer: {
      tagline: 'ADVANCED RUNNING TELEMETRY & ATHLETE RECOVERY LAB',
      academicCourse: 'IT PROJECT MANAGEMENT (MPI) • SPORT-TECH SAAS PROTOTYPE',
      rights: 'ALL RIGHTS RESERVED.',
    },
  },
};
