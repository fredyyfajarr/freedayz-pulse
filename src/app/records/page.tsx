import type { Metadata } from 'next';
import { container } from '@/infrastructure/di/container';
import RecordsClient from '@/components/records/RecordsClient';

export const metadata: Metadata = {
  title: 'Rekor Lari & Best Efforts',
};

export default async function RecordsPage() {
  const prs = await container.repository.getBestEfforts();
  const activities = await container.repository.getAllActivities();

  return <RecordsClient prs={prs} activities={activities} />;
}
