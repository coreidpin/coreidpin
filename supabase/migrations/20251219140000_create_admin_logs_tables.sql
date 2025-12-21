-- Create auth_logs table
CREATE TABLE IF NOT EXISTS public.auth_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    status TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    location TEXT,
    user_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pin_login_logs table
CREATE TABLE IF NOT EXISTS public.pin_login_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    failure_reason TEXT,
    user_email TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email_verification_logs table
CREATE TABLE IF NOT EXISTS public.email_verification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    status TEXT NOT NULL,
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verification_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for auth_logs
CREATE POLICY "Admins can view all auth logs"
    ON public.auth_logs
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM public.admin_users
        )
    );

CREATE POLICY "Service role can insert auth logs"
    ON public.auth_logs
    FOR INSERT
    WITH CHECK (true);

-- Create policies for pin_login_logs
CREATE POLICY "Admins can view all pin logs"
    ON public.pin_login_logs
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM public.admin_users
        )
    );

CREATE POLICY "Service role can insert pin logs"
    ON public.pin_login_logs
    FOR INSERT
    WITH CHECK (true);

-- Create policies for email_verification_logs
CREATE POLICY "Admins can view all email logs"
    ON public.email_verification_logs
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM public.admin_users
        )
    );

CREATE POLICY "Service role can insert email logs"
    ON public.email_verification_logs
    FOR INSERT
    WITH CHECK (true);

-- Grant access to authenticated users (admins) and service role
GRANT SELECT ON public.auth_logs TO authenticated;
GRANT ALL ON public.auth_logs TO service_role;

GRANT SELECT ON public.pin_login_logs TO authenticated;
GRANT ALL ON public.pin_login_logs TO service_role;

GRANT SELECT ON public.email_verification_logs TO authenticated;
GRANT ALL ON public.email_verification_logs TO service_role;
