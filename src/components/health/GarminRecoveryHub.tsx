'use client';

import React from 'react';
import { HealthTelemetrySnapshot } from '@/domain/entities/GarminHealthMetrics';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { 
  Heart, 
  Activity, 
  BatteryCharging, 
  Moon, 
  ShieldCheck, 
  TrendingUp, 
  Award 
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  snapshot: HealthTelemetrySnapshot;
}

export default function GarminRecoveryHub({ snapshot }: Props) {
  const { t, language } = useLanguage();
  const { dailySummary, latestHrv, vo2MaxEstimate } = snapshot;

  // Status badge for HRV
  const hrvStatus = latestHrv?.status || 'BALANCED';
  const isHrvBalanced = hrvStatus === 'BALANCED';
  const localizedHrvStatus = language === 'ID'
    ? (isHrvBalanced ? 'SEIMBANG' : 'RENDAH')
    : hrvStatus;

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 sm:p-6 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] space-y-5 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <div>
            <h3 className="font-black italic tracking-widest uppercase text-sm sm:text-base text-slate-900 dark:text-white">
              {t('recovery.hub_badge')}
            </h3>
            <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 block">
              {t('recovery.hub_sub')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-[10px] px-2 py-0.5 bg-cyan-50 dark:bg-blue-950 border border-cyan-400 dark:border-blue-600 text-cyan-700 dark:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            {t('recovery.device_stream')}
          </span>
        </div>
      </div>

      {/* Main 4 Metric Quadrants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* 1. VO2Max & VDOT Score */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-amber-500/70 dark:border-amber-600/60 p-4 shadow-[2px_2px_0px_#fde68a] dark:shadow-[2px_2px_0px_#d97706] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
              <span>{t('recovery.vdot_score')}</span>
              <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-300">
                {vo2MaxEstimate.runningVo2Max}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">{t('recovery.vdot_sub')}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950 border border-amber-400 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 font-bold inline-block mt-2">
              {language === 'ID' && vo2MaxEstimate.fitnessCategory === 'EXCELLENT' ? 'SANGAT BAIK' : vo2MaxEstimate.fitnessCategory}
            </span>
          </div>
          <p className="text-[9px] text-slate-500 dark:text-zinc-400 font-sans mt-3 border-t border-slate-200 dark:border-zinc-800/80 pt-2 leading-relaxed">
            {language === 'ID' 
              ? 'Dikalibrasi dari profil detak jantung Garmin & performa lari 5K/10K'
              : vo2MaxEstimate.source}
          </p>
        </div>

        {/* 2. HRV Overnight Status */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-cyan-500/70 dark:border-cyan-600/60 p-4 shadow-[2px_2px_0px_#bae6fd] dark:shadow-[2px_2px_0px_#06b6d4] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
              <span>{t('recovery.overnight_hrv')}</span>
              <Heart className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl font-black text-cyan-700 dark:text-cyan-300">
                {latestHrv?.lastNightAvg ?? '--'}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">{t('recovery.hrv_unit')}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] px-1.5 py-0.5 border font-bold ${
                isHrvBalanced 
                  ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-amber-100 dark:bg-amber-950 border-amber-400 dark:border-amber-500 text-amber-800 dark:text-amber-300'
              }`}>
                {localizedHrvStatus}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                {t('recovery.hrv_peak')}: <strong className="text-slate-900 dark:text-white">{latestHrv?.lastNight5MinHigh ?? '--'} ms</strong>
              </span>
            </div>
          </div>
          <div className="text-[9px] text-slate-500 dark:text-zinc-500 mt-3 border-t border-slate-200 dark:border-zinc-800/80 pt-2 flex justify-between">
            <span>{language === 'ID' ? 'BASELINE 7 HARI:' : '7-DAY BASELINE:'}</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">
              {latestHrv?.baseline ? `${latestHrv.baseline.balancedLow} – ${latestHrv.baseline.balancedUpper} ms` : '42 – 59 ms'}
            </span>
          </div>
        </div>

        {/* 3. Body Battery Telemetry */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-emerald-500/70 dark:border-emerald-600/60 p-4 shadow-[2px_2px_0px_#a7f3d0] dark:shadow-[2px_2px_0px_#10b981] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
              <span>{t('recovery.body_battery')}</span>
              <BatteryCharging className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {dailySummary?.bodyBattery.mostRecentValue ?? 33}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">/ 100</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px]">
              <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                +{dailySummary?.bodyBattery.chargedValue ?? 38} {language === 'ID' ? 'TERISI' : 'CHARGED'}
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">
                -{Math.abs(dailySummary?.bodyBattery.drainedValue ?? 10)} {language === 'ID' ? 'TERKURAS' : 'DRAINED'}
              </span>
            </div>
          </div>
          <div className="text-[9px] text-slate-500 dark:text-zinc-500 mt-3 border-t border-slate-200 dark:border-zinc-800/80 pt-2 flex justify-between">
            <span>{language === 'ID' ? 'ISI SAAT TIDUR:' : 'SLEEP RECHARGE:'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              +{dailySummary?.bodyBattery.duringSleepValue ?? 33} PTS
            </span>
          </div>
        </div>

        {/* 4. Resting HR & Recovery Sleep */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-violet-500/70 dark:border-violet-600/60 p-4 shadow-[2px_2px_0px_#ddd6fe] dark:shadow-[2px_2px_0px_#7c3aed] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
              <span>{t('recovery.resting_hr_title')}</span>
              <Moon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl font-black text-violet-700 dark:text-violet-300">
                {dailySummary?.restingHeartRate ?? 50}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">BPM</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[10px]">
              <span className="text-slate-600 dark:text-zinc-400">
                {language === 'ID' ? 'RATA-RATA 7H:' : '7-DAY AVG:'}{' '}
                <strong className="text-slate-900 dark:text-white">{dailySummary?.lastSevenDaysAvgRestingHeartRate ?? 51} BPM</strong>
              </span>
            </div>
          </div>
          <div className="text-[9px] text-slate-500 dark:text-zinc-500 mt-3 border-t border-slate-200 dark:border-zinc-800/80 pt-2 flex justify-between">
            <span>{language === 'ID' ? 'TIDUR TERCATAT:' : 'RECORDED SLEEP:'}</span>
            <span className="text-violet-700 dark:text-violet-300 font-bold">
              {dailySummary?.sleep.formattedHours ?? '5h 13m'}
            </span>
          </div>
        </div>
      </div>

      {/* Race Predictions Row based on VO2Max / VDOT */}
      <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-4 font-mono">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              {language === 'ID' ? 'PREDIKTOR_BALAPAN_VDOT // TARGET_PACE' : 'VDOT_CALIBRATED_RACE_PREDICTOR // TARGET_PACES'}
            </h4>
          </div>
          <span className="text-[9px] text-slate-500 dark:text-zinc-500">
            {language === 'ID' ? 'FORMULA FISIOLOGIS JACK DANIELS' : 'JACK DANIELS PHYSIOLOGICAL FORMULA'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {vo2MaxEstimate.racePredictions.map((pred, i) => {
            let localizedDist = pred.distanceLabel;
            if (language === 'ID') {
              if (pred.distanceLabel.includes('5K')) localizedDist = 'LOMBA 5K';
              else if (pred.distanceLabel.includes('10K')) localizedDist = 'LOMBA 10K';
              else if (pred.distanceLabel.includes('HALF')) localizedDist = 'HALF MARATHON (21.1K)';
              else if (pred.distanceLabel.includes('MARATHON')) localizedDist = 'MARATHON PENUH (42.2K)';
            }
            return (
              <div key={i} className="bg-white dark:bg-[#0a0e1c] border border-slate-200 dark:border-zinc-800/80 p-3 shadow-sm dark:shadow-none">
                <span className="text-[9px] text-slate-600 dark:text-zinc-400 uppercase block font-bold">
                  {localizedDist}
                </span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-300 mt-1 block">
                  {PaceCalculator.formatDuration(pred.predictedTimeSeconds)}
                </span>
                <span className="text-xs text-cyan-600 dark:text-cyan-400 block mt-0.5 font-bold">
                  {PaceCalculator.formatPace(pred.predictedPaceSecPerKm)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
