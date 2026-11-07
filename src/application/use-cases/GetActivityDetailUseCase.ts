import { Activity } from '@/domain/entities/Activity';
import { ActivityDetail } from '@/domain/entities/ActivityDetail';
import { IActivityRepository } from '@/domain/repositories/IActivityRepository';
import { IGarminClient } from '@/domain/repositories/IGarminClient';

export interface ActivityDetailResult {
  activity: Activity;
  detail: ActivityDetail | null;
}

export class GetActivityDetailUseCase {
  constructor(
    private repository: IActivityRepository,
    private garminClient: IGarminClient
  ) {}

  public async execute(activityId: string): Promise<ActivityDetailResult> {
    const activity = await this.repository.getActivityById(activityId);
    if (!activity) {
      throw new Error(`Activity with ID ${activityId} not found`);
    }

    // Try reading cached detail
    let detail = await this.repository.getActivityDetail(activityId);

    // If not cached and activity has GPS / detailed data, fetch from Garmin
    if (!detail && activity.hasGpsData && this.garminClient.isConfigured()) {
      try {
        detail = await this.garminClient.fetchActivityDetail(activityId);
        await this.repository.saveActivityDetail(detail);
      } catch (err) {
        console.warn(`Could not fetch live detail for activity ${activityId}:`, err);
      }
    }

    return {
      activity,
      detail,
    };
  }
}
