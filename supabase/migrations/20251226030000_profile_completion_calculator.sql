-- ==========================================
-- Profile Completion Auto-Calculator
-- Automatically calculates profile completion percentage
-- ==========================================

-- Function to calculate profile completion
CREATE OR REPLACE FUNCTION calculate_profile_completion(p_user_id uuid)
RETURNS INTEGER AS $$
DECLARE
  v_completion INTEGER := 0;
  v_profile RECORD;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Email (required, always 20%)
  IF v_profile.email IS NOT NULL THEN
    v_completion := v_completion + 20;
  END IF;
  
  -- Full Name (20%)
  IF v_profile.full_name IS NOT NULL AND v_profile.full_name != '' THEN
    v_completion := v_completion + 20;
  END IF;
  
  -- Phone (15%)
  IF v_profile.phone IS NOT NULL AND v_profile.phone != '' THEN
    v_completion := v_completion + 15;
  ELSIF v_profile.phone_number IS NOT NULL AND v_profile.phone_number != '' THEN
    v_completion := v_completion + 15;
  END IF;
  
  -- Location (15%)
  IF v_profile.country IS NOT NULL AND v_profile.country != '' THEN
    v_completion := v_completion + 10;
  END IF;
  IF v_profile.city IS NOT NULL AND v_profile.city != '' THEN
    v_completion := v_completion + 5;
  END IF;
  
  -- Date of Birth (10%)
  IF v_profile.date_of_birth IS NOT NULL THEN
    v_completion := v_completion + 10;
  END IF;
  
  -- Email Verified (20%)
  IF v_profile.email_verified = true THEN
    v_completion := v_completion + 20;
  END IF;
  
  RETURN v_completion;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update profile completion for a user
CREATE OR REPLACE FUNCTION update_profile_completion(p_user_id uuid)
RETURNS VOID AS $$
DECLARE
  v_completion INTEGER;
BEGIN
  v_completion := calculate_profile_completion(p_user_id);
  
  UPDATE profiles
  SET profile_complete = v_completion,
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update ALL users' profile completion
CREATE OR REPLACE FUNCTION update_all_profile_completions()
RETURNS TABLE (
  updated_count integer,
  message text
) AS $$
DECLARE
  v_count INTEGER := 0;
  v_user RECORD;
BEGIN
  FOR v_user IN SELECT user_id FROM profiles
  LOOP
    PERFORM update_profile_completion(v_user.user_id);
    v_count := v_count + 1;
  END LOOP;
  
  RETURN QUERY SELECT 
    v_count,
    format('Updated profile completion for %s users', v_count)::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update profile completion on profile changes
CREATE OR REPLACE FUNCTION trigger_update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_complete := calculate_profile_completion(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_update_profile_completion ON profiles;

-- Create trigger
CREATE TRIGGER auto_update_profile_completion
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_profile_completion();

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_profile_completion TO authenticated;
GRANT EXECUTE ON FUNCTION update_profile_completion TO authenticated;
GRANT EXECUTE ON FUNCTION update_all_profile_completions TO authenticated;

-- Calculate completion for all existing users
SELECT * FROM update_all_profile_completions();

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Profile Completion Auto-Calculator deployed!';
  RAISE NOTICE 'Profile completion now calculates automatically on every profile update';
  RAISE NOTICE 'All existing users have been calculated';
END $$;
