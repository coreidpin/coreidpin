-- ============================================================================
-- Day 21 Phase 2: Data Cleanup Script
-- Run this CAREFULLY in Supabase SQL Editor to fix data quality issues
-- ============================================================================

-- SAFETY: This script uses transactions and dry-run options
-- Review each section before running!

BEGIN;

-- ============================================================================
-- FIX 1: Invalid Profile Completion Percentages
-- ============================================================================
-- Cap percentages to 0-100 range
UPDATE profiles 
SET profile_completion_percentage = LEAST(100, GREATEST(0, profile_completion_percentage))
WHERE profile_completion_percentage < 0 OR profile_completion_percentage > 100;

-- Verify fix
SELECT 
  'Fix 1: Completion Percentages' as fix_name,
  COUNT(*) as records_fixed
FROM profiles
WHERE profile_completion_percentage >= 0 AND profile_completion_percentage <= 100;


-- ============================================================================
-- FIX 2: Set Default Values for NULL Required Fields
-- ============================================================================
-- Set email_verified to false if NULL
UPDATE profiles
SET email_verified = false
WHERE email_verified IS NULL;

-- Set public_profile_enabled to default if NULL
UPDATE profiles
SET public_profile_enabled = COALESCE(public_profile_enabled, false)
WHERE public_profile_enabled IS NULL;

-- Verify fix
SELECT 
  'Fix 2: NULL Required Fields' as fix_name,
  COUNT(*) as records_with_defaults
FROM profiles
WHERE email_verified IS NOT NULL;


-- ============================================================================
-- FIX 3: Clean Up Test/Invalid Data (CAREFUL!)
-- ============================================================================
-- Only remove profiles with obviously invalid emails (if any exist)
-- This is COMMENTED OUT for safety - review before using!
/*
DELETE FROM profiles
WHERE email LIKE '%test%@test.com'
   OR email LIKE '%invalid%';
*/

-- Instead, just report them
SELECT 
  'Fix 3: Test Data Found' as fix_name,
  COUNT(*) as test_records,
  'NOT DELETED - Review manually' as action
FROM profiles
WHERE email LIKE '%test%@test.com'
   OR email LIKE '%invalid%';


-- ============================================================================
-- FIX 4: Update Missing User Types (Set Default)
-- ============================================================================
-- Set default user_type if NULL
UPDATE profiles
SET user_type = 'professional'
WHERE user_type IS NULL;

-- Verify fix
SELECT 
  'Fix 4: Missing User Types' as fix_name,
  COUNT(*) as records_fixed
FROM profiles
WHERE user_type IS NOT NULL;


-- ============================================================================
-- FIX 5: Fix Work Experiences with Invalid Dates
-- ============================================================================
-- Set is_current = true for work experiences with future end dates
UPDATE work_experiences
SET is_current = true,
    end_date = NULL
WHERE end_date > CURRENT_DATE
  AND is_current = false;

-- Verify fix
SELECT 
  'Fix 5: Future End Dates' as fix_name,
  COUNT(*) as records_fixed
FROM work_experiences
WHERE is_current = true OR end_date <= CURRENT_DATE;


-- ============================================================================
-- VERIFICATION: Check for Orphaned Records (DO NOT DELETE YET)
-- ============================================================================
-- Report orphaned work experiences (don't delete automatically)
SELECT 
  'Orphaned Work Experiences' as issue,
  COUNT(*) as count,
  'Review before deleting' as action
FROM work_experiences we
LEFT JOIN profiles p ON we.user_id = p.user_id
WHERE p.user_id IS NULL;

-- Report orphaned API keys
SELECT 
  'Orphaned API Keys' as issue,
  COUNT(*) as count,
  'Review before deleting' as action
FROM api_keys ak
LEFT JOIN profiles p ON ak.user_id = p.user_id
WHERE p.user_id IS NULL;

-- Report orphaned notifications
SELECT 
  'Orphaned Notifications' as issue,
  COUNT(*) as count,
  'Safe to delete' as action
FROM notifications n
LEFT JOIN profiles p ON n.user_id = p.user_id
WHERE p.user_id IS NULL;


-- ============================================================================
-- COMMIT OR ROLLBACK
-- ============================================================================
-- OPTION 1: If everything looks good, commit changes
-- COMMIT;

-- OPTION 2: If you want to review more, rollback (undo all changes)
ROLLBACK;

-- ============================================================================
-- POST-CLEANUP: Re-run Consistency Checks
-- ============================================================================
-- After committing, run check-data-consistency.sql again to verify improvements
-- Your score should improve from 80% to 90%+

-- ============================================================================
-- INSTRUCTIONS:
-- ============================================================================
-- 1. Review each FIX section above
-- 2. Run the script with ROLLBACK first (default) to see what would change
-- 3. If changes look good, change ROLLBACK to COMMIT and run again
-- 4. Re-run check-data-consistency.sql to verify improvements
-- 
-- SAFETY:
-- - Script uses BEGIN/ROLLBACK by default (no permanent changes)
-- - Orphaned records are REPORTED but NOT DELETED
-- - Test data is REPORTED but NOT DELETED
-- - You have full control over what gets committed
-- ============================================================================
