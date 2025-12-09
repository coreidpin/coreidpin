-- Create business_profiles table
CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    company_email TEXT,
    industry TEXT,
    website TEXT,
    description TEXT,
    logo_url TEXT,
    monthly_api_quota INTEGER DEFAULT 1000,
    current_month_usage INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- RLS for business_profiles
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can view own profile"
    ON public.business_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Businesses can update own profile"
    ON public.business_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage business profiles"
    ON public.business_profiles
    USING (true)
    WITH CHECK (true);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    permissions JSONB DEFAULT '{}'::jsonb,
    rate_limit_per_minute INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can view own keys"
    ON public.api_keys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Businesses can create keys"
    ON public.api_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Businesses can update own keys"
    ON public.api_keys FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Businesses can delete own keys"
    ON public.api_keys FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage api keys"
    ON public.api_keys
    USING (true)
    WITH CHECK (true);

-- Create api_usage_logs table
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    pin_queried TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for api_usage_logs
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can view own usage"
    ON public.api_usage_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage logs"
    ON public.api_usage_logs
    USING (true)
    WITH CHECK (true);

-- Log API Usage Function
CREATE OR REPLACE FUNCTION log_api_usage(
    p_api_key_id UUID,
    p_user_id UUID,
    p_endpoint TEXT,
    p_method TEXT,
    p_status_code INTEGER,
    p_response_time_ms INTEGER,
    p_pin_queried TEXT DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.api_usage_logs (
        api_key_id,
        user_id,
        endpoint,
        method,
        status_code,
        response_time_ms,
        pin_queried,
        error_message
    ) VALUES (
        p_api_key_id,
        p_user_id,
        p_endpoint,
        p_method,
        p_status_code,
        p_response_time_ms,
        p_pin_queried,
        p_error_message
    );

    -- Increase usage count
    UPDATE public.business_profiles
    SET current_month_usage = COALESCE(current_month_usage, 0) + 1
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
