'use client';

import React from 'react';
import Link from 'next/link';
import { Watch, ArrowRight, Sparkles, Key, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  athleteName: string;
  athleteEmail: string;
  onLoadDemoData?: () => void;
  isDemoActive?: boolean;
}

export default function NewAthleteSetupCard({
  athleteName,
  athleteEmail,
  onLoadDemoData,
  isDemoActive,
}: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  return (
    <div className="bg-gradient-to-r from-violet-950/80 via-[#0d1224] to-[#070a14] border-2 border-violet-500/80 p-5 sm:p-6 shadow-[4px_4px_0px_#7c3aed] text-white font-mono space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-violet-900/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black px-2 py-0.5 bg-violet-950 border border-violet-400 text-violet-300 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              {isId ? 'AKUN_ATLET_PRIBADI' : 'PERSONAL_ATHLETE_ACCOUNT'}
            </span>
            <span className="text-[9px] px-2 py-0.5 bg-slate-900 border border-zinc-700 text-zinc-400 font-bold uppercase">
              {athleteEmail}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black italic tracking-wide uppercase mt-2 text-white">
            {isId ? `SELAMAT DATANG, ${athleteName.toUpperCase()}!` : `WELCOME, ${athleteName.toUpperCase()}!`}
          </h2>
          <p className="text-xs text-zinc-300 font-sans mt-0.5">
            {isId 
              ? 'Data telemetri lari di sistem Freedayzz Pulse diisolasi secara mandiri per setiap akun atlet.'
              : 'Running telemetry in Freedayzz Pulse is isolated and privately configured per athlete.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 border border-violet-300 text-white text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#7c3aed] cursor-pointer whitespace-nowrap"
          >
            <Key className="w-3.5 h-3.5 text-cyan-300" />
            <span>{isId ? 'SAMBUNGKAN GARMIN' : 'CONNECT GARMIN'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Info Notice Box */}
      <div className="bg-[#070a14] border border-violet-900/60 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <Watch className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-bold">
              {isId ? 'Perangkat Garmin Anda Belum Terhubung' : 'Your Garmin Device Is Not Yet Linked'}
            </strong>
            <p className="text-zinc-400 text-[11px] font-sans mt-0.5 leading-relaxed">
              {isId
                ? 'Untuk mulai menyinkronkan aktivitas lari, detak jantung, dan metrik pemulihan pribadi Anda, masukkan Personal API Key Garmin Anda di halaman Pengaturan.'
                : 'To start syncing your own running activities, heart rate zones, and recovery metrics, enter your Garmin Personal API Key in the Settings page.'}
            </p>
          </div>
        </div>

        {onLoadDemoData && (
          <button
            type="button"
            onClick={onLoadDemoData}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isDemoActive ? (isId ? 'TAMPILKAN DATA SAYA' : 'SHOW MY DATA') : (isId ? 'LIHAT CONTOH LAB' : 'PREVIEW LAB DEMO')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
