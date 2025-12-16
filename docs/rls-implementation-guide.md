# Row Level Security (RLS) Implementation Guide

**Project:** CoreIDPIN (GidiPIN)  
**Purpose:** Comprehensive guide for implementing RLS on new tables  
**Last Updated:** December 15, 2024

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [RLS Quick Start](#rls-quick-start)
3. [Standard Patterns](#standard-patterns)
4. [Step-by-Step Guide](#step-by-step-guide)
5. [Testing](#testing)
6. [Common Issues](#common-issues)
7. [Best Practices](#best-practices)

---

## 🎯 Introduction

### What is RLS?

Row Level Security (RLS) is PostgreSQL's built-in mechanism for controlling which rows users can access. It's transparent to applications and enforced at the database level.

### Why Use RLS?

✅ **Security:** Prevent unauthorized data access  
✅ **Multi-tenancy:** Users only see their own data  
✅ **Compliance:** Meet data privacy requirements  
✅ **Defense in depth:** Works even if application code fails  

### When to Use RLS?

Use RLS for **any table containing user-specific data**:
- ✅ User profiles
- ✅ User-generated content
- ✅ Audit logs
- ✅ Private documents
- ❌ Public reference data (countries, categories)
- ❌ System configuration tables

---

## 🚀 RLS Quick Start

### 5-Minute Implementation

```sql
-- Step 1: Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Step 2: Users can view own rows
CREATE POLICY "Users can view own rows"
ON your_table FOR SELECT
USING (auth.uid() = user_id);

-- Step 3: Users can create own rows
CREATE POLICY "Users can create own rows"
ON your_table FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Step 4: Service role bypass (admin access)
CREATE POLICY "Service role has full access"
ON your_table
USING (auth.role() = 'service_role');

-- Done! ✅
```

---

## 📐 Standard Patterns

We have **3 proven patterns** for common use cases:

### Pattern 1: User-Owned Data (Most Common)

**Use For:** notifications, api_keys, work_experiences, etc.

**Policies:**
- ✅ SELECT: Users can view their own rows
- ✅ INSERT: Users can create rows for themselves
- ✅ UPDATE: Users can update their own rows
- ✅ DELETE: Users can delete their own rows
- ✅ Service Role: Admins can do anything

**Template:**
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own table_name" ON table_name;
DROP POLICY IF EXISTS "Users can create own table_name" ON table_name;
DROP POLICY IF EXISTS "Users can update own table_name" ON table_name;
DROP POLICY IF EXISTS "Users can delete own table_name" ON table_name;
DROP POLICY IF EXISTS "Service role can manage all table_name" ON table_name;

CREATE POLICY "Users can view own table_name"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own table_name"
ON table_name FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own table_name"
ON table_name FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own table_name"
ON table_name FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all table_name"
ON table_name
USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_table_name_user_id ON table_name(user_id);
```

---

### Pattern 2: Public + Private Data

**Use For:** profiles, business listings, portfolios

**Features:**
- Users can always see their own data
- Others can see data marked as public
- Private data remains hidden

**Template:**
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can always view their own
CREATE POLICY "Users can view own table_name"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Anyone can view public items
CREATE POLICY "Public table_name are viewable"
ON table_name FOR SELECT
USING (is_public = true);

-- Policy 3: Users can create their own
CREATE POLICY "Users can create own table_name"
ON table_name FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can update their own
CREATE POLICY "Users can update own table_name"
ON table_name FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 5: Service role access
CREATE POLICY "Service role can manage all table_name"
ON table_name
USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_table_name_user_id ON table_name(user_id);
CREATE INDEX IF NOT EXISTS idx_table_name_is_public ON table_name(is_public) WHERE is_public = true;
```

---

### Pattern 3: Audit/Log Tables

**Use For:** audit_logs, api_usage_logs, login_logs

**Features:**
- Users can view their own logs
- System can insert logs (any authenticated user)
- Logs are immutable (no UPDATE/DELETE)

**Template:**
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own logs
CREATE POLICY "Users can view own table_name"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: System can insert logs
CREATE POLICY "System can insert table_name"
ON table_name FOR INSERT
WITH CHECK (true);  -- Anyone authenticated can log

-- Policy 3: Service role access
CREATE POLICY "Service role can manage all table_name"
ON table_name
USING (auth.role() = 'service_role');

-- Note: No UPDATE or DELETE policies = immutable logs

CREATE INDEX IF NOT EXISTS idx_table_name_user_id ON table_name(user_id);
CREATE INDEX IF NOT EXISTS idx_table_name_created_at ON table_name(created_at);
```

---

## 📝 Step-by-Step Guide

### Step 1: Analyze Table

**Questions to ask:**
1. What data does this table contain?
2. Who should be able to view it?
3. Who should be able to modify it?
4. Is any data public?
5. Should logs be immutable?

**Example:** `work_experiences` table
- Contains: User's job history
- View: User only (private)
- Modify: User only
- Public: No
- Immutable: No
- **Pattern:** User-Owned Data ✅

---

### Step 2: Choose Pattern

| Pattern | When to Use |
|---------|-------------|
| **User-Owned** | Private data, user-specific |
| **Public + Private** | Profiles, listings with opt-in visibility |
| **Audit/Log** | Immutable logs, system-generated logs |

---

### Step 3: Create Migration File

**Naming Convention:**
```
YYYYMMDD000000_enable_rls_table_name.sql
```

**Example:**
```
20241220000000_enable_rls_projects.sql
```

**File Structure:**
```sql
-- ============================================================================
-- Enable RLS on table_name
-- File: 20241220000000_enable_rls_table_name.sql
-- ============================================================================

-- Step 1: Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop old policies (if any exist)
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Step 3-7: Create policies
-- ... (use pattern template)

-- Step 8: Verify RLS is enabled
DO $$
BEGIN
  IF NOT (SELECT rowsecurity FROM pg_tables 
          WHERE schemaname = 'public' AND tablename = 'table_name') THEN
    RAISE EXCEPTION 'RLS not enabled on table_name';
  END IF;
  
  RAISE NOTICE 'RLS successfully enabled on table_name';
END $$;

-- Step 9: Verify policies exist
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'table_name';
  
  IF policy_count < 3 THEN
    RAISE WARNING 'Expected at least 3 policies, found %', policy_count;
  ELSE
    RAISE NOTICE 'All % policies created successfully', policy_count;
  END IF;
END $$;

-- Step 10: Create index
CREATE INDEX IF NOT EXISTS idx_table_name_user_id ON table_name(user_id);
```

---

### Step 4: Test Migration Locally

```sql
-- Run in Supabase SQL Editor (development)
-- Copy/paste your migration file
-- Check for errors
-- Verify NOTICE messages
```

---

### Step 5: Test RLS Functionality

**Basic Tests:**
```sql
-- Test 1: Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'table_name';
-- Expected: rowsecurity = true

-- Test 2: List policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'table_name';
-- Expected: 3-5 policies

-- Test 3: Check index
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'table_name' AND indexdef ILIKE '%user_id%';
-- Expected: 1 index on user_id
```

**Functional Tests:**
```sql
-- Test 4: Simulate user query
SET request.jwt.claim.sub = 'test-user-id';
SELECT COUNT(*) FROM table_name WHERE user_id = 'test-user-id';
-- Expected: >= 0 (should not error)

-- Test 5: Cannot see others
SELECT COUNT(*) FROM table_name WHERE user_id != 'test-user-id';
-- Expected: 0

-- Reset
RESET request.jwt.claim.sub;
```

---

### Step 6: Apply to Production

**Process:**
1. ✅ Test locally (development Supabase)
2. ✅ Code review (check with team)
3. ✅ Backup database (just in case)
4. ✅ Apply migration (production Supabase)
5. ✅ Run verification tests
6. ✅ Monitor for issues (check logs)

**Rollback Plan:**
```sql
-- If something goes wrong:
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
-- Then investigate and fix
```

---

## 🧪 Testing

### Testing Checklist

**Before Deployment:**
- [ ] RLS enabled on table
- [ ] All policies created
- [ ] Index on `user_id` exists
- [ ] Users can view own data
- [ ] Users cannot view others' data
- [ ] Service role has full access
- [ ] No SQL errors in migration

**After Deployment:**
- [ ] Application works normally
- [ ] Users can perform CRUD operations
- [ ] No unauthorized access
- [ ] Performance acceptable (< 50ms queries)
- [ ] Monitor for RLS violations in logs

---

### Test Script Template

```sql
-- ============================================================================
-- RLS Tests for table_name
-- ============================================================================

-- Setup
DO $$
BEGIN
  RAISE NOTICE 'Testing RLS on table_name';
END $$;

-- Test 1: RLS Enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'table_name';
-- Expected: rowsecurity = true

-- Test 2: Policies Exist
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'table_name';
-- Expected: >= 3

-- Test 3: User Can View Own Data
SET request.jwt.claim.sub = 'user-a-id';
SELECT COUNT(*) FROM table_name WHERE user_id = 'user-a-id';
-- Expected: >= 0 (no error)

-- Test 4: User Cannot View Others
SELECT COUNT(*) FROM table_name WHERE user_id = 'user-b-id';
-- Expected: 0

-- Reset
RESET request.jwt.claim.sub;

-- Test 5: Anonymous Cannot View
SELECT COUNT(*) FROM table_name;
-- Expected: 0 or error

DO $$
BEGIN
  RAISE NOTICE '✅ All tests passed for table_name';
END $$;
```

---

## ⚠️ Common Issues

### Issue 1: `auth.uid()` Returns NULL

**Symptom:** Policies block all access

**Cause:** Custom authentication not synced with Supabase

**Solution:**
```typescript
// Sync custom auth tokens with Supabase
await supabase.auth.setSession({
  access_token: yourAccessToken,
  refresh_token: yourRefreshToken
});
```

---

### Issue 2: Policy Too Permissive

**Symptom:** Users can see data they shouldn't

**Bad Policy:**
```sql
CREATE POLICY "Users can view data"
ON table_name FOR SELECT
USING (true);  -- ❌ Allows everyone!
```

**Good Policy:**
```sql
CREATE POLICY "Users can view own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);  -- ✅ Restricted
```

---

### Issue 3: Missing Index

**Symptom:** Slow queries after enabling RLS

**Cause:** No index on `user_id` column

**Solution:**
```sql
CREATE INDEX IF NOT EXISTS idx_table_name_user_id ON table_name(user_id);
```

---

### Issue 4: Conflicting Policies

**Symptom:** Unpredictable access behavior

**Cause:** Multiple policies with OR logic

**Solution:**
```sql
-- Drop all policies
DROP POLICY IF EXISTS "old_policy_1" ON table_name;
DROP POLICY IF EXISTS "old_policy_2" ON table_name;

-- Create clean set
-- ... (from pattern template)
```

---

### Issue 5: Service Role Blocked

**Symptom:** Admin operations fail

**Cause:** Missing service role policy

**Solution:**
```sql
CREATE POLICY "Service role can manage all"
ON table_name
USING (auth.role() = 'service_role');
```

---

## ✅ Best Practices

### 1. Always Include Service Role Policy

**Why:** Admins need access for support, debugging

```sql
CREATE POLICY "Service role can manage all table_name"
ON table_name
USING (auth.role() = 'service_role');
```

---

### 2. Create Indexes for RLS

**Why:** Prevents table scans on large tables

```sql
CREATE INDEX IF NOT EXISTS idx_table_name_user_id 
ON table_name(user_id);
```

---

### 3. Use Descriptive Policy Names

**Bad:**
```sql
CREATE POLICY "policy_1" ON table_name ...
```

**Good:**
```sql
CREATE POLICY "Users can view own notifications" ON notifications ...
```

---

### 4. Test with Real User IDs

**Don't:**
```sql
SET request.jwt.claim.sub = 'test';
```

**Do:**
```sql
SET request.jwt.claim.sub = 'e86e846c-ec59-445f-aedc-6e6a1f983ed8';
```

---

### 5. Document Special Cases

**Example:**
```sql
-- Note: Public profiles require is_public column
-- If column doesn't exist, skip this policy
CREATE POLICY "Public profiles are viewable"
ON profiles FOR SELECT
USING (is_public = true);
```

---

### 6. One Migration Per Logical Unit

**Good:** One file for `api_keys` RLS

**Better:** Bulk file for similar tables (e.g., all log tables)

**Bad:** All tables in one massive file

---

### 7. Verify in Migration

**Include verification:**
```sql
DO $$
BEGIN
  IF NOT (SELECT rowsecurity FROM pg_tables ...) THEN
    RAISE EXCEPTION 'RLS not enabled';
  END IF;
END $$;
```

---

### 8. Handle JSONB Carefully

**Don't assume types:**
```sql
-- THIS MAY FAIL:
jsonb_array_length(skills)

-- CHECK TYPE FIRST:
CASE WHEN skills IS NOT NULL 
  AND jsonb_typeof(skills) = 'array' 
  AND jsonb_array_length(skills) > 0 
THEN ...
```

---

## 🔒 Security Checklist

Before marking RLS "complete" on a table:

- [ ] RLS enabled: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- [ ] Users can view only their own data
- [ ] Users cannot view/modify others' data
- [ ] Service role has admin access
- [ ] No policy allows `USING (true)` for sensitive operations
- [ ] Index on `user_id` created
- [ ] Migration includes verification
- [ ] Tested with real user IDs
- [ ] Performance acceptable
- [ ] Documented any special cases

---

## 📚 Reference

### Useful Queries

**Check RLS status:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**List all policies:**
```sql
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

**Find tables without RLS:**
```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false;
```

**Count policies per table:**
```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC;
```

---

## 🎓 Learning Resources

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- CoreIDPIN `docs/day-6-rls-design.md` (internal)
- CoreIDPIN `tests/rls-simplified-tests.sql` (examples)

---

## 📞 Support

**Questions?** Check:
1. This guide
2. `docs/day-6-rls-design.md`
3. `tests/rls-simplified-tests.sql`
4. Team Slack (ask security team)

**Found a bug?** Report in:
- GitHub Issues
- Security team channel

---

**Version:** 1.0  
**Last Updated:** December 15, 2024  
**Author:** Development Team
