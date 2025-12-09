-- Fix missing company_email column in business_profiles
ALTER TABLE public.business_profiles 
ADD COLUMN IF NOT EXISTS company_email TEXT;
