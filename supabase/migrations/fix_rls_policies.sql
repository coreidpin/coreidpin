-- Fix RLS Policies for Featured Items
-- Run this in Supabase SQL Editor

-- Drop the old policy
DROP POLICY IF EXISTS "Users can manage their own featured items" ON featured_items;

-- Create separate policies for each operation
CREATE POLICY "Users can insert their own featured items"
  ON featured_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own featured items"
  ON featured_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own featured items"
  ON featured_items FOR DELETE
  USING (auth.uid() = user_id);

-- SELECT policy already exists from line 381-383
