# Quick Fix for "Failed to store verification code" Error

## Problem
The `email_verifications` table has Row Level Security (RLS) enabled but is **missing policies** that allow the Edge Function (using service role) to INSERT verification codes.

## Solution

### Option 1: Apply Migration (Recommended)

```bash
# Apply the new migration
supabase db push

# Or deploy specific migration
supabase migration up
```

### Option 2: Run SQL Directly in Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Run this SQL:

```sql
-- Enable RLS (if not already enabled)
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS email_verifications_service_all ON public.email_verifications;

-- Allow service role full access (needed for Edge Functions)
CREATE POLICY email_verifications_service_all 
  ON public.email_verifications 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Optional: Allow users to view their own codes
DROP POLICY IF EXISTS email_verifications_select_own ON public.email_verifications;

CREATE POLICY email_verifications_select_own 
  ON public.email_verifications 
  FOR SELECT 
  TO authenticated 
  USING (email = auth.jwt()->>'email');
```

5. Click **Run** (or press Ctrl+Enter)

### Option 3: Disable RLS Temporarily (Not Recommended for Production)

```sql
-- WARNING: Only use for testing, not production!
ALTER TABLE public.email_verifications DISABLE ROW LEVEL SECURITY;
```

## Verification

After applying the fix, test the registration flow:

```bash
# Test sending verification email
curl -X POST "https://<your-project>.supabase.co/functions/v1/send-verification-email" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <anon-key>" \
  -d '{"email": "test@example.com", "name": "Test User"}'

# Expected response:
# {"success": true, "message": "Verification code sent successfully"}
```

## Why This Happened

1. Migration `20251113_registration_schema.sql` created `email_verifications` table
2. RLS was enabled on the table (security best practice)
3. **BUT** no policies were added to allow service role access
4. Edge Functions use service role key but couldn't INSERT due to RLS blocking it

## What the Fix Does

- **Service Role Policy**: Allows Edge Functions to INSERT/UPDATE/SELECT verification codes
- **User Policy** (optional): Allows authenticated users to view their own codes
- **Security**: Maintains RLS while allowing necessary operations

## Quick Test

1. Apply the SQL above
2. Open your app
3. Try registering a new user
4. ✅ You should now receive the verification email

---

**Status:** 🔧 Migration created, apply via SQL Editor  
**Time:** ~1 minute  
**Priority:** 🔴 Critical - Blocks all registrations
