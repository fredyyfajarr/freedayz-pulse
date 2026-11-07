import fs from 'fs/promises';
import path from 'path';
import { IGarminClient } from '@/domain/repositories/IGarminClient';
import { IActivityRepository } from '@/domain/repositories/IActivityRepository';
import { HealthTelemetrySnapshot, GarminDailySummary, GarminHRVSummary } from '@/domain/entities/GarminHealthMetrics';
import { VO2MaxCalculator } from '@/domain/services/VO2MaxCalculator';

export class GetHealthTelemetryUseCase {
  private cacheFilePath: string;

  constructor(
    private garminClient: IGarminClient,
    private repository: IActivityRepository
  ) {
    this.cacheFilePath = path.join(process.cwd(), 'data', 'health-snapshot.json');
  }

  public async execute(forceRefresh: boolean = false): Promise<HealthTelemetrySnapshot> {
    if (!forceRefresh) {
      const cached = await this.readCache();
      if (cached) return cached;
    }

    const bestEfforts = await this.repository.getBestEfforts();
    const vo2Estimate = VO2MaxCalculator.evaluateAthleteVO2Max(bestEfforts);

    let dailySummary: GarminDailySummary | null = null;
    let dailyHistory: GarminDailySummary[] = [];
    let hrvList: GarminHRVSummary[] = [];

    if (this.garminClient.isConfigured()) {
      try {
        const now = new Date();
        const formatLocalDate = (d: Date): string => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        const todayStr = formatLocalDate(now);

        // 7 days dates array (from 6 days ago up to today)
        const dates: string[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          dates.push(formatLocalDate(d));
        }

        // 30 days ago for HRV range
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const startStr = formatLocalDate(thirtyDaysAgo);

        // Fetch 7-day daily summaries and 30-day HRV history in parallel
        const [dailySummaries, hrv] = await Promise.all([
          Promise.all(dates.map(date => this.garminClient.fetchDailySummary(date))),
          this.garminClient.fetchHRVHistory(startStr, todayStr),
        ]);

        const validDaily = dailySummaries.filter((d): d is GarminDailySummary => Boolean(d));
        dailyHistory = validDaily;

        // Find the latest day with a valid resting heart rate (> 0)
        const reversed = [...validDaily].reverse();
        const latestWithRhr = reversed.find(d => d.restingHeartRate && d.restingHeartRate > 0);
        dailySummary = latestWithRhr || (validDaily.length > 0 ? validDaily[validDaily.length - 1] : null);

        hrvList = hrv;
      } catch (err) {
        console.warn('Health telemetry fetch notice:', err);
      }
    }

    const latestHrv = hrvList.length > 0 ? hrvList[hrvList.length - 1] : null;

    const snapshot: HealthTelemetrySnapshot = {
      dailySummary,
      dailyHistory,
      latestHrv,
      hrvHistory: hrvList,
      vo2MaxEstimate: vo2Estimate,
      lastSync: new Date().toISOString(),
    };

    await this.writeCache(snapshot);
    return snapshot;
  }

  private async readCache(): Promise<HealthTelemetrySnapshot | null> {
    try {
      const raw = await fs.readFile(this.cacheFilePath, 'utf8');
      return JSON.parse(raw) as HealthTelemetrySnapshot;
    } catch {
      return null;
    }
  }

  private async writeCache(snapshot: HealthTelemetrySnapshot): Promise<void> {
    try {
      await fs.writeFile(this.cacheFilePath, JSON.stringify(snapshot, null, 2), 'utf8');
    } catch (err) {
      console.warn('Failed to cache health snapshot:', err);
    }
  }
}
