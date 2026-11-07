import { Activity } from '../entities/Activity';
import { ActivityDetail } from '../entities/ActivityDetail';
import { BestEffort } from '../entities/BestEffort';

export interface IActivityRepository {
  getAllActivities(): Promise<Activity[]>;
  getActivityById(id: string): Promise<Activity | null>;
  getActivityDetail(id: string): Promise<ActivityDetail | null>;
  saveActivities(activities: Activity[]): Promise<void>;
  saveActivityDetail(detail: ActivityDetail): Promise<void>;
  getBestEfforts(): Promise<BestEffort[]>;
  saveBestEfforts(efforts: BestEffort[]): Promise<void>;
  getLastSyncTimestamp(): Promise<Date | null>;
  setLastSyncTimestamp(date: Date): Promise<void>;
}
