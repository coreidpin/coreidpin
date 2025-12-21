-- Function to bypass RLS for debugging purposes
CREATE OR REPLACE FUNCTION get_debug_leads()
RETURNS SETOF job_leads
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM job_leads ORDER BY created_at DESC LIMIT 10;
$$;
