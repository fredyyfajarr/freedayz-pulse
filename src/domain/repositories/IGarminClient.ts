import { Activity } from '../entities/Activity';
import { ActivityDetail } from '../entities/ActivityDetail';
import { GarminDailySummary, GarminHRVSummary } from '../entities/GarminHealthMetrics';

export interface IGarminClient {
  fetchRecentActivities(limit?: number, start?: number): Promise<Activity[]>;
  fetchActivityDetail(activityId: string | number): Promise<ActivityDetail>;
  fetchDailySummary(dateStr: string): Promise<GarminDailySummary | null>;
  fetchHRVHistory(startDate: string, endDate: string): Promise<GarminHRVSummary[]>;
  isConfigured(): boolean;
}
