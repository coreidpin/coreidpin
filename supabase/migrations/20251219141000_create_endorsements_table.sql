-- Create endorsements table
CREATE TABLE IF NOT EXISTS public.endorsements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID, -- Optional link to a project
    endorser_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to user who endorsed
    skill_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    relationship TEXT,
    verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;

-- Add foreign key to profiles
-- Drop first to avoid "already exists" error and ensure it points to the right table
ALTER TABLE public.endorsements DROP CONSTRAINT IF EXISTS endorsements_endorser_id_fkey;

ALTER TABLE public.endorsements 
    ADD CONSTRAINT endorsements_endorser_id_fkey 
    FOREIGN KEY (endorser_id) 
    REFERENCES public.profiles(user_id)
    ON DELETE SET NULL;

-- Create policies for endorsements
-- Drop existing policies to be idempotent
DROP POLICY IF EXISTS "Admins can view all endorsements" ON public.endorsements;
CREATE POLICY "Admins can view all endorsements"
    ON public.endorsements
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM public.admin_users
        )
    );

DROP POLICY IF EXISTS "Admins can update endorsements" ON public.endorsements;
CREATE POLICY "Admins can update endorsements"
    ON public.endorsements
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM public.admin_users
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM public.admin_users
        )
    );

-- Allow authenticated users to create endorsements (e.g. standard users)
DROP POLICY IF EXISTS "Users can create endorsements" ON public.endorsements;
CREATE POLICY "Users can create endorsements"
    ON public.endorsements
    FOR INSERT
    WITH CHECK (auth.uid() = endorser_id);

-- Start Grant
GRANT ALL ON public.endorsements TO authenticated;
GRANT ALL ON public.endorsements TO service_role;
