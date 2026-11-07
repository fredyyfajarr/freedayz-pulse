import fs from 'fs/promises';
import path from 'path';
import { Activity } from '@/domain/entities/Activity';
import { ActivityDetail } from '@/domain/entities/ActivityDetail';
import { BestEffort } from '@/domain/entities/BestEffort';
import { IActivityRepository } from '@/domain/repositories/IActivityRepository';
import { GarminMappers } from '@/infrastructure/garmin/GarminMappers';

export class LocalFileActivityRepository implements IActivityRepository {
  private dataDir: string;
  private activitiesFile: string;
  private detailsDir: string;
  private prsFile: string;
  private syncFile: string;

  constructor(customDataDir?: string) {
    this.dataDir = customDataDir || path.join(process.cwd(), 'data');
    this.activitiesFile = path.join(this.dataDir, 'activities.json');
    this.detailsDir = path.join(this.dataDir, 'details');
    this.prsFile = path.join(this.dataDir, 'best-efforts.json');
    this.syncFile = path.join(this.dataDir, 'sync-state.json');
  }

  private async ensureDirs(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(this.detailsDir, { recursive: true });
    } catch (err) {
      // Safe fallback on read-only environments like Vercel serverless
    }
  }

  public async getAllActivities(): Promise<Activity[]> {
    await this.ensureDirs();
    try {
      const data = await fs.readFile(this.activitiesFile, 'utf-8');
      const list: any[] = JSON.parse(data);
      return list.map(item => ({
        ...item,
        startTime: new Date(item.startTime),
      }));
    } catch (err: any) {
      if (err.code === 'ENOENT') return [];
      console.error('Error reading activities cache:', err);
      return [];
    }
  }

  public async getActivityById(id: string): Promise<Activity | null> {
    const list = await this.getAllActivities();
    return list.find(a => a.id === id) || null;
  }

  public async getActivityDetail(id: string): Promise<ActivityDetail | null> {
    await this.ensureDirs();
    const filePath = path.join(this.detailsDir, `${id}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (!parsed.metricStream && parsed.activityDetailMetrics) {
        const mapped = GarminMappers.mapRawDetail(id, parsed);
        await fs.writeFile(filePath, JSON.stringify(mapped, null, 2), 'utf-8');
        return mapped;
      }
      return parsed;
    } catch (err: any) {
      if (err.code === 'ENOENT') return null;
      console.error(`Error reading activity detail for ${id}:`, err);
      return null;
    }
  }

  public async saveActivities(newActivities: Activity[]): Promise<void> {
    await this.ensureDirs();
    const existing = await this.getAllActivities();
    const map = new Map<string, Activity>();

    for (const a of existing) {
      map.set(a.id, a);
    }
    for (const a of newActivities) {
      map.set(a.id, a);
    }

    const merged = Array.from(map.values()).sort(
      (a, b) => b.startTime.getTime() - a.startTime.getTime()
    );

    try {
      await fs.writeFile(this.activitiesFile, JSON.stringify(merged, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to write activities.json (likely read-only runtime):', err);
    }
  }

  public async saveActivityDetail(detail: ActivityDetail): Promise<void> {
    await this.ensureDirs();
    try {
      const filePath = path.join(this.detailsDir, `${detail.activityId}.json`);
      await fs.writeFile(filePath, JSON.stringify(detail, null, 2), 'utf-8');
    } catch (err) {
      console.warn(`Failed to write activity detail ${detail.activityId}:`, err);
    }
  }

  public async getBestEfforts(): Promise<BestEffort[]> {
    await this.ensureDirs();
    try {
      const data = await fs.readFile(this.prsFile, 'utf-8');
      const list: any[] = JSON.parse(data);
      return list.map(item => ({
        ...item,
        dateAchieved: new Date(item.dateAchieved),
      }));
    } catch (err: any) {
      if (err.code === 'ENOENT') return [];
      return [];
    }
  }

  public async saveBestEfforts(efforts: BestEffort[]): Promise<void> {
    await this.ensureDirs();
    try {
      await fs.writeFile(this.prsFile, JSON.stringify(efforts, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to write best-efforts.json:', err);
    }
  }

  public async getLastSyncTimestamp(): Promise<Date | null> {
    await this.ensureDirs();
    try {
      const data = await fs.readFile(this.syncFile, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed.lastSync ? new Date(parsed.lastSync) : null;
    } catch {
      return null;
    }
  }

  public async setLastSyncTimestamp(date: Date): Promise<void> {
    await this.ensureDirs();
    try {
      await fs.writeFile(
        this.syncFile,
        JSON.stringify({ lastSync: date.toISOString() }, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.warn('Failed to write sync-state.json:', err);
    }
  }
}
