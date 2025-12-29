-- ============================================
-- RLS FIX: Re-enable with Proper Auth
-- Created: 2025-01-29 14:02
-- ============================================

-- IMPORTANT: This migration fixes RLS policies to work with proper authentication
-- Make sure you're logged in when testing these policies!

-- ============================================
-- STEP 1: Re-enable RLS on all tables
-- ============================================

ALTER TABLE featured_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Drop all existing policies
-- ============================================

-- Featured Items
DROP POLICY IF EXISTS "Anyone can view featured items" ON featured_items;
DROP POLICY IF EXISTS "Users can manage their own featured items" ON featured_items;
DROP POLICY IF EXISTS "Users can insert their own featured items" ON featured_items;
DROP POLICY IF EXISTS "Users can update their own featured items" ON featured_items;
DROP POLICY IF EXISTS "Users can delete their own featured items" ON featured_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON featured_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON featured_items;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON featured_items;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON featured_items;

-- Tech Stack
DROP POLICY IF EXISTS "Anyone can view tech stacks" ON tech_stack;
DROP POLICY IF EXISTS "Users can manage their own tech stack" ON tech_stack;

-- Case Studies
DROP POLICY IF EXISTS "Users can view published case studies" ON case_studies;
DROP POLICY IF EXISTS "Users can create their own case studies" ON case_studies;
DROP POLICY IF EXISTS "Users can update their own case studies" ON case_studies;
DROP POLICY IF EXISTS "Users can delete their own case studies" ON case_studies;

-- ============================================
-- STEP 3: Create new, working policies
-- ============================================

-- ┌─────────────────────────────────────┐
-- │ FEATURED ITEMS POLICIES             │
-- └─────────────────────────────────────┘

-- Public can view all featured items
CREATE POLICY "featured_items_select_policy"
  ON featured_items FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert their own
CREATE POLICY "featured_items_insert_policy"
  ON featured_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own
CREATE POLICY "featured_items_update_policy"
  ON featured_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own
CREATE POLICY "featured_items_delete_policy"
  ON featured_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ┌─────────────────────────────────────┐
-- │ TECH STACK POLICIES                 │
-- └─────────────────────────────────────┘

-- Public can view all tech stacks
CREATE POLICY "tech_stack_select_policy"
  ON tech_stack FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert their own
CREATE POLICY "tech_stack_insert_policy"
  ON tech_stack FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own
CREATE POLICY "tech_stack_update_policy"
  ON tech_stack FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own
CREATE POLICY "tech_stack_delete_policy"
  ON tech_stack FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ┌─────────────────────────────────────┐
-- │ CASE STUDIES POLICIES               │
-- └─────────────────────────────────────┘

-- Public can view published case studies OR users can view their own
CREATE POLICY "case_studies_select_policy"
  ON case_studies FOR SELECT
  TO public
  USING (is_published = true OR auth.uid() = user_id);

-- Authenticated users can insert their own
CREATE POLICY "case_studies_insert_policy"
  ON case_studies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own
CREATE POLICY "case_studies_update_policy"
  ON case_studies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own
CREATE POLICY "case_studies_delete_policy"
  ON case_studies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ┌─────────────────────────────────────┐
-- │ ENGINEERING PROJECTS POLICIES       │
-- └─────────────────────────────────────┘

-- Public can view published projects OR users can view their own
CREATE POLICY "engineering_projects_select_policy"
  ON engineering_projects FOR SELECT
  TO public
  USING (is_published = true OR auth.uid() = user_id);

-- Authenticated users can manage their own
CREATE POLICY "engineering_projects_insert_policy"
  ON engineering_projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "engineering_projects_update_policy"
  ON engineering_projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "engineering_projects_delete_policy"
  ON engineering_projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ┌─────────────────────────────────────┐
-- │ PRODUCT LAUNCHES POLICIES           │
-- └─────────────────────────────────────┘

-- Public can view published launches OR users can view their own
CREATE POLICY "product_launches_select_policy"
  ON product_launches FOR SELECT
  TO public
  USING (is_published = true OR auth.uid() = user_id);

-- Authenticated users can manage their own
CREATE POLICY "product_launches_insert_policy"
  ON product_launches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "product_launches_update_policy"
  ON product_launches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "product_launches_delete_policy"
  ON product_launches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ┌─────────────────────────────────────┐
-- │ ARTICLES POLICIES                   │
-- └─────────────────────────────────────┘

-- Public can view all articles
CREATE POLICY "articles_select_policy"
  ON articles FOR SELECT
  TO public
  USING (true);

-- Authenticated users can manage their own
CREATE POLICY "articles_insert_policy"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "articles_update_policy"
  ON articles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "articles_delete_policy"
  ON articles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 4: Verification Query
-- ============================================

-- Run this to verify policies are active:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd 
-- FROM pg_policies 
-- WHERE tablename IN ('featured_items', 'tech_stack', 'case_studies')
-- ORDER BY tablename, policyname;

-- ============================================
-- STEP 5: Test Query (run as logged-in user)
-- ============================================

-- This should return your UUID if auth is working:
-- SELECT auth.uid() as my_user_id, auth.role() as my_role;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE featured_items IS 'RLS enabled - users can only modify their own featured items';
COMMENT ON TABLE tech_stack IS 'RLS enabled - users can only modify their own tech stack';
COMMENT ON TABLE case_studies IS 'RLS enabled - users can only modify their own case studies, public can view published ones';
