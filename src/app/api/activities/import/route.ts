import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { Activity } from '@/domain/entities/Activity';
import { ActivityDetail } from '@/domain/entities/ActivityDetail';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activity, detail } = body;

    if (!activity || !activity.id) {
      return NextResponse.json({ error: 'Data aktivitas tidak valid.' }, { status: 400 });
    }

    const activityEntity: Activity = {
      ...activity,
      startTime: new Date(activity.startTime),
    };

    // Save activity to repository
    await container.repository.saveActivities([activityEntity]);

    // If metric stream / detail is provided, save detail JSON
    if (detail) {
      const detailEntity: ActivityDetail = {
        ...detail,
        activityId: activity.id,
      };
      await container.repository.saveActivityDetail(detailEntity);
    }

    revalidatePath('/activities');
    revalidatePath('/dashboard');

    return NextResponse.json({
      success: true,
      message: 'Aktivitas lari berhasil diimpor ke Telemetry Lab!',
      activityId: activity.id,
    });
  } catch (err: any) {
    console.error('Error importing activity file:', err);
    return NextResponse.json({ error: err.message || 'Gagal mengimpor file aktivitas.' }, { status: 500 });
  }
}
