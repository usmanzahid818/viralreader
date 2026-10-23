import http from 'http';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

async function request(options: {
  path: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<{ status: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const payload = options.body ? JSON.stringify(options.body) : '';
    const port = parseInt(process.env.DEFAULT_APP_PORT || '3000', 10);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: port,
        path: options.path,
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...(options.headers || {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let data;
          try {
            data = raw ? JSON.parse(raw) : null;
          } catch {
            data = raw;
          }
          resolve({ status: res.statusCode || 500, data, headers: res.headers });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`PASS: ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message });
    console.error(`FAIL: ${name} -> ${err.message}`);
  }
}

async function main() {
  console.log('--- STARTING VIRALREADER COMPREHENSIVE TEST SUITE ---\n');

  // Test 1: Health Check
  await runTest('Server Health Check (/api/health)', async () => {
    const res = await request({ path: '/api/health', method: 'GET' });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.status === 'ok', 'Status was not ok');
  });

  // Test 2: Unauthenticated /api/auth/me should fail
  await runTest('Unauthenticated access to /api/auth/me returns 401', async () => {
    const res = await request({ path: '/api/auth/me', method: 'GET' });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  // Test 3: Normal user signup
  const testUserEmail = `creator_${Date.now()}@testviralreader.com`;
  const testUserPassword = 'securePassword123';
  let userToken = '';
  let userId = '';

  await runTest('User Signup (/api/auth/signup)', async () => {
    const res = await request({
      path: '/api/auth/signup',
      method: 'POST',
      body: {
        email: testUserEmail,
        password: testUserPassword,
        displayName: 'Test Creator',
      },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.success === true, 'Signup was not successful');
    assert(Boolean(res.data.token), 'No token returned');
    assert(res.data.user.role === 'user', 'Role must default to user, not admin');
    assert(res.data.user.email === testUserEmail, 'Email mismatch');
    userToken = res.data.token;
    userId = res.data.user.id;
  });

  // Test 4: Duplicate signup rejection
  await runTest('Duplicate Signup Rejected with 409', async () => {
    const res = await request({
      path: '/api/auth/signup',
      method: 'POST',
      body: {
        email: testUserEmail,
        password: testUserPassword,
      },
    });
    assert(res.status === 409, `Expected 409, got ${res.status}`);
  });

  // Test 5: Login with invalid password
  await runTest('Login with incorrect password returns 401', async () => {
    const res = await request({
      path: '/api/auth/login',
      method: 'POST',
      body: {
        email: testUserEmail,
        password: 'wrongPassword999',
      },
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  // Test 6: Successful Login
  await runTest('User Login (/api/auth/login)', async () => {
    const res = await request({
      path: '/api/auth/login',
      method: 'POST',
      body: {
        email: testUserEmail,
        password: testUserPassword,
      },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Boolean(res.data.token), 'Token missing in login response');
    userToken = res.data.token;
  });

  // Test 7: Session restoration via GET /api/auth/me
  await runTest('Session restoration (/api/auth/me)', async () => {
    const res = await request({
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.user.email === testUserEmail, 'Restored session email mismatch');
  });

  // Test 8: Non-admin user blocked from admin endpoints
  await runTest('Normal user blocked from /api/admin/overview (HTTP 403)', async () => {
    const res = await request({
      path: '/api/admin/overview',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await runTest('Normal user blocked from /api/admin/users (HTTP 403)', async () => {
    const res = await request({
      path: '/api/admin/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await runTest('Normal user blocked from /api/admin/settings (HTTP 403)', async () => {
    const res = await request({
      path: '/api/admin/settings',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  // Test 9: Admin authentication
  const adminEmail = process.env.ADMIN_EMAIL || '';
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  let adminToken = '';

  if (adminEmail && adminPassword) {
    await runTest('Admin Login with Environment Credentials', async () => {
      const res = await request({
        path: '/api/auth/login',
        method: 'POST',
        body: { email: adminEmail, password: adminPassword },
      });
      assert(res.status === 200, `Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
      assert(res.data.user.role === 'admin', 'Role must be admin');
      adminToken = res.data.token;
    });

    await runTest('Admin access to /api/admin/overview', async () => {
      const res = await request({
        path: '/api/admin/overview',
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(typeof res.data.totalUsers === 'number', 'totalUsers missing');
    });

    await runTest('Admin user plan update (/api/admin/update-user-plan)', async () => {
      const res = await request({
        path: '/api/admin/update-user-plan',
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { targetUserId: userId, newPlan: 'pro' },
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.data.user.plan === 'pro', 'Plan was not updated to pro');
    });

    await runTest('Admin user status toggle (/api/admin/toggle-user-status)', async () => {
      const res = await request({
        path: '/api/admin/toggle-user-status',
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { targetUserId: userId, status: 'suspended' },
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.data.user.status === 'suspended', 'Status not suspended');

      // Check that suspended user is blocked from making authenticated requests
      const testReq = await request({
        path: '/api/auth/me',
        method: 'GET',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      assert(testReq.status === 401, 'Suspended user should have been evicted/denied');

      // Re-activate user
      const reactivate = await request({
        path: '/api/admin/toggle-user-status',
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { targetUserId: userId, status: 'active' },
      });
      assert(reactivate.status === 200, 'Reactivation failed');
    });

    await runTest('Admin platform settings update (/api/admin/settings)', async () => {
      const res = await request({
        path: '/api/admin/settings',
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          announcementBanner: {
            enabled: true,
            text: 'Live viral trend telemetry operational.',
            level: 'info',
          },
        },
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.data.settings.announcementBanner.text === 'Live viral trend telemetry operational.', 'Banner text mismatch');
    });
  } else {
    console.log('SKIP: Admin credential tests (ADMIN_EMAIL/ADMIN_PASSWORD not set in test environment)');
  }

  // Test 10: Per-user Saved Content Storage
  await runTest('Per-user Saved Video Bookmark (/api/user/save-item)', async () => {
    // Re-login user to get fresh token after suspension test
    const loginRes = await request({
      path: '/api/auth/login',
      method: 'POST',
      body: { email: testUserEmail, password: testUserPassword },
    });
    userToken = loginRes.data.token;

    const res = await request({
      path: '/api/user/save-item',
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        itemType: 'video',
        item: {
          id: 'test-vid-123',
          videoId: 'test-vid-123',
          title: 'Testing Viral Metrics',
          savedAt: new Date().toISOString(),
        },
      },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);

    const getSaved = await request({
      path: '/api/user/saved-data',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(getSaved.status === 200, `Expected 200, got ${getSaved.status}`);
    assert(getSaved.data.savedVideos.length > 0, 'Saved videos empty');
  });

  // Test 11: Public Announcement Banner (/api/platform/announcement)
  await runTest('Public Platform Announcement (/api/platform/announcement)', async () => {
    const res = await request({ path: '/api/platform/announcement', method: 'GET' });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Boolean(res.data.announcement), 'Announcement object missing');
  });

  // Test 12: YouTube Search Route (/api/youtube/search)
  await runTest('YouTube Search Live Query / Demo Fallback (/api/youtube/search)', async () => {
    const res = await request({
      path: '/api/youtube/search',
      method: 'POST',
      body: { categoryName: 'All', viewType: 'dashboard', maxResults: 5 },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data.videos), 'Videos array missing');
    assert(res.data.videos.length > 0, 'No videos returned');
    assert(Boolean(res.data.videos[0].title), 'Video title missing');
    assert(typeof res.data.videos[0].viralScore === 'number', 'Viral score missing');
  });

  // Test 13: Gemini AI Trend Analysis (/api/gemini/analyze)
  await runTest('Gemini AI Trend Analysis (/api/gemini/analyze)', async () => {
    const res = await request({
      path: '/api/gemini/analyze',
      method: 'POST',
      body: {
        videoTitle: 'How Solo Creators Win in 2026',
        channelName: 'Solo Builder Nomad',
        category: 'Business & Finance',
        views: 240000,
        publishDate: '2026-10-18',
        outlierScore: 4.8,
        viralScore: 92,
      },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Boolean(res.data.summary), 'Summary missing');
    assert(Array.isArray(res.data.contentIdeas), 'Content ideas missing');
    assert(res.data.contentIdeas.length > 0, 'Content ideas empty');
  });

  // Test 14: Logout
  await runTest('User Logout (/api/auth/logout)', async () => {
    const res = await request({
      path: '/api/auth/logout',
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);

    // Verify token is invalidated
    const checkMe = await request({
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(checkMe.status === 401, 'Token should be invalid after logout');
  });

  // Summary
  console.log('\n--- TEST SUITE SUMMARY ---');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`TOTAL: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);

  if (failed > 0) {
    console.error('Some tests failed!');
    process.exit(1);
  } else {
    console.log('ALL TESTS PASSED CLEANLY!');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
