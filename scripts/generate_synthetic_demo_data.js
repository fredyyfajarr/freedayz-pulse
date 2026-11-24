const fs = require('fs');
const path = require('path');

// 1. Venues & Coordinate generators
// Center of Gelora Bung Karno (GBK) Stadium, Senayan, Jakarta Pusat
const GBK_LAT = -6.2185;
const GBK_LON = 106.8020;

// BSD Green Office Park Loop
const BSD_LAT = -6.3039;
const BSD_LON = 106.6542;

// Alam Sutera Green Belt Loop
const AS_LAT = -6.2235;
const AS_LON = 106.6582;

const VENUES = [
  { name: 'Gelora Bung Karno Track', lat: GBK_LAT, lon: GBK_LON, radius: 0.0035 },
  { name: 'BSD City Running Loop', lat: BSD_LAT, lon: BSD_LON, radius: 0.0050 },
  { name: 'Alam Sutera Green Belt', lat: AS_LAT, lon: AS_LON, radius: 0.0040 },
  { name: 'Gelora Bung Karno Track', lat: GBK_LAT, lon: GBK_LON, radius: 0.0035 },
];

function generateTrackPolyline(centerLat, centerLon, radius, distanceMeters, durationSeconds, startTimestamp) {
  // Generate a realistic closed oval loop running counter-clockwise
  const points = [];
  const numLoops = Math.max(1, Math.round(distanceMeters / 1000));
  const totalPoints = 180;
  
  for (let i = 0; i <= totalPoints; i++) {
    const frac = i / totalPoints;
    const angle = frac * numLoops * 2 * Math.PI;
    // Add oval elongation along North-South axis
    const latOffset = Math.sin(angle) * radius * 1.25 + (Math.sin(angle * 3) * 0.0002);
    const lonOffset = Math.cos(angle) * radius * 0.85 + (Math.cos(angle * 2) * 0.0001);
    
    const pointTime = startTimestamp + Math.round(frac * durationSeconds * 1000);
    const speed = distanceMeters / durationSeconds;
    
    points.push({
      lat: Number((centerLat + latOffset).toFixed(7)),
      lon: Number((centerLon + lonOffset).toFixed(7)),
      time: pointTime,
      speed: Number(speed.toFixed(2)),
    });
  }
  return points;
}

function generateSplits(distanceMeters, totalDurationSeconds, avgHr, avgCadence) {
  const kmCount = Math.floor(distanceMeters / 1000);
  const remainderMeters = distanceMeters - kmCount * 1000;
  const basePace = totalDurationSeconds / (distanceMeters / 1000);
  
  const splits = [];
  let elapsed = 0;
  
  for (let i = 1; i <= kmCount; i++) {
    // slight natural variation in split pace (+/- 4 seconds)
    const splitVariation = ((i % 3) - 1) * 3;
    const splitDuration = Math.round(basePace + splitVariation);
    elapsed += splitDuration;
    
    splits.push({
      splitNumber: i,
      distanceMeters: 1000,
      durationSeconds: splitDuration,
      paceSecPerKm: splitDuration,
      avgHeartRate: Math.round(avgHr - 4 + (i * 1.5)),
      elevationDiffMeters: Number(((i % 2 === 0 ? 1 : -1) * 2.2).toFixed(1)),
      avgCadence: Math.round(avgCadence + (i % 2)),
    });
  }
  
  if (remainderMeters > 50) {
    const remPace = Math.round(basePace - 2);
    const remDuration = Math.round((remainderMeters / 1000) * remPace);
    splits.push({
      splitNumber: kmCount + 1,
      distanceMeters: Math.round(remainderMeters),
      durationSeconds: remDuration,
      paceSecPerKm: remPace,
      avgHeartRate: avgHr + 5,
      elevationDiffMeters: 0.5,
      avgCadence: avgCadence + 2,
    });
  }
  
  return splits;
}

function generateMetricStream(distanceMeters, durationSeconds, avgHr, maxHr, avgCadence, startTimestamp) {
  const stream = [];
  const stepSeconds = Math.max(5, Math.floor(durationSeconds / 100));
  
  for (let s = 0; s <= durationSeconds; s += stepSeconds) {
    const frac = s / durationSeconds;
    const currentDist = frac * distanceMeters;
    const hr = Math.round(avgHr - 15 + frac * 20 + Math.sin(s / 60) * 3);
    const speed = distanceMeters / durationSeconds;
    const pace = Math.round(1000 / speed);
    
    stream.push({
      timestamp: startTimestamp + s * 1000,
      elapsedSeconds: s,
      distanceMeters: Number(currentDist.toFixed(1)),
      speedMps: Number(speed.toFixed(2)),
      paceSecPerKm: pace,
      heartRate: Math.min(maxHr, Math.max(100, hr)),
      cadence: Math.round(avgCadence + Math.sin(s / 40) * 2),
      elevationMeters: Number((15 + Math.sin(frac * 4) * 3).toFixed(1)),
      gradeAdjustedSpeedMps: Number(speed.toFixed(2)),
      bodyBattery: Math.max(20, Math.round(85 - frac * 15)),
      verticalOscillationCm: 7.2,
      groundContactTimeMs: 254,
      strideLengthM: Number((speed / (avgCadence / 60)).toFixed(2)),
    });
  }
  return stream;
}

// 2. Blueprint of 35 Synthetic Workouts (Sport Science Oriented)
const WORKOUT_BLUEPRINTS = [
  { name: 'Morning Easy Aerobic Base 5.7K', km: 5.72, paceSec: 320, hr: 142, maxHr: 154, label: 'AEROBIC_BASE', venueIdx: 0 },
  { name: 'Sunday Steady Long Run 10K', km: 10.05, paceSec: 335, hr: 148, maxHr: 162, label: 'AEROBIC_BASE', venueIdx: 1 },
  { name: 'Aerobic Recovery Flush 6K', km: 6.02, paceSec: 350, hr: 135, maxHr: 145, label: 'RECOVERY', venueIdx: 2 },
  { name: 'Pre-Race Strides & Dynamic Drills', km: 4.20, paceSec: 310, hr: 140, maxHr: 158, label: 'AEROBIC_BASE', venueIdx: 0 },
  { name: 'Sunset Easy Aerobic Jog 6.5K', km: 6.51, paceSec: 325, hr: 144, maxHr: 156, label: 'AEROBIC_BASE', venueIdx: 1 },
  { name: 'Lactate Threshold Tempo Run 5K', km: 5.02, paceSec: 255, hr: 168, maxHr: 178, label: 'LACTATE_THRESHOLD', venueIdx: 0 },
  { name: 'Progression Long Run 12K', km: 12.10, paceSec: 315, hr: 152, maxHr: 169, label: 'TEMPO', venueIdx: 1 },
  { name: 'Morning Recovery Run 5.7K', km: 5.70, paceSec: 345, hr: 136, maxHr: 146, label: 'RECOVERY', venueIdx: 0 },
  { name: 'Easy Aerobic Base Run 5K', km: 5.01, paceSec: 325, hr: 142, maxHr: 152, label: 'AEROBIC_BASE', venueIdx: 2 },
  { name: 'Zone 2 Low-Heart-Rate Flow 5K', km: 5.04, paceSec: 330, hr: 138, maxHr: 148, label: 'AEROBIC_BASE', venueIdx: 0 },
  { name: '5K Tempo Pace Intervals', km: 5.50, paceSec: 260, hr: 166, maxHr: 176, label: 'TEMPO', venueIdx: 1 },
  { name: 'Post-Run Active Recovery Flush', km: 4.50, paceSec: 360, hr: 132, maxHr: 142, label: 'RECOVERY', venueIdx: 0 },
  { name: 'Steady State Aerobic Run 5K', km: 5.00, paceSec: 315, hr: 146, maxHr: 158, label: 'AEROBIC_BASE', venueIdx: 2 },
  { name: 'Speed Endurance Maintenance 6K', km: 6.00, paceSec: 280, hr: 158, maxHr: 170, label: 'TEMPO', venueIdx: 0 },
  { name: 'Weekend Aerobic Long Run 10K', km: 10.02, paceSec: 330, hr: 149, maxHr: 164, label: 'AEROBIC_BASE', venueIdx: 1 },
  { name: 'Fast 5K Time Trial Session', km: 5.00, paceSec: 237, hr: 174, maxHr: 186, label: 'VO2MAX', venueIdx: 0 },
  { name: 'Cool-down Shakeout Jog 4.8K', km: 4.80, paceSec: 355, hr: 133, maxHr: 143, label: 'RECOVERY', venueIdx: 0 },
  { name: 'Aerobic Base Maintenance 5K', km: 5.03, paceSec: 322, hr: 143, maxHr: 154, label: 'AEROBIC_BASE', venueIdx: 2 },
  { name: 'Morning Easy Z2 Jog 5.6K', km: 5.62, paceSec: 328, hr: 140, maxHr: 150, label: 'AEROBIC_BASE', venueIdx: 1 },
  { name: 'Cadence & Form Stride Drills', km: 4.50, paceSec: 300, hr: 150, maxHr: 168, label: 'AEROBIC_BASE', venueIdx: 0 },
  { name: 'Sub-Threshold Long Run 11K', km: 11.20, paceSec: 295, hr: 160, maxHr: 172, label: 'TEMPO', venueIdx: 1 },
  { name: 'Easy Aerobic Flush 4.8K', km: 4.81, paceSec: 340, hr: 137, maxHr: 147, label: 'RECOVERY', venueIdx: 2 },
  { name: 'Midweek Steady Tempo 5K', km: 5.00, paceSec: 265, hr: 165, maxHr: 175, label: 'TEMPO', venueIdx: 0 },
  { name: 'Zone 3 Aerobic Flow Run 5K', km: 5.02, paceSec: 305, hr: 152, maxHr: 163, label: 'AEROBIC_BASE', venueIdx: 1 },
  { name: 'Endurance Base Builder 10K', km: 10.15, paceSec: 325, hr: 148, maxHr: 162, label: 'AEROBIC_BASE', venueIdx: 0 },
  { name: 'Recovery Strides & Mobility 4K', km: 4.10, paceSec: 360, hr: 130, maxHr: 140, label: 'RECOVERY', venueIdx: 2 },
  { name: 'Easy Zone 2 Morning Run 5.4K', km: 5.40, paceSec: 325, hr: 141, maxHr: 151, label: 'AEROBIC_BASE', venueIdx: 0 },
  { name: 'Interval VO2Max Track Repeats', km: 6.40, paceSec: 240, hr: 172, maxHr: 185, label: 'VO2MAX', venueIdx: 0 },
  { name: 'Sunday Long Run Session 10K', km: 10.00, paceSec: 320, hr: 150, maxHr: 165, label: 'AEROBIC_BASE', venueIdx: 1 },
  { name: '5K Race Pace Simulation', km: 5.00, paceSec: 245, hr: 170, maxHr: 182, label: 'LACTATE_THRESHOLD', venueIdx: 0 },
  { name: 'Threshold Intervals 5K', km: 5.20, paceSec: 255, hr: 167, maxHr: 179, label: 'LACTATE_THRESHOLD', venueIdx: 1 },
  { name: 'Recovery Shakeout Run 5.6K', km: 5.60, paceSec: 348, hr: 135, maxHr: 145, label: 'RECOVERY', venueIdx: 0 },
  { name: 'Easy Aerobic Base Jog 6.2K', km: 6.20, paceSec: 324, hr: 143, maxHr: 155, label: 'AEROBIC_BASE', venueIdx: 2 },
  { name: 'Sunday Half Marathon Steady 21K', km: 21.10, paceSec: 310, hr: 155, maxHr: 171, label: 'TEMPO', venueIdx: 1 },
  { name: 'Steady Aerobic Pace Run 5K', km: 5.00, paceSec: 318, hr: 145, maxHr: 157, label: 'AEROBIC_BASE', venueIdx: 0 },
];

function main() {
  console.log('Generating 100% synthetic, sports-science dummy data for athlete Bimo Pratama...');
  
  const activities = [];
  const baseDate = new Date('2026-11-23T06:00:00.000Z');
  
  // Clean out data/details directory
  const detailsDir = path.join(process.cwd(), 'data', 'details');
  if (fs.existsSync(detailsDir)) {
    const existingDetails = fs.readdirSync(detailsDir);
    existingDetails.forEach(f => {
      fs.unlinkSync(path.join(detailsDir, f));
    });
  } else {
    fs.mkdirSync(detailsDir, { recursive: true });
  }

  for (let i = 0; i < WORKOUT_BLUEPRINTS.length; i++) {
    const bp = WORKOUT_BLUEPRINTS[i];
    const id = '90000000' + String(i + 1).padStart(2, '0');
    const venue = VENUES[bp.venueIdx];
    
    // Distribute timestamps back in time (e.g., every 1.5 - 2 days)
    const daysAgo = Math.round(i * 1.6);
    const actDate = new Date(baseDate.getTime() - daysAgo * 24 * 3600 * 1000);
    actDate.setHours(6, 15, 0, 0);
    
    const distanceMeters = Math.round(bp.km * 1000);
    const durationSeconds = Math.round((distanceMeters / 1000) * bp.paceSec);
    const avgSpeed = Number((distanceMeters / durationSeconds).toFixed(2));
    const maxSpeed = Number((avgSpeed * 1.25).toFixed(2));
    
    // Heart rate zones distribution
    const z1 = Math.round(durationSeconds * 0.15);
    const z2 = Math.round(durationSeconds * (bp.label === 'AEROBIC_BASE' || bp.label === 'RECOVERY' ? 0.75 : 0.25));
    const z3 = Math.round(durationSeconds * (bp.label === 'TEMPO' ? 0.50 : 0.08));
    const z4 = Math.round(durationSeconds * (bp.label === 'LACTATE_THRESHOLD' ? 0.55 : 0.02));
    const z5 = durationSeconds - (z1 + z2 + z3 + z4);
    
    const cadence = bp.label === 'VO2MAX' ? 184 : bp.label === 'LACTATE_THRESHOLD' ? 180 : 176;
    const power = Math.round(180 + (1000 / bp.paceSec) * 22);
    
    const activity = {
      id: id,
      externalId: Number(id),
      name: bp.name,
      sportType: 'running',
      startTime: actDate.toISOString(),
      startTimeLocalStr: actDate.toISOString().replace('T', ' ').slice(0, 19),
      distanceMeters: distanceMeters,
      durationSeconds: durationSeconds,
      movingDurationSeconds: durationSeconds - 8,
      elevationGainMeters: 18,
      elevationLossMeters: 16,
      avgSpeedMps: avgSpeed,
      maxSpeedMps: maxSpeed,
      avgPaceSecPerKm: bp.paceSec,
      maxPaceSecPerKm: Math.round(bp.paceSec * 0.8),
      avgGradeAdjustedSpeedMps: avgSpeed,
      avgHeartRate: bp.hr,
      maxHeartRate: bp.maxHr,
      hrZones: {
        zone1Seconds: z1,
        zone2Seconds: z2,
        zone3Seconds: z3,
        zone4Seconds: Math.max(0, z4),
        zone5Seconds: Math.max(0, z5),
        totalZoneSeconds: durationSeconds
      },
      avgPowerWatts: power,
      maxPowerWatts: Math.round(power * 1.3),
      normalizedPowerWatts: Math.round(power * 1.05),
      dynamics: {
        avgCadence: cadence,
        maxCadence: cadence + 12,
        avgStrideLengthMeters: 1.12,
        avgGroundContactTimeMs: 250,
        avgVerticalOscillationCm: 7.2,
        avgVerticalRatioPercent: 8.5,
        avgGroundContactBalanceLeftPercent: 50.1,
        avgGroundContactBalanceRightPercent: 49.9
      },
      calories: Math.round(bp.km * 64),
      steps: Math.round((durationSeconds / 60) * cadence),
      aerobicTrainingEffect: bp.label === 'AEROBIC_BASE' ? 2.8 : bp.label === 'TEMPO' ? 3.6 : bp.label === 'VO2MAX' ? 4.2 : 2.1,
      trainingEffectLabel: bp.label,
      differenceBodyBattery: -8,
      relativeEffortScore: Math.round(durationSeconds / 30),
      fastest1000mSeconds: Math.round(bp.paceSec * 0.95),
      fastest1609mSeconds: Math.round(bp.paceSec * 1.55),
      fastest5000mSeconds: distanceMeters >= 5000 ? Math.round(bp.paceSec * 5) : 0,
      minTemperatureCelsius: 26,
      maxTemperatureCelsius: 29,
      locationName: venue.name,
      hasGpsData: true,
      startLatitude: venue.lat,
      startLongitude: venue.lon
    };
    
    activities.push(activity);
    
    // Generate Detail file
    const polyline = generateTrackPolyline(venue.lat, venue.lon, venue.radius, distanceMeters, durationSeconds, actDate.getTime());
    const splits = generateSplits(distanceMeters, durationSeconds, bp.hr, cadence);
    const metricStream = generateMetricStream(distanceMeters, durationSeconds, bp.hr, bp.maxHr, cadence, actDate.getTime());
    
    const detail = {
      activityId: id,
      polyline: polyline,
      metricStream: metricStream,
      splits: splits,
      boundingBox: {
        minLat: Number((venue.lat - venue.radius * 1.4).toFixed(6)),
        maxLat: Number((venue.lat + venue.radius * 1.4).toFixed(6)),
        minLon: Number((venue.lon - venue.radius * 1.4).toFixed(6)),
        maxLon: Number((venue.lon + venue.radius * 1.4).toFixed(6)),
      }
    };
    
    fs.writeFileSync(path.join(detailsDir, `${id}.json`), JSON.stringify(detail, null, 2), 'utf8');
  }

  // Save activities.json
  fs.writeFileSync(path.join(process.cwd(), 'data', 'activities.json'), JSON.stringify(activities, null, 2), 'utf8');
  console.log(`Saved ${activities.length} synthetic activities and details!`);

  // 3. Best Efforts
  const bestEfforts = [
    {
      id: 'pr-1k',
      milestone: '1k',
      milestoneName: '1 Kilometer',
      targetMeters: 1000,
      timeSeconds: 208, // 3:28
      paceSecPerKm: 208,
      dateAchieved: new Date('2026-11-15T06:30:00.000Z').toISOString(),
      activityId: '9000000016',
      activityName: 'Fast 5K Time Trial Session',
      isAllTimePr: true,
      isYearPr: true
    },
    {
      id: 'pr-1mi',
      milestone: '1mi',
      milestoneName: '1 Mile',
      targetMeters: 1609.34,
      timeSeconds: 348, // 5:48
      paceSecPerKm: 216,
      dateAchieved: new Date('2026-11-15T06:30:00.000Z').toISOString(),
      activityId: '9000000016',
      activityName: 'Fast 5K Time Trial Session',
      isAllTimePr: true,
      isYearPr: true
    },
    {
      id: 'pr-5k',
      milestone: '5k',
      milestoneName: '5 Kilometers',
      targetMeters: 5000,
      timeSeconds: 1185, // 19:45
      paceSecPerKm: 237,
      dateAchieved: new Date('2026-11-15T06:30:00.000Z').toISOString(),
      activityId: '9000000016',
      activityName: 'Fast 5K Time Trial Session',
      isAllTimePr: true,
      isYearPr: true
    },
    {
      id: 'pr-10k',
      milestone: '10k',
      milestoneName: '10 Kilometers',
      targetMeters: 10000,
      timeSeconds: 2535, // 42:15
      paceSecPerKm: 253.5,
      dateAchieved: new Date('2026-11-04T06:00:00.000Z').toISOString(),
      activityId: '9000000025',
      activityName: 'Endurance Base Builder 10K',
      isAllTimePr: true,
      isYearPr: true
    },
    {
      id: 'pr-half_marathon',
      milestone: 'half_marathon',
      milestoneName: 'Half Marathon',
      targetMeters: 21097.5,
      timeSeconds: 5780, // 1:36:20
      paceSecPerKm: 274,
      dateAchieved: new Date('2026-10-18T05:30:00.000Z').toISOString(),
      activityId: '9000000034',
      activityName: 'Sunday Half Marathon Steady 21K',
      isAllTimePr: true,
      isYearPr: true
    }
  ];
  fs.writeFileSync(path.join(process.cwd(), 'data', 'best-efforts.json'), JSON.stringify(bestEfforts, null, 2), 'utf8');
  console.log('Saved synthetic best-efforts.json!');

  // 4. Health Snapshot
  const healthSnapshot = {
    dailySummary: {
      calendarDate: '2026-11-24',
      restingHeartRate: 50,
      lastSevenDaysAvgRestingHeartRate: 50,
      minHeartRate: 45,
      maxHeartRate: 168,
      bodyBattery: {
        mostRecentValue: 88,
        chargedValue: 72,
        drainedValue: 24,
        highestValue: 96,
        lowestValue: 24,
        duringSleepValue: 72
      },
      stress: {
        averageLevel: 18,
        maxLevel: 48,
        stressDurationSec: 4200,
        restStressDurationSec: 21600,
        activityStressDurationSec: 3600,
        qualifier: 'CALM'
      },
      sleep: {
        sleepingSeconds: 27900,
        measurableAsleepDurationSec: 27900,
        measurableAwakeDurationSec: 1800,
        formattedHours: '7h 45m',
        sleepScore: 88,
        sleepQuality: 'EXCELLENT',
        restStressDurationSec: 21600,
        bodyBatteryChargedDuringSleep: 72
      },
      steps: 12450,
      activeKilocalories: 580,
      totalKilocalories: 2420,
      avgWakingRespiration: 13
    },
    dailyHistory: [
      {
        calendarDate: '2026-11-18',
        restingHeartRate: 51,
        lastSevenDaysAvgRestingHeartRate: 51,
        minHeartRate: 46,
        maxHeartRate: 164,
        bodyBattery: { mostRecentValue: 85, chargedValue: 68, drainedValue: 30, highestValue: 92, lowestValue: 22, duringSleepValue: 68 },
        stress: { averageLevel: 20, maxLevel: 55, stressDurationSec: 5400, restStressDurationSec: 19800, activityStressDurationSec: 3600, qualifier: 'BALANCED' },
        sleep: { sleepingSeconds: 26400, measurableAsleepDurationSec: 26400, measurableAwakeDurationSec: 2100, formattedHours: '7h 20m', sleepScore: 84, sleepQuality: 'GOOD', restStressDurationSec: 19800, bodyBatteryChargedDuringSleep: 68 },
        steps: 11200, activeKilocalories: 520, totalKilocalories: 2360, avgWakingRespiration: 14
      },
      {
        calendarDate: '2026-11-19',
        restingHeartRate: 50,
        lastSevenDaysAvgRestingHeartRate: 50,
        minHeartRate: 45,
        maxHeartRate: 172,
        bodyBattery: { mostRecentValue: 82, chargedValue: 65, drainedValue: 35, highestValue: 90, lowestValue: 20, duringSleepValue: 65 },
        stress: { averageLevel: 21, maxLevel: 58, stressDurationSec: 6000, restStressDurationSec: 19200, activityStressDurationSec: 3800, qualifier: 'BALANCED' },
        sleep: { sleepingSeconds: 25800, measurableAsleepDurationSec: 25800, measurableAwakeDurationSec: 2400, formattedHours: '7h 10m', sleepScore: 82, sleepQuality: 'GOOD', restStressDurationSec: 19200, bodyBatteryChargedDuringSleep: 65 },
        steps: 13500, activeKilocalories: 610, totalKilocalories: 2450, avgWakingRespiration: 14
      },
      {
        calendarDate: '2026-11-20',
        restingHeartRate: 49,
        lastSevenDaysAvgRestingHeartRate: 50,
        minHeartRate: 44,
        maxHeartRate: 158,
        bodyBattery: { mostRecentValue: 90, chargedValue: 74, drainedValue: 22, highestValue: 98, lowestValue: 24, duringSleepValue: 74 },
        stress: { averageLevel: 16, maxLevel: 42, stressDurationSec: 3600, restStressDurationSec: 22800, activityStressDurationSec: 3000, qualifier: 'RESTFUL' },
        sleep: { sleepingSeconds: 28800, measurableAsleepDurationSec: 28800, measurableAwakeDurationSec: 1500, formattedHours: '8h 00m', sleepScore: 92, sleepQuality: 'EXCELLENT', restStressDurationSec: 22800, bodyBatteryChargedDuringSleep: 74 },
        steps: 9800, activeKilocalories: 430, totalKilocalories: 2270, avgWakingRespiration: 13
      },
      {
        calendarDate: '2026-11-21',
        restingHeartRate: 50,
        lastSevenDaysAvgRestingHeartRate: 50,
        minHeartRate: 45,
        maxHeartRate: 166,
        bodyBattery: { mostRecentValue: 86, chargedValue: 70, drainedValue: 28, highestValue: 94, lowestValue: 24, duringSleepValue: 70 },
        stress: { averageLevel: 19, maxLevel: 52, stressDurationSec: 4800, restStressDurationSec: 20400, activityStressDurationSec: 3600, qualifier: 'BALANCED' },
        sleep: { sleepingSeconds: 27000, measurableAsleepDurationSec: 27000, measurableAwakeDurationSec: 1800, formattedHours: '7h 30m', sleepScore: 86, sleepQuality: 'GOOD', restStressDurationSec: 20400, bodyBatteryChargedDuringSleep: 70 },
        steps: 12100, activeKilocalories: 550, totalKilocalories: 2390, avgWakingRespiration: 13
      },
      {
        calendarDate: '2026-11-22',
        restingHeartRate: 50,
        lastSevenDaysAvgRestingHeartRate: 50,
        minHeartRate: 45,
        maxHeartRate: 175,
        bodyBattery: { mostRecentValue: 84, chargedValue: 68, drainedValue: 32, highestValue: 92, lowestValue: 22, duringSleepValue: 68 },
        stress: { averageLevel: 22, maxLevel: 60, stressDurationSec: 6200, restStressDurationSec: 19000, activityStressDurationSec: 4200, qualifier: 'BALANCED' },
        sleep: { sleepingSeconds: 26400, measurableAsleepDurationSec: 26400, measurableAwakeDurationSec: 2200, formattedHours: '7h 20m', sleepScore: 85, sleepQuality: 'GOOD', restStressDurationSec: 19000, bodyBatteryChargedDuringSleep: 68 },
        steps: 14200, activeKilocalories: 680, totalKilocalories: 2520, avgWakingRespiration: 14
      },
      {
        calendarDate: '2026-11-23',
        restingHeartRate: 49,
        lastSevenDaysAvgRestingHeartRate: 50,
        minHeartRate: 44,
        maxHeartRate: 160,
        bodyBattery: { mostRecentValue: 89, chargedValue: 73, drainedValue: 25, highestValue: 97, lowestValue: 24, duringSleepValue: 73 },
        stress: { averageLevel: 17, maxLevel: 45, stressDurationSec: 3900, restStressDurationSec: 22200, activityStressDurationSec: 3200, qualifier: 'RESTFUL' },
        sleep: { sleepingSeconds: 28200, measurableAsleepDurationSec: 28200, measurableAwakeDurationSec: 1600, formattedHours: '7h 50m', sleepScore: 90, sleepQuality: 'EXCELLENT', restStressDurationSec: 22200, bodyBatteryChargedDuringSleep: 73 },
        steps: 10500, activeKilocalories: 480, totalKilocalories: 2320, avgWakingRespiration: 13
      },
      {
        calendarDate: '2026-11-24',
        restingHeartRate: 50,
        lastSevenDaysAvgRestingHeartRate: 50,
        minHeartRate: 45,
        maxHeartRate: 168,
        bodyBattery: { mostRecentValue: 88, chargedValue: 72, drainedValue: 24, highestValue: 96, lowestValue: 24, duringSleepValue: 72 },
        stress: { averageLevel: 18, maxLevel: 48, stressDurationSec: 4200, restStressDurationSec: 21600, activityStressDurationSec: 3600, qualifier: 'CALM' },
        sleep: { sleepingSeconds: 27900, measurableAsleepDurationSec: 27900, measurableAwakeDurationSec: 1800, formattedHours: '7h 45m', sleepScore: 88, sleepQuality: 'EXCELLENT', restStressDurationSec: 21600, bodyBatteryChargedDuringSleep: 72 },
        steps: 12450, activeKilocalories: 580, totalKilocalories: 2420, avgWakingRespiration: 13
      }
    ],
    latestHrv: {
      calendarDate: '2026-11-24',
      weeklyAvg: 68,
      lastNightAvg: 72,
      lastNight5MinHigh: 94,
      status: 'BALANCED',
      feedbackPhrase: 'HRV_BALANCED_OPTIMAL',
      baseline: { lowUpper: 55, balancedLow: 58, balancedUpper: 78 }
    },
    hrvHistory: [
      { calendarDate: '2026-11-18', weeklyAvg: 67, lastNightAvg: 69, lastNight5MinHigh: 91, status: 'BALANCED', baseline: { lowUpper: 55, balancedLow: 58, balancedUpper: 78 } },
      { calendarDate: '2026-11-19', weeklyAvg: 67, lastNightAvg: 66, lastNight5MinHigh: 88, status: 'BALANCED', baseline: { lowUpper: 55, balancedLow: 58, balancedUpper: 78 } },
      { calendarDate: '2026-11-20', weeklyAvg: 68, lastNightAvg: 73, lastNight5MinHigh: 95, status: 'BALANCED', baseline: { lowUpper: 55, balancedLow: 58, balancedUpper: 78 } },
      { calendarDate: '2026-11-21', weeklyAvg: 68, lastNightAvg: 70, lastNight5MinHigh: 92, status: 'BALANCED', baseline: { lowUpper: 55, balancedLow: 58, balancedUpper: 78 } },
      { calendarDate: '2026-11-22', weeklyAvg: 67, lastNightAvg: 68, lastNight5MinHigh: 90, status: 'BALANCED', baseline: { lowUpper: 55, balancedLow: 58, balancedUpper: 78 } },
      { calendarDate: '2026-11-23', weeklyAvg: 68, lastNightAvg: 74, lastNight5MinHigh: 96, status: 'BALANCED', baseline: { lowUpper: 55, balancedLow: 58, balancedUpper: 78 } },
      { calendarDate: '2026-11-24', weeklyAvg: 68, lastNightAvg: 72, lastNight5MinHigh: 94, status: 'BALANCED', baseline: { lowUpper: 55, balancedLow: 58, balancedUpper: 78 } }
    ],
    vo2MaxEstimate: {
      runningVo2Max: 51.5,
      fitnessCategory: 'EXCELLENT',
      source: 'Jack Daniels VDOT // Calibrated from 5 Kilometers PR (19:45)',
      racePredictions: [
        { distanceLabel: '5K RACE', distanceMeters: 5000, predictedTimeSeconds: 1185, predictedPaceSecPerKm: 237 },
        { distanceLabel: '10K RACE', distanceMeters: 10000, predictedTimeSeconds: 2460, predictedPaceSecPerKm: 246 },
        { distanceLabel: 'HALF MARATHON (21.1K)', distanceMeters: 21097, predictedTimeSeconds: 5450, predictedPaceSecPerKm: 258 },
        { distanceLabel: 'MARATHON (42.2K)', distanceMeters: 42195, predictedTimeSeconds: 11380, predictedPaceSecPerKm: 270 }
      ],
      trainingPaces: [
        {
          zoneKey: 'E',
          name: 'EASY / RECOVERY (E)',
          nameId: 'LARI SANTAI / PEMULIHAN (E)',
          intensityDesc: '62% – 70% VO2Max',
          intensityDescId: '62% – 70% VO2Max',
          purpose: 'Aerobic base building, active recovery, and cardiac capillary density.',
          purposeId: 'Membangun fondasi aerobik, regenerasi seluler, dan kapilarisasi otot jantung.',
          minPaceSecPerKm: 305,
          maxPaceSecPerKm: 335,
          paceFormatted: '5:05 – 5:35 /km',
          split400m: '2:02 – 2:14',
          split1000m: '5:05 – 5:35'
        },
        {
          zoneKey: 'M',
          name: 'MARATHON PACE (M)',
          nameId: 'PACE MARATHON (M)',
          intensityDesc: '~80% VO2Max',
          intensityDescId: '~80% VO2Max',
          purpose: 'Steady-state race simulation, fat-metabolism adaptation for 21K & 42K.',
          purposeId: 'Simulasi ritme balapan, efisiensi pembakaran lemak untuk jarak 21K & 42K.',
          minPaceSecPerKm: 270,
          paceFormatted: '4:30 /km',
          split400m: '1:48',
          split1000m: '4:30'
        },
        {
          zoneKey: 'T',
          name: 'THRESHOLD / TEMPO (T)',
          nameId: 'AMBANG LAKTAT / TEMPO (T)',
          intensityDesc: '~88% VO2Max',
          intensityDescId: '~88% VO2Max',
          purpose: 'Elevates lactate clearance threshold; comfortably hard, sustainable for 40–60 min.',
          purposeId: 'Meningkatkan ambang pembuangan asam laktat; intensitas terukur selama 20–50 menit.',
          minPaceSecPerKm: 250,
          paceFormatted: '4:10 /km',
          split400m: '1:40',
          split1000m: '4:10'
        },
        {
          zoneKey: 'I',
          name: 'INTERVAL (I)',
          nameId: 'INTERVAL VO2MAX (I)',
          intensityDesc: '~98% VO2Max',
          intensityDescId: '~98% VO2Max',
          purpose: 'Maximizes aerobic power and oxygen delivery (3–5 min track repetitions).',
          purposeId: 'Memaksimalkan kapasitas serapan oksigen (VO2Max) dengan repetisi track 400m–1200m.',
          minPaceSecPerKm: 230,
          paceFormatted: '3:50 /km',
          split400m: '1:32',
          split1000m: '3:50'
        },
        {
          zoneKey: 'R',
          name: 'REPETITION (R)',
          nameId: 'REPETISI KECEPATAN (R)',
          intensityDesc: '~110% VO2Max',
          intensityDescId: '~110% VO2Max',
          purpose: 'Anaerobic power, stride biomechanics, neuromuscular economy and speed.',
          purposeId: 'Kecepatan anaerobik murni, koordinasi neuromuskular, dan mekanika langkah cepat.',
          minPaceSecPerKm: 215,
          paceFormatted: '3:35 /km',
          split400m: '1:26',
          split1000m: '3:35'
        }
      ]
    },
    lastSync: new Date().toISOString()
  };
  fs.writeFileSync(path.join(process.cwd(), 'data', 'health-snapshot.json'), JSON.stringify(healthSnapshot, null, 2), 'utf8');
  console.log('Saved synthetic health-snapshot.json!');
  
  // 5. Sync State
  fs.writeFileSync(path.join(process.cwd(), 'data', 'sync-state.json'), JSON.stringify({ lastSync: new Date().toISOString() }, null, 2), 'utf8');
  console.log('Saved synthetic sync-state.json!');
}

main();
