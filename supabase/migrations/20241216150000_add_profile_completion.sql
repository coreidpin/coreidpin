-- ============================================================================
-- Migration: Add Profile Completion Tracking (Simplified)
-- Week 3 - Day 15
-- Date: 2024-12-16
-- ============================================================================
--
-- Simplified version that adds profile completion without assuming column names
-- Will be customized based on actual schema
-- ============================================================================

-- ============================================================================
-- 1. Add Profile Completion Column
-- ============================================================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;

-- Add index for feature gating queries
CREATE INDEX IF NOT EXISTS idx_profiles_completion 
    ON public.profiles(profile_completion_percentage);

-- ============================================================================
-- 2. Create Simple Completion Calculation Function
-- ============================================================================

-- This is a placeholder - customize based on your actual schema
CREATE OR REPLACE FUNCTION calculate_profile_completion(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    completion INTEGER := 50;  -- Default to 50% for now
BEGIN
    -- TODO: Customize this based on actual profiles table columns
    -- For now, return a default value
    
    UPDATE profiles
    SET profile_completion_percentage = completion,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN completion;
END;
$$;

GRANT EXECUTE ON FUNCTION calculate_profile_completion(UUID) TO authenticated;

COMMENT ON FUNCTION calculate_profile_completion(UUID) IS 
    'Calculates profile completion percentage. TODO: Customize based on actual schema.';

-- ============================================================================
-- 3. Create Helper View for Feature Access
-- ============================================================================

CREATE OR REPLACE VIEW user_feature_access AS
SELECT 
    p.user_id,
    COALESCE(p.profile_completion_percentage, 0) as profile_completion_percentage,
    CASE 
        WHEN COALESCE(p.profile_completion_percentage, 0) >= 80 THEN true 
        ELSE false 
    END as can_access_api_keys,
    CASE 
        WHEN COALESCE(p.profile_completion_percentage, 0) >= 100 THEN true 
        ELSE false 
    END as can_access_webhooks
FROM profiles p;

-- RLS on view
ALTER VIEW user_feature_access SET (security_invoker = true);

COMMENT ON VIEW user_feature_access IS 
    'Shows user feature access based on profile completion. Used for feature gating.';

-- ============================================================================
-- 4. Verification
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════';
    RAISE NOTICE '📊 Profile Completion Infrastructure';
    RAISE NOTICE '══════════════════════════════════════';
    RAISE NOTICE 'Column added: profile_completion_percentage';
    RAISE NOTICE 'Function created: calculate_profile_completion(UUID)';
    RAISE NOTICE 'View created: user_feature_access';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  NOTE: Update calculate_profile_completion()';
    RAISE NOTICE '   function to match your actual schema!';
    RAISE NOTICE '';
    RAISE NOTICE 'Feature gating thresholds:';
    RAISE NOTICE '  - API Keys: 80 percent completion';
    RAISE NOTICE '  - Webhooks: 100 percent completion';
    RAISE NOTICE '══════════════════════════════════════';
END $$;

-- ============================================================================
-- 5. Add Comments
-- ============================================================================

COMMENT ON COLUMN profiles.profile_completion_percentage IS 
    'Profile completion percentage (0-100). Used for feature gating. Currently defaults to 50% - customize calculate_profile_completion() function.';

-- ============================================================================
-- Migration Complete
-- ============================================================================
