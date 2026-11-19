'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Award, 
  Flame, 
  Activity, 
  Send, 
  MessageSquare, 
  Calendar, 
  Zap, 
  ChevronRight, 
  Check, 
  X,
  Sparkles,
  Info,
  UserCheck,
  Compass,
  Plus
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CoachTask, SquadAthlete } from '@/domain/entities/CoachingRelationship';
import { CoachingStorage } from '@/utils/coachingStorage';

interface Props {
  athleteName?: string;
}

export default function AthleteCoachTasksWidget({ athleteName = '' }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [tasks, setTasks] = useState<CoachTask[]>([]);
  const [squadAthlete, setSquadAthlete] = useState<SquadAthlete | null>(null);
  const [selectedTaskForReport, setSelectedTaskForReport] = useState<CoachTask | null>(null);
  const [reportRpe, setReportRpe] = useState<number>(7);
  const [reportFeedback, setReportFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [joinCoachName, setJoinCoachName] = useState<string>('');

  // Load tasks on mount and check squad membership
  const loadData = () => {
    const loaded = CoachingStorage.getTasksForAthlete(athleteName);
    setTasks(loaded);

    const athletes = CoachingStorage.getSquadAthletes();
    const cleanSearch = athleteName.toLowerCase().trim();
    if (cleanSearch) {
      const found = athletes.find(a => 
        a.name.toLowerCase().includes(cleanSearch) || 
        a.email.toLowerCase().includes(cleanSearch) ||
        cleanSearch.includes(a.name.toLowerCase())
      );
      setSquadAthlete(found || null);
    } else {
      setSquadAthlete(null);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('coaching_task_updated', handleUpdate);
    window.addEventListener('squad_athlete_updated', handleUpdate);
    return () => {
      window.removeEventListener('coaching_task_updated', handleUpdate);
      window.removeEventListener('squad_athlete_updated', handleUpdate);
    };
  }, [athleteName]);

  const handleOpenReportModal = (task: CoachTask) => {
    setSelectedTaskForReport(task);
    setReportRpe(task.reportedRpe || 7);
    setReportFeedback(task.athleteFeedback || '');
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForReport) return;
    setIsSubmitting(true);

    CoachingStorage.completeTask(
      selectedTaskForReport.id,
      reportRpe,
      reportFeedback || 'Latihan diselesaikan sesuai instruksi.'
    );

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedTaskForReport(null);
        loadData();
      }, 1000);
    }, 600);
  };

  const handleJoinCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCoachName.trim()) return;

    // Register athlete in squad
    CoachingStorage.addSquadAthlete({
      name: athleteName || 'Atlet Binaan',
      email: `${athleteName.toLowerCase().replace(/\s+/g, '')}@athlete.local`,
      coachId: joinCoachName.trim(),
      targetRace: 'Half Marathon Build',
      acwr: 1.05,
      acwrZone: 'SWEET_SPOT',
      weeklyMileageKm: 25,
      targetWeeklyKm: 35,
      lastSession: 'Kemarin (Easy Run)',
      tsb: 2,
      packageTier: 'Paket Pembinaan Skuad Klub',
    });

    setIsJoinModalOpen(false);
    loadData();
  };

  const isCoached = !!squadAthlete || tasks.length > 0;
  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-cyan-500/80 p-5 sm:p-6 shadow-[4px_4px_0px_#06b6d4] font-mono text-slate-900 dark:text-white space-y-5 transition-colors">
      {/* 1. Top Bar: Coach Relation or Self-Coached Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-cyan-900/60">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-black px-2.5 py-0.5 border uppercase tracking-widest flex items-center gap-1.5 shadow-xs ${
              isCoached
                ? 'bg-cyan-100 dark:bg-cyan-950 border-cyan-400 text-cyan-800 dark:text-cyan-300'
                : 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-800 dark:text-emerald-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isCoached ? 'bg-cyan-500 animate-pulse' : 'bg-emerald-500'}`} />
              {isCoached 
                ? (isId ? 'PORTAL_PEMBINAAN_PELATIH' : 'COACH_PRESCRIPTION_PORTAL')
                : (isId ? 'PROGRAM_LARI_MANDIRI' : 'SELF_COACHED_RUNNER')}
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-600 text-violet-800 dark:text-violet-300 font-bold uppercase tracking-wider">
              {isCoached ? 'FREEDAYZZ ATHLETIC CLUB' : (isId ? 'PELARI INDEPENDEN' : 'INDEPENDENT ATHLETE')}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black italic tracking-wide uppercase mt-2 text-slate-900 dark:text-white flex items-center gap-2">
            {isCoached ? (
              <>
                <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>{isId ? 'PENUGASAN LATIHAN DARI PELATIH' : 'PRESCRIPTIONS & WORKOUT TASKS FROM COACH'}</span>
              </>
            ) : (
              <>
                <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{isId ? 'PANDUAN & MENU LATIHAN MANDIRI' : 'SELF-DIRECTED TRAINING WORKOUTS'}</span>
              </>
            )}
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans mt-0.5">
            {isCoached
              ? (isId 
                  ? 'Menu latihan terstruktur dan instruksi taktis mingguan yang dirancang khusus oleh pelatih untuk target perlombaan Anda.'
                  : 'Structured training menu and tactical workout assignments designed by your coach.')
              : (isId
                  ? 'Anda saat ini berlatih secara mandiri. Menu latihan disesuaikan dengan kapasitas aerobik VDOT dan target jarak mingguan Anda.'
                  : 'You are currently self-coached. Workouts adapt to your Jack Daniels VDOT aerobic fitness and weekly target.')}
          </p>
        </div>

        {/* Coach ID & Status Box */}
        <div className="p-3 bg-slate-50 dark:bg-[#070a14] border border-cyan-500/40 text-xs shrink-0 max-w-sm">
          {isCoached ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase">
                  {isId ? 'PELATIH PEMBINA:' : 'ASSIGNED COACH:'}
                </span>
                <span className="font-black text-cyan-600 dark:text-cyan-400">
                  {squadAthlete?.coachId ? `Coach ${squadAthlete.coachId}` : (tasks[0]?.coachName || 'Head Coach Skuad')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-1 pt-1 border-t border-slate-200 dark:border-zinc-800 text-[11px]">
                <span className="text-slate-500 dark:text-zinc-400 font-bold">
                  {isId ? 'PROGRAM SKUAD:' : 'PROGRAM TIER:'}
                </span>
                <span className="font-bold text-violet-600 dark:text-violet-400">
                  {squadAthlete?.packageTier || 'Program Pembinaan Klub'}
                </span>
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase">
                  {isId ? 'STATUS PEMBINAAN:' : 'COACHING STATUS:'}
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {isId ? 'Lari Mandiri (Tanpa Coach)' : 'Self-Coached'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsJoinModalOpen(true)}
                className="w-full mt-1 py-1 px-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] uppercase flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isId ? 'HUBUNGKAN KE PELATIH SKUAD' : 'CONNECT TO SQUAD COACH'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Program Benefits / Guidance Banner */}
      <div className="p-3 bg-gradient-to-r from-cyan-50/60 to-violet-50/60 dark:from-cyan-950/20 dark:to-violet-950/20 border border-cyan-300 dark:border-cyan-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {isCoached
              ? (isId 
                  ? 'Program Pembinaan Aktif: Akses Lintasan Lari Stadion • Pemantauan Telemetri Mingguan • Pendampingan Long Run Tim'
                  : 'Active Squad Program: Synthetic Track Access • Weekly Telemetry Monitoring • Group Long Run Support')
              : (isId
                  ? 'Fokus Latihan Mandiri: Bangun fondasi aerobik Zona 2, jaga konsistensi mingguan, dan pantau rasio beban akut/kronis (ACWR).'
                  : 'Self-Coached Focus: Build Zone 2 aerobic base, maintain weekly consistency, and monitor ACWR injury risk ratio.')}
          </span>
        </div>
        {isCoached && (
          <div className="flex items-center gap-2 font-bold text-[11px]">
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 text-emerald-800 dark:text-emerald-300">
              {pendingTasks.length} {isId ? 'Tugas Aktif' : 'Active Tasks'}
            </span>
            <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 text-cyan-800 dark:text-cyan-300">
              {completedTasks.length} {isId ? 'Selesai' : 'Completed'}
            </span>
          </div>
        )}
      </div>

      {/* 3. Task Cards Grid (or Self-Coached Workouts) */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-700 dark:text-zinc-400 tracking-wider flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>{isCoached ? (isId ? 'DAFTAR PENUGASAN MINGGU INI' : 'THIS WEEK’S ASSIGNMENTS') : (isId ? 'REKOMENDASI LATIHAN MINGGUAN MANDIRI' : 'SELF-COACHED RECOMMENDED SESSIONS')}</span>
        </h3>

        {isCoached ? (
          tasks.length === 0 ? (
            <div className="bg-slate-50 dark:bg-[#070a14] border border-dashed border-slate-300 dark:border-zinc-800 p-6 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-cyan-500 mx-auto opacity-70" />
              <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">
                {isId ? 'Belum Ada Penugasan Baru dari Pelatih' : 'No Active Assignments from Coach'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-sans max-w-sm mx-auto">
                {isId
                  ? 'Pelatih belum menugaskan sesi latihan khusus minggu ini. Anda dapat melakukan lari mandiri santai sesuai target mingguan.'
                  : 'Your coach has not assigned specific workouts for this week yet. You can perform easy maintenance runs according to your target.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => {
                const isCompleted = task.status === 'COMPLETED';

                return (
                  <div
                    key={task.id}
                    className={`p-4 border-2 transition-all space-y-3 shadow-xs relative ${
                      isCompleted
                        ? 'bg-slate-50/80 dark:bg-[#070a14]/60 border-slate-300 dark:border-zinc-800 opacity-90'
                        : 'bg-white dark:bg-[#070a14] border-cyan-500 shadow-[3px_3px_0px_#06b6d4]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-2 py-0.5 uppercase tracking-wider ${
                            task.type === 'INTERVAL'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-400'
                              : task.type === 'LONG_RUN'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-400'
                              : task.type === 'TEMPO'
                              ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-400'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-400'
                          }`}>
                            {task.type.replace('_', ' ')}
                          </span>

                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-sans flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Deadline: {task.dueDate}</span>
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 leading-snug">
                          {task.title}
                        </h4>
                      </div>

                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase border shrink-0 ${
                        isCompleted 
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-400' 
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-400'
                      }`}>
                        {isCompleted ? (isId ? 'SELESAI' : 'DONE') : (isId ? 'PENDING' : 'PENDING')}
                      </span>
                    </div>

                    {/* Targets Pill Box */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">JARAK</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{task.targetDistanceKm} KM</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">TARGET PACE</span>
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">{task.targetPace}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">ZONA HR</span>
                        <span className="font-bold text-violet-600 dark:text-violet-400 truncate block">{task.targetHrZone}</span>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="p-2.5 bg-slate-100/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 text-xs font-sans text-slate-700 dark:text-zinc-300 leading-relaxed">
                      <span className="font-bold text-[10px] text-cyan-700 dark:text-cyan-300 uppercase block font-mono mb-0.5">
                        {isId ? 'INSTRUKSI TAKTIS PELATIH:' : 'COACH DIRECTIVE:'}
                      </span>
                      {task.instructions}
                    </div>

                    {/* Completion status */}
                    {isCompleted ? (
                      <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-zinc-800 text-xs font-sans">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                          <span>Diselesaikan: {task.completedAt}</span>
                          <span className="font-bold text-slate-700 dark:text-zinc-300">
                            Borg RPE: <strong className="text-cyan-600 dark:text-cyan-400">{task.reportedRpe}/10</strong>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-sans">
                          Sinkron otomatis dengan Garmin Connect
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenReportModal(task)}
                          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#0891b2] cursor-pointer"
                        >
                          <span>{isId ? 'LAPORKAN EKSEKUSI' : 'LOG COMPLETION'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Self-Coached Workouts Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-emerald-500/70 p-4 space-y-2 shadow-xs">
              <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 text-emerald-800 dark:text-emerald-300 uppercase">
                AEROBIC BASE // ZONA 2
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {isId ? 'Easy Conversational Run' : 'Easy Conversational Run'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans leading-relaxed">
                {isId
                  ? 'Fokus 45–60 menit lari dengan detak jantung di Zona 2. Pernapasan harus rileks dan mampu mengobrol kalimat lengkap.'
                  : '45–60 mins easy effort strictly in Zone 2. Breathing should be conversational to build mitochondrial efficiency.'}
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-between text-[11px] text-slate-500 font-bold">
                <span>6–8 KM</span>
                <span className="text-emerald-600 dark:text-emerald-400">Zona 2 Murni</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-amber-500/70 p-4 space-y-2 shadow-xs">
              <span className="text-[9px] font-black px-2 py-0.5 bg-amber-100 dark:bg-amber-950 border border-amber-400 text-amber-800 dark:text-amber-300 uppercase">
                ENDURANCE // WEEKEND
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {isId ? 'Progressive Long Run' : 'Progressive Long Run'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans leading-relaxed">
                {isId
                  ? 'Lari jarak jauh akhir pekan dengan ritme stabil. Bangun daya tahan mental dan adaptasi cadangan glikogen otot.'
                  : 'Weekend long endurance run. Builds physiological stamina and muscular resilience for official race goals.'}
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-between text-[11px] text-slate-500 font-bold">
                <span>12–16 KM</span>
                <span className="text-amber-600 dark:text-amber-400">Zona 2 - 3</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-violet-500/70 p-4 space-y-2 shadow-xs">
              <span className="text-[9px] font-black px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 text-violet-800 dark:text-violet-300 uppercase">
                THRESHOLD // STAMINA
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {isId ? 'Tempo & Strides Run' : 'Tempo & Strides Run'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans leading-relaxed">
                {isId
                  ? 'Pemanasan 2km easy, dilanjutkan tempo 4km di batas ambang laktat (Zona 4), diakhiri 4x100m akselerasi strides santai.'
                  : '2km warmup, 4km lactate threshold tempo (Zone 4), finished with 4x100m strides for leg speed turnover.'}
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-between text-[11px] text-slate-500 font-bold">
                <span>7–9 KM</span>
                <span className="text-violet-600 dark:text-violet-400">Zona 3 - 4</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: CONNECT TO COACH */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0d1224] border-2 border-cyan-500 p-6 max-w-md w-full shadow-[6px_6px_0px_#06b6d4] text-slate-900 dark:text-white space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-cyan-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-black uppercase text-sm">
                  {isId ? 'GABUNG SKUAD / HUBUNGKAN KE PELATIH' : 'JOIN SQUAD / CONNECT COACH'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsJoinModalOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleJoinCoach} className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-zinc-300 font-sans">
                {isId
                  ? 'Masukkan nama atau ID pelatih Anda untuk menghubungkan telemetri lari Anda langsung ke dasbor pembinaan pelatih.'
                  : 'Enter your coach’s name or club identifier to connect your running telemetry with your coaching squad.'}
              </p>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  {isId ? 'NAMA / KODE PELATIH:' : 'COACH NAME / SQUAD CODE:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Faisal, Coach Dani, PAC-CLUB"
                  value={joinCoachName}
                  onChange={e => setJoinCoachName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 p-2.5 font-bold text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-bold uppercase cursor-pointer"
                >
                  {isId ? 'BATAL' : 'CANCEL'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase cursor-pointer shadow-xs"
                >
                  {isId ? 'HUBUNGKAN' : 'CONNECT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT COMPLETION REPORT */}
      {selectedTaskForReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0d1224] border-2 border-cyan-500 p-6 max-w-lg w-full shadow-[6px_6px_0px_#06b6d4] text-slate-900 dark:text-white space-y-4 font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-cyan-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-black uppercase text-sm tracking-wide">
                  {isId ? 'LAPORAN EKSEKUSI LATIHAN KE PELATIH' : 'SUBMIT WORKOUT COMPLETION TO COACH'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskForReport(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-zinc-800 text-xs space-y-1">
              <span className="font-bold text-cyan-600 dark:text-cyan-400 block">{selectedTaskForReport.title}</span>
              <span className="text-slate-500 text-[11px] block">
                Target: {selectedTaskForReport.targetDistanceKm} KM @ {selectedTaskForReport.targetPace} • {selectedTaskForReport.targetHrZone}
              </span>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-bold uppercase mb-1">
                  {isId ? 'PERCEIVED EXERTION (BORG CR10 SCALE: 1 - 10):' : 'EFFORT RATING (RPE 1 - 10):'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={reportRpe}
                    onChange={(e) => setReportRpe(parseInt(e.target.value))}
                    className="flex-1 accent-cyan-500 cursor-pointer"
                  />
                  <span className="font-black text-base text-cyan-600 dark:text-cyan-400 w-8 text-center border border-cyan-500/50 py-0.5">
                    {reportRpe}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-sans mt-0.5">
                  <span>1: Sangat Ringan</span>
                  <span>5: Sedang (Tempo)</span>
                  <span>10: Maksimal Habis-habisan</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-bold uppercase mb-1">
                  {isId ? 'CATATAN ATLET UNTUK PELATIH:' : 'ATHLETE WORKOUT FEEDBACK:'}
                </label>
                <textarea
                  rows={3}
                  value={reportFeedback}
                  onChange={(e) => setReportFeedback(e.target.value)}
                  placeholder={isId ? 'Misal: Sesi berjalan lancar, cuaca mendung sejuk, betis aman, pace target tercapai stabil...' : 'e.g. Session executed well, maintained cadence 176 spm...'}
                  className="w-full p-2.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-zinc-700 focus:border-cyan-500 outline-none text-slate-900 dark:text-white font-sans text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForReport(null)}
                  className="px-3 py-1.5 border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-bold uppercase cursor-pointer"
                >
                  {isId ? 'BATAL' : 'CANCEL'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Send className="w-3.5 h-3.5 animate-spin" />
                      <span>{isId ? 'MENGIRIM...' : 'SENDING...'}</span>
                    </>
                  ) : submitSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isId ? 'TERKIRIM!' : 'SENT!'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isId ? 'KIRIM KE PELATIH' : 'SUBMIT REPORT'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
