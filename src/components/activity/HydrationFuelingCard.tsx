'use client';

import React from 'react';
import { Activity } from '@/domain/entities/Activity';
import { useLanguage } from '@/context/LanguageContext';
import { Droplet, Flame, Zap, ShieldAlert, Sparkles, CheckCircle2, BatteryCharging } from 'lucide-react';

interface Props {
  activity: Activity;
}

export default function HydrationFuelingCard({ activity }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const durationHours = (activity.movingDurationSeconds || activity.durationSeconds || 0) / 3600;
  const avgHR = activity.avgHeartRate || 145;
  const tempCelsius = activity.maxTemperatureCelsius ?? activity.minTemperatureCelsius ?? 28;
  const calories = activity.calories || Math.round(activity.distanceMeters * 0.065);

  // 1. ACSM Empirical Sweat Loss Estimation
  // Base rate ~750 mL/hr + heat factor (+25mL/hr per °C > 20°C) + cardiac factor (+6mL/hr per bpm > 130 bpm)
  const heatDelta = Math.max(0, tempCelsius - 20);
  const hrDelta = Math.max(0, avgHR - 130);
  const sweatRateMlPerHour = Math.round(750 + heatDelta * 25 + hrDelta * 6);
  const totalSweatLossMl = Math.round(sweatRateMlPerHour * durationHours);

  // 2. ACSM Post-Run Rehydration Target (150% of fluid loss to account for urine output)
  const rehydrationTargetMl = Math.round(totalSweatLossMl * 1.5);

  // 3. Sodium / Electrolyte Loss (Average 700 mg Sodium per Liter sweat)
  const sodiumLossMg = Math.round((totalSweatLossMl / 1000) * 720);

  // 4. Glycogen Depletion & Carbohydrate Replenishment
  // Endurance running burns ~60-80% carbs depending on HR intensity.
  const carbCalories = calories * (avgHR > 155 ? 0.8 : avgHR > 140 ? 0.7 : 0.6);
  const carbsBurnedGrams = Math.round(carbCalories / 4);
  const immediateCarbWindowGrams = Math.min(80, Math.max(30, Math.round(carbsBurnedGrams * 0.45)));

  // Dehydration Risk Level
  const bodyWeightKg = 65; // standard adult calibration
  const dehydrationPct = ((totalSweatLossMl / 1000) / bodyWeightKg) * 100;
  const isHighDehydration = dehydrationPct >= 2.0;
  const isModerateDehydration = dehydrationPct >= 1.2 && dehydrationPct < 2.0;

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-cyan-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#083344] transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-2 border-slate-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2">
          <Droplet className="w-4 h-4 text-cyan-400" />
          <h3 className="font-black italic tracking-widest uppercase text-sm text-slate-900 dark:text-white">
            {isId ? 'PROTOKOL_HIDRASI_&_NUTRISI // RECOVERY_FUELING' : 'HYDRATION_&_FUELING_LAB // RECOVERY_ADVISOR'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-300 font-bold">
            ACSM_SPORTS_SCIENCE
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 border font-bold uppercase ${
            isHighDehydration
              ? 'bg-rose-100 dark:bg-rose-950 border-rose-400 dark:border-rose-500 text-rose-800 dark:text-rose-300'
              : isModerateDehydration
              ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 dark:border-amber-500 text-amber-800 dark:text-amber-300'
              : 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300'
          }`}>
            {isHighDehydration
              ? (isId ? 'DEHIDRASI TINGGI (>2%)' : 'HIGH DEHYDRATION (>2%)')
              : isModerateDehydration
              ? (isId ? 'DEHIDRASI SEDANG' : 'MODERATE LOSS')
              : (isId ? 'STATUS CAIRAN AMAN' : 'HYDRATION OPTIMAL')}
          </span>
        </div>
      </div>

      {/* Main Stats Grid: 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {/* Estimated Sweat Loss */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-cyan-600/50 p-3 shadow-sm dark:shadow-[2px_2px_0px_#083344]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {isId ? 'ESTIMASI KERINGAT' : 'EST. SWEAT LOSS'}
            </span>
            <Droplet className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {(totalSweatLossMl / 1000).toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">LITERS</span>
          </div>
          <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold block">
            ~{sweatRateMlPerHour} mL / {isId ? 'JAM' : 'HR'} (@ {tempCelsius}°C)
          </span>
        </div>

        {/* 150% Rehydration Target */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-blue-600/50 p-3 shadow-sm dark:shadow-[2px_2px_0px_#1e3a8a]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {isId ? 'TARGET CAIRAN (150%)' : 'REHYDRATION FLUID'}
            </span>
            <BatteryCharging className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {rehydrationTargetMl.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">mL</span>
          </div>
          <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold block">
            {isId ? 'MINUM DALAM 2-4 JAM' : 'CONSUME OVER 2-4 HOURS'}
          </span>
        </div>

        {/* Sodium Replenishment */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-amber-600/50 p-3 shadow-sm dark:shadow-[2px_2px_0px_#78350f]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {isId ? 'ELEKTROLIT / SODIUM' : 'SODIUM DEFICIT'}
            </span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              ~{sodiumLossMg}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">MG Na+</span>
          </div>
          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold block">
            {isId ? 'CEGAH HIPONATREMIA & KRAM' : 'PREVENT CRAMPS & FATIGUE'}
          </span>
        </div>

        {/* Carbohydrate Replenishment */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-emerald-600/50 p-3 shadow-sm dark:shadow-[2px_2px_0px_#064e3b]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {isId ? 'ISI GLIKOGEN (30M)' : '30-MIN CARB WINDOW'}
            </span>
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {immediateCarbWindowGrams}–{immediateCarbWindowGrams + 20}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">GRAMS</span>
          </div>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block">
            {isId ? 'DARI TOTAL ~' : 'TOTAL BURNED ~'}{carbsBurnedGrams}g {isId ? 'KARBO' : 'CARBS'}
          </span>
        </div>
      </div>

      {/* Actionable Advice & Race-Day Strategy */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Post-Run Rehydration Protocol */}
        <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold pb-1 border-b border-slate-200 dark:border-zinc-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] uppercase tracking-wider">
              {isId ? 'PROTOKOL PEMULIHAN CAIRAN PASCA LARI' : 'POST-RUN REHYDRATION STRATEGY'}
            </span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-zinc-300 font-sans">
            <li className="flex items-start gap-1.5">
              <span className="text-cyan-500 font-bold">1.</span>
              <span>
                {isId
                  ? `Minum bertahap 250-300 mL air/larutan elektrolit setiap 30 menit hingga tercapai target ${rehydrationTargetMl} mL.`
                  : `Sip 250-300 mL of water/isotonic fluid every 30 mins until the ${rehydrationTargetMl} mL target is reached.`}
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-500 font-bold">2.</span>
              <span>
                {isId
                  ? `Tambahkan garam dapur / minuman isotonik (~${sodiumLossMg} mg sodium) agar air diserap plasma darah dan tidak langsung terbuang sebagai urine.`
                  : `Pair fluids with electrolytes (~${sodiumLossMg} mg sodium) so water enters plasma volume rather than triggering rapid urination.`}
              </span>
            </li>
          </ul>
        </div>

        {/* In-Run Fueling Blueprint for Next Long Run */}
        <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold pb-1 border-b border-slate-200 dark:border-zinc-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] uppercase tracking-wider">
              {isId ? 'BLUEPRINT FUELING SESI LONG RUN BERIKUTNYA' : 'NEXT LONG RUN FUELING BLUEPRINT'}
            </span>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-zinc-300 font-sans">
            <div className="flex items-center justify-between text-[10px] font-mono bg-white dark:bg-[#0b0f1d] px-2 py-1 border border-slate-200 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400">{isId ? 'INTAKE GEL ENERGI:' : 'ENERGY GEL CADENCE:'}</span>
              <strong className="text-emerald-600 dark:text-emerald-400">1 GEL (25-30g) {isId ? 'TIAP 40-45 MENIT' : 'EVERY 40-45 MIN'}</strong>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono bg-white dark:bg-[#0b0f1d] px-2 py-1 border border-slate-200 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400">{isId ? 'MINUM AIR SAAT LARI:' : 'ON-COURSE SIPS:'}</span>
              <strong className="text-cyan-600 dark:text-cyan-400">150–200 mL {isId ? 'TIAP 20 MENIT' : 'EVERY 20 MIN'}</strong>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 italic pt-0.5">
              {isId
                ? 'Untuk sesi di atas 60 menit, konsumsi karbohidrat intra-lari mencegah "bonking" dan menjaga kadar gula darah stabil.'
                : 'For runs over 60 mins, in-run carbohydrate intake prevents bonking and maintains steady muscular output.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
