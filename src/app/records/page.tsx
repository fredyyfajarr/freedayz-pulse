import { container } from '@/infrastructure/di/container';
import RecordsClient from '@/components/records/RecordsClient';

export default async function RecordsPage() {
  const prs = await container.repository.getBestEfforts();
  const activities = await container.repository.getAllActivities();

  return <RecordsClient prs={prs} activities={activities} />;
}
