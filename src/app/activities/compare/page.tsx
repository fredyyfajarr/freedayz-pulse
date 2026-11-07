import React from 'react';
import { container } from '@/infrastructure/di/container';
import CompareClient from './CompareClient';
import { Activity } from '@/domain/entities/Activity';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export default async function ActivityComparePage({ searchParams }: Props) {
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
