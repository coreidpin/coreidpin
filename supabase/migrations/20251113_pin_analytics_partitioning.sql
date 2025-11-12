-- Partition pin_analytics by month on created_at
-- Created: 2025-11-12

BEGIN;

-- Create new partitioned table
CREATE TABLE IF NOT EXISTS public.pin_analytics_new (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  pin_id UUID NOT NULL REFERENCES public.professional_pins(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('view', 'share', 'copy', 'download', 'regenerate')) NOT NULL,
  viewer_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pin_analytics_new_pk PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions: previous month, current, next 4 months
DO $$
DECLARE
  start_month DATE := date_trunc('month', NOW())::date - INTERVAL '1 month';
  i INT := 0;
  part_start DATE;
  part_end DATE;
  part_name TEXT;
BEGIN
  WHILE i <= 5 LOOP
    part_start := start_month + (i * INTERVAL '1 month');
    part_end := part_start + INTERVAL '1 month';
    part_name := format('pin_analytics_%s', to_char(part_start, 'YYYYMM'));
    EXECUTE format('CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.pin_analytics_new FOR VALUES FROM (%L) TO (%L);', part_name, part_start, part_end);
    -- Local indexes
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I_pin_id ON public.%I (pin_id);', part_name || '_idx', part_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I_event_type ON public.%I (event_type);', part_name || '_evt_idx', part_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I_created_at ON public.%I (created_at DESC);', part_name || '_ts_idx', part_name);
    i := i + 1;
  END LOOP;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'pin_analytics'
  ) THEN
    INSERT INTO public.pin_analytics_new (id, pin_id, event_type, viewer_id, ip_address, user_agent, referrer, created_at)
    SELECT id, pin_id, event_type, viewer_id, ip_address, user_agent, referrer, COALESCE(created_at, NOW())
    FROM public.pin_analytics;
  END IF;
END $$;

-- Swap tables: keep backup
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pin_analytics_old') THEN
    DROP TABLE public.pin_analytics_old;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pin_analytics') THEN
    ALTER TABLE public.pin_analytics RENAME TO pin_analytics_old;
  END IF;
  ALTER TABLE public.pin_analytics_new RENAME TO pin_analytics;
END $$;

-- Enable RLS and recreate essential policies
ALTER TABLE public.pin_analytics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'select_own_analytics' AND n.nspname = 'public' AND c.relname = 'pin_analytics'
  ) THEN
    EXECUTE 'CREATE POLICY select_own_analytics ON public.pin_analytics FOR SELECT USING (
      pin_id IN (SELECT id FROM public.professional_pins WHERE user_id = auth.uid())
    )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'insert_analytics_service' AND n.nspname = 'public' AND c.relname = 'pin_analytics'
  ) THEN
    EXECUTE 'CREATE POLICY insert_analytics_service ON public.pin_analytics FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- Helper function: ensure next month partition exists
CREATE OR REPLACE FUNCTION public.ensure_next_pin_analytics_partition()
RETURNS VOID AS $$
DECLARE
  next_month DATE := date_trunc('month', NOW())::date + INTERVAL '1 month';
  part_name TEXT := format('pin_analytics_%s', to_char(next_month, 'YYYYMM'));
  part_end DATE := next_month + INTERVAL '1 month';
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = part_name
  ) THEN
    EXECUTE format('CREATE TABLE public.%I PARTITION OF public.pin_analytics FOR VALUES FROM (%L) TO (%L);', part_name, next_month, part_end);
    EXECUTE format('CREATE INDEX %I_pin_id ON public.%I (pin_id);', part_name || '_idx', part_name);
    EXECUTE format('CREATE INDEX %I_event_type ON public.%I (event_type);', part_name || '_evt_idx', part_name);
    EXECUTE format('CREATE INDEX %I_created_at ON public.%I (created_at DESC);', part_name || '_ts_idx', part_name);
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMIT;
