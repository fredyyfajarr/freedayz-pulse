'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Globe, Palette, CheckCircle2, Sparkles } from 'lucide-react';
import { Language } from '@/context/translations';
import { Theme } from '@/context/ThemeContext';

export default function SystemPreferencesCard() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isId = language === 'ID';

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 sm:p-6 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] font-mono space-y-5 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-600 flex items-center justify-center text-violet-700 dark:text-violet-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black italic tracking-widest uppercase text-sm sm:text-base text-slate-900 dark:text-white">
              {t('settings.preferences')}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
              {isId ? 'BAHASA SISTEM & KALIBRASI TEMA TAMPILAN' : 'SYSTEM LANGUAGE & DISPLAY THEME CALIBRATION'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-600/50 px-2.5 py-0.5 self-start sm:self-center font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isId ? 'TERSINKRON KE PENYIMPANAN LOKAL' : 'AUTOSAVED TO LOCAL STORAGE'}</span>
        </div>
      </div>

      {/* 2 Grid Columns: Language Dropdown + Theme Dropdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Language Selection Box */}
        <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <label htmlFor="language-select" className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                {t('settings.language_title')}
              </label>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-700 text-violet-800 dark:text-violet-300 font-bold">
              {language}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-sans">
            {t('settings.language_desc')}
          </p>

          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full bg-white dark:bg-[#0d1224] border-2 border-violet-300 dark:border-violet-700/80 hover:border-violet-500 focus:border-cyan-400 text-slate-900 dark:text-white p-2.5 text-xs font-mono font-bold tracking-wider outline-none cursor-pointer transition-colors shadow-sm"
          >
            <option value="EN">EN — English (United States)</option>
            <option value="ID">ID — Bahasa Indonesia</option>
          </select>

          <div className="text-[10px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-200 dark:border-zinc-800/80">
            {isId ? (
              <span>Aktif: Bahasa Indonesia. Seluruh metrik telemetri, model fisiologis, dan label ditampilkan dalam Bahasa Indonesia.</span>
            ) : (
              <span>Active: English. All telemetry metrics, physiological models, and labels are displayed in English.</span>
            )}
          </div>
        </div>

        {/* Theme Selection Box */}
        <div className="bg-slate-50 dark:bg-[#070a14] border border-slate-200 dark:border-zinc-800 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <label htmlFor="theme-select" className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                {t('settings.theme_title')}
              </label>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-bold uppercase">
              {theme}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-sans">
            {t('settings.theme_desc')}
          </p>

          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="w-full bg-white dark:bg-[#0d1224] border-2 border-amber-300 dark:border-amber-600/80 hover:border-amber-500 focus:border-cyan-400 text-slate-900 dark:text-white p-2.5 text-xs font-mono font-bold tracking-wider outline-none cursor-pointer transition-colors shadow-sm"
          >
            <option value="dark">{t('settings.dark_option')}</option>
            <option value="light">{t('settings.light_option')}</option>
          </select>

          <div className="text-[10px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-200 dark:border-zinc-800/80">
            {theme === 'dark' ? (
              <span>
                {isId
                  ? 'Aktif: Cyber Obsidian. Tema telemetri gelap kontras tinggi dengan aksen violet obsidian.'
                  : 'Active: Cyber Obsidian. High-contrast dark telemetry theme with violet accents.'}
              </span>
            ) : (
              <span>
                {isId
                  ? 'Aktif: Athletic Slate. Estetika performa bersih dan terang, dioptimalkan untuk visibilitas tinggi.'
                  : 'Active: Athletic Slate. Clean, crisp white & slate athletic aesthetic optimized for bright light.'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
