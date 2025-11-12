# Supabase Edge Function Deployment Guide

This project includes a Supabase Edge Function that powers authentication, AI analysis, professional search, matching, and key–value storage. Follow these steps to configure secrets, apply migrations, and deploy.

## Prerequisites
- Supabase CLI installed: `npm i -g supabase`
- A Supabase project (project ref used here: `evcqpapvcvmljgqiuzsq`)
- Access to your project’s service role key and anon key from the Supabase dashboard

## 1) Login and Link the Project
- Login: `supabase login`
- Link to the project: `supabase link --project-ref evcqpapvcvmljgqiuzsq`

## 2) Configure Function Secrets
The Edge Function relies on these environment variables:
- `SUPABASE_URL` (e.g., `https://evcqpapvcvmljgqiuzsq.supabase.co`)
- `SUPABASE_ANON_KEY` (or `SUPABASE_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SERVICE_KEY`)
- `OPENAI_API_KEY` (optional; enables real AI analysis, otherwise mock analysis is used)
- `ENCRYPTION_KEY_BASE64` (optional; 32-byte AES key in base64 for encrypting audit/login history)

Set them using Supabase CLI secrets:

```
supabase secrets set \
  SUPABASE_URL=https://evcqpapvcvmljgqiuzsq.supabase.co \
  SUPABASE_ANON_KEY=<your-anon-key> \
  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> \
  OPENAI_API_KEY=<your-openai-key> \
  ENCRYPTION_KEY_BASE64=<base64-encoded-32-byte-key>
```

Notes:
- `envCheck.tsx` validates these values on startup; missing or malformed values will cause the function to fail fast.
- `OPENAI_API_KEY` is optional. Without it, profile analysis returns a mock payload for testing.
- `ENCRYPTION_KEY_BASE64` enables AES-GCM encryption for audit and login history entries stored in the KV table. If omitted, values are stored as plain JSON.

## 3) Apply Database Migrations
Run from the repository root to apply SQL migrations (including the `kv_store_5cd3a043` table):

```
supabase db push
```

The KV table is created with strict RLS (service role only) and a GIN index on the `value` column for JSONB operations. See `supabase/migrations/20251111120000_kv_store.sql`.

## 4) Deploy the Edge Function
The current function folder is `supabase/functions/server`. Deploy it with:

```
supabase functions deploy server
```

This exposes endpoints at:
- `https://<ref>.supabase.co/functions/v1/server/health`
- `https://<ref>.supabase.co/functions/v1/server/validate-registration`
- `https://<ref>.supabase.co/functions/v1/server/register` (via auth router)
- `https://<ref>.supabase.co/functions/v1/server/login` (via auth router)
- `https://<ref>.supabase.co/functions/v1/server/ai/match-talent`
- `https://<ref>.supabase.co/functions/v1/server/ai/compliance-check`
- `https://<ref>.supabase.co/functions/v1/server/professionals` and `/search`
- `https://<ref>.supabase.co/functions/v1/server/profile/...`
- Matching endpoints mounted at root: `/recommendations`, `/swipe`, `/matches`, `/matches/:matchId/status`, `/matches/:matchId/messages`

### Important: Function Name vs Frontend BASE_URL
The frontend should target `https://<ref>.supabase.co/functions/v1/server`.

If you previously referenced `make-server-5cd3a043`, update the frontend `BASE_URL` in `src/utils/api.ts` to use `server` to avoid 404s.

## 5) Test Locally (Optional)
You can run the function locally for quick checks:

```
supabase functions serve server
```

Then test endpoints, for example:

```
curl -i "http://localhost:54321/functions/v1/server/health"
```

## 6) Useful Commands
- List secrets: `supabase secrets list`
- Re-deploy after changes: `supabase functions deploy server`
- View logs (Dashboard > Functions > Logs) for runtime errors

## Troubleshooting
- 401 Unauthorized: Ensure requests include `Authorization: Bearer <accessToken>` when required.
- 403 CSRF: Login endpoint requires `X-CSRF-Token` header.
- 500 errors during AI calls: Verify `OPENAI_API_KEY` is set; otherwise mock analysis is returned by the profile analyzer.
- Route not found: Confirm router mounts in `supabase/functions/server/index.tsx` and verify the function name used in the URL.

---
With these steps, your Edge Function, KV store, and routes should deploy and operate correctly on Supabase.