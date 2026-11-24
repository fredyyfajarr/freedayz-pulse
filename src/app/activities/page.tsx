import type { Metadata } from 'next';
import { container } from '@/infrastructure/di/container';
import PaginatedActivitiesList from '@/components/activities/PaginatedActivitiesList';
import CoachActivitiesHub from '@/components/coach/CoachActivitiesHub';
import NewAthleteSetupCard from '@/components/dashboard/NewAthleteSetupCard';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUserAccess } from '@/utils/athleteAccess';

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
  const access = await getCurrentUserAccess();

  if (access.isCoach) {
    return (
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 space-y-4 sm:space-y-6 min-w-0">
        <CoachActivitiesHub />
      </div>
    );
  }

  if (!access.hasTelemetryAccess) {
    return (
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 space-y-4 sm:space-y-6 min-w-0">
        <NewAthleteSetupCard athleteName={access.fullName} athleteEmail={access.email} />
      </div>
    );
  }

  const activities = await container.repository.getAllActivities();

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-6 min-w-0">
      {/* Paginated Activities Client Component with Interactive Bilingual Header */}
      <PaginatedActivitiesList activities={activities} />
    </div>
  );
}
