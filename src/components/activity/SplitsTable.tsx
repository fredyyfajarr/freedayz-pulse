'use client';

import React, { useState } from 'react';
import { KilometerSplit } from '@/domain/entities/ActivityDetail';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { Layers, Mountain, Heart, Footprints, X, Trophy } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  splits: KilometerSplit[];
}

export default function SplitsTable({ splits }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';
  const [selectedSplit, setSelectedSplit] = useState<KilometerSplit | null>(null);

  if (!splits || splits.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-6 text-center text-slate-400 dark:text-zinc-500 font-mono text-xs">
        {isId ? 'TIDAK_ADA_DATA_SPLIT_TERSEDIA' : 'NO_SPLIT_DATA_AVAILABLE'}
      </div>
    );
  }

  // Find min (fastest) and max (slowest) pace for dynamic scaling
  const paces = splits.map(s => s.paceSecPerKm).filter(p => p > 0);
  const minPace = paces.length > 0 ? Math.min(...paces) : 300;
  const maxPace = paces.length > 0 ? Math.max(...paces) : 600;

  // Calculate overall average pace
  const totalSec = splits.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalDistM = splits.reduce((acc, s) => acc + s.distanceMeters, 0);
  const avgPaceSec = totalDistM > 0 ? totalSec / (totalDistM / 1000) : (minPace + maxPace) / 2;

  // Calculate split pacing trend (negative vs positive split)
  const midIndex = Math.floor(splits.length / 2);
  const firstHalfPaces = splits.slice(0, midIndex).map(s => s.paceSecPerKm).filter(p => p > 0);
  const secondHalfPaces = splits.slice(midIndex).map(s => s.paceSecPerKm).filter(p => p > 0);
  const avg1st = firstHalfPaces.length > 0 ? firstHalfPaces.reduce((a, b) => a + b, 0) / firstHalfPaces.length : 0;
  const avg2nd = secondHalfPaces.length > 0 ? secondHalfPaces.reduce((a, b) => a + b, 0) / secondHalfPaces.length : 0;
  const isNegativeSplit = avg1st > 0 && avg2nd > 0 && avg2nd < avg1st - 1.5;

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-2 border-slate-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h3 className="font-black italic tracking-widest uppercase text-sm text-slate-900 dark:text-white">
            {isId ? 'SPLIT_KILOMETER // EFISIENSI_PACE' : 'KILOMETER_SPLITS // PACING_EFFICIENCY'}
          </h3>
          {splits.length >= 2 && (
            <span className={`text-[9px] font-mono px-2 py-0.5 border font-bold uppercase ${
              isNegativeSplit
                ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950 border-amber-400 text-amber-800 dark:text-amber-300'
            }`}>
              {isNegativeSplit 
                ? (isId ? 'SPLIT NEGATIF (PARUH KEDUA LEBIH CEPAT)' : 'NEGATIVE SPLIT (FASTER 2ND HALF)') 
                : (isId ? 'SPLIT POSITIF' : 'POSITIVE SPLIT')}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
          {isId ? 'TOTAL:' : 'TOTAL:'} {splits.length} {isId ? 'SPLIT' : 'SPLITS'} &bull; {isId ? 'RATA-RATA' : 'AVG'} {PaceCalculator.formatPace(Math.round(avgPaceSec))}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b-2 border-slate-200 dark:border-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-widest text-left">
              <th className="py-2.5 px-3">KM</th>
              <th className="py-2.5 px-3">{isId ? 'JARAK' : 'DISTANCE'}</th>
              <th className="py-2.5 px-3">{isId ? 'WAKTU' : 'TIME'}</th>
              <th className="py-2.5 px-3">PACE</th>
              <th className="py-2.5 px-3 hidden sm:table-cell">{isId ? 'GRAFIK PACE' : 'PACE BAR'}</th>
              <th className="py-2.5 px-3 text-right">{isId ? 'ELEVASI' : 'ELEVATION'}</th>
              <th className="py-2.5 px-3 text-right">{isId ? 'HR RATA-RATA' : 'AVG HR'}</th>
              <th className="py-2.5 px-3 text-right hidden md:table-cell">{isId ? 'KADENSI' : 'CADENCE'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
            {splits.map(s => {
              const isFastest = s.paceSecPerKm === minPace && splits.length > 1;

              // Dynamic Pace Bar: 25% (slowest) to 100% (fastest)
              const paceFraction = maxPace > minPace ? (maxPace - s.paceSecPerKm) / (maxPace - minPace) : 0.75;
              const paceBarWidth = Math.max(25, Math.min(100, Math.round(25 + paceFraction * 75)));
              const isFasterThanAvg = s.paceSecPerKm <= avgPaceSec;

              return (
                <tr
                  key={s.splitNumber}
                  onClick={() => setSelectedSplit(s)}
                  className="hover:bg-slate-50 dark:hover:bg-violet-950/40 cursor-pointer transition-colors group"
                >
                  {/* KM */}
                  <td className="py-3 px-3 font-black text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-[10px] text-slate-900 dark:text-white font-bold">
                        {s.splitNumber}
                      </span>
                      {isFastest && (
                        <span className="text-[9px] px-1 py-0.5 bg-amber-100 dark:bg-amber-950 border border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-300 font-bold flex items-center gap-0.5">
                          <Trophy className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                          {isId ? 'TERCEPAT' : 'FASTEST'}
                        </span>
                      )}
                    </span>
                  </td>

                  {/* Recorded Distance */}
                  <td className="py-3 px-3 font-bold text-slate-700 dark:text-zinc-300">
                    {(s.distanceMeters / 1000).toFixed(2)} km
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                      {s.distanceMeters.toLocaleString()} m
                    </span>
                  </td>

                  {/* Split Duration */}
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {PaceCalculator.formatDuration(s.durationSeconds)}
                  </td>

                  {/* Pace */}
                  <td className="py-3 px-3 font-black text-cyan-700 dark:text-cyan-300">
                    {PaceCalculator.formatPace(s.paceSecPerKm)}
                  </td>

                  {/* Clean Dynamic Pace Bar */}
                  <td className="py-3 px-3 hidden sm:table-cell">
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2.5 max-w-[150px] rounded-xs overflow-hidden p-0.5 border border-slate-300 dark:border-zinc-700/80">
                      <div
                        style={{ width: `${paceBarWidth}%` }}
                        className={`h-full rounded-xs transition-all duration-300 ${
                          isFastest
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            : isFasterThanAvg
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                            : 'bg-gradient-to-r from-slate-400 to-slate-500 dark:from-zinc-600 dark:to-zinc-500'
                        }`}
                        title={`KM ${s.splitNumber}: ${PaceCalculator.formatPace(s.paceSecPerKm)}`}
                      />
                    </div>
                  </td>

                  {/* Elevation Diff */}
                  <td className="py-3 px-3 text-right text-slate-700 dark:text-zinc-300">
                    <span className="inline-flex items-center gap-1">
                      <Mountain className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      {s.elevationDiffMeters > 0 ? `+${s.elevationDiffMeters}` : s.elevationDiffMeters} m
                    </span>
                  </td>

                  {/* HR */}
                  <td className="py-3 px-3 text-right">
                    {s.avgHeartRate ? (
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-black">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                        {s.avgHeartRate} bpm
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-zinc-600">--</span>
                    )}
                  </td>

                  {/* Cadence */}
                  <td className="py-3 px-3 text-right text-amber-600 dark:text-amber-300 hidden md:table-cell">
                    {s.avgCadence ? (
                      <span className="inline-flex items-center gap-1 font-bold">
                        <Footprints className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                        {s.avgCadence < 125 ? Math.round(s.avgCadence * 2) : s.avgCadence} spm
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-zinc-600">--</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drill-down modal */}
      {selectedSplit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedSplit(null)}
          ></div>
          <div className="relative z-10 bg-white dark:bg-[#090d1a] border-4 border-violet-600 w-full max-w-md p-6 shadow-[8px_8px_0px_#7c3aed] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200 dark:border-zinc-800 mb-4">
              <div>
                <h4 className="font-black italic tracking-widest uppercase text-base text-slate-900 dark:text-white">
                  {isId ? 'ANALISIS_SPLIT' : 'SPLIT_ANALYSIS'} // KM_{selectedSplit.splitNumber}
                </h4>
                <span className="text-[10px] font-mono text-violet-600 dark:text-violet-400">
                  {isId ? 'JARAK:' : 'DISTANCE:'} {selectedSplit.distanceMeters} {isId ? 'METER' : 'METERS'}
                </span>
              </div>
              <button
                onClick={() => setSelectedSplit(null)}
                className="text-slate-400 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3">
                <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-500 block">
                  {isId ? 'PACE SPLIT' : 'SPLIT PACE'}
                </span>
                <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">
                  {PaceCalculator.formatPace(selectedSplit.paceSecPerKm)}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3">
                <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-500 block">
                  {isId ? 'WAKTU BERJALAN' : 'TIME ELAPSED'}
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {PaceCalculator.formatDuration(selectedSplit.durationSeconds)}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3">
                <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-500 block">
                  {isId ? 'DELTA ELEVASI' : 'ELEVATION DELTA'}
                </span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {selectedSplit.elevationDiffMeters > 0 ? `+${selectedSplit.elevationDiffMeters}` : selectedSplit.elevationDiffMeters} m
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3">
                <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-500 block">
                  {isId ? 'DETAK JANTUNG RATA-RATA' : 'AVG HEART RATE'}
                </span>
                <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                  {selectedSplit.avgHeartRate ? `${selectedSplit.avgHeartRate} bpm` : '--'}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-3 col-span-2 sm:col-span-1">
                <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-500 block">
                  {isId ? 'KADENSI RATA-RATA' : 'AVG CADENCE'}
                </span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                  {selectedSplit.avgCadence 
                    ? `${selectedSplit.avgCadence < 125 ? selectedSplit.avgCadence * 2 : selectedSplit.avgCadence} spm` 
                    : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
