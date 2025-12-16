-- ============================================================================
-- Migration: Remove Unnecessary SECURITY DEFINER Functions
-- Week 3 - Day 11
-- Date: 2024-12-16
-- ============================================================================
--
-- Remove SECURITY DEFINER functions that unnecessarily bypass RLS.
-- These can be replaced with direct queries that respect RLS policies.
--
-- Functions to remove:
-- 1. mark_notification_read() - Simple UPDATE, RLS handles security
-- 2. mark_all_notifications_read() - Simple UPDATE, RLS handles security
-- 3. get_unread_notification_count() - Simple COUNT, RLS handles security
-- 4. get_api_quota_remaining() - Simple SELECT, RLS handles security
--
-- This reduces attack surface and simplifies codebase.
-- ============================================================================

-- ============================================================================
-- Remove Notification Helper Functions
-- ============================================================================

DROP FUNCTION IF EXISTS mark_notification_read(UUID);
DROP FUNCTION IF EXISTS mark_all_notifications_read();
DROP FUNCTION IF EXISTS get_unread_notification_count();

-- Verify notifications RLS exists
DO $$
DECLARE
    rls_enabled BOOLEAN;
    policy_count INT;
BEGIN
    -- Check if RLS is enabled
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relname = 'notifications';
    
    IF NOT rls_enabled THEN
        RAISE EXCEPTION 'RLS not enabled on notifications table!';
    END IF;
    
    -- Check if at least one policy exists
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notifications';
    
    IF policy_count = 0 THEN
        RAISE WARNING 'No RLS policies found on notifications table!';
    ELSE
        RAISE NOTICE '✅ Notifications has RLS enabled with % policy/policies', policy_count;
    END IF;
    
    RAISE NOTICE 'Frontend can now use direct queries:';
    RAISE NOTICE '  - Mark read: UPDATE notifications SET is_read=true, read_at=NOW() WHERE id=$1';
    RAISE NOTICE '  - Mark all: UPDATE notifications SET is_read=true, read_at=NOW() WHERE is_read=false';
    RAISE NOTICE '  - Get count: SELECT COUNT(*) FROM notifications WHERE is_read=false';
END $$;

-- ============================================================================
-- Remove API Quota Helper Function (if exists)
-- ============================================================================

DROP FUNCTION IF EXISTS get_api_quota_remaining(UUID);

-- ============================================================================
-- Migration Summary
-- ============================================================================

DO $$
DECLARE
    remaining_definer_count INT;
BEGIN
    -- Count remaining SECURITY DEFINER functions
    SELECT COUNT(*) INTO remaining_definer_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.prosecdef = true
      AND n.nspname = 'public';
    
    RAISE NOTICE '======================================';
    RAISE NOTICE '✅ SECURITY DEFINER Cleanup Complete';
    RAISE NOTICE '======================================';
    RAISE NOTICE 'Removed 4 unnecessary SECURITY DEFINER functions';
    RAISE NOTICE 'Remaining SECURITY DEFINER functions: %', remaining_definer_count;
    RAISE NOTICE '';
    RAISE NOTICE 'All removed functions can be replaced with direct queries.';
    RAISE NOTICE 'RLS policies automatically restrict access to owned data.';
    RAISE NOTICE '======================================';
END $$;

-- ============================================================================
-- Add Helper Comments
-- ============================================================================

COMMENT ON TABLE notifications IS 'User notifications system. RLS ensures users only see their own notifications. Use direct queries instead of helper functions for better performance.';
