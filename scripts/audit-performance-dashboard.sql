-- ============================================================================
-- Performance Audit - Supabase Dashboard Version
-- Week 3 - Day 16
-- ============================================================================
-- Run this in Supabase Dashboard SQL Editor
-- Pure SQL - no psql commands
-- ============================================================================

-- 1. Index Usage Statistics
SELECT 
    'Index Usage by Table' as report_section,
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
ORDER BY index_usage_pct ASC
LIMIT 15;

-- 2. Tables with High Sequential Scans
SELECT 
    'High Sequential Scans' as report_section,
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    CASE WHEN seq_scan > 0 
        THEN seq_tup_read / seq_scan 
        ELSE 0 
    END as avg_rows_per_scan
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 100
ORDER BY seq_scan DESC
LIMIT 10;

-- 3. Cache Hit Ratio
SELECT 
    'Cache Hit Ratio' as report_section,
    'index hit rate' as metric,
    ROUND(
        100.0 * sum(idx_blks_hit) / NULLIF(sum(idx_blks_hit + idx_blks_read), 0),
        2
    ) as percentage
FROM pg_statio_user_indexes
UNION ALL
SELECT 
    'Cache Hit Ratio' as report_section,
    'table hit rate' as metric,
    ROUND(
        100.0 * sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit + heap_blks_read), 0),
        2
    ) as percentage
FROM pg_statio_user_tables;

-- 4. Table Sizes
SELECT 
    'Table Sizes' as report_section,
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- 5. Unused Indexes
SELECT 
    'Potentially Unused Indexes' as report_section,
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan < 50
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 10;
