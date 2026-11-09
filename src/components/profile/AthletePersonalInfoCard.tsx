'use client';

import React, { useState } from 'react';
import { Activity } from '@/domain/entities/Activity';
import { HRProfileCalculator, AthleteHRProfile } from '@/domain/services/HRProfileCalculator';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { AthleteBiometricSettings, CustomHRZoneThresholds, DEFAULT_CUSTOM_ZONES } from '@/domain/entities/AthleteSettings';
import { Heart, ShieldCheck, Zap, Watch, Edit3, X, Check, RefreshCw, Sliders } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  activities: Activity[];
  initialSettings?: AthleteBiometricSettings;
  garmin7dAvgRhr?: number;
}

export default function AthletePersonalInfoCard({ activities, initialSettings, garmin7dAvgRhr }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';
  const [restingHr, setRestingHr] = useState<number>(garmin7dAvgRhr || initialSettings?.restingHr || 51);
  const [maxHr, setMaxHr] = useState<number>(initialSettings?.maxHr || 200);
  const [customZones, setCustomZones] = useState<CustomHRZoneThresholds>(
    initialSettings?.customZones || DEFAULT_CUSTOM_ZONES
  );

  // Edit Modal State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draftRestingHr, setDraftRestingHr] = useState<number>(garmin7dAvgRhr || restingHr);
  const [draftMaxHr, setDraftMaxHr] = useState<number>(maxHr);
  const [draftCustomZones, setDraftCustomZones] = useState<CustomHRZoneThresholds>(
    initialSettings?.customZones || DEFAULT_CUSTOM_ZONES
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Exact %HRR brackets configured in user's Garmin Connect Running profile (Zone 2 max = 162 BPM)
  const brackets = [
    { idx: 1, minP: 50, maxP: 62.5 },
    { idx: 2, minP: 62.5, maxP: 74.5 },
    { idx: 3, minP: 74.5, maxP: 84 },
    { idx: 4, minP: 84, maxP: 92 },
    { idx: 5, minP: 92, maxP: 100 },
  ];

  const profile: AthleteHRProfile = HRProfileCalculator.calculateProfile(
    activities,
    restingHr,
    maxHr,
    brackets,
    customZones
  );

  // Preview draft zones in edit modal
  const draftHrr = Math.max(1, draftMaxHr - draftRestingHr);
  const previewZ1Min = draftCustomZones.zone1Min || Math.round(draftRestingHr + draftHrr * 0.50);
  const previewZ1Max = draftCustomZones.zone1Max || Math.round(draftRestingHr + draftHrr * 0.625);
  const previewZ2Min = draftCustomZones.zone2Min || (previewZ1Max + 1);
  const previewZ2Max = draftCustomZones.zone2Max || 162;
  const previewZ3Min = draftCustomZones.zone3Min || (previewZ2Max + 1);
  const previewZ3Max = draftCustomZones.zone3Max || Math.round(draftRestingHr + draftHrr * 0.84);
  const previewZ4Min = draftCustomZones.zone4Min || (previewZ3Max + 1);
  const previewZ4Max = draftCustomZones.zone4Max || Math.round(draftRestingHr + draftHrr * 0.92);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/biometrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxHr: draftMaxHr,
          restingHr: draftRestingHr,
          customZones: draftCustomZones,
        }),
      });
      if (res.ok) {
        setRestingHr(draftMaxHr > draftRestingHr ? draftRestingHr : restingHr);
        setMaxHr(draftMaxHr > draftRestingHr ? draftMaxHr : maxHr);
        setCustomZones(draftCustomZones);
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setIsEditing(false);
        }, 800);
      }
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
            <Watch className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-100 dark:bg-blue-950 border border-blue-400 dark:border-blue-600/60 text-blue-800 dark:text-blue-300 font-bold uppercase tracking-wider">
              {isId ? 'KALIBRASI_GARMIN // PROFIL_%HRR' : 'GARMIN_CALIBRATION // %HRR_PROFILE'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-700 text-violet-800 dark:text-violet-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-500" />
              {isId ? 'SINKRON_DINAMIS' : 'DYNAMIC_SYNC'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black italic tracking-wide text-slate-900 dark:text-white uppercase mt-1">
            {isId ? 'ZONA_DETAK_JANTUNG_ATLET // PROFIL_BIOMETRIK' : 'ATHLETE_HEART_RATE_ZONES // BIOMETRIC_PROFILE'}
          </h2>
          <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
            {isId 
              ? 'RENTANG %HRR TERSINKRONISASI DENGAN GARMIN & AMBANG METABOLIK BPM TEPAT'
              : 'HARDWARE-SYNCHRONIZED %HRR BRACKETS & EXACT METABOLIC BPM THRESHOLDS'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setDraftRestingHr(restingHr);
              setDraftMaxHr(maxHr);
              setIsEditing(true);
            }}
            className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 dark:bg-violet-900 dark:hover:bg-violet-700 border-2 border-violet-400 dark:border-violet-500 text-white text-xs font-mono font-black uppercase transition-all flex items-center gap-2 shadow-[2px_2px_0px_#7c3aed] cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-300" />
            <span>{isId ? 'EDIT BIOMETRIK' : 'EDIT BIOMETRICS'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards: Method, Rest HR, Max HR, LTHR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-slate-200 dark:border-violet-800/60 p-3 shadow-sm dark:shadow-[2px_2px_0px_#7c3aed]">
          <span className="text-[9px] uppercase text-slate-500 dark:text-zinc-400 block tracking-wider font-bold">
            {isId ? 'METODE HITUNG HR' : 'HR CALCULATION METHOD'}
          </span>
          <span className="text-sm font-black text-violet-700 dark:text-violet-300 mt-1 block">
            %HRR (KARVONEN)
          </span>
          <span className="text-[9px] text-slate-400 dark:text-zinc-500 block mt-0.5">
            {isId ? 'KONFIGURASI KUSTOM' : 'DYNAMIC CUSTOM CONFIG'}
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
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-bold">
            {garmin7dAvgRhr ? `${isId ? 'SINKRON GARMIN 7H' : 'SYNCED GARMIN 7D AVG'} (${garmin7dAvgRhr} BPM)` : (isId ? 'DIKALIBRASI ATLET' : 'USER CALIBRATED')}
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
            {isId ? 'INISIASI ZONA 4 (84% HRR)' : 'ZONE 4 INITIATION (84% HRR)'}
          </span>
        </div>
      </div>

      {/* Biometrics Status Banner */}
      <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-violet-900/60 p-3.5 font-mono flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <span className="text-slate-900 dark:text-zinc-200 font-bold block">
              {isId ? 'MESIN BIOMETRIK OTOMATIS & DAPAT DIKALIBRASI AKTIF' : 'AUTOMATED & EDITABLE BIOMETRIC ENGINE ACTIVE'}
            </span>
            <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-sans block mt-0.5">
              {isId
                ? `Max HR diatur pada ${profile.maxHr} BPM dan RHR pada ${profile.restingHr} BPM (Cadangan Detak Jantung = ${profile.heartRateReserve} BPM). Bila metrik Garmin Anda berubah, klik EDIT BIOMETRIK di atas untuk memperbarui dan mengkalibrasi ulang seluruh 5 zona latihan secara otomatis.`
                : `Max HR is set at ${profile.maxHr} BPM and Resting HR at ${profile.restingHr} BPM (Heart Rate Reserve = ${profile.heartRateReserve} BPM). When your Garmin stats shift, click EDIT BIOMETRICS above to update and recalibrate all 5 training zones automatically.`}
            </span>
          </div>
        </div>
      </div>

      {/* 5-Zone Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b-2 border-slate-200 dark:border-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
              <th className="py-2.5 px-3">{isId ? 'ZONA' : 'ZONE'}</th>
              <th className="py-2.5 px-3">{isId ? 'NAMA' : 'NAME'}</th>
              <th className="py-2.5 px-3">{isId ? 'RENTANG % HRR' : '% HRR RANGE'}</th>
              <th className="py-2.5 px-3">{isId ? 'AMBANG BPM' : 'BPM THRESHOLD'}</th>
              <th className="py-2.5 px-3">{isId ? 'PERAN FISIOLOGIS & MANFAAT METABOLIK' : 'PHYSIOLOGICAL ROLE & METABOLIC BENEFIT'}</th>
              <th className="py-2.5 px-3 text-right">{isId ? 'TOTAL WAKTU TERCATAT' : 'TOTAL RECORDED TIME'}</th>
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
                <td className="py-3 px-3 text-slate-600 dark:text-zinc-400">
                  {z.minPercent}% – {z.maxPercent}%
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

      {/* EDIT BIOMETRICS MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="bg-white dark:bg-[#0b0f1d] border-2 border-violet-500 shadow-[6px_6px_0px_#7c3aed] max-w-md w-full p-5 sm:p-6 space-y-5 font-mono text-slate-900 dark:text-white relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                <div>
                  <h3 className="text-sm font-black tracking-wider text-slate-900 dark:text-white uppercase">
                    {isId ? 'KALIBRASI_BIOMETRIK' : 'CALIBRATE_BIOMETRICS'}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    {isId 
                      ? 'PERBARUI MAX HR & RHR UNTUK MENGHITUNG ULANG ZONA KARVONEN'
                      : 'UPDATE MAX HR & RESTING HR TO RECALCULATE KARVONEN ZONES'}
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

            {/* Inputs */}
            <div className="space-y-4">
              {/* Max HR */}
              <div>
                <label className="text-xs text-slate-700 dark:text-zinc-300 uppercase font-bold block mb-1.5 flex justify-between">
                  <span>{isId ? 'DETAK JANTUNG MAKSIMAL (PUNCAK)' : 'MAX HEART RATE (PEAK BREAKTHROUGH)'}</span>
                  <span className="text-rose-600 dark:text-rose-400 font-black">{draftMaxHr} BPM</span>
                </label>
                <input
                  type="number"
                  min="130"
                  max="230"
                  value={draftMaxHr}
                  onChange={e => setDraftMaxHr(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-[#070a14] border-2 border-rose-400 dark:border-rose-800/80 p-2.5 text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:border-rose-500"
                />
                <span className="text-[10px] text-slate-500 dark:text-zinc-500 block mt-1">
                  {isId 
                    ? 'Masukkan detak jantung tertinggi yang terdeteksi Garmin saat sesi interval keras atau balapan Anda.'
                    : 'Input peak heart rate detected by Garmin during your hardest interval or race effort.'}
                </span>
              </div>

              {/* Resting HR */}
              <div>
                <label className="text-xs text-slate-700 dark:text-zinc-300 uppercase font-bold block mb-1.5 flex justify-between">
                  <span>{isId ? 'DETAK JANTUNG ISTIRAHAT RATA-RATA (RHR)' : 'AVERAGE RESTING HR (RHR)'}</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-black">{draftRestingHr} BPM</span>
                </label>
                <input
                  type="number"
                  min="35"
                  max="100"
                  value={draftRestingHr}
                  onChange={e => setDraftRestingHr(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-[#070a14] border-2 border-cyan-400 dark:border-cyan-800/80 p-2.5 text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 dark:text-zinc-500 block mt-1">
                  {isId
                    ? 'Ditemukan di Garmin Connect > Statistik Kesehatan > Detak Jantung (Rata-rata Istirahat).'
                    : 'Found in Garmin Connect > Health Stats > Heart Rate (Resting Avg).'}
                </span>
                {garmin7dAvgRhr && (
                  <button
                    type="button"
                    onClick={() => setDraftRestingHr(garmin7dAvgRhr)}
                    className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 font-bold underline cursor-pointer mt-1 block"
                  >
                    {isId ? 'SINKRONKAN DENGAN RATA-RATA 7H GARMIN' : 'SYNC WITH GARMIN 7D AVG'} ({garmin7dAvgRhr} BPM)
                  </button>
                )}
              </div>

              {/* Zone 2 Upper Limit (Max Easy BPM) */}
              <div>
                <label className="text-xs text-slate-700 dark:text-zinc-300 uppercase font-bold block mb-1.5 flex justify-between">
                  <span>{isId ? 'BATAS ATAS ZONA 2 (MAKSIMUM EASY BPM)' : 'ZONE 2 CEILING (MAX EASY BPM)'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">{previewZ2Max} BPM</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="135"
                    max="180"
                    value={draftCustomZones.zone2Max || 162}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setDraftCustomZones(prev => ({
                        ...prev,
                        zone2Max: val,
                        zone3Min: val + 1,
                      }));
                    }}
                    className="flex-1 bg-slate-50 dark:bg-[#070a14] border-2 border-emerald-500/80 p-2 text-slate-900 dark:text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDraftCustomZones(prev => ({
                        ...prev,
                        zone2Max: 162,
                        zone3Min: 163,
                      }));
                    }}
                    className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 border border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase transition-colors"
                  >
                    162 BPM ({isId ? 'JAM GARMIN' : 'GARMIN WATCH'})
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-zinc-500 block mt-1">
                  {isId
                    ? 'Batas denyut jantung maksimum lari santai (Zona 2) sesuai angka di jam tangan Anda (misal 162 BPM).'
                    : 'Maximum heart rate boundary for easy runs (Zone 2) matching your watch setting (e.g. 162 BPM).'}
                </span>
              </div>

              {/* Live Preview Box */}
              <div className="bg-slate-50 dark:bg-[#070a14] border border-violet-300 dark:border-violet-800/80 p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-bold border-b border-slate-200 dark:border-zinc-800 pb-1">
                  <span>{isId ? 'CADANGAN HRR BARU:' : 'NEW HRR (RESERVE):'}</span>
                  <strong className="text-violet-700 dark:text-white text-xs">{draftHrr} BPM</strong>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div>
                    <span className="text-slate-500 dark:text-zinc-500">{isId ? 'Z1 (Pemanasan):' : 'Z1 (Warm Up):'}</span>{' '}
                    <strong className="text-slate-800 dark:text-slate-300">{previewZ1Min}–{previewZ1Max}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-500">{isId ? 'Z2 (Lari Santai):' : 'Z2 (Easy):'}</span>{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">{previewZ2Min}–{previewZ2Max}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-500">{isId ? 'Z3 (Aerobik):' : 'Z3 (Aerobic):'}</span>{' '}
                    <strong className="text-cyan-600 dark:text-cyan-300">{previewZ3Min}–{previewZ3Max}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-500">{isId ? 'Z4 (Ambang Laktat):' : 'Z4 (Threshold):'}</span>{' '}
                    <strong className="text-amber-600 dark:text-amber-300">{previewZ4Min}–{previewZ4Max}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 dark:text-zinc-500">{isId ? 'Z5 (Maksimal):' : 'Z5 (Max):'}</span>{' '}
                    <strong className="text-rose-600 dark:text-rose-400">{previewZ4Max + 1}–{draftMaxHr} BPM</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold uppercase transition-colors cursor-pointer"
              >
                {isId ? 'BATAL' : 'CANCEL'}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || draftMaxHr <= draftRestingHr}
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
                    <span>{isId ? 'SIMPAN BIOMETRIK' : 'SAVE BIOMETRICS'}</span>
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
