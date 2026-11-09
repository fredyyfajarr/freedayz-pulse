'use client';

import React, { useState } from 'react';
import { BestEffort } from '@/domain/entities/BestEffort';
import { VO2MaxCalculator } from '@/domain/services/VO2MaxCalculator';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { useLanguage } from '@/context/LanguageContext';
import { Trophy, Timer, Zap, Sliders, ChevronRight, Sparkles } from 'lucide-react';

interface Props {
  prs: BestEffort[];
}

export default function RacePredictorWidget({ prs }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const baseProfile = React.useMemo(() => {
    return VO2MaxCalculator.evaluateAthleteVO2Max(prs);
  }, [prs]);

  const [vdot, setVdot] = useState<number>(baseProfile.runningVo2Max);
  const [showSlider, setShowSlider] = useState<boolean>(false);

  const predictions = React.useMemo(() => {
    const distances = [
      { key: '5k', label: isId ? '5 KM RACE' : '5K RACE', meters: 5000, iconBg: 'bg-emerald-500' },
      { key: '10k', label: isId ? '10 KM RACE' : '10K RACE', meters: 10000, iconBg: 'bg-cyan-500' },
      { key: '21k', label: isId ? 'HALF MARATHON (21.1K)' : 'HALF MARATHON (21.1K)', meters: 21097.5, iconBg: 'bg-violet-500' },
      { key: '42k', label: isId ? 'FULL MARATHON (42.2K)' : 'FULL MARATHON (42.2K)', meters: 42195, iconBg: 'bg-rose-500' },
    ];

    return distances.map((d) => {
      const timeSec = VO2MaxCalculator.predictRaceTime(d.meters, vdot);
      const paceSec = Math.round(timeSec / (d.meters / 1000));
      return {
        ...d,
        timeFormatted: PaceCalculator.formatDuration(timeSec),
        paceFormatted: PaceCalculator.formatPace(paceSec).replace(' /km', ''),
      };
    });
  }, [vdot, isId]);

  return (
    <div className="bg-white dark:bg-[#0a0f24] border-2 border-slate-200 dark:border-violet-900/70 p-4 sm:p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] font-mono transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-950/80 border border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-300">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-violet-600 dark:text-cyan-400 tracking-wider">
                {isId ? 'PREDIKSI LOMBA // VDOT' : 'RACE PREDICTOR // VDOT'}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-700 text-violet-800 dark:text-violet-300 font-bold">
                VDOT {vdot.toFixed(1)}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black italic tracking-wide text-slate-900 dark:text-white uppercase">
              {isId ? 'ESTIMASI WAKTU FINISH LOMBA' : 'PREDICTED RACE FINISH TIMES'}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSlider(!showSlider)}
          className="text-xs text-slate-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showSlider ? (isId ? 'Tutup Simulasi' : 'Hide Simulator') : (isId ? 'Simulasi Target VDOT' : 'Simulate Target')}</span>
        </button>
      </div>

      {/* Simulator Slider (Expandable) */}
      {showSlider && (
        <div className="my-3 p-3 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="w-full sm:w-auto flex-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
              <span>{isId ? 'Eksplorasi Tingkat Kebugaran VDOT:' : 'Explore Target Fitness VDOT:'}</span>
              <span className="text-violet-600 dark:text-cyan-400 font-black">{vdot.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="25"
              max="75"
              step="0.5"
              value={vdot}
              onChange={(e) => setVdot(parseFloat(e.target.value))}
              className="w-full accent-violet-600 dark:accent-cyan-400 cursor-pointer"
            />
          </div>
          <button
            type="button"
            onClick={() => setVdot(baseProfile.runningVo2Max)}
            className="text-[10px] text-slate-500 dark:text-zinc-400 hover:underline cursor-pointer whitespace-nowrap"
          >
            {isId ? 'Reset ke Aktual' : 'Reset to Actual'}
          </button>
        </div>
      )}

      {/* 4 Race Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
        {predictions.map((p) => (
          <div
            key={p.key}
            className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-zinc-800 p-3 hover:border-violet-400 dark:hover:border-violet-700 transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-zinc-800/80">
              <span className="text-[10px] font-black text-slate-700 dark:text-zinc-300 truncate">
                {p.label}
              </span>
              <span className={`w-2 h-2 rounded-full ${p.iconBg}`} />
            </div>

            {/* Predicted Finish Time */}
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block tracking-tight">
                {p.timeFormatted}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-zinc-400 block">
                {isId ? 'WAKTU ESTIMASI' : 'TARGET TIME'}
              </span>
            </div>

            {/* Required Pace */}
            <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-zinc-800/60 flex items-baseline justify-between text-xs">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400">Pace:</span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400">
                {p.paceFormatted} <span className="text-[9px] font-normal text-slate-400 dark:text-zinc-500">/KM</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800 text-[10px] text-slate-500 dark:text-zinc-500 flex items-center justify-between font-sans">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>
            {isId
              ? 'Dihitung dengan formula Jack Daniels VDOT berdasarkan rekaman latihan terbaik Anda.'
              : 'Computed via Jack Daniels VDOT oxygen-cost formula based on your best efforts.'}
          </span>
        </span>
      </div>
    </div>
  );
}