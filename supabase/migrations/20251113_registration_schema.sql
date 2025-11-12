CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email CITEXT UNIQUE,
  name TEXT,
  title TEXT,
  location TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('professional','employer','university')),
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.registration_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  step TEXT NOT NULL DEFAULT 'started' CHECK (step IN ('started','email_sent','email_verified','profile_complete','finished')),
  last_step_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS registration_state_step_idx ON public.registration_state(step);

CREATE TABLE IF NOT EXISTS public.registration_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email CITEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL CHECK (status IN ('success','failure','rate_limited')),
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS registration_attempts_email_idx ON public.registration_attempts(email);
CREATE INDEX IF NOT EXISTS registration_attempts_created_at_idx ON public.registration_attempts(created_at DESC);

CREATE TABLE IF NOT EXISTS public.oauth_accounts (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT oauth_accounts_pk PRIMARY KEY (user_id, provider)
);

CREATE TABLE IF NOT EXISTS public.email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'email_verifications' AND column_name = 'email'
  ) THEN
    CREATE INDEX IF NOT EXISTS email_verifications_email_idx ON public.email_verifications(email);
  END IF;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS reg_state_select_own ON public.registration_state;
CREATE POLICY reg_state_select_own ON public.registration_state FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS reg_attempts_select ON public.registration_attempts;
CREATE POLICY reg_attempts_select ON public.registration_attempts FOR SELECT TO authenticated USING (false);

CREATE OR REPLACE FUNCTION public.init_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles(user_id, user_type)
  VALUES (NEW.id, 'professional')
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.registration_state(user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS init_user_registration ON auth.users;
CREATE TRIGGER init_user_registration AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.init_user_registration();

CREATE OR REPLACE FUNCTION public.on_email_verified()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at <> NEW.email_confirmed_at) THEN
    UPDATE public.profiles SET verification_status='verified', updated_at=NOW() WHERE user_id=NEW.id;
    UPDATE public.registration_state SET step='email_verified', last_step_at=NOW(), updated_at=NOW() WHERE user_id=NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_email_verified ON auth.users;
CREATE TRIGGER trg_email_verified AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.on_email_verified();

-- Keep profiles.email in sync when auth.users.email changes

CREATE OR REPLACE FUNCTION public.advance_registration_step(p_user_id UUID, p_step TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.registration_state SET step=p_step, last_step_at=NOW(), updated_at=NOW() WHERE user_id=p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.complete_profile(p_user_id UUID, p_profile JSONB)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles SET
    name=COALESCE(p_profile->>'name', name),
    title=COALESCE(p_profile->>'title', title),
    location=COALESCE(p_profile->>'location', location),
    onboarding_complete=TRUE,
    updated_at=NOW()
  WHERE user_id=p_user_id;
  PERFORM public.advance_registration_step(p_user_id, 'profile_complete');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.record_registration_attempt(p_email CITEXT, p_status TEXT, p_error TEXT, p_ip TEXT, p_ua TEXT, p_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.registration_attempts(email, status, error_code, ip_address, user_agent, user_id)
  VALUES (p_email, p_status, p_error, p_ip, p_ua, p_user_id);
END;
$$ LANGUAGE plpgsql;
