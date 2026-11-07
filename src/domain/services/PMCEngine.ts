import { Activity } from '../entities/Activity';
import { DailyPMCPoint, FitnessSummary, FormStatus } from '../entities/FitnessFreshness';

export class PMCEngine {
  private static CTL_TIME_CONSTANT = 42; // Chronic Training Load (Fitness)
  private static ATL_TIME_CONSTANT = 7;  // Acute Training Load (Fatigue)

  /**
   * Computes PMC timeline from an array of activities.
   * Fills every calendar day between first activity and today.
   */
  public static computeTimeline(activities: Activity[], daysBack: number = 90): FitnessSummary {
    if (!activities || activities.length === 0) {
      return this.getEmptySummary();
    }

    // Sort ascending by start time
    const sorted = [...activities].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - daysBack);
    startDate.setHours(0, 0, 0, 0);

    // Group activities by date string YYYY-MM-DD
    const activitiesByDay = new Map<string, Activity[]>();
    for (const act of sorted) {
      const dayKey = act.startTime.toISOString().split('T')[0];
      const list = activitiesByDay.get(dayKey) || [];
      list.push(act);
      activitiesByDay.set(dayKey, list);
    }

    const ctlLambda = Math.exp(-1 / this.CTL_TIME_CONSTANT);
    const atlLambda = Math.exp(-1 / this.ATL_TIME_CONSTANT);

    let ctl = 0;
    let atl = 0;

    const timeline: DailyPMCPoint[] = [];

    // Iterate through all days from startDate to today
    const curr = new Date(startDate);
    while (curr <= now) {
      const dayStr = curr.toISOString().split('T')[0];
      const dayActivities = activitiesByDay.get(dayStr) || [];
      
      let dayTrimp = 0;
      let dayDistance = 0;
      for (const act of dayActivities) {
        dayTrimp += act.relativeEffortScore || 0;
        dayDistance += act.distanceMeters || 0;
      }

      // Exponential moving average update
      ctl = (ctl * ctlLambda) + (dayTrimp * (1 - ctlLambda));
      atl = (atl * atlLambda) + (dayTrimp * (1 - atlLambda));
      const tsb = Math.round((ctl - atl) * 10) / 10;

      const roundedCtl = Math.round(ctl * 10) / 10;
      const roundedAtl = Math.round(atl * 10) / 10;
      const status = this.classifyForm(tsb);

      timeline.push({
        dateStr: dayStr,
        date: new Date(curr),
        dailyTrimp: dayTrimp,
        ctl: roundedCtl,
        atl: roundedAtl,
        tsb,
        status,
        statusLabel: this.getFormStatusLabel(status),
        activitiesCount: dayActivities.length,
        totalDistanceMeters: dayDistance,
      });

      curr.setDate(curr.getDate() + 1);
    }

    const latest = timeline[timeline.length - 1];
    
    // Calculate last 7 days total distance and TRIMP
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const recentDays = timeline.filter(p => p.date >= sevenDaysAgo);
    const sevenDayDistanceKm = Math.round(recentDays.reduce((acc, p) => acc + p.totalDistanceMeters, 0) / 1000 * 10) / 10;
    const sevenDayTrimp = Math.round(recentDays.reduce((acc, p) => acc + p.dailyTrimp, 0));

    return {
      currentFitness: latest ? latest.ctl : 0,
      currentFatigue: latest ? latest.atl : 0,
      currentForm: latest ? latest.tsb : 0,
      currentStatus: latest ? latest.status : 'fresh',
      statusDescription: this.getFormStatusDescription(latest ? latest.status : 'fresh'),
      sevenDayDistanceKm,
      sevenDayTrimp,
      history: timeline,
    };
  }

  public static classifyForm(tsb: number): FormStatus {
    if (tsb > 25) return 'transition';
    if (tsb >= 15) return 'peaking';
    if (tsb >= 5) return 'fresh';
    if (tsb >= -10) return 'optimal';
    if (tsb >= -25) return 'fatigued';
    return 'overreaching';
  }

  public static getFormStatusLabel(status: FormStatus): string {
    switch (status) {
      case 'peaking': return 'Peaking / Race Ready';
      case 'fresh': return 'Fresh & Recovered';
      case 'optimal': return 'Optimal Training Zone';
      case 'fatigued': return 'Productive Fatigue';
      case 'overreaching': return 'High Overreaching Risk';
      case 'transition': return 'Recovery / Transition';
    }
  }

  public static getFormStatusDescription(status: FormStatus): string {
    switch (status) {
      case 'peaking':
        return 'Your form is elevated and fatigue is low. Perfect state for a personal record or race!';
      case 'fresh':
        return 'Fatigue has cleared and you have solid fitness base. Ready for high-quality workout intervals.';
      case 'optimal':
        return 'Sweet spot for progressive aerobic adaptation. Training load is actively building fitness.';
      case 'fatigued':
        return 'Accumulated fatigue is high. Prioritize sleep, nutrition, and easy recovery runs.';
      case 'overreaching':
        return 'Extreme training load. High probability of injury or burnout if rest is not taken immediately.';
      case 'transition':
        return 'Long rest period detected. Fitness may begin tapering or detraining if volume is not resumed.';
    }
  }

  private static getEmptySummary(): FitnessSummary {
    return {
      currentFitness: 0,
      currentFatigue: 0,
      currentForm: 0,
      currentStatus: 'fresh',
      statusDescription: 'No training data logged yet.',
      sevenDayDistanceKm: 0,
      sevenDayTrimp: 0,
      history: [],
    };
  }
}
