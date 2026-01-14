-- Phase 2 Verification Script
-- Run this in Supabase SQL Editor to verify migration success

-- =====================================================
-- 1. Check New Tables
-- =====================================================
SELECT 'Tables Created:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_connections', 'achievements', 'user_achievements')
ORDER BY table_name;

-- =====================================================
-- 2. Check New Columns in profiles
-- =====================================================
SELECT 'New Profile Columns:' as status;
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN (
    'professional_summary', 'headline', 'specialties', 
    'current_focus', 'open_to', 'followers_count', 
    'following_count', 'endorsements_count'
  )
ORDER BY column_name;

-- =====================================================
-- 3. Check Pinning Columns
-- =====================================================
SELECT 'Pinning Columns (work_experiences):' as status;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'work_experiences' 
  AND column_name IN ('is_pinned', 'pin_order');

-- =====================================================
-- 4. Check Activity Category Column
-- =====================================================
SELECT 'Activity Category Column:' as status;
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'profile_analytics_events' 
  AND column_name = 'event_category';

-- =====================================================
-- 5. Verify Achievements Were Seeded
-- =====================================================
SELECT 'Seeded Achievements:' as status;
SELECT name, rarity, icon 
FROM achievements 
ORDER BY 
  CASE rarity 
    WHEN 'legendary' THEN 1 
    WHEN 'epic' THEN 2 
    WHEN 'rare' THEN 3 
    WHEN 'common' THEN 4 
  END,
  name;

-- =====================================================
-- 6. Check RLS Policies
-- =====================================================
SELECT 'RLS Policies:' as status;
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('user_connections', 'achievements', 'user_achievements')
ORDER BY tablename, policyname;

-- =====================================================
-- 7. Check Triggers
-- =====================================================
SELECT 'Triggers:' as status;
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_follower_counts';

-- =====================================================
-- 8. Check Helper Functions
-- =====================================================
SELECT 'Helper Functions:' as status;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_pinned_items', 'update_follower_counts');

-- =====================================================
-- Success Summary
-- =====================================================
SELECT '✅ Phase 2 Migration Verified!' as status;
