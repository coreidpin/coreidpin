-- Create RPC function to get admin users (bypasses RLS)
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  role TEXT,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.user_id,
    au.role,
    COALESCE(p.email, au_users.email) as email,
    p.full_name,
    au.created_at,
    au.updated_at
  FROM public.admin_users au
  LEFT JOIN public.profiles p ON p.user_id = au.user_id
  LEFT JOIN auth.users au_users ON au_users.id = au.user_id
  ORDER BY au.created_at DESC;
END;
$$;
