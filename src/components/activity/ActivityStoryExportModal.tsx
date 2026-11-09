'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Activity } from '@/domain/entities/Activity';
import { GeoPoint } from '@/domain/entities/ActivityDetail';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { toPng } from 'html-to-image';
import {
  Download,
  X,
  Share2,
  Smartphone,
  Square,
  Check,
  Heart,
  Mountain,
  Flame,
  Footprints,
  Timer,
  Zap,
  Layers,
  Palette,
  Eye,
  Sparkles,
} from 'lucide-react';
import BrandLogo from '@/components/brand/BrandLogo';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  activity: Activity;
  polyline?: GeoPoint[];
  isOpen: boolean;
  onClose: () => void;
}

type BackgroundStyle = 'transparent' | 'dark' | 'glass';
type ColorTheme = 'coral' | 'cyan' | 'volt' | 'white';

export default function ActivityStoryExportModal({
  activity,
  polyline = [],
  isOpen,
  onClose,
}: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';
  const cardRef = useRef<HTMLDivElement>(null);

  // Customization controls
  const [format, setFormat] = useState<'story' | 'square'>('story'); // 9:16 vs 1:1
  const [bgStyle, setBgStyle] = useState<BackgroundStyle>('transparent'); // Default transparent PNG sticker!
  const [theme, setTheme] = useState<ColorTheme>('coral'); // Default vibrant athletic coral
  const [previewBg, setPreviewBg] = useState<'checker' | 'photo'>('photo'); // Preview backdrop for transparent mode
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const durationSec = activity.movingDurationSeconds || activity.durationSeconds;
  const distanceKm = (activity.distanceMeters / 1000).toFixed(2);
  const formattedPace = PaceCalculator.formatPace(activity.avgPaceSecPerKm);
  const paceNum = formattedPace.replace(' /km', '');
  const durationStr = PaceCalculator.formatDuration(durationSec);

  const calculatedCadence = activity.dynamics?.avgCadence || (durationSec && activity.steps ? Math.round(activity.steps / (durationSec / 60)) : undefined);

  const dateFormatted = new Date(activity.startTime).toLocaleDateString(
    isId ? 'id-ID' : 'en-US',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  ).toUpperCase();

  // Color palette definitions
  const themeColors = {
    coral: {
      name: isId ? 'Strava Coral' : 'Strava Coral',
      accent: '#ff5722',
      accentGradient: 'from-[#ff5722] to-[#f97316]',
      textAccent: 'text-[#ff5722]',
      mapStroke: '#ff5722',
      glow: 'rgba(255, 87, 34, 0.6)',
      badgeBg: 'bg-[#ff5722]/15 border-[#ff5722]/50 text-[#ff7043]',
    },
    cyan: {
      name: isId ? 'Pulse Cyan' : 'Pulse Cyan',
      accent: '#06b6d4',
      accentGradient: 'from-[#06b6d4] to-[#8b5cf6]',
      textAccent: 'text-[#06b6d4]',
      mapStroke: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.6)',
      badgeBg: 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300',
    },
    volt: {
      name: isId ? 'Volt Lime' : 'Volt Lime',
      accent: '#84cc16',
      accentGradient: 'from-[#84cc16] to-[#10b981]',
      textAccent: 'text-[#a3e635]',
      mapStroke: '#a3e635',
      glow: 'rgba(132, 204, 22, 0.6)',
      badgeBg: 'bg-lime-500/15 border-lime-400/50 text-lime-300',
    },
    white: {
      name: isId ? 'Diamond White' : 'Diamond White',
      accent: '#ffffff',
      accentGradient: 'from-white to-zinc-200',
      textAccent: 'text-white',
      mapStroke: '#ffffff',
      glow: 'rgba(255, 255, 255, 0.5)',
      badgeBg: 'bg-white/10 border-white/30 text-white',
    },
  };

  const currentTheme = themeColors[theme];

  // Vector SVG Map projection from raw GPS polyline
  const svgMap = useMemo(() => {
    if (!polyline || polyline.length < 2) return null;

    // Sub-sample if polyline is very dense for smooth rendering
    const step = polyline.length > 250 ? Math.ceil(polyline.length / 250) : 1;
    const pts = polyline.filter((_, idx) => idx % step === 0 || idx === polyline.length - 1);

    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
    for (const pt of pts) {
      if (pt.lat < minLat) minLat = pt.lat;
      if (pt.lat > maxLat) maxLat = pt.lat;
      if (pt.lon < minLon) minLon = pt.lon;
      if (pt.lon > maxLon) maxLon = pt.lon;
    }

    const width = format === 'story' ? 270 : 310;
    const height = format === 'story' ? 160 : 150;
    const padding = 16;

    const midLat = (minLat + maxLat) / 2;
    const cosLat = Math.cos((midLat * Math.PI) / 180);

    const dLat = (maxLat - minLat) || 1e-6;
    const dLon = ((maxLon - minLon) * cosLat) || 1e-6;

    const drawW = width - padding * 2;
    const drawH = height - padding * 2;
    const scale = Math.min(drawW / dLon, drawH / dLat);

    const offsetX = (width - dLon * scale) / 2;
    const offsetY = (height - dLat * scale) / 2;

    const coords = pts.map(pt => {
      const x = offsetX + (pt.lon - minLon) * cosLat * scale;
      const y = height - (offsetY + (pt.lat - minLat) * scale);
      return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
    });

    const pathD = coords.reduce((acc, [x, y], idx) => {
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');

    return {
      pathD,
      startPt: coords[0],
      endPt: coords[coords.length - 1],
      width,
      height,
    };
  }, [polyline, format]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      const isTransparent = bgStyle === 'transparent';
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: format === 'story' ? 3.73 : 3.375, // Ultra-crisp 1080x1920 (Story) or 1080x1080 (Square)
        backgroundColor: isTransparent ? undefined : (bgStyle === 'dark' ? '#06070a' : undefined),
      });

      const link = document.createElement('a');
      const suffix = isTransparent ? 'sticker-transparent' : `${bgStyle}-${theme}`;
      link.download = `freedayzz-${activity.id.slice(0, 8)}-${suffix}-${format}.png`;
      link.href = dataUrl;
      link.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error exporting story sticker:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b0e1b] border-2 border-zinc-800 max-w-2xl w-full max-h-[96vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden font-mono text-zinc-100">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between p-3.5 sm:p-4 border-b border-zinc-800 bg-[#070913] gap-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-orange-400" />
            <div>
              <h2 className="text-xs sm:text-sm font-black italic tracking-wide uppercase text-white">
                {isId ? 'SHARE STORY // STIKER ALA STRAVA' : 'SHARE STORY // STRAVA-STYLE STICKER'}
              </h2>
              <span className="text-[10px] text-zinc-400 font-sans block">
                {isId ? 'Download PNG transparan untuk ditempel di foto IG Story / status WA' : 'Export transparent PNG sticker for Instagram Stories / WhatsApp'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Toggle */}
            <div className="flex items-center p-0.5 bg-black/50 border border-zinc-800 rounded">
              <button
                type="button"
                onClick={() => setFormat('story')}
                className={`px-2 py-1 flex items-center gap-1 font-bold text-[10px] uppercase rounded transition-colors ${
                  format === 'story' ? 'bg-orange-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
                title="9:16 Instagram Story Format"
              >
                <Smartphone className="w-3 h-3" />
                <span>9:16</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('square')}
                className={`px-2 py-1 flex items-center gap-1 font-bold text-[10px] uppercase rounded transition-colors ${
                  format === 'square' ? 'bg-orange-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
                title="1:1 Square Feed Format"
              >
                <Square className="w-3 h-3" />
                <span>1:1</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Style Customizer Bar */}
        <div className="px-4 py-2.5 bg-[#090b16] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Background Style Option */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1">
              <Layers className="w-3 h-3 text-orange-400" />
              {isId ? 'TIPE:' : 'STYLE:'}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setBgStyle('transparent')}
                className={`px-2.5 py-1 text-[10px] font-black uppercase rounded transition-all ${
                  bgStyle === 'transparent'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                ✨ {isId ? 'TRANSPARAN (STIKER)' : 'TRANSPARENT'}
              </button>
              <button
                type="button"
                onClick={() => setBgStyle('dark')}
                className={`px-2.5 py-1 text-[10px] font-black uppercase rounded transition-all ${
                  bgStyle === 'dark'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                🌑 {isId ? 'HITAM OLED' : 'OLED DARK'}
              </button>
              <button
                type="button"
                onClick={() => setBgStyle('glass')}
                className={`px-2.5 py-1 text-[10px] font-black uppercase rounded transition-all ${
                  bgStyle === 'glass'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                🌫️ {isId ? 'FROSTED KACA' : 'FROSTED GLASS'}
              </button>
            </div>
          </div>

          {/* Color Palette Option */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1">
              <Palette className="w-3 h-3 text-cyan-400" />
              {isId ? 'WARNA:' : 'COLOR:'}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTheme('coral')}
                className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border transition-all ${
                  theme === 'coral' ? 'border-[#ff5722] text-[#ff5722] bg-[#ff5722]/10 font-black' : 'border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                CORAL
              </button>
              <button
                type="button"
                onClick={() => setTheme('cyan')}
                className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border transition-all ${
                  theme === 'cyan' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10 font-black' : 'border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                CYAN
              </button>
              <button
                type="button"
                onClick={() => setTheme('volt')}
                className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border transition-all ${
                  theme === 'volt' ? 'border-lime-400 text-lime-400 bg-lime-400/10 font-black' : 'border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                VOLT
              </button>
              <button
                type="button"
                onClick={() => setTheme('white')}
                className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border transition-all ${
                  theme === 'white' ? 'border-white text-white bg-white/10 font-black' : 'border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                WHITE
              </button>
            </div>
          </div>

          {/* Preview Backdrop Toggle (Only in Transparent Mode) */}
          {bgStyle === 'transparent' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1">
                <Eye className="w-3 h-3 text-emerald-400" />
                {isId ? 'PRATINJAU:' : 'PREVIEW:'}
              </span>
              <button
                type="button"
                onClick={() => setPreviewBg(prev => prev === 'photo' ? 'checker' : 'photo')}
                className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-[9px] font-bold rounded uppercase transition-colors"
                title="Ganti latar belakang simulasi di layar ini saja"
              >
                {previewBg === 'photo' ? (isId ? '🖼️ Simulasi Foto' : '🖼️ Photo Simulation') : (isId ? '🏁 Transparan Grid' : '🏁 Checkerboard')}
              </button>
            </div>
          )}
        </div>

        {/* Modal Body: Live Canvas Preview Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 flex items-center justify-center bg-[#05060b]">
          {/* Simulated Photo / Checkerboard Wrapper */}
          <div
            className={`relative p-1.5 rounded-xl transition-all ${
              bgStyle === 'transparent'
                ? previewBg === 'photo'
                  ? 'bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617] shadow-[0_10px_35px_rgba(0,0,0,0.8)] border border-zinc-800'
                  : 'bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:12px_12px] bg-zinc-950 border border-zinc-800'
                : 'bg-black/60 border border-zinc-800'
            }`}
          >
            {/* The Actual Downloadable Canvas Container */}
            <div
              ref={cardRef}
              style={{
                backgroundColor: bgStyle === 'dark' ? '#06070a' : (bgStyle === 'glass' ? 'rgba(9, 11, 22, 0.75)' : 'transparent'),
              }}
              className={`relative flex flex-col justify-between transition-all select-none ${
                bgStyle === 'glass' ? 'backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5' : 'p-4 sm:p-5'
              } ${
                format === 'story' ? 'w-[285px] h-[506px] sm:w-[295px] sm:h-[524px]' : 'w-[320px] h-[320px]'
              }`}
            >
              {/* Top Header: Brand & Date (Clean floating overlay) */}
              <div className="flex items-center justify-between pb-1.5 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <BrandLogo size={22} />
                  <div>
                    <span className="text-xs font-black italic tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                      FREEDAYZZ<span className={currentTheme.textAccent}>.PULSE</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[8px] px-1.5 py-0.5 font-bold uppercase rounded tracking-wider border ${currentTheme.badgeBg} drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]`}>
                    {activity.sportType.toUpperCase()}
                  </span>
                  <span className="text-[8px] font-mono text-zinc-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                    {dateFormatted}
                  </span>
                </div>
              </div>

              {/* Centerpiece: GPS Route Map (Minimalist Vector Polyline) */}
              <div className="flex-1 flex flex-col items-center justify-center my-1 relative">
                {svgMap ? (
                  <div className="relative flex items-center justify-center w-full">
                    <svg
                      viewBox={`0 0 ${svgMap.width} ${svgMap.height}`}
                      className="w-full max-h-[160px] filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                    >
                      <defs>
                        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={currentTheme.accent} />
                          <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Under-glow stroke for extreme readability on any photo background */}
                      <path
                        d={svgMap.pathD}
                        fill="none"
                        stroke="#000000"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.7"
                      />

                      {/* Main vibrant glowing route path */}
                      <path
                        d={svgMap.pathD}
                        fill="none"
                        stroke={currentTheme.mapStroke}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Start Point Marker (Neon Dot) */}
                      {svgMap.startPt && (
                        <g>
                          <circle cx={svgMap.startPt[0]} cy={svgMap.startPt[1]} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                        </g>
                      )}

                      {/* Finish Point Marker (Checkered / Accent Dot) */}
                      {svgMap.endPt && (
                        <g>
                          <circle cx={svgMap.endPt[0]} cy={svgMap.endPt[1]} r="6" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx={svgMap.endPt[0]} cy={svgMap.endPt[1]} r="2" fill="#ffffff" />
                        </g>
                      )}
                    </svg>
                  </div>
                ) : (
                  /* Fallback elegant wave for treadmill or stationary workouts */
                  <div className="w-full flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-2">
                      <Zap className={`w-8 h-8 ${currentTheme.textAccent} animate-pulse`} />
                    </div>
                    <span className="text-[10px] text-zinc-300 font-bold uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                      {activity.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Main Typography Metrics (Ala Strava Clean HUD — NO nested boxes!) */}
              <div className="space-y-2 pt-1">
                {/* Hero Distance (Giant & Crisp) */}
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl sm:text-5xl font-black italic tracking-tighter text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] leading-none">
                      {distanceKm}
                    </span>
                    <span className={`text-xs sm:text-sm font-black italic ${currentTheme.textAccent} drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]`}>
                      KM
                    </span>
                  </div>
                  <span className="text-[8px] tracking-widest uppercase text-zinc-300 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] block mt-0.5">
                    {isId ? 'JARAK LARI' : 'DISTANCE'}
                  </span>
                </div>

                {/* Secondary Row: Pace, Time, Heart Rate (Clean columns) */}
                <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-white/15 text-center">
                  {/* Pace */}
                  <div>
                    <span className="text-lg sm:text-xl font-black italic text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] block leading-tight">
                      {paceNum}
                    </span>
                    <span className="text-[7.5px] tracking-wider uppercase text-zinc-300 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] block">
                      {isId ? 'PACE (/KM)' : 'AVG PACE'}
                    </span>
                  </div>

                  {/* Duration */}
                  <div>
                    <span className="text-lg sm:text-xl font-black italic text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] block leading-tight">
                      {durationStr}
                    </span>
                    <span className="text-[7.5px] tracking-wider uppercase text-zinc-300 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] block">
                      {isId ? 'WAKTU' : 'TIME'}
                    </span>
                  </div>

                  {/* Heart Rate */}
                  <div>
                    <div className="flex items-center justify-center gap-0.5">
                      <span className={`text-lg sm:text-xl font-black italic ${activity.avgHeartRate ? currentTheme.textAccent : 'text-white'} drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] leading-tight`}>
                        {activity.avgHeartRate ? Math.round(activity.avgHeartRate) : '--'}
                      </span>
                    </div>
                    <span className="text-[7.5px] tracking-wider uppercase text-zinc-300 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] block">
                      {isId ? 'DETAK JANTUNG' : 'AVG HR (BPM)'}
                    </span>
                  </div>
                </div>

                {/* Tertiary Micro Row: Elevation, Cadence, Calories (Story format only) */}
                {format === 'story' && (
                  <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-white/10 text-center text-[8px] text-zinc-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                    <div>
                      <span className="text-white font-bold block">{activity.elevationGainMeters || 0} m</span>
                      <span className="text-[7px] uppercase tracking-wider text-zinc-400 block">{isId ? 'ELEVASI' : 'ELEVATION'}</span>
                    </div>
                    <div>
                      <span className="text-white font-bold block">{calculatedCadence || '--'} spm</span>
                      <span className="text-[7px] uppercase tracking-wider text-zinc-400 block">{isId ? 'KADENSI' : 'CADENCE'}</span>
                    </div>
                    <div>
                      <span className="text-white font-bold block">{activity.calories || '--'} kcal</span>
                      <span className="text-[7px] uppercase tracking-wider text-zinc-400 block">{isId ? 'KALORI' : 'CALORIES'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Subtle Runner Tag */}
              <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[8px] text-zinc-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                <span className="font-mono tracking-widest">#FREEDAYZZPULSE</span>
                <span className="font-mono font-bold tracking-wider text-white">FORERUNNER 165</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 border-t border-zinc-800 bg-[#070913] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] text-zinc-300 font-sans">
              {bgStyle === 'transparent'
                ? (isId ? 'Hasil unduhan berupa PNG transparan, siap ditempel di atas foto story Anda.' : 'Outputs a clean transparent PNG, perfect as a floating sticker over your photos.')
                : (isId ? 'Hasil unduhan memiliki latar belakang solid siap posting.' : 'Outputs a high-resolution graphic ready for sharing.')}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 border border-zinc-700 text-xs font-bold uppercase hover:bg-zinc-800 transition-colors rounded"
            >
              {isId ? 'Tutup' : 'Close'}
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownload}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-orange-600 via-[#ff5722] to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded shadow-[0_4px_16px_rgba(255,87,34,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{isId ? 'BERHASIL TERUNDUH!' : 'SUCCESSFULLY DOWNLOADED!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>
                    {isExporting
                      ? (isId ? 'MERENDER 3X HD...' : 'RENDERING 3X HD...')
                      : (bgStyle === 'transparent' ? (isId ? 'DOWNLOAD STIKER TRANSPARAN' : 'DOWNLOAD TRANSPARENT PNG') : (isId ? 'DOWNLOAD GAMBAR STORY' : 'DOWNLOAD STORY PNG'))}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
