-- ============================================================================
-- Performance Testing - Simple Version for Supabase SQL Editor
-- Replace 'YOUR-USER-ID-HERE' with actual UUID from: SELECT user_id FROM profiles LIMIT 1;
-- ============================================================================

-- STEP 1: Get a user ID first (run this separately)
-- ============================================================================
SELECT user_id, email, first_name, last_name 
FROM profiles 
WHERE user_id IS NOT NULL
LIMIT 1;

-- Copy the user_id from above and replace 'YOUR-USER-ID-HERE' below


-- ============================================================================
-- TEST 1: Profile Query Performance
-- Target: < 10ms (EXCELLENT), < 50ms (GOOD), < 100ms (ACCEPTABLE)
-- ============================================================================
EXPLAIN ANALYZE
SELECT * 
FROM profiles 
WHERE user_id = 'e86e846c-ec59-445f-aedc-6e6a1f983ed8';

-- Look for "Execution Time: X.XXX ms" in results


-- ============================================================================
-- TEST 2: Feature Access View Performance  
-- Target: < 20ms (EXCELLENT), < 100ms (GOOD)
-- ============================================================================
EXPLAIN ANALYZE
SELECT * 
FROM user_feature_access 
WHERE user_id = 'e86e846c-ec59-445f-aedc-6e6a1f983ed8';

-- Look for "Execution Time: X.XXX ms" in results


-- ============================================================================
-- TEST 3: Profile + Work Experiences Join
-- Target: < 50ms (EXCELLENT), < 150ms (GOOD)
-- ============================================================================
EXPLAIN ANALYZE
SELECT p.*, we.* 
FROM profiles p
LEFT JOIN work_experiences we ON p.user_id = we.user_id
WHERE p.user_id = 'e86e846c-ec59-445f-aedc-6e6a1f983ed8';

-- Look for "Execution Time: X.XXX ms" in results


-- ============================================================================
-- TEST 4: Business Profile Query
-- Target: < 50ms (EXCELLENT), < 150ms (GOOD)
-- ============================================================================
EXPLAIN ANALYZE
SELECT * 
FROM business_profiles
WHERE user_id = 'e86e846c-ec59-445f-aedc-6e6a1f983ed8';

-- Look for "Execution Time: X.XXX ms" in results


-- ============================================================================
-- TEST 5: Recent Notifications (if any exist)
-- Target: < 100ms (EXCELLENT), < 300ms (GOOD)
-- ============================================================================
EXPLAIN ANALYZE
SELECT * 
FROM notifications
WHERE user_id = 'e86e846c-ec59-445f-aedc-6e6a1f983ed8'
ORDER BY created_at DESC
LIMIT 50;

-- Look for "Execution Time: X.XXX ms" in results


-- ============================================================================
-- RESULTS INTERPRETATION:
-- ============================================================================
-- For each query above, check the "Execution Time" line at the end
-- 
-- GRADING:
-- < 10ms   = ✅ EXCELLENT (A+)
-- < 50ms   = ✅ GOOD (A)  
-- < 100ms  = ⚠️ ACCEPTABLE (B)
-- < 200ms  = ⚠️ NEEDS WORK (C)
-- > 200ms  = ❌ SLOW (F)
--
-- WHAT TO DO:
-- 1. Run STEP 1 to get a user_id
-- 2. Replace 'YOUR-USER-ID-HERE' in each test below
-- 3. Run each test one by one
-- 4. Check execution time for each
-- 5. Record results in day-20-test-results.md
-- ============================================================================
