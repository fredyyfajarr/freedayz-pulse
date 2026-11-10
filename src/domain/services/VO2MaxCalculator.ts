import { BestEffort } from '../entities/BestEffort';
import { VO2MaxEstimate, TrainingZonePace } from '../entities/GarminHealthMetrics';

export class VO2MaxCalculator {
  /**
   * Jack Daniels VDOT formula:
   * Given velocity in meters per minute (v) and time in minutes (t):
   * VO2 = -4.60 + 0.182258 * v + 0.000104 * v^2
   * %max = 0.8 + 0.1894393 * exp(-0.012778 * t) + 0.2989558 * exp(-0.1932605 * t)
   * VDOT = VO2 / %max
   */
  public static calculateVDOT(distanceMeters: number, timeSeconds: number): number {
    if (distanceMeters <= 0 || timeSeconds <= 0) return 0;

    const t = timeSeconds / 60; // minutes
    const v = distanceMeters / t; // meters per minute

    const vo2 = -4.60 + 0.182258 * v + 0.000104 * Math.pow(v, 2);
    const percentMax =
      0.8 +
      0.1894393 * Math.exp(-0.012778 * t) +
      0.2989558 * Math.exp(-0.1932605 * t);

    if (percentMax <= 0) return 0;
    const vdot = vo2 / percentMax;
    return Math.round(vdot * 10) / 10;
  }

  /**
   * Calculates velocity (m/min) given target VO2 requirement using Jack Daniels quadratic formula
   */
  public static velocityForVO2(vo2: number): number {
    if (vo2 <= 0) return 0;
    // 0.000104 * v^2 + 0.182258 * v - (vo2 + 4.60) = 0
    const a = 0.000104;
    const b = 0.182258;
    const c = -(vo2 + 4.60);
    const discriminant = Math.pow(b, 2) - 4 * a * c;
    if (discriminant < 0) return 0;
    return (-b + Math.sqrt(discriminant)) / (2 * a);
  }

  /**
   * Calculates pace in seconds per km from velocity in meters/min
   */
  public static paceSecForVelocity(v: number): number {
    if (v <= 0) return 0;
    return Math.round(60000 / v);
  }

  /**
   * Calculates standard Jack Daniels 5-Zone Training Paces from VDOT
   */
  public static calculateTrainingPaces(vdot: number): TrainingZonePace[] {
    const validVdot = Math.max(20, Math.min(85, vdot));

    // Zone 1: Easy / Long Slow Distance (62% - 70% VDOT)
    const easyFastV = this.velocityForVO2(validVdot * 0.70);
    const easySlowV = this.velocityForVO2(validVdot * 0.62);
    const easyFastPace = this.paceSecForVelocity(easyFastV);
    const easySlowPace = this.paceSecForVelocity(easySlowV);

    // Zone 2: Marathon Pace (80% VDOT)
    const marathonV = this.velocityForVO2(validVdot * 0.80);
    const marathonPace = this.paceSecForVelocity(marathonV);

    // Zone 3: Threshold / Tempo Pace (88% VDOT)
    const thresholdV = this.velocityForVO2(validVdot * 0.88);
    const thresholdPace = this.paceSecForVelocity(thresholdV);

    // Zone 4: Interval Pace (98% VDOT)
    const intervalV = this.velocityForVO2(validVdot * 0.98);
    const intervalPace = this.paceSecForVelocity(intervalV);

    // Zone 5: Repetition Pace (110% VDOT)
    const repV = this.velocityForVO2(validVdot * 1.10);
    const repPace = this.paceSecForVelocity(repV);

    const fmtPace = (s: number) => {
      const m = Math.floor(s / 60);
      const rem = String(s % 60).padStart(2, '0');
      return `${m}:${rem}`;
    };

    const fmtSplit = (sPerKm: number, meters: number) => {
      const splitSec = Math.round(sPerKm * (meters / 1000));
      const m = Math.floor(splitSec / 60);
      const rem = String(splitSec % 60).padStart(2, '0');
      return m > 0 ? `${m}:${rem}` : `0:${rem}`;
    };

    return [
      {
        zoneKey: 'E',
        name: 'EASY / RECOVERY (E)',
        nameId: 'LARI SANTAI / PEMULIHAN (E)',
        intensityDesc: '62% – 70% VO2Max',
        intensityDescId: '62% – 70% VO2Max',
        purpose: 'Aerobic base building, active recovery, and cardiac capillary density.',
        purposeId: 'Membangun fondasi aerobik, regenerasi seluler, dan kapilarisasi otot jantung.',
        minPaceSecPerKm: easyFastPace,
        maxPaceSecPerKm: easySlowPace,
        paceFormatted: `${fmtPace(easyFastPace)} – ${fmtPace(easySlowPace)} /km`,
        split400m: `${fmtSplit(easyFastPace, 400)} – ${fmtSplit(easySlowPace, 400)}`,
        split1000m: `${fmtPace(easyFastPace)} – ${fmtPace(easySlowPace)}`,
      },
      {
        zoneKey: 'M',
        name: 'MARATHON PACE (M)',
        nameId: 'PACE MARATHON (M)',
        intensityDesc: '~80% VO2Max',
        intensityDescId: '~80% VO2Max',
        purpose: 'Steady-state race simulation, fat-metabolism adaptation for 21K & 42K.',
        purposeId: 'Simulasi ritme balapan, efisiensi pembakaran lemak untuk jarak 21K & 42K.',
        minPaceSecPerKm: marathonPace,
        paceFormatted: `${fmtPace(marathonPace)} /km`,
        split400m: fmtSplit(marathonPace, 400),
        split1000m: fmtPace(marathonPace),
      },
      {
        zoneKey: 'T',
        name: 'THRESHOLD / TEMPO (T)',
        nameId: 'AMBANG LAKTAT / TEMPO (T)',
        intensityDesc: '~88% VO2Max',
        intensityDescId: '~88% VO2Max',
        purpose: 'Elevates lactate clearance threshold; comfortably hard, sustainable for 40–60 min.',
        purposeId: 'Meningkatkan ambang pembuangan asam laktat; intensitas terukur selama 20–50 menit.',
        minPaceSecPerKm: thresholdPace,
        paceFormatted: `${fmtPace(thresholdPace)} /km`,
        split400m: fmtSplit(thresholdPace, 400),
        split1000m: fmtPace(thresholdPace),
      },
      {
        zoneKey: 'I',
        name: 'INTERVAL (I)',
        nameId: 'INTERVAL VO2MAX (I)',
        intensityDesc: '~98% VO2Max',
        intensityDescId: '~98% VO2Max',
        purpose: 'Maximizes aerobic power and oxygen delivery (3–5 min track repetitions).',
        purposeId: 'Memaksimalkan kapasitas serapan oksigen (VO2Max) dengan repetisi track 400m–1200m.',
        minPaceSecPerKm: intervalPace,
        paceFormatted: `${fmtPace(intervalPace)} /km`,
        split400m: fmtSplit(intervalPace, 400),
        split1000m: fmtPace(intervalPace),
      },
      {
        zoneKey: 'R',
        name: 'REPETITION (R)',
        nameId: 'REPETISI KECEPATAN (R)',
        intensityDesc: '~110% VO2Max',
        intensityDescId: '~110% VO2Max',
        purpose: 'Anaerobic power, stride biomechanics, neuromuscular economy and speed.',
        purposeId: 'Kecepatan anaerobik murni, koordinasi neuromuskular, dan mekanika langkah cepat.',
        minPaceSecPerKm: repPace,
        paceFormatted: `${fmtPace(repPace)} /km`,
        split400m: fmtSplit(repPace, 400),
        split1000m: fmtPace(repPace),
      },
    ];
  }

  /**
   * Inverse VDOT to predict race time given distance in meters and target VDOT
   */
  public static predictRaceTime(distanceMeters: number, vdot: number): number {
    if (vdot <= 10 || distanceMeters <= 0) return 0;

    // Binary search for time in seconds that yields this VDOT within 1 second
    let low = 60;
    let high = 40000;
    let bestTime = 0;

    for (let iter = 0; iter < 30; iter++) {
      const mid = (low + high) / 2;
      const calcVdot = this.calculateVDOT(distanceMeters, mid);

      if (Math.abs(calcVdot - vdot) < 0.05) {
        bestTime = mid;
        break;
      }

      if (calcVdot > vdot) {
        // Run took too little time (faster pace), increase time
        low = mid;
      } else {
        // Run took too much time (slower pace), decrease time
        high = mid;
      }
      bestTime = mid;
    }

    return Math.round(bestTime);
  }

  /**
   * Evaluates athlete's VO2Max using Jack Daniels VDOT formula from Best Efforts.
   * Directly matches athlete's actual logged paces and %HRR training zones.
   */
  public static evaluateAthleteVO2Max(bestEfforts: BestEffort[]): VO2MaxEstimate {
    let highestVdot = 0;
    let benchmarkSource = 'Jack Daniels VDOT Formula // Base Aerobic Calibration';

    for (const pr of bestEfforts) {
      const dist = pr.targetMeters || (pr as any).distanceMeters || 0;
      if (dist > 0 && pr.timeSeconds > 0) {
        const vdot = this.calculateVDOT(dist, pr.timeSeconds);
        if (vdot > highestVdot) {
          highestVdot = vdot;
          const mins = Math.floor(pr.timeSeconds / 60);
          const secs = String(pr.timeSeconds % 60).padStart(2, '0');
          benchmarkSource = `Jack Daniels VDOT // Calibrated from ${pr.milestoneName} PR (${mins}:${secs})`;
        }
      }
    }

    // Default fallback if no PRs yet
    if (highestVdot <= 0) {
      highestVdot = 31.0;
      benchmarkSource = 'Jack Daniels VDOT // Base Aerobic Calibration (31.0)';
    }

    let category = 'AEROBIC_DEVELOPING';
    if (highestVdot >= 55) category = 'SUPERIOR';
    else if (highestVdot >= 47) category = 'EXCELLENT';
    else if (highestVdot >= 40) category = 'GOOD';
    else if (highestVdot >= 33) category = 'AEROBIC_FIT';
    else if (highestVdot >= 28) category = 'AEROBIC_PROGRESSION';
    else category = 'AEROBIC_FOUNDATION';

    const distances = [
      { label: '5K RACE', meters: 5000 },
      { label: '10K RACE', meters: 10000 },
      { label: 'HALF MARATHON (21.1K)', meters: 21097 },
      { label: 'MARATHON (42.2K)', meters: 42195 },
    ];

    const racePredictions = distances.map(d => {
      const predTime = this.predictRaceTime(d.meters, highestVdot);
      const paceSec = d.meters > 0 ? Math.round(predTime / (d.meters / 1000)) : 0;
      return {
        distanceLabel: d.label,
        distanceMeters: d.meters,
        predictedTimeSeconds: predTime,
        predictedPaceSecPerKm: paceSec,
      };
    });

    const trainingPaces = this.calculateTrainingPaces(highestVdot);

    return {
      runningVo2Max: highestVdot,
      fitnessCategory: category,
      source: benchmarkSource,
      racePredictions,
      trainingPaces,
    };
  }
}
