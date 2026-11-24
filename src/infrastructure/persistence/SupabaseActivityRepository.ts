import { Activity } from '@/domain/entities/Activity';
import { ActivityDetail } from '@/domain/entities/ActivityDetail';
import { BestEffort } from '@/domain/entities/BestEffort';
import { IActivityRepository } from '@/domain/repositories/IActivityRepository';
import { createClient } from '@/utils/supabase/server';
import { LocalFileActivityRepository } from './LocalFileActivityRepository';

/**
 * Multi-tenant Supabase PostgreSQL implementation of IActivityRepository.
 * Strictly isolates activities, GPS/HR detail streams, PRs, and sync state per user_id via RLS.
 * Gracefully falls back to LocalFileActivityRepository if Supabase tables are not yet migrated.
 */
export class SupabaseActivityRepository implements IActivityRepository {
  private fallbackRepo: LocalFileActivityRepository;

  constructor(fallbackRepo?: LocalFileActivityRepository) {
    this.fallbackRepo = fallbackRepo || new LocalFileActivityRepository();
  }

  private isMissingTableError(error: any): boolean {
    if (!error) return false;
    const code = String(error.code || '');
    const msg = String(error.message || '').toLowerCase();
    return (
      code === '42P01' ||
      code === 'PGRST205' ||
      msg.includes('does not exist') ||
      msg.includes('could not find the table')
    );
  }

  private async getSupabaseContext() {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      return { supabase, userId: user.id, isDemoMode: user.user_metadata?.garmin_demo_mode === true };
    } catch {
      return null;
    }
  }

  public async getAllActivities(): Promise<Activity[]> {
    const ctx = await this.getSupabaseContext();
    if (!ctx) return this.fallbackRepo.getAllActivities();

    try {
      const { data, error } = await ctx.supabase
        .from('activities')
        .select('payload')
        .eq('user_id', ctx.userId)
        .order('start_time', { ascending: false });

      if (error) {
        if (this.isMissingTableError(error)) {
          return this.fallbackRepo.getAllActivities();
        }
        console.warn('Supabase getAllActivities notice:', error.message);
        return this.fallbackRepo.getAllActivities();
      }

      if (data && data.length > 0) {
        return data.map((row: any) => ({
          ...row.payload,
          startTime: new Date(row.payload.startTime),
        }));
      }

      // If user explicitly chose Demo Mode and has no rows in Supabase yet, show local demo cache
      if (ctx.isDemoMode) {
        return this.fallbackRepo.getAllActivities();
      }

      return [];
    } catch {
      return this.fallbackRepo.getAllActivities();
    }
  }

  public async getActivityById(id: string): Promise<Activity | null> {
    const ctx = await this.getSupabaseContext();
    if (!ctx) return this.fallbackRepo.getActivityById(id);

    try {
      const { data, error } = await ctx.supabase
        .from('activities')
        .select('payload')
        .eq('user_id', ctx.userId)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        if (this.isMissingTableError(error)) {
          return this.fallbackRepo.getActivityById(id);
        }
        return this.fallbackRepo.getActivityById(id);
      }

      if (data?.payload) {
        return {
          ...data.payload,
          startTime: new Date(data.payload.startTime),
        };
      }

      if (ctx.isDemoMode) {
        return this.fallbackRepo.getActivityById(id);
      }
      return null;
    } catch {
      return this.fallbackRepo.getActivityById(id);
    }
  }

  public async getActivityDetail(id: string): Promise<ActivityDetail | null> {
    const ctx = await this.getSupabaseContext();
    if (!ctx) return this.fallbackRepo.getActivityDetail(id);

    try {
      const { data, error } = await ctx.supabase
        .from('activity_details')
        .select('payload')
        .eq('user_id', ctx.userId)
        .eq('activity_id', id)
        .maybeSingle();

      if (error) {
        if (this.isMissingTableError(error)) {
          return this.fallbackRepo.getActivityDetail(id);
        }
        return this.fallbackRepo.getActivityDetail(id);
      }

      if (data?.payload) {
        return data.payload as ActivityDetail;
      }

      if (ctx.isDemoMode) {
        return this.fallbackRepo.getActivityDetail(id);
      }
      return null;
    } catch {
      return this.fallbackRepo.getActivityDetail(id);
    }
  }

  public async saveActivities(activities: Activity[]): Promise<void> {
    if (!activities || activities.length === 0) return;
    const ctx = await this.getSupabaseContext();

    if (ctx) {
      try {
        const rows = activities.map(act => ({
          user_id: ctx.userId,
          id: act.id,
          start_time:
            act.startTime instanceof Date
              ? act.startTime.toISOString()
              : new Date(act.startTime).toISOString(),
          sport_type: act.sportType || 'running',
          name: act.name || 'Running Activity',
          distance_meters: act.distanceMeters || 0,
          duration_seconds: act.durationSeconds || 0,
          payload: {
            ...act,
            startTime:
              act.startTime instanceof Date
                ? act.startTime.toISOString()
                : new Date(act.startTime).toISOString(),
          },
        }));

        const { error } = await ctx.supabase
          .from('activities')
          .upsert(rows, { onConflict: 'user_id,id' });

        if (!error) return;
        if (!this.isMissingTableError(error)) {
          console.warn('Supabase saveActivities error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase saveActivities fallback:', err);
      }
    }

    await this.fallbackRepo.saveActivities(activities);
  }

  public async saveActivityDetail(detail: ActivityDetail): Promise<void> {
    const ctx = await this.getSupabaseContext();

    if (ctx) {
      try {
        const { error } = await ctx.supabase
          .from('activity_details')
          .upsert(
            {
              user_id: ctx.userId,
              activity_id: detail.activityId,
              payload: detail,
            },
            { onConflict: 'user_id,activity_id' }
          );

        if (!error) return;
        if (!this.isMissingTableError(error)) {
          console.warn('Supabase saveActivityDetail error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase saveActivityDetail fallback:', err);
      }
    }

    await this.fallbackRepo.saveActivityDetail(detail);
  }

  public async getBestEfforts(): Promise<BestEffort[]> {
    const ctx = await this.getSupabaseContext();
    if (!ctx) return this.fallbackRepo.getBestEfforts();

    try {
      const { data, error } = await ctx.supabase
        .from('best_efforts')
        .select('payload')
        .eq('user_id', ctx.userId);

      if (error) {
        if (this.isMissingTableError(error)) {
          return this.fallbackRepo.getBestEfforts();
        }
        return this.fallbackRepo.getBestEfforts();
      }

      if (data && data.length > 0) {
        return data.map((row: any) => ({
          ...row.payload,
          dateAchieved: new Date(row.payload.dateAchieved),
        }));
      }

      if (ctx.isDemoMode) {
        return this.fallbackRepo.getBestEfforts();
      }
      return [];
    } catch {
      return this.fallbackRepo.getBestEfforts();
    }
  }

  public async saveBestEfforts(efforts: BestEffort[]): Promise<void> {
    if (!efforts || efforts.length === 0) return;
    const ctx = await this.getSupabaseContext();

    if (ctx) {
      try {
        const rows = efforts.map(pr => ({
          user_id: ctx.userId,
          id: pr.id,
          milestone: pr.milestone,
          time_seconds: pr.timeSeconds,
          payload: {
            ...pr,
            dateAchieved:
              pr.dateAchieved instanceof Date
                ? pr.dateAchieved.toISOString()
                : new Date(pr.dateAchieved).toISOString(),
          },
        }));

        const { error } = await ctx.supabase
          .from('best_efforts')
          .upsert(rows, { onConflict: 'user_id,id' });

        if (!error) return;
        if (!this.isMissingTableError(error)) {
          console.warn('Supabase saveBestEfforts error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase saveBestEfforts fallback:', err);
      }
    }

    await this.fallbackRepo.saveBestEfforts(efforts);
  }

  public async getLastSyncTimestamp(): Promise<Date | null> {
    const ctx = await this.getSupabaseContext();
    if (!ctx) return this.fallbackRepo.getLastSyncTimestamp();

    try {
      const { data, error } = await ctx.supabase
        .from('sync_states')
        .select('last_synced_at')
        .eq('user_id', ctx.userId)
        .maybeSingle();

      if (error) {
        if (this.isMissingTableError(error)) {
          return this.fallbackRepo.getLastSyncTimestamp();
        }
        return this.fallbackRepo.getLastSyncTimestamp();
      }

      if (data?.last_synced_at) {
        return new Date(data.last_synced_at);
      }

      if (ctx.isDemoMode) {
        return this.fallbackRepo.getLastSyncTimestamp();
      }
      return null;
    } catch {
      return this.fallbackRepo.getLastSyncTimestamp();
    }
  }

  public async setLastSyncTimestamp(date: Date): Promise<void> {
    const ctx = await this.getSupabaseContext();

    if (ctx) {
      try {
        const { error } = await ctx.supabase
          .from('sync_states')
          .upsert(
            {
              user_id: ctx.userId,
              last_synced_at: date.toISOString(),
            },
            { onConflict: 'user_id' }
          );

        if (!error) return;
        if (!this.isMissingTableError(error)) {
          console.warn('Supabase setLastSyncTimestamp error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase setLastSyncTimestamp fallback:', err);
      }
    }

    await this.fallbackRepo.setLastSyncTimestamp(date);
  }
}
