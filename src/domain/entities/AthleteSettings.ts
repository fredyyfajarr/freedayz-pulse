export interface CustomHRZoneThresholds {
  zone1Min: number;
  zone1Max: number;
  zone2Min: number;
  zone2Max: number;
  zone3Min: number;
  zone3Max: number;
  zone4Min: number;
  zone4Max: number;
  zone5Min: number;
  zone5Max: number;
}

export const DEFAULT_CUSTOM_ZONES: CustomHRZoneThresholds = {
  zone1Min: 126,
  zone1Max: 144,
  zone2Min: 145,
  zone2Max: 162, // Exact user Garmin Forerunner 165 calibration
  zone3Min: 163,
  zone3Max: 176,
  zone4Min: 177,
  zone4Max: 188,
  zone5Min: 189,
  zone5Max: 200,
};

export interface AthleteBiometricSettings {
  maxHr: number;
  restingHr: number;
  dailySleepScores?: Record<string, number>;
  customZones?: CustomHRZoneThresholds;
  lastUpdated?: string;
}
