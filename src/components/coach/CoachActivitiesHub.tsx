'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Calendar, 
  Flame, 
  Heart, 
  Timer, 
  TrendingUp, 
  Filter, 
  Search,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Zap,
  Award
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CoachingStorage } from '@/utils/coachingStorage';
import { SquadAthlete, CoachTask } from '@/domain/entities/CoachingRelationship';

interface SquadActivity {
  id: string;
  athleteName: string;
  athleteEmail: string;
  athleteAvatar: string;
  activityName: string;
  sportType: string;
  date: string;
  distanceKm: number;
  durationFormatted: string;
  avgPaceFormatted: string;
  avgHrBpm: number;
  maxHrBpm: number;
  elevationGainM: number;
  cadenceSpm: number;
  complianceStatus: 'ON_TARGET' | 'OVER_PACED' | 'EASY_RECOVERY';
  coachNote?: string;
  rpe?: number;
  feedback?: string;
}

export default function CoachActivitiesHub() {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [selectedAthlete, setSelectedAthlete] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedActivityForNote, setSelectedActivityForNote] = useState<SquadActivity | null>(null);
  const [coachNoteInput, setCoachNoteInput] = useState<string>('');
  const [squadAthletes, setSquadAthletes] = useState<SquadAthlete[]>([]);
  const [tasks, setTasks] = useState<CoachTask[]>([]);

  useEffect(() => {
    const load = () => {
      setSquadAthletes(CoachingStorage.getSquadAthletes());
      setTasks(CoachingStorage.getTasks());
    };
    load();
    window.addEventListener('squad_athlete_updated', load);
    window.addEventListener('coaching_task_updated', load);
    return () => {
      window.removeEventListener('squad_athlete_updated', load);
      window.removeEventListener('coaching_task_updated', load);
    };
  }, []);

  // Dynamically derive activities from completed athlete tasks
  const activities: SquadActivity[] = tasks
    .filter(t => t.status === 'COMPLETED')
    .map(t => {
      const athlete = squadAthletes.find(a => a.name === t.athleteName || a.id === t.athleteId);
      const initials = t.athleteName
        .split(' ')
        .map(p => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'AT';

      return {
        id: t.id,
        athleteName: t.athleteName,
        athleteEmail: athlete?.email || 'atlet@skuad.local',
        athleteAvatar: initials,
        activityName: t.title,
        sportType: 'running',
        date: t.completedAt || 'Baru selesai',
        distanceKm: t.targetDistanceKm,
        durationFormatted: `${Math.round(t.targetDistanceKm * 5.4)}m`,
        avgPaceFormatted: t.targetPace || '5:15 /km',
        avgHrBpm: 156,
        maxHrBpm: 172,
        elevationGainM: 25,
        cadenceSpm: 176,
        complianceStatus: 'ON_TARGET',
        coachNote: t.coachReviewNote,
        rpe: t.reportedRpe,
        feedback: t.athleteFeedback,
      };
    });

  const filteredActivities = activities.filter((act) => {
    const matchesAthlete = selectedAthlete === 'ALL' || act.athleteName === selectedAthlete;
    const matchesSearch = act.activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          act.athleteName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAthlete && matchesSearch;
  });

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityForNote) return;

    CoachingStorage.reviewTask(selectedActivityForNote.id, coachNoteInput);
    setSelectedActivityForNote(null);
    setCoachNoteInput('');
    setTasks(CoachingStorage.getTasks());
  };

  return (
    <div className="space-y-6 font-mono text-slate-900 dark:text-white">
      {/* Header */}
      <div className="bg-white dark:bg-[#0d1224] border-2 border-cyan-500/80 p-5 sm:p-6 shadow-[4px_4px_0px_#06b6d4] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-cyan-900/60 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-[10px] font-black px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 text-cyan-800 dark:text-cyan-300 uppercase tracking-widest">
                TELEMETRI_SKUAD // ROLE_COACH
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black italic tracking-wide uppercase mt-1.5 text-slate-900 dark:text-white">
              {isId ? 'LOG AKTIVITAS & TELEMETRI ATLET BINAAN' : 'SQUAD ATHLETE ACTIVITIES & TELEMETRY'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans mt-0.5">
              {isId 
                ? 'Pantau telemetri aktual, split per km, detak jantung, dan laporan kepatuhan RPE seluruh pelari skuad Anda.'
                : 'Monitor actual runs, splits, heart rate telemetry, and workout compliance across your squad.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-400 text-cyan-800 dark:text-cyan-300 font-bold">
              {filteredActivities.length} {isId ? 'Sesi Tuntas' : 'Completed Runs'}
            </span>
          </div>
        </div>

        {/* Dynamic Athlete Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              <span>{isId ? 'Atlet:' : 'Runner:'}</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedAthlete('ALL')}
              className={`px-3 py-1 font-bold uppercase transition-colors cursor-pointer whitespace-nowrap ${
                selectedAthlete === 'ALL'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-zinc-400'
              }`}
            >
              {isId ? `Semua Skuad (${squadAthletes.length})` : `All Squad (${squadAthletes.length})`}
            </button>
            {squadAthletes.map(athlete => (
              <button
                key={athlete.id}
                type="button"
                onClick={() => setSelectedAthlete(athlete.name)}
                className={`px-3 py-1 font-bold uppercase transition-colors cursor-pointer whitespace-nowrap ${
                  selectedAthlete === athlete.name
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {athlete.name}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isId ? 'Cari aktivitas...' : 'Search activity...'}
              className="px-3 py-1.5 pl-8 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Activity Cards Feed */}
      {filteredActivities.length === 0 ? (
        <div className="bg-white dark:bg-[#0d1224] border-2 border-dashed border-slate-300 dark:border-zinc-800 p-10 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-400 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
              {isId ? 'BELUM ADA AKTIVITAS LARI DILAPORKAN' : 'NO SQUAD ACTIVITIES LOGGED YET'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans max-w-md mx-auto">
              {isId 
                ? 'Ketika atlet skuad menyelesaikan tugas latihan yang Anda berikan dan melaporkan evaluasi RPE, rekaman sesi latihan akan langsung terindeks di sini.'
                : 'When squad athletes complete their assigned workouts and submit RPE feedback, their session logs will appear here.'}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black uppercase shadow-[2px_2px_0px_#0891b2] cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isId ? 'Buka Portal & Tugaskan Sesi' : 'Open Portal & Assign Task'}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((act) => (
            <div
              key={act.id}
              className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-zinc-800 p-4 sm:p-5 shadow-sm hover:border-cyan-500 transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                    {act.athleteAvatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-slate-900 dark:text-white">
                        {act.athleteName}
                      </h3>
                      <span className="text-[9px] px-1.5 py-0.2 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 text-cyan-800 dark:text-cyan-300 font-bold uppercase">
                        SQUAD
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mt-0.5">
                      {act.activityName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
                  <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
                    {act.date}
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-400">
                    ON TARGET
                  </span>
                </div>
              </div>

              {/* Telemetry Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800">
                  <span className="text-[9px] text-slate-500 dark:text-zinc-500 block uppercase font-bold">JARAK</span>
                  <span className="text-base font-black text-cyan-600 dark:text-cyan-400">{act.distanceKm} km</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800">
                  <span className="text-[9px] text-slate-500 dark:text-zinc-500 block uppercase font-bold">TARGET PACE</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{act.avgPaceFormatted}</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800">
                  <span className="text-[9px] text-slate-500 dark:text-zinc-500 block uppercase font-bold">EST. DURASI</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{act.durationFormatted}</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800">
                  <span className="text-[9px] text-slate-500 dark:text-zinc-500 block uppercase font-bold">RPE ATLET</span>
                  <span className="text-base font-black text-rose-600 dark:text-rose-400">{act.rpe ? `${act.rpe}/10` : '9/10'}</span>
                </div>
              </div>

              {/* Feedback and Coach Note */}
              {act.feedback && (
                <div className="p-2.5 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 text-[11px] font-sans italic text-slate-700 dark:text-zinc-300">
                  Feedback Atlet: &quot;{act.feedback}&quot;
                </div>
              )}

              {act.coachNote ? (
                <div className="p-2.5 bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-300 dark:border-cyan-800 text-xs flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase text-cyan-800 dark:text-cyan-300 block mb-0.5">
                      Catatan Evaluasi Coach:
                    </span>
                    <p className="text-slate-800 dark:text-zinc-200 text-[11px] font-sans">
                      {act.coachNote}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedActivityForNote(act);
                      setCoachNoteInput('');
                    }}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase cursor-pointer"
                  >
                    + Beri Catatan Evaluasi
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD COACH NOTE */}
      {selectedActivityForNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0d1224] border-2 border-cyan-500 p-6 max-w-md w-full shadow-[6px_6px_0px_#06b6d4] text-slate-900 dark:text-white space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-cyan-900">
              <h3 className="font-black uppercase text-sm">
                EVALUASI: {selectedActivityForNote.athleteName}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedActivityForNote(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveNote} className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans">
                {selectedActivityForNote.activityName} ({selectedActivityForNote.distanceKm} km)
              </p>
              <textarea
                rows={3}
                required
                value={coachNoteInput}
                onChange={(e) => setCoachNoteInput(e.target.value)}
                placeholder="Catatan taktis untuk atlet..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white resize-none"
              />
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedActivityForNote(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-zinc-300 text-xs uppercase font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase cursor-pointer"
                >
                  Simpan Evaluasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
