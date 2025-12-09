-- Create professional_pins table
CREATE TABLE IF NOT EXISTS public.professional_pins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pin_number TEXT NOT NULL,
    verification_status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(pin_number)
);

-- Create pin_audit_logs table
CREATE TABLE IF NOT EXISTS public.pin_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    pin TEXT NOT NULL,
    event TEXT NOT NULL,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pin_verifications table
CREATE TABLE IF NOT EXISTS public.pin_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pin TEXT NOT NULL,
    verifier_type TEXT NOT NULL,
    verifier_id TEXT NOT NULL,
    verification_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.professional_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_verifications ENABLE ROW LEVEL SECURITY;

-- Policies for professional_pins
CREATE POLICY "Users can view their own PIN"
    ON public.professional_pins FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all PINs"
    ON public.professional_pins
    USING (true)
    WITH CHECK (true);

-- Policies for pin_audit_logs
CREATE POLICY "Service role can manage audit logs"
    ON public.pin_audit_logs
    USING (true)
    WITH CHECK (true);

-- Policies for pin_verifications
CREATE POLICY "Service role can manage verifications"
    ON public.pin_verifications
    USING (true)
    WITH CHECK (true);

-- Grant access to service role
GRANT ALL ON public.professional_pins TO service_role;
GRANT ALL ON public.pin_audit_logs TO service_role;
GRANT ALL ON public.pin_verifications TO service_role;
