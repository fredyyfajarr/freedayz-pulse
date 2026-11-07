'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import BrandLogo from '@/components/brand/BrandLogo';
import { saveGarminConnection } from '@/app/auth/actions';
import {
  Key,
  HeartPulse,
  Target,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon,
  Globe,
  Sparkles,
  ShieldCheck,
  Activity,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isId = language === 'ID';

  const defaultKeyFromEnv =
    'GCDC_92d09644-66c3-4643-abd0-f54ae03a582e.b34d5549-2a76-4501-b7f6-163916b4ad00.yhUs3BnSlp2MHwpOVBCPtWL7oTxC0AdfA6bRJ3sZp+Y.3967855271';

  const [garminKey, setGarminKey] = useState('');
  const [hrMethod, setHrMethod] = useState<'HRR' | 'LTHR' | 'MAX_HR'>('HRR');
  const [weeklyTarget, setWeeklyTarget] = useState('30');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUseEnvKey = () => {
    setGarminKey(defaultKeyFromEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.set('garminApiKey', garminKey);
    formData.set('hrZoneMethod', hrMethod);
    formData.set('weeklyTargetKm', weeklyTarget);

    try {
      const res = await saveGarminConnection(formData);
      if (res?.error) {
        setErrorMsg(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (err?.digest?.includes('NEXT_REDIRECT') || err?.message?.includes('NEXT_REDIRECT')) {
        return;
      }
      setErrorMsg(err.message || 'Gagal menyimpan koneksi');
      setLoading(false);
    }
  };

  const handleSkipDemo = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.set('garminApiKey', '');
    formData.set('hrZoneMethod', hrMethod);
    formData.set('weeklyTargetKm', weeklyTarget);

    try {
      await saveGarminConnection(formData);
    } catch (err: any) {
      if (err?.digest?.includes('NEXT_REDIRECT') || err?.message?.includes('NEXT_REDIRECT')) {
        return;
      }
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06070d] text-slate-900 dark:text-zinc-100 font-sans p-4 sm:p-6 md:p-10 flex flex-col justify-between transition-colors">
      {/* Top Header */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-200 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-2 group">
          <BrandLogo size={32} />
          <span className="font-black italic tracking-wider text-base text-slate-900 dark:text-white">
            FREEDAYZZ<span className="text-violet-600 dark:text-violet-400">.PULSE</span>
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-700 text-violet-800 dark:text-violet-300 font-bold ml-1">
            ONBOARDING
          </span>
        </Link>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-[#090d1c] border border-slate-300 dark:border-violet-900/60 text-xs font-mono font-bold"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{language}</span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 bg-white dark:bg-[#090d1c] border border-slate-300 dark:border-violet-900/60 text-slate-700 dark:text-zinc-300"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-violet-600" />}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl w-full mx-auto my-8">
        {/* Step Progress Bar */}
        <div className="grid grid-cols-3 gap-2 mb-8 font-mono text-[11px]">
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-bold truncate">{isId ? '1. AKUN DIBUAT' : '1. REGISTERED'}</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-violet-100 dark:bg-violet-950/80 border-2 border-violet-500 shadow-[2px_2px_0px_#7c3aed] text-violet-900 dark:text-white">
            <Zap className="w-4 h-4 text-cyan-500 animate-pulse shrink-0" />
            <span className="font-black truncate">{isId ? '2. SAMBUNG GARMIN' : '2. CONNECT GARMIN'}</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-slate-100 dark:bg-zinc-900/60 border border-slate-300 dark:border-zinc-800 text-slate-400 dark:text-zinc-500">
            <Activity className="w-4 h-4 shrink-0" />
            <span className="font-bold truncate">{isId ? '3. TELEMETRY LAB' : '3. DASHBOARD'}</span>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-[#0a0f24] border-2 border-slate-300 dark:border-violet-700/80 p-6 sm:p-8 shadow-[6px_6px_0px_#cbd5e1] dark:shadow-[6px_6px_0px_#1e1b4b]">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-cyan-400">
                BYOK // BRING YOUR OWN KEY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black italic tracking-wide text-slate-900 dark:text-white uppercase">
              {isId ? 'HUBUNGKAN GARMIN PERSONAL API' : 'CONNECT GARMIN PERSONAL API'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 font-sans">
              {isId
                ? 'Masukkan Garmin Connect Personal API Key Anda untuk menarik aktivitas lari asli, RHR 7-hari, dan denyut jantung real-time tanpa perantara pihak ketiga.'
                : 'Enter your Garmin Connect Personal API Key to fetch your actual runs, 7-day rolling RHR, and live cardio telemetry with complete privacy.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input API Key */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono font-black uppercase text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-violet-600 dark:text-cyan-400" />
                  <span>GARMIN PERSONAL API KEY / TOKEN</span>
                </label>
                <button
                  type="button"
                  onClick={handleUseEnvKey}
                  className="text-[11px] font-mono font-bold text-violet-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{isId ? 'Gunakan Key Yang Tersimpan' : 'Use Configured Key'}</span>
                </button>
              </div>

              <textarea
                rows={3}
                value={garminKey}
                onChange={(e) => setGarminKey(e.target.value)}
                placeholder="GCDC_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.xxxxxxxx..."
                className="w-full p-3 bg-slate-50 dark:bg-[#070a14] border-2 border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-cyan-300 font-mono text-xs focus:outline-none focus:border-violet-500 transition-colors"
              />
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 block mt-1">
                {isId
                  ? 'Kunci ini disimpan terlindungi dengan Supabase Row-Level Security dan hanya dapat diakses oleh akun Anda.'
                  : 'This key is secured with Supabase Row-Level Security and is strictly isolated to your user account.'}
              </span>
            </div>

            {/* Heart Rate Calibration Method */}
            <div>
              <label className="text-xs font-mono font-black uppercase text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                <span>{isId ? 'METODE PERHITUNGAN ZONA HEART RATE (DINAMIS)' : 'HEART RATE ZONE CALCULATION METHOD'}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option 1: HRR (Karvonen) */}
                <button
                  type="button"
                  onClick={() => setHrMethod('HRR')}
                  className={`p-3 border-2 text-left transition-all cursor-pointer ${
                    hrMethod === 'HRR'
                      ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-500 shadow-[3px_3px_0px_#7c3aed]'
                      : 'bg-slate-50 dark:bg-[#070a14] border-slate-200 dark:border-zinc-800 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase">
                      HRR (KARVONEN)
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700">
                      AUTO-ADJUST
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-zinc-400 font-sans leading-tight">
                    {isId
                      ? 'Formula Heart Rate Reserve. Angka zona otomatis menyesuaikan dengan rolling RHR 7-hari Garmin Anda.'
                      : 'Heart Rate Reserve formula. Zone boundaries automatically adjust with your rolling 7-day RHR.'}
                  </p>
                </button>

                {/* Option 2: LTHR */}
                <button
                  type="button"
                  onClick={() => setHrMethod('LTHR')}
                  className={`p-3 border-2 text-left transition-all cursor-pointer ${
                    hrMethod === 'LTHR'
                      ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-500 shadow-[3px_3px_0px_#7c3aed]'
                      : 'bg-slate-50 dark:bg-[#070a14] border-slate-200 dark:border-zinc-800 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase">
                      LTHR (THRESHOLD)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-zinc-400 font-sans leading-tight">
                    {isId
                      ? 'Lactate Threshold HR (Joe Friel). Cocok untuk atlet yang terbiasa patokan ambang laktat kompetitif.'
                      : 'Joe Friel Lactate Threshold method. Optimized for threshold-guided training programs.'}
                  </p>
                </button>

                {/* Option 3: MAX_HR */}
                <button
                  type="button"
                  onClick={() => setHrMethod('MAX_HR')}
                  className={`p-3 border-2 text-left transition-all cursor-pointer ${
                    hrMethod === 'MAX_HR'
                      ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-500 shadow-[3px_3px_0px_#7c3aed]'
                      : 'bg-slate-50 dark:bg-[#070a14] border-slate-200 dark:border-zinc-800 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase">
                      PURE MAX HR
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-zinc-400 font-sans leading-tight">
                    {isId
                      ? 'Metode persentase langsung dari Detak Jantung Maksimal (MHR) tanpa memperhitungkan resting HR.'
                      : 'Direct percentage of Maximum Heart Rate (MHR) without factoring in resting heart rate.'}
                  </p>
                </button>
              </div>
            </div>

            {/* Weekly Target KM */}
            <div>
              <label className="text-xs font-mono font-black uppercase text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isId ? 'TARGET JARAK MINGGUAN (KM)' : 'WEEKLY DISTANCE TARGET (KM)'}</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(e.target.value)}
                  className="w-32 p-2.5 bg-slate-50 dark:bg-[#070a14] border-2 border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-white font-mono text-sm font-bold focus:outline-none focus:border-violet-500"
                />
                <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                  {isId ? 'KM per minggu (dapat diubah nanti di Pengaturan)' : 'KM per week (can be changed later in Settings)'}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
              <button
                type="button"
                onClick={handleSkipDemo}
                disabled={loading}
                className="w-full sm:w-auto text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white underline cursor-pointer"
              >
                {isId ? 'Lewati & Coba dengan Data Demo' : 'Skip & Explore with Demo Telemetry'}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider border-2 border-violet-400 shadow-[4px_4px_0px_#4c1d95] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-cyan-300" />
                <span>{loading ? (isId ? 'MENYIMPAN...' : 'SAVING...') : (isId ? 'SIMPAN & BUKA DASHBOARD' : 'CONNECT & LAUNCH LAB')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-3xl w-full mx-auto text-center font-mono text-[10px] text-slate-500 dark:text-zinc-500 pt-6">
        FREEDAYZZ.PULSE // SECURED WITH ROW LEVEL SECURITY (RLS) & RESTful TELEMETRY PIPELINE
      </div>
    </div>
  );
}