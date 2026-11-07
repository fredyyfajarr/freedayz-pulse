import React from 'react';
import { container } from '@/infrastructure/di/container';
import { AthleteSettingsManager } from '@/infrastructure/persistence/AthleteSettingsManager';
import AthletePersonalInfoCard from '@/components/profile/AthletePersonalInfoCard';
import SystemPreferencesCard from '@/components/profile/SystemPreferencesCard';
import { Settings, Watch, Key } from 'lucide-react';

export default async function SettingsPage() {
  const activities = await container.repository.getAllActivities();
  const biometrics = AthleteSettingsManager.getSettings();
  const healthSnapshot = await container.healthUseCase.execute();
  const garmin7dAvgRhr = healthSnapshot.dailySummary?.lastSevenDaysAvgRestingHeartRate ?? healthSnapshot.dailySummary?.restingHeartRate ?? 52;

  const keyPreview = process.env.GARMIN_PERSONAL_API_KEY 
    ? `${process.env.GARMIN_PERSONAL_API_KEY.slice(0, 16)}...${process.env.GARMIN_PERSONAL_API_KEY.slice(-10)}`
    : 'NOT_CONFIGURED';

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

      {/* 2. Athlete Personal HR Calibration Card */}
      <div id="biometrics">
        <AthletePersonalInfoCard
          activities={activities}
          initialSettings={biometrics}
          garmin7dAvgRhr={garmin7dAvgRhr}
        />
      </div>

      {/* 3. Garmin API Key & Connected Device Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Key Status */}
        <div className="bg-[#0d1224] border-2 border-violet-900/60 p-5 shadow-[4px_4px_0px_#1e1b4b] space-y-3 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-violet-400" />
              <h3 className="font-black italic tracking-widest uppercase text-xs sm:text-sm text-white">
                GARMIN_PERSONAL_API_KEY
              </h3>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-400 font-bold">
              ACTIVE
            </span>
          </div>

          <div className="text-xs space-y-2">
            <div className="bg-[#070a14] border border-zinc-800 p-2.5">
              <span className="text-zinc-500 text-[10px] block">ACTIVE TOKEN PREVIEW</span>
              <span className="text-violet-300 font-bold text-xs">{keyPreview}</span>
            </div>
            <div className="bg-[#070a14] border border-zinc-800 p-2.5">
              <span className="text-zinc-500 text-[10px] block">EXPIRATION STATUS</span>
              <span className="text-emerald-400 font-bold">VALID 1 YEAR FROM ISSUANCE</span>
            </div>
          </div>
        </div>

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
