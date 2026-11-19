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
  ArrowRight,
  CheckCircle2,
  Clock,
  ClipboardList,
  Filter,
  Trash2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  CoachTask, 
  SquadAthlete,
  CoachingPackage, 
  TaskType 
} from '@/domain/entities/CoachingRelationship';
import { CoachingStorage } from '@/utils/coachingStorage';

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

  const [copiedCode, setCopiedCode] = useState(false);

  // --- DYNAMIC SQUAD ATHLETES STATE ---
  const [squadAthletes, setSquadAthletes] = useState<SquadAthlete[]>([]);
  const [showAddAthleteModal, setShowAddAthleteModal] = useState(false);
  const [newAthleteName, setNewAthleteName] = useState('');
  const [newAthleteEmail, setNewAthleteEmail] = useState('');
  const [newAthleteTargetRace, setNewAthleteTargetRace] = useState('');
  const [newAthleteTargetKm, setNewAthleteTargetKm] = useState(30);
  const [newAthletePackageTier, setNewAthletePackageTier] = useState('Half Marathon Performance');

  // --- COACH TASKS STATE ---
  const [tasks, setTasks] = useState<CoachTask[]>([]);
  const [rosterViewMode, setRosterViewMode] = useState<'tasks' | 'athletes'>('tasks');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  // Modal: Assign Task
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [assignAthleteName, setAssignAthleteName] = useState('');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignType, setAssignType] = useState<TaskType>('LONG_RUN');
  const [assignDueDate, setAssignDueDate] = useState('2026-11-23');
  const [assignDistanceKm, setAssignDistanceKm] = useState(16);
  const [assignTargetPace, setAssignTargetPace] = useState('5:30 - 5:45 /km');
  const [assignTargetHrZone, setAssignTargetHrZone] = useState('Zona 2 (142 - 158 BPM)');
  const [assignInstructions, setAssignInstructions] = useState('');

  // Modal: Review Completed Task
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [taskToReview, setTaskToReview] = useState<CoachTask | null>(null);
  const [reviewNoteInput, setReviewNoteInput] = useState('');

  const [packages, setPackages] = useState<CoachingPackage[]>([]);

  // Generated Club Code based on coach
  const cleanId = userId ? userId.replace(/-/g, '').slice(0, 4).toUpperCase() : '7821';
  const cleanName = coachName ? coachName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() : 'COACH';
  const clubInviteCode = `FDZ-${cleanName}-${cleanId}`;
  const coachKey = coachEmail || userId || cleanName;

  // Training Plans State (100% Dynamic, Loaded per Coach)
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanCategory, setNewPlanCategory] = useState<'Base' | '5K' | '10K' | 'HM' | 'FM'>('10K');
  const [newPlanDuration, setNewPlanDuration] = useState(6);
  const [newPlanPace, setNewPlanPace] = useState('5:00 - 5:30 /km');
  const [newPlanZone, setNewPlanZone] = useState('Zona 3 / Ambang Aerobik');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanStructure, setNewPlanStructure] = useState('');

  // Sync data on load and on custom events
  useEffect(() => {
    // 1. Register current coach dynamically in the system directory
    if (coachName || coachEmail) {
      CoachingStorage.registerCoachProfile({
        id: userId || `coach-${cleanName.toLowerCase()}`,
        name: coachName,
        email: coachEmail,
        role: 'Head of Squad Performance',
        club: 'Freedayzz Athletic Club',
        inviteCode: clubInviteCode,
        specialty: 'Marathon Periodization & Aerobic Engine Building',
        avatarInitials: cleanName.slice(0, 2).toUpperCase() || 'PA',
      });
    }

    // 2. Load dynamic plans created by this coach
    const loadPlans = () => {
      const stored = CoachingStorage.getCoachPrograms(coachKey);
      setPlans(stored.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category as any,
        durationWeeks: p.durationWeeks,
        targetPace: p.targetPace || '5:00 - 5:30 /km',
        hrZone: p.targetHrZone || 'Zona 2 / Ambang Aerobik',
        description: p.description,
        weeklyStructure: 'Struktur mingguan ditentukan oleh pelatih.',
        isCustom: true,
      })));
    };
    loadPlans();

    // 3. Load tasks, packages & athletes
    const loadData = () => {
      setTasks(CoachingStorage.getTasks());
      setPackages(CoachingStorage.getCoachingPackages());
      const athletes = CoachingStorage.getSquadAthletes();
      setSquadAthletes(athletes);
      if (athletes.length > 0 && !assignAthleteName) {
        setAssignAthleteName(athletes[0].name);
      }
    };
    loadData();

    const handleTaskUpdate = () => setTasks(CoachingStorage.getTasks());
    const handleSquadUpdate = () => {
      const athletes = CoachingStorage.getSquadAthletes();
      setSquadAthletes(athletes);
      if (athletes.length > 0 && !assignAthleteName) {
        setAssignAthleteName(athletes[0].name);
      }
    };
    const handleProgramsUpdate = () => loadPlans();

    window.addEventListener('coaching_task_updated', handleTaskUpdate);
    window.addEventListener('squad_athlete_updated', handleSquadUpdate);
    window.addEventListener('coach_programs_updated', handleProgramsUpdate);

    return () => {
      window.removeEventListener('coaching_task_updated', handleTaskUpdate);
      window.removeEventListener('squad_athlete_updated', handleSquadUpdate);
      window.removeEventListener('coach_programs_updated', handleProgramsUpdate);
    };
  }, [assignAthleteName, coachName, coachEmail, userId, cleanName, clubInviteCode, coachKey]);

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteAthleteName, setInviteAthleteName] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

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

    // Save to dynamic coach programs storage
    CoachingStorage.addCoachProgram(coachKey, {
      id: newPlan.id,
      title: newPlan.title,
      category: newPlan.category,
      durationWeeks: newPlan.durationWeeks,
      description: newPlan.description,
      targetPace: newPlan.targetPace,
      targetHrZone: newPlan.hrZone,
    });

    setPlans([newPlan, ...plans]);
    setShowCreatePlanModal(false);
    setNewPlanTitle('');
    setNewPlanDesc('');
    setNewPlanStructure('');
  };

  const handleDeletePlan = (planId: string) => {
    CoachingStorage.deleteCoachProgram(coachKey, planId);
    setPlans(plans.filter(p => p.id !== planId));
  };

  const handleImportTemplates = () => {
    const templates: TrainingPlan[] = [
      {
        id: `plan-base-${Date.now()}`,
        title: 'Fondasi Aerobik & Engine Builder',
        category: 'Base',
        durationWeeks: 6,
        targetPace: 'Zona 2 (Easy Conversational)',
        hrZone: '65% - 75% Max HR',
        description: 'Fokus adaptasi kardiovaskular, peningkatan densitas kapiler otot, dan efisiensi biomekanika lari.',
        weeklyStructure: '3x Easy Run 45m, 1x Strides 6x100m, 1x Weekend Long Run 12-14km @ Zona 2',
        isCustom: true,
      },
      {
        id: `plan-10k-${Date.now()}`,
        title: '10K Lactate Threshold & Speed Sharpening',
        category: '10K',
        durationWeeks: 8,
        targetPace: '4:45 - 5:15 /km (T-Pace)',
        hrZone: '85% - 90% Max HR',
        description: 'Peningkatan kecepatan ambang laktat dan kapasitas anaerobik untuk memecahkan PB 10K.',
        weeklyStructure: '1x Interval Trek (5x1000m @ T-Pace), 1x Tempo Run 7km, 1x Recovery 6km, 1x Long Run 15km',
        isCustom: true,
      },
      {
        id: `plan-hm-${Date.now()}`,
        title: 'Half-Marathon Progressive Build',
        category: 'HM',
        durationWeeks: 10,
        targetPace: '5:20 - 5:45 /km (HM Pace)',
        hrZone: '78% - 85% Max HR',
        description: 'Membangun daya tahan lari jarak menengah dengan simulasi race pace dan latihan negative split.',
        weeklyStructure: 'Volume 40-52 km/minggu, 1x Long Run Progresif 15-18km, 1x Hill Repeat, 2x Easy Run',
        isCustom: true,
      },
      {
        id: `plan-fm-${Date.now()}`,
        title: 'Marathon Sub-4 Periodization & Taper',
        category: 'FM',
        durationWeeks: 12,
        targetPace: '5:35 - 5:40 /km (Marathon Pace)',
        hrZone: '75% - 82% Max HR',
        description: 'Periodisasi makrosiklus maraton: 3 minggu pembebanan + 1 minggu deload, simulasi nutrisi & hidrasi.',
        weeklyStructure: 'Volume 55-68 km/minggu, Peak Long Run 32km pada minggu ke-9, 3-week scientific taper',
        isCustom: true,
      },
    ];

    templates.forEach(t => {
      CoachingStorage.addCoachProgram(coachKey, {
        id: t.id,
        title: t.title,
        category: t.category,
        durationWeeks: t.durationWeeks,
        description: t.description,
        targetPace: t.targetPace,
        targetHrZone: t.hrZone,
      });
    });

    setPlans([...templates, ...plans]);
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

  // Handler for Assigning a Task to an Athlete
  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle || !assignAthleteName) return;

    const matched = squadAthletes.find(a => a.name === assignAthleteName);
    const athleteId = matched ? matched.id : `ath-${Date.now()}`;

    CoachingStorage.addTask({
      athleteId,
      athleteName: assignAthleteName,
      coachName: coachName ? `${coachName} (Head Coach)` : 'Head Coach',
      title: assignTitle,
      type: assignType,
      dueDate: assignDueDate,
      targetDistanceKm: Number(assignDistanceKm),
      targetPace: assignTargetPace,
      targetHrZone: assignTargetHrZone,
      instructions: assignInstructions || 'Lakukan pemanasan 10 menit dan pendinginan dinamis.',
      status: 'PENDING',
      adherenceScore: 95,
    });

    setShowAssignTaskModal(false);
    setAssignTitle('');
    setAssignInstructions('');
    setTasks(CoachingStorage.getTasks());
  };

  // Handler for Adding an Athlete to the Squad
  const handleAddAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAthleteName) return;

    const newAth = CoachingStorage.addSquadAthlete({
      name: newAthleteName,
      email: newAthleteEmail || `${newAthleteName.toLowerCase().replace(/\s+/g, '.')}@athlete.local`,
      coachId: userId,
      targetRace: newAthleteTargetRace || 'Lari Rutin Kebugaran',
      weeklyMileageKm: 0,
      targetWeeklyKm: Number(newAthleteTargetKm) || 25,
      acwr: 1.05,
      acwrZone: 'SWEET_SPOT',
      tsb: 6,
      lastSession: 'Belum ada sesi tercatat',
      packageTier: newAthletePackageTier,
    });

    setShowAddAthleteModal(false);
    setNewAthleteName('');
    setNewAthleteEmail('');
    setNewAthleteTargetRace('');
    setSquadAthletes(CoachingStorage.getSquadAthletes());
    if (!assignAthleteName) setAssignAthleteName(newAth.name);
  };

  // Handler for Deleting an Athlete
  const handleDeleteAthlete = (id: string) => {
    CoachingStorage.deleteSquadAthlete(id);
    setSquadAthletes(CoachingStorage.getSquadAthletes());
  };

  // Handler for Coach Reviewing Completed Task
  const handleReviewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToReview || !reviewNoteInput) return;

    CoachingStorage.reviewTask(taskToReview.id, reviewNoteInput);
    setShowReviewModal(false);
    setTaskToReview(null);
    setReviewNoteInput('');
    setTasks(CoachingStorage.getTasks());
  };

  // Filtered Tasks
  const filteredTasks = tasks.filter(t => {
    if (taskStatusFilter === 'PENDING') return t.status === 'PENDING';
    if (taskStatusFilter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  const totalRegisteredAthletes = squadAthletes.length;

  return (
    <div className="space-y-6 font-mono text-slate-900 dark:text-white">
      {/* 1. Coach Master Command Header */}
      <div className="bg-white dark:bg-gradient-to-r dark:from-cyan-950/90 dark:via-[#0d1224] dark:to-[#070a14] border-2 border-cyan-500/80 p-5 sm:p-6 shadow-[4px_4px_0px_#06b6d4] text-slate-900 dark:text-white transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-cyan-900/60">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black px-2.5 py-0.5 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 text-cyan-800 dark:text-cyan-300 uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                {isId ? 'PORTAL KEPELATIHAN // ROLE_COACH' : 'COACHING_PORTAL // HEAD_COACH'}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-600 text-violet-800 dark:text-violet-300 font-bold uppercase tracking-wider">
                FREEDAYZZ ATHLETIC CLUB
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black italic tracking-wide uppercase mt-2.5 text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isId ? `PORTAL PELATIH: ${coachName.toUpperCase()}` : `COACH PORTAL: ${coachName.toUpperCase()}`}</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans mt-0.5 max-w-2xl leading-relaxed">
              {isId 
                ? 'Pusat manajemen skuad lari, penugasan sesi latihan atlet, evaluasi kepatuhan RPE, dan pemantauan beban latihan ACWR.'
                : 'Central running squad management hub, athlete workout assignment, RPE feedback tracking, and ACWR training load monitoring.'}
            </p>
          </div>

          {/* Quick Actions & Club Code */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAssignTaskModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400 text-white text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#0891b2] cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isId ? '+ TUGASKAN SESI' : '+ ASSIGN TASK'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 text-white text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#0891b2] cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isId ? 'UNDANG ATLET' : 'INVITE ATHLETE'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Salin kode pendaftaran klub untuk atlet bimbingan Anda"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />}
              <span>{copiedCode ? (isId ? 'KODE TERSALIN!' : 'CODE COPIED!') : clubInviteCode}</span>
            </button>
          </div>
        </div>

        {/* 2. Coach KPI Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-cyan-900/60 p-3.5 shadow-xs">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block uppercase font-bold">
              {isId ? 'ATLET BINAAN TERDAFTAR' : 'REGISTERED ATHLETES'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                {totalRegisteredAthletes}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase">
                {isId ? 'Pelari Aktif' : 'Runners'}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 dark:text-zinc-500 block mt-0.5">
              {isId ? 'Tersebar di 3 Paket Komersial' : 'Across 3 Commercial Tiers'}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-cyan-900/60 p-3.5 shadow-xs">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block uppercase font-bold">
              {isId ? 'TUGAS LATIHAN AKTIF' : 'ACTIVE WORKOUT TASKS'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {tasks.filter(t => t.status === 'PENDING').length}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">
                {isId ? 'Menunggu' : 'Pending'}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 dark:text-zinc-500 block mt-0.5">
              {tasks.filter(t => t.status === 'COMPLETED').length} {isId ? 'Sesi Telah Tuntas & Dilaporkan' : 'Completed Sessions'}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-cyan-900/60 p-3.5 shadow-xs">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block uppercase font-bold">
              {isId ? 'STATUS KESIAPAN BEBAN SKUAD' : 'SQUAD LOAD STATUS'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                OPTIMAL
              </span>
            </div>
            <span className="text-[9px] text-slate-400 dark:text-zinc-500 block mt-0.5">
              {isId ? 'ACWR Rata-rata 1.05 (Zona Manis)' : 'Avg ACWR 1.05 (Sweet Spot)'}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-cyan-900/60 p-3.5 shadow-xs">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block uppercase font-bold">
              {isId ? 'IDENTITAS KEPELATIHAN' : 'COACH IDENTITY'}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase truncate">
                {coachName}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 dark:text-zinc-500 block mt-0.5 truncate font-sans">
              Head Coach • Freedayzz Athletic Club
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
          <ClipboardList className="w-4 h-4" />
          <span>{isId ? 'PENUGASAN & ROSTER ATLET' : 'TASKS & SQUAD ROSTER'}</span>
          <span className="px-1.5 py-0.2 bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-400 text-[9px] font-black">
            {tasks.length}
          </span>
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
          <span className="px-1.5 py-0.2 bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 border border-violet-400 dark:border-violet-700 text-[9px] font-black">
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
          <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-400 dark:border-amber-700 text-[9px] font-black">
            {directives.length}
          </span>
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: SQUAD TASKS & ROSTER MANAGEMENT */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          {/* Sub Navigation Bar for Tab 1 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-zinc-800 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRosterViewMode('tasks')}
                className={`px-3 py-1.5 text-xs font-black uppercase transition-all cursor-pointer ${
                  rosterViewMode === 'tasks'
                    ? 'bg-cyan-600 text-white shadow-[2px_2px_0px_#0891b2]'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isId ? `TUGAS & PRESKRIPSI LATIHAN (${tasks.length})` : `WORKOUT TASKS (${tasks.length})`}
              </button>

              <button
                type="button"
                onClick={() => setRosterViewMode('athletes')}
                className={`px-3 py-1.5 text-xs font-black uppercase transition-all cursor-pointer ${
                  rosterViewMode === 'athletes'
                    ? 'bg-cyan-600 text-white shadow-[2px_2px_0px_#0891b2]'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isId ? 'PROFIL & BEBAN ACWR ATLET' : 'ATHLETES ACWR LOAD'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAssignTaskModal(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#0891b2] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isId ? '+ TUGASKAN SESI' : '+ ASSIGN WORKOUT'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isId ? 'UNDANG ATLET' : 'INVITE'}</span>
              </button>
            </div>
          </div>

          {/* SUB-VIEW 1: TASKS & PRESCRIPTIONS LIST */}
          {rosterViewMode === 'tasks' && (
            <div className="space-y-4">
              {/* Task Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-500 dark:text-zinc-400 font-bold uppercase text-[10px] flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3" />
                  <span>Filter:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setTaskStatusFilter('ALL')}
                  className={`px-3 py-1 font-bold uppercase transition-colors cursor-pointer ${
                    taskStatusFilter === 'ALL'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  Semua ({tasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTaskStatusFilter('PENDING')}
                  className={`px-3 py-1 font-bold uppercase transition-colors cursor-pointer ${
                    taskStatusFilter === 'PENDING'
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  Menunggu ({tasks.filter(t => t.status === 'PENDING').length})
                </button>
                <button
                  type="button"
                  onClick={() => setTaskStatusFilter('COMPLETED')}
                  className={`px-3 py-1 font-bold uppercase transition-colors cursor-pointer ${
                    taskStatusFilter === 'COMPLETED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  Selesai Dilaporkan ({tasks.filter(t => t.status === 'COMPLETED').length})
                </button>
              </div>

              {/* Tasks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTasks.map((task) => {
                  const isCompleted = task.status === 'COMPLETED';

                  return (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-3 relative hover:border-cyan-500 transition-colors"
                    >
                      {/* Athlete Target & Session Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 text-cyan-800 dark:text-cyan-300 uppercase">
                              {task.athleteName}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 uppercase ${
                              task.type === 'INTERVAL'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-400'
                                : task.type === 'LONG_RUN'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-400'
                                : 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-400'
                            }`}>
                              {task.type.replace('_', ' ')}
                            </span>
                          </div>

                          <h3 className="font-black text-sm text-slate-900 dark:text-white mt-1.5">
                            {task.title}
                          </h3>
                        </div>

                        <span className={`text-[10px] font-black px-2 py-0.5 uppercase shrink-0 flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-emerald-100 dark:bg-emerald-950 border border-emerald-500 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 border border-amber-500 text-amber-700 dark:text-amber-300 animate-pulse'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{isCompleted ? 'SELESAI' : 'MENUNGGU EKSEKUSI'}</span>
                        </span>
                      </div>

                      {/* Prescribed Parameters */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 text-[11px]">
                        <div>
                          <span className="text-slate-500 dark:text-zinc-500 block text-[9px] font-bold uppercase">
                            TARGET JARAK
                          </span>
                          <span className="font-black text-slate-900 dark:text-white">
                            {task.targetDistanceKm} km
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-zinc-500 block text-[9px] font-bold uppercase">
                            TARGET PACE
                          </span>
                          <span className="font-black text-cyan-600 dark:text-cyan-400">
                            {task.targetPace}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-zinc-500 block text-[9px] font-bold uppercase">
                            ZONA HR
                          </span>
                          <span className="font-black text-violet-600 dark:text-violet-400 truncate block">
                            {task.targetHrZone}
                          </span>
                        </div>
                      </div>

                      {/* Tactical Instructions */}
                      <div className="p-2.5 bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/60 text-xs">
                        <span className="text-[10px] text-cyan-800 dark:text-cyan-300 font-bold block uppercase mb-0.5">
                          INSTRUKSI TAKTIS COACH:
                        </span>
                        <p className="text-[11px] font-sans text-slate-700 dark:text-zinc-300">
                          {task.instructions}
                        </p>
                      </div>

                      {/* Athlete Reported Results & Feedback */}
                      {isCompleted ? (
                        <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-zinc-800">
                          <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 text-[11px] font-sans">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 mb-1">
                              <span>Laporan Atlet ({task.athleteName}):</span>
                              <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 text-emerald-800 dark:text-emerald-300 font-black">
                                RPE {task.reportedRpe}/10
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-zinc-300 italic">
                              &quot;{task.athleteFeedback}&quot;
                            </p>
                            <span className="text-[9px] text-slate-400 dark:text-zinc-500 block mt-1">
                              Diselesaikan: {task.completedAt}
                            </span>
                          </div>

                          {task.coachReviewNote ? (
                            <div className="p-2.5 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/60 text-[11px] font-sans">
                              <span className="text-[10px] font-bold uppercase text-violet-800 dark:text-violet-300 block mb-0.5">
                                Catatan Evaluasi Head Coach:
                              </span>
                              <p className="text-slate-800 dark:text-zinc-200">
                                {task.coachReviewNote}
                              </p>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setTaskToReview(task);
                                setReviewNoteInput('');
                                setShowReviewModal(true);
                              }}
                              className="w-full py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-black uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>BERI CATATAN EVALUASI COACH</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs pt-1 text-slate-400 dark:text-zinc-500">
                          <span>Deadline: {task.dueDate}</span>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            Menunggu penyelesaian lari atlet
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: ATHLETES ROSTER & ACWR LOAD */}
          {rosterViewMode === 'athletes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white uppercase">
                    {isId ? 'Roster Atlet & Beban Fisiologis' : 'Squad Roster & Physiological Load'}
                  </h3>
                  <p className="text-slate-500 dark:text-zinc-400 text-[11px] font-sans">
                    {isId 
                      ? 'Pantau volume mingguan, target perlombaan, dan paket pembinaan masing-masing atlet.'
                      : 'Monitor weekly volume, race targets, and coaching tier of each squad runner.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddAthleteModal(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#059669] cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isId ? '+ TAMBAH ATLET SKUAD' : '+ ADD SQUAD ATHLETE'}</span>
                </button>
              </div>

              {squadAthletes.length === 0 ? (
                <div className="bg-white dark:bg-[#0d1224] border-2 border-dashed border-slate-300 dark:border-zinc-800 p-8 sm:p-10 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-400 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                      {isId ? 'BELUM ADA ATLET DALAM SKUAD BINAAN ANDA' : 'NO ATHLETES IN YOUR SQUAD YET'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans max-w-md mx-auto">
                      {isId 
                        ? 'Daftarkan atlet binaan Anda secara langsung atau bagikan kode pendaftaran klub Anda agar telemetri atlet terhubung ke dashboard Anda.'
                        : 'Register squad athletes directly or share your club license code to link their running telemetry to your coach portal.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAthleteModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#0891b2] cursor-pointer flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isId ? '+ TAMBAH ATLET SEKARANG' : '+ ADD ATHLETE NOW'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? (isId ? 'KODE TERSALIN!' : 'COPIED!') : (isId ? 'SALIN KODE LISENSI KLUB' : 'COPY CLUB CODE')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {squadAthletes.map((athlete) => {
                    const isWarning = athlete.acwrZone === 'WARNING' || athlete.acwr > 1.3;
                    const isDanger = athlete.acwrZone === 'DANGER' || athlete.acwr > 1.5;
                    const initials = athlete.name
                      .split(' ')
                      .map(p => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || 'AT';

                    return (
                      <div
                        key={athlete.id}
                        className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-4 hover:border-cyan-500 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                                  {athlete.name}
                                </h4>
                                <span className="text-[9px] px-1.5 py-0.2 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 text-cyan-800 dark:text-cyan-300 font-bold uppercase">
                                  SQUAD
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-sans">
                                {athlete.email}
                              </span>
                              <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold block mt-0.5">
                                Paket: {athlete.packageTier}
                              </span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-black px-2 py-0.5 uppercase ${
                            isDanger
                              ? 'bg-rose-100 dark:bg-rose-950 border border-rose-500 text-rose-700 dark:text-rose-300'
                              : isWarning 
                              ? 'bg-amber-100 dark:bg-amber-950 border border-amber-500 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 border border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {isDanger ? 'BAHAYA SPIKE' : isWarning ? 'WASPADAI LONJAKAN' : 'OPTIMAL LOAD'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 text-[11px]">
                          <div>
                            <span className="text-slate-500 dark:text-zinc-500 block text-[9px] font-bold uppercase">
                              BEBAN MINGGUAN
                            </span>
                            <span className="font-black text-slate-900 dark:text-white">
                              {athlete.weeklyMileageKm} / {athlete.targetWeeklyKm} km
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-zinc-500 block text-[9px] font-bold uppercase">
                              ACWR RATIO
                            </span>
                            <span className={`font-black ${isDanger ? 'text-rose-600' : isWarning ? 'text-amber-500' : 'text-emerald-500'}`}>
                              {athlete.acwr.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-zinc-500 block text-[9px] font-bold uppercase">
                              TSB FRESHNESS
                            </span>
                            <span className="font-black text-cyan-500">
                              {athlete.tsb > 0 ? `+${athlete.tsb}` : athlete.tsb}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate max-w-[180px]">
                            Target: {athlete.targetRace}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setAssignAthleteName(athlete.name);
                                setShowAssignTaskModal(true);
                              }}
                              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase cursor-pointer transition-colors"
                            >
                              + Tugaskan Sesi
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAthlete(athlete.id)}
                              className="px-2 py-1 text-slate-400 hover:text-rose-500 text-[10px] uppercase cursor-pointer transition-colors"
                              title="Hapus atlet dari roster"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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

            <div className="flex items-center gap-2">
              {plans.length === 0 && (
                <button
                  type="button"
                  onClick={handleImportTemplates}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  <span>{isId ? '+ TEMPLATE STANDAR' : '+ IMPORT TEMPLATES'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowCreatePlanModal(true)}
                className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 border border-violet-400 text-white text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#7c3aed]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isId ? '+ RANCANG PROGRAM BARU' : '+ CREATE NEW PLAN'}</span>
              </button>
            </div>
          </div>

          {/* Plans Grid or Dynamic Empty State */}
          {plans.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#0d1224] border-2 border-dashed border-slate-300 dark:border-zinc-800 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-sm text-slate-700 dark:text-zinc-300 uppercase">
                {isId ? 'BELUM ADA MODUL PROGRAM LATIHAN YANG DIBUAT' : 'NO TRAINING PLANS CREATED YET'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-sans">
                {isId 
                  ? 'Anda belum memiliki modul program lari resmi. Buat program kustom baru atau impor template standar (Base, 10K, HM, FM) untuk langsung dibagikan ke atlet binaan.' 
                  : 'You have not created any structured modules yet. Create a new plan or import standard templates.'}
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleImportTemplates}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  <span>{isId ? 'IMPOR TEMPLATE STANDAR' : 'IMPORT TEMPLATES'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePlanModal(true)}
                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0px_#7c3aed] flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isId ? 'RANCANG PROGRAM BARU' : 'CREATE NEW PLAN'}</span>
                </button>
              </div>
            </div>
          ) : (
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
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeletePlan(plan.id)}
                        title={isId ? 'Hapus Modul' : 'Delete Module'}
                        className="p-1.5 text-slate-400 hover:text-rose-500 border border-transparent hover:border-rose-400 dark:hover:border-rose-900 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAssignTitle(plan.title);
                          setAssignTargetPace(plan.targetPace);
                          setAssignTargetHrZone(plan.hrZone);
                          setAssignInstructions(plan.weeklyStructure);
                          setShowAssignTaskModal(true);
                        }}
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-black uppercase transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isId ? 'Tugaskan ke Atlet' : 'Assign to Athlete'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* MODAL: ASSIGN TASK TO ATHLETE */}
      {showAssignTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0d1224] border-2 border-cyan-500 p-6 max-w-lg w-full shadow-[6px_6px_0px_#06b6d4] text-slate-900 dark:text-white space-y-4 font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-cyan-900">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-black uppercase text-sm tracking-wide">
                  TUGASKAN SESI LATIHAN KE ATLET
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignTaskModal(false)}
                className="text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignTask} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                    {isId ? 'Pilih Atlet Binaan' : 'Select Athlete'}
                  </label>
                  <select
                    value={assignAthleteName}
                    onChange={(e) => setAssignAthleteName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                  >
                    {squadAthletes.length === 0 ? (
                      <option value="">{isId ? 'Belum ada atlet (tambahkan dahulu)' : 'No athletes in squad'}</option>
                    ) : (
                      squadAthletes.map(a => (
                        <option key={a.id} value={a.name}>
                          {a.name} ({a.targetRace})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                    Tipe Latihan
                  </label>
                  <select
                    value={assignType}
                    onChange={(e) => setAssignType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                  >
                    <option value="LONG_RUN">Long Run</option>
                    <option value="INTERVAL">Interval Trek</option>
                    <option value="TEMPO">Tempo Run</option>
                    <option value="RECOVERY">Easy Recovery</option>
                    <option value="RACE_SIMULATION">Simulasi Race Pace</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                  Judul Sesi Penugasan
                </label>
                <input
                  type="text"
                  required
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  placeholder="misal: Long Run 22K + Pacing Gel Strategy"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                    Target Jarak (KM)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="60"
                    required
                    value={assignDistanceKm}
                    onChange={(e) => setAssignDistanceKm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                    Target Pace
                  </label>
                  <input
                    type="text"
                    required
                    value={assignTargetPace}
                    onChange={(e) => setAssignTargetPace(e.target.value)}
                    placeholder="misal: 5:30 - 5:45 /km"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                    Tanggal Eksekusi
                  </label>
                  <input
                    type="date"
                    required
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                  Target Zona Detak Jantung
                </label>
                <input
                  type="text"
                  value={assignTargetHrZone}
                  onChange={(e) => setAssignTargetHrZone(e.target.value)}
                  placeholder="misal: Zona 2 (142 - 158 BPM)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                  Instruksi Taktis & Catatan Pelatih
                </label>
                <textarea
                  rows={3}
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  placeholder="Fokus pernapasan, jadwal minum gel per KM, jangan naik ke zona 3 sebelum KM 16..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAssignTaskModal(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs uppercase font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase transition-colors cursor-pointer shadow-sm"
                >
                  Kirim Tugas ke Atlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW COMPLETED TASK */}
      {showReviewModal && taskToReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0d1224] border-2 border-violet-500 p-6 max-w-lg w-full shadow-[6px_6px_0px_#7c3aed] text-slate-900 dark:text-white space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-violet-900">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h3 className="font-black uppercase text-sm tracking-wide">
                  EVALUASI EKSEKUSI: {taskToReview.athleteName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewTask} className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 text-xs space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {taskToReview.title}
                </span>
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400">
                  <span>Target: {taskToReview.targetDistanceKm} km ({taskToReview.targetPace})</span>
                  <span className="font-bold text-rose-600">RPE Atlet: {taskToReview.reportedRpe}/10</span>
                </div>
                <div className="pt-1 text-[11px] italic text-slate-700 dark:text-zinc-300 bg-white dark:bg-[#0d1224] p-2 border border-slate-200 dark:border-zinc-800">
                  Feedback Atlet: &quot;{taskToReview.athleteFeedback}&quot;
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                  Catatan Evaluasi / Koreksi Taktis Coach
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewNoteInput}
                  onChange={(e) => setReviewNoteInput(e.target.value)}
                  placeholder="Beri umpan balik mengenai pace, anjuran fisioterapi/foam roll, hidrasi, atau penyesuaian sesi esok hari..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-violet-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs uppercase font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-black uppercase transition-colors cursor-pointer shadow-sm"
                >
                  Kirim Evaluasi ke Atlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SQUAD ATHLETE */}
      {showAddAthleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0d1224] border-2 border-emerald-500 p-6 max-w-md w-full shadow-[6px_6px_0px_#10b981] text-slate-900 dark:text-white space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-emerald-900">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-black uppercase text-sm tracking-wide">
                  {isId ? 'DAFTARKAN ATLET BINAAN BARU' : 'REGISTER NEW SQUAD ATHLETE'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAthleteModal(false)}
                className="text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAthlete} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                  {isId ? 'Nama Lengkap Atlet' : 'Athlete Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={newAthleteName}
                  onChange={(e) => setNewAthleteName(e.target.value)}
                  placeholder="misal: Dimas Anggara"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                  {isId ? 'Email Atlet' : 'Athlete Email'}
                </label>
                <input
                  type="email"
                  required
                  value={newAthleteEmail}
                  onChange={(e) => setNewAthleteEmail(e.target.value)}
                  placeholder="dimas.runner@example.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                    {isId ? 'Target Lomba / Race' : 'Target Race Goal'}
                  </label>
                  <input
                    type="text"
                    value={newAthleteTargetRace}
                    onChange={(e) => setNewAthleteTargetRace(e.target.value)}
                    placeholder="misal: Borobudur 21K Sub-2"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                    {isId ? 'Target Km / Minggu' : 'Weekly Target Km'}
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={newAthleteTargetKm}
                    onChange={(e) => setNewAthleteTargetKm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                  {isId ? 'Kategori Paket Pembinaan' : 'Coaching Tier'}
                </label>
                <select
                  value={newAthletePackageTier}
                  onChange={(e) => setNewAthletePackageTier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                >
                  <option value="Community Squad (Base)">Community Squad (Base)</option>
                  <option value="Half Marathon Performance">Half Marathon Performance</option>
                  <option value="Elite Marathon Podium (1-on-1)">Elite Marathon Podium (1-on-1)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddAthleteModal(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs uppercase font-bold cursor-pointer"
                >
                  {isId ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase transition-colors cursor-pointer shadow-sm"
                >
                  {isId ? 'Simpan ke Roster' : 'Save to Squad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: INVITE ATHLETE */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0d1224] border-2 border-cyan-500 p-6 max-w-md w-full shadow-[6px_6px_0px_#06b6d4] text-slate-900 dark:text-white space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-cyan-900">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-black uppercase text-sm tracking-wide text-slate-900 dark:text-white">
                  {isId ? 'UNDANG ATLET KE KLUB' : 'INVITE ATHLETE TO CLUB'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {inviteSent ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs text-center space-y-1">
                <Check className="w-6 h-6 mx-auto text-emerald-600 dark:text-emerald-400" />
                <p className="font-bold uppercase">{isId ? 'UNDANGAN BERHASIL DIKIRIM!' : 'INVITATION SENT!'}</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400/80 font-sans">
                  {isId 
                    ? `Kode akses klub telah dikirim ke ${inviteEmail}.`
                    : `Club access code has been delivered to ${inviteEmail}.`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans">
                  {isId 
                    ? 'Kirimkan tautan pendaftaran klub kepada atlet bimbingan Anda. Saat mendaftar, telemetri Garmin mereka akan otomatis terhubung ke dashboard Anda.'
                    : 'Invite athletes to your squad. Once registered, their Garmin running telemetry will appear in your roster.'}
                </p>

                <div className="p-3 bg-cyan-50/50 dark:bg-[#070a14] border border-cyan-200 dark:border-cyan-900/60 space-y-1">
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">
                    {isId ? 'KODE LISENSI KLUB ANDA:' : 'YOUR CLUB LICENSE CODE:'}
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-black text-cyan-600 dark:text-cyan-400 tracking-wider">
                      {clubInviteCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold uppercase cursor-pointer"
                    >
                      {copiedCode ? 'TERSALIN' : 'SALIN'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                    {isId ? 'Nama Atlet (Opsional)' : 'Athlete Name (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={inviteAthleteName}
                    onChange={(e) => setInviteAthleteName(e.target.value)}
                    placeholder="misal: Rian Pratama"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                    {isId ? 'Alamat Email Atlet' : 'Athlete Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="atlet@example.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs uppercase font-bold cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0d1224] border-2 border-violet-500 p-6 max-w-lg w-full shadow-[6px_6px_0px_#7c3aed] text-slate-900 dark:text-white space-y-4 font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-violet-900">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h3 className="font-black uppercase text-sm tracking-wide text-slate-900 dark:text-white">
                  {isId ? 'RANCANG MODUL PROGRAM LATIHAN BARU' : 'CREATE NEW TRAINING PLAN'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatePlanModal(false)}
                className="text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                  {isId ? 'Nama Modul Program' : 'Plan Title'}
                </label>
                <input
                  type="text"
                  required
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  placeholder="misal: 10K Sub-45 Speed Endurance"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-violet-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                    {isId ? 'Kategori Jarak' : 'Category'}
                  </label>
                  <select
                    value={newPlanCategory}
                    onChange={(e) => setNewPlanCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-violet-500 text-slate-900 dark:text-white"
                  >
                    <option value="Base">Fondasi (Base)</option>
                    <option value="5K">5K Speed</option>
                    <option value="10K">10K Standard</option>
                    <option value="HM">Half Marathon</option>
                    <option value="FM">Full Marathon</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                    {isId ? 'Durasi (Minggu)' : 'Duration (Weeks)'}
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={24}
                    value={newPlanDuration}
                    onChange={(e) => setNewPlanDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-violet-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                    {isId ? 'Target Intensitas / Pace' : 'Target Pace'}
                  </label>
                  <input
                    type="text"
                    value={newPlanPace}
                    onChange={(e) => setNewPlanPace(e.target.value)}
                    placeholder="misal: 4:40 - 5:00 /km"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-violet-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                    {isId ? 'Target Zona Detak Jantung' : 'HR Zone'}
                  </label>
                  <input
                    type="text"
                    value={newPlanZone}
                    onChange={(e) => setNewPlanZone(e.target.value)}
                    placeholder="misal: Zona 3 / Ambang Aerobik"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-violet-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                  {isId ? 'Tujuan & Deskripsi Program' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  placeholder="Fokus program, adaptasi fisiologis yang diharapkan..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-violet-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                  {isId ? 'Menu Latihan Mingguan' : 'Weekly Workout Menu'}
                </label>
                <textarea
                  rows={2}
                  value={newPlanStructure}
                  onChange={(e) => setNewPlanStructure(e.target.value)}
                  placeholder="misal: 1x Interval 6x800m, 1x Tempo 8km, 1x Long Run 16km, 2x Easy 40m"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-violet-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePlanModal(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs uppercase font-bold cursor-pointer"
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
