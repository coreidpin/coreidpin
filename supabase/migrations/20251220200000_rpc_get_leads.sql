-- Secure RPC function to fetch leads
-- This bypasses table-level RLS issues by running as a defined security context,
-- but enforces the same security logic (auth.uid() = professional_id) internally.

CREATE OR REPLACE FUNCTION get_my_leads()
RETURNS SETOF job_leads
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM job_leads 
  WHERE professional_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT 20;
$$;

-- Grant access
GRANT EXECUTE ON FUNCTION get_my_leads TO authenticated;
