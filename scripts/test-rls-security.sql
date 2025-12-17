-- Day 20: Quick Security & RLS Test
-- Run this in Supabase SQL Editor to verify all RLS policies

DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000001';
  other_user_id UUID := '00000000-0000-0000-0000-000000000002';
  test_count INT;
  total_tests INT := 0;
  passed_tests INT := 0;
BEGIN
  RAISE NOTICE '🧪 Starting RLS Security Tests...';
  RAISE NOTICE '';
  
  -- TEST 1: Profiles - User can only see own profile
  RAISE NOTICE '📋 TEST 1: Profile Isolation';
  total_tests := total_tests + 1;
  SET LOCAL auth.uid = test_user_id::TEXT;
  SELECT COUNT(*) INTO test_count FROM profiles WHERE user_id = other_user_id;
  IF test_count = 0 THEN
    RAISE NOTICE '✅ PASS: User cannot see other profiles';
    passed_tests := passed_tests + 1;
  ELSE
    RAISE NOTICE '❌ FAIL: User can see other profiles (count: %)', test_count;
  END IF;
  RESET auth.uid;
  
  -- TEST 2: Business Profiles - Isolation
  RAISE NOTICE '📋 TEST 2: Business Profile Isolation';
  total_tests := total_tests + 1;
  SET LOCAL auth.uid = test_user_id::TEXT;
  SELECT COUNT(*) INTO test_count FROM business_profiles WHERE user_id = other_user_id;
  IF test_count = 0 THEN
    RAISE NOTICE '✅ PASS: Business user cannot see other business profiles';
    passed_tests := passed_tests + 1;
  ELSE
    RAISE NOTICE '❌ FAIL: Business user can see other profiles (count: %)', test_count;
  END IF;
  RESET auth.uid;
  
  -- TEST 3: Work Experiences - Isolation
  RAISE NOTICE '📋 TEST 3: Work Experience Isolation';
  total_tests := total_tests + 1;
  SET LOCAL auth.uid = test_user_id::TEXT;
  SELECT COUNT(*) INTO test_count FROM work_experiences WHERE user_id = other_user_id;
  IF test_count = 0 THEN
    RAISE NOTICE '✅ PASS: User cannot see other work experiences';
    passed_tests := passed_tests + 1;
  ELSE
    RAISE NOTICE '❌ FAIL: User can see other work experiences (count: %)', test_count;
  END IF;
  RESET auth.uid;
  
  -- TEST 4: API Keys - Isolation
  RAISE NOTICE '📋 TEST 4: API Keys Isolation';
  total_tests := total_tests + 1;
  SET LOCAL auth.uid = test_user_id::TEXT;
  SELECT COUNT(*) INTO test_count FROM api_keys WHERE user_id = other_user_id;
  IF test_count = 0 THEN
    RAISE NOTICE '✅ PASS: User cannot see other API keys';
    passed_tests := passed_tests + 1;
  ELSE
    RAISE NOTICE '❌ FAIL: User can see other API keys (count: %)', test_count;
  END IF;
  RESET auth.uid;
  
  -- TEST 5: Unauthenticated Access
  RAISE NOTICE '📋 TEST 5: Unauthenticated Access Prevention';
  total_tests := total_tests + 1;
  RESET auth.uid;
  SELECT COUNT(*) INTO test_count FROM profiles;
  IF test_count = 0 THEN
    RAISE NOTICE '✅ PASS: Unauthenticated users cannot access profiles';
    passed_tests := passed_tests + 1;
  ELSE
    RAISE NOTICE '❌ FAIL: Unauthenticated users can access profiles (count: %)', test_count;
  END IF;
  
  -- TEST 6: User Sessions - Isolation
  RAISE NOTICE '📋 TEST 6: User Sessions Isolation';
  total_tests := total_tests + 1;
  SET LOCAL auth.uid = test_user_id::TEXT;
  SELECT COUNT(*) INTO test_count FROM user_sessions WHERE user_id = other_user_id;
  IF test_count = 0 THEN
    RAISE NOTICE '✅ PASS: User cannot see other sessions';
    passed_tests := passed_tests + 1;
  ELSE
    RAISE NOTICE '❌ FAIL: User can see other sessions (count: %)', test_count;
  END IF;
  RESET auth.uid;
  
  -- TEST 7: Notifications - Isolation
  RAISE NOTICE '📋 TEST 7: Notifications Isolation';
  total_tests := total_tests + 1;
  SET LOCAL auth.uid = test_user_id::TEXT;
  SELECT COUNT(*) INTO test_count FROM notifications WHERE user_id = other_user_id;
  IF test_count = 0 THEN
    RAISE NOTICE '✅ PASS: User cannot see other notifications';
    passed_tests := passed_tests + 1;
  ELSE
    RAISE NOTICE '❌ FAIL: User can see other notifications (count: %)', test_count;
  END IF;
  RESET auth.uid;
  
  -- Summary
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════';
  RAISE NOTICE '📊 TEST SUMMARY';
  RAISE NOTICE '═══════════════════════════════════';
  RAISE NOTICE 'Total Tests: %', total_tests;
  RAISE NOTICE 'Passed: % ✅', passed_tests;
  RAISE NOTICE 'Failed: % ❌', (total_tests - passed_tests);
  RAISE NOTICE 'Success Rate: %%', ROUND((passed_tests::DECIMAL / total_tests * 100)::NUMERIC, 1);
  RAISE NOTICE '═══════════════════════════════════';
  
  IF passed_tests = total_tests THEN
    RAISE NOTICE '🎉 ALL TESTS PASSED!';
  ELSE
    RAISE NOTICE '⚠️  SOME TESTS FAILED - PLEASE REVIEW';
  END IF;
END $$;
