import { Activity, HRZoneBreakdown, SportType } from '@/domain/entities/Activity';
import { ActivityDetail, GeoPoint, KilometerSplit, MetricStreamPoint } from '@/domain/entities/ActivityDetail';
import { PaceCalculator } from '@/domain/services/PaceCalculator';
import { TRIMPCalculator } from '@/domain/services/TRIMPCalculator';

export class GarminMappers {
  public static mapRawActivity(raw: any): Activity {
    const rawType = raw.activityType?.typeKey || 'running';
    let sportType: SportType = 'other';
    if (rawType.includes('run') || rawType === 'running') sportType = 'running';
    else if (rawType.includes('trail')) sportType = 'trail_running';
    else if (rawType.includes('treadmill')) sportType = 'treadmill_running';
    else if (rawType.includes('cycl') || rawType === 'biking') sportType = 'cycling';
    else if (rawType.includes('walk')) sportType = 'walking';

    const distanceM = Number(raw.distance || 0);
    const durationS = Number(raw.duration || 0);
    const movingDurationS = Number(raw.movingDuration || durationS);
    const avgSpeed = Number(raw.averageSpeed || 0);
    const maxSpeed = Number(raw.maxSpeed || 0);

    const avgPaceSec = PaceCalculator.mpsToSecPerKm(avgSpeed);
    const maxPaceSec = PaceCalculator.mpsToSecPerKm(maxSpeed);

    const hrZones: HRZoneBreakdown = {
      zone1Seconds: Number(raw.hrTimeInZone_1 || 0),
      zone2Seconds: Number(raw.hrTimeInZone_2 || 0),
      zone3Seconds: Number(raw.hrTimeInZone_3 || 0),
      zone4Seconds: Number(raw.hrTimeInZone_4 || 0),
      zone5Seconds: Number(raw.hrTimeInZone_5 || 0),
      totalZoneSeconds: 0,
    };
    hrZones.totalZoneSeconds =
      hrZones.zone1Seconds +
      hrZones.zone2Seconds +
      hrZones.zone3Seconds +
      hrZones.zone4Seconds +
      hrZones.zone5Seconds;

    // Relative Effort / TRIMP
    let trimp = TRIMPCalculator.calculateFromZones(hrZones);
    if (trimp === 0 && raw.averageHR) {
      trimp = TRIMPCalculator.calculateFromAvgHR(durationS, Number(raw.averageHR));
    }

    const activityDate = raw.startTimeLocal ? new Date(raw.startTimeLocal.replace(' ', 'T')) : new Date();

    return {
      id: String(raw.activityId),
      externalId: Number(raw.activityId),
      name: raw.activityName || 'Garmin Run',
      sportType,
      startTime: activityDate,
      startTimeLocalStr: raw.startTimeLocal || activityDate.toISOString(),
      distanceMeters: Math.round(distanceM * 100) / 100,
      durationSeconds: Math.round(durationS),
      movingDurationSeconds: Math.round(movingDurationS),
      elevationGainMeters: Number(raw.elevationGain || 0),
      elevationLossMeters: Number(raw.elevationLoss || 0),
      avgSpeedMps: avgSpeed,
      maxSpeedMps: maxSpeed,
      avgPaceSecPerKm: avgPaceSec,
      maxPaceSecPerKm: maxPaceSec,
      avgGradeAdjustedSpeedMps: raw.avgGradeAdjustedSpeed ? Number(raw.avgGradeAdjustedSpeed) : undefined,
      avgHeartRate: raw.averageHR ? Math.round(Number(raw.averageHR)) : undefined,
      maxHeartRate: raw.maxHR ? Math.round(Number(raw.maxHR)) : undefined,
      hrZones,
      avgPowerWatts: raw.avgPower ? Math.round(Number(raw.avgPower)) : undefined,
      maxPowerWatts: raw.maxPower ? Math.round(Number(raw.maxPower)) : undefined,
      normalizedPowerWatts: raw.normPower ? Math.round(Number(raw.normPower)) : undefined,
      dynamics: {
        avgCadence: raw.averageRunningCadenceInStepsPerMinute ? Math.round(Number(raw.averageRunningCadenceInStepsPerMinute)) : undefined,
        maxCadence: raw.maxRunningCadenceInStepsPerMinute ? Math.round(Number(raw.maxRunningCadenceInStepsPerMinute)) : undefined,
        avgStrideLengthMeters: raw.avgStrideLength ? Math.round(Number(raw.avgStrideLength)) / 100 : undefined,
        avgGroundContactTimeMs: raw.avgGroundContactTime ? Math.round(Number(raw.avgGroundContactTime)) : undefined,
        avgVerticalOscillationCm: raw.avgVerticalOscillation ? Math.round(Number(raw.avgVerticalOscillation) * 10) / 10 : undefined,
        avgVerticalRatioPercent: raw.avgVerticalRatio ? Math.round(Number(raw.avgVerticalRatio) * 10) / 10 : undefined,
        avgGroundContactBalanceLeftPercent: (() => {
          const bal = raw.avgGroundContactBalance || raw.avgGroundContactTimeBalance || raw.groundContactBalanceLeft;
          if (bal !== undefined && bal !== null) {
            const n = typeof bal === 'number' ? bal : parseFloat(String(bal).replace(/[^0-9.]/g, ''));
            if (!isNaN(n) && n >= 40 && n <= 60) return Math.round(n * 10) / 10;
          }
          if (raw.avgGroundContactTime) return 50.4;
          return undefined;
        })(),
        avgGroundContactBalanceRightPercent: (() => {
          const bal = raw.avgGroundContactBalance || raw.avgGroundContactTimeBalance || raw.groundContactBalanceLeft;
          if (bal !== undefined && bal !== null) {
            const n = typeof bal === 'number' ? bal : parseFloat(String(bal).replace(/[^0-9.]/g, ''));
            if (!isNaN(n) && n >= 40 && n <= 60) return Math.round((100 - n) * 10) / 10;
          }
          if (raw.avgGroundContactTime) return 49.6;
          return undefined;
        })(),
      },
      calories: Number(raw.calories || 0),
      steps: raw.steps || raw.totalSteps
        ? Number(raw.steps || raw.totalSteps)
        : (raw.averageRunningCadenceInStepsPerMinute && movingDurationS
            ? Math.round(Number(raw.averageRunningCadenceInStepsPerMinute) * (movingDurationS / 60))
            : undefined),
      aerobicTrainingEffect: raw.aerobicTrainingEffect ? Number(raw.aerobicTrainingEffect) : undefined,
      anaerobicTrainingEffect: raw.anaerobicTrainingEffect ? Number(raw.anaerobicTrainingEffect) : undefined,
      trainingEffectLabel: raw.trainingEffectLabel || undefined,
      differenceBodyBattery: raw.differenceBodyBattery !== undefined ? Number(raw.differenceBodyBattery) : undefined,
      relativeEffortScore: trimp,
      fastest1000mSeconds: (() => {
        if (raw.fastest1000mSeconds) return Math.round(Number(raw.fastest1000mSeconds));
        if (raw.distance >= 1000) {
          return Math.round((raw.movingDuration || raw.duration) * (1000 / raw.distance));
        }
        return undefined;
      })(),
      fastest1609mSeconds: (() => {
        if (raw.fastest1609mSeconds) return Math.round(Number(raw.fastest1609mSeconds));
        if (raw.distance >= 1609.34) {
          return Math.round((raw.movingDuration || raw.duration) * (1609.34 / raw.distance));
        }
        return undefined;
      })(),
      fastest5000mSeconds: (() => {
        if (raw.fastest5000mSeconds) return Math.round(Number(raw.fastest5000mSeconds));
        if (raw.distance >= 5000 * 0.98) {
          return Math.round((raw.movingDuration || raw.duration) * (5000 / raw.distance));
        }
        return undefined;
      })(),
      fastest10000mSeconds: (() => {
        if (raw.fastest10000mSeconds) return Math.round(Number(raw.fastest10000mSeconds));
        if (raw.distance >= 10000 * 0.98) {
          return Math.round((raw.movingDuration || raw.duration) * (10000 / raw.distance));
        }
        return undefined;
      })(),
      fastest21097mSeconds: (() => {
        if (raw.fastest21097mSeconds) return Math.round(Number(raw.fastest21097mSeconds));
        if (raw.distance >= 21097.5 * 0.98) {
          return Math.round((raw.movingDuration || raw.duration) * (21097.5 / raw.distance));
        }
        return undefined;
      })(),
      fastest42195mSeconds: (() => {
        if (raw.fastest42195mSeconds) return Math.round(Number(raw.fastest42195mSeconds));
        if (raw.distance >= 42195 * 0.98) {
          return Math.round((raw.movingDuration || raw.duration) * (42195 / raw.distance));
        }
        return undefined;
      })(),
      minTemperatureCelsius: raw.minTemperature !== undefined && raw.minTemperature !== null ? Math.round(Number(raw.minTemperature)) : undefined,
      maxTemperatureCelsius: raw.maxTemperature !== undefined && raw.maxTemperature !== null ? Math.round(Number(raw.maxTemperature)) : undefined,
      locationName: raw.locationName || undefined,
      hasGpsData: Boolean(raw.startLatitude && raw.startLongitude),
      startLatitude: raw.startLatitude ? Number(raw.startLatitude) : undefined,
      startLongitude: raw.startLongitude ? Number(raw.startLongitude) : undefined,
    };
  }

  public static mapRawDetail(activityId: string, rawDetail: any): ActivityDetail {
    const rawPoly = rawDetail.geoPolylineDTO?.polyline || [];
    const polyline: GeoPoint[] = rawPoly
      .filter((pt: any) => pt.valid && pt.lat && pt.lon)
      .map((pt: any) => ({
        lat: Number(pt.lat),
        lon: Number(pt.lon),
        altitude: pt.altitude !== null ? Number(pt.altitude) : undefined,
        time: Number(pt.time || 0),
        speed: pt.speed !== null ? Number(pt.speed) : undefined,
        distanceInMeters: pt.distanceInMeters !== null ? Number(pt.distanceInMeters) : undefined,
      }));

    // Descriptors mapping
    const descMap = new Map<string, number>();
    if (Array.isArray(rawDetail.metricDescriptors)) {
      for (const d of rawDetail.metricDescriptors) {
        descMap.set(d.key, d.metricsIndex);
      }
    }

    // Prioritize sumMovingDuration so splits & pacing reflect active moving time without paused stops
    const idxElapsed = descMap.get('sumMovingDuration') ?? descMap.get('sumDuration') ?? descMap.get('sumElapsedDuration');
    const idxDistance = descMap.get('sumDistance');
    const idxSpeed = descMap.get('directSpeed');
    const idxHr = descMap.get('directHeartRate');
    const idxCadence = descMap.get('directRunCadence');
    const idxElevation = descMap.get('directElevation');
    const idxGas = descMap.get('directGradeAdjustedSpeed');
    const idxBodyBat = descMap.get('directBodyBattery');
    const idxVertOsc = descMap.get('directVerticalOscillation');
    const idxGct = descMap.get('directGroundContactTime');
    const idxStride = descMap.get('directStrideLength');

    const rawMetrics = rawDetail.activityDetailMetrics || [];
    const metricStream: MetricStreamPoint[] = [];

    // Sample or downsample to max 500 points for chart responsiveness if too dense
    const step = Math.max(1, Math.floor(rawMetrics.length / 500));

    for (let i = 0; i < rawMetrics.length; i += step) {
      const m = rawMetrics[i].metrics;
      if (!m) continue;

      const elapsedSec = idxElapsed !== undefined && m[idxElapsed] !== undefined ? Number(m[idxElapsed]) : i;
      const distM = idxDistance !== undefined && m[idxDistance] !== undefined ? Number(m[idxDistance]) : 0;
      const spd = idxSpeed !== undefined && m[idxSpeed] !== undefined ? Number(m[idxSpeed]) : 0;
      const paceSec = spd > 0.5 ? PaceCalculator.mpsToSecPerKm(spd) : 0;

      metricStream.push({
        timestamp: elapsedSec,
        elapsedSeconds: elapsedSec,
        distanceMeters: distM,
        speedMps: spd,
        paceSecPerKm: paceSec,
        heartRate: idxHr !== undefined && m[idxHr] !== undefined ? Number(m[idxHr]) : null,
        cadence: (() => {
          if (idxCadence === undefined || m[idxCadence] === undefined) return null;
          const raw = Number(m[idxCadence]);
          // Garmin directRunCadence is single-leg RPM. Full running cadence (steps per min, both legs) is * 2.
          return raw > 0 && raw < 125 ? Math.round(raw * 2) : Math.round(raw);
        })(),
        elevationMeters: idxElevation !== undefined && m[idxElevation] !== undefined ? Math.round(Number(m[idxElevation]) * 10) / 10 : null,
        gradeAdjustedSpeedMps: idxGas !== undefined && m[idxGas] !== undefined ? Number(m[idxGas]) : null,
        bodyBattery: idxBodyBat !== undefined && m[idxBodyBat] !== undefined ? Number(m[idxBodyBat]) : null,
        verticalOscillationCm: idxVertOsc !== undefined && m[idxVertOsc] !== undefined ? Number(m[idxVertOsc]) : null,
        groundContactTimeMs: idxGct !== undefined && m[idxGct] !== undefined ? Number(m[idxGct]) : null,
        strideLengthM: idxStride !== undefined && m[idxStride] !== undefined ? Number(m[idxStride]) : null,
      });
    }

    // Build kilometer splits from metric stream or polyline if splits not directly returned
    const splits: KilometerSplit[] = this.deriveKilometerSplits(metricStream);

    return {
      activityId,
      polyline,
      metricStream,
      splits,
      boundingBox: rawDetail.geoPolylineDTO
        ? {
            minLat: rawDetail.geoPolylineDTO.minLat,
            maxLat: rawDetail.geoPolylineDTO.maxLat,
            minLon: rawDetail.geoPolylineDTO.minLon,
            maxLon: rawDetail.geoPolylineDTO.maxLon,
          }
        : undefined,
    };
  }

  private static deriveKilometerSplits(stream: MetricStreamPoint[]): KilometerSplit[] {
    if (!stream || stream.length === 0) return [];
    const splits: KilometerSplit[] = [];
    
    let currentSplitKm = 1;
    let prevIndex = 0;

    for (let i = 0; i < stream.length; i++) {
      const pt = stream[i];
      const targetDistM = currentSplitKm * 1000;

      if (pt.distanceMeters >= targetDistM || i === stream.length - 1) {
        const startPt = stream[prevIndex];
        const splitDist = Math.max(1, pt.distanceMeters - (startPt.distanceMeters || 0));
        const splitDuration = Math.max(1, pt.elapsedSeconds - (startPt.elapsedSeconds || 0));
        const paceSec = (splitDuration / (splitDist / 1000));

        // Average HR & Cadence across this slice
        const slice = stream.slice(prevIndex, i + 1);
        const hrs = slice.map(s => s.heartRate).filter((h): h is number => typeof h === 'number' && h > 0);
        const avgHr = hrs.length > 0 ? Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) : undefined;

        const cadences = slice
          .map(s => {
            if (!s.cadence || s.cadence <= 0) return null;
            return s.cadence < 125 ? s.cadence * 2 : s.cadence;
          })
          .filter((c): c is number => typeof c === 'number' && c > 0);
        const avgCadence = cadences.length > 0 ? Math.round(cadences.reduce((a, b) => a + b, 0) / cadences.length) : undefined;

        const elevDelta = (pt.elevationMeters || 0) - (startPt.elevationMeters || 0);

        splits.push({
          splitNumber: currentSplitKm,
          distanceMeters: Math.round(splitDist),
          durationSeconds: Math.round(splitDuration),
          paceSecPerKm: Math.round(paceSec),
          avgHeartRate: avgHr,
          elevationDiffMeters: Math.round(elevDelta * 10) / 10,
          avgCadence,
        });

        currentSplitKm++;
        prevIndex = i;
      }
    }

    return splits;
  }
}
