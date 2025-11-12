-- Add RLS policies for email_verifications table
-- This allows the Edge Function (using service role) to insert and update verification codes

-- Enable RLS on email_verifications (if not already enabled)
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS email_verifications_service_all ON public.email_verifications;
DROP POLICY IF EXISTS email_verifications_insert_service ON public.email_verifications;
DROP POLICY IF EXISTS email_verifications_update_service ON public.email_verifications;
DROP POLICY IF EXISTS email_verifications_select_own ON public.email_verifications;

-- Allow service role to perform all operations (INSERT, SELECT, UPDATE, DELETE)
-- This is the ONLY policy needed for Edge Functions to work
CREATE POLICY email_verifications_service_all 
  ON public.email_verifications 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.email_verifications IS 'Email verification codes/tokens. Service role has full access for Edge Functions.';
