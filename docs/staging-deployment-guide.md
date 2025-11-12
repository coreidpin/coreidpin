# Staging Deployment and Smoke Testing Guide

**Project:** CoreID  
**Phase:** QA and Deployment Validation  
**Date:** 2024  
**Status:** Pre-Production Deployment

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Staging Environment Setup](#staging-environment-setup)
3. [Deployment Process](#deployment-process)
4. [Smoke Test Execution](#smoke-test-execution)
5. [Monitoring and Validation](#monitoring-and-validation)
6. [Rollback Procedures](#rollback-procedures)
7. [Production Deployment Checklist](#production-deployment-checklist)

---

## Prerequisites

### ✅ Pre-Deployment Validation

Before deploying to staging, ensure all of the following are complete:

- [ ] All Phase 4 tests passing (97 tests: 45 unit + 28 integration + 8 E2E)
- [ ] Test coverage ≥ 90% (verified in CI/CD)
- [ ] Backend audit completed (`npm run audit:backend`)
- [ ] Resend API validated (`npm run audit:resend`)
- [ ] Manual QA regression tests executed
- [ ] All critical issues resolved
- [ ] Code review completed and approved
- [ ] Git branch up-to-date with main

### 🔑 Required Credentials

Ensure you have access to:

- Vercel account with CoreID project access
- Supabase staging project (or ability to create one)
- Resend API key (production or staging tier)
- GitHub repository write access
- Environment variable access

---

## Staging Environment Setup

### 1. Create Staging Environment

#### Option A: Vercel Preview Deployment (Recommended)

Vercel automatically creates preview deployments for every PR:

```bash
# Create a new branch for staging validation
git checkout -b staging/pre-production-validation

# Push to GitHub to trigger preview deployment
git push origin staging/pre-production-validation
```

The preview URL will be:
- Format: `https://coreid-<branch>-<team>.vercel.app`
- Example: `https://coreid-staging-pre-production-validation-team.vercel.app`

#### Option B: Manual Vercel Deployment

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel deploy

# Note the deployment URL provided
```

### 2. Configure Staging Environment Variables

Set the following environment variables in Vercel Dashboard:

**Navigate to:** Vercel Dashboard → CoreID Project → Settings → Environment Variables → Preview

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | `https://staging-project.supabase.co` | Staging Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Staging anon key |
| `RESEND_API_KEY` | `re_staging_xxxxx` | Staging Resend key |
| `VITE_APP_ENV` | `staging` | Environment identifier |
| `VITE_API_BASE_URL` | `https://staging-api.coreid.com` | Staging API URL |

**Important:** Use separate Supabase projects for staging and production to avoid data corruption.

### 3. Verify Staging Database

Ensure staging Supabase has:

- [ ] All database migrations applied
- [ ] RLS policies configured
- [ ] Test user accounts created
- [ ] Email verification table ready
- [ ] Edge Functions deployed

```bash
# Apply migrations to staging (if using Supabase CLI)
supabase db push --project-ref <staging-project-ref>

# Deploy Edge Functions
supabase functions deploy --project-ref <staging-project-ref>
```

---

## Deployment Process

### Step 1: Prepare for Deployment

```bash
# Ensure you're on the correct branch
git checkout main
git pull origin main

# Run all tests locally
npm run test:all

# Run linting and type checking
npm run lint
npm run typecheck

# Build production bundle
npm run build

# Preview the build locally
npm run preview
```

### Step 2: Create Deployment Tag

```bash
# Create a pre-release tag
git tag -a v1.0.0-rc.1 -m "Release Candidate 1 for Production"
git push origin v1.0.0-rc.1
```

### Step 3: Deploy to Staging

```bash
# Option 1: Deploy via Git push (automatic)
git push origin staging/pre-production-validation

# Option 2: Deploy via Vercel CLI
vercel deploy --prebuilt

# Option 3: Deploy via Vercel Dashboard
# Navigate to Vercel Dashboard → Deployments → Deploy
```

### Step 4: Verify Deployment

Once deployment completes:

```bash
# Check deployment status
vercel ls

# Get deployment URL
vercel inspect <deployment-url>
```

**Verify the following:**

- [ ] Deployment status: "Ready"
- [ ] Build logs show no errors
- [ ] All environment variables loaded
- [ ] DNS/SSL certificate active
- [ ] Application accessible via URL

---

## Smoke Test Execution

### Critical Path Smoke Tests

Execute the following smoke tests manually on the staging environment:

#### 🧪 Smoke Test 1: Homepage Load

**Test ID:** SMOKE-001  
**Priority:** Critical

**Steps:**
1. Navigate to staging URL
2. Verify homepage loads within 3 seconds
3. Check for console errors (F12 → Console)
4. Verify all images load correctly
5. Check responsive design (mobile, tablet, desktop)

**Expected Result:**  
✅ Homepage loads cleanly with no errors

---

#### 🧪 Smoke Test 2: Professional Registration

**Test ID:** SMOKE-002  
**Priority:** Critical

**Steps:**
1. Click "Get Started" → Select "Professional"
2. Fill all registration form fields:
   - Name: Test User Staging
   - Email: staging.test@example.com
   - Title: QA Engineer
   - Location: Nigeria
   - Phone: +2348012345678
   - Password: Test123!@#
3. Complete all 4 onboarding steps
4. Submit registration
5. Wait for email verification screen

**Expected Result:**  
✅ Registration successful, verification code screen displayed

---

#### 🧪 Smoke Test 3: Email Verification

**Test ID:** SMOKE-003  
**Priority:** Critical

**Steps:**
1. Check email inbox for verification code
2. Copy 6-digit code
3. Enter code in verification screen
4. Click "Verify"
5. Observe login/dashboard redirect

**Expected Result:**  
✅ Verification successful, user logged in and redirected to dashboard

**Note:** Check Resend Dashboard → Logs to verify email was sent

---

#### 🧪 Smoke Test 4: Login Flow

**Test ID:** SMOKE-004  
**Priority:** Critical

**Steps:**
1. Logout from dashboard
2. Navigate to /login
3. Enter credentials:
   - Email: staging.test@example.com
   - Password: Test123!@#
4. Click "Login"
5. Verify dashboard access

**Expected Result:**  
✅ Login successful, dashboard accessible

---

#### 🧪 Smoke Test 5: Session Persistence

**Test ID:** SMOKE-005  
**Priority:** High

**Steps:**
1. Login to staging environment
2. Access dashboard
3. Refresh page (F5)
4. Verify session maintained
5. Check localStorage for token
6. Open DevTools → Application → Local Storage
7. Verify `sb-<project>-auth-token` exists

**Expected Result:**  
✅ Session persists after reload, no re-login required

---

#### 🧪 Smoke Test 6: API Health

**Test ID:** SMOKE-006  
**Priority:** Critical

**Steps:**
1. Open browser DevTools → Network tab
2. Trigger API calls (login, registration, etc.)
3. Monitor API responses:
   - POST /server/register → 200 OK
   - POST /send-verification-email → 200 OK
   - POST /verify-email-code → 200 OK
4. Check response times (<500ms)
5. Verify no 5xx errors

**Expected Result:**  
✅ All API calls return 2xx responses with reasonable latency

---

### Smoke Test Results Template

Copy this template to track smoke test results:

```markdown
## Staging Smoke Test Results

**Date:** YYYY-MM-DD  
**Tester:** [Your Name]  
**Staging URL:** https://coreid-staging-xxx.vercel.app  
**Build Version:** v1.0.0-rc.1

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| SMOKE-001 | Homepage Load | ✅ / ❌ | |
| SMOKE-002 | Professional Registration | ✅ / ❌ | |
| SMOKE-003 | Email Verification | ✅ / ❌ | |
| SMOKE-004 | Login Flow | ✅ / ❌ | |
| SMOKE-005 | Session Persistence | ✅ / ❌ | |
| SMOKE-006 | API Health | ✅ / ❌ | |

**Overall Status:** PASS / FAIL  
**Critical Issues:** [List any blocking issues]  
**Warnings:** [List any non-blocking warnings]  
**Recommendation:** PROCEED TO PRODUCTION / BLOCK DEPLOYMENT
```

---

## Monitoring and Validation

### Application Monitoring

**Monitor these metrics for 24-48 hours on staging:**

| Metric | Target | Tool |
|--------|--------|------|
| Uptime | >99.9% | Vercel Dashboard |
| Error Rate | <0.1% | Vercel Logs |
| Avg Response Time | <500ms | Vercel Analytics |
| Failed Registrations | <1% | Supabase Logs |
| Email Delivery Rate | >99% | Resend Dashboard |
| Session Timeouts | <5% | Custom Analytics |

### Logging and Debugging

#### View Vercel Logs

```bash
# Real-time logs
vercel logs <deployment-url> --follow

# Filter by function
vercel logs <deployment-url> --function=/api/register
```

#### View Supabase Logs

1. Navigate to Supabase Dashboard → Logs
2. Filter by:
   - Edge Functions
   - API calls
   - Auth events
3. Look for errors (4xx, 5xx status codes)

#### View Resend Logs

1. Navigate to Resend Dashboard → Logs
2. Check email send events
3. Monitor delivery rates
4. Review bounce/complaint rates

### Performance Validation

Run Lighthouse audit on staging:

```bash
# Install Lighthouse CI (if not already)
npm install -g @lhci/cli

# Run audit
lhci autorun --config=lighthouserc.json
```

**Target Scores:**
- Performance: ≥90
- Accessibility: ≥95
- Best Practices: ≥95
- SEO: ≥90

---

## Rollback Procedures

### When to Rollback

Rollback immediately if:

- ❌ Critical functionality broken (registration, login, verification)
- ❌ Security vulnerability discovered
- ❌ Data corruption or loss detected
- ❌ >5% error rate in logs
- ❌ Email delivery failure >10%
- ❌ Database connection failures

### Vercel Rollback Process

#### Option 1: Via Vercel Dashboard

1. Navigate to Vercel Dashboard → Deployments
2. Find the last stable deployment
3. Click "⋮" (three dots) → "Promote to Production"
4. Confirm rollback

#### Option 2: Via Vercel CLI

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

#### Option 3: Via Git Revert

```bash
# Revert the problematic commit
git revert <commit-hash>

# Push to trigger new deployment
git push origin main
```

### Post-Rollback Actions

After rollback:

1. **Communicate:** Notify team and stakeholders
2. **Investigate:** Analyze logs to identify root cause
3. **Document:** Create incident report
4. **Fix:** Address issues in separate branch
5. **Re-test:** Run full test suite on fix
6. **Re-deploy:** Deploy fix with smoke tests

---

## Production Deployment Checklist

### Pre-Deployment (T-24 hours)

- [ ] Staging environment stable for 24+ hours
- [ ] All smoke tests passing
- [ ] No critical errors in staging logs
- [ ] Email delivery >99% on staging
- [ ] Performance metrics within targets
- [ ] Security scan completed (npm audit, Snyk)
- [ ] Backup of production database created
- [ ] Rollback plan documented
- [ ] Team notified of deployment window

### Deployment Window (T-0)

- [ ] Set maintenance window (if needed)
- [ ] Run final test suite (`npm run test:all`)
- [ ] Verify build succeeds locally
- [ ] Deploy to production
- [ ] Monitor deployment logs
- [ ] Run smoke tests on production
- [ ] Verify API health endpoints
- [ ] Check error rates in real-time

### Post-Deployment (T+1 hour)

- [ ] All smoke tests passing on production
- [ ] No spike in error rates
- [ ] Email delivery functioning
- [ ] Session persistence working
- [ ] Performance metrics stable
- [ ] User registrations successful
- [ ] Database connections healthy
- [ ] CDN cache cleared (if applicable)

### Post-Deployment (T+24 hours)

- [ ] Monitor error rates
- [ ] Review user feedback
- [ ] Check analytics for anomalies
- [ ] Verify email delivery rates
- [ ] Review Supabase usage metrics
- [ ] Generate deployment report
- [ ] Close deployment ticket

---

## Deployment Sign-Off

### Staging Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Engineer | | | |
| Backend Lead | | | |
| Frontend Lead | | | |
| DevOps Engineer | | | |

**Staging Status:** ✅ APPROVED / ❌ REJECTED

---

### Production Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Engineering Lead | | | |
| Security Lead | | | |
| CTO/VP Engineering | | | |

**Production Status:** ✅ APPROVED / ❌ REJECTED

---

## Additional Resources

- **Test Reports:** `./docs/phase4-testing-validation-summary.md`
- **Manual QA:** `./docs/qa-manual-test-checklist.md`
- **Backend Audit:** `./audit-reports/audit-report-*.md`
- **Resend Validation:** `./audit-reports/resend-validation-*.md`
- **CI/CD Pipeline:** `.github/workflows/ci.yml`

---

## Support and Escalation

### Deployment Issues

**Contact:**
- Engineering Lead: [email]
- DevOps Team: [Slack channel]
- On-Call Engineer: [phone]

### Critical Incidents

**Escalation Path:**
1. Engineering Lead (0-15 min)
2. VP Engineering (15-30 min)
3. CTO (30+ min)

**Incident Response:**
- Create incident in [incident management tool]
- Open war room in Slack
- Begin incident timeline documentation

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Next Review:** After Production Deployment
