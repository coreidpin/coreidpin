-- ============================================================================
-- RLS Quick Check - Simple SELECT Queries Only
-- Run each query separately to check security status
-- ============================================================================

-- QUERY 1: Check which tables have RLS enabled
-- Expected: All should show TRUE
-- ============================================================================
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS ENABLED'
    ELSE '❌ RLS NOT ENABLED'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 
    'business_profiles',
    'work_experiences',
    'api_keys',
    'notifications',
    'user_sessions',
    'professional_endorsements_v2',
    'projects'
  )
ORDER BY tablename;


-- QUERY 2: Count RLS policies per table
-- Expected: Each table should have 3+ policies
-- ============================================================================
SELECT 
  tablename,
  COUNT(*) as total_policies,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ Good coverage'
    WHEN COUNT(*) >= 2 THEN '⚠️ Minimal coverage'
    ELSE '❌ Needs more policies'
  END as assessment
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 
    'business_profiles',
    'work_experiences',
    'api_keys',
    'notifications',
    'user_sessions'
  )
GROUP BY tablename
ORDER BY tablename;


-- QUERY 3: List all RLS policies
-- Expected: Should see USER, SERVICE, and other policies
-- ============================================================================
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN policyname ILIKE '%service%' THEN '⚙️ Service Role'
    WHEN policyname ILIKE '%user%' OR policyname ILIKE '%own%' THEN '👤 User Access'
    ELSE '📋 Other'
  END as policy_type
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


-- QUERY 4: Check for tables WITHOUT RLS (should be empty or minimal)
-- Expected: Only system tables or intentionally public tables
-- ============================================================================
SELECT 
  tablename,
  '⚠️ NO RLS' as warning
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE '_pg_%'
ORDER BY tablename;


-- QUERY 5: Summary - Quick Status
-- Expected: High percentages for both
-- ============================================================================
WITH important_tables AS (
  SELECT UNNEST(ARRAY[
    'profiles', 
    'business_profiles',
    'work_experiences',
    'api_keys',
    'notifications',
    'user_sessions'
  ]) as tablename
),
rls_status AS (
  SELECT 
    t.tablename,
    COALESCE(pt.rowsecurity, false) as has_rls
  FROM important_tables t
  LEFT JOIN pg_tables pt ON t.tablename = pt.tablename AND pt.schemaname = 'public'
)
SELECT 
  COUNT(*) as total_important_tables,
  SUM(CASE WHEN has_rls THEN 1 ELSE 0 END) as tables_with_rls,
  ROUND(100.0 * SUM(CASE WHEN has_rls THEN 1 ELSE 0 END) / COUNT(*), 1) || '%' as rls_coverage,
  CASE 
    WHEN SUM(CASE WHEN has_rls THEN 1 ELSE 0 END) = COUNT(*) THEN '✅ PERFECT - All secured'
    WHEN SUM(CASE WHEN has_rls THEN 1 ELSE 0 END) >= COUNT(*) * 0.8 THEN '⚠️ GOOD - Most secured'
    ELSE '❌ NEEDS WORK - Low coverage'
  END as overall_status
FROM rls_status;


-- ============================================================================
-- HOW TO INTERPRET RESULTS:
-- ============================================================================
-- QUERY 1: All tables should show "✅ RLS ENABLED"
-- QUERY 2: All tables should have 3+ policies (Good coverage)
-- QUERY 3: Should see multiple policies per table with mix of USER and SERVICE types
-- QUERY 4: Should be empty or only show non-sensitive tables
-- QUERY 5: Should show 100% RLS coverage with "✅ PERFECT" status
-- ============================================================================
