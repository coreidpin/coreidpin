## Prerequisites
- Install Postgres client (psql) or use Docker.
- Option A (winget): `winget install PostgreSQL.PostgreSQL`
- Option B (Docker): `docker run --rm -e PGPASSWORD=StrongTemporaryPassword1! postgres psql -h db.evcqpapvcvmljgqiuzsq.supabase.co -p 5432 -U 24158 -d postgres -c "SELECT 1"`

## Connection Setup (PowerShell)
- `Set-Item -Path Env:PGPASSWORD -Value 'StrongTemporaryPassword1!'`
- Test: `psql -h db.evcqpapvcvmljgqiuzsq.supabase.co -p 5432 -U 24158 -d postgres -v ON_ERROR_STOP=1 -c "SELECT current_user, current_database();"`

## Phase 0: Discovery (confirm findings)
- Tables: `psql ... -c "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema='public' AND table_name ILIKE ANY(ARRAY['%user%','%auth%','%session%','%login%']);"`
- Functions: `psql ... -c "SELECT n.nspname, p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname ILIKE ANY(ARRAY['%auth%','%login%','%session%']);"`
- Triggers: `psql ... -c "SELECT tgname, relname FROM pg_trigger t JOIN pg_class c ON t.tgrelid=c.oid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('public','auth') AND (tgname ILIKE ANY(ARRAY['%auth%','%login%','%session%']) OR relname ILIKE ANY(ARRAY['%auth%','%login%','%session%']));"`
- Types: `psql ... -c "SELECT n.nspname, t.typname, t.typtype FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname ILIKE ANY(ARRAY['%auth%','%user%','%session%','%login%']);"`

## Phase 1: Cleanup (Up) — Transactional
- Begin: `psql ... -c "BEGIN;"`
- Disable custom lockout trigger:
  - `psql ... -c "ALTER TABLE public.login_history DISABLE TRIGGER login_history_lockout_trg;"`
- Drop function(s) `update_lockout_on_login` by signature:
  - `psql ... -c "DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT (n.nspname||'.'||p.proname||'('||pg_get_function_arguments(p.oid)||')') AS fqn FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='update_lockout_on_login' LOOP EXECUTE 'DROP FUNCTION IF EXISTS '||r.fqn||' CASCADE'; END LOOP; END $$;"`
- Drop FK constraints on public legacy tables:
  - `psql ... -c "DO $$ DECLARE rc RECORD; BEGIN FOR rc IN SELECT conname, n.nspname, c.relname FROM pg_constraint co JOIN pg_class c ON co.conrelid=c.oid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('oauth_clients','oauth_authorizations','oauth_consents','oauth_accounts','login_history','onboarding_user_steps','app_users') AND co.contype='f' LOOP EXECUTE 'ALTER TABLE '||quote_ident(rc.nspname)||'.'||quote_ident(rc.relname)||' DROP CONSTRAINT '||quote_ident(rc.conname)||' CASCADE'; END LOOP; END $$;"`
- Drop legacy tables:
  - `psql ... -c "DROP TABLE IF EXISTS public.login_history CASCADE;"`
  - `psql ... -c "DROP TABLE IF EXISTS public.onboarding_user_steps CASCADE;"`
  - `psql ... -c "DROP TABLE IF EXISTS public.app_users CASCADE;"`
  - `psql ... -c "DROP TABLE IF EXISTS public.oauth_accounts CASCADE;"`
  - `psql ... -c "DROP TABLE IF EXISTS public.oauth_clients CASCADE;"`
  - `psql ... -c "DROP TABLE IF EXISTS public.oauth_authorizations CASCADE;"`
  - `psql ... -c "DROP TABLE IF EXISTS public.oauth_consents CASCADE;"`
- Drop composite/array types tied to removed tables:
  - `psql ... -c "DROP TYPE IF EXISTS public.app_users CASCADE;"`
  - `psql ... -c "DROP TYPE IF EXISTS public._app_users CASCADE;"`
  - `psql ... -c "DROP TYPE IF EXISTS public.login_history CASCADE;"`
  - `psql ... -c "DROP TYPE IF EXISTS public._login_history CASCADE;"`
  - `psql ... -c "DROP TYPE IF EXISTS public.onboarding_user_steps CASCADE;"`
  - `psql ... -c "DROP TYPE IF EXISTS public._onboarding_user_steps CASCADE;"`
  - `psql ... -c "DROP TYPE IF EXISTS public.oauth_accounts CASCADE;"`
  - `psql ... -c "DROP TYPE IF EXISTS public._oauth_accounts CASCADE;"`
- Commit: `psql ... -c "COMMIT;"`

## Phase 1: Verification
- Re-run Phase 0 queries to confirm zero legacy objects remain in `public`.

## Rollback
- Pre-step snapshot strongly recommended: `pg_dump --schema-only` before cleanup.
- If issues: `psql ... -c "ROLLBACK;"` (only if errors occur before commit). Otherwise restore from snapshot.

## Notes
- Do not touch Supabase-managed `auth.*` objects.
- Run within a maintenance window.
- Keep outputs from Phase 0/Verification for audit.