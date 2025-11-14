## Connection
- Build secure connection using your project ref `evcqpapvcvmljgqiuzsq`.
- Host: `db.evcqpapvcvmljgqiuzsq.supabase.co`, Database: `postgres`, Port: `5432`, SSL required.
- Use environment variable for password (safer than embedding):
  - PowerShell:
    - `$env:PGPASSWORD = 'StrongTemporaryPassword1!'`
    - `psql -h db.evcqpapvcvmljgqiuzsq.supabase.co -p 5432 -U 24158 -d postgres -c "SELECT current_user, current_database();"`

## Phase 0: Discovery & Inventory (Read-Only)
- Tables:
  - `psql ... -c "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema='public' AND table_name ILIKE ANY(ARRAY['%user%','%auth%','%session%','%login%']);"`
- Functions:
  - `psql ... -c "SELECT n.nspname, p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname ILIKE ANY(ARRAY['%auth%','%login%','%session%']);"`
- Triggers:
  - `psql ... -c "SELECT tgname, relname FROM pg_trigger t JOIN pg_class c ON t.tgrelid=c.oid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('public','auth') AND (tgname ILIKE ANY(ARRAY['%auth%','%login%','%session%']) OR relname ILIKE ANY(ARRAY['%auth%','%login%','%session%']));"`
- Types/Enums:
  - `psql ... -c "SELECT n.nspname, t.typname, t.typtype FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname ILIKE ANY(ARRAY['%auth%','%user%','%session%','%login%']);"`

## Phase 1: DB Cleanup (Scoped DDL) — Plan Only
- Principle: never drop `auth.users` (Supabase-managed); only remove legacy artifacts.
- Disable custom triggers tied to legacy auth if present:
  - `ALTER TABLE auth.users DISABLE TRIGGER init_user_registration;`
  - `ALTER TABLE auth.users DISABLE TRIGGER trg_email_verified;`
- Drop dependent views/materialized views that reference legacy auth:
  - Enumerate with `pg_get_viewdef` then `DROP VIEW ... CASCADE` for matches.
- Drop public functions/procs named like `%auth%`, `%login%`, `%session%`:
  - Dynamically iterate and `DROP FUNCTION IF EXISTS public.<name>(<sig>) CASCADE`.
- Drop constraints/indexes specific to legacy tables:
  - Identify with `pg_indexes`; `DROP INDEX IF EXISTS public.<index> CASCADE`.
- Drop unexpected legacy tables (if any exist):
  - `DROP TABLE IF EXISTS public.auth_sessions CASCADE;`
  - `DROP TABLE IF EXISTS public.login_attempts CASCADE;`
- Verify: re-run Phase 0 queries to confirm zero legacy objects remain.

## Safety & Execution Model
- Run Phase 0 first with the provided credentials; capture outputs.
- For Phase 1, prefer a maintenance window; wrap changes in:
  - `BEGIN;` apply DDL; verify; `COMMIT;` (or `ROLLBACK;` on any issue).
- Keep a schema-only snapshot before changes (`pg_dump --schema-only`).
- Record up/down migration scripts for reversibility.

## Expected Outputs
- Phase 0 tables: only `public.profiles` and `public.email_verifications` (no `user_profiles`, `auth_sessions`, `login_attempts`).
- Triggers: any custom legacy triggers listed; system/default Supabase triggers should be left intact unless clearly custom.
- Functions/types: ideally none matching the legacy patterns.

## After Approval
- I will run the Phase 0 commands using the safe password env var, paste results, and propose exact Phase 1 DDL based on findings. I will not execute any DDL until you explicitly approve Phase 1.