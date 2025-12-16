-- ============================================================================
-- Performance Audit Script
-- Week 3 - Day 16
-- Date: 2024-12-16
-- ============================================================================
--
-- This script analyzes database performance and identifies optimization opportunities
-- Run this against your Supabase database to get performance insights
--
-- ============================================================================

\echo '============================================================================'
\echo 'PERFORMANCE AUDIT REPORT'
\echo 'Generated:' `date`
\echo '============================================================================'
\echo ''

-- ============================================================================
-- 1. Database Size Overview
-- ============================================================================

\echo '1. DATABASE SIZE OVERVIEW'
\echo '──────────────────────────────────────────'

SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

\echo ''

-- ============================================================================
-- 2. Index Usage Statistics
-- ============================================================================

\echo '2. INDEX USAGE STATISTICS'
\echo '──────────────────────────────────────────'
\echo 'Tables with low index usage (potential missing indexes):'
\echo ''

SELECT 
    schemaname,
    tablename,
    seq_scan as sequential_scans,
    idx_scan as index_scans,
    CASE 
        WHEN seq_scan + idx_scan > 0 
        THEN ROUND(100.0 * idx_scan / (seq_scan + idx_scan), 2)
        ELSE 0
    END as index_usage_pct,
    n_live_tup as live_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan + idx_scan > 0
ORDER BY 
    CASE 
        WHEN seq_scan + idx_scan > 0 
        THEN idx_scan::float / (seq_scan + idx_scan)
        ELSE 1
    END ASC,
    seq_scan DESC
LIMIT 15;

\echo ''

-- ============================================================================
-- 3. Tables with High Sequential Scans
-- ============================================================================

\echo '3. TABLES WITH HIGH SEQUENTIAL SCANS'
\echo '──────────────────────────────────────────'
\echo 'These tables may benefit from additional indexes:'
\echo ''

SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    CASE WHEN seq_scan > 0 
        THEN seq_tup_read / seq_scan 
        ELSE 0 
    END as avg_rows_per_scan,
    idx_scan,
    n_live_tup
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 0
  AND seq_tup_read > 10000
ORDER BY seq_tup_read DESC
LIMIT 10;

\echo ''

-- ============================================================================
-- 4. Unused Indexes
-- ============================================================================

\echo '4. POTENTIALLY UNUSED INDEXES'
\echo '──────────────────────────────────────────'
\echo 'Indexes that are rarely or never used (candidates for removal):'
\echo ''

SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan < 50  -- Used less than 50 times
  AND indexrelname NOT LIKE '%_pkey'  -- Exclude primary keys
ORDER BY pg_relation_size(indexrelid) DESC;

\echo ''

-- ============================================================================
-- 5. Table Bloat Analysis
-- ============================================================================

\echo '5. TABLE BLOAT ANALYSIS'
\echo '──────────────────────────────────────────'
\echo 'Tables with significant dead tuples (may need VACUUM):'
\echo ''

SELECT
    schemaname,
    tablename,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    ROUND(100 * n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_pct,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_live_tup > 0
  AND n_dead_tup > 100
ORDER BY n_dead_tup DESC
LIMIT 10;

\echo ''

-- ============================================================================
-- 6. Missing Indexes Suggestions
-- ============================================================================

\echo '6. MISSING INDEX SUGGESTIONS'
\echo '──────────────────────────────────────────'
\echo 'Based on query patterns, consider adding these indexes:'
\echo ''

-- Check for foreign keys without indexes
SELECT 
    c.conrelid::regclass AS table_name,
    string_agg(a.attname, ', ') AS columns,
    'CREATE INDEX idx_' || c.conrelid::regclass || '_' || 
    string_agg(a.attname, '_') || ' ON ' || 
    c.conrelid::regclass || '(' || string_agg(a.attname, ', ') || ');' AS suggested_index
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
LEFT JOIN pg_index i ON i.indrelid = c.conrelid 
    AND a.attnum = ANY(i.indkey)
WHERE c.contype = 'f'  -- Foreign keys
  AND c.connamespace::regnamespace::text = 'public'
  AND i.indexrelid IS NULL  -- No index exists
GROUP BY c.conrelid, c.conname
ORDER BY c.conrelid::regclass::text;

\echo ''

-- ============================================================================
-- 7. Cache Hit Ratio
-- ============================================================================

\echo '7. CACHE HIT RATIO'
\echo '──────────────────────────────────────────'
\echo 'Target: >99% (higher is better)'
\echo ''

SELECT 
    'index hit rate' as metric,
    ROUND(
        100.0 * sum(idx_blks_hit) / NULLIF(sum(idx_blks_hit + idx_blks_read), 0),
        2
    ) as percentage
FROM pg_statio_user_indexes
UNION ALL
SELECT 
    'table hit rate' as metric,
    ROUND(
        100.0 * sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit + heap_blks_read), 0),
        2
    ) as percentage
FROM pg_statio_user_tables;

\echo ''

-- ============================================================================
-- 8. RLS Policy Performance
-- ============================================================================

\echo '8. RLS-ENABLED TABLES'
\echo '──────────────────────────────────────────'
\echo 'Tables with RLS (may have policy evaluation overhead):'
\echo ''

SELECT 
    n.nspname as schema,
    c.relname as table_name,
    (SELECT COUNT(*) FROM pg_policies p 
     WHERE p.schemaname = n.nspname 
       AND p.tablename = c.relname) as policy_count,
    pg_size_pretty(pg_total_relation_size(c.oid)) as size
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = true
ORDER BY pg_total_relation_size(c.oid) DESC;

\echo ''

-- ============================================================================
-- 9. Critical Query Benchmarks
-- ============================================================================

\echo '9. CRITICAL QUERY BENCHMARKS'
\echo '──────────────────────────────────────────'
\echo 'Run EXPLAIN ANALYZE on these critical paths:'
\echo ''

\echo '-- Profile fetch by user_id'
\echo 'EXPLAIN ANALYZE SELECT * FROM profiles WHERE user_id = $1;'
\echo ''

\echo '-- Session lookup by refresh token'
\echo 'EXPLAIN ANALYZE SELECT * FROM user_sessions WHERE refresh_token = $1 AND is_active = true;'
\echo ''

\echo '-- Unread notifications count'
\echo 'EXPLAIN ANALYZE SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false;'
\echo ''

\echo '-- User work experiences'
\echo 'EXPLAIN ANALYZE SELECT * FROM work_experiences WHERE user_id = $1 ORDER BY start_date DESC;'
\echo ''

\echo '-- Business API keys'
\echo 'EXPLAIN ANALYZE SELECT * FROM api_keys WHERE user_id = $1 AND is_active = true;'
\echo ''

-- ============================================================================
-- 10. Recommendations Summary
-- ============================================================================

\echo '10. OPTIMIZATION RECOMMENDATIONS'
\echo '══════════════════════════════════════════'
\echo ''

DO $$
DECLARE
    low_index_usage_count INTEGER;
    high_seq_scan_count INTEGER;
    bloated_tables_count INTEGER;
    cache_hit_rate NUMERIC;
BEGIN
    -- Count tables with low index usage
    SELECT COUNT(*) INTO low_index_usage_count
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
      AND seq_scan + idx_scan > 0
      AND idx_scan::float / (seq_scan + idx_scan) < 0.5;
    
    -- Count tables with high sequential scans
    SELECT COUNT(*) INTO high_seq_scan_count
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
      AND seq_scan > 1000;
    
    -- Count bloated tables
    SELECT COUNT(*) INTO bloated_tables_count
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
      AND n_dead_tup > 1000;
    
    -- Get cache hit rate
    SELECT ROUND(
        100.0 * sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit + heap_blks_read), 0),
        2
    ) INTO cache_hit_rate
    FROM pg_statio_user_tables;
    
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'SUMMARY';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'Tables with low index usage: %', low_index_usage_count;
    RAISE NOTICE 'Tables with high sequential scans: %', high_seq_scan_count;
    RAISE NOTICE 'Tables needing VACUUM: %', bloated_tables_count;
    RAISE NOTICE 'Cache hit rate: % percent', cache_hit_rate;
    RAISE NOTICE '';
    
    IF low_index_usage_count > 5 THEN
        RAISE NOTICE '⚠️  HIGH: % tables have low index usage', low_index_usage_count;
        RAISE NOTICE '   → Add indexes to frequently queried columns';
    END IF;
    
    IF high_seq_scan_count > 3 THEN
        RAISE NOTICE '⚠️  MEDIUM: % tables have many sequential scans', high_seq_scan_count;
        RAISE NOTICE '   → Review section 3 for index candidates';
    END IF;
    
    IF bloated_tables_count > 5 THEN
        RAISE NOTICE '⚠️  LOW: % tables need VACUUM', bloated_tables_count;
        RAISE NOTICE '   → Run VACUUM ANALYZE on these tables';
    END IF;
    
    IF cache_hit_rate < 95 THEN
        RAISE NOTICE '⚠️  CRITICAL: Cache hit rate only % percent', cache_hit_rate;
        RAISE NOTICE '   → Increase shared_buffers or add more indexes';
    ELSE
        RAISE NOTICE '✅ Cache hit rate is healthy: % percent', cache_hit_rate;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Review sections 2-3 for missing indexes';
    RAISE NOTICE '2. Run EXPLAIN ANALYZE on critical queries (section 9)';
    RAISE NOTICE '3. Apply index optimization migration';
    RAISE NOTICE '4. Run load tests to verify improvements';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

\echo ''
\echo 'Audit complete! Review the output above for optimization opportunities.'
\echo '============================================================================'
