'use client';

import React from 'react';
import { HRZoneBreakdown } from '@/domain/entities/Activity';
import { MetricStreamPoint } from '@/domain/entities/ActivityDetail';
import { HRProfileCalculator, CustomHRSettings } from '@/domain/services/HRProfileCalculator';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { Heart } from 'lucide-react';
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
  deviceName?: string;
  stream?: MetricStreamPoint[];
}

export default function HeartRateZonesCard({
  zones,
  aerobicTE,
  anaerobicTE,
  trainingEffectLabel,
  customZones,
  restingHr,
  maxHr,
  deviceName,
  stream = [],
}: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [hrSettings, setHrSettings] = React.useState<CustomHRSettings | null>(null);

  React.useEffect(() => {
    const loadSettings = () => {
      const s = HRProfileCalculator.getStoredSettings();
      setHrSettings(s);
    };
    loadSettings();

    window.addEventListener('athlete_hr_settings_updated', loadSettings);
    return () => {
      window.removeEventListener('athlete_hr_settings_updated', loadSettings);
    };
  }, []);

  const profile = React.useMemo(() => {
    return HRProfileCalculator.calculateProfile(
      [],
      restingHr,
      maxHr,
      undefined,
      customZones,
      hrSettings || undefined
    );
  }, [restingHr, maxHr, customZones, hrSettings]);

  // Dynamic seconds calculation from telemetry stream or fallback
  const calculatedZoneSeconds = React.useMemo(() => {
    if (stream && stream.length > 0) {
      const validPts = stream.filter(p => p.heartRate && p.heartRate > 30);
      if (validPts.length > 0) {
        const z1Max = profile.zones[0]?.maxBpm ?? customZones?.zone1Max ?? 144;
        const z2Max = profile.zones[1]?.maxBpm ?? customZones?.zone2Max ?? 162;
        const z3Max = profile.zones[2]?.maxBpm ?? customZones?.zone3Max ?? 176;
        const z4Max = profile.zones[3]?.maxBpm ?? customZones?.zone4Max ?? 188;

        let s1 = 0, s2 = 0, s3 = 0, s4 = 0, s5 = 0;

        for (let i = 0; i < stream.length; i++) {
          const pt = stream[i];
          if (!pt.heartRate || pt.heartRate <= 30) continue;

          let dt = 1;
          if (stream.length > 1) {
            if (i === 0) {
              dt = Math.max(1, stream[1].elapsedSeconds - pt.elapsedSeconds);
            } else {
              dt = Math.max(1, pt.elapsedSeconds - stream[i - 1].elapsedSeconds);
            }
          }

          const hr = pt.heartRate;
          if (hr <= z1Max) {
            s1 += dt;
          } else if (hr <= z2Max) {
            s2 += dt;
          } else if (hr <= z3Max) {
            s3 += dt;
          } else if (hr <= z4Max) {
            s4 += dt;
          } else {
            s5 += dt;
          }
        }

        const streamTotal = s1 + s2 + s3 + s4 + s5;
        const targetTotal = zones.totalZoneSeconds || streamTotal || 1;

        if (streamTotal > 0 && targetTotal > 0) {
          const factor = targetTotal / streamTotal;
          return {
            z1: Math.round(s1 * factor),
            z2: Math.round(s2 * factor),
            z3: Math.round(s3 * factor),
            z4: Math.round(s4 * factor),
            z5: Math.round(s5 * factor),
            total: targetTotal,
          };
        }

        return {
          z1: s1,
          z2: s2,
          z3: s3,
          z4: s4,
          z5: s5,
          total: streamTotal || 1,
        };
      }
    }

    const total = zones.totalZoneSeconds || 1;
    return {
      z1: zones.zone1Seconds,
      z2: zones.zone2Seconds,
      z3: zones.zone3Seconds,
      z4: zones.zone4Seconds,
      z5: zones.zone5Seconds,
      total,
    };
  }, [stream, profile, customZones, zones]);

  const totalCalculated = calculatedZoneSeconds.total || 1;

  const zoneConfigs = profile.zones.map(pz => {
    const zoneNum = pz.zoneIndex;
    let seconds = 0;
    if (zoneNum === 1) seconds = calculatedZoneSeconds.z1;
    else if (zoneNum === 2) seconds = calculatedZoneSeconds.z2;
    else if (zoneNum === 3) seconds = calculatedZoneSeconds.z3;
    else if (zoneNum === 4) seconds = calculatedZoneSeconds.z4;
    else if (zoneNum === 5) seconds = calculatedZoneSeconds.z5;

    const percent = Math.round((seconds / totalCalculated) * 100);

    let localizedName = '';
    let roleDesc = '';
    switch (zoneNum) {
      case 1:
        localizedName = isId ? 'ZONA 1 // PEMANASAN' : 'ZONE 1 // WARM UP';
        roleDesc = isId ? 'Pemanasan & Pemulihan Aktif' : 'Warm-up & Recovery';
        break;
      case 2:
        localizedName = isId ? 'ZONA 2 // LARI SANTAI' : 'ZONE 2 // EASY';
        roleDesc = isId ? 'Membangun Fondasi Aerobik' : 'Aerobic Base Building';
        break;
      case 3:
        localizedName = isId ? 'ZONA 3 // AEROBIK' : 'ZONE 3 // AEROBIC';
        roleDesc = isId ? 'Tempo Aliran Kardiovaskular' : 'Cardiovascular Tempo Flow';
        break;
      case 4:
        localizedName = isId ? 'ZONA 4 // AMBANG LAKTAT' : 'ZONE 4 // THRESHOLD';
        roleDesc = isId ? 'Ketahanan Ambang Laktat' : 'Lactate Threshold Stamina';
        break;
      case 5:
      default:
        localizedName = isId ? 'ZONA 5 // MAKSIMUM' : 'ZONE 5 // MAXIMUM';
        roleDesc = isId ? 'Kapasitas Puncak Anaerobik' : 'Anaerobic Peak Capacity';
        break;
    }

    let desc = '';
    if (profile.methodType === 'MANUAL_BPM') {
      desc = `${pz.minBpm} – ${pz.maxBpm} BPM // ${roleDesc}`;
    } else {
      const methodAbbr = profile.methodType === 'MAX_HR' ? 'MAX HR' : profile.methodType;
      desc = `${pz.minPercent}% – ${pz.maxPercent}% ${methodAbbr} (${pz.minBpm} – ${pz.maxBpm} BPM) // ${roleDesc}`;
    }

    let color = 'bg-slate-400';
    let textColor = 'text-slate-600 dark:text-slate-300';
    let border = 'border-slate-500/50';

    if (zoneNum === 2) {
      color = 'bg-emerald-500';
      textColor = 'text-emerald-700 dark:text-emerald-400';
      border = 'border-emerald-500/50';
    } else if (zoneNum === 3) {
      color = 'bg-cyan-500';
      textColor = 'text-cyan-700 dark:text-cyan-400';
      border = 'border-cyan-500/50';
    } else if (zoneNum === 4) {
      color = 'bg-amber-500';
      textColor = 'text-amber-700 dark:text-amber-400';
      border = 'border-amber-500/50';
    } else if (zoneNum === 5) {
      color = 'bg-rose-500';
      textColor = 'text-rose-700 dark:text-rose-400';
      border = 'border-rose-500/50';
    }

    return {
      num: zoneNum,
      name: localizedName,
      desc,
      seconds,
      percent,
      color,
      textColor,
      border,
    };
  });

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

  const getMethodBadgeText = () => {
    if (profile.methodType === 'MANUAL_BPM') {
      return isId ? 'KALIBRASI_MANUAL_BPM' : 'MANUAL_BPM_CALIBRATION';
    }
    return isId ? `%KALIBRASI_${profile.methodType}` : `%${profile.methodType}_CALIBRATION`;
  };

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-4 sm:p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] transition-colors w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-2 border-slate-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
          <h3 className="font-black italic tracking-widest uppercase text-xs sm:text-sm text-slate-900 dark:text-white truncate">
            {isId ? 'ZONA_DETAK_JANTUNG // DISTRIBUSI_INTENSITAS' : 'HEART_RATE_ZONES // INTENSITY_DISTRIBUTION'}
          </h3>
        </div>
        <span suppressHydrationWarning className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 shrink-0">
          {(deviceName || 'FORERUNNER 165').toUpperCase()} // {getMethodBadgeText()}
        </span>
      </div>

      {/* Training Effect Badges */}
      {(aerobicTE !== undefined || anaerobicTE !== undefined) && (
        <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-violet-800/40 font-mono">
          <div className="border-r border-slate-200 dark:border-zinc-800 pr-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-cyan-700 dark:text-cyan-400 tracking-wider truncate">
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
            <span className="text-[9px] text-slate-500 dark:text-zinc-400 mt-1 block truncate">
              {formatTrainingEffect(trainingEffectLabel)}
            </span>
          </div>

          <div className="pl-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-rose-700 dark:text-rose-400 tracking-wider truncate">
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
            <span className="text-[9px] text-slate-500 dark:text-zinc-400 mt-1 block truncate">
              {isId ? 'MANFAAT KECEPATAN ANAEROBIK' : 'ANAEROBIC SPEED BENEFIT'}
            </span>
          </div>
        </div>
      )}

      {/* 5 Zones Bars */}
      <div className="space-y-3 font-mono">
        {zoneConfigs.map(z => (
          <div key={z.num} className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-2.5">
            <div className="flex items-start justify-between gap-2 text-xs mb-1.5">
              <div className="min-w-0">
                <span className={`font-black tracking-wider ${z.textColor} block text-xs`}>
                  {z.name}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-zinc-400 block font-sans leading-tight mt-0.5 break-words">
                  {z.desc}
                </span>
              </div>
              <div className="text-right shrink-0">
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
