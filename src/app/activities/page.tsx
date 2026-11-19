import type { Metadata } from 'next';
import { container } from '@/infrastructure/di/container';
import PaginatedActivitiesList from '@/components/activities/PaginatedActivitiesList';
import CoachActivitiesHub from '@/components/coach/CoachActivitiesHub';
import { createClient } from '@/utils/supabase/server';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role === 'coach') {
      return {
        title: 'Aktivitas Skuad Atlet // Coach Telemetry',
      };
    }
  } catch {}
  return {
    title: 'Log Aktivitas Lari // Feed',
  };
}

export default async function ActivitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role || 'athlete';

  if (role === 'coach') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 space-y-6">
        <CoachActivitiesHub />
      </div>
    );
  }

  const activities = await container.repository.getAllActivities();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
      {/* Paginated Activities Client Component with Interactive Bilingual Header */}
      <PaginatedActivitiesList activities={activities} />
    </div>
  );
}
