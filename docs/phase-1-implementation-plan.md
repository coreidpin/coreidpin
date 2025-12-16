# 🚀 Phase 1 Implementation Plan - Technical Debt Cleanup

**Duration:** 6 weeks  
**Goal:** Fix critical issues before building AI matching  
**Team:** Backend, Frontend, Database teams  
**Status:** READY TO START

---

## 📋 Table of Contents

1. [Week 1-2: Authentication Fixes](#week-1-2-authentication-fixes)
2. [Week 3-4: Database & RLS](#week-3-4-database--rls)
3. [Week 5-6: Data Quality](#week-5-6-data-quality)
4. [Daily Standups](#daily-standups)
5. [Success Criteria](#success-criteria)

---

## 🔐 Week 1-2: Authentication Fixes

### Objectives
- ✅ Implement token refresh mechanism
- ✅ Add session expiry detection
- ✅ Fix Supabase session sync
- ✅ Test across all components
- ✅ Zero auth errors for 3 days

---

### Day 1: Setup & Planning

#### Morning (9 AM - 12 PM)
**Task 1.1: Create user_sessions table**

```sql
-- File: supabase/migrations/20251215000000_create_user_sessions.sql
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  refresh_token TEXT UNIQUE NOT NULL,
  refresh_token_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  access_token_hash TEXT, -- Store hash, not actual token
  device_info JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  is_active BOOLEAN DEFAULT true,
  last_refreshed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON public.user_sessions(refresh_token) WHERE is_active = true;
CREATE INDEX idx_sessions_expires_at ON public.user_sessions(refresh_token_expires_at) WHERE is_active = true;

-- RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update sessions"
  ON public.user_sessions FOR UPDATE
  USING (true);

-- Cleanup function (run daily via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_sessions
  WHERE refresh_token_expires_at < NOW()
     OR (last_refreshed_at < NOW() - INTERVAL '90 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (runs daily at 2 AM)
SELECT cron.schedule(
  'cleanup-expired-sessions',
  '0 2 * * *',
  'SELECT cleanup_expired_sessions();'
);

COMMENT ON TABLE public.user_sessions IS 'Stores user session data for custom OTP auth with token refresh';
```

**Checklist:**
- [ ] Create migration file
- [ ] Apply migration locally: `npx supabase db push`
- [ ] Verify table created
- [ ] Test RLS policies

#### Afternoon (1 PM - 5 PM)
**Task 1.2: Create auth refresh Edge Function**

```typescript
// File: supabase/functions/auth-refresh/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { refreshToken }: RefreshRequest = await req.json();

    if (!refreshToken) {
      return new Response(
        JSON.stringify({ error: 'Refresh token required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 1. Validate refresh token exists and is active
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('refresh_token', refreshToken)
      .eq('is_active', true)
      .maybeSingle();

    if (sessionError || !session) {
      console.error('Invalid refresh token:', sessionError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 2. Check if refresh token expired
    const expiresAt = new Date(session.refresh_token_expires_at);
    if (expiresAt < new Date()) {
      // Mark session as inactive
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', session.id);

      return new Response(
        JSON.stringify({ 
          error: 'Refresh token expired. Please log in again.',
          code: 'REFRESH_TOKEN_EXPIRED'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 3. Generate new access token
    const newAccessToken = await generateAccessToken(session.user_id);
    const newExpiresAt = Date.now() + (60 * 60 * 1000); // 1 hour

    // 4. Optionally rotate refresh token (security best practice)
    const shouldRotate = Math.random() < 0.1; // 10% rotation chance
    let newRefreshToken = refreshToken;

    if (shouldRotate) {
      newRefreshToken = generateRefreshToken();
      
      await supabase
        .from('user_sessions')
        .update({
          refresh_token: newRefreshToken,
          last_refreshed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);
    } else {
      await supabase
        .from('user_sessions')
        .update({
          last_refreshed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);
    }

    // 5. Return new tokens
    const response: RefreshResponse = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: newExpiresAt,
      userId: session.user_id
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in auth-refresh:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper: Generate access token (JWT)
async function generateAccessToken(userId: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
    aud: 'authenticated',
    role: 'authenticated'
  };

  // In production, use proper JWT library
  // For now, sign with Supabase JWT secret
  const secret = Deno.env.get('SUPABASE_JWT_SECRET');
  
  // Simplified - use proper JWT signing in production
  const encoder = new TextEncoder();
  const data = encoder.encode(
    `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}`
  );
  
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}.${signatureB64}`;
}

// Helper: Generate refresh token
function generateRefreshToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
```

**Checklist:**
- [ ] Create Edge Function
- [ ] Add CORS helper
- [ ] Test locally: `npx supabase functions serve auth-refresh`
- [ ] Test with curl/Postman
- [ ] Deploy: `npx supabase functions deploy auth-refresh`

---

### Day 2: Session Manager Class

**Task 2.1: Create SessionManager utility**

```typescript
// File: src/utils/session-manager.ts
import { supabase } from './supabase/client';
import { toast } from 'sonner';

export class SessionManager {
  private static instance: SessionManager;
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Initialize session manager
   * Call this once on app startup
   */
  async init() {
    console.log('🔐 Initializing SessionManager...');
    
    // Check if we have valid tokens
    const hasTokens = this.hasValidTokens();
    
    if (!hasTokens) {
      console.log('⚠️ No valid tokens found');
      return false;
    }

    // Check and refresh if needed
    const refreshed = await this.checkAndRefreshToken();
    
    if (refreshed) {
      // Setup auto-refresh timer
      this.setupAutoRefresh();
      console.log('✅ Session initialized successfully');
      return true;
    } else {
      console.log('❌ Session initialization failed');
      return false;
    }
  }

  /**
   * Check if user has tokens in localStorage
   */
  private hasValidTokens(): boolean {
    const userId = localStorage.getItem('userId');
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const expiresAt = localStorage.getItem('expiresAt');

    return !!(userId && accessToken && refreshToken && expiresAt);
  }

  /**
   * Check token expiry and refresh if needed
   */
  private async checkAndRefreshToken(): Promise<boolean> {
    const expiresAt = localStorage.getItem('expiresAt');
    if (!expiresAt) return false;

    const expiresAtMs = parseInt(expiresAt);
    const now = Date.now();
    const timeUntilExpiry = expiresAtMs - now;

    // Refresh if expiring in next 5 minutes
    if (timeUntilExpiry < 5 * 60 * 1000) {
      console.log('🔄 Token expiring soon, refreshing...');
      return await this.refreshToken();
    }

    // Token still valid
    console.log(`✅ Token valid for ${Math.floor(timeUntilExpiry / 1000 / 60)} more minutes`);
    return true;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<boolean> {
    // Prevent concurrent refreshes
    if (this.isRefreshing) {
      console.log('⏳ Refresh already in progress...');
      return false;
    }

    this.isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      console.log('🔄 Refreshing token...');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auth-refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ refreshToken })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Token refresh failed');
      }

      const data = await response.json();
      
      // Update localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('expiresAt', data.expiresAt.toString());
      localStorage.setItem('userId', data.userId);

      // Sync with Supabase client
      await this.syncSupabaseSession(data.accessToken, data.refreshToken);

      console.log('✅ Token refreshed successfully');
      return true;

    } catch (error: any) {
      console.error('❌ Token refresh failed:', error);
      
      // Check if refresh token expired
      if (error.message?.includes('expired') || error.message?.includes('Invalid')) {
        this.handleRefreshFailure();
      }
      
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Sync tokens with Supabase client
   */
  private async syncSupabaseSession(accessToken: string, refreshToken: string) {
    try {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) {
        console.warn('⚠️ Supabase session sync warning:', error.message);
        // Don't fail - custom auth might not work with Supabase session
      } else {
        console.log('✅ Supabase session synced');
      }
    } catch (err) {
      console.warn('⚠️ Failed to sync Supabase session:', err);
    }
  }

  /**
   * Setup automatic token refresh
   * Checks every minute
   */
  private setupAutoRefresh() {
    // Clear any existing timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    // Check every minute
    this.refreshTimer = setInterval(async () => {
      await this.checkAndRefreshToken();
    }, 60 * 1000);

    console.log('⏰ Auto-refresh timer set up');
  }

  /**
   * Handle refresh failure (likely token expired)
   */
  private handleRefreshFailure() {
    console.log('❌ Session expired, logging out...');
    
    // Clear all session data
    this.clearSession();

    // Show user-friendly message
    toast.error('Your session has expired. Please log in again.', {
      duration: 5000
    });

    // Redirect to login after short delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  }

  /**
   * Clear session data
   */
  clearSession() {
    localStorage.removeItem('userId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresAt');

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    console.log('🗑️ Session cleared');
  }

  /**
   * Manually logout
   */
  async logout() {
    // Could call logout endpoint here to invalidate session on server

    this.clearSession();
    window.location.href = '/login';
  }

  /**
   * Get current session info
   */
  getSessionInfo() {
    const expiresAt = localStorage.getItem('expiresAt');
    if (!expiresAt) return null;

    const expiresAtMs = parseInt(expiresAt);
    const now = Date.now();
    const timeUntilExpiry = expiresAtMs - now;

    return {
      userId: localStorage.getItem('userId'),
      expiresAt: expiresAtMs,
      expiresIn: timeUntilExpiry,
      expiresInMinutes: Math.floor(timeUntilExpiry / 1000 / 60),
      isExpired: timeUntilExpiry <= 0
    };
  }

  /**
   * Destroy session manager
   * Call this on app unmount/cleanup
   */
  destroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    console.log('🔒 SessionManager destroyed');
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();
```

**Checklist:**
- [ ] Create SessionManager class
- [ ] Add singleton pattern
- [ ] Implement refresh logic
- [ ] Add logging
- [ ] Test refresh flow

---

### Day 3: Integrate SessionManager

**Task 3.1: Update App.tsx**

```typescript
// File: src/App.tsx
import { useEffect } from 'react';
import { sessionManager } from './utils/session-manager';
import { Toaster } from 'sonner';

function App() {
  useEffect(() => {
    // Initialize session manager on app mount
    const initSession = async () => {
      const initialized = await sessionManager.init();
      
      if (!initialized) {
        console.log('⚠️ No active session');
      }
    };

    initSession();

    // Cleanup on unmount
    return () => {
      sessionManager.destroy();
    };
  }, []);

  return (
    <div className="App">
      <Toaster position="top-right" />
      {/* Your app routes */}
    </div>
  );
}

export default App;
```

**Task 3.2: Update login to save session**

```typescript
// File: src/components/LoginPage.tsx (or wherever login happens)
const handleOTPVerify = async (otp: string) => {
  try {
    // Your existing OTP verification logic
    const response = await verifyOTP(phone, otp);
    
    const { userId, accessToken, refreshToken } = response.data;
    
    // Calculate expiry (1 hour from now)
    const expiresAt = Date.now() + (60 * 60 * 1000);
    
    // Save to localStorage
    localStorage.setItem('userId', userId);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('expiresAt', expiresAt.toString());
    
    // CREATE SESSION IN DATABASE
    await fetch(`${SUPABASE_URL}/functions/v1/auth-create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        userId,
        refreshToken,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      })
    });
    
    // Initialize session manager
    await sessionManager.init();
    
    // Redirect to dashboard
    navigate('/dashboard');
    
  } catch (error) {
    console.error('Login failed:', error);
    toast.error('Login failed. Please try again.');
  }
};
```

**Checklist:**
- [ ] Update App.tsx
- [ ] Integrate sessionManager.init()
- [ ] Update login flow
- [ ] Test login → token saved
- [ ] Test auto-refresh

---

### Day 4-5: Create Session Creation Endpoint & Testing

**Task 4.1: Create auth-create-session Edge Function**

```typescript
// File: supabase/functions/auth-create-session/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, refreshToken, deviceInfo, ipAddress } = await req.json();

    // Create session in database
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        refresh_token: refreshToken,
        device_info: deviceInfo || {},
        ip_address: ipAddress || req.headers.get('x-forwarded-for'),
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, sessionId: data.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error creating session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

**Task 4.2: Comprehensive Testing**

```markdown
## Test Plan - Authentication

### Test 1: Login & Session Creation
1. [ ] Login with valid OTP
2. [ ] Verify tokens saved in localStorage
3. [ ] Verify session created in database
4. [ ] Verify SessionManager initialized

### Test 2: Token Refresh (Manual)
1. [ ] Set expiresAt to 2 minutes from now
2. [ ] Wait 2 minutes
3. [ ] Make API call
4. [ ] Verify token auto-refreshed
5. [ ] Verify new tokens in localStorage

### Test 3: Token Expiry
1. [ ] Set expiresAt to past
2. [ ] Make API call
3. [ ] Verify redirect to login
4. [ ] Verify session cleared

### Test 4: Refresh Token Expiry
1. [ ] Set refresh_token_expires_at to past in DB
2. [ ] Try to refresh
3. [ ] Verify error message
4. [ ] Verify redirect to login

### Test 5: Concurrent Refreshes
1. [ ] Make multiple API calls simultaneously
2. [ ] Verify only one refresh happens
3. [ ] All calls succeed

### Test 6: Auto-refresh Timer
1. [ ] Login
2. [ ] Wait 1 minute intervals
3. [ ] Verify logs show checks every minute
4. [ ] Verify refresh happens 5 min before expiry

### Test 7: Logout
1. [ ] Click logout
2. [ ] Verify tokens cleared
3. [ ] Verify timer stopped
4. [ ] Verify redirect to login
```

**Checklist:**
- [ ] Create auth-create-session function
- [ ] Deploy both Edge Functions
- [ ] Run all tests
- [ ] Fix any bugs
- [ ] Document test results

---

### Week 1 Review (Friday)

**Friday Afternoon: Review & Demo**

**Deliverables:**
- ✅ Token refresh working
- ✅ Session expiry detection working
- ✅ Auto-refresh every minute
- ✅ All tests passing
- ✅ Zero auth errors in testing

**Demo to Team:**
1. Show login flow
2. Show auto-refresh logs
3. Show token expiry handling
4. Show session in database

**Retrospective:**
- What went well?
- What was hard?
- Any blockers?
- Adjustments for Week 2?

---

## 🗄️ Week 3-4: Database & RLS

### Objectives
- ✅ Remove SECURITY DEFINER bypasses
- ✅ Implement proper RLS policies
- ✅ Add database indexes
- ✅ Regenerate TypeScript types
- ✅ Test RLS thoroughly

---

### Day 1 (Week 3): RLS Policy Design

**Task: Audit current RLS bypasses**

```sql
-- File: scripts/audit-rls.sql

-- 1. Find all SECURITY DEFINER functions
SELECT 
  proname as function_name,
  prosecdef as is_security_definer,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND prosecdef = true
ORDER BY proname;

-- Expected results:
-- create_webhook_for_business
-- get_webhooks_for_business  
-- create_api_key_for_user
-- get_api_keys_for_user
-- (and any others)
```

**Task: Design RLS policies**

```sql
-- File: supabase/migrations/20251217000000_add_rls_policies.sql

-- 1. Webhooks table RLS
CREATE POLICY "Businesses can view own webhooks"
  ON public.webhooks FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id 
      FROM business_profiles 
      WHERE id = business_id
    )
  );

CREATE POLICY "Businesses can insert own webhooks"
  ON public.webhooks FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT user_id 
      FROM business_profiles 
      WHERE id = business_id
    )
  );

CREATE POLICY "Businesses can update own webhooks"
  ON public.webhooks FOR UPDATE
  USING (
    auth.uid() = (
      SELECT user_id 
      FROM business_profiles 
      WHERE id = business_id
    )
  );

CREATE POLICY "Businesses can delete own webhooks"
  ON public.webhooks FOR DELETE
  USING (
    auth.uid() = (
      SELECT user_id 
      FROM business_profiles 
      WHERE id = business_id
    )
  );

-- 2. API Keys table RLS
CREATE POLICY "Users can view own API keys"
  ON public.api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON public.api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON public.api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- 3. API usage logs RLS (already exists but verify)
-- Users should only see their own logs
```

**Checklist:**
- [ ] Run audit query
- [ ] Document all bypass functions
- [ ] Design RLS policies
- [ ] Review with team

---

### Day 2-3: Gradual RLS Migration

**Strategy: Migrate one table at a time**

**Step 1: Migrate API Keys (Lower risk)**

```typescript
// Test auth.uid() works first
const testRLS = async () => {
  // Ensure session synced
  await sessionManager.init();
  
  // Try direct query (should work if RLS correct)
  const { data, error } = await supabase
    .from('api_keys')
    .select('*');
  
  console.log('RLS Test:', { data, error });
};
```

**Step 2: Update client code**

```typescript
// File: src/components/developer/APIKeysManager.tsx

// BEFORE (using bypass function)
const { data, error } = await supabase
  .rpc('get_api_keys_for_user', {
    p_user_id: userId
  });

// AFTER (direct query with RLS)
const { data, error } = await supabase
  .from('api_keys')
  .select('*')
  .order('created_at', { ascending: false });
```

**Step 3: Remove bypass function**

```sql
-- After confirming RLS works
DROP FUNCTION IF EXISTS get_api_keys_for_user(UUID);
DROP FUNCTION IF EXISTS create_api_key_for_user(...);
```

**Checklist:**
- [ ] Test RLS with direct queries
- [ ] Update all client code
- [ ] Deploy client changes
- [ ] Monitor for errors (1 day)
- [ ] Remove bypass functions

---

### Day 4-5: Add Database Indexes

```sql
-- File: supabase/migrations/20251218000000_add_indexes.sql

-- Professional profiles (for future AI matching)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_skills_gin 
  ON professional_profiles USING GIN(skills);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_experience 
  ON professional_profiles(experience_years);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_location 
  ON professional_profiles(location);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_verification 
  ON professional_profiles(verification_status);

-- Work experiences
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_role 
  ON work_experiences(role);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_company 
  ON work_experiences(company);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_current 
  ON work_experiences(current) 
  WHERE current = true;

-- Business profiles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_user_id 
  ON business_profiles(user_id);

-- Webhooks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhooks_business_id 
  ON webhooks(business_id);

-- API keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_user_id 
  ON api_keys(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_key 
  ON api_keys(api_key) 
  WHERE is_active = true;

-- Test performance
ANALYZE professional_profiles;
ANALYZE work_experiences;
ANALYZE business_profiles;
ANALYZE webhooks;
ANALYZE api_keys;
```

**Checklist:**
- [ ] Apply index migration
- [ ] Run ANALYZE
- [ ] Test query performance
- [ ] Document improvements

---

### Day 6-10 (Week 4): TypeScript Types & Testing

**Regenerate types:**

```bash
# Generate from production database
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  > src/types/database.types.ts
```

**Update Supabase client:**

```typescript
// File: src/utils/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**Fix type errors:**

- Go through each file with type errors
- Remove `@ts-ignore` and `as any`
- Fix properly with correct types

**Checklist:**
- [ ] Regenerate types
- [ ] Update supabase client
- [ ] Fix all type errors
- [ ] Remove workarounds
- [ ] Run `npm run type-check`

---

## 📊 Week 5-6: Data Quality

### Objectives
- ✅ Measure profile completion
- ✅ Create skills taxonomy  
- ✅ Add completion tracking
- ✅ Enforce minimums
- ✅ Normalize data

---

### Day 1-2: Data Audit

```sql
-- File: scripts/data-audit.sql

-- 1. Profile completion rates
SELECT 
  COUNT(*) as total_profiles,
  AVG(CASE WHEN skills IS NOT NULL AND array_length(skills, 1) > 0 THEN 1 ELSE 0 END) * 100 as has_skills_pct,
  AVG(CASE WHEN headline IS NOT NULL THEN 1 ELSE 0 END) * 100 as has_headline_pct,
  AVG(CASE WHEN bio IS NOT NULL AND length(bio) > 50 THEN 1 ELSE 0 END) * 100 as has_bio_pct,
  AVG(CASE WHEN avatar_url IS NOT NULL THEN 1 ELSE 0 END) * 100 as has_avatar_pct
FROM professional_profiles;

-- 2. Top skills (for taxonomy)
SELECT 
  unnest(skills) as skill,
  COUNT(*) as count
FROM professional_profiles
WHERE skills IS NOT NULL
GROUP BY skill
ORDER BY count DESC
LIMIT 500;

-- 3. Job title variations
SELECT 
  role as job_title,
  COUNT(*) as count
FROM work_experiences
GROUP BY role
ORDER BY count DESC
LIMIT 100;

-- 4. Export to CSV for manual curation
COPY (
  SELECT unnest(skills) as skill, COUNT(*) as count
  FROM professional_profiles
  WHERE skills IS NOT NULL
  GROUP BY skill
  ORDER BY count DESC
) TO '/tmp/skills.csv' CSV HEADER;
```

**Checklist:**
- [ ] Run audit queries
- [ ] Export data
- [ ] Analyze results
- [ ] Create report

---

### Day 3-5: Skills Taxonomy

**Create taxonomy table:**

```sql
-- File: supabase/migrations/20251220000000_create_skills_taxonomy.sql

CREATE TABLE IF NOT EXISTS public.skills_taxonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT UNIQUE NOT NULL,
  variations TEXT[] DEFAULT '{}',
  category TEXT,
  subcategory TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_skills_canonical ON skills_taxonomy(canonical_name);
CREATE INDEX idx_skills_category ON skills_taxonomy(category);

-- Normalization function
CREATE OR REPLACE FUNCTION normalize_skill(input_skill TEXT)
RETURNS TEXT AS $$
  SELECT canonical_name 
  FROM skills_taxonomy 
  WHERE 
    input_skill ILIKE canonical_name 
    OR input_skill ILIKE ANY(variations)
  LIMIT 1;
$$ LANGUAGE SQL IMMUTABLE;

-- Seed data (top 100 skills)
INSERT INTO skills_taxonomy (canonical_name, variations, category) VALUES
  ('React', ARRAY['ReactJS', 'React.js', 'react'], 'Frontend'),
  ('Node.js', ARRAY['NodeJS', 'node', 'Node'], 'Backend'),
  ('TypeScript', ARRAY['TS', 'typescript'], 'Programming Language'),
  ('Python', ARRAY['python', 'py'], 'Programming Language'),
  ('JavaScript', ARRAY['JS', 'javascript', 'js'], 'Programming Language'),
  -- Add top 100 skills here
  ;
```

**Manual curation:**
- Review exported skills
- Group similar skills
- Define canonical names
- Create variations list

**Checklist:**
- [ ] Create taxonomy table
- [ ] Manual curation (2-3 days)
- [ ] Add seed data
- [ ] Test normalization function

---

### Day 6-10: Completion Tracking

**Add completion column:**

```sql
-- File: supabase/migrations/20251221000000_add_profile_completion.sql

ALTER TABLE professional_profiles 
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;

-- Function to calculate completion
CREATE OR REPLACE FUNCTION calculate_profile_completion(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completion INTEGER := 0;
  profile RECORD;
BEGIN
  SELECT * INTO profile
  FROM professional_profiles
  WHERE id = profile_id;

  -- Basic info (30%)
  IF profile.full_name IS NOT NULL THEN completion := completion + 5; END IF;
  IF profile.headline IS NOT NULL THEN completion := completion + 5; END IF;
  IF profile.avatar_url IS NOT NULL THEN completion := completion + 5; END IF;
  IF profile.location IS NOT NULL THEN completion := completion + 5; END IF;
  IF profile.bio IS NOT NULL AND length(profile.bio) > 100 THEN completion := completion + 10; END IF;

  -- Skills (30%)
  IF profile.skills IS NOT NULL AND array_length(profile.skills, 1) >= 3 THEN 
    completion := completion + 30; 
  ELSIF profile.skills IS NOT NULL AND array_length(profile.skills, 1) > 0 THEN
    completion := completion + 15;
  END IF;

  -- Experience (25%)
  IF EXISTS (SELECT 1 FROM work_experiences WHERE user_id = profile.user_id LIMIT 1) THEN
    completion := completion + 25;
  END IF;

  -- Projects (15%)
  IF profile.projects IS NOT NULL AND array_length(profile.projects, 1) >= 1 THEN
    completion := completion + 15;
  END IF;

  RETURN completion;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update on profile change
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.completion_percentage := calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_completion
  BEFORE INSERT OR UPDATE ON professional_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- Backfill existing profiles
UPDATE professional_profiles
SET completion_percentage = calculate_profile_completion(id);
```

**UI Component:**

```typescript
// File: src/components/ProfileCompletionBanner.tsx
interface Props {
  completionPercentage: number;
}

export function ProfileCompletionBanner({ completionPercentage }: Props) {
  if (completionPercentage >= 75) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-yellow-900">
            Complete Your Profile ({completionPercentage}%)
          </h3>
          <p className="text-sm text-yellow-700">
            Profiles 75%+ complete are 3x more likely to be found by businesses
          </p>
        </div>
        <button className="btn-primary">
          Complete Now
        </button>
      </div>
      <div className="mt-2 w-full bg-yellow-200 rounded-full h-2">
        <div 
          className="bg-yellow-600 h-2 rounded-full transition-all"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
}
```

**Checklist:**
- [ ] Add completion column
- [ ] Create calculation function
- [ ] Add trigger
- [ ] Backfill data
- [ ] Build UI component
- [ ] Test calculation

---

## ✅ Success Criteria - Phase 1

### Week 2 Review
- [ ] ✅ Token refresh working 100% of time
- [ ] ✅ No "session expired" errors
- [ ] ✅ Auto-refresh logs every minute
- [ ] ✅ All tests passing
- [ ] ✅ Documentation updated

### Week 4 Review
- [ ] ✅ All SECURITY DEFINER functions removed
- [ ] ✅ RLS working for all tables
- [ ] ✅ Zero unauthorized access
- [ ] ✅ All TypeScript errors fixed
- [ ] ✅ Indexes improve query speed 5-10x

### Week 6 Review
- [ ] ✅ Profile completion measured
- [ ] ✅ Skills taxonomy created (500+ skills)
- [ ] ✅ Completion tracking live
- [ ] ✅ Average completion > 65%
- [ ] ✅ Data normalized

---

## 📅 Daily Standups

**Format (15 minutes):**

1. **Yesterday:** What did you complete?
2. **Today:** What are you working on?
3. **Blockers:** Any issues?

**Fridays:** 
- Demo progress
- Retrospective
- Plan next week

---

## 🚀 Next Steps After Phase 1

**If All Success Criteria Met:**
- ✅ Proceed to Phase 2 (High Priority items)
- ✅ Begin AI matching planning

**If Issues Remain:**
- ⚠️ Extend Phase 1 by 1-2 weeks
- ⚠️ Don't rush to Phase 2

---

**Document Version:** 1.0  
**Last Updated:** December 14, 2024  
**Phase Status:** READY TO START

---

## Appendix: Quick Commands

```bash
# Apply migration
npx supabase db push

# Deploy Edge Function
npx supabase functions deploy auth-refresh

# Regenerate types
npx supabase gen types typescript --project-id XXX > src/types/database.types.ts

# Run type check
npm run type-check

# Test locally
npm run dev
```

**Ready to start Week 1 on Monday! 🚀**
