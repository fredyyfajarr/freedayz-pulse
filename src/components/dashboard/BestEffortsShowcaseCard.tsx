'use client';

import React from 'react';
import Link from 'next/link';
import { Award } from 'lucide-react';
import { BestEffort } from '@/domain/entities/BestEffort';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  bestEfforts: BestEffort[];
}

export default function BestEffortsShowcaseCard({ bestEfforts }: Props) {
  const { t } = useLanguage();

  const standardMilestones = [
    { key: '1k', label: '1 Kilometer', targetKm: '1.0 km' },
    { key: '1mi', label: '1 Mile', targetKm: '1.61 km' },
    { key: '5k', label: '5 Kilometers', targetKm: '5.0 km' },
    { key: '10k', label: '10 Kilometers', targetKm: '10.0 km' },
    { key: 'half_marathon', label: 'Half Marathon', targetKm: '21.1 km' },
    { key: 'marathon', label: 'Marathon', targetKm: '42.2 km' },
  ];

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] transition-colors">
      <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200 dark:border-zinc-800 mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <h3 className="font-black italic tracking-widest uppercase text-sm text-slate-900 dark:text-white">
            {t('pr.showcase_title')}
          </h3>
        </div>
        <span className="text-[9px] font-mono text-slate-500 dark:text-zinc-400">
          {t('pr.all_time_prs')}
        </span>
      </div>

      <div className="space-y-2.5 font-mono">
        {standardMilestones.map(m => {
          const pr = bestEfforts.find(p => p.milestone === m.key);
          if (pr) {
            return (
              <Link
                key={pr.id}
                href={`/activities/${pr.activityId}`}
                className="block bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 hover:border-amber-500/70 p-3 transition-all hover:shadow-[2px_2px_0px_#f59e0b] group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-300 uppercase tracking-wider">
                    {pr.milestoneName}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-200">
                    {PaceCalculator.formatDuration(pr.timeSeconds)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                  <span>{t('pr.pace')}: {PaceCalculator.formatPace(pr.paceSecPerKm)}</span>
                  <span>{new Date(pr.dateAchieved).toLocaleDateString()}</span>
                </div>
              </Link>
            );
          }

          return (
            <div key={m.key} className="bg-slate-50/60 dark:bg-[#070a14]/60 border border-slate-200/80 dark:border-zinc-800/80 p-3 opacity-60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                  {m.label}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-500">
                  --:--:--
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-500 mt-1">
                <span>{t('pr.target')}: {m.targetKm}</span>
                <span>{t('pr.not_logged')}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800 text-right">
        <Link
          href="/records"
          className="text-xs font-mono font-black text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 uppercase tracking-wider"
        >
          {t('pr.view_full')} &rarr;
        </Link>
      </div>
    </div>
  );
}
