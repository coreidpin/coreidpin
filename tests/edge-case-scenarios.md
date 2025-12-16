# Edge Case Test Scenarios

**Day 4 - Testing & Validation**

---

## 🧪 Test Scenarios

### Scenario 1: Fresh Login
**Steps:**
1. Clear all localStorage
2. Login with OTP
3. Verify session created

**Expected:**
```javascript
// Check localStorage
localStorage.getItem('accessToken')    // ✅ Has value
localStorage.getItem('refreshToken')   // ✅ 64-char hex
localStorage.getItem('expiresAt')      // ✅ ~1 hour from now
localStorage.getItem('userId')         // ✅ UUID

// Check console
"✅ Session created in database"
"✅ SessionManager initialized"
"⏰ Auto-refresh timer set up"
```

**SQL Verification:**
```sql
SELECT * FROM user_sessions 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC LIMIT 1;

-- Should show newly created session
```

**Result:** ☐ PASS ☐ FAIL

---

### Scenario 2: Page Refresh (Session Restore)
**Steps:**
1. Login successfully
2. Refresh the page (F5)
3. Verify session persists

**Expected:**
```javascript
// Console on page load
"🔐 Initializing SessionManager..."
"✅ Token valid for ~59 minutes"
"⏰ Auto-refresh timer set up"
"✅ SessionManager initialized"

// User should stay logged in
// No redirect to login page
```

**Result:** ☐ PASS ☐ FAIL

---

### Scenario 3: Token About to Expire
**Steps:**
1. Login
2. Manually set expiry to 4 minutes from now:
   ```javascript
   localStorage.setItem('expiresAt', (Date.now() + 4 * 60 * 1000).toString())
   ```
3. Wait 2 minutes
4. Watch console

**Expected:**
```javascript
// After ~2 minutes:
"🔄 Token expiring soon, refreshing..."
"🔄 Refreshing token..."
"✅ Token refreshed successfully"

// Check new expiry
localStorage.getItem('expiresAt')
// Should be ~1 hour from now (not 2 minutes)
```

**Result:** ☐ PASS ☐ FAIL

---

### Scenario 4: Token Already Expired
**Steps:**
1. Login
2. Set expiry to past:
   ```javascript
   localStorage.setItem('expiresAt', (Date.now() - 1000).toString())
   ```
3. Wait 1 minute (for auto-check)

**Expected:**
```javascript
// Console
"❌ Session expired, logging out..."
"🗑️ Session cleared"

// Should redirect to /login
// Toast: "Your session has expired. Please log in again."
```

**Result:** ☐ PASS ☐ FAIL

---

### Scenario 5: Invalid Refresh Token
**Steps:**
1. Login
2. Change refresh token in localStorage:
   ```javascript
   localStorage.setItem('refreshToken', 'invalid_token_12345')
   ```
3. Trigger refresh:
   ```javascript
   await sessionManager.refreshToken()
   ```

**Expected:**
```javascript
// Console
"❌ Token refresh failed: Invalid refresh token"
"❌ Session expired, logging out..."

// Should redirect to login
```

**Result:** ☐ PASS ☐ FAIL

---

### Scenario 6: Network Failure During Refresh
**Steps:**
1. Login
2. Open DevTools → Network tab
3. Set throttling to "Offline"
4. Trigger refresh:
   ```javascript
   await sessionManager.refreshToken()
   ```

**Expected:**
```javascript
// Console
"❌ Token refresh failed: Failed to fetch"

// Should NOT logout immediately
// Should retry on next auto-check (60s)
```

**Result:** ☐ PASS ☐ FAIL

---

### Scenario 7: Multiple Tabs (Same User)
**Steps:**
1. Login in Tab 1
2. Open Tab 2 (same app)
3. Verify both tabs work

**Expected:**
```javascript
// Tab 1 console
"✅ SessionManager initialized"

// Tab 2 console  
"✅ SessionManager initialized"

// SQL
SELECT COUNT(*) FROM user_sessions 
WHERE user_id = 'YOUR_USER_ID' AND is_active = true;
-- Should be 2 (one per tab/device)
```

**Result:** ☐ PASS ☐ FAIL

---

### Scenario 8: Logout
**Steps:**
1. Login
2. Click logout button
3. Verify cleanup

**Expected:**
```javascript
// Console
"🚪 Logging out..."
"🗑️ Session cleared"
"🔒 SessionManager destroyed"

// All localStorage cleared
localStorage.getItem('accessToken')    // null
localStorage.getItem('refreshToken')   // null
localStorage.getItem('userId')         // null

// Redirected to /login
```

**Result:** ☐ PASS ☐ FAIL

---

### Scenario 9: Concurrent Refresh Attempts
**Steps:**
1. Login
2. Run multiple refreshes simultaneously:
   ```javascript
   Promise.all([
     sessionManager.refreshToken(),
     sessionManager.refreshToken(),
     sessionManager.refreshToken()
   ])
   ```

**Expected:**
```javascript
// Console (only ONE refresh should happen)
"🔄 Refreshing token..."
"⏳ Refresh already in progress..."
"⏳ Refresh already in progress..."
"✅ Token refreshed successfully"

// All promises should resolve
// Only one request to /auth-refresh
```

**Result:** ☐ PASS ☐ FAIL

---

### Scenario 10: Auto-Refresh Timer
**Steps:**
1. Login
2. Watch console for 65 seconds

**Expected:**
```javascript
// After ~60 seconds
"✅ Token valid for ~58 minutes"

// After ~120 seconds
"✅ Token valid for ~57 minutes"

// Pattern repeats every 60 seconds
```

**Result:** ☐ PASS ☐ FAIL

---

### Scenario 11: Missing Environment Variables
**Steps:**
1. Remove Supabase URL from env
2. Attempt to refresh

**Expected:**
```javascript
// Console
"❌ Token refresh failed: ..."

// Should not crash
// Should fail gracefully
```

**Result:** ☐ PASS ☐ FAIL

---

### Scenario 12: Database Session Not Created
**Steps:**
1. Login (but auth-create-session fails)
2. Verify login still works

**Expected:**
```javascript
// Console
"⚠️ Failed to create session in database: ..."

// Login should STILL WORK
// User logged in locally
// Auto-refresh might not work (no DB session)
```

**Result:** ☐ PASS ☐ FAIL

---

### Scenario 13: Expired Refresh Token in Database
**Steps:**
1. Login
2. Manually expire refresh token in DB:
   ```sql
   UPDATE user_sessions
   SET refresh_token_expires_at = NOW() - INTERVAL '1 day'
   WHERE user_id = 'YOUR_USER_ID';
   ```
3. Attempt refresh

**Expected:**
```javascript
// Console
"❌ Token refresh failed: Refresh token expired"
"❌ Session expired, logging out..."

// Redirected to login
```

**Result:** ☐ PASS ☐ FAIL

---

### Scenario 14: Session Cleanup (Cron Job)
**Steps:**
1. Create expired sessions:
   ```sql
   INSERT INTO user_sessions (user_id, refresh_token, refresh_token_expires_at, is_active)
   VALUES 
   ('test-user-1', 'expired_token_1', NOW() - INTERVAL '1 day', true),
   ('test-user-2', 'expired_token_2', NOW() - INTERVAL '2 days', true);
   ```
2. Run cleanup:
   ```sql
   SELECT cleanup_expired_sessions();
   ```
3. Verify deletion:
   ```sql
   SELECT COUNT(*) FROM user_sessions 
   WHERE refresh_token IN ('expired_token_1', 'expired_token_2');
   ```

**Expected:**
```sql
-- Should return 0 (sessions deleted)
```

**Result:** ☐ PASS ☐ FAIL

---

### Scenario 15: Performance Under Load
**Steps:**
1. Create 1000 sessions in database:
   ```sql
   INSERT INTO user_sessions (user_id, refresh_token, is_active)
   SELECT 
     gen_random_uuid(),
     'token_' || generate_series(1, 1000),
     true;
   ```
2. Test refresh token lookup:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM user_sessions
   WHERE refresh_token = 'token_500' AND is_active = true;
   ```

**Expected:**
```sql
-- Execution time < 1ms
-- Uses index: idx_sessions_refresh_token
```

**Result:** ☐ PASS ☐ FAIL

---

## 📊 Test Results Summary

| Scenario | Status | Notes |
|----------|--------|-------|
| 1. Fresh Login | ☐ | |
| 2. Page Refresh | ☐ | |
| 3. Token About to Expire | ☐ | |
| 4. Token Expired | ☐ | |
| 5. Invalid Refresh Token | ☐ | |
| 6. Network Failure | ☐ | |
| 7. Multiple Tabs | ☐ | |
| 8. Logout | ☐ | |
| 9. Concurrent Refresh | ☐ | |
| 10. Auto-Refresh Timer | ☐ | |
| 11. Missing Env Vars | ☐ | |
| 12. DB Session Failed | ☐ | |
| 13. Expired DB Token | ☐ | |
| 14. Session Cleanup | ☐ | |
| 15. Performance | ☐ | |

**Total:** 0/15 passed

---

## 🐛 Bugs Found

### Bug #1
**Description:**  
**Steps to reproduce:**  
**Expected:**  
**Actual:**  
**Fix:**  

---

## ✅ Next Steps

After all tests pass:
1. Document any bugs found
2. Fix critical bugs
3. Re-test failed scenarios
4. Update documentation
5. Create Day 4 summary

---

**Testing Date:** ___________  
**Tester:** ___________  
**Environment:** Development / Staging / Production
