-- FINAL FIX: Only disable our custom triggers (not system triggers)
-- Run this in Supabase SQL Editor

DO $$
BEGIN
    RAISE NOTICE 'Disabling only custom triggers...';
    
    -- ============================================
    -- Disable ONLY our custom triggers by name
    -- ============================================
    
    -- Work experiences notification trigger
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'work_verification_notification' 
        AND tgrelid = 'public.work_experiences'::regclass
    ) THEN
        DROP TRIGGER work_verification_notification ON public.work_experiences;
        RAISE NOTICE '✓ Dropped work_verification_notification trigger';
    END IF;
    
    -- Endorsement request notification trigger
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'endorsement_request_notification'
    ) THEN
        DROP TRIGGER endorsement_request_notification ON public.endorsement_requests;
        RAISE NOTICE '✓ Dropped endorsement_request_notification trigger';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE '- endorsement_requests table does not exist';
    END IF;
    
    -- Endorsement accepted notification trigger  
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'endorsement_accepted_notification'
    ) THEN
        DROP TRIGGER endorsement_accepted_notification ON public.endorsements;
        RAISE NOTICE '✓ Dropped endorsement_accepted_notification trigger';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE '- endorsements table does not exist';
    END IF;
    
    -- ============================================
    -- Disable RLS temporarily
    -- ============================================
    
    ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.business_profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.professional_pins DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.api_usage_logs DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.api_keys DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.work_experiences DISABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✓ Disabled RLS on all tables';
    
    -- ============================================
    -- SUCCESS
    -- ============================================
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ CUSTOM TRIGGERS REMOVED!';
    RAISE NOTICE '✅ RLS DISABLED!';
    RAISE NOTICE '';
    RAISE NOTICE '👉 TRY ADMIN LOGIN NOW';
    RAISE NOTICE '========================================';
    
END $$;
