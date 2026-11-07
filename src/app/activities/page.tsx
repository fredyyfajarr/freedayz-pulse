import { container } from '@/infrastructure/di/container';
import PaginatedActivitiesList from '@/components/activities/PaginatedActivitiesList';

export default async function ActivitiesPage() {
  const activities = await container.repository.getAllActivities();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
      {/* Paginated Activities Client Component with Interactive Bilingual Header */}
      <PaginatedActivitiesList activities={activities} />
    </div>
  );
}
