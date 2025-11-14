BEGIN;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='sessions' AND column_name='ip'
  ) THEN
    ALTER TABLE public.sessions ADD COLUMN ip text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='sessions' AND column_name='user_agent'
  ) THEN
    ALTER TABLE public.sessions ADD COLUMN user_agent text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='sessions' AND column_name='device_id'
  ) THEN
    ALTER TABLE public.sessions ADD COLUMN device_id text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='login_rate_limits' AND column_name='ip'
  ) THEN
    ALTER TABLE public.login_rate_limits ADD COLUMN ip text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='account_lockouts' AND column_name='ip'
  ) THEN
    ALTER TABLE public.account_lockouts ADD COLUMN ip text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname='idx_login_rate_limits_user_ip'
  ) THEN
    CREATE INDEX idx_login_rate_limits_user_ip ON public.login_rate_limits(user_id, ip);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname='idx_account_lockouts_ip'
  ) THEN
    CREATE INDEX idx_account_lockouts_ip ON public.account_lockouts(ip);
  END IF;
END $$;
COMMIT;
