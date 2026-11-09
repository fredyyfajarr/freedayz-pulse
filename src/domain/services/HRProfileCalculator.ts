import { Activity } from '../entities/Activity';

export interface HRZoneDefinition {
  zoneIndex: number;
  name: string;
  code: string;
  minPercent: number;
  maxPercent: number;
  minBpm: number;
  maxBpm: number;
  physiologicalRole: string;
  fuelSource: string;
  color: string;
  totalTimeSeconds: number;
  totalPercentOfTraining: number;
}

export interface AthleteHRProfile {
  method: string;
  calibrationSource: string;
  restingHr: number;
  maxHr: number;
  heartRateReserve: number;
  estimatedLthr: number;
  zones: HRZoneDefinition[];
  totalTrainingTimeSeconds: number;
  coachingSummary: string;
}

export class HRProfileCalculator {
  // Exact user-calibrated %HRR brackets from user's Garmin Connect app
  public static readonly DEFAULT_ZONES_CONFIG = [
    {
      idx: 1,
      name: 'Warm Up',
      code: 'ZONE_01',
      minP: 50,
      maxP: 62.5,
      minBpm: 126,
      maxBpm: 144,
      role: 'Warm-up, recovery & active cool-down. Metabolic flush.',
      fuel: 'Primary: Fat (80%), Glycogen (20%)',
      color: 'text-slate-300 bg-slate-400',
    },
    {
      idx: 2,
      name: 'Easy',
      code: 'ZONE_02',
      minP: 62.5,
      maxP: 74.5,
      minBpm: 145,
      maxBpm: 162, // Exact Garmin Forerunner 165 calibration (162 max)
      role: 'Aerobic base building, mitochondrial density & fat oxidation peak.',
      fuel: 'Primary: Fat (65%), Glycogen (35%)',
      color: 'text-emerald-400 bg-emerald-500',
    },
    {
      idx: 3,
      name: 'Aerobic',
      code: 'ZONE_03',
      minP: 74.5,
      maxP: 84,
      minBpm: 163,
      maxBpm: 176,
      role: 'Cardiovascular endurance flow, steady-state tempo pace.',
      fuel: 'Balanced: Glycogen (50%), Fat (50%)',
      color: 'text-cyan-400 bg-cyan-500',
    },
    {
      idx: 4,
      name: 'Threshold',
      code: 'ZONE_04',
      minP: 84,
      maxP: 92,
      minBpm: 177,
      maxBpm: 188,
      role: 'Lactate threshold clearance, race stamina & sub-max power.',
      fuel: 'Primary: Glycogen (80%), Lactate turnover',
      color: 'text-amber-400 bg-amber-500',
    },
    {
      idx: 5,
      name: 'Maximum',
      code: 'ZONE_05',
      minP: 92,
      maxP: 100,
      minBpm: 189,
      maxBpm: 200,
      role: 'Anaerobic capacity, sprint finish, peak VO2 max intervals.',
      fuel: 'Anaerobic Glycolysis (95%)',
      color: 'text-rose-400 bg-rose-500',
    },
  ];

  public static calculateProfile(
    activities: Activity[],
    restingHr: number = 51,
    maxHr: number = 200,
    customBrackets?: { idx: number; minP: number; maxP: number }[],
    customBpmThresholds?: {
      zone1Min?: number;
      zone1Max?: number;
      zone2Min?: number;
      zone2Max?: number;
      zone3Min?: number;
      zone3Max?: number;
      zone4Min?: number;
      zone4Max?: number;
      zone5Min?: number;
      zone5Max?: number;
    }
  ): AthleteHRProfile {
    const effectiveResting = restingHr;
    let effectiveMaxHr = maxHr;

    // Peak auto-detection from Garmin session telemetry
    if (activities && activities.length > 0) {
      const peakLogged = Math.max(...activities.map(a => a.maxHeartRate || 0));
      if (peakLogged > effectiveMaxHr) {
        effectiveMaxHr = peakLogged;
      }
    }

    const hrr = effectiveMaxHr - effectiveResting;
    const brackets = customBrackets || this.DEFAULT_ZONES_CONFIG;

    // Compute cumulative seconds in each zone across user's activities
    let totalZ1 = 0;
    let totalZ2 = 0;
    let totalZ3 = 0;
    let totalZ4 = 0;
    let totalZ5 = 0;

    for (const a of activities) {
      if (a.hrZones) {
        totalZ1 += a.hrZones.zone1Seconds || 0;
        totalZ2 += a.hrZones.zone2Seconds || 0;
        totalZ3 += a.hrZones.zone3Seconds || 0;
        totalZ4 += a.hrZones.zone4Seconds || 0;
        totalZ5 += a.hrZones.zone5Seconds || 0;
      }
    }

    const totalZoneSeconds = totalZ1 + totalZ2 + totalZ3 + totalZ4 + totalZ5 || 1;
    const totalsByIndex: { [key: number]: number } = {
      1: totalZ1,
      2: totalZ2,
      3: totalZ3,
      4: totalZ4,
      5: totalZ5,
    };

    const zones: HRZoneDefinition[] = this.DEFAULT_ZONES_CONFIG.map(defaultCfg => {
      const matchCustom = brackets.find(b => b.idx === defaultCfg.idx);
      const minP = matchCustom ? matchCustom.minP : defaultCfg.minP;
      const maxP = matchCustom ? matchCustom.maxP : defaultCfg.maxP;

      // Exact Karvonen formula calculation: Target = HRrest + (HRR * %intensity)
      // When at default 50 and 195, matches exact user configuration: 126-144, 145-162, 163-176, 177-188, >188
      let minBpm = Math.round(effectiveResting + hrr * (minP / 100));
      let maxBpm = defaultCfg.idx === 5 ? effectiveMaxHr : Math.round(effectiveResting + hrr * (maxP / 100));

      if (customBpmThresholds) {
        if (defaultCfg.idx === 1) {
          if (customBpmThresholds.zone1Min) minBpm = customBpmThresholds.zone1Min;
          if (customBpmThresholds.zone1Max) maxBpm = customBpmThresholds.zone1Max;
        } else if (defaultCfg.idx === 2) {
          if (customBpmThresholds.zone2Min) minBpm = customBpmThresholds.zone2Min;
          if (customBpmThresholds.zone2Max) maxBpm = customBpmThresholds.zone2Max;
        } else if (defaultCfg.idx === 3) {
          if (customBpmThresholds.zone3Min) minBpm = customBpmThresholds.zone3Min;
          if (customBpmThresholds.zone3Max) maxBpm = customBpmThresholds.zone3Max;
        } else if (defaultCfg.idx === 4) {
          if (customBpmThresholds.zone4Min) minBpm = customBpmThresholds.zone4Min;
          if (customBpmThresholds.zone4Max) maxBpm = customBpmThresholds.zone4Max;
        } else if (defaultCfg.idx === 5) {
          if (customBpmThresholds.zone5Min) minBpm = customBpmThresholds.zone5Min;
          if (customBpmThresholds.zone5Max) maxBpm = customBpmThresholds.zone5Max;
        }
      }

      const sec = totalsByIndex[defaultCfg.idx] || 0;
      const pct = Math.round((sec / totalZoneSeconds) * 100);

      return {
        zoneIndex: defaultCfg.idx,
        name: defaultCfg.name,
        code: defaultCfg.code,
        minPercent: minP,
        maxPercent: maxP,
        minBpm,
        maxBpm,
        physiologicalRole: defaultCfg.role,
        fuelSource: defaultCfg.fuel,
        color: defaultCfg.color,
        totalTimeSeconds: sec,
        totalPercentOfTraining: pct,
      };
    });

    // LTHR capacity is approximately Zone 4 bottom (177 bpm)
    const estimatedLthr = zones[3]?.minBpm || 177;

    let coachingSummary = '';
    const z2Pct = zones[1]?.totalPercentOfTraining || 0;
    const z3Pct = zones[2]?.totalPercentOfTraining || 0;
    const z4Pct = zones[3]?.totalPercentOfTraining || 0;
    const z2Min = zones[1]?.minBpm || 145;
    const z2Max = zones[1]?.maxBpm || 162;

    if (z2Pct >= 45) {
      coachingSummary = `Outstanding aerobic base foundation. Excellent adherence to easy Zone 2 mileage (${z2Min} - ${z2Max} BPM).`;
    } else if (z3Pct + z4Pct >= 50) {
      coachingSummary = `High tempo and threshold training volume. Your speed endurance is strong. To build maximum aerobic stamina for race day, keep recovery and easy runs strictly between ${z2Min} - ${z2Max} BPM (Zone 2 Easy).`;
    } else {
      coachingSummary = 'Well-distributed physiological training load across all cardiovascular zones.';
    }

    return {
      method: 'Garmin Forerunner 165 %HRR (Heart Rate Reserve) Calibration',
      calibrationSource: 'Personal Garmin Watch Settings (Gemini Running Coach AI)',
      restingHr: effectiveResting,
      maxHr: effectiveMaxHr,
      heartRateReserve: hrr,
      estimatedLthr,
      zones,
      totalTrainingTimeSeconds: totalZoneSeconds,
      coachingSummary,
    };
  }
}
