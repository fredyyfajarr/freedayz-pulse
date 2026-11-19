import type { Metadata } from 'next';
import { container } from '@/infrastructure/di/container';
import { PMCEngine } from '@/domain/services/PMCEngine';
import FitnessClient from '@/components/fitness/FitnessClient';
import CoachFitnessHub from '@/components/coach/CoachFitnessHub';
import { createClient } from '@/utils/supabase/server';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role === 'coach') {
      return {
        title: 'Kebugaran Skuad Atlet // Squad PMC',
      };
    }
  } catch {}
  return {
    title: 'Fitness & Freshness // PMC Engine',
  };
}

export default async function FitnessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role || 'athlete';

  if (role === 'coach') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 space-y-6">
        <CoachFitnessHub />
      </div>
    );
  }

  const activities = await container.repository.getAllActivities();
  const summary = PMCEngine.computeTimeline(activities, 180);

  return <FitnessClient summary={summary} />;
}

