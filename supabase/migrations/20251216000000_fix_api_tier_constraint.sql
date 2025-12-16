-- Fix api_tier check constraint
-- Drop the constraint if it's too restrictive and recreate it with proper values

-- Drop the existing constraint (if it exists)
ALTER TABLE business_profiles 
  DROP CONSTRAINT IF EXISTS business_profiles_api_tier_check;

-- Recreate the constraint with the correct values
ALTER TABLE business_profiles
  ADD CONSTRAINT business_profiles_api_tier_check 
  CHECK (api_tier IN ('free', 'pro', 'enterprise'));

-- Update any existing rows that might have invalid values
UPDATE business_profiles
SET api_tier = 'free'
WHERE api_tier IS NULL OR api_tier NOT IN ('free', 'pro', 'enterprise');
