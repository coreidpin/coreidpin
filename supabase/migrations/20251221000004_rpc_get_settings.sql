-- Drop existing function if it exists (to allow signature change)
DROP FUNCTION IF EXISTS get_system_settings();

-- Create RPC function to get system settings (bypasses RLS)
CREATE OR REPLACE FUNCTION get_system_settings()
RETURNS TABLE (
  id UUID,
  site_name TEXT,
  support_email TEXT,
  maintenance_mode BOOLEAN,
  password_min_length INTEGER,
  require_special_char BOOLEAN,
  require_numbers BOOLEAN,
  enforce_2fa BOOLEAN,
  session_timeout INTEGER,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.site_name,
    s.support_email,
    s.maintenance_mode,
    s.password_min_length,
    s.require_special_char,
    s.require_numbers,
    s.enforce_2fa,
    s.session_timeout,
    s.updated_at
  FROM public.system_settings s
  LIMIT 1;
END;
$$;
