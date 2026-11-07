'use client';

import React, { useState } from 'react';
import { DailyPMCPoint } from '@/domain/entities/FitnessFreshness';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { BarChart3, Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  history: DailyPMCPoint[];
}

export default function PMCChart({ history }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';
  const [daysWindow, setDaysWindow] = useState<30 | 60 | 90 | 180>(90);

  const filteredHistory = history.slice(-daysWindow);

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] transition-colors">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-2 border-slate-200 dark:border-zinc-800 gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <div>
            <h3 className="font-black italic tracking-widest uppercase text-sm sm:text-base text-slate-900 dark:text-white">
              {isId ? 'RESPON_IMPULS_BANNISTER // MODEL_PMC' : 'BANNISTER_IMPULSE_RESPONSE // PMC_MODEL'}
            </h3>
            <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 block">
              {isId 
                ? 'GRAFIK MANAJEMEN PERFORMA COGGAN // TELEMETRI ATLET' 
                : 'COGGAN PERFORMANCE MANAGEMENT CHART // ATHLETIC TELEMETRY'}
            </span>
          </div>
        </div>

        {/* Window Selector */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {([30, 60, 90, 180] as const).map(d => (
            <button
              key={d}
              onClick={() => setDaysWindow(d)}
              className={`px-3 py-1 font-bold border transition-all cursor-pointer ${
                daysWindow === d
                  ? 'bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 border-violet-500 shadow-[2px_2px_0px_#7c3aed]'
                  : 'bg-slate-50 dark:bg-[#070a14] text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {d}{isId ? 'H' : 'D'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredHistory}>
            <defs>
              <linearGradient id="tsbGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-[#1f293d]" vertical={false} />

            <XAxis
              dataKey="dateStr"
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              tickFormatter={val => {
                const parts = val.split('-');
                return `${parts[1]}/${parts[2]}`;
              }}
            />

            <YAxis
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              domain={['auto', 'auto']}
              width={35}
            />

            {/* Zero balance line */}
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
            <ReferenceLine 
              y={15} 
              stroke="#10b981" 
              strokeDasharray="2 2" 
              strokeOpacity={0.6} 
              label={{ 
                value: isId ? 'PUNCAK (+15)' : 'PEAKING (+15)', 
                fill: '#10b981', 
                fontSize: 8, 
                position: 'insideTopLeft' 
              }} 
            />
            <ReferenceLine 
              y={-20} 
              stroke="#ef4444" 
              strokeDasharray="2 2" 
              strokeOpacity={0.6} 
              label={{ 
                value: isId ? 'KELELAHAN (-20)' : 'FATIGUE (-20)', 
                fill: '#ef4444', 
                fontSize: 8, 
                position: 'insideBottomLeft' 
              }} 
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const data: DailyPMCPoint = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-[#070a14] border-2 border-violet-500 p-3 shadow-[4px_4px_0px_#7c3aed] text-xs font-mono space-y-1 z-50">
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800 pb-1 flex justify-between">
                        <span className="text-slate-900 dark:text-white font-bold">{data.dateStr}</span>
                        <span className="text-violet-600 dark:text-violet-400 font-black">{data.statusLabel}</span>
                      </div>
                      <div className="text-blue-600 dark:text-blue-400 flex items-center justify-between gap-4 font-bold">
                        <span>{isId ? 'Kebugaran (CTL 42h):' : 'Fitness (CTL 42d):'}</span>
                        <strong>{data.ctl}</strong>
                      </div>
                      <div className="text-pink-600 dark:text-pink-400 flex items-center justify-between gap-4 font-bold">
                        <span>{isId ? 'Kelelahan (ATL 7h):' : 'Fatigue (ATL 7d):'}</span>
                        <strong>{data.atl}</strong>
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-4 font-bold">
                        <span>{isId ? 'Kesegaran (TSB):' : 'Form (TSB):'}</span>
                        <strong className={data.tsb >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                          {data.tsb > 0 ? `+${data.tsb}` : data.tsb}
                        </strong>
                      </div>
                      {data.dailyTrimp > 0 && (
                        <div className="text-violet-700 dark:text-violet-300 border-t border-slate-200 dark:border-zinc-800 pt-1 flex items-center justify-between">
                          <span>{isId ? 'TRIMP Harian:' : 'Daily TRIMP:'}</span>
                          <strong>{data.dailyTrimp} pts</strong>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Form Area (TSB) */}
            <Area
              type="monotone"
              dataKey="tsb"
              stroke="#10b981"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#tsbGrad)"
              name={isId ? 'Kesegaran (TSB)' : 'Form (TSB)'}
            />

            {/* Fitness Line (CTL) */}
            <Line
              type="monotone"
              dataKey="ctl"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={false}
              name={isId ? 'Kebugaran (CTL)' : 'Fitness (CTL)'}
            />

            {/* Fatigue Line (ATL) */}
            <Line
              type="monotone"
              dataKey="atl"
              stroke="#db2777"
              strokeWidth={2}
              dot={false}
              name={isId ? 'Kelelahan (ATL)' : 'Fatigue (ATL)'}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Guide */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
            <span className="w-3 h-1 bg-blue-600 dark:bg-blue-500 inline-block"></span>
            {isId ? 'KEBUGARAN (CTL 42-HARI)' : 'FITNESS (CTL 42-DAY)'}
          </span>
          <span className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400 font-bold">
            <span className="w-3 h-1 bg-pink-600 dark:bg-pink-500 inline-block"></span>
            {isId ? 'KELELAHAN (ATL 7-HARI)' : 'FATIGUE (ATL 7-DAY)'}
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-3 h-1 bg-emerald-600 dark:bg-emerald-500 inline-block"></span>
            {isId ? 'KESEGARAN / FORM (TSB)' : 'FORM / FRESHNESS (TSB)'}
          </span>
        </div>

        <div className="text-[10px] text-slate-500 dark:text-zinc-500 flex items-center gap-1">
          <Info className="w-3 h-3 text-violet-600 dark:text-violet-400" />
          <span>
            {isId 
              ? 'FORM (TSB) = KEBUGARAN (CTL) DIKURANGI KELELAHAN (ATL)' 
              : 'FORM = FITNESS MINUS FATIGUE'}
          </span>
        </div>
      </div>
    </div>
  );
}
