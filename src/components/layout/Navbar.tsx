'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  BarChart3, 
  Award, 
  Settings, 
  RefreshCw, 
  Compass,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import BrandLogo from '@/components/brand/BrandLogo';

export default function Navbar() {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { href: '/', label: t('nav.dashboard'), icon: Activity },
    { href: '/activities', label: t('nav.activities'), icon: Compass },
    { href: '/fitness', label: t('nav.fitness'), icon: BarChart3 },
    { href: '/recovery', label: t('nav.recovery'), icon: Activity },
    { href: '/records', label: t('nav.records'), icon: Award },
    { href: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#070a14]/95 backdrop-blur-md border-b-2 border-slate-200 dark:border-violet-900/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(124,58,237,0.12)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* 1. Left: Custom Brand Logo & Wordmark */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <BrandLogo size={40} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black italic tracking-widest text-base sm:text-lg text-slate-900 dark:text-white">
                  FREEDAYZZ<span className="text-violet-600 dark:text-violet-400">.PULSE</span>
                </span>
                <span suppressHydrationWarning className="text-[9px] font-mono px-1.5 py-0.2 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-600/60 text-violet-800 dark:text-violet-300 font-bold tracking-wider">
                  {t('nav.pro')}
                </span>
              </div>
              <p suppressHydrationWarning className="text-[8px] sm:text-[9px] font-mono tracking-widest text-slate-500 dark:text-zinc-400 uppercase">
                {t('nav.tagline')}
              </p>
            </div>
          </Link>

          {/* 2. Center: Segmented Telemetry Toolbar */}
          <nav className="hidden md:flex items-center bg-slate-100 dark:bg-[#090d1c] border border-slate-200 dark:border-violet-900/70 p-1 shadow-[2px_2px_0px_#cbd5e1] dark:shadow-[2px_2px_0px_#1e1b4b] gap-1 font-mono">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider transition-all border ${
                    isActive
                      ? 'bg-violet-600 dark:bg-violet-900/90 text-white border-violet-500 shadow-[2px_2px_0px_#7c3aed]'
                      : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-violet-950/40 border-transparent hover:border-slate-300 dark:hover:border-violet-900/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-violet-200' : 'text-slate-500 dark:text-zinc-500'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. Right: Theme Toggle, Sync CTA & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick 1-Click Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 sm:px-2.5 sm:py-2 bg-slate-100 dark:bg-[#090d1c] border border-slate-300 dark:border-violet-900/70 text-slate-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-300 shadow-[2px_2px_0px_#cbd5e1] dark:shadow-[2px_2px_0px_#1e1b4b] cursor-pointer transition-all flex items-center gap-1.5 font-mono text-xs font-bold"
              title={theme === 'dark' ? (language === 'ID' ? 'Ganti ke Mode Terang' : 'Switch to Light Mode') : (language === 'ID' ? 'Ganti ke Mode Gelap' : 'Switch to Dark Mode')}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden xl:inline text-[10px]">
                    {language === 'ID' ? 'TERANG' : 'LIGHT'}
                  </span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-violet-600" />
                  <span className="hidden xl:inline text-[10px]">
                    {language === 'ID' ? 'GELAP' : 'DARK'}
                  </span>
                </>
              )}
            </button>

            {/* Sync Feedback */}
            {syncMessage && (
              <span className="text-[10px] font-mono uppercase text-violet-600 dark:text-violet-300 animate-pulse hidden xl:inline-block">
                {syncMessage}
              </span>
            )}

            {/* Sync Button */}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-violet-300 shadow-[3px_3px_0px_#cbd5e1] dark:shadow-[3px_3px_0px_#1e1b4b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 cursor-pointer"
              title="Sync with Garmin Connect"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? t('nav.syncing') : t('nav.sync')}</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 bg-slate-100 dark:bg-[#090d1c] border border-slate-300 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white md:hidden cursor-pointer"
              title="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-violet-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 4. Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-slate-200 dark:border-violet-900/60 font-mono space-y-1 animate-in fade-in duration-150">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-bold tracking-wider transition-all border ${
                    isActive
                      ? 'bg-violet-600 text-white border-violet-500'
                      : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-[#090d1c] border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {isActive && (
                    <span className="text-[10px] text-violet-200">
                      {language === 'ID' ? 'AKTIF' : 'ACTIVE'}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
