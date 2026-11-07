import { NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // If no activities yet, run initial background sync
    const existing = await container.repository.getAllActivities();
    if (existing.length === 0) {
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
