'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, signup } from '@/app/auth/actions';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import BrandLogo from '@/components/brand/BrandLogo';
import {
  Lock,
  Mail,
  User,
  Shield,
  ArrowRight,
  Sun,
  Moon,
  Globe,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  initialMode?: 'login' | 'register';
}

export default function AuthForm({ initialMode = 'login' }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isId = language === 'ID';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'athlete' | 'coach'>('athlete');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.set('role', role);

    const nextParam = searchParams.get('next');
    if (nextParam) {
      formData.set('next', nextParam);
    }

    try {
      if (mode === 'login') {
        const res = await login(formData);
        if (res?.error) {
          setErrorMsg(res.error);
          setLoading(false);
        }
      } else {
        const res = await signup(formData);
        if (res?.error) {
          setErrorMsg(res.error);
          setLoading(false);
        } else {
          setSuccessMsg(
            isId
              ? 'Akun berhasil dibuat! Mengalihkan ke dashboard...'
              : 'Account created successfully! Redirecting...'
          );
        }
      }
    } catch (err: any) {
      // Ignore NEXT_REDIRECT error which is triggered when server action redirects
      if (err?.digest?.includes('NEXT_REDIRECT') || err?.message?.includes('NEXT_REDIRECT')) {
        return;
      }
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#06070d] text-slate-900 dark:text-white font-sans transition-colors p-4 sm:p-6">
      {/* Top Utility Controls */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pb-4 font-mono">
        <Link href="/" className="flex items-center gap-2 group">
          <BrandLogo size={32} />
          <span className="font-black italic tracking-wider text-sm sm:text-base text-slate-900 dark:text-white">
            FREEDAYZZ<span className="text-violet-600 dark:text-violet-400">.PULSE</span>
          </span>
        </Link>

        {/* Quick Language & Theme Controls */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <div className="flex items-center p-0.5 bg-white dark:bg-[#090d1c] border border-slate-300 dark:border-violet-900/60 shadow-sm">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1 text-slate-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-violet-600" />}
            </button>
          </div>

          <div className="flex items-center p-0.5 bg-white dark:bg-[#090d1c] border border-slate-300 dark:border-violet-900/60 shadow-sm">
            <button
              type="button"
              onClick={() => setLanguage(language === 'ID' ? 'EN' : 'ID')}
              className="px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-zinc-300 hover:text-violet-600 transition-colors"
              title="Toggle Language"
            >
              {language}
            </button>
          </div>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-auto bg-white dark:bg-[#0d1224] border-2 border-slate-300 dark:border-violet-900/70 p-6 sm:p-8 shadow-[6px_6px_0px_#cbd5e1] dark:shadow-[6px_6px_0px_#1e1b4b] font-mono">
        {/* Mode Segmented Tab Switch */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-center text-xs font-black tracking-wider transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isId ? 'MASUK' : 'SIGN IN'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-center text-xs font-black tracking-wider transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isId ? 'DAFTAR AKUN' : 'REGISTER'}
          </button>
        </div>

        {/* Title & Micro Copy */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
              {mode === 'login'
                ? (isId ? 'AUTENTIKASI ATLET // SUPABASE' : 'ATHLETE AUTH // SUPABASE')
                : (isId ? 'REGISTRASI LAB // PILIH PERAN' : 'LAB REGISTRATION // SELECT ROLE')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black italic tracking-wide text-slate-900 dark:text-white uppercase">
            {mode === 'login'
              ? (isId ? 'MASUK KE FREEDAYZZ' : 'SIGN IN TO FREEDAYZZ')
              : (isId ? 'BUAT AKUN BARU' : 'CREATE NEW ACCOUNT')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans mt-1">
            {mode === 'login'
              ? (isId
                  ? 'Akses analitik lari, metrik pemulihan Firstbeat, dan VDOT Jack Daniels Anda.'
                  : 'Access your telemetry lab, Firstbeat recovery metrics, and Jack Daniels VDOT.')
              : (isId
                  ? 'Mulai pantau telemetri kardio Anda secara gratis tanpa paywall.'
                  : 'Start tracking cardio telemetry with zero paywalls and complete data privacy.')}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700/60 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 font-sans font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Success Alert Box */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="flex-1 font-sans font-medium">{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Base Role Selector (Only in Register Mode) */}
          {mode === 'register' && (
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-600 dark:text-zinc-400 mb-1.5">
                {isId ? 'PILIH PERAN UTAMA (BASE ROLE):' : 'SELECT BASE ROLE:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('athlete')}
                  className={`p-2.5 border text-left transition-all cursor-pointer ${
                    role === 'athlete'
                      ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-500 shadow-[2px_2px_0px_#7c3aed]'
                      : 'bg-slate-50 dark:bg-[#070a14] border-slate-300 dark:border-zinc-800 opacity-70'
                  }`}
                >
                  <span className="block text-xs font-black text-slate-900 dark:text-white uppercase">
                    🏃 {isId ? 'ATLET LARI' : 'ATHLETE'}
                  </span>
                  <span className="block text-[9px] text-slate-500 dark:text-zinc-400 font-sans mt-0.5">
                    {isId ? 'Analisis sesi & biometrik mandiri' : 'Personal analytics & biometrics'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('coach')}
                  className={`p-2.5 border text-left transition-all cursor-pointer ${
                    role === 'coach'
                      ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 shadow-[2px_2px_0px_#06b6d4]'
                      : 'bg-slate-50 dark:bg-[#070a14] border-slate-300 dark:border-zinc-800 opacity-70'
                  }`}
                >
                  <span className="block text-xs font-black text-slate-900 dark:text-white uppercase">
                    ⏱️ {isId ? 'PELATIH // COACH' : 'COACH'}
                  </span>
                  <span className="block text-[9px] text-slate-500 dark:text-zinc-400 font-sans mt-0.5">
                    {isId ? 'Monitoring beban atlet bimbingan' : 'Monitor athletes & programs'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Full Name Input (Only in Register Mode) */}
          {mode === 'register' && (
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-600 dark:text-zinc-400 mb-1">
                {isId ? 'NAMA LENGKAP / PANGGILAN' : 'FULL NAME'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder={isId ? 'Misal: Fredy Fajar' : 'e.g. John Doe'}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-white text-xs font-mono rounded-none focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-600 dark:text-zinc-400 mb-1">
              EMAIL
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                name="email"
                type="email"
                required
                placeholder="athlete@domain.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-white text-xs font-mono rounded-none focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-600 dark:text-zinc-400 mb-1">
              {isId ? 'KATA SANDI' : 'PASSWORD'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-white text-xs font-mono rounded-none focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {mode === 'register' && (
              <span className="text-[9px] text-slate-400 dark:text-zinc-500 block mt-1 font-sans">
                {isId ? 'Minimal 6 karakter' : 'Minimum 6 characters'}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider border border-violet-400 shadow-[3px_3px_0px_#cbd5e1] dark:shadow-[3px_3px_0px_#1e1b4b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>
              {loading
                ? (isId ? 'MEMPROSES...' : 'PROCESSING...')
                : mode === 'login'
                ? (isId ? 'MASUK KE DASHBOARD' : 'SIGN IN TO DASHBOARD')
                : (isId ? 'BUAT AKUN SEKARANG' : 'CREATE ACCOUNT NOW')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-500 dark:text-zinc-400 font-sans">
          {mode === 'login' ? (
            <p>
              {isId ? 'Belum punya akun?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
              >
                {isId ? 'Daftar sekarang' : 'Sign up now'}
              </button>
            </p>
          ) : (
            <p>
              {isId ? 'Sudah memiliki akun?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
              >
                {isId ? 'Masuk di sini' : 'Sign in here'}
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="max-w-md w-full mx-auto text-center text-[10px] text-slate-400 dark:text-zinc-500 font-mono py-2">
        FREEDAYZZ.PULSE // SECURED WITH SUPABASE AUTH & ROW LEVEL SECURITY
      </div>
    </div>
  );
}
