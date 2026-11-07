'use client';

import React, { useState, useMemo } from 'react';
import { MetricStreamPoint } from '@/domain/entities/ActivityDetail';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { 
  Activity, 
  Mountain, 
  Heart, 
  Footprints, 
  Timer, 
  Compass
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  stream: MetricStreamPoint[];
  onHoverIndex?: (index: number | null) => void;
}

type MetricType = 'pace' | 'gap' | 'hr' | 'cadence' | 'elevation' | 'all';

export default function ElevationPaceChart({ stream, onHoverIndex }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';
  const [activeMetric, setActiveMetric] = useState<MetricType>('pace');

  if (!stream || stream.length === 0) {
    return (
      <div className="bg-[#0d1224] border-2 border-violet-900/60 p-8 text-center text-zinc-500 font-mono text-xs">
        NO_TIME_SERIES_TELEMETRY_AVAILABLE
      </div>
    );
  }

  // Pre-calculate summary statistics across stream for labels & domain calibration
  const telemetryStats = useMemo(() => {
    // 1. Pace stats: ONLY valid running points (between 3:00/km and 9:30/km)
    const validPaces = stream
      .map(p => p.paceSecPerKm)
      .filter((p): p is number => typeof p === 'number' && p >= 180 && p <= 570);
    
    const avgPace = validPaces.length > 0
      ? Math.round(validPaces.reduce((a, b) => a + b, 0) / validPaces.length)
      : 420;
    const minPace = validPaces.length > 0 ? Math.min(...validPaces) : 360;
    const maxPace = validPaces.length > 0 ? Math.max(...validPaces) : 510;

    // 2. Grade Adjusted Pace (GAP)
    const validGAPs = stream
      .map(p => (p.gradeAdjustedSpeedMps && p.gradeAdjustedSpeedMps > 1.0 ? Math.round(1000 / p.gradeAdjustedSpeedMps) : null))
      .filter((g): g is number => typeof g === 'number' && g >= 180 && g <= 570);
    const avgGAP = validGAPs.length > 0
      ? Math.round(validGAPs.reduce((a, b) => a + b, 0) / validGAPs.length)
      : avgPace;

    // 3. Heart Rate stats
    const validHRs = stream
      .map(p => p.heartRate)
      .filter((h): h is number => typeof h === 'number' && h >= 60 && h <= 220);
    const avgHR = validHRs.length > 0
      ? Math.round(validHRs.reduce((a, b) => a + b, 0) / validHRs.length)
      : 0;
    const minHR = validHRs.length > 0 ? Math.min(...validHRs) : 120;
    const maxHR = validHRs.length > 0 ? Math.max(...validHRs) : 185;

    // 4. Cadence stats (double single-leg RPM if < 125)
    const validCads = stream
      .map(p => {
        if (!p.cadence || p.cadence <= 0) return null;
        return p.cadence < 125 ? p.cadence * 2 : p.cadence;
      })
      .filter((c): c is number => typeof c === 'number' && c >= 120 && c <= 230);
    const avgCad = validCads.length > 0
      ? Math.round(validCads.reduce((a, b) => a + b, 0) / validCads.length)
      : 0;
    const minCad = validCads.length > 0 ? Math.min(...validCads) : 150;
    const maxCad = validCads.length > 0 ? Math.max(...validCads) : 190;

    // 5. Elevation stats
    const validElevs = stream
      .map(p => p.elevationMeters)
      .filter((e): e is number => typeof e === 'number' && e > -100 && e < 9000);
    const minElev = validElevs.length > 0 ? Math.floor(Math.min(...validElevs)) : 0;
    const maxElev = validElevs.length > 0 ? Math.ceil(Math.max(...validElevs)) : 50;
    const elevGain = Math.max(1, maxElev - minElev);

    return {
      avgPace,
      minPace,
      maxPace,
      avgGAP,
      avgHR,
      minHR,
      maxHR,
      avgCad,
      minCad,
      maxCad,
      minElev,
      maxElev,
      elevGain,
    };
  }, [stream]);

  // Clean data & eliminate startup standstill spikes:
  // Find first stable cruising pace where runner reaches full stride (speed >= 1.8 m/s or distance >= 25m)
  const chartData = useMemo(() => {
    const cruisingPt = stream.find(p => p.distanceMeters >= 25 && p.speedMps >= 1.8 && p.paceSecPerKm >= 200 && p.paceSecPerKm <= 540);
    const cruisingPace = cruisingPt?.paceSecPerKm || telemetryStats.avgPace;
    const cruisingGAP = cruisingPt?.gradeAdjustedSpeedMps ? Math.round(1000 / cruisingPt.gradeAdjustedSpeedMps) : cruisingPace;

    return stream.map((pt, idx, arr) => {
      const distanceKm = Math.round((pt.distanceMeters / 1000) * 100) / 100;
      const elevation = pt.elevationMeters ?? 0;
      const heartRate = pt.heartRate && pt.heartRate >= 60 && pt.heartRate <= 220 ? pt.heartRate : null;

      let cadence: number | null = null;
      if (pt.cadence && pt.cadence > 0) {
        cadence = pt.cadence < 125 ? Math.round(pt.cadence * 2) : Math.round(pt.cadence);
        if (cadence < 120 || cadence > 230) cadence = null;
      }

      // Smooth Pace: if within initial 25m warmup/press-start, use cruising pace for a smooth start
      let paceSec: number | null = null;
      if (pt.distanceMeters < 25 && (pt.speedMps < 1.8 || (pt.paceSecPerKm && pt.paceSecPerKm > 540))) {
        paceSec = cruisingPace;
      } else if (pt.paceSecPerKm && pt.paceSecPerKm >= 180 && pt.paceSecPerKm <= 570) {
        const pPrev = arr[idx - 1]?.paceSecPerKm;
        const pNext = arr[idx + 1]?.paceSecPerKm;
        const windowVals = [pt.paceSecPerKm];
        if (pPrev && pPrev >= 180 && pPrev <= 570) windowVals.push(pPrev);
        if (pNext && pNext >= 180 && pNext <= 570) windowVals.push(pNext);
        paceSec = Math.round(windowVals.reduce((a, b) => a + b, 0) / windowVals.length);
      } else {
        paceSec = telemetryStats.avgPace;
      }

      // Grade Adjusted Pace (GAP)
      let gapSec: number | null = null;
      if (pt.distanceMeters < 25 && (pt.speedMps < 1.8 || !pt.gradeAdjustedSpeedMps)) {
        gapSec = cruisingGAP;
      } else if (pt.gradeAdjustedSpeedMps && pt.gradeAdjustedSpeedMps > 1.0) {
        const rawGAP = 1000 / pt.gradeAdjustedSpeedMps;
        if (rawGAP >= 180 && rawGAP <= 570) {
          gapSec = Math.round(rawGAP);
        } else {
          gapSec = telemetryStats.avgGAP;
        }
      } else {
        gapSec = telemetryStats.avgGAP;
      }

      return {
        idx,
        distanceKm,
        elevation: Math.round(elevation * 10) / 10,
        heartRate,
        cadence,
        paceSec,
        gapSec,
      };
    });
  }, [stream, telemetryStats]);

  // Clean Y-Axis domains calibrated strictly to the run's actual range
  const paceDomain: [number, number] = [
    Math.max(180, Math.floor((telemetryStats.minPace - 15) / 15) * 15),
    Math.min(600, Math.ceil((telemetryStats.maxPace + 15) / 15) * 15),
  ];

  const hrDomain: [number, number] = [
    Math.max(90, telemetryStats.minHR - 5),
    Math.min(205, telemetryStats.maxHR + 5),
  ];

  const cadDomain: [number, number] = [
    Math.max(140, telemetryStats.minCad - 5),
    Math.min(210, telemetryStats.maxCad + 5),
  ];

  const elevDomain: [number, number] = [
    Math.max(0, telemetryStats.minElev - 2),
    telemetryStats.maxElev + 3,
  ];

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] space-y-4 font-mono transition-colors">
      {/* 1. Header & Segmented Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-200 dark:border-zinc-800 gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-400" />
          <div>
            <h3 className="font-black italic tracking-widest uppercase text-sm text-slate-900 dark:text-white">
              {isId ? 'STREAM_ELEVASI_&_TELEMETRI' : 'ELEVATION_&_TELEMETRY_STREAM'}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
              {isId ? 'METRIK TERSINKRONISASI & KONTUR ELEVASI' : 'SYNCHRONIZED METRICS & ELEVATION CONTOUR'}
            </p>
          </div>
        </div>

        {/* Clean Segmented Button Group (Single Row) */}
        <div className="flex items-center gap-1 text-[10px] font-bold self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setActiveMetric('pace')}
            className={`px-2.5 py-1.5 border transition-all cursor-pointer flex items-center gap-1 ${
              activeMetric === 'pace'
                ? 'bg-cyan-950 text-cyan-200 border-cyan-400 shadow-[2px_2px_0px_#06b6d4]'
                : 'bg-slate-100 dark:bg-[#070a14] text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-800 hover:text-cyan-600 dark:hover:text-cyan-300 hover:border-slate-400 dark:hover:border-zinc-700'
            }`}
            title="Pace Stream (Min/Km)"
          >
            <Timer className="w-3 h-3 text-cyan-400" />
            <span>PACE</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('gap')}
            className={`px-2.5 py-1.5 border transition-all cursor-pointer flex items-center gap-1 ${
              activeMetric === 'gap'
                ? 'bg-purple-950 text-purple-200 border-purple-400 shadow-[2px_2px_0px_#a855f7]'
                : 'bg-slate-100 dark:bg-[#070a14] text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-800 hover:text-purple-600 dark:hover:text-purple-300 hover:border-slate-400 dark:hover:border-zinc-700'
            }`}
            title="Grade Adjusted Pace (Flat-Terrain Equivalent)"
          >
            <Compass className="w-3 h-3 text-purple-400" />
            <span>GAP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('hr')}
            className={`px-2.5 py-1.5 border transition-all cursor-pointer flex items-center gap-1 ${
              activeMetric === 'hr'
                ? 'bg-rose-950 text-rose-200 border-rose-400 shadow-[2px_2px_0px_#f43f5e]'
                : 'bg-slate-100 dark:bg-[#070a14] text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-800 hover:text-rose-600 dark:hover:text-rose-300 hover:border-slate-400 dark:hover:border-zinc-700'
            }`}
            title="Heart Rate Stream (BPM)"
          >
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>{isId ? 'DETAK HR' : 'HR'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('cadence')}
            className={`px-2.5 py-1.5 border transition-all cursor-pointer flex items-center gap-1 ${
              activeMetric === 'cadence'
                ? 'bg-amber-950 text-amber-200 border-amber-400 shadow-[2px_2px_0px_#f59e0b]'
                : 'bg-slate-100 dark:bg-[#070a14] text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-800 hover:text-amber-600 dark:hover:text-amber-300 hover:border-slate-400 dark:hover:border-zinc-700'
            }`}
            title="Cadence Stream (SPM)"
          >
            <Footprints className="w-3 h-3 text-amber-400" />
            <span>{isId ? 'KAD' : 'CAD'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('elevation')}
            className={`px-2.5 py-1.5 border transition-all cursor-pointer flex items-center gap-1 ${
              activeMetric === 'elevation'
                ? 'bg-emerald-950 text-emerald-200 border-emerald-400 shadow-[2px_2px_0px_#10b981]'
                : 'bg-slate-100 dark:bg-[#070a14] text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-300 hover:border-slate-400 dark:hover:border-zinc-700'
            }`}
            title="Elevation Profile (Meters)"
          >
            <Mountain className="w-3 h-3 text-emerald-400" />
            <span>{isId ? 'ELEV' : 'ALT'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('all')}
            className={`px-2.5 py-1.5 border transition-all cursor-pointer ${
              activeMetric === 'all'
                ? 'bg-violet-950 text-violet-200 border-violet-400 shadow-[2px_2px_0px_#7c3aed]'
                : 'bg-slate-100 dark:bg-[#070a14] text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-zinc-700'
            }`}
            title="All Streams Combined"
          >
            <span>{isId ? 'SEMUA' : 'ALL'}</span>
          </button>
        </div>
      </div>

      {/* 2. Chart Canvas */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            onMouseMove={state => {
              if (state && state.activeTooltipIndex !== undefined && onHoverIndex) {
                const idx = Number(state.activeTooltipIndex);
                if (!isNaN(idx)) {
                  onHoverIndex(idx);
                }
              }
            }}
            onMouseLeave={() => {
              if (onHoverIndex) onHoverIndex(null);
            }}
          >
            <defs>
              <linearGradient id="elevationGradPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="elevationGradSubtle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.16} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />

            {/* X-Axis: Distance in KM */}
            <XAxis
              dataKey="distanceKm"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              tickFormatter={val => `${val} km`}
            />

            {/* PRIMARY LEFT Y-AXIS: DYNAMICALLY SWITCHES BASED ON ACTIVE METRIC */}
            {(activeMetric === 'pace' || activeMetric === 'all') && (
              <YAxis
                yAxisId="paceAxis"
                domain={paceDomain}
                reversed={true} // Faster pace is on TOP
                stroke="#38bdf8"
                orientation="left"
                tick={{ fill: '#38bdf8', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={val => PaceCalculator.formatPace(val)}
                width={50}
              />
            )}

            {activeMetric === 'gap' && (
              <YAxis
                yAxisId="gapAxis"
                domain={paceDomain}
                reversed={true} // Faster GAP is on TOP
                stroke="#c084fc"
                orientation="left"
                tick={{ fill: '#c084fc', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={val => PaceCalculator.formatPace(val)}
                width={50}
              />
            )}

            {activeMetric === 'hr' && (
              <YAxis
                yAxisId="hrAxis"
                domain={hrDomain}
                stroke="#f43f5e"
                orientation="left"
                tick={{ fill: '#f43f5e', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={val => `${val}`}
                width={36}
              />
            )}

            {activeMetric === 'cadence' && (
              <YAxis
                yAxisId="cadAxis"
                domain={cadDomain}
                stroke="#f59e0b"
                orientation="left"
                tick={{ fill: '#f59e0b', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={val => `${val}`}
                width={36}
              />
            )}

            {activeMetric === 'elevation' && (
              <YAxis
                yAxisId="elevAxis"
                domain={elevDomain}
                stroke="#10b981"
                orientation="left"
                tick={{ fill: '#10b981', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={val => `${val}m`}
                width={36}
              />
            )}

            {/* Combined mode: Right Axis is HR */}
            {activeMetric === 'all' && (
              <YAxis
                yAxisId="hrAxis"
                domain={hrDomain}
                stroke="#f43f5e"
                orientation="right"
                tick={{ fill: '#f43f5e', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={val => `${val}`}
                width={32}
              />
            )}

            {/* Hidden Secondary Elevation Axis when viewing Pace/GAP/HR to keep background hill proportional */}
            {(activeMetric === 'pace' || activeMetric === 'gap' || activeMetric === 'hr' || activeMetric === 'cadence' || activeMetric === 'all') && (
              <YAxis
                yAxisId="elevBackgroundAxis"
                domain={[elevDomain[0], elevDomain[1] + (elevDomain[1] - elevDomain[0]) * 1.5]}
                orientation="right"
                hide={true}
              />
            )}

            {/* Contextual Drill-down Tooltip: ONLY shows selected metric; SHOWS ALL only when ALL is selected */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-[#090d1a] border-2 border-violet-500 p-2.5 shadow-[4px_4px_0px_#7c3aed] text-xs font-mono space-y-1.5 min-w-[140px]">
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800 pb-1 flex items-center justify-between">
                        <span>{isId ? 'JARAK:' : 'DISTANCE:'} {data.distanceKm} KM</span>
                      </div>

                      {/* 1. PACE ONLY */}
                      {activeMetric === 'pace' && data.paceSec && (
                        <div className="text-cyan-700 dark:text-cyan-300 flex items-center justify-between gap-3 text-xs">
                          <span className="flex items-center gap-1 font-bold">
                            <Timer className="w-3.5 h-3.5 text-cyan-500" />
                            Pace:
                          </span>
                          <strong className="text-sm font-black">{PaceCalculator.formatPace(data.paceSec)}</strong>
                        </div>
                      )}

                      {/* 2. GAP ONLY */}
                      {activeMetric === 'gap' && data.gapSec && (
                        <div className="text-purple-700 dark:text-purple-300 flex items-center justify-between gap-3 text-xs">
                          <span className="flex items-center gap-1 font-bold">
                            <Compass className="w-3.5 h-3.5 text-purple-500" />
                            GAP:
                          </span>
                          <strong className="text-sm font-black">{PaceCalculator.formatPace(data.gapSec)}</strong>
                        </div>
                      )}

                      {/* 3. HR ONLY */}
                      {activeMetric === 'hr' && data.heartRate && (
                        <div className="text-rose-700 dark:text-rose-400 flex items-center justify-between gap-3 text-xs">
                          <span className="flex items-center gap-1 font-bold">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            {isId ? 'Detak Jantung:' : 'Heart Rate:'}
                          </span>
                          <strong className="text-sm font-black">{data.heartRate} bpm</strong>
                        </div>
                      )}

                      {/* 4. CADENCE ONLY */}
                      {activeMetric === 'cadence' && data.cadence && (
                        <div className="text-amber-700 dark:text-amber-400 flex items-center justify-between gap-3 text-xs">
                          <span className="flex items-center gap-1 font-bold">
                            <Footprints className="w-3.5 h-3.5 text-amber-500" />
                            {isId ? 'Kadensi:' : 'Cadence:'}
                          </span>
                          <strong className="text-sm font-black">{data.cadence} spm</strong>
                        </div>
                      )}

                      {/* 5. ELEVATION ONLY */}
                      {activeMetric === 'elevation' && (
                        <div className="text-emerald-700 dark:text-emerald-400 flex items-center justify-between gap-3 text-xs">
                          <span className="flex items-center gap-1 font-bold">
                            <Mountain className="w-3.5 h-3.5 text-emerald-500" />
                            {isId ? 'Elevasi:' : 'Elevation:'}
                          </span>
                          <strong className="text-sm font-black">{data.elevation} m</strong>
                        </div>
                      )}

                      {/* 6. ALL STREAMS: SHOW EVERYTHING COMBINED */}
                      {activeMetric === 'all' && (
                        <div className="space-y-1 font-bold">
                          {data.paceSec && (
                            <div className="text-cyan-700 dark:text-cyan-300 flex items-center justify-between gap-3">
                              <span>Pace:</span>
                              <strong>{PaceCalculator.formatPace(data.paceSec)}</strong>
                            </div>
                          )}
                          {data.gapSec && (
                            <div className="text-purple-700 dark:text-purple-300 flex items-center justify-between gap-3">
                              <span>GAP:</span>
                              <strong>{PaceCalculator.formatPace(data.gapSec)}</strong>
                            </div>
                          )}
                          {data.heartRate && (
                            <div className="text-rose-700 dark:text-rose-400 flex items-center justify-between gap-3">
                              <span>{isId ? 'Detak Jantung:' : 'Heart Rate:'}</span>
                              <strong>{data.heartRate} bpm</strong>
                            </div>
                          )}
                          {data.cadence && (
                            <div className="text-amber-700 dark:text-amber-400 flex items-center justify-between gap-3">
                              <span>{isId ? 'Kadensi:' : 'Cadence:'}</span>
                              <strong>{data.cadence} spm</strong>
                            </div>
                          )}
                          <div className="text-emerald-700 dark:text-emerald-400 flex items-center justify-between gap-3 pt-0.5 border-t border-slate-200 dark:border-zinc-800/80">
                            <span>{isId ? 'Elevasi:' : 'Elevation:'}</span>
                            <strong>{data.elevation} m</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* 1. Elevation Shaded Area Profile */}
            {activeMetric === 'elevation' && (
              <Area
                yAxisId="elevAxis"
                type="monotone"
                dataKey="elevation"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#elevationGradPrimary)"
                name="Elevation"
              />
            )}

            {(activeMetric === 'pace' || activeMetric === 'gap' || activeMetric === 'hr' || activeMetric === 'cadence' || activeMetric === 'all') && (
              <Area
                yAxisId="elevBackgroundAxis"
                type="monotone"
                dataKey="elevation"
                stroke="#10b981"
                strokeWidth={1}
                strokeOpacity={0.4}
                fillOpacity={1}
                fill="url(#elevationGradSubtle)"
                name="Elevation"
              />
            )}

            {/* 2. Raw Pace Line */}
            {(activeMetric === 'pace' || activeMetric === 'all') && (
              <Line
                yAxisId="paceAxis"
                type="monotone"
                dataKey="paceSec"
                stroke="#38bdf8"
                strokeWidth={2.2}
                dot={false}
                name="Pace"
              />
            )}

            {/* 3. Grade Adjusted Pace (GAP) Line */}
            {activeMetric === 'gap' && (
              <Line
                yAxisId="gapAxis"
                type="monotone"
                dataKey="gapSec"
                stroke="#c084fc"
                strokeWidth={2.2}
                dot={false}
                name="GAP"
              />
            )}

            {/* 4. Heart Rate Line */}
            {(activeMetric === 'hr' || activeMetric === 'all') && (
              <Line
                yAxisId="hrAxis"
                type="monotone"
                dataKey="heartRate"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={false}
                name="Heart Rate"
              />
            )}

            {/* 5. Cadence Line */}
            {(activeMetric === 'cadence' || activeMetric === 'all') && (
              <Line
                yAxisId={activeMetric === 'cadence' ? 'cadAxis' : 'paceAxis'}
                type="monotone"
                dataKey="cadence"
                stroke="#f59e0b"
                strokeWidth={activeMetric === 'all' ? 1.5 : 2}
                strokeDasharray={activeMetric === 'all' ? '2 2' : undefined}
                dot={false}
                name="Cadence"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Clean Footer Telemetry Bar: Contextual to Selected Metric */}
      <div className="flex flex-wrap items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/80 gap-2 font-mono">
        <div className="flex items-center gap-3">
          {activeMetric === 'pace' && (
            <span className="text-zinc-300">
              AVG PACE: <strong className="text-cyan-400">{PaceCalculator.formatPace(telemetryStats.avgPace)}</strong>
              <span className="text-zinc-500 ml-2">(FASTEST: {PaceCalculator.formatPace(telemetryStats.minPace)})</span>
            </span>
          )}

          {activeMetric === 'gap' && (
            <span className="text-zinc-300">
              AVG GAP: <strong className="text-purple-400">{PaceCalculator.formatPace(telemetryStats.avgGAP)}</strong>
              <span className="text-zinc-500 ml-2">(FLAT EQUIVALENT)</span>
            </span>
          )}

          {activeMetric === 'hr' && (
            <span className="text-zinc-300">
              AVG HR: <strong className="text-rose-400">{telemetryStats.avgHR} bpm</strong>
              <span className="text-zinc-500 ml-2">(PEAK: {telemetryStats.maxHR} bpm)</span>
            </span>
          )}

          {activeMetric === 'cadence' && (
            <span className="text-zinc-300">
              AVG CADENCE: <strong className="text-amber-400">{telemetryStats.avgCad} spm</strong>
              <span className="text-zinc-500 ml-2">(PEAK: {telemetryStats.maxCad} spm)</span>
            </span>
          )}

          {activeMetric === 'elevation' && (
            <span className="text-zinc-300">
              ALT RANGE: <strong className="text-emerald-400">{telemetryStats.minElev}m – {telemetryStats.maxElev}m</strong>
              <span className="text-emerald-400 ml-2">(+{telemetryStats.elevGain}m GAIN)</span>
            </span>
          )}

          {activeMetric === 'all' && (
            <>
              <span className="text-zinc-300">
                PACE: <strong className="text-cyan-400">{PaceCalculator.formatPace(telemetryStats.avgPace)}</strong>
              </span>
              <span className="text-zinc-300">
                HR: <strong className="text-rose-400">{telemetryStats.avgHR} bpm</strong>
              </span>
              <span className="text-zinc-300">
                CAD: <strong className="text-amber-400">{telemetryStats.avgCad} spm</strong>
              </span>
              <span className="text-zinc-300">
                ALT: <strong className="text-emerald-400">+{telemetryStats.elevGain}m</strong>
              </span>
            </>
          )}
        </div>

        <span className="text-zinc-500 hidden sm:inline">
          {activeMetric === 'all' ? 'HOVER TO VIEW ALL CONCURRENT STREAMS' : `DRILL-DOWN: ONLY ${activeMetric.toUpperCase()} IS SHOWN`}
        </span>
      </div>
    </div>
  );
}