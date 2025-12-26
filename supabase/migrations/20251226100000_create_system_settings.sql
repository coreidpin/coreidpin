-- ==========================================
-- Phase 3.2: System Settings Database
-- Centralized platform configuration
-- ==========================================

-- Drop old tables and functions if they exist
DROP TABLE IF EXISTS system_settings_history CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP FUNCTION IF EXISTS get_system_settings();
DROP FUNCTION IF EXISTS update_system_settings(text, text, boolean, integer, boolean, boolean, boolean, integer);
DROP FUNCTION IF EXISTS update_system_setting(text, text, jsonb, uuid);
DROP FUNCTION IF EXISTS get_settings_history(text, integer);

-- Create settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  data_type TEXT NOT NULL DEFAULT 'string', -- string, number, boolean, json
  is_sensitive BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by uuid REFERENCES auth.users(id),
  UNIQUE(category, key)
);

-- Create settings history for audit trail
CREATE TABLE IF NOT EXISTS system_settings_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_id uuid REFERENCES system_settings(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_by uuid REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_history_setting ON system_settings_history(setting_id);
CREATE INDEX IF NOT EXISTS idx_settings_history_changed_at ON system_settings_history(changed_at DESC);

-- Function to get all settings
CREATE OR REPLACE FUNCTION get_system_settings(p_category TEXT DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  category text,
  key text,
  value jsonb,
  description text,
  data_type text,
  is_sensitive boolean,
  updated_at timestamptz,
  updated_by uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.category,
    s.key,
    CASE 
      WHEN s.is_sensitive THEN '{"hidden": true}'::jsonb
      ELSE s.value
    END as value,
    s.description,
    s.data_type,
    s.is_sensitive,
    s.updated_at,
    s.updated_by
  FROM system_settings s
  WHERE p_category IS NULL OR s.category = p_category
  ORDER BY s.category, s.key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update settings
CREATE OR REPLACE FUNCTION update_system_setting(
  p_category TEXT,
  p_key TEXT,
  p_value JSONB,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  success boolean,
  message text
) AS $$
DECLARE
  v_setting_id uuid;
  v_old_value jsonb;
BEGIN
  -- Get existing setting
  SELECT id, value INTO v_setting_id, v_old_value
  FROM system_settings
  WHERE category = p_category AND key = p_key;

  IF v_setting_id IS NULL THEN
    RETURN QUERY SELECT false, 'Setting not found'::text;
    RETURN;
  END IF;

  -- Update setting
  UPDATE system_settings
  SET value = p_value,
      updated_at = NOW(),
      updated_by = p_user_id
  WHERE id = v_setting_id;

  -- Record in history
  INSERT INTO system_settings_history (
    setting_id, category, key, old_value, new_value, changed_by
  ) VALUES (
    v_setting_id, p_category, p_key, v_old_value, p_value, p_user_id
  );

  RETURN QUERY SELECT true, 'Setting updated successfully'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get settings history
CREATE OR REPLACE FUNCTION get_settings_history(
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  category text,
  key text,
  old_value jsonb,
  new_value jsonb,
  changed_by uuid,
  changed_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.category,
    h.key,
    h.old_value,
    h.new_value,
    h.changed_by,
    h.changed_at
  FROM system_settings_history h
  WHERE p_category IS NULL OR h.category = p_category
  ORDER BY h.changed_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update timestamp
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS settings_updated_at ON system_settings;
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_timestamp();

-- Insert default settings
INSERT INTO system_settings (category, key, value, description, data_type, is_sensitive) VALUES
-- General Settings
('general', 'site_name', '"GidiPIN"', 'Application name', 'string', false),
('general', 'site_tagline', '"Professional Identity Network"', 'Site tagline', 'string', false),
('general', 'support_email', '"support@gidipin.work"', 'Support email address', 'string', false),
('general', 'support_phone', '"+234-XXX-XXX-XXXX"', 'Support phone number', 'string', false),
('general', 'company_address', '"Lagos, Nigeria"', 'Company address', 'string', false),

-- Feature Flags
('features', 'enable_registration', 'true', 'Allow new user registration', 'boolean', false),
('features', 'enable_email_verification', 'true', 'Require email verification', 'boolean', false),
('features', 'enable_pin_generation', 'true', 'Allow PIN generation', 'boolean', false),
('features', 'enable_analytics', 'true', 'Enable analytics features', 'boolean', false),
('features', 'enable_geographic', 'true', 'Enable geographic features', 'boolean', false),
('features', 'maintenance_mode', 'false', 'Enable maintenance mode', 'boolean', false),

-- Email Settings
('email', 'smtp_host', '"smtp.example.com"', 'SMTP server host', 'string', false),
('email', 'smtp_port', '587', 'SMTP server port', 'number', false),
('email', 'smtp_username', '""', 'SMTP username', 'string', false),
('email', 'smtp_password', '""', 'SMTP password (encrypted)', 'string', true),
('email', 'from_email', '"noreply@gidipin.work"', 'Email sender address', 'string', false),
('email', 'from_name', '"GidiPIN"', 'Email sender name', 'string', false),

-- Security Settings
('security', 'session_timeout', '3600', 'Session timeout in seconds', 'number', false),
('security', 'password_min_length', '8', 'Minimum password length', 'number', false),
('security', 'require_uppercase', 'true', 'Require uppercase in password', 'boolean', false),
('security', 'require_lowercase', 'true', 'Require lowercase in password', 'boolean', false),
('security', 'require_numbers', 'true', 'Require numbers in password', 'boolean', false),
('security', 'require_symbols', 'false', 'Require symbols in password', 'boolean', false),
('security', 'enable_2fa', 'false', 'Enable two-factor authentication', 'boolean', false),
('security', 'max_login_attempts', '5', 'Maximum login attempts before lockout', 'number', false),

-- API Settings
('api', 'rate_limit_per_minute', '60', 'API rate limit per minute', 'number', false),
('api', 'enable_api_keys', 'true', 'Enable API key authentication', 'boolean', false),
('api', 'webhook_timeout', '30', 'Webhook timeout in seconds', 'number', false),

-- System Parameters
('system', 'max_upload_size_mb', '10', 'Maximum file upload size in MB', 'number', false),
('system', 'default_user_role', '"individual"', 'Default role for new users', 'string', false),
('system', 'timezone', '"Africa/Lagos"', 'System timezone', 'string', false),
('system', 'date_format', '"DD/MM/YYYY"', 'Date display format', 'string', false)
ON CONFLICT (category, key) DO NOTHING;

-- Grant permissions
GRANT SELECT ON system_settings TO authenticated;
GRANT SELECT ON system_settings_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_settings TO authenticated;
GRANT EXECUTE ON FUNCTION update_system_setting TO authenticated;
GRANT EXECUTE ON FUNCTION get_settings_history TO authenticated;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ System Settings database created successfully!';
  RAISE NOTICE 'Created tables: system_settings, system_settings_history';
  RAISE NOTICE 'Created functions: get_system_settings, update_system_setting, get_settings_history';
  RAISE NOTICE 'Inserted default settings across 5 categories';
END $$;
