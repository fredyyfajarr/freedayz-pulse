import fs from 'fs';
import path from 'path';
import {
  AthleteBiometricSettings,
  CustomHRZoneThresholds,
  DEFAULT_CUSTOM_ZONES,
} from '@/domain/entities/AthleteSettings';

export type { AthleteBiometricSettings, CustomHRZoneThresholds };
export { DEFAULT_CUSTOM_ZONES };

const DEFAULT_SETTINGS: AthleteBiometricSettings = {
  maxHr: 200,
  restingHr: 51,
  dailySleepScores: {
    '2026-10-26': 67,
  },
  customZones: DEFAULT_CUSTOM_ZONES,
  lastUpdated: new Date().toISOString(),
};

export class AthleteSettingsManager {
  private static filePath = path.join(process.cwd(), 'data', 'athlete-settings.json');

  public static getSettings(): AthleteBiometricSettings {
    try {
      if (!fs.existsSync(this.filePath)) {
        try {
          fs.writeFileSync(this.filePath, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
        } catch {
          // Read-only filesystem safe (e.g. Vercel serverless)
        }
        return DEFAULT_SETTINGS;
      }
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        maxHr: typeof parsed.maxHr === 'number' && parsed.maxHr > 100 && parsed.maxHr < 250 ? parsed.maxHr : 200,
        restingHr: typeof parsed.restingHr === 'number' && parsed.restingHr > 30 && parsed.restingHr < 120 ? parsed.restingHr : 51,
        dailySleepScores: typeof parsed.dailySleepScores === 'object' && parsed.dailySleepScores !== null ? parsed.dailySleepScores : {},
        customZones: parsed.customZones && typeof parsed.customZones.zone2Max === 'number' ? parsed.customZones : DEFAULT_CUSTOM_ZONES,
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
    } catch (e) {
      console.warn('Could not read athlete-settings.json, using defaults:', e);
      return DEFAULT_SETTINGS;
    }
  }

  public static getSleepScoreForDate(dateStr: string): number | null {
    const settings = this.getSettings();
    if (settings.dailySleepScores && typeof settings.dailySleepScores[dateStr] === 'number') {
      return settings.dailySleepScores[dateStr];
    }
    return null;
  }

  public static updateSettings(newSettings: Partial<AthleteBiometricSettings>): AthleteBiometricSettings {
    const current = this.getSettings();
    const updated: AthleteBiometricSettings = {
      maxHr: newSettings.maxHr && newSettings.maxHr > 100 && newSettings.maxHr < 250 ? Math.round(newSettings.maxHr) : current.maxHr,
      restingHr: newSettings.restingHr && newSettings.restingHr > 30 && newSettings.restingHr < 120 ? Math.round(newSettings.restingHr) : current.restingHr,
      dailySleepScores: newSettings.dailySleepScores !== undefined ? { ...current.dailySleepScores, ...newSettings.dailySleepScores } : current.dailySleepScores,
      customZones: newSettings.customZones ? { ...(current.customZones || DEFAULT_CUSTOM_ZONES), ...newSettings.customZones } : (current.customZones || DEFAULT_CUSTOM_ZONES),
      lastUpdated: new Date().toISOString(),
    };

    try {
      fs.writeFileSync(this.filePath, JSON.stringify(updated, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write athlete-settings.json:', e);
    }

    return updated;
  }
}
