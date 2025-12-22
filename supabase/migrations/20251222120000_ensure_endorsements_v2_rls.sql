-- Ensure professional_endorsements_v2 table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.professional_endorsements_v2 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID REFERENCES auth.users(id) NOT NULL,
    endorser_id UUID REFERENCES auth.users(id),
    endorser_name TEXT NOT NULL,
    endorser_email TEXT,
    endorser_role TEXT,
    endorser_company TEXT,
    endorser_linkedin_url TEXT,
    relationship_type TEXT,
    company_worked_together TEXT,
    time_worked_together_start DATE,
    time_worked_together_end DATE,
    project_context TEXT,
    skills_endorsed TEXT[],
    status TEXT DEFAULT 'requested', -- requested, pending_professional, accepted, rejected
    verification_token TEXT,
    verification_expires_at TIMESTAMPTZ,
    verification_method TEXT,
    text TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    featured BOOLEAN DEFAULT false,
    visibility TEXT DEFAULT 'public', -- public, connections_only, private
    endorsement_weight INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.professional_endorsements_v2 ENABLE ROW LEVEL SECURITY;

-- Policy: Professionals can view their own endorsements (received or requested)
DROP POLICY IF EXISTS "Professionals can view own endorsements" ON public.professional_endorsements_v2;
CREATE POLICY "Professionals can view own endorsements"
    ON public.professional_endorsements_v2
    FOR SELECT
    USING (auth.uid() = professional_id);

-- Policy: Public can view accepted and public endorsements
DROP POLICY IF EXISTS "Public can view active endorsements" ON public.professional_endorsements_v2;
CREATE POLICY "Public can view active endorsements"
    ON public.professional_endorsements_v2
    FOR SELECT
    USING (status = 'accepted' AND visibility = 'public');

-- Policy: Service Role has full access
-- (Implicit, but ensures no interference)
GRANT ALL ON public.professional_endorsements_v2 TO service_role;
GRANT ALL ON public.professional_endorsements_v2 TO authenticated;
GRANT ALL ON public.professional_endorsements_v2 TO anon;
