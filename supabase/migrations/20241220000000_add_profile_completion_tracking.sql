-- ============================================================================
-- Add Profile Completion Tracking
-- File: 20241220000000_add_profile_completion_tracking.sql
-- ============================================================================

-- Step 1: Add completion tracking columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;

-- Step 2: Create index for filtering complete profiles
CREATE INDEX IF NOT EXISTS idx_profiles_complete 
ON profiles(profile_complete) 
WHERE profile_complete = true;

-- Step 3: Create index on completion percentage for analytics
CREATE INDEX IF NOT EXISTS idx_profiles_completion_percentage 
ON profiles(completion_percentage);

-- Step 4: Note about backfill
-- The completion_percentage and profile_complete will be calculated
-- and updated by the frontend on next login/page load.
-- This avoids complex type handling in migration.

-- Step 5: Verification
DO $$
DECLARE
  complete_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO complete_count
  FROM profiles
  WHERE profile_complete = true;
  
  RAISE NOTICE '✅ Profile completion tracking columns added';
  RAISE NOTICE 'Columns: profile_complete, completed_at, completion_percentage';
  RAISE NOTICE 'Current complete profiles: %', complete_count;
  RAISE NOTICE 'Frontend will calculate completion on next page load';
END $$;

