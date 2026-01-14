# Phone Verification Error Debug Guide

## Error Overview

```
POST https://evcqpapvcvmljgqiuzsq.supabase.co/functions/v1/server/pin/verify-phone 500 (Internal Server Error)
Error: No OTP found. Please request a new one.
```

## Root Causes Identified

### 1. **OTP Not Being Created**
The "No OTP found" error indicates that when the user tries to verify, there's no OTP record in the `phone_verification_otps` table.

**Possible reasons:**
- User didn't click "Send Code" before trying to verify
- The `sendPhoneOTP` API call failed silently
- Database insertion failed but returned success

### 2. **Phone Number Format Mismatch**
The phone number might be formatted differently when:
- Storing the OTP (e.g., with country code: "+2348012345678")
- Verifying the OTP (e.g., without country code: "08012345678")

Both the send and verify endpoints sanitize the phone number with:
```typescript
const sanitizedPhone = phone.replace(/\D/g, ''); // Removes all non-digits
```

This should work, but input format inconsistencies could still cause issues.

### 3. **OTP Expiration**
OTPs expire after 5 minutes. If the user delays verification, the OTP becomes invalid.

### 4. **Multiple OTP Requests**
If a user requests multiple OTPs, the query might be returning an expired one instead of the latest.

## Current Implementation Flow

### Send OTP (`/server/pin/send-otp`)
```typescript
1. Authenticate user
2. Sanitize phone number (remove non-digits)
3. Check if phone is already used by another account
4. Generate 6-digit OTP
5. Store in database with 5-minute expiration
6. Return success (with dev OTP for testing)
```

###  Verify OTP (`/server/pin/verify-phone`)
```typescript
1. Authenticate user
2. Sanitize phone number
3. Query for latest unused OTP matching user_id + phone_number
4. Check if OTP expired
5. Check attempt limit (max 5)
6. Increment attempts
7. Validate OTP code
8. Mark OTP as used
9. Update profile (phone_verified = true)
10. Log audit event
```

## Solutions

### Immediate Fix: Better Error Handling & Logging

Add more detailed logging to identify the exact failure point:

```typescript
// In verify-phone endpoint
console.log('[VERIFY-PHONE] Request:', {
  user_id: user.id,
  phone_sanitized: sanitizedPhone,
  otp_provided: otp?.substring(0, 2) + '****'
});

const { data: otpRecord, error: fetchError } = await serviceClient
  .from('phone_verification_otps')
  .select('*')
  .eq('user_id', user.id)
  .eq('phone_number', sanitizedPhone)
  .eq('used', false)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

console.log('[VERIFY-PHONE] Query result:', {
  found: !!otpRecord,
  error: fetchError?.message,
  record_id: otpRecord?.id
});
```

### User Experience Improvements

1. **Auto-send OTP on modal open** - Don't wait for user to click "Send Code"
2. **Show expiration timer** - Display countdown from 5 minutes
3. **Auto-resend on expiration** - Offer to resend when timer hits 0
4. **Better error messages** - Tell users exactly what went wrong

### Database Query Improvement

Change the query to be more lenient and provide better feedback:

```typescript
// Get ALL OTPs for this user/phone combo (not just unused ones)
const { data: allOTPs } = await serviceClient
  .from('phone_verification_otps')
  .select('*')
  .eq('user_id', user.id)
  .eq('phone_number', sanitizedPhone)
  .order('created_at', { ascending: false });

if (!allOTPs || allOTPs.length === 0) {
  return c.json({ 
    success: false, 
    error: "No verification code found. Please request a new code.",
    debug: { user_id: user.id, phone_sanitized: sanitizedPhone }
  }, 404);
}

// Find the most recent unused, non-expired OTP
const validOTP = allOTPs.find(otp => 
  !otp.used && 
  new Date(otp.expires_at) > new Date() &&
  otp.attempts < 5
);

if (!validOTP) {
  const latestOTP = allOTPs[0];
  if (latestOTP.used) {
    return c.json({ success: false, error: "This code has already been used. Please request a new one." }, 400);
  }
  if (new Date(latestOTP.expires_at) < new Date()) {
    return c.json({ success: false, error: "Your code has expired. Please request a new one." }, 410);
  }
  if (latestOTP.attempts >= 5) {
    return c.json({ success: false, error: "Too many incorrect attempts. Please request a new code." }, 429);
  }
}
```

## Testing Steps

1. **Check database state:**
   ```sql
   SELECT * FROM phone_verification_otps 
   WHERE user_id = '<your_user_id>' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

2. **Monitor edge function logs** in Supabase Dashboard > Edge Functions > Logs

3. **Check browser console** for the `_dev_otp` value after clicking "Send Code"

4. **Verify phone number format** in both the form and the API calls

## Recommended Actions

1. ✅ Add detailed logging to both endpoints
2. ✅ Improve error messages to be more specific
3. ✅ Auto-send OTP when modal opens
4. ✅ Add expiration timer UI
5. ✅ Query for all OTPs and provide specific error messages based on state
