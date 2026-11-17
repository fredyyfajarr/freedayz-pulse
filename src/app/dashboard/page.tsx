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
import CoachDashboardView from '@/components/coach/CoachDashboardView';
import NewAthleteSetupCard from '@/components/dashboard/NewAthleteSetupCard';
import { ACWRCalculator } from '@/domain/services/ACWRCalculator';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  // If repository empty, run initial sync with Garmin
  const existing = await container.repository.getAllActivities();
  if (existing.length === 0) {
    try {
      await container.syncUseCase.execute(false);
    } catch (err) {
      console.warn('Initial sync warning:', err);
    }
  }

  // Auth User & Base Role Inspection
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userMeta = user?.user_metadata || {};
  const userRole = (userMeta.role as 'athlete' | 'coach' | 'admin') || 'athlete';
  const userEmail = user?.email || '';
  const fullName = userMeta.full_name || userEmail.split('@')[0] || 'Athlete';
  const isGarminConnected = userMeta.garmin_connected === true || userEmail.toLowerCase() === 'fredyafajr46@gmail.com';

  const [summary, healthSnapshot] = await Promise.all([
    container.dashboardUseCase.execute(),
    container.healthUseCase.execute(),
  ]);

  // Acute-to-Chronic Workload Ratio (Injury Risk Prevention Radar)
  const acwr = ACWRCalculator.calculate(summary.allActivities);

  // Club Athlete Roster for Coach Role
  const clubAthletes = [
    {
      id: 'ath-fredy',
      name: 'Fredy Fajar',
      email: 'fredyafajr46@gmail.com',
      status: 'optimal' as const,
      statusLabel: 'OPTIMAL (TSB +8)',
      weeklyDistanceKm: summary.hero.currentWeekDistanceKm,
      monthlyDistanceKm: 50.4,
      avgPace: '8:30 /km',
      acwr: acwr.ratio,
      acwrLabel: acwr.zoneLabel,
      lastSessionDate: '16 Nov 2026',
      lastSessionName: 'Tangerang Running',
      lastSessionDistKm: 6.59,
      vo2max: healthSnapshot.vo2MaxEstimate?.runningVo2Max || 47,
      weeklyTargetKm: 30,
    },
  ];

  // Primary Telemetry Content (Calendar, PMC, Recent Runs, Hub)
  const telemetryContent = (
    <div className="space-y-6">
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
          <WeeklyTargetWidget currentKm={summary.hero.currentWeekDistanceKm} weeklyTargetKm={30} />

          {/* HRR Profile Calibration Note */}
          <HRRProfileWidget />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
      {/* Top Welcome & Telemetry Bar */}
      <DashboardWelcomeBar lastSync={summary.lastSync} />

      {/* Role-Specific View Switcher */}
      {userRole === 'coach' ? (
        /* COACH ROLE: Command Center with Athlete Roster & Telemetry Oversight */
        <CoachDashboardView
          coachName={fullName}
          coachEmail={userEmail}
          athletes={clubAthletes}
        >
          {telemetryContent}
        </CoachDashboardView>
      ) : (
        /* ATHLETE ROLE */
        <>
          {/* If athlete has not connected their own Garmin yet */}
          {!isGarminConnected && (
            <NewAthleteSetupCard
              athleteName={fullName}
              athleteEmail={userEmail}
            />
          )}

          {/* Personal Telemetry Content */}
          {telemetryContent}
        </>
      )}
    </div>
  );
}
