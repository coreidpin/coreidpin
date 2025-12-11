-- Create API Usage Tracking System
-- Migration: 20250111180000_create_api_usage_tracking.sql

-- Create API usage logs table
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    request_ip TEXT,
    user_agent TEXT,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON public.api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_key_id ON public.api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON public.api_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_status_code ON public.api_usage_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_date ON public.api_usage_logs(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own logs
CREATE POLICY "Users can view own API usage logs"
    ON public.api_usage_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- System can insert logs
CREATE POLICY "System can insert API usage logs"
    ON public.api_usage_logs
    FOR INSERT
    WITH CHECK (true);

-- Drop existing functions if they exist (to avoid conflicts)
DO $$
DECLARE
    func RECORD;
BEGIN
    -- Drop all overloaded versions of log_api_usage
    FOR func IN 
        SELECT oid::regprocedure
        FROM pg_proc
        WHERE proname = 'log_api_usage'
          AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func.oid::regprocedure || ' CASCADE';
    END LOOP;
    
    -- Drop all overloaded versions of increment_monthly_usage
    FOR func IN 
        SELECT oid::regprocedure
        FROM pg_proc
        WHERE proname = 'increment_monthly_usage'
          AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func.oid::regprocedure || ' CASCADE';
    END LOOP;
    
    -- Drop all overloaded versions of reset_monthly_usage
    FOR func IN 
        SELECT oid::regprocedure
        FROM pg_proc
        WHERE proname = 'reset_monthly_usage'
          AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func.oid::regprocedure || ' CASCADE';
    END LOOP;
    
    -- Drop all overloaded versions of get_usage_stats
    FOR func IN 
        SELECT oid::regprocedure
        FROM pg_proc
        WHERE proname = 'get_usage_stats'
          AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func.oid::regprocedure || ' CASCADE';
    END LOOP;
    
    -- Drop all overloaded versions of check_api_quota
    FOR func IN 
        SELECT oid::regprocedure
        FROM pg_proc
        WHERE proname = 'check_api_quota'
          AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func.oid::regprocedure || ' CASCADE';
    END LOOP;
END $$;

-- Function to log API usage
CREATE OR REPLACE FUNCTION log_api_usage(
    p_user_id UUID,
    p_api_key_id UUID,
    p_endpoint TEXT,
    p_method TEXT,
    p_status_code INTEGER,
    p_response_time_ms INTEGER DEFAULT NULL,
    p_request_ip TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.api_usage_logs (
        user_id,
        api_key_id,
        endpoint,
        method,
        status_code,
        response_time_ms,
        request_ip,
        user_agent,
        error_message,
        metadata
    ) VALUES (
        p_user_id,
        p_api_key_id,
        p_endpoint,
        p_method,
        p_status_code,
        p_response_time_ms,
        p_request_ip,
        p_user_agent,
        p_error_message,
        p_metadata
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment monthly API usage
CREATE OR REPLACE FUNCTION increment_monthly_usage(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.business_profiles
    SET current_month_usage = COALESCE(current_month_usage, 0) + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage (run via cron job monthly)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS VOID AS $$
BEGIN
    UPDATE public.business_profiles
    SET current_month_usage = 0,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get usage stats for a user
CREATE OR REPLACE FUNCTION get_usage_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_requests BIGINT,
    successful_requests BIGINT,
    failed_requests BIGINT,
    avg_response_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_requests,
        COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 300)::BIGINT as successful_requests,
        COUNT(*) FILTER (WHERE status_code >= 400)::BIGINT as failed_requests,
        ROUND(AVG(response_time_ms), 2) as avg_response_time
    FROM public.api_usage_logs
    WHERE user_id = p_user_id
      AND created_at >= NOW() - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has exceeded quota
CREATE OR REPLACE FUNCTION check_api_quota(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_usage INTEGER;
    quota INTEGER;
BEGIN
    SELECT 
        COALESCE(current_month_usage, 0),
        COALESCE(monthly_api_quota, 1000)
    INTO current_usage, quota
    FROM public.business_profiles
    WHERE user_id = p_user_id;
    
    -- Return true if under quota
    RETURN current_usage < quota;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-increment usage on log insert
CREATE OR REPLACE FUNCTION auto_increment_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Only increment for successful requests
    IF NEW.status_code >= 200 AND NEW.status_code < 300 THEN
        PERFORM increment_monthly_usage(NEW.user_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_increment_usage
    AFTER INSERT ON public.api_usage_logs
    FOR EACH ROW
    EXECUTE FUNCTION auto_increment_usage();

-- Add comments
COMMENT ON TABLE public.api_usage_logs IS 'Stores API usage logs for tracking and analytics';
COMMENT ON FUNCTION log_api_usage IS 'Log an API request with details';
COMMENT ON FUNCTION increment_monthly_usage IS 'Increment the monthly usage counter for a user';
COMMENT ON FUNCTION reset_monthly_usage IS 'Reset monthly usage for all users (run monthly)';
COMMENT ON FUNCTION get_usage_stats IS 'Get aggregated usage statistics for a user';
COMMENT ON FUNCTION check_api_quota IS 'Check if user has remaining API quota';
