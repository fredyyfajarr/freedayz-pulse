import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await container.activityDetailUseCase.execute(id);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error(`Error in /api/activities/[id]:`, err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch activity details' },
      { status: 404 }
    );
  }
}
