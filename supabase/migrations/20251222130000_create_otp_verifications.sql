CREATE TABLE IF NOT EXISTS public.otp_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    reg_token TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secure the table
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (Backend uses service role)
-- Allow anon/authenticated to insert (for registration flow if using anon key)
CREATE POLICY "Allow public insert" ON public.otp_verifications FOR INSERT TO public WITH CHECK (true);

-- No public select/update/delete. Verification is done via secure backend endpoints only.
