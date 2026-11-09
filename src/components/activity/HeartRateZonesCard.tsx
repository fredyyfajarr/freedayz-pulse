'use client';

import React from 'react';
import { HRZoneBreakdown } from '@/domain/entities/Activity';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { Heart, Zap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  zones: HRZoneBreakdown;
  aerobicTE?: number;
  anaerobicTE?: number;
  trainingEffectLabel?: string;
  customZones?: {
    zone1Min: number;
    zone1Max: number;
    zone2Min: number;
    zone2Max: number;
    zone3Min: number;
    zone3Max: number;
    zone4Min: number;
    zone4Max: number;
    zone5Min: number;
    zone5Max: number;
  };
  restingHr?: number;
  maxHr?: number;
}

export default function HeartRateZonesCard({
  zones,
  aerobicTE,
  anaerobicTE,
  trainingEffectLabel,
  customZones,
  restingHr,
  maxHr,
}: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';
  const totalSeconds = zones.totalZoneSeconds || 1;

  // Dynamic user-calibrated BPM brackets (Garmin Forerunner 165 calibration)
  const z1Min = customZones?.zone1Min ?? 126;
  const z1Max = customZones?.zone1Max ?? 144;
  const z2Min = customZones?.zone2Min ?? 145;
  const z2Max = customZones?.zone2Max ?? 162; // Dynamic 162 BPM max for Zone 2
  const z3Min = customZones?.zone3Min ?? 163;
  const z3Max = customZones?.zone3Max ?? 176;
  const z4Min = customZones?.zone4Min ?? 177;
  const z4Max = customZones?.zone4Max ?? 188;
  const z5Min = customZones?.zone5Min ?? 189;
  const z5Max = customZones?.zone5Max ?? (maxHr || 200);

  const zoneConfigs = [
    {
      num: 1,
      name: isId ? 'ZONA 1 // PEMANASAN' : 'ZONE 1 // WARM UP',
      desc: isId 
        ? `50% – 62% HRR (${z1Min} – ${z1Max} BPM) // Pemanasan & Pemulihan Aktif`
        : `50% – 62% HRR (${z1Min} – ${z1Max} BPM) // Warm-up & Recovery`,
      seconds: zones.zone1Seconds,
      percent: Math.round((zones.zone1Seconds / totalSeconds) * 100),
      color: 'bg-slate-400',
      textColor: 'text-slate-600 dark:text-slate-300',
      border: 'border-slate-500/50',
    },
    {
      num: 2,
      name: isId ? 'ZONA 2 // LARI SANTAI' : 'ZONE 2 // EASY',
      desc: isId 
        ? `63% – 75% HRR (${z2Min} – ${z2Max} BPM) // Membangun Fondasi Aerobik`
        : `63% – 75% HRR (${z2Min} – ${z2Max} BPM) // Aerobic Base Building`,
      seconds: zones.zone2Seconds,
      percent: Math.round((zones.zone2Seconds / totalSeconds) * 100),
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-500/50',
    },
    {
      num: 3,
      name: isId ? 'ZONA 3 // AEROBIK' : 'ZONE 3 // AEROBIC',
      desc: isId 
        ? `75% – 84% HRR (${z3Min} – ${z3Max} BPM) // Tempo Aliran Kardiovaskular`
        : `75% – 84% HRR (${z3Min} – ${z3Max} BPM) // Cardiovascular Tempo Flow`,
      seconds: zones.zone3Seconds,
      percent: Math.round((zones.zone3Seconds / totalSeconds) * 100),
      color: 'bg-cyan-500',
      textColor: 'text-cyan-700 dark:text-cyan-400',
      border: 'border-cyan-500/50',
    },
    {
      num: 4,
      name: isId ? 'ZONA 4 // AMBANG LAKTAT' : 'ZONE 4 // THRESHOLD',
      desc: isId 
        ? `84% – 92% HRR (${z4Min} – ${z4Max} BPM) // Ketahanan Ambang Laktat`
        : `84% – 92% HRR (${z4Min} – ${z4Max} BPM) // Lactate Threshold Stamina`,
      seconds: zones.zone4Seconds,
      percent: Math.round((zones.zone4Seconds / totalSeconds) * 100),
      color: 'bg-amber-500',
      textColor: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/50',
    },
    {
      num: 5,
      name: isId ? 'ZONA 5 // MAKSIMUM' : 'ZONE 5 // MAXIMUM',
      desc: isId 
        ? `92% – 100% HRR (${z5Min} – ${z5Max} BPM) // Kapasitas Puncak Anaerobik`
        : `92% – 100% HRR (${z5Min} – ${z5Max} BPM) // Anaerobic Peak Capacity`,
      seconds: zones.zone5Seconds,
      percent: Math.round((zones.zone5Seconds / totalSeconds) * 100),
      color: 'bg-rose-500',
      textColor: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-500/50',
    },
  ];

  const formatTrainingEffect = (label?: string) => {
    if (!label) return isId ? 'STIMULUS AEROBIK' : 'AEROBIC STIMULUS';
    const clean = label.replace(/_/g, ' ');
    if (isId) {
      if (label.includes('RECOVERY')) return 'PEMULIHAN';
      if (label.includes('MAINTAINING')) return 'MEMPERTAHANKAN';
      if (label.includes('IMPROVING')) return 'MENINGKATKAN KEBUGARAN';
      if (label.includes('IMPACTING')) return 'STIMULUS TINGGI';
      if (label.includes('AEROBIC_BASE')) return 'DASAR AEROBIK';
      if (label.includes('TEMPO')) return 'TEMPO';
    }
    return clean;
  };

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-2 border-slate-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <h3 className="font-black italic tracking-widest uppercase text-sm text-slate-900 dark:text-white">
            {isId ? 'ZONA_DETAK_JANTUNG // DISTRIBUSI_INTENSITAS' : 'HEART_RATE_ZONES // INTENSITY_DISTRIBUTION'}
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
          FORERUNNER 165 // {isId ? '%KALIBRASI_HRR' : '%HRR_CALIBRATION'}
        </span>
      </div>

      {/* Training Effect Badges */}
      {(aerobicTE !== undefined || anaerobicTE !== undefined) && (
        <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-violet-800/40 font-mono">
          <div className="border-r border-slate-200 dark:border-zinc-800 pr-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-cyan-700 dark:text-cyan-400 tracking-wider">
                {isId ? 'EFEK AEROBIK' : 'AEROBIC EFFECT'}
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {aerobicTE?.toFixed(1) ?? '--'} <span className="text-[10px] text-slate-400 dark:text-zinc-500">/ 5.0</span>
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 mt-1.5 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, ((aerobicTE || 0) / 5) * 100)}%` }}
                className="bg-cyan-500 h-full"
              ></div>
            </div>
            <span className="text-[9px] text-slate-500 dark:text-zinc-400 mt-1 block">
              {formatTrainingEffect(trainingEffectLabel)}
            </span>
          </div>

          <div className="pl-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-rose-700 dark:text-rose-400 tracking-wider">
                {isId ? 'EFEK ANAEROBIK' : 'ANAEROBIC EFFECT'}
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {anaerobicTE?.toFixed(1) ?? '0.0'} <span className="text-[10px] text-slate-400 dark:text-zinc-500">/ 5.0</span>
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 mt-1.5 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, ((anaerobicTE || 0) / 5) * 100)}%` }}
                className="bg-rose-500 h-full"
              ></div>
            </div>
            <span className="text-[9px] text-slate-500 dark:text-zinc-400 mt-1 block">
              {isId ? 'MANFAAT KECEPATAN ANAEROBIK' : 'ANAEROBIC SPEED BENEFIT'}
            </span>
          </div>
        </div>
      )}

      {/* 5 Zones Bars */}
      <div className="space-y-3 font-mono">
        {zoneConfigs.map(z => (
          <div key={z.num} className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-2.5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div>
                <span className={`font-black tracking-wider ${z.textColor}`}>
                  {z.name}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-zinc-400 block font-sans">
                  {z.desc}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {PaceCalculator.formatDuration(z.seconds)}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-zinc-400 block font-bold">
                  {z.percent}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-zinc-900 h-2 border border-slate-300 dark:border-zinc-800 overflow-hidden">
              <div
                style={{ width: `${z.percent}%` }}
                className={`h-full ${z.color} transition-all duration-500`}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
