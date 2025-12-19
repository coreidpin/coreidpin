-- ============================================================================
-- Day 21: Profile Validation Rules
-- Migration to add database-level validation triggers
-- ============================================================================

-- Create validation function
CREATE OR REPLACE FUNCTION validate_profile_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate email format (if provided)
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid email format: %', NEW.email;
    END IF;
  END IF;
  
  -- Validate phone number format (E.164 international format, if provided)
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    IF NEW.phone !~ '^\+?[1-9]\d{1,14}$' THEN
      RAISE EXCEPTION 'Invalid phone number format. Use international format: +234...';
    END IF;
  END IF;
  
  -- Validate LinkedIn URL (if provided)
  IF NEW.linkedin_url IS NOT NULL AND NEW.linkedin_url != '' THEN
    IF NEW.linkedin_url !~ '^https?://(www\.)?linkedin\.com/in/[a-zA-Z0-9-]+/?$' THEN
      RAISE EXCEPTION 'Invalid LinkedIn URL format. Expected: https://linkedin.com/in/username';
    END IF;
  END IF;
  
  -- Validate GitHub URL (if provided)
  IF NEW.github_url IS NOT NULL AND NEW.github_url != '' THEN
    IF NEW.github_url !~ '^https?://(www\.)?github\.com/[a-zA-Z0-9-]+/?$' THEN
      RAISE EXCEPTION 'Invalid GitHub URL format. Expected: https://github.com/username';
    END IF;
  END IF;
  
  -- Validate website URL (if provided)
  IF NEW.website IS NOT NULL AND NEW.website != '' THEN
    IF NEW.website !~ '^https?://[a-zA-Z0-9][-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$' THEN
      RAISE EXCEPTION 'Invalid website URL format. Use http:// or https://';
    END IF;
  END IF;
  
  -- Validate profile completion percentage (0-100)
  IF NEW.profile_completion_percentage IS NOT NULL THEN
    IF NEW.profile_completion_percentage < 0 OR NEW.profile_completion_percentage > 100 THEN
      RAISE EXCEPTION 'Profile completion percentage must be between 0 and 100';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS validate_profile_trigger ON profiles;

CREATE TRIGGER validate_profile_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_data();

-- ============================================================================
-- Validation for Business Profiles
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_business_profile_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate company email
  IF NEW.company_email IS NOT NULL AND NEW.company_email != '' THEN
    IF NEW.company_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid company email format';
    END IF;
  END IF;
  
  -- Validate company website
  IF NEW.company_website IS NOT NULL AND NEW.company_website != '' THEN
    IF NEW.company_website !~ '^https?://[a-zA-Z0-9][-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$' THEN
      RAISE EXCEPTION 'Invalid company website URL';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to business_profiles table
DROP TRIGGER IF EXISTS validate_business_profile_trigger ON business_profiles;

CREATE TRIGGER validate_business_profile_trigger
  BEFORE INSERT OR UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_business_profile_data();

-- ============================================================================
-- Test Validation (Run After Migration)
-- ============================================================================
/*
-- Test 1: Valid email should work
UPDATE profiles SET email = 'test@example.com' WHERE user_id = 'your-user-id';
-- Expected: SUCCESS

-- Test 2: Invalid email should fail
UPDATE profiles SET email = 'invalid-email' WHERE user_id = 'your-user-id';
-- Expected: ERROR - Invalid email format

-- Test 3: Valid phone should work
UPDATE profiles SET phone = '+2348012345678' WHERE user_id = 'your-user-id';
-- Expected: SUCCESS

-- Test 4: Invalid phone should fail
UPDATE profiles SET phone = '123' WHERE user_id = 'your-user-id';
-- Expected: ERROR - Invalid phone number format

-- Test 5: Valid LinkedIn should work
UPDATE profiles SET linkedin_url = 'https://linkedin.com/in/johndoe' WHERE user_id = 'your-user-id';
-- Expected: SUCCESS

-- Test 6: Invalid completion percentage should fail
UPDATE profiles SET profile_completion_percentage = 150 WHERE user_id = 'your-user-id';
-- Expected: ERROR - Profile completion percentage must be between 0 and 100
*/

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. These triggers validate data on INSERT and UPDATE
-- 2. Validation only applies to non-NULL, non-empty values
-- 3. If validation fails, the operation is rejected with an error message
-- 4. Existing invalid data is NOT affected (clean it first with cleanup script)
-- 5. Frontend should match these validation rules for better UX
-- ============================================================================
