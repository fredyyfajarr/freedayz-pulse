'use client';

import React from 'react';
import { BarChart3, TrendingUp, Activity, ShieldCheck, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CoachFitnessHub() {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const squadPMC = [
    {
      id: 'ath-1',
      name: 'Fredy Fajar',
      package: 'Elite Marathon Podium',
      target: 'Maybank Bali Marathon Sub-4',
      ctl: 58,
      atl: 50,
      tsb: 8,
      status: 'FRESH_RACE_READY',
      statusLabel: 'SIAP LOMBA (+8)',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-400',
      recommendation: 'Pertahankan volume ringan. Sesi interval pendek untuk sharpening ritme maraton.',
    },
    {
      id: 'ath-2',
      name: 'Budi Santoso',
      package: 'Half Marathon Performance',
      target: 'Borobudur 21K Sub-2',
      ctl: 44,
      atl: 38,
      tsb: 6,
      status: 'OPTIMAL_BUILD',
      statusLabel: 'ADAPTASI OPTIMAL (+6)',
      badgeColor: 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border-cyan-400',
      recommendation: 'Beban mingguan bisa dinaikkan +8% pada long run akhir pekan ini.',
    },
    {
      id: 'ath-3',
      name: 'Siti Rahma',
      package: 'Community Squad (Base)',
      target: 'Jakarta 10K Debut',
      ctl: 36,
      atl: 50,
      tsb: -14,
      status: 'FATIGUE_OVERLOAD',
      statusLabel: 'KELELAHAN AKUT (-14)',
      badgeColor: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-400',
      recommendation: 'Peringatan overload pasca sesi interval trek. Berikan 2 hari Easy Run di bawah 140 bpm.',
    },
  ];

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
              Rata-rata TSB Tim: +0.0 (Netral)
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
              Zona Kelelahan Akut (TSB &lt; -20)
            </strong>
            <p className="text-slate-600 dark:text-zinc-400 text-[11px] mt-0.5">
              Kelelahan tinggi. SOP Pelatih: Berikan deload week atau kurangi intensitas speedwork.
            </p>
          </div>
        </div>
      </div>

      {/* Squad Athletes PMC Cards */}
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
    </div>
  );
}
