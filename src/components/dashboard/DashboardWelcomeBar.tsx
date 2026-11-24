'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  lastSync?: Date | string | null;
}

export default function DashboardWelcomeBar({ lastSync }: Props) {
  const { t, language } = useLanguage();
  const localeStr = language === 'ID' ? 'id-ID' : 'en-US';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b-2 border-violet-900/50 gap-3 transition-colors">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-cyan-300 bg-slate-100 hover:bg-violet-50 dark:bg-zinc-900 dark:hover:bg-violet-950/60 border border-slate-300 dark:border-zinc-700 hover:border-violet-400 dark:hover:border-violet-600 shadow-xs transition-all cursor-pointer group"
            title={language === 'ID' ? 'Kembali ke Halaman Beranda (Landing Page)' : 'Return to Landing Page'}
          >
            <ArrowLeft className="w-3 h-3 text-violet-500 dark:text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>{language === 'ID' ? '← BERANDA' : '← LANDING'}</span>
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-violet-950 border border-violet-700/60 text-violet-300 font-bold uppercase tracking-wider">
            {t('dashboard.status_online')}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
        </div>
        <h1 className="text-lg sm:text-2xl lg:text-3xl font-black italic tracking-wide text-slate-900 dark:text-white uppercase mt-1 break-words">
          {t('dashboard.title')}
        </h1>
        <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {lastSync && (
        <div className="text-left md:text-right text-[11px] font-mono text-slate-500 dark:text-zinc-400">
          <span>{t('dashboard.last_synced')}: </span>
          <strong className="text-violet-600 dark:text-violet-300">
            {new Date(lastSync).toLocaleDateString(localeStr)} {new Date(lastSync).toLocaleTimeString(localeStr)}
          </strong>
        </div>
      )}
    </div>
  );
}
