DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='email_verifications' AND column_name='code'
  ) THEN
    ALTER TABLE public.email_verifications ADD COLUMN code TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='email_verifications' AND column_name='expires_at'
  ) THEN
    ALTER TABLE public.email_verifications ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='email_verifications' AND column_name='verified'
  ) THEN
    ALTER TABLE public.email_verifications ADD COLUMN verified BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='email_verifications' AND column_name='email'
  ) THEN
    CREATE INDEX IF NOT EXISTS email_verifications_email_idx ON public.email_verifications(email);
  END IF;
END $$;
