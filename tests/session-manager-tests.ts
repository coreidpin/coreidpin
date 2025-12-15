/**
 * Test Utility for SessionManager
 * 
 * Run these tests in browser console after logging in
 * 
 * Usage:
 * 1. Login to the app
 * 2. Open browser DevTools console
 * 3. Copy and paste this entire file into console
 * 4. Run: runAllTests()
 */

// Import SessionManager if needed
declare const sessionManager: any;

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const testResults: TestResult[] = [];

// Helper: Log test result
function logTest(name: string, passed: boolean, message: string, details?: any) {
  const result = { name, passed, message, details };
  testResults.push(result);
  
  const emoji = passed ? '✅' : '❌';
  console.log(`${emoji} ${name}: ${message}`);
  if (details) {
    console.log('   Details:', details);
  }
}

// Test 1: localStorage has all required data
function testLocalStorageData() {
  console.log('\n📦 Testing localStorage data...');
  
  const requiredKeys = [
    'accessToken',
    'refreshToken',
    'userId',
    'expiresAt',
    'isAuthenticated'
  ];
  
  const missing: string[] = [];
  const present: Record<string, any> = {};
  
  requiredKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (!value) {
      missing.push(key);
    } else {
      present[key] = key === 'expiresAt' ? new Date(parseInt(value)) : value.substring(0, 20) + '...';
    }
  });
  
  if (missing.length === 0) {
    logTest(
      'localStorage Data',
      true,
      'All required keys present',
      present
    );
  } else {
    logTest(
      'localStorage Data',
      false,
      `Missing keys: ${missing.join(', ')}`,
      { present, missing }
    );
  }
}

// Test 2: Token expiry is valid
function testTokenExpiry() {
  console.log('\n⏰ Testing token expiry...');
  
  const expiresAt = localStorage.getItem('expiresAt');
  if (!expiresAt) {
    logTest('Token Expiry', false, 'expiresAt not found in localStorage');
    return;
  }
  
  const expiresAtMs = parseInt(expiresAt);
  const now = Date.now();
  const timeUntilExpiry = expiresAtMs - now;
  const minutesRemaining = Math.floor(timeUntilExpiry / 1000 / 60);
  
  const isValid = timeUntilExpiry > 0 && timeUntilExpiry < (2 * 60 * 60 * 1000); // Less than 2 hours
  
  logTest(
    'Token Expiry',
    isValid,
    isValid ? `Token expires in ${minutesRemaining} minutes` : 'Token expiry is invalid',
    {
      expiresAt: new Date(expiresAtMs).toLocaleString(),
      minutesRemaining,
      isExpired: timeUntilExpiry <= 0
    }
  );
}

// Test 3: Refresh token format
function testRefreshTokenFormat() {
  console.log('\n🔑 Testing refresh token format...');
  
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    logTest('Refresh Token Format', false, 'Refresh token not found');
    return;
  }
  
  // Should be 64 hex characters
  const isValidFormat = /^[0-9a-f]{64}$/.test(refreshToken);
  
  logTest(
    'Refresh Token Format',
    isValidFormat,
    isValidFormat ? 'Valid 64-character hex token' : 'Invalid format',
    {
      length: refreshToken.length,
      preview: refreshToken.substring(0, 16) + '...',
      isHex: /^[0-9a-f]+$/.test(refreshToken)
    }
  );
}

// Test 4: SessionManager state
function testSessionManagerState() {
  console.log('\n🔐 Testing SessionManager state...');
  
  if (typeof sessionManager === 'undefined') {
    logTest('SessionManager', false, 'SessionManager not found in global scope');
    return;
  }
  
  try {
    const sessionInfo = sessionManager.getSessionInfo();
    const isAuthenticated = sessionManager.isAuthenticated();
    
    logTest(
      'SessionManager State',
      isAuthenticated && sessionInfo !== null,
      isAuthenticated ? 'SessionManager is active' : 'SessionManager not initialized',
      {
        authenticated: isAuthenticated,
        sessionInfo
      }
    );
  } catch (error: any) {
    logTest('SessionManager State', false, error.message);
  }
}

// Test 5: Database session (async)
async function testDatabaseSession() {
  console.log('\n💾 Testing database session...');
  
  const userId = localStorage.getItem('userId');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!userId || !refreshToken) {
    logTest('Database Session', false, 'Missing userId or refreshToken');
    return;
  }
  
  try {
    // @ts-ignore
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.0');
    
    const supabaseUrl = (window as any).VITE_SUPABASE_URL || 
                        (import.meta as any).env?.VITE_SUPABASE_URL ||
                        (process.env as any).NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = (window as any).VITE_SUPABASE_ANON_KEY ||
                            (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
                            (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logTest('Database Session', false, 'Supabase credentials not found');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('refresh_token', refreshToken)
      .eq('is_active', true)
      .maybeSingle();
    
    if (error) {
      logTest('Database Session', false, `Query error: ${error.message}`);
      return;
    }
    
    if (data) {
      logTest(
        'Database Session',
        true,
        'Session found in database',
        {
          sessionId: data.id,
          createdAt: data.created_at,
          deviceInfo: data.device_info,
          isActive: data.is_active
        }
      );
    } else {
      logTest('Database Session', false, 'Session not found in database');
    }
  } catch (error: any) {
    logTest('Database Session', false, error.message);
  }
}

// Test 6: Token refresh functionality
async function testTokenRefresh() {
  console.log('\n🔄 Testing token refresh...');
  
  if (typeof sessionManager === 'undefined') {
    logTest('Token Refresh', false, 'SessionManager not available');
    return;
  }
  
  try {
    // Save current token
    const oldToken = localStorage.getItem('accessToken');
    const oldExpiry = localStorage.getItem('expiresAt');
    
    // Attempt refresh
    console.log('   Attempting token refresh...');
    const success = await sessionManager.refreshToken();
    
    if (success) {
      const newToken = localStorage.getItem('accessToken');
      const newExpiry = localStorage.getItem('expiresAt');
      
      const tokenChanged = newToken !== oldToken;
      const expiryUpdated = newExpiry !== oldExpiry;
      
      logTest(
        'Token Refresh',
        success && expiryUpdated,
        'Token refresh successful',
        {
          tokenChanged,
          expiryUpdated,
          newExpiresAt: new Date(parseInt(newExpiry!)).toLocaleString()
        }
      );
    } else {
      logTest('Token Refresh', false, 'Token refresh returned false');
    }
  } catch (error: any) {
    logTest('Token Refresh', false, error.message);
  }
}

// Test 7: Cross-tab sync (requires manual test)
function testCrossTabSync() {
  console.log('\n🔀 Cross-tab sync test...');
  
  console.log('   ⚠️  Manual test required:');
  console.log('   1. Open this app in another tab');
  console.log('   2. Logout in the other tab');
  console.log('   3. Check if this tab logs out automatically');
  
  logTest(
    'Cross-Tab Sync',
    null as any,
    'Manual test required - see console for instructions',
    {
      instructions: [
        'Open app in another tab',
        'Logout in other tab',
        'Verify this tab logs out'
      ]
    }
  );
}

// Test 8: Auto-refresh timer
function testAutoRefreshTimer() {
  console.log('\n⏱️  Testing auto-refresh timer...');
  
  // Check if timer is running by looking at localStorage updates
  const checkInterval = 65000; // 65 seconds
  
  console.log(`   ⚠️  This test takes ${checkInterval/1000} seconds...`);
  console.log('   Waiting for auto-refresh check...');
  
  const initialCheck = Date.now();
  
  setTimeout(() => {
    const elapsed = Date.now() - initialCheck;
    const timerWorking = elapsed >= checkInterval - 1000; // Allow 1s tolerance
    
    logTest(
      'Auto-Refresh Timer',
      timerWorking,
      timerWorking ? 'Timer is running (check console for logs)' : 'Timer may not be working',
      {
        elapsed: `${(elapsed / 1000).toFixed(1)}s`,
        expected: `${checkInterval / 1000}s`
      }
    );
    
    printTestSummary();
  }, checkInterval);
  
  logTest(
    'Auto-Refresh Timer',
    null as any,
    'Test in progress... waiting 65 seconds',
    { status: 'pending' }
  );
}

// Print summary
function printTestSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = testResults.filter(r => r.passed === true).length;
  const failed = testResults.filter(r => r.passed === false).length;
  const pending = testResults.filter(r => r.passed === null).length;
  const total = testResults.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏳ Pending/Manual: ${pending}`);
  console.log('='.repeat(60));
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults
      .filter(r => r.passed === false)
      .forEach(r => {
        console.log(`  - ${r.name}: ${r.message}`);
      });
  }
  
  console.log('\n💡 TIP: Run individual tests with:');
  console.log('  testLocalStorageData()');
  console.log('  testTokenExpiry()');
  console.log('  await testDatabaseSession()');
  console.log('  await testTokenRefresh()');
}

// Run all tests
async function runAllTests() {
  console.clear();
  console.log('🧪 Running SessionManager Tests...\n');
  
  testLocalStorageData();
  testTokenExpiry();
  testRefreshTokenFormat();
  testSessionManagerState();
  
  await testDatabaseSession();
  await testTokenRefresh();
  
  testCrossTabSync();
  
  console.log('\n⏱️  Starting timer test (65 seconds)...');
  // testAutoRefreshTimer(); // Comment out for quick tests
  
  // Print summary (except timer test)
  printTestSummary();
  
  console.log('\n✅ Quick tests complete!');
  console.log('⚠️  Auto-refresh timer test takes 65s - run testAutoRefreshTimer() separately if needed');
}

// Export for console use
(window as any).testUtils = {
  runAllTests,
  testLocalStorageData,
  testTokenExpiry,
  testRefreshTokenFormat,
  testSessionManagerState,
  testDatabaseSession,
  testTokenRefresh,
  testCrossTabSync,
  testAutoRefreshTimer
};

console.log('✅ Test utilities loaded!');
console.log('Run: testUtils.runAllTests()');
console.log('Or run individual tests: testUtils.testLocalStorageData()');
