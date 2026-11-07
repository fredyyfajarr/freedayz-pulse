'use client';

import React from 'react';
import Link from 'next/link';
import { Activity } from '@/domain/entities/Activity';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import CompareSelectorClient from './CompareSelectorClient';
import { 
  ArrowLeft, 
  GitCompare, 
  Heart, 
  Zap, 
  Timer, 
  Footprints, 
  Gauge, 
  ArrowUpDown, 
  Thermometer,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  activities: Activity[];
  runA: Activity;
  runB: Activity;
}

export default function CompareClient({ activities, runA, runB }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  // Calculate Deltas (Run B compared to Run A)
  const paceDeltaSec = (runB.avgPaceSecPerKm || 0) - (runA.avgPaceSecPerKm || 0); // negative = B is faster
  const hrDelta = (runB.avgHeartRate || 0) - (runA.avgHeartRate || 0);
  const timeDeltaSec = (runB.movingDurationSeconds || runB.durationSeconds) - (runA.movingDurationSeconds || runA.durationSeconds);
  const cadDelta = (runB.dynamics.avgCadence || 0) - (runA.dynamics.avgCadence || 0);
  const trimpDelta = (runB.relativeEffortScore || 0) - (runA.relativeEffortScore || 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-200 dark:border-violet-900/50 gap-3">
        <div>
          <Link
            href="/activities"
            className="flex items-center gap-1.5 text-xs font-black text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 uppercase tracking-widest mb-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{isId ? 'KEMBALI_KE_AKTIVITAS' : 'BACK_TO_ACTIVITIES'}</span>
          </Link>
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-[10px] px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 dark:border-cyan-600/60 text-cyan-800 dark:text-cyan-300 font-bold uppercase tracking-wider">
              {isId ? 'HEAD_TO_HEAD // TOLOK_UKUR_FISIOLOGIS' : 'HEAD_TO_HEAD // PHYSIOLOGICAL_BENCHMARK'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black italic tracking-wide text-slate-900 dark:text-white uppercase mt-1">
            {isId ? 'LAB_KOMPARASI_LARI' : 'RUN_COMPARISON_LAB'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {isId
              ? 'BEBAN KARDIO BERSANDINGAN, EFISIENSI PACE & ADAPTASI BIOMEKANIKA'
              : 'SIDE-BY-SIDE CARDIAC STRAIN, PACING EFFICIENCY & BIOMECHANICAL ADAPTATION'}
          </p>
        </div>
      </div>

      {/* Interactive Activity Selectors */}
      <CompareSelectorClient activities={activities} selectedA={runA.id} selectedB={runB.id} />

      {/* Comparison Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RUN A CARD */}
        <div className="bg-white dark:bg-[#0d1224] border-2 border-violet-500 dark:border-violet-600/80 p-5 shadow-[4px_4px_0px_#7c3aed] space-y-3 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
            <span className="text-xs font-black text-violet-700 dark:text-violet-300 uppercase tracking-wider">
              {isId ? 'SESI A (BASIS AWAL)' : 'SESSION A (BASELINE)'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">
              {new Date(runA.startTime).toLocaleDateString(isId ? 'id-ID' : 'en-US')}
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{runA.name}</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-600 dark:text-cyan-300">
              {(runA.distanceMeters / 1000).toFixed(2)} km
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">
              {PaceCalculator.formatDuration(runA.movingDurationSeconds || runA.durationSeconds)}
            </span>
          </div>
          <div className="text-xs text-slate-600 dark:text-zinc-400">
            {isId ? 'Pace Bergerak:' : 'Moving Pace:'}{' '}
            <strong className="text-slate-900 dark:text-white">
              {PaceCalculator.formatPace(runA.avgPaceSecPerKm)}
            </strong>
          </div>
        </div>

        {/* RUN B CARD */}
        <div className="bg-white dark:bg-[#0d1224] border-2 border-orange-500/80 p-5 shadow-[4px_4px_0px_#f97316] space-y-3 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
            <span className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              {isId ? 'SESI B (PEMBANDING)' : 'SESSION B (BENCHMARK)'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">
              {new Date(runB.startTime).toLocaleDateString(isId ? 'id-ID' : 'en-US')}
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{runB.name}</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-orange-600 dark:text-orange-400">
              {(runB.distanceMeters / 1000).toFixed(2)} km
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">
              {PaceCalculator.formatDuration(runB.movingDurationSeconds || runB.durationSeconds)}
            </span>
          </div>
          <div className="text-xs text-slate-600 dark:text-zinc-400">
            {isId ? 'Pace Bergerak:' : 'Moving Pace:'}{' '}
            <strong className="text-slate-900 dark:text-white">
              {PaceCalculator.formatPace(runB.avgPaceSecPerKm)}
            </strong>
          </div>
        </div>
      </div>

      {/* Detailed Side-by-Side Telemetry Table */}
      <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800 text-xs">
          <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {isId ? 'RINCIAN_SELISIH_TELEMETRI' : 'TELEMETRY_DELTA_BREAKDOWN'}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-zinc-400">
            {isId ? 'SESI B RELATIF TERHADAP SESI A' : 'SESSION B RELATIVE TO SESSION A'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-widest text-left bg-slate-50 dark:bg-[#070a14]">
                <th className="py-2.5 px-3">{isId ? 'METRIK' : 'METRIC'}</th>
                <th className="py-2.5 px-3 text-violet-700 dark:text-violet-300">
                  {isId ? 'SESI A' : 'SESSION A'}
                </th>
                <th className="py-2.5 px-3 text-orange-600 dark:text-orange-400">
                  {isId ? 'SESI B' : 'SESSION B'}
                </th>
                <th className="py-2.5 px-3 text-right">
                  {isId ? 'SELISIH (B vs A)' : 'DELTA (B vs A)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/60">
              {/* 1. Moving Pace */}
              <tr className="hover:bg-slate-50 dark:hover:bg-violet-950/20">
                <td className="py-3 px-3 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  {isId ? 'RATA-RATA PACE BERGERAK' : 'AVERAGE MOVING PACE'}
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-zinc-300 font-mono">
                  {PaceCalculator.formatPace(runA.avgPaceSecPerKm)}
                </td>
                <td className="py-3 px-3 text-slate-900 dark:text-white font-mono font-bold">
                  {PaceCalculator.formatPace(runB.avgPaceSecPerKm)}
                </td>
                <td className="py-3 px-3 text-right font-black font-mono">
                  {paceDeltaSec === 0 ? (
                    <span className="text-slate-500 dark:text-zinc-400">{isId ? 'SAMA' : 'EQUAL'}</span>
                  ) : paceDeltaSec < 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-end gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      {Math.abs(paceDeltaSec)}s {isId ? 'LEBIH CEPAT /km' : 'FASTER /km'}
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-black flex items-center justify-end gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{paceDeltaSec}s {isId ? 'LEBIH LAMBAT /km' : 'SLOWER /km'}
                    </span>
                  )}
                </td>
              </tr>

              {/* 2. Heart Rate */}
              <tr className="hover:bg-slate-50 dark:hover:bg-violet-950/20">
                <td className="py-3 px-3 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  {isId ? 'RATA-RATA DETAK JANTUNG' : 'AVERAGE HEART RATE'}
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-zinc-300 font-mono">
                  {runA.avgHeartRate ? `${runA.avgHeartRate} BPM` : '--'}
                </td>
                <td className="py-3 px-3 text-slate-900 dark:text-white font-mono font-bold">
                  {runB.avgHeartRate ? `${runB.avgHeartRate} BPM` : '--'}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold">
                  {hrDelta === 0 ? (
                    <span className="text-slate-500 dark:text-zinc-400">0 BPM</span>
                  ) : hrDelta < 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">
                      {hrDelta} BPM ({isId ? 'BEBAN LEBIH RINGAN' : 'LOWER STRAIN'})
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-black">
                      +{hrDelta} BPM ({isId ? 'BEBAN LEBIH TINGGI' : 'HIGHER STRAIN'})
                    </span>
                  )}
                </td>
              </tr>

              {/* 3. Cadence */}
              <tr className="hover:bg-slate-50 dark:hover:bg-violet-950/20">
                <td className="py-3 px-3 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-amber-500" />
                  {isId ? 'KADENSI (SPM)' : 'CADENCE (SPM)'}
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-zinc-300 font-mono">
                  {runA.dynamics.avgCadence || '--'}
                </td>
                <td className="py-3 px-3 text-slate-900 dark:text-white font-mono font-bold">
                  {runB.dynamics.avgCadence || '--'}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold">
                  {cadDelta === 0 ? (
                    <span className="text-slate-500 dark:text-zinc-400">0 SPM</span>
                  ) : cadDelta > 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{cadDelta} SPM ({isId ? 'PUTARAN LEBIH CEPAT' : 'QUICKER TURNOVER'})
                    </span>
                  ) : (
                    <span className="text-slate-500 dark:text-zinc-400">{cadDelta} SPM</span>
                  )}
                </td>
              </tr>

              {/* 4. Stride Length */}
              <tr className="hover:bg-slate-50 dark:hover:bg-violet-950/20">
                <td className="py-3 px-3 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  {isId ? 'PANJANG LANGKAH' : 'STRIDE LENGTH'}
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-zinc-300 font-mono">
                  {runA.dynamics.avgStrideLengthMeters ? `${runA.dynamics.avgStrideLengthMeters.toFixed(2)} m` : '--'}
                </td>
                <td className="py-3 px-3 text-slate-900 dark:text-white font-mono font-bold">
                  {runB.dynamics.avgStrideLengthMeters ? `${runB.dynamics.avgStrideLengthMeters.toFixed(2)} m` : '--'}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-600 dark:text-zinc-400">
                  {runA.dynamics.avgStrideLengthMeters && runB.dynamics.avgStrideLengthMeters
                    ? `${(runB.dynamics.avgStrideLengthMeters - runA.dynamics.avgStrideLengthMeters > 0 ? '+' : '') + (runB.dynamics.avgStrideLengthMeters - runA.dynamics.avgStrideLengthMeters).toFixed(2)} m`
                    : '--'}
                </td>
              </tr>

              {/* 5. Ground Contact Time */}
              <tr className="hover:bg-slate-50 dark:hover:bg-violet-950/20">
                <td className="py-3 px-3 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  {isId ? 'WAKTU KONTAK TANAH' : 'GROUND CONTACT TIME'}
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-zinc-300 font-mono">
                  {runA.dynamics.avgGroundContactTimeMs ? `${runA.dynamics.avgGroundContactTimeMs} ms` : '--'}
                </td>
                <td className="py-3 px-3 text-slate-900 dark:text-white font-mono font-bold">
                  {runB.dynamics.avgGroundContactTimeMs ? `${runB.dynamics.avgGroundContactTimeMs} ms` : '--'}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-600 dark:text-zinc-400">
                  {runA.dynamics.avgGroundContactTimeMs && runB.dynamics.avgGroundContactTimeMs
                    ? `${runB.dynamics.avgGroundContactTimeMs - runA.dynamics.avgGroundContactTimeMs > 0 ? '+' : ''}${runB.dynamics.avgGroundContactTimeMs - runA.dynamics.avgGroundContactTimeMs} ms`
                    : '--'}
                </td>
              </tr>

              {/* 6. Vertical Ratio */}
              <tr className="hover:bg-slate-50 dark:hover:bg-violet-950/20">
                <td className="py-3 px-3 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {isId ? 'RASIO VERTIKAL (PANTULAN)' : 'VERTICAL RATIO (BOUNCE)'}
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-zinc-300 font-mono">
                  {runA.dynamics.avgVerticalRatioPercent ? `${runA.dynamics.avgVerticalRatioPercent}%` : '--'}
                </td>
                <td className="py-3 px-3 text-slate-900 dark:text-white font-mono font-bold">
                  {runB.dynamics.avgVerticalRatioPercent ? `${runB.dynamics.avgVerticalRatioPercent}%` : '--'}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-600 dark:text-zinc-400">
                  {runA.dynamics.avgVerticalRatioPercent && runB.dynamics.avgVerticalRatioPercent
                    ? `${(runB.dynamics.avgVerticalRatioPercent - runA.dynamics.avgVerticalRatioPercent > 0 ? '+' : '') + (runB.dynamics.avgVerticalRatioPercent - runA.dynamics.avgVerticalRatioPercent).toFixed(1)}%`
                    : '--'}
                </td>
              </tr>

              {/* 7. Relative Effort / TRIMP */}
              <tr className="hover:bg-slate-50 dark:hover:bg-violet-950/20">
                <td className="py-3 px-3 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  {isId ? 'TOTAL BEBAN LATIHAN (TRIMP)' : 'CARDIAC RELATIVE EFFORT (TRIMP)'}
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-zinc-300 font-mono">
                  {runA.relativeEffortScore} pts
                </td>
                <td className="py-3 px-3 text-slate-900 dark:text-white font-mono font-bold">
                  {runB.relativeEffortScore} pts
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold">
                  {trimpDelta > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400">+{trimpDelta} pts</span>
                  ) : trimpDelta < 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400">{trimpDelta} pts</span>
                  ) : (
                    <span className="text-slate-500 dark:text-zinc-400">0 pts</span>
                  )}
                </td>
              </tr>

              {/* 8. Temperature */}
              <tr className="hover:bg-slate-50 dark:hover:bg-violet-950/20">
                <td className="py-3 px-3 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                  {isId ? 'SUHU LINGKUNGAN' : 'AMBIENT TEMPERATURE'}
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-zinc-300 font-mono">
                  {runA.maxTemperatureCelsius ? `${runA.minTemperatureCelsius ? `${runA.minTemperatureCelsius}°–` : ''}${runA.maxTemperatureCelsius}°C` : '--'}
                </td>
                <td className="py-3 px-3 text-slate-900 dark:text-white font-mono font-bold">
                  {runB.maxTemperatureCelsius ? `${runB.minTemperatureCelsius ? `${runB.minTemperatureCelsius}°–` : ''}${runB.maxTemperatureCelsius}°C` : '--'}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-600 dark:text-zinc-400">
                  {runA.maxTemperatureCelsius && runB.maxTemperatureCelsius
                    ? `${runB.maxTemperatureCelsius - runA.maxTemperatureCelsius > 0 ? '+' : ''}${runB.maxTemperatureCelsius - runA.maxTemperatureCelsius}°C`
                    : '--'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Physiological Takeaway & Adaptation Analysis */}
      <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-violet-800/80 p-5 space-y-2 transition-colors">
        <h3 className="font-black italic uppercase text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          {isId ? 'ANALISIS_ADAPTASI_AEROBIK' : 'AEROBIC_ADAPTATION_ANALYSIS'}
        </h3>
        <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans leading-relaxed">
          {isId
            ? (paceDeltaSec < 0 && hrDelta <= 0
                ? '🏆 Adaptasi Aerobik Positif: Sesi B diselesaikan dengan pace lebih cepat namun menjaga detak jantung sama atau lebih rendah, menandakan efisiensi stroke volume dan output kardiak yang meningkat.'
                : paceDeltaSec < 0 && hrDelta > 0
                ? '⚡ Latihan Ambang Batas / Intensitas Tinggi: Sesi B menunjukkan daya aerobik lebih tinggi (+pace lebih kencang) yang didukung pengerahan detak jantung lebih aktif.'
                : paceDeltaSec > 0 && hrDelta < 0
                ? '🌿 Lari Pemulihan / Aerobic Base: Sesi B dilakukan dengan pace lebih santai dan beban jantung lebih ringan, merangsang pemulihan mitokondria.'
                : 'Intensitas dan respons fisiologis relatif seimbang pada kedua sesi yang dievaluasi.')
            : (paceDeltaSec < 0 && hrDelta <= 0
                ? '🏆 Positive Aerobic Adaptation: Session B was completed at a faster pace while maintaining equal or lower heart rate, indicating improved cardiac output and stroke volume.'
                : paceDeltaSec < 0 && hrDelta > 0
                ? '⚡ Higher Intensity Threshold: Session B exhibited higher aerobic power (+faster pace) supported by increased cardiac recruitment.'
                : paceDeltaSec > 0 && hrDelta < 0
                ? '🌿 Aerobic Base / Recovery Run: Session B was paced more conservatively with lower cardiac strain, promoting mitochondrial recovery.'
                : 'Equal training intensity and physiological response across both evaluated sessions.')}
        </p>
      </div>
    </div>
  );
}
