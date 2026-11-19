'use client';

import React from 'react';
import { Award, Trophy, Medal, Flame, Timer, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CoachRecordsHub() {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const squadRecords = [
    {
      category: '10K Road Race',
      distance: '10.00 km',
      records: [
        { rank: 1, athlete: 'Siti Rahma', time: '48:32', pace: '4:51 /km', date: '28 Okt 2026', event: 'Jakarta 10K Trial' },
        { rank: 2, athlete: 'Fredy Fajar', time: '49:15', pace: '4:55 /km', date: '12 Okt 2026', event: 'Tangerang 10K Circuit' },
        { rank: 3, athlete: 'Budi Santoso', time: '52:40', pace: '5:16 /km', date: '05 Sep 2026', event: 'Serpong Run 10K' },
      ],
    },
    {
      category: 'Half Marathon (21.1K)',
      distance: '21.10 km',
      records: [
        { rank: 1, athlete: 'Fredy Fajar', time: '1:49:12', pace: '5:10 /km', date: '08 Nov 2026', event: 'Borobudur Marathon 21K' },
        { rank: 2, athlete: 'Budi Santoso', time: '1:54:30', pace: '5:25 /km', date: '18 Okt 2026', event: 'Bali HM Showcase' },
        { rank: 3, athlete: 'Siti Rahma', time: '1:59:45', pace: '5:40 /km', date: '12 Sep 2026', event: 'Bandung West Java HM' },
      ],
    },
    {
      category: 'Full Marathon (42.2K)',
      distance: '42.195 km',
      records: [
        { rank: 1, athlete: 'Fredy Fajar', time: '3:56:45', pace: '5:36 /km', date: '25 Ags 2026', event: 'Maybank Marathon Bali' },
        { rank: 2, athlete: 'Budi Santoso', time: '4:12:10', pace: '5:58 /km', date: '10 Jun 2026', event: 'Jakarta Marathon' },
      ],
    },
  ];

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
                ? 'Peringkat rekor waktu tercepat atlet binaan Freedayzz Athletic Club pada berbagai jarak kompetisi resmi.'
                : 'Fastest records and personal bests achieved by your squad athletes across official race distances.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-400 text-amber-800 dark:text-amber-300 font-bold">
              3 Kategori Jarak Resmi
            </span>
          </div>
        </div>
      </div>

      {/* Record Tables per Category */}
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
                Jarak: {cat.distance}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 dark:border-zinc-800">
                <thead className="bg-slate-50 dark:bg-[#070a14] border-b border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase text-slate-600 dark:text-zinc-400">
                  <tr>
                    <th className="p-2.5">Rank</th>
                    <th className="p-2.5">Atlet</th>
                    <th className="p-2.5">Waktu Rekor (PB)</th>
                    <th className="p-2.5">Average Pace</th>
                    <th className="p-2.5">Tanggal</th>
                    <th className="p-2.5">Event Lomba</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {cat.records.map((rec) => (
                    <tr key={rec.rank} className="hover:bg-slate-50 dark:hover:bg-amber-950/20 transition-colors">
                      <td className="p-2.5 font-black">
                        {rec.rank === 1 ? '🥇 1st' : rec.rank === 2 ? '🥈 2nd' : '🥉 3rd'}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                        {rec.athlete}
                      </td>
                      <td className="p-2.5 font-black text-amber-600 dark:text-amber-400">
                        {rec.time}
                      </td>
                      <td className="p-2.5 font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                        {rec.pace}
                      </td>
                      <td className="p-2.5 text-slate-500 dark:text-zinc-400 text-[11px] font-sans">
                        {rec.date}
                      </td>
                      <td className="p-2.5 text-slate-700 dark:text-zinc-300 text-[11px]">
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
    </div>
  );
}
