-- Create a public RPC function to check admin status
-- This bypasses RLS using SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.check_admin_status(check_user_id UUID)
RETURNS TABLE(
  is_admin BOOLEAN,
  role TEXT,
  email TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN au.user_id IS NOT NULL AND au.is_active = true THEN true ELSE false END as is_admin,
    au.role,
    au.email
  FROM admin_users au
  WHERE au.user_id = check_user_id
  LIMIT 1;
  
  -- If no record found, return false
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_admin_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_admin_status(UUID) TO anon;
