-- Create user_sessions table for token refresh
-- Migration: 20251215000000_create_user_sessions.sql

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  refresh_token TEXT UNIQUE NOT NULL,
  refresh_token_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  access_token_hash TEXT,
  device_info JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  is_active BOOLEAN DEFAULT true,
  last_refreshed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON public.user_sessions(refresh_token) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.user_sessions(refresh_token_expires_at) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first if they exist)
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert sessions" ON public.user_sessions;
CREATE POLICY "System can insert sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can update sessions" ON public.user_sessions;
CREATE POLICY "System can update sessions"
  ON public.user_sessions FOR UPDATE
  USING (true);

-- Cleanup function for expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_sessions
  WHERE refresh_token_expires_at < NOW()
     OR (last_refreshed_at < NOW() - INTERVAL '90 days');
  
  RAISE NOTICE 'Cleaned up expired sessions';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup to run daily at 2 AM (unschedule first if exists)
DO $$
BEGIN
  -- Try to unschedule if exists, ignore error if not
  PERFORM cron.unschedule('cleanup-expired-sessions');
EXCEPTION
  WHEN OTHERS THEN
    -- Job doesn't exist, that's fine
    NULL;
END $$;

SELECT cron.schedule(
  'cleanup-expired-sessions',
  '0 2 * * *',
  'SELECT cleanup_expired_sessions();'
);

-- Add helpful comments
COMMENT ON TABLE public.user_sessions IS 'Stores user session data for custom OTP auth with token refresh';
COMMENT ON COLUMN public.user_sessions.refresh_token IS 'Secure random token for refreshing access tokens';
COMMENT ON COLUMN public.user_sessions.refresh_token_expires_at IS 'Refresh tokens expire after 30 days by default';
COMMENT ON FUNCTION cleanup_expired_sessions IS 'Removes expired and inactive sessions (runs daily via cron)';
