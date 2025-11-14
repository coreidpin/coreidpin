BEGIN;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='setup_progress'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN setup_progress integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='setup_steps'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN setup_steps jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;
COMMIT;
