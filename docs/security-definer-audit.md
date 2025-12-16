# Security DEFINER Functions - Comprehensive Audit
**Week 3 - Day 11**  
**Date:** December 16, 2024  
**Status:** Initial Audit Complete

---

## 📊 Executive Summary

**Total SECURITY DEFINER Functions Found:** 20 (from migrations)  
**Recommendation:** Keep 8, Convert 10, Refactor 2

### Security Risk Level:
- 🔴 **High Risk:** 2 functions (need immediate refactoring)
- 🟡 **Medium Risk:** 10 functions (should convert to INVOKER)
- 🟢 **Low Risk:** 8 functions (safe to keep as DEFINER)

---

## 📋 Complete Function Inventory

| # | Function Name | Schema | Category | Risk | Action | Priority |
|---|---------------|--------|----------|------|--------|----------|
| 1 | `is_consent_valid` | public | Keep DEFINER | 🟢 Low | Document | Low |
| 2 | `cleanup_expired_consent_requests` | public | Keep DEFINER | 🟢 Low | Document | Low |
| 3 | `create_business_profile_on_signup` | public | Keep DEFINER | 🟢 Low | Document | Low |
| 4 | `create_team_invitation_token` | public | Keep DEFINER | 🟢 Low | Document | Low |
| 5 | `create_user_profile_trigger` | public | Keep DEFINER | 🟢 Low | Document | Low |
| 6 | `mark_notification_read` | public | **Convert INVOKER** | 🟡 Med | Refactor | High |
| 7 | `mark_all_notifications_read` | public | **Convert INVOKER** | 🟡 Med | Refactor | High |
| 8 | `get_unread_notification_count` | public | **Convert INVOKER** | 🟡 Med | Refactor | High |
| 9 | `create_announcement` | public | Keep DEFINER | 🟢 Low | Document | Low |
| 10 | `track_api_usage` | public | Keep DEFINER | 🟢 Low | Document | Low |
| 11 | `increment_api_quota` | public | Keep DEFINER | 🟢 Low | Document | Low |
| 12 | `get_api_quota_remaining` | public | **Convert INVOKER** | 🟡 Med | Refactor | Med |
| 13 | `check_rate_limit` | public | Keep DEFINER | 🟢 Low | Document | Med |
| 14 | `reset_rate_limits` | public | Keep DEFINER | 🟢 Low | Document | Low |
| 15 | `cleanup_old_usage_logs` | public | Keep DEFINER | 🟢 Low | Document | Low |
| 16 | `create_webhook_for_business` | public | **Refactor** | 🔴 High | **Urgent** | **High** |
| 17 | `get_webhooks_for_business` | public | **Convert INVOKER** | 🟡 Med | Refactor | High |
| 18 | `create_api_key_for_user` | public | **Refactor** | 🔴 High | **Urgent** | **High** |
| 19 | `get_api_keys_for_user` | public | **Convert INVOKER** | 🟡 Med | Refactor | High |
| 20 | `cleanup_expired_sessions` | public | Keep DEFINER | 🟢 Low | Document | Low |

---

## 🔍 Detailed Analysis by Category

### ✅ KEEP DEFINER (8 functions) - Safe

These functions **must** remain SECURITY DEFINER because they:
- Perform system operations with no user context (cron jobs)
- Are trigger functions that run before user session exists
- Require elevated privileges for legitimate reasons

#### 1. `is_consent_valid(p_professional_id, p_business_id, p_required_scopes)`
**Purpose:** Check if business has valid consent to access professional's data  
**Why DEFINER:** Needs to query consent table regardless of user context  
**Security:** ✅ Safe - only returns boolean, no data exposure  
**Last Reviewed:** 2024-12-16

#### 2. `cleanup_expired_consent_requests()`
**Purpose:** Cron job to delete old consent requests  
**Why DEFINER:** System task, no user context  
**Security:** ✅ Safe - only deletes expired records  
**Cron Schedule:** Should run daily at 2 AM  
**Last Reviewed:** 2024-12-16

#### 3. `create_business_profile_on_signup()`
**Purpose:** Trigger function to auto-create business profile on user signup  
**Why DEFINER:** Runs in trigger before user session exists  
**Security:** ✅ Safe - only creates profile for NEW.user_id  
**Last Reviewed:** 2024-12-16

#### 4. `create_team_invitation_token()`
**Purpose:** Generate secure invitation tokens for team members  
**Why DEFINER:** Needs to insert into invitations table  
**Security:** ✅ Safe - validates business ownership  
**Last Reviewed:** 2024-12-16

#### 5. `create_user_profile_trigger()`
**Purpose:** Auto-create user profile on auth.users INSERT  
**Why DEFINER:** Trigger function, runs before user session  
**Security:** ✅ Safe - standard pattern  
**Last Reviewed:** 2024-12-16

#### 9. `create_announcement(p_title, p_message, p_type)`
**Purpose:** Create system-wide announcement for all users  
**Why DEFINER:** Needs to insert notification for every user  
**Security:** ⚠️ Review - should restrict to admin role  
**Recommendation:** Add admin check  
**Last Reviewed:** 2024-12-16

#### 10-11. API Usage Tracking (`track_api_usage`, `increment_api_quota`)
**Purpose:** Log API usage and increment quotas  
**Why DEFINER:** Called by Edge Functions with service role  
**Security:** ✅ Safe - system operations  
**Last Reviewed:** 2024-12-16

#### 13-15. Rate Limiting & Cleanup (`check_rate_limit`, `reset_rate_limits`, `cleanup_old_usage_logs`)
**Purpose:** System operations for rate limiting  
**Why DEFINER:** No user context, system tasks  
**Security:** ✅ Safe  
**Last Reviewed:** 2024-12-16

#### 20. `cleanup_expired_sessions()`
**Purpose:** Delete expired user sessions (cron job)  
**Why DEFINER:** System task  
**Security:** ✅ Safe  
**Last Reviewed:** 2024-12-16

---

### 🔄 CONVERT TO INVOKER (10 functions) - Should be Refactored

These functions should be converted to SECURITY INVOKER because:
- They query user-specific data
- RLS policies can handle the security
- No reason to bypass RLS

#### 6-8. Notification Functions (HIGH PRIORITY)
**Functions:**
- `mark_notification_read(notification_id UUID)`
- `mark_all_notifications_read()`
- `get_unread_notification_count()`

**Current Issue:** Using SECURITY DEFINER unnecessarily  
**Why Convert:** RLS already restricts to `auth.uid() = user_id`  
**Refactor Plan:**
```sql
-- BEFORE (DEFINER)
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = true, is_new = false, read_at = NOW()
    WHERE id = notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- AFTER (INVOKER) - alternatively, remove function entirely
-- Frontend can do:
UPDATE notifications 
SET is_read = true, is_new = false, read_at = NOW()
WHERE id = $1 AND user_id = auth.uid();
-- RLS policies ensure user can only update their own notifications
```

**Recommendation:** Remove these functions, use direct queries with RLS

#### 12. `get_api_quota_remaining(user_id UUID)`
**Current Issue:** SECURITY DEFINER for simple SELECT  
**Why Convert:** Can rely on RLS  
**Refactor:** Remove function, use direct query

#### 17. `get_webhooks_for_business(p_business_id UUID)`
**Current Issue:** Bypasses RLS unnecessarily  
**Why Convert:** RLS can handle business ownership check  
**Refactor:** See "Refactor" section below

#### 19. `get_api_keys_for_user(p_user_id UUID)`
**Current Issue:** Bypasses RLS unnecessarily  
**Why Convert:** RLS already has ownership policies  
**Refactor:** Remove function, use direct query with RLS

---

### ⚠️ REFACTOR URGENTLY (2 functions) - High Risk

These functions have security issues and should be refactored immediately.

#### 16. `create_webhook_for_business()` - 🔴 HIGH RISK

**Current Code:**
```sql
CREATE OR REPLACE FUNCTION create_webhook_for_business(
  p_business_id UUID,
  p_url TEXT,
  p_events TEXT[],
  p_secret TEXT
)
RETURNS TABLE (...)
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Validates business exists
  SELECT bp.user_id INTO v_user_id
  FROM business_profiles bp
  WHERE bp.id = p_business_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Business profile not found or unauthorized';
  END IF;
  
  -- ⚠️ PROBLEM: Does NOT verify that auth.uid() = v_user_id
  -- Any authenticated user can create webhooks for any business!
  
  RETURN QUERY
  INSERT INTO webhooks (business_id, url, events, secret, is_active)
  VALUES (p_business_id, p_url, p_events, p_secret, true)
  RETURNING *;
END;
$$;
```

**Security Issue:** Function validates business exists but **doesn't verify the caller owns the business**!  
**Attack Vector:** User A can create webhooks for User B's business  
**Severity:** 🔴 **CRITICAL**

**Fix Option 1: Add auth check (keep DEFINER)**
```sql
CREATE OR REPLACE FUNCTION create_webhook_for_business(...)
RETURNS TABLE (...)
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT bp.user_id INTO v_user_id
  FROM business_profiles bp
  WHERE bp.id = p_business_id;
  
  -- ✅ ADD THIS CHECK
  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: You do not own this business';
  END IF;
  
  RETURN QUERY
  INSERT INTO webhooks (business_id, url, events, secret, is_active)
  VALUES (p_business_id, p_url, p_events, p_secret, true)
  RETURNING *;
END;
$$;
```

**Fix Option 2: Remove function, use RLS (BETTER)**
```sql
-- Drop function
DROP FUNCTION create_webhook_for_business;

-- Frontend uses direct INSERT
INSERT INTO webhooks (business_id, url, events, secret, is_active)
VALUES ($1, $2, $3, $4, true)
RETURNING *;

-- RLS policy ensures user owns the business
CREATE POLICY "Users can create webhooks for owned businesses"
  ON webhooks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_profiles bp
      WHERE bp.id = webhooks.business_id
        AND bp.user_id = auth.uid()
    )
  );
```

**Recommendation:** **Option 2** (Remove function, rely on RLS)

---

#### 18. `create_api_key_for_user()` - 🔴 HIGH RISK

**Current Code:**
```sql
CREATE OR REPLACE FUNCTION create_api_key_for_user(
  p_user_id UUID,
  p_key_name TEXT,
  ...
)
RETURNS TABLE (...)
SECURITY DEFINER
AS $$
BEGIN
  -- ⚠️ PROBLEM: No validation that auth.uid() = p_user_id
  -- Any user can create API keys for any other user!
  
  RETURN QUERY
  INSERT INTO api_keys (user_id, key_name, ...)
  VALUES (p_user_id, p_key_name, ...)
  RETURNING *;
END;
$$;
```

**Security Issue:** No ownership verification!  
**Attack Vector:** User A can create API keys for User B  
**Severity:** 🔴 **CRITICAL**

**Fix:** Same as webhook function - add auth check OR remove and use RLS

**Recommendation:** **Remove function, rely on RLS**

---

## 📈 Summary Statistics

| Category | Count | Percentage |
|----------|-------|------------|
| Keep DEFINER (Safe) | 8 | 40% |
| Convert to INVOKER | 10 | 50% |
| Urgent Refactor | 2 | 10% |
| **Total** | **20** | **100%** |

### Risk Distribution:
- 🔴 **Critical Risk:** 2 (10%)
- 🟡 **Medium Risk:** 10 (50%)
- 🟢 **Low Risk:** 8 (40%)

---

## 🎯 Recommended Actions (Prioritized)

### 🔴 **URGENT (This Week)**
1. **Fix `create_webhook_for_business`** - Add auth check or remove
2. **Fix `create_api_key_for_user`** - Add auth check or remove
3. **Test fixes thoroughly** - Verify no unauthorized access possible

### 🟡 **High Priority (This Week)**
4. **Remove notification helper functions** (mark_notification_read, etc.)
5. **Remove get_webhooks_for_business** - Use direct query with RLS
6. **Remove get_api_keys_for_user** - Use direct query with RLS

### 🟢 **Medium Priority (Next Week)**
7. **Document all KEEP DEFINER functions** - Justification doc
8. **Add admin role check to `create_announcement`**
9. **Quarterly security review calendar**

---

## 📝 Migration Plan

### Migration 1: Fix Critical Security Issues
**File:** `20241216100000_fix_critical_definer_security.sql`

```sql
-- Drop insecure functions
DROP FUNCTION IF EXISTS create_webhook_for_business;
DROP FUNCTION IF EXISTS create_api_key_for_user;

-- Users will use direct INSERT with RLS protection
-- No replacement needed - RLS handles security
```

### Migration 2: Remove Unnecessary DEFINER Functions
**File:** `20241216110000_remove_unnecessary_definer_functions.sql`

```sql
-- Drop notification helpers (use direct queries instead)
DROP FUNCTION IF EXISTS mark_notification_read(UUID);
DROP FUNCTION IF EXISTS mark_all_notifications_read();
DROP FUNCTION IF EXISTS get_unread_notification_count();

-- Drop webhook/API key getters (use direct queries instead)
DROP FUNCTION IF EXISTS get_webhooks_for_business(UUID);
DROP FUNCTION IF EXISTS get_api_keys_for_user(UUID);

-- Verify RLS policies exist for direct queries
-- (Already exist from Week 2)
```

### Migration 3: Harden Remaining DEFINER Functions
**File:** `20241216120000_harden_definer_functions.sql`

```sql
-- Add admin check to create_announcement
CREATE OR REPLACE FUNCTION create_announcement(...)
RETURNS UUID AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Check if caller is admin (example check)
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Rest of function...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ✅ Testing Checklist

After refactoring, verify:
- [ ] Users can only create webhooks for their own businesses
- [ ] Users can only create API keys for themselves
- [ ] Users can only read their own notifications
- [ ] Direct queries work with RLS (no function needed)
- [ ] System functions (cleanup, triggers) still work
- [ ] create_announcement restricted to admins

---

## 📊 Expected Outcome

**Before:**
- 20 SECURITY DEFINER functions
- 2 critical security vulnerabilities
- 10 functions unnecessarily bypassing RLS

**After:**
- 8 SECURITY DEFINER functions (all justified)
- 0 security vulnerabilities
- All user operations respect RLS

**Security Improvement:** 60% reduction in DEFINER functions, 100% elimination of critical risks

---

## 📅 Next Steps

1. **Today:** Review this audit with team
2. **Tomorrow:** Create and test migrations
3. **Day 13:** Apply migrations, verify functionality
4. **Day 14:** Update frontend to use direct queries
5. **Day 15:** Complete testing and documentation

---

**Generated:** December 16, 2024  
**Auditor:** Development Team  
**Status:** ✅ Audit Complete, Ready for Refactoring
