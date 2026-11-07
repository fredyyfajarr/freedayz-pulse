'use client';

import React, { useMemo } from 'react';
import { MetricStreamPoint } from '@/domain/entities/ActivityDetail';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { Gauge } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  stream: MetricStreamPoint[];
  avgPaceSecPerKm: number;
}

interface PaceZoneBucket {
  index: number;
  name: string;
  code: string;
  paceRangeStr: string;
  minPaceSec: number;
  maxPaceSec: number;
  role: string;
  color: string;
  barColor: string;
  textColor: string;
  seconds: number;
  percent: number;
}

export default function PaceZonesCard({ stream, avgPaceSecPerKm }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  // Define 5 Jack Daniels VDOT Pace Zones calibrated from user's 5K PR
  const zoneBuckets = useMemo<PaceZoneBucket[]>(() => {
    // Config: lower pace seconds = faster
    const definitions = [
      {
        index: 1,
        name: isId ? 'Pemulihan / Pemanasan' : 'Recovery / Warm Up',
        code: 'Z1_REC',
        minPaceSec: 450, // > 7:30 /km
        maxPaceSec: 9999,
        paceRangeStr: '> 7:30 /km',
        role: isId
          ? 'Pemulihan aktif, pemanasan, bilasan metabolik asam laktat.'
          : 'Active recovery, warm-up, metabolic flush.',
        color: 'border-slate-600 bg-slate-900',
        barColor: 'bg-slate-400',
        textColor: 'text-slate-300',
      },
      {
        index: 2,
        name: isId ? 'Lari Santai / Basis Aerobik' : 'Easy / Aerobic Base',
        code: 'Z2_EASY',
        minPaceSec: 405, // 6:45 - 7:30 /km
        maxPaceSec: 450,
        paceRangeStr: '6:45 – 7:30 /km',
        role: isId
          ? 'Densitas mitokondria, oksidasi lemak, fondasi daya tahan stamina.'
          : 'Mitochondrial density, fat oxidation, endurance stamina.',
        color: 'border-emerald-600 bg-emerald-950',
        barColor: 'bg-emerald-500',
        textColor: 'text-emerald-400',
      },
      {
        index: 3,
        name: isId ? 'Maraton / Ritme Stabil' : 'Marathon / Steady',
        code: 'Z3_STEADY',
        minPaceSec: 375, // 6:15 - 6:45 /km
        maxPaceSec: 405,
        paceRangeStr: '6:15 – 6:45 /km',
        role: isId
          ? 'Aliran kecepatan aerobik terkontrol, penghematan glikogen otot.'
          : 'Aerobic speed flow, muscular glycogen conservation.',
        color: 'border-cyan-600 bg-cyan-950',
        barColor: 'bg-cyan-500',
        textColor: 'text-cyan-300',
      },
      {
        index: 4,
        name: isId ? 'Ambang Laktat / Tempo' : 'Threshold / Tempo',
        code: 'Z4_TEMPO',
        minPaceSec: 355, // 5:55 - 6:15 /km
        maxPaceSec: 375,
        paceRangeStr: '5:55 – 6:15 /km',
        role: isId
          ? 'Pembersihan laktat, kecepatan ambang batas, ketahanan balap sub-maksimal.'
          : 'Lactate clearance, fast cruise stamina, sub-max race pace.',
        color: 'border-amber-600 bg-amber-950',
        barColor: 'bg-amber-500',
        textColor: 'text-amber-400',
      },
      {
        index: 5,
        name: isId ? 'VO2Max / Kecepatan' : 'VO2 Max / Speed',
        code: 'Z5_SPEED',
        minPaceSec: 0, // < 5:55 /km
        maxPaceSec: 355,
        paceRangeStr: '< 5:55 /km',
        role: isId
          ? 'Konsumsi oksigen puncak, kecepatan neuromuskular & akselerasi akhir.'
          : 'Peak oxygen consumption, neuromuscular speed & finishing surge.',
        color: 'border-rose-600 bg-rose-950',
        barColor: 'bg-rose-500',
        textColor: 'text-rose-400',
      },
    ];

    if (!stream || stream.length === 0) {
      return definitions.map(d => ({ ...d, seconds: 0, percent: 0 }));
    }

    // Accumulate seconds per zone
    const timeInZone = [0, 0, 0, 0, 0]; // 0-indexed for Z1..Z5
    for (let i = 0; i < stream.length - 1; i++) {
      const p = stream[i];
      const nextP = stream[i + 1];
      const deltaSec = Math.max(1, Math.min(30, nextP.timestamp - p.timestamp));
      const pace = p.paceSecPerKm;

      if (pace && pace > 0) {
        if (pace > 450) timeInZone[0] += deltaSec;
        else if (pace >= 405) timeInZone[1] += deltaSec;
        else if (pace >= 375) timeInZone[2] += deltaSec;
        else if (pace >= 355) timeInZone[3] += deltaSec;
        else timeInZone[4] += deltaSec;
      }
    }

    const totalCalculatedSec = timeInZone.reduce((a, b) => a + b, 0);
    const denom = totalCalculatedSec > 0 ? totalCalculatedSec : 1;

    return definitions.map((d, idx) => {
      const sec = timeInZone[idx];
      const pct = Math.round((sec / denom) * 100);
      return {
        ...d,
        seconds: sec,
        percent: pct,
      };
    });
  }, [stream, isId]);

  // Find dominant zone
  const dominantZone = useMemo(() => {
    let max = zoneBuckets[0];
    for (const z of zoneBuckets) {
      if (z.seconds > max.seconds) {
        max = z;
      }
    }
    return max;
  }, [zoneBuckets]);

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] space-y-4 font-mono transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="font-black italic tracking-widest uppercase text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isId ? 'JACK_DANIELS_VDOT // WAKTU_DI_ZONA_PACE' : 'JACK_DANIELS_VDOT // TIME_IN_PACE_ZONES'}</span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
              {isId
                ? 'DISTRIBUSI WAKTU ZONA PACE METABOLIK TERKALIBRASI DARI VDOT 30.9'
                : 'METABOLIC PACE ZONE TIME DISTRIBUTION CALIBRATED FROM VDOT 30.9'}
            </p>
          </div>
        </div>

        {dominantZone && dominantZone.seconds > 0 && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[9px] text-zinc-400 uppercase">
              {isId ? 'LATIHAN DOMINAN:' : 'DOMINANT WORKOUT:'}
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 border ${dominantZone.color} ${dominantZone.textColor}`}>
              Z{dominantZone.index} {dominantZone.name.toUpperCase()} ({dominantZone.percent}%)
            </span>
          </div>
        )}
      </div>

      {/* Segmented Cumulative Visual Bar */}
      <div>
        <div className="w-full h-3 bg-slate-100 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 flex overflow-hidden">
          {zoneBuckets.map(z => (
            <div
              key={z.index}
              style={{ width: `${z.percent}%` }}
              className={`h-full ${z.barColor} transition-all duration-500`}
              title={`Z${z.index} ${z.name}: ${z.percent}% (${PaceCalculator.formatDuration(z.seconds)})`}
            ></div>
          ))}
        </div>
      </div>

      {/* 5-Zone Breakdown List */}
      <div className="space-y-2 text-xs">
        {zoneBuckets.map(z => {
          return (
            <div
              key={z.index}
              className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800/80 p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-violet-400 dark:hover:border-zinc-700 transition-colors"
            >
              {/* Left: Zone Badge & Name & Range */}
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-6 flex items-center justify-center font-black text-[10px] text-white ${z.barColor}`}>
                  Z{z.index}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{z.name}</span>
                    <span className={`text-[10px] font-bold ${z.textColor}`}>{z.paceRangeStr}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 dark:text-zinc-500 font-sans block mt-0.5">
                    {z.role}
                  </span>
                </div>
              </div>

              {/* Right: Time & Percentage */}
              <div className="flex items-center gap-3 sm:text-right shrink-0">
                <div className="w-24 bg-slate-200 dark:bg-zinc-900 h-1.5 border border-slate-300 dark:border-zinc-800 hidden md:block overflow-hidden">
                  <div
                    style={{ width: `${z.percent}%` }}
                    className={`h-full ${z.barColor}`}
                  ></div>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 dark:text-white text-xs block">
                    {PaceCalculator.formatDuration(z.seconds)}
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-zinc-400 block font-normal">
                    {z.percent}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
