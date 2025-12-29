# 📱 Phone Verification - UI & Flow Documentation

**Date:** December 28, 2025  
**Status:** UI Added - Ready for Backend Integration  
**Location:** Identity Management Page

---

## 📍 **Where to Find the Verification UI**

### **Location:**
**Page:** `/identity-management`  
**Section:** "Contact Identity" → "Phone Number"  
**Component:** `IdentityManagementPage.tsx` (Line 1707-1735)

### **UI Elements:**

```
┌─────────────────────────────────────────┐
│ Phone Number                   [Badge]  │
│                                          │
│ [📱] +234 801 234 5678        [✏️]     │
│ This is your unique identifier on GidiPIN│
└─────────────────────────────────────────┘
```

**When Phone is NOT Verified:**
```
Phone Number    [⚠ Unverified] [Verify Now]
                  ^amber badge    ^blue button
```

**When Phone IS Verified:**
```
Phone Number    [✓ Verified]
                  ^green badge
```

---

## 🎨 **Current UI Implementation**

### **Verification Button:**

**Appears when:**
- ✅ User has a phone number entered
- ✅ Phone is NOT verified (`profile.phone_verified = false`)

**Looks like:**
- Small blue text button
- Says "Verify Now"
- Positioned next to "Unverified" badge

**Current behavior:**
```typescript
onClick={() => {
  toast.info('Phone verification coming soon!', {
    description: 'We\'ll send an OTP to verify your phone number.'
  });
}}
```

---

## 🔄 **Recommended Verification Flow**

### **Step-by-Step Process:**

```
1. User enters phone number
   ↓
2. User clicks "Verify Now" button
   ↓
3. Modal opens: "Verify Phone Number"
   ↓
4. System sends OTP via SMS
   ↓
5. User enters 6-digit code
   ↓
6. System validates code
   ↓
7. If valid: Set phone_verified = true
   ↓
8. Badge changes to "✓ Verified"
   Button disappears
```

---

## 💻 **Backend Requirements**

### **1. Send OTP Endpoint**

**Endpoint:** `POST /phone/send-otp`

**Request:**
```json
{
  "phoneNumber": "+234 801 234 5678",
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

**What it should do:**
- Generate 6-digit random code
- Store code in database with expiry (5 minutes)
- Send SMS to phone number
- Return success

---

### **2. Verify OTP Endpoint**

**Endpoint:** `POST /phone/verify-otp`

**Request:**
```json
{
  "phoneNumber": "+234 801 234 5678",
  "otp": "123456",
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Phone verified successfully"
}
```

**What it should do:**
- Check OTP matches stored code
- Check OTP not expired
- Update `profiles.phone_verified = true`
- Invalidate used OTP
- Return success

---

## 🗄️ **Database Schema**

### **Existing Field to Update:**

**Table:** `profiles`

```sql
-- This field should be set to true after successful verification
phone_verified BOOLEAN DEFAULT false
```

### **Optional: OTP Storage Table**

**Table:** `phone_verification_otps`

```sql
CREATE TABLE phone_verification_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  attempts INT DEFAULT 0
);
```

---

## 🎯 **Implementation Plan**

### **Phase 1: Frontend Modal (Next Step)**

Add verification modal to `IdentityManagementPage.tsx`:

```typescript
// 1. Add state for modal
const [showPhoneVerifyModal, setShowPhoneVerifyModal] = useState(false);
const [otpCode, setOtpCode] = useState('');
const [sendingOTP, setSendingOTP] = useState(false);
const [verifyingOTP, setVerifyingOTP] = useState(false);

// 2. Update button onClick
onClick={() => setShowPhoneVerifyModal(true)}

// 3. Add modal component
<Dialog open={showPhoneVerifyModal} onOpenChange={setShowPhoneVerifyModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Verify Phone Number</DialogTitle>
    </DialogHeader>
    
    <p>We'll send a verification code to {formData.phone}</p>
    
    <Input
      placeholder="Enter 6-digit code"
      value={otpCode}
      onChange={(e) => setOtpCode(e.target.value)}
      maxLength={6}
    />
    
    <DialogFooter>
      <Button onClick={handleSendOTP}>Send Code</Button>
      <Button onClick={handleVerifyOTP}>Verify</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### **Phase 2: API Client Methods**

Add to `src/utils/api.ts`:

```typescript
async sendPhoneOTP(phoneNumber: string, userId: string, accessToken: string) {
  const response = await this.fetchWithRetry(`${BASE_URL}/phone/send-otp`, {
    method: 'POST',
    headers: this.getHeaders(accessToken),
    body: JSON.stringify({ phoneNumber, userId })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send OTP');
  }
  
  return response.json();
}

async verifyPhoneOTP(phoneNumber: string, otp: string, userId: string, accessToken: string) {
  const response = await this.fetchWithRetry(`${BASE_URL}/phone/verify-otp`, {
    method: 'POST',
    headers: this.getHeaders(accessToken),
    body: JSON.stringify({ phoneNumber, otp, userId })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Invalid OTP');
  }
  
  return response.json();
}
```

---

### **Phase 3: Backend Endpoints**

Add to `src/supabase/functions/server/index.tsx`:

```typescript
// Send OTP
app.post("/make-server-5cd3a043/phone/send-otp", async (c) => {
  const { phoneNumber, userId } = await c.req.json();
  
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  
  // Store in database
  await supabase.from('phone_verification_otps').insert({
    user_id: userId,
    phone_number: phoneNumber,
    otp_code: otp,
    expires_at: expiresAt
  });
  
  // Send SMS (integrate with SMS provider)
  await sendSMS(phoneNumber, `Your verification code is: ${otp}`);
  
  return c.json({ success: true, expiresIn: 300 });
});

// Verify OTP
app.post("/make-server-5cd3a043/phone/verify-otp", async (c) => {
  const { phoneNumber, otp, userId } = await c.req.json();
  
  // Check OTP
  const { data: otpRecord } = await supabase
    .from('phone_verification_otps')
    .select('*')
    .eq('user_id', userId)
    .eq('phone_number', phoneNumber)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (!otpRecord || otpRecord.otp_code !== otp) {
    return c.json({ error: 'Invalid OTP' }, 400);
  }
  
  if (new Date(otpRecord.expires_at) < new Date()) {
    return c.json({ error: 'OTP expired' }, 400);
  }
  
  // Mark as used
  await supabase
    .from('phone_verification_otps')
    .update({ used: true })
    .eq('id', otpRecord.id);
  
  // Update profile
  await supabase
    .from('profiles')
    .update({ phone_verified: true })
    .eq('user_id', userId);
  
  return c.json({ success: true });
});
```

---

## 📱 **SMS Provider Integration**

### **Options:**

1. **Twilio** - Most popular
2. **African's Talking** - Africa-focused
3. **Termii** - Nigeria-focused
4. **Supabase Edge Functions** - Can integrate any provider

### **Example (Twilio):**

```typescript
async function sendSMS(phoneNumber: string, message: string) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const from = Deno.env.get('TWILIO_PHONE_NUMBER');
  
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: phoneNumber,
        From: from,
        Body: message
      })
    }
  );
  
  return response.json();
}
```

---

## ✅ **Current Status**

| Component | Status | Notes |
|-----------|--------|-------|
| **UI Button** | ✅ Complete | Shows next to "Unverified" badge |
| **Badge Logic** | ✅ Complete | Shows verified/unverified dynamically |
| **Modal UI** | ⏳ Pending | Need to add OTP input modal |
| **API Methods** | ⏳ Pending | Need to add to api.ts |
| **Backend** | ⏳ Pending | Need to create endpoints |
| **SMS Provider** | ⏳ Pending | Need to choose and integrate |
| **Database** | ✅ Ready | `phone_verified` field exists |

---

## 🎯 **Quick Start Guide**

### **To Test Current UI:**

1. Go to `/identity-management`
2. Scroll to "Contact Identity" section
3. If phone is unverified, you'll see:
   - Amber "Unverified" badge
   - Blue "Verify Now" button
4. Click "Verify Now"
5. See toast notification (placeholder)

---

## 📝 **Next Steps**

**To fully implement phone verification:**

1. ✅ ~~Add "Verify Now" button~~ (DONE!)
2. ⏳ Add verification modal with OTP input
3. ⏳ Create API client methods
4. ⏳ Create backend endpoints
5. ⏳ Integrate SMS provider
6. ⏳ Test end-to-end flow

**Estimated Time:** 2-3 hours for full implementation

---

## 💡 **Tips**

- Test with a real SMS provider or use console.log for testing
- Add rate limiting (max 3 OTPs per hour per phone)
- Set OTP expiry to 5 minutes
- Allow only 5 attempts per OTP
- Send confirmation email after successful verification

Would you like me to implement the full verification flow?
