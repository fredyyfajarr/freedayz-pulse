import { NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { requireAuthenticatedUser } from '@/utils/supabase/apiAuth';
import { GarminApiClient } from '@/infrastructure/garmin/GarminApiClient';
import { SyncActivitiesUseCase } from '@/application/use-cases/SyncActivitiesUseCase';
import { GetHealthTelemetryUseCase } from '@/application/use-cases/GetHealthTelemetryUseCase';

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const force = Boolean(body?.force);

    const userApiKey =
      typeof auth.user.user_metadata?.garmin_api_key === 'string' &&
      auth.user.user_metadata.garmin_api_key.trim().length > 0
        ? auth.user.user_metadata.garmin_api_key.trim()
        : undefined;

    const garminClient = userApiKey
      ? new GarminApiClient(undefined, userApiKey)
      : container.garminClient;
    const syncUseCase = userApiKey
      ? new SyncActivitiesUseCase(garminClient, container.repository)
      : container.syncUseCase;
    const healthUseCase = userApiKey
      ? new GetHealthTelemetryUseCase(garminClient, container.repository)
      : container.healthUseCase;

    const [syncResult, healthResult] = await Promise.allSettled([
      syncUseCase.execute(force),
      healthUseCase.execute(true),
    ]);

    const result = syncResult.status === 'fulfilled' ? syncResult.value : { syncedCount: 0, newCount: 0, updatedCount: 0 };
    const healthError = healthResult.status === 'rejected' ? healthResult.reason?.message : null;
    const syncError = syncResult.status === 'rejected' ? syncResult.reason?.message : null;

    if (syncError && healthError) {
      throw new Error(`Sync failed: ${syncError}; Health sync failed: ${healthError}`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${result.syncedCount} activities and latest health telemetry from Garmin.`,
      ...result,
      healthUpdated: healthResult.status === 'fulfilled',
    });
  } catch (err: any) {
    console.error('Error in /api/sync:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to sync with Garmin API',
      },
      { status: 500 }
    );
  }
}
