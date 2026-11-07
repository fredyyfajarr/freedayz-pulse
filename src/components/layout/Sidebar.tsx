'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  BarChart3, 
  Award, 
  Settings, 
  RefreshCw, 
  Compass,
  Sun,
  Moon,
  HeartPulse,
  Globe,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useSidebar } from '@/context/SidebarContext';
import BrandLogo from '@/components/brand/BrandLogo';
import HamburgerButton from '@/components/layout/HamburgerButton';

export default function Sidebar() {
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme, toggleTheme } = useTheme();
  const { 
    isMobileOpen, 
    isDesktopOpen, 
    toggleMobile, 
    toggleDesktop, 
    closeMobile 
  } = useSidebar();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Close drawer on Escape key and lock body scroll when mobile drawer is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile();
    };
    window.addEventListener('keydown', handleKeyDown);

    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileOpen, closeMobile]);

  // Close mobile drawer automatically when route changes
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(`Synced ${data.syncedCount} runs`);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setSyncMessage(data.error || 'Sync failed');
      }
    } catch {
      setSyncMessage('Sync network error');
    } finally {
      setIsSyncing(false);
    }
  };

  const navLinks = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: Activity, key: 'dashboard' },
    { href: '/activities', label: t('nav.activities'), icon: Compass, key: 'activities' },
    { href: '/fitness', label: t('nav.fitness'), icon: BarChart3, key: 'fitness' },
    { href: '/recovery', label: t('nav.recovery'), icon: HeartPulse, key: 'recovery' },
    { href: '/records', label: t('nav.records'), icon: Award, key: 'records' },
    { href: '/settings', label: t('nav.settings'), icon: Settings, key: 'settings' },
  ];

  const mobileDockLinks = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: Activity },
    { href: '/activities', label: t('nav.activities'), icon: Compass },
    { href: '/fitness', label: t('nav.fitness'), icon: BarChart3 },
    { href: '/recovery', label: t('nav.recovery'), icon: HeartPulse },
    { href: '/records', label: t('nav.records'), icon: Award },
  ];

  return (
    <>
      {/* =========================================================================
          1. DESKTOP SIDEBAR (Collapsible between w-72 Expanded & w-16 Mini Rail)
         ========================================================================= */}
      <aside 
        suppressHydrationWarning
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-40 bg-white/95 dark:bg-[#070a14]/95 backdrop-blur-md border-r-2 border-slate-200 dark:border-violet-900/60 shadow-[4px_0_24px_rgba(0,0,0,0.04)] dark:shadow-[4px_0_24px_rgba(124,58,237,0.08)] select-none transition-all duration-300 ease-in-out ${
          isDesktopOpen ? 'w-72' : 'w-16'
        }`}
      >
        {/* Brand Header */}
        {isDesktopOpen ? (
          /* EXPANDED HEADER: Brand logo, title, and close button (never offside) */
          <div className="h-16 px-3.5 border-b-2 border-slate-200 dark:border-violet-900/60 bg-slate-50/50 dark:bg-[#090d1c]/50 flex items-center justify-between gap-2 overflow-hidden">
            <Link href="/dashboard" className="flex items-center gap-2 group min-w-0">
              <BrandLogo size={32} />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="font-black italic tracking-wider text-sm text-slate-900 dark:text-white whitespace-nowrap">
                    FREEDAYZZ<span className="text-violet-600 dark:text-violet-400">.PULSE</span>
                  </span>
                  <span suppressHydrationWarning className="text-[8px] font-mono px-1 py-0.2 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-600/60 text-violet-800 dark:text-violet-300 font-bold shrink-0">
                    {t('nav.pro')}
                  </span>
                </div>
                <p suppressHydrationWarning className="text-[8px] font-mono tracking-widest text-slate-500 dark:text-zinc-400 uppercase truncate">
                  {t('nav.tagline')}
                </p>
              </div>
            </Link>

            {/* Desktop Animated Close Button (X) - comfortably inside the header */}
            <HamburgerButton
              isOpen={true}
              onClick={toggleDesktop}
              title="Kecilkan Sidebar (Collapse)"
              className="w-7 h-7 shrink-0 ml-1"
            />
          </div>
        ) : (
          /* COLLAPSED MINI-RAIL HEADER: Centered Hamburger button to expand */
          <div className="h-16 border-b-2 border-slate-200 dark:border-violet-900/60 bg-slate-50/50 dark:bg-[#090d1c]/50 flex flex-col items-center justify-center">
            <HamburgerButton
              isOpen={false}
              onClick={toggleDesktop}
              title="Perlebar Sidebar (Expand)"
              className="w-8 h-8"
            />
          </div>
        )}

        {/* Navigation Links Area */}
        <div className={`flex-1 overflow-y-auto py-3 space-y-1 font-mono ${isDesktopOpen ? 'px-3' : 'px-2'}`}>
          {isDesktopOpen && (
            <div className="px-3 pb-2 flex items-center justify-between text-[10px] font-black tracking-widest text-slate-400 dark:text-zinc-500 uppercase">
              <span>{language === 'ID' ? 'NAVIGASI_TELEMETRI' : 'TELEMETRY_NAV'}</span>
              <span className="text-[9px] text-violet-600 dark:text-violet-400">
                {language === 'ID' ? '// SISTEM_AKTIF' : '// SYS_ACTIVE'}
              </span>
            </div>
          )}

          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = link.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname.startsWith(link.href);

            if (!isDesktopOpen) {
              /* Collapsed Mini-Rail Icon Link */
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={link.label}
                  className={`relative w-10 h-10 mx-auto flex items-center justify-center transition-all border ${
                    isActive
                      ? 'bg-violet-600 dark:bg-violet-900/90 text-white border-violet-500 shadow-[2px_2px_0px_#7c3aed]'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-violet-950/40 border-transparent hover:border-slate-300 dark:hover:border-violet-900/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-zinc-400'}`} />
                  {isActive && (
                    <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r" />
                  )}
                </Link>
              );
            }

            /* Expanded Full Nav Link */
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center justify-between px-3 py-2.5 text-xs font-bold tracking-wider rounded-none transition-all border ${
                  isActive
                    ? 'bg-violet-600 dark:bg-violet-900/90 text-white border-violet-500 shadow-[2px_2px_0px_#7c3aed] dark:shadow-[2px_2px_0px_#4c1d95]'
                    : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-violet-950/40 border-transparent hover:border-slate-300 dark:hover:border-violet-900/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-200' : 'text-slate-500 dark:text-zinc-400'}`} />
                  <span className="truncate">{link.label}</span>
                </div>
                {isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Utility Controls */}
        <div className={`border-t-2 border-slate-200 dark:border-violet-900/60 bg-slate-50/70 dark:bg-[#090d1c]/70 font-mono ${
          isDesktopOpen ? 'p-3 space-y-3' : 'py-3 px-2 flex flex-col items-center gap-2.5'
        }`}>
          {isDesktopOpen ? (
            /* Expanded Bottom Controls */
            <>
              {/* Quick Controls: Segmented Theme & Language Switches (Crystal Clear Status) */}
              <div className="grid grid-cols-2 gap-2">
                {/* Theme Segmented Switch */}
                <div className="flex items-center p-0.5 bg-slate-100 dark:bg-[#070a14] border border-slate-300 dark:border-violet-900/70">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 px-1 text-[10px] font-black transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-amber-400 text-slate-900 shadow-sm'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title={language === 'ID' ? 'Aktifkan Mode Terang' : 'Switch to Light Mode'}
                  >
                    <Sun className="w-3 h-3" />
                    <span>{language === 'ID' ? 'TERANG' : 'LIGHT'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 px-1 text-[10px] font-black transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title={language === 'ID' ? 'Aktifkan Mode Gelap' : 'Switch to Dark Mode'}
                  >
                    <Moon className="w-3 h-3" />
                    <span>{language === 'ID' ? 'GELAP' : 'DARK'}</span>
                  </button>
                </div>

                {/* Language Segmented Switch */}
                <div className="flex items-center p-0.5 bg-slate-100 dark:bg-[#070a14] border border-slate-300 dark:border-violet-900/70">
                  <button
                    type="button"
                    onClick={() => setLanguage('ID')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 px-1 text-[10px] font-black transition-all cursor-pointer ${
                      language === 'ID'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Gunakan Bahasa Indonesia"
                  >
                    <Globe className="w-3 h-3 text-cyan-400" />
                    <span>ID</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('EN')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 px-1 text-[10px] font-black transition-all cursor-pointer ${
                      language === 'EN'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Switch to English"
                  >
                    <span>EN</span>
                  </button>
                </div>
              </div>

              {/* Sync Button */}
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider border border-violet-400 shadow-[2px_2px_0px_#cbd5e1] dark:shadow-[2px_2px_0px_#1e1b4b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 cursor-pointer"
                title={language === 'ID' ? 'Sinkronkan dengan Garmin Connect' : 'Sync with Garmin Connect'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? t('nav.syncing') : t('nav.sync')}</span>
              </button>

              {/* Sync Feedback Message */}
              {syncMessage && (
                <div className="text-center text-[10px] uppercase text-violet-600 dark:text-violet-300 font-bold animate-pulse bg-violet-100/70 dark:bg-violet-950/70 py-1 border border-violet-300 dark:border-violet-800">
                  {syncMessage}
                </div>
              )}

              {/* System Telemetry & Status Badge */}
              <div className="pt-1 flex items-center justify-between text-[9px] text-slate-500 dark:text-zinc-400 border-t border-slate-200 dark:border-violet-900/40">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold tracking-wider">
                    {language === 'ID' ? 'GARMIN AKTIF' : 'GARMIN LIVE'}
                  </span>
                </div>
                <span className="font-mono text-slate-400 dark:text-zinc-500">v2.4 PRO</span>
              </div>
            </>
          ) : (
            /* Collapsed Bottom Controls: Compact Icon Buttons */
            <>
              {/* Theme Toggle Icon */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center bg-white dark:bg-[#070a14] border border-slate-300 dark:border-violet-900/70 text-slate-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-300 shadow-sm cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-violet-600" />
                )}
              </button>

              {/* Sync Icon Button */}
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-9 h-9 flex items-center justify-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white border border-violet-400 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                title="Sync Garmin Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>

              {/* Live Dot */}
              <div className="pt-1 flex items-center justify-center" title="Garmin Connected // Live">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </>
          )}
        </div>
      </aside>

      {/* =========================================================================
          2. MOBILE TOP STICKY BAR (Visible on screens < md)
         ========================================================================= */}
      <header className="md:hidden sticky top-0 z-40 h-14 bg-white/95 dark:bg-[#070a14]/95 backdrop-blur-md border-b-2 border-slate-200 dark:border-violet-900/60 px-3 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition-colors select-none">
        {/* Brand Logo & Name */}
        <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
          <BrandLogo size={28} />
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-black italic tracking-wider text-sm sm:text-base text-slate-900 dark:text-white whitespace-nowrap">
              FREEDAYZZ<span className="text-violet-600 dark:text-violet-400">.PULSE</span>
            </span>
            <span className="text-[8px] font-mono px-1 py-0.2 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-600/60 text-violet-800 dark:text-violet-300 font-bold shrink-0">
              PRO
            </span>
          </div>
        </Link>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-1.5 font-mono">
          {/* Quick Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 bg-slate-100 dark:bg-[#090d1c] border border-slate-300 dark:border-violet-900/70 text-slate-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-300 shadow-[1px_1px_0px_#cbd5e1] dark:shadow-[1px_1px_0px_#1e1b4b] cursor-pointer"
            title="Toggle Light / Dark"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-violet-600" />
            )}
          </button>

          {/* Quick Sync */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="p-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border border-violet-400 shadow-[1px_1px_0px_#cbd5e1] dark:shadow-[1px_1px_0px_#1e1b4b] cursor-pointer disabled:opacity-50"
            title="Sync Garmin Data"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          {/* Animated Hamburger-to-X Toggle Button */}
          <HamburgerButton
            isOpen={isMobileOpen}
            onClick={toggleMobile}
            title={isMobileOpen ? 'Tutup Navigasi (Close)' : 'Buka Navigasi (Open)'}
            ariaLabel="Toggle Navigation Drawer"
            className="ml-1 w-8 h-8"
          />
        </div>
      </header>

      {/* =========================================================================
          3. MOBILE SLIDE-OUT DRAWER & BACKDROP
         ========================================================================= */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            onClick={closeMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Slide-out drawer panel */}
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-[#070a14] border-r-2 border-slate-200 dark:border-violet-900/70 shadow-2xl flex flex-col justify-between p-4 z-50 animate-in slide-in-from-left duration-200">
            {/* Drawer Top Header with Animated X Button */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-violet-900/60">
                <Link 
                  href="/dashboard" 
                  onClick={closeMobile}
                  className="flex items-center gap-2.5 shrink-0"
                >
                  <BrandLogo size={32} />
                  <div className="flex flex-col">
                    <span className="font-black italic tracking-wider text-sm sm:text-base text-slate-900 dark:text-white whitespace-nowrap">
                      FREEDAYZZ<span className="text-violet-600 dark:text-violet-400">.PULSE</span>
                    </span>
                    <p className="text-[8px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                      TELEMETRY LAB
                    </p>
                  </div>
                </Link>

                {/* Animated X Button in Drawer Header - comfortably positioned */}
                <HamburgerButton
                  isOpen={true}
                  onClick={closeMobile}
                  title="Tutup Navigasi (Close)"
                  className="w-8 h-8 shrink-0"
                />
              </div>

              {/* Navigation Links inside Drawer */}
              <nav className="mt-4 space-y-1.5 font-mono">
                {navLinks.map(link => {
                  const Icon = link.icon;
                  const isActive = link.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobile}
                      className={`flex items-center justify-between px-3.5 py-3 text-xs font-bold tracking-wider border transition-all ${
                        isActive
                          ? 'bg-violet-600 text-white border-violet-500 shadow-[2px_2px_0px_#7c3aed]'
                          : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-[#090d1c] border-slate-200 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-violet-200' : 'text-slate-500 dark:text-zinc-400'}`} />
                        <span>{link.label}</span>
                      </div>
                      {isActive && (
                        <span className="text-[9px] text-violet-200 font-bold uppercase">
                          {language === 'ID' ? 'AKTIF' : 'ACTIVE'}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Bottom Controls */}
            <div className="pt-4 border-t border-slate-200 dark:border-violet-900/60 space-y-3 font-mono">
              <div className="grid grid-cols-2 gap-2">
                {/* Theme Switch */}
                <div className="flex items-center p-0.5 bg-slate-100 dark:bg-[#090d1c] border border-slate-300 dark:border-violet-900/70">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1 text-xs font-black transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-amber-400 text-slate-900 shadow-sm'
                        : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>{language === 'ID' ? 'TERANG' : 'LIGHT'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1 text-xs font-black transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>{language === 'ID' ? 'GELAP' : 'DARK'}</span>
                  </button>
                </div>

                {/* Language Switch */}
                <div className="flex items-center p-0.5 bg-slate-100 dark:bg-[#090d1c] border border-slate-300 dark:border-violet-900/70">
                  <button
                    type="button"
                    onClick={() => setLanguage('ID')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1 text-xs font-black transition-all cursor-pointer ${
                      language === 'ID'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ID</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('EN')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1 text-xs font-black transition-all cursor-pointer ${
                      language === 'EN'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    <span>EN</span>
                  </button>
                </div>
              </div>

              {/* Sync Button */}
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider border border-violet-400 shadow-[2px_2px_0px_#cbd5e1] dark:shadow-[2px_2px_0px_#1e1b4b] disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? t('nav.syncing') : t('nav.sync')}</span>
              </button>

              {/* Status */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </span>
                <span>FREEDAYZZ LAB v2.4</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. MOBILE BOTTOM NAVIGATION DOCK (Visible on screens < md)
         ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#070a14]/95 backdrop-blur-md border-t-2 border-slate-200 dark:border-violet-900/60 flex items-center justify-around px-1 py-1.5 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] font-mono select-none">
        {mobileDockLinks.map(link => {
          const Icon = link.icon;
          const isActive = link.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-1 transition-all rounded ${
                isActive
                  ? 'text-violet-600 dark:text-violet-400 font-black'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600 dark:text-violet-400 scale-110' : ''} transition-transform`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-violet-600 dark:bg-violet-400 rounded-full" />
                )}
              </div>
              <span className="text-[9px] tracking-wider mt-1 truncate max-w-[62px]">
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
