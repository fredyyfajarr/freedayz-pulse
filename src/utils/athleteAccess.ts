import type { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export interface CurrentUserAccess {
  user: User | null;
  role: 'athlete' | 'coach' | 'admin';
  isCoach: boolean;
  isGarminConnected: boolean;
  isDemoMode: boolean;
  hasTelemetryAccess: boolean;
  fullName: string;
  email: string;
  weeklyTargetKm: number;
  garminApiKey?: string;
}

/**
 * Centralized server-side access & telemetry isolation resolver.
 * Keeps role gating and Garmin BYOK isolation consistent across all athlete pages.
 */
export async function getCurrentUserAccess(): Promise<CurrentUserAccess> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const isDemoCookie = cookieStore.get('pulse_demo_mode')?.value === '1';

  if (!user && isDemoCookie) {
    return {
      user: null,
      role: 'athlete',
      isCoach: false,
      isGarminConnected: false,
      isDemoMode: true,
      hasTelemetryAccess: true,
      fullName: 'Bimo Pratama',
      email: 'bimo.pratama@freedayzz.pulse',
      weeklyTargetKm: 35,
    };
  }

  const userMeta = user?.user_metadata || {};
  const role = (userMeta.role as 'athlete' | 'coach' | 'admin') || 'athlete';
  const email = user?.email || '';
  const fullName = userMeta.full_name || email.split('@')[0] || 'User';
  const parsedTarget = Number(userMeta.weekly_target_km);
  const weeklyTargetKm = Number.isFinite(parsedTarget) && parsedTarget > 0 ? parsedTarget : 30;

  let garminApiKey: string | undefined =
    typeof userMeta.garmin_api_key === 'string' && userMeta.garmin_api_key.trim().length > 0
      ? userMeta.garmin_api_key.trim()
      : undefined;

  let isGarminConnected =
    userMeta.garmin_connected === true || Boolean(garminApiKey);
  const isDemoMode = userMeta.garmin_demo_mode === true;

  // Optional env-configured primary athlete email (no hardcoded personal email in source)
  const primaryEnvEmail = process.env.GARMIN_PRIMARY_EMAIL?.trim().toLowerCase();
  if (!isGarminConnected && primaryEnvEmail && email.toLowerCase() === primaryEnvEmail) {
    isGarminConnected = true;
  }

  // Fallback check against user_garmin_connections table if not yet flagged in metadata
  if (user && !isGarminConnected && !isDemoMode && role !== 'coach') {
    try {
      const { data: conn } = await supabase
        .from('user_garmin_connections')
        .select('garmin_api_key, is_active')
        .eq('user_id', user.id)
        .maybeSingle();

      if (conn?.garmin_api_key) {
        garminApiKey = conn.garmin_api_key;
        isGarminConnected = true;
      } else if (conn?.is_active && conn.garmin_api_key) {
        isGarminConnected = true;
      }
    } catch {
      // Table may not be migrated yet; safely rely on user_metadata
    }
  }

  return {
    user,
    role,
    isCoach: role === 'coach',
    isGarminConnected,
    isDemoMode,
    hasTelemetryAccess: isGarminConnected || isDemoMode,
    fullName,
    email,
    weeklyTargetKm,
    garminApiKey,
  };
}
