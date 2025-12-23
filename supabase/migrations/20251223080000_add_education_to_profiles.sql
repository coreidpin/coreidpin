-- Add education column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb;

-- Notify
DO $$
BEGIN
  RAISE NOTICE 'Added education column to profiles table';
END $$;
