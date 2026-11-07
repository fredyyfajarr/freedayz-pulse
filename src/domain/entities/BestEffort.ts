export type MilestoneDistance = '400m' | '1k' | '1mi' | '5k' | '10k' | 'half_marathon' | 'marathon';

export interface BestEffort {
  id: string;
  milestone: MilestoneDistance;
  milestoneName: string;
  targetMeters: number;
  timeSeconds: number;
  paceSecPerKm: number;
  dateAchieved: Date;
  activityId: string;
  activityName: string;
  isAllTimePr: boolean;
  isYearPr: boolean;
}
