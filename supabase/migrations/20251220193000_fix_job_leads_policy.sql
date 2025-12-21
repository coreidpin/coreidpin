-- Drop potential existing policies to reset
DROP POLICY IF EXISTS "Professionals can view leads sent to them" ON public.job_leads;
DROP POLICY IF EXISTS "Public can insert leads" ON public.job_leads;

-- Re-enable RLS
ALTER TABLE public.job_leads ENABLE ROW LEVEL SECURITY;

-- Select Policy: Explicitly for authenticated users
CREATE POLICY "Professionals can view leads sent to them" 
ON public.job_leads FOR SELECT 
TO authenticated
USING (auth.uid() = professional_id);

-- Insert Policy: Public access (anon + authenticated)
CREATE POLICY "Public can insert leads" 
ON public.job_leads FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Ensure permissions
GRANT SELECT, INSERT ON public.job_leads TO authenticated;
GRANT INSERT ON public.job_leads TO anon;
