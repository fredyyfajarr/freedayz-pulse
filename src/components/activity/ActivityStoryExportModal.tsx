'use client';

import React, { useRef, useState } from 'react';
import { Activity } from '@/domain/entities/Activity';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { toPng } from 'html-to-image';
import {
  Download,
  X,
  Share2,
  Sparkles,
  Smartphone,
  Square,
  Check,
  Flame,
  Footprints,
  Heart,
  Mountain,
  Calendar,
  Zap,
} from 'lucide-react';
import BrandLogo from '@/components/brand/BrandLogo';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityStoryExportModal({ activity, isOpen, onClose }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';
  const cardRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<'story' | 'square'>('story'); // 9:16 story vs 1:1 post
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const durationSec = activity.movingDurationSeconds || activity.durationSeconds;
  const distanceKm = (activity.distanceMeters / 1000).toFixed(2);
  const paceStr = PaceCalculator.formatPace(activity.avgPaceSecPerKm).replace(' /km', '');
  const durationStr = PaceCalculator.formatDuration(durationSec);

  const dateFormatted = new Date(activity.startTime).toLocaleDateString(
    isId ? 'id-ID' : 'en-US',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  ).toUpperCase();

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5, // Ultra-sharp resolution
      });

      const link = document.createElement('a');
      link.download = `freedayzz-run-${activity.id.slice(0, 8)}-${format}.png`;
      link.href = dataUrl;
      link.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error exporting story card:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b0f1f] border-2 border-violet-800/80 max-w-4xl w-full max-h-[95vh] flex flex-col shadow-[8px_8px_0px_#7c3aed] overflow-hidden font-mono text-zinc-100">
        {/* Top Modal Controls */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-[#070a14]">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs sm:text-sm font-black italic tracking-wide uppercase text-white">
              {isId ? 'GENERATE INFOGRAFIS STORY // SESI LARI' : 'RUN SESSION STORY GENERATOR'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Toggle: 9:16 Story vs 1:1 Square */}
            <div className="flex items-center p-0.5 bg-[#0e1428] border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setFormat('story')}
                className={`px-2.5 py-1 flex items-center gap-1 font-bold text-[10px] uppercase transition-colors ${
                  format === 'story'
                    ? 'bg-violet-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>9:16 STORY</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('square')}
                className={`px-2.5 py-1 flex items-center gap-1 font-bold text-[10px] uppercase transition-colors ${
                  format === 'square'
                    ? 'bg-violet-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Square className="w-3 h-3" />
                <span>1:1 FEED</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Live Card Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-[#05070f]">
          {/* Exportable Story Canvas */}
          <div
            ref={cardRef}
            className={`relative bg-gradient-to-b from-[#0e122b] via-[#090c1e] to-[#05060f] border-2 border-violet-500/80 p-6 sm:p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(124,58,237,0.25)] ${
              format === 'story' ? 'w-[360px] h-[640px]' : 'w-[420px] h-[420px]'
            }`}
          >
            {/* Cyber Grid Watermark */}
            <div className="absolute inset-0 bg-[radial-gradient(#7c3aed_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

            {/* Canvas Header */}
            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-violet-800/60">
              <div className="flex items-center gap-2.5">
                <BrandLogo size={28} />
                <div>
                  <div className="text-xs font-black italic tracking-wider text-white">
                    FREEDAYZZ<span className="text-violet-400">.PULSE</span>
                  </div>
                  <div className="text-[7px] tracking-widest text-zinc-400 uppercase">
                    PRO TELEMETRY LAB
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] px-2 py-0.5 bg-violet-950 border border-violet-500 text-cyan-300 font-bold block">
                  {activity.sportType.toUpperCase()}
                </span>
                <span className="text-[8px] text-zinc-400 block mt-0.5">{dateFormatted}</span>
              </div>
            </div>

            {/* Run Title */}
            <div className="relative z-10 my-3">
              <h1 className="text-lg sm:text-xl font-black italic uppercase tracking-tight text-white leading-tight line-clamp-2">
                {activity.name}
              </h1>
            </div>

            {/* Hero Big Stats Grid */}
            <div className="relative z-10 grid grid-cols-2 gap-3 my-2">
              {/* Distance */}
              <div className="bg-[#0b0e22]/90 border border-violet-700/60 p-3">
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">
                  {isId ? 'JARAK TOTAL' : 'DISTANCE'}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black text-white tracking-tight">{distanceKm}</span>
                  <span className="text-xs font-bold text-violet-400">KM</span>
                </div>
              </div>

              {/* Pace */}
              <div className="bg-[#0b0e22]/90 border border-cyan-700/60 p-3">
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">
                  {isId ? 'RATA-RATA PACE' : 'AVG PACE'}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black text-cyan-300 tracking-tight">{paceStr}</span>
                  <span className="text-xs font-bold text-cyan-400">/KM</span>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-[#0b0e22]/90 border border-zinc-800 p-3">
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">
                  {isId ? 'DURASI LARI' : 'DURATION'}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-white">{durationStr}</span>
                </div>
              </div>

              {/* Heart Rate */}
              <div className="bg-[#0b0e22]/90 border border-rose-800/80 p-3">
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">
                  {isId ? 'RATA-RATA HR' : 'AVG HEART RATE'}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-rose-400">
                    {activity.avgHeartRate ? Math.round(activity.avgHeartRate) : '--'}
                  </span>
                  <span className="text-xs font-bold text-rose-400">BPM</span>
                </div>
              </div>
            </div>

            {/* Micro Metrics Strip */}
            <div className="relative z-10 grid grid-cols-3 gap-2 py-2 border-y border-zinc-800/80 text-center text-[10px]">
              <div>
                <span className="text-zinc-500 block text-[8px] uppercase">ELEVATION</span>
                <strong className="text-white font-bold">{activity.elevationGainMeters || 0} M</strong>
              </div>
              <div>
                <span className="text-zinc-500 block text-[8px] uppercase">CALORIES</span>
                <strong className="text-amber-400 font-bold">{activity.calories || '--'} KCAL</strong>
              </div>
              <div>
                <span className="text-zinc-500 block text-[8px] uppercase">TRIMP LOAD</span>
                <strong className="text-violet-400 font-bold">{activity.relativeEffortScore || '--'} PTS</strong>
              </div>
            </div>

            {/* Canvas Footer */}
            <div className="relative z-10 flex items-center justify-between pt-3 border-t border-violet-900/60 text-[8px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>FREEDAYZZ.PULSE TELEMETRY LAB</span>
              </span>
              <span className="text-violet-400 font-bold">#NEVERSTOPRUNNING</span>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 border-t border-zinc-800 bg-[#070a14] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-zinc-400 font-sans">
            {isId
              ? 'Format gambar dioptimalkan untuk Instagram Stories & WhatsApp Status (2.5x HD PNG).'
              : 'Image rendered in 2.5x High Definition, ready for Instagram Story & WhatsApp.'}
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 border border-zinc-700 text-xs font-bold uppercase hover:bg-zinc-800 transition-colors"
            >
              {isId ? 'Batal' : 'Close'}
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownload}
              className="flex-1 sm:flex-initial px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider border border-violet-400 shadow-[3px_3px_0px_#4c1d95] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isId ? 'TERUNDUH!' : 'DOWNLOADED!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-cyan-300" />
                  <span>{isExporting ? (isId ? 'MEMPROSES...' : 'RENDERING...') : (isId ? 'DOWNLOAD GAMBAR STORY' : 'DOWNLOAD STORY PNG')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}