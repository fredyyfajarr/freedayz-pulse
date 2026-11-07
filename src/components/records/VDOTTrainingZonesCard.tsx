'use client';

import React, { useState } from 'react';
import { BestEffort } from '@/domain/entities/BestEffort';
import { VO2MaxCalculator } from '@/domain/services/VO2MaxCalculator';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Zap, 
  Target, 
  Flame, 
  Timer, 
  Compass, 
  ChevronRight, 
  Sliders, 
  RotateCcw,
  Sparkles,
  Award
} from 'lucide-react';

interface Props {
  prs: BestEffort[];
}

export default function VDOTTrainingZonesCard({ prs }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const defaultProfile = React.useMemo(() => {
    return VO2MaxCalculator.evaluateAthleteVO2Max(prs);
  }, [prs]);

  const [customVdot, setCustomVdot] = useState<number>(defaultProfile.runningVo2Max);
  const [splitMode, setSplitMode] = useState<'km' | 'track'>('km');

  // Compute training paces dynamically from custom or calibrated VDOT
  const currentPaces = React.useMemo(() => {
    return VO2MaxCalculator.calculateTrainingPaces(customVdot);
  }, [customVdot]);

  const isCustomized = customVdot !== defaultProfile.runningVo2Max;

  // Zone accent colors
  const zoneStyles: Record<string, { badgeBg: string; border: string; text: string; darkBg: string }> = {
    E: {
      badgeBg: 'bg-blue-100 dark:bg-blue-950',
      border: 'border-blue-400 dark:border-blue-600',
      text: 'text-blue-700 dark:text-blue-400',
      darkBg: 'border-l-4 border-l-blue-500',
    },
    M: {
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950',
      border: 'border-emerald-400 dark:border-emerald-600',
      text: 'text-emerald-700 dark:text-emerald-400',
      darkBg: 'border-l-4 border-l-emerald-500',
    },
    T: {
      badgeBg: 'bg-amber-100 dark:bg-amber-950',
      border: 'border-amber-400 dark:border-amber-600',
      text: 'text-amber-700 dark:text-amber-400',
      darkBg: 'border-l-4 border-l-amber-500',
    },
    I: {
      badgeBg: 'bg-violet-100 dark:bg-violet-950',
      border: 'border-violet-400 dark:border-violet-600',
      text: 'text-violet-700 dark:text-violet-400',
      darkBg: 'border-l-4 border-l-violet-500',
    },
    R: {
      badgeBg: 'bg-rose-100 dark:bg-rose-950',
      border: 'border-rose-400 dark:border-rose-600',
      text: 'text-rose-700 dark:text-rose-400',
      darkBg: 'border-l-4 border-l-rose-500',
    },
  };

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] transition-colors font-mono space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b-2 border-slate-200 dark:border-zinc-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-500" />
            <span className="text-[10px] px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-600 text-violet-800 dark:text-violet-300 font-bold uppercase tracking-wider">
              {isId ? 'FORMULA LEGENDARIS DR. JACK DANIELS' : 'DR. JACK DANIELS VDOT FORMULA'}
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold uppercase">
              100% FREE (NO PAYWALL)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black italic tracking-wide text-slate-900 dark:text-white uppercase mt-1">
            {isId ? 'PANDUAN PACE LATIHAN 5 ZONA // VDOT CALIBRATION' : '5-ZONE TRAINING PACES // VDOT CALIBRATION'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans">
            {isId
              ? 'Target kecepatan presisi harian berdasarkan efisiensi aerobik aktual Anda. Gunakan ini sebagai acuan lari Easy, Long Run, Tempo, hingga Interval lintasan.'
              : 'Precision daily running pace targets derived from your actual physiological capacity. Calibrated for Easy runs, Marathon pace, Tempo thresholds, and Track intervals.'}
          </p>
        </div>

        {/* VDOT Badge & Calibrated Source */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-violet-500 p-2.5 text-right shadow-sm">
            <span className="text-[9px] text-slate-500 dark:text-zinc-400 block uppercase font-bold">
              {isCustomized 
                ? (isId ? 'VDOT DISIMULASIKAN' : 'SIMULATED VDOT')
                : (isId ? 'VDOT TERKALIBRASI' : 'CALIBRATED VDOT')}
            </span>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-2xl font-black text-violet-600 dark:text-violet-400">
                {customVdot.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">ml/kg/min</span>
            </div>
            <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold block truncate max-w-[170px]" title={defaultProfile.source}>
              {defaultProfile.fitnessCategory}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar: Track Mode Toggle + VDOT Simulation Slider */}
      <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* VDOT Adjustment Slider */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <Sliders className="w-4 h-4 text-violet-500 shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-600 dark:text-zinc-400">
              <span>{isId ? 'SESUAIKAN / SIMULASIKAN TARGET VDOT:' : 'ADJUST / SIMULATE TARGET VDOT:'}</span>
              <span className="font-bold text-slate-900 dark:text-white">{customVdot.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={25}
              max={75}
              step={0.5}
              value={customVdot}
              onChange={(e) => setCustomVdot(parseFloat(e.target.value))}
              className="w-full accent-violet-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none"
            />
          </div>
          {isCustomized && (
            <button
              onClick={() => setCustomVdot(defaultProfile.runningVo2Max)}
              className="px-2 py-1 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-[10px] font-bold text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 flex items-center gap-1 shrink-0"
              title="Reset to PR calibration"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isId ? 'RESET' : 'RESET'}</span>
            </button>
          )}
        </div>

        {/* Track vs KM Split Toggle */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#0b0f1d] p-1 border border-slate-200 dark:border-zinc-800 shrink-0">
          <button
            onClick={() => setSplitMode('km')}
            className={`px-3 py-1 text-[10px] font-black uppercase transition-colors ${
              splitMode === 'km'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isId ? 'PACE PER KM' : 'PER KM PACE'}
          </button>
          <button
            onClick={() => setSplitMode('track')}
            className={`px-3 py-1 text-[10px] font-black uppercase transition-colors ${
              splitMode === 'track'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isId ? 'SPLIT TRACK 400M' : '400M TRACK SPLITS'}
          </button>
        </div>
      </div>

      {/* 5 VDOT Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {currentPaces.map((zone) => {
          const style = zoneStyles[zone.zoneKey] || zoneStyles.E;
          return (
            <div
              key={zone.zoneKey}
              className={`bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-zinc-800 p-3.5 shadow-sm dark:shadow-[2px_2px_0px_#1e1b4b] ${style.darkBg} flex flex-col justify-between`}
            >
              <div>
                {/* Zone Identifier */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${style.text}`}>
                    {isId ? zone.nameId : zone.name}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 border font-bold ${style.badgeBg} ${style.border} ${style.text}`}>
                    {zone.zoneKey}
                  </span>
                </div>

                {/* Intensity */}
                <span className="text-[9px] text-slate-500 dark:text-zinc-400 font-bold block mt-1.5 uppercase">
                  {zone.intensityDesc}
                </span>

                {/* Target Pace */}
                <div className="my-3">
                  {splitMode === 'km' ? (
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
                        {zone.paceFormatted}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mt-0.5">
                        {isId ? 'RITME TARGET / KM' : 'TARGET PACE / KM'}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
                        {zone.split400m ? `${zone.split400m} /lap` : (zone.split1000m ? `${zone.split1000m} /km` : zone.paceFormatted)}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mt-0.5">
                        {zone.split400m ? (isId ? 'PUTARAN TRACK 400M' : '400M TRACK LAP') : '1000M SPLIT'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Purpose / Physiological Benefit */}
                <p className="text-[10px] text-slate-600 dark:text-zinc-400 font-sans leading-relaxed pt-2 border-t border-slate-200 dark:border-zinc-800/80">
                  {isId ? zone.purposeId : zone.purpose}
                </p>
              </div>

              {/* Quick Split Reference Footer */}
              {zone.split1000m && (
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800 text-[9px] text-slate-400 dark:text-zinc-500 flex justify-between">
                  <span>1000m repeat:</span>
                  <strong className="text-slate-700 dark:text-zinc-300">{zone.split1000m}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Practical Training Guidance Footer */}
      <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3 text-xs text-slate-600 dark:text-zinc-400 font-sans flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {isId
              ? 'Aturan 80/20: Jalankan 80% jarak mingguan Anda pada zona Easy (E) untuk memaksimalkan kapilarisasi otot dan mencegah cedera.'
              : '80/20 Rule: Log ~80% of your weekly volume in the Easy (E) zone to maximize mitochondrial density while preventing overuse injuries.'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 shrink-0">
          Source: Daniels’ Running Formula (3rd Ed.)
        </span>
      </div>
    </div>
  );
}
