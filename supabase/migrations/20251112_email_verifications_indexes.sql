-- Add composite index for fast token verification lookups
create index if not exists email_verifications_user_token_idx
  on public.email_verifications(user_id, token);

-- Optional: supporting index for recent rate-limiting checks
create index if not exists email_verifications_user_sent_idx
  on public.email_verifications(user_id, sent_at desc);
