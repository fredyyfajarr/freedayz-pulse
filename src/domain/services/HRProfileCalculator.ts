import type { Activity } from '../entities/Activity';

export type HRMethod = 'HRR' | 'MAX_HR' | 'LTHR' | 'MANUAL_BPM';

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
  methodType: HRMethod;
  calibrationSource: string;
  restingHr: number;
  maxHr: number;
  heartRateReserve: number;
  estimatedLthr: number;
  zones: HRZoneDefinition[];
  totalTrainingTimeSeconds: number;
  coachingSummary: string;
}

export interface CustomHRSettings {
  method: HRMethod;
  restingHr: number;
  maxHr: number;
  lthr: number;
  hrrPercentages?: { idx: number; minP: number; maxP: number }[];
  maxHrPercentages?: { idx: number; minP: number; maxP: number }[];
  lthrPercentages?: { idx: number; minP: number; maxP: number }[];
  zonePercentages?: { idx: number; minP: number; maxP: number }[];
  manualZoneBpms?: { idx: number; minBpm: number; maxBpm: number }[];
}

export const STORAGE_HR_SETTINGS_KEY = 'fdz_athlete_hr_settings_v1';

export class HRProfileCalculator {
  // Default %HRR configuration
  public static readonly DEFAULT_HRR_ZONES = [
    { idx: 1, name: 'Warm Up', code: 'ZONE_01', minP: 50, maxP: 62.5, minBpm: 126, maxBpm: 144, role: 'Warm-up, recovery & active cool-down. Metabolic flush.', fuel: 'Primary: Fat (80%), Glycogen (20%)', color: 'text-white bg-slate-500' },
    { idx: 2, name: 'Easy', code: 'ZONE_02', minP: 62.5, maxP: 74.5, minBpm: 145, maxBpm: 162, role: 'Aerobic base building, mitochondrial density & fat oxidation peak.', fuel: 'Primary: Fat (65%), Glycogen (35%)', color: 'text-emerald-400 bg-emerald-500' },
    { idx: 3, name: 'Aerobic', code: 'ZONE_03', minP: 74.5, maxP: 84, minBpm: 163, maxBpm: 176, role: 'Cardiovascular endurance flow, steady-state tempo pace.', fuel: 'Balanced: Glycogen (50%), Fat (50%)', color: 'text-cyan-400 bg-cyan-500' },
    { idx: 4, name: 'Threshold', code: 'ZONE_04', minP: 84, maxP: 92, minBpm: 177, maxBpm: 188, role: 'Lactate threshold clearance, race stamina & sub-max power.', fuel: 'Primary: Glycogen (80%), Lactate turnover', color: 'text-amber-400 bg-amber-500' },
    { idx: 5, name: 'Maximum', code: 'ZONE_05', minP: 92, maxP: 100, minBpm: 189, maxBpm: 201, role: 'Anaerobic capacity, sprint finish, peak VO2 max intervals.', fuel: 'Anaerobic Glycolysis (95%)', color: 'text-rose-400 bg-rose-500' },
  ];

  // Default % Max HR configuration
  public static readonly DEFAULT_MAXHR_ZONES = [
    { idx: 1, name: 'Warm Up', code: 'ZONE_01', minP: 50, maxP: 60, minBpm: 101, maxBpm: 121, role: 'Recovery & active cool-down.', fuel: 'Fat (85%)', color: 'text-white bg-slate-500' },
    { idx: 2, name: 'Easy', code: 'ZONE_02', minP: 60, maxP: 70, minBpm: 121, maxBpm: 141, role: 'Basic aerobic endurance.', fuel: 'Fat (70%)', color: 'text-emerald-400 bg-emerald-500' },
    { idx: 3, name: 'Aerobic', code: 'ZONE_03', minP: 70, maxP: 80, minBpm: 141, maxBpm: 161, role: 'Cardiovascular aerobic tempo.', fuel: 'Fat / Carb (50/50)', color: 'text-cyan-400 bg-cyan-500' },
    { idx: 4, name: 'Threshold', code: 'ZONE_04', minP: 80, maxP: 90, minBpm: 161, maxBpm: 181, role: 'Lactate threshold & race stamina.', fuel: 'Glycogen (80%)', color: 'text-amber-400 bg-amber-500' },
    { idx: 5, name: 'Maximum', code: 'ZONE_05', minP: 90, maxP: 100, minBpm: 181, maxBpm: 201, role: 'Anaerobic sprint & power.', fuel: 'Glycogen (95%)', color: 'text-rose-400 bg-rose-500' },
  ];

  // Default % LTHR configuration (Joe Friel Running Zones)
  public static readonly DEFAULT_LTHR_ZONES = [
    { idx: 1, name: 'Warm Up', code: 'ZONE_01', minP: 65, maxP: 85, minBpm: 115, maxBpm: 150, role: 'Active recovery below aerobic threshold.', fuel: 'Fat (80%)', color: 'text-white bg-slate-500' },
    { idx: 2, name: 'Easy', code: 'ZONE_02', minP: 85, maxP: 89, minBpm: 150, maxBpm: 158, role: 'Aerobic endurance base development.', fuel: 'Fat (65%)', color: 'text-emerald-400 bg-emerald-500' },
    { idx: 3, name: 'Aerobic', code: 'ZONE_03', minP: 90, maxP: 94, minBpm: 159, maxBpm: 166, role: 'Tempo & steady-state endurance.', fuel: 'Balanced (50/50)', color: 'text-cyan-400 bg-cyan-500' },
    { idx: 4, name: 'Threshold', code: 'ZONE_04', minP: 95, maxP: 99, minBpm: 168, maxBpm: 175, role: 'Sub-threshold & lactate clearance zone.', fuel: 'Glycogen (80%)', color: 'text-amber-400 bg-amber-500' },
    { idx: 5, name: 'Maximum', code: 'ZONE_05', minP: 100, maxP: 114, minBpm: 177, maxBpm: 201, role: 'Supra-threshold, 5K race pace & VO2max.', fuel: 'Anaerobic (95%)', color: 'text-rose-400 bg-rose-500' },
  ];

  public static getFallbackSettings(restingHr = 51, maxHr = 201): CustomHRSettings {
    return {
      method: 'HRR',
      restingHr,
      maxHr,
      lthr: Math.round(maxHr * 0.88) || 177,
      hrrPercentages: this.DEFAULT_HRR_ZONES.map(z => ({ idx: z.idx, minP: z.minP, maxP: z.maxP })),
      maxHrPercentages: this.DEFAULT_MAXHR_ZONES.map(z => ({ idx: z.idx, minP: z.minP, maxP: z.maxP })),
      lthrPercentages: this.DEFAULT_LTHR_ZONES.map(z => ({ idx: z.idx, minP: z.minP, maxP: z.maxP })),
      zonePercentages: this.DEFAULT_HRR_ZONES.map(z => ({ idx: z.idx, minP: z.minP, maxP: z.maxP })),
      manualZoneBpms: this.DEFAULT_MAXHR_ZONES.map(z => ({ 
        idx: z.idx, 
        minBpm: Math.round(maxHr * (z.minP / 100)), 
        maxBpm: z.idx === 5 ? maxHr : Math.round(maxHr * (z.maxP / 100)) 
      })),
    };
  }

  public static getStoredSettings(): CustomHRSettings {
    const fallback = this.getFallbackSettings();

    if (typeof window === 'undefined') return fallback;

    try {
      const stored = localStorage.getItem(STORAGE_HR_SETTINGS_KEY);
      if (!stored) return fallback;
      const parsed = { ...fallback, ...JSON.parse(stored) };
      if (parsed.manualZoneBpms && parsed.maxHr) {
        parsed.manualZoneBpms = parsed.manualZoneBpms.map((z: any) => 
          z.idx === 5 ? { ...z, maxBpm: parsed.maxHr } : z
        );
      }
      return parsed;
    } catch {
      return fallback;
    }
  }

  public static saveStoredSettings(settings: CustomHRSettings): void {
    if (typeof window === 'undefined') return;
    try {
      const toSave = { ...settings };
      if (toSave.manualZoneBpms && toSave.maxHr) {
        toSave.manualZoneBpms = toSave.manualZoneBpms.map(z => 
          z.idx === 5 ? { ...z, maxBpm: toSave.maxHr } : z
        );
      }
      localStorage.setItem(STORAGE_HR_SETTINGS_KEY, JSON.stringify(toSave));
      window.dispatchEvent(new Event('athlete_hr_settings_updated'));
    } catch {}
  }

  public static calculateProfile(
    activities: Activity[],
    restingHr?: number,
    maxHr?: number,
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
    },
    explicitSettings?: CustomHRSettings
  ): AthleteHRProfile {
    const activeSettings = explicitSettings || this.getStoredSettings();

    const effectiveResting = restingHr ?? activeSettings.restingHr ?? 51;
    let effectiveMaxHr = maxHr ?? activeSettings.maxHr ?? 201;
    const effectiveLthr = activeSettings.lthr || Math.round(effectiveMaxHr * 0.88) || 177;

    // Peak auto-detection from Garmin session telemetry
    if (activities && activities.length > 0) {
      const peakLogged = Math.max(...activities.map(a => a.maxHeartRate || 0));
      if (peakLogged > effectiveMaxHr) {
        effectiveMaxHr = peakLogged;
      }
    }

    const hrr = Math.max(20, effectiveMaxHr - effectiveResting);
    const method = activeSettings.method || 'HRR';

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

    // Base template depending on method
    const baseTemplate = method === 'MAX_HR' || method === 'MANUAL_BPM'
      ? this.DEFAULT_MAXHR_ZONES
      : method === 'LTHR'
      ? this.DEFAULT_LTHR_ZONES
      : this.DEFAULT_HRR_ZONES;

    const zones: HRZoneDefinition[] = baseTemplate.map(defaultCfg => {
      let minP = defaultCfg.minP;
      let maxP = defaultCfg.maxP;

      let methodPcts: { idx: number; minP: number; maxP: number }[] | undefined;
      if (method === 'LTHR') {
        methodPcts = activeSettings.lthrPercentages;
        if (!methodPcts && activeSettings.zonePercentages && activeSettings.zonePercentages[0]?.minP >= 60) {
          methodPcts = activeSettings.zonePercentages;
        }
      } else if (method === 'MAX_HR') {
        methodPcts = activeSettings.maxHrPercentages;
        if (!methodPcts && activeSettings.zonePercentages && activeSettings.zonePercentages[0]?.maxP <= 65) {
          methodPcts = activeSettings.zonePercentages;
        }
      } else if (method === 'HRR') {
        methodPcts = activeSettings.hrrPercentages || activeSettings.zonePercentages;
      }

      const userPct = methodPcts?.find(b => b.idx === defaultCfg.idx) 
        || customBrackets?.find(b => b.idx === defaultCfg.idx);
      if (userPct) {
        minP = userPct.minP;
        maxP = userPct.maxP;
      } else if (method === 'LTHR' && defaultCfg.idx === 5) {
        const lthrMaxP = Math.round((effectiveMaxHr / effectiveLthr) * 100);
        maxP = Math.max(106, lthrMaxP);
      }

      let minBpm = 0;
      let maxBpm = 0;

      if (method === 'MANUAL_BPM') {
        const manual = activeSettings.manualZoneBpms?.find(m => m.idx === defaultCfg.idx);
        const fallbackMin = Math.round(effectiveMaxHr * (defaultCfg.minP / 100));
        const fallbackMax = defaultCfg.idx === 5 ? effectiveMaxHr : Math.round(effectiveMaxHr * (defaultCfg.maxP / 100));
        minBpm = manual?.minBpm ?? fallbackMin;
        maxBpm = defaultCfg.idx === 5 ? effectiveMaxHr : (manual?.maxBpm ?? fallbackMax);
      } else if (method === 'MAX_HR') {
        minBpm = Math.round(effectiveMaxHr * (minP / 100));
        maxBpm = defaultCfg.idx === 5 ? effectiveMaxHr : Math.round(effectiveMaxHr * (maxP / 100));
      } else if (method === 'LTHR') {
        minBpm = Math.round(effectiveLthr * (minP / 100));
        maxBpm = defaultCfg.idx === 5 ? effectiveMaxHr : Math.round(effectiveLthr * (maxP / 100));
      } else {
        // HRR (Karvonen) Target = Resting + HRR * %
        minBpm = Math.round(effectiveResting + hrr * (minP / 100));
        maxBpm = defaultCfg.idx === 5 ? effectiveMaxHr : Math.round(effectiveResting + hrr * (maxP / 100));
      }

      // Allow override from customBpmThresholds if passed
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
          maxBpm = effectiveMaxHr;
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

    const z2Pct = zones[1]?.totalPercentOfTraining || 0;
    const z3Pct = zones[2]?.totalPercentOfTraining || 0;
    const z4Pct = zones[3]?.totalPercentOfTraining || 0;
    const z2Min = zones[1]?.minBpm || 145;
    const z2Max = zones[1]?.maxBpm || 162;

    let coachingSummary = '';
    if (z2Pct >= 45) {
      coachingSummary = `Outstanding aerobic base foundation. Excellent adherence to easy Zone 2 mileage (${z2Min} - ${z2Max} BPM).`;
    } else if (z3Pct + z4Pct >= 50) {
      coachingSummary = `High tempo and threshold training volume. Your speed endurance is strong. To build maximum aerobic stamina for race day, keep recovery and easy runs strictly between ${z2Min} - ${z2Max} BPM (Zone 2 Easy).`;
    } else {
      coachingSummary = 'Well-distributed physiological training load across all cardiovascular zones.';
    }

    let methodLabel = '%HRR (KARVONEN)';
    if (method === 'MAX_HR') methodLabel = '% DETAK JANTUNG MAKSIMAL (MAX HR)';
    else if (method === 'LTHR') methodLabel = '% AMBANG LAKTAT (JOE FRIEL LTHR)';
    else if (method === 'MANUAL_BPM') methodLabel = 'MANUAL BPM (KUSTOM ATLET)';

    return {
      method: methodLabel,
      methodType: method,
      calibrationSource: 'Kalibrasi Dinamis Pelari (Garmin Connect / Kustom Atlet)',
      restingHr: effectiveResting,
      maxHr: effectiveMaxHr,
      heartRateReserve: hrr,
      estimatedLthr: effectiveLthr,
      zones,
      totalTrainingTimeSeconds: totalZoneSeconds,
      coachingSummary,
    };
  }
}
