async function testFlows() {
  const cookie = 'pulse_demo_mode=1';
  const headers = { 'Cookie': cookie };
  const base = 'http://localhost:3000';

  console.log('=== STARTING AUTOMATED FLOW & API VERIFICATION ===\n');

  const tests = [
    { name: 'Landing Page (Public)', url: '/', expectStatus: 200, checkJson: false },
    { name: 'Dashboard Page (Demo Mode)', url: '/dashboard', expectStatus: 200, checkJson: false },
    { name: 'Fitness PMC Page (Demo Mode)', url: '/fitness', expectStatus: 200, checkJson: false },
    { name: 'Recovery Hub Page (Demo Mode)', url: '/recovery', expectStatus: 200, checkJson: false },
    { name: 'Activities List Page (Demo Mode)', url: '/activities', expectStatus: 200, checkJson: false },
    { name: 'Activity Detail Page [25136191911]', url: '/activities/25136191911', expectStatus: 200, checkJson: false },
    { name: 'Compare Activities Page', url: '/activities/compare', expectStatus: 200, checkJson: false },
    { name: 'Records Page', url: '/records', expectStatus: 200, checkJson: false },
    { name: 'Settings & Biometrics Page', url: '/settings', expectStatus: 200, checkJson: false },
    { name: 'API: Dashboard Telemetry', url: '/api/dashboard', expectStatus: 200, checkJson: true },
    { name: 'API: Fitness PMC Timeline', url: '/api/fitness', expectStatus: 200, checkJson: true },
    { name: 'API: Activities Collection', url: '/api/activities', expectStatus: 200, checkJson: true },
    { name: 'API: Activity Detail [25136191911]', url: '/api/activities/25136191911', expectStatus: 200, checkJson: true },
    { name: 'API: Garmin Sync Status', url: '/api/garmin/status', expectStatus: 200, checkJson: true },
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      const res = await fetch(base + t.url, { headers });
      const ok = res.status === t.expectStatus;
      let extra = '';

      if (t.checkJson && res.ok) {
        const data = await res.json();
        if (t.url === '/api/dashboard') {
          extra = ` (Hero Km: ${data.hero?.currentWeekDistanceKm ?? 'N/A'}, Activities: ${data.recentActivities?.length ?? 0})`;
        } else if (t.url === '/api/fitness') {
          extra = ` (Fitness: ${data.summary?.currentFitness ?? 'N/A'}, Fatigue: ${data.summary?.currentFatigue ?? 'N/A'}, Form: ${data.summary?.currentForm ?? 'N/A'})`;
        } else if (t.url === '/api/activities') {
          extra = ` (Total Activities: ${Array.isArray(data) ? data.length : data.activities?.length ?? 'OK'})`;
        } else if (t.url.includes('/api/activities/25136191911')) {
          extra = ` (Activity: ${data.name ?? data.activity?.name ?? 'OK'})`;
        } else if (t.url === '/api/garmin/status') {
          extra = ` (Connected: ${data.connected ?? data.isGarminConnected ?? 'OK'})`;
        }
      }

      if (ok) {
        console.log(`[PASS] ${t.name} -> HTTP ${res.status}${extra}`);
        passed++;
      } else {
        console.error(`[FAIL] ${t.name} -> Expected ${t.expectStatus}, got ${res.status}`);
        failed++;
      }
    } catch (e) {
      console.error(`[ERR] ${t.name} -> ${e.message}`);
      failed++;
    }
  }

  // Also test unauthenticated redirection guardrail
  try {
    const unauthRes = await fetch(base + '/dashboard', { redirect: 'manual' });
    if (unauthRes.status === 307) {
      console.log(`[PASS] Auth Guardrail (Unauthenticated /dashboard) -> HTTP 307 Redirect to Login`);
      passed++;
    } else {
      console.error(`[FAIL] Auth Guardrail -> Expected 307, got ${unauthRes.status}`);
      failed++;
    }
  } catch (e) {
    console.error(`[ERR] Auth Guardrail -> ${e.message}`);
    failed++;
  }

  console.log(`\n=== VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

testFlows();
