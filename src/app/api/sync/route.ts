import { NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const force = Boolean(body?.force);

    const [syncResult, healthResult] = await Promise.allSettled([
      container.syncUseCase.execute(force),
      container.healthUseCase.execute(true),
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
