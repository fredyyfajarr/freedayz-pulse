export type TaskType = 
  | 'INTERVAL' 
  | 'TEMPO' 
  | 'LONG_RUN' 
  | 'RECOVERY' 
  | 'STRENGTH_DRILL' 
  | 'RACE_SIMULATION';

export type TaskStatus = 'PENDING' | 'COMPLETED' | 'MISSED';

export interface CoachTask {
  id: string;
  athleteId: string;
  athleteName: string;
  coachName: string;
  title: string;
  type: TaskType;
  dueDate: string;
  targetDistanceKm: number;
  targetPace: string;
  targetHrZone: string;
  instructions: string;
  status: TaskStatus;
  completedAt?: string;
  reportedRpe?: number; // Borg CR10 Scale (1 - 10)
  athleteFeedback?: string;
  coachReviewNote?: string;
  adherenceScore?: number; // percentage (e.g. 95)
}

export interface SquadAthlete {
  id: string;
  coachId?: string;
  name: string;
  email: string;
  targetRace: string;
  acwr: number;
  acwrZone: 'SWEET_SPOT' | 'WARNING' | 'DANGER';
  weeklyMileageKm: number;
  targetWeeklyKm: number;
  lastSession: string;
  tsb: number;
  packageTier: string;
  joinedAt?: string;
  ctl?: number;
  atl?: number;
  hrvStatus?: string;
  rhrBpm?: number;
  sleepScore?: number;
}

export interface CoachingPackage {
  id: string;
  name: string;
  targetCategory: '10K' | 'HM' | 'FM' | 'ULTRA';
  monthlyFeeIdr: number;
  durationMonths: number;
  benefits: string[];
  activeAthletesCount: number;
}

export interface AvailableCoachProgram {
  id: string;
  title: string;
  category: string;
  durationWeeks: number;
  description: string;
}

export interface AvailableCoach {
  id: string;
  name: string;
  email?: string;
  role: string;
  club: string;
  specialty: string;
  avatarInitials: string;
  programs: AvailableCoachProgram[];
}

export const DIRECTORY_COACHES: AvailableCoach[] = [
  {
    id: 'coach-pack',
    name: 'Coach Pack',
    email: 'packdorez4@gmail.com',
    role: 'Head of Squad Performance',
    club: 'Freedayzz Athletic Club',
    specialty: 'Marathon Periodization & Aerobic Engine Building',
    avatarInitials: 'PA',
    programs: [
      {
        id: 'prog-fm',
        title: 'Marathon Sub-4 Periodization & Taper',
        category: 'Full Marathon (FM)',
        durationWeeks: 12,
        description: 'Blok makrosiklus maraton: 3 minggu pembebanan + 1 minggu deload, simulasi nutrisi & hidrasi balapan.',
      },
      {
        id: 'prog-hm',
        title: 'Half-Marathon Progressive Build',
        category: 'Half Marathon (HM)',
        durationWeeks: 10,
        description: 'Membangun daya tahan lari jarak menengah dengan simulasi race pace dan negative split.',
      },
    ],
  },
  {
    id: 'coach-faisal',
    name: 'Coach Faisal',
    email: 'faisal@freedayzz.run',
    role: 'Lactate Threshold & Track Specialist',
    club: 'Endurance Performance Lab',
    specialty: '10K Lactate Clearance & VO2Max Interval Training',
    avatarInitials: 'FA',
    programs: [
      {
        id: 'prog-10k',
        title: '10K Lactate Threshold & Speed Sharpening',
        category: '10K Road Race',
        durationWeeks: 8,
        description: 'Peningkatan kecepatan ambang laktat dan kapasitas anaerobik untuk memecahkan Personal Best 10K.',
      },
      {
        id: 'prog-base',
        title: 'Fondasi Aerobik & Engine Builder',
        category: 'Base Conditioning',
        durationWeeks: 6,
        description: 'Fokus adaptasi kardiovaskular Zona 2 murni, densitas kapiler, dan efisiensi biomekanika lari.',
      },
    ],
  },
  {
    id: 'coach-dani',
    name: 'Coach Dani',
    email: 'dani@freedayzz.run',
    role: 'Biomechanics & Running Form Coach',
    club: 'Track & Biomechanics Clinic',
    specialty: 'Cadence (SPM), Ground Contact Time, and Injury Prevention',
    avatarInitials: 'DA',
    programs: [
      {
        id: 'prog-biomech',
        title: 'Running Economy & Form Optimization',
        category: 'Biomekanika & Form',
        durationWeeks: 4,
        description: 'Koreksi kadensi (target 175-180 SPM), meminimalkan pantulan vertikal, dan optimasi fase dorongan langkah.',
      },
    ],
  },
];

export type RABCategory = 
  | 'VENUE_TRACK' 
  | 'PHYSIOLOGY_LAB' 
  | 'MEDICAL_RECOVERY' 
  | 'LOGISTICS_NUTRITION' 
  | 'COACHING_SERVICES';

export interface RABItem {
  id: string;
  category: RABCategory;
  name: string;
  volume: number;
  unit: string;
  unitPriceIdr: number;
  totalPriceIdr: number;
  realizationStatus: 'PLANNED' | 'COMMITTED' | 'PAID';
  notes: string;
}

export interface CommercialFinancialSummary {
  totalRabBudget: number;
  totalProjectedRevenue: number;
  netMarginIdr: number;
  netMarginPercentage: number;
  realizedExpenseIdr: number;
  budgetUtilizationPercentage: number;
  costPerAthleteIdr: number;
}

// Initial Realistic Seed Data for Commercial Coaching Tasks
export const INITIAL_COACH_TASKS: CoachTask[] = [];

// Initial Realistic Commercial Coaching Packages
export const INITIAL_COACHING_PACKAGES: CoachingPackage[] = [
  {
    id: 'pkg-base',
    name: 'Paket Community Squad (Base Aerobik)',
    targetCategory: '10K',
    monthlyFeeIdr: 350000,
    durationMonths: 3,
    benefits: [
      'Menu Latihan Mingguan Terstruktur',
      'Akses Sesi Latihan Bersama 2x/minggu',
      'Monitoring ACWR & Beban Latihan Tim',
      'Grup Diskusi & Sharing Taktis Mingguan',
    ],
    activeAthletesCount: 12,
  },
  {
    id: 'pkg-hm',
    name: 'Paket Half Marathon Performance',
    targetCategory: 'HM',
    monthlyFeeIdr: 650000,
    durationMonths: 4,
    benefits: [
      'Program Khusus Sub-2 Jam atau Target PB',
      'Sewa Lintasan Atletik Track (RAB Ditanggung Tim)',
      '1x Uji Ambang Laktat Portabel per Siklus',
      'Review Telemetri Garmin Harian oleh Coach',
      'Pendampingan Official Pacer Long Run',
    ],
    activeAthletesCount: 8,
  },
  {
    id: 'pkg-fm',
    name: 'Paket Elite Marathon Podium / BQ (1-on-1)',
    targetCategory: 'FM',
    monthlyFeeIdr: 1250000,
    durationMonths: 4,
    benefits: [
      'Periodisasi Makrosiklus 16 Minggu Lengkap',
      'Akses Track Atletik Sintetis Stadion Bebas',
      'Tes Laboratorium VO2Max & Profil Fisiologis',
      'Sesi Fisioterapi & Ice Bath Bulanan',
      'Strategi Nutrisi, Carbo-loading & Race Escort',
      'Konsultasi Intensif 1-on-1 via WhatsApp/Call',
    ],
    activeAthletesCount: 5,
  },
];

// Initial Commercial RAB (Rencana Anggaran Biaya) Tim Lari
export const INITIAL_RAB_ITEMS: RABItem[] = [
  // 1. Fasilitas & Track Lari
  {
    id: 'rab-1',
    category: 'VENUE_TRACK',
    name: 'Sewa Lintasan Lari Sintetis Stadion Atletik (Sesi Interval)',
    volume: 16,
    unit: 'Sesi / Musim',
    unitPriceIdr: 450000,
    totalPriceIdr: 7200000,
    realizationStatus: 'COMMITTED',
    notes: 'Jadwal rutin tiap Selasa & Kamis pagi (05.30 - 08.00 WIB)',
  },
  {
    id: 'rab-2',
    category: 'VENUE_TRACK',
    name: 'Retribusi & Kebersihan Basecamp Track Atletik',
    volume: 4,
    unit: 'Bulan',
    unitPriceIdr: 250000,
    totalPriceIdr: 1000000,
    realizationStatus: 'PAID',
    notes: 'Iuran resmi pengelola fasilitas olahraga',
  },
  // 2. Fisiologis & Lab Olahraga
  {
    id: 'rab-3',
    category: 'PHYSIOLOGY_LAB',
    name: 'Uji Laktat Portabel Strip & Jarum Lancet (Lactate Scout)',
    volume: 50,
    unit: 'Strip Test',
    unitPriceIdr: 85000,
    totalPriceIdr: 4250000,
    realizationStatus: 'COMMITTED',
    notes: 'Untuk kalibrasi akurat Threshold HR & Zona Latihan atlet binaan',
  },
  {
    id: 'rab-4',
    category: 'PHYSIOLOGY_LAB',
    name: 'Tes Laboratorium VO2Max & Treadmill Spirometri (Spesialis FM)',
    volume: 5,
    unit: 'Atlet',
    unitPriceIdr: 750000,
    totalPriceIdr: 3750000,
    realizationStatus: 'PLANNED',
    notes: 'Di laboratorium sport science pada minggu ke-4 & minggu ke-10',
  },
  // 3. Medis, Fisioterapi & Recovery
  {
    id: 'rab-5',
    category: 'MEDICAL_RECOVERY',
    name: 'Sesi Fisioterapi Olahraga & Dry Needling (On-site Tim)',
    volume: 8,
    unit: 'Kunjungan Tim',
    unitPriceIdr: 800000,
    totalPriceIdr: 6400000,
    realizationStatus: 'COMMITTED',
    notes: 'Fisioterapis berlisensi hadir pasca sesi Long Run akhir pekan',
  },
  {
    id: 'rab-6',
    category: 'MEDICAL_RECOVERY',
    name: 'Logistik Ice Bath & Cold Water Immersion (Recovery)',
    volume: 16,
    unit: 'Sesi',
    unitPriceIdr: 150000,
    totalPriceIdr: 2400000,
    realizationStatus: 'PAID',
    notes: 'Balok es kristal dan wadah immersion pasca Long Run > 25km',
  },
  {
    id: 'rab-7',
    category: 'MEDICAL_RECOVERY',
    name: 'Kinesio Taping, Foam Rollers & First Aid P3K Kit',
    volume: 1,
    unit: 'Paket Musim',
    unitPriceIdr: 1800000,
    totalPriceIdr: 1800000,
    realizationStatus: 'PAID',
    notes: 'Perlengkapan pencegahan cedera ligamen & tendon patella',
  },
  // 4. Logistik & Race Day
  {
    id: 'rab-8',
    category: 'LOGISTICS_NUTRITION',
    name: 'Water Station, Isotonik & Pisang Long Run Mingguan',
    volume: 16,
    unit: 'Titik Sesi',
    unitPriceIdr: 350000,
    totalPriceIdr: 5600000,
    realizationStatus: 'COMMITTED',
    notes: 'Air mineral galon, bubuk elektrolit, buah pisang & semangka',
  },
  {
    id: 'rab-9',
    category: 'LOGISTICS_NUTRITION',
    name: 'Energy Gel & Salt Sticks Sponsorship Cadangan Tim',
    volume: 120,
    unit: 'Sachet Gel',
    unitPriceIdr: 38000,
    totalPriceIdr: 4560000,
    realizationStatus: 'PLANNED',
    notes: 'Stok darurat untuk peak long run 30K+ dan hari perlombaan',
  },
  {
    id: 'rab-10',
    category: 'LOGISTICS_NUTRITION',
    name: 'Sewa Motor / Sepeda Marshall Pengawal Rute Long Run',
    volume: 8,
    unit: 'Sesi',
    unitPriceIdr: 200000,
    totalPriceIdr: 1600000,
    realizationStatus: 'PLANNED',
    notes: 'Untuk keamanan atlet di jalan raya terbuka saat long run 25-32km',
  },
  // 5. Jasa Kepelatihan & Manajemen
  {
    id: 'rab-11',
    category: 'COACHING_SERVICES',
    name: 'Honorarium Head Coach (Perancangan Periodisasi & Evaluasi Telemetri)',
    volume: 4,
    unit: 'Bulan',
    unitPriceIdr: 4500000,
    totalPriceIdr: 18000000,
    realizationStatus: 'COMMITTED',
    notes: 'Penyusunan modul, pemantauan ACWR harian, dan instruksi tim',
  },
  {
    id: 'rab-12',
    category: 'COACHING_SERVICES',
    name: 'Honorarium Asisten Pelatih & Official Pacer Skuad',
    volume: 4,
    unit: 'Bulan',
    unitPriceIdr: 2200000,
    totalPriceIdr: 8800000,
    realizationStatus: 'COMMITTED',
    notes: 'Pendamping pacer pace 5:00, 5:30, 6:00 pada sesi latihan bersama',
  },
];
