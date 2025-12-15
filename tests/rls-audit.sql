-- ============================================================================
-- Day 6: RLS Audit Queries
-- Run these in Supabase SQL Editor to assess current state
-- ============================================================================

-- Query 1: Find all tables WITHOUT RLS enabled
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as has_rls,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Enabled'
    ELSE '❌ NO RLS'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY rowsecurity, tablename;

-- Expected: List of all tables, showing which have RLS


-- Query 2: Tables that NEED RLS (user-owned data)
-- ============================================================================
SELECT 
  t.tablename,
  t.rowsecurity,
  c.column_name as has_user_id_column,
  CASE 
    WHEN t.rowsecurity THEN '✅ Has RLS'
    WHEN c.column_name IS NOT NULL THEN '⚠️ NEEDS RLS (has user_id)'
    ELSE '✓ No user data'
  END as recommendation
FROM pg_tables t
LEFT JOIN information_schema.columns c 
  ON c.table_name = t.tablename 
  AND c.column_name = 'user_id'
WHERE t.schemaname = 'public'
ORDER BY 
  CASE 
    WHEN NOT t.rowsecurity AND c.column_name IS NOT NULL THEN 1
    WHEN t.rowsecurity THEN 2
    ELSE 3
  END,
  t.tablename;

-- Expected: Prioritized list - tables with user_id but no RLS are high priority


-- Query 3: Find all SECURITY DEFINER functions
-- ============================================================================
SELECT 
  routine_name as function_name,
  security_type,
  routine_definition,
  CASE 
    WHEN security_type = 'DEFINER' THEN '❌ SECURITY DEFINER (REMOVE)'
    ELSE '✅ SECURITY INVOKER (Good)'
  END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY 
  CASE WHEN security_type = 'DEFINER' THEN 1 ELSE 2 END,
  routine_name;

-- Expected: List of functions that bypass RLS


-- Query 4: Existing RLS policies
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected: Current RLS policies (should include user_sessions from Week 1)


-- Query 5: Tables by priority (for RLS implementation)
-- ============================================================================
WITH table_info AS (
  SELECT 
    t.tablename,
    t.rowsecurity as has_rls,
    EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_name = t.tablename 
      AND c.column_name = 'user_id'
    ) as has_user_id,
    (
      SELECT COUNT(*) 
      FROM information_schema.table_constraints tc
      WHERE tc.table_name = t.tablename
      AND tc.constraint_type = 'FOREIGN KEY'
    ) as fk_count
  FROM pg_tables t
  WHERE t.schemaname = 'public'
)
SELECT 
  tablename,
  has_rls,
  has_user_id,
  fk_count,
  CASE 
    WHEN tablename IN ('api_keys', 'profiles', 'business_profiles') THEN '🔴 CRITICAL'
    WHEN has_user_id AND NOT has_rls THEN '🟠 HIGH'
    WHEN has_user_id AND has_rls THEN '🟢 DONE'
    ELSE '🔵 LOW'
  END as priority,
  CASE 
    WHEN tablename IN ('api_keys', 'profiles', 'business_profiles') THEN 1
    WHEN has_user_id AND NOT has_rls THEN 2
    WHEN has_user_id AND has_rls THEN 3
    ELSE 4
  END as order_rank
FROM table_info
ORDER BY order_rank, tablename;

-- Expected: Tables ranked by implementation priority


-- Query 6: Check for tables with sensitive data
-- ============================================================================
SELECT DISTINCT
  c.table_name,
  COUNT(*) as sensitive_columns,
  array_agg(c.column_name) as columns
FROM information_schema.columns c
WHERE c.table_schema = 'public'
AND (
  c.column_name ILIKE '%api%' OR
  c.column_name ILIKE '%key%' OR
  c.column_name ILIKE '%secret%' OR
  c.column_name ILIKE '%token%' OR
  c.column_name ILIKE '%password%'
)
GROUP BY c.table_name
ORDER BY sensitive_columns DESC;

-- Expected: Tables containing API keys, passwords, tokens, etc.


-- Query 7: User data distribution
-- ============================================================================
SELECT 
  'api_keys' as table_name,
  COUNT(*) as total_rows,
  COUNT(DISTINCT user_id) as unique_users
FROM api_keys
UNION ALL
SELECT 
  'profiles',
  COUNT(*),
  COUNT(DISTINCT user_id)
FROM profiles
UNION ALL
SELECT 
  'user_sessions',
  COUNT(*),
  COUNT(DISTINCT user_id)
FROM user_sessions
ORDER BY table_name;

-- Expected: How much user data exists in each table


-- Query 8: Foreign key relationships
-- ============================================================================
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Expected: Understand data relationships for RLS policy design


-- ============================================================================
-- SUMMARY QUERY - Run this for quick overview
-- ============================================================================
SELECT 
  '📊 Database Overview' as category,
  '' as detail,
  '' as value
UNION ALL
SELECT 
  'Total Tables',
  '',
  COUNT(*)::text
FROM pg_tables WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Tables with RLS',
  '✅',
  COUNT(*)::text
FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true
UNION ALL
SELECT 
  'Tables WITHOUT RLS',
  '❌',
  COUNT(*)::text
FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false
UNION ALL
SELECT 
  'SECURITY DEFINER Functions',
  '⚠️',
  COUNT(*)::text
FROM information_schema.routines 
WHERE routine_schema = 'public' AND security_type = 'DEFINER'
UNION ALL
SELECT 
  'RLS Policies',
  '🔐',
  COUNT(*)::text
FROM pg_policies WHERE schemaname = 'public';

-- Expected: Quick summary of RLS status
