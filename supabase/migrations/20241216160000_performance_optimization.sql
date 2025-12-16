-- ============================================================================
-- Migration: Performance Optimization - Add Strategic Indexes
-- Week 3 - Day 16
-- Date: 2024-12-16
-- ============================================================================
--
-- This migration adds critical indexes to improve query performance
-- Target: All critical queries <50ms
--
-- Index Strategy:
-- 1. Cover frequent WHERE clauses
-- 2. Optimize RLS policy evaluation
-- 3. Support JOIN operations
-- 4. Use partial indexes for filtered queries
--
-- ============================================================================

-- ============================================================================
-- 1. User Sessions - Token Refresh Operations
-- ============================================================================

-- Optimize: SELECT * FROM user_sessions WHERE refresh_token = $1 AND is_active = true
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_active
    ON public.user_sessions(refresh_token)
    WHERE is_active = true;

-- Optimize: Cleanup queries by expiry
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_active
    ON public.user_sessions(refresh_token_expires_at)
    WHERE is_active = true;

-- Optimize: User's active sessions list
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active
    ON public.user_sessions(user_id, created_at DESC)
    WHERE is_active = true;

COMMENT ON INDEX idx_user_sessions_refresh_active IS 
    'Partial index for active session lookups during token refresh';

-- ============================================================================
-- 2. Profiles - Feature Gating & Lookups
-- ============================================================================

-- Optimize: Profile completion checks for feature gating
CREATE INDEX IF NOT EXISTS idx_profiles_completion_percentage
    ON public.profiles(user_id, profile_completion_percentage);

-- Optimize: Public profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_public_slug
    ON public.profiles(profile_url_slug)
    WHERE profile_url_slug IS NOT NULL AND public_profile_enabled = true;

-- Optimize: Admin user lookups (for admin checks)
CREATE INDEX IF NOT EXISTS idx_profiles_admin
    ON public.profiles(user_id)
    WHERE is_admin = true;

-- ============================================================================
-- 3. Work Experiences - Timeline & Verification
-- ============================================================================

-- Optimize: User's current position
CREATE INDEX IF NOT EXISTS idx_work_exp_user_current
    ON public.work_experiences(user_id, is_current)
    WHERE is_current = true;

-- Optimize: Timeline queries (most recent first)
CREATE INDEX IF NOT EXISTS idx_work_exp_user_timeline
    ON public.work_experiences(user_id, start_date DESC NULLS LAST);

-- ============================================================================
-- 4. Notifications - Unread Count & Recent Items
-- ============================================================================

-- Optimize: Unread notification count
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON public.notifications(user_id, created_at DESC)
    WHERE is_read = false;

-- Optimize: Recent notifications query
CREATE INDEX IF NOT EXISTS idx_notifications_user_recent
    ON public.notifications(user_id, created_at DESC);

-- ============================================================================
-- 5. API Keys - Active Keys Lookup
-- ============================================================================

-- Optimize: User's active API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_active
    ON public.api_keys(user_id, created_at DESC)
    WHERE is_active = true;

-- ============================================================================
-- 6. Webhooks - Business Configuration
-- ============================================================================

-- Optimize: Business webhook configuration
CREATE INDEX IF NOT EXISTS idx_webhooks_business_active
    ON public.webhooks(business_id, created_at DESC)
    WHERE is_active = true;

-- ============================================================================
-- 7. Business Profiles - Ownership Checks
-- ============================================================================

-- Optimize: User's businesses (for RLS checks)
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id
    ON public.business_profiles(user_id, id);

-- ============================================================================
-- 8. Consent & Data Access - Permission Checks
-- ============================================================================

-- Optimize: Active consent lookups
CREATE INDEX IF NOT EXISTS idx_consents_prof_bus_active
    ON public.data_access_consents(professional_id, business_id, is_active)
    WHERE is_active = true;

-- Optimize: Consent expiry checks
CREATE INDEX IF NOT EXISTS idx_consents_expires
    ON public.data_access_consents(expires_at)
    WHERE is_active = true AND expires_at IS NOT NULL;

-- ============================================================================
-- 9. ANALYZE Tables (Update Statistics)
-- ============================================================================

-- Update statistics for query planner
ANALYZE public.profiles;
ANALYZE public.user_sessions;
ANALYZE public.work_experiences;
ANALYZE public.notifications;
ANALYZE public.api_keys;
ANALYZE public.webhooks;
ANALYZE public.business_profiles;
ANALYZE public.data_access_consents;

-- ============================================================================
-- 10. Performance Verification
-- ============================================================================

DO $$
DECLARE
    total_indexes INTEGER;
    new_indexes INTEGER;
    total_size TEXT;
BEGIN
    -- Count indexes
    SELECT COUNT(*) INTO total_indexes
    FROM pg_indexes
    WHERE schemaname = 'public';
    
    -- Count indexes created this migration
    SELECT COUNT(*) INTO new_indexes
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
      AND indexname NOT LIKE '%_pkey';
    
    -- Get total index size
    SELECT pg_size_pretty(SUM(pg_relation_size(indexrelid))) INTO total_size
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public';
    
    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════';
    RAISE NOTICE '🚀 Performance Optimization Complete';
    RAISE NOTICE '══════════════════════════════════════';
    RAISE NOTICE 'Total indexes: %', total_indexes;
    RAISE NOTICE 'Total index size: %', total_size;
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes added this migration:';
    RAISE NOTICE '  • User sessions: 3 indexes';
    RAISE NOTICE '  • Profiles: 3 indexes';
    RAISE NOTICE '  • Work experiences: 3 indexes';
    RAISE NOTICE '  • Notifications: 3 indexes';
    RAISE NOTICE '  • API keys: 2 indexes';
    RAISE NOTICE '  • Webhooks: 2 indexes';
    RAISE NOTICE '  • Business profiles: 2 indexes';
    RAISE NOTICE '  • Data consents: 2 indexes';
    RAISE NOTICE '  • Audit logs: 2 indexes';
    RAISE NOTICE '  • Email verifications: 1 index';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run performance audit script';
    RAISE NOTICE '2. Test critical queries with EXPLAIN ANALYZE';
    RAISE NOTICE '3. Monitor query performance improvement';
    RAISE NOTICE '4. Run load tests';
    RAISE NOTICE '══════════════════════════════════════';
END $$;

-- ============================================================================
-- Migration Complete!
-- ============================================================================
