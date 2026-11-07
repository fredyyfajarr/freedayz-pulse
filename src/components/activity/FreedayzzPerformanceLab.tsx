'use client';

import React, { useMemo } from 'react';
import { Activity } from '@/domain/entities/Activity';
import { KilometerSplit, MetricStreamPoint } from '@/domain/entities/ActivityDetail';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Zap, 
  Sparkles, 
  Compass, 
  HeartCrack,
  Award,
  Layers
} from 'lucide-react';

interface Props {
  activity: Activity;
  splits: KilometerSplit[];
  stream?: MetricStreamPoint[];
  allActivities?: Activity[];
}

export default function FreedayzzPerformanceLab({
  activity,
  splits,
  stream = [],
  allActivities = [],
}: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';
  // 1. Negative Split Analysis (1st Half vs 2nd Half)
  const pacingAnalysis = useMemo(() => {
    if (!splits || splits.length < 2) return null;

    const midIndex = Math.floor(splits.length / 2);
    const firstHalfSplits = splits.slice(0, midIndex);
    const secondHalfSplits = splits.slice(midIndex);

    const firstHalfDistM = firstHalfSplits.reduce((acc, s) => acc + s.distanceMeters, 0);
    const firstHalfDurS = firstHalfSplits.reduce((acc, s) => acc + s.durationSeconds, 0);
    const firstHalfPace = firstHalfDistM > 0 ? Math.round(firstHalfDurS / (firstHalfDistM / 1000)) : 0;
    const firstHalfHRs = firstHalfSplits.map(s => s.avgHeartRate).filter((h): h is number => typeof h === 'number' && h > 0);
    const firstHalfAvgHR = firstHalfHRs.length > 0 ? Math.round(firstHalfHRs.reduce((a, b) => a + b, 0) / firstHalfHRs.length) : 0;

    const secondHalfDistM = secondHalfSplits.reduce((acc, s) => acc + s.distanceMeters, 0);
    const secondHalfDurS = secondHalfSplits.reduce((acc, s) => acc + s.durationSeconds, 0);
    const secondHalfPace = secondHalfDistM > 0 ? Math.round(secondHalfDurS / (secondHalfDistM / 1000)) : 0;
    const secondHalfHRs = secondHalfSplits.map(s => s.avgHeartRate).filter((h): h is number => typeof h === 'number' && h > 0);
    const secondHalfAvgHR = secondHalfHRs.length > 0 ? Math.round(secondHalfHRs.reduce((a, b) => a + b, 0) / secondHalfHRs.length) : 0;

    const paceDiffSec = secondHalfPace - firstHalfPace; // Negative number = faster 2nd half (negative split!)
    const isNegativeSplit = paceDiffSec <= -2;
    const isEvenSplit = Math.abs(paceDiffSec) < 2;

    // Aerobic Decoupling (Pw:Hr or Pace:HR cardiac drift)
    let aerobicDriftPct: number | null = null;
    if (firstHalfPace > 0 && secondHalfPace > 0 && firstHalfAvgHR > 0 && secondHalfAvgHR > 0) {
      const speed1 = 1000 / firstHalfPace;
      const speed2 = 1000 / secondHalfPace;
      const ef1 = speed1 / firstHalfAvgHR;
      const ef2 = speed2 / secondHalfAvgHR;
      const rawDrift = ((ef1 - ef2) / ef1) * 100;
      aerobicDriftPct = Math.round(rawDrift * 10) / 10;
    }

    return {
      firstHalfPace,
      firstHalfAvgHR,
      secondHalfPace,
      secondHalfAvgHR,
      paceDiffSec,
      isNegativeSplit,
      isEvenSplit,
      aerobicDriftPct,
    };
  }, [splits]);

  // 1.5 Pacing Consistency & Variability Index
  const consistencyStats = useMemo(() => {
    if (!splits || splits.length < 2) return null;
    const paces = splits.map(s => s.paceSecPerKm).filter(p => p > 0);
    if (paces.length < 2) return null;

    const meanPace = paces.reduce((a, b) => a + b, 0) / paces.length;
    const variance = paces.reduce((acc, p) => acc + Math.pow(p - meanPace, 2), 0) / paces.length;
    const stdDevSec = Math.round(Math.sqrt(variance));
    const cv = stdDevSec / meanPace;
    const scorePct = Math.max(50, Math.min(99, Math.round(100 - (cv * 120))));

    let label = isId ? 'KONSISTEN / STABIL METRONIK' : 'METRONOMIC STEADY';
    let color = 'text-emerald-400';
    if (scorePct < 88) {
      label = isId ? 'LONJAKAN / KURANG KONSISTEN' : 'SURGING / INCONSISTENT';
      color = 'text-amber-400';
    } else if (scorePct < 94) {
      label = isId ? 'VARIASI TERKONTROL' : 'CONTROLLED VARIANCE';
      color = 'text-cyan-300';
    }

    return {
      scorePct,
      stdDevSec,
      label,
      color,
    };
  }, [splits, isId]);

  // 2. Grade Adjusted Pace (GAP) Summary
  const gapAnalysis = useMemo(() => {
    if (!stream || stream.length === 0) return null;
    const validGAPs = stream
      .map(p => (p.gradeAdjustedSpeedMps && p.gradeAdjustedSpeedMps > 1.0 ? Math.round(1000 / p.gradeAdjustedSpeedMps) : null))
      .filter((g): g is number => typeof g === 'number' && g >= 160 && g <= 720);
    
    if (validGAPs.length === 0) return null;
    const avgGAP = Math.round(validGAPs.reduce((a, b) => a + b, 0) / validGAPs.length);
    const rawPace = activity.avgPaceSecPerKm;
    const hillCostSec = Math.round(rawPace - avgGAP);

    return {
      avgGAP,
      rawPace,
      hillCostSec,
    };
  }, [stream, activity.avgPaceSecPerKm]);

  // 3. Matched Runs (Comparing with similar past runs)
  const matchedRuns = useMemo(() => {
    if (!allActivities || allActivities.length <= 1) return null;
    const distKm = activity.distanceMeters / 1000;
    const similar = allActivities.filter(a => {
      if (a.id === activity.id) return false;
      const aDistKm = a.distanceMeters / 1000;
      return Math.abs(aDistKm - distKm) / distKm <= 0.15 && a.avgPaceSecPerKm > 0;
    });

    if (similar.length === 0) return null;
    const avgSimilarPace = Math.round(similar.reduce((a, b) => a + b.avgPaceSecPerKm, 0) / similar.length);
    const paceDelta = avgSimilarPace - activity.avgPaceSecPerKm;

    return {
      count: similar.length,
      avgSimilarPace,
      paceDelta,
    };
  }, [allActivities, activity]);

  // 4. Relative Effort Tier
  const relativeEffortTier = useMemo(() => {
    const score = activity.relativeEffortScore || 0;
    if (score >= 150) return { label: isId ? 'BEBAN PUNCAK MAKSIMAL' : 'PEAK EXERTION', color: 'text-rose-400', border: 'border-rose-500' };
    if (score >= 90) return { label: isId ? 'INTENSITAS TINGGI' : 'HIGH STRAIN', color: 'text-amber-400', border: 'border-amber-500' };
    if (score >= 45) return { label: isId ? 'PRODUKTIF AEROBIK' : 'AEROBIC PRODUCTIVE', color: 'text-cyan-400', border: 'border-cyan-500' };
    return { label: isId ? 'PEMULIHAN AKTIF' : 'ACTIVE RECOVERY', color: 'text-emerald-400', border: 'border-emerald-500' };
  }, [activity.relativeEffortScore, isId]);

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] space-y-4 font-mono transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <div>
            <h3 className="font-black italic tracking-widest uppercase text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isId ? 'FREEDAYZZ // LAB_PERFORMA' : 'FREEDAYZZ // PERFORMANCE_LAB'}</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-700 text-violet-800 dark:text-violet-300 font-bold uppercase not-italic">
                {isId ? 'MESIN_TELEMETRI' : 'TELEMETRY_ENGINE'}
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
              {isId ? 'EKSEKUSI PACE, GRADE ADJUSTED PACE & ANALISIS KOPEL JANTUNG' : 'PACING EXECUTION, GRADE ADJUSTED PACE & CARDIAC COUPLING ANALYSIS'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {consistencyStats && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                {isId ? 'IQ PACING:' : 'PACING IQ:'}
              </span>
              <span className={`text-xs font-black ${consistencyStats.color} px-2 py-0.5 bg-slate-50 dark:bg-[#070a14] border border-cyan-400 dark:border-cyan-800`}>
                {consistencyStats.scorePct}% // {consistencyStats.label} (±{consistencyStats.stdDevSec}s)
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">
              {isId ? 'BEBAN RELATIF:' : 'RELATIVE EFFORT:'}
            </span>
            <span className={`text-xs font-black ${relativeEffortTier.color} px-2 py-0.5 bg-slate-50 dark:bg-[#070a14] border ${relativeEffortTier.border}`}>
              {activity.relativeEffortScore} PTS // {relativeEffortTier.label}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of 3 Telemetry Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Pillar 1: Negative Split & Pacing Execution */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-cyan-400 dark:border-cyan-800/80 p-3.5 shadow-sm dark:shadow-[2px_2px_0px_#06b6d4] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-2">
              <span className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                {isId ? 'STRATEGI SPLIT' : 'SPLIT STRATEGY'}
              </span>
              {pacingAnalysis && (
                <span className={`text-[8px] font-black px-1.5 py-0.2 uppercase ${
                  pacingAnalysis.isNegativeSplit 
                    ? 'bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300'
                    : pacingAnalysis.isEvenSplit
                    ? 'bg-blue-100 dark:bg-blue-950 border border-blue-400 dark:border-blue-500 text-blue-800 dark:text-blue-300'
                    : 'bg-amber-100 dark:bg-amber-950 border border-amber-400 dark:border-amber-500 text-amber-800 dark:text-amber-300'
                }`}>
                  {pacingAnalysis.isNegativeSplit 
                    ? (isId ? 'SPLIT NEGATIF' : 'NEGATIVE SPLIT') 
                    : pacingAnalysis.isEvenSplit 
                    ? (isId ? 'PACING KONSISTEN' : 'EVEN PACING') 
                    : (isId ? 'SPLIT POSITIF' : 'POSITIVE SPLIT')}
                </span>
              )}
            </div>

            {pacingAnalysis ? (
              <div className="space-y-2 mt-2 text-xs">
                <div className="flex items-center justify-between bg-white dark:bg-[#0b0f1d] p-2 border border-slate-200 dark:border-zinc-800">
                  <span className="text-slate-600 dark:text-zinc-400 text-[10px]">
                    {isId ? 'PARUH AWAL (1/2):' : '1ST HALF:'}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">{PaceCalculator.formatPace(pacingAnalysis.firstHalfPace)}</span>
                    {pacingAnalysis.firstHalfAvgHR > 0 && (
                      <span className="text-[9px] text-rose-600 dark:text-rose-400 ml-1.5 font-normal">({pacingAnalysis.firstHalfAvgHR} bpm)</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white dark:bg-[#0b0f1d] p-2 border border-slate-200 dark:border-zinc-800">
                  <span className="text-slate-600 dark:text-zinc-400 text-[10px]">
                    {isId ? 'PARUH AKHIR (2/2):' : '2ND HALF:'}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-cyan-600 dark:text-cyan-300">{PaceCalculator.formatPace(pacingAnalysis.secondHalfPace)}</span>
                    {pacingAnalysis.secondHalfAvgHR > 0 && (
                      <span className="text-[9px] text-rose-600 dark:text-rose-400 ml-1.5 font-normal">({pacingAnalysis.secondHalfAvgHR} bpm)</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-[10px] text-slate-400 dark:text-zinc-500">
                {isId ? 'BUTUH MINIMAL 2 SPLIT UNTUK PERBANDINGAN' : 'NEED 2+ SPLITS FOR HALVES COMPARISON'}
              </div>
            )}
          </div>

          {pacingAnalysis && (
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800 text-[10px]">
              {pacingAnalysis.isNegativeSplit ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {isId 
                    ? `Lari ${Math.abs(pacingAnalysis.paceDiffSec)}s/km lebih cepat di paruh akhir!`
                    : `Ran ${Math.abs(pacingAnalysis.paceDiffSec)}s/km faster in 2nd half!`}
                </span>
              ) : pacingAnalysis.isEvenSplit ? (
                <span className="text-cyan-600 dark:text-cyan-300 font-bold">
                  {isId ? 'Pacing sangat stabil metronik (variasi di bawah 2s/km)' : 'Metronomic pacing (within 2s/km variation)'}
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-normal flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  {isId 
                    ? `Memulai ${pacingAnalysis.paceDiffSec}s/km lebih cepat di paruh awal`
                    : `Started ${pacingAnalysis.paceDiffSec}s/km faster in 1st half`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pillar 2: Grade Adjusted Pace (GAP) Analysis */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-purple-400 dark:border-purple-800/80 p-3.5 shadow-sm dark:shadow-[2px_2px_0px_#a855f7] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-2">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                GRADE ADJUSTED PACE (GAP)
              </span>
              <span className="text-[8px] font-bold px-1 py-0.2 bg-purple-100 dark:bg-purple-950 border border-purple-400 dark:border-purple-600 text-purple-800 dark:text-purple-300 uppercase">
                {isId ? 'EKUIVALEN DATAR' : 'FLAT EQUIVALENT'}
              </span>
            </div>

            {gapAnalysis ? (
              <div className="space-y-2 mt-2 text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-300">
                    {PaceCalculator.formatPace(gapAnalysis.avgGAP)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal">
                    {isId ? 'AKTUAL:' : 'RAW:'} <strong className="text-slate-900 dark:text-white">{PaceCalculator.formatPace(gapAnalysis.rawPace)}</strong>
                  </span>
                </div>

                <div className="bg-white dark:bg-[#0b0f1d] p-2 border border-slate-200 dark:border-zinc-800 text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-zinc-400">{isId ? 'Beban Kontur:' : 'Terrain Cost:'}</span>
                    <strong className={gapAnalysis.hillCostSec > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                      {gapAnalysis.hillCostSec > 0 
                        ? (isId ? `+${gapAnalysis.hillCostSec}s/km beban tanjakan` : `+${gapAnalysis.hillCostSec}s/km hill resistance`)
                        : (isId ? `${gapAnalysis.hillCostSec}s/km bantuan turunan` : `${gapAnalysis.hillCostSec}s/km downhill aid`)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-zinc-400 text-[9px]">
                    <span>{isId ? 'Elevasi Didapat:' : 'Elevation Gain:'}</span>
                    <span className="text-slate-900 dark:text-white">+{activity.elevationGainMeters}m</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-[10px] text-slate-400 dark:text-zinc-500">
                {isId ? 'TIDAK ADA DATA STREAM ELEVASI' : 'NO GRADE STREAM RECORDED'}
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400">
            {isId 
              ? 'Upaya ternormalisasi pada rute datar dengan memperhitungkan kemiringan tanjakan & turunan.'
              : 'Normalized flat-terrain effort factoring in incline & descent gradients.'}
          </div>
        </div>

        {/* Pillar 3: Aerobic Decoupling & Matched Runs Progress */}
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-rose-400 dark:border-rose-800/80 p-3.5 shadow-sm dark:shadow-[2px_2px_0px_#f43f5e] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-2">
              <span className="flex items-center gap-1">
                <HeartCrack className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                {isId ? 'DECOUPLING AEROBIK (PW:HR)' : 'AEROBIC DECOUPLING (PW:HR)'}
              </span>
              <span className="text-[8px] font-bold px-1 py-0.2 bg-rose-100 dark:bg-rose-950 border border-rose-400 dark:border-rose-600 text-rose-800 dark:text-rose-300 uppercase">
                {isId ? 'DRIFT JANTUNG' : 'CARDIAC DRIFT'}
              </span>
            </div>

            {pacingAnalysis?.aerobicDriftPct !== null && pacingAnalysis?.aerobicDriftPct !== undefined ? (
              <div className="space-y-2 mt-2">
                <div className="flex items-baseline justify-between">
                  <span className={`text-2xl font-black ${pacingAnalysis.aerobicDriftPct < 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {pacingAnalysis.aerobicDriftPct > 0 ? `+${pacingAnalysis.aerobicDriftPct}%` : `${pacingAnalysis.aerobicDriftPct}%`}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                    {pacingAnalysis.aerobicDriftPct < 5 
                      ? (isId ? 'BASIS STABIL (< 5%)' : 'STABLE BASE (< 5%)')
                      : (isId ? 'DRIFT MENINGKAT (> 5%)' : 'DRIFT ELEVATED (> 5%)')}
                  </span>
                </div>

                <div className="bg-white dark:bg-[#0b0f1d] p-2 border border-slate-200 dark:border-zinc-800 text-[10px] text-slate-700 dark:text-zinc-300">
                  {pacingAnalysis.aerobicDriftPct < 5 ? (
                    <span className="text-emerald-700 dark:text-emerald-300">
                      {isId 
                        ? 'Fondasi aerobik solid: Denyut jantung sinkron stabil terhadap kecepatan lari.'
                        : 'Solid aerobic base: Heart rate remained synchronized with running pace.'}
                    </span>
                  ) : (
                    <span className="text-rose-700 dark:text-rose-300">
                      {isId 
                        ? 'Cardiac drift terdeteksi: Denyut jantung naik relatif terhadap kecepatan di paruh akhir.'
                        : 'Cardiac drift detected: Heart rate increased relative to speed in 2nd half.'}
                    </span>
                  )}
                </div>
              </div>
            ) : matchedRuns ? (
              <div className="space-y-2 mt-2">
                <div className="text-xs text-slate-600 dark:text-zinc-400">
                  {isId ? 'DIBANDINGKAN DENGAN' : 'COMPARED TO'} <strong className="text-slate-900 dark:text-white">{matchedRuns.count} {isId ? 'SESI SERUPA' : 'MATCHED RUNS'}</strong>:
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-cyan-600 dark:text-cyan-300">
                    {matchedRuns.paceDelta >= 0 ? `+${Math.round(matchedRuns.paceDelta)}s` : `${Math.round(matchedRuns.paceDelta)}s`}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {matchedRuns.paceDelta >= 0 ? (isId ? 'LEBIH CEPAT / KM' : 'FASTER PER KM') : (isId ? 'LEBIH LAMBAT / KM' : 'SLOWER PER KM')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-[10px] text-slate-400 dark:text-zinc-500">
                {isId ? 'MENGEVALUASI FONDASI KARDIO...' : 'EVALUATING CARDIAC BASE...'}
              </div>
            )}
          </div>

          {matchedRuns && (
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800 text-[10px] flex items-center justify-between text-slate-500 dark:text-zinc-400">
              <span>{isId ? 'Rata-rata 5K Serupa:' : 'Matched 5K Avg:'}</span>
              <strong className="text-slate-900 dark:text-white">{PaceCalculator.formatPace(matchedRuns.avgSimilarPace)}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}