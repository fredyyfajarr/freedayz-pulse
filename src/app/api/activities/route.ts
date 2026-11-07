import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sport = request.nextUrl.searchParams.get('sport');
    const search = request.nextUrl.searchParams.get('search')?.toLowerCase();

    let activities = await container.repository.getAllActivities();

    if (sport && sport !== 'all') {
      activities = activities.filter(a => a.sportType === sport);
    }

    if (search) {
      activities = activities.filter(
        a =>
          a.name.toLowerCase().includes(search) ||
          (a.locationName && a.locationName.toLowerCase().includes(search))
      );
    }

    return NextResponse.json(activities);
  } catch (err: any) {
    console.error('Error in /api/activities:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
