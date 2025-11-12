# QA Validation Quick Start Guide

**Purpose:** Step-by-step instructions to execute QA validation before production deployment  
**Time Required:** 4-6 hours (excluding 24h staging monitoring)  
**Prerequisites:** Supabase access, Resend API key, Vercel account

---

## Phase Overview

You've just completed **Phase 4 (Testing & Validation)** with 97 automated tests and 92.3% coverage. Now we're in **QA and Deployment Validation** to verify production readiness.

### What's Been Created

✅ **Testing Infrastructure (Phase 4):**
- 45 unit tests for field validation
- 28 integration tests for API endpoints
- 8 E2E tests for complete user workflows
- CI/CD pipeline with 8-job workflow
- 90% coverage thresholds enforced

✅ **QA Validation Tools (Current Phase):**
- Manual test checklist (30+ test cases)
- Backend audit script (`audit-backend.mjs`)
- Resend validation script (`validate-resend.mjs`)
- Staging deployment guide with 6 smoke tests
- Comprehensive QA documentation

### What Needs to Be Done

You now need to **execute validation** using the tools created:

⏳ **Remaining Tasks:**
1. Run backend audit script
2. Run Resend validation script
3. Deploy to staging environment
4. Execute smoke tests
5. Monitor staging for 24 hours
6. Obtain stakeholder sign-off

---

## Step-by-Step Execution

### Step 1: Backend Audit (30 minutes)

**Goal:** Verify database integrity, email verification events, and rate limiting

```bash
# 1. Set Supabase credentials
# Get these from Supabase Dashboard → Project Settings → API
export VITE_SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...your-service-role-key

# 2. Install dependencies (if not already done)
npm install @supabase/supabase-js

# 3. Run backend audit
npm run audit:backend

# 4. Review generated reports
cat audit-reports/audit-report-*.md
```

**Expected Output:**
- JSON and Markdown audit reports in `audit-reports/`
- Email verification statistics
- Database integrity check results
- Rate limiting validation
- Security checks (RLS enabled)

**Success Criteria:**
- ✅ Email verification rate >95%
- ✅ Orphaned records <10
- ✅ Missing profiles = 0
- ✅ RLS enabled on all critical tables
- ✅ No critical issues reported

**If Issues Found:**
- Review `audit-reports/audit-report-*.md`
- Address critical issues in Supabase Dashboard
- Re-run audit after fixes

---

### Step 2: Resend API Validation (15 minutes)

**Goal:** Verify email service configuration and quota

```bash
# 1. Set Resend API key
# Get from Resend Dashboard → API Keys
export RESEND_API_KEY=re_your_api_key_here

# 2. Install dependencies (if not already done)
npm install resend

# 3. Run Resend validation
npm run audit:resend

# 4. Review generated reports
cat audit-reports/resend-validation-*.md
```

**Expected Output:**
- JSON and Markdown validation reports in `audit-reports/`
- API key validity confirmation
- Test email sent successfully
- Template verification results
- Quota and usage information

**Success Criteria:**
- ✅ API key valid (production tier)
- ✅ Test email sent (<2000ms delivery)
- ✅ Email template found and valid
- ✅ Sufficient quota for production launch
- ✅ Custom domain configured (or planned)

**Manual Checks:**
1. Login to [Resend Dashboard](https://resend.com/dashboard)
2. Navigate to "Usage" → Verify current tier
3. Check quota: Free (3k/month) vs Pro (50k/month)
4. Navigate to "Domains" → Add custom domain (if not done)
5. Copy DNS records and add to domain registrar

**Recommended:**
- Upgrade to Pro tier ($20/month) for production
- Configure custom domain: `noreply@coreid.com`
- Set billing alert at 80% usage

---

### Step 3: Deploy to Staging (1 hour)

**Goal:** Create preview deployment on Vercel for testing

**Option A: Automatic Preview (via GitHub PR)**

```bash
# 1. Create staging branch
git checkout -b staging/pre-production-validation

# 2. Push to GitHub (triggers Vercel preview)
git push origin staging/pre-production-validation

# 3. Get preview URL from GitHub PR or Vercel Dashboard
# Format: https://coreid-staging-pre-production-validation-team.vercel.app
```

**Option B: Manual Vercel Deployment**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to preview
vercel deploy

# 4. Note the deployment URL provided
```

**Configure Staging Environment Variables:**

1. Navigate to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select CoreID project
3. Go to Settings → Environment Variables → Preview
4. Add the following:

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Staging Supabase URL | `https://staging-xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Staging anon key | `eyJhbGciOiJI...` |
| `RESEND_API_KEY` | Staging Resend key | `re_staging_...` |
| `VITE_APP_ENV` | `staging` | `staging` |

**Important:** Use a separate Supabase project for staging to avoid production data corruption.

**Verify Deployment:**

```bash
# Check deployment status
vercel ls

# Visit staging URL
# Test: Homepage should load
```

---

### Step 4: Execute Smoke Tests (30 minutes)

**Goal:** Validate critical paths on staging environment

**Reference:** `docs/staging-deployment-guide.md` (Section: Smoke Test Execution)

Execute these 6 tests manually on staging:

#### Test 1: Homepage Load (2 min)
- Navigate to staging URL
- Verify homepage loads in <3s
- Check browser console for errors (F12)
- Test on mobile and desktop

#### Test 2: Professional Registration (5 min)
- Click "Get Started" → Professional
- Fill registration form:
  - Name: QA Test User
  - Email: qa.test@example.com
  - Title: QA Engineer
  - Location: Nigeria
  - Phone: +2348012345678
  - Password: Test123!@#
- Complete all 4 onboarding steps
- Submit registration
- Verify email verification screen appears

#### Test 3: Email Verification (3 min)
- Check email inbox for verification code
- Copy 6-digit code
- Enter code in verification screen
- Click "Verify"
- Verify dashboard redirect

#### Test 4: Login Flow (2 min)
- Logout from dashboard
- Navigate to /login
- Enter credentials from Test 2
- Verify successful login

#### Test 5: Session Persistence (3 min)
- Login to staging
- Access dashboard
- Refresh page (F5)
- Verify session maintained
- Check localStorage for token

#### Test 6: API Health (3 min)
- Open DevTools → Network tab
- Trigger API calls (login, registration)
- Verify all responses are 2xx
- Check response times <500ms

**Document Results:**

Copy this template to `audit-reports/smoke-test-results.md`:

```markdown
# Smoke Test Results

**Date:** 2024-XX-XX
**Tester:** [Your Name]
**Staging URL:** https://coreid-staging-xxx.vercel.app

| Test ID | Status | Notes |
|---------|--------|-------|
| SMOKE-001: Homepage Load | ✅ / ❌ | |
| SMOKE-002: Registration | ✅ / ❌ | |
| SMOKE-003: Email Verification | ✅ / ❌ | |
| SMOKE-004: Login Flow | ✅ / ❌ | |
| SMOKE-005: Session Persistence | ✅ / ❌ | |
| SMOKE-006: API Health | ✅ / ❌ | |

**Overall:** PASS / FAIL
**Critical Issues:** [List blockers]
**Recommendation:** PROCEED / BLOCK
```

---

### Step 5: Monitor Staging (24-48 hours)

**Goal:** Ensure stability before production deployment

**Monitor These Metrics:**

| Metric | Target | Where to Check |
|--------|--------|----------------|
| Uptime | >99.9% | Vercel Dashboard → Analytics |
| Error Rate | <0.1% | Vercel Dashboard → Logs |
| Avg Response Time | <500ms | Vercel Dashboard → Analytics |
| Email Delivery | >99% | Resend Dashboard → Logs |

**Daily Checks:**

```bash
# View Vercel logs (real-time)
vercel logs <staging-url> --follow

# Check for errors
vercel logs <staging-url> | grep "ERROR"

# Check for 5xx status codes
vercel logs <staging-url> | grep "5[0-9][0-9]"
```

**Supabase Checks:**

1. Login to Supabase Dashboard
2. Navigate to Logs → Edge Functions
3. Look for errors in:
   - `/server/register`
   - `/verify-email-code`
   - `/send-verification-email`
4. Check API response times

**Resend Checks:**

1. Login to Resend Dashboard
2. Navigate to Logs
3. Verify email delivery rate >99%
4. Check for bounces or complaints

---

### Step 6: Obtain Sign-Off (1-2 days)

**Goal:** Get stakeholder approvals for production deployment

**Required Approvals:**

1. **QA Engineer Sign-Off**
   - All smoke tests passing
   - Manual regression tests completed
   - No critical issues found

2. **Product Owner Sign-Off**
   - Staging validation successful
   - Features meet acceptance criteria
   - User experience validated

3. **Engineering Lead Sign-Off**
   - Code quality verified (97 tests, 92% coverage)
   - Backend audit passed
   - Security checks passed

**Prepare Release Notes:**

Create `release-notes-v1.0.0.md`:

```markdown
# CoreID v1.0.0 Release Notes

## Features
- ✅ Professional and Employer registration
- ✅ Email verification with 6-digit codes
- ✅ Session persistence and token auto-refresh
- ✅ Dashboard access for verified users

## Quality Metrics
- 97 automated tests (45 unit + 28 integration + 8 E2E)
- 92.3% test coverage
- All smoke tests passing
- 24h staging stability validated

## Infrastructure
- Supabase for database and auth
- Resend for email delivery
- Vercel for hosting
- CI/CD with 8-job pipeline

## Sign-Off
- QA Engineer: [Name] - [Date]
- Product Owner: [Name] - [Date]
- Engineering Lead: [Name] - [Date]
```

---

## Production Deployment (After Sign-Off)

**Only proceed after ALL approvals obtained!**

### Pre-Deployment Checklist

- [ ] All smoke tests passing on staging
- [ ] Staging stable for 24+ hours
- [ ] Backend audit passed (no critical issues)
- [ ] Resend validation passed
- [ ] QA Engineer sign-off obtained
- [ ] Product Owner sign-off obtained
- [ ] Engineering Lead sign-off obtained
- [ ] Production environment variables configured
- [ ] Production Supabase database ready
- [ ] Production Resend domain configured
- [ ] Rollback plan documented

### Deployment Steps

```bash
# 1. Merge staging branch to main
git checkout main
git merge staging/pre-production-validation

# 2. Create production tag
git tag -a v1.0.0 -m "Production Release v1.0.0"
git push origin v1.0.0

# 3. Deploy to production (Vercel auto-deploys on main branch push)
git push origin main

# 4. Monitor deployment
vercel ls --prod
vercel logs <production-url> --follow

# 5. Run smoke tests on production
# Execute same 6 smoke tests from Step 4
```

### Post-Deployment

- [ ] All smoke tests passing on production
- [ ] No spike in error rates
- [ ] Email delivery functioning
- [ ] Monitor for first hour
- [ ] Generate deployment report
- [ ] Announce launch to team/users

---

## Troubleshooting

### Backend Audit Fails

**Issue:** Script exits with errors

**Solutions:**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct (not anon key)
- Check Supabase project is accessible
- Review error message in audit report
- Manually verify database in Supabase Dashboard

### Resend Validation Fails

**Issue:** Test email not sent

**Solutions:**
- Verify `RESEND_API_KEY` format starts with `re_`
- Check API key tier (test vs production)
- Login to Resend Dashboard → verify quota not exceeded
- Try manual email send via Resend Dashboard

### Staging Deployment Fails

**Issue:** Vercel deployment errors

**Solutions:**
- Check build logs in Vercel Dashboard
- Verify environment variables set correctly
- Run `npm run build` locally to catch build errors
- Check Supabase URL is accessible from Vercel

### Smoke Tests Fail

**Issue:** Registration or verification not working

**Solutions:**
- Check browser console for errors (F12)
- Verify Resend emails are being sent (check Resend logs)
- Check Supabase Edge Functions are deployed
- Verify environment variables in Vercel

---

## Quick Reference

### Commands

```bash
# Backend audit
export VITE_SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-key
npm run audit:backend

# Resend validation
export RESEND_API_KEY=re_your_key
npm run audit:resend

# Both audits
npm run audit:all

# Deploy to staging
vercel deploy

# View logs
vercel logs <url> --follow
```

### Important URLs

- Supabase Dashboard: `https://supabase.com/dashboard`
- Resend Dashboard: `https://resend.com/dashboard`
- Vercel Dashboard: `https://vercel.com/dashboard`
- GitHub Actions: `https://github.com/[username]/CoreID/actions`

### Documentation

- Manual QA Checklist: `docs/qa-manual-test-checklist.md`
- Staging Deployment Guide: `docs/staging-deployment-guide.md`
- QA Summary: `docs/qa-deployment-validation-summary.md`
- Phase 4 Summary: `docs/phase4-testing-validation-summary.md`

---

## Timeline

| Day | Activity | Duration |
|-----|----------|----------|
| Day 1 | Backend audit + Resend validation | 1 hour |
| Day 1 | Deploy to staging | 1 hour |
| Day 1 | Execute smoke tests | 30 min |
| Day 1-2 | Monitor staging | 24-48 hours |
| Day 2-3 | Execute manual QA tests | 4 hours |
| Day 3 | Stakeholder reviews and sign-off | 1-2 days |
| Day 4-5 | Production deployment | 2 hours |

**Total:** 4-5 business days to production

---

**Ready to Start?**

Begin with **Step 1: Backend Audit** above! 🚀
