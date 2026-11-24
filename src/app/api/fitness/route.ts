import { NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { PMCEngine } from '@/domain/services/PMCEngine';
import { requireAuthenticatedUser } from '@/utils/supabase/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;

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
