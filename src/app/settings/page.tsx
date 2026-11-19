import React from 'react';
import type { Metadata } from 'next';
import { container } from '@/infrastructure/di/container';
import { AthleteSettingsManager } from '@/infrastructure/persistence/AthleteSettingsManager';
import AthletePersonalInfoCard from '@/components/profile/AthletePersonalInfoCard';
import AthleteBiodataCard from '@/components/profile/AthleteBiodataCard';
import SystemPreferencesCard from '@/components/profile/SystemPreferencesCard';
import GarminConnectionCard from '@/components/profile/GarminConnectionCard';
import CoachClubSettingsCard from '@/components/profile/CoachClubSettingsCard';
import { createClient } from '@/utils/supabase/server';
import { Settings, Watch, ShieldCheck } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role === 'coach') {
      return {
        title: 'Pengaturan Klub & Pelatih',
      };
    }
  } catch {}
  return {
    title: 'Pengaturan Akun & Kalibrasi',
  };
}

export default async function SettingsPage() {
  // Supabase user profile & metadata for biodata & cloud biometrics
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userMeta = user?.user_metadata || {};
  const isCoach = userMeta.role === 'coach';

  // If Coach: Render dedicated Club & Coach Profile Settings (Zero Fredy HR zones, Zero athlete Garmin sync)
  if (isCoach) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header */}
        <div className="pb-4 border-b-2 border-cyan-900/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-950 border border-cyan-700/60 text-cyan-300 font-bold uppercase tracking-wider">
              COACH_&_CLUB_PREFERENCES
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black italic tracking-wide text-white uppercase mt-1">
            PENGATURAN KLUB & LISENSI KEPELATIHAN
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            MANAJEMEN IDENTITAS KLUB, KODE AKSES PENDAFTARAN ATLET & SISTEM
          </p>
        </div>

        {/* 1. Language & Theme System Preferences */}
        <SystemPreferencesCard />

        {/* 2. Coach Profile & Club License Settings */}
        <CoachClubSettingsCard
          initialProfile={{
            fullName: userMeta.full_name || user?.email?.split('@')[0] || 'Coach',
            email: user?.email || '',
            runningClub: userMeta.running_club || 'Freedayzz Athletic Club',
            userId: user?.id || '',
            specialization: userMeta.coaching_specialization || 'Endurance & Marathon Periodization Coach',
          }}
        />
      </div>
    );
  }

  // ATHLETE SETTINGS
  const activities = await container.repository.getAllActivities();
  const biometrics = AthleteSettingsManager.getSettings();
  const healthSnapshot = await container.healthUseCase.execute();
  const garmin7dAvgRhr = healthSnapshot.dailySummary?.lastSevenDaysAvgRestingHeartRate ?? healthSnapshot.dailySummary?.restingHeartRate ?? 52;

  const mergedBiometrics = {
    ...biometrics,
    ...(userMeta.athlete_biometrics || {}),
  };

  const initialProfile = {
    fullName: userMeta.full_name || '',
    email: user?.email || '',
    role: userMeta.role || 'athlete',
    gender: userMeta.gender || 'male',
    birthDate: userMeta.birth_date || '2000-01-01',
    weightKg: userMeta.weight_kg ? Number(userMeta.weight_kg) : 62,
    heightCm: userMeta.height_cm ? Number(userMeta.height_cm) : 172,
    runningClub: userMeta.running_club || 'Freedayzz Running Club',
    weeklyTargetKm: userMeta.weekly_target_km ? Number(userMeta.weekly_target_km) : 30,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b-2 border-violet-900/50">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-violet-400" />
          <span className="text-[10px] font-mono px-2 py-0.5 bg-violet-950 border border-violet-700/60 text-violet-300 font-bold uppercase tracking-wider">
            SYSTEM_&_ATHLETE_PROFILE
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black italic tracking-wide text-white uppercase mt-1">
          PERSONAL_INFO_&_ZONE_CALIBRATION
        </h1>
        <p className="text-xs font-mono text-zinc-400">
          HEART RATE FORMULA, ZONE PERCENTAGES, BPM RANGES & TRAINING INSIGHTS
        </p>
      </div>

      {/* 1. Language & Theme System Preferences (Clean Dropdowns) */}
      <SystemPreferencesCard />

      {/* 2. Athlete Biodata & Physical Profile (Weight, Height, Age, Gender, Running Club) */}
      <div id="biodata">
        <AthleteBiodataCard initialProfile={initialProfile} />
      </div>

      {/* 3. Athlete Personal HR Calibration Card */}
      <div id="biometrics">
        <AthletePersonalInfoCard
          activities={activities}
          initialSettings={mergedBiometrics}
          garmin7dAvgRhr={garmin7dAvgRhr}
        />
      </div>

      {/* 4. Garmin Live Connection & Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Live Garmin Ping & Diagnostics Card */}
        <GarminConnectionCard />

        {/* Hardware & Multi-User Architecture */}
        <div className="bg-[#0d1224] border-2 border-violet-900/60 p-5 shadow-[4px_4px_0px_#1e1b4b] space-y-3 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Watch className="w-4 h-4 text-cyan-400" />
              <h3 className="font-black italic tracking-widest uppercase text-xs sm:text-sm text-white">
                DEVICE_PROFILE
              </h3>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 bg-blue-950 border border-blue-600 text-blue-300 font-bold">
              DYNAMIC DETECT
            </span>
          </div>

          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            Activities automatically pull manufacturer metadata from Garmin. When opened to multiple users, each athlete&apos;s custom device and personal HR calibration is isolated per user session.
          </p>
        </div>
      </div>
    </div>
  );
}
