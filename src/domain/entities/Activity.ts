export type SportType = 'running' | 'trail_running' | 'treadmill_running' | 'track_running' | 'cycling' | 'walking' | 'other';

export interface HRZoneBreakdown {
  zone1Seconds: number; // Recovery (< 60% HRR or custom)
  zone2Seconds: number; // Aerobic Base (60-70%)
  zone3Seconds: number; // Tempo (70-80%)
  zone4Seconds: number; // Threshold / Sub-max (80-90%)
  zone5Seconds: number; // Maximum / Anaerobic (> 90%)
  totalZoneSeconds: number;
}

export interface RunningDynamics {
  avgCadence?: number;             // steps per minute (spm)
  maxCadence?: number;             // spm
  avgStrideLengthMeters?: number;  // meters (e.g. 0.73m = 73cm)
  avgGroundContactTimeMs?: number; // milliseconds (e.g. 269ms)
  avgVerticalOscillationCm?: number; // cm (e.g. 7.16cm)
  avgVerticalRatioPercent?: number;  // % (e.g. 9.87%)
  avgGroundContactBalanceLeftPercent?: number; // % e.g. 50.4 (Left foot stance balance)
  avgGroundContactBalanceRightPercent?: number; // % e.g. 49.6 (Right foot stance balance)
}

export interface Activity {
  id: string;
  externalId: number;
  name: string;
  sportType: SportType;
  startTime: Date;
  startTimeLocalStr: string;
  distanceMeters: number;
  durationSeconds: number;
  movingDurationSeconds: number;
  elevationGainMeters: number;
  elevationLossMeters: number;
  
  // Speed & Pace (meters/sec & seconds/km)
  avgSpeedMps: number;
  maxSpeedMps: number;
  avgPaceSecPerKm: number;
  maxPaceSecPerKm: number;
  avgGradeAdjustedSpeedMps?: number;
  
  // Heart Rate
  avgHeartRate?: number;
  maxHeartRate?: number;
  hrZones: HRZoneBreakdown;
  
  // Power (watts)
  avgPowerWatts?: number;
  maxPowerWatts?: number;
  normalizedPowerWatts?: number;
  
  // Running Dynamics
  dynamics: RunningDynamics;
  
  // Garmin Specific Training Metrics
  calories: number;
  steps?: number; // Total step count during activity
  aerobicTrainingEffect?: number; // 0.0 - 5.0
  anaerobicTrainingEffect?: number; // 0.0 - 5.0
  trainingEffectLabel?: string; // e.g. TEMPO, BASE, VO2MAX
  differenceBodyBattery?: number; // e.g. -5
  
  // Calculated Telemetry Analytics
  relativeEffortScore: number; // Heart rate TRIMP score
  
  // Personal Bests / Splits in this run
  fastest1000mSeconds?: number;
  fastest1609mSeconds?: number; // 1 mile
  fastest5000mSeconds?: number;
  fastest10000mSeconds?: number; // 10k
  fastest21097mSeconds?: number; // Half Marathon (21.1 km)
  fastest42195mSeconds?: number; // Marathon (42.2 km)
  
  // Environmental & Weather Telemetry (Garmin Device Sensor)
  minTemperatureCelsius?: number;
  maxTemperatureCelsius?: number;

  locationName?: string;
  hasGpsData: boolean;
  startLatitude?: number;
  startLongitude?: number;
}
