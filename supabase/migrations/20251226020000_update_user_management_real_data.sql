-- ==========================================
-- UPDATED: User Management Functions
-- Now using the new profile columns!
-- ==========================================

-- DROP old functions
DROP FUNCTION IF EXISTS get_users_with_filters(text, text, text, text, text, integer, integer, text, text);
DROP FUNCTION IF EXISTS get_user_statistics();
DROP FUNCTION IF EXISTS bulk_update_user_status(uuid[], boolean);
DROP FUNCTION IF EXISTS bulk_update_verification_status(uuid[], text);
DROP FUNCTION IF EXISTS bulk_delete_users(uuid[]);
DROP FUNCTION IF EXISTS get_user_details(uuid);
DROP FUNCTION IF EXISTS get_user_filter_options();

-- Function 1: Get Users with ALL Real Data
CREATE OR REPLACE FUNCTION get_users_with_filters(
  p_search TEXT DEFAULT NULL,
  p_user_type TEXT DEFAULT NULL,
  p_verification_status TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_order TEXT DEFAULT 'DESC'
)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  user_type text,
  verification_status text,
  profile_completion integer,
  country text,
  state text,
  city text,
  is_active boolean,
  last_login timestamptz,
  created_at timestamptz,
  total_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id as id,
    p.email,
    COALESCE(p.full_name, p.name, ''::text) as full_name,
    COALESCE(p.user_type, 'individual'::text) as user_type,
    CASE 
      WHEN COALESCE(p.email_verified, false) = true THEN 'verified'::text
      ELSE 'pending'::text
    END as verification_status,
    COALESCE(p.profile_complete, 0) as profile_completion,
    COALESCE(p.country, ''::text) as country,
    COALESCE(p.state, ''::text) as state,
    COALESCE(p.city, ''::text) as city,
    NOT COALESCE(p.is_suspended, false) as is_active,
    p.last_login,
    p.created_at,
    COUNT(*) OVER() as total_count
  FROM profiles p
  WHERE 1=1
    AND (p_search IS NULL OR p.email ILIKE ('%' || p_search || '%') OR COALESCE(p.full_name, p.name) ILIKE ('%' || p_search || '%'))
    AND (p_user_type IS NULL OR p.user_type = p_user_type)
    AND (p_verification_status IS NULL OR 
      (CASE
        WHEN p_verification_status = 'verified' THEN COALESCE(p.email_verified, false) = true
        WHEN p_verification_status = 'pending' THEN COALESCE(p.email_verified, false) = false
        ELSE true
      END))
    AND (p_country IS NULL OR p.country = p_country)
    AND (p_status IS NULL OR 
      (CASE
        WHEN p_status = 'active' THEN COALESCE(p.is_suspended, false) = false
        WHEN p_status = 'inactive' THEN p.is_suspended = true
        ELSE true
      END))
  ORDER BY 
    CASE WHEN p_sort_by = 'email' AND p_sort_order = 'ASC' THEN p.email END ASC,
    CASE WHEN p_sort_by = 'email' AND p_sort_order = 'DESC' THEN p.email END DESC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'ASC' THEN p.created_at END ASC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'DESC' THEN p.created_at END DESC,
    p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Get User Statistics (REAL DATA)
CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS TABLE (
  total_users bigint,
  active_users bigint,
  inactive_users bigint,
  verified_users bigint,
  pending_verification bigint,
  individual_users bigint,
  business_users bigint,
  new_users_today bigint,
  new_users_this_week bigint,
  new_users_this_month bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_users,
    COUNT(*) FILTER (WHERE COALESCE(is_suspended, false) = false)::bigint as active_users,
    COUNT(*) FILTER (WHERE is_suspended = true)::bigint as inactive_users,
    COUNT(*) FILTER (WHERE COALESCE(email_verified, false) = true)::bigint as verified_users,
    COUNT(*) FILTER (WHERE COALESCE(email_verified, false) = false)::bigint as pending_verification,
    COUNT(*) FILTER (WHERE user_type = 'individual')::bigint as individual_users,
    COUNT(*) FILTER (WHERE user_type = 'business')::bigint as business_users,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::bigint as new_users_today,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::bigint as new_users_this_week,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')::bigint as new_users_this_month
  FROM profiles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Bulk Update Status (NOW WORKS!)
CREATE OR REPLACE FUNCTION bulk_update_user_status(
  p_user_ids uuid[],
  p_is_active boolean
)
RETURNS TABLE (
  success boolean,
  updated_count integer,
  message text
) AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE profiles
  SET 
    is_suspended = NOT p_is_active,
    updated_at = NOW()
  WHERE user_id = ANY(p_user_ids);
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN QUERY SELECT 
    true,
    v_count,
    format('Successfully updated %s users', v_count)::text;
    
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT 
    false,
    0,
    SQLERRM::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: Bulk Update Verification
CREATE OR REPLACE FUNCTION bulk_update_verification_status(
  p_user_ids uuid[],
  p_verification_status text
)
RETURNS TABLE (
  success boolean,
  updated_count integer,
  message text
) AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE profiles
  SET 
    email_verified = (p_verification_status = 'verified'),
    updated_at = NOW()
  WHERE user_id = ANY(p_user_ids);
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN QUERY SELECT 
    true,
    v_count,
    format('Successfully updated %s users', v_count)::text;
    
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT 
    false,
    0,
    SQLERRM::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 5: Bulk Delete
CREATE OR REPLACE FUNCTION bulk_delete_users(
  p_user_ids uuid[]
)
RETURNS TABLE (
  success boolean,
  deleted_count integer,
  message text
) AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM profiles WHERE user_id = ANY(p_user_ids);
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN QUERY SELECT 
    true,
    v_count,
    format('Successfully deleted %s users', v_count)::text;
    
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT 
    false,
    0,
    SQLERRM::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 6: Get User Details (REAL DATA)
CREATE OR REPLACE FUNCTION get_user_details(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  user_type text,
  verification_status text,
  profile_completion integer,
  country text,
  state text,
  city text,
  phone text,
  date_of_birth date,
  is_active boolean,
  last_login timestamptz,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.email,
    COALESCE(p.full_name, p.name, ''::text),
    COALESCE(p.user_type, 'individual'::text),
    CASE WHEN COALESCE(p.email_verified, false) THEN 'verified'::text ELSE 'pending'::text END,
    COALESCE(p.profile_complete, 0),
    COALESCE(p.country, ''::text),
    COALESCE(p.state, ''::text),
    COALESCE(p.city, ''::text),
    COALESCE(p.phone, p.phone_number, ''::text),
    p.date_of_birth,
    NOT COALESCE(p.is_suspended, false),
    p.last_login,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 7: Get Filter Options (REAL DATA)
CREATE OR REPLACE FUNCTION get_user_filter_options()
RETURNS TABLE (
  countries text[],
  user_types text[],
  verification_statuses text[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ARRAY_AGG(DISTINCT country ORDER BY country) FILTER (WHERE country IS NOT NULL AND country != ''),
    ARRAY_AGG(DISTINCT user_type ORDER BY user_type) FILTER (WHERE user_type IS NOT NULL),
    ARRAY['verified', 'pending']::text[]
  FROM profiles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_users_with_filters TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_update_user_status TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_update_verification_status TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_delete_users TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_details TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_filter_options TO authenticated;

-- Success
DO $$ 
BEGIN 
  RAISE NOTICE '✅ User Management Functions UPDATED with real data support!';
  RAISE NOTICE 'Now using: profile_complete, country, state, city, is_suspended, last_login';
  RAISE NOTICE 'All features now work with real data!';
END $$;
