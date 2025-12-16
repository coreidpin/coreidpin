# Day 1 - Manual Deployment Guide

## ✅ Files Created:

1. **Migration:** `supabase/migrations/20251215000000_create_user_sessions.sql`
2. **CORS Helper:** `supabase/functions/_shared/cors.ts`
3. **Edge Function:** `supabase/functions/auth-refresh/index.ts`

---

## 📝 Step-by-Step Deployment

### Option 1: Supabase Dashboard (Recommended)

#### Step 1: Apply Migration

1. Go to: **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"**
3. Copy contents of `supabase/migrations/20251215000000_create_user_sessions.sql`
4. Paste into editor
5. Click **"Run"**
6. ✅ Should see: "Success. No rows returned"

#### Step 2: Verify Table Created

Run this query to confirm:
```sql
SELECT * FROM public.user_sessions LIMIT 1;
```

Should return empty result (no sessions yet).

#### Step 3: Check Cron Job

```sql
SELECT * FROM cron.job WHERE jobname = 'cleanup-expired-sessions';
```

Should show the scheduled cleanup job.

---

### Option 2: Enable npx (if you have admin access)

1. Open **PowerShell as Administrator**
2. Run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Confirm with **"Y"**
4. Close admin PowerShell
5. Open regular terminal and try again:
   ```bash
   npx supabase db push
   ```

---

## 🧪 Testing the Migration

After applying, test with these queries:

```sql
-- 1. Verify table exists
\d user_sessions

-- 2. Verify RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_sessions';
-- Should show: true

-- 3. Verify indexes created
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'user_sessions';
-- Should show 3 indexes

-- 4. Test cleanup function
SELECT cleanup_expired_sessions();
-- Should return: void (no error)
```

---

## 🚀 Deploy Edge Function

### Option 1: Supabase CLI (if npx works)

```bash
npx supabase functions deploy auth-refresh
```

### Option 2: Manual via Dashboard

1. Go to **Edge Functions** in Supabase Dashboard
2. Click **"Create Function"**
3. Name: `auth-refresh`
4. Copy code from `supabase/functions/auth-refresh/index.ts`
5. Paste and **Save**
6. Click **"Deploy"**

---

## ✅ Verify Edge Function

Test with curl:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/auth-refresh \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"refreshToken":"test"}'
```

Expected response:
```json
{
  "error": "Invalid refresh token",
  "code": "INVALID_REFRESH_TOKEN"
}
```

This confirms the function is running! ✅

---

## 📋 Day 1 Checklist

- [ ] Migration applied successfully
- [ ] user_sessions table exists
- [ ] RLS enabled on table
- [ ] 3 indexes created
- [ ] Cron job scheduled
- [ ] auth-refresh function deployed
- [ ] Function responds to test request

---

## ⏭️ Next: Day 2

Tomorrow we'll create the SessionManager class in `src/utils/session-manager.ts`.

---

## 🆘 Troubleshooting

**Issue:** Migration fails with "relation already exists"
**Solution:** Table might already exist. Run `DROP TABLE IF EXISTS user_sessions CASCADE;` first.

**Issue:** Cron schedule fails
**Solution:** pg_cron extension might not be enabled. Run `CREATE EXTENSION IF NOT EXISTS pg_cron;`

**Issue:** Edge Function deployment fails  
**Solution:** Check that SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in environment.

---

**Status:** Ready for Day 2 once these tasks complete! 🚀
