'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Zap, Calendar, ArrowUpRight } from 'lucide-react';
import { BestEffort } from '@/domain/entities/BestEffort';
import { Activity } from '@/domain/entities/Activity';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { useLanguage } from '@/context/LanguageContext';
import VDOTTrainingZonesCard from './VDOTTrainingZonesCard';

interface Props {
  prs: BestEffort[];
  activities: Activity[];
}

export default function RecordsClient({ prs, activities }: Props) {
  const { t, language } = useLanguage();

  const standardMilestones = [
    { key: '1k', label: '1 KILOMETER', targetMeters: 1000, targetDesc: language === 'ID' ? 'TOLOK UKUR KECEPATAN 1.0 KM' : '1.0 KM SPEED BENCHMARK' },
    { key: '1mi', label: '1 MILE', targetMeters: 1609.34, targetDesc: language === 'ID' ? 'SPRINT 1.61 KM' : '1.61 KM SPRINT' },
    { key: '5k', label: '5 KILOMETERS', targetMeters: 5000, targetDesc: language === 'ID' ? 'DAYA AEROBIK 5.0 KM' : '5.0 KM AEROBIC POWER' },
    { key: '10k', label: '10 KILOMETERS', targetMeters: 10000, targetDesc: language === 'ID' ? 'AMBANG THRESHOLD 10.0 KM' : '10.0 KM THRESHOLD' },
    { key: 'half_marathon', label: 'HALF MARATHON', targetMeters: 21097.5, targetDesc: language === 'ID' ? 'DAYA TAHAN 21.1 KM' : '21.1 KM ENDURANCE' },
    { key: 'marathon', label: 'FULL MARATHON', targetMeters: 42195, targetDesc: language === 'ID' ? 'JARAK UTAMA 42.2 KM' : '42.2 KM ROYAL DISTANCE' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-200 dark:border-violet-900/50 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-600/60 text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
              {language === 'ID' ? 'TOLOK_UKUR_SEPANJANG_MASA // MILESTONE_KECEPATAN' : 'ALL_TIME_BENCHMARKS // SPEED_MILESTONES'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black italic tracking-wide text-slate-900 dark:text-white uppercase mt-1">
            {language === 'ID' ? 'REKOR_PRIBADI // REKOR_TERBAIK' : 'PERSONAL_RECORDS // BEST_EFFORTS'}
          </h1>
          <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
            {language === 'ID' 
              ? 'TOLOK UKUR YANG DIEKSTRAK OTOMATIS DARI SESI GARMIN (1K HINGGA FULL MARATHON)' 
              : 'AUTOMATICALLY EXTRACTED BENCHMARKS FROM GARMIN SESSIONS (1K TO FULL MARATHON)'}
          </p>
        </div>
      </div>

      {/* PR Cards Grid - 6 Milestones (1k to FM) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 font-mono">
        {standardMilestones.map(m => {
          const pr = prs.find(p => p.milestone === m.key);

          if (pr) {
            return (
              <div
                key={m.key}
                className="bg-white dark:bg-[#0d1224] border-2 border-amber-500/80 dark:border-amber-600/70 p-4 shadow-[4px_4px_0px_#fde68a] dark:shadow-[4px_4px_0px_#78350f] hover:shadow-[4px_4px_0px_#f59e0b] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
                    <span className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                      {m.label}
                    </span>
                    <span className="text-[9px] px-1 py-0.5 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-300 font-bold">
                      PR
                    </span>
                  </div>

                  <div className="my-3">
                    <span className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-200 transition-colors block">
                      {PaceCalculator.formatDuration(pr.timeSeconds)}
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-300 font-bold block mt-0.5">
                      {PaceCalculator.formatPace(pr.paceSecPerKm)}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 space-y-1 pt-2 border-t border-slate-200 dark:border-zinc-800/80">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                      <span>{new Date(pr.dateAchieved).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-200 dark:border-zinc-800/60">
                  <Link
                    href={`/activities/${pr.activityId}`}
                    className="flex items-center justify-between text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 group/link"
                  >
                    <span>{language === 'ID' ? 'LIHAT SESI' : 'VIEW RUN'}</span>
                    <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          }

          return (
            <div
              key={m.key}
              className="bg-slate-50 dark:bg-[#070a14]/60 border-2 border-slate-200 dark:border-zinc-800/80 p-4 opacity-70 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
                  <span className="text-[11px] font-black uppercase text-slate-500 dark:text-zinc-500 tracking-wider">
                    {m.label}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-zinc-600 font-bold">--</span>
                </div>

                <div className="my-3">
                  <span className="text-2xl font-black text-slate-400 dark:text-zinc-600 block">--:--:--</span>
                  <span className="text-xs text-slate-400 dark:text-zinc-600 font-bold block mt-0.5">--:-- /km</span>
                </div>

                <p className="text-[9px] text-slate-500 dark:text-zinc-600 pt-2 border-t border-slate-200 dark:border-zinc-800/60 font-sans">
                  {m.targetDesc}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200 dark:border-zinc-800/60 text-[9px] text-slate-400 dark:text-zinc-600 uppercase font-bold">
                {language === 'ID' ? 'BELUM TERCATAT' : 'NOT YET ACHIEVED'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Jack Daniels VDOT 5-Zone Training Paces Card */}
      <VDOTTrainingZonesCard prs={prs} />
    </div>
  );
}
