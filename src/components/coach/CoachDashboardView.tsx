'use client';

import React, { useState } from 'react';
import CoachCommandCenter from './CoachCommandCenter';

interface Props {
  coachName: string;
  coachEmail: string;
  athletes: any[];
  children: React.ReactNode;
}

export default function CoachDashboardView({
  coachName,
  coachEmail,
  athletes,
  children,
}: Props) {
  const [selectedAthleteId, setSelectedAthleteId] = useState(athletes[0]?.id || 'ath-fredy');
  const [isInspectingTelemetry, setIsInspectingTelemetry] = useState(true);

  return (
    <div className="space-y-6">
      {/* 1. Coach Master Hub */}
      <CoachCommandCenter
        coachName={coachName}
        coachEmail={coachEmail}
        athletes={athletes}
        selectedAthleteId={selectedAthleteId}
        onSelectAthlete={(id) => {
          setSelectedAthleteId(id);
          setIsInspectingTelemetry(true);
        }}
        isInspectingTelemetry={isInspectingTelemetry}
        onToggleInspect={setIsInspectingTelemetry}
      />

      {/* 2. Inspected Athlete's Telemetry Section */}
      {isInspectingTelemetry && (
        <div className="space-y-6 relative">
          {children}
        </div>
      )}
    </div>
  );
}
