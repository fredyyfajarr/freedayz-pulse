export interface BodyBatterySnapshot {
  mostRecentValue: number;
  chargedValue: number;
  drainedValue: number;
  highestValue: number;
  lowestValue: number;
  duringSleepValue: number;
}

export interface StressSnapshot {
  averageLevel: number;
  maxLevel: number;
  stressDurationSec: number;
  restStressDurationSec: number;
  activityStressDurationSec: number;
  qualifier: string;
}

export interface SleepSnapshot {
  sleepingSeconds: number;
  measurableAsleepDurationSec: number;
  measurableAwakeDurationSec?: number;
  formattedHours: string;
  sleepScore?: number;
  sleepQuality?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  restStressDurationSec?: number;
  bodyBatteryChargedDuringSleep?: number;
}

export interface GarminDailySummary {
  calendarDate: string;
  restingHeartRate: number;
  lastSevenDaysAvgRestingHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  bodyBattery: BodyBatterySnapshot;
  stress: StressSnapshot;
  sleep: SleepSnapshot;
  steps: number;
  activeKilocalories: number;
  totalKilocalories: number;
  avgWakingRespiration?: number;
}

export interface GarminHRVSummary {
  calendarDate: string;
  weeklyAvg: number | null;
  lastNightAvg: number | null;
  lastNight5MinHigh: number | null;
  status: string; // e.g. "LOW", "BALANCED", "UNBALANCED", "NONE"
  feedbackPhrase: string;
  baseline: {
    lowUpper: number;
    balancedLow: number;
    balancedUpper: number;
  } | null;
}

export interface TrainingZonePace {
  zoneKey: 'E' | 'M' | 'T' | 'I' | 'R';
  name: string;
  nameId: string;
  intensityDesc: string;
  intensityDescId: string;
  purpose: string;
  purposeId: string;
  minPaceSecPerKm: number;
  maxPaceSecPerKm?: number;
  paceFormatted: string;
  split400m?: string;
  split1000m?: string;
}

export interface VDOTTrainingProfile {
  vdot: number;
  fitnessCategory: string;
  source: string;
  trainingPaces: TrainingZonePace[];
}

export interface VO2MaxEstimate {
  runningVo2Max: number;
  fitnessCategory: string; // e.g. "GOOD", "EXCELLENT", "SUPERIOR"
  source: string;
  racePredictions: {
    distanceLabel: string;
    distanceMeters: number;
    predictedTimeSeconds: number;
    predictedPaceSecPerKm: number;
  }[];
  trainingPaces?: TrainingZonePace[];
}

export interface HealthTelemetrySnapshot {
  dailySummary: GarminDailySummary | null;
  latestHrv: GarminHRVSummary | null;
  hrvHistory: GarminHRVSummary[];
  dailyHistory?: GarminDailySummary[];
  vo2MaxEstimate: VO2MaxEstimate;
  lastSync: string;
}
