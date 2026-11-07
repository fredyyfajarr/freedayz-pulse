'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HRRProfileWidget() {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] font-mono transition-colors">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400">
          <Heart className="w-4 h-4 fill-rose-500" />
          <span className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            {t('hrr.profile_title')}
          </span>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-700 text-violet-800 dark:text-violet-300 font-bold">
          {t('hrr.lthr_badge')}
        </span>
      </div>
      <p className="text-[11px] text-slate-600 dark:text-zinc-300 font-sans leading-relaxed">
        {t('hrr.full_desc')}
      </p>
      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800/80 flex justify-between items-center text-[10px]">
        <span className="text-slate-500 dark:text-zinc-500">{t('hrr.z2_title')}</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">145 – 164 BPM</span>
      </div>
      <div className="mt-2 text-right">
        <Link
          href="/settings#biometrics"
          className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 tracking-wider flex items-center gap-1 justify-end"
        >
          <span>{t('hrr.view_breakdown_btn')}</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
