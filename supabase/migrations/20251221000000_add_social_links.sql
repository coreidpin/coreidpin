-- Add social_links column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb;

-- Comment on column
COMMENT ON COLUMN public.profiles.social_links IS 'Array of social links: [{ platform: "linkedin", url: "..." }]';

-- Notify
DO $$
BEGIN
  RAISE NOTICE 'Added social_links column to profiles table';
END $$;
