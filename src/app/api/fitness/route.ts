import { NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { PMCEngine } from '@/domain/services/PMCEngine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activities = await container.repository.getAllActivities();
    const summary = PMCEngine.computeTimeline(activities, 180); // 180 days history
    return NextResponse.json(summary);
  } catch (err: any) {
    console.error('Error in /api/fitness:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to compute fitness & freshness' },
      { status: 500 }
    );
  }
}
