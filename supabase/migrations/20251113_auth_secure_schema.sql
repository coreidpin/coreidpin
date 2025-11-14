BEGIN;
CREATE TABLE IF NOT EXISTS public.credentials (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  password_updated_at timestamptz NOT NULL DEFAULT now(),
  password_require_reset boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  device_id text,
  ip text,
  user_agent text,
  refresh_token_hash text,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_refresh_hash ON public.sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions(expires_at);
CREATE TABLE IF NOT EXISTS public.auth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  purpose text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'auth_tokens_purpose_check'
      AND conrelid = 'public.auth_tokens'::regclass
  ) THEN
    ALTER TABLE public.auth_tokens
      ADD CONSTRAINT auth_tokens_purpose_check
      CHECK (purpose IN ('email_verify','password_reset'));
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_tokens_hash ON public.auth_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_purpose ON public.auth_tokens(user_id, purpose);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_unused ON public.auth_tokens((used_at IS NULL));
CREATE TABLE IF NOT EXISTS public.auth_audit_log (
  id bigserial PRIMARY KEY,
  user_id uuid,
  action text NOT NULL,
  outcome text NOT NULL,
  ip text,
  user_agent text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.login_rate_limits (
  id bigserial PRIMARY KEY,
  user_id uuid,
  ip text NOT NULL,
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_login_rate_limits_user_ip ON public.login_rate_limits(user_id, ip);
CREATE INDEX IF NOT EXISTS idx_login_rate_limits_window ON public.login_rate_limits(window_end);
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_rate_limits ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'sessions_select_owner' AND polrelid = 'public.sessions'::regclass
  ) THEN
    EXECUTE 'CREATE POLICY sessions_select_owner ON public.sessions FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'sessions_insert_owner' AND polrelid = 'public.sessions'::regclass
  ) THEN
    EXECUTE 'CREATE POLICY sessions_insert_owner ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;
CREATE OR REPLACE FUNCTION public.prevent_update_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'immutable'; END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'auth_audit_log_immutable'
      AND tgrelid = 'public.auth_audit_log'::regclass
  ) THEN
    CREATE TRIGGER auth_audit_log_immutable
      BEFORE UPDATE OR DELETE ON public.auth_audit_log
      FOR EACH ROW EXECUTE FUNCTION public.prevent_update_delete();
  END IF;
END $$;
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'credentials_set_updated_at'
      AND tgrelid = 'public.credentials'::regclass
  ) THEN
    CREATE TRIGGER credentials_set_updated_at
      BEFORE UPDATE ON public.credentials
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'sessions_set_updated_at'
      AND tgrelid = 'public.sessions'::regclass
  ) THEN
    CREATE TRIGGER sessions_set_updated_at
      BEFORE UPDATE ON public.sessions
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
COMMIT;
BEGIN;
CREATE TABLE IF NOT EXISTS public.registration_step_events (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  step smallint NOT NULL CHECK (step >= 1 AND step <= 4),
  status text NOT NULL CHECK (status IN ('started','completed')),
  data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reg_steps_user ON public.registration_step_events(user_id);
CREATE INDEX IF NOT EXISTS idx_reg_steps_email ON public.registration_step_events(email);
CREATE INDEX IF NOT EXISTS idx_reg_steps_step ON public.registration_step_events(step);
ALTER TABLE public.registration_step_events ENABLE ROW LEVEL SECURITY;
COMMIT;
