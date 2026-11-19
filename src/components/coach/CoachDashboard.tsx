'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  Zap, 
  TrendingUp, 
  Calendar, 
  UserPlus, 
  Copy, 
  Check, 
  Activity, 
  Award,
  BookOpen,
  Plus,
  Send,
  MessageSquare,
  Sparkles,
  Heart,
  Timer,
  ChevronRight,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  coachName: string;
  coachEmail: string;
  userId: string;
}

interface TrainingPlan {
  id: string;
  title: string;
  category: 'Base' | '5K' | '10K' | 'HM' | 'FM';
  durationWeeks: number;
  targetPace: string;
  hrZone: string;
  description: string;
  weeklyStructure: string;
  isCustom?: boolean;
}

interface DemoAthlete {
  id: string;
  name: string;
  email: string;
  targetRace: string;
  acwr: number;
  acwrZone: 'SWEET_SPOT' | 'WARNING' | 'DANGER';
  weeklyMileageKm: number;
  targetWeeklyKm: number;
  lastSession: string;
  tsb: number;
}

const DEFAULT_TRAINING_PLANS: TrainingPlan[] = [
  {
    id: 'plan-base',
    title: 'Fondasi Aerobik & Engine Builder',
    category: 'Base',
    durationWeeks: 6,
    targetPace: 'Zona 2 (Easy Conversational)',
    hrZone: '65% - 75% Max HR',
    description: 'Fokus adaptasi kardiovaskular, peningkatan densitas kapiler otot, dan efisiensi biomekanika lari.',
    weeklyStructure: '3x Easy Run 45m, 1x Strides 6x100m, 1x Weekend Long Run 12-14km @ Zona 2',
  },
  {
    id: 'plan-10k',
    title: '10K Lactate Threshold & Speed Sharpening',
    category: '10K',
    durationWeeks: 8,
    targetPace: '4:45 - 5:15 /km (T-Pace)',
    hrZone: '85% - 90% Max HR',
    description: 'Peningkatan kecepatan ambang laktat dan kapasitas anaerobik untuk memecahkan PB 10K.',
    weeklyStructure: '1x Interval Trek (5x1000m @ T-Pace), 1x Tempo Run 7km, 1x Recovery 6km, 1x Long Run 15km',
  },
  {
    id: 'plan-hm',
    title: 'Half-Marathon Progressive Build',
    category: 'HM',
    durationWeeks: 10,
    targetPace: '5:20 - 5:45 /km (HM Pace)',
    hrZone: '78% - 85% Max HR',
    description: 'Membangun daya tahan lari jarak menengah dengan simulasi race pace dan latihan negative split.',
    weeklyStructure: 'Volume 40-52 km/minggu, 1x Long Run Progresif 15-18km, 1x Hill Repeat, 2x Easy Run',
  },
  {
    id: 'plan-fm',
    title: 'Marathon Sub-4 Periodization & Taper',
    category: 'FM',
    durationWeeks: 12,
    targetPace: '5:35 - 5:40 /km (Marathon Pace)',
    hrZone: '75% - 82% Max HR',
    description: 'Periodisasi makrosiklus maraton: 3 minggu pembebanan + 1 minggu deload, simulasi nutrisi & hidrasi.',
    weeklyStructure: 'Volume 55-68 km/minggu, Peak Long Run 32km pada minggu ke-9, 3-week scientific taper',
  },
];

const DEMO_ATHLETES: DemoAthlete[] = [
  {
    id: 'demo-1',
    name: 'Budi Santoso (Simulasi)',
    email: 'budi.runner@example.com',
    targetRace: 'Maybank Bali Marathon Sub-4',
    acwr: 1.05,
    acwrZone: 'SWEET_SPOT',
    weeklyMileageKm: 34.5,
    targetWeeklyKm: 38.0,
    lastSession: 'Tempo Run 8km @ 5:15 /km',
    tsb: 6,
  },
  {
    id: 'demo-2',
    name: 'Siti Rahma (Simulasi)',
    email: 'siti.speed@example.com',
    targetRace: 'Jakarta 10K Debut Sub-50',
    acwr: 1.42,
    acwrZone: 'WARNING',
    weeklyMileageKm: 28.0,
    targetWeeklyKm: 25.0,
    lastSession: 'Track 5x1000m @ 4:52 /km',
    tsb: -14,
  },
];

export default function CoachDashboard({ coachName, coachEmail, userId }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromQuery = searchParams.get('tab') as 'roster' | 'plans' | 'acwr' | 'directives' | null;

  const [activeTab, setActiveTab] = useState<'roster' | 'plans' | 'acwr' | 'directives'>('roster');

  useEffect(() => {
    if (tabFromQuery && ['roster', 'plans', 'acwr', 'directives'].includes(tabFromQuery)) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  const switchTab = (tab: 'roster' | 'plans' | 'acwr' | 'directives') => {
    setActiveTab(tab);
    router.replace(`/dashboard?tab=${tab}`, { scroll: false });
  };
  const [showDemoSquad, setShowDemoSquad] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteAthleteName, setInviteAthleteName] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  // Training Plans State
  const [plans, setPlans] = useState<TrainingPlan[]>(DEFAULT_TRAINING_PLANS);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanCategory, setNewPlanCategory] = useState<'Base' | '5K' | '10K' | 'HM' | 'FM'>('10K');
  const [newPlanDuration, setNewPlanDuration] = useState(6);
  const [newPlanPace, setNewPlanPace] = useState('5:00 - 5:30 /km');
  const [newPlanZone, setNewPlanZone] = useState('Zona 3 / Ambang Aerobik');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanStructure, setNewPlanStructure] = useState('');

  // Coach Directives State
  const [directives, setDirectives] = useState<Array<{ id: string; title: string; category: string; message: string; date: string }>>([
    {
      id: 'dir-1',
      title: 'Fokus Minggu Ini: Disiplin Zona 2 & Rehidrasi Elektrolit',
      category: 'Evaluasi Mingguan',
      message: 'Perhatikan cuaca panas akhir-akhir ini. Pada sesi Easy Run hari Rabu, jaga detak jantung tetap di bawah 145 bpm. Jangan push pace jika cuaca di atas 31°C.',
      date: '17 Nov 2026',
    },
  ]);
  const [newDirectiveTitle, setNewDirectiveTitle] = useState('');
  const [newDirectiveCategory, setNewDirectiveCategory] = useState('Arahan Taktis');
  const [newDirectiveMsg, setNewDirectiveMsg] = useState('');

  // Generated Club Code based on coach
  const cleanId = userId ? userId.replace(/-/g, '').slice(0, 4).toUpperCase() : '7821';
  const cleanName = coachName ? coachName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() : 'COACH';
  const clubInviteCode = `FDZ-${cleanName}-${cleanId}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(clubInviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteAthleteName('');
    }, 1500);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle) return;
    const newPlan: TrainingPlan = {
      id: `plan-custom-${Date.now()}`,
      title: newPlanTitle,
      category: newPlanCategory,
      durationWeeks: Number(newPlanDuration),
      targetPace: newPlanPace,
      hrZone: newPlanZone,
      description: newPlanDesc || 'Program latihan kustom yang dirancang oleh pelatih.',
      weeklyStructure: newPlanStructure || 'Jadwal mingguan ditentukan oleh pelatih.',
      isCustom: true,
    };
    setPlans([newPlan, ...plans]);
    setShowCreatePlanModal(false);
    setNewPlanTitle('');
    setNewPlanDesc('');
    setNewPlanStructure('');
  };

  const handlePostDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirectiveTitle || !newDirectiveMsg) return;
    const newDir = {
      id: `dir-${Date.now()}`,
      title: newDirectiveTitle,
      category: newDirectiveCategory,
      message: newDirectiveMsg,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setDirectives([newDir, ...directives]);
    setNewDirectiveTitle('');
    setNewDirectiveMsg('');
  };

  return (
    <div className="space-y-6 font-mono text-slate-900 dark:text-white">
      {/* 1. Coach Master Command Header */}
      <div className="bg-gradient-to-r from-cyan-950/90 via-[#0d1224] to-[#070a14] border-2 border-cyan-500/80 p-5 sm:p-6 shadow-[4px_4px_0px_#06b6d4] text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-cyan-900/60">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black px-2.5 py-0.5 bg-cyan-950 border border-cyan-400 text-cyan-300 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {isId ? 'PORTAL KEPELATIHAN // ROLE_COACH' : 'COACHING_PORTAL // HEAD_COACH'}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-violet-950 border border-violet-600 text-violet-300 font-bold uppercase tracking-wider">
                FREEDAYZZ ATHLETIC CLUB
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black italic tracking-wide uppercase mt-2.5 text-white flex items-center gap-2">
              <span>{isId ? `PORTAL PELATIH: ${coachName.toUpperCase()}` : `COACH PORTAL: ${coachName.toUpperCase()}`}</span>
            </h1>
            <p className="text-xs text-zinc-300 font-sans mt-0.5 max-w-2xl leading-relaxed">
              {isId 
                ? 'Pusat manajemen skuad lari, pembuatan program latihan berkala, evaluasi beban atlet, dan mitigasi risiko cedera berbasis ACWR.'
                : 'Central running squad management hub, structured training plan builder, athlete workload evaluation, and injury prevention.'}
            </p>
          </div>

          {/* Quick Actions & Club Code */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 border border-cyan-300 text-white text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#0891b2] cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isId ? 'UNDANG ATLET' : 'INVITE ATHLETE'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreatePlanModal(true)}
              className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 border border-violet-300 text-white text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#7c3aed] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isId ? 'BUAT PROGRAM' : 'NEW PLAN'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Salin kode pendaftaran klub untuk atlet bimbingan Anda"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? (isId ? 'KODE TERSALIN!' : 'CODE COPIED!') : clubInviteCode}</span>
            </button>
          </div>
        </div>

        {/* 2. Coach KPI Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="bg-[#070a14] border border-cyan-900/60 p-3.5">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">
              {isId ? 'ATLET BINAAN TERDAFTAR' : 'REGISTERED ATHLETES'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-cyan-400">
                {showDemoSquad ? DEMO_ATHLETES.length : 0}
              </span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase">
                {showDemoSquad ? (isId ? 'Pelari (Demo)' : 'Runners (Demo)') : (isId ? 'Pelari Aktif' : 'Active')}
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 block mt-0.5">
              {showDemoSquad ? (isId ? 'Mode simulasi aktif' : 'Demo mode active') : (isId ? 'Belum ada atlet tertaut' : 'No athletes linked')}
            </span>
          </div>

          <div className="bg-[#070a14] border border-cyan-900/60 p-3.5">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">
              {isId ? 'PROGRAM LATIHAN TERSEDIA' : 'TRAINING PLANS AVAILABLE'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-white">{plans.length}</span>
              <span className="text-[10px] text-violet-400 font-bold uppercase">{isId ? 'Modul' : 'Plans'}</span>
            </div>
            <span className="text-[9px] text-zinc-500 block mt-0.5">
              {isId ? 'Siap ditugaskan ke pelari' : 'Ready to assign'}
            </span>
          </div>

          <div className="bg-[#070a14] border border-cyan-900/60 p-3.5">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">
              {isId ? 'KESIAPAN SKUAD (ACWR)' : 'SQUAD READINESS'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-emerald-400">OPTIMAL</span>
            </div>
            <span className="text-[9px] text-zinc-500 block mt-0.5">
              {isId ? '0 Atlet dalam Risiko Spike' : '0 Athletes in Danger Zone'}
            </span>
          </div>

          <div className="bg-[#070a14] border border-cyan-900/60 p-3.5">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">
              {isId ? 'IDENTITAS PELATIH' : 'COACH IDENTITY'}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-black text-emerald-400 uppercase truncate">
                {coachName}
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 block mt-0.5 truncate font-sans">
              {coachEmail}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center border-b-2 border-slate-200 dark:border-zinc-800 gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => switchTab('roster')}
          className={`px-4 py-2.5 font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'roster'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20'
              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isId ? 'ROSTER ATLET BINAAN' : 'SQUAD ROSTER'}</span>
          {showDemoSquad && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-900 text-[9px] font-black">DEMO</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => switchTab('plans')}
          className={`px-4 py-2.5 font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'plans'
              ? 'border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/20'
              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isId ? 'PROGRAM & MENU LATIHAN' : 'TRAINING PLANS'}</span>
          <span className="px-1.5 py-0.2 bg-violet-950 text-violet-300 border border-violet-700 text-[9px] font-black">
            {plans.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('acwr')}
          className={`px-4 py-2.5 font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'acwr'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{isId ? 'MATRIKS RISIKO CEDERA (ACWR)' : 'INJURY RISK RADAR'}</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('directives')}
          className={`px-4 py-2.5 font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'directives'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{isId ? 'ARAHAN & PENGUMUMAN TIM' : 'COACH DIRECTIVES'}</span>
          <span className="px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-700 text-[9px] font-black">
            {directives.length}
          </span>
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: SQUAD ROSTER */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-zinc-800 p-4 shadow-sm">
            <div>
              <h2 className="text-sm sm:text-base font-black italic tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>{isId ? 'DAFTAR ATLET BINAAN // SQUAD MONITORING' : 'ATHLETE SQUAD ROSTER'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans mt-0.5">
                {isId 
                  ? 'Pantau beban lari mingguan, kepatuhan jadwal, dan kesiapan atlet binaan Anda.' 
                  : 'Monitor weekly running volume, schedule adherence, and readiness of your athletes.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDemoSquad(!showDemoSquad)}
                className={`px-3 py-1.5 border text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  showDemoSquad 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400' 
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{showDemoSquad ? (isId ? 'TUTUP MODE SIMULASI' : 'EXIT DEMO') : (isId ? 'PRATINJAU SKUAD DEMO' : 'PREVIEW DEMO SQUAD')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 text-white text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isId ? '+ UNDANG' : '+ INVITE'}</span>
              </button>
            </div>
          </div>

          {/* If No Real Athletes and Demo Off -> Professional Empty State */}
          {!showDemoSquad ? (
            <div className="bg-white dark:bg-[#070a14] border-2 border-dashed border-slate-300 dark:border-zinc-800 p-8 sm:p-12 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-700 mx-auto flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-sm">
                <Users className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
                  {isId ? 'Belum Ada Atlet Terdaftar di Klub Anda' : 'No Athletes Registered in Your Squad Yet'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans leading-relaxed">
                  {isId
                    ? 'Sebagai pelatih, akun Anda terisolasi secara mandiri. Bagikan Kode Akses Klub Anda kepada atlet binaan Anda agar aktivitas lari dan telemetri Garmin mereka terhubung langsung ke dashboard ini.'
                    : 'As a coach, your account is cleanly isolated. Share your Club Invite Code with your athletes so their Garmin running telemetry connects directly here.'}
                </p>
              </div>

              {/* Club Code Copy Box */}
              <div className="inline-flex flex-col sm:flex-row items-center gap-2 p-3 bg-slate-50 dark:bg-[#0d1224] border border-cyan-500/40 max-w-lg mx-auto">
                <div className="text-left px-2">
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold block uppercase">
                    {isId ? 'KODE REGISTRASI ATLET KLUB:' : 'ATHLETE CLUB REGISTRATION CODE:'}
                  </span>
                  <span className="text-base font-black text-cyan-600 dark:text-cyan-400 tracking-wider">
                    {clubInviteCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? (isId ? 'TERSALIN' : 'COPIED') : (isId ? 'SALIN KODE' : 'COPY CODE')}</span>
                </button>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isId ? 'KIRIM UNDANGAN VIA EMAIL' : 'SEND EMAIL INVITATION'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDemoSquad(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-black uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isId ? 'LIHAT CONTOH SIMULASI SKUAD' : 'VIEW DEMO SQUAD PREVIEW'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Demo / Real Athlete Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEMO_ATHLETES.map((athlete) => {
                const isWarning = athlete.acwrZone === 'WARNING';
                return (
                  <div
                    key={athlete.id}
                    className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-4 hover:border-cyan-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-violet-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                          {athlete.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-sm text-slate-900 dark:text-white">
                              {athlete.name}
                            </h3>
                            <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/60 border border-amber-400 text-amber-700 dark:text-amber-300 font-bold">
                              SIMULASI
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-sans">
                            {athlete.email}
                          </span>
                          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold block mt-0.5">
                            Target: {athlete.targetRace}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2 py-0.5 uppercase ${
                        isWarning 
                          ? 'bg-amber-100 dark:bg-amber-950 border border-amber-500 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 border border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {isWarning ? 'WASPADAI LONJAKAN' : 'OPTIMAL LOAD'}
                      </span>
                    </div>

                    {/* Athlete Stats */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 text-[11px]">
                      <div>
                        <span className="text-slate-500 dark:text-zinc-500 block text-[9px] font-bold uppercase">
                          {isId ? 'BEBAN MINGGUAN' : 'WEEKLY KM'}
                        </span>
                        <span className="font-black text-slate-900 dark:text-white">
                          {athlete.weeklyMileageKm} / {athlete.targetWeeklyKm} km
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-zinc-500 block text-[9px] font-bold uppercase">
                          ACWR RATIO
                        </span>
                        <span className={`font-black ${isWarning ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {athlete.acwr.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-zinc-500 block text-[9px] font-bold uppercase">
                          TSB (KESIAPAN)
                        </span>
                        <span className="font-black text-cyan-500">
                          {athlete.tsb > 0 ? `+${athlete.tsb}` : athlete.tsb}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                        Sesi Terakhir: {athlete.lastSession}
                      </span>
                      <button
                        type="button"
                        onClick={() => alert(`Fitur catatan evaluasi untuk ${athlete.name} siap dikirim ke atlet!`)}
                        className="px-2.5 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase hover:bg-slate-800 cursor-pointer"
                      >
                        {isId ? 'Beri Catatan' : 'Add Note'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRAINING PLANS & WORKOUT BUILDER */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-zinc-800 p-4 shadow-sm">
            <div>
              <h2 className="text-sm sm:text-base font-black italic tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>{isId ? 'MODUL PROGRAM & MENU LATIHAN KLUB' : 'CLUB TRAINING PLANS & WORKOUTS'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans mt-0.5">
                {isId 
                  ? 'Koleksi rancangan program lari terstruktur yang disiapkan oleh Head Coach untuk atlet asuhan.' 
                  : 'Structured training plans designed by the Head Coach for squad athletes.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreatePlanModal(true)}
              className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 border border-violet-400 text-white text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#7c3aed]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isId ? '+ RANCANG PROGRAM BARU' : '+ CREATE NEW PLAN'}</span>
            </button>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-4 relative group hover:border-violet-500 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 text-violet-800 dark:text-violet-300 uppercase">
                        {plan.category}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase">
                        {plan.durationWeeks} {isId ? 'Minggu' : 'Weeks'}
                      </span>
                      {plan.isCustom && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 text-cyan-700 dark:text-cyan-300 font-black">
                          KUSTOM PELATIH
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-base text-slate-900 dark:text-white mt-1.5">
                      {plan.title}
                    </h3>
                  </div>

                  <Award className="w-5 h-5 text-violet-500 shrink-0" />
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans leading-relaxed">
                  {plan.description}
                </p>

                {/* Training Parameters */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 text-[11px]">
                  <div>
                    <span className="text-slate-500 dark:text-zinc-500 block text-[9px] font-bold uppercase">
                      TARGET INTENSITAS / PACE
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {plan.targetPace}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-500 block text-[9px] font-bold uppercase">
                      ZONA DETAK JANTUNG
                    </span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {plan.hrZone}
                    </span>
                  </div>
                </div>

                {/* Weekly Structure */}
                <div className="p-3 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/60 text-xs">
                  <span className="text-[10px] text-violet-700 dark:text-violet-300 font-bold block uppercase mb-1">
                    {isId ? 'STRUKTUR MINGGUAN MENU LATIHAN:' : 'WEEKLY STRUCTURE:'}
                  </span>
                  <p className="text-[11px] font-mono text-slate-800 dark:text-zinc-200">
                    {plan.weeklyStructure}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                    ID Modul: {plan.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => alert(`Modul "${plan.title}" siap ditugaskan ke atlet bimbingan saat mereka terhubung!`)}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-black uppercase transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isId ? 'Tugaskan ke Skuad' : 'Assign to Squad'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACWR INJURY PREVENTION RADAR */}
      {activeTab === 'acwr' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-3">
            <h2 className="text-sm sm:text-base font-black italic tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isId ? 'RADAR RISIKO CEDERA & BEBAN AKUT VS KRONIS (ACWR)' : 'ACWR INJURY PREVENTION FRAMEWORK'}</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans leading-relaxed max-w-3xl">
              {isId
                ? 'Model ACWR (Gabbett, 2016) membandingkan beban latihan 7 hari terakhir (Acute Load) terhadap rata-rata beban 28 hari (Chronic Load). Model ini adalah standar sains olahraga untuk mencegah cedera overuse pada pelari jarak jauh.'
                : 'The ACWR model (Gabbett, 2016) compares training load from the last 7 days (Acute Load) against the 28-day historical rolling average (Chronic Load).'}
            </p>
          </div>

          {/* 3 Zone Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#0d1224] border-2 border-emerald-500/80 p-5 shadow-[3px_3px_0px_#10b981] space-y-2">
              <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 uppercase">
                SWEET SPOT (0.80 - 1.30)
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-1">
                {isId ? 'Adaptasi Fisiologis Optimal' : 'Optimal Adaptation'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans leading-relaxed">
                {isId
                  ? 'Risiko cedera terendah (< 5%). Tubuh atlet mengalami adaptasi kebugaran yang progresif dan aman. Pertahankan progresi beban mingguan maksimal +10%.'
                  : 'Lowest injury risk (< 5%). The runner adapts safely. Maintain weekly progression under +10%.'}
              </p>
            </div>

            <div className="bg-white dark:bg-[#0d1224] border-2 border-amber-500/80 p-5 shadow-[3px_3px_0px_#f59e0b] space-y-2">
              <span className="text-[10px] font-black px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 uppercase">
                ZONA WASPADA (1.30 - 1.50)
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-1">
                {isId ? 'Peringatan Pembebanan' : 'Warning Zone'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans leading-relaxed">
                {isId
                  ? 'Beban akut mulai melebihi kesiapan kronis. Pelatih harus memantau kualitas tidur, HRV pagi hari, dan nyeri otot (DOMS) atlet.'
                  : 'Acute load approaches warning threshold. Monitor athlete morning HRV, sleep metrics, and muscle soreness.'}
              </p>
            </div>

            <div className="bg-white dark:bg-[#0d1224] border-2 border-rose-500/80 p-5 shadow-[3px_3px_0px_#f43f5e] space-y-2">
              <span className="text-[10px] font-black px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 uppercase">
                ZONA BAHAYA (&gt; 1.50)
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-1">
                {isId ? 'Lonjakan Beban Ekstrem (Spike)' : 'Acute Spike Danger'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans leading-relaxed">
                {isId
                  ? 'Risiko cedera muskuloskeletal meningkat 2x hingga 4x lipat. SOP Pelatih: Segera kurangi volume lari akhir pekan sebesar 30% dan alihkan ke cross-training.'
                  : 'Musculoskeletal injury risk increases 2x-4x. Coach SOP: Reduce upcoming long run volume by 30% and switch to low-impact cross-training.'}
              </p>
            </div>
          </div>

          {/* Coach Checklist SOP Box */}
          <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-zinc-800 p-5 space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{isId ? 'STANDAR OPERASIONAL PELATIH UNTUK MITIGASI CEDERA' : 'COACH PROTOCOL FOR INJURY MITIGATION'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans text-slate-600 dark:text-zinc-300">
              <div className="p-3 bg-white dark:bg-[#0d1224] border border-slate-200 dark:border-zinc-800">
                <strong className="text-slate-900 dark:text-white block font-mono font-bold mb-1">
                  1. Evaluasi TSB (Freshness)
                </strong>
                Jika TSB atlet berada di bawah -25, hindari sesi speedwork atau interval tajam. Berikan sesi Easy Run di Zona 1/2.
              </div>
              <div className="p-3 bg-white dark:bg-[#0d1224] border border-slate-200 dark:border-zinc-800">
                <strong className="text-slate-900 dark:text-white block font-mono font-bold mb-1">
                  2. Aturan Kenaikan 10%
                </strong>
                Jangan menaikkan total kilometer mingguan atlet lebih dari 10% dari minggu sebelumnya untuk menjaga ACWR di sweet spot.
              </div>
              <div className="p-3 bg-white dark:bg-[#0d1224] border border-slate-200 dark:border-zinc-800">
                <strong className="text-slate-900 dark:text-white block font-mono font-bold mb-1">
                  3. Deload Week Berkala
                </strong>
                Terapkan minggu pemulihan (deload) setiap 3 atau 4 minggu dengan menurunkan volume lari 25-30% guna memulihkan sistem saraf pusat.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COACH DIRECTIVES & ANNOUNCEMENTS */}
      {activeTab === 'directives' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm sm:text-base font-black italic tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{isId ? 'PAPAN ARAHAN & INSTRUKSI MINGGUAN PELATIH' : 'COACH DIRECTIVES & ANNOUNCEMENTS'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans mt-0.5">
                {isId 
                  ? 'Kirimkan instruksi taktis mingguan, evaluasi performa, atau pengumuman jadwal latihan bersama kepada seluruh pelari skuad Anda.' 
                  : 'Broadcast tactical instructions, performance evaluations, and group workout schedules to your athletes.'}
              </p>
            </div>

            {/* Form to Post New Directive */}
            <form onSubmit={handlePostDirective} className="p-4 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase">
                    {isId ? 'Judul Instruksi / Pengumuman' : 'Directive Title'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newDirectiveTitle}
                    onChange={(e) => setNewDirectiveTitle(e.target.value)}
                    placeholder="misal: Persiapan Long Run Akhir Pekan & Hidrasi"
                    className="w-full px-3 py-2 bg-white dark:bg-[#0d1224] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase">
                    {isId ? 'Kategori' : 'Category'}
                  </label>
                  <select
                    value={newDirectiveCategory}
                    onChange={(e) => setNewDirectiveCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0d1224] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                  >
                    <option value="Evaluasi Mingguan">Evaluasi Mingguan</option>
                    <option value="Arahan Taktis">Arahan Taktis</option>
                    <option value="Jadwal Latihan Bersama">Jadwal Latihan Bersama</option>
                    <option value="Nutrisi & Pemulihan">Nutrisi & Pemulihan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase">
                  {isId ? 'Isi Pesan Arahan Pelatih' : 'Directive Message'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDirectiveMsg}
                  onChange={(e) => setNewDirectiveMsg(e.target.value)}
                  placeholder="Tuliskan catatan teknis, target pace, atau evaluasi yang perlu diperhatikan para pelari..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#0d1224] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-black uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isId ? 'PUBLIKASIKAN ARAHAN' : 'PUBLISH DIRECTIVE'}</span>
                </button>
              </div>
            </form>

            {/* Directives Feed */}
            <div className="space-y-3 pt-2">
              {directives.map((dir) => (
                <div
                  key={dir.id}
                  className="p-4 bg-white dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 space-y-2 hover:border-amber-500/80 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 border border-amber-400 text-amber-800 dark:text-amber-300 font-bold uppercase">
                        {dir.category}
                      </span>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">
                        {dir.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-sans">
                      {dir.date}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-zinc-300 font-sans leading-relaxed">
                    {dir.message}
                  </p>

                  <div className="pt-1 text-[10px] text-slate-400 dark:text-zinc-500">
                    Dipublikasikan oleh: <span className="font-bold text-slate-700 dark:text-zinc-300">{coachName}</span> (Head Coach)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: INVITE ATHLETE */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d1224] border-2 border-cyan-500 p-6 max-w-md w-full shadow-[6px_6px_0px_#06b6d4] text-white space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-900">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black uppercase text-sm tracking-wide">
                  {isId ? 'UNDANG ATLET KE KLUB' : 'INVITE ATHLETE TO CLUB'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-zinc-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {inviteSent ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs text-center space-y-1">
                <Check className="w-6 h-6 mx-auto text-emerald-400" />
                <p className="font-bold uppercase">{isId ? 'UNDANGAN BERHASIL DIKIRIM!' : 'INVITATION SENT!'}</p>
                <p className="text-[11px] text-emerald-400/80 font-sans">
                  {isId 
                    ? `Kode akses klub telah dikirim ke ${inviteEmail}.`
                    : `Club access code has been delivered to ${inviteEmail}.`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3">
                <p className="text-xs text-zinc-300 font-sans">
                  {isId 
                    ? 'Kirimkan tautan pendaftaran klub kepada atlet bimbingan Anda. Saat mendaftar, telemetri Garmin mereka akan otomatis terhubung ke dashboard Anda.'
                    : 'Invite athletes to your squad. Once registered, their Garmin running telemetry will appear in your roster.'}
                </p>

                <div className="p-3 bg-[#070a14] border border-cyan-900/60 space-y-1">
                  <span className="text-[10px] text-zinc-400 block font-bold uppercase">
                    {isId ? 'KODE LISENSI KLUB ANDA:' : 'YOUR CLUB LICENSE CODE:'}
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-black text-cyan-400 tracking-wider">
                      {clubInviteCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="text-[10px] px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-zinc-700 text-zinc-300 font-bold uppercase cursor-pointer"
                    >
                      {copiedCode ? 'TERSALIN' : 'SALIN'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-300 uppercase">
                    {isId ? 'Nama Atlet (Opsional)' : 'Athlete Name (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={inviteAthleteName}
                    onChange={(e) => setInviteAthleteName(e.target.value)}
                    placeholder="misal: Rian Pratama"
                    className="w-full px-3 py-2 bg-[#070a14] border border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-300 uppercase">
                    {isId ? 'Alamat Email Atlet' : 'Athlete Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="atlet@example.com"
                    className="w-full px-3 py-2 bg-[#070a14] border border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-zinc-300 text-xs uppercase font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase transition-colors cursor-pointer"
                  >
                    Kirim Undangan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE TRAINING PLAN */}
      {showCreatePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d1224] border-2 border-violet-500 p-6 max-w-lg w-full shadow-[6px_6px_0px_#7c3aed] text-white space-y-4 font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-violet-900">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-violet-400" />
                <h3 className="font-black uppercase text-sm tracking-wide">
                  {isId ? 'RANCANG MODUL PROGRAM LATIHAN BARU' : 'CREATE NEW TRAINING PLAN'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatePlanModal(false)}
                className="text-zinc-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-300 uppercase">
                  {isId ? 'Nama Modul Program' : 'Plan Title'}
                </label>
                <input
                  type="text"
                  required
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  placeholder="misal: 10K Sub-45 Speed Endurance"
                  className="w-full px-3 py-2 bg-[#070a14] border border-zinc-700 text-xs font-mono focus:outline-none focus:border-violet-500 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-300 uppercase">
                    {isId ? 'Kategori Jarak' : 'Category'}
                  </label>
                  <select
                    value={newPlanCategory}
                    onChange={(e) => setNewPlanCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#070a14] border border-zinc-700 text-xs font-mono focus:outline-none focus:border-violet-500 text-white"
                  >
                    <option value="Base">Fondasi (Base)</option>
                    <option value="5K">5K Speed</option>
                    <option value="10K">10K Standard</option>
                    <option value="HM">Half Marathon</option>
                    <option value="FM">Full Marathon</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-300 uppercase">
                    {isId ? 'Durasi (Minggu)' : 'Duration (Weeks)'}
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={24}
                    value={newPlanDuration}
                    onChange={(e) => setNewPlanDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#070a14] border border-zinc-700 text-xs font-mono focus:outline-none focus:border-violet-500 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-300 uppercase">
                    {isId ? 'Target Intensitas / Pace' : 'Target Pace'}
                  </label>
                  <input
                    type="text"
                    value={newPlanPace}
                    onChange={(e) => setNewPlanPace(e.target.value)}
                    placeholder="misal: 4:40 - 5:00 /km"
                    className="w-full px-3 py-2 bg-[#070a14] border border-zinc-700 text-xs font-mono focus:outline-none focus:border-violet-500 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-300 uppercase">
                    {isId ? 'Target Zona Detak Jantung' : 'HR Zone'}
                  </label>
                  <input
                    type="text"
                    value={newPlanZone}
                    onChange={(e) => setNewPlanZone(e.target.value)}
                    placeholder="misal: Zona 3 / Ambang Aerobik"
                    className="w-full px-3 py-2 bg-[#070a14] border border-zinc-700 text-xs font-mono focus:outline-none focus:border-violet-500 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-300 uppercase">
                  {isId ? 'Tujuan & Deskripsi Program' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  placeholder="Fokus program, adaptasi fisiologis yang diharapkan..."
                  className="w-full px-3 py-2 bg-[#070a14] border border-zinc-700 text-xs font-mono focus:outline-none focus:border-violet-500 text-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-300 uppercase">
                  {isId ? 'Menu Latihan Mingguan' : 'Weekly Workout Menu'}
                </label>
                <textarea
                  rows={2}
                  value={newPlanStructure}
                  onChange={(e) => setNewPlanStructure(e.target.value)}
                  placeholder="misal: 1x Interval 6x800m, 1x Tempo 8km, 1x Long Run 16km, 2x Easy 40m"
                  className="w-full px-3 py-2 bg-[#070a14] border border-zinc-700 text-xs font-mono focus:outline-none focus:border-violet-500 text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePlanModal(false)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-zinc-300 text-xs uppercase font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-black uppercase transition-colors cursor-pointer"
                >
                  Simpan Modul
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
