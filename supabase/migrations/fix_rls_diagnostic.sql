-- DIAGNOSTIC: Check RLS Policies and Auth
-- Run these queries one by one in Supabase SQL Editor

-- 1. Check current auth user
SELECT auth.uid() as current_user_id;

-- 2. Check existing policies on featured_items
SELECT * FROM pg_policies WHERE tablename = 'featured_items';

-- 3. TEMPORARY FIX: Disable RLS for testing
-- WARNING: This removes security temporarily!
ALTER TABLE featured_items DISABLE ROW LEVEL SECURITY;

-- After testing, re-enable with:
-- ALTER TABLE featured_items ENABLE ROW LEVEL SECURITY;

-- 4. OR: Create a permissive policy for authenticated users
-- Drop all existing policies first
DROP POLICY IF EXISTS "Anyone can view featured items" ON featured_items;
DROP POLICY IF EXISTS "Users can manage their own featured items" ON featured_items;
DROP POLICY IF EXISTS "Users can insert their own featured items" ON featured_items;
DROP POLICY IF EXISTS "Users can update their own featured items" ON featured_items;
DROP POLICY IF EXISTS "Users can delete their own featured items" ON featured_items;

-- Create new permissive policies
CREATE POLICY "Enable read access for all users"
  ON featured_items FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON featured_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for users based on user_id"
  ON featured_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id"
  ON featured_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
