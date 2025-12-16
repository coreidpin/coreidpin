# Week 3, Day 14 - Token Refresh Mechanism (Part 1)
**Date:** December 16, 2024  
**Focus:** Token Refresh Infrastructure  
**Status:** 🚧 In Progress

---

## 📋 Day 14 Objectives

1. ✅ Review existing user_sessions table
2. 🔄 Create auth-refresh Edge Function
3. 🔄 Implement token validation logic
4. 🔄 Test refresh flow
5. 🔄 Document API endpoints

---

## ✅ What We Have Already

### User Sessions Table
**File:** `supabase/migrations/20251215000000_create_user_sessions.sql`

**Schema:**
```sql
user_sessions {
  id: UUID (PK)
  user_id: UUID (FK → auth.users)
  refresh_token: TEXT (unique)
  refresh_token_expires_at: TIMESTAMPTZ (30 days)
  access_token_hash: TEXT
  device_info: JSONB
  ip_address: TEXT
  is_active: BOOLEAN
  last_refreshed_at: TIMESTAMPTZ
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}
```

**Features:**
- ✅ RLS enabled (users can view own sessions)
- ✅ Indexed for performance (refresh_token, expires_at)
- ✅ Auto-cleanup function (runs daily at 2 AM)
- ✅ 30-day refresh token expiry

---

## 🔄 Today's Tasks

### Task 1: Create Auth Refresh Edge Function ⏰

**Location:** `supabase/functions/auth-refresh/index.ts`

**Purpose:** Validate refresh token and issue new access token

**API Endpoint:**
```
POST /auth-refresh
Body: { refreshToken: string }
Returns: { accessToken: string, expiresIn: number }
```

### Task 2: Create Session Management Edge Function

**Location:** `supabase/functions/auth-create-session/index.ts`

**Purpose:** Create new session after login

**API Endpoint:**
```
POST /auth-create-session
Body: { userId: string, deviceInfo: object }
Returns: { refreshToken: string, accessToken: string, expiresIn: number }
```

### Task 3: Implement Logout Function

**Location:** `supabase/functions/auth-logout/index.ts`

**Purpose:** Revoke refresh token

**API Endpoint:**
```
POST /auth-logout
Body: { refreshToken: string }
Returns: { success: boolean }
```

---

## 📚 Implementation Plan

### Architecture

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Edge Functions             │
│  ┌─────────────────────┐   │
│  │ auth-create-session │   │  Login → Create Session
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │   auth-refresh      │   │  Refresh → New Access Token
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │   auth-logout       │   │  Logout → Revoke Session
│  └─────────────────────┘   │
└─────────────┬───────────────┘
              │
              ▼
      ┌──────────────┐
      │ user_sessions│  (Database Table)
      └──────────────┘
```

### Flow Diagram

**1. Login Flow:**
```
User Login (OTP)
    ↓
Verify OTP
    ↓
auth-create-session
    ↓
Generate refresh_token (30 days)
Generate access_token (1 hour)
    ↓
Store in user_sessions table
    ↓
Return tokens to frontend
```

**2. Refresh Flow:**
```
Access token expired
    ↓
auth-refresh
    ↓
Validate refresh_token
Check expiry
Check is_active
    ↓
Generate new access_token
Update last_refreshed_at
    ↓
Return new access_token
```

**3. Logout Flow:**
```
User logout
    ↓
auth-logout
    ↓
Mark session is_active = false
    ↓
Return success
```

---

## 🔐 Security Considerations

### Token Security

1. **Refresh Token**
   - Stored in httpOnly cookie (if web)
   - Stored in secure storage (if mobile)
   - Single-use recommended (rotate on refresh)
   - 30-day expiry

2. **Access Token**
   - Short-lived (1 hour)
   - JWT format
   - Include user_id and permissions
   - Never stored in user_sessions (only hash for verification)

3. **Token Rotation**
   - Generate new refresh_token on each refresh (optional)
   - Invalidate old refresh_token
   - Prevents token reuse attacks

### Database Security

- ✅ RLS enabled on user_sessions
- ✅ Users can only view own sessions
- ✅ Only service role can create/update sessions
- ✅ Indexed for performance
- ✅ Auto-cleanup of expired sessions

---

## 📝 Implementation Details

### Edge Function Structure

```typescript
// Common structure for all auth Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // 1. Parse request
    const { refreshToken } = await req.json()
    
    // 2. Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // 3. Validate and process
    // ... business logic ...
    
    // 4. Return response
    return new Response(
      JSON.stringify({ accessToken, expiresIn }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

---

## 🧪 Testing Plan

### Unit Tests

1. **Create Session**
   - [ ] Valid user_id creates session
   - [ ] Returns refresh_token and access_token
   - [ ] Tokens are different
   - [ ] Session stored in database

2. **Refresh Token**
   - [ ] Valid refresh_token returns new access_token
   - [ ] Expired refresh_token returns error
   - [ ] Invalid refresh_token returns error
   - [ ] Inactive session returns error
   - [ ] last_refreshed_at updated

3. **Logout**
   - [ ] Valid refresh_token marks session inactive
   - [ ] Returns success
   - [ ] Subsequent refresh fails

### Integration Tests

1. **Full Auth Flow**
   - [ ] Login → Create Session
   - [ ] Use access_token
   - [ ] Access expires
   - [ ] Refresh → New access_token
   - [ ] Logout → Session revoked

2. **Error Cases**
   - [ ] Expired refresh_token
   - [ ] Invalid refresh_token
   - [ ] Revoked session
   - [ ] Missing parameters

---

## 📊 Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Edge Functions Created | 3 | ⏳ 0/3 |
| Unit Tests Passing | 100% | ⏳ Not Started |
| Integration Tests | Pass | ⏳ Not Started |
| API Response Time | <200ms | ⏳ TBD |
| Token Refresh Success Rate | >99% | ⏳ TBD |

---

## 🚀 Deployment Checklist

### Prerequisites
- [x] user_sessions table created
- [x] RLS policies configured
- [x] Cleanup function working
- [ ] Edge Functions deployed
- [ ] Environment variables set

### Deployment Steps

1. **Deploy Edge Functions**
   ```bash
   npx supabase functions deploy auth-create-session
   npx supabase functions deploy auth-refresh
   npx supabase functions deploy auth-logout
   ```

2. **Set Environment Variables**
   ```bash
   npx supabase secrets set JWT_SECRET=your-secret-here
   ```

3. **Test Endpoints**
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/auth-refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken": "test-token"}'
   ```

---

## 💡 Design Decisions

### Why Edge Functions?

1. **Security:** Service role access without exposing credentials
2. **Custom Logic:** Full control over token generation/validation
3. **Performance:** Run close to users globally
4. **Scalability:** Auto-scaling with Deno Deploy

### Why 30-Day Refresh Tokens?

1. **Balance:** Not too short (UX) or too long (security)
2. **Industry Standard:** Common practice
3. **Re-authentication:** Forces periodic re-login
4. **Compliance:** Meets most security requirements

### Why 1-Hour Access Tokens?

1. **Short-Lived:** Limits damage if compromised
2. **Practical:** Not too frequent refreshes
3. **Performance:** Reduces auth checks
4. **Standard:** Common industry practice

---

## 📚 Next Steps (Day 15)

Tomorrow we'll:
1. Create SessionManager utility class
2. Integrate with frontend
3. Add auto-refresh logic
4. Implement feature gating
5. Test end-to-end flow

---

## 📝 Notes

### Token Format

**Refresh Token:**
```typescript
// Cryptographically secure random string
// Example: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
crypto.randomUUID() + crypto.randomUUID()
```

**Access Token (JWT):**
```json
{
  "sub": "user-uuid",
  "role": "authenticated",
  "iat": 1702742400,
  "exp": 1702746000,
  "iss": "coreidpin",
  "aud": "authenticated"
}
```

### Database Cleanup

Cron job runs daily:
```sql
DELETE FROM user_sessions
WHERE refresh_token_expires_at < NOW()
   OR last_refreshed_at < NOW() - INTERVAL '90 days';
```

---

**Day 14 Status:** 🚧 **In Progress**  
**Next Task:** Create Edge Functions  
**Blockers:** None

---

**Updated:** December 16, 2024  
**Author:** Development Team  
**Next:** Complete Edge Function implementation
