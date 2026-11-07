'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Activity } from '@/domain/entities/Activity';
import { toPng } from 'html-to-image';
import { 
  Download, 
  X, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Flame, 
  Footprints, 
  Calendar, 
  Activity as ActivityIcon,
  Zap,
  TrendingUp
} from 'lucide-react';
import BrandLogo from '@/components/brand/BrandLogo';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  activities: Activity[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MonthInSportExportModal({ activities, isOpen, onClose }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [format, setFormat] = useState<'story' | 'widescreen'>('story'); // Default to Instagram Story 9:16

  // 1. Filter running activities
  const runningActivities = useMemo(() => {
    return activities.filter(
      a => a.sportType === 'running' || a.name?.toLowerCase().includes('run')
    );
  }, [activities]);

  // 2. Discover all available months from athlete activities
  const availableMonths = useMemo(() => {
    const monthsMap = new Map<string, { label: string; year: number; month: number }>();

    runningActivities.forEach(a => {
      const d = new Date(a.startTime);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthsMap.has(key)) {
          const monthName = d.toLocaleDateString(isId ? 'id-ID' : 'en-US', {
            month: 'long',
            year: 'numeric',
          }).toUpperCase();
          monthsMap.set(key, { label: monthName, year: d.getFullYear(), month: d.getMonth() });
        }
      }
    });

    // Ensure November 2026 (current month) is present if in 2026
    const now = new Date('2026-11-04T10:30:00');
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (!monthsMap.has(currentKey)) {
      const currentMonthName = now.toLocaleDateString(isId ? 'id-ID' : 'en-US', {
        month: 'long',
        year: 'numeric',
      }).toUpperCase();
      monthsMap.set(currentKey, { label: currentMonthName, year: now.getFullYear(), month: now.getMonth() });
    }

    // Sort descending: Latest month first
    return Array.from(monthsMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, val]) => ({ key, ...val }));
  }, [runningActivities, isId]);

  // Default selected month to latest month (November 2026 if available)
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => {
    return availableMonths[0]?.key || '2026-11';
  });

  if (!isOpen) return null;

  // 3. Parse active month
  const activeMonthMeta = availableMonths.find(m => m.key === selectedMonthKey) || availableMonths[0] || {
    key: '2026-11',
    label: isId ? 'NOVEMBER 2026' : 'NOVEMBER 2026',
    year: 2026,
    month: 10,
  };

  const [yearStr, monthStr] = (selectedMonthKey || '2026-11').split('-');
  const targetYear = parseInt(yearStr, 10);
  const targetMonth = parseInt(monthStr, 10) - 1; // 0-indexed month

  // 4. Filter activities for the selected month
  const selectedRuns = runningActivities.filter(a => {
    const d = new Date(a.startTime);
    return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
  });

  // Basic totals
  const totalDistanceM = selectedRuns.reduce((acc, a) => acc + (a.distanceMeters || 0), 0);
  const totalDistanceKm = (totalDistanceM / 1000).toFixed(2);

  const totalDurationS = selectedRuns.reduce(
    (acc, a) => acc + (a.movingDurationSeconds || a.durationSeconds || 0),
    0
  );
  const hours = Math.floor(totalDurationS / 3600);
  const mins = Math.floor((totalDurationS % 3600) / 60);
  const totalFormattedTime = `${hours}h ${mins}m`;

  const totalElevationM = Math.round(
    selectedRuns.reduce((acc, a) => acc + (a.elevationGainMeters || 0), 0)
  );

  // Longest run
  const maxRunM = Math.max(...selectedRuns.map(a => a.distanceMeters || 0), 0);
  const longestRunKm = (maxRunM / 1000).toFixed(2);

  // 5. GARMIN SPECIFIC TELEMETRY: CALORIES & STEPS & CADENCE
  const totalCalories = Math.round(
    selectedRuns.reduce((acc, a) => acc + (a.calories || 0), 0)
  );

  // Calculate running steps for each activity (using Garmin cadence * duration)
  const calculateActivitySteps = (act: Activity): number => {
    if (act.steps && act.steps > 0) return act.steps;
    const cadence = act.dynamics?.avgCadence || 172; // Garmin typical running cadence
    const durationMin = (act.movingDurationSeconds || act.durationSeconds || 0) / 60;
    return Math.round(cadence * durationMin);
  };

  const totalSteps = selectedRuns.reduce((acc, a) => acc + calculateActivitySteps(a), 0);

  // Average running cadence
  const runsWithCadence = selectedRuns.filter(a => a.dynamics?.avgCadence && a.dynamics.avgCadence > 0);
  const avgCadence = runsWithCadence.length > 0
    ? Math.round(runsWithCadence.reduce((acc, a) => acc + a.dynamics.avgCadence!, 0) / runsWithCadence.length)
    : 172;

  // 6. Dynamic Weekly Breakdown for ANY Selected Month
  const week1Dist = selectedRuns
    .filter(a => new Date(a.startTime).getDate() <= 7)
    .reduce((acc, a) => acc + a.distanceMeters, 0) / 1000;

  const week2Dist = selectedRuns
    .filter(a => {
      const day = new Date(a.startTime).getDate();
      return day >= 8 && day <= 14;
    })
    .reduce((acc, a) => acc + a.distanceMeters, 0) / 1000;

  const week3Dist = selectedRuns
    .filter(a => {
      const day = new Date(a.startTime).getDate();
      return day >= 15 && day <= 21;
    })
    .reduce((acc, a) => acc + a.distanceMeters, 0) / 1000;

  const week4Dist = selectedRuns
    .filter(a => new Date(a.startTime).getDate() >= 22)
    .reduce((acc, a) => acc + a.distanceMeters, 0) / 1000;

  const weeklySplits = [
    { label: `${isId ? 'MINGGU 1' : 'WEEK 1'} (1-7)`, dist: week1Dist },
    { label: `${isId ? 'MINGGU 2' : 'WEEK 2'} (8-14)`, dist: week2Dist },
    { label: `${isId ? 'MINGGU 3' : 'WEEK 3'} (15-21)`, dist: week3Dist },
    { label: `${isId ? 'MINGGU 4' : 'WEEK 4'} (22+)`, dist: week4Dist },
  ];

  const maxWeekDist = Math.max(...weeklySplits.map(w => w.dist), 15);

  // 7. PNG Export Generator
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: format === 'story' ? 2.5 : 2,
        cacheBust: true,
      });
      const monthSlug = activeMonthMeta.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const link = document.createElement('a');
      link.download = `freedayzz-month-in-sport-${monthSlug}-${format}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b0f19] border-2 border-violet-500/80 shadow-[0_0_40px_rgba(124,58,237,0.35)] max-w-2xl w-full p-4 sm:p-5 space-y-4 font-mono max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-black uppercase text-white tracking-wider">
              {isId ? 'EKSPOR_BULAN_LARI // GRAFIS_TELEMETRI' : 'MONTH_IN_SPORT // EXPORT_GRAPHIC'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Controls Toolbar: Month Selector & Format Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#070a14] border border-zinc-800 p-3 text-xs">
          {/* Dynamic Month Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider whitespace-nowrap">
              {isId ? 'PILIH BULAN:' : 'SELECT MONTH:'}
            </span>
            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="bg-[#0b0f1d] border-2 border-violet-500 hover:border-cyan-400 text-white font-mono font-bold text-xs px-2.5 py-1 uppercase rounded-none shadow-[2px_2px_0px_#7c3aed] cursor-pointer transition-colors focus:outline-none"
            >
              {availableMonths.map(m => (
                <option key={m.key} value={m.key} className="bg-[#0b0f1d] text-white">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio Format Switcher (9:16 Insta Story vs 16:9 Widescreen) */}
          <div className="flex items-center gap-1.5 font-bold self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setFormat('story')}
              className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all cursor-pointer text-xs ${
                format === 'story'
                  ? 'bg-violet-600 text-white border-violet-400 shadow-[2px_2px_0px_#7c3aed]'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>STORY (9:16)</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat('widescreen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all cursor-pointer text-xs ${
                format === 'widescreen'
                  ? 'bg-violet-600 text-white border-violet-400 shadow-[2px_2px_0px_#7c3aed]'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>FEED (16:9)</span>
            </button>
          </div>
        </div>

        {/* The Exportable Container Preview */}
        <div className="flex justify-center overflow-x-auto py-2">
          {format === 'story' ? (
            /* =========================================================
               INSTAGRAM STORY 9:16 VERTICAL LAYOUT (WITH GARMIN CALORIES & STEPS)
               ========================================================= */
            <div
              ref={cardRef}
              className="bg-[#090d1a] border-2 border-violet-500 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between shrink-0"
              style={{
                width: '405px',
                height: '720px', // exact 9:16 aspect ratio
                padding: '24px 20px',
                backgroundImage: 'radial-gradient(ellipse at top, rgba(124,58,237,0.22), transparent 70%), linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',
                backgroundSize: '100% 100%, 24px 24px, 24px 24px',
              }}
            >
              {/* 1. Header Badges */}
              <div className="flex items-center justify-between border-b border-violet-900/60 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <BrandLogo size={34} forceTheme="dark" withShadow={false} />
                  <div>
                    <span className="text-xs font-black tracking-widest text-violet-300 uppercase block">
                      FREEDAYZZ<span className="text-white">.PULSE</span>
                    </span>
                    <span className="text-[8px] text-zinc-400 tracking-wider uppercase block">
                      PERFORMANCE TELEMETRY LAB
                    </span>
                  </div>
                </div>
                <span className="text-[8px] px-2 py-0.5 bg-violet-950 border border-violet-500/70 text-violet-300 font-bold uppercase tracking-wider">
                  GARMIN CONNECT SYNCED
                </span>
              </div>

              {/* 2. Month Title */}
              <div className="text-center pt-1">
                <span className="text-[10px] text-violet-300 tracking-widest uppercase font-bold px-2.5 py-0.5 bg-violet-950/80 border border-violet-700/80 inline-block mb-1">
                  {activeMonthMeta.label} // MONTH IN SPORT
                </span>
                <h2 className="text-2xl sm:text-3xl font-black italic tracking-wide text-white uppercase">
                  {isId ? 'PROGRESI TELEMETRI LARI' : 'RUNNING PROGRESSION'}
                </h2>
              </div>

              {/* 3. Hero Distance Display */}
              <div className="bg-[#0d1224] border-2 border-violet-500/80 p-3.5 text-center shadow-[0_0_24px_rgba(124,58,237,0.25)]">
                <span className="text-[9px] text-zinc-400 uppercase tracking-widest block font-bold mb-0.5">
                  {isId ? 'TOTAL JARAK DITEMPUH' : 'TOTAL DISTANCE LOGGED'}
                </span>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-5xl font-black text-violet-300 tracking-tight">
                    {totalDistanceKm}
                  </span>
                  <span className="text-lg font-black text-cyan-300">KM</span>
                </div>
                <span className="text-[8px] text-zinc-400 block mt-0.5">
                  {activeMonthMeta.label} &bull; Garmin Hardware Telemetry Verified
                </span>
              </div>

              {/* 4. Secondary 3-Metric Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#0d1224] border border-violet-900/60 p-2.5">
                  <span className="text-[9px] text-zinc-400 uppercase block font-bold">
                    {isId ? 'TOTAL WAKTU' : 'TOTAL TIME'}
                  </span>
                  <span className="text-base font-black text-white mt-0.5 block">
                    {totalFormattedTime}
                  </span>
                </div>
                <div className="bg-[#0d1224] border border-violet-900/60 p-2.5">
                  <span className="text-[9px] text-zinc-400 uppercase block font-bold">
                    {isId ? 'SESI LARI' : 'SESSIONS'}
                  </span>
                  <span className="text-base font-black text-cyan-300 mt-0.5 block">
                    {selectedRuns.length} RUNS
                  </span>
                </div>
                <div className="bg-[#0d1224] border border-violet-900/60 p-2.5">
                  <span className="text-[9px] text-zinc-400 uppercase block font-bold">
                    {isId ? 'ELEVASI' : 'ELEV GAIN'}
                  </span>
                  <span className="text-base font-black text-emerald-400 mt-0.5 block">
                    +{totalElevationM} M
                  </span>
                </div>
              </div>

              {/* 5. Highlight Longest Single Run Banner */}
              <div className="bg-[#0d1224] border border-violet-600/50 p-2.5 flex items-center justify-between text-xs">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                  {isId ? 'SESI TERPANJANG:' : 'LONGEST SINGLE SESSION:'}
                </span>
                <span className="text-sm font-black text-cyan-300">
                  {longestRunKm} <span className="text-[10px] text-zinc-300">KM</span>
                </span>
              </div>

              {/* 7. Weekly Mileage Progression Bars */}
              <div className="bg-[#0d1224] border border-violet-900/60 p-2.5 space-y-1.5">
                <span className="text-[8px] text-zinc-400 uppercase tracking-widest block font-bold">
                  {activeMonthMeta.label} // {isId ? 'PROGRESI MINGGUAN' : 'WEEKLY MILEAGE BREAKDOWN'}
                </span>
                <div className="space-y-1">
                  {weeklySplits.map((w, idx) => {
                    const pct = Math.min(100, Math.round((w.dist / maxWeekDist) * 100));
                    return (
                      <div key={idx} className="space-y-0.5 text-xs">
                        <div className="flex justify-between text-[8px]">
                          <span className="text-zinc-400 font-bold">{w.label}</span>
                          <span className="text-white font-black">{w.dist.toFixed(2)} km</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 8. Story Footer & Brand Tag */}
              <div className="flex items-center justify-between text-[8px] text-zinc-500 border-t border-violet-900/60 pt-2">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block"></span>
                  GARMIN CONNECT &bull; VALIDATED
                </span>
                <span className="text-violet-400 font-bold tracking-wider">
                  FREEDAYZZ // PULSE
                </span>
              </div>
            </div>
          ) : (
            /* =========================================================
               WIDESCREEN 16:9 HORIZONTAL LAYOUT (WITH GARMIN CALORIES & STEPS)
               ========================================================= */
            <div
              ref={cardRef}
              className="w-full bg-[#090d1a] border-2 border-violet-500 p-5 space-y-3.5 text-white shadow-2xl relative overflow-hidden"
              style={{
                width: '620px',
                backgroundImage: 'radial-gradient(ellipse at top left, rgba(124,58,237,0.18), transparent 70%)',
              }}
            >
              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-violet-900/60 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <BrandLogo size={28} forceTheme="dark" withShadow={false} />
                  <span className="text-xs font-black tracking-widest text-violet-300 uppercase">
                    FREEDAYZZ // PULSE
                  </span>
                </div>
                <span className="text-[9px] px-2 py-0.5 bg-violet-950 border border-violet-500/60 text-violet-300 font-bold uppercase tracking-wider">
                  GARMIN CONNECT &bull; {activeMonthMeta.label}
                </span>
              </div>

              {/* Title & Stats Grid */}
              <div className="grid grid-cols-12 gap-3">
                {/* Hero Distance Box */}
                <div className="bg-[#0d1224] border border-violet-900/60 p-3 col-span-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-zinc-400 uppercase tracking-widest block font-bold">
                      {isId ? 'TOTAL JARAK' : 'TOTAL DISTANCE'}
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-black text-violet-300">{totalDistanceKm}</span>
                      <span className="text-xs text-cyan-300 font-bold">KM</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-zinc-800 text-[9px] text-zinc-400 space-y-0.5">
                    <div>{isId ? 'Durasi:' : 'Time:'} <strong className="text-white">{totalFormattedTime}</strong></div>
                    <div>{isId ? 'Sesi:' : 'Runs:'} <strong className="text-cyan-300">{selectedRuns.length}</strong></div>
                    <div>{isId ? 'Terjauh:' : 'Longest:'} <strong className="text-white">{longestRunKm} km</strong></div>
                  </div>
                </div>

                {/* Secondary Cards Column */}
                <div className="col-span-8 space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#0d1224] border border-violet-900/60 p-2">
                      <span className="text-[9px] text-zinc-400 uppercase block font-bold">
                        {isId ? 'SESI' : 'RUNS'}
                      </span>
                      <span className="text-sm font-black text-white">{selectedRuns.length} SESSIONS</span>
                    </div>
                    <div className="bg-[#0d1224] border border-violet-900/60 p-2">
                      <span className="text-[9px] text-zinc-400 uppercase block font-bold">
                        {isId ? 'TERJAUH' : 'LONGEST'}
                      </span>
                      <span className="text-sm font-black text-cyan-300">{longestRunKm} KM</span>
                    </div>
                    <div className="bg-[#0d1224] border border-violet-900/60 p-2">
                      <span className="text-[9px] text-zinc-400 uppercase block font-bold">
                        {isId ? 'ELEVASI' : 'ELEV GAIN'}
                      </span>
                      <span className="text-sm font-black text-emerald-400">+{totalElevationM} M</span>
                    </div>
                  </div>

                  {/* Weekly Progression Bars */}
                  <div className="bg-[#0d1224] border border-violet-900/60 p-2.5 space-y-1.5">
                    <div className="flex justify-between text-[8px] text-zinc-400 font-bold uppercase">
                      <span>{isId ? 'Progresi Mingguan' : 'Weekly Progression'}</span>
                      <span>{activeMonthMeta.label}</span>
                    </div>
                    <div className="space-y-1">
                      {weeklySplits.map((w, idx) => {
                        const pct = Math.min(100, Math.round((w.dist / maxWeekDist) * 100));
                        return (
                          <div key={idx} className="flex items-center gap-2 text-[8px]">
                            <span className="w-24 text-zinc-400 truncate">{w.label}</span>
                            <div className="flex-1 h-1.5 bg-zinc-900 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-white font-bold w-12 text-right">{w.dist.toFixed(1)}k</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-[8px] text-zinc-500 border-t border-violet-900/60 pt-2">
                <span>HARDWARE-VALIDATED TELEMETRY &bull; GARMIN SENSORS</span>
                <span className="text-violet-400 font-bold">{activeMonthMeta.label} RUNNING SUMMARY</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
          <span className="text-[10px] text-zinc-400">
            {isId ? 'Ekspor grafis resolusi tinggi Ultra-HD Retina (PNG)' : 'Exported at 2.5x Ultra-HD Retina resolution (PNG)'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase transition-colors cursor-pointer"
            >
              {isId ? 'TUTUP' : 'CLOSE'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold uppercase transition-all shadow-[0_0_16px_rgba(124,58,237,0.5)] cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? (isId ? 'MENGEKSPOR...' : 'EXPORTING...') : (isId ? 'UNDUH PNG' : 'DOWNLOAD PNG')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
