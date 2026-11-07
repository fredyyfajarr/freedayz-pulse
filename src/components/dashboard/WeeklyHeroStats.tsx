'use client';

import React from 'react';
import { WeeklyHeroStats as IWeeklyHeroStats } from '@/application/use-cases/GetDashboardSummaryUseCase';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { Flame, Route, Clock, Mountain, Footprints, TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  stats: IWeeklyHeroStats;
}

export default function WeeklyHeroStats({ stats }: Props) {
  const { t } = useLanguage();

  const cards = [
    {
      label: t('stats.weekly_distance'),
      code: 'VOL_KM',
      value: `${stats.currentWeekDistanceKm.toFixed(1)}`,
      unit: 'KM',
      icon: Route,
      badge: stats.distanceChangePercent !== 0 ? (
        <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 border whitespace-nowrap shrink-0 ${
          stats.distanceChangePercent >= 0 
            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600/50' 
            : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-600/50'
        }`}>
          {stats.distanceChangePercent >= 0 ? <TrendingUp className="w-3 h-3 shrink-0" /> : <TrendingDown className="w-3 h-3 shrink-0" />}
          <span>{stats.distanceChangePercent > 0 ? `+${stats.distanceChangePercent}%` : `${stats.distanceChangePercent}%`} {t('stats.vs_last_week')}</span>
        </span>
      ) : null,
      color: 'from-violet-500/20 to-transparent',
      borderColor: 'border-violet-700/60',
      accentColor: 'text-violet-400',
    },
    {
      label: t('stats.time_in_motion'),
      code: 'DUR_TOTAL',
      value: PaceCalculator.formatDuration(stats.currentWeekDurationSec),
      unit: '',
      icon: Clock,
      badge: (
        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
          {stats.currentWeekRunsCount} {stats.currentWeekRunsCount === 1 ? t('stats.run_completed') : t('stats.runs_completed')}
        </span>
      ),
      color: 'from-indigo-500/20 to-transparent',
      borderColor: 'border-indigo-700/60',
      accentColor: 'text-indigo-400',
    },
    {
      label: t('stats.avg_pace'),
      code: 'PACE_AVG',
      value: stats.currentWeekAvgPaceSecPerKm > 0 ? PaceCalculator.formatPace(stats.currentWeekAvgPaceSecPerKm).replace(' /km', '') : '--:--',
      unit: '/KM',
      icon: Footprints,
      badge: (
        <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
          {t('stats.aerobic_flow')}
        </span>
      ),
      color: 'from-sky-500/20 to-transparent',
      borderColor: 'border-sky-700/60',
      accentColor: 'text-sky-400',
    },
    {
      label: t('stats.elevation_gain'),
      code: 'VERT_M',
      value: `${stats.currentWeekElevationM}`,
      unit: 'M',
      icon: Mountain,
      badge: (
        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
          {t('stats.vert_gain')}
        </span>
      ),
      color: 'from-purple-500/20 to-transparent',
      borderColor: 'border-purple-700/60',
      accentColor: 'text-purple-400',
    },
    {
      label: t('stats.training_load'),
      code: 'TRIMP_SCORE',
      value: `${stats.currentWeekTrimpScore}`,
      unit: 'PTS',
      icon: Flame,
      badge: (
        <span className="text-[10px] font-mono text-violet-700 dark:text-violet-300 font-bold">
          {t('stats.bannister_trimp')}
        </span>
      ),
      color: 'from-violet-600/20 to-transparent',
      borderColor: 'border-violet-600/70',
      accentColor: 'text-violet-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`relative bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:${c.borderColor} p-4 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] hover:shadow-[4px_4px_0px_#7c3aed] transition-all group overflow-hidden flex flex-col justify-between h-full`}
          >
            {/* Top Micro-Label */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {c.label}
              </span>
              <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500">
                [{c.code}]
              </span>
            </div>

            {/* Main Value */}
            <div className="flex items-baseline gap-1.5 my-1 whitespace-nowrap">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                {c.value}
              </span>
              {c.unit && (
                <span className="text-xs font-black text-slate-500 dark:text-zinc-400">
                  {c.unit}
                </span>
              )}
            </div>

            {/* Bottom Badge or Info */}
            <div className="mt-auto pt-2 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between min-h-[34px] gap-2">
              <div className="min-w-0 overflow-hidden">
                {c.badge}
              </div>
              <Icon className={`w-4 h-4 shrink-0 ${c.accentColor} opacity-70 group-hover:opacity-100 transition-opacity`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
