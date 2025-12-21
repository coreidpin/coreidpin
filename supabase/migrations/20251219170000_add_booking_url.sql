-- Add booking_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS booking_url TEXT;

COMMENT ON COLUMN public.profiles.booking_url IS 'URL for booking appointments (e.g., Calendly)';
