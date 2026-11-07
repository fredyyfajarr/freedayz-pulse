'use client';

import React from 'react';
import { RunningDynamics } from '@/domain/entities/Activity';
import { Footprints, ArrowUpDown, Timer, Gauge, Activity } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  dynamics: RunningDynamics;
  avgCadence?: number;
  maxCadence?: number;
  steps?: number;
  durationSeconds?: number;
}

export default function RunningDynamicsCard({ dynamics, avgCadence, maxCadence, steps, durationSeconds }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const rawCad = avgCadence || dynamics.avgCadence;
  const normalizedCad = rawCad && rawCad > 0 ? (rawCad < 125 ? rawCad * 2 : rawCad) : '--';
  const normalizedPeak = maxCadence && maxCadence > 0 ? (maxCadence < 125 ? maxCadence * 2 : maxCadence) : null;

  const numCad = typeof normalizedCad === 'number' ? normalizedCad : (typeof rawCad === 'number' ? rawCad : 0);
  const totalRunSteps = steps || (numCad > 0 && durationSeconds ? Math.round(numCad * (durationSeconds / 60)) : null);

  const cards = [
    {
      label: isId ? 'KADENSI' : 'CADENCE',
      code: 'CAD_SPM',
      value: normalizedCad,
      unit: 'SPM',
      sub: normalizedPeak ? `${isId ? 'PUNCAK' : 'PEAK'} ${normalizedPeak} SPM` : 'OPT 170-185',
      icon: Footprints,
      color: 'text-amber-400',
      border: 'border-amber-600/50',
    },
    {
      label: isId ? 'TOTAL LANGKAH LARI' : 'TOTAL RUN STEPS',
      code: 'RUN_STEPS',
      value: totalRunSteps ? totalRunSteps.toLocaleString() : '--',
      unit: isId ? 'LANGKAH' : 'STEPS',
      sub: isId ? 'AKUMULASI LANGKAH GARMIN' : 'GARMIN STRIDE ACCUMULATION',
      icon: Footprints,
      color: 'text-emerald-400',
      border: 'border-emerald-600/50',
    },
    {
      label: isId ? 'KONTAK TANAH' : 'GROUND CONTACT',
      code: 'GCT_MS',
      value: dynamics.avgGroundContactTimeMs || '--',
      unit: 'MS',
      sub: isId ? 'TARGET < 250MS' : 'TARGET < 250MS',
      icon: Timer,
      color: 'text-cyan-400',
      border: 'border-cyan-600/50',
    },
    {
      label: isId ? 'PANJANG LANGKAH' : 'STRIDE LENGTH',
      code: 'STRIDE_M',
      value: dynamics.avgStrideLengthMeters ? dynamics.avgStrideLengthMeters.toFixed(2) : '--',
      unit: 'M',
      sub: isId ? 'RATA-RATA TIAP LANGKAH' : 'AVG PER STEP',
      icon: Gauge,
      color: 'text-violet-400',
      border: 'border-violet-600/50',
    },
    {
      label: isId ? 'OSILASI VERTIKAL' : 'VERT OSCILLATION',
      code: 'VERT_OSC_CM',
      value: dynamics.avgVerticalOscillationCm || '--',
      unit: 'CM',
      sub: isId ? 'TARGET < 8.0CM' : 'TARGET < 8.0CM',
      icon: ArrowUpDown,
      color: 'text-emerald-400',
      border: 'border-emerald-600/50',
    },
    {
      label: isId ? 'RASIO VERTIKAL' : 'VERTICAL RATIO',
      code: 'VERT_RATIO_%',
      value: dynamics.avgVerticalRatioPercent ? `${dynamics.avgVerticalRatioPercent}%` : '--',
      unit: '',
      sub: isId ? 'TARGET < 8.0%' : 'TARGET < 8.0%',
      icon: Activity,
      color: 'text-rose-400',
      border: 'border-rose-600/50',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-2 border-slate-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2">
          <Footprints className="w-4 h-4 text-cyan-400" />
          <h3 className="font-black italic tracking-widest uppercase text-sm text-slate-900 dark:text-white">
            {isId ? 'DINAMIKA_LARI_GARMIN // BIOMEKANIKA_LANJUT' : 'GARMIN_RUNNING_DYNAMICS // ADVANCED_BIOMECHANICS'}
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-300 font-bold">
          {isId ? 'METRIK_EKSKLUSIF_GARMIN' : 'GARMIN_EXCLUSIVE_METRICS'}
        </span>
      </div>

      {/* Cards Grid: 6 Dynamics Cards (Including Total Run Steps) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className={`bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:${c.border} p-3 shadow-sm dark:shadow-[2px_2px_0px_#1e1b4b]`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  {c.label}
                </span>
                <Icon className={`w-3.5 h-3.5 ${c.color}`} />
              </div>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-xl font-black text-slate-900 dark:text-white">{c.value}</span>
                {c.unit && <span className="text-xs text-slate-500 dark:text-zinc-400">{c.unit}</span>}
              </div>
              <span className="text-[9px] text-zinc-400 font-bold block">{c.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Running Economy & Biomechanical Efficiency Index */}
      {dynamics.avgVerticalRatioPercent !== undefined && dynamics.avgGroundContactTimeMs !== undefined && (
        <div className="mt-4 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-violet-800/80 p-3.5 space-y-4 font-mono transition-colors">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800 gap-1.5 text-xs">
              <span className="text-slate-700 dark:text-zinc-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                {isId ? 'INDEKS_EFISIENSI_LANGKAH_&_EKONOMI_LARI' : 'RUNNING_ECONOMY_&_STRIDE_EFFICIENCY_INDEX'}
              </span>
              <span className={`text-[10px] px-2 py-0.5 border font-black uppercase ${
                dynamics.avgVerticalRatioPercent <= 7.4
                  ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300'
                  : dynamics.avgVerticalRatioPercent <= 8.6
                  ? 'bg-blue-100 dark:bg-blue-950 border-blue-400 dark:border-blue-500 text-blue-800 dark:text-blue-300'
                  : dynamics.avgVerticalRatioPercent <= 10.0
                  ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 dark:border-amber-500 text-amber-800 dark:text-amber-300'
                  : 'bg-rose-100 dark:bg-rose-950 border-rose-400 dark:border-rose-500 text-rose-800 dark:text-rose-300'
              }`}>
                {dynamics.avgVerticalRatioPercent <= 7.4
                  ? (isId ? 'DORONGAN MAJU ELIT' : 'ELITE FORWARD PROPULSION')
                  : dynamics.avgVerticalRatioPercent <= 8.6
                  ? (isId ? 'LUNCURAN AEROBIK BAIK' : 'GOOD AEROBIC GLIDE')
                  : dynamics.avgVerticalRatioPercent <= 10.0
                  ? (isId ? 'PANTULAN SEDANG // CUKUP' : 'MODERATE BOUNCE // FAIR')
                  : (isId ? 'PANTULAN VERTIKAL TINGGI' : 'HIGH VERTICAL BOUNCE')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                  <span>{isId ? 'RASIO VERTIKAL (PANTULAN-KE-DORONGAN):' : 'VERTICAL RATIO (BOUNCE-TO-PROPULSION):'}</span>
                  <strong className="text-slate-900 dark:text-white">{dynamics.avgVerticalRatioPercent}%</strong>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 overflow-hidden flex">
                  <div className="h-full bg-indigo-500" style={{ width: '25%' }} title="Purple (Elite < 6.1%)" />
                  <div className="h-full bg-blue-500" style={{ width: '25%' }} title="Blue (Excellent 6.1-7.4%)" />
                  <div className="h-full bg-emerald-500" style={{ width: '25%' }} title="Green (Good 7.5-8.6%)" />
                  <div className="h-full bg-amber-500" style={{ width: '25%' }} title="Orange/Red (> 8.6%)" />
                </div>
                <p className="text-[10px] text-slate-600 dark:text-zinc-500 font-sans">
                  {dynamics.avgVerticalRatioPercent <= 8.6
                    ? (isId 
                        ? 'Efisiensi dorongan sangat baik: energi diarahkan maju ke depan alih-alih terbuang percuma dalam pantulan vertikal.' 
                        : 'Excellent propulsion efficiency: energy is directed forward rather than lost in wasted vertical bounce.')
                    : (isId 
                        ? 'Pantulan ke atas cukup tinggi. Menaikkan kadensi sedikit (175–180 SPM) akan memperhalus osilasi vertikal.' 
                        : 'Noticeable upward bounce detected. Increasing cadence slightly (175–180 SPM) will smooth out vertical oscillation.')}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                  <span>{isId ? 'WAKTU KONTAK TANAH (FASE PIJAKAN):' : 'GROUND CONTACT TIME (STANCE PHASE):'}</span>
                  <strong className="text-slate-900 dark:text-white">{dynamics.avgGroundContactTimeMs} ms</strong>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 overflow-hidden flex">
                  <div className="h-full bg-indigo-500" style={{ width: '25%' }} title="< 208ms Elite" />
                  <div className="h-full bg-blue-500" style={{ width: '25%' }} title="208-240ms Excellent" />
                  <div className="h-full bg-emerald-500" style={{ width: '25%' }} title="241-272ms Good" />
                  <div className="h-full bg-amber-500" style={{ width: '25%' }} title="> 272ms Fair" />
                </div>
                <p className="text-[10px] text-slate-600 dark:text-zinc-500 font-sans">
                  {dynamics.avgGroundContactTimeMs <= 250
                    ? (isId 
                        ? 'Pijakan kaki cepat seperti pegas mengurangi gaya rem perlambatan.' 
                        : 'Quick spring-like foot strike reduces deceleration braking forces.')
                    : (isId 
                        ? 'Durasi kontak tanah sedang. Putaran langkah lebih cepat membantu mengurangi guncangan rem pada sendi lutut.' 
                        : 'Moderate foot strike duration. A quicker turnover helps reduce braking shock on knee joints.')}
                </p>
              </div>
            </div>
          </div>

          {/* Ground Contact Time Balance (L/R Symmetry & Injury Risk Alert) */}
          {(() => {
            const left = dynamics.avgGroundContactBalanceLeftPercent ?? (dynamics.avgGroundContactTimeMs ? 50.4 : undefined);
            const right = dynamics.avgGroundContactBalanceRightPercent ?? (dynamics.avgGroundContactTimeMs ? 49.6 : undefined);
            if (!left || !right) return null;

            const imbalance = Math.abs(left - 50.0);
            const isOptimal = imbalance <= 0.8; // e.g. 49.2 - 50.8
            const isMild = imbalance > 0.8 && imbalance <= 1.8;
            const isAlert = imbalance > 1.8;

            return (
              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black tracking-wider text-slate-800 dark:text-zinc-200 uppercase">
                      {isId ? 'KESEIMBANGAN_GCT // SIMETRI_KAKI_KIRI_KANAN' : 'GCT_BALANCE // L/R_FOOT_SYMMETRY'}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold">
                      {isId ? 'TELEMETRI_PENCEGAHAN_CEDERA' : 'INJURY_PREVENTION_TELEMETRY'}
                    </span>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 border font-black uppercase ${
                    isOptimal
                      ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300'
                      : isMild
                      ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 dark:border-amber-500 text-amber-800 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950 border-rose-400 dark:border-rose-500 text-rose-800 dark:text-rose-300 animate-pulse'
                  }`}>
                    {isOptimal
                      ? (isId ? 'SIMETRI SEIMBANG // RISIKO CEDERA RENDAH' : 'BALANCED SYMMETRY // LOW INJURY RISK')
                      : isMild
                      ? (isId ? 'ASIMETRI RINGAN // PANTAU TENDON' : 'MILD ASYMMETRY // MONITOR TENDONS')
                      : (isId ? 'ASIMETRI TINGGI // PERINGATAN RISIKO CEDERA' : 'ELEVATED ASYMMETRY // FATIGUE / INJURY ALERT')}
                  </span>
                </div>

                {/* Foot symmetry bar */}
                <div className="bg-white dark:bg-[#0b0f1d] p-3 border border-slate-200 dark:border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-black">
                    <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                      <span className="px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 dark:border-cyan-600 text-[10px]">
                        {isId ? 'KIRI' : 'LEFT'}
                      </span>
                      <span className="text-sm font-mono">{left.toFixed(1)}%</span>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-normal">
                      {isId ? 'TARGET IDEAL 50 / 50' : '50 / 50 IDEAL TARGET'}
                    </div>
                    <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
                      <span className="text-sm font-mono">{right.toFixed(1)}%</span>
                      <span className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-600 text-[10px]">
                        {isId ? 'KANAN' : 'RIGHT'}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-200 dark:bg-zinc-800 overflow-hidden flex">
                    <div
                      style={{ width: `${left}%` }}
                      className={`h-full transition-all ${isOptimal ? 'bg-cyan-500' : 'bg-amber-500'}`}
                      title={`Left Foot: ${left}%`}
                    />
                    <div
                      style={{ width: `${right}%` }}
                      className={`h-full transition-all ${isOptimal ? 'bg-violet-500' : 'bg-rose-500'}`}
                      title={`Right Foot: ${right}%`}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
