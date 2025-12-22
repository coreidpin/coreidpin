-- Create RPC function to update system settings (bypasses RLS)
CREATE OR REPLACE FUNCTION update_system_settings(
  p_site_name TEXT DEFAULT NULL,
  p_support_email TEXT DEFAULT NULL,
  p_maintenance_mode BOOLEAN DEFAULT NULL,
  p_password_min_length INTEGER DEFAULT NULL,
  p_require_special_char BOOLEAN DEFAULT NULL,
  p_require_numbers BOOLEAN DEFAULT NULL,
  p_enforce_2fa BOOLEAN DEFAULT NULL,
  p_session_timeout INTEGER DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings_id UUID;
  v_result jsonb;
BEGIN
  -- Get existing settings ID or create new
  SELECT id INTO v_settings_id FROM public.system_settings LIMIT 1;
  
  IF v_settings_id IS NULL THEN
    -- Insert new settings
    INSERT INTO public.system_settings (
      site_name,
      support_email,
      maintenance_mode,
      password_min_length,
      require_special_char,
      require_numbers,
      enforce_2fa,
      session_timeout,
      updated_at
    ) VALUES (
      COALESCE(p_site_name, 'CoreID Admin'),
      COALESCE(p_support_email, 'support@coreid.com'),
      COALESCE(p_maintenance_mode, false),
      COALESCE(p_password_min_length, 8),
      COALESCE(p_require_special_char, true),
      COALESCE(p_require_numbers, true),
      COALESCE(p_enforce_2fa, false),
      COALESCE(p_session_timeout, 30),
      NOW()
    )
    RETURNING id INTO v_settings_id;
  ELSE
    -- Update existing settings (only update non-null parameters)
    UPDATE public.system_settings
    SET
      site_name = COALESCE(p_site_name, site_name),
      support_email = COALESCE(p_support_email, support_email),
      maintenance_mode = COALESCE(p_maintenance_mode, maintenance_mode),
      password_min_length = COALESCE(p_password_min_length, password_min_length),
      require_special_char = COALESCE(p_require_special_char, require_special_char),
      require_numbers = COALESCE(p_require_numbers, require_numbers),
      enforce_2fa = COALESCE(p_enforce_2fa, enforce_2fa),
      session_timeout = COALESCE(p_session_timeout, session_timeout),
      updated_at = NOW()
    WHERE id = v_settings_id;
  END IF;
  
  -- Return the updated settings
  SELECT jsonb_build_object(
    'success', true,
    'id', id,
    'site_name', site_name,
    'support_email', support_email,
    'maintenance_mode', maintenance_mode,
    'password_min_length', password_min_length,
    'require_special_char', require_special_char,
    'require_numbers', require_numbers,
    'enforce_2fa', enforce_2fa,
    'session_timeout', session_timeout
  ) INTO v_result
  FROM public.system_settings
  WHERE id = v_settings_id;
  
  RETURN v_result;
END;
$$;
