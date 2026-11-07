'use client';

import React from 'react';
import { ACWRResult } from '@/domain/services/ACWRCalculator';
import { ShieldAlert, ShieldCheck, AlertTriangle, Zap, Activity, Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  acwr: ACWRResult;
}

export default function ACWRWidget({ acwr }: Props) {
  const { t, language } = useLanguage();

  // Styling according to Zone
  let theme = {
    color: 'text-emerald-400',
    border: 'border-emerald-500/80',
    bgBadge: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60',
    icon: ShieldCheck,
    barGradient: 'from-emerald-500 to-cyan-400',
    markerLeft: Math.min(100, Math.max(0, (acwr.ratio / 2.0) * 100)),
  };

  if (acwr.zone === 'DANGER_ZONE') {
    theme = {
      color: 'text-rose-400',
      border: 'border-rose-500/80',
      bgBadge: 'bg-rose-950/80 text-rose-300 border-rose-600/60',
      icon: ShieldAlert,
      barGradient: 'from-amber-500 to-rose-600',
      markerLeft: Math.min(100, Math.max(0, (acwr.ratio / 2.0) * 100)),
    };
  } else if (acwr.zone === 'ELEVATED_RISK') {
    theme = {
      color: 'text-amber-400',
      border: 'border-amber-500/80',
      bgBadge: 'bg-amber-950/80 text-amber-300 border-amber-600/60',
      icon: AlertTriangle,
      barGradient: 'from-cyan-500 to-amber-500',
      markerLeft: Math.min(100, Math.max(0, (acwr.ratio / 2.0) * 100)),
    };
  } else if (acwr.zone === 'UNDER_TRAINING') {
    theme = {
      color: 'text-blue-400',
      border: 'border-blue-500/80',
      bgBadge: 'bg-blue-950/80 text-blue-300 border-blue-600/60',
      icon: Activity,
      barGradient: 'from-blue-600 to-cyan-500',
      markerLeft: Math.min(100, Math.max(0, (acwr.ratio / 2.0) * 100)),
    };
  }

  const Icon = theme.icon;

  const localizedZoneLabel = () => {
    if (language !== 'ID') return acwr.zoneLabel;
    switch (acwr.zone) {
      case 'SWEET_SPOT':
        return 'ZONA IDEAL (OPTIMAL)';
      case 'ELEVATED_RISK':
        return 'RISIKO MENINGKAT';
      case 'DANGER_ZONE':
        return 'ZONA BAHAYA (RISIKO TINGGI)';
      case 'UNDER_TRAINING':
        return 'KURANG LATIHAN';
      default:
        return acwr.zoneLabel;
    }
  };

  const localizedRecommendation = () => {
    if (language !== 'ID') return acwr.coachingRecommendation;
    switch (acwr.zone) {
      case 'SWEET_SPOT':
        return 'Keseimbangan beban sangat baik. Rasio 7 hari terhadap 28 hari berada dalam rentang adaptasi optimal tanpa lonjakan risiko cedera.';
      case 'ELEVATED_RISK':
        return 'Beban latihan mingguan meningkat agak cepat. Disarankan menyisipkan lari easy Z2 atau hari istirahat.';
      case 'DANGER_ZONE':
        return 'Peringatan: Beban latihan akut melonjak tinggi dibanding kesiapan kronis. Prioritaskan tidur dan pemulihan aktif.';
      case 'UNDER_TRAINING':
        return 'Beban latihan saat ini di bawah kapasitas dasar kronis Anda. Kebugaran aerobik tetap terjaga baik.';
      default:
        return acwr.coachingRecommendation;
    }
  };

  return (
    <div className={`bg-[#0d1224] border-2 ${theme.border} p-5 shadow-[4px_4px_0px_#1e1b4b] font-mono space-y-4 transition-colors`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-800">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${theme.color}`} />
          <div>
            <h3 className="font-black italic tracking-widest uppercase text-sm text-white flex items-center gap-2">
              <span>{language === 'ID' ? 'ACWR // RADAR_RISIKO_CEDERA' : 'ACWR // INJURY_RISK_RADAR'}</span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              {language === 'ID' ? 'RASIO BEBAN LATIHAN AKUT-KE-KRONIS TIM GABBETT' : 'TIM GABBETT ACUTE-TO-CHRONIC WORKLOAD RATIO'}
            </p>
          </div>
        </div>
        <span className={`text-[9px] px-2 py-0.5 border font-bold uppercase ${theme.bgBadge}`}>
          {localizedZoneLabel()}
        </span>
      </div>

      {/* Main Ratio & Numbers */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-zinc-400 text-[10px] uppercase block tracking-wider">
            {language === 'ID' ? 'RASIO BEBAN (7H : 28H)' : 'WORKLOAD RATIO (7D : 28D)'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-3xl sm:text-4xl font-black ${theme.color}`}>
              {acwr.ratio.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-zinc-400">{language === 'ID' ? 'RASIO' : 'RATIO'}</span>
          </div>
        </div>

        <div className="text-right text-xs space-y-1">
          <div className="text-zinc-300">
            <span className="text-zinc-500 text-[10px] uppercase">{language === 'ID' ? '7H AKUT: ' : '7D ACUTE: '}</span>
            <strong className="text-white">{acwr.acuteLoad} pts</strong>
            <span className="text-zinc-400 text-[10px] ml-1">({acwr.acuteDistanceKm} km)</span>
          </div>
          <div className="text-zinc-300">
            <span className="text-zinc-500 text-[10px] uppercase">{language === 'ID' ? '28H DASAR: ' : '28D BASELINE: '}</span>
            <strong className="text-cyan-300">{acwr.chronicLoad} pts/wk</strong>
            <span className="text-zinc-400 text-[10px] ml-1">({acwr.chronicWeeklyDistanceKm} km/wk)</span>
          </div>
        </div>
      </div>

      {/* Visual Workload Gauge Bar */}
      <div>
        <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase mb-1">
          <span>&lt;0.8 {language === 'ID' ? 'PEMULIHAN' : 'RECOVERY'}</span>
          <span className="text-emerald-400">0.8 – 1.3 {language === 'ID' ? 'IDEAL' : 'SWEET SPOT'}</span>
          <span className="text-amber-400">1.3–1.5 {language === 'ID' ? 'NAIK' : 'RAMP'}</span>
          <span className="text-rose-400">&gt;1.5 {language === 'ID' ? 'BAHAYA' : 'DANGER'}</span>
        </div>

        <div className="relative w-full h-3 bg-[#070a14] border border-zinc-800 overflow-hidden">
          <div
            style={{ width: `${theme.markerLeft}%` }}
            className={`h-full bg-gradient-to-r ${theme.barGradient} transition-all duration-500`}
          />
        </div>
      </div>

      {/* Recommendation Footer Note */}
      <div className="pt-2 border-t border-zinc-800/80 flex items-start gap-2 text-xs text-zinc-300 font-sans">
        <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          {localizedRecommendation()}
        </p>
      </div>
    </div>
  );
}
