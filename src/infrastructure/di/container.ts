import { GetActivityDetailUseCase } from '@/application/use-cases/GetActivityDetailUseCase';
import { GetDashboardSummaryUseCase } from '@/application/use-cases/GetDashboardSummaryUseCase';
import { GetHealthTelemetryUseCase } from '@/application/use-cases/GetHealthTelemetryUseCase';
import { SyncActivitiesUseCase } from '@/application/use-cases/SyncActivitiesUseCase';
import { GarminApiClient } from '../garmin/GarminApiClient';
import { LocalFileActivityRepository } from '../persistence/LocalFileActivityRepository';

class DIContainer {
  private static instance: DIContainer;
  public repository: LocalFileActivityRepository;
  public garminClient: GarminApiClient;

  public syncUseCase: SyncActivitiesUseCase;
  public dashboardUseCase: GetDashboardSummaryUseCase;
  public activityDetailUseCase: GetActivityDetailUseCase;
  public healthUseCase: GetHealthTelemetryUseCase;

  private constructor() {
    this.repository = new LocalFileActivityRepository();
    this.garminClient = new GarminApiClient();

    this.syncUseCase = new SyncActivitiesUseCase(this.garminClient, this.repository);
    this.dashboardUseCase = new GetDashboardSummaryUseCase(this.repository);
    this.activityDetailUseCase = new GetActivityDetailUseCase(this.repository, this.garminClient);
    this.healthUseCase = new GetHealthTelemetryUseCase(this.garminClient, this.repository);
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }
}

export const container = DIContainer.getInstance();
