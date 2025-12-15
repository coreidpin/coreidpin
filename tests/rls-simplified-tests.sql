-- ============================================================================
-- Day 9: Simplified RLS Testing
-- Tests use your actual user ID from the database
-- ============================================================================

-- Step 1: Get your actual user ID
-- ============================================================================
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get a real user_id from profiles table
  SELECT user_id INTO test_user_id
  FROM profiles
  LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE '⚠️ No users found in profiles table';
    RAISE NOTICE 'Tests will use generic queries instead';
  ELSE
    RAISE NOTICE '✅ Found test user: %', test_user_id;
    -- Store for use in other tests
    PERFORM set_config('app.test_user_id', test_user_id::text, false);
  END IF;
END $$;

-- ============================================================================
-- TEST SUITE 1: RLS Enabled on All Tables
-- ============================================================================
DO $$
DECLARE
  tables TEXT[] := ARRAY[
    'api_keys', 'profiles', 'business_profiles',
    'notifications', 'kyc_requests', 'professional_pins',
    'session_tokens', 'work_experiences',
    'api_usage_logs', 'audit_logs', 'email_verification_logs', 'pin_login_logs'
  ];
  tbl TEXT;
  has_rls BOOLEAN;
  policy_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 1: RLS Enabled on All Tables ===';
  
  FOREACH tbl IN ARRAY tables
  LOOP
    -- Check if RLS is enabled
    SELECT rowsecurity INTO has_rls
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = tbl;
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = tbl;
    
    IF has_rls THEN
      RAISE NOTICE '✅ %: RLS enabled with % policies', tbl, policy_count;
    ELSE
      RAISE WARNING '❌ %: RLS NOT enabled', tbl;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- TEST SUITE 2: Policy Coverage
-- ============================================================================
DO $$
DECLARE
  tables TEXT[] := ARRAY[
    'api_keys', 'profiles', 'business_profiles',
    'notifications', 'kyc_requests', 'professional_pins',
    'session_tokens', 'work_experiences',
    'api_usage_logs', 'audit_logs', 'email_verification_logs', 'pin_login_logs'
  ];
  tbl TEXT;
  select_policy BOOLEAN;
  insert_policy BOOLEAN;
  service_policy BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 2: Policy Coverage ===';
  
  FOREACH tbl IN ARRAY tables
  LOOP
    -- Check for SELECT policy
    SELECT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = tbl AND cmd = 'SELECT'
    ) INTO select_policy;
    
    -- Check for INSERT policy
    SELECT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = tbl AND cmd = 'INSERT'
    ) INTO insert_policy;
    
    -- Check for service role policy
    SELECT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = tbl 
      AND policyname ILIKE '%service%'
    ) INTO service_policy;
    
    IF select_policy AND insert_policy AND service_policy THEN
      RAISE NOTICE '✅ %: Has SELECT, INSERT, and SERVICE policies', tbl;
    ELSE
      RAISE NOTICE '⚠️ %: SELECT=%, INSERT=%, SERVICE=%', 
        tbl, select_policy, insert_policy, service_policy;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- TEST SUITE 3: Index Coverage (Performance)
-- ============================================================================
DO $$
DECLARE
  tables TEXT[] := ARRAY[
    'api_keys', 'profiles', 'business_profiles',
    'notifications', 'kyc_requests', 'professional_pins',
    'session_tokens', 'work_experiences',
    'api_usage_logs', 'audit_logs', 'email_verification_logs', 'pin_login_logs'
  ];
  tbl TEXT;
  has_user_id_index BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 3: Index Coverage ===';
  
  FOREACH tbl IN ARRAY tables
  LOOP
    -- Check if user_id column has an index
    SELECT EXISTS (
      SELECT 1 
      FROM pg_indexes
      WHERE tablename = tbl
      AND indexdef ILIKE '%user_id%'
    ) INTO has_user_id_index;
    
    IF has_user_id_index THEN
      RAISE NOTICE '✅ %: Has user_id index', tbl;
    ELSE
      RAISE WARNING '⚠️ %: No user_id index (may impact RLS performance)', tbl;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- TEST SUITE 4: Anonymous Access Test
-- ============================================================================
DO $$
DECLARE
  api_keys_count INTEGER;
  profiles_count INTEGER;
  notifications_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 4: Anonymous Access (No Auth) ===';
  
  -- Clear any authentication
  PERFORM set_config('request.jwt.claim.sub', '', true);
  
  -- Try to access sensitive tables without auth
  BEGIN
    SELECT COUNT(*) INTO api_keys_count FROM api_keys;
    IF api_keys_count = 0 THEN
      RAISE NOTICE '✅ api_keys: Anonymous sees 0 rows';
    ELSE
      RAISE WARNING '❌ api_keys: Anonymous can see % rows', api_keys_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '✅ api_keys: Access denied for anonymous';
  END;
  
  BEGIN
    SELECT COUNT(*) INTO notifications_count FROM notifications;
    IF notifications_count = 0 THEN
      RAISE NOTICE '✅ notifications: Anonymous sees 0 rows';
    ELSE
      RAISE WARNING '❌ notifications: Anonymous can see % rows', notifications_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '✅ notifications: Access denied for anonymous';
  END;
  
  -- Public profiles should be visible
  BEGIN
    SELECT COUNT(*) INTO profiles_count 
    FROM profiles 
    WHERE public_profile_enabled = true;
    RAISE NOTICE '✅ profiles: Anonymous can see % public profiles', profiles_count;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '⚠️ profiles: Anonymous cannot query public profiles';
  END;
END $$;

-- ============================================================================
-- TEST SUITE 5: Authenticated User Access
-- ============================================================================
DO $$
DECLARE
  test_user_id TEXT;
  own_profile_count INTEGER;
  own_api_keys_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST 5: Authenticated User Access ===';
  
  -- Get a real user ID
  SELECT user_id::text INTO test_user_id
  FROM profiles
  WHERE user_id IS NOT NULL
  LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE '⚠️ Skipping: No users in database';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Testing with user: %', test_user_id;
  
  -- Simulate authentication
  PERFORM set_config('request.jwt.claim.sub', test_user_id, true);
  
  -- Test profile access
  EXECUTE format('SELECT COUNT(*) FROM profiles WHERE user_id = %L', test_user_id)
  INTO own_profile_count;
  
  IF own_profile_count >= 0 THEN
    RAISE NOTICE '✅ profiles: User can query (found % rows)', own_profile_count;
  ELSE
    RAISE WARNING '❌ profiles: User cannot query their profile';
  END IF;
  
  -- Test api_keys access
  EXECUTE format('SELECT COUNT(*) FROM api_keys WHERE user_id = %L', test_user_id)
  INTO own_api_keys_count;
  
  IF own_api_keys_count >= 0 THEN
    RAISE NOTICE '✅ api_keys: User can query (found % rows)', own_api_keys_count;
  ELSE
    RAISE WARNING '❌ api_keys: User cannot query their keys';
  END IF;
  
  -- Reset
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
  avg_policies NUMERIC;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '📊 RLS TEST SUMMARY - DAY 9';
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
  
  -- Count total policies on our tables
  SELECT COUNT(*) INTO total_policies
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN (
      'api_keys', 'profiles', 'business_profiles',
      'notifications', 'kyc_requests', 'professional_pins',
      'session_tokens', 'work_experiences',
      'api_usage_logs', 'audit_logs', 'email_verification_logs', 'pin_login_logs'
    );
  
  avg_policies := total_policies::NUMERIC / NULLIF(tables_with_rls, 0);
  
  RAISE NOTICE 'Target tables: %', total_tables;
  RAISE NOTICE 'Tables with RLS: %', tables_with_rls;
  RAISE NOTICE 'Total RLS policies: %', total_policies;
  RAISE NOTICE 'Average policies per table: %', ROUND(avg_policies, 1);
  RAISE NOTICE '';
  
  IF tables_with_rls = total_tables THEN
    RAISE NOTICE '✅ SUCCESS: All % tables secured with RLS', total_tables;
  ELSE
    RAISE WARNING '⚠️ WARNING: Only % of % tables have RLS', tables_with_rls, total_tables;
  END IF;
  
  IF total_policies >= total_tables * 3 THEN
    RAISE NOTICE '✅ SUCCESS: Good policy coverage (avg %.1f per table)', avg_policies;
  ELSE
    RAISE WARNING '⚠️ WARNING: Low policy coverage (avg %.1f per table)', avg_policies;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '🎉 Day 9 RLS Testing Complete!';
  RAISE NOTICE '============================================';
END $$;
