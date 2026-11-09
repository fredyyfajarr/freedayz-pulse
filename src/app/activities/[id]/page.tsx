import { container } from '@/infrastructure/di/container';
import { notFound } from 'next/navigation';
import { AthleteSettingsManager } from '@/infrastructure/persistence/AthleteSettingsManager';
import ActivityHeroHeader from '@/components/activity/ActivityHeroHeader';
import RouteMap from '@/components/activity/RouteMap';
import ElevationPaceChart from '@/components/activity/ElevationPaceChart';
import HeartRateZonesCard from '@/components/activity/HeartRateZonesCard';
import RunningDynamicsCard from '@/components/activity/RunningDynamicsCard';
import SplitsTable from '@/components/activity/SplitsTable';
import FreedayzzPerformanceLab from '@/components/activity/FreedayzzPerformanceLab';
import PaceZonesCard from '@/components/activity/PaceZonesCard';
import HydrationFuelingCard from '@/components/activity/HydrationFuelingCard';

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
      {/* 1. Hero Header */}
      <ActivityHeroHeader activity={activity} polyline={detail?.polyline || []} />

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
