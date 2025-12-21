-- Add full_name column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add user_type column if it doesn't exist (to support explicit user type storage)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT;

-- Add avatar_url column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add phone_number column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Notify that columns were checked/added
DO $$
BEGIN
  RAISE NOTICE 'Checked/Added full_name, user_type, avatar_url, phone_number to profiles table';
END $$;
