'use client';

import React from 'react';
import { HeartPulse, Heart, Moon, Zap, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CoachRecoveryHub() {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const squadRecovery = [
    {
      id: 'rec-1',
      athleteName: 'Fredy Fajar',
      hrvStatus: 'BALANCED',
      hrvValueMs: 64,
      hrvBaseline: '58 - 72 ms',
      rhrBpm: 51,
      sleepScore: 84,
      sleepHours: '7h 42m',
      bodyBattery: 88,
      readiness: 'OPTIMAL',
      notes: 'Pemulihan kardiovaskular sangat baik, siap untuk sesi intensitas tinggi.',
    },
    {
      id: 'rec-2',
      athleteName: 'Budi Santoso',
      hrvStatus: 'BALANCED',
      hrvValueMs: 52,
      hrvBaseline: '48 - 60 ms',
      rhrBpm: 56,
      sleepScore: 78,
      sleepHours: '7h 10m',
      bodyBattery: 74,
      readiness: 'GOOD',
      notes: 'Kualitas tidur stabil. Anjurkan hidrasi ekstra sebelum sesi sore.',
    },
    {
      id: 'rec-3',
      athleteName: 'Siti Rahma',
      hrvStatus: 'UNBALANCED_LOW',
      hrvValueMs: 38,
      hrvBaseline: '45 - 55 ms',
      rhrBpm: 63,
      sleepScore: 61,
      sleepHours: '5h 30m',
      bodyBattery: 42,
      readiness: 'FATIGUED_REST_NEEDED',
      notes: 'PERINGATAN: HRV drop di bawah baseline + kurang tidur. Alihkan sesi ke peregangan & istirahat total.',
    },
  ];

  return (
    <div className="space-y-6 font-mono text-slate-900 dark:text-white">
      {/* Header */}
      <div className="bg-white dark:bg-[#0d1224] border-2 border-rose-500/80 p-5 sm:p-6 shadow-[4px_4px_0px_#f43f5e] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-rose-900/60 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="text-[10px] font-black px-2 py-0.5 bg-rose-100 dark:bg-rose-950 border border-rose-400 text-rose-800 dark:text-rose-300 uppercase tracking-widest">
                MONITORING_PEMULIHAN // ROLE_COACH
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black italic tracking-wide uppercase mt-1.5 text-slate-900 dark:text-white">
              {isId ? 'RADAR PEMULIHAN & BIOMETRIK HRV ATLET' : 'SQUAD RECOVERY & HRV BIOMETRICS RADAR'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans mt-0.5">
              {isId 
                ? 'Pantau Heart Rate Variability (HRV), Resting Heart Rate, dan skor tidur atlet guna mendeteksi kelelahan sistem saraf simpatik sebelum terjadi cedera.'
                : 'Monitor HRV balance, sleep scores, and resting HR to detect autonomic nervous system fatigue and mitigate injury risk.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-400 text-rose-800 dark:text-rose-300 font-bold">
              1 Atlet Memerlukan Istirahat
            </span>
          </div>
        </div>
      </div>

      {/* Recovery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {squadRecovery.map((ath) => {
          const isWarning = ath.readiness === 'FATIGUED_REST_NEEDED';

          return (
            <div
              key={ath.id}
              className={`p-5 border-2 space-y-4 shadow-sm transition-all ${
                isWarning
                  ? 'bg-rose-50/50 dark:bg-[#0d1224] border-rose-500 shadow-[3px_3px_0px_#f43f5e]'
                  : 'bg-white dark:bg-[#0d1224] border-slate-200 dark:border-zinc-800 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    {ath.athleteName}
                  </h3>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-sans">
                    Baseline: {ath.hrvBaseline}
                  </span>
                </div>

                <span className={`text-[9px] font-black px-2 py-0.5 uppercase border ${
                  isWarning
                    ? 'bg-rose-100 dark:bg-rose-950 border-rose-400 text-rose-700 dark:text-rose-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {isWarning ? 'PERLU ISTIRAHAT' : 'SIAP LATIHAN'}
                </span>
              </div>

              {/* 4 Biometrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">HRV 7-HARI</span>
                  <span className={`text-base font-black ${isWarning ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {ath.hrvValueMs} ms
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">RESTING HR</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {ath.rhrBpm} bpm
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">SKOR TIDUR</span>
                  <span className="text-base font-black text-cyan-600 dark:text-cyan-400">
                    {ath.sleepScore}/100 ({ath.sleepHours})
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">BODY BATTERY</span>
                  <span className="text-base font-black text-violet-600 dark:text-violet-400">
                    {ath.bodyBattery}%
                  </span>
                </div>
              </div>

              {/* Action Note */}
              <div className={`p-3 text-xs font-sans leading-relaxed border ${
                isWarning
                  ? 'bg-rose-100/60 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  : 'bg-slate-50 dark:bg-[#070a14] border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300'
              }`}>
                {ath.notes}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
