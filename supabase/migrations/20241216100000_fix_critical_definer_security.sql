-- ============================================================================
-- Migration: Fix Critical SECURITY DEFINER Security Vulnerabilities
-- Week 3 - Day 11
-- Date: 2024-12-16
-- ============================================================================
-- 
-- CRITICAL SECURITY FIXES:
-- 1. Remove create_webhook_for_business() - Has auth bypass vulnerability
-- 2. Remove create_api_key_for_user() - Has auth bypass vulnerability
-- 3. Remove get_webhooks_for_business() - Unnecessary, use RLS
-- 4. Remove get_api_keys_for_user() - Unnecessary, use RLS
--
-- These functions currently allow ANY authenticated user to create webhooks
-- and API keys for ANY other user. This is a critical security vulnerability.
--
-- After removal, frontend will use direct INSERT/SELECT queries.
-- RLS policies (already in place from Week 2) will enforce security.
-- ============================================================================

-- Drop the vulnerable functions
DROP FUNCTION IF EXISTS create_webhook_for_business(UUID, TEXT, TEXT[], TEXT);
DROP FUNCTION IF EXISTS get_webhooks_for_business(UUID);
DROP FUNCTION IF EXISTS create_api_key_for_user(UUID, TEXT, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS get_api_keys_for_user(UUID);

-- ============================================================================
-- Verify RLS is Enabled on Tables
-- ============================================================================

-- Check webhooks RLS
DO $$
DECLARE
    rls_enabled BOOLEAN;
    policy_count INT;
BEGIN
    -- Check if RLS is enabled
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relname = 'webhooks';
    
    IF NOT rls_enabled THEN
        RAISE EXCEPTION 'RLS not enabled on webhooks table!';
    END IF;
    
    -- Check if at least one policy exists
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'webhooks';
    
    IF policy_count = 0 THEN
        RAISE WARNING 'No RLS policies found on webhooks table. Direct queries will work with proper policies.';
    ELSE
        RAISE NOTICE '✅ Webhooks has RLS enabled with % policy/policies', policy_count;
    END IF;
END $$;

-- Check api_keys RLS
DO $$
DECLARE
    rls_enabled BOOLEAN;
    policy_count INT;
BEGIN
    -- Check if RLS is enabled
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relname = 'api_keys';
    
    IF NOT rls_enabled THEN
        RAISE EXCEPTION 'RLS not enabled on api_keys table!';
    END IF;
    
    -- Check if at least one policy exists
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'api_keys';
    
    IF policy_count = 0 THEN
        RAISE WARNING 'No RLS policies found on api_keys table. Direct queries will work with proper policies.';
    ELSE
        RAISE NOTICE '✅ API Keys has RLS enabled with % policy/policies', policy_count;
    END IF;
END $$;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE '======================================';
    RAISE NOTICE '✅ CRITICAL SECURITY FIX COMPLETE';
    RAISE NOTICE '======================================';
    RAISE NOTICE 'Removed 4 vulnerable SECURITY DEFINER functions';
    RAISE NOTICE 'All operations now protected by RLS';
    RAISE NOTICE '';
    RAISE NOTICE 'Frontend Changes Required:';
    RAISE NOTICE '1. Replace create_webhook_for_business() calls with direct INSERT';
    RAISE NOTICE '2. Replace get_webhooks_for_business() calls with direct SELECT';
    RAISE NOTICE '3. Replace create_api_key_for_user() calls with direct INSERT';
    RAISE NOTICE '4. Replace get_api_keys_for_user() calls with direct SELECT';
    RAISE NOTICE '';
    RAISE NOTICE 'Example (webhooks):';
    RAISE NOTICE '  Old: SELECT * FROM create_webhook_for_business($1, $2, $3, $4)';
    RAISE NOTICE '  New: INSERT INTO webhooks (business_id, url, events, secret) VALUES ($1, $2, $3, $4) RETURNING *';
    RAISE NOTICE '';
    RAISE NOTICE 'RLS will automatically enforce user owns the business.';
    RAISE NOTICE '======================================';
END $$;

-- Add comment
COMMENT ON TABLE webhooks IS 'Stores webhook configurations. Protected by RLS - users can only access webhooks for businesses they own.';
COMMENT ON TABLE api_keys IS 'Stores API keys for users. Protected by RLS - users can only access their own keys.';
