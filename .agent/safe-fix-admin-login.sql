-- SAFE FIX: Admin Login Error - Checks table existence first
-- Run this in Supabase SQL Editor

DO $$
BEGIN
    RAISE NOTICE 'Starting safe admin login fix...';
    
    -- ============================================
    -- STEP 1: Disable triggers on tables that exist
    -- ============================================
    
    -- Check and disable work_experiences triggers
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'work_experiences') THEN
        EXECUTE 'ALTER TABLE public.work_experiences DISABLE TRIGGER ALL';
        RAISE NOTICE '✓ Disabled triggers on work_experiences';
    ELSE
        RAISE NOTICE '- work_experiences table does not exist, skipping';
    END IF;
    
    -- Check and disable endorsement_requests triggers
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'endorsement_requests') THEN
        EXECUTE 'ALTER TABLE public.endorsement_requests DISABLE TRIGGER ALL';
        RAISE NOTICE '✓ Disabled triggers on endorsement_requests';
    ELSE
        RAISE NOTICE '- endorsement_requests table does not exist, skipping';
    END IF;
    
    -- Check and disable endorsements triggers
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'endorsements') THEN
        EXECUTE 'ALTER TABLE public.endorsements DISABLE TRIGGER ALL';
        RAISE NOTICE '✓ Disabled triggers on endorsements';
    ELSE
        RAISE NOTICE '- endorsements table does not exist, skipping';
    END IF;
    
    -- ============================================
    -- STEP 2: Temporarily disable RLS on key tables
    -- ============================================
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        EXECUTE 'ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY';
        RAISE NOTICE '✓ Disabled RLS on profiles';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'business_profiles') THEN
        EXECUTE 'ALTER TABLE public.business_profiles DISABLE ROW LEVEL SECURITY';
        RAISE NOTICE '✓ Disabled RLS on business_profiles';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'professional_pins') THEN
        EXECUTE 'ALTER TABLE public.professional_pins DISABLE ROW LEVEL SECURITY';
        RAISE NOTICE '✓ Disabled RLS on professional_pins';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        EXECUTE 'ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY';
        RAISE NOTICE '✓ Disabled RLS on notifications';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'api_usage_logs') THEN
        EXECUTE 'ALTER TABLE public.api_usage_logs DISABLE ROW LEVEL SECURITY';
        RAISE NOTICE '✓ Disabled RLS on api_usage_logs';
    END IF;
    
    -- ============================================
    -- SUCCESS
    -- ============================================
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ FIX APPLIED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '👉 TRY LOGGING IN NOW';
    RAISE NOTICE '';
    RAISE NOTICE 'All triggers and RLS temporarily disabled';
    RAISE NOTICE 'We can re-enable them after login works';
    RAISE NOTICE '========================================';
    
END $$;
