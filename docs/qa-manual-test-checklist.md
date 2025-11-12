# Manual QA Test Checklist - Production Readiness

**Date:** November 12, 2025  
**Version:** Phase 4 - Post Testing & Validation  
**Status:** 🔄 In Progress

---

## Overview

This checklist covers manual regression testing for all critical user paths before production deployment. Each test should be executed and results documented.

**Tester:** _______________  
**Date Tested:** _______________  
**Environment:** ⬜ Staging ⬜ Production Preview  
**Browser/OS:** _______________

---

## Test Environment Setup

### Prerequisites Checklist

- [ ] Supabase project is accessible
- [ ] Backend serverless functions deployed
- [ ] Resend API key configured
- [ ] Test email account available
- [ ] Browser DevTools console clear of errors
- [ ] Network tab ready for monitoring

### Test Accounts

**Demo Professional:**
- Email: `demo.professional@swipe.work`
- Password: `demo123`
- Expected: Immediate dashboard access

**Demo Employer:**
- Email: `demo.employer@swipe.work`
- Password: `demo123`
- Expected: Immediate dashboard access

**Fresh Test Account:**
- Email: `qa.test.${timestamp}@example.com`
- Password: `QATest123!@#`
- Expected: Full registration flow

---

## Section 1: User Registration Flow

### 1.1 Professional Registration - Happy Path

**Test ID:** REG-001  
**Priority:** 🔴 Critical  
**Estimated Time:** 5 minutes

**Steps:**

1. [ ] Navigate to landing page (/)
   - **Expected:** CoreID logo visible, "Get Started" button present
   - **Result:** ✅ Pass ❌ Fail
   - **Notes:** _________________________

2. [ ] Click "Get Started" or "Sign Up" button
   - **Expected:** Registration modal/page opens, Step 0 visible
   - **Result:** ✅ Pass ❌ Fail
   - **Notes:** _________________________

3. [ ] Fill Step 0 - Basic Information
   - **Fields to test:**
     - [ ] Full Name: "John QA Tester"
     - [ ] Email: `qa.${Date.now()}@example.com`
     - [ ] Professional Title: "Senior QA Engineer"
     - [ ] Location: "San Francisco, CA"
     - [ ] Phone: "+1 (415) 555-1234"
     - [ ] Password: "SecureTest123!@#"
     - [ ] Confirm Password: "SecureTest123!@#"
   - **Expected:** All fields accept input, no validation errors
   - **Result:** ✅ Pass ❌ Fail
   - **Notes:** _________________________

4. [ ] Click "Continue" to Step 1
   - **Expected:** Smooth transition, Step 1 (Professional Details) visible
   - **Result:** ✅ Pass ❌ Fail
   - **Notes:** _________________________

5. [ ] Fill Step 1 - Professional Details
   - **Fields to test:**
     - [ ] Years of Experience: "5-7 years"
     - [ ] Current Company: "TechCorp Inc"
     - [ ] Seniority: "Mid-level"
   - **Expected:** Dropdowns functional, selections saved
   - **Result:** ✅ Pass ❌ Fail
   - **Notes:** _________________________

6. [ ] Click "Continue" to Step 2
   - **Expected:** Skills and Education step visible
   - **Result:** ✅ Pass ❌ Fail
   - **Notes:** _________________________

7. [ ] Fill Step 2 - Skills & Education
   - **Fields to test:**
     - [ ] Add skill: "JavaScript" (press Enter)
     - [ ] Add skill: "React" (press Enter)
     - [ ] Add skill: "Testing" (press Enter)
     - [ ] Highest Education: "Bachelor's Degree"
   - **Expected:** Skills appear as pills, minimum 3 skills required
   - **Result:** ✅ Pass ❌ Fail
   - **Notes:** _________________________

8. [ ] Click "Continue" to Step 3
   - **Expected:** Verification methods step visible
   - **Result:** ✅ Pass ❌ Fail
   - **Notes:** _________________________

9. [ ] Step 3 - Verification Methods
   - [ ] Email verification checkbox checked by default
   - [ ] AI verification, Peer verification visible
   - **Expected:** At least email verification selected
   - **Result:** ✅ Pass ❌ Fail
   - **Notes:** _________________________

10. [ ] Click "Submit" / "Complete Registration"
    - **Expected:** 
      - Loading indicator shown
      - API call to /server/register succeeds (check Network tab)
      - Redirect to Email Verification Gate
    - **Result:** ✅ Pass ❌ Fail
    - **Notes:** _________________________

11. [ ] Email Verification Gate appears
    - **Expected:**
      - 6-digit code input fields visible
      - Email address displayed correctly
      - "Resend Code" button present
      - Welcome message with user name
    - **Result:** ✅ Pass ❌ Fail
    - **Notes:** _________________________

12. [ ] Check email inbox for verification code
    - **Expected:**
      - Email received within 30 seconds
      - Subject: "Verify your CoreID email"
      - 6-digit code clearly visible
      - Code expiry mentioned (10 minutes)
    - **Result:** ✅ Pass ❌ Fail
    - **Code received:** _________________________

13. [ ] Enter 6-digit verification code
    - [ ] Code auto-focuses to next input
    - [ ] All 6 digits entered
    - **Expected:** Auto-submit on 6th digit OR "Verify" button enabled
    - **Result:** ✅ Pass ❌ Fail
    - **Notes:** _________________________

14. [ ] Code verification succeeds
    - **Expected:**
      - Success message: "Email verified successfully!"
      - Redirect to login page OR auto-login to dashboard
      - Session data saved (check localStorage)
    - **Result:** ✅ Pass ❌ Fail
    - **Notes:** _________________________

15. [ ] Dashboard access confirmed
    - **Expected:**
      - User sees professional dashboard
      - Name displayed in header
      - No errors in console
    - **Result:** ✅ Pass ❌ Fail
    - **Notes:** _________________________

**Overall Test Result:** ✅ Pass ❌ Fail  
**Test Duration:** _________ minutes  
**Issues Found:** _________________________

---

### 1.2 Registration - Field Validation

**Test ID:** REG-002  
**Priority:** 🔴 Critical  
**Estimated Time:** 10 minutes

**Invalid Email Validation:**

1. [ ] Enter invalid email: "notanemail"
   - **Expected:** "Enter a valid email address"
   - **Result:** ✅ Pass ❌ Fail

2. [ ] Enter email without domain: "user@"
   - **Expected:** Validation error shown
   - **Result:** ✅ Pass ❌ Fail

3. [ ] Enter email with spaces: "user @example.com"
   - **Expected:** Validation error shown
   - **Result:** ✅ Pass ❌ Fail

**Password Validation:**

4. [ ] Enter weak password: "weak"
   - **Expected:** "Password must be at least 8 characters"
   - **Result:** ✅ Pass ❌ Fail

5. [ ] Enter password without number: "Password!"
   - **Expected:** "Include at least one number"
   - **Result:** ✅ Pass ❌ Fail

6. [ ] Enter password without special char: "Password1"
   - **Expected:** "Include at least one special character"
   - **Result:** ✅ Pass ❌ Fail

7. [ ] Enter mismatched passwords
   - Password: "SecurePass123!"
   - Confirm: "DifferentPass123!"
   - **Expected:** "Passwords do not match"
   - **Result:** ✅ Pass ❌ Fail

**Phone Number Validation:**

8. [ ] Enter invalid phone: "123"
   - **Expected:** "Enter a valid phone with country code"
   - **Result:** ✅ Pass ❌ Fail

9. [ ] Enter valid phone: "+1 (415) 555-1234"
   - **Expected:** Accepted, no error
   - **Result:** ✅ Pass ❌ Fail

10. [ ] Leave phone empty
    - **Expected:** Accepted (optional field)
    - **Result:** ✅ Pass ❌ Fail

**Required Fields:**

11. [ ] Try to continue with empty Name field
    - **Expected:** "Full name is required"
    - **Result:** ✅ Pass ❌ Fail

12. [ ] Try to continue with empty Title field
    - **Expected:** "Professional Title is required"
    - **Result:** ✅ Pass ❌ Fail

**Overall Test Result:** ✅ Pass ❌ Fail

---

### 1.3 Employer Registration

**Test ID:** REG-003  
**Priority:** 🟡 Medium  
**Estimated Time:** 5 minutes

1. [ ] Navigate to registration
2. [ ] Select "Employer" user type
3. [ ] Fill employer-specific fields:
   - [ ] Company Name: "Acme Corp"
   - [ ] Industry: "Technology"
   - [ ] Company Size: "50-200"
   - [ ] Contact Email: `employer.${Date.now()}@company.com`
4. [ ] Complete registration flow
5. [ ] Verify email
6. [ ] Access employer dashboard

**Expected:** Employer-specific dashboard with job posting features  
**Result:** ✅ Pass ❌ Fail

---

## Section 2: Email Verification Flow

### 2.1 Valid Code Verification

**Test ID:** VER-001  
**Priority:** 🔴 Critical  
**Estimated Time:** 3 minutes

1. [ ] Complete registration (use REG-001)
2. [ ] Receive verification email
3. [ ] Extract 6-digit code from email
4. [ ] Enter code in verification UI
   - **Code:** _________________________
5. [ ] Verify code submission
   - **Expected:** "Email verified successfully"
   - **Result:** ✅ Pass ❌ Fail

**API Validation:**
- [ ] Check Network tab: POST /verify-email-code
- [ ] Status: 200 OK
- [ ] Response: `{ "success": true }`

**Overall Test Result:** ✅ Pass ❌ Fail

---

### 2.2 Invalid Code Handling

**Test ID:** VER-002  
**Priority:** 🔴 Critical  
**Estimated Time:** 5 minutes

**Test Cases:**

1. [ ] Enter incorrect code: "000000"
   - **Expected:** "Invalid verification code"
   - **Result:** ✅ Pass ❌ Fail

2. [ ] Enter incomplete code: "123" (3 digits)
   - **Expected:** Verify button disabled OR validation error
   - **Result:** ✅ Pass ❌ Fail

3. [ ] Enter non-numeric code: "ABCDEF"
   - **Expected:** Only numbers accepted in input
   - **Result:** ✅ Pass ❌ Fail

4. [ ] Try multiple wrong codes (3 times)
   - **Expected:** After 5 attempts, rate limiting message
   - **Result:** ✅ Pass ❌ Fail

**Overall Test Result:** ✅ Pass ❌ Fail

---

### 2.3 Resend Verification Code

**Test ID:** VER-003  
**Priority:** 🔴 Critical  
**Estimated Time:** 3 minutes

1. [ ] Complete registration
2. [ ] On verification screen, click "Resend Code"
   - **Expected:** 
     - "Code sent successfully" message
     - New email received with new code
     - Button disabled for 60 seconds (cooldown)
   - **Result:** ✅ Pass ❌ Fail

3. [ ] Verify new code works
   - [ ] Enter new 6-digit code
   - [ ] Verification succeeds
   - **Result:** ✅ Pass ❌ Fail

4. [ ] Test rate limiting
   - [ ] Try to resend immediately (during cooldown)
   - **Expected:** "Please wait before requesting another code"
   - **Result:** ✅ Pass ❌ Fail

**Overall Test Result:** ✅ Pass ❌ Fail

---

### 2.4 Code Expiry Handling

**Test ID:** VER-004  
**Priority:** 🟡 Medium  
**Estimated Time:** 12 minutes

1. [ ] Complete registration
2. [ ] Wait 10 minutes for code to expire
3. [ ] Enter expired code
   - **Expected:** "Verification code has expired"
   - **Result:** ✅ Pass ❌ Fail

4. [ ] Click "Resend Code"
5. [ ] Verify new code works
   - **Expected:** Fresh code accepted
   - **Result:** ✅ Pass ❌ Fail

**Overall Test Result:** ✅ Pass ❌ Fail

---

## Section 3: Login and Authentication

### 3.1 Login with Demo Account

**Test ID:** AUTH-001  
**Priority:** 🔴 Critical  
**Estimated Time:** 2 minutes

1. [ ] Navigate to /login
2. [ ] Enter credentials:
   - Email: `demo.professional@swipe.work`
   - Password: `demo123`
3. [ ] Click "Sign In"
   - **Expected:**
     - Redirect to professional dashboard
     - Session data in localStorage
     - No verification required (already verified)
   - **Result:** ✅ Pass ❌ Fail

**localStorage Validation:**
- [ ] `accessToken` present
- [ ] `userId` present
- [ ] `userType` = "professional"
- [ ] `expiresAt` timestamp present

**Overall Test Result:** ✅ Pass ❌ Fail

---

### 3.2 Login with Newly Registered Account

**Test ID:** AUTH-002  
**Priority:** 🔴 Critical  
**Estimated Time:** 3 minutes

1. [ ] Complete registration and verification (REG-001 + VER-001)
2. [ ] Logout (if auto-logged in)
3. [ ] Navigate to /login
4. [ ] Enter registration credentials
5. [ ] Click "Sign In"
   - **Expected:** Dashboard access granted
   - **Result:** ✅ Pass ❌ Fail

**Overall Test Result:** ✅ Pass ❌ Fail

---

### 3.3 Login - Invalid Credentials

**Test ID:** AUTH-003  
**Priority:** 🔴 Critical  
**Estimated Time:** 3 minutes

1. [ ] Wrong password
   - Email: `demo.professional@swipe.work`
   - Password: `wrongpassword`
   - **Expected:** "Invalid email or password"
   - **Result:** ✅ Pass ❌ Fail

2. [ ] Non-existent email
   - Email: `nonexistent@example.com`
   - Password: `anypassword`
   - **Expected:** "Invalid email or password"
   - **Result:** ✅ Pass ❌ Fail

3. [ ] Empty credentials
   - **Expected:** "Please enter your email and password"
   - **Result:** ✅ Pass ❌ Fail

**Overall Test Result:** ✅ Pass ❌ Fail

---

### 3.4 Unverified Email Login Attempt

**Test ID:** AUTH-004  
**Priority:** 🟡 Medium  
**Estimated Time:** 5 minutes

1. [ ] Complete registration but skip verification
2. [ ] Navigate to /login
3. [ ] Enter credentials
   - **Expected:**
     - Login blocked OR
     - Redirect to verification screen
     - Message: "Please verify your email first"
   - **Result:** ✅ Pass ❌ Fail

**Overall Test Result:** ✅ Pass ❌ Fail

---

## Section 4: Session Management (Phase 3)

### 4.1 Session Persistence on Reload

**Test ID:** SESS-001  
**Priority:** 🔴 Critical  
**Estimated Time:** 2 minutes

1. [ ] Login with demo account
2. [ ] Navigate to dashboard
3. [ ] Reload page (F5 or Ctrl+R)
   - **Expected:**
     - User remains logged in
     - Dashboard still accessible
     - No redirect to login
   - **Result:** ✅ Pass ❌ Fail

4. [ ] Check localStorage before reload
   - [ ] `accessToken` = _________________________
5. [ ] Check localStorage after reload
   - [ ] `accessToken` unchanged
   - **Result:** ✅ Pass ❌ Fail

**Overall Test Result:** ✅ Pass ❌ Fail

---

### 4.2 Token Auto-Refresh

**Test ID:** SESS-002  
**Priority:** 🟡 Medium  
**Estimated Time:** 35 minutes

**Note:** Requires waiting for auto-refresh interval (30 minutes)

1. [ ] Login with demo account
2. [ ] Note initial token expiry time
   - `expiresAt` (localStorage): _________________________
3. [ ] Wait 30+ minutes (or modify REFRESH_THRESHOLD in session.ts to 1 minute for testing)
4. [ ] Observe Network tab for refresh request
   - **Expected:** 
     - Automatic token refresh occurs
     - New token saved to localStorage
     - User remains logged in
   - **Result:** ✅ Pass ❌ Fail

**Alternative (Quick Test):**
1. [ ] Modify `src/utils/session.ts`:
   ```typescript
   const REFRESH_THRESHOLD_MS = 60 * 1000; // 1 minute
   ```
2. [ ] Rebuild and test
3. [ ] Wait 1 minute
4. [ ] Verify refresh occurs

**Overall Test Result:** ✅ Pass ❌ Fail

---

### 4.3 Cross-Tab Session Sync

**Test ID:** SESS-003  
**Priority:** 🟡 Medium  
**Estimated Time:** 3 minutes

1. [ ] Login in Tab 1
2. [ ] Open dashboard in Tab 2 (same browser)
   - **Expected:** Both tabs authenticated
   - **Result:** ✅ Pass ❌ Fail

3. [ ] Logout in Tab 1
4. [ ] Observe Tab 2
   - **Expected:** 
     - Tab 2 detects logout within 2 seconds
     - Redirect to login OR show logged-out state
   - **Result:** ✅ Pass ❌ Fail

**Overall Test Result:** ✅ Pass ❌ Fail

---

### 4.4 Session Expiry After 24h Inactivity

**Test ID:** SESS-004  
**Priority:** ⬜ Low  
**Estimated Time:** 24 hours (skip for now)

**Note:** Long-running test, defer to post-production monitoring

---

## Section 5: Dashboard Functionality

### 5.1 Professional Dashboard Access

**Test ID:** DASH-001  
**Priority:** 🔴 Critical  
**Estimated Time:** 3 minutes

1. [ ] Login as professional
2. [ ] Verify dashboard elements:
   - [ ] Welcome message with name
   - [ ] Profile completion status
   - [ ] Job matches section
   - [ ] PIN credential display
   - [ ] Navigation menu functional
3. [ ] No console errors
4. [ ] Page loads within 3 seconds

**Result:** ✅ Pass ❌ Fail

---

### 5.2 Employer Dashboard Access

**Test ID:** DASH-002  
**Priority:** 🟡 Medium  
**Estimated Time:** 3 minutes

1. [ ] Login as employer
2. [ ] Verify dashboard elements:
   - [ ] Company name displayed
   - [ ] Job posting section
   - [ ] Candidate matches
   - [ ] Analytics/stats
3. [ ] No console errors

**Result:** ✅ Pass ❌ Fail

---

## Section 6: Error Handling & Edge Cases

### 6.1 Network Errors

**Test ID:** ERR-001  
**Priority:** 🟡 Medium  
**Estimated Time:** 5 minutes

1. [ ] Open DevTools > Network tab
2. [ ] Set throttling to "Offline"
3. [ ] Try to register
   - **Expected:** "Network error" or "Connection failed" message
   - **Result:** ✅ Pass ❌ Fail

4. [ ] Re-enable network
5. [ ] Retry registration
   - **Expected:** Succeeds on retry
   - **Result:** ✅ Pass ❌ Fail

**Overall Test Result:** ✅ Pass ❌ Fail

---

### 6.2 API Rate Limiting

**Test ID:** ERR-002  
**Priority:** 🟡 Medium  
**Estimated Time:** 5 minutes

1. [ ] Rapidly click "Resend Code" 10 times
   - **Expected:** 
     - After 3-5 attempts: "Too many requests. Please wait."
     - 429 status code in Network tab
   - **Result:** ✅ Pass ❌ Fail

2. [ ] Wait 60 seconds
3. [ ] Try again
   - **Expected:** Allowed after cooldown
   - **Result:** ✅ Pass ❌ Fail

**Overall Test Result:** ✅ Pass ❌ Fail

---

### 6.3 Browser Compatibility

**Test ID:** COMPAT-001  
**Priority:** 🟡 Medium  
**Estimated Time:** 15 minutes

**Test on Multiple Browsers:**

| Browser | Version | Registration | Verification | Login | Session | Result |
|---------|---------|--------------|--------------|-------|---------|--------|
| Chrome | ______ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ ❌ |
| Firefox | ______ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ ❌ |
| Safari | ______ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ ❌ |
| Edge | ______ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ ❌ |

**Overall Test Result:** ✅ Pass ❌ Fail

---

## Section 7: Security Validation

### 7.1 XSS Prevention

**Test ID:** SEC-001  
**Priority:** 🔴 Critical  
**Estimated Time:** 5 minutes

1. [ ] Try to inject script in Name field:
   ```
   <script>alert('XSS')</script>
   ```
   - **Expected:** Script tags sanitized, no alert shown
   - **Result:** ✅ Pass ❌ Fail

2. [ ] Try SQL injection in email:
   ```
   admin'--@example.com
   ```
   - **Expected:** Treated as invalid email
   - **Result:** ✅ Pass ❌ Fail

**Overall Test Result:** ✅ Pass ❌ Fail

---

### 7.2 CSRF Token Validation

**Test ID:** SEC-002  
**Priority:** 🔴 Critical  
**Estimated Time:** 3 minutes

1. [ ] Check localStorage for `csrfToken`
   - **Expected:** Token present
   - **Result:** ✅ Pass ❌ Fail

2. [ ] Verify API requests include CSRF header
   - Check Network tab > Request Headers
   - **Expected:** `X-CSRF-Token` header present
   - **Result:** ✅ Pass ❌ Fail

**Overall Test Result:** ✅ Pass ❌ Fail

---

## Test Summary

### Critical Path Results

| Test ID | Test Name | Priority | Result | Issues |
|---------|-----------|----------|--------|--------|
| REG-001 | Professional Registration | 🔴 | ⬜ | ______ |
| REG-002 | Field Validation | 🔴 | ⬜ | ______ |
| VER-001 | Valid Code Verification | 🔴 | ⬜ | ______ |
| VER-002 | Invalid Code Handling | 🔴 | ⬜ | ______ |
| VER-003 | Resend Code | 🔴 | ⬜ | ______ |
| AUTH-001 | Demo Login | 🔴 | ⬜ | ______ |
| AUTH-002 | New Account Login | 🔴 | ⬜ | ______ |
| AUTH-003 | Invalid Credentials | 🔴 | ⬜ | ______ |
| SESS-001 | Session Persistence | 🔴 | ⬜ | ______ |
| DASH-001 | Professional Dashboard | 🔴 | ⬜ | ______ |
| SEC-001 | XSS Prevention | 🔴 | ⬜ | ______ |
| SEC-002 | CSRF Validation | 🔴 | ⬜ | ______ |

### Overall QA Status

**Total Tests:** _____  
**Passed:** _____  
**Failed:** _____  
**Blocked:** _____  
**Pass Rate:** _____%

### Critical Issues Found

1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

### Non-Critical Issues

1. _____________________________________________
2. _____________________________________________

### Sign-Off

**QA Engineer:** _______________  
**Date:** _______________  
**Recommendation:** ⬜ Approve for Production ⬜ Requires Fixes ⬜ Blocked

**Product Owner:** _______________  
**Date:** _______________  
**Approval:** ⬜ Approved ⬜ Rejected

**Engineering Lead:** _______________  
**Date:** _______________  
**Approval:** ⬜ Approved ⬜ Rejected

---

## Next Steps

- [ ] Address critical issues
- [ ] Re-test failed scenarios
- [ ] Update test results
- [ ] Obtain final sign-off
- [ ] Proceed to staging deployment
