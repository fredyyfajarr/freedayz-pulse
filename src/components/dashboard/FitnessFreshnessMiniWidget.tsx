'use client';

import React from 'react';
import Link from 'next/link';
import { FitnessSummary } from '@/domain/entities/FitnessFreshness';
import { Activity, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  fitness: FitnessSummary;
}

export default function FitnessFreshnessMiniWidget({ fitness }: Props) {
  const { t, language } = useLanguage();

  // Status badge styling with localized text
  const getStatusBadge = () => {
    switch (fitness.currentStatus) {
      case 'peaking':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-950/80',
          text: 'text-emerald-800 dark:text-emerald-400',
          border: 'border-emerald-400 dark:border-emerald-500',
          shadow: 'shadow-[3px_3px_0px_#10b981]',
          label: t('status.peaking'),
        };
      case 'fresh':
        return {
          bg: 'bg-cyan-100 dark:bg-cyan-950/80',
          text: 'text-cyan-800 dark:text-cyan-400',
          border: 'border-cyan-400 dark:border-cyan-500',
          shadow: 'shadow-[3px_3px_0px_#06b6d4]',
          label: t('status.fresh'),
        };
      case 'optimal':
        return {
          bg: 'bg-violet-100 dark:bg-violet-950/80',
          text: 'text-violet-800 dark:text-violet-300',
          border: 'border-violet-400 dark:border-violet-500',
          shadow: 'shadow-[3px_3px_0px_#7c3aed]',
          label: t('status.optimal'),
        };
      case 'fatigued':
        return {
          bg: 'bg-amber-100 dark:bg-amber-950/80',
          text: 'text-amber-800 dark:text-amber-400',
          border: 'border-amber-400 dark:border-amber-500',
          shadow: 'shadow-[3px_3px_0px_#f59e0b]',
          label: t('status.fatigued'),
        };
      case 'overreaching':
        return {
          bg: 'bg-rose-100 dark:bg-rose-950/80',
          text: 'text-rose-800 dark:text-rose-400',
          border: 'border-rose-400 dark:border-rose-500',
          shadow: 'shadow-[3px_3px_0px_#ef4444]',
          label: t('status.overreaching'),
        };
      default:
        return {
          bg: 'bg-slate-100 dark:bg-zinc-900',
          text: 'text-slate-700 dark:text-zinc-400',
          border: 'border-slate-300 dark:border-zinc-700',
          shadow: 'shadow-[3px_3px_0px_#94a3b8]',
          label: t('status.transition'),
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] flex flex-col justify-between transition-colors">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <h3 className="font-black italic tracking-widest uppercase text-sm text-slate-900 dark:text-white">
              {t('fitness.widget_title')}
            </h3>
          </div>
          <span className="text-[9px] font-mono text-slate-500 dark:text-zinc-400">
            {t('fitness.widget_badge')}
          </span>
        </div>

        {/* Current Status Pill */}
        <div className="mt-4">
          <div className={`inline-block px-3 py-1 border-2 font-mono font-black text-xs uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border} ${badge.shadow}`}>
            {badge.label}
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
            {language === 'ID'
              ? 'Model Bannister TRIMP & Coggan Performance Management Chart menghitung keseimbangan akumulasi latihan (CTL) vs beban akut terkini (ATL).'
              : fitness.statusDescription}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 text-center font-mono">
          <div className="bg-slate-50 dark:bg-[#070a14] border border-blue-200 dark:border-blue-900/40 p-2.5">
            <span className="block text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
              {t('fitness.ctl')}
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
              {fitness.currentFitness}
            </span>
            <span className="text-[8px] text-slate-500 dark:text-zinc-400">{t('fitness.42d_load')}</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#070a14] border border-pink-200 dark:border-pink-900/40 p-2.5">
            <span className="block text-[9px] font-black uppercase text-pink-600 dark:text-pink-400 tracking-wider">
              {t('fitness.atl')}
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
              {fitness.currentFatigue}
            </span>
            <span className="text-[8px] text-slate-500 dark:text-zinc-400">{t('fitness.7d_load')}</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#070a14] border border-violet-200 dark:border-violet-900/40 p-2.5">
            <span className="block text-[9px] font-black uppercase text-violet-700 dark:text-violet-300 tracking-wider">
              {t('fitness.tsb')}
            </span>
            <span className={`text-xl font-black mt-0.5 block ${fitness.currentForm >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {fitness.currentForm > 0 ? `+${fitness.currentForm}` : fitness.currentForm}
            </span>
            <span className="text-[8px] text-slate-500 dark:text-zinc-400">{t('fitness.balance')}</span>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-5 pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-600 dark:text-zinc-400 text-[10px]">
          {t('fitness.7d_trimp')}: <strong className="text-slate-900 dark:text-white">{fitness.sevenDayTrimp} PTS</strong>
        </span>
        <Link
          href="/fitness"
          className="flex items-center gap-1 font-black text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 uppercase tracking-wider group"
        >
          <span>{t('fitness.pmc_analytics')}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
