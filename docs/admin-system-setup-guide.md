# Admin System Setup Guide
**Created:** December 16, 2024  
**Migration:** 20241216120000_harden_definer_functions.sql

---

## 🎯 Quick Start

### Step 1: Apply Migration
```bash
npx supabase db push
```

### Step 2: Create First Admin
```sql
-- Replace with your email
SELECT create_first_admin('your-email@example.com');
```

### Step 3: Verify
```sql
-- Check if you're an admin
SELECT is_admin();
-- Should return: true
```

### Step 4: Test Announcement
```sql
-- Try creating an announcement
SELECT create_announcement(
    'Test Announcement',
    'This is a test system announcement',
    'info'
);
-- Should succeed if you're an admin
```

---

## 📚 Function Reference

### `create_first_admin(email)`
**Purpose:** Create the very first admin user  
**Security:** Only works when NO admins exist yet

```sql
-- Example
SELECT create_first_admin('admin@example.com');
```

**Returns:** `true` on success  
**Errors:**
- "Admin users already exist" - Use `grant_admin_access()` instead
- "User with email X not found" - User doesn't exist in auth.users

---

### `is_admin(user_id)`
**Purpose:** Check if a user has admin privileges  
**Security:** SECURITY INVOKER (safe)

```sql
-- Check current user
SELECT is_admin();

-- Check specific user
SELECT is_admin('uuid-here');
```

**Returns:** `true` if admin, `false` otherwise

---

### `grant_admin_access(user_id)`
**Purpose:** Grant admin privileges to a user  
**Security:** Only callable by existing admins

```sql
-- Must be executed by an admin
SELECT grant_admin_access('user-uuid-here');
```

**Returns:** `true` on success  
**Errors:**
- "Unauthorized" - You're not an admin
- "User not found" - User doesn't have a profile

---

### `create_announcement(title, message, type)`
**Purpose:** Create system-wide announcement for all users  
**Security:** Admin only, input validated

```sql
SELECT create_announcement(
    'Maintenance Notice',
    'System maintenance scheduled for tonight at 10 PM',
    'warning'
);
```

**Parameters:**
- `title` - Announcement title (required, non-empty)
- `message` - Announcement message (required, non-empty)
- `type` - One of: 'success', 'alert', 'info', 'warning' (default: 'info')

**Returns:** UUID of created announcement  
**Errors:**
- "Unauthorized" - You're not an admin
- "Title cannot be empty" - Invalid input
- "Invalid announcement type" - Use valid type

---

## 🔐 Security Details

### Admin Check Flow
```
User calls function
    ↓
Get auth.uid()
    ↓
Check profiles.is_admin = true
    ↓
If false → RAISE EXCEPTION
    ↓
If true → Continue
```

### Database Schema
```sql
-- profiles table
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Example admin user
UPDATE profiles 
SET is_admin = true 
WHERE user_id = 'uuid-here';
```

---

## 🎯 Use Cases

### 1. Initial Setup (Production)
```sql
-- Step 1: Create first admin (your account)
SELECT create_first_admin('you@yourcompany.com');

-- Step 2: Grant admin to other team members
SELECT grant_admin_access('teammate-uuid-1');
SELECT grant_admin_access('teammate-uuid-2');

-- Step 3: Send test announcement
SELECT create_announcement(
    'Welcome!',
    'Welcome to the platform!',
    'success'
);
```

### 2. Regular Announcements
```sql
-- New feature announcement
SELECT create_announcement(
    'New Feature: Webhooks',
    'You can now configure webhooks in the Developer Console!',
    'success'
);

-- Maintenance notice
SELECT create_announcement(
    'Scheduled Maintenance',
    'System will be down for maintenance on Dec 20, 2-4 AM UTC',
    'warning'
);

-- Important alert
SELECT create_announcement(
    'Security Update',
    'Please update your password as a security precaution',
    'alert'
);
```

### 3. Admin Management
```sql
-- List all admins
SELECT user_id, email, full_name, is_admin
FROM profiles
WHERE is_admin = true;

-- Revoke admin access (manual)
UPDATE profiles 
SET is_admin = false,
    updated_at = NOW()
WHERE user_id = 'user-to-demote';

-- Grant admin (using function)
SELECT grant_admin_access('user-to-promote');
```

---

## ⚠️ Common Issues

### Issue 1: "Admin users already exist"
**Cause:** Trying to use `create_first_admin()` when admins exist

**Solution:**
```sql
-- Use grant_admin_access instead
SELECT grant_admin_access('user-uuid');
```

---

### Issue 2: "Unauthorized: Only administrators can..."
**Cause:** Non-admin trying to create announcement or grant admin

**Solution:**
```sql
-- Check if you're an admin
SELECT is_admin();

-- If false, ask an existing admin to grant you admin access
```

---

### Issue 3: No admins exist, can't create first admin
**Cause:** Email doesn't match any user in auth.users

**Solution:**
```sql
-- 1. Check if user exists
SELECT id, email FROM auth.users WHERE email = 'your-email';

-- 2. If not, user needs to sign up first

-- 3. Then run create_first_admin with exact email
SELECT create_first_admin('exact-email@example.com');
```

---

## 🧪 Testing

### Test 1: Admin Creation
```sql
-- Should succeed
SELECT create_first_admin('test-admin@example.com');

-- Should fail (admin already exists)
SELECT create_first_admin('another@example.com');
```

### Test 2: Admin Check
```sql
-- Should return true
SELECT is_admin() FROM profiles WHERE is_admin = true;

-- Should return false
SELECT is_admin() FROM profiles WHERE is_admin = false;
```

### Test 3: Announcement (Non-Admin)
```sql
-- Login as non-admin user
-- Should fail with "Unauthorized"
SELECT create_announcement('Test', 'Test', 'info');
```

### Test 4: Announcement (Admin)
```sql
-- Login as admin user
-- Should succeed
SELECT create_announcement('Test', 'Test Message', 'info');

-- Verify all users received it
SELECT COUNT(*) FROM notifications 
WHERE category = 'announcement' 
  AND title = 'Test';
-- Should equal total user count
```

---

## 📊 Monitoring

### Check Admin Count
```sql
SELECT COUNT(*) as admin_count 
FROM profiles 
WHERE is_admin = true;
```

### Recent Announcements
```sql
SELECT 
    title,
    message,
    type,
    metadata->>'created_by' as created_by_admin,
    created_at
FROM notifications
WHERE category = 'announcement'
ORDER BY created_at DESC
LIMIT 10;
```

### Admin Activity Log
```sql
-- If you have audit logging
SELECT 
    action,
    metadata,
    created_at
FROM audit_logs
WHERE action LIKE '%admin%'
ORDER BY created_at DESC;
```

---

## 🔒 Best Practices

### 1. Limit Admin Count
- Start with 1-2 admins
- Only grant to trusted team members
- Review admin list quarterly

### 2. Audit Announcements
- Keep announcements professional
- Don't spam users
- Use appropriate type (info vs warning vs alert)

### 3. Admin Security
- Use strong passwords for admin accounts
- Enable 2FA if available
- Monitor admin activity

### 4. Revoke When Needed
```sql
-- When someone leaves the team
UPDATE profiles 
SET is_admin = false,
    updated_at = NOW()
WHERE user_id = 'former-employee-uuid';
```

---

## 📞 Support

**Questions?** 
- Check `docs/security-definer-justification.md`
- See `docs/day-12-summary.md`

**Issues?**
- Create ticket with `[Admin System]` tag
- Include error message and SQL query

---

**Last Updated:** December 16, 2024  
**Status:** Production Ready ✅
