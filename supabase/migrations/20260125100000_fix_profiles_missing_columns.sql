-- Add missing professional columns to profiles table
-- This fixes the "Could not find the job_title column" error and standardizes the schema

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS years_of_experience TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS recovery_email TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS booking_url TEXT,
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'actively_working',
ADD COLUMN IF NOT EXISTS work_preference TEXT DEFAULT 'remote';

-- Add comments for clarity
COMMENT ON COLUMN public.profiles.job_title IS 'The professional title/role of the user';
COMMENT ON COLUMN public.profiles.bio IS 'Professional summary or biography';
COMMENT ON COLUMN public.profiles.industry IS 'The primary industry the user works in';
COMMENT ON COLUMN public.profiles.linkedin_url IS 'Public LinkedIn profile URL';

-- Success notification
DO $$
BEGIN
  RAISE NOTICE 'Profiles table updated with missing professional columns';
END $$;
