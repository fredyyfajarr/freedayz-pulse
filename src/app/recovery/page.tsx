import React from 'react';
import { container } from '@/infrastructure/di/container';
import RecoveryPageClient from '@/components/health/RecoveryPageClient';

export default async function RecoveryPage() {
  const snapshot = await container.healthUseCase.execute();

  return <RecoveryPageClient snapshot={snapshot} />;
}

