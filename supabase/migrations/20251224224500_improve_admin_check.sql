-- Improve check_admin_status to handle duplicate auth users
-- This function now checks by BOTH user_id AND email to handle cases
-- where multiple auth.users exist for the same email

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
DECLARE
  admin_record RECORD;
  user_email TEXT;
BEGIN
  -- First, get the email from auth.users for this user_id
  SELECT u.email INTO user_email
  FROM auth.users u
  WHERE u.id = check_user_id;

  -- Try to find admin record by user_id first
  SELECT 
    au.user_id,
    au.role,
    au.email,
    au.is_active
  INTO admin_record
  FROM admin_users au
  WHERE au.user_id = check_user_id
    AND au.is_active = true
  LIMIT 1;
  
  -- If not found by user_id, try by email (handles duplicate auth users)
  IF NOT FOUND AND user_email IS NOT NULL THEN
    SELECT 
      au.user_id,
      au.role,
      au.email,
      au.is_active
    INTO admin_record
    FROM admin_users au
    WHERE au.email = user_email
      AND au.is_active = true
    LIMIT 1;
      
    -- If found by email but different user_id, UPDATE admin_users to point to new user
    IF FOUND AND admin_record.user_id != check_user_id THEN
      UPDATE admin_users
      SET user_id = check_user_id,
          updated_at = NOW()
      WHERE email = user_email;
      
      -- Refresh admin_record with updated data
      admin_record.user_id := check_user_id;
    END IF;
  END IF;
  
  -- Return result
  IF FOUND THEN
    RETURN QUERY SELECT 
      true as is_admin,
      admin_record.role,
      admin_record.email;
  ELSE
    RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT;
  END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.check_admin_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_admin_status(UUID) TO anon;
