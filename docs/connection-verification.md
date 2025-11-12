# Supabase Connection Verification

## Environment
- Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY`
- Optional: `SUPABASE_ANON_KEY`, `SUPABASE_KEY`, `OPENAI_API_KEY`

## Client Initialization
- Frontend client: `src/utils/supabase/client.ts`
- Backend client: `supabase/functions/server/lib/supabaseClient.tsx`

## RLS
- Policies on `public.app_users`, `public.profiles`, `public.login_history`
- Frontend reads require a valid user token; backend can use service role.

## Diagnostics Endpoints
- `GET /functions/v1/server/server/diagnostics/health`
- `GET /functions/v1/server/server/diagnostics/users/:id`
- `GET /functions/v1/server/server/diagnostics/app-users/:id`

## Test Procedure
1. Ensure `.env` variables are set for frontend and backend.
2. Call health and diagnostics endpoints.
3. Fetch a known user via `users/:id`.
4. Fetch `app_users/:id` and validate row access.
5. Review logs for errors and status codes.

## Notes
- Vite proxy forwards `/functions/v1/*` to `VITE_SUPABASE_URL`.
- Frontend requests include `Authorization` and `apikey` headers.
