import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ACWRCalculator } from '../ACWRCalculator.ts';
import { HRProfileCalculator } from '../HRProfileCalculator.ts';
import { PaceCalculator } from '../PaceCalculator.ts';
import { PMCEngine } from '../PMCEngine.ts';
import { TRIMPCalculator } from '../TRIMPCalculator.ts';
import { VO2MaxCalculator } from '../VO2MaxCalculator.ts';
import type { Activity } from '../../entities/Activity.ts';
import type { BestEffort } from '../../entities/BestEffort.ts';

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'act-1',
    externalId: 1001,
    name: 'Morning Run',
    sportType: 'running',
    startTime: new Date('2026-11-18T06:00:00Z'),
    startTimeLocalStr: '2026-11-18 06:00:00',
    durationSeconds: 1800,
    movingDurationSeconds: 1800,
    distanceMeters: 5000,
    avgSpeedMps: 2.78,
    maxSpeedMps: 3.33,
    avgPaceSecPerKm: 360,
    maxPaceSecPerKm: 300,
    elevationGainMeters: 30,
    elevationLossMeters: 30,
    avgHeartRate: 155,
    maxHeartRate: 175,
    calories: 350,
    hasGpsData: true,
    dynamics: { avgCadence: 172, maxCadence: 185 },
    hrZones: {
      zone1Seconds: 300,
      zone2Seconds: 900,
      zone3Seconds: 400,
      zone4Seconds: 150,
      zone5Seconds: 50,
      totalZoneSeconds: 1800,
    },
    relativeEffortScore: 60,
    ...overrides,
  };
}

describe('PaceCalculator', () => {
  it('converts m/s to sec/km and formats pace/duration/distance accurately', () => {
    assert.equal(PaceCalculator.mpsToSecPerKm(0), 0);
    assert.equal(Math.round(PaceCalculator.mpsToSecPerKm(3.333333)), 300);
    assert.equal(PaceCalculator.calculatePaceSecPerKm(5000, 1500), 300);
    assert.equal(PaceCalculator.formatPace(330), '5:30 /km');
    assert.equal(PaceCalculator.formatPace(0), '--:--');
    assert.equal(PaceCalculator.formatDuration(3665), '1:01:05');
    assert.equal(PaceCalculator.formatDuration(305), '5:05');
    assert.equal(PaceCalculator.formatDistance(10550), '10.55 km');
  });
});

describe('TRIMPCalculator', () => {
  it('calculates TRIMP from HR zones using exponential weights', () => {
    const score = TRIMPCalculator.calculateFromZones({
      zone1Seconds: 600, // 10m * 1.0 = 10
      zone2Seconds: 600, // 10m * 1.5 = 15
      zone3Seconds: 600, // 10m * 2.4 = 24
      zone4Seconds: 0,
      zone5Seconds: 0,
      totalZoneSeconds: 1800,
    });
    assert.equal(score, 49);
  });

  it('calculates Banister TRIMP from average HR and returns 0 when avgHR <= restHR', () => {
    assert.equal(TRIMPCalculator.calculateFromAvgHR(1800, 50, 195, 55), 0);
    const maleScore = TRIMPCalculator.calculateFromAvgHR(3600, 160, 200, 50, 'male');
    const femaleScore = TRIMPCalculator.calculateFromAvgHR(3600, 160, 200, 50, 'female');
    assert.ok(maleScore > 0);
    assert.ok(femaleScore > 0);
    assert.ok(maleScore > femaleScore);
  });
});

describe('ACWRCalculator', () => {
  it('classifies SWEET_SPOT when acute load matches 4-week chronic average', () => {
    const ref = new Date('2026-11-20T12:00:00Z');
    const acts: Activity[] = [
      makeActivity({ id: 'w1', startTime: new Date('2026-11-18T06:00:00Z'), relativeEffortScore: 100 }),
      makeActivity({ id: 'w2', startTime: new Date('2026-11-11T06:00:00Z'), relativeEffortScore: 100 }),
      makeActivity({ id: 'w3', startTime: new Date('2026-11-04T06:00:00Z'), relativeEffortScore: 100 }),
      makeActivity({ id: 'w4', startTime: new Date('2026-10-28T06:00:00Z'), relativeEffortScore: 100 }),
    ];
    const res = ACWRCalculator.calculate(acts, ref);
    assert.equal(res.ratio, 1);
    assert.equal(res.zone, 'SWEET_SPOT');
  });

  it('classifies DANGER_ZONE when acute load spikes above 1.5x chronic load', () => {
    const ref = new Date('2026-11-20T12:00:00Z');
    const acts: Activity[] = [
      makeActivity({ id: 'spike', startTime: new Date('2026-11-19T06:00:00Z'), relativeEffortScore: 300 }),
      makeActivity({ id: 'old', startTime: new Date('2026-11-01T06:00:00Z'), relativeEffortScore: 50 }),
    ];
    const res = ACWRCalculator.calculate(acts, ref);
    assert.ok(res.ratio > 1.5);
    assert.equal(res.zone, 'DANGER_ZONE');
  });

  it('classifies UNDER_TRAINING when acute load drops below 0.8x chronic load', () => {
    const ref = new Date('2026-11-20T12:00:00Z');
    const acts: Activity[] = [
      makeActivity({ id: 'w2', startTime: new Date('2026-11-10T06:00:00Z'), relativeEffortScore: 200 }),
      makeActivity({ id: 'w3', startTime: new Date('2026-11-03T06:00:00Z'), relativeEffortScore: 200 }),
    ];
    const res = ACWRCalculator.calculate(acts, ref);
    assert.equal(res.acuteLoad, 0);
    assert.equal(res.zone, 'UNDER_TRAINING');
  });
});

describe('PMCEngine', () => {
  it('computes CTL/ATL/TSB timeline and classifies form states accurately', () => {
    const today = new Date();
    const recentAct = makeActivity({ startTime: today, relativeEffortScore: 120, distanceMeters: 10000 });
    const summary = PMCEngine.computeTimeline([recentAct], 30);

    assert.ok(summary.history.length >= 30);
    assert.ok(summary.currentFatigue > summary.currentFitness);
    assert.equal(summary.sevenDayDistanceKm, 10);

    assert.equal(PMCEngine.classifyForm(30), 'transition');
    assert.equal(PMCEngine.classifyForm(18), 'peaking');
    assert.equal(PMCEngine.classifyForm(8), 'fresh');
    assert.equal(PMCEngine.classifyForm(0), 'optimal');
    assert.equal(PMCEngine.classifyForm(-15), 'fatigued');
    assert.equal(PMCEngine.classifyForm(-30), 'overreaching');
  });
});

describe('HRProfileCalculator', () => {
  it('computes all 4 HR zone methods (%HRR, %LTHR, %Max HR, Manual BPM) with 201 BPM ceiling', () => {
    const base = HRProfileCalculator.getFallbackSettings(51, 201);
    const acts = [makeActivity({ maxHeartRate: 190 })];

    for (const method of ['HRR', 'LTHR', 'MAX_HR', 'MANUAL_BPM'] as const) {
      const profile = HRProfileCalculator.calculateProfile(
        acts,
        51,
        201,
        undefined,
        undefined,
        { ...base, method }
      );
      assert.equal(profile.methodType, method);
      assert.equal(profile.zones.length, 5);
      assert.equal(profile.zones[4].maxBpm, 201);
      assert.ok(profile.zones[0].minBpm < profile.zones[4].minBpm);
    }
  });
});

describe('VO2MaxCalculator', () => {
  it('calculates Jack Daniels VDOT, 5-zone training paces, and race predictions', () => {
    const vdot5k20min = VO2MaxCalculator.calculateVDOT(5000, 1200);
    assert.ok(vdot5k20min >= 48 && vdot5k20min <= 52, `Unexpected VDOT: ${vdot5k20min}`);

    const paces = VO2MaxCalculator.calculateTrainingPaces(vdot5k20min);
    assert.equal(paces.length, 5);
    assert.deepEqual(
      paces.map(p => p.zoneKey),
      ['E', 'M', 'T', 'I', 'R']
    );
    // Easy pace must be slower (higher sec/km) than Repetition pace
    assert.ok(paces[0].minPaceSecPerKm > paces[4].minPaceSecPerKm);

    const prs: BestEffort[] = [
      {
        id: 'pr-5k',
        milestone: '5k',
        milestoneName: '5 Kilometers',
        targetMeters: 5000,
        timeSeconds: 1200,
        paceSecPerKm: 240,
        dateAchieved: new Date('2026-11-10T06:00:00Z'),
        activityId: 'act-1',
        activityName: '5K Time Trial',
        isAllTimePr: true,
        isYearPr: true,
      },
    ];
    const estimate = VO2MaxCalculator.evaluateAthleteVO2Max(prs);
    assert.equal(estimate.runningVo2Max, vdot5k20min);
    assert.equal(estimate.racePredictions.length, 4);
  });
});
