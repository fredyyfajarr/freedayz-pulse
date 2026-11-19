'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/utils/supabase/client';
import { CoachingStorage } from '@/utils/coachingStorage';
import { 
  ShieldCheck, 
  Users, 
  Copy, 
  Check, 
  Save, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface Props {
  initialProfile: {
    fullName: string;
    email: string;
    runningClub: string;
    userId: string;
    specialization?: string;
  };
}

export default function CoachClubSettingsCard({ initialProfile }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [runningClub, setRunningClub] = useState(initialProfile.runningClub || 'Freedayzz Athletic Club');
  const [specialization, setSpecialization] = useState(initialProfile.specialization || 'Endurance & Marathon Periodization Coach');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cleanId = initialProfile.userId ? initialProfile.userId.replace(/-/g, '').slice(0, 4).toUpperCase() : '7821';
  const cleanName = fullName ? fullName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() : 'COACH';
  const clubInviteCode = `FDZ-${cleanName}-${cleanId}`;

  // Automatically register this coach profile into persistent dynamic directory
  useEffect(() => {
    if (initialProfile.fullName || initialProfile.email) {
      CoachingStorage.registerCoachProfile({
        id: initialProfile.userId,
        name: initialProfile.fullName || fullName,
        email: initialProfile.email,
        club: initialProfile.runningClub || runningClub,
        specialty: initialProfile.specialization || specialization,
        inviteCode: clubInviteCode,
      });
    }
  }, [initialProfile.fullName, initialProfile.email, initialProfile.userId, clubInviteCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(clubInviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          running_club: runningClub,
          coaching_specialization: specialization,
          club_invite_code: clubInviteCode,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        // Sync to dynamic coaches storage
        CoachingStorage.registerCoachProfile({
          id: initialProfile.userId,
          name: fullName,
          email: initialProfile.email,
          club: runningClub,
          specialty: specialization,
          inviteCode: clubInviteCode,
        });

        setSuccessMsg(isId ? 'Profil klub dan lisensi pelatih berhasil diperbarui!' : 'Coach profile & club settings saved successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-cyan-500/80 p-5 sm:p-6 shadow-[4px_4px_0px_#06b6d4] space-y-6 font-mono text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-cyan-900/40 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-500" />
            <span className="text-[10px] font-black px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 text-cyan-800 dark:text-cyan-300 uppercase tracking-widest">
              {isId ? 'PENGATURAN_KLUB // ROLE_COACH' : 'CLUB_SETTINGS // HEAD_COACH'}
            </span>
          </div>
          <h2 className="text-xl font-black italic tracking-wide uppercase mt-1.5 text-slate-900 dark:text-white">
            {isId ? 'PROFIL KEPELATIHAN & LISENSI KLUB' : 'COACHING PROFILE & SQUAD LICENSE'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans mt-0.5">
            {isId
              ? 'Kelola identitas klub lari Anda, kode registrasi atlet binaan, dan spesialisasi kepelatihan.'
              : 'Manage your running club identity, athlete registration invite code, and coaching specializations.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 text-emerald-800 dark:text-emerald-300 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {isId ? 'LISENSI AKTIF' : 'ACTIVE LICENSE'}
          </span>
        </div>
      </div>

      {/* Club License & Registration Code Box */}
      <div className="p-4 bg-cyan-50/50 dark:bg-[#070a14] border-2 border-cyan-500/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-black uppercase tracking-wider block">
              {isId ? 'KODE REGISTRASI & AKSES ATLET KLUB' : 'ATHLETE REGISTRATION & ACCESS CODE'}
            </span>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans mt-0.5">
              {isId
                ? 'Bagikan kode ini kepada para pelari bimbingan Anda. Saat mereka mendaftar, telemetri lari mereka otomatis tersinkronisasi ke portal Anda.'
                : 'Share this code with your athletes so their Garmin running telemetry is linked to your coach portal.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 bg-white dark:bg-[#0d1224] border border-cyan-400 font-black text-sm text-cyan-600 dark:text-cyan-300 tracking-widest">
              {clubInviteCode}
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isId ? 'TERSALIN!' : 'COPIED!') : (isId ? 'SALIN' : 'COPY')}</span>
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-400 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-600 dark:text-zinc-400">
              {isId ? 'Nama Lengkap Pelatih' : 'Head Coach Name'}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-600 dark:text-zinc-400">
              {isId ? 'Email Akun Coach' : 'Coach Account Email'}
            </label>
            <input
              type="email"
              disabled
              value={initialProfile.email}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-500 cursor-not-allowed font-sans"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-600 dark:text-zinc-400">
              {isId ? 'Nama Klub / Komunitas Lari' : 'Running Club / Team Name'}
            </label>
            <input
              type="text"
              required
              value={runningClub}
              onChange={(e) => setRunningClub(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-600 dark:text-zinc-400">
              {isId ? 'Spesialisasi Kepelatihan' : 'Coaching Specialization'}
            </label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="misal: Marathon Periodization & Aerobic Base"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-zinc-800">
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-sans">
            Tier: Head Coach • Unlimited Squad Athletes
          </span>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#0891b2] cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? (isId ? 'MENYIMPAN...' : 'SAVING...') : (isId ? 'SIMPAN PENGATURAN' : 'SAVE SETTINGS')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
