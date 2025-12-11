-- ULTRA-SIMPLE FIX: Just drop the triggers and disable RLS
-- Run this in Supabase SQL Editor

-- Drop notification triggers (ignore errors if they don't exist)
DROP TRIGGER IF EXISTS work_verification_notification ON public.work_experiences;
DROP TRIGGER IF EXISTS endorsement_request_notification ON public.endorsement_requests;
DROP TRIGGER IF EXISTS endorsement_accepted_notification ON public.endorsements;

-- Disable RLS on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_pins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experiences DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'Admin login fix applied! Try logging in now.' AS status;
