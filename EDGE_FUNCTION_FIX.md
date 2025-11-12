# Edge Function Fix - Deno.openKv Error

## Problem

The `send-verification-email` Edge Function was using `Deno.openKv()` which is **not available** in Supabase Edge Functions runtime. This caused the error:

```
Error: Deno.openKv is not a function
```

## Solution

**Changed:** Replaced Deno KV-based rate limiting with Supabase database queries.

**File:** `supabase/functions/send-verification-email/index.ts`

### What Changed

**Before (using Deno KV - ❌ Not Available):**
```typescript
const rateLimitKey = `rate_limit:verification:${email}`;
const kv = await Deno.openKv(); // ❌ This fails!

const rateLimitEntry = await kv.get([rateLimitKey]);
if (rateLimitEntry.value) {
  // Check rate limit...
}
```

**After (using Supabase database - ✅ Works):**
```typescript
// Query recent verification emails from database
const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

const { data: recentVerifications } = await supabase
  .from('email_verifications')
  .select('created_at')
  .eq('email', email)
  .gte('created_at', oneMinuteAgo)
  .order('created_at', { ascending: false })
  .limit(1);
```

## How to Deploy the Fix

### Option 1: Using Supabase CLI (Recommended)

```bash
# 1. Install Supabase CLI (if not already installed)
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link to your project
supabase link --project-ref <your-project-ref>

# 4. Deploy the function
supabase functions deploy send-verification-email

# 5. Verify deployment
supabase functions list
```

### Option 2: Using Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Edge Functions**
4. Click on `send-verification-email` function
5. Click **"Deploy new version"**
6. Upload the updated file: `supabase/functions/send-verification-email/index.ts`
7. Click **Deploy**

### Option 3: Manual Deployment Script

```bash
# Set your project reference
PROJECT_REF="your-project-ref"

# Deploy using curl (requires Supabase access token)
curl -X POST "https://api.supabase.com/v1/projects/$PROJECT_REF/functions/send-verification-email/deploy" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @supabase/functions/send-verification-email/index.ts
```

## Testing After Deployment

### Test 1: Send Verification Email

```bash
# Using curl
curl -X POST "https://<project-ref>.supabase.co/functions/v1/send-verification-email" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-anon-key>" \
  -d '{"email": "test@example.com", "name": "Test User"}'

# Expected response:
# {"success": true, "message": "Verification code sent successfully", "emailId": "..."}
```

### Test 2: Rate Limiting

```bash
# Send first request
curl -X POST "https://<project-ref>.supabase.co/functions/v1/send-verification-email" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-anon-key>" \
  -d '{"email": "test@example.com"}'

# Immediately send second request (should be rate limited)
curl -X POST "https://<project-ref>.supabase.co/functions/v1/send-verification-email" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-anon-key>" \
  -d '{"email": "test@example.com"}'

# Expected response:
# {"error": "Rate limit exceeded. Please wait 60 seconds...", "remainingSeconds": 60}
```

### Test 3: Full Registration Flow

1. Open your application
2. Go to registration page
3. Fill in registration form
4. Submit registration
5. ✅ Email verification code should be sent successfully
6. Check email inbox for 6-digit code
7. Enter code and verify

## Environment Variables Required

Ensure these environment variables are set in Supabase Dashboard → Project Settings → Edge Functions:

```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
RESEND_API_KEY=<your-resend-api-key>
FROM_EMAIL=no-reply@coreid.com
```

## Rate Limiting Behavior

**New Implementation:**
- Uses `email_verifications` table to track recent sends
- Allows 1 email per 60 seconds per email address
- Checks `created_at` timestamp within last 60 seconds
- Returns `429 Rate Limit Exceeded` if too soon

**Advantages:**
- ✅ Works in Supabase Edge Functions (no Deno KV needed)
- ✅ Persists rate limit data across function instances
- ✅ Easy to query and monitor in database
- ✅ Automatic cleanup via table retention policies

## Verification Flow

```
User Registration
    ↓
POST /send-verification-email
    ↓
Check rate limit (query email_verifications table)
    ↓
Generate 6-digit code
    ↓
Store in email_verifications (expires in 15 min)
    ↓
Send email via Resend API
    ↓
Return success
```

## Troubleshooting

### Issue: Function still fails after deployment

**Solution:**
1. Check Supabase Dashboard → Edge Functions → Logs
2. Verify environment variables are set
3. Ensure `email_verifications` table exists (run migration)
4. Check Resend API key is valid

### Issue: Rate limiting not working

**Solution:**
1. Check database has `email_verifications` table
2. Verify `created_at` column exists
3. Check table has index on `email` and `created_at`
4. Query table directly to see rate limit entries:
   ```sql
   SELECT * FROM email_verifications 
   WHERE email = 'test@example.com' 
   ORDER BY created_at DESC;
   ```

### Issue: Emails not sending

**Solution:**
1. Verify `RESEND_API_KEY` is set in Edge Function environment
2. Check Resend Dashboard → Logs for delivery status
3. Verify `FROM_EMAIL` domain is configured in Resend
4. Check Resend quota hasn't been exceeded

## Database Migration (If Needed)

If `email_verifications` table doesn't exist, create it:

```sql
CREATE TABLE IF NOT EXISTS public.email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_verifications_email_idx 
  ON public.email_verifications(email);

CREATE INDEX IF NOT EXISTS email_verifications_created_at_idx 
  ON public.email_verifications(created_at DESC);
```

## Next Steps

1. ✅ **Deploy the function** using one of the methods above
2. ✅ **Test the fix** using the test cases
3. ✅ **Monitor logs** in Supabase Dashboard for any errors
4. ✅ **Update todo list** to mark "Deploy to staging" as next task
5. ✅ **Proceed with QA validation** from `docs/qa-quick-start-guide.md`

---

**Status:** 🔧 Fix implemented, awaiting deployment  
**Priority:** 🔴 Critical - Blocks registration workflow  
**Deployment Time:** ~5 minutes
