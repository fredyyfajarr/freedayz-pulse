import { NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { requireAuthenticatedUser } from '@/utils/supabase/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;

  try {
    // If no activities yet and not in demo mode, run initial background sync
    const isDemo = auth.user.user_metadata?.garmin_demo_mode === true;
    const existing = await container.repository.getAllActivities();
    if (existing.length === 0 && !isDemo) {
      try {
        await container.syncUseCase.execute(false);
      } catch (syncErr) {
        console.warn('Initial sync failed:', syncErr);
      }
    }

    const summary = await container.dashboardUseCase.execute();
    return NextResponse.json(summary);
  } catch (err: any) {
    console.error('Error in /api/dashboard:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}
