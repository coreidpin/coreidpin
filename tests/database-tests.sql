-- ============================================================================
-- SessionManager Database Tests
-- Run these queries in Supabase SQL Editor to verify database state
-- ============================================================================

-- Test 1: Check if user_sessions table exists
-- ============================================================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'user_sessions';

-- Expected: 1 row showing table exists


-- Test 2: Verify table structure
-- ============================================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_sessions'
ORDER BY ordinal_position;

-- Expected columns:
-- id, user_id, refresh_token, refresh_token_expires_at,
-- device_info, ip_address, is_active, last_refreshed_at,
-- created_at, updated_at


-- Test 3: Check RLS is enabled
-- ============================================================================
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'user_sessions';

-- Expected: rowsecurity = true


-- Test 4: List all RLS policies
-- ============================================================================
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_sessions';

-- Expected: 3 policies
-- - Users can view own sessions (SELECT)
-- - System can insert sessions (INSERT)
-- - System can update sessions (UPDATE)


-- Test 5: Check indexes
-- ============================================================================
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'user_sessions';

-- Expected: 3 indexes
-- - idx_sessions_user_id
-- - idx_sessions_refresh_token
-- - idx_sessions_expires_at


-- Test 6: Count active sessions
-- ============================================================================
SELECT 
  COUNT(*) as total_sessions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) FILTER (WHERE is_active = true) as active_sessions,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_sessions
FROM user_sessions;

-- Expected: Shows session statistics


-- Test 7: Recent sessions (last 24 hours)
-- ============================================================================
SELECT 
  id,
  user_id,
  LEFT(refresh_token, 10) || '...' as token_preview,
  is_active,
  device_info->>'platform' as platform,
  device_info->>'deviceName' as device,
  ip_address,
  created_at,
  last_refreshed_at
FROM user_sessions
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 10;

-- Expected: Recent sessions with device info


-- Test 8: Sessions by user (your actual user ID)
-- ============================================================================
SELECT 
  id,
  is_active,
  device_info,
  ip_address,
  created_at,
  last_refreshed_at,
  refresh_token_expires_at,
  EXTRACT(EPOCH FROM (refresh_token_expires_at - NOW())) / 86400 as days_until_expiry
FROM user_sessions
WHERE user_id = 'e86e846c-ec59-445f-aedc-6e6a1f983ed8'
ORDER BY created_at DESC;

-- Expected: All sessions for the user


-- Test 9: Expired sessions
-- ============================================================================
SELECT 
  COUNT(*) as expired_count,
  MIN(refresh_token_expires_at) as oldest_expiry,
  MAX(refresh_token_expires_at) as newest_expiry
FROM user_sessions
WHERE refresh_token_expires_at < NOW()
  AND is_active = true;

-- Expected: Count of expired but still active sessions
-- Should be 0 after cleanup runs


-- Test 10: Sessions that need cleanup
-- ============================================================================
SELECT 
  id,
  user_id,
  is_active,
  refresh_token_expires_at,
  last_refreshed_at,
  CASE 
    WHEN refresh_token_expires_at < NOW() THEN 'Refresh token expired'
    WHEN last_refreshed_at < NOW() - INTERVAL '90 days' THEN 'Stale (90+ days)'
    ELSE 'Should be active'
  END as cleanup_reason
FROM user_sessions
WHERE (
  refresh_token_expires_at < NOW() OR
  last_refreshed_at < NOW() - INTERVAL '90 days'
)
ORDER BY created_at DESC
LIMIT 20;

-- Expected: Sessions that cleanup function will remove


-- Test 11: Test cleanup function
-- ============================================================================
SELECT cleanup_expired_sessions();

-- Expected: No error, cleans up expired sessions


-- Test 12: Verify cleanup worked
-- ============================================================================
SELECT 
  COUNT(*) FILTER (WHERE is_active = true AND refresh_token_expires_at < NOW()) as still_active_expired,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_total
FROM user_sessions;

-- Expected: still_active_expired should be 0


-- Test 13: Check cron job
-- ============================================================================
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active,
  jobid IN (SELECT jobid FROM cron.job_run_details ORDER BY start_time DESC LIMIT 1) as has_run
FROM cron.job
WHERE jobname = 'cleanup-expired-sessions';

-- Expected: 1 row with schedule '0 2 * * *'


-- Test 14: Cron job run history
-- ============================================================================
SELECT 
  runid,
  jobid,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (
  SELECT jobid FROM cron.job WHERE jobname = 'cleanup-expired-sessions'
)
ORDER BY start_time DESC
LIMIT 5;

-- Expected: Recent job runs (if cron has run)


-- Test 15: Session creation test
-- ============================================================================
-- Create a test session
INSERT INTO user_sessions (
  user_id,
  refresh_token,
  device_info,
  ip_address,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Test user ID
  'test_refresh_token_' || gen_random_uuid()::text,
  '{"platform": "test", "userAgent": "test"}',
  '127.0.0.1',
  true
)
RETURNING 
  id,
  created_at,
  refresh_token_expires_at;

-- Expected: New session created with auto-populated fields


-- Test 16: Clean up test session
-- ============================================================================
DELETE FROM user_sessions
WHERE user_id = '00000000-0000-0000-0000-000000000000'
  AND ip_address = '127.0.0.1';

-- Expected: Test session deleted


-- Test 17: Performance check - Session lookup
-- ============================================================================
EXPLAIN ANALYZE
SELECT * FROM user_sessions
WHERE refresh_token = 'dummy_token_for_performance_test'
  AND is_active = true;

-- Expected: Uses idx_sessions_refresh_token index
-- Execution time should be < 1ms


-- Test 18: Performance check - User sessions
-- ============================================================================
EXPLAIN ANALYZE
SELECT * FROM user_sessions
WHERE user_id = 'e86e846c-ec59-445f-aedc-6e6a1f983ed8'
ORDER BY created_at DESC;

-- Expected: Uses idx_sessions_user_id index
-- Execution time should be < 1ms


-- Test 19: Session statistics by day
-- ============================================================================
SELECT 
  DATE(created_at) as date,
  COUNT(*) as sessions_created,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) FILTER (WHERE is_active = true) as currently_active
FROM user_sessions
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Expected: Daily session creation stats


-- Test 20: Most active devices
-- ============================================================================
SELECT 
  device_info->>'platform' as platform,
  COUNT(*) as session_count,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_seen
FROM user_sessions
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY device_info->>'platform'
ORDER BY session_count DESC;

-- Expected: Device platform usage stats


-- ============================================================================
-- QUICK HEALTH CHECK
-- Run this for a quick overview
-- ============================================================================
SELECT 
  'Total Sessions' as metric, COUNT(*)::text as value
FROM user_sessions
UNION ALL
SELECT 
  'Active Sessions', COUNT(*)::text
FROM user_sessions WHERE is_active = true
UNION ALL
SELECT 
  'Unique Users', COUNT(DISTINCT user_id)::text
FROM user_sessions
UNION ALL
SELECT 
  'Expired Sessions', COUNT(*)::text
FROM user_sessions WHERE refresh_token_expires_at < NOW()
UNION ALL
SELECT 
  'Sessions Today', COUNT(*)::text
FROM user_sessions WHERE created_at > CURRENT_DATE
UNION ALL
SELECT 
  'Sessions This Week', COUNT(*)::text
FROM user_sessions WHERE created_at > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
  'Cleanup Job Exists', 
  CASE WHEN EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-expired-sessions') 
    THEN 'Yes' 
    ELSE 'No' 
  END
UNION ALL
SELECT 
  'RLS Enabled',
  CASE WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'user_sessions')
    THEN 'Yes'
    ELSE 'No'
  END;

-- Expected: Quick overview of session health
