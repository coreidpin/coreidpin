# Week 2 - RLS Implementation Breakdown 🔐

**Dates:** December 16-20, 2024  
**Focus:** Row Level Security (RLS) Implementation  
**Goal:** Secure database with proper RLS policies, remove SECURITY DEFINER bypass

---

## 🎯 Week 2 Objectives

### **Primary Goal:**
Replace all `SECURITY DEFINER` functions with proper RLS policies to ensure data security.

### **Key Deliverables:**
1. RLS policies for critical tables (api_keys, profiles, user_sessions)
2. Remove SECURITY DEFINER bypass functions
3. Test RLS with real users
4. Ensure no data leaks
5. Document RLS patterns for team

### **Success Metrics:**
- ✅ Zero SECURITY DEFINER functions (except cleanup)
- ✅ All tables have RLS enabled
- ✅ All policies tested and working
- ✅ No unauthorized data access
- ✅ Performance maintained (< 10ms queries)

---

## 📅 Day-by-Day Breakdown

### **Day 6: Monday - RLS Policy Design** 📋

**Duration:** 2-3 hours  
**Focus:** Research, design, and plan RLS policies

#### **Tasks:**

1. **Audit Current State** (30 min)
   ```sql
   -- Find all tables without RLS
   SELECT tablename 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND NOT rowsecurity;
   
   -- Find all SECURITY DEFINER functions
   SELECT routine_name, security_type
   FROM information_schema.routines
   WHERE routine_schema = 'public'
   AND security_type = 'DEFINER';
   ```

2. **Prioritize Tables** (30 min)
   - **High Priority:** api_keys, profiles, user_sessions
   - **Medium Priority:** work_experience, education, skills
   - **Low Priority:** analytics, logs

3. **Design RLS Policies** (1 hour)
   
   **api_keys table:**
   ```sql
   -- Policy 1: Users can view their own API keys
   CREATE POLICY "Users can view own api_keys"
   ON api_keys FOR SELECT
   USING (auth.uid() = user_id);
   
   -- Policy 2: Users can create their own API keys
   CREATE POLICY "Users can create own api_keys"
   ON api_keys FOR INSERT
   WITH CHECK (auth.uid() = user_id);
   
   -- Policy 3: Users can update their own API keys
   CREATE POLICY "Users can update own api_keys"
   ON api_keys FOR UPDATE
   USING (auth.uid() = user_id);
   
   -- Policy 4: Users can delete their own API keys
   CREATE POLICY "Users can delete own api_keys"
   ON api_keys FOR DELETE
   USING (auth.uid() = user_id);
   ```

4. **Create Migration Template** (30 min)
   ```sql
   -- Template for RLS migration
   -- File: 20241216000000_enable_rls_api_keys.sql
   
   -- Step 1: Enable RLS
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
   
   -- Step 2: Drop old policies (if any)
   DROP POLICY IF EXISTS "policy_name" ON table_name;
   
   -- Step 3: Create new policies
   CREATE POLICY "Users can view own data"
   ON table_name FOR SELECT
   USING (auth.uid() = user_id);
   
   -- Step 4: Test policies
   -- Run as authenticated user
   SET ROLE authenticated;
   SET request.jwt.claim.sub = 'test-user-id';
   SELECT * FROM table_name; -- Should only see own data
   RESET ROLE;
   
   -- Step 5: Verify RLS enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'table_name';
   ```

5. **Document Patterns** (30 min)
   - User-owned data pattern
   - Public data pattern
   - Admin-only pattern
   - Service role pattern

#### **Deliverables:**
- [ ] RLS audit complete
- [ ] Policy designs documented
- [ ] Migration templates created
- [ ] Testing plan written

#### **Success Criteria:**
- All critical tables identified
- RLS patterns documented
- Team understands approach

---

### **Day 7: Tuesday - api_keys RLS Implementation** 🔑

**Duration:** 2-3 hours  
**Focus:** Implement and test RLS for api_keys table

#### **Tasks:**

1. **Create Migration** (30 min)
   ```sql
   -- File: supabase/migrations/20241217000000_enable_rls_api_keys.sql
   
   -- Enable RLS on api_keys
   ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
   
   -- Drop existing policies
   DROP POLICY IF EXISTS "Users can view own api_keys" ON api_keys;
   DROP POLICY IF EXISTS "Users can create own api_keys" ON api_keys;
   DROP POLICY IF EXISTS "Users can update own api_keys" ON api_keys;
   DROP POLICY IF EXISTS "Users can delete own api_keys" ON api_keys;
   
   -- Policy 1: SELECT - Users see only their keys
   CREATE POLICY "Users can view own api_keys"
   ON api_keys FOR SELECT
   USING (auth.uid() = user_id);
   
   -- Policy 2: INSERT - Users can create keys for themselves
   CREATE POLICY "Users can create own api_keys"
   ON api_keys FOR INSERT
   WITH CHECK (auth.uid() = user_id);
   
   -- Policy 3: UPDATE - Users can update their own keys
   CREATE POLICY "Users can update own api_keys"
   ON api_keys FOR UPDATE
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);
   
   -- Policy 4: DELETE - Users can delete their own keys
   CREATE POLICY "Users can delete own api_keys"
   ON api_keys FOR DELETE
   USING (auth.uid() = user_id);
   
   -- Service role can do everything (for admin operations)
   CREATE POLICY "Service role can manage all api_keys"
   ON api_keys
   USING (auth.role() = 'service_role');
   ```

2. **Update Functions** (1 hour)
   
   Remove `SECURITY DEFINER` from api_key functions:
   
   ```sql
   -- Before (INSECURE - bypasses RLS)
   CREATE OR REPLACE FUNCTION create_api_key(...)
   RETURNS api_keys
   SECURITY DEFINER  -- ❌ Remove this!
   AS $$
   BEGIN
     INSERT INTO api_keys ...
   END;
   $$;
   
   -- After (SECURE - respects RLS)
   CREATE OR REPLACE FUNCTION create_api_key(...)
   RETURNS api_keys
   SECURITY INVOKER  -- ✅ Or remove SECURITY clause entirely
   AS $$
   BEGIN
     INSERT INTO api_keys ...
     -- RLS automatically enforces user_id = auth.uid()
   END;
   $$;
   ```

3. **Test RLS Policies** (1 hour)
   
   ```sql
   -- Test 1: User can see own keys
   SELECT set_config('request.jwt.claim.sub', 'user-1-id', true);
   SELECT * FROM api_keys WHERE user_id = 'user-1-id';
   -- Should return user-1's keys
   
   -- Test 2: User cannot see other's keys
   SELECT * FROM api_keys WHERE user_id = 'user-2-id';
   -- Should return 0 rows
   
   -- Test 3: User can create own key
   INSERT INTO api_keys (user_id, key_name, api_key)
   VALUES ('user-1-id', 'Test Key', 'test_key_123');
   -- Should succeed
   
   -- Test 4: User cannot create key for others
   INSERT INTO api_keys (user_id, key_name, api_key)
   VALUES ('user-2-id', 'Test Key', 'test_key_456');
   -- Should fail with RLS violation
   
   -- Test 5: Service role can see all
   SET ROLE service_role;
   SELECT COUNT(*) FROM api_keys;
   -- Should see all keys
   RESET ROLE;
   ```

4. **Update Client Code** (30 min)
   
   No changes needed if using Supabase client correctly:
   
   ```typescript
   // ✅ This automatically respects RLS
   const { data, error } = await supabase
     .from('api_keys')
     .select('*');
   
   // Returns only current user's keys
   ```

#### **Deliverables:**
- [ ] Migration created and tested
- [ ] Functions updated (SECURITY DEFINER removed)
- [ ] RLS policies tested
- [ ] Client code verified

#### **Success Criteria:**
- RLS enabled on api_keys
- All tests passing
- No unauthorized access possible
- Performance < 10ms

---

### **Day 8: Wednesday - profiles & sessions RLS** 👤

**Duration:** 3-4 hours  
**Focus:** Implement RLS for profiles and user_sessions

#### **Tasks:**

1. **profiles Table RLS** (1.5 hours)
   
   ```sql
   -- File: supabase/migrations/20241218000000_enable_rls_profiles.sql
   
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   
   -- Policy 1: Users can view own profile
   CREATE POLICY "Users can view own profile"
   ON profiles FOR SELECT
   USING (auth.uid() = user_id);
   
   -- Policy 2: Public profiles viewable by all
   CREATE POLICY "Public profiles are viewable"
   ON profiles FOR SELECT
   USING (public_profile_enabled = true);
   
   -- Policy 3: Users can update own profile
   CREATE POLICY "Users can update own profile"
   ON profiles FOR UPDATE
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);
   
   -- Policy 4: Users can create own profile
   CREATE POLICY "Users can create own profile"
   ON profiles FOR INSERT
   WITH CHECK (auth.uid() = user_id);
   ```

2. **user_sessions Table RLS** (1 hour)
   
   Already done in Week 1! ✅ Just verify:
   
   ```sql
   -- Verify RLS enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'user_sessions';
   
   -- Verify policies exist
   SELECT policyname 
   FROM pg_policies 
   WHERE tablename = 'user_sessions';
   ```

3. **work_experience, education, skills RLS** (1.5 hours)
   
   Same pattern for all:
   
   ```sql
   -- Generic pattern for user-owned tables
   ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users manage own work_experience"
   ON work_experience
   USING (auth.uid() = user_id);
   
   -- Repeat for:
   -- - education
   -- - skills
   -- - certifications
   -- - projects
   ```

#### **Deliverables:**
- [ ] profiles RLS implemented
- [ ] user_sessions RLS verified
- [ ] Related tables RLS enabled
- [ ] All policies tested

#### **Success Criteria:**
- All user-data tables have RLS
- Users can only see/edit own data
- Public profiles work correctly
- Performance maintained

---

### **Day 9: Thursday - Testing & Validation** 🧪

**Duration:** 3-4 hours  
**Focus:** Comprehensive RLS testing

#### **Tasks:**

1. **Create RLS Test Suite** (1 hour)
   
   ```sql
   -- File: tests/rls-tests.sql
   
   -- Test Suite: api_keys RLS
   
   -- Setup test users
   DO $$
   BEGIN
     -- Create test user 1
     PERFORM set_config('request.jwt.claim.sub', 'test-user-1', true);
     INSERT INTO api_keys (user_id, key_name, api_key)
     VALUES ('test-user-1', 'User 1 Key', 'key_1');
     
     -- Create test user 2
     PERFORM set_config('request.jwt.claim.sub', 'test-user-2', true);
     INSERT INTO api_keys (user_id, key_name, api_key)
     VALUES ('test-user-2', 'User 2 Key', 'key_2');
   END $$;
   
   -- Test 1: User 1 sees only their keys
   SELECT set_config('request.jwt.claim.sub', 'test-user-1', true);
   SELECT COUNT(*) FROM api_keys; -- Should be 1
   
   -- Test 2: User 2 cannot see User 1's keys
   SELECT set_config('request.jwt.claim.sub', 'test-user-2', true);
   SELECT COUNT(*) FROM api_keys WHERE user_id = 'test-user-1'; -- Should be 0
   
   -- Test 3: Unauthorized access fails
   RESET ROLE;
   SELECT COUNT(*) FROM api_keys; -- Should be 0 (no auth)
   
   -- Cleanup
   DELETE FROM api_keys WHERE user_id IN ('test-user-1', 'test-user-2');
   ```

2. **Browser-based Testing** (1 hour)
   
   Test in actual app:
   
   ```typescript
   // Test 1: Login as User A
   // Create API key
   // Verify it appears in list
   
   // Test 2: Login as User B
   // Try to access User A's key by ID
   // Should fail with 403 or return empty
   
   // Test 3: Public profile
   // Enable public profile in settings
   // Logout
   // Visit /profile/{slug}
   // Should see public profile
   
   // Test 4: Private profile
   // Login as different user
   // Try to view someone's private profile
   // Should not see sensitive data
   ```

3. **Performance Testing** (1 hour)
   
   ```sql
   -- Test query performance with RLS
   EXPLAIN ANALYZE
   SELECT * FROM api_keys WHERE user_id = auth.uid();
   -- Should use index, < 1ms
   
   EXPLAIN ANALYZE
   SELECT * FROM profiles WHERE user_id = auth.uid();
   -- Should use index, < 5ms
   
   EXPLAIN ANALYZE
   SELECT * FROM work_experience WHERE user_id = auth.uid();
   -- Should use index, < 5ms
   ```

4. **Security Audit** (1 hour)
   
   ```bash
   # Check for remaining SECURITY DEFINER functions
   SELECT routine_name 
   FROM information_schema.routines
   WHERE security_type = 'DEFINER'
   AND routine_schema = 'public';
   
   # Check all tables have RLS
   SELECT tablename 
   FROM pg_tables 
   WHERE schemaname = 'public'
   AND NOT rowsecurity;
   
   # Check for tables without policies
   SELECT tablename
   FROM pg_tables
   WHERE schemaname = 'public'
   AND rowsecurity = true
   AND tablename NOT IN (
     SELECT DISTINCT tablename FROM pg_policies
   );
   ```

#### **Deliverables:**
- [ ] SQL test suite created
- [ ] Browser tests completed
- [ ] Performance validated
- [ ] Security audit passed

#### **Success Criteria:**
- All RLS tests passing
- No data leaks found
- Performance acceptable
- Zero SECURITY DEFINER functions

---

### **Day 10: Friday - Documentation & Review** 📚

**Duration:** 2-3 hours  
**Focus:** Document RLS implementation and create guides

#### **Tasks:**

1. **RLS Implementation Guide** (1 hour)
   
   ```markdown
   # RLS Implementation Guide
   
   ## Overview
   Row Level Security (RLS) ensures users can only access their own data.
   
   ## Pattern: User-Owned Data
   
   ```sql
   CREATE POLICY "Users manage own data"
   ON table_name
   USING (auth.uid() = user_id);
   ```
   
   ## Pattern: Public + Private Data
   
   ```sql
   -- Private data
   CREATE POLICY "Users view own private data"
   ON profiles FOR SELECT
   USING (auth.uid() = user_id);
   
   -- Public data
   CREATE POLICY "Anyone views public data"
   ON profiles FOR SELECT
   USING (public_profile_enabled = true);
   ```
   
   ## Testing RLS
   
   ```sql
   -- Test as specific user
   SELECT set_config('request.jwt.claim.sub', 'user-id', true);
   SELECT * FROM table_name;
   ```
   
   ## Common Issues
   
   1. **Infinite recursion**: Don't reference same table in policy
   2. **Performance**: Always filter on indexed columns
   3. **Service role**: Bypasses RLS by default
   ```

2. **Week 2 Retrospective** (1 hour)
   
   Document:
   - What was completed
   - Challenges faced
   - Lessons learned
   - Recommendations for Week 3

3. **Update Technical Debt Report** (30 min)
   
   Mark RLS items as COMPLETE:
   - ✅ RLS enabled on critical tables
   - ✅ SECURITY DEFINER functions removed
   - ✅ Data access properly secured

4. **Create Week 3 Plan** (30 min)
   
   Preview next week's goals

#### **Deliverables:**
- [ ] RLS guide written
- [ ] Week 2 retrospective complete
- [ ] Technical debt updated
- [ ] Week 3 planned

#### **Success Criteria:**
- Team understands RLS patterns
- All work documented
- Ready for Week 3

---

## 📊 Week 2 Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Tables with RLS** | 100% | `SELECT COUNT(*) FROM pg_tables WHERE rowsecurity` |
| **SECURITY DEFINER** | 0 | `SELECT COUNT(*) FROM routines WHERE security_type='DEFINER'` |
| **Data Leaks** | 0 | Manual testing |
| **Query Performance** | < 10ms | `EXPLAIN ANALYZE` |
| **Test Coverage** | > 90% | SQL + Browser tests |

---

## 🎯 Week 2 Deliverables

### **Code:**
- [ ] 5 RLS migrations
- [ ] Updated functions (remove SECURITY DEFINER)
- [ ] RLS test suite

### **Documentation:**
- [ ] RLS implementation guide
- [ ] Testing documentation
- [ ] Week 2 retrospective
- [ ] Updated technical debt report

### **Tests:**
- [ ] SQL RLS tests
- [ ] Browser integration tests
- [ ] Performance tests
- [ ] Security audit

---

## 💡 Tips for Success

1. **Start Small:** Begin with api_keys (simplest table)
2. **Test Everything:** RLS bugs are security critical
3. **Use Patterns:** Reuse successful policy designs
4. **Document As You Go:** Don't wait until Friday
5. **Ask for Help:** RLS can be tricky

---

## 🚨 Common Pitfalls

1. **Forgetting WITH CHECK:** INSERT/UPDATE need both USING and WITH CHECK
2. **Testing Only SELECT:** Test all operations (INSERT, UPDATE, DELETE)
3. **Service Role in Production:** Remember it bypasses RLS
4. **Performance Impact:** Always use indexed columns in policies
5. **Policy Conflicts:** Drop old policies before creating new ones

---

## ⏭️ Week 3 Preview

**Focus:** Data Quality & Validation  
**Goals:**
- Implement check constraints
- Add data validation
- Clean up orphaned records
- Optimize queries

---

**Status:** Week 2 Plan Complete ✅  
**Ready to Start:** Day 6 (Monday) 🚀  
**Estimated Time:** 12-15 hours total
