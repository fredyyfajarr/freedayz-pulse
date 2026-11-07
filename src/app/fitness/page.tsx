import { container } from '@/infrastructure/di/container';
import { PMCEngine } from '@/domain/services/PMCEngine';
import FitnessClient from '@/components/fitness/FitnessClient';

export default async function FitnessPage() {
  const activities = await container.repository.getAllActivities();
  const summary = PMCEngine.computeTimeline(activities, 180);

  return <FitnessClient summary={summary} />;
}

