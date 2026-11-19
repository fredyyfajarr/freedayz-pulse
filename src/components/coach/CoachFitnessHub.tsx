'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, TrendingUp, Activity, ShieldCheck, Zap, AlertTriangle, CheckCircle2, Users, UserPlus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CoachingStorage } from '@/utils/coachingStorage';
import { SquadAthlete } from '@/domain/entities/CoachingRelationship';

export default function CoachFitnessHub() {
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

  const squadPMC = squadAthletes.map((a) => {
    const ctl = a.ctl || Math.round(a.targetWeeklyKm * 1.5) || 45;
    const atl = a.atl || Math.round(ctl * (a.acwr || 1.0)) || 42;
    const tsb = a.tsb ?? (ctl - atl);

    let statusLabel = 'ADAPTASI OPTIMAL (+0)';
    let badgeColor = 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border-cyan-400';
    let recommendation = 'Beban latihan berjalan stabil. Fisiologi atlet menyerap adaptasi dengan baik.';

    if (tsb > 5) {
      statusLabel = `SIAP LOMBA (+${tsb})`;
      badgeColor = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-400';
      recommendation = 'Kebugaran prima, kelelahan minimal. Ideal untuk time trial atau race maraton.';
    } else if (tsb < -15) {
      statusLabel = `KELELAHAN AKUT (${tsb})`;
      badgeColor = 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-400';
      recommendation = 'Kelelahan tinggi akibat akumulasi sesi berat. Berikan deload week atau easy run.';
    } else if (tsb < -5) {
      statusLabel = `AKUMULASI BEBAN (${tsb})`;
      badgeColor = 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-400';
      recommendation = 'Sedang dalam blok pembebanan. Pantau kualitas tidur dan hidrasi atlet.';
    }

    return {
      id: a.id,
      name: a.name,
      package: a.packageTier,
      target: a.targetRace,
      ctl,
      atl,
      tsb,
      statusLabel,
      badgeColor,
      recommendation,
    };
  });

  const avgTsb = squadPMC.length > 0 
    ? (squadPMC.reduce((acc, curr) => acc + curr.tsb, 0) / squadPMC.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6 font-mono text-slate-900 dark:text-white">
      {/* Header */}
      <div className="bg-white dark:bg-[#0d1224] border-2 border-violet-500/80 p-5 sm:p-6 shadow-[4px_4px_0px_#7c3aed] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-violet-900/60 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-[10px] font-black px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 text-violet-800 dark:text-violet-300 uppercase tracking-widest">
                ANALISIS_KEBUGARAN // PMC_SKUAD
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black italic tracking-wide uppercase mt-1.5 text-slate-900 dark:text-white">
              {isId ? 'MATRIKS KEBUGARAN & BEBAN TIM (PMC ENGINE)' : 'SQUAD FITNESS & FRESHNESS MATRIX (PMC)'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans mt-0.5">
              {isId 
                ? 'Model Banister Impulse-Response: Evaluasi Chronic Training Load (CTL), Acute Fatigue (ATL), dan Form/Freshness (TSB) seluruh atlet binaan.'
                : 'Banister Impulse-Response: Track CTL (Fitness), ATL (Fatigue), and TSB (Form/Freshness) across your athletes.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 text-emerald-800 dark:text-emerald-300 font-bold">
              {isId ? `Rata-rata TSB Skuad: ${avgTsb}` : `Squad Avg TSB: ${avgTsb}`}
            </span>
          </div>
        </div>

        {/* 3 Zone Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
          <div className="p-3 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800">
            <strong className="font-mono text-emerald-600 dark:text-emerald-400 block text-xs uppercase">
              Zona Freshness (TSB &gt; +5)
            </strong>
            <p className="text-slate-600 dark:text-zinc-400 text-[11px] mt-0.5">
              Kebugaran prima, kelelahan minimal. Ideal untuk minggu perlombaan maraton atau time trial.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800">
            <strong className="font-mono text-cyan-600 dark:text-cyan-400 block text-xs uppercase">
              Zona Adaptasi Optimal (-10 s/d +5)
            </strong>
            <p className="text-slate-600 dark:text-zinc-400 text-[11px] mt-0.5">
              Beban latihan progresif dan aman. Fisiologi atlet menyerap adaptasi tanpa risiko overtraining.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800">
            <strong className="font-mono text-rose-600 dark:text-rose-400 block text-xs uppercase">
              Zona Kelelahan Akut (TSB &lt; -15)
            </strong>
            <p className="text-slate-600 dark:text-zinc-400 text-[11px] mt-0.5">
              Kelelahan tinggi. SOP Pelatih: Berikan deload week atau kurangi intensitas speedwork.
            </p>
          </div>
        </div>
      </div>

      {/* Squad Athletes PMC Cards */}
      {squadPMC.length === 0 ? (
        <div className="bg-white dark:bg-[#0d1224] border-2 border-dashed border-slate-300 dark:border-zinc-800 p-10 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-violet-100 dark:bg-violet-950/60 border border-violet-400 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
              {isId ? 'BELUM ADA ATLET DALAM SKUAD BINAAN' : 'NO ATHLETES IN YOUR SQUAD YET'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans max-w-md mx-auto">
              {isId 
                ? 'Tambahkan atlet binaan ke dalam skuad Anda melalui Portal Pelatih untuk mulai memantau metrik kebugaran CTL, kelelahan ATL, dan kesegaran TSB.'
                : 'Add athletes to your roster through the Coach Portal to monitor CTL, ATL, and TSB freshness.'}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black uppercase shadow-[2px_2px_0px_#7c3aed] cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isId ? 'Buka Portal & Tambah Atlet' : 'Open Portal & Add Athlete'}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {squadPMC.map((athlete) => (
            <div
              key={athlete.id}
              className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-4 hover:border-violet-500 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {athlete.name}
                    </h3>
                    <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold">
                      • {athlete.package}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-sans block mt-0.5">
                    Target Race: <strong>{athlete.target}</strong>
                  </span>
                </div>

                <span className={`text-[10px] font-black px-2.5 py-1 border uppercase tracking-wider ${athlete.badgeColor}`}>
                  {athlete.statusLabel}
                </span>
              </div>

              {/* PMC Numbers Grid */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase block">
                    CTL (KEBUGARAN KRONIS)
                  </span>
                  <span className="text-2xl font-black text-violet-600 dark:text-violet-400 block mt-0.5">
                    {athlete.ctl}
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">Rolling 42-day average</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase block">
                    ATL (KELELAHAN AKUT)
                  </span>
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400 block mt-0.5">
                    {athlete.atl}
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">Rolling 7-day fatigue</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase block">
                    TSB (FORM / KESIAPAN)
                  </span>
                  <span className={`text-2xl font-black block mt-0.5 ${
                    athlete.tsb > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {athlete.tsb > 0 ? `+${athlete.tsb}` : athlete.tsb}
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">CTL minus ATL</span>
                </div>
              </div>

              {/* Coach Prescription Recommendation */}
              <div className="p-3 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/60 text-xs">
                <span className="text-[10px] text-violet-800 dark:text-violet-300 font-bold uppercase block mb-0.5">
                  Rekomendasi Pembebanan Pelatih:
                </span>
                <p className="text-[11px] font-sans text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {athlete.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
