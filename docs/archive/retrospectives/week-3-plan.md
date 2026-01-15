# Week 3 Implementation Plan - Database Security & Feature Enhancement

**Project:** CoreIDPIN (GidiPIN)  
**Week:** December 16-22, 2024  
**Focus:** Security DEFINER Audit, Remaining RLS Tables, Feature Gating  
**Status:** 🚀 READY TO START

---

## 📋 Executive Summary

Building on Week 2's successful RLS implementation (91% coverage), Week 3 will:
1. **Audit & Refactor Security DEFINER Functions** (41 functions)
2. **Complete RLS Coverage** (remaining 7 tables → 100%)
3. **Implement Feature Gating** (profile completion requirements)
4. **Performance Optimization** (RLS query plans)
5. **Session Management** (token refresh mechanism)

### Key Targets:
- **RLS Coverage:** 91% → 100%
- **SECURITY DEFINER Functions:** 41 → <20 (refactor others to INVOKER)
- **Feature Gating:** Profile completion-based access control
- **Performance:** All RLS queries < 50ms
- **Session Management:** Auto-refresh implemented

---

## 🎯 Week 3 Objectives

| Objective | Target | Priority | Estimated Hours |
|-----------|--------|----------|-----------------|
| Security DEFINER Audit | 41 functions reviewed | 🔴 Critical | 8 hours |
| Complete RLS (7 tables) | 100% coverage | 🔴 Critical | 4 hours |
| Feature Gating System | 3 features gated | 🟡 High | 6 hours |
| Token Refresh Mechanism | Fully functional | 🟡 High | 8 hours |
| Performance Audit | All queries optimized | 🟢 Medium | 4 hours |
| **Total** | | | **30 hours** |

---

## 📅 Day-by-Day Breakdown

### **Day 11 - Monday: Security DEFINER Audit (Part 1)**

**Goal:** Identify and categorize all 41 SECURITY DEFINER functions

#### Morning (9 AM - 12 PM)
**Task 11.1: Comprehensive DEFINER Audit**

**Step 1:** Run audit query
```sql
-- File: scripts/audit-security-definer.sql
SELECT 
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS definition,
  CASE 
    WHEN p.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_type,
  r.rolname AS owner
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
LEFT JOIN pg_roles r ON p.proowner = r.oid
WHERE p.prosecdef = true
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, p.proname;
```

**Step 2:** Export to CSV for analysis
```bash
npx supabase db query --file scripts/audit-security-definer.sql --output csv > docs/definer-functions-audit.csv
```

**Step 3:** Create categorization spreadsheet
Create `docs/definer-functions-categorization.md`:

| Function Name | Schema | Purpose | Category | Action | Priority |
|---------------|--------|---------|----------|--------|----------|
| `cleanup_expired_sessions` | public | Session cleanup | Keep DEFINER | Document | Low |
| `get_user_profile` | public | Fetch profile | Convert INVOKER | Refactor | High |
| ... | ... | ... | ... | ... | ... |

**Categories:**
- **Keep DEFINER:** Functions that *must* bypass RLS (admin, system tasks)
- **Convert INVOKER:** Functions that should respect RLS
- **Refactor:** Functions with security issues
- **Delete:** Unused/redundant functions

**Checklist:**
- [ ] Run audit query
- [ ] Export to CSV
- [ ] Categorize all 41 functions
- [ ] Identify high-priority refactors
- [ ] Create action plan spreadsheet

#### Afternoon (1 PM - 5 PM)
**Task 11.2: Refactor First Batch (High Priority)**

**Target:** Convert 5-7 high-priority functions to SECURITY INVOKER

**Example Refactor Pattern:**

**Before (SECURITY DEFINER):**
```sql
CREATE OR REPLACE FUNCTION get_user_profile(user_id_param UUID)
RETURNS TABLE(...) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM profiles WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**After (SECURITY INVOKER):**
```sql
CREATE OR REPLACE FUNCTION get_user_profile(user_id_param UUID)
RETURNS TABLE(...) AS $$
BEGIN
  -- Explicitly check user owns this profile
  IF user_id_param != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;

  RETURN QUERY
  SELECT * FROM profiles WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
```

**Safer Pattern (rely on RLS):**
```sql
-- Even better: Remove function, use direct query with RLS
-- Frontend can directly:
SELECT * FROM profiles WHERE user_id = auth.uid();
-- RLS policies will enforce security
```

**Migration Template:**
```sql
-- File: supabase/migrations/20241216000000_refactor_definer_functions_batch1.sql

-- Drop old DEFINER version
DROP FUNCTION IF EXISTS get_user_profile(UUID);

-- Create INVOKER version with explicit security checks
CREATE OR REPLACE FUNCTION get_user_profile_safe(user_id_param UUID)
RETURNS TABLE(...) AS $$
BEGIN
  IF user_id_param != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  RETURN QUERY SELECT * FROM profiles WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
```

**Checklist:**
- [ ] Identify 5-7 functions to refactor
- [ ] Create migration file
- [ ] Test locally
- [ ] Verify RLS still works
- [ ] Apply migration

---

### **Day 12 - Tuesday: Security DEFINER Audit (Part 2)**

**Goal:** Complete DEFINER refactoring and document remaining functions

#### Morning (9 AM - 12 PM)
**Task 12.1: Refactor Second Batch**

- [ ] Refactor 5-7 more functions (medium priority)
- [ ] Create migration file
- [ ] Test thoroughly
- [ ] Apply migration

#### Afternoon (1 PM - 5 PM)
**Task 12.2: Document Necessary DEFINER Functions**

Create comprehensive documentation for functions that *must* remain SECURITY DEFINER.

**File:** `docs/security-definer-justification.md`

```markdown
# Security DEFINER Functions - Justification

**Total DEFINER Functions:** 15 (down from 41)

## Functions Requiring SECURITY DEFINER

### 1. `cleanup_expired_sessions()`
**Purpose:** System cron job to delete expired sessions  
**Why DEFINER:** System task, no user context  
**Security Review:** ✅ Safe - only deletes old data  
**Last Reviewed:** 2024-12-16

### 2. `create_user_profile_trigger()`
**Purpose:** Automatically create profile on user signup  
**Why DEFINER:** Trigger function, runs before user session exists  
**Security Review:** ✅ Safe - only creates owned profile  
**Last Reviewed:** 2024-12-16

### 3. `send_verification_email_internal()`
**Purpose:** Send emails via service role  
**Why DEFINER:** Needs access to email service credentials  
**Security Review:** ⚠️ Review input validation  
**Last Reviewed:** 2024-12-16  
**Action:** Add rate limiting

[Continue for all remaining DEFINER functions...]
```

**Checklist:**
- [ ] Document all remaining DEFINER functions
- [ ] Justify each one
- [ ] Identify security risks
- [ ] Add recommendations
- [ ] Schedule quarterly review

---

### **Day 13 - Wednesday: Complete RLS Coverage**

**Goal:** Secure the remaining 7 low-priority tables (achieve 100% coverage)

#### Morning (9 AM - 12 PM)
**Task 13.1: Identify and Secure Remaining Tables**

**From Week 2 Retrospective, remaining tables (~7):**

Run fresh audit:
```sql
-- Find tables without RLS enabled
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN (
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND rowsecurity = true
  )
ORDER BY tablename;
```

**Expected tables (verify with audit):**
1. `verification_codes` (low priority - short-lived data)
2. `password_reset_tokens` (if exists)
3. `webhook_logs` (if not already secured)
4. `rate_limit_buckets` (system table)
5. `feature_flags` (if exists)
6. Others based on audit results

**Categorize:**
- **User-owned data:** Standard RLS (SELECT/INSERT/UPDATE/DELETE)
- **System tables:** Read-only for users, system writes
- **Public data:** Everyone can read, system writes

#### Afternoon (1 PM - 5 PM)
**Task 13.2: Apply RLS Patterns**

**Migration Template:**
```sql
-- File: supabase/migrations/20241218000000_rls_remaining_tables.sql

-- Table 1: verification_codes (system table, no user access)
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- No SELECT policy - users don't need to read these
-- System writes via SECURITY DEFINER function

DROP POLICY IF EXISTS "System can write verification codes" ON public.verification_codes;
CREATE POLICY "System can write verification codes"
  ON public.verification_codes FOR INSERT
  WITH CHECK (true); -- Only callable via DEFINER function

-- Table 2: rate_limit_buckets (system table)
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- Similar approach...

-- Table 3: webhook_logs (user can view own)
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own webhook logs" ON public.webhook_logs;
CREATE POLICY "Users can view own webhook logs"
  ON public.webhook_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles bp
      WHERE bp.business_id = webhook_logs.business_id
        AND bp.user_id = auth.uid()
    )
  );

-- Continue for all remaining tables...

-- Verify RLS coverage
DO $$
DECLARE
  coverage_pct NUMERIC;
BEGIN
  SELECT 
    ROUND((COUNT(*) FILTER (WHERE rowsecurity = true)::NUMERIC / COUNT(*) * 100), 2)
  INTO coverage_pct
  FROM pg_tables
  WHERE schemaname = 'public';
  
  RAISE NOTICE 'RLS Coverage: %', coverage_pct || '%';
  
  IF coverage_pct < 100 THEN
    RAISE WARNING 'RLS coverage not 100%! Current: %', coverage_pct || '%';
  ELSE
    RAISE NOTICE '✅ 100% RLS COVERAGE ACHIEVED!';
  END IF;
END $$;
```

**Checklist:**
- [ ] Audit remaining tables
- [ ] Categorize by access pattern
- [ ] Create migration with all policies
- [ ] Test each policy
- [ ] Verify 100% coverage
- [ ] Update documentation

---

### **Day 14 - Thursday: Token Refresh Mechanism (Part 1)**

**Goal:** Implement session management with auto-refresh

#### Full Day (9 AM - 5 PM)
**Task 14.1: Implement from Phase 1 Plan**

Follow **Day 1-3** from the Phase 1 plan (lines 31-683):

1. **Morning:** Create `user_sessions` table
   - [ ] Create migration
   - [ ] Apply locally
   - [ ] Verify RLS

2. **Afternoon:** Create `auth-refresh` Edge Function
   - [ ] Create function
   - [ ] Test locally
   - [ ] Deploy

3. **Evening:** Create SessionManager class
   - [ ] Create `src/utils/session-manager.ts`
   - [ ] Implement refresh logic
   - [ ] Add auto-refresh timer

**Checklist:**
- [ ] user_sessions table created
- [ ] auth-refresh function deployed
- [ ] SessionManager class created
- [ ] Basic tests passing

---

### **Day 15 - Friday: Token Refresh Mechanism (Part 2) & Feature Gating**

**Goal:** Complete session management and implement feature gating

#### Morning (9 AM - 12 PM)
**Task 15.1: Integrate SessionManager**

Follow **Day 3** from Phase 1 plan (lines 586-683):

- [ ] Update App.tsx
- [ ] Update login flow
- [ ] Test token refresh
- [ ] Fix any bugs

#### Afternoon (1 PM - 5 PM)
**Task 15.2: Implement Feature Gating**

**Feature 1: API Key Access Requires 80% Profile Completion**

```typescript
// File: src/components/dev-console/APIKeysManager.tsx

import { useProfile } from '../../hooks/useProfile';

export function APIKeysManager() {
  const { profile, loading } = useProfile();
  
  // Check completion
  const isEligible = profile?.completion_percentage >= 80;
  
  if (!isEligible) {
    return (
      <div className="locked-feature">
        <LockIcon />
        <h3>Complete Your Profile to Unlock API Keys</h3>
        <p>You need at least 80% profile completion to access API keys.</p>
        <p>Current completion: {profile?.completion_percentage}%</p>
        <Link to="/dashboard">Complete Profile →</Link>
      </div>
    );
  }
  
  return (
    // Normal API keys manager
  );
}
```

**Feature 2: Advanced Features Require 100%**

```typescript
// File: src/components/dev-console/WebhookSettings.tsx

export function WebhookSettings() {
  const { profile } = useProfile();
  
  if (profile?.completion_percentage < 100) {
    return (
      <EliteFeatureLock 
        currentCompletion={profile?.completion_percentage}
        requiredCompletion={100}
        featureName="Webhook Configuration"
      />
    );
  }
  
  return (
    // Webhook settings UI
  );
}
```

**Feature 3: Database-Level Enforcement**

```sql
-- File: supabase/migrations/20241220000000_feature_gating.sql

-- Add check constraint to api_keys
ALTER TABLE api_keys 
  ADD CONSTRAINT check_profile_complete_for_api_keys
  CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = api_keys.user_id
        AND p.completion_percentage >= 80
    )
  );

-- Function to check before insert
CREATE OR REPLACE FUNCTION check_feature_access()
RETURNS TRIGGER AS $$
DECLARE
  user_completion INT;
BEGIN
  SELECT completion_percentage INTO user_completion
  FROM profiles WHERE user_id = NEW.user_id;
  
  IF TG_TABLE_NAME = 'api_keys' AND user_completion < 80 THEN
    RAISE EXCEPTION 'Profile must be at least 80% complete to create API keys';
  END IF;
  
  IF TG_TABLE_NAME = 'webhooks' AND user_completion < 100 THEN
    RAISE EXCEPTION 'Profile must be 100% complete to configure webhooks';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
CREATE TRIGGER enforce_api_key_access
  BEFORE INSERT ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION check_feature_access();
```

**Checklist:**
- [ ] Add feature locks to UI components
- [ ] Create FeatureLock reusable component
- [ ] Add database constraints
- [ ] Test enforcement
- [ ] Document feature requirements

---

### **Day 16 - Saturday: Performance Audit & Optimization**

**Goal:** Ensure all RLS queries perform well

#### Morning (9 AM - 12 PM)
**Task 16.1: RLS Performance Audit**

**Step 1: Analyze query plans**
```sql
-- File: scripts/performance-audit.sql

-- Test critical queries with EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM profiles WHERE user_id = auth.uid();

EXPLAIN ANALYZE
SELECT * FROM api_keys WHERE user_id = auth.uid();

EXPLAIN ANALYZE
SELECT * FROM work_experiences WHERE user_id = auth.uid();

-- Check for sequential scans (bad)
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
ORDER BY idx_scan;

-- Find missing indexes on user_id
SELECT 
  t.tablename,
  CASE 
    WHEN i.indexname IS NULL THEN '❌ Missing'
    ELSE '✅ Exists'
  END AS user_id_index
FROM pg_tables t
LEFT JOIN pg_indexes i 
  ON t.tablename = i.tablename 
  AND i.indexdef LIKE '%user_id%'
WHERE t.schemaname = 'public'
ORDER BY t.tablename;
```

**Step 2: Add missing indexes**
```sql
-- File: supabase/migrations/20241221000000_rls_performance_indexes.sql

-- Add indexes where missing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verification_codes_user_id
  ON verification_codes(user_id) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_logs_business_id
  ON webhook_logs(business_id, created_at DESC);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_exp_user_current
  ON work_experiences(user_id, is_current) WHERE is_current = true;

-- Analyze all tables to update statistics
ANALYZE;
```

**Checklist:**
- [ ] Run EXPLAIN ANALYZE on all critical queries
- [ ] Identify slow queries (>50ms)
- [ ] Add missing indexes
- [ ] Verify performance improvements
- [ ] Document benchmarks

#### Afternoon (1 PM - 5 PM)
**Task 16.2: Load Testing**

**Create load test script:**
```typescript
// File: tests/load-test-rls.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadTest() {
  const queries = [
    () => supabase.from('profiles').select('*').eq('user_id', userId),
    () => supabase.from('api_keys').select('*').eq('user_id', userId),
    () => supabase.from('work_experiences').select('*').eq('user_id', userId),
  ];
  
  const results = [];
  
  for (const query of queries) {
    const start = Date.now();
    await query();
    const duration = Date.now() - start;
    results.push({ query: query.name, duration });
  }
  
  console.table(results);
  
  const slowQueries = results.filter(r => r.duration > 50);
  if (slowQueries.length > 0) {
    console.error('⚠️ Slow queries detected:', slowQueries);
  } else {
    console.log('✅ All queries under 50ms');
  }
}

loadTest();
```

**Checklist:**
- [ ] Create load test script
- [ ] Run with 100 concurrent users
- [ ] Identify bottlenecks
- [ ] Optimize slow queries
- [ ] Document results

---

### **Day 17 - Sunday: Documentation & Week Review**

**Goal:** Document Week 3 achievements and prepare for Week 4

#### Morning (9 AM - 12 PM)
**Task 17.1: Update Documentation**

Create/update these files:
- [ ] `docs/week-3-retrospective.md`
- [ ] `docs/security-definer-audit-summary.md`
- [ ] `docs/feature-gating-guide.md`
- [ ] `docs/performance-benchmarks.md`
- [ ] Update `docs/technical-debt-report.md`

#### Afternoon (1 PM - 5 PM)
**Task 17.2: Week 3 Retrospective**

Create comprehensive retrospective (similar to Week 2):
- Summary of achievements
- Metrics (RLS coverage, DEFINER functions, performance)
- Challenges and solutions
- Lessons learned
- Week 4 recommendations

---

## 📊 Success Criteria

| Metric | Week 2 | Week 3 Target | How to Measure |
|--------|--------|---------------|----------------|
| RLS Coverage | 91% | 100% | `SELECT COUNT(*) FROM pg_tables WHERE rowsecurity = true` |
| SECURITY DEFINER | 41 | <20 | `SELECT COUNT(*) FROM pg_proc WHERE prosecdef = true` |
| Query Performance | <10ms | <50ms | EXPLAIN ANALYZE on critical queries |
| Feature Gating | 0 | 3 features | Manual UI testing |
| Token Refresh | ❌ | ✅ | Auto-refresh test |
| Documentation | 5 docs | +5 docs | Count in /docs |

---

## 🎯 Key Deliverables

### Code
- [ ] 3-4 migrations (DEFINER refactor, RLS completion, feature gating, performance)
- [ ] SessionManager class
- [ ] 2 Edge Functions (auth-refresh, auth-create-session)
- [ ] 3 feature-gated components

### Documentation
- [ ] Security DEFINER audit spreadsheet
- [ ] Security DEFINER justification document
- [ ] Feature gating guide
- [ ] Performance benchmarks
- [ ] Week 3 retrospective

### Tests
- [ ] DEFINER function security tests
- [ ] RLS policy tests (100% coverage)
- [ ] Feature gating tests
- [ ] Performance load tests
- [ ] Token refresh integration tests

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Breaking DEFINER functions | High | Medium | Thorough testing, staged rollout |
| Performance regression | Medium | Low | Benchmark before/after, rollback plan |
| Feature gating too strict | Low | Medium | Start with warnings, enforce gradually |
| Token refresh bugs | High | Medium | Extensive testing, fallback to re-login |

---

## 🔄 Daily Standup Template

**What I did yesterday:**
- [List tasks completed]

**What I'm doing today:**
- [Today's tasks from plan]

**Blockers:**
- [Any issues or dependencies]

**Metrics:**
- RLS Coverage: X%
- DEFINER Functions: X
- Tests Passing: X/Y

---

## 📈 Week 3 vs Week 2 Comparison

| Aspect | Week 2 | Week 3 (Projected) |
|--------|--------|-------------------|
| **Focus** | RLS Implementation | Security hardening + Features |
| **Complexity** | Medium | High (refactoring existing code) |
| **Risk** | Low | Medium (breaking changes) |
| **User Impact** | Zero (transparent) | High (new feature gates) |
| **Technical Debt** | -14 points | -20 points |

---

## 🎉 Expected Outcomes

By end of Week 3:
- ✅ **100% RLS Coverage** - Every table secured
- ✅ **Minimal DEFINER Functions** - Only necessary ones remain
- ✅ **Feature Gating Live** - Profile completion drives access
- ✅ **Token Auto-Refresh** - Seamless user experience
- ✅ **Performance Optimized** - All queries <50ms
- ✅ **Documentation Complete** - Full security audit trail

**Week 3 Grade Target:** A (Meet Expectations)

---

## 🚀 Week 4 Preview

**Focus:** Data Quality & Finishing Touches
- Profile validation improvements
- Data consistency checks
- Edge case handling
- Final polish before AI implementation

---

**Generated:** December 16, 2024  
**Status:** Week 3 Plan Ready ✅  
**Next Step:** Day 11 - Security DEFINER Audit
