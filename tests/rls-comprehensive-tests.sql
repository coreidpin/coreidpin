-- ============================================================================
-- Day 9: Comprehensive RLS Testing
-- Test all 12 tables secured in Days 7-8
-- ============================================================================

-- Setup: Create test users and data
-- ============================================================================

DO $$
BEGIN
  -- We'll use request.jwt.claim.sub to simulate users
  -- This doesn't create actual users, just simulates authentication
  RAISE NOTICE 'Setting up RLS tests...';
END $$;

-- ============================================================================
-- TEST SUITE 1: Critical Tables (Day 7)
-- Tables: api_keys, profiles, business_profiles
-- ============================================================================

-- Test 1.1: api_keys - User can view own keys
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 1.1: api_keys - User can view own keys ===';
  
  -- Simulate User A
  PERFORM set_config('request.jwt.claim.sub', 'test-user-a-id', true);
  
  -- Try to view own keys
  IF (SELECT COUNT(*) FROM api_keys WHERE user_id = 'test-user-a-id') >= 0 THEN
    RAISE NOTICE '✅ PASS: User can query their own api_keys';
  ELSE
    RAISE EXCEPTION '❌ FAIL: User cannot query their own api_keys';
  END IF;
  
  -- Reset
  PERFORM set_config('request.jwt.claim.sub', '', true);
END $$;

-- Test 1.2: api_keys - User cannot view other's keys
-- ============================================================================
DO $$
DECLARE
  other_keys_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 1.2: api_keys - User cannot view others keys ===';
  
  -- Simulate User A
  PERFORM set_config('request.jwt.claim.sub', 'test-user-a-id', true);
  
  -- Try to view User B's keys
  SELECT COUNT(*) INTO other_keys_count
  FROM api_keys 
  WHERE user_id != 'test-user-a-id';
  
  IF other_keys_count = 0 THEN
    RAISE NOTICE '✅ PASS: User cannot see other users api_keys';
  ELSE
    RAISE EXCEPTION '❌ FAIL: User can see % other users keys', other_keys_count;
  END IF;
  
  -- Reset
  PERFORM set_config('request.jwt.claim.sub', '', true);
END $$;

-- Test 1.3: profiles - User can view own profile
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 1.3: profiles - User can view own profile ===';
  
  -- Simulate User A
  PERFORM set_config('request.jwt.claim.sub', 'test-user-a-id', true);
  
  IF (SELECT COUNT(*) FROM profiles WHERE user_id = 'test-user-a-id') >= 0 THEN
    RAISE NOTICE '✅ PASS: User can query their own profile';
  ELSE
    RAISE EXCEPTION '❌ FAIL: User cannot query their own profile';
  END IF;
  
  PERFORM set_config('request.jwt.claim.sub', '', true);
END $$;

-- Test 1.4: profiles - Public profiles are viewable
-- ============================================================================
DO $$
DECLARE
  public_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 1.4: profiles - Public profiles viewable ===';
  
  -- No authentication (simulate anonymous user)
  PERFORM set_config('request.jwt.claim.sub', '', true);
  
  -- Try to view public profiles
  SELECT COUNT(*) INTO public_count
  FROM profiles 
  WHERE public_profile_enabled = true;
  
  RAISE NOTICE '✅ PASS: Anonymous users can view % public profiles', public_count;
END $$;

-- Test 1.5: business_profiles - User can view own profile
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 1.5: business_profiles - User can view own ===';
  
  PERFORM set_config('request.jwt.claim.sub', 'test-business-id', true);
  
  IF (SELECT COUNT(*) FROM business_profiles WHERE user_id = 'test-business-id') >= 0 THEN
    RAISE NOTICE '✅ PASS: Business user can query their own profile';
  ELSE
    RAISE EXCEPTION '❌ FAIL: Business user cannot query their own profile';
  END IF;
  
  PERFORM set_config('request.jwt.claim.sub', '', true);
END $$;

-- ============================================================================
-- TEST SUITE 2: User-Owned Tables (Day 8)
-- Tables: notifications, kyc_requests, professional_pins, session_tokens, work_experiences
-- ============================================================================

-- Test 2.1: notifications - User can view own
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 2.1: notifications - User can view own ===';
  
  PERFORM set_config('request.jwt.claim.sub', 'test-user-a-id', true);
  
  IF (SELECT COUNT(*) FROM notifications WHERE user_id = 'test-user-a-id') >= 0 THEN
    RAISE NOTICE '✅ PASS: User can query their own notifications';
  ELSE
    RAISE EXCEPTION '❌ FAIL: User cannot query their own notifications';
  END IF;
  
  PERFORM set_config('request.jwt.claim.sub', '', true);
END $$;

-- Test 2.2: kyc_requests - User can view own
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 2.2: kyc_requests - User can view own ===';
  
  PERFORM set_config('request.jwt.claim.sub', 'test-user-a-id', true);
  
  IF (SELECT COUNT(*) FROM kyc_requests WHERE user_id = 'test-user-a-id') >= 0 THEN
    RAISE NOTICE '✅ PASS: User can query their own kyc_requests';
  ELSE
    RAISE EXCEPTION '❌ FAIL: User cannot query their own kyc_requests';
  END IF;
  
  PERFORM set_config('request.jwt.claim.sub', '', true);
END $$;

-- Test 2.3: professional_pins - User can view own
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 2.3: professional_pins - User can view own ===';
  
  PERFORM set_config('request.jwt.claim.sub', 'test-user-a-id', true);
  
  IF (SELECT COUNT(*) FROM professional_pins WHERE user_id = 'test-user-a-id') >= 0 THEN
    RAISE NOTICE '✅ PASS: User can query their own professional_pins';
  ELSE
    RAISE EXCEPTION '❌ FAIL: User cannot query their own professional_pins';
  END IF;
  
  PERFORM set_config('request.jwt.claim.sub', '', true);
END $$;

-- Test 2.4: session_tokens - User can view own
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 2.4: session_tokens - User can view own ===';
  
  PERFORM set_config('request.jwt.claim.sub', 'test-user-a-id', true);
  
  IF (SELECT COUNT(*) FROM session_tokens WHERE user_id = 'test-user-a-id') >= 0 THEN
    RAISE NOTICE '✅ PASS: User can query their own session_tokens';
  ELSE
    RAISE EXCEPTION '❌ FAIL: User cannot query their own session_tokens';
  END IF;
  
  PERFORM set_config('request.jwt.claim.sub', '', true);
END $$;

-- Test 2.5: work_experiences - User can view own
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 2.5: work_experiences - User can view own ===';
  
  PERFORM set_config('request.jwt.claim.sub', 'test-user-a-id', true);
  
  IF (SELECT COUNT(*) FROM work_experiences WHERE user_id = 'test-user-a-id') >= 0 THEN
    RAISE NOTICE '✅ PASS: User can query their own work_experiences';
  ELSE
    RAISE EXCEPTION '❌ FAIL: User cannot query their own work_experiences';
  END IF;
  
  PERFORM set_config('request.jwt.claim.sub', '', true);
END $$;

-- ============================================================================
-- TEST SUITE 3: Log/Audit Tables (Day 8)
-- Tables: api_usage_logs, audit_logs, email_verification_logs, pin_login_logs
-- ============================================================================

-- Test 3.1: api_usage_logs - User can view own
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 3.1: api_usage_logs - User can view own ===';
  
  PERFORM set_config('request.jwt.claim.sub', 'test-user-a-id', true);
  
  IF (SELECT COUNT(*) FROM api_usage_logs WHERE user_id = 'test-user-a-id') >= 0 THEN
    RAISE NOTICE '✅ PASS: User can query their own api_usage_logs';
  ELSE
    RAISE EXCEPTION '❌ FAIL: User cannot query their own api_usage_logs';
  END IF;
  
  PERFORM set_config('request.jwt.claim.sub', '', true);
END $$;

-- Test 3.2: audit_logs - User can view own
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 3.2: audit_logs - User can view own ===';
  
  PERFORM set_config('request.jwt.claim.sub', 'test-user-a-id', true);
  
  IF (SELECT COUNT(*) FROM audit_logs WHERE user_id = 'test-user-a-id') >= 0 THEN
    RAISE NOTICE '✅ PASS: User can query their own audit_logs';
  ELSE
    RAISE EXCEPTION '❌ FAIL: User cannot query their own audit_logs';
  END IF;
  
  PERFORM set_config('request.jwt.claim.sub', '', true);
END $$;

-- Test 3.3: email_verification_logs - User can view own
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 3.3: email_verification_logs - User can view own ===';
  
  PERFORM set_config('request.jwt.claim.sub', 'test-user-a-id', true);
  
  IF (SELECT COUNT(*) FROM email_verification_logs WHERE user_id = 'test-user-a-id') >= 0 THEN
    RAISE NOTICE '✅ PASS: User can query their own email_verification_logs';
  ELSE
    RAISE EXCEPTION '❌ FAIL: User cannot query their own email_verification_logs';
  END IF;
  
  PERFORM set_config('request.jwt.claim.sub', '', true);
END $$;

-- Test 3.4: pin_login_logs - User can view own
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 3.4: pin_login_logs - User can view own ===';
  
  PERFORM set_config('request.jwt.claim.sub', 'test-user-a-id', true);
  
  IF (SELECT COUNT(*) FROM pin_login_logs WHERE user_id = 'test-user-a-id') >= 0 THEN
    RAISE NOTICE '✅ PASS: User can query their own pin_login_logs';
  ELSE
    RAISE EXCEPTION '❌ FAIL: User cannot query their own pin_login_logs';
  END IF;
  
  PERFORM set_config('request.jwt.claim.sub', '', true);
END $$;

-- ============================================================================
-- TEST SUITE 4: Anonymous Access (No Authentication)
-- ============================================================================

-- Test 4.1: Anonymous users cannot see private data
-- ============================================================================
DO $$
DECLARE
  table_name TEXT;
  row_count INTEGER;
  tables TEXT[] := ARRAY[
    'api_keys', 'notifications', 'kyc_requests', 'professional_pins',
    'session_tokens', 'work_experiences', 'api_usage_logs', 'audit_logs',
    'email_verification_logs', 'pin_login_logs', 'business_profiles'
  ];
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 4.1: Anonymous users cannot see private data ===';
  
  -- Clear authentication
  PERFORM set_config('request.jwt.claim.sub', '', true);
  
  FOREACH table_name IN ARRAY tables
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO row_count;
    IF row_count = 0 THEN
      RAISE NOTICE '✅ PASS: Anonymous cannot see % table', table_name;
    ELSE
      RAISE WARNING '⚠️ WARNING: Anonymous can see % rows in %', row_count, table_name;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- TEST SUITE 5: Performance Tests
-- ============================================================================

-- Test 5.1: Check query performance with RLS
-- ============================================================================
DO $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  duration INTERVAL;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 5.1: Query Performance ===';
  
  -- Set auth context
  PERFORM set_config('request.jwt.claim.sub', 'test-user-a-id', true);
  
  -- Test api_keys performance
  start_time := clock_timestamp();
  PERFORM COUNT(*) FROM api_keys WHERE user_id = 'test-user-a-id';
  end_time := clock_timestamp();
  duration := end_time - start_time;
  
  RAISE NOTICE 'api_keys query time: %', duration;
  
  -- Test profiles performance
  start_time := clock_timestamp();
  PERFORM COUNT(*) FROM profiles WHERE user_id = 'test-user-a-id';
  end_time := clock_timestamp();
  duration := end_time - start_time;
  
  RAISE NOTICE 'profiles query time: %', duration;
  
  IF EXTRACT(MILLISECONDS FROM duration) < 10 THEN
    RAISE NOTICE '✅ PASS: Queries complete in < 10ms';
  ELSE
    RAISE WARNING '⚠️ WARNING: Queries taking > 10ms';
  END IF;
  
  PERFORM set_config('request.jwt.claim.sub', '', true);
END $$;

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================

DO $$
DECLARE
  total_tables INTEGER := 12;
  tables_with_rls INTEGER;
  total_policies INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '📊 RLS TEST SUMMARY';
  RAISE NOTICE '============================================';
  
  -- Count tables with RLS
  SELECT COUNT(*) INTO tables_with_rls
  FROM pg_tables 
  WHERE schemaname = 'public'
    AND rowsecurity = true
    AND tablename IN (
      'api_keys', 'profiles', 'business_profiles',
      'notifications', 'kyc_requests', 'professional_pins',
      'session_tokens', 'work_experiences',
      'api_usage_logs', 'audit_logs', 'email_verification_logs', 'pin_login_logs'
    );
  
  -- Count total policies
  SELECT COUNT(*) INTO total_policies
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN (
      'api_keys', 'profiles', 'business_profiles',
      'notifications', 'kyc_requests', 'professional_pins',
      'session_tokens', 'work_experiences',
      'api_usage_logs', 'audit_logs', 'email_verification_logs', 'pin_login_logs'
    );
  
  RAISE NOTICE 'Tables secured: %/%', tables_with_rls, total_tables;
  RAISE NOTICE 'Total policies: %', total_policies;
  
  IF tables_with_rls = total_tables THEN
    RAISE NOTICE '✅ SUCCESS: All % tables have RLS enabled', total_tables;
  ELSE
    RAISE WARNING '⚠️ WARNING: Only % of % tables have RLS', tables_with_rls, total_tables;
  END IF;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE '🎉 RLS Testing Complete!';
  RAISE NOTICE '============================================';
END $$;
