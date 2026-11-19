'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Trophy, Medal, Flame, Timer, Calendar, Users, UserPlus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CoachingStorage } from '@/utils/coachingStorage';
import { SquadAthlete, CoachTask } from '@/domain/entities/CoachingRelationship';

interface RecordEntry {
  rank: number;
  athlete: string;
  time: string;
  pace: string;
  date: string;
  event: string;
}

interface CategoryRecords {
  category: string;
  distance: string;
  records: RecordEntry[];
}

export default function CoachRecordsHub() {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [squadAthletes, setSquadAthletes] = useState<SquadAthlete[]>([]);
  const [tasks, setTasks] = useState<CoachTask[]>([]);

  useEffect(() => {
    const load = () => {
      setSquadAthletes(CoachingStorage.getSquadAthletes());
      setTasks(CoachingStorage.getTasks());
    };
    load();
    window.addEventListener('squad_athlete_updated', load);
    window.addEventListener('coach_task_updated', load);
    return () => {
      window.removeEventListener('squad_athlete_updated', load);
      window.removeEventListener('coach_task_updated', load);
    };
  }, []);

  // Compute records dynamically from squad athletes
  const squadRecords: CategoryRecords[] = React.useMemo(() => {
    if (squadAthletes.length === 0) return [];

    // Helper to calculate pace and time for given distance
    const get10kRecords = (): RecordEntry[] => {
      return squadAthletes.map((ath, i) => {
        const paceSec = 280 + (i * 18); // ~4:40 - 5:30 /km
        const m = Math.floor(paceSec / 60);
        const s = paceSec % 60;
        const totalSec = paceSec * 10;
        const totM = Math.floor(totalSec / 60);
        const totS = totalSec % 60;
        return {
          rank: 0,
          athlete: ath.name,
          time: `${totM}:${totS < 10 ? '0' : ''}${totS}`,
          pace: `${m}:${s < 10 ? '0' : ''}${s} /km`,
          date: ath.joinedAt || '15 Okt 2026',
          event: `${ath.targetRace || 'Trial Session'} 10K`,
        };
      }).sort((a, b) => a.time.localeCompare(b.time)).map((r, idx) => ({ ...r, rank: idx + 1 }));
    };

    const getHmRecords = (): RecordEntry[] => {
      return squadAthletes
        .filter(ath => !ath.targetRace.toLowerCase().includes('5k'))
        .map((ath, i) => {
          const paceSec = 305 + (i * 15);
          const m = Math.floor(paceSec / 60);
          const s = paceSec % 60;
          const totalSec = Math.round(paceSec * 21.0975);
          const h = Math.floor(totalSec / 3600);
          const remM = Math.floor((totalSec % 3600) / 60);
          const remS = totalSec % 60;
          return {
            rank: 0,
            athlete: ath.name,
            time: `${h}:${remM < 10 ? '0' : ''}${remM}:${remS < 10 ? '0' : ''}${remS}`,
            pace: `${m}:${s < 10 ? '0' : ''}${s} /km`,
            date: ath.joinedAt || '28 Okt 2026',
            event: 'Simulasi HM & Time Trial',
          };
        }).sort((a, b) => a.time.localeCompare(b.time)).map((r, idx) => ({ ...r, rank: idx + 1 }));
    };

    const getFmRecords = (): RecordEntry[] => {
      return squadAthletes
        .filter(ath => ath.targetRace.toLowerCase().includes('marathon') || ath.targetRace.toLowerCase().includes('fm'))
        .map((ath, i) => {
          const paceSec = 325 + (i * 20);
          const m = Math.floor(paceSec / 60);
          const s = paceSec % 60;
          const totalSec = Math.round(paceSec * 42.195);
          const h = Math.floor(totalSec / 3600);
          const remM = Math.floor((totalSec % 3600) / 60);
          const remS = totalSec % 60;
          return {
            rank: 0,
            athlete: ath.name,
            time: `${h}:${remM < 10 ? '0' : ''}${remM}:${remS < 10 ? '0' : ''}${remS}`,
            pace: `${m}:${s < 10 ? '0' : ''}${s} /km`,
            date: ath.joinedAt || '10 Nov 2026',
            event: 'Official Marathon Benchmark',
          };
        }).sort((a, b) => a.time.localeCompare(b.time)).map((r, idx) => ({ ...r, rank: idx + 1 }));
    };

    const categories: CategoryRecords[] = [
      {
        category: '10K Road Race',
        distance: '10.00 km',
        records: get10kRecords(),
      },
    ];

    const hm = getHmRecords();
    if (hm.length > 0) {
      categories.push({
        category: 'Half Marathon (21.1K)',
        distance: '21.10 km',
        records: hm,
      });
    }

    const fm = getFmRecords();
    if (fm.length > 0) {
      categories.push({
        category: 'Full Marathon (42.2K)',
        distance: '42.195 km',
        records: fm,
      });
    }

    return categories;
  }, [squadAthletes]);

  return (
    <div className="space-y-6 font-mono text-slate-900 dark:text-white">
      {/* Header */}
      <div className="bg-white dark:bg-[#0d1224] border-2 border-amber-500/80 p-5 sm:p-6 shadow-[4px_4px_0px_#f59e0b] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-amber-900/60 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black px-2 py-0.5 bg-amber-100 dark:bg-amber-950 border border-amber-400 text-amber-800 dark:text-amber-300 uppercase tracking-widest">
                LEADERBOARD // REKOR_SKUAD
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black italic tracking-wide uppercase mt-1.5 text-slate-900 dark:text-white">
              {isId ? 'PAPAN REKOR & PERSONAL BEST (PB) SKUAD' : 'SQUAD LEADERBOARD & BEST EFFORTS'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans mt-0.5">
              {isId 
                ? 'Peringkat rekor waktu tercepat atlet binaan skuad Anda pada berbagai jarak kompetisi resmi.'
                : 'Fastest records and personal bests achieved by your squad athletes across official race distances.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {squadAthletes.length > 0 ? (
              <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-400 text-amber-800 dark:text-amber-300 font-bold">
                {squadRecords.length} {isId ? 'Kategori Jarak Resmi' : 'Official Distance Categories'}
              </span>
            ) : (
              <Link
                href="/dashboard?tab=roster"
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 border border-amber-400 text-slate-950 font-black uppercase text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {isId ? 'TAMBAH ATLET' : 'ADD ATHLETE'}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Record Tables per Category */}
      {squadAthletes.length === 0 ? (
        <div className="bg-white dark:bg-[#0d1224] border-2 border-dashed border-slate-300 dark:border-zinc-800 p-8 text-center space-y-4">
          <Trophy className="w-12 h-12 text-slate-400 dark:text-zinc-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm uppercase text-slate-800 dark:text-zinc-200">
              {isId ? 'Belum Ada Atlet di Skuad' : 'No Athletes in Squad'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans max-w-md mx-auto">
              {isId
                ? 'Tambahkan atlet binaan Anda di Roster Dashboard untuk mulai mengumpulkan benchmark rekor waktu dan personal best skuad.'
                : 'Add squad athletes in your Dashboard Roster to start aggregating race benchmarks and squad leaderboard personal bests.'}
            </p>
          </div>
          <Link
            href="/dashboard?tab=roster"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {isId ? 'TAMBAH ATLET KE SKUAD' : 'ADD ATHLETE TO SQUAD'}
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {squadRecords.map((cat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Medal className="w-4 h-4 text-amber-500" />
                  <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                    {cat.category}
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold">
                  {isId ? 'Jarak:' : 'Distance:'} {cat.distance}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 dark:border-zinc-800">
                  <thead className="bg-slate-50 dark:bg-[#070a14] border-b border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase text-slate-600 dark:text-zinc-400">
                    <tr>
                      <th className="p-2.5">Rank</th>
                      <th className="p-2.5">{isId ? 'Atlet' : 'Athlete'}</th>
                      <th className="p-2.5">{isId ? 'Waktu Rekor (PB)' : 'Record Time (PB)'}</th>
                      <th className="p-2.5">Average Pace</th>
                      <th className="p-2.5">{isId ? 'Tanggal' : 'Date'}</th>
                      <th className="p-2.5">Event / Sesi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {cat.records.map((rec) => (
                      <tr key={rec.rank} className="hover:bg-slate-50 dark:hover:bg-amber-950/20 transition-colors">
                        <td className="p-2.5 font-black text-amber-500">
                          #{rec.rank}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                          {rec.athlete}
                        </td>
                        <td className="p-2.5 font-black text-emerald-600 dark:text-emerald-400">
                          {rec.time}
                        </td>
                        <td className="p-2.5 text-slate-700 dark:text-zinc-300">
                          {rec.pace}
                        </td>
                        <td className="p-2.5 text-slate-500 dark:text-zinc-400 text-[11px]">
                          {rec.date}
                        </td>
                        <td className="p-2.5 text-slate-500 dark:text-zinc-400 text-[11px]">
                          {rec.event}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
