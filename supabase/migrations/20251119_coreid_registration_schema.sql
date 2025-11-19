-- Core-ID phone-first registration schema (Postgres / Supabase)
-- Aligns with business rules: phone required, unique phone_hash, PIN issuance after OTP

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users profile (maps to auth.users via FK)
CREATE TABLE IF NOT EXISTS public.identity_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email CITEXT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_encrypted TEXT NOT NULL,
  phone_hash TEXT NOT NULL UNIQUE,
  pin TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'incomplete' CHECK (status IN ('incomplete','active','suspended')),
  profile_completion INT NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  welcome_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  welcome_email_sent_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS identity_users_phone_hash_idx ON public.identity_users(phone_hash);
CREATE INDEX IF NOT EXISTS identity_users_pin_idx ON public.identity_users(pin);

-- Resumable registration state keyed by reg_token
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reg_token TEXT UNIQUE NOT NULL,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  progress_stage TEXT NOT NULL DEFAULT 'basic' CHECK (progress_stage IN ('basic','profile','experience','education','certs')),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  phone_hash TEXT,
  otp_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS registrations_stage_idx ON public.registrations(progress_stage);
CREATE INDEX IF NOT EXISTS registrations_phone_hash_idx ON public.registrations(phone_hash);

-- OTP store: hash only, TTL, attempts
CREATE TABLE IF NOT EXISTS public.otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_hash TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS otps_contact_hash_idx ON public.otps(contact_hash);
CREATE INDEX IF NOT EXISTS otps_expires_at_idx ON public.otps(expires_at);

-- Email verification tokens (decoupled from auth.users fixed flow)
CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS evt_user_idx ON public.email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS evt_expires_idx ON public.email_verification_tokens(expires_at);

-- Audit events
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('otp_sent','otp_verified','registration_started','profile_saved','pin_issued','welcome_email_sent','email_verified')),
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_events_type_idx ON public.audit_events(event_type);
CREATE INDEX IF NOT EXISTS audit_events_created_at_idx ON public.audit_events(created_at DESC);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'identity_users_set_updated_at'
  ) THEN
    CREATE TRIGGER identity_users_set_updated_at
    BEFORE UPDATE ON public.identity_users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'registrations_set_updated_at'
  ) THEN
    CREATE TRIGGER registrations_set_updated_at
    BEFORE UPDATE ON public.registrations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- RLS
ALTER TABLE public.identity_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS identity_users_select_own ON public.identity_users;
CREATE POLICY identity_users_select_own ON public.identity_users FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS identity_users_update_own ON public.identity_users;
CREATE POLICY identity_users_update_own ON public.identity_users FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS registrations_select_own ON public.registrations;
CREATE POLICY registrations_select_own ON public.registrations FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS registrations_update_own ON public.registrations;
CREATE POLICY registrations_update_own ON public.registrations FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS otps_no_select ON public.otps;
CREATE POLICY otps_no_select ON public.otps FOR SELECT TO authenticated USING (false);

DROP POLICY IF EXISTS audit_events_no_select ON public.audit_events;
CREATE POLICY audit_events_no_select ON public.audit_events FOR SELECT TO authenticated USING (false);

-- Helper to sync email_verified from auth.users
CREATE OR REPLACE FUNCTION public.sync_email_verified()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.identity_users SET email_verified = (NEW.email_confirmed_at IS NOT NULL), updated_at = NOW()
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_email_verified ON auth.users;
CREATE TRIGGER trg_sync_email_verified AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_email_verified();

