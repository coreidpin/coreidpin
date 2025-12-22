-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name TEXT DEFAULT 'CoreID Admin',
    support_email TEXT DEFAULT 'support@coreid.com',
    maintenance_mode BOOLEAN DEFAULT false,
    password_min_length INTEGER DEFAULT 8,
    require_special_char BOOLEAN DEFAULT true,
    require_numbers BOOLEAN DEFAULT true,
    enforce_2fa BOOLEAN DEFAULT false,
    session_timeout INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users (or everyone if public settings are needed)
CREATE POLICY "Allow read access to authenticated users" ON public.system_settings
    FOR SELECT TO authenticated USING (true);

-- Allow update access only to admins (we'll use a service role or admin check function in real implementation)
-- For now, we allow authenticated to simulate admin access in development or rely on backend logic
CREATE POLICY "Allow update access to authenticated users" ON public.system_settings
    FOR UPDATE TO authenticated USING (true);
    
-- Allow insert for setup
CREATE POLICY "Allow insert access to authenticated users" ON public.system_settings
    FOR INSERT TO authenticated WITH CHECK (true);


-- Create admin_users table (if not using a separate auth scheme, this links to auth.users)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('super_admin', 'admin', 'moderator')) DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS for admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users (admins need to see other admins)
CREATE POLICY "Allow read access to authenticated users" ON public.admin_users
    FOR SELECT TO authenticated USING (true);

-- Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    status TEXT CHECK (status IN ('success', 'failure')),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for admin_audit_logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow insert/select for authenticated
CREATE POLICY "Allow all access to authenticated users" ON public.admin_audit_logs
    FOR ALL TO authenticated USING (true);

-- Insert default system settings if not exists
INSERT INTO public.system_settings (site_name)
SELECT 'CoreID Admin'
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings);
