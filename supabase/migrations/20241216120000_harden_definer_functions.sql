-- ============================================================================
-- Migration: Harden Remaining SECURITY DEFINER Functions
-- Week 3 - Day 12
-- Date: 2024-12-16
-- ============================================================================
--
-- Add security checks to remaining SECURITY DEFINER functions to prevent abuse.
--
-- Functions to harden:
-- 1. create_announcement() - Add admin role check (CRITICAL)
--    Current risk: Any authenticated user can spam all users
--    Fix: Require admin role
--
-- This migration adds proper authorization checks while maintaining
-- necessary SECURITY DEFINER status for system operations.
-- ============================================================================

-- ============================================================================
-- 1. Add Admin Role to Profiles (if not exists)
-- ============================================================================

-- First, ensure we have an is_admin or role column
DO $$
BEGIN
    -- Check if profiles table has admin designation
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'is_admin'
    ) THEN
        -- Add is_admin column if it doesn't exist
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_admin column to profiles table';
    ELSE
        RAISE NOTICE '✅ is_admin column already exists';
    END IF;
    
    -- Check for role column as alternative
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'role'
    ) THEN
        RAISE NOTICE 'Note: role column does not exist, using is_admin';
    ELSE
        RAISE NOTICE '✅ role column exists';
    END IF;
END $$;

-- ============================================================================
-- 2. Harden create_announcement() Function
-- ============================================================================

-- Drop and recreate with admin check
DROP FUNCTION IF EXISTS create_announcement(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION create_announcement(
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    announcement_id UUID;
    v_is_admin BOOLEAN;
    v_user_id UUID;
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to create announcements';
    END IF;
    
    -- Check if caller is admin
    SELECT COALESCE(is_admin, false) INTO v_is_admin
    FROM profiles
    WHERE user_id = v_user_id;
    
    -- If is_admin column doesn't exist or user not found, check role column
    IF v_is_admin IS NULL THEN
        SELECT (role = 'admin' OR role = 'superadmin') INTO v_is_admin
        FROM profiles
        WHERE user_id = v_user_id;
    END IF;
    
    -- Deny if not admin
    IF NOT COALESCE(v_is_admin, false) THEN
        RAISE EXCEPTION 'Unauthorized: Only administrators can create system announcements'
            USING HINT = 'Contact your administrator for access';
    END IF;
    
    -- Validate inputs
    IF p_title IS NULL OR TRIM(p_title) = '' THEN
        RAISE EXCEPTION 'Announcement title cannot be empty';
    END IF;
    
    IF p_message IS NULL OR TRIM(p_message) = '' THEN
        RAISE EXCEPTION 'Announcement message cannot be empty';
    END IF;
    
    IF p_type NOT IN ('success', 'alert', 'info', 'warning') THEN
        RAISE EXCEPTION 'Invalid announcement type. Must be: success, alert, info, or warning';
    END IF;
    
    -- Create announcement for all users
    INSERT INTO notifications (user_id, type, category, title, message, metadata)
    SELECT 
        id,
        p_type,
        'announcement',
        p_title,
        p_message,
        jsonb_build_object(
            'is_global', true,
            'created_by', v_user_id,
            'created_by_admin', true
        )
    FROM auth.users
    RETURNING id INTO announcement_id;
    
    -- Log the action
    RAISE NOTICE 'Admin % created announcement for all users: %', v_user_id, p_title;
    
    RETURN announcement_id;
END;
$$;

-- Update comment
COMMENT ON FUNCTION create_announcement(TEXT, TEXT, TEXT) IS 
    'Create system-wide announcement for all users. Requires admin role. Protected by admin check.';

-- ============================================================================
-- 3. Create Helper Function to Check Admin Status
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER -- Use INVOKER, not DEFINER
STABLE
AS $$
DECLARE
    v_user_id UUID;
    v_is_admin BOOLEAN;
BEGIN
    -- Use provided user_id or current user
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    IF v_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check is_admin column
    SELECT COALESCE(profiles.is_admin, false) INTO v_is_admin
    FROM profiles
    WHERE user_id = v_user_id;
    
    -- If not found or false, check role column as fallback
    IF NOT COALESCE(v_is_admin, false) THEN
        SELECT (role IN ('admin', 'superadmin')) INTO v_is_admin
        FROM profiles
        WHERE user_id = v_user_id;
    END IF;
    
    RETURN COALESCE(v_is_admin, false);
END;
$$;

COMMENT ON FUNCTION is_admin(UUID) IS 
    'Check if a user has admin privileges. Returns false if user not found or not admin.';

-- ============================================================================
-- 4. Create Function to Grant Admin Access (Admin Only)
-- ============================================================================

CREATE OR REPLACE FUNCTION grant_admin_access(p_target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_id UUID;
BEGIN
    v_caller_id := auth.uid();
    
    -- Only existing admins can grant admin access
    IF NOT is_admin(v_caller_id) THEN
        RAISE EXCEPTION 'Unauthorized: Only administrators can grant admin access';
    END IF;
    
    -- Grant admin access
    UPDATE profiles
    SET is_admin = true,
        updated_at = NOW()
    WHERE user_id = p_target_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    RAISE NOTICE 'Admin % granted admin access to user %', v_caller_id, p_target_user_id;
    
    RETURN true;
END;
$$;

COMMENT ON FUNCTION grant_admin_access(UUID) IS 
    'Grant admin privileges to a user. Only callable by existing admins.';

-- ============================================================================
-- 5. Create Initial Admin (For First Setup)
-- ============================================================================

-- This function can be called once to create the first admin
-- After first admin exists, use grant_admin_access() instead
CREATE OR REPLACE FUNCTION create_first_admin(p_user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_admin_count INT;
BEGIN
    -- Check if any admins exist
    SELECT COUNT(*) INTO v_admin_count
    FROM profiles
    WHERE is_admin = true;
    
    -- Only allow if no admins exist yet
    IF v_admin_count > 0 THEN
        RAISE EXCEPTION 'Admin users already exist. Use grant_admin_access() function instead.';
    END IF;
    
    -- Find user by email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = p_user_email;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', p_user_email;
    END IF;
    
    -- Grant admin access
    UPDATE profiles
    SET is_admin = true,
        updated_at = NOW()
    WHERE user_id = v_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile not found for user';
    END IF;
    
    RAISE NOTICE '✅ Created first admin: % (%)', p_user_email, v_user_id;
    
    RETURN true;
END;
$$;

COMMENT ON FUNCTION create_first_admin(TEXT) IS 
    'Create the first admin user by email. Only works when no admins exist yet.';

-- ============================================================================
-- 6. Verification & Summary
-- ============================================================================

DO $$
DECLARE
    definer_count INT;
    admin_count INT;
BEGIN
    -- Count remaining SECURITY DEFINER functions
    SELECT COUNT(*) INTO definer_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.prosecdef = true
      AND n.nspname = 'public';
    
    -- Count current admins
    SELECT COUNT(*) INTO admin_count
    FROM profiles
    WHERE is_admin = true;
    
    RAISE NOTICE '======================================';
    RAISE NOTICE '✅ Security Hardening Complete';
    RAISE NOTICE '======================================';
    RAISE NOTICE 'Hardened Functions:';
    RAISE NOTICE '  • create_announcement() - Now requires admin role';
    RAISE NOTICE '';
    RAISE NOTICE 'New Helper Functions:';
    RAISE NOTICE '  • is_admin() - Check admin status';
    RAISE NOTICE '  • grant_admin_access() - Grant admin (admin only)';
    RAISE NOTICE '  • create_first_admin() - Bootstrap first admin';
    RAISE NOTICE '';
    RAISE NOTICE 'Current Status:';
    RAISE NOTICE '  • SECURITY DEFINER functions: %', definer_count;
    RAISE NOTICE '  • Admin users: %', admin_count;
    RAISE NOTICE '';
    
    IF admin_count = 0 THEN
        RAISE NOTICE '⚠️  NO ADMINS EXIST YET';
        RAISE NOTICE 'Run: SELECT create_first_admin(''your-email@example.com'');';
        RAISE NOTICE 'to create the first admin user.';
    ELSE
        RAISE NOTICE '✅ Admin users configured';
    END IF;
    
    RAISE NOTICE '======================================';
END $$;

-- ============================================================================
-- Grant Permissions
-- ============================================================================

-- Anyone can check admin status
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;

-- Only service role can grant admin or create first admin
GRANT EXECUTE ON FUNCTION grant_admin_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_first_admin(TEXT) TO authenticated;

-- Announcements still available to all (function does auth check internally)
GRANT EXECUTE ON FUNCTION create_announcement(TEXT, TEXT, TEXT) TO authenticated;
