import { Activity } from '../entities/Activity';

export interface ACWRResult {
  acuteLoad: number; // 7-day load
  chronicLoad: number; // 28-day load normalized to weekly (divided by 4)
  ratio: number; // Acute : Chronic
  zone: 'UNDER_TRAINING' | 'SWEET_SPOT' | 'ELEVATED_RISK' | 'DANGER_ZONE';
  zoneLabel: string;
  zoneDescription: string;
  coachingRecommendation: string;
  acuteDistanceKm: number;
  chronicWeeklyDistanceKm: number;
}

export class ACWRCalculator {
  public static calculate(activities: Activity[], referenceDate: Date = new Date()): ACWRResult {
    const nowMs = referenceDate.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysAgoMs = nowMs - 7 * oneDayMs;
    const twentyEightDaysAgoMs = nowMs - 28 * oneDayMs;

    let acuteLoad = 0;
    let acuteDistM = 0;

    let chronicLoadTotal = 0;
    let chronicDistM = 0;

    activities.forEach(a => {
      const actTime = new Date(a.startTime).getTime();
      const load = a.relativeEffortScore > 0 ? a.relativeEffortScore : Math.round((a.distanceMeters / 1000) * 10);

      // Check 28-day window
      if (actTime >= twentyEightDaysAgoMs && actTime <= nowMs) {
        chronicLoadTotal += load;
        chronicDistM += a.distanceMeters;

        // Check 7-day window
        if (actTime >= sevenDaysAgoMs) {
          acuteLoad += load;
          acuteDistM += a.distanceMeters;
        }
      }
    });

    const chronicLoad = Math.max(1, Math.round(chronicLoadTotal / 4));
    const acuteDistanceKm = Math.round((acuteDistM / 1000) * 10) / 10;
    const chronicWeeklyDistanceKm = Math.round((chronicDistM / 4 / 1000) * 10) / 10;

    // Calculate Ratio
    const rawRatio = acuteLoad / chronicLoad;
    const ratio = Math.round(rawRatio * 100) / 100;

    let zone: ACWRResult['zone'] = 'SWEET_SPOT';
    let zoneLabel = 'THE SWEET SPOT (OPTIMAL)';
    let zoneDescription = 'Workload balance is optimal. Maximum cardiovascular adaptation with minimum injury risk.';
    let coachingRecommendation = 'Keep steady! Your acute load aligns smoothly with your chronic foundation.';

    if (ratio < 0.8) {
      zone = 'UNDER_TRAINING';
      zoneLabel = 'UNDER-TRAINING / RECOVERY';
      zoneDescription = 'Recent 7-day load has fallen below 80% of your 4-week foundation.';
      coachingRecommendation = 'Fitness may decay if sustained. Gradually resume easy aerobic volume.';
    } else if (ratio > 1.5) {
      zone = 'DANGER_ZONE';
      zoneLabel = 'DANGER ZONE (OVERUSE SPIKE)';
      zoneDescription = 'Workload ramped up aggressively (>1.5x of chronic baseline). High risk of tendon/muscle injury.';
      coachingRecommendation = 'Prioritize recovery sleep, foam rolling, and keep upcoming runs in Zone 1/2.';
    } else if (ratio > 1.3) {
      zone = 'ELEVATED_RISK';
      zoneLabel = 'ELEVATED WORKLOAD RAMP';
      zoneDescription = 'Training stress is progressing rapidly (1.3x–1.5x of baseline). Adaptation is occurring but monitor fatigue.';
      coachingRecommendation = 'Maintain this plateau next week before increasing distance further.';
    }

    return {
      acuteLoad,
      chronicLoad,
      ratio,
      zone,
      zoneLabel,
      zoneDescription,
      coachingRecommendation,
      acuteDistanceKm,
      chronicWeeklyDistanceKm,
    };
  }
}
