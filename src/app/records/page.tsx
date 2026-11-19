import type { Metadata } from 'next';
import { container } from '@/infrastructure/di/container';
import RecordsClient from '@/components/records/RecordsClient';
import CoachRecordsHub from '@/components/coach/CoachRecordsHub';
import { createClient } from '@/utils/supabase/server';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role === 'coach') {
      return {
        title: 'Papan Rekor Skuad // Leaderboard',
      };
    }
  } catch {}
  return {
    title: 'Rekor Lari & Best Efforts',
  };
}

export default async function RecordsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role || 'athlete';

  if (role === 'coach') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 space-y-6">
        <CoachRecordsHub />
      </div>
    );
  }

  const prs = await container.repository.getBestEfforts();
  const activities = await container.repository.getAllActivities();

  return <RecordsClient prs={prs} activities={activities} />;
}
