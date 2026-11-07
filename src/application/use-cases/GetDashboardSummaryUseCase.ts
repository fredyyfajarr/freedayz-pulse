import { Activity } from '@/domain/entities/Activity';
import { BestEffort } from '@/domain/entities/BestEffort';
import { FitnessSummary } from '@/domain/entities/FitnessFreshness';
import { IActivityRepository } from '@/domain/repositories/IActivityRepository';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { PMCEngine } from '@/domain/services/PMCEngine';

export interface WeeklyHeroStats {
  currentWeekDistanceKm: number;
  currentWeekDurationSec: number;
  currentWeekElevationM: number;
  currentWeekRunsCount: number;
  currentWeekAvgPaceSecPerKm: number;
  currentWeekTrimpScore: number;
  prevWeekDistanceKm: number;
  distanceChangePercent: number;
}

export interface TrainingLogActivityItem {
  id: string;
  name: string;
  distanceKm: number;
  pace: string;
  time: string;
  sportType: string;
}

export interface TrainingLogDay {
  dateStr: string; // YYYY-MM-DD in local time
  dayOfWeek: number; // 0 Monday ... 6 Sunday
  distanceKm: number;
  durationSec: number;
  paceSecPerKm: number;
  trimpScore: number;
  activitiesCount: number;
  activities: TrainingLogActivityItem[];
}

export interface TrainingLogWeek {
  weekLabel: string;
  weekStart: string;
  totalDistanceKm: number;
  totalDurationSec: number;
  days: TrainingLogDay[];
}

export interface DashboardSummary {
  hero: WeeklyHeroStats;
  fitness: FitnessSummary;
  trainingLogWeeks: TrainingLogWeek[];
  recentActivities: Activity[];
  allActivities: Activity[];
  bestEfforts: BestEffort[];
  lastSync: Date | null;
}

export class GetDashboardSummaryUseCase {
  constructor(private repository: IActivityRepository) {}

  /**
   * Returns YYYY-MM-DD from a Date object using local time (NOT UTC)
   */
  public static toLocalDateString(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Returns YYYY-MM-DD from an Activity using its local start time
   */
  public static getActivityLocalDate(a: Activity): string {
    if (a.startTimeLocalStr) {
      return a.startTimeLocalStr.split(' ')[0];
    }
    return GetDashboardSummaryUseCase.toLocalDateString(new Date(a.startTime));
  }

  public async execute(): Promise<DashboardSummary> {
    const activities = await this.repository.getAllActivities();
    const lastSync = await this.repository.getLastSyncTimestamp();
    const bestEfforts = await this.repository.getBestEfforts();

    const fitness = PMCEngine.computeTimeline(activities, 90);
    const hero = this.calculateWeeklyHeroStats(activities);
    const trainingLogWeeks = this.buildTrainingLogWeeks(activities, 6);

    return {
      hero,
      fitness,
      trainingLogWeeks,
      recentActivities: activities.slice(0, 6),
      allActivities: activities,
      bestEfforts,
      lastSync,
    };
  }

  private calculateWeeklyHeroStats(activities: Activity[]): WeeklyHeroStats {
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1; // 0 is Monday, 6 is Sunday

    // Anchor at 12:00 PM (Noon) to avoid any timezone/DST drift
    const baseMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 12, 0, 0);
    const prevMonday = new Date(baseMonday.getFullYear(), baseMonday.getMonth(), baseMonday.getDate() - 7, 12, 0, 0);

    const startThisWeekStr = GetDashboardSummaryUseCase.toLocalDateString(baseMonday);
    const startPrevWeekStr = GetDashboardSummaryUseCase.toLocalDateString(prevMonday);
    const todayStr = GetDashboardSummaryUseCase.toLocalDateString(now);

    const thisWeekActs = activities.filter(a => {
      const actDate = GetDashboardSummaryUseCase.getActivityLocalDate(a);
      return actDate >= startThisWeekStr && actDate <= todayStr;
    });

    const prevWeekActs = activities.filter(a => {
      const actDate = GetDashboardSummaryUseCase.getActivityLocalDate(a);
      return actDate >= startPrevWeekStr && actDate < startThisWeekStr;
    });

    const currDistM = thisWeekActs.reduce((acc, a) => acc + a.distanceMeters, 0);
    const currDurationS = thisWeekActs.reduce(
      (acc, a) => acc + (a.movingDurationSeconds || a.durationSeconds),
      0
    );
    const currElevationM = thisWeekActs.reduce((acc, a) => acc + a.elevationGainMeters, 0);
    const currTrimp = thisWeekActs.reduce((acc, a) => acc + a.relativeEffortScore, 0);

    const prevDistM = prevWeekActs.reduce((acc, a) => acc + a.distanceMeters, 0);

    const currDistKm = Math.round((currDistM / 1000) * 100) / 100;
    const prevDistKm = Math.round((prevDistM / 1000) * 100) / 100;

    let changePercent = 0;
    if (prevDistKm > 0) {
      changePercent = Math.round(((currDistKm - prevDistKm) / prevDistKm) * 100);
    } else if (currDistKm > 0) {
      changePercent = 100;
    }

    const avgPace = currDistM > 0 ? currDurationS / (currDistM / 1000) : 0;

    return {
      currentWeekDistanceKm: currDistKm,
      currentWeekDurationSec: currDurationS,
      currentWeekElevationM: Math.round(currElevationM),
      currentWeekRunsCount: thisWeekActs.length,
      currentWeekAvgPaceSecPerKm: Math.round(avgPace),
      currentWeekTrimpScore: currTrimp,
      prevWeekDistanceKm: prevDistKm,
      distanceChangePercent: changePercent,
    };
  }

  private buildTrainingLogWeeks(activities: Activity[], weeksCount: number = 6): TrainingLogWeek[] {
    const weeks: TrainingLogWeek[] = [];
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;

    // Anchor at 12:00 PM (Noon) to avoid any timezone/DST drift
    const baseMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 12, 0, 0);

    for (let w = weeksCount - 1; w >= 0; w--) {
      const weekMonday = new Date(
        baseMonday.getFullYear(),
        baseMonday.getMonth(),
        baseMonday.getDate() - w * 7,
        12,
        0,
        0
      );

      const weekSunday = new Date(
        weekMonday.getFullYear(),
        weekMonday.getMonth(),
        weekMonday.getDate() + 6,
        12,
        0,
        0
      );

      const days: TrainingLogDay[] = [];
      let weekDistance = 0;
      let weekDuration = 0;

      for (let d = 0; d < 7; d++) {
        const dayDate = new Date(
          weekMonday.getFullYear(),
          weekMonday.getMonth(),
          weekMonday.getDate() + d,
          12,
          0,
          0
        );
        const dayStr = GetDashboardSummaryUseCase.toLocalDateString(dayDate);

        // Match activities whose local start date matches this calendar date
        const dayActs = activities.filter(a => {
          return GetDashboardSummaryUseCase.getActivityLocalDate(a) === dayStr;
        });

        const dayDistM = dayActs.reduce((acc, a) => acc + a.distanceMeters, 0);
        const dayMovingDurationS = dayActs.reduce(
          (acc, a) => acc + (a.movingDurationSeconds || a.durationSeconds),
          0
        );
        const dayTrimp = dayActs.reduce((acc, a) => acc + a.relativeEffortScore, 0);
        const dayDistKm = Math.round((dayDistM / 1000) * 100) / 100;

        weekDistance += dayDistKm;
        weekDuration += dayMovingDurationS;

        // True weighted average pace for the day
        const dayPace = dayDistM > 0 ? Math.round(dayMovingDurationS / (dayDistM / 1000)) : 0;

        days.push({
          dateStr: dayStr,
          dayOfWeek: d, // 0 Monday ... 6 Sunday
          distanceKm: dayDistKm,
          durationSec: dayMovingDurationS,
          paceSecPerKm: dayPace,
          trimpScore: dayTrimp,
          activitiesCount: dayActs.length,
          activities: dayActs.map(a => ({
            id: a.id,
            name: a.name,
            distanceKm: Math.round((a.distanceMeters / 1000) * 100) / 100,
            pace: PaceCalculator.formatPace(a.avgPaceSecPerKm),
            time: PaceCalculator.formatDuration(a.movingDurationSeconds || a.durationSeconds),
            sportType: a.sportType,
          })),
        });
      }

      const label = `${weekMonday.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} - ${weekSunday.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`;

      weeks.push({
        weekLabel: label,
        weekStart: GetDashboardSummaryUseCase.toLocalDateString(weekMonday),
        totalDistanceKm: Math.round(weekDistance * 100) / 100,
        totalDurationSec: weekDuration,
        days,
      });
    }

    return weeks;
  }
}
