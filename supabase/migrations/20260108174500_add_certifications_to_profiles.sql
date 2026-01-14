-- Add certifications column to profiles table to store certification data array
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;

-- Comment for clarity
COMMENT ON COLUMN public.profiles.certifications IS 'JSONB array of user certifications';
