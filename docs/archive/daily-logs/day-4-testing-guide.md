# Day 4 - Testing & Validation Guide 🧪

**Date:** December 15, 2024  
**Status:** READY FOR TESTING  
**Duration:** 2-3 hours

---

## 📋 Overview

Day 4 focuses on comprehensive testing of the authentication system built in Days 1-3. We'll test:
- ✅ Normal flows (login, refresh, logout)
- ✅ Edge cases (expired tokens, network failures)
- ✅ Database integrity
- ✅ Performance
- ✅ Security

---

## 🎯 Testing Checklist

### Pre-Testing Setup

- [ ] Deploy `auth-refresh` Edge Function
- [ ] Deploy `auth-create-session` Edge Function
- [ ] Apply database migration (user_sessions table)
- [ ] Verify cron job scheduled
- [ ] App running locally or deployed

---

## 🧪 Test Suite 1: Browser Console Tests

### Step 1: Load Test Utilities

1. Open your app in browser
2. Open DevTools Console (F12)
3. Copy contents of `tests/session-manager-tests.ts`
4. Paste into console
5. Press Enter

**Expected Output:**
```
✅ Test utilities loaded!
Run: testUtils.runAllTests()
```

### Step 2: Run All Tests

```javascript
testUtils.runAllTests()
```

**Expected Output:**
```
🧪 Running SessionManager Tests...

📦 Testing localStorage data...
✅ localStorage Data: All required keys present

⏰ Testing token expiry...
✅ Token Expiry: Token expires in 59 minutes

🔑 Testing refresh token format...
✅ Refresh Token Format: Valid 64-character hex token

🔐 Testing SessionManager state...
✅ SessionManager State: SessionManager is active

💾 Testing database session...
✅ Database Session: Session found in database

🔄 Testing token refresh...
✅ Token Refresh: Token refresh successful

════════════════════════════════════════════════════════════
📊 TEST SUMMARY
════════════════════════════════════════════════════════════
Total Tests: 7
✅ Passed: 7
❌ Failed: 0
⏳ Pending/Manual: 0
════════════════════════════════════════════════════════════
```

### Step 3: Document Results

Record results in `tests/edge-case-scenarios.md`

---

## 🗄️ Test Suite 2: Database Tests

### Step 1: Open Supabase SQL Editor

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Open `tests/database-tests.sql`

### Step 2: Run Quick Health Check

Copy and run this query:

```sql
SELECT 
  'Total Sessions' as metric, COUNT(*)::text as value
FROM user_sessions
UNION ALL
SELECT 
  'Active Sessions', COUNT(*)::text
FROM user_sessions WHERE is_active = true
UNION ALL
SELECT 
  'Unique Users', COUNT(DISTINCT user_id)::text
FROM user_sessions
UNION ALL
SELECT 
  'Expired Sessions', COUNT(*)::text
FROM user_sessions WHERE refresh_token_expires_at < NOW()
UNION ALL
SELECT 
  'Sessions Today', COUNT(*)::text
FROM user_sessions WHERE created_at > CURRENT_DATE
UNION ALL
SELECT 
  'Sessions This Week', COUNT(*)::text
FROM user_sessions WHERE created_at > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
  'Cleanup Job Exists', 
  CASE WHEN EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-expired-sessions') 
    THEN 'Yes' 
    ELSE 'No' 
  END
UNION ALL
SELECT 
  'RLS Enabled',
  CASE WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'user_sessions')
    THEN 'Yes'
    ELSE 'No'
  END;
```

**Expected:**
```
metric                | value
--------------------- | -----
Total Sessions        | 1 (or more)
Active Sessions       | 1 (or more)
Unique Users          | 1 (or more)
Expired Sessions      | 0
Sessions Today        | 1 (or more)
Sessions This Week    | 1 (or more)
Cleanup Job Exists    | Yes
RLS Enabled           | Yes
```

### Step 3: Run All Database Tests

Go through each test in `tests/database-tests.sql` (Tests 1-20)

**Checklist:**
- [ ] Test 1: Table exists ✅
- [ ] Test 2: Structure correct ✅
- [ ] Test 3: RLS enabled ✅
- [ ] Test 4: Policies exist ✅
- [ ] Test 5: Indexes created ✅
- [ ] Test 6: Session counts ✅
- [ ] Test 7: Recent sessions ✅
- [ ] Test 11: Cleanup function works ✅
- [ ] Test 13: Cron job exists ✅
- [ ] Test 17-18: Performance < 1ms ✅

---

## 🎭 Test Suite 3: Edge Case Scenarios

### Follow the guide in `tests/edge-case-scenarios.md`

**Priority Scenarios:**

#### Scenario 1: Fresh Login ⭐⭐⭐
1. Clear localStorage
2. Login
3. Verify session created

**Checklist:**
- [ ] localStorage has all keys
- [ ] Console shows success messages
- [ ] Database has new session
- [ ] SessionManager initialized

#### Scenario 2: Page Refresh ⭐⭐⭐
1. Login
2. Refresh page (F5)
3. Verify still logged in

**Checklist:**
- [ ] No redirect to login
- [ ] SessionManager re-initializes
- [ ] Token expiry still valid

#### Scenario 3: Token About to Expire ⭐⭐⭐
1. Set expiry to 4 min from now
2. Wait 2 minutes
3. Watch auto-refresh

**Checklist:**
- [ ] Auto-refresh triggers
- [ ] New token obtained
- [ ] Expiry updated to ~1 hour

#### Scenario 4: Token Expired ⭐⭐
1. Set expiry to past
2. Wait for auto-check
3. Verify logout

**Checklist:**
- [ ] Session cleared
- [ ] Redirect to login
- [ ] Toast message shown

#### Scenario 8: Logout ⭐⭐⭐
1. Login
2. Click logout
3. Verify cleanup

**Checklist:**
- [ ] localStorage cleared
- [ ] SessionManager destroyed
- [ ] Redirect to login

---

## 🐛 Bug Tracking

### Found Bugs

Use this template:

```markdown
### Bug #X: [Title]

**Severity:** Critical / High / Medium / Low

**Description:**
[What went wrong]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Console Errors:**
```
[Paste console errors]
```

**Fix Applied:**
[How you fixed it]

**Status:** Open / In Progress / Fixed / Won't Fix
```

---

## ✅ Success Criteria

### All Tests Must Pass:

**Browser Tests:**
- [x] localStorage data test
- [x] Token expiry test
- [x] Refresh token format test
- [x] SessionManager state test
- [x] Database session test
- [x] Token refresh test

**Database Tests:**
- [x] Table structure correct
- [x] RLS enabled
- [x] Policies configured
- [x] Indexes created
- [x] Cron job scheduled
- [x] Performance < 1ms

**Edge Cases:**
- [x] Fresh login works
- [x] Page refresh persists session
- [x] Auto-refresh works
- [x] Token expiry handled
- [x] Logout clears everything

**Critical Bugs:** 0  
**High Bugs:** 0  
**Medium Bugs:** ≤ 2 (acceptable)  
**Low Bugs:** Any (document for later)

---

## 📊 Test Results Template

### Session 1: [Date/Time]

**Environment:** Development / Staging  
**Browser:** Chrome / Firefox / Safari  
**Tester:** [Name]

**Browser Tests:**
- localStorage: ✅ PASS / ❌ FAIL
- Token Expiry: ✅ PASS / ❌ FAIL
- Refresh Format: ✅ PASS / ❌ FAIL
- SessionManager: ✅ PASS / ❌ FAIL
- Database: ✅ PASS / ❌ FAIL
- Refresh: ✅ PASS / ❌ FAIL

**Database Tests:**
- Structure: ✅ PASS / ❌ FAIL
- RLS: ✅ PASS / ❌ FAIL
- Performance: ✅ PASS / ❌ FAIL

**Edge Cases:**
- Fresh Login: ✅ PASS / ❌ FAIL
- Page Refresh: ✅ PASS / ❌ FAIL
- Auto-Refresh: ✅ PASS / ❌ FAIL
- Token Expired: ✅ PASS / ❌ FAIL
- Logout: ✅ PASS / ❌ FAIL

**Bugs Found:** [Count]

**Overall Assessment:** PASS / FAIL

**Notes:**
[Any observations or issues]

---

## 🔧 Debugging Tips

### Issue: SessionManager not initializing

**Check:**
1. `import { sessionManager } from './utils/session-manager'` in App.tsx?
2. `sessionManager.init()` called in useEffect?
3. Console errors?

### Issue: Token refresh failing

**Check:**
1. `auth-refresh` function deployed?
2. Environment variables set?
3. Network tab shows 200 response?
4. Database has session with matching refresh_token?

### Issue: Database session not created

**Check:**
1. `auth-create-session` function deployed?
2. CORS headers correct?
3. user_sessions table exists?
4. RLS allows INSERT?

### Issue: Cron job not running

**Check:**
1. `pg_cron` extension enabled?
2. Job scheduled correctly?
3. Check `cron.job_run_details` for errors:
   ```sql
   SELECT * FROM cron.job_run_details
   ORDER BY start_time DESC LIMIT 5;
   ```

---

## ⏭️ After Testing

### If All Tests Pass ✅

1. Create Day 4 summary document
2. Update progress tracker
3. Move to Day 5 (Documentation & Polish)

### If Tests Fail ❌

1. Document all bugs in `edge-case-scenarios.md`
2. Fix critical bugs immediately
3. Re-test
4. Repeat until all critical tests pass

---

## 📁 Testing Files Reference

```
tests/
├── session-manager-tests.ts      # Browser console tests
├── database-tests.sql            # Database validation queries
└── edge-case-scenarios.md        # Manual test scenarios

docs/
└── day-4-testing-guide.md        # This file
```

---

## 🎯 Day 4 Goals Checklist

- [ ] All browser tests pass
- [ ] All database tests pass
- [ ] Critical edge cases tested
- [ ] Zero critical bugs
- [ ] Performance validated
- [ ] Security verified
- [ ] Documentation updated
- [ ] Day 4 summary created

---

**Start testing and good luck! 🚀**

**Remember:** It's better to find bugs now than in production! 🐛
