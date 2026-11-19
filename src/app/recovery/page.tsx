import React from 'react';
import type { Metadata } from 'next';
import { container } from '@/infrastructure/di/container';
import RecoveryPageClient from '@/components/health/RecoveryPageClient';

export const metadata: Metadata = {
  title: 'Recovery Hub & Biometrik Garmin',
};

export default async function RecoveryPage() {
  const snapshot = await container.healthUseCase.execute();

  return <RecoveryPageClient snapshot={snapshot} />;
}

