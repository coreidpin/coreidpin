BEGIN;
CREATE TABLE IF NOT EXISTS public.account_lockouts (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  ip text,
  locked_until timestamptz NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_user ON public.account_lockouts(user_id);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_ip ON public.account_lockouts(ip);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_locked_until ON public.account_lockouts(locked_until);
ALTER TABLE public.account_lockouts ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='account_lockouts_set_updated_at' AND tgrelid='public.account_lockouts'::regclass
  ) THEN
    CREATE TRIGGER account_lockouts_set_updated_at BEFORE UPDATE ON public.account_lockouts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
COMMIT;
