'use client';

import React from 'react';
import { Target } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  currentKm: number;
  weeklyTargetKm?: number;
}

export default function WeeklyTargetWidget({ currentKm, weeklyTargetKm = 30 }: Props) {
  const { t } = useLanguage();
  const goalPercent = Math.min(100, Math.round((currentKm / weeklyTargetKm) * 100));

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] font-mono transition-colors">
      <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200 dark:border-zinc-800 mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <h3 className="font-black italic tracking-widest uppercase text-sm text-slate-900 dark:text-white">
            {t('target.weekly_title')}
          </h3>
        </div>
        <span className="text-xs font-black text-cyan-700 dark:text-cyan-400">{goalPercent}%</span>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <span className="text-2xl font-black text-slate-900 dark:text-white">
          {currentKm.toFixed(1)} <span className="text-xs text-slate-500 dark:text-zinc-400">/ {weeklyTargetKm} KM</span>
        </span>
        <span className="text-[10px] text-slate-600 dark:text-zinc-400 font-bold">
          {currentKm >= weeklyTargetKm
            ? t('target.goal_done')
            : `${(weeklyTargetKm - currentKm).toFixed(1)} ${t('target.km_left')}`}
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-[#070a14] h-2.5 border border-slate-200 dark:border-zinc-800 overflow-hidden">
        <div
          style={{ width: `${goalPercent}%` }}
          className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-500"
        />
      </div>
    </div>
  );
}
