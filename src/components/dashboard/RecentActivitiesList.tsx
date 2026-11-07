'use client';

import React from 'react';
import Link from 'next/link';
import { Activity } from '@/domain/entities/Activity';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { Compass, Footprints, Heart, BatteryCharging, ArrowUpRight, Flame } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  activities: Activity[];
}

export default function RecentActivitiesList({ activities }: Props) {
  const { t, language } = useLanguage();
  const localeStr = language === 'ID' ? 'id-ID' : 'en-US';

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-[#0d1224] border-2 border-violet-900/60 p-8 text-center text-zinc-400 font-mono text-xs">
        {t('recent.no_activities')}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h2 className="font-black italic tracking-widest uppercase text-sm sm:text-base text-slate-900 dark:text-white">
            {t('recent.title_feed')}
          </h2>
        </div>
        <Link
          href="/activities"
          className="text-[11px] font-mono font-black text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 uppercase tracking-widest flex items-center gap-1"
        >
          {t('recent.view_all_count')} ({activities.length}) &rarr;
        </Link>
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        {activities.map(act => {
          // Format date and time from activity's local start time string
          let dateStr = '';
          let timeStr = '';
          if (act.startTimeLocalStr) {
            const parts = act.startTimeLocalStr.split(' ');
            dateStr = new Date(parts[0] + 'T12:00:00').toLocaleDateString(localeStr, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            timeStr = parts[1] ? parts[1].slice(0, 5) : '';
          } else {
            dateStr = new Date(act.startTime).toLocaleDateString(localeStr, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            timeStr = new Date(act.startTime).toLocaleTimeString(localeStr, {
              hour: '2-digit',
              minute: '2-digit',
            });
          }

          const cleanTE = act.trainingEffectLabel ? act.trainingEffectLabel.replace(/_/g, ' ') : null;

          return (
            <div
              key={act.id}
              className="bg-white dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 hover:border-violet-600/80 p-4 transition-all hover:shadow-[3px_3px_0px_#7c3aed] group"
            >
              {/* Row 1: Badges & Timestamp */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 dark:border-zinc-800/60">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-700/60 text-violet-800 dark:text-violet-300 font-black">
                    {act.sportType.replace('_', ' ')}
                  </span>
                  {cleanTE && (
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-blue-100 dark:bg-blue-950 border border-blue-400 dark:border-blue-600/50 text-blue-800 dark:text-blue-300 font-black">
                      {t('recent.benefit')}: {cleanTE}
                    </span>
                  )}
                  {act.differenceBodyBattery !== undefined && (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center gap-1 font-bold">
                      <BatteryCharging className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                      {act.differenceBodyBattery} BB
                    </span>
                  )}
                </div>

                <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                  {dateStr} @ {timeStr} {act.locationName ? `// ${act.locationName}` : ''}
                </div>
              </div>

              {/* Row 2: Title */}
              <div className="mb-3">
                <Link
                  href={`/activities/${act.id}`}
                  className="text-base font-black text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors"
                >
                  {act.name}
                </Link>
              </div>

              {/* Row 3: Grid of Telemetry Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono text-xs items-center bg-slate-100 dark:bg-[#0a0e1c] p-2.5 border border-slate-200 dark:border-zinc-800/80">
                {/* Distance */}
                <div>
                  <span className="text-[9px] text-slate-600 dark:text-zinc-400 block uppercase font-bold">{t('activities.distance')}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {(act.distanceMeters / 1000).toFixed(2)} <span className="text-[10px] text-slate-500 dark:text-zinc-400">km</span>
                  </span>
                </div>

                {/* Duration */}
                <div>
                  <span className="text-[9px] text-slate-600 dark:text-zinc-400 block uppercase font-bold">{t('activities.duration')}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {PaceCalculator.formatDuration(act.movingDurationSeconds || act.durationSeconds)}
                  </span>
                </div>

                {/* Avg Pace */}
                <div>
                  <span className="text-[9px] text-slate-600 dark:text-zinc-400 block uppercase font-bold">{t('activities.pace')}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {PaceCalculator.formatPace(act.avgPaceSecPerKm)}
                  </span>
                </div>

                {/* Heart Rate */}
                <div>
                  <span className="text-[9px] text-slate-600 dark:text-zinc-400 block uppercase font-bold">{t('activities.hr')}</span>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                      {act.avgHeartRate ? `${act.avgHeartRate} bpm` : '--'}
                    </span>
                  </div>
                </div>

                {/* Elevation */}
                <div>
                  <span className="text-[9px] text-slate-600 dark:text-zinc-400 block uppercase font-bold">{t('activities.elevation')}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    +{act.elevationGainMeters} m
                  </span>
                </div>

                {/* TRIMP & Link */}
                <div className="flex items-center justify-between col-span-2 sm:col-span-1 md:col-span-1">
                  <div>
                    <span className="text-[9px] text-slate-600 dark:text-zinc-400 block uppercase font-bold">TRIMP</span>
                    <span className="text-sm font-black text-violet-700 dark:text-violet-300">
                      {act.relativeEffortScore || '--'}
                    </span>
                  </div>
                  <Link
                    href={`/activities/${act.id}`}
                    className="p-1.5 bg-white dark:bg-[#070a14] border border-slate-300 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:text-white hover:bg-violet-600 dark:hover:bg-violet-900/60 transition-all self-end"
                    title={t('activities.view_telemetry')}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
