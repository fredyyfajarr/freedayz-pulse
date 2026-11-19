'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeartPulse, Heart, Moon, Zap, ShieldAlert, CheckCircle2, AlertTriangle, Users, UserPlus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CoachingStorage } from '@/utils/coachingStorage';
import { SquadAthlete } from '@/domain/entities/CoachingRelationship';

export default function CoachRecoveryHub() {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [squadAthletes, setSquadAthletes] = useState<SquadAthlete[]>([]);

  useEffect(() => {
    const load = () => {
      setSquadAthletes(CoachingStorage.getSquadAthletes());
    };
    load();
    window.addEventListener('squad_athlete_updated', load);
    return () => {
      window.removeEventListener('squad_athlete_updated', load);
    };
  }, []);

  const squadRecovery = squadAthletes.map((ath) => {
    const rhrBpm = ath.rhrBpm || 52;
    const sleepScore = ath.sleepScore || 80;
    const hrvValueMs = Math.round(55 + (ath.tsb || 0) * 0.8 + (sleepScore - 75) * 0.4);
    const hrvBaseline = `${Math.max(42, hrvValueMs - 8)} - ${hrvValueMs + 10} ms`;
    const sleepHours = `${Math.max(5, Math.floor(sleepScore / 11))}h ${((sleepScore * 7) % 50)}m`;
    const bodyBattery = Math.min(99, Math.max(30, Math.round(sleepScore * 0.92 + (ath.tsb || 0) * 0.5)));

    const isFatigued = ath.acwrZone === 'DANGER' || sleepScore < 65 || (ath.tsb && ath.tsb < -15);
    const readiness = isFatigued ? 'FATIGUED_REST_NEEDED' : sleepScore >= 80 ? 'OPTIMAL' : 'GOOD';

    let notes = isId
      ? 'Pemulihan kardiovaskular stabil, siap untuk sesi intensitas terprogram.'
      : 'Cardiovascular recovery is stable, ready for scheduled intensity sessions.';

    if (isFatigued) {
      notes = isId
        ? 'PERINGATAN: Beban akut berlebih atau skor tidur rendah. Alihkan sesi hari ini ke peregangan, foam rolling, atau istirahat total.'
        : 'ALERT: Elevated acute fatigue or insufficient sleep detected. Pivot today\'s session to stretching, mobility, or complete rest.';
    } else if (readiness === 'OPTIMAL') {
      notes = isId
        ? 'HRV di atas baseline rata-rata dan kualitas tidur prima. Atlet dalam kesiapan puncak untuk latihan kualitas.'
        : 'HRV above baseline with restorative sleep. Athlete is in prime readiness for high-quality workouts.';
    }

    return {
      id: ath.id,
      athleteName: ath.name,
      hrvStatus: isFatigued ? 'UNBALANCED_LOW' : 'BALANCED',
      hrvValueMs,
      hrvBaseline,
      rhrBpm,
      sleepScore,
      sleepHours,
      bodyBattery,
      readiness,
      notes,
    };
  });

  const fatiguedCount = squadRecovery.filter(s => s.readiness === 'FATIGUED_REST_NEEDED').length;

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
            {squadAthletes.length > 0 ? (
              <span className={`px-3 py-1.5 border font-bold ${
                fatiguedCount > 0 
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300'
              }`}>
                {isId ? `${fatiguedCount} Atlet Memerlukan Istirahat` : `${fatiguedCount} Athletes Need Recovery`}
              </span>
            ) : (
              <Link
                href="/dashboard?tab=roster"
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 border border-rose-400 text-white font-black uppercase text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {isId ? 'TAMBAH ATLET' : 'ADD ATHLETE'}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Recovery Cards Grid */}
      {squadAthletes.length === 0 ? (
        <div className="bg-white dark:bg-[#0d1224] border-2 border-dashed border-slate-300 dark:border-zinc-800 p-8 text-center space-y-4">
          <HeartPulse className="w-12 h-12 text-slate-400 dark:text-zinc-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm uppercase text-slate-800 dark:text-zinc-200">
              {isId ? 'Belum Ada Atlet di Skuad' : 'No Athletes in Squad'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans max-w-md mx-auto">
              {isId
                ? 'Tambahkan atlet binaan Anda di Roster Dashboard untuk mulai melacak biometrik HRV, resting heart rate, dan skor pemulihan mereka.'
                : 'Add athletes in your Dashboard Roster to start monitoring HRV, resting heart rate, and sleep recovery telemetry.'}
            </p>
          </div>
          <Link
            href="/dashboard?tab=roster"
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 border border-rose-400 text-white text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {isId ? 'TAMBAH ATLET KE SKUAD' : 'ADD ATHLETE TO SQUAD'}
          </Link>
        </div>
      ) : (
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
                    {isWarning 
                      ? (isId ? 'PERLU ISTIRAHAT' : 'REST NEEDED') 
                      : (isId ? 'SIAP LATIHAN' : 'READY TO TRAIN')}
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
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">
                      {isId ? 'SKOR TIDUR' : 'SLEEP SCORE'}
                    </span>
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
      )}
    </div>
  );
}
