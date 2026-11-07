'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Activity, 
  ShieldCheck, 
  Zap, 
  Flame, 
  HeartPulse, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sun, 
  Moon, 
  Share2,
  Check,
  Globe
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { landingTranslations } from '@/context/landingTranslations';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const content = landingTranslations[language] || landingTranslations.ID;

  return (
    <div className="min-h-screen bg-[#f6f8fc] dark:bg-[#06070d] text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      {/* =========================================================================
          1. STICKY TOP NAVBAR WITH OFFICIAL PNG LOGO & ID | EN TOGGLE
         ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#070a14]/90 backdrop-blur-md border-b-2 border-slate-200 dark:border-violet-900/60 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo - Featured PNG */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-9 h-9 rounded-md overflow-hidden border-2 border-violet-500 shadow-[2px_2px_0px_#7c3aed] bg-white dark:bg-[#090d1c] p-0.5 shrink-0 transition-transform group-hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="Freedayzz Pulse Official Brand Logo" 
                width={36} 
                height={36} 
                className="w-full h-full object-cover rounded-sm"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-black italic tracking-wider text-base text-slate-900 dark:text-white whitespace-nowrap">
                  FREEDAYZZ<span className="text-violet-600 dark:text-violet-400">.PULSE</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-600/60 text-violet-800 dark:text-violet-300 font-bold shrink-0">
                  PRO
                </span>
              </div>
              <p className="text-[8px] font-mono tracking-widest text-slate-500 dark:text-zinc-400 uppercase whitespace-nowrap">
                TELEMETRY LAB
              </p>
            </div>
          </Link>

          {/* Center Navigation Links (Hidden on mobile) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono font-bold tracking-wider text-slate-600 dark:text-zinc-300">
            <a href="#brand" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              {content.nav.brand}
            </a>
            <a href="#comparison" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              {content.nav.comparison}
            </a>
            <a href="#features" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              {content.nav.features}
            </a>
            <a href="#byok" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              {content.nav.byok}
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bilingual ID | EN Toggle Button */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-[#090d1c] border border-slate-300 dark:border-violet-900/70 text-slate-700 dark:text-zinc-300 hover:border-violet-400 dark:hover:border-violet-500 shadow-[1px_1px_0px_#cbd5e1] dark:shadow-[1px_1px_0px_#1e1b4b] cursor-pointer transition-all"
              title={language === 'ID' ? 'Switch to English' : 'Beralih ke Bahasa Indonesia'}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <div className="flex items-center gap-1 font-mono text-xs font-bold leading-none">
                <span className={language === 'ID' ? 'text-violet-600 dark:text-cyan-300 font-black underline decoration-2 underline-offset-2' : 'text-slate-400 dark:text-zinc-500'}>
                  ID
                </span>
                <span className="text-slate-300 dark:text-zinc-700 font-normal">|</span>
                <span className={language === 'EN' ? 'text-violet-600 dark:text-cyan-300 font-black underline decoration-2 underline-offset-2' : 'text-slate-400 dark:text-zinc-500'}>
                  EN
                </span>
              </div>
            </button>

            {/* Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 bg-slate-100 dark:bg-[#090d1c] border border-slate-300 dark:border-violet-900/70 text-slate-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-300 shadow-[1px_1px_0px_#cbd5e1] dark:shadow-[1px_1px_0px_#1e1b4b] cursor-pointer transition-all"
              title="Toggle Light / Dark"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-600" />}
            </button>

            {/* Launch App / Dashboard CTA */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-violet-400 shadow-[3px_3px_0px_#cbd5e1] dark:shadow-[3px_3px_0px_#1e1b4b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer whitespace-nowrap"
            >
              <span>{content.nav.launchLab}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION WITH TYPOGRAPHY BADGE (HIGH-CONTRAST & BILINGUAL)
         ========================================================================= */}
      <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28 border-b-2 border-slate-200 dark:border-violet-900/60">
        {/* Cyber grid backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#7c3aed_1px,transparent_1px)] [background-size:24px_24px] opacity-15 dark:opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Commercial Brand Typography Badge (Pure Typography Without Logo Image) */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 dark:bg-violet-950/80 border-2 border-violet-400 dark:border-violet-700 shadow-[2px_2px_0px_#7c3aed] font-mono text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-900 dark:text-white">
                  FREEDAYZZ<span className="text-violet-600 dark:text-violet-400">.PULSE</span>
                </span>
                <span className="text-[10px] text-slate-600 dark:text-zinc-400 hidden sm:inline">
                  {content.hero.badge}
                </span>
                <span className="text-[8px] px-1.5 py-0.2 bg-violet-600 text-white font-bold ml-1">
                  PRO
                </span>
              </div>
            </div>

            {/* Main Headline with High-Contrast Color (No Invisible Text in Light Mode) */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black italic tracking-tight uppercase text-slate-900 dark:text-white leading-[1.1]">
              {content.hero.titleLine1}{' '}
              <span className="text-violet-600 dark:text-cyan-400 block sm:inline">
                {content.hero.titleLine2}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-zinc-400 font-mono leading-relaxed max-w-2xl mx-auto">
              {content.hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 font-mono">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-black text-sm uppercase tracking-wider border-2 border-violet-400 shadow-[4px_4px_0px_#4c1d95] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-cyan-300" />
                <span>{content.hero.btnLaunch}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <a
                href="#comparison"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-[#090d1c] hover:bg-slate-100 dark:hover:bg-violet-950/40 text-slate-800 dark:text-zinc-200 font-black text-sm uppercase tracking-wider border-2 border-slate-300 dark:border-violet-900/80 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] transition-all"
              >
                <span>{content.hero.btnCompare}</span>
              </a>
            </div>

            {/* Micro Feature Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900/60 px-2.5 py-1 border border-slate-200 dark:border-zinc-800">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> {content.hero.highlights.byok}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900/60 px-2.5 py-1 border border-slate-200 dark:border-zinc-800">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> {content.hero.highlights.acwr}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900/60 px-2.5 py-1 border border-slate-200 dark:border-zinc-800">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> {content.hero.highlights.banister}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900/60 px-2.5 py-1 border border-slate-200 dark:border-zinc-800">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> {content.hero.highlights.recovery}
              </span>
            </div>
          </div>

          {/* Interactive Live Teaser Mockup */}
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="relative bg-white dark:bg-[#0a0f24] border-2 border-slate-300 dark:border-violet-700/80 p-4 sm:p-6 shadow-[8px_8px_0px_#cbd5e1] dark:shadow-[8px_8px_0px_#1e1b4b]">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="ml-2 font-bold text-slate-700 dark:text-zinc-300">
                    {content.hero.mockup.windowTitle}
                  </span>
                </div>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold hidden sm:inline">
                  {content.hero.mockup.sensorSync}
                </span>
              </div>

              {/* Grid Cards Showcase inside Mockup */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 font-mono">
                {/* Metric 1 */}
                <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-violet-400 dark:border-violet-800 p-3 shadow-sm">
                  <span className="text-[9px] text-slate-500 dark:text-zinc-400 font-bold uppercase block">
                    {content.hero.mockup.metric1Label}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">42.8</span>
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">KM</span>
                  </div>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                    {content.hero.mockup.metric1Sub}
                  </span>
                </div>

                {/* Metric 2: ACWR */}
                <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-emerald-400 dark:border-emerald-800 p-3 shadow-sm">
                  <span className="text-[9px] text-slate-500 dark:text-zinc-400 font-bold uppercase block">
                    {content.hero.mockup.metric2Label}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">1.08</span>
                    <span className="text-xs font-bold text-slate-400">{content.hero.mockup.metric2Ratio}</span>
                  </div>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                    {content.hero.mockup.metric2Sub}
                  </span>
                </div>

                {/* Metric 3: Bannister TRIMP */}
                <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-rose-400 dark:border-rose-800 p-3 shadow-sm">
                  <span className="text-[9px] text-slate-500 dark:text-zinc-400 font-bold uppercase block">
                    {content.hero.mockup.metric3Label}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-rose-600 dark:text-rose-400">385</span>
                    <span className="text-xs font-bold text-rose-500">PTS</span>
                  </div>
                  <span className="text-[9px] text-slate-500 dark:text-zinc-400 block mt-1">
                    {content.hero.mockup.metric3Sub}
                  </span>
                </div>

                {/* Metric 4: Garmin Sleep Score */}
                <div className="bg-slate-50 dark:bg-[#070a14] border-2 border-cyan-400 dark:border-cyan-800 p-3 shadow-sm">
                  <span className="text-[9px] text-slate-500 dark:text-zinc-400 font-bold uppercase block">
                    {content.hero.mockup.metric4Label}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">84</span>
                    <span className="text-xs font-bold text-slate-400">/ 100</span>
                  </div>
                  <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold block mt-1">
                    {content.hero.mockup.metric4Sub}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. DEDICATED COMMERCIAL BRAND SHOWCASE SECTION (#brand)
         ========================================================================= */}
      <section id="brand" className="py-16 md:py-24 border-b-2 border-slate-200 dark:border-violet-900/60 bg-gradient-to-b from-violet-950/20 via-transparent to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest px-2.5 py-1 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-800">
              {content.brand.badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black italic tracking-wide uppercase text-slate-900 dark:text-white mt-3">
              {content.brand.title}
            </h2>
            <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-zinc-400 mt-2">
              {content.brand.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            {/* Left: The Grand Logo Card (Hero Product Display) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative group p-4 bg-white dark:bg-[#0a0f26] border-2 border-violet-500 shadow-[8px_8px_0px_#7c3aed] text-center w-full max-w-xs">
                {/* Glow behind logo */}
                <div className="absolute inset-0 bg-violet-600/10 dark:bg-violet-600/20 filter blur-xl -z-10" />
                
                {/* High-res PNG Logo render */}
                <div className="w-36 h-36 mx-auto rounded-lg overflow-hidden border-2 border-violet-400/80 bg-white p-2 shadow-inner">
                  <Image
                    src="/logo.png"
                    alt="Freedayzz Pulse Master Logo"
                    width={144}
                    height={144}
                    className="w-full h-full object-cover rounded"
                    priority
                  />
                </div>

                <div className="mt-4 font-mono">
                  <h3 className="text-lg font-black italic tracking-wider text-slate-900 dark:text-white uppercase">
                    FREEDAYZZ<span className="text-violet-600 dark:text-violet-400">.PULSE</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-widest mt-0.5">
                    {content.brand.masterLogoSubtitle}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{content.brand.vectorDna}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Three Brand Anatomy Pillars */}
            <div className="lg:col-span-7 space-y-4 font-mono text-xs">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-[#090d1c] border-2 border-slate-300 dark:border-violet-900/70 p-4 shadow-sm flex items-start gap-4">
                <div className="p-2 bg-violet-100 dark:bg-violet-950 border border-violet-400 text-violet-700 dark:text-violet-300 shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                    {content.brand.pillar1Title}
                  </h4>
                  <p className="text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {content.brand.pillar1Desc}
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-[#090d1c] border-2 border-slate-300 dark:border-violet-900/70 p-4 shadow-sm flex items-start gap-4">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 text-cyan-700 dark:text-cyan-300 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                    {content.brand.pillar2Title}
                  </h4>
                  <p className="text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {content.brand.pillar2Desc}
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-[#090d1c] border-2 border-slate-300 dark:border-violet-900/70 p-4 shadow-sm flex items-start gap-4">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 text-emerald-700 dark:text-emerald-300 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                    {content.brand.pillar3Title}
                  </h4>
                  <p className="text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {content.brand.pillar3Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. HEAD-TO-HEAD COMPARISON TABLE (4-WAY MATRIX: GARMIN FREE VS CONNECT+ VS STRAVA VS FREEDAYZZ)
         ========================================================================= */}
      <section id="comparison" className="py-16 md:py-24 border-b-2 border-slate-200 dark:border-violet-900/60 bg-white/50 dark:bg-[#080c1d]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest px-2 py-1 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-800">
              {content.comparison.badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black italic tracking-wide uppercase text-slate-900 dark:text-white mt-3">
              {content.comparison.title}
            </h2>
            <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-zinc-400 mt-2">
              {content.comparison.subtitle}
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto shadow-[6px_6px_0px_#cbd5e1] dark:shadow-[6px_6px_0px_#1e1b4b] border-2 border-slate-300 dark:border-violet-900/80">
            <table className="w-full min-w-[760px] text-left font-mono text-xs border-collapse bg-white dark:bg-[#0a0e22]">
              <thead>
                <tr className="border-b-2 border-slate-300 dark:border-violet-900/80 bg-slate-100 dark:bg-[#070a16] text-slate-900 dark:text-white">
                  <th className="p-3.5 uppercase tracking-wider font-black w-[28%]">
                    {content.comparison.colDimension}
                  </th>
                  <th className="p-3.5 uppercase tracking-wider font-bold text-slate-600 dark:text-zinc-400 w-[18%]">
                    {content.comparison.colGarminFree}
                  </th>
                  <th className="p-3.5 uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 w-[18%]">
                    {content.comparison.colGarminPlus}
                  </th>
                  <th className="p-3.5 uppercase tracking-wider font-bold text-orange-600 dark:text-orange-400 w-[18%]">
                    {content.comparison.colStrava}
                  </th>
                  <th className="p-3.5 uppercase tracking-wider font-black text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 border-l-2 border-violet-500 w-[18%]">
                    {content.comparison.colFreedayzz}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                {/* Row 1: Biaya */}
                <tr>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-zinc-200">
                    {content.comparison.rows.cost.dim}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-zinc-400">
                    {content.comparison.rows.cost.garminFree}
                  </td>
                  <td className="p-3.5 text-blue-700 dark:text-blue-400 font-bold">
                    {content.comparison.rows.cost.garminPlus}
                  </td>
                  <td className="p-3.5 text-rose-600 dark:text-rose-400 font-bold">
                    {content.comparison.rows.cost.strava}
                  </td>
                  <td className="p-3.5 bg-violet-50/70 dark:bg-violet-950/30 border-l-2 border-violet-500 font-black text-emerald-600 dark:text-emerald-400">
                    {content.comparison.rows.cost.freedayzz}
                  </td>
                </tr>

                {/* Row 2: Holistic Synthesis */}
                <tr>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-zinc-200">
                    {content.comparison.rows.synthesis.dim}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-zinc-400">
                    {content.comparison.rows.synthesis.garminFree}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-zinc-300">
                    {content.comparison.rows.synthesis.garminPlus}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    <span className="flex items-center gap-1 text-rose-500">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{content.comparison.rows.synthesis.strava}</span>
                    </span>
                  </td>
                  <td className="p-3.5 bg-violet-50/70 dark:bg-violet-950/30 border-l-2 border-violet-500 font-bold text-violet-700 dark:text-violet-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{content.comparison.rows.synthesis.freedayzz}</span>
                    </span>
                  </td>
                </tr>

                {/* Row 3: ACWR Injury Radar */}
                <tr>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-zinc-200">
                    {content.comparison.rows.acwr.dim}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    <span className="flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{content.comparison.rows.acwr.garminFree}</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-zinc-300">
                    <span className="flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>{content.comparison.rows.acwr.garminPlus}</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">
                    <span className="flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>{content.comparison.rows.acwr.strava}</span>
                    </span>
                  </td>
                  <td className="p-3.5 bg-violet-50/70 dark:bg-violet-950/30 border-l-2 border-violet-500 font-bold text-violet-700 dark:text-violet-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{content.comparison.rows.acwr.freedayzz}</span>
                    </span>
                  </td>
                </tr>

                {/* Row 4: Banister TRIMP & PMC */}
                <tr>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-zinc-200">
                    {content.comparison.rows.pmc.dim}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-zinc-400">
                    {content.comparison.rows.pmc.garminFree}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-zinc-300">
                    {content.comparison.rows.pmc.garminPlus}
                  </td>
                  <td className="p-3.5 text-orange-600 dark:text-orange-400 font-bold">
                    {content.comparison.rows.pmc.strava}
                  </td>
                  <td className="p-3.5 bg-violet-50/70 dark:bg-violet-950/30 border-l-2 border-violet-500 font-bold text-violet-700 dark:text-violet-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{content.comparison.rows.pmc.freedayzz}</span>
                    </span>
                  </td>
                </tr>

                {/* Row 5: Social Export */}
                <tr>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-zinc-200">
                    {content.comparison.rows.export.dim}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-zinc-400">
                    {content.comparison.rows.export.garminFree}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-zinc-400">
                    {content.comparison.rows.export.garminPlus}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-zinc-400">
                    {content.comparison.rows.export.strava}
                  </td>
                  <td className="p-3.5 bg-violet-50/70 dark:bg-violet-950/30 border-l-2 border-violet-500 font-bold text-violet-700 dark:text-violet-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{content.comparison.rows.export.freedayzz}</span>
                    </span>
                  </td>
                </tr>

                {/* Row 6: Data Privacy */}
                <tr>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-zinc-200">
                    {content.comparison.rows.sovereignty.dim}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-zinc-400">
                    {content.comparison.rows.sovereignty.garminFree}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-zinc-400">
                    {content.comparison.rows.sovereignty.garminPlus}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-zinc-400">
                    {content.comparison.rows.sovereignty.strava}
                  </td>
                  <td className="p-3.5 bg-violet-50/70 dark:bg-violet-950/30 border-l-2 border-violet-500 font-bold text-violet-700 dark:text-violet-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{content.comparison.rows.sovereignty.freedayzz}</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CORE PILLARS & FEATURES
         ========================================================================= */}
      <section id="features" className="py-16 md:py-24 border-b-2 border-slate-200 dark:border-violet-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest px-2 py-1 bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-800">
              {content.features.badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black italic tracking-wide uppercase text-slate-900 dark:text-white mt-3">
              {content.features.title}
            </h2>
            <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-zinc-400 mt-2">
              {content.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-[#0a0e22] border-2 border-slate-300 dark:border-violet-800/80 p-6 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] relative group hover:border-violet-500 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-700 text-violet-700 dark:text-violet-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400">
                  {content.features.cards[0].tag}
                </span>
              </div>
              <h3 className="text-lg font-black italic tracking-wide uppercase text-slate-900 dark:text-white">
                {content.features.cards[0].title}
              </h3>
              <p className="text-xs font-mono text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                {content.features.cards[0].desc}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-[#0a0e22] border-2 border-slate-300 dark:border-violet-800/80 p-6 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] relative group hover:border-violet-500 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {content.features.cards[1].tag}
                </span>
              </div>
              <h3 className="text-lg font-black italic tracking-wide uppercase text-slate-900 dark:text-white">
                {content.features.cards[1].title}
              </h3>
              <p className="text-xs font-mono text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                {content.features.cards[1].desc}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-[#0a0e22] border-2 border-slate-300 dark:border-violet-800/80 p-6 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] relative group hover:border-violet-500 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-rose-100 dark:bg-rose-950 border border-rose-400 dark:border-rose-700 text-rose-700 dark:text-rose-300">
                  <Flame className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">
                  {content.features.cards[2].tag}
                </span>
              </div>
              <h3 className="text-lg font-black italic tracking-wide uppercase text-slate-900 dark:text-white">
                {content.features.cards[2].title}
              </h3>
              <p className="text-xs font-mono text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                {content.features.cards[2].desc}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-[#0a0e22] border-2 border-slate-300 dark:border-violet-800/80 p-6 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] relative group hover:border-violet-500 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 border border-indigo-400 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {content.features.cards[3].tag}
                </span>
              </div>
              <h3 className="text-lg font-black italic tracking-wide uppercase text-slate-900 dark:text-white">
                {content.features.cards[3].title}
              </h3>
              <p className="text-xs font-mono text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                {content.features.cards[3].desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. HOW BYOK WORKS (BRING YOUR OWN KEY)
         ========================================================================= */}
      <section id="byok" className="py-16 md:py-24 border-b-2 border-slate-200 dark:border-violet-900/60 bg-slate-100/60 dark:bg-[#060814]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-2 py-1 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800">
              {content.byok.badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black italic tracking-wide uppercase text-slate-900 dark:text-white mt-3">
              {content.byok.title}
            </h2>
            <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-zinc-400 mt-2">
              {content.byok.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            {content.byok.steps.map((step, idx) => (
              <div 
                key={step.step}
                className="bg-white dark:bg-[#090d1c] border-2 border-slate-300 dark:border-zinc-800 p-6 relative shadow-sm"
              >
                <span className={`text-3xl font-black ${
                  idx === 0 
                    ? 'text-violet-600 dark:text-violet-400' 
                    : idx === 1 
                    ? 'text-cyan-600 dark:text-cyan-400' 
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {step.step}
                </span>
                <h4 className="text-base font-black text-slate-900 dark:text-white uppercase mt-2">
                  {step.title}
                </h4>
                <p className="text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. BOTTOM CALL TO ACTION
         ========================================================================= */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-violet-900/10 to-violet-900/30 border-b-2 border-slate-200 dark:border-violet-900/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-block p-2 bg-white dark:bg-[#090d1c] border-2 border-violet-500 shadow-[4px_4px_0px_#4c1d95]">
            <Image
              src="/logo.png"
              alt="Freedayzz Pulse"
              width={56}
              height={56}
              className="rounded"
            />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black italic tracking-wide uppercase text-slate-900 dark:text-white">
            {content.cta.title}
          </h2>
          <p className="text-sm sm:text-base font-mono text-slate-600 dark:text-zinc-300 max-w-xl mx-auto">
            {content.cta.subtitle}
          </p>
          <div className="pt-2 font-mono">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-base uppercase tracking-wider border-2 border-violet-400 shadow-[4px_4px_0px_#4c1d95] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>{content.cta.button}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. ACADEMIC & PROJECT FOOTER WITH PNG LOGO
         ========================================================================= */}
      <footer className="py-12 bg-white dark:bg-[#05070f] font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-200 dark:border-zinc-800 pt-8">
          {/* Left: Brand info with PNG Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded overflow-hidden border border-violet-500 bg-white p-0.5 shrink-0 shadow-sm">
              <Image 
                src="/logo.png" 
                alt="Freedayzz Pulse Logo" 
                width={32} 
                height={32} 
                className="w-full h-full object-cover rounded" 
              />
            </div>
            <div>
              <span className="font-black italic text-sm text-slate-900 dark:text-white">
                FREEDAYZZ<span className="text-violet-600 dark:text-violet-400">.PULSE</span>
              </span>
              <p className="text-[9px] text-slate-500 dark:text-zinc-500">
                {content.footer.tagline}
              </p>
            </div>
          </div>

          {/* Center Academic Tag for MPI */}
          <div className="text-center md:text-left text-[10px] text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 bg-slate-50 dark:bg-[#070a14]">
            <span>{content.footer.academicCourse}</span>
          </div>

          {/* Right: Copyright */}
          <div suppressHydrationWarning className="text-[10px] text-slate-500 dark:text-zinc-500">
            © {new Date().getFullYear()} FREEDAYZZ PULSE. {content.footer.rights}
          </div>
        </div>
      </footer>
    </div>
  );
}
