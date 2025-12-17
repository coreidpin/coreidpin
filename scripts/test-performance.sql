-- Day 20: Performance Testing
-- Run this to measure query performance

DO $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  duration_ms NUMERIC;
  test_user_id TEXT := 'test-user-id-here'; -- Replace with real user ID
BEGIN
  RAISE NOTICE '⏱️  Starting Performance Tests...';
  RAISE NOTICE '';
  
  -- TEST 1: Profile Query
  RAISE NOTICE '📋 TEST 1: Profile Query Performance';
  start_time := clock_timestamp();
  PERFORM * FROM profiles WHERE user_id = test_user_id::UUID;
  end_time := clock_timestamp();
  duration_ms := EXTRACT(milliseconds FROM (end_time - start_time));
  RAISE NOTICE 'Duration: % ms', ROUND(duration_ms, 2);
  IF duration_ms < 10 THEN
    RAISE NOTICE '✅ EXCELLENT: < 10ms';
  ELSIF duration_ms < 50 THEN
    RAISE NOTICE '✅ GOOD: < 50ms';
  ELSIF duration_ms < 100 THEN
    RAISE NOTICE '⚠️  ACCEPTABLE: < 100ms';
  ELSE
    RAISE NOTICE '❌ SLOW: > 100ms';
  END IF;
  RAISE NOTICE '';
  
  -- TEST 2: Feature Access View
  RAISE NOTICE '📋 TEST 2: Feature Access View Performance';
  start_time := clock_timestamp();
  PERFORM * FROM user_feature_access WHERE user_id = test_user_id::UUID;
  end_time := clock_timestamp();
  duration_ms := EXTRACT(milliseconds FROM (end_time - start_time));
  RAISE NOTICE 'Duration: % ms', ROUND(duration_ms, 2);
  IF duration_ms < 20 THEN
    RAISE NOTICE '✅ EXCELLENT: < 20ms';
  ELSIF duration_ms < 100 THEN
    RAISE NOTICE '✅ GOOD: < 100ms';
  ELSE
    RAISE NOTICE '❌ SLOW: > 100ms';
  END IF;
  RAISE NOTICE '';
  
  -- TEST 3: Work Experiences with Profile
  RAISE NOTICE '📋 TEST 3: Profile + Work Experiences Join';
  start_time := clock_timestamp();
  PERFORM p.*, we.* 
  FROM profiles p
  LEFT JOIN work_experiences we ON p.user_id = we.user_id
  WHERE p.user_id = test_user_id::UUID;
  end_time := clock_timestamp();
  duration_ms := EXTRACT(milliseconds FROM (end_time - start_time));
  RAISE NOTICE 'Duration: % ms', ROUND(duration_ms, 2);
  IF duration_ms < 50 THEN
    RAISE NOTICE '✅ EXCELLENT: < 50ms';
  ELSIF duration_ms < 150 THEN
    RAISE NOTICE '✅ GOOD: < 150ms';
  ELSE
    RAISE NOTICE '❌ SLOW: > 150ms';
  END IF;
  RAISE NOTICE '';
  
  -- TEST 4: Analytics Query (30 days)
  RAISE NOTICE '📋 TEST 4: 30-Day Analytics Query';
  start_time := clock_timestamp();
  PERFORM * FROM pin_analytics_daily 
  WHERE created_at >= NOW() - INTERVAL '30 days'
  ORDER BY created_at DESC
  LIMIT 100;
  end_time := clock_timestamp();
  duration_ms := EXTRACT(milliseconds FROM (end_time - start_time));
  RAISE NOTICE 'Duration: % ms', ROUND(duration_ms, 2);
  IF duration_ms < 100 THEN
    RAISE NOTICE '✅ EXCELLENT: < 100ms';
  ELSIF duration_ms < 300 THEN
    RAISE NOTICE '✅ GOOD: < 300ms';
  ELSE
    RAISE NOTICE '❌ SLOW: > 300ms';
  END IF;
  RAISE NOTICE '';
  
  -- TEST 5: Endorsements Query
  RAISE NOTICE '📋 TEST 5: Endorsements Query';
  start_time := clock_timestamp();
  PERFORM * FROM professional_endorsements_v2
  WHERE professional_id = test_user_id::UUID
  ORDER BY created_at DESC
  LIMIT 50;
  end_time := clock_timestamp();
  duration_ms := EXTRACT(milliseconds FROM (end_time - start_time));
  RAISE NOTICE 'Duration: % ms', ROUND(duration_ms, 2);
  IF duration_ms < 50 THEN
    RAISE NOTICE '✅ EXCELLENT: < 50ms';
  ELSIF duration_ms < 150 THEN
    RAISE NOTICE '✅ GOOD: < 150ms';
  ELSE
    RAISE NOTICE '❌ SLOW: > 150ms';
  END IF;
  RAISE NOTICE '';
  
  RAISE NOTICE '═══════════════════════════════════';
  RAISE NOTICE '✅ Performance tests complete!';
  RAISE NOTICE '═══════════════════════════════════';
END $$;
