import { HRZoneBreakdown } from '../entities/Activity';

export class TRIMPCalculator {
  /**
   * Calculates Relative Effort / Training Impulse using Heart Rate Zones time.
   * Exponentially weighted heart rate distribution.
   * Zone weights reflect exponential glycogen consumption and physiological strain:
   * - Zone 1 (Recovery): 1.0x
   * - Zone 2 (Aerobic Base): 1.5x
   * - Zone 3 (Tempo): 2.4x
   * - Zone 4 (Threshold): 3.6x
   * - Zone 5 (Anaerobic / Max): 5.2x
   */
  public static calculateFromZones(zones: HRZoneBreakdown): number {
    const z1Mins = (zones.zone1Seconds || 0) / 60;
    const z2Mins = (zones.zone2Seconds || 0) / 60;
    const z3Mins = (zones.zone3Seconds || 0) / 60;
    const z4Mins = (zones.zone4Seconds || 0) / 60;
    const z5Mins = (zones.zone5Seconds || 0) / 60;

    const rawScore = 
      (z1Mins * 1.0) +
      (z2Mins * 1.5) +
      (z3Mins * 2.4) +
      (z4Mins * 3.6) +
      (z5Mins * 5.2);

    return Math.round(rawScore);
  }

  /**
   * Fallback Banister formula when only average heart rate is available
   */
  public static calculateFromAvgHR(
    durationSeconds: number,
    avgHR: number,
    maxHR: number = 190,
    restHR: number = 55,
    gender: 'male' | 'female' = 'male'
  ): number {
    if (!durationSeconds || durationSeconds <= 0 || !avgHR || avgHR <= restHR) {
      return 0;
    }

    const durationMinutes = durationSeconds / 60;
    const hrReserveRatio = Math.max(0, Math.min(1, (avgHR - restHR) / (maxHR - restHR)));
    
    // Banister male exponent factor 1.92, female 1.67
    const factor = gender === 'male' ? 1.92 : 1.67;
    const trimp = durationMinutes * hrReserveRatio * 0.64 * Math.exp(factor * hrReserveRatio);

    return Math.round(trimp);
  }
}
