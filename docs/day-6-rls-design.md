# Day 6: RLS Policy Designs 🔐

**Date:** December 15, 2024  
**Status:** Planning Complete  
**Tables to Fix:** 12 (3 Critical + 9 High)

---

## 📊 Audit Results

### **Current State:**
- **Total Tables:** 83
- **With RLS:** 64 (77%)
- **Without RLS:** 19 (23%)
- **SECURITY DEFINER Functions:** 41
- **RLS Policies:** 231

### **Tables Needing RLS:**

**🔴 CRITICAL (3):**
1. api_keys
2. business_profiles
3. profiles

**🟠 HIGH (9):**
4. api_usage_logs
5. audit_logs
6. email_verification_logs
7. kyc_requests
8. notifications
9. pin_login_logs
10. professional_pins
11. session_tokens
12. work_experiences

**🔵 LOW (7):** Analytics partitions, system tables

---

## 🔐 RLS Policy Designs

### **Pattern 1: User-Owned Data (Standard)**

**Use for:** api_keys, notifications, session_tokens, work_experiences, kyc_requests, professional_pins

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own data
CREATE POLICY "Users can view own {table}"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own data
CREATE POLICY "Users can create own {table}"
ON table_name FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own data
CREATE POLICY "Users can update own {table}"
ON table_name FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own data
CREATE POLICY "Users can delete own {table}"
ON table_name FOR DELETE
USING (auth.uid() = user_id);

-- Optional: Service role can manage all (for admin operations)
CREATE POLICY "Service role can manage all {table}"
ON table_name
USING (auth.role() = 'service_role');
```

---

### **Pattern 2: Profiles (Public + Private)**

**Use for:** profiles, business_profiles

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own profile (always)
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Anyone can view public profiles
CREATE POLICY "Public profiles are viewable"
ON profiles FOR SELECT
USING (
  public_profile_enabled = true 
  OR profile_url_slug IS NOT NULL
);

-- Policy 3: Users can update own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can insert own profile
CREATE POLICY "Users can create own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Service role can manage all
CREATE POLICY "Service role can manage all profiles"
ON profiles
USING (auth.role() = 'service_role');
```

---

### **Pattern 3: Audit/Log Tables (Write-Only, Read-Own)**

**Use for:** audit_logs, email_verification_logs, pin_login_logs, api_usage_logs

```sql
-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own logs
CREATE POLICY "Users can view own logs"
ON audit_logs FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: System can insert logs (via service role)
CREATE POLICY "System can insert logs"
ON audit_logs FOR INSERT
WITH CHECK (true); -- Allow insert, RLS on SELECT protects reading

-- Policy 3: No updates (logs are immutable)
-- (Don't create UPDATE policy - logs shouldn't be changed)

-- Policy 4: Service role can view all (for admin auditing)
CREATE POLICY "Service role can view all logs"
ON audit_logs FOR SELECT
USING (auth.role() = 'service_role');
```

---

## 📝 Migration Templates

### **Template 1: Standard User-Owned Table**

```sql
-- File: supabase/migrations/YYYYMMDD000000_enable_rls_{table_name}.sql

-- Step 1: Enable RLS
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop old policies (if any)
DROP POLICY IF EXISTS "Users can view own {table}" ON {table_name};
DROP POLICY IF EXISTS "Users can create own {table}" ON {table_name};
DROP POLICY IF EXISTS "Users can update own {table}" ON {table_name};
DROP POLICY IF EXISTS "Users can delete own {table}" ON {table_name};
DROP POLICY IF EXISTS "Service role can manage all {table}" ON {table_name};

-- Step 3: Create SELECT policy
CREATE POLICY "Users can view own {table}"
ON {table_name} FOR SELECT
USING (auth.uid() = user_id);

-- Step 4: Create INSERT policy
CREATE POLICY "Users can create own {table}"
ON {table_name} FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Step 5: Create UPDATE policy
CREATE POLICY "Users can update own {table}"
ON {table_name} FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 6: Create DELETE policy
CREATE POLICY "Users can delete own {table}"
ON {table_name} FOR DELETE
USING (auth.uid() = user_id);

-- Step 7: Service role policy
CREATE POLICY "Service role can manage all {table}"
ON {table_name}
USING (auth.role() = 'service_role');

-- Step 8: Verify RLS enabled
DO $$
BEGIN
  IF NOT (SELECT rowsecurity FROM pg_tables 
          WHERE tablename = '{table_name}') THEN
    RAISE EXCEPTION 'RLS not enabled on {table_name}';
  END IF;
END $$;

-- Step 9: Verify policies exist
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM pg_policies 
      WHERE tablename = '{table_name}') < 5 THEN
    RAISE WARNING 'Expected 5 policies, found %', 
      (SELECT COUNT(*) FROM pg_policies WHERE tablename = '{table_name}');
  END IF;
END $$;
```

---

## 🧪 Testing Template

```sql
-- Test RLS Policies for {table_name}

-- Setup: Create test users
BEGIN;

-- Test 1: User can see own data
SET request.jwt.claim.sub = 'test-user-1-id';
SELECT COUNT(*) FROM {table_name} WHERE user_id = 'test-user-1-id';
-- Expected: Count of user-1's rows

-- Test 2: User cannot see other's data
SELECT COUNT(*) FROM {table_name} WHERE user_id = 'test-user-2-id';
-- Expected: 0

-- Test 3: User can insert own data
INSERT INTO {table_name} (user_id, ...)
VALUES ('test-user-1-id', ...);
-- Expected: Success

-- Test 4: User cannot insert for others
INSERT INTO {table_name} (user_id, ...)
VALUES ('test-user-2-id', ...);
-- Expected: Policy violation error

-- Test 5: Unauthenticated user sees nothing
RESET request.jwt.claim.sub;
SELECT COUNT(*) FROM {table_name};
-- Expected: 0

-- Test 6: Service role sees all
SET ROLE service_role;
SELECT COUNT(*) FROM {table_name};
-- Expected: All rowsRESET ROLE;

ROLLBACK; -- Cleanup test data
```

---

## 📋 Implementation Checklist

### **Day 6 (Today) - Planning ✅**
- [x] Audit database state
- [x] Identify 12 tables needing RLS
- [x] Design RLS patterns
- [x] Create migration templates
- [x] Create testing templates

### **Day 7 (Tomorrow) - Critical Tables**
- [ ] api_keys RLS migration
- [ ] profiles RLS migration
- [ ] business_profiles RLS migration
- [ ] Test all 3 tables
- [ ] Verify SECURITY DEFINER functions

### **Day 8 (Wednesday) - High Priority Tables (Part 1)**
- [ ] session_tokens RLS
- [ ] work_experiences RLS
- [ ] notifications RLS
- [ ] professional_pins RLS
- [ ] kyc_requests RLS

### **Day 9 (Thursday) - High Priority (Part 2) + Testing**
- [ ] audit_logs RLS
- [ ] api_usage_logs RLS
- [ ] email_verification_logs RLS
- [ ] pin_login_logs RLS
- [ ] Comprehensive testing
- [ ] Performance validation

### **Day 10 (Friday) - Documentation**
- [ ] RLS implementation guide
- [ ] Update technical debt report
- [ ] Week 2 retrospective
- [ ] Plan Week 3

---

## 🎯 Success Criteria

### **By End of Week 2:**

**Security:**
- ✅ All 3 critical tables have RLS
- ✅ All 9 high-priority tables have RLS
- ✅ Zero data leaks in testing
- ✅ SECURITY DEFINER functions reviewed

**Performance:**
- ✅ All queries < 10ms
- ✅ Indexes support RLS policies
- ✅ No performance regression

**Testing:**
- ✅ SQL test suite for all tables
- ✅ Browser integration tests
- ✅ Security audit passed

**Documentation:**
- ✅ RLS patterns documented
- ✅ Migration guides written
- ✅ Team can implement RLS independently

---

## 💡 Key Insights

### **What We Learned:**

1. **Database is 77% secured** - Most tables already have RLS
2. **Only 12 tables need work** - Focused scope for Week 2
3. **3 critical tables** - api_keys, profiles, business_profiles
4. **41 SECURITY DEFINER functions** - Need review (separate task)

### **Risk Assessment:**

**Low Risk:**
- Most infrastructure exists
- Patterns are well-established
- Small number of tables

**Medium Risk:**
- profiles table is complex (public/private)
- SECURITY DEFINER functions need careful review

**High Risk:**
- api_keys contains secrets - must test thoroughly

---

## 🚀 Next Actions

### **Immediate (Today):**
- [x] Complete audit
- [x] Design policies
- [x] Create templates
- [x] Document patterns

### **Tomorrow (Day 7):**
1. Create migration for api_keys
2. Create migration for profiles
3. Create migration for business_profiles
4. Test all 3 migrations
5. Deploy to database

### **Day 8-10:**
Continue with high-priority tables

---

## 📊 Estimated Time

| Day | Tasks | Est. Time |
|-----|-------|-----------|
| Day 6 | Planning (DONE) | 1 hour ✅ |
| Day 7 | 3 critical tables | 3 hours |
| Day 8 | 5 high-priority tables | 3 hours |
| Day 9 | 4 tables + testing | 4 hours |
| Day 10 | Documentation | 2 hours |
| **TOTAL** | **12 tables + docs** | **13 hours** |

---

**Status:** Day 6 Complete ✅  
**Next:** Day 7 - Implement critical tables  
**Ready:** All templates and patterns documented
