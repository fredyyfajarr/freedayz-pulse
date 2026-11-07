import { Activity } from '@/domain/entities/Activity';
import { ActivityDetail } from '@/domain/entities/ActivityDetail';
import { GarminDailySummary, GarminHRVSummary } from '@/domain/entities/GarminHealthMetrics';
import { IGarminClient } from '@/domain/repositories/IGarminClient';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { AthleteSettingsManager } from '@/infrastructure/persistence/AthleteSettingsManager';
import { GarminAuthenticator } from './GarminAuthenticator';
import { GarminMappers } from './GarminMappers';

export class GarminApiClient implements IGarminClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.GARMIN_BASE_URL || 'https://personal.connectapi.garmin.com';
  }

  public isConfigured(): boolean {
    return Boolean(process.env.GARMIN_PERSONAL_API_KEY);
  }

  public async fetchRecentActivities(limit: number = 50, start: number = 0): Promise<Activity[]> {
    const token = await GarminAuthenticator.getBearerToken();
    const url = `${this.baseUrl}/activitylist-service/activities/search/activities?start=${start}&limit=${limit}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Garmin API error fetching activities (${response.status}): ${err}`);
    }

    const rawList: any[] = await response.json();
    if (!Array.isArray(rawList)) {
      return [];
    }

    return rawList.map(raw => GarminMappers.mapRawActivity(raw));
  }

  public async fetchActivityDetail(activityId: string | number): Promise<ActivityDetail> {
    const token = await GarminAuthenticator.getBearerToken();
    const url = `${this.baseUrl}/activity-service/activity/${activityId}/details`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Garmin API error fetching activity details (${response.status}): ${err}`);
    }

    const rawDetail = await response.json();
    return GarminMappers.mapRawDetail(String(activityId), rawDetail);
  }

  public async fetchDailySummary(dateStr: string): Promise<GarminDailySummary | null> {
    try {
      const token = await GarminAuthenticator.getBearerToken();
      const url = `${this.baseUrl}/usersummary-service/usersummary/daily?calendarDate=${dateStr}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const raw = await response.json();
      const sleepSec = Number(raw.sleepingSeconds || 0);
      const asleepSec = Number(raw.measurableAsleepDuration || sleepSec);
      const awakeSec = Number(raw.measurableAwakeDuration || Math.max(0, sleepSec - asleepSec));
      const hours = Math.floor(sleepSec / 3600);
      const mins = Math.floor((sleepSec % 3600) / 60);

      const calendarDate = raw.calendarDate || dateStr;
      const settingsScore = AthleteSettingsManager.getSleepScoreForDate(calendarDate);

      // Firstbeat Analytics Sleep Score Model (Duration, Restfulness, Energy Recharge)
      const durationHours = asleepSec / 3600;
      const durationScore = Math.min(100, Math.round((durationHours / 7.5) * 100));
      const awakeRatio = sleepSec > 0 ? awakeSec / sleepSec : 0;
      const restfulnessScore = Math.max(20, Math.round((1 - awakeRatio * 2.2) * 100));
      const bbCharged = Number(raw.bodyBatteryDuringSleep || raw.bodyBatteryChargedValue || 35);
      const avgStress = Number(raw.averageStressLevel || 25);
      const rechargeScore = Math.min(100, Math.max(30, Math.round(bbCharged * 0.85 + (40 - avgStress * 0.8))));

      const calculatedScore = Math.min(100, Math.max(30, Math.round(
        durationScore * 0.45 + restfulnessScore * 0.25 + rechargeScore * 0.30
      )));

      const sleepScore = raw.sleepScore ?? raw.overallSleepScore ?? settingsScore ?? calculatedScore;
      const sleepQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = 
        sleepScore >= 80 ? 'EXCELLENT' : sleepScore >= 70 ? 'GOOD' : sleepScore >= 60 ? 'FAIR' : 'POOR';

      return {
        calendarDate,
        restingHeartRate: raw.restingHeartRate || 50,
        lastSevenDaysAvgRestingHeartRate: raw.lastSevenDaysAvgRestingHeartRate || raw.restingHeartRate || 50,
        minHeartRate: raw.minHeartRate || 48,
        maxHeartRate: raw.maxHeartRate || 180,
        bodyBattery: {
          mostRecentValue: raw.bodyBatteryMostRecentValue ?? 50,
          chargedValue: raw.bodyBatteryChargedValue ?? 0,
          drainedValue: raw.bodyBatteryDrainedValue ?? 0,
          highestValue: raw.bodyBatteryHighestValue ?? 100,
          lowestValue: raw.bodyBatteryLowestValue ?? 5,
          duringSleepValue: raw.bodyBatteryDuringSleep ?? 30,
        },
        stress: {
          averageLevel: raw.averageStressLevel ?? 25,
          maxLevel: raw.maxStressLevel ?? 75,
          stressDurationSec: raw.stressDuration ?? 0,
          restStressDurationSec: raw.restStressDuration ?? 0,
          activityStressDurationSec: raw.activityStressDuration ?? 0,
          qualifier: raw.stressQualifier || 'RESTFUL',
        },
        sleep: {
          sleepingSeconds: sleepSec,
          measurableAsleepDurationSec: asleepSec,
          measurableAwakeDurationSec: awakeSec,
          formattedHours: `${hours}h ${mins}m`,
          sleepScore,
          sleepQuality,
          restStressDurationSec: Number(raw.restStressDuration || 0),
          bodyBatteryChargedDuringSleep: bbCharged,
        },
        steps: raw.totalSteps || 0,
        activeKilocalories: raw.activeKilocalories || 0,
        totalKilocalories: raw.totalKilocalories || 0,
        avgWakingRespiration: raw.avgWakingRespirationValue || undefined,
      };
    } catch (err) {
      console.warn('Failed to fetch Garmin daily summary:', err);
      return null;
    }
  }

  public async fetchHRVHistory(startDate: string, endDate: string): Promise<GarminHRVSummary[]> {
    try {
      const token = await GarminAuthenticator.getBearerToken();
      const url = `${this.baseUrl}/hrv-service/hrv/daily/${startDate}/${endDate}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      const raw = await response.json();
      if (!Array.isArray(raw.hrvSummaries)) {
        return [];
      }

      return raw.hrvSummaries.map((s: any) => ({
        calendarDate: s.calendarDate,
        weeklyAvg: s.weeklyAvg !== null && s.weeklyAvg !== undefined ? Number(s.weeklyAvg) : null,
        lastNightAvg: s.lastNightAvg !== null && s.lastNightAvg !== undefined ? Number(s.lastNightAvg) : null,
        lastNight5MinHigh: s.lastNight5MinHigh !== null && s.lastNight5MinHigh !== undefined ? Number(s.lastNight5MinHigh) : null,
        status: s.status || 'BALANCED',
        feedbackPhrase: s.feedbackPhrase || '',
        baseline: s.baseline
          ? {
              lowUpper: Number(s.baseline.lowUpper),
              balancedLow: Number(s.baseline.balancedLow),
              balancedUpper: Number(s.baseline.balancedUpper),
            }
          : null,
      }));
    } catch (err) {
      console.warn('Failed to fetch Garmin HRV history:', err);
      return [];
    }
  }
}
