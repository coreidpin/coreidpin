-- ============================================================================
-- Migration: Create Instant Sign-In / Consent Management Tables
-- Created: 2025-12-09
-- Purpose: Support OAuth-like Instant Sign-In flow for business API
-- ============================================================================

-- Table: consent_requests
-- Stores consent requests initiated by businesses
CREATE TABLE IF NOT EXISTS public.consent_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consent_token TEXT NOT NULL UNIQUE,
    professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    requested_scopes TEXT[] NOT NULL DEFAULT '{basic}',
    redirect_uri TEXT NOT NULL,
    state TEXT, -- client-provided state for CSRF protection
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
    auth_code TEXT UNIQUE,
    auth_code_expires_at TIMESTAMPTZ,
    access_token TEXT UNIQUE,
    access_token_expires_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: data_access_consents
-- Stores active consent grants (when professional approves business access)
CREATE TABLE IF NOT EXISTS public.data_access_consents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    scopes TEXT[] NOT NULL,
    consent_given_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ, -- NULL = permanent until revoked
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(professional_id, business_id) -- One consent per professional-business pair
);

-- Table: consent_audit_logs
-- Audit trail for all consent-related actions
CREATE TABLE IF NOT EXISTS public.consent_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consent_request_id UUID REFERENCES public.consent_requests(id) ON DELETE SET NULL,
    professional_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    business_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'request_initiated', 'approved', 'denied', 'token_exchanged', 'revoked'
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_consent_requests_token ON public.consent_requests(consent_token);
CREATE INDEX IF NOT EXISTS idx_consent_requests_auth_code ON public.consent_requests(auth_code);
CREATE INDEX IF NOT EXISTS idx_consent_requests_access_token ON public.consent_requests(access_token);
CREATE INDEX IF NOT EXISTS idx_consent_requests_professional ON public.consent_requests(professional_id);
CREATE INDEX IF NOT EXISTS idx_consent_requests_business ON public.consent_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_consent_requests_status ON public.consent_requests(status);
CREATE INDEX IF NOT EXISTS idx_consent_requests_expires ON public.consent_requests(expires_at);

CREATE INDEX IF NOT EXISTS idx_data_access_professional ON public.data_access_consents(professional_id);
CREATE INDEX IF NOT EXISTS idx_data_access_business ON public.data_access_consents(business_id);
CREATE INDEX IF NOT EXISTS idx_data_access_active ON public.data_access_consents(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_consent_audit_professional ON public.consent_audit_logs(professional_id);
CREATE INDEX IF NOT EXISTS idx_consent_audit_business ON public.consent_audit_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_consent_audit_created ON public.consent_audit_logs(created_at);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.consent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_access_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_audit_logs ENABLE ROW LEVEL SECURITY;

-- Consent Requests Policies
DROP POLICY IF EXISTS "Professionals can view their own consent requests" ON public.consent_requests;
CREATE POLICY "Professionals can view their own consent requests"
    ON public.consent_requests FOR SELECT
    USING (auth.uid() = professional_id);

DROP POLICY IF EXISTS "Businesses can view their initiated consent requests" ON public.consent_requests;
CREATE POLICY "Businesses can view their initiated consent requests"
    ON public.consent_requests FOR SELECT
    USING (auth.uid() = business_id);

DROP POLICY IF EXISTS "Professionals can update their consent responses" ON public.consent_requests;
CREATE POLICY "Professionals can update their consent responses"
    ON public.consent_requests FOR UPDATE
    USING (auth.uid() = professional_id);

DROP POLICY IF EXISTS "Service role can manage all consent requests" ON public.consent_requests;
CREATE POLICY "Service role can manage all consent requests"
    ON public.consent_requests
    USING (true)
    WITH CHECK (true);

-- Data Access Consents Policies
DROP POLICY IF EXISTS "Professionals can view their own consents" ON public.data_access_consents;
CREATE POLICY "Professionals can view their own consents"
    ON public.data_access_consents FOR SELECT
    USING (auth.uid() = professional_id);

DROP POLICY IF EXISTS "Businesses can view consents granted to them" ON public.data_access_consents;
CREATE POLICY "Businesses can view consents granted to them"
    ON public.data_access_consents FOR SELECT
    USING (auth.uid() = business_id);

DROP POLICY IF EXISTS "Professionals can revoke their consents" ON public.data_access_consents;
CREATE POLICY "Professionals can revoke their consents"
    ON public.data_access_consents FOR UPDATE
    USING (auth.uid() = professional_id);

DROP POLICY IF EXISTS "Service role can manage all consents" ON public.data_access_consents;
CREATE POLICY "Service role can manage all consents"
    ON public.data_access_consents
    USING (true)
    WITH CHECK (true);

-- Audit Logs Policies
DROP POLICY IF EXISTS "Service role can manage audit logs" ON public.consent_audit_logs;
CREATE POLICY "Service role can manage audit logs"
    ON public.consent_audit_logs
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Professionals can view their own audit logs" ON public.consent_audit_logs;
CREATE POLICY "Professionals can view their own audit logs"
    ON public.consent_audit_logs FOR SELECT
    USING (auth.uid() = professional_id);

DROP POLICY IF EXISTS "Businesses can view their own audit logs" ON public.consent_audit_logs;
CREATE POLICY "Businesses can view their own audit logs"
    ON public.consent_audit_logs FOR SELECT
    USING (auth.uid() = business_id);

-- ============================================================================
-- Grant Permissions
-- ============================================================================
GRANT ALL ON public.consent_requests TO service_role;
GRANT ALL ON public.data_access_consents TO service_role;
GRANT ALL ON public.consent_audit_logs TO service_role;

GRANT SELECT ON public.consent_requests TO authenticated;
GRANT SELECT ON public.data_access_consents TO authenticated;
GRANT SELECT ON public.consent_audit_logs TO authenticated;

-- ============================================================================
-- Helper Function: Check if Consent is Valid
-- ============================================================================
CREATE OR REPLACE FUNCTION is_consent_valid(
    p_professional_id UUID,
    p_business_id UUID,
    p_required_scopes TEXT[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_consent RECORD;
    v_scope TEXT;
BEGIN
    -- Get active consent
    SELECT * INTO v_consent
    FROM public.data_access_consents
    WHERE professional_id = p_professional_id
      AND business_id = p_business_id
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
      AND revoked_at IS NULL;

    -- No consent found
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Check if all required scopes are granted
    FOREACH v_scope IN ARRAY p_required_scopes
    LOOP
        IF NOT (v_scope = ANY(v_consent.scopes)) THEN
            RETURN FALSE;
        END IF;
    END LOOP;

    RETURN TRUE;
END;
$$;

-- ============================================================================
-- Trigger: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_consent_requests_updated_at ON public.consent_requests;
CREATE TRIGGER update_consent_requests_updated_at
    BEFORE UPDATE ON public.consent_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_data_access_consents_updated_at ON public.data_access_consents;
CREATE TRIGGER update_data_access_consents_updated_at
    BEFORE UPDATE ON public.data_access_consents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Cleanup Function: Remove Expired Consent Requests
-- Should be run periodically via cron job
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_consent_requests()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM public.consent_requests
        WHERE expires_at < NOW() - INTERVAL '7 days' -- Keep for 7 days after expiry for audit
          AND status IN ('pending', 'expired', 'denied')
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted;

    RETURN v_deleted_count;
END;
$$;

-- ============================================================================
-- Sample Data for Testing (only in development)
-- ============================================================================
-- Uncomment for local testing:
-- INSERT INTO public.consent_requests (consent_token, professional_id, business_id, requested_scopes, redirect_uri, status, expires_at)
-- VALUES (
--     'test-consent-token-123',
--     (SELECT id FROM auth.users LIMIT 1),
--     (SELECT id FROM auth.users LIMIT 1 OFFSET 1),
--     ARRAY['basic', 'work_history'],
--     'http://localhost:3000/callback',
--     'pending',
--     NOW() + INTERVAL '15 minutes'
-- );
