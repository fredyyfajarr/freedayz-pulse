import { BestEffort, MilestoneDistance } from '@/domain/entities/BestEffort';
import { IActivityRepository } from '@/domain/repositories/IActivityRepository';
import { IGarminClient } from '@/domain/repositories/IGarminClient';
import { PaceCalculator } from '@/domain/services/PaceCalculator';

export class SyncActivitiesUseCase {
  constructor(
    private garminClient: IGarminClient,
    private repository: IActivityRepository
  ) {}

  public async execute(force: boolean = false): Promise<{ syncedCount: number; totalCount: number }> {
    if (!this.garminClient.isConfigured()) {
      throw new Error('Garmin Personal API Key is not configured in .env.local');
    }

    const lastSync = await this.repository.getLastSyncTimestamp();
    const now = new Date();

    // If synced less than 3 minutes ago and not forced, return cached
    if (!force && lastSync && (now.getTime() - lastSync.getTime() < 3 * 60 * 1000)) {
      const existing = await this.repository.getAllActivities();
      return { syncedCount: 0, totalCount: existing.length };
    }

    // Fetch up to 50 recent activities from Garmin
    const activities = await this.garminClient.fetchRecentActivities(50, 0);
    await this.repository.saveActivities(activities);
    await this.repository.setLastSyncTimestamp(now);

    // Calculate Best Efforts
    await this.extractAndSaveBestEfforts(activities);

    const all = await this.repository.getAllActivities();
    return { syncedCount: activities.length, totalCount: all.length };
  }

  private async extractAndSaveBestEfforts(activities: any[]): Promise<void> {
    const milestones: { key: MilestoneDistance; name: string; meters: number; prop: string }[] = [
      { key: '1k', name: '1 Kilometer', meters: 1000, prop: 'fastest1000mSeconds' },
      { key: '1mi', name: '1 Mile', meters: 1609.34, prop: 'fastest1609mSeconds' },
      { key: '5k', name: '5 Kilometers', meters: 5000, prop: 'fastest5000mSeconds' },
      { key: '10k', name: '10 Kilometers', meters: 10000, prop: 'fastest10000mSeconds' },
      { key: 'half_marathon', name: 'Half Marathon', meters: 21097.5, prop: 'fastest21097mSeconds' },
      { key: 'marathon', name: 'Marathon', meters: 42195, prop: 'fastest42195mSeconds' },
    ];

    const prs: BestEffort[] = [];

    for (const m of milestones) {
      // Find activities that either have this recorded split OR whose total distance >= milestone meters
      const valid = activities.filter(a => {
        if (a[m.prop] && a[m.prop] > 0) return true;
        // Fallback: any run covering at least 98% of the distance milestone
        if (a.distanceMeters && a.distanceMeters >= m.meters * 0.98) return true;
        return false;
      });

      if (valid.length === 0) continue;

      const getSplitTime = (a: any): number => {
        if (a[m.prop] && a[m.prop] > 0) {
          return a[m.prop];
        }
        const movingTime = a.movingDurationSeconds || a.durationSeconds || 0;
        return a.distanceMeters > 0 ? Math.round(movingTime * (m.meters / a.distanceMeters)) : Infinity;
      };

      // Sort by fastest moving time
      valid.sort((a, b) => getSplitTime(a) - getSplitTime(b));

      const best = valid[0];
      const bestTime = getSplitTime(best);
      const pace = PaceCalculator.calculatePaceSecPerKm(m.meters, bestTime);

      prs.push({
        id: `pr-${m.key}`,
        milestone: m.key,
        milestoneName: m.name,
        targetMeters: m.meters,
        timeSeconds: bestTime,
        paceSecPerKm: pace,
        dateAchieved: best.startTime,
        activityId: best.id,
        activityName: best.name,
        isAllTimePr: true,
        isYearPr: true,
      });
    }

    await this.repository.saveBestEfforts(prs);
  }
}
