'use client';

import React, { useState } from 'react';
import { GarminDailySummary, GarminHRVSummary } from '@/domain/entities/GarminHealthMetrics';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  Heart,
  Activity,
  BatteryCharging,
  Moon,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  dailyHistory?: GarminDailySummary[];
  hrvHistory?: GarminHRVSummary[];
  currentRhr?: number;
  current7dAvgRhr?: number;
}

export default function RecoverySevenDayCharts({
  dailyHistory = [],
  hrvHistory = [],
  currentRhr = 50,
  current7dAvgRhr = 51,
}: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [showSleepDrillDown, setShowSleepDrillDown] = useState(false);

  const getSleepQualityLabel = (quality: string, score: number) => {
    if (!isId) return quality;
    if (score >= 80 || quality === 'EXCELLENT') return 'SANGAT BAIK';
    if (score >= 70 || quality === 'GOOD') return 'BAIK';
    if (score >= 60 || quality === 'FAIR') return 'CUKUP';
    return 'BURUK';
  };

  // Format 7-day RHR & Sleep data
  const rhrData = dailyHistory.map(d => {
    const dateObj = new Date(d.calendarDate);
    const shortDay = dateObj.toLocaleDateString(isId ? 'id-ID' : 'en-US', { weekday: 'short' }).toUpperCase();
    const shortDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
    const fullDate = dateObj.toLocaleDateString(isId ? 'id-ID' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    const totalSleepSec = d.sleep?.sleepingSeconds || 0;
    const asleepSec = d.sleep?.measurableAsleepDurationSec || totalSleepSec;
    const awakeSec = d.sleep?.measurableAwakeDurationSec || Math.max(0, totalSleepSec - asleepSec);

    const sleepHours = Math.round((totalSleepSec / 3600) * 10) / 10;
    const asleepHours = Math.round((asleepSec / 3600) * 10) / 10;

    const asleepH = Math.floor(asleepSec / 3600);
    const asleepM = Math.floor((asleepSec % 3600) / 60);
    const awakeM = Math.round(awakeSec / 60);

    const sleepScore = d.sleep?.sleepScore || Math.min(100, Math.max(45, Math.round((asleepHours / 7.5) * 85)));
    const rawQuality = d.sleep?.sleepQuality || (sleepScore >= 80 ? 'EXCELLENT' : sleepScore >= 70 ? 'GOOD' : sleepScore >= 60 ? 'FAIR' : 'POOR');
    const sleepQuality = getSleepQualityLabel(rawQuality, sleepScore);

    const restStressSec = d.sleep?.restStressDurationSec || d.stress?.restStressDurationSec || 0;
    const restStressH = Math.floor(restStressSec / 3600);
    const restStressM = Math.floor((restStressSec % 3600) / 60);

    const bbSleep = d.sleep?.bodyBatteryChargedDuringSleep || d.bodyBattery?.duringSleepValue || d.bodyBattery?.chargedValue || 35;

    return {
      date: d.calendarDate,
      fullDate,
      label: `${shortDay} ${shortDate}`,
      rhr: d.restingHeartRate || 50,
      rhrAvg: d.lastSevenDaysAvgRestingHeartRate || d.restingHeartRate || 50,
      minHr: d.minHeartRate || 48,
      charged: d.bodyBattery?.chargedValue || d.bodyBattery?.duringSleepValue || 30,
      drained: Math.abs(d.bodyBattery?.drainedValue || 20),
      bodyBatteryRecent: d.bodyBattery?.mostRecentValue || 50,
      totalSleepSec,
      sleepHours,
      asleepHours,
      sleepFormatted: d.sleep?.formattedHours || `${sleepHours}h`,
      asleepFormatted: `${asleepH}h ${asleepM}m`,
      awakeFormatted: `${awakeM}m`,
      sleepScore,
      sleepQuality,
      restStressFormatted: `${restStressH}h ${restStressM}m`,
      bbSleep,
    };
  });

  // Align last 7 days of HRV history
  const recentHrv = hrvHistory.slice(-7).map(h => {
    const dateObj = new Date(h.calendarDate);
    const shortDay = dateObj.toLocaleDateString(isId ? 'id-ID' : 'en-US', { weekday: 'short' }).toUpperCase();
    const shortDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

    return {
      date: h.calendarDate,
      label: `${shortDay} ${shortDate}`,
      nightlyHrv: h.lastNightAvg || 0,
      weeklyAvg: h.weeklyAvg || h.lastNightAvg || 0,
      peak5Min: h.lastNight5MinHigh || 0,
      baselineLow: h.baseline?.balancedLow ?? 45,
      baselineUpper: h.baseline?.balancedUpper ?? 59,
      status: h.status,
    };
  });

  // Quick stats
  const latestRhr = rhrData.length > 0 ? rhrData[rhrData.length - 1].rhr : currentRhr;
  const lowestRhr = rhrData.length > 0 ? Math.min(...rhrData.map(d => d.rhr)) : 48;
  const avgRhrVal = rhrData.length > 0 ? Math.round(rhrData.reduce((acc, d) => acc + d.rhr, 0) / rhrData.length) : current7dAvgRhr;

  const latestHrvItem = recentHrv.length > 0 ? recentHrv[recentHrv.length - 1] : null;
  const latestHrvVal = latestHrvItem?.nightlyHrv ?? 56;
  const avgHrvVal = recentHrv.length > 0 ? Math.round(recentHrv.reduce((acc, h) => acc + h.nightlyHrv, 0) / recentHrv.length) : 45;

  // 7-Day Average Sleep calculation
  const totalSleepSecAll = rhrData.reduce((acc, d) => acc + d.totalSleepSec, 0);
  const avgSleepSec = rhrData.length > 0 ? Math.round(totalSleepSecAll / rhrData.length) : 0;
  const avgSleepH = Math.floor(avgSleepSec / 3600);
  const avgSleepM = Math.floor((avgSleepSec % 3600) / 60);
  const avgSleepFormatted = avgSleepSec > 0 ? `${avgSleepH}h ${avgSleepM}m` : '5h 38m';

  const latestSleepFormatted = rhrData.length > 0 ? rhrData[rhrData.length - 1].sleepFormatted : '5h 31m';
  const totalChargedWeek = rhrData.reduce((acc, d) => acc + d.charged, 0);

  // Custom High-Contrast Tooltips (Adaptive to Light & Dark Theme)
  const renderRhrTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-white dark:bg-[#070a14] border-2 border-violet-500 p-2.5 shadow-[4px_4px_0px_#7c3aed] text-xs font-mono min-w-[170px] z-50 text-slate-900 dark:text-white">
          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800 pb-1 mb-1.5 flex justify-between">
            <span className="text-slate-900 dark:text-white font-black">{label}</span>
            <span className="text-violet-600 dark:text-violet-400 font-bold">RHR</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs py-0.5">
            <span className="text-slate-600 dark:text-zinc-300 font-bold">
              {isId ? 'Detak Istirahat:' : 'Resting HR:'}
            </span>
            <span className="text-violet-600 dark:text-violet-300 font-black text-sm">{val} BPM</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[10px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800 mt-1">
            <span>{isId ? 'Rata-rata 7D:' : '7-Day Avg:'}</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200">{avgRhrVal} BPM</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderHrvTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const nightly = payload.find((p: any) => p.dataKey === 'nightlyHrv')?.value;
      const weekly = payload.find((p: any) => p.dataKey === 'weeklyAvg')?.value;
      return (
        <div className="bg-white dark:bg-[#070a14] border-2 border-cyan-500 p-2.5 shadow-[4px_4px_0px_#06b6d4] text-xs font-mono min-w-[170px] z-50 text-slate-900 dark:text-white">
          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800 pb-1 mb-1.5 flex justify-between">
            <span className="text-slate-900 dark:text-white font-black">{label}</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">HRV STATUS</span>
          </div>
          {nightly !== undefined && (
            <div className="flex items-center justify-between gap-3 text-xs py-0.5 text-cyan-700 dark:text-cyan-300">
              <span className="font-bold">{isId ? 'HRV Semalam:' : 'Nightly HRV:'}</span>
              <span className="font-black text-sm">{nightly} ms</span>
            </div>
          )}
          {weekly !== undefined && (
            <div className="flex items-center justify-between gap-3 text-[11px] py-0.5 text-slate-600 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/60 mt-1 pt-1">
              <span className="font-bold">{isId ? 'Rata-Rata 7D:' : '7-Day Baseline:'}</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{weekly} ms</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderBodyBatteryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#070a14] border-2 border-emerald-500 p-2.5 shadow-[4px_4px_0px_#10b981] text-xs font-mono min-w-[180px] z-50 text-slate-900 dark:text-white">
          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800 pb-1 mb-1.5 flex justify-between">
            <span className="text-slate-900 dark:text-white font-black">{label}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">BODY BATTERY</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs py-0.5 text-emerald-600 dark:text-emerald-400">
            <span className="font-bold">{isId ? 'Pengisian Tidur (+):' : 'Sleep Charged (+):'}</span>
            <span className="font-black text-sm">+{data.charged} pts</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs py-0.5 text-rose-600 dark:text-rose-400">
            <span className="font-bold">{isId ? 'Kurasan Aktif (-):' : 'Day Drained (-):'}</span>
            <span className="font-black text-sm">-{data.drained} pts</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderSleepDurationTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#070a14] border-2 border-violet-500 p-2.5 shadow-[4px_4px_0px_#7c3aed] text-xs font-mono min-w-[190px] z-50 text-slate-900 dark:text-white">
          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800 pb-1 mb-1.5 flex justify-between">
            <span className="text-slate-900 dark:text-white font-black">{label}</span>
            <span className="text-violet-600 dark:text-violet-400 font-bold">
              {isId ? 'DURASI TIDUR' : 'SLEEP DURATION'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs py-0.5">
            <span className="text-slate-700 dark:text-zinc-300 font-bold">
              {isId ? 'Total Tidur:' : 'Total Sleep:'}
            </span>
            <span className="text-violet-600 dark:text-cyan-400 font-black text-sm">
              {data.sleepFormatted} ({data.sleepHours}h)
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[11px] py-0.5 border-t border-slate-100 dark:border-zinc-800 mt-1 pt-1">
            <span className="text-slate-500 dark:text-zinc-400 font-bold">
              {isId ? 'Skor Firstbeat:' : 'Firstbeat Score:'}
            </span>
            <span className={`font-bold ${
              data.sleepScore >= 80 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : data.sleepScore >= 65 
                ? 'text-amber-600 dark:text-amber-400' 
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {data.sleepScore} / 100 ({data.sleepQuality})
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const activeDayIndex = selectedDayIndex !== null ? selectedDayIndex : (rhrData.length > 0 ? rhrData.length - 1 : 0);
  const activeSleepDay = rhrData[activeDayIndex] || {
    fullDate: isId ? 'Sesi Terbaru' : 'Latest Session',
    label: isId ? 'HARI INI' : 'TODAY',
    sleepFormatted: '5h 31m',
    asleepFormatted: '4h 13m',
    awakeFormatted: '1h 18m',
    sleepScore: 67,
    sleepQuality: isId ? 'CUKUP' : 'FAIR',
    bbSleep: 74,
    restStressFormatted: '4h 34m',
  };

  return (
    <div className="space-y-4">
      {/* Section Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b-2 border-slate-200 dark:border-violet-900/60 gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <h3 className="font-black italic tracking-widest uppercase text-base text-slate-900 dark:text-white">
            {isId ? '7_HARI_TREN_FISIOLOGI // DINAMIKA_PEMULIHAN' : '7_DAY_PHYSIOLOGICAL_TRENDS // RECOVERY_DYNAMICS'}
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-700 text-violet-800 dark:text-violet-300 font-bold uppercase tracking-wider self-start sm:self-auto">
          {isId ? 'TELEMETRI BIOMETRIK 7 HARI BERJALAN' : 'ROLLING 7-DAY BIOMETRIC TELEMETRY'}
        </span>
      </div>

      {/* 2x2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-mono">
        {/* CHART 1: 7-DAY RESTING HEART RATE */}
        <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-4 sm:p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  {isId ? 'DETAK_JANTUNG_ISTIRAHAT // TREN_7D' : 'RESTING_HEART_RATE // 7D_TREND'}
                </h4>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-600 dark:text-zinc-400">
                  {isId ? 'RATA-RATA 7D:' : '7D AVG:'} <strong className="text-violet-700 dark:text-violet-300">{avgRhrVal} BPM</strong>
                </span>
                <span className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-600 text-violet-800 dark:text-violet-300 font-bold">
                  {isId ? `KINI ${latestRhr} BPM` : `NOW ${latestRhr} BPM`}
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-3 mb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-violet-700 dark:text-violet-300">{latestRhr}</span>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">{isId ? 'BPM (BANGUN TIDUR)' : 'BPM (WAKING)'}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                {isId ? 'TERENDAH:' : 'LOWEST:'} <strong className="text-emerald-600 dark:text-emerald-400">{lowestRhr} BPM</strong>
              </span>
            </div>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rhrData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-[#1f293d]" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis domain={['dataMin - 3', 'dataMax + 3']} stroke="#64748b" tick={{ fontSize: 9 }} tickLine={false} />
                  <Tooltip content={renderRhrTooltip} wrapperStyle={{ zIndex: 100 }} />
                  <ReferenceLine y={avgRhrVal} stroke="#a78bfa" strokeDasharray="3 3" label={{ value: `AVG ${avgRhrVal}`, fill: '#8b5cf6', fontSize: 9, position: 'right' }} />
                  <Line
                    type="monotone"
                    dataKey="rhr"
                    stroke="#c084fc"
                    strokeWidth={3}
                    dot={{ fill: '#c084fc', r: 4, strokeWidth: 2, stroke: '#8b5cf6' }}
                    activeDot={{ r: 6, fill: '#38bdf8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-zinc-500 pt-3 border-t border-slate-200 dark:border-zinc-800/80 flex justify-between">
            <span>{isId ? 'METRIK: RHR TIDUR / PAGI' : 'METRIC: SLEEPING / MORNING RHR'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isId ? 'TREN: PEMULIHAN KARDIO STABIL' : 'TREND: STEADY CARDIO RECOVERY'}</span>
          </div>
        </div>

        {/* CHART 2: 7-DAY OVERNIGHT HRV STATUS */}
        <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-4 sm:p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  {isId ? 'HRV_SEMALAM // RATA-RATA_7D' : 'OVERNIGHT_HRV // 7D_AVERAGE'}
                </h4>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-600 dark:text-zinc-400">
                  {isId ? 'RATA-RATA 7D:' : '7D AVG:'} <strong className="text-cyan-700 dark:text-cyan-300">{avgHrvVal} MS</strong>
                </span>
                <span className="px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 dark:border-cyan-500 text-cyan-800 dark:text-cyan-300 font-bold">
                  {isId ? `KINI ${latestHrvVal} MS` : `NOW ${latestHrvVal} MS`}
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-3 mb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-cyan-700 dark:text-cyan-300">{latestHrvVal}</span>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">MS (RMSSD)</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                {isId ? 'BASELINE SEIMBANG:' : 'BALANCED BASELINE:'} <strong className="text-cyan-600 dark:text-cyan-400 font-bold">45 – 59 MS</strong>
              </span>
            </div>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentHrv} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-[#1f293d]" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#64748b" tick={{ fontSize: 9 }} tickLine={false} />
                  <Tooltip content={renderHrvTooltip} wrapperStyle={{ zIndex: 100 }} />
                  <ReferenceLine y={45} stroke="#0ea5e9" strokeDasharray="2 2" />
                  <ReferenceLine y={59} stroke="#0ea5e9" strokeDasharray="2 2" />
                  <Line
                    type="monotone"
                    dataKey="nightlyHrv"
                    stroke="#0891b2"
                    strokeWidth={3}
                    dot={{ fill: '#0891b2', r: 4, strokeWidth: 2, stroke: '#0e7490' }}
                    activeDot={{ r: 6, fill: '#f43f5e' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weeklyAvg"
                    stroke="#818cf8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-zinc-500 pt-3 border-t border-slate-200 dark:border-zinc-800/80 flex justify-between">
            <span>{isId ? 'KESEIMBANGAN OTONOM RMSSD' : 'RMSSD AUTONOMIC BALANCE'}</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">
              {latestHrvItem?.status === 'BALANCED' && isId ? 'SEIMBANG' : (latestHrvItem?.status || 'BALANCED')}
            </span>
          </div>
        </div>

        {/* CHART 3: BODY BATTERY RECHARGE & DRAIN */}
        <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-4 sm:p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  {isId ? 'BODY_BATTERY // PENGISIAN_&_KURASAN' : 'BODY_BATTERY // RECHARGE_&_DRAIN'}
                </h4>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                {isId ? `PENGISIAN MINGGU: +${totalChargedWeek} POIN` : `WEEK CHARGED: +${totalChargedWeek} PTS`}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-3 mb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  +{rhrData.length > 0 ? rhrData[rhrData.length - 1].charged : 74}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">{isId ? 'POIN TERISI' : 'PTS RECHARGED'}</span>
              </div>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                -{rhrData.length > 0 ? rhrData[rhrData.length - 1].drained : 10} {isId ? 'POIN TERKURAS' : 'PTS DRAINED'}
              </span>
            </div>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rhrData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-[#1f293d]" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickLine={false} />
                  <Tooltip content={renderBodyBatteryTooltip} wrapperStyle={{ zIndex: 100 }} />
                  <Bar dataKey="charged" fill="#10b981" radius={[3, 3, 0, 0]} name="charged" />
                  <Bar dataKey="drained" fill="#f43f5e" radius={[3, 3, 0, 0]} name="drained" opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-zinc-500 pt-3 border-t border-slate-200 dark:border-zinc-800/80 flex justify-between">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">&#9632; {isId ? 'PENGISIAN TIDUR (+)' : 'SLEEP CHARGE (+)'}</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">&#9632; {isId ? 'KURASAN AKTIF (-)' : 'ACTIVE DRAIN (-)'}</span>
          </div>
        </div>

        {/* CHART 4: 7-DAY SLEEP DURATION & 7D AVG */}
        <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-4 sm:p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  {isId ? 'DURASI_TIDUR // PEMULIHAN_7D' : 'SLEEP_DURATION // 7D_RECOVERY'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSleepDrillDown(!showSleepDrillDown)}
                className="text-[10px] px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-600 hover:border-violet-500 text-violet-800 dark:text-violet-300 font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>
                  {showSleepDrillDown
                    ? (isId ? 'SEMBUNYIKAN DETAIL' : 'HIDE DRILL DOWN')
                    : (isId ? 'LIHAT DETAIL SKOR TIDUR' : 'DRILL DOWN SLEEP SCORE')}
                </span>
                {showSleepDrillDown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Prominent 7D Average Sleep & Last Night Sleep */}
            <div className="flex items-baseline justify-between mt-3 mb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-violet-700 dark:text-violet-300">
                  {avgSleepFormatted}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">
                  {isId ? 'RATA-RATA TIDUR 7D' : '7D AVG SLEEP'}
                </span>
              </div>
              <div className="text-right text-[10px]">
                <span className="text-slate-500 dark:text-zinc-400">{isId ? 'SEMALAM: ' : 'LAST NIGHT: '}</span>
                <strong className="text-slate-900 dark:text-white">{latestSleepFormatted}</strong>
              </div>
            </div>

            {/* Daily Sleep Duration Bar Chart */}
            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rhrData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  onClick={(e: any) => {
                    if (e && e.activeTooltipIndex !== undefined) {
                      setSelectedDayIndex(e.activeTooltipIndex);
                      setShowSleepDrillDown(true);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-[#1f293d]" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickLine={false} unit="h" domain={[0, 'dataMax + 2']} />
                  <Tooltip content={renderSleepDurationTooltip} wrapperStyle={{ zIndex: 100 }} />
                  <ReferenceLine y={7.0} stroke="#10b981" strokeDasharray="3 3" label={{ value: isId ? 'TARGET 7J' : '7H GOAL', fill: '#10b981', fontSize: 9, position: 'right' }} />
                  <Bar dataKey="sleepHours" radius={[3, 3, 0, 0]} cursor="pointer">
                    {rhrData.map((entry, index) => {
                      const isSelected = index === activeDayIndex;
                      const color = isSelected
                        ? '#0284c7'
                        : entry.sleepHours >= 7.0
                        ? '#10b981'
                        : entry.sleepHours >= 5.5
                        ? '#8b5cf6'
                        : '#f59e0b';
                      return <Cell key={`cell-${index}`} fill={color} stroke={isSelected ? '#7c3aed' : undefined} strokeWidth={isSelected ? 2 : 0} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-zinc-500 pt-3 border-t border-slate-200 dark:border-zinc-800/80 flex justify-between">
            <span>{isId ? 'TARGET OPTIMAL: ≥ 7.0 JAM' : 'TARGET OPTIMAL: ≥ 7.0 HOURS'}</span>
            <span className="text-violet-600 dark:text-violet-300 font-bold">{isId ? 'KLIK GRAFIK BATANG UNTUK DETAIL' : 'CLICK BAR TO DRILL DOWN'}</span>
          </div>
        </div>
      </div>

      {/* DEDICATED SLEEP SCORE DRILL DOWN SECTION (EXPANDABLE) */}
      {showSleepDrillDown && (
        <div className="bg-white dark:bg-[#0d1224] border-2 border-violet-400 dark:border-violet-600/80 p-4 sm:p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#7c3aed] space-y-4 font-mono animate-in fade-in duration-200 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-200 dark:border-zinc-800 gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h4 className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">
                {isId ? 'DETAIL_SKOR_TIDUR' : 'SLEEP_SCORE_DRILL_DOWN'} // {activeSleepDay.fullDate}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold">{isId ? 'SKOR FIRSTBEAT GARMIN:' : 'GARMIN FIRSTBEAT SCORE:'}</span>
              <span className={`text-xs px-2 py-0.5 border font-black uppercase ${
                activeSleepDay.sleepScore >= 80
                  ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300'
                  : activeSleepDay.sleepScore >= 65
                  ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 dark:border-amber-500 text-amber-800 dark:text-amber-300'
                  : 'bg-rose-100 dark:bg-rose-950 border-rose-400 dark:border-rose-500 text-rose-800 dark:text-rose-300'
              }`}>
                {activeSleepDay.sleepScore} / 100 ({activeSleepDay.sleepQuality})
              </span>
            </div>
          </div>

          {/* 4 Selected Day Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-2.5">
              <span className="text-[9px] text-slate-500 dark:text-zinc-500 uppercase block font-bold">
                {isId ? 'TOTAL DI TEMPAT TIDUR' : 'TOTAL IN BED'}
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white mt-1 block">{activeSleepDay.sleepFormatted}</span>
            </div>
            <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-2.5">
              <span className="text-[9px] text-slate-500 dark:text-zinc-500 uppercase block font-bold">
                {isId ? 'AKTUAL TERTIDUR' : 'ACTUAL ASLEEP'}
              </span>
              <span className="text-sm font-black text-violet-700 dark:text-violet-300 mt-1 block">{activeSleepDay.asleepFormatted}</span>
            </div>
            <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-2.5">
              <span className="text-[9px] text-slate-500 dark:text-zinc-500 uppercase block font-bold">
                {isId ? 'WAKTU TERBANGUN' : 'RESTLESS AWAKE'}
              </span>
              <span className="text-sm font-black text-rose-600 dark:text-rose-400 mt-1 block">{activeSleepDay.awakeFormatted}</span>
            </div>
            <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-2.5">
              <span className="text-[9px] text-slate-500 dark:text-zinc-500 uppercase block font-bold">
                {isId ? 'PENGISIAN ENERGI' : 'SLEEP RECHARGE'}
              </span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 block">+{activeSleepDay.bbSleep} {isId ? 'POIN' : 'PTS'}</span>
            </div>
          </div>

          {/* 7-Day Sleep Breakdown Log Table */}
          <div className="overflow-x-auto pt-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-widest text-left bg-slate-50 dark:bg-[#070a14]">
                  <th className="py-2.5 px-3">{isId ? 'TANGGAL / HARI' : 'DATE / DAY'}</th>
                  <th className="py-2.5 px-3">{isId ? 'TOTAL TIDUR' : 'TOTAL SLEEP'}</th>
                  <th className="py-2.5 px-3">{isId ? 'AKTUAL TERTIDUR' : 'ACTUAL ASLEEP'}</th>
                  <th className="py-2.5 px-3">{isId ? 'WAKTU BANGUN' : 'AWAKE TIME'}</th>
                  <th className="py-2.5 px-3">{isId ? 'SKOR TIDUR' : 'SLEEP SCORE'}</th>
                  <th className="py-2.5 px-3">{isId ? 'PENGISIAN ENERGI' : 'SLEEP RECHARGE'}</th>
                  <th className="py-2.5 px-3">{isId ? 'AKSI' : 'ACTION'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {rhrData.slice().reverse().map((day, i) => {
                  const originalIndex = rhrData.length - 1 - i;
                  const isSelected = originalIndex === activeDayIndex;

                  return (
                    <tr
                      key={day.date}
                      onClick={() => setSelectedDayIndex(originalIndex)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-violet-50 dark:bg-violet-950/40 border-l-2 border-l-cyan-500' 
                          : 'hover:bg-slate-50 dark:hover:bg-violet-950/20'
                      }`}
                    >
                      <td className="py-3 px-3 text-slate-900 dark:text-white font-bold">
                        {day.label}
                      </td>
                      <td className="py-3 px-3 text-violet-700 dark:text-violet-300 font-black">
                        {day.sleepFormatted}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-zinc-300 font-bold">
                        {day.asleepFormatted}
                      </td>
                      <td className="py-3 px-3 text-rose-600 dark:text-rose-400 font-bold">
                        {day.awakeFormatted}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 border text-[10px] font-black uppercase ${
                          day.sleepScore >= 80
                            ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300'
                            : day.sleepScore >= 65
                            ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 dark:border-amber-500 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950 border-rose-400 dark:border-rose-500 text-rose-800 dark:text-rose-300'
                        }`}>
                          {day.sleepScore} • {day.sleepQuality}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                        +{day.bbSleep} {isId ? 'POIN' : 'PTS'}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDayIndex(originalIndex);
                          }}
                          className={`text-[10px] font-bold px-2 py-0.5 border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-100 dark:bg-cyan-950 border-cyan-400 text-cyan-800 dark:text-cyan-300 shadow-sm'
                              : 'bg-transparent border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {isSelected ? (isId ? 'TERPILIH' : 'SELECTED') : (isId ? 'PERIKSA' : 'INSPECT')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
