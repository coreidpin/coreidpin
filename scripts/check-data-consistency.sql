-- ============================================================================
-- Day 21 Phase 1: Data Consistency Checks
-- Run this in Supabase SQL Editor to assess current data quality
-- ============================================================================

-- CHECK 1: Orphaned Work Experiences
-- ============================================================================
SELECT 
  '🔍 Orphaned Work Experiences' as check_name,
  COUNT(*) as issue_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS'
    ELSE '⚠️ NEEDS CLEANUP'
  END as status
FROM work_experiences we
LEFT JOIN profiles p ON we.user_id = p.user_id
WHERE p.user_id IS NULL;


-- CHECK 2: Invalid Profile Completion Percentages
-- ============================================================================
SELECT 
  '🔍 Invalid Profile Completion %' as check_name,
  COUNT(*) as issue_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS'
    ELSE '⚠️ NEEDS FIX'
  END as status
FROM profiles
WHERE profile_completion_percentage < 0 
   OR profile_completion_percentage > 100;


-- CHECK 3: Duplicate Emails
-- ============================================================================
SELECT 
  '🔍 Duplicate Emails' as check_name,
  COUNT(*) as duplicate_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS'
    ELSE '❌ CRITICAL'
  END as status
FROM (
  SELECT email, COUNT(*) as count
  FROM profiles
  WHERE email IS NOT NULL
  GROUP BY email
  HAVING COUNT(*) > 1
) duplicates;


-- CHECK 4: Orphaned API Keys
-- ============================================================================
SELECT 
  '🔍 Orphaned API Keys' as check_name,
  COUNT(*) as issue_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS'
    ELSE '⚠️ NEEDS CLEANUP'
  END as status
FROM api_keys ak
LEFT JOIN profiles p ON ak.user_id = p.user_id
WHERE p.user_id IS NULL;


-- CHECK 5: Orphaned Notifications
-- ============================================================================
SELECT 
  '🔍 Orphaned Notifications' as check_name,
  COUNT(*) as issue_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS'
    ELSE '⚠️ NEEDS CLEANUP'
  END as status
FROM notifications n
LEFT JOIN profiles p ON n.user_id = p.user_id
WHERE p.user_id IS NULL;


-- CHECK 6: Business Profiles Without User Profiles
-- ============================================================================
SELECT 
  '🔍 Business Profiles Without Users' as check_name,
  COUNT(*) as issue_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS'
    ELSE '❌ CRITICAL'
  END as status
FROM business_profiles bp
LEFT JOIN profiles p ON bp.user_id = p.user_id
WHERE p.user_id IS NULL;


-- CHECK 7: Profiles with NULL required fields
-- ============================================================================
SELECT 
  '🔍 Profiles Missing Email' as check_name,
  COUNT(*) as issue_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS'
    ELSE '⚠️ REVIEW'
  END as status
FROM profiles
WHERE email IS NULL OR email = '';


-- CHECK 8: Invalid Email Formats (Basic Check)
-- ============================================================================
SELECT 
  '🔍 Invalid Email Formats' as check_name,
  COUNT(*) as issue_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS'
    ELSE '⚠️ NEEDS VALIDATION'
  END as status
FROM profiles
WHERE email IS NOT NULL 
  AND email != ''
  AND email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';


-- CHECK 9: Profiles with Missing User Type
-- ============================================================================
SELECT 
  '🔍 Profiles Missing User Type' as check_name,
  COUNT(*) as issue_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS'
    ELSE '⚠️ REVIEW'
  END as status  
FROM profiles
WHERE user_type IS NULL;


-- CHECK 10: Work Experiences with Future End Dates
-- ============================================================================
SELECT 
  '🔍 Work Exp with Future End Dates' as check_name,
  COUNT(*) as issue_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS'
    ELSE '⚠️ REVIEW'
  END as status
FROM work_experiences
WHERE end_date > CURRENT_DATE
  AND is_current = false;


-- ============================================================================
-- SUMMARY: Data Quality Score
-- ============================================================================
WITH all_checks AS (
  -- Orphaned work experiences
  SELECT 
    CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END as passed
  FROM work_experiences we
  LEFT JOIN profiles p ON we.user_id = p.user_id
  WHERE p.user_id IS NULL
  
  UNION ALL
  
  -- Invalid completion percentages
  SELECT 
    CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END as passed
  FROM profiles
  WHERE profile_completion_percentage < 0 OR profile_completion_percentage > 100
  
  UNION ALL
  
  -- Duplicate emails
  SELECT 
    CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END as passed
  FROM (
    SELECT email FROM profiles WHERE email IS NOT NULL
    GROUP BY email HAVING COUNT(*) > 1
  ) dup
  
  UNION ALL
  
  -- Orphaned API keys
  SELECT 
    CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END as passed
  FROM api_keys ak
  LEFT JOIN profiles p ON ak.user_id = p.user_id
  WHERE p.user_id IS NULL
  
  UNION ALL
  
  -- Orphaned notifications
  SELECT 
    CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END as passed
  FROM notifications n
  LEFT JOIN profiles p ON n.user_id = p.user_id
  WHERE p.user_id IS NULL
  
  UNION ALL
  
  -- Business profiles without users
  SELECT 
    CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END as passed
  FROM business_profiles bp
  LEFT JOIN profiles p ON bp.user_id = p.user_id
  WHERE p.user_id IS NULL
  
  UNION ALL
  
  -- Missing emails
  SELECT 
    CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END as passed
  FROM profiles
  WHERE email IS NULL OR email = ''
  
  UNION ALL
  
  -- Invalid email formats
  SELECT 
    CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END as passed
  FROM profiles
  WHERE email IS NOT NULL AND email != ''
    AND email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  
  UNION ALL
  
  -- Missing user type
  SELECT 
    CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END as passed
  FROM profiles
  WHERE user_type IS NULL
  
  UNION ALL
  
  -- Future end dates
  SELECT 
    CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END as passed
  FROM work_experiences
  WHERE end_date > CURRENT_DATE AND is_current = false
)
SELECT 
  '📊 OVERALL DATA QUALITY SCORE' as metric,
  SUM(passed) || ' / 10 checks passed' as result,
  ROUND((SUM(passed)::DECIMAL / 10 * 100), 1) || '%' as score,
  CASE 
    WHEN SUM(passed) = 10 THEN '🎉 EXCELLENT - No issues found!'
    WHEN SUM(passed) >= 8 THEN '✅ GOOD - Minor issues to fix'
    WHEN SUM(passed) >= 6 THEN '⚠️ FAIR - Some cleanup needed'
    ELSE '❌ POOR - Significant cleanup required'
  END as assessment
FROM all_checks;


-- ============================================================================
-- INSTRUCTIONS:
-- ============================================================================
-- 1. Copy this entire script
-- 2. Paste into Supabase SQL Editor
-- 3. Click RUN
-- 4. Review each check result
-- 5. Note down any issues found (issue_count > 0)
-- 6. Check the overall quality score at the bottom
-- 
-- EXPECTED RESULTS:
-- - Most checks should show "✅ PASS" (0 issues)
-- - Some checks might show warnings (review needed)
-- - Overall score should be 80%+ for good data quality
-- ============================================================================
