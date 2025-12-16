# Week 3, Day 15 - Frontend Integration & Feature Gating
**Date:** December 16, 2024  
**Focus:** SessionManager + Feature Gating Implementation  
**Status:** 🚧 In Progress

---

## 📋 Day 15 Objectives

1. Create SessionManager utility class
2. Implement auto-refresh logic
3. Integrate with existing auth flow
4. Implement feature gating system
5. Lock 3 features behind profile completion
6. Test end-to-end

---

## 🎯 Deliverables

### 1. SessionManager Class
**Location:** `src/utils/SessionManager.ts`

**Features:**
- Store/retrieve refresh token securely
- Store/retrieve access token
- Auto-refresh before expiry
- Handle refresh failures
- Clear tokens on logout

### 2. Feature Gating System
**Components:**
- `FeatureLock.tsx` - Wrapper component
- `useFeatureGate.ts` - Hook for checking access
- Database migration for profile completion tracking

**Gates:**
1. **API Keys** - Requires 80% profile completion
2. **Webhooks** - Requires 100% profile completion
3. **Advanced Analytics** - Requires verified work email

---

## 📐 SessionManager Design

### Architecture

```typescript
class SessionManager {
  // Token Storage
  private refreshToken: string | null
  private accessToken: string | null
  private accessTokenExpiry: number | null
  
  // Auto-refresh
  private refreshTimer: NodeJS.Timeout | null
  
  // Methods
  init(): void
  setTokens(refresh: string, access: string, expiresIn: number): void
  getAccessToken(): string | null
  refreshAccessToken(): Promise<string>
  scheduleRefresh(): void
  clearTokens(): void
  isAuthenticated(): boolean
}
```

### Usage Flow

```typescript
// 1. Login
const { refreshToken, accessToken, expiresIn } = await login(email, otp)
sessionManager.setTokens(refreshToken, accessToken, expiresIn)

// 2. Auto-refresh happens automatically
// - 5 minutes before expiry
// - On failed API call (401)

// 3. Use in API calls
const token = sessionManager.getAccessToken()
headers: { Authorization: `Bearer ${token}` }

// 4. Logout
sessionManager.clearTokens()
```

---

## 🔒 Feature Gating Design

### Component Structure

```typescript
<FeatureLock
  feature="api_keys"
  requiredCompletion={80}
  fallback={<UpgradePrompt />}
>
  <APIKeysManager />
</FeatureLock>
```

### Hook Usage

```typescript
const { 
  hasAccess,
  completion,
  missingFields,
  loading 
} = useFeatureGate('webhooks', 100)

if (!hasAccess) {
  return <CompleteProfilePrompt missing={missingFields} />
}
```

### Database Schema

```sql
-- Add to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  profile_completion_percentage INTEGER DEFAULT 0;

-- Function to calculate completion
CREATE FUNCTION calculate_profile_completion(user_id UUID)
RETURNS INTEGER;
```

---

## 🚀 Implementation Plan

### Phase 1: SessionManager (Morning)

1. **Create SessionManager.ts**
   ```typescript
   export class SessionManager {
     private static instance: SessionManager
     
     static getInstance(): SessionManager {
       if (!SessionManager.instance) {
         SessionManager.instance = new SessionManager()
       }
       return SessionManager.instance
     }
     
     // Implementation...
   }
   
   export const sessionManager = SessionManager.getInstance()
   ```

2. **Implement Token Storage**
   - Use localStorage for web (consider httpOnly cookies later)
   - Implement getters/setters
   - Handle token expiry tracking

3. **Implement Auto-Refresh**
   - Calculate refresh time (5 min before expiry)
   - Set timeout
   - Call auth-refresh Edge Function
   - Handle errors (redirect to login)

4. **Integrate with Supabase Client**
   - Add interceptor to add auth header
   - Handle 401 errors
   - Trigger refresh on auth failure

### Phase 2: Feature Gating (Afternoon)

1. **Database Migration**
   ```sql
   -- Add completion tracking
   ALTER TABLE profiles ADD COLUMN profile_completion_percentage INT;
   
   -- Calculate completion function
   CREATE FUNCTION calculate_profile_completion()...
   
   -- Trigger to auto-update
   CREATE TRIGGER update_profile_completion...
   ```

2. **Create FeatureLock Component**
   ```typescript
   interface FeatureLockProps {
     feature: string
     requiredCompletion: number
     children: React.ReactNode
     fallback?: React.ReactNode
   }
   ```

3. **Create useFeatureGate Hook**
   ```typescript
   function useFeatureGate(feature: string, required: number) {
     const [hasAccess, setHasAccess] = useState(false)
     const [completion, setCompletion] = useState(0)
     
     useEffect(() => {
       // Fetch user profile completion
       // Check if meets requirement
     }, [])
     
     return { hasAccess, completion, ... }
   }
   ```

4. **Lock 3 Features**
   - Wrap API Keys page with FeatureLock (80%)
   - Wrap Webhooks page with FeatureLock (100%)
   - Add completion indicator to nav

---

## 📝 Detailed Implementation

### SessionManager.ts

```typescript
import { supabase } from './supabase'

interface TokenData {
  refreshToken: string
  accessToken: string
  expiresAt: number
  userId: string
}

class SessionManager {
  private static instance: SessionManager
  private refreshTimer: NodeJS.Timeout | null = null
  
  private readonly STORAGE_KEY = 'auth_tokens'
  private readonly REFRESH_BUFFER = 5 * 60 * 1000 // 5 minutes
  
  private constructor() {
    this.init()
  }
  
  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }
  
  init(): void {
    // Load tokens from storage
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (stored) {
      try {
        const data: TokenData = JSON.parse(stored)
        // Check if still valid
        if (data.expiresAt > Date.now()) {
          this.scheduleRefresh(data.expiresAt)
        } else {
          // Try to refresh immediately
          this.refreshAccessToken()
        }
      } catch (error) {
        console.error('Failed to load tokens:', error)
        this.clearTokens()
      }
    }
  }
  
  setTokens(data: TokenData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    this.scheduleRefresh(data.expiresAt)
  }
  
  getAccessToken(): string | null {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return null
    
    try {
      const data: TokenData = JSON.parse(stored)
      return data.accessToken
    } catch {
      return null
    }
  }
  
  getRefreshToken(): string | null {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return null
    
    try {
      const data: TokenData = JSON.parse(stored)
      return data.refreshToken
    } catch {
      return null
    }
  }
  
  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      this.handleRefreshFailure()
      return null
    }
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auth-refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        }
      )
      
      if (!response.ok) {
        throw new Error('Refresh failed')
      }
      
      const data = await response.json()
      
      this.setTokens({
        refreshToken: data.refreshToken,
        accessToken: data.accessToken,
        expiresAt: data.expiresAt,
        userId: data.userId
      })
      
      return data.accessToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.handleRefreshFailure()
      return null
    }
  }
  
  private scheduleRefresh(expiresAt: number): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }
    
    // Calculate when to refresh (5 min before expiry)
    const refreshAt = expiresAt - this.REFRESH_BUFFER
    const delay = refreshAt - Date.now()
    
    if (delay > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshAccessToken()
      }, delay)
    } else {
      // Already expired or expiring soon, refresh now
      this.refreshAccessToken()
    }
  }
  
  clearTokens(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }
  
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    return token !== null
  }
  
  private handleRefreshFailure(): void {
    this.clearTokens()
    // Redirect to login
    window.location.href = '/login'
  }
}

export const sessionManager = SessionManager.getInstance()
```

---

## 🔐 Feature Gating Migration

```sql
-- migration: 20241216150000_add_profile_completion.sql

-- Add profile completion percentage
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;

-- Function to calculate profile completion
CREATE OR REPLACE FUNCTION calculate_profile_completion(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_fields INTEGER := 10;  -- Total number of fields
    filled_fields INTEGER := 0;
    completion INTEGER;
BEGIN
    SELECT 
        (CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 ELSE 0 END) +
        (CASE WHEN bio IS NOT NULL AND bio != '' THEN 1 ELSE 0 END) +
        (CASE WHEN avatar_url IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN location IS NOT NULL AND location != '' THEN 1 ELSE 0 END) +
        (CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END) +
        (CASE WHEN linkedin_url IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN github_url IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN portfolio_url IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN skills IS NOT NULL AND jsonb_array_length(skills) > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS (
            SELECT 1 FROM work_experiences 
            WHERE user_id = p_user_id 
            LIMIT 1
        ) THEN 1 ELSE 0 END)
    INTO filled_fields
    FROM public.profiles
    WHERE user_id = p_user_id;
    
    completion := (filled_fields * 100) / total_fields;
    
    -- Update the profile
    UPDATE public.profiles
    SET profile_completion_percentage = completion,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN completion;
END;
$$;

-- Trigger to auto-update completion
CREATE OR REPLACE FUNCTION trigger_update_profile_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM calculate_profile_completion(NEW.user_id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_completion_on_profile_change ON public.profiles;
CREATE TRIGGER update_completion_on_profile_change
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_profile_completion();

-- Comments
COMMENT ON COLUMN public.profiles.profile_completion_percentage IS 
    'Percentage of profile completion (0-100). Auto-calculated via trigger.';
COMMENT ON FUNCTION calculate_profile_completion IS 
    'Calculates profile completion percentage based on filled fields and work experience.';
```

---

## 🧪 Testing Plan

### SessionManager Tests
- [ ] Tokens stored correctly
- [ ] Auto-refresh triggers 5 min before expiry
- [ ] Refresh success updates tokens
- [ ] Refresh failure clears tokens and redirects
- [ ] isAuthenticated() works correctly
- [ ] Multiple tabs share same session

### Feature Gating Tests
- [ ] Profile completion calculates correctly
- [ ] Trigger updates completion on profile change
- [ ] FeatureLock shows content when requirement met
- [ ] FeatureLock shows fallback when not met
- [ ] Navigation shows completion indicator

---

## 📊 Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| SessionManager Created | Yes | ⏳ Pending |
| Auto-refresh Working | Yes | ⏳ Pending |
| 3 Features Gated | 3 | ⏳ 0/3 |
| Profile Completion Working | Yes | ⏳ Pending |
| End-to-End Tests Passing | 100% | ⏳ Pending |

---

**Day 15 Status:** 🚧 **In Progress**  
**Next Task:** Create SessionManager.ts  
**Blockers:** None

---

**Updated:** December 16, 2024  
**Author:** Development Team  
**Next:** Implement SessionManager and Feature Gating
