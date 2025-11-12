-- ============================================
-- URGENT FIX: Email Verification RLS Policy
-- ============================================
-- Run this in Supabase Dashboard → SQL Editor
-- This allows Edge Functions to insert verification codes

-- Enable RLS
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Remove all existing policies
DROP POLICY IF EXISTS email_verifications_service_all ON public.email_verifications;
DROP POLICY IF EXISTS email_verifications_insert_service ON public.email_verifications;
DROP POLICY IF EXISTS email_verifications_update_service ON public.email_verifications;
DROP POLICY IF EXISTS email_verifications_select_own ON public.email_verifications;

-- Create single policy allowing service role full access
CREATE POLICY email_verifications_service_all 
  ON public.email_verifications 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Verify it worked
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'email_verifications';
