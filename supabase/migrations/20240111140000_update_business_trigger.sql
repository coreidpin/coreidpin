-- Add UPDATE trigger to catch when user metadata is updated (e.g. after initial creation)
-- This ensures that if the userType is set AFTER user creation (which happens in the auth-otp flow),
-- the business profile is still created.

DROP TRIGGER IF EXISTS on_auth_user_updated_business ON auth.users;

CREATE TRIGGER on_auth_user_updated_business
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (
    -- Only trigger if userType changed to 'business' OR is 'business' and profile might be missing
    (new.raw_user_meta_data->>'userType' = 'business')
  )
  EXECUTE PROCEDURE public.handle_new_business_user();
