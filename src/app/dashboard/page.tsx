import type { Metadata } from 'next';
import { container } from '@/infrastructure/di/container';
import WeeklyHeroStats from '@/components/dashboard/WeeklyHeroStats';
import MonthlyTrainingCalendar from '@/components/dashboard/MonthlyTrainingCalendar';
import FitnessFreshnessMiniWidget from '@/components/dashboard/FitnessFreshnessMiniWidget';
import WeeklyMileageProgressionChart from '@/components/dashboard/WeeklyMileageProgressionChart';
import GarminRecoveryHub from '@/components/health/GarminRecoveryHub';
import RecentActivitiesList from '@/components/dashboard/RecentActivitiesList';
import ACWRWidget from '@/components/dashboard/ACWRWidget';
import DashboardWelcomeBar from '@/components/dashboard/DashboardWelcomeBar';
import BestEffortsShowcaseCard from '@/components/dashboard/BestEffortsShowcaseCard';
import WeeklyTargetWidget from '@/components/dashboard/WeeklyTargetWidget';
import HRRProfileWidget from '@/components/dashboard/HRRProfileWidget';
import RacePredictorWidget from '@/components/dashboard/RacePredictorWidget';
import CoachDashboard from '@/components/coach/CoachDashboard';
import NewAthleteSetupCard from '@/components/dashboard/NewAthleteSetupCard';
import AthleteCoachTasksWidget from '@/components/dashboard/AthleteCoachTasksWidget';
import { ACWRCalculator } from '@/domain/services/ACWRCalculator';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUserAccess } from '@/utils/athleteAccess';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role || 'athlete';
    if (role === 'coach') {
      return {
        title: 'Portal Pelatih // Coach Hub',
      };
    }
  } catch {}
  return {
    title: 'Dashboard Telemetri Lari',
  };
}

export default async function DashboardPage() {
  // Auth User, Role & Telemetry Access Inspection
  const access = await getCurrentUserAccess();
  const { user, isCoach, hasTelemetryAccess, fullName, email: userEmail, weeklyTargetKm } = access;

  // 1. DEDICATED COACH PORTAL (Zero athlete telemetry widgets)
  if (isCoach) {
    return (
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 space-y-4 sm:space-y-6 min-w-0">
        <CoachDashboard
          coachName={fullName}
          coachEmail={userEmail}
          userId={user?.id || ''}
        />
      </div>
    );
  }

  // 2. ATHLETE ROLE: Isolate new accounts without Garmin connection or explicit Demo Mode
  if (!hasTelemetryAccess) {
    return (
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 space-y-4 sm:space-y-6 min-w-0">
        <NewAthleteSetupCard
          athleteName={fullName}
          athleteEmail={userEmail}
        />
        <AthleteCoachTasksWidget athleteName={fullName} />
      </div>
    );
  }

  // If repository empty and user is connected Garmin user, run initial sync with Garmin
  const existing = await container.repository.getAllActivities();
  if (existing.length === 0) {
    try {
      await container.syncUseCase.execute(false);
    } catch (err) {
      console.warn('Initial sync warning:', err);
    }
  }

  const [summary, healthSnapshot] = await Promise.all([
    container.dashboardUseCase.execute(),
    container.healthUseCase.execute(),
  ]);

  // Acute-to-Chronic Workload Ratio (Injury Risk Prevention Radar)
  const acwr = ACWRCalculator.calculate(summary.allActivities);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 space-y-4 sm:space-y-6 min-w-0">
      {/* Top Welcome & Telemetry Bar */}
      <DashboardWelcomeBar lastSync={summary.lastSync} />

      {/* Coach Tasks & Commercial Coaching Prescriptions */}
      <AthleteCoachTasksWidget athleteName={fullName} />

      {/* 1. Weekly Hero Stats */}
      <WeeklyHeroStats stats={summary.hero} />

      {/* 2. Middle Row: Training Log Calendar + Fitness & Freshness & Weekly Mileage Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyTrainingCalendar activities={summary.allActivities} />
        </div>
        <div className="space-y-6">
          <FitnessFreshnessMiniWidget fitness={summary.fitness} />
          <WeeklyMileageProgressionChart activities={summary.allActivities} />
        </div>
      </div>

      {/* 2.5. Garmin Biometrics & Recovery Hub (HRV, VO2Max, Body Battery, RHR) */}
      <GarminRecoveryHub snapshot={healthSnapshot} />

      {/* 2.6. Jack Daniels VDOT Race Finish Time Predictor Matrix */}
      <RacePredictorWidget prs={summary.bestEfforts} />

      {/* 3. Bottom Row: Recent Activities + Right Side Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Recent Activities Feed */}
        <div className="lg:col-span-2">
          <RecentActivitiesList activities={summary.recentActivities} />
        </div>

        {/* Right Column: Stacked Widgets */}
        <div className="space-y-6">
          {/* Best Efforts Showcase Card */}
          <BestEffortsShowcaseCard bestEfforts={summary.bestEfforts} />

          {/* ACWR - Acute to Chronic Workload Ratio (Injury Prevention Radar) */}
          <ACWRWidget acwr={acwr} />

          {/* Weekly Target Goal Tracker */}
          <WeeklyTargetWidget currentKm={summary.hero.currentWeekDistanceKm} weeklyTargetKm={weeklyTargetKm} />

          {/* HRR Profile Calibration Note */}
          <HRRProfileWidget />
        </div>
      </div>
    </div>
  );
}
