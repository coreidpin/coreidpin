-- Add cover_image_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Notify that column was added
DO $$
BEGIN
  RAISE NOTICE 'Added cover_image_url to profiles table';
END $$;
