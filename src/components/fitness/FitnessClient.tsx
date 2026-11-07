'use client';

import React from 'react';
import { FitnessSummary } from '@/domain/entities/FitnessFreshness';
import PMCChart from '@/components/fitness/PMCChart';
import { BarChart3, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  summary: {
    currentFitness: number;
    currentFatigue: number;
    currentForm: number;
    history: any[];
  };
}

export default function FitnessClient({ summary }: Props) {
  const { t, language } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-violet-900/50 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            <span className="text-[10px] font-mono px-2 py-0.5 bg-violet-950 border border-violet-700/60 text-violet-300 font-bold uppercase tracking-wider">
              {language === 'ID' ? 'MODEL_FISIOLOGI // BANNISTER_TRIMP' : 'PHYSIOLOGY_MODEL // BANNISTER_TRIMP'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black italic tracking-wide text-white uppercase mt-1">
            {language === 'ID' ? 'KEBUGARAN_&_KESEGARAN // PMC' : 'FITNESS_&_FRESHNESS // PMC'}
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            {language === 'ID'
              ? 'GRAFIK MANAJEMEN PERFORMA COGGAN & BANNISTER (CTL / ATL / TSB)'
              : 'COGGAN & BANNISTER PERFORMANCE MANAGEMENT CHART (CTL / ATL / TSB)'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-[#0d1224] border-2 border-violet-600 shadow-[3px_3px_0px_#7c3aed] text-right font-mono">
            <span className="text-[9px] uppercase text-zinc-400 block">
              {language === 'ID' ? 'PERFORMA TERKINI' : 'CURRENT FORM'}
            </span>
            <span className={`text-lg font-black ${summary.currentForm >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {summary.currentForm > 0 ? `+${summary.currentForm}` : summary.currentForm} TSB
            </span>
          </div>
        </div>
      </div>

      {/* Hero 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="bg-[#0d1224] border-2 border-blue-700/60 p-5 shadow-[4px_4px_0px_#1e3a8a]">
          <span className="text-xs font-black uppercase text-blue-400 tracking-wider block">
            {language === 'ID' ? 'BEBAN LATIHAN KRONIS (CTL)' : 'CHRONIC TRAINING LOAD (CTL)'}
          </span>
          <div className="flex items-baseline gap-2 my-1.5">
            <span className="text-3xl font-black text-white">{summary.currentFitness}</span>
            <span className="text-xs text-zinc-400">{language === 'ID' ? 'KEBUGARAN DASAR' : 'FITNESS BASE'}</span>
          </div>
          <p className="text-xs text-zinc-400 font-sans">
            {language === 'ID'
              ? 'Rata-rata bergerak eksponensial 42 hari dari stres kardiak latihan Anda. CTL lebih tinggi mencerminkan kapasitas mesin aerobik yang lebih besar.'
              : 'Exponential 42-day rolling moving average of your cardiac training stress. Higher CTL means greater aerobic engine capacity.'}
          </p>
        </div>

        <div className="bg-[#0d1224] border-2 border-pink-700/60 p-5 shadow-[4px_4px_0px_#831843]">
          <span className="text-xs font-black uppercase text-pink-400 tracking-wider block">
            {language === 'ID' ? 'BEBAN LATIHAN AKUT (ATL)' : 'ACUTE TRAINING LOAD (ATL)'}
          </span>
          <div className="flex items-baseline gap-2 my-1.5">
            <span className="text-3xl font-black text-white">{summary.currentFatigue}</span>
            <span className="text-xs text-zinc-400">{language === 'ID' ? 'KELELAHAN AKUT' : 'FATIGUE DEBT'}</span>
          </div>
          <p className="text-xs text-zinc-400 font-sans">
            {language === 'ID'
              ? 'Rata-rata bergerak eksponensial 7 hari. Mewakili stres jangka pendek dari sesi keras atau lonjakan volume terbaru.'
              : 'Exponential 7-day rolling average. Represents short-term stress from recent hard efforts and volume spikes.'}
          </p>
        </div>

        <div className="bg-[#0d1224] border-2 border-emerald-700/60 p-5 shadow-[4px_4px_0px_#064e3b]">
          <span className="text-xs font-black uppercase text-emerald-400 tracking-wider block">
            {language === 'ID' ? 'KESEIMBANGAN STRES LATIHAN (TSB)' : 'TRAINING STRESS BALANCE (TSB)'}
          </span>
          <div className="flex items-baseline gap-2 my-1.5">
            <span className={`text-3xl font-black ${summary.currentForm >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {summary.currentForm > 0 ? `+${summary.currentForm}` : summary.currentForm}
            </span>
            <span className="text-xs text-zinc-400">{language === 'ID' ? 'KESEIMBANGAN' : 'FORM BALANCE'}</span>
          </div>
          <p className="text-xs text-zinc-400 font-sans">
            {language === 'ID'
              ? 'Form = Fitness (CTL) dikurangi Fatigue (ATL). Nilai positif menunjukkan kesegaran untuk hari balapan; negatif menunjukkan kelelahan latihan produktif.'
              : 'Form = Fitness minus Fatigue. A positive number indicates freshness for race day; negative indicates productive training fatigue.'}
          </p>
        </div>
      </div>

      {/* Main PMC Chart */}
      <PMCChart history={summary.history} />

      {/* Educational Guide Card */}
      <div className="bg-[#0d1224] border-2 border-violet-900/60 p-6 shadow-[4px_4px_0px_#1e1b4b]">
        <h3 className="font-black italic tracking-widest uppercase text-base text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-violet-400" />
          {language === 'ID' ? 'PANDUAN_PEAKING_PERFORMA_DENGAN_TELEMETRI' : 'HOW_TO_USE_THIS_TELEMETRY_FOR_PEAKING'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono leading-relaxed">
          <div className="bg-[#070a14] border border-zinc-800 p-4">
            <h4 className="text-emerald-400 font-black uppercase mb-1">
              {language === 'ID' ? '[ ZONA PUNCAK PEAKING: TSB +15 HINGGA +25 ]' : '[ PEAKING ZONE: TSB +15 TO +25 ]'}
            </h4>
            <p className="text-zinc-300 font-sans">
              {language === 'ID'
                ? 'Tapering sebelum 5K/10K atau Half Marathon. Pertahankan kadensi tajam sambil mengurangi volume total agar kelelahan (ATL) turun cepat dan kebugaran (CTL) tetap tinggi.'
                : 'Tapering before a 5K/10K or Half Marathon. Maintain short, sharp cadence strides while reducing overall volume so fatigue (ATL) drops fast while fitness (CTL) stays high.'}
            </p>
          </div>

          <div className="bg-[#070a14] border border-zinc-800 p-4">
            <h4 className="text-violet-300 font-black uppercase mb-1">
              {language === 'ID' ? '[ BEBAN OVERLOAD OPTIMAL: TSB -10 HINGGA +5 ]' : '[ OPTIMAL OVERLOAD: TSB -10 TO +5 ]'}
            </h4>
            <p className="text-zinc-300 font-sans">
              {language === 'ID'
                ? 'Zona ideal untuk membangun pondasi aerobik secara bertahap. Memberikan stimulus latihan aman tanpa akumulasi beban kelelahan berlebih.'
                : 'The sweet spot for progressive aerobic base building. You are adding training stimulus safely without accumulating unmanageable fatigue debt.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
