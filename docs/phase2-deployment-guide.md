# Phase 2: Deployment and Testing Guide

## Pre-Deployment Checklist

### ✅ Code Changes Complete

**Frontend Components:**
- [x] EmailVerificationGate.tsx - Updated to PIN-only flow with cooldown
- [x] RegistrationFlow.tsx - Shows verification gate after registration
- [x] LoginDialog.tsx - Blocks login for unverified users
- [x] api.ts - Has sendVerificationEmail() and verifyEmailCode() methods

**Backend Functions:**
- [x] send-verification-email/index.ts - Added KV rate limiting (1 min)
- [x] verify-email-code/index.ts - Updates auth.users.email_confirmed_at

**Tests:**
- [x] email-verification.test.ts - 8 test suites, 40+ test cases

**Documentation:**
- [x] phase2-email-verification-summary.md - Complete implementation guide

---

## Deployment Steps

### Step 1: Start Docker Desktop

Before deploying Supabase functions, ensure Docker is running:

```powershell
# Check if Docker is running
docker --version

# If not running, start Docker Desktop application
# Wait for Docker to fully start (whale icon in system tray)
```

### Step 2: Link Supabase Project

```powershell
# Ensure you're in the project root
cd C:\Users\Akinrodolu Seun\Documents\GitHub\CoreID

# Link to Supabase project
supabase link --project-ref evcqpapvcvmljgqiuzsq
```

### Step 3: Deploy Backend Functions

```powershell
# Deploy send-verification-email with rate limiting
supabase functions deploy send-verification-email --project-ref evcqpapvcvmljgqiuzsq --no-verify-jwt

# Expected output:
# Deploying function send-verification-email...
# Deployed send-verification-email (vX.X.X)

# Deploy verify-email-code with auth update
supabase functions deploy verify-email-code --project-ref evcqpapvcvmljgqiuzsq --no-verify-jwt

# Expected output:
# Deploying function verify-email-code...
# Deployed verify-email-code (vX.X.X)
```

### Step 4: Verify Function Deployments

```powershell
# List all deployed functions
supabase functions list --project-ref evcqpapvcvmljgqiuzsq

# Expected output:
# NAME                      VERSION   STATUS
# send-verification-email   vX.X.X    ACTIVE
# verify-email-code         vX.X.X    ACTIVE
# server                    vX.X.X    ACTIVE
```

### Step 5: Test Email Sending

```powershell
# Test send-verification-email function
$headers = @{
    "Content-Type" = "application/json"
    "apikey" = "YOUR_SUPABASE_ANON_KEY"
}

$body = @{
    email = "test@example.com"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://evcqpapvcvmljgqiuzsq.supabase.co/functions/v1/send-verification-email" -Method Post -Headers $headers -Body $body
```

Expected response:
```json
{
  "success": true,
  "message": "Verification code sent successfully",
  "emailId": "re_xxxxx"
}
```

### Step 6: Test Code Verification

First, retrieve the code from the database:

```sql
-- Run in Supabase SQL Editor
SELECT code, expires_at, verified 
FROM email_verifications 
WHERE email = 'test@example.com' 
ORDER BY created_at DESC 
LIMIT 1;
```

Then test verification:

```powershell
$verifyBody = @{
    email = "test@example.com"
    code = "123456"  # Replace with actual code from DB
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://evcqpapvcvmljgqiuzsq.supabase.co/functions/v1/verify-email-code" -Method Post -Headers $headers -Body $verifyBody
```

Expected response:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Step 7: Test Rate Limiting

```powershell
# Send first code
Invoke-RestMethod -Uri "https://evcqpapvcvmljgqiuzsq.supabase.co/functions/v1/send-verification-email" -Method Post -Headers $headers -Body $body

# Immediately send second code (should fail)
Invoke-RestMethod -Uri "https://evcqpapvcvmljgqiuzsq.supabase.co/functions/v1/send-verification-email" -Method Post -Headers $headers -Body $body
```

Expected second response (429 status):
```json
{
  "error": "Rate limit exceeded. Please wait 58 seconds before requesting another code.",
  "remainingSeconds": 58
}
```

### Step 8: Build and Deploy Frontend

```powershell
# Build the frontend
npm run build

# Verify build succeeded
ls build/

# Deploy to Vercel (or your hosting platform)
vercel deploy --prod

# Or push to GitHub to trigger automatic deployment
git add .
git commit -m "feat: Phase 2 - Email verification flow with rate limiting"
git push origin main
```

---

## Manual Testing Checklist

### 1. Registration Flow

**Steps:**
1. Navigate to https://yourapp.com
2. Click "Get Started" or "Sign Up"
3. Fill in registration form:
   - Name: Test User Phase 2
   - Email: phase2test@example.com
   - Password: TestPhase2!@#
   - Complete all 4 steps
4. Submit registration

**Expected Results:**
- [x] Registration succeeds with success toast
- [x] EmailVerificationGate component appears
- [x] Email is sent to phase2test@example.com
- [x] Email contains 6-digit code
- [x] Cooldown timer starts at 60 seconds
- [x] "Resend Code" button is disabled

**Screenshot Checklist:**
- [ ] Registration success screen
- [ ] EmailVerificationGate component
- [ ] Email in inbox with code

### 2. Email Verification

**Steps:**
1. Check email inbox for verification code
2. Note the 6-digit code (e.g., 123456)
3. Enter code in verification gate
4. Click "Verify" button

**Expected Results:**
- [x] Code input accepts 6 digits
- [x] Verify button enabled when 6 digits entered
- [x] Success toast: "Email verified successfully!"
- [x] Redirected to login page
- [x] User's email_confirmed_at is set in database

**Database Check:**
```sql
SELECT email_confirmed_at 
FROM auth.users 
WHERE email = 'phase2test@example.com';
```

Expected: Timestamp (not null)

### 3. Resend Functionality

**Steps:**
1. Register a new user: resendtest@example.com
2. Wait for EmailVerificationGate to appear
3. Immediately click "Resend Code"
4. Observe error message
5. Wait for cooldown (60 seconds)
6. Click "Resend Code" again

**Expected Results:**
- [x] First click shows error: "Please wait X seconds..."
- [x] Cooldown timer counts down (59, 58, 57...)
- [x] "Resend Code" button disabled during cooldown
- [x] After 60 seconds, button becomes enabled
- [x] Second click sends new code successfully
- [x] New email received in inbox
- [x] Cooldown resets to 60 seconds

**Email Inbox Check:**
- [ ] First email received
- [ ] Wait 60 seconds
- [ ] Second email received
- [ ] Both emails have different codes

### 4. Error Handling - Invalid Code

**Steps:**
1. Register user: invalidtest@example.com
2. Enter wrong code: 999999
3. Click "Verify"

**Expected Results:**
- [x] Error toast: "Invalid or expired verification code"
- [x] Code input clears
- [x] User remains on verification gate
- [x] Can try again with correct code

### 5. Error Handling - Expired Code

**Steps:**
1. Register user: expiredtest@example.com
2. In database, set expires_at to past time:
   ```sql
   UPDATE email_verifications 
   SET expires_at = NOW() - INTERVAL '1 hour' 
   WHERE email = 'expiredtest@example.com';
   ```
3. Enter the code
4. Click "Verify"

**Expected Results:**
- [x] Error toast: "Verification code has expired. Please request a new one."
- [x] Code input clears
- [x] User can click "Resend Code" to get new code

### 6. Error Handling - Reused Code

**Steps:**
1. Register user: reusetest@example.com
2. Verify email with code successfully
3. Try to use the same code again (in a new session)

**Expected Results:**
- [x] Error toast: "Invalid or expired verification code"
- [x] Code marked as verified=true in database
- [x] Cannot be reused

**Database Check:**
```sql
SELECT verified 
FROM email_verifications 
WHERE email = 'reusetest@example.com' 
ORDER BY created_at DESC 
LIMIT 1;
```

Expected: `verified = true`

### 7. Login Prevention Before Verification

**Steps:**
1. Register user: noverify@example.com
2. DO NOT verify email
3. Navigate to login page
4. Enter credentials:
   - Email: noverify@example.com
   - Password: TestPassword123!
5. Click "Log In"

**Expected Results:**
- [x] Login fails
- [x] Error message: "Email not verified. Please check your inbox for the verification code or request a new one."
- [x] User not logged in
- [x] No session tokens in localStorage

### 8. Login Success After Verification

**Steps:**
1. Register user: successlogin@example.com
2. Verify email with code
3. Navigate to login page
4. Enter credentials:
   - Email: successlogin@example.com
   - Password: TestPassword123!
5. Click "Log In"

**Expected Results:**
- [x] Login succeeds
- [x] Success toast: "You have successfully logged in"
- [x] Redirected to dashboard
- [x] Session tokens in localStorage:
  - accessToken
  - userId
  - userType

### 9. Rate Limiting - Multiple Resends

**Steps:**
1. Register user: ratelimit@example.com
2. Click "Resend Code" (should fail - cooldown)
3. Wait 65 seconds
4. Click "Resend Code" (should succeed)
5. Immediately click "Resend Code" again (should fail)

**Expected Results:**
- [x] First resend: Error with countdown
- [x] After 60s: Success, new code sent
- [x] Immediate retry: Error with new countdown
- [x] Only 2 emails received total

### 10. Cancel Verification Flow

**Steps:**
1. Register user: canceltest@example.com
2. On EmailVerificationGate, click "Cancel" button (if present)
3. Observe behavior

**Expected Results:**
- [x] User redirected to login or home page
- [x] Info toast: "You can verify your email later from the login page."
- [x] Email remains unverified

---

## Browser Testing

Test in multiple browsers:

- [ ] **Chrome** (Windows)
- [ ] **Firefox** (Windows)
- [ ] **Edge** (Windows)
- [ ] **Safari** (macOS/iOS)
- [ ] **Chrome Mobile** (Android)
- [ ] **Safari Mobile** (iOS)

---

## Database Verification Queries

### Check Verification Codes

```sql
-- View all verification codes for testing
SELECT 
  email,
  code,
  verified,
  expires_at,
  created_at,
  CASE 
    WHEN verified = true THEN 'Used'
    WHEN expires_at < NOW() THEN 'Expired'
    ELSE 'Valid'
  END as status
FROM email_verifications
ORDER BY created_at DESC
LIMIT 20;
```

### Check Email Confirmation Status

```sql
-- Check which users have verified emails
SELECT 
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN 'Not Verified'
    ELSE 'Verified'
  END as verification_status,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;
```

### Check Rate Limiting (KV Store)

Since Deno KV is not directly queryable from SQL, check rate limiting by:
1. Sending verification email
2. Immediately trying to resend
3. Observing the error message with remaining seconds

---

## Performance Testing

### Load Test - Concurrent Registrations

```powershell
# Test concurrent registrations
$users = 1..10
$users | ForEach-Object -Parallel {
    $email = "loadtest$($_)@example.com"
    $body = @{
        email = $email
        password = "TestLoad123!"
        name = "Load Test User $_"
        userType = "professional"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "https://yourapp.com/api/register" -Method Post -Body $body -ContentType "application/json"
} -ThrottleLimit 10
```

**Expected:**
- All 10 registrations succeed
- All 10 verification emails sent
- No rate limit errors (different emails)

### Load Test - Rate Limiting

```powershell
# Test rate limiting with same email
$attempts = 1..5
$email = "ratelimitload@example.com"

$attempts | ForEach-Object {
    $body = @{
        email = $email
        name = "Rate Limit Test"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "https://evcqpapvcvmljgqiuzsq.supabase.co/functions/v1/send-verification-email" -Method Post -Body $body -ContentType "application/json"
        Write-Host "Attempt $_: Success"
    } catch {
        Write-Host "Attempt $_: Rate Limited"
    }

    Start-Sleep -Seconds 15
}
```

**Expected:**
- First attempt: Success
- Attempts 2-4: Rate limited (within 60s)
- Attempt 5 (after 60s): Success

---

## Monitoring and Logging

### View Function Logs

```powershell
# View send-verification-email logs
supabase functions logs send-verification-email --project-ref evcqpapvcvmljgqiuzsq

# View verify-email-code logs
supabase functions logs verify-email-code --project-ref evcqpapvcvmljgqiuzsq
```

**What to Look For:**
- ✅ Successful code generation
- ✅ Successful email sending (Resend API)
- ✅ Rate limit triggers
- ✅ Code verification success/failure
- ⚠️ Any 500 errors
- ⚠️ Database connection issues

### Resend Dashboard

Check email delivery:
1. Log in to https://resend.com/dashboard
2. Navigate to "Emails" tab
3. Verify:
   - [ ] Emails are being sent
   - [ ] Delivery rate > 99%
   - [ ] No bounces or complaints

---

## Troubleshooting

### Issue: Emails Not Received

**Check:**
1. Resend API key is correct in env vars
2. FROM_EMAIL is verified in Resend
3. User's email is valid (not disposable)
4. Check spam folder
5. View Resend dashboard for delivery status

**Fix:**
```powershell
# Check env vars
supabase functions deploy send-verification-email --project-ref evcqpapvcvmljgqiuzsq --debug
```

### Issue: Rate Limiting Not Working

**Check:**
1. Deno KV is accessible
2. KV key format is correct: `rate_limit:verification:{email}`
3. Expiry is set: 60 seconds

**Debug:**
```typescript
// Add console logs in send-verification-email/index.ts
console.log('Rate limit check:', rateLimitEntry.value);
console.log('Time since last send:', timeSinceLastSent);
```

### Issue: Email Confirmed But Login Still Fails

**Check:**
1. `email_confirmed_at` is set in auth.users
2. No caching issues in browser
3. User is using correct credentials

**Query:**
```sql
SELECT email, email_confirmed_at 
FROM auth.users 
WHERE email = 'problem@example.com';
```

**Fix:**
```sql
-- Manually confirm email if needed
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'problem@example.com';
```

### Issue: Verification Code Not Found

**Check:**
1. Code exists in email_verifications table
2. Code is not expired
3. Code is not already used (verified=true)

**Query:**
```sql
SELECT * FROM email_verifications 
WHERE email = 'user@example.com' 
ORDER BY created_at DESC;
```

---

## Success Criteria

Before marking Phase 2 as complete, verify:

- [ ] ✅ Registration triggers verification email automatically
- [ ] ✅ EmailVerificationGate appears after registration
- [ ] ✅ Users receive 6-digit code via email within 5 seconds
- [ ] ✅ Valid codes verify successfully
- [ ] ✅ Invalid codes show error message
- [ ] ✅ Expired codes (>15 min) show error message
- [ ] ✅ Reused codes show error message
- [ ] ✅ Rate limiting enforces 1-minute cooldown
- [ ] ✅ Resend functionality works after cooldown
- [ ] ✅ Countdown timer shows remaining seconds
- [ ] ✅ Login is blocked for unverified users
- [ ] ✅ Login succeeds for verified users
- [ ] ✅ All integration tests pass
- [ ] ✅ No console errors in browser
- [ ] ✅ Mobile responsive
- [ ] ✅ Accessible (keyboard navigation, screen readers)

---

## Post-Deployment

### 1. Monitor Initial Usage

**For first 24 hours:**
- Check Resend delivery rate (should be > 99%)
- Monitor function error rates (should be < 1%)
- Review user feedback/support tickets
- Check database growth (email_verifications table)

### 2. Set Up Database Cleanup

**Create scheduled job to delete old codes:**

```sql
-- In Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-old-verification-codes',
  '0 2 * * *',  -- 2 AM daily
  $$
  DELETE FROM email_verifications 
  WHERE expires_at < NOW() - INTERVAL '24 hours'
  $$
);
```

### 3. Analytics Tracking

**Add events to track:**
- `verification_code_sent`
- `verification_code_verified`
- `verification_failed_invalid_code`
- `verification_failed_expired`
- `verification_rate_limited`
- `login_blocked_unverified`

### 4. User Communication

**Update documentation:**
- Add "Email Verification" section to user guide
- FAQ: "What if I don't receive the code?"
- FAQ: "How long is the code valid?"
- FAQ: "Can I resend the code?"

---

## Rollback Procedure

If critical issues are discovered:

### 1. Immediate Rollback

```powershell
# Revert frontend to previous version
git revert HEAD
git push origin main

# This triggers automatic redeployment of previous version
```

### 2. Temporary Bypass

```typescript
// In LoginDialog.tsx, comment out verification check
// if (!data.user.email_confirmed_at) {
//   throw new Error('Email not verified...');
// }

// Rebuild and deploy
npm run build
vercel deploy --prod
```

### 3. Full Rollback

```powershell
# Revert all Phase 2 changes
git revert <commit-hash-phase2>
git push origin main

# Redeploy old backend functions
git checkout <previous-commit> -- supabase/functions/
supabase functions deploy send-verification-email --project-ref evcqpapvcvmljgqiuzsq
supabase functions deploy verify-email-code --project-ref evcqpapvcvmljgqiuzsq
```

---

## Completion Checklist

Mark Phase 2 as complete when:

- [x] ✅ All code changes committed and pushed
- [ ] ✅ Backend functions deployed successfully
- [ ] ✅ Frontend deployed to production
- [ ] ✅ Manual testing completed (all scenarios pass)
- [ ] ✅ Database cleanup job configured
- [ ] ✅ Monitoring and logging in place
- [ ] ✅ Documentation updated
- [ ] ✅ Team trained on new flow
- [ ] ✅ Analytics tracking implemented
- [ ] ✅ First week of production monitoring complete

---

**Status:** 🔄 Ready for Deployment and Testing  
**Next Phase:** Phase 3 - Session Management and Token Refresh  
**Prepared by:** GitHub Copilot  
**Last Updated:** November 12, 2025
