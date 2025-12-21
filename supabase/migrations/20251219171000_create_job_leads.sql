-- Create job_leads table to store professional inquiries
CREATE TABLE IF NOT EXISTS public.job_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    inquiry_type TEXT NOT NULL, -- 'full_time', 'contract', 'freelance', 'consultation'
    budget_range TEXT,
    message TEXT,
    status TEXT DEFAULT 'new', -- 'new', 'read', 'replied', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.job_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Professionals can view their own leads
CREATE POLICY "Professionals can view leads sent to them" 
ON public.job_leads FOR SELECT 
USING (auth.uid() = professional_id);

-- Policy: Anyone can insert a lead (public profile visitors)
CREATE POLICY "Public can insert leads" 
ON public.job_leads FOR INSERT 
WITH CHECK (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_job_leads_professional_id ON public.job_leads(professional_id);
