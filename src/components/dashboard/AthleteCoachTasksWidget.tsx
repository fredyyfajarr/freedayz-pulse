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
  Info
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CoachTask } from '@/domain/entities/CoachingRelationship';
import { CoachingStorage } from '@/utils/coachingStorage';

interface Props {
  athleteName?: string;
}

export default function AthleteCoachTasksWidget({ athleteName = '' }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [tasks, setTasks] = useState<CoachTask[]>([]);
  const [selectedTaskForReport, setSelectedTaskForReport] = useState<CoachTask | null>(null);
  const [reportRpe, setReportRpe] = useState<number>(7);
  const [reportFeedback, setReportFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Load tasks on mount and listen to updates
  const loadTasks = () => {
    const loaded = CoachingStorage.getTasksForAthlete(athleteName);
    setTasks(loaded);
  };

  useEffect(() => {
    loadTasks();
    const handleUpdate = () => loadTasks();
    window.addEventListener('coaching_task_updated', handleUpdate);
    return () => window.removeEventListener('coaching_task_updated', handleUpdate);
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
      reportFeedback || 'Latihan diselesaikan sesuai instruksi pelatih.'
    );

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedTaskForReport(null);
        loadTasks();
      }, 1000);
    }, 600);
  };

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-cyan-500/80 p-5 sm:p-6 shadow-[4px_4px_0px_#06b6d4] font-mono text-slate-900 dark:text-white space-y-5 transition-colors">
      {/* 1. Top Bar: Coach Relation & Commercial Package */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-cyan-900/60">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black px-2.5 py-0.5 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 text-cyan-800 dark:text-cyan-300 uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              {isId ? 'PORTAL_PEMBINAAN_PELATIH' : 'COACH_PRESCRIPTION_PORTAL'}
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-600 text-violet-800 dark:text-violet-300 font-bold uppercase tracking-wider">
              FREEDAYZZ ATHLETIC CLUB
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black italic tracking-wide uppercase mt-2 text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>{isId ? 'PENUGASAN LATIHAN DARI PELATIH' : 'PRESCRIPTIONS & WORKOUT TASKS FROM COACH'}</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans mt-0.5">
            {isId 
              ? 'Menu latihan terstruktur dan instruksi taktis mingguan yang dirancang khusus oleh Head Coach untuk target perlombaan Anda.'
              : 'Structured training menu and tactical workout assignments designed by your Head Coach.'}
          </p>
        </div>

        {/* Coach ID & Commercial Membership Status */}
        <div className="p-3 bg-slate-50 dark:bg-[#070a14] border border-cyan-500/40 text-xs shrink-0 max-w-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase">
              {isId ? 'PELATIH PEMBINA:' : 'ASSIGNED COACH:'}
            </span>
            <span className="font-black text-cyan-600 dark:text-cyan-400">
              Coach Faisal (Head Coach)
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-1 pt-1 border-t border-slate-200 dark:border-zinc-800 text-[11px]">
            <span className="text-slate-500 dark:text-zinc-400 font-bold">
              {isId ? 'PAKET PEMBINAAN:' : 'COACHING TIER:'}
            </span>
            <span className="font-bold text-violet-600 dark:text-violet-400">
              Elite Marathon Podium (1-on-1)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Program Benefits Banner */}
      <div className="p-3 bg-gradient-to-r from-cyan-50/60 to-violet-50/60 dark:from-cyan-950/20 dark:to-violet-950/20 border border-cyan-300 dark:border-cyan-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {isId 
              ? 'Program Pembinaan Aktif: Akses Lintasan Lari Stadion • Pemantauan Telemetri Mingguan • Pendampingan Long Run Tim'
              : 'Active Squad Program: Synthetic Track Access • Weekly Telemetry Monitoring • Group Long Run Support'}
          </span>
        </div>
        <div className="flex items-center gap-2 font-bold text-[11px]">
          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 text-emerald-800 dark:text-emerald-300">
            {pendingTasks.length} {isId ? 'Tugas Aktif' : 'Active Tasks'}
          </span>
          <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 text-cyan-800 dark:text-cyan-300">
            {completedTasks.length} {isId ? 'Selesai' : 'Completed'}
          </span>
        </div>
      </div>

      {/* 3. Task Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-700 dark:text-zinc-400 tracking-wider flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>{isId ? 'DAFTAR PENUGASAN MINGGU INI' : 'THIS WEEK’S ASSIGNMENTS'}</span>
        </h3>

        {tasks.length === 0 ? (
          <div className="bg-slate-50 dark:bg-[#070a14] border border-dashed border-slate-300 dark:border-zinc-800 p-6 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-cyan-500 mx-auto opacity-70" />
            <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">
              {isId ? 'Belum Ada Penugasan Baru' : 'No Active Assignments'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-sans max-w-sm mx-auto">
              {isId
                ? 'Pelatih belum menugaskan sesi latihan khusus minggu ini. Anda dapat melakukan lari mandiri sesuai target mingguan.'
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
                {/* Header of Task */}
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

                    <h4 className="font-black text-sm text-slate-900 dark:text-white mt-1.5">
                      {task.title}
                    </h4>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-0.5 uppercase shrink-0 flex items-center gap-1 ${
                    isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950 border border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 border border-amber-500 text-amber-700 dark:text-amber-300 animate-pulse'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{isCompleted ? (isId ? 'TUNTAS' : 'COMPLETED') : (isId ? 'PERLU DIEKSEKUSI' : 'ACTION REQUIRED')}</span>
                  </span>
                </div>

                {/* Target Parameters */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-100/70 dark:bg-[#0d1224] border border-slate-200 dark:border-zinc-800 text-[11px]">
                  <div>
                    <span className="text-slate-500 dark:text-zinc-500 block text-[9px] font-bold uppercase">
                      {isId ? 'TARGET JARAK' : 'DISTANCE'}
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
                      ZONA DETAK JANTUNG
                    </span>
                    <span className="font-black text-violet-600 dark:text-violet-400 truncate block">
                      {task.targetHrZone}
                    </span>
                  </div>
                </div>

                {/* Tactical Instructions */}
                <div className="p-2.5 bg-cyan-50/40 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/60 text-xs">
                  <span className="text-[10px] text-cyan-800 dark:text-cyan-300 font-bold block uppercase mb-0.5 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-500" />
                    <span>{isId ? 'INSTRUKSI TAKTIS COACH:' : 'COACH INSTRUCTIONS:'}</span>
                  </span>
                  <p className="text-[11px] font-sans text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {task.instructions}
                  </p>
                </div>

                {/* Completed Details: Athlete Feedback & Coach Review */}
                {isCompleted ? (
                  <div className="space-y-2 pt-1">
                    <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 text-[11px] font-sans">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 mb-1">
                        <span>{isId ? 'LAPORAN EKSEKUSI ANDA:' : 'YOUR EXECUTION LOG:'}</span>
                        <span>RPE: {task.reportedRpe}/10</span>
                      </div>
                      <p className="text-slate-700 dark:text-zinc-300 italic">
                        &quot;{task.athleteFeedback}&quot;
                      </p>
                      <span className="text-[9px] text-slate-400 dark:text-zinc-500 block mt-1">
                        Diserahkan pada: {task.completedAt}
                      </span>
                    </div>

                    {task.coachReviewNote && (
                      <div className="p-2.5 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/60 text-[11px] font-sans">
                        <span className="text-[10px] font-bold uppercase text-violet-800 dark:text-violet-300 block mb-0.5">
                          {isId ? 'EVALUASI BALIK HEAD COACH:' : 'COACH REVIEW NOTE:'}
                        </span>
                        <p className="text-slate-800 dark:text-zinc-200">
                          {task.coachReviewNote}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Action Button to Submit Report */
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
        )}
      </div>

      {/* 4. MODAL: LAPORAN EKSEKUSI & FEEDBACK ATLET */}
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
                className="text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs text-center space-y-1">
                <Check className="w-6 h-6 mx-auto text-emerald-600 dark:text-emerald-400" />
                <p className="font-bold uppercase">{isId ? 'LAPORAN BERHASIL DISERAHKAN!' : 'REPORT SUBMITTED!'}</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400/80 font-sans">
                  {isId 
                    ? 'Head Coach akan mengevaluasi telemetri Garmin Anda dan memberikan feedback taktis.'
                    : 'Head Coach will review your Garmin telemetry and provide tactical feedback.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 text-xs space-y-1">
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase block">
                    {isId ? 'SESI YANG DILAPORKAN:' : 'REPORTING FOR TASK:'}
                  </span>
                  <strong className="text-slate-900 dark:text-white block text-sm">
                    {selectedTaskForReport.title}
                  </strong>
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-600 dark:text-zinc-400">
                    <span>Target: <strong>{selectedTaskForReport.targetDistanceKm} km</strong></span>
                    <span>Pace: <strong>{selectedTaskForReport.targetPace}</strong></span>
                  </div>
                </div>

                {/* Rating of Perceived Exertion (Borg CR10 Scale) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                      <span>{isId ? 'TINGKAT KELELAHAN FISIK (SKALA RPE 1-10)' : 'PERCEIVED EXERTION (RPE 1-10)'}</span>
                    </label>
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                      RPE {reportRpe}/10 ({reportRpe <= 4 ? 'Mudah' : reportRpe <= 7 ? 'Moderat / Berat' : 'Sangat Maksimal'})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={reportRpe}
                    onChange={(e) => setReportRpe(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 dark:text-zinc-500 font-bold">
                    <span>1 (Sangat Santai)</span>
                    <span>5 (Zona 2/3)</span>
                    <span>7 (Threshold)</span>
                    <span>10 (All-out Max)</span>
                  </div>
                </div>

                {/* Athlete Qualitative Feedback */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                    {isId ? 'Catatan & Keluhan Fisiologis Atlet' : 'Athlete Feedback & Physiological Sensation'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reportFeedback}
                    onChange={(e) => setReportFeedback(e.target.value)}
                    placeholder={isId 
                      ? 'Tuliskan kondisi kaki, kepatuhan hidrasi/gel, apakah ada rasa sakit di sendi/betis, atau kendala rute...'
                      : 'Describe leg tightness, nutrition intake, muscle soreness, or course conditions...'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSelectedTaskForReport(null)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs uppercase font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? (isId ? 'MENGIRIM...' : 'SUBMITTING...') : (isId ? 'KIRIM KE HEAD COACH' : 'SEND TO HEAD COACH')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
