# 📧 PHASE 4B: Email Notifications System

**Status:** Planning  
**Estimated Time:** 3-4 hours  
**Priority:** High - Critical for user engagement

---

## 🎯 **OBJECTIVES**

Build a complete email notification system that:
- Sends automated emails (welcome, verification, alerts, announcements)
- Manages user email preferences
- Tracks email delivery and engagement
- Handles unsubscribes properly
- Queues emails for reliable delivery
- Provides admin controls

---

## 📋 **SUB-PHASES**

### **Phase 4B.1: Email Service Setup & Templates** ⏱️ 1 hour
**What we'll build:**
- ✅ Integrate Resend email service (modern, generous free tier)
- ✅ Create email templates system
- ✅ Build reusable template components
- ✅ Template variables & personalization

**Email Templates:**
1. Welcome email (new user)
2. Email verification
3. Password reset
4. Announcement/broadcast
5. Weekly digest
6. Account alerts

**Files to create:**
- `supabase/functions/send-email/index.ts` (Edge Function)
- `src/email/templates/` (Template files)
- `src/email/emailService.ts` (Email service wrapper)

---

### **Phase 4B.2: Email Preferences & Subscriptions** ⏱️ 45 min
**What we'll build:**
- ✅ User email preferences table
- ✅ Opt-in/opt-out system
- ✅ Email categories (marketing, transactional, announcements)
- ✅ Unsubscribe links with tokens
- ✅ Preference management UI

**Database:**
```sql
email_preferences (
  user_id,
  marketing_emails BOOLEAN,
  product_updates BOOLEAN,
  announcements BOOLEAN,
  weekly_digest BOOLEAN,
  unsubscribed_at TIMESTAMP
)

unsubscribe_tokens (
  token UUID,
  user_id UUID,
  email_type TEXT,
  expires_at TIMESTAMP
)
```

**Files to create:**
- `supabase/migrations/20251226130000_create_email_system.sql`
- `src/admin/pages/EmailPreferences.tsx`

---

### **Phase 4B.3: Email Queue & Sending** ⏱️ 1 hour
**What we'll build:**
- ✅ Email queue table
- ✅ Background job to process queue
- ✅ Retry logic (3 attempts)
- ✅ Rate limiting (avoid spam)
- ✅ Batch sending
- ✅ Priority levels

**Database:**
```sql
email_queue (
  id UUID,
  to_email TEXT,
  template_id TEXT,
  variables JSONB,
  priority TEXT, -- high, normal, low
  status TEXT, -- pending, sent, failed, cancelled
  attempts INT,
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  error_message TEXT
)
```

**Files to create:**
- `supabase/functions/process-email-queue/index.ts`
- `src/admin/services/email-queue.service.ts`

---

### **Phase 4B.4: Email Tracking & Analytics** ⏱️ 45 min
**What we'll build:**
- ✅ Email delivery tracking
- ✅ Open rate tracking (pixel)
- ✅ Click tracking
- ✅ Bounce handling
- ✅ Statistics dashboard
- ✅ Email performance metrics

**Database:**
```sql
email_logs (
  id UUID,
  queue_id UUID,
  user_id UUID,
  email_type TEXT,
  status TEXT, -- sent, delivered, opened, clicked, bounced
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced_at TIMESTAMP,
  bounce_reason TEXT,
  metadata JSONB
)
```

**Files to create:**
- `src/admin/pages/EmailAnalytics.tsx`
- `src/admin/services/email-analytics.service.ts`

---

## 🛠️ **TECHNICAL STACK**

### **Email Provider: Resend**
- **Why:** Modern API, generous free tier (3k emails/month), excellent deliverability
- **Alternative:** SendGrid, Mailgun, AWS SES

### **Template Engine: React Email**
- **Why:** Write templates in React, renders to HTML
- **Features:** Type-safe, reusable components, preview

### **Queue Processing: Supabase Edge Functions**
- **Why:** Serverless, cron-scheduled, scalable
- **Features:** Automatic retries, logging

---

## 📊 **DATABASE SCHEMA**

```sql
-- Email preferences
CREATE TABLE email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  marketing_emails BOOLEAN DEFAULT true,
  product_updates BOOLEAN DEFAULT true,
  announcements BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT false,
  all_emails BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Email queue
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  to_email TEXT NOT NULL,
  template_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'normal', -- high, normal, low
  status TEXT DEFAULT 'pending', -- pending, processing, sent, failed, cancelled
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email logs
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES email_queue(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL,
  to_email TEXT NOT NULL,
  status TEXT NOT NULL, -- sent, delivered, opened, clicked, bounced, failed
  provider_message_id TEXT,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  bounce_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unsubscribe tokens
CREATE TABLE unsubscribe_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  email_type TEXT, -- specific category or 'all'
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_queue_status ON email_queue(status, scheduled_for);
CREATE INDEX idx_email_logs_user ON email_logs(user_id, created_at DESC);
```

---

## 🎨 **EMAIL TEMPLATES**

### **1. Welcome Email**
**Trigger:** New user registration  
**Content:** Welcome message, getting started guide, CTA to complete profile

### **2. Email Verification**
**Trigger:** New account or email change  
**Content:** Verification link, security message

### **3. Announcement**
**Trigger:** Admin creates announcement  
**Content:** Dynamic content from announcement, CTA

### **4. Password Reset**
**Trigger:** User requests password reset  
**Content:** Reset link (expires 1 hour), security tips

### **5. Weekly Digest**
**Trigger:** Scheduled (cron)  
**Content:** Activity summary, new opportunities, stats

### **6. Account Alert**
**Trigger:** Suspicious activity, security changes  
**Content:** Alert message, action required

---

## 🔐 **SECURITY CONSIDERATIONS**

1. **Rate Limiting:** Max 100 emails/user/day
2. **Unsubscribe:** One-click unsubscribe (RFC 8058)
3. **Token Expiry:** Verification links expire after 24 hours
4. **DKIM/SPF:** Proper email authentication
5. **Personal Data:** Don't store sensitive info in email logs
6. **GDPR:** Allow users to request email history deletion

---

## 📈 **METRICS TO TRACK**

1. **Delivery Rate:** % of emails successfully delivered
2. **Open Rate:** % of delivered emails opened
3. **Click Rate:** % of emails with link clicks
4. **Bounce Rate:** % of emails bounced
5. **Unsubscribe Rate:** % of users unsubscribing
6. **Spam Rate:** % marked as spam

**Benchmarks:**
- Delivery: >95%
- Open: 20-30%
- Click: 2-5%
- Bounce: <2%
- Unsubscribe: <0.5%

---

## 🚀 **IMPLEMENTATION ORDER**

### **Step 1: Setup Resend** (15 min)
1. Sign up for Resend
2. Verify domain
3. Get API key
4. Add to Supabase secrets

### **Step 2: Database Schema** (20 min)
1. Create migration file
2. Deploy to Supabase
3. Test tables

### **Step 3: Email Templates** (45 min)
1. Install React Email
2. Create template components
3. Preview templates
4. Export to HTML

### **Step 4: Send Email Function** (30 min)
1. Create Edge Function
2. Integrate Resend
3. Handle errors
4. Test sending

### **Step 5: Email Queue** (30 min)
1. Queue service layer
2. Cron job processor
3. Retry logic
4. Rate limiting

### **Step 6: Email Preferences** (30 min)
1. Preferences UI
2. Unsubscribe page
3. Update user settings

### **Step 7: Analytics Dashboard** (30 min)
1. Email stats page
2. Charts and metrics
3. Export reports

---

## ✅ **ACCEPTANCE CRITERIA**

- [ ] Users receive welcome email on signup
- [ ] Email verification works
- [ ] Users can manage email preferences
- [ ] Unsubscribe links work
- [ ] Admins can send announcements via email
- [ ] Email queue processes reliably
- [ ] Failed emails retry automatically
- [ ] Analytics dashboard shows metrics
- [ ] All emails are mobile-responsive
- [ ] No spam folder issues

---

## 🎯 **SUCCESS METRICS**

After implementation:
- 95%+ delivery rate
- 25%+ open rate for announcements
- <1% bounce rate
- <0.5% unsubscribe rate
- Zero spam complaints

---

**Ready to start building?** Let's begin with Phase 4B.1! 🚀
