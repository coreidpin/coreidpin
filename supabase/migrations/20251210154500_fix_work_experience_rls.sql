-- Ensure work_experiences table exists and has RLS policies for service role
CREATE TABLE IF NOT EXISTS public.work_experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    location TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.work_experiences ENABLE ROW LEVEL SECURITY;

-- Policy for Service Role (critical for Edge Functions)
DROP POLICY IF EXISTS "Service role can manage all work experiences" ON public.work_experiences;
CREATE POLICY "Service role can manage all work experiences"
    ON public.work_experiences
    USING (true)
    WITH CHECK (true);

-- Policy for Users (to view/edit their own)
DROP POLICY IF EXISTS "Users can manage their own work experiences" ON public.work_experiences;
CREATE POLICY "Users can manage their own work experiences"
    ON public.work_experiences
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Also fix profiles RLS just in case
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
CREATE POLICY "Service role can manage all profiles"
    ON public.profiles
    USING (true)
    WITH CHECK (true);
