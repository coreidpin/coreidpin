# Production Deployment Checklist - Week 2

**Project:** CoreIDPIN (GidiPIN)  
**Deployment:** RLS & Profile Completion Features  
**Date:** December 15, 2024

---

## 🎯 Pre-Deployment Checklist

### **1. Database Migrations** ✅

**Files to Deploy:**
- [ ] `20241217000000_enable_rls_api_keys.sql`
- [ ] `20241217000001_enable_rls_profiles.sql`
- [ ] `20241217000002_enable_rls_business_profiles.sql`
- [ ] `20241218000000_enable_rls_user_tables.sql`
- [ ] `20241218000001_enable_rls_log_tables.sql`
- [ ] `20241219000000_enable_storage_rls.sql`
- [ ] `20241220000000_add_profile_completion_tracking.sql`

**Verification:**
```sql
-- Run this to verify all migrations applied:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'api_keys', 'profiles', 'business_profiles',
    'notifications', 'kyc_requests', 'professional_pins',
    'session_tokens', 'work_experiences',
    'api_usage_logs', 'audit_logs', 
    'email_verification_logs', 'pin_login_logs'
  );
-- All should have rowsecurity = true
```

---

### **2. Storage Bucket Policies** ✅

**Buckets to Configure:**
- [ ] avatars
- [ ] company-logos
- [ ] work-proofs
- [ ] media

**Verification:**
```sql
-- Check storage policies exist:
SELECT COUNT(*) FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects';
-- Should have at least 16 policies (4 per bucket)
```

---

### **3. Code Changes** ✅

**Files Modified:**
- [ ] `src/utils/session-manager.ts` (session sync)
- [ ] `src/features/auth/OTPVerifyForm.tsx` (session sync)
- [ ] `src/components/dashboard/ProfileCompletionWidget.tsx` (badge & messaging)
- [ ] `src/components/ProfessionalDashboard.tsx` (completion tracking)

**Git Status:**
```bash
git status
# Ensure all changes committed
git log --oneline -5
# Verify latest commits
```

---

### **4. Environment Variables** ✅

**Required:**
- [ ] `VITE_SUPABASE_URL` (production URL)
- [ ] `VITE_SUPABASE_ANON_KEY` (production anon key)
- [ ] All auth-related env vars

**Verification:**
```bash
# Check .env.production
cat .env.production | grep SUPABASE
```

---

### **5. Testing** ✅

**Run Tests:**
- [ ] RLS test suite passes
- [ ] Manual testing with real user
- [ ] Profile completion calculates correctly
- [ ] Image upload/persistence works
- [ ] No console errors

**Test Script:**
```bash
# Manual testing steps in section below
```

---

## 🧪 Pre-Deployment Testing

### **Test 1: RLS Verification**

```sql
-- In Production Supabase SQL Editor
-- Run: tests/rls-simplified-tests.sql
-- Expected: All tests pass
```

---

### **Test 2: Storage Upload**

1. Login to app
2. Go to Identity Management
3. Upload profile picture
4. Refresh page
5. ✅ Image should persist

---

### **Test 3: Profile Completion**

1. Complete all 5 checklist items
2. Check database:
```sql
SELECT profile_complete, completion_percentage, completed_at
FROM profiles
WHERE user_id = 'your-user-id';
```
3. ✅ Should see `profile_complete = true`, `completion_percentage = 100`

---

### **Test 4: Session Sync**

1. Login via OTP
2. Check console logs
3. ✅ Should see "✅ Supabase session synced for RLS"

---

## 🚀 Deployment Steps

### **Step 1: Backup Database**

```bash
# Via Supabase Dashboard:
# Settings → Database → Create backup
# Name: "pre-week2-deployment"
```

---

### **Step 2: Apply Migrations (In Order)**

**Order is important!**

```sql
-- Migration 1: api_keys RLS
-- Copy/paste: 20241217000000_enable_rls_api_keys.sql
-- Expected: "RLS successfully enabled on api_keys"

-- Migration 2: profiles RLS  
-- Copy/paste: 20241217000001_enable_rls_profiles.sql
-- Expected: "RLS successfully enabled on profiles"

-- Migration 3: business_profiles RLS
-- Copy/paste: 20241217000002_enable_rls_business_profiles.sql
-- Expected: "RLS successfully enabled on business_profiles"

-- Migration 4: User tables (bulk)
-- Copy/paste: 20241218000000_enable_rls_user_tables.sql
-- Expected: "All 5 tables secured successfully"

-- Migration 5: Log tables (bulk)
-- Copy/paste: 20241218000001_enable_rls_log_tables.sql
-- Expected: "All 4 log tables secured successfully"

-- Migration 6: Storage RLS
-- Copy/paste: 20241219000000_enable_storage_rls.sql
-- Expected: "Storage policies created"

-- Migration 7: Profile completion tracking
-- Copy/paste: 20241220000000_add_profile_completion_tracking.sql
-- Expected: "Profile completion tracking columns added"
```

---

### **Step 3: Verify Migrations**

```sql
-- Quick verification:
SELECT 
  '📊 RLS Status' as category,
  COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public'
  AND rowsecurity = true
  AND tablename IN (
    'api_keys', 'profiles', 'business_profiles',
    'notifications', 'kyc_requests', 'professional_pins',
    'session_tokens', 'work_experiences',
    'api_usage_logs', 'audit_logs', 
    'email_verification_logs', 'pin_login_logs'
  )
UNION ALL
SELECT 
  '📋 Total Policies',
  COUNT(*)
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'api_keys', 'profiles', 'business_profiles',
    'notifications', 'kyc_requests', 'professional_pins',
    'session_tokens', 'work_experiences',
    'api_usage_logs', 'audit_logs', 
    'email_verification_logs', 'pin_login_logs'
  );

-- Expected:
-- 📊 RLS Status: 12
-- 📋 Total Policies: 45+
```

---

### **Step 4: Deploy Frontend**

```bash
# Build production bundle
npm run build

# Deploy to hosting (Vercel/Netlify/etc)
# Follow your normal deployment process
```

---

### **Step 5: Smoke Test**

**5-Minute Test:**
1. ✅ Login works
2. ✅ Dashboard loads
3. ✅ Profile completion shows correct %
4. ✅ Image upload works
5. ✅ No console errors
6. ✅ RLS policies working (users can't see others' data)

---

## 📊 Post-Deployment Monitoring

### **First Hour**

**Monitor:**
- [ ] Error logs (Supabase dashboard → Logs)
- [ ] User reports (support channels)
- [ ] Performance (query times)
- [ ] RLS violations (look for "policy" errors)

**Query to check for issues:**
```sql
-- Check for RLS violations in last hour
SELECT * FROM auth.audit_log_entries
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND payload->>'error' ILIKE '%policy%'
ORDER BY created_at DESC;
```

---

### **First Day**

**Metrics to Track:**
- [ ] Profile completion rate
- [ ] Image upload success rate
- [ ] RLS policy violations (should be 0)
- [ ] Query performance (< 50ms)
- [ ] User complaints

**Dashboard:**
```sql
-- Profile completion stats
SELECT 
  COUNT(*) FILTER (WHERE profile_complete = true) as complete_profiles,
  COUNT(*) as total_profiles,
  ROUND(100.0 * COUNT(*) FILTER (WHERE profile_complete = true) / COUNT(*), 1) as completion_rate
FROM profiles;
```

---

## 🚨 Rollback Plan

### **If Something Goes Wrong:**

**Immediate Actions:**
1. Check error logs
2. Identify affected table(s)
3. Disable RLS temporarily:

```sql
-- Emergency: Disable RLS on specific table
ALTER TABLE problem_table DISABLE ROW LEVEL SECURITY;

-- This restores old behavior while you investigate
```

**Full Rollback:**
```sql
-- Disable RLS on all 12 tables
ALTER TABLE api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE professional_pins DISABLE ROW LEVEL SECURITY;
ALTER TABLE session_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_experiences DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE pin_login_logs DISABLE ROW LEVEL SECURITY;

-- Restore from backup if needed
```

---

## ✅ Success Criteria

**Deployment is successful if:**
- [ ] All 12 tables have RLS enabled
- [ ] No increase in error rate
- [ ] Users can access their own data
- [ ] Users cannot access others' data
- [ ] Profile completion tracking works
- [ ] Image uploads persist
- [ ] Performance acceptable (< 50ms queries)
- [ ] Zero RLS policy violations

---

## 📞 Emergency Contacts

**If issues arise:**
- **Database issues:** Check Supabase Discord
- **Code issues:** Development team Slack
- **Security issues:** Security team email

---

## 📝 Post-Deployment Tasks

**After Successful Deployment:**
- [ ] Update production notes
- [ ] Document any issues encountered
- [ ] Update monitoring dashboards
- [ ] Schedule post-deployment review
- [ ] Archive migration files
- [ ] Update Week 2 retrospective with production results

---

## 🎓 Lessons Learned Template

**Fill out after deployment:**

**What went well:**
- 
-
-

**What could be improved:**
-
-
-

**Action items:**
-
-
-

---

**Deployment Lead:** _______________  
**Date Deployed:** _______________  
**Status:** ⬜ Pending / ⬜ In Progress / ⬜ Complete / ⬜ Rolled Back
