import { NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { GarminAuthenticator } from '@/infrastructure/garmin/GarminAuthenticator';
import { requireAuthenticatedUser } from '@/utils/supabase/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;

  const userKey =
    typeof auth.user.user_metadata?.garmin_api_key === 'string' &&
    auth.user.user_metadata.garmin_api_key.trim().length > 0
      ? auth.user.user_metadata.garmin_api_key.trim()
      : undefined;
  const apiKey = userKey || process.env.GARMIN_PERSONAL_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      connected: false,
      latencyMs: 0,
      message: 'Garmin Personal API Key belum dikonfigurasi pada akun ini.',
    });
  }

  const startTime = Date.now();
  try {
    // Attempt token retrieval to verify authentication validity for this user's key
    const token = await GarminAuthenticator.getBearerToken(apiKey);
    const latencyMs = Date.now() - startTime;

    const [lastSync, allActivities] = await Promise.all([
      container.repository.getLastSyncTimestamp(),
      container.repository.getAllActivities(),
    ]);

    const maskedKey = apiKey.length > 12
      ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`
      : 'CONFIGURED';

    return NextResponse.json({
      configured: true,
      connected: Boolean(token),
      latencyMs,
      lastSync: lastSync ? lastSync.toISOString() : null,
      totalActivities: allActivities.length,
      maskedKey,
      message: 'Garmin Connect Personal API is online and authenticated.',
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return NextResponse.json({
      configured: true,
      connected: false,
      latencyMs,
      error: err.message || 'Failed to authenticate with Garmin Connect API',
      message: 'Garmin token authentication failed. Please verify your Personal API Key.',
    }, { status: 502 });
  }
}
