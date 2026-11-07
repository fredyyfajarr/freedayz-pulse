export interface GeoPoint {
  lat: number;
  lon: number;
  altitude?: number | null;
  time: number; // timestamp in ms
  speed?: number | null;
  distanceInMeters?: number | null;
}

export interface MetricStreamPoint {
  timestamp: number; // unix ms or elapsed seconds
  elapsedSeconds: number;
  distanceMeters: number;
  speedMps: number;
  paceSecPerKm: number;
  heartRate?: number | null;
  cadence?: number | null;
  elevationMeters?: number | null;
  powerWatts?: number | null;
  gradeAdjustedSpeedMps?: number | null;
  bodyBattery?: number | null;
  verticalOscillationCm?: number | null;
  groundContactTimeMs?: number | null;
  strideLengthM?: number | null;
}

export interface KilometerSplit {
  splitNumber: number;
  distanceMeters: number;
  durationSeconds: number;
  paceSecPerKm: number;
  avgHeartRate?: number;
  elevationDiffMeters: number;
  avgCadence?: number;
}

export interface ActivityDetail {
  activityId: string;
  polyline: GeoPoint[];
  metricStream: MetricStreamPoint[];
  splits: KilometerSplit[];
  boundingBox?: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
}
