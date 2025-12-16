-- ============================================================================
-- RLS Coverage Audit
-- Week 3 - Day 13
-- Purpose: Identify all tables without RLS enabled
-- ============================================================================

-- 1. Overall RLS Coverage Summary
SELECT 
    COUNT(*) FILTER (WHERE relrowsecurity = true) as tables_with_rls,
    COUNT(*) FILTER (WHERE relrowsecurity = false) as tables_without_rls,
    COUNT(*) as total_tables,
    ROUND(
        (COUNT(*) FILTER (WHERE relrowsecurity = true)::NUMERIC / COUNT(*) * 100), 
        2
    ) as rls_coverage_percentage
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relkind = 'r' -- Only regular tables
  AND c.relname NOT LIKE 'pg_%';

-- 2. Tables WITHOUT RLS (need to be secured)
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    pg_size_pretty(pg_total_relation_size(c.oid)) as table_size,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = n.nspname AND table_name = c.relname) as column_count
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = false
  AND c.relname NOT LIKE 'pg_%'
ORDER BY c.relname;

-- 3. Tables WITH RLS (already secured)
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    (SELECT COUNT(*) FROM pg_policies p 
     WHERE p.schemaname = n.nspname AND p.tablename = c.relname) as policy_count
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = true
  AND c.relname NOT LIKE 'pg_%'
ORDER BY c.relname;

-- 4. Detailed Info on Tables Without RLS
SELECT 
    c.relname as table_name,
    -- Check if table has user_id column (user-owned data)
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = c.relname 
          AND column_name = 'user_id'
    ) as has_user_id,
    -- Check if table has business_id column (business-owned data)
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = c.relname 
          AND column_name = 'business_id'
    ) as has_business_id,
    -- Check row count (if small, might be reference data)
    (SELECT COUNT(*) FROM pg_class WHERE relname = c.relname) as approx_row_count,
    -- List all columns
    (
        SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = c.relname
    ) as columns
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = false
  AND c.relname NOT LIKE 'pg_%'
ORDER BY c.relname;

-- 5. Suggested RLS Pattern for Each Table
SELECT 
    c.relname as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = c.relname 
              AND column_name = 'user_id'
        ) THEN 'USER_OWNED'
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = c.relname 
              AND column_name = 'business_id'
        ) THEN 'BUSINESS_OWNED'
        WHEN c.relname LIKE '%_log%' OR c.relname LIKE '%_audit%' THEN 'AUDIT_TABLE'
        WHEN c.relname LIKE '%_token%' OR c.relname LIKE '%_code%' THEN 'SYSTEM_TABLE'
        ELSE 'NEEDS_REVIEW'
    END as suggested_pattern
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = false
  AND c.relname NOT LIKE 'pg_%'
ORDER BY c.relname;
