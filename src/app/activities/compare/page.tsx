import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { container } from '@/infrastructure/di/container';
import CompareClient from './CompareClient';
import { Activity } from '@/domain/entities/Activity';
import Link from 'next/link';
import { getCurrentUserAccess } from '@/utils/athleteAccess';
import NewAthleteSetupCard from '@/components/dashboard/NewAthleteSetupCard';

export const metadata: Metadata = {
  title: 'Komparasi Head-to-Head Telemetri',
};

interface Props {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export default async function ActivityComparePage({ searchParams }: Props) {
  const access = await getCurrentUserAccess();
  if (access.isCoach) {
    redirect('/activities');
  }
  if (!access.hasTelemetryAccess) {
    return (
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 space-y-4 sm:space-y-6 min-w-0">
        <NewAthleteSetupCard athleteName={access.fullName} athleteEmail={access.email} />
      </div>
    );
  }

  const { a: idA, b: idB } = await searchParams;
  const activities = (await container.repository.getAllActivities()).filter(
    act => act.sportType === 'running' || act.name?.toLowerCase().includes('run')
  );

  // Default selection: pick the 2 most recent runs if not specified
  const runA: Activity | undefined = activities.find(act => act.id === idA) || activities[0];
  const runB: Activity | undefined = activities.find(act => act.id === idB) || (activities.length > 1 ? activities[1] : activities[0]);

  if (!runA || !runB) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center font-mono">
        <p className="text-zinc-400">At least 2 running activities are required for head-to-head comparison.</p>
        <Link href="/activities" className="mt-4 inline-block text-cyan-400 underline">
          &larr; Back to Activities
        </Link>
      </div>
    );
  }

  return <CompareClient activities={activities} runA={runA} runB={runB} />;
}
