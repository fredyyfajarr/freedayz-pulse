'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrainingLogWeek, TrainingLogDay } from '@/application/use-cases/GetDashboardSummaryUseCase';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { Calendar, Flame, Route, Clock, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  weeks: TrainingLogWeek[];
}

export default function TrainingLogBubbleCalendar({ weeks }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';
  const [activeDay, setActiveDay] = useState<TrainingLogDay | null>(null);

  const dayHeaders = isId
    ? ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN']
    : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Helper to compute bubble diameter in pixels based on distance (min 20px, max 46px)
  const getBubbleSize = (distanceKm: number): number => {
    if (distanceKm <= 0) return 0;
    return Math.min(46, Math.max(22, Math.round(18 + Math.sqrt(distanceKm) * 7.5)));
  };

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b-2 border-slate-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h2 className="font-black italic tracking-widest uppercase text-sm sm:text-base text-slate-900 dark:text-white">
            {isId ? 'LOG_LATIHAN // KALENDER_VOLUME' : 'TRAINING_LOG // VOLUME_CALENDAR'}
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-700/60 text-violet-800 dark:text-violet-300 font-bold">
            {isId ? 'TAMPILAN_LOG_TELEMETRI' : 'TELEMETRY_LOG_VIEW'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600 border border-violet-400 inline-block"></span>
            &lt; 5 KM
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 border border-cyan-300 inline-block"></span>
            5 - 8 KM
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-300 inline-block"></span>
            {isId ? '> 8 KM (LARI JARAK JAUH)' : '> 8 KM (LONG RUN)'}
          </span>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-[120px_repeat(7,1fr)_90px] gap-2 pb-2 mb-2 text-center text-[10px] font-mono font-black tracking-widest text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
            <div className="text-left pl-2">{isId ? 'LINIMASA' : 'TIMELINE'}</div>
            {dayHeaders.map(day => (
              <div key={day}>{day}</div>
            ))}
            <div className="text-right pr-2">TOTAL</div>
          </div>

          {/* Week Rows */}
          <div className="space-y-2">
            {weeks.map((week, wIdx) => (
              <div
                key={week.weekStart || wIdx}
                className="grid grid-cols-[120px_repeat(7,1fr)_90px] gap-2 items-center bg-slate-50 dark:bg-[#070a14]/60 hover:bg-slate-100 dark:hover:bg-[#070a14] border border-slate-200 dark:border-zinc-800/80 p-2 transition-colors"
              >
                {/* Week Label */}
                <div className="text-[11px] font-mono font-bold text-slate-600 dark:text-zinc-400 pl-2">
                  {week.weekLabel}
                </div>

                {/* 7 Days */}
                {week.days.map((day, dIdx) => {
                  const size = getBubbleSize(day.distanceKm);
                  const hasActivity = day.activitiesCount > 0;

                  // Choose color gradient based on distance
                  let bubbleBg = 'from-violet-600 to-indigo-600 border-violet-400';
                  if (day.distanceKm >= 8) {
                    bubbleBg = 'from-rose-600 to-pink-600 border-rose-300';
                  } else if (day.distanceKm >= 4.5) {
                    bubbleBg = 'from-cyan-600 to-blue-600 border-cyan-300';
                  }

                  return (
                    <div
                      key={day.dateStr || dIdx}
                      className="relative h-14 flex items-center justify-center group"
                      onMouseEnter={() => hasActivity && setActiveDay(day)}
                    >
                      {hasActivity ? (
                        <div
                          style={{ width: `${size}px`, height: `${size}px` }}
                          className={`rounded-full bg-gradient-to-br ${bubbleBg} border-2 flex items-center justify-center text-white font-mono font-black shadow-[2px_2px_0px_rgba(0,0,0,0.3)] cursor-pointer hover:scale-110 active:scale-95 transition-all`}
                        >
                          <span className="text-[10px] drop-shadow-md">
                            {day.distanceKm >= 10 ? day.distanceKm.toFixed(0) : day.distanceKm.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-800"></div>
                      )}
                    </div>
                  );
                })}

                {/* Week Total Distance */}
                <div className="text-right pr-2 font-mono font-black text-xs text-slate-900 dark:text-white">
                  {week.totalDistanceKm > 0 ? (
                    <span className="text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/70 border border-violet-300 dark:border-violet-700/60 px-2 py-0.5 text-[11px]">
                      {week.totalDistanceKm.toFixed(1)} km
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-zinc-600 text-[10px]">0 km</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Tooltip Card for Active Day */}
      {activeDay && (
        <div className="mt-4 p-4 bg-slate-50 dark:bg-[#070a14] border-2 border-violet-500 shadow-[4px_4px_0px_#7c3aed] animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-zinc-800 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase text-violet-700 dark:text-violet-400">
                [ {new Date(activeDay.dateStr + 'T12:00:00').toLocaleDateString(isId ? 'id-ID' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} ]
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-700 text-violet-800 dark:text-violet-300 font-bold">
                {activeDay.activitiesCount} {isId ? 'SESI' : (activeDay.activitiesCount === 1 ? 'SESSION' : 'SESSIONS')}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-700 dark:text-zinc-300">
              <span className="flex items-center gap-1">
                <Route className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                TOTAL: <strong className="text-slate-900 dark:text-white">{activeDay.distanceKm.toFixed(2)} KM</strong>
              </span>
              {activeDay.paceSecPerKm > 0 && (
                <span>
                  {isId ? 'RATA-RATA PACE:' : 'AVG PACE:'} <strong className="text-cyan-600 dark:text-cyan-300">{PaceCalculator.formatPace(activeDay.paceSecPerKm)}</strong>
                </span>
              )}
              {activeDay.trimpScore > 0 && (
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  {isId ? 'BEBAN:' : 'EFFORT:'} <strong className="text-violet-700 dark:text-violet-300">{activeDay.trimpScore} PTS</strong>
                </span>
              )}
            </div>
          </div>

          {/* List of individual activities on this day */}
          <div className="space-y-2">
            {activeDay.activities.map((a, i) => (
              <div
                key={a.id || i}
                className="flex items-center justify-between bg-white dark:bg-[#0a0e1c] border border-slate-200 dark:border-zinc-800/80 px-3 py-2 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 dark:text-white font-bold">{a.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">({a.sportType})</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-slate-900 dark:text-white font-black">{a.distanceKm} km</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">{a.pace}</span>
                  <span className="text-slate-600 dark:text-zinc-400">{a.time}</span>
                  <Link
                    href={`/activities/${a.id}`}
                    className="p-1 bg-violet-600 hover:bg-violet-700 dark:bg-violet-900 dark:hover:bg-violet-700 text-white border border-violet-400 dark:border-violet-500 transition-colors"
                    title={isId ? 'Lihat Telemetri' : 'View Telemetry'}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
