CREATE TABLE IF NOT EXISTS public.job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL CHECK (job_type IN ('send_otp','send_email','anchor_chain')),
  payload_encrypted TEXT NOT NULL,
  try_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','done','failed')),
  run_after TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS job_queue_status_idx ON public.job_queue(status);
CREATE INDEX IF NOT EXISTS job_queue_run_after_idx ON public.job_queue(run_after);

ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS job_queue_no_select ON public.job_queue;
CREATE POLICY job_queue_no_select ON public.job_queue FOR SELECT TO authenticated USING (false);

