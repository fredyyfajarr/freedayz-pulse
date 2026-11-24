import React from 'react';
import type { Metadata } from 'next';
import { container } from '@/infrastructure/di/container';
import RecoveryPageClient from '@/components/health/RecoveryPageClient';
import CoachRecoveryHub from '@/components/coach/CoachRecoveryHub';
import NewAthleteSetupCard from '@/components/dashboard/NewAthleteSetupCard';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUserAccess } from '@/utils/athleteAccess';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role === 'coach') {
      return {
        title: 'Pemulihan & HRV Skuad // Coach Recovery',
      };
    }
  } catch {}
  return {
    title: 'Recovery Hub & Biometrik Garmin',
  };
}

export default async function RecoveryPage() {
  const access = await getCurrentUserAccess();

  if (access.isCoach) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 space-y-6">
        <CoachRecoveryHub />
      </div>
    );
  }

  if (!access.hasTelemetryAccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 space-y-6">
        <NewAthleteSetupCard athleteName={access.fullName} athleteEmail={access.email} />
      </div>
    );
  }

  const snapshot = await container.healthUseCase.execute();

  return <RecoveryPageClient snapshot={snapshot} />;
}

