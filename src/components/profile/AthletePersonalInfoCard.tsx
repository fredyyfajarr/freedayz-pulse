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

export default function AthletePersonalInfoCard({ activities, garmin7dAvgRhr, initialSettings }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [hrSettings, setHrSettings] = useState<CustomHRSettings>(() => {
    const stored = HRProfileCalculator.getStoredSettings();
    if (garmin7dAvgRhr && !stored.restingHr) {
      stored.restingHr = garmin7dAvgRhr;
    }
    return stored;
  });

  const [deviceName, setDeviceName] = useState<string>(initialSettings?.deviceName || 'FORERUNNER 165');

  // Modal & Draft States
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draftSettings, setDraftSettings] = useState<CustomHRSettings>(hrSettings);
  const [draftDeviceName, setDraftDeviceName] = useState<string>(deviceName);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync listener
  useEffect(() => {
    const handleUpdate = () => {
      setHrSettings(HRProfileCalculator.getStoredSettings());
    };
    window.addEventListener('athlete_hr_settings_updated', handleUpdate);
    return () => window.removeEventListener('athlete_hr_settings_updated', handleUpdate);
  }, []);

  const profile: AthleteHRProfile = HRProfileCalculator.calculateProfile(
    activities,
    undefined,
    undefined,
    undefined,
    undefined,
    hrSettings
  );

  // Preview profile for the modal
  const previewProfile: AthleteHRProfile = HRProfileCalculator.calculateProfile(
    activities,
    undefined,
    undefined,
    undefined,
    undefined,
    draftSettings
  );

  const handleOpenModal = () => {
    const stored = HRProfileCalculator.getStoredSettings();
    const copy = JSON.parse(JSON.stringify(stored));
    if (copy.manualZoneBpms && copy.maxHr) {
      copy.manualZoneBpms = copy.manualZoneBpms.map((z: any) => 
        z.idx === 5 ? { ...z, maxBpm: copy.maxHr } : z
      );
    }
    setDraftSettings(copy);
    setDraftDeviceName(deviceName);
    setIsEditing(true);
  };

  const handleSelectMethod = (m: HRMethod) => {
    setDraftSettings(prev => {
      const copy: CustomHRSettings = { ...prev, method: m };
      if (m === 'MAX_HR' && (!copy.zonePercentages || copy.zonePercentages.length === 0)) {
        copy.zonePercentages = HRProfileCalculator.DEFAULT_MAXHR_ZONES.map(z => ({ idx: z.idx, minP: z.minP, maxP: z.maxP }));
      } else if (m === 'LTHR' && (!copy.zonePercentages || copy.zonePercentages.length === 0)) {
        copy.zonePercentages = HRProfileCalculator.DEFAULT_LTHR_ZONES.map(z => ({ idx: z.idx, minP: z.minP, maxP: z.maxP }));
      } else if (m === 'HRR' && (!copy.zonePercentages || copy.zonePercentages.length === 0)) {
        copy.zonePercentages = HRProfileCalculator.DEFAULT_HRR_ZONES.map(z => ({ idx: z.idx, minP: z.minP, maxP: z.maxP }));
      } else if (m === 'MANUAL_BPM') {
        const currentManual = copy.manualZoneBpms && copy.manualZoneBpms.length > 0
          ? copy.manualZoneBpms.map(z => (z.idx === 5 ? { ...z, maxBpm: copy.maxHr } : z))
          : HRProfileCalculator.DEFAULT_HRR_ZONES.map(z => ({ 
              idx: z.idx, 
              minBpm: z.minBpm, 
              maxBpm: z.idx === 5 ? copy.maxHr : z.maxBpm 
            }));
        copy.manualZoneBpms = currentManual;
      }
      return copy;
    });
  };

  const handleUpdatePercentage = (idx: number, field: 'minP' | 'maxP', val: number) => {
    setDraftSettings(prev => {
      const pcts = [...(prev.zonePercentages || HRProfileCalculator.DEFAULT_HRR_ZONES.map(z => ({ idx: z.idx, minP: z.minP, maxP: z.maxP })))];
      const targetIdx = pcts.findIndex(p => p.idx === idx);
      if (targetIdx !== -1) {
        pcts[targetIdx] = { ...pcts[targetIdx], [field]: val };
      }
      return { ...prev, zonePercentages: pcts };
    });
  };

  const handleUpdateManualBpm = (idx: number, field: 'minBpm' | 'maxBpm', val: number) => {
    setDraftSettings(prev => {
      const currentMax = (idx === 5 && field === 'maxBpm') ? val : prev.maxHr;
      const bpms = [...(prev.manualZoneBpms || HRProfileCalculator.DEFAULT_HRR_ZONES.map(z => ({ 
        idx: z.idx, 
        minBpm: z.minBpm, 
        maxBpm: z.idx === 5 ? prev.maxHr : z.maxBpm 
      })))];
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
      const finalSettings = {
        ...draftSettings,
        manualZoneBpms: (draftSettings.manualZoneBpms || []).map(z => 
          z.idx === 5 ? { ...z, maxBpm: draftSettings.maxHr } : z
        ),
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
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 sm:p-6 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-200 dark:border-zinc-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-100 dark:bg-blue-950 border border-blue-400 dark:border-blue-600/60 text-blue-800 dark:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <Watch className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              {deviceName.toUpperCase()}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-700 text-violet-800 dark:text-violet-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-500" />
              {isId ? 'METODE_DINAMIS' : 'DYNAMIC_METHOD'}: {profile.methodType}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black italic tracking-wide text-slate-900 dark:text-white uppercase mt-1">
            {isId ? 'ZONA_DETAK_JANTUNG_ATLET // PROFIL_BIOMETRIK' : 'ATHLETE_HEART_RATE_ZONES // BIOMETRIC_PROFILE'}
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
            className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 dark:bg-violet-900 dark:hover:bg-violet-700 border-2 border-violet-400 dark:border-violet-500 text-white text-xs font-mono font-black uppercase transition-all flex items-center gap-2 shadow-[2px_2px_0px_#7c3aed] cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-300" />
            <span>{isId ? 'ATUR ZONA MANUAL / PERSEN' : 'CONFIG ZONES & METHOD'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards: Method, Rest HR, Max HR, LTHR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-violet-800/60 p-3 shadow-sm dark:shadow-[2px_2px_0px_#7c3aed]">
          <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-400 block tracking-wider font-bold">
            {isId ? 'METODE HITUNG HR' : 'HR CALCULATION METHOD'}
          </span>
          <span className="text-sm font-black text-violet-700 dark:text-violet-300 mt-1 block truncate">
            {profile.method}
          </span>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-bold">
            {isId ? 'KUSTOM DIAKTIFKAN' : 'CUSTOM ACTIVE'}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-cyan-800/60 p-3 shadow-sm dark:shadow-[2px_2px_0px_#06b6d4]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-400 block tracking-wider font-bold">
              {isId ? 'DETAK JANTUNG ISTIRAHAT' : 'RESTING HR (RHR)'}
            </span>
            <Heart className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{profile.restingHr}</span>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">BPM</span>
          </div>
          <span className="text-[9px] text-slate-500 dark:text-zinc-400 block mt-0.5">
            {garmin7dAvgRhr ? `${isId ? 'SINKRON GARMIN 7H' : 'GARMIN 7D'} (${garmin7dAvgRhr} BPM)` : (isId ? 'DIKALIBRASI ATLET' : 'CALIBRATED')}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-rose-800/60 p-3 shadow-sm dark:shadow-[2px_2px_0px_#e11d48]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-400 block tracking-wider font-bold">
              {isId ? 'DETAK JANTUNG MAKSIMAL' : 'MAX HEART RATE'}
            </span>
            <Zap className="w-3 h-3 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{profile.maxHr}</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">BPM</span>
          </div>
          <span className="text-[9px] text-slate-400 dark:text-zinc-500 block mt-0.5">
            HRR = {profile.heartRateReserve} BPM
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-amber-800/60 p-3 shadow-sm dark:shadow-[2px_2px_0px_#d97706]">
          <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-400 block tracking-wider font-bold">
            {isId ? 'AMBANG LAKTAT (LTHR)' : 'THRESHOLD (LTHR)'}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-300">{profile.estimatedLthr}</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">BPM</span>
          </div>
          <span className="text-[9px] text-slate-400 dark:text-zinc-500 block mt-0.5">
            {isId ? 'AMBANG AMBANG ANAEROBIK' : 'ANAEROBIC THRESHOLD'}
          </span>
        </div>
      </div>

      {/* Biometrics Status Banner */}
      <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-violet-900/60 p-3.5 font-mono flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
          <div>
            <span className="text-slate-900 dark:text-zinc-200 font-bold block">
              {isId ? 'MESIN ZONA DETAK JANTUNG DINAMIS DIAKTIFKAN' : 'DYNAMIC HEART RATE ZONE ENGINE ACTIVE'}
            </span>
            <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-sans block mt-0.5">
              {isId
                ? `Menggunakan metode ${profile.method}. Semua 5 zona dihitung dan dikalibrasikan secara instan ke aktivitas latihan lari Anda.`
                : `Active method: ${profile.method}. All 5 training zones automatically synchronize across telemetry charts.`}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop 5-Zone Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b-2 border-slate-200 dark:border-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-widest bg-slate-50 dark:bg-[#070a14]">
              <th className="py-2.5 px-3">{isId ? 'ZONA' : 'ZONE'}</th>
              <th className="py-2.5 px-3">{isId ? 'NAMA' : 'NAME'}</th>
              <th className="py-2.5 px-3">{profile.methodType === 'MANUAL_BPM' ? (isId ? 'METODE' : 'METHOD') : (isId ? 'RENTANG INTENSITAS' : 'INTENSITY RANGE')}</th>
              <th className="py-2.5 px-3">{isId ? 'AMBANG BPM TEPAT' : 'EXACT BPM RANGE'}</th>
              <th className="py-2.5 px-3">{isId ? 'PERAN FISIOLOGIS & MANFAAT METABOLIK' : 'PHYSIOLOGICAL ROLE & METABOLIC BENEFIT'}</th>
              <th className="py-2.5 px-3 text-right">{isId ? 'TOTAL WAKTU TERCATAT' : 'TOTAL TIME'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {profile.zones.map(z => (
              <tr key={z.zoneIndex} className="hover:bg-slate-50 dark:hover:bg-violet-950/20 transition-colors">
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 text-[10px] font-black ${z.color}`}>
                    Z{z.zoneIndex}
                  </span>
                </td>
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white uppercase">{z.name}</td>
                <td className="py-3 px-3 text-slate-600 dark:text-zinc-400 font-bold">
                  {profile.methodType === 'MANUAL_BPM' 
                    ? 'Manual BPM' 
                    : `${z.minPercent}% – ${z.maxPercent}%`}
                </td>
                <td className="py-3 px-3 font-black text-cyan-600 dark:text-cyan-300">
                  {z.minBpm} – {z.maxBpm} BPM
                </td>
                <td className="py-3 px-3 text-[11px] text-slate-600 dark:text-zinc-300 max-w-sm">
                  {z.physiologicalRole}
                </td>
                <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white">
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
                  type="number"
                  min="130"
                  max="230"
                  value={draftSettings.maxHr}
                  onChange={e => {
                    const newMax = Number(e.target.value);
                    setDraftSettings(prev => {
                      const updatedManual = (prev.manualZoneBpms || HRProfileCalculator.DEFAULT_HRR_ZONES.map(z => ({ 
                        idx: z.idx, 
                        minBpm: z.minBpm, 
                        maxBpm: z.idx === 5 ? prev.maxHr : z.maxBpm 
                      }))).map(m => {
                        if (m.idx === 5) {
                          return { ...m, maxBpm: newMax };
                        }
                        return m;
                      });
                      return {
                        ...prev,
                        maxHr: newMax,
                        manualZoneBpms: updatedManual,
                      };
                    });
                  }}
                  className="w-full bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 p-2 font-mono font-black text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                  {isId ? 'RESTING HR (BPM)' : 'RESTING HR (BPM)'}
                </label>
                <input
                  type="number"
                  min="35"
                  max="100"
                  value={draftSettings.restingHr}
                  onChange={e => setDraftSettings(prev => ({ ...prev, restingHr: Number(e.target.value) }))}
                  className="w-full bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 p-2 font-mono font-black text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                  {isId ? 'LTHR AMBANG (BPM)' : 'LTHR THRESHOLD (BPM)'}
                </label>
                <input
                  type="number"
                  min="120"
                  max="210"
                  value={draftSettings.lthr}
                  onChange={e => setDraftSettings(prev => ({ ...prev, lthr: Number(e.target.value) }))}
                  className="w-full bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 p-2 font-mono font-black text-sm"
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

              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(idx => {
                  const previewZone = previewProfile.zones.find(z => z.zoneIndex === idx);
                  const userPct = draftSettings.zonePercentages?.find(p => p.idx === idx);
                  const userManual = draftSettings.manualZoneBpms?.find(m => m.idx === idx);

                  return (
                    <div 
                      key={idx}
                      className="p-2.5 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 w-32 shrink-0">
                        <span className={`px-2 py-0.5 text-[10px] font-black ${previewZone?.color}`}>
                          Z{idx}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white uppercase">{previewZone?.name}</span>
                      </div>

                      {draftSettings.method === 'MANUAL_BPM' ? (
                        /* Manual BPM inputs */
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="60"
                            max="230"
                            value={userManual?.minBpm ?? previewZone?.minBpm}
                            onChange={e => handleUpdateManualBpm(idx, 'minBpm', Number(e.target.value))}
                            className="w-20 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 p-1.5 font-black text-center text-xs"
                          />
                          <span className="text-slate-400">–</span>
                          <input
                            type="number"
                            min="60"
                            max="230"
                            value={idx === 5 ? draftSettings.maxHr : (userManual?.maxBpm ?? previewZone?.maxBpm)}
                            onChange={e => handleUpdateManualBpm(idx, 'maxBpm', Number(e.target.value))}
                            className="w-20 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 p-1.5 font-black text-center text-xs"
                          />
                          <span className="text-[10px] text-slate-500 font-bold">BPM</span>
                        </div>
                      ) : (
                        /* Percentage inputs */
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.5"
                            value={userPct?.minP ?? previewZone?.minPercent}
                            onChange={e => handleUpdatePercentage(idx, 'minP', Number(e.target.value))}
                            className="w-16 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 p-1.5 font-black text-center text-xs"
                          />
                          <span className="text-slate-400">% –</span>
                          <input
                            type="number"
                            step="0.5"
                            value={userPct?.maxP ?? previewZone?.maxPercent}
                            onChange={e => handleUpdatePercentage(idx, 'maxP', Number(e.target.value))}
                            className="w-16 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 p-1.5 font-black text-center text-xs"
                          />
                          <span className="text-slate-400">%</span>
                        </div>
                      )}

                      {/* Resulting BPM readout */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold">HASIL BPM</span>
                        <span className="font-black text-cyan-600 dark:text-cyan-400">
                          {previewZone?.minBpm} – {previewZone?.maxBpm} BPM
                        </span>
                      </div>
                    </div>
                  );
                })}
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
