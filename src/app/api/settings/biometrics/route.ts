import { NextResponse } from 'next/server';
import { AthleteSettingsManager } from '@/infrastructure/persistence/AthleteSettingsManager';
import { createClient } from '@/utils/supabase/server';
import { requireAuthenticatedUser } from '@/utils/supabase/apiAuth';

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;

  try {
    const userBiometrics = auth.user.user_metadata?.athlete_biometrics;

    const localSettings = AthleteSettingsManager.getSettings();
    const merged = {
      ...localSettings,
      ...(userBiometrics || {}),
    };

    return NextResponse.json(merged);
  } catch {
    const localSettings = AthleteSettingsManager.getSettings();
    return NextResponse.json(localSettings);
  }
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const payload = {
      maxHr: body.maxHr !== undefined ? Number(body.maxHr) : undefined,
      restingHr: body.restingHr !== undefined ? Number(body.restingHr) : undefined,
      customZones: body.customZones || undefined,
      deviceName: typeof body.deviceName === 'string' ? body.deviceName : undefined,
    };

    // 1. Update local cache/JSON
    const updated = AthleteSettingsManager.updateSettings(payload);

    // 2. Persist to authenticated user's cloud user_metadata
    try {
      const supabase = await createClient();
      await supabase.auth.updateUser({
        data: {
          athlete_biometrics: updated,
          biometrics_updated_at: new Date().toISOString(),
        },
      });
    } catch (authErr) {
      console.warn('Optional Supabase user metadata update notice:', authErr);
    }

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
