'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { HRProfileCalculator, CustomHRSettings } from '@/domain/services/HRProfileCalculator';

export default function HRRProfileWidget() {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [hrSettings, setHrSettings] = useState<CustomHRSettings | null>(null);

  useEffect(() => {
    const loadSettings = () => {
      const stored = HRProfileCalculator.getStoredSettings();
      setHrSettings(stored);
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
      undefined,
      undefined,
      undefined,
      undefined,
      hrSettings || undefined
    );
  }, [hrSettings]);

  const pz2 = profile.zones[1] || { minPercent: 62.5, maxPercent: 74.5, minBpm: 145, maxBpm: 162 };

  const getMethodBadge = () => {
    switch (profile.methodType) {
      case 'LTHR':
        return isId ? 'LTHR TERKALIBRASI' : 'LTHR CALIBRATED';
      case 'MAX_HR':
        return isId ? 'MAX HR TERKALIBRASI' : 'MAX HR CALIBRATED';
      case 'MANUAL_BPM':
        return isId ? 'MANUAL BPM KUSTOM' : 'CUSTOM MANUAL BPM';
      case 'HRR':
      default:
        return isId ? 'HRR TERKALIBRASI' : 'HRR CALIBRATED';
    }
  };

  const getMethodDesc = () => {
    switch (profile.methodType) {
      case 'LTHR':
        return isId
          ? 'Metode Ambang Laktat (Joe Friel LTHR) kustom aktif. Stres kardiak (TRIMP) dihitung berdasarkan profil ambang laktat aktual Anda.'
          : 'Custom Joe Friel Lactate Threshold (LTHR) method active. Cardiac strain (TRIMP) is calculated from your threshold profile.';
      case 'MAX_HR':
        return isId
          ? 'Metode persentase Denyut Jantung Maksimal (% Max HR) aktif. Stres kardiak (TRIMP) dihitung dari distribusi zona denyut puncak Anda.'
          : 'Percentage of Maximum Heart Rate (% Max HR) active. Cardiac strain (TRIMP) is calculated from your peak zones.';
      case 'MANUAL_BPM':
        return isId
          ? 'Rentang BPM manual kustom aktif. Stres kardiak (TRIMP) dihitung presisi dari target BPM zona yang Anda tentukan sendiri.'
          : 'Custom manual BPM ranges active. Cardiac strain (TRIMP) is calculated precisely from your designated BPM brackets.';
      case 'HRR':
      default:
        return isId
          ? 'Formula Heart Rate Reserve (Karvonen) kustom aktif. Stres kardiak (TRIMP) dihitung dari distribusi 5 zona denyut cadangan Anda.'
          : 'Custom Karvonen Heart Rate Reserve (HRR) formula active. Cardiac strain (TRIMP) is calculated from your reserve zones.';
    }
  };

  const getZ2Label = () => {
    if (profile.methodType === 'MANUAL_BPM') {
      return isId ? 'Z2 LARI SANTAI (BASIS AEROBIK)' : 'Z2 EASY (AEROBIC BASE)';
    }
    const methodAbbr = profile.methodType === 'MAX_HR' ? 'MAX HR' : profile.methodType;
    return isId
      ? `Z2 LARI SANTAI (${pz2.minPercent}% – ${pz2.maxPercent}% ${methodAbbr})`
      : `Z2 EASY (${pz2.minPercent}% – ${pz2.maxPercent}% ${methodAbbr})`;
  };

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-4 sm:p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] font-mono transition-colors w-full min-w-0">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 min-w-0">
          <Heart className="w-4 h-4 fill-rose-500 shrink-0" />
          <span className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white truncate">
            {isId ? 'PROFIL_ZONA_HR_KUSTOM' : 'CUSTOM_HR_ZONE_PROFILE'}
          </span>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-700 text-violet-800 dark:text-violet-300 font-bold shrink-0 whitespace-nowrap">
          {getMethodBadge()}
        </span>
      </div>
      <p className="text-[11px] text-slate-600 dark:text-zinc-300 font-sans leading-relaxed break-words">
        {getMethodDesc()}
      </p>
      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800/80 flex justify-between items-center text-[10px]">
        <span className="text-slate-500 dark:text-zinc-500">{getZ2Label()}</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
          {pz2.minBpm} – {pz2.maxBpm} BPM
        </span>
      </div>
      <div className="mt-2 text-right">
        <Link
          href="/settings#biometrics"
          className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 tracking-wider inline-flex items-center gap-1"
        >
          <span>{isId ? 'LIHAT RINCIAN ZONA LENGKAP' : 'VIEW FULL ZONE BREAKDOWN'}</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
