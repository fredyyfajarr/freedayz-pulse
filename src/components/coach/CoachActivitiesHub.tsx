'use client';

import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

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
}

const SQUAD_ACTIVITIES: SquadActivity[] = [
  {
    id: 'squad-act-1',
    athleteName: 'Fredy Fajar',
    athleteEmail: 'fredyafajr46@gmail.com',
    athleteAvatar: 'FF',
    activityName: 'Tangerang Weekend Progressive Run',
    sportType: 'running',
    date: '18 Nov 2026, 06:14',
    distanceKm: 21.1,
    durationFormatted: '1:56:42',
    avgPaceFormatted: '5:32 /km',
    avgHrBpm: 154,
    maxHrBpm: 168,
    elevationGainM: 42,
    cadenceSpm: 174,
    complianceStatus: 'ON_TARGET',
    coachNote: 'Pacing sangat disiplin di Zona 2, hidrasi terjaga.',
  },
  {
    id: 'squad-act-2',
    athleteName: 'Budi Santoso',
    athleteEmail: 'budi.runner@example.com',
    athleteAvatar: 'BS',
    activityName: 'Morning Tempo Run 8K Flat',
    sportType: 'running',
    date: '17 Nov 2026, 05:45',
    distanceKm: 8.2,
    durationFormatted: '0:43:10',
    avgPaceFormatted: '5:16 /km',
    avgHrBpm: 164,
    maxHrBpm: 175,
    elevationGainM: 18,
    cadenceSpm: 172,
    complianceStatus: 'ON_TARGET',
    coachNote: 'Ritme langkah stabil, target ambang laktat tercapai.',
  },
  {
    id: 'squad-act-3',
    athleteName: 'Siti Rahma',
    athleteEmail: 'siti.speed@example.com',
    athleteAvatar: 'SR',
    activityName: 'Track Interval 5x1000m Lap',
    sportType: 'running',
    date: '16 Nov 2026, 06:00',
    distanceKm: 7.5,
    durationFormatted: '0:37:25',
    avgPaceFormatted: '4:59 /km',
    avgHrBpm: 172,
    maxHrBpm: 184,
    elevationGainM: 8,
    cadenceSpm: 180,
    complianceStatus: 'ON_TARGET',
    coachNote: 'Waktu repetisi 4:52 - 4:58 konsisten di tiap set.',
  },
  {
    id: 'squad-act-4',
    athleteName: 'Fredy Fajar',
    athleteEmail: 'fredyafajr46@gmail.com',
    athleteAvatar: 'FF',
    activityName: 'Recovery Jog & Mobility Cool Down',
    sportType: 'running',
    date: '15 Nov 2026, 16:40',
    distanceKm: 5.4,
    durationFormatted: '0:34:12',
    avgPaceFormatted: '6:20 /km',
    avgHrBpm: 136,
    maxHrBpm: 144,
    elevationGainM: 12,
    cadenceSpm: 168,
    complianceStatus: 'EASY_RECOVERY',
    coachNote: 'Recovery aktif optimal untuk menurunkan asam laktat.',
  },
  {
    id: 'squad-act-5',
    athleteName: 'Budi Santoso',
    athleteEmail: 'budi.runner@example.com',
    athleteAvatar: 'BS',
    activityName: 'Mid-week Easy Aerobic Base 10K',
    sportType: 'running',
    date: '14 Nov 2026, 05:30',
    distanceKm: 10.0,
    durationFormatted: '1:02:15',
    avgPaceFormatted: '6:13 /km',
    avgHrBpm: 142,
    maxHrBpm: 152,
    elevationGainM: 24,
    cadenceSpm: 170,
    complianceStatus: 'ON_TARGET',
  },
];

export default function CoachActivitiesHub() {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [selectedAthlete, setSelectedAthlete] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedActivityForNote, setSelectedActivityForNote] = useState<SquadActivity | null>(null);
  const [coachNoteInput, setCoachNoteInput] = useState<string>('');
  const [activities, setActivities] = useState<SquadActivity[]>(SQUAD_ACTIVITIES);

  const filteredActivities = activities.filter((act) => {
    const matchesAthlete = selectedAthlete === 'ALL' || act.athleteName === selectedAthlete;
    const matchesSearch = act.activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          act.athleteName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAthlete && matchesSearch;
  });

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityForNote) return;

    setActivities(prev => prev.map(a => 
      a.id === selectedActivityForNote.id ? { ...a, coachNote: coachNoteInput } : a
    ));
    setSelectedActivityForNote(null);
    setCoachNoteInput('');
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
                ? 'Pantau telemetri aktual, split per km, detak jantung, dan kepatuhan beban seluruh pelari Freedayzz Athletic Club.'
                : 'Monitor actual runs, splits, heart rate telemetry, and workout compliance across your squad.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-400 text-cyan-800 dark:text-cyan-300 font-bold">
              {filteredActivities.length} {isId ? 'Sesi Lari Skuad' : 'Runs Logged'}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              <span>Atlet:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedAthlete('ALL')}
              className={`px-3 py-1 font-bold uppercase transition-colors cursor-pointer ${
                selectedAthlete === 'ALL'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-zinc-400'
              }`}
            >
              Semua Skuad
            </button>
            <button
              type="button"
              onClick={() => setSelectedAthlete('Fredy Fajar')}
              className={`px-3 py-1 font-bold uppercase transition-colors cursor-pointer ${
                selectedAthlete === 'Fredy Fajar'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-zinc-400'
              }`}
            >
              Fredy Fajar
            </button>
            <button
              type="button"
              onClick={() => setSelectedAthlete('Budi Santoso')}
              className={`px-3 py-1 font-bold uppercase transition-colors cursor-pointer ${
                selectedAthlete === 'Budi Santoso'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-zinc-400'
              }`}
            >
              Budi Santoso
            </button>
            <button
              type="button"
              onClick={() => setSelectedAthlete('Siti Rahma')}
              className={`px-3 py-1 font-bold uppercase transition-colors cursor-pointer ${
                selectedAthlete === 'Siti Rahma'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-zinc-400'
              }`}
            >
              Siti Rahma
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aktivitas atau rute..."
              className="px-3 py-1.5 pl-8 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Activity Cards Feed */}
      <div className="space-y-3">
        {filteredActivities.map((act) => (
          <div
            key={act.id}
            className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-zinc-800 p-4 sm:p-5 shadow-sm hover:border-cyan-500 transition-colors space-y-3"
          >
            {/* Top Athlete Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                  {act.athleteAvatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-slate-900 dark:text-white">
                      {act.athleteName}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-sans">
                      • {act.date}
                    </span>
                  </div>
                  <span className="font-bold text-sm text-cyan-600 dark:text-cyan-400 block mt-0.5">
                    {act.activityName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black px-2 py-0.5 uppercase bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 text-emerald-800 dark:text-emerald-300">
                  TARGET SESI: TUNTAS
                </span>
              </div>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 text-xs">
              <div>
                <span className="text-[9px] text-slate-500 dark:text-zinc-500 font-bold uppercase block">
                  JARAK
                </span>
                <span className="font-black text-slate-900 dark:text-white text-sm">
                  {act.distanceKm} km
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 dark:text-zinc-500 font-bold uppercase block">
                  DURASI
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {act.durationFormatted}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 dark:text-zinc-500 font-bold uppercase block">
                  AVG PACE
                </span>
                <span className="font-black text-cyan-600 dark:text-cyan-400">
                  {act.avgPaceFormatted}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 dark:text-zinc-500 font-bold uppercase block">
                  AVG / MAX HR
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {act.avgHrBpm} / {act.maxHrBpm} bpm
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 dark:text-zinc-500 font-bold uppercase block">
                  KADENS / ELEVASI
                </span>
                <span className="font-mono text-slate-800 dark:text-zinc-300">
                  {act.cadenceSpm} spm • +{act.elevationGainM}m
                </span>
              </div>
            </div>

            {/* Coach Note Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
              {act.coachNote ? (
                <div className="p-2 bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/60 text-[11px] font-sans flex-1">
                  <span className="font-bold text-violet-800 dark:text-violet-300 block text-[10px] uppercase">
                    Catatan Pelatih:
                  </span>
                  <p className="text-slate-800 dark:text-zinc-200 mt-0.5">
                    {act.coachNote}
                  </p>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-sans italic">
                  Belum ada evaluasi pelatih untuk sesi ini.
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  setSelectedActivityForNote(act);
                  setCoachNoteInput(act.coachNote || '');
                }}
                className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              >
                {act.coachNote ? 'Edit Catatan' : '+ Beri Catatan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add/Edit Coach Note */}
      {selectedActivityForNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0d1224] border-2 border-cyan-500 p-6 max-w-md w-full shadow-[6px_6px_0px_#06b6d4] text-slate-900 dark:text-white space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-cyan-900">
              <h3 className="font-black uppercase text-sm">
                EVALUASI AKTIVITAS // {selectedActivityForNote.athleteName}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedActivityForNote(null)}
                className="text-slate-400 dark:text-zinc-400 hover:text-slate-700 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3">
              <div className="p-2.5 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 text-xs">
                <strong>{selectedActivityForNote.activityName}</strong>
                <span className="block text-slate-500 mt-0.5">
                  {selectedActivityForNote.distanceKm} km • {selectedActivityForNote.avgPaceFormatted} • {selectedActivityForNote.avgHrBpm} bpm
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                  Catatan & Arahan Fisiologis Coach
                </label>
                <textarea
                  rows={3}
                  required
                  value={coachNoteInput}
                  onChange={(e) => setCoachNoteInput(e.target.value)}
                  placeholder="Beri umpan balik mengenai pace splits, hidrasi, atau waktu pemulihan..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
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
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
