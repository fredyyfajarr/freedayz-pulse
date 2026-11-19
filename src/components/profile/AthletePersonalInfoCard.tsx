'use client';

import React, { useState, useEffect } from 'react';
import { Activity } from '@/domain/entities/Activity';
import { 
  HRProfileCalculator, 
  AthleteHRProfile, 
  CustomHRSettings, 
  HRMethod 
} from '@/domain/services/HRProfileCalculator';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { Heart, Zap, ShieldAlert, Check, RefreshCw, Edit3, X, HelpCircle, Watch, Sliders, Settings2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  activities: Activity[];
  garmin7dAvgRhr?: number;
  initialSettings?: {
    maxHr?: number;
    restingHr?: number;
    deviceName?: string;
  };
}

interface DraftHRSettings {
  method: HRMethod;
  restingHr: number | string;
  maxHr: number | string;
  lthr: number | string;
  hrrPercentages?: { idx: number; minP: number | string; maxP: number | string }[];
  maxHrPercentages?: { idx: number; minP: number | string; maxP: number | string }[];
  lthrPercentages?: { idx: number; minP: number | string; maxP: number | string }[];
  zonePercentages?: { idx: number; minP: number | string; maxP: number | string }[];
  manualZoneBpms?: { idx: number; minBpm: number | string; maxBpm: number | string }[];
}

/**
 * Sanitizes numeric input:
 * - Allows blank/empty string so user can clear the field to retype.
 * - Strips leading zeros before digits (e.g. '075' -> '75', '076' -> '76', '00' -> '0').
 * - Preserves decimals like '0.5' and '62.5'.
 */
const sanitizeNumericInput = (val: string, allowDecimal = true): string => {
  if (!val) return '';
  let cleaned = allowDecimal 
    ? val.replace(/[^0-9.]/g, '') 
    : val.replace(/[^0-9]/g, '');
  
  if (allowDecimal) {
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
  }

  // Strip leading zeros before digits: '075' -> '75', '007' -> '7', but keep '0.' or standalone '0'
  cleaned = cleaned.replace(/^0+(?=\d)/, '');
  return cleaned;
};

export default function AthletePersonalInfoCard({ activities, garmin7dAvgRhr, initialSettings }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [hrSettings, setHrSettings] = useState<CustomHRSettings>(() => {
    return HRProfileCalculator.getFallbackSettings(
      initialSettings?.restingHr || garmin7dAvgRhr || 51,
      initialSettings?.maxHr || 201
    );
  });

  const [deviceName, setDeviceName] = useState<string>(initialSettings?.deviceName || 'FORERUNNER 165');

  // Modal & Draft States
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draftSettings, setDraftSettings] = useState<DraftHRSettings>(() => hrSettings);
  const [draftDeviceName, setDraftDeviceName] = useState<string>(deviceName);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync listener & Initial Load from Client Storage
  useEffect(() => {
    setIsMounted(true);
    const stored = HRProfileCalculator.getStoredSettings();
    if (garmin7dAvgRhr && !stored.restingHr) {
      stored.restingHr = garmin7dAvgRhr;
    }
    setHrSettings(stored);
    setDraftSettings(stored);

    const handleUpdate = () => {
      setHrSettings(HRProfileCalculator.getStoredSettings());
    };
    window.addEventListener('athlete_hr_settings_updated', handleUpdate);
    return () => window.removeEventListener('athlete_hr_settings_updated', handleUpdate);
  }, [garmin7dAvgRhr]);

  const profile: AthleteHRProfile = HRProfileCalculator.calculateProfile(
    activities,
    undefined,
    undefined,
    undefined,
    undefined,
    hrSettings
  );

  // Sanitized safe settings for preview profile calculation
  const safeDraftSettings: CustomHRSettings = React.useMemo(() => {
    const parseNum = (v: any, fallback: number) => {
      const n = Number(v);
      return isNaN(n) || v === '' ? fallback : n;
    };
    const maxVal = parseNum(draftSettings.maxHr, 201);
    const restVal = parseNum(draftSettings.restingHr, 51);
    const lthrVal = parseNum(draftSettings.lthr, 177);

    const mapPcts = (arr?: { idx: number; minP: any; maxP: any }[]) => {
      if (!arr) return undefined;
      return arr.map(p => ({
        idx: p.idx,
        minP: parseNum(p.minP, 0),
        maxP: parseNum(p.maxP, 0),
      }));
    };

    const mapBpms = (arr?: { idx: number; minBpm: any; maxBpm: any }[]) => {
      if (!arr) return undefined;
      return arr.map(m => ({
        idx: m.idx,
        minBpm: parseNum(m.minBpm, 0),
        maxBpm: parseNum(m.maxBpm, 0),
      }));
    };

    return {
      method: draftSettings.method,
      maxHr: maxVal,
      restingHr: restVal,
      lthr: lthrVal,
      zonePercentages: mapPcts(draftSettings.zonePercentages),
      hrrPercentages: mapPcts(draftSettings.hrrPercentages),
      maxHrPercentages: mapPcts(draftSettings.maxHrPercentages),
      lthrPercentages: mapPcts(draftSettings.lthrPercentages),
      manualZoneBpms: mapBpms(draftSettings.manualZoneBpms),
    };
  }, [draftSettings]);

  // Preview profile for the modal
  const previewProfile: AthleteHRProfile = HRProfileCalculator.calculateProfile(
    activities,
    undefined,
    undefined,
    undefined,
    undefined,
    safeDraftSettings
  );

  const handleOpenModal = () => {
    const stored = HRProfileCalculator.getStoredSettings();
    const copy = JSON.parse(JSON.stringify(stored));
    const currentMax = copy.maxHr || 201;
    const currentLthr = copy.lthr || 177;

    if (!copy.hrrPercentages) {
      copy.hrrPercentages = HRProfileCalculator.DEFAULT_HRR_ZONES.map((z: any) => ({ idx: z.idx, minP: z.minP, maxP: z.maxP }));
    }
    if (!copy.maxHrPercentages) {
      copy.maxHrPercentages = HRProfileCalculator.DEFAULT_MAXHR_ZONES.map((z: any) => ({ idx: z.idx, minP: z.minP, maxP: z.maxP }));
    }
    if (!copy.lthrPercentages || copy.lthrPercentages?.[0]?.minP === 50) {
      const lthrMaxP = Math.round((currentMax / currentLthr) * 100);
      copy.lthrPercentages = HRProfileCalculator.DEFAULT_LTHR_ZONES.map((z: any) => ({
        idx: z.idx,
        minP: z.minP,
        maxP: z.idx === 5 ? Math.max(106, lthrMaxP) : z.maxP,
      }));
    }
    if (!copy.manualZoneBpms) {
      copy.manualZoneBpms = HRProfileCalculator.DEFAULT_MAXHR_ZONES.map((z: any) => ({
        idx: z.idx,
        minBpm: Math.round(currentMax * (z.minP / 100)),
        maxBpm: z.idx === 5 ? currentMax : Math.round(currentMax * (z.maxP / 100)),
      }));
    }

    if (copy.method === 'LTHR') {
      copy.zonePercentages = copy.lthrPercentages;
    } else if (copy.method === 'MAX_HR') {
      copy.zonePercentages = copy.maxHrPercentages;
    } else if (copy.method === 'HRR') {
      copy.zonePercentages = copy.hrrPercentages;
    }

    copy.manualZoneBpms = copy.manualZoneBpms.map((z: any) => (z.idx === 5 ? { ...z, maxBpm: currentMax } : z));

    setDraftSettings(copy);
    setDraftDeviceName(deviceName);
    setIsEditing(true);
  };

  const handleSelectMethod = (m: HRMethod) => {
    setDraftSettings(prev => {
      const currentMax = Number(prev.maxHr) || 201;
      const currentLthr = Number(prev.lthr) || 177;
      const copy: DraftHRSettings = { ...prev, method: m };

      if (m === 'MAX_HR') {
        const pcts = prev.maxHrPercentages || HRProfileCalculator.DEFAULT_MAXHR_ZONES.map(z => ({ idx: z.idx, minP: z.minP, maxP: z.maxP }));
        copy.maxHrPercentages = pcts;
        copy.zonePercentages = pcts;
      } else if (m === 'LTHR') {
        const lthrMaxP = Math.round((currentMax / currentLthr) * 100);
        const pcts = (prev.lthrPercentages && Number(prev.lthrPercentages[0]?.minP) >= 60)
          ? prev.lthrPercentages
          : HRProfileCalculator.DEFAULT_LTHR_ZONES.map(z => ({ 
              idx: z.idx, 
              minP: z.minP, 
              maxP: z.idx === 5 ? Math.max(106, lthrMaxP) : z.maxP 
            }));
        copy.lthrPercentages = pcts;
        copy.zonePercentages = pcts;
      } else if (m === 'HRR') {
        const pcts = prev.hrrPercentages || HRProfileCalculator.DEFAULT_HRR_ZONES.map(z => ({ idx: z.idx, minP: z.minP, maxP: z.maxP }));
        copy.hrrPercentages = pcts;
        copy.zonePercentages = pcts;
      } else if (m === 'MANUAL_BPM') {
        const defaultFromMaxHr = HRProfileCalculator.DEFAULT_MAXHR_ZONES.map(z => ({
          idx: z.idx,
          minBpm: Math.round(currentMax * (z.minP / 100)),
          maxBpm: z.idx === 5 ? currentMax : Math.round(currentMax * (z.maxP / 100)),
        }));
        const currentManual = prev.manualZoneBpms && prev.manualZoneBpms.length > 0
          ? prev.manualZoneBpms.map(z => (z.idx === 5 ? { ...z, maxBpm: currentMax } : z))
          : defaultFromMaxHr;
        copy.manualZoneBpms = currentManual;
      }
      return copy;
    });
  };

  const handleUpdatePercentage = (idx: number, field: 'minP' | 'maxP', val: string | number) => {
    setDraftSettings(prev => {
      const currentMethod = prev.method;
      const activePcts = currentMethod === 'LTHR'
        ? (prev.lthrPercentages || HRProfileCalculator.DEFAULT_LTHR_ZONES.map(z => ({ idx: z.idx, minP: z.minP, maxP: z.maxP })))
        : currentMethod === 'MAX_HR'
        ? (prev.maxHrPercentages || HRProfileCalculator.DEFAULT_MAXHR_ZONES.map(z => ({ idx: z.idx, minP: z.minP, maxP: z.maxP })))
        : (prev.hrrPercentages || HRProfileCalculator.DEFAULT_HRR_ZONES.map(z => ({ idx: z.idx, minP: z.minP, maxP: z.maxP })));

      const pcts = activePcts.map(p => ({ ...p }));
      const targetIdx = pcts.findIndex(p => p.idx === idx);
      if (targetIdx !== -1) {
        pcts[targetIdx] = { ...pcts[targetIdx], [field]: val };
      }

      const updated: DraftHRSettings = { ...prev, zonePercentages: pcts };
      if (currentMethod === 'HRR') updated.hrrPercentages = pcts;
      if (currentMethod === 'MAX_HR') updated.maxHrPercentages = pcts;
      if (currentMethod === 'LTHR') updated.lthrPercentages = pcts;
      return updated;
    });
  };

  const handleUpdateManualBpm = (idx: number, field: 'minBpm' | 'maxBpm', val: string | number) => {
    setDraftSettings(prev => {
      const currentMax = (idx === 5 && field === 'maxBpm') ? (Number(val) || 201) : (Number(prev.maxHr) || 201);
      const bpms = [...(prev.manualZoneBpms || HRProfileCalculator.DEFAULT_MAXHR_ZONES.map(z => ({ 
        idx: z.idx, 
        minBpm: Math.round(currentMax * (z.minP / 100)), 
        maxBpm: z.idx === 5 ? currentMax : Math.round(currentMax * (z.maxP / 100)) 
      })))].map(b => ({ ...b }));
      const targetIdx = bpms.findIndex(b => b.idx === idx);
      if (targetIdx !== -1) {
        bpms[targetIdx] = { ...bpms[targetIdx], [field]: val };
      }
      
      const syncedBpms = bpms.map(b => b.idx === 5 ? { ...b, maxBpm: currentMax } : b);

      return { 
        ...prev, 
        maxHr: currentMax,
        manualZoneBpms: syncedBpms 
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const parsedMaxHr = Number(draftSettings.maxHr) || 201;
      const parsedRestingHr = Number(draftSettings.restingHr) || 51;
      const parsedLthr = Number(draftSettings.lthr) || 177;

      const finalSettings: CustomHRSettings = {
        method: draftSettings.method,
        maxHr: parsedMaxHr,
        restingHr: parsedRestingHr,
        lthr: parsedLthr,
        hrrPercentages: draftSettings.hrrPercentages?.map(p => ({
          idx: p.idx,
          minP: Number(p.minP) || 0,
          maxP: Number(p.maxP) || 0,
        })),
        maxHrPercentages: draftSettings.maxHrPercentages?.map(p => ({
          idx: p.idx,
          minP: Number(p.minP) || 0,
          maxP: Number(p.maxP) || 0,
        })),
        lthrPercentages: draftSettings.lthrPercentages?.map(p => ({
          idx: p.idx,
          minP: Number(p.minP) || 0,
          maxP: Number(p.maxP) || 0,
        })),
        zonePercentages: draftSettings.zonePercentages?.map(p => ({
          idx: p.idx,
          minP: Number(p.minP) || 0,
          maxP: Number(p.maxP) || 0,
        })),
        manualZoneBpms: (draftSettings.manualZoneBpms || []).map(z => ({
          idx: z.idx,
          minBpm: Number(z.minBpm) || 0,
          maxBpm: z.idx === 5 ? parsedMaxHr : (Number(z.maxBpm) || parsedMaxHr),
        })),
      };

      HRProfileCalculator.saveStoredSettings(finalSettings);
      setHrSettings(finalSettings);
      setDeviceName(draftDeviceName.trim() || 'FORERUNNER 165');

      // Map manual zones to customZones payload for /api/settings/biometrics
      const customZonesPayload: any = {};
      if (finalSettings.manualZoneBpms) {
        finalSettings.manualZoneBpms.forEach(z => {
          if (z.idx === 1) { customZonesPayload.zone1Min = z.minBpm; customZonesPayload.zone1Max = z.maxBpm; }
          if (z.idx === 2) { customZonesPayload.zone2Min = z.minBpm; customZonesPayload.zone2Max = z.maxBpm; }
          if (z.idx === 3) { customZonesPayload.zone3Min = z.minBpm; customZonesPayload.zone3Max = z.maxBpm; }
          if (z.idx === 4) { customZonesPayload.zone4Min = z.minBpm; customZonesPayload.zone4Max = z.maxBpm; }
          if (z.idx === 5) { customZonesPayload.zone5Min = z.minBpm; customZonesPayload.zone5Max = finalSettings.maxHr; }
        });
      }

      await fetch('/api/settings/biometrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxHr: finalSettings.maxHr,
          restingHr: finalSettings.restingHr,
          customZones: Object.keys(customZonesPayload).length > 0 ? customZonesPayload : undefined,
          deviceName: draftDeviceName.trim() || 'FORERUNNER 165',
        }),
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 700);
    } catch (e) {
      console.error('Error updating biometrics:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-4 sm:p-6 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] space-y-4 sm:space-y-6 transition-colors w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-200 dark:border-zinc-800 gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-100 dark:bg-blue-950 border border-blue-400 dark:border-blue-600/60 text-blue-800 dark:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <Watch className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              {deviceName.toUpperCase()}
            </span>
            <span suppressHydrationWarning className="text-[10px] font-mono px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-700 text-violet-800 dark:text-violet-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-500" />
              {isId ? 'METODE DINAMIS' : 'DYNAMIC METHOD'}: {profile.methodType}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-black italic tracking-wide text-slate-900 dark:text-white uppercase mt-1 break-words">
            {isId ? 'ZONA DETAK JANTUNG // PROFIL BIOMETRIK' : 'HEART RATE ZONES // BIOMETRIC PROFILE'}
          </h2>
          <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
            {isId 
              ? 'KONFIGURASI FLEKSIBEL: %HRR KARVONEN, %MAX HR, %LTHR, ATAU MANUAL BPM SESUAI INTENSITAS'
              : 'FLEXIBLE CONFIGURATION: %HRR KARVONEN, %MAX HR, %LTHR, OR MANUAL BPM ZONES'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenModal}
            className="w-full sm:w-auto px-3.5 py-2 bg-violet-600 hover:bg-violet-700 dark:bg-violet-900 dark:hover:bg-violet-700 border-2 border-violet-400 dark:border-violet-500 text-white text-xs font-mono font-black uppercase transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_#7c3aed] cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-300" />
            <span>{isId ? 'ATUR ZONA MANUAL / PERSEN' : 'CONFIG ZONES & METHOD'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards: Method, Rest HR, Max HR, LTHR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 font-mono">
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-violet-800/60 p-2.5 sm:p-3 shadow-xs">
          <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-400 block tracking-wider font-bold truncate">
            {isId ? 'METODE HITUNG HR' : 'HR METHOD'}
          </span>
          <span suppressHydrationWarning className="text-xs sm:text-sm font-black text-violet-700 dark:text-violet-300 mt-0.5 block truncate">
            {profile.method}
          </span>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-bold">
            {isId ? 'KUSTOM DIAKTIFKAN' : 'CUSTOM ACTIVE'}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-cyan-800/60 p-2.5 sm:p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-400 block tracking-wider font-bold">
              {isId ? 'HR ISTIRAHAT' : 'RESTING HR'}
            </span>
            <Heart className="w-3 h-3 text-cyan-500 dark:text-cyan-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{profile.restingHr}</span>
            <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold">BPM</span>
          </div>
          <span className="text-[8px] sm:text-[9px] text-slate-500 dark:text-zinc-400 block truncate mt-0.5">
            {garmin7dAvgRhr ? `${isId ? 'SINKRON 7H' : '7D'}: ${garmin7dAvgRhr} BPM` : (isId ? 'DIKALIBRASI' : 'CALIBRATED')}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-rose-800/60 p-2.5 sm:p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-400 block tracking-wider font-bold">
              {isId ? 'HR MAKSIMAL' : 'MAX HR'}
            </span>
            <Zap className="w-3 h-3 text-rose-500 dark:text-rose-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">{profile.maxHr}</span>
            <span className="text-[9px] text-slate-500 dark:text-zinc-400">BPM</span>
          </div>
          <span className="text-[8px] sm:text-[9px] text-slate-400 dark:text-zinc-500 block truncate mt-0.5">
            HRR = {profile.heartRateReserve} BPM
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-amber-800/60 p-2.5 sm:p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-400 block tracking-wider font-bold">
              {isId ? 'AMBANG LAKTAT (LTHR)' : 'THRESHOLD (LTHR)'}
            </span>
            <ShieldAlert className="w-3 h-3 text-amber-500 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-300">{profile.estimatedLthr}</span>
            <span className="text-[9px] text-slate-500 dark:text-zinc-400">BPM</span>
          </div>
          <span className="text-[8px] sm:text-[9px] text-amber-600 dark:text-amber-400 block font-bold truncate mt-0.5">
            {isId ? 'AMBANG ZONA 4' : 'ZONE 4 THRESHOLD'}
          </span>
        </div>
      </div>

      {/* Biometrics Status Banner */}
      <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-violet-900/60 p-3 sm:p-3.5 font-mono flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
          <div>
            <span className="text-slate-900 dark:text-zinc-200 font-bold block text-[11px] sm:text-xs">
              {isId ? 'MESIN ZONA DETAK JANTUNG DINAMIS DIAKTIFKAN' : 'DYNAMIC HEART RATE ZONE ENGINE ACTIVE'}
            </span>
            <span suppressHydrationWarning className="text-[10px] sm:text-[11px] text-slate-600 dark:text-zinc-400 font-sans block mt-0.5">
              {isId
                ? `Menggunakan metode ${profile.method}. Semua 5 zona dihitung dan dikalibrasikan secara instan ke aktivitas latihan lari Anda.`
                : `Active method: ${profile.method}. All 5 training zones automatically synchronize across telemetry charts.`}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile 5-Zone Cards (< md) */}
      <div className="md:hidden space-y-2.5">
        {profile.zones.map(z => (
          <div key={z.zoneIndex} className="p-3 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-7 text-center py-0.5 text-[10px] font-black shrink-0 ${z.color}`}>
                  Z{z.zoneIndex}
                </span>
                <span className="font-bold text-slate-900 dark:text-white uppercase text-xs truncate">
                  {z.name}
                </span>
              </div>
              <span className="font-black text-xs text-cyan-600 dark:text-cyan-400 tabular-nums">
                {z.minBpm} – {z.maxBpm} BPM
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200 dark:border-zinc-800/80">
              <span suppressHydrationWarning className="text-slate-600 dark:text-zinc-400 font-bold">
                {profile.methodType === 'MANUAL_BPM' ? 'Manual BPM' : `${z.minPercent}% – ${z.maxPercent}%`}
              </span>
              <span className="text-slate-900 dark:text-white font-black tabular-nums">
                {PaceCalculator.formatDuration(z.totalTimeSeconds)}
                <span className="text-[10px] text-slate-400 ml-1 font-normal">({z.totalPercentOfTraining}%)</span>
              </span>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-sans leading-tight">
              {z.physiologicalRole}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop 5-Zone Table (>= md) */}
      <div className="hidden md:block overflow-x-auto w-full max-w-full">
        <table className="w-full text-left font-mono text-xs table-fixed min-w-[620px]">
          <thead>
            <tr className="border-b-2 border-slate-200 dark:border-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-widest bg-slate-50 dark:bg-[#070a14]">
              <th className="py-2.5 px-3 w-16 text-center">{isId ? 'ZONA' : 'ZONE'}</th>
              <th className="py-2.5 px-3 w-32">{isId ? 'NAMA' : 'NAME'}</th>
              <th suppressHydrationWarning className="py-2.5 px-3 w-36">{profile.methodType === 'MANUAL_BPM' ? (isId ? 'METODE' : 'METHOD') : (isId ? 'RENTANG INTENSITAS' : 'INTENSITY RANGE')}</th>
              <th className="py-2.5 px-3 w-40">{isId ? 'AMBANG BPM TEPAT' : 'EXACT BPM RANGE'}</th>
              <th className="py-2.5 px-3 w-auto">{isId ? 'PERAN FISIOLOGIS & MANFAAT METABOLIK' : 'PHYSIOLOGICAL ROLE & METABOLIC BENEFIT'}</th>
              <th className="py-2.5 px-3 w-44 text-right">{isId ? 'TOTAL WAKTU TERCATAT' : 'TOTAL TIME'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {profile.zones.map(z => (
              <tr key={z.zoneIndex} className="hover:bg-slate-50 dark:hover:bg-violet-950/20 transition-colors">
                <td className="py-3 px-3 text-center">
                  <span className={`px-2 py-0.5 text-[10px] font-black ${z.color}`}>
                    Z{z.zoneIndex}
                  </span>
                </td>
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white uppercase truncate">{z.name}</td>
                <td suppressHydrationWarning className="py-3 px-3 text-slate-600 dark:text-zinc-400 font-bold tabular-nums">
                  {profile.methodType === 'MANUAL_BPM' 
                    ? 'Manual BPM' 
                    : `${z.minPercent}% – ${z.maxPercent}%`}
                </td>
                <td className="py-3 px-3 font-black text-cyan-600 dark:text-cyan-300 tabular-nums">
                  {z.minBpm} – {z.maxBpm} BPM
                </td>
                <td className="py-3 px-3 text-[11px] text-slate-600 dark:text-zinc-300 truncate">
                  {z.physiologicalRole}
                </td>
                <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white tabular-nums">
                  {PaceCalculator.formatDuration(z.totalTimeSeconds)}
                  <span className="text-[10px] text-slate-400 dark:text-zinc-400 ml-1.5 font-normal">
                    ({z.totalPercentOfTraining}%)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT BIOMETRICS & MANUAL ZONES MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="bg-white dark:bg-[#0b0f1d] border-2 border-violet-500 shadow-[6px_6px_0px_#7c3aed] max-w-2xl w-full p-5 sm:p-6 space-y-5 font-mono text-slate-900 dark:text-white relative max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                <div>
                  <h3 className="text-sm font-black tracking-wider text-slate-900 dark:text-white uppercase">
                    {isId ? 'KALIBRASI_ZONA_HR & METODE' : 'HEART_RATE_ZONE_CALIBRATION'}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    {isId 
                      ? 'PILIH METODE %HRR, %MAX HR, %LTHR, ATAU INPUT ANGKA BPM MANUAL SESUKA ANDA'
                      : 'CHOOSE %HRR, %MAX HR, %LTHR, OR SET EXACT BPM VALUES MANUALLY'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Method Selection Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-700 dark:text-zinc-300 block">
                {isId ? '1. PILIH METODE PERHITUNGAN ZONA:' : '1. SELECT CALCULATION METHOD:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'HRR', label: '% HRR (Karvonen)' },
                  { id: 'MAX_HR', label: '% Max HR' },
                  { id: 'LTHR', label: '% LTHR (Friel)' },
                  { id: 'MANUAL_BPM', label: 'Manual BPM' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectMethod(opt.id as HRMethod)}
                    className={`py-2 px-2 text-xs font-black uppercase border-2 transition-all cursor-pointer text-center ${
                      draftSettings.method === opt.id
                        ? 'bg-violet-600 text-white border-violet-400 shadow-[2px_2px_0px_#7c3aed]'
                        : 'bg-slate-50 dark:bg-[#070a14] border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 hover:border-violet-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Anchor Biometrics (Resting, Max, LTHR) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                  {isId ? 'MAX HR (BPM)' : 'MAX HR (BPM)'}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={draftSettings.maxHr ?? ''}
                  onFocus={e => e.target.select()}
                  onChange={e => {
                    const clean = sanitizeNumericInput(e.target.value, false);
                    setDraftSettings(prev => {
                      const updatedManual = (prev.manualZoneBpms || HRProfileCalculator.DEFAULT_HRR_ZONES.map(z => ({ 
                        idx: z.idx, 
                        minBpm: z.minBpm, 
                        maxBpm: z.idx === 5 ? (Number(prev.maxHr) || 201) : z.maxBpm 
                      }))).map(m => {
                        if (m.idx === 5) {
                          return { ...m, maxBpm: clean === '' ? 201 : clean };
                        }
                        return m;
                      });
                      return {
                        ...prev,
                        maxHr: clean,
                        manualZoneBpms: updatedManual,
                      };
                    });
                  }}
                  onBlur={() => {
                    if (!draftSettings.maxHr || Number(draftSettings.maxHr) < 120) {
                      setDraftSettings(prev => ({ ...prev, maxHr: 201 }));
                    }
                  }}
                  className="w-full bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 p-2 font-mono font-black text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                  {isId ? 'RESTING HR (BPM)' : 'RESTING HR (BPM)'}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={draftSettings.restingHr ?? ''}
                  onFocus={e => e.target.select()}
                  onChange={e => {
                    const clean = sanitizeNumericInput(e.target.value, false);
                    setDraftSettings(prev => ({ ...prev, restingHr: clean }));
                  }}
                  onBlur={() => {
                    if (!draftSettings.restingHr || Number(draftSettings.restingHr) < 30) {
                      setDraftSettings(prev => ({ ...prev, restingHr: 51 }));
                    }
                  }}
                  className="w-full bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 p-2 font-mono font-black text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                  {isId ? 'LTHR AMBANG (BPM)' : 'LTHR THRESHOLD (BPM)'}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={draftSettings.lthr ?? ''}
                  onFocus={e => e.target.select()}
                  onChange={e => {
                    const clean = sanitizeNumericInput(e.target.value, false);
                    setDraftSettings(prev => ({ ...prev, lthr: clean }));
                  }}
                  onBlur={() => {
                    if (!draftSettings.lthr || Number(draftSettings.lthr) < 100) {
                      setDraftSettings(prev => ({ ...prev, lthr: 177 }));
                    }
                  }}
                  className="w-full bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 p-2 font-mono font-black text-sm outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* 3. Zone Configuration (Percentages or Manual BPMs) */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-700 dark:text-zinc-300 block">
                {draftSettings.method === 'MANUAL_BPM'
                  ? (isId ? '2. INPUT RANGE BPM MANUAL PER ZONA (Z1 - Z5):' : '2. INPUT MANUAL BPM RANGE PER ZONE (Z1 - Z5):')
                  : (isId ? `2. SESUAIKAN PERSENTASE ZONA (${draftSettings.method}):` : `2. ADJUST ZONE PERCENTAGES (${draftSettings.method}):`)}
              </label>

              <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#070a14] overflow-x-auto w-full max-w-full">
                <table className="w-full text-left font-mono text-xs border-collapse table-fixed min-w-[480px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3.5 w-36 text-left font-bold">{isId ? 'ZONA & NAMA' : 'ZONE & NAME'}</th>
                      <th className="py-2.5 px-3 text-center font-bold">
                        {draftSettings.method === 'MANUAL_BPM' 
                          ? (isId ? 'RENTANG INPUT (MIN – MAX BPM)' : 'INPUT RANGE (MIN – MAX BPM)') 
                          : (isId ? `RENTANG PERSENTASE % (${draftSettings.method})` : `PERCENTAGE RANGE % (${draftSettings.method})`)}
                      </th>
                      <th className="py-2.5 px-3.5 w-44 text-right font-bold">{isId ? 'HASIL KALIBRASI BPM' : 'RESULTING BPM'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {[1, 2, 3, 4, 5].map(idx => {
                      const previewZone = previewProfile.zones.find(z => z.zoneIndex === idx);
                      const activePcts = draftSettings.method === 'LTHR'
                        ? (draftSettings.lthrPercentages || draftSettings.zonePercentages)
                        : draftSettings.method === 'MAX_HR'
                        ? (draftSettings.maxHrPercentages || draftSettings.zonePercentages)
                        : (draftSettings.hrrPercentages || draftSettings.zonePercentages);
                      const userPct = activePcts?.find(p => p.idx === idx);
                      const userManual = draftSettings.manualZoneBpms?.find(m => m.idx === idx);

                      return (
                        <tr key={idx} className="bg-slate-50 dark:bg-[#070a14] hover:bg-slate-100/60 dark:hover:bg-zinc-900/60 transition-colors">
                          {/* Column 1: Zone & Name */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`w-7 text-center py-0.5 text-[10px] font-black shrink-0 ${previewZone?.color}`}>
                                Z{idx}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white uppercase text-xs truncate">
                                {previewZone?.name}
                              </span>
                            </div>
                          </td>

                          {/* Column 2: Exact Aligned Inputs */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center">
                              {draftSettings.method === 'MANUAL_BPM' ? (
                                <div className="flex items-center gap-1.5 font-mono">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={userManual?.minBpm !== undefined ? userManual.minBpm : (previewZone?.minBpm ?? '')}
                                    onFocus={e => e.target.select()}
                                    onChange={e => {
                                      const clean = sanitizeNumericInput(e.target.value, false);
                                      handleUpdateManualBpm(idx, 'minBpm', clean);
                                    }}
                                    onBlur={() => {
                                      if (!userManual?.minBpm || Number(userManual.minBpm) <= 0) {
                                        handleUpdateManualBpm(idx, 'minBpm', previewZone?.minBpm || 100);
                                      }
                                    }}
                                    className="w-16 sm:w-20 h-8 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 font-mono font-black text-center text-xs focus:border-cyan-500 outline-none"
                                  />
                                  <span className="w-5 text-center text-slate-400 font-bold">–</span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={idx === 5 ? (draftSettings.maxHr || 201) : (userManual?.maxBpm !== undefined ? userManual.maxBpm : (previewZone?.maxBpm ?? ''))}
                                    onFocus={e => e.target.select()}
                                    onChange={e => {
                                      const clean = sanitizeNumericInput(e.target.value, false);
                                      if (idx === 5) {
                                        setDraftSettings(prev => ({
                                          ...prev,
                                          maxHr: clean,
                                          manualZoneBpms: (prev.manualZoneBpms || []).map(m => m.idx === 5 ? { ...m, maxBpm: clean } : m)
                                        }));
                                      } else {
                                        handleUpdateManualBpm(idx, 'maxBpm', clean);
                                      }
                                    }}
                                    onBlur={() => {
                                      if (idx === 5) {
                                        if (!draftSettings.maxHr || Number(draftSettings.maxHr) < 120) {
                                          setDraftSettings(prev => ({ ...prev, maxHr: 201 }));
                                        }
                                      } else {
                                        if (!userManual?.maxBpm || Number(userManual.maxBpm) <= 0) {
                                          handleUpdateManualBpm(idx, 'maxBpm', previewZone?.maxBpm || 180);
                                        }
                                      }
                                    }}
                                    className="w-16 sm:w-20 h-8 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 font-mono font-black text-center text-xs focus:border-cyan-500 outline-none"
                                  />
                                  <span className="w-9 text-left text-[11px] text-slate-500 dark:text-zinc-400 font-bold">BPM</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 font-mono">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={userPct?.minP !== undefined ? userPct.minP : (previewZone?.minPercent ?? '')}
                                    onFocus={e => e.target.select()}
                                    onChange={e => {
                                      const clean = sanitizeNumericInput(e.target.value, true);
                                      handleUpdatePercentage(idx, 'minP', clean);
                                    }}
                                    onBlur={() => {
                                      if (!userPct?.minP || Number(userPct.minP) <= 0) {
                                        handleUpdatePercentage(idx, 'minP', previewZone?.minPercent || 50);
                                      }
                                    }}
                                    className="w-16 h-8 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 font-mono font-black text-center text-xs focus:border-violet-500 outline-none"
                                  />
                                  <span className="w-8 text-center text-slate-400 font-bold">% –</span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={userPct?.maxP !== undefined ? userPct.maxP : (previewZone?.maxPercent ?? '')}
                                    onFocus={e => e.target.select()}
                                    onChange={e => {
                                      const clean = sanitizeNumericInput(e.target.value, true);
                                      handleUpdatePercentage(idx, 'maxP', clean);
                                    }}
                                    onBlur={() => {
                                      if (!userPct?.maxP || Number(userPct.maxP) <= 0) {
                                        handleUpdatePercentage(idx, 'maxP', previewZone?.maxPercent || 100);
                                      }
                                    }}
                                    className="w-16 h-8 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 font-mono font-black text-center text-xs focus:border-violet-500 outline-none"
                                  />
                                  <span className="w-6 text-left text-slate-500 dark:text-zinc-400 font-bold text-[11px]">%</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Column 3: Resulting BPM */}
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            <span className="font-black text-xs text-cyan-600 dark:text-cyan-400 tabular-nums">
                              {previewZone?.minBpm} – {idx === 5 ? (draftSettings.maxHr || 201) : previewZone?.maxBpm}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 ml-1 font-normal">BPM</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold uppercase transition-colors cursor-pointer"
              >
                {isId ? 'BATAL' : 'CANCEL'}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 disabled:opacity-50 border border-violet-400 text-white font-bold uppercase transition-all flex items-center gap-2 shadow-[2px_2px_0px_#7c3aed] cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isId ? 'MENYIMPAN...' : 'SAVING...'}</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{isId ? 'TERSIMPAN & TERKALIBRASI!' : 'SAVED & CALIBRATED!'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{isId ? 'SIMPAN KALIBRASI ZONA' : 'SAVE ZONE CALIBRATION'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
