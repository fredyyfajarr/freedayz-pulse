import type { Metadata } from 'next';
import { container } from '@/infrastructure/di/container';
import { notFound, redirect } from 'next/navigation';
import { AthleteSettingsManager } from '@/infrastructure/persistence/AthleteSettingsManager';
import { getCurrentUserAccess } from '@/utils/athleteAccess';
import NewAthleteSetupCard from '@/components/dashboard/NewAthleteSetupCard';
import ActivityHeroHeader from '@/components/activity/ActivityHeroHeader';
import RouteMap from '@/components/activity/RouteMap';
import ElevationPaceChart from '@/components/activity/ElevationPaceChart';
import HeartRateZonesCard from '@/components/activity/HeartRateZonesCard';
import RunningDynamicsCard from '@/components/activity/RunningDynamicsCard';
import SplitsTable from '@/components/activity/SplitsTable';
import FreedayzzPerformanceLab from '@/components/activity/FreedayzzPerformanceLab';
import PaceZonesCard from '@/components/activity/PaceZonesCard';
import HydrationFuelingCard from '@/components/activity/HydrationFuelingCard';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const activity = await container.repository.getActivityById(id);
    if (activity) {
      const distKm = (activity.distanceMeters / 1000).toFixed(2);
      return {
        title: `${activity.name || 'Sesi Lari'} (${distKm} km)`,
      };
    }
  } catch {}
  return {
    title: 'Detail Aktivitas Lari',
  };
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await getCurrentUserAccess();
  if (access.isCoach) {
    redirect('/activities');
  }
  if (!access.hasTelemetryAccess) {
    return (
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 space-y-4 sm:space-y-6 min-w-0">
        <NewAthleteSetupCard athleteName={access.fullName} athleteEmail={access.email} />
      </div>
    );
  }

  const { id } = await params;

  let result;
  let allActivities = [];
  try {
    const [detailRes, allActs] = await Promise.all([
      container.activityDetailUseCase.execute(id),
      container.repository.getAllActivities(),
    ]);
    result = detailRes;
    allActivities = allActs;
  } catch {
    notFound();
  }

  const { activity, detail } = result;
  const athleteSettings = AthleteSettingsManager.getSettings();

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6 min-w-0">
      {/* 1. Hero Header */}
      <ActivityHeroHeader
        activity={activity}
        polyline={detail?.polyline || []}
        deviceName={athleteSettings.deviceName}
      />

      {/* 2. Freedayzz Performance Lab (Pacing, GAP, Decoupling, Matched Runs) */}
      <FreedayzzPerformanceLab
        activity={activity}
        splits={detail?.splits || []}
        stream={detail?.metricStream || []}
        allActivities={allActivities}
      />

      {/* 3. Map and Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <RouteMap
            polyline={detail?.polyline || []}
            activityName={activity.name}
            activityDate={activity.startTimeLocalStr || activity.startTime.toISOString()}
          />
        </div>
        <div>
          <ElevationPaceChart stream={detail?.metricStream || []} />
        </div>
      </div>

      {/* 4. Heart Rate Zones & Jack Daniels Pace Zones Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <HeartRateZonesCard
            zones={activity.hrZones}
            aerobicTE={activity.aerobicTrainingEffect}
            anaerobicTE={activity.anaerobicTrainingEffect}
            trainingEffectLabel={activity.trainingEffectLabel}
            customZones={athleteSettings.customZones}
            restingHr={athleteSettings.restingHr}
            maxHr={athleteSettings.maxHr}
            deviceName={athleteSettings.deviceName}
            stream={detail?.metricStream || []}
          />
        </div>
        <div>
          <PaceZonesCard
            stream={detail?.metricStream || []}
            avgPaceSecPerKm={activity.avgPaceSecPerKm}
          />
        </div>
      </div>

      {/* 5. Garmin Running Dynamics Biomechanics */}
      <div>
        <RunningDynamicsCard
          dynamics={activity.dynamics}
          avgCadence={activity.dynamics.avgCadence}
          maxCadence={activity.dynamics.maxCadence}
          steps={activity.steps}
          durationSeconds={activity.movingDurationSeconds || activity.durationSeconds}
        />
      </div>

      {/* 6. Hydration & Fueling Recovery Lab */}
      <div>
        <HydrationFuelingCard activity={activity} />
      </div>

      {/* 7. Kilometer Splits Breakdown */}
      {detail?.splits && detail.splits.length > 0 && (
        <div>
          <SplitsTable splits={detail.splits} />
        </div>
      )}
    </div>
  );
}
