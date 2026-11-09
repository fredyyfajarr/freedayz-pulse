'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/utils/supabase/client';
import { updateAthleteBiodata } from '@/app/auth/actions';
import {
  User,
  Scale,
  Ruler,
  Calendar,
  Flame,
  Target,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
  Users,
  Sparkles,
} from 'lucide-react';

interface Props {
  initialProfile?: {
    fullName?: string;
    email?: string;
    role?: string;
    gender?: string;
    birthDate?: string;
    weightKg?: number;
    heightCm?: number;
    runningClub?: string;
    weeklyTargetKm?: number;
  };
}

export default function AthleteBiodataCard({ initialProfile }: Props) {
  const { language } = useLanguage();
  const isId = language === 'ID';

  const [fullName, setFullName] = useState(initialProfile?.fullName || '');
  const [email, setEmail] = useState(initialProfile?.email || '');
  const [role, setRole] = useState(initialProfile?.role || 'athlete');
  const [gender, setGender] = useState<'male' | 'female'>(
    (initialProfile?.gender as 'male' | 'female') || 'male'
  );
  const [birthDate, setBirthDate] = useState(initialProfile?.birthDate || '2000-01-01');
  const [weightKg, setWeightKg] = useState(initialProfile?.weightKg?.toString() || '62');
  const [heightCm, setHeightCm] = useState(initialProfile?.heightCm?.toString() || '172');
  const [runningClub, setRunningClub] = useState(initialProfile?.runningClub || 'Freedayzz Running Club');
  const [weeklyTargetKm, setWeeklyTargetKm] = useState(
    initialProfile?.weeklyTargetKm?.toString() || '30'
  );

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load from Supabase user session if not passed initially
  useEffect(() => {
    async function fetchUserData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setEmail(user.email || '');
          const meta = user.user_metadata || {};
          if (meta.full_name) setFullName(meta.full_name);
          if (meta.role) setRole(meta.role);
          if (meta.gender) setGender(meta.gender);
          if (meta.birth_date) setBirthDate(meta.birth_date);
          if (meta.weight_kg) setWeightKg(meta.weight_kg.toString());
          if (meta.height_cm) setHeightCm(meta.height_cm.toString());
          if (meta.running_club) setRunningClub(meta.running_club);
          if (meta.weekly_target_km) setWeeklyTargetKm(meta.weekly_target_km.toString());
        }
      } catch (e) {
        console.warn('Error fetching user for biodata:', e);
      }
    }

    if (!initialProfile?.email) {
      fetchUserData();
    }
  }, [initialProfile]);

  // Compute athlete age dynamically
  const age = React.useMemo(() => {
    if (!birthDate) return null;
    const bDate = new Date(birthDate);
    const today = new Date();
    let calculatedAge = today.getFullYear() - bDate.getFullYear();
    const m = today.getMonth() - bDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge > 0 && calculatedAge < 120 ? calculatedAge : null;
  }, [birthDate]);

  // Estimated BMI (Body Mass Index)
  const bmi = React.useMemo(() => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm) / 100;
    if (w > 20 && h > 1.0) {
      return (w / (h * h)).toFixed(1);
    }
    return null;
  }, [weightKg, heightCm]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.set('fullName', fullName);
    formData.set('gender', gender);
    formData.set('birthDate', birthDate);
    formData.set('weightKg', weightKg);
    formData.set('heightCm', heightCm);
    formData.set('runningClub', runningClub);
    formData.set('weeklyTargetKm', weeklyTargetKm);

    try {
      const res = await updateAthleteBiodata(formData);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(
          isId ? 'Biodata atlet berhasil diperbarui!' : 'Athlete biodata updated successfully!'
        );
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan biodata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0d1224] border-2 border-slate-200 dark:border-violet-900/60 p-5 sm:p-6 shadow-[4px_4px_0px_#cbd5e1] dark:shadow-[4px_4px_0px_#1e1b4b] space-y-6 transition-colors font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-200 dark:border-zinc-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-[10px] font-mono px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-400 dark:border-violet-700 text-violet-800 dark:text-violet-300 font-bold uppercase tracking-wider">
              {isId ? 'BIODATA_ATLET // PROFIL_FISIK' : 'ATHLETE_BIODATA // PHYSICAL_PROFILE'}
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold uppercase">
              {role.toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black italic tracking-wide text-slate-900 dark:text-white uppercase mt-1">
            {isId ? 'BIODATA_&_KOMPOSISI_TUBUH' : 'BIODATA_&_BODY_COMPOSITION'}
          </h2>
          <p className="text-xs font-sans text-slate-500 dark:text-zinc-400 mt-1">
            {isId
              ? 'Parameter fisik digunakan untuk kalibrasi formula Banister TRIMP, estimasi Jack Daniels VDOT, dan efisiensi langkah.'
              : 'Physical parameters power Banister TRIMP equations, Jack Daniels VDOT oxygen cost, and stride efficiency.'}
          </p>
        </div>

        {/* Live Pill Badges */}
        <div className="flex items-center gap-2 text-xs">
          {age && (
            <div className="px-2.5 py-1 bg-slate-100 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 font-bold">
              {age} {isId ? 'TAHUN' : 'YRS'}
            </div>
          )}
          {bmi && (
            <div className="px-2.5 py-1 bg-slate-100 dark:bg-[#070a14] border border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 font-bold">
              BMI: <span className="text-violet-600 dark:text-cyan-400">{bmi}</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Full Name */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-violet-600 dark:text-cyan-400" />
              <span>{isId ? 'NAMA LENGKAP / PANGGILAN' : 'FULL NAME / DISPLAY'}</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Fredy Fajar"
              className="w-full p-2.5 bg-slate-50 dark:bg-[#070a14] border-2 border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* 2. Registered Email (Read-only) */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isId ? 'EMAIL AKUN (TERDAFTAR)' : 'AUTHENTICATED EMAIL'}</span>
            </label>
            <input
              type="email"
              disabled
              value={email || 'athlete@domain.com'}
              className="w-full p-2.5 bg-slate-100 dark:bg-[#070a14]/60 border-2 border-slate-200 dark:border-zinc-800/80 text-slate-500 dark:text-zinc-500 text-xs cursor-not-allowed"
            />
          </div>

          {/* 3. Gender (Affects Banister TRIMP constant) */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>{isId ? 'JENIS KELAMIN (GENDER)' : 'BIOLOGICAL SEX'}</span>
              </span>
              <span className="text-[9px] text-violet-600 dark:text-cyan-400 font-sans">
                {gender === 'male' ? 'TRIMP k=1.92' : 'TRIMP k=1.67'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2 px-3 border-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  gender === 'male'
                    ? 'bg-violet-100 dark:bg-violet-950/80 border-violet-500 text-violet-900 dark:text-white shadow-[2px_2px_0px_#7c3aed]'
                    : 'bg-slate-50 dark:bg-[#070a14] border-slate-300 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {isId ? 'LAKI-LAKI' : 'MALE'}
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2 px-3 border-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  gender === 'female'
                    ? 'bg-violet-100 dark:bg-violet-950/80 border-violet-500 text-violet-900 dark:text-white shadow-[2px_2px_0px_#7c3aed]'
                    : 'bg-slate-50 dark:bg-[#070a14] border-slate-300 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {isId ? 'PEREMPUAN' : 'FEMALE'}
              </button>
            </div>
          </div>

          {/* 4. Birth Date (Usia) */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{isId ? 'TANGGAL LAHIR (USIA)' : 'DATE OF BIRTH'}</span>
            </label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-[#070a14] border-2 border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* 5. Weight (kg) */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isId ? 'BERAT BADAN (KG)' : 'BODY WEIGHT (KG)'}</span>
              </span>
              <span className="text-[9px] text-slate-500 dark:text-zinc-500 font-sans">VDOT factor</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="30"
                max="250"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="62"
                className="w-full p-2.5 pr-10 bg-slate-50 dark:bg-[#070a14] border-2 border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-violet-500 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-zinc-500">
                KG
              </span>
            </div>
          </div>

          {/* 6. Height (cm) */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-cyan-500" />
                <span>{isId ? 'TINGGI BADAN (CM)' : 'HEIGHT (CM)'}</span>
              </span>
              <span className="text-[9px] text-slate-500 dark:text-zinc-500 font-sans">Cadence stride</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="100"
                max="250"
                required
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="172"
                className="w-full p-2.5 pr-10 bg-slate-50 dark:bg-[#070a14] border-2 border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-violet-500 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-zinc-500">
                CM
              </span>
            </div>
          </div>

          {/* 7. Running Club / Team */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isId ? 'KLUB / KOMUNITAS LARI' : 'RUNNING CLUB / SQUAD'}</span>
            </label>
            <input
              type="text"
              value={runningClub}
              onChange={(e) => setRunningClub(e.target.value)}
              placeholder="e.g. Freedayzz Runners"
              className="w-full p-2.5 bg-slate-50 dark:bg-[#070a14] border-2 border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* 8. Weekly Target KM */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-violet-500" />
              <span>{isId ? 'TARGET JARAK MINGGUAN (KM)' : 'WEEKLY DISTANCE TARGET'}</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="5"
                max="250"
                value={weeklyTargetKm}
                onChange={(e) => setWeeklyTargetKm(e.target.value)}
                placeholder="30"
                className="w-full p-2.5 pr-10 bg-slate-50 dark:bg-[#070a14] border-2 border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-violet-500 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-zinc-500">
                KM
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-sans">
            {isId
              ? 'Tersimpan otomatis ke database akun Supabase Anda.'
              : 'Securely saved to your personal Supabase account.'}
          </span>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider border border-violet-400 shadow-[3px_3px_0px_#cbd5e1] dark:shadow-[3px_3px_0px_#1e1b4b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-cyan-300" />
            <span>
              {loading
                ? isId
                  ? 'MENYIMPAN...'
                  : 'SAVING...'
                : isId
                ? 'SIMPAN BIODATA'
                : 'SAVE BIODATA'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}