# Frontend Migration Guide - SECURITY DEFINER Removal
**Week 3 - Day 11/12**  
**For:** Frontend Developers  
**Impact:** Code changes required to replace removed functions

---

## 🚨 Breaking Changes

We removed 8 SECURITY DEFINER functions for security reasons.  
This guide shows how to update your frontend code.

---

## 1. Webhook Functions

### ❌ OLD: Using removed functions
```typescript
// DON'T USE - Function removed for security
const { data, error } = await supabase
  .rpc('create_webhook_for_business', {
    p_business_id: businessId,
    p_url: url,
    p_events: events,
    p_secret: secret
  });
```

### ✅ NEW: Direct INSERT with RLS
```typescript
// Use direct INSERT - RLS automatically validates you own the business
const { data, error } = await supabase
  .from('webhooks')
  .insert({
    business_id: businessId,
    url: url,
    events: events,
    secret: secret,
    is_active: true
  })
  .select()
  .single();

// If error.code === '42501', user doesn't own this business
if (error) {
  if (error.code === '42501') {
    toast.error('You do not have permission to create webhooks for this business');
  } else {
    toast.error('Failed to create webhook');
  }
}
```

### Get Webhooks
```typescript
// OLD: Don't use
await supabase.rpc('get_webhooks_for_business', { p_business_id: id });

// NEW: Direct SELECT
const { data, error } = await supabase
  .from('webhooks')
  .select('*')
  .eq('business_id', businessId)
  .order('created_at', { ascending: false });
// RLS automatically filters to businesses you own
```

---

## 2. API Key Functions

### Create API Key
```typescript
// OLD: Don't use
await supabase.rpc('create_api_key_for_user', { ... });

// NEW: Direct INSERT
const { data, error } = await supabase
  .from('api_keys')
  .insert({
    user_id: userId,  // Must be auth.uid() or RLS will reject
    key_name: name,
    api_key: generatedKey,
    api_secret: generatedSecret,
    environment: env,
    permissions: permissions,
    is_active: true
  })
  .select()
  .single();
```

### Get API Keys
```typescript
// OLD: Don't use
await supabase.rpc('get_api_keys_for_user', { p_user_id: userId });

// NEW: Direct SELECT
const { data, error } = await supabase
  .from('api_keys')
  .select('*')
  .order('created_at', { ascending: false });
// RLS automatically filters to auth.uid() only
// No need to specify user_id in WHERE clause
```

---

## 3. Notification Functions

### Mark Notification as Read
```typescript
// OLD: Don't use
await supabase.rpc('mark_notification_read', { notification_id: id });

// NEW: Direct UPDATE
const { error } = await supabase
  .from('notifications')
  .update({
    is_read: true,
    is_new: false,
    read_at: new Date().toISOString()
  })
  .eq('id', notificationId);
// RLS ensures you can only update your own notifications
```

### Mark All Notifications as Read
```typescript
// OLD: Don't use
await supabase.rpc('mark_all_notifications_read');

// NEW: Direct UPDATE
const { error } = await supabase
  .from('notifications')
  .update({
    is_read: true,
    is_new: false,
    read_at: new Date().toISOString()
  })
  .eq('is_read', false);
// RLS automatically filters to only your notifications
```

### Get Unread Count
```typescript
// OLD: Don't use
const { data } = await supabase.rpc('get_unread_notification_count');

// NEW: Direct COUNT
const { count, error } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('is_read', false);
// count variable now has the unread count
// RLS automatically filters to your notifications only
```

---

## 4. Example Component Updates

### Before (Using RPCs)
```typescript
// components/WebhookSettings.tsx (BEFORE)
const createWebhook = async () => {
  const { data, error } = await supabase
    .rpc('create_webhook_for_business', {
      p_business_id: businessId,
      p_url: webhookUrl,
      p_events: selectedEvents,
      p_secret: secret
    });
};

const loadWebhooks = async () => {
  const { data } = await supabase
    .rpc('get_webhooks_for_business', {
      p_business_id: businessId
    });
  setWebhooks(data);
};
```

### After (Using Direct Queries)
```typescript
// components/WebhookSettings.tsx (AFTER)
const createWebhook = async () => {
  const { data, error } = await supabase
    .from('webhooks')
    .insert({
      business_id: businessId,
      url: webhookUrl,
      events: selectedEvents,
      secret: secret,
      is_active: true
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error:', error);
    toast.error('Failed to create webhook');
    return;
  }
  
  toast.success('Webhook created successfully');
  loadWebhooks();
};

const loadWebhooks = async () => {
  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
    
  if (!error && data) {
    setWebhooks(data);
  }
};
```

---

## 5. Search & Replace Guide

Use these patterns to find and update code:

### Find RPCs to Replace
```bash
# Search for old webhook RPCs
grep -r "create_webhook_for_business" src/
grep -r "get_webhooks_for_business" src/

# Search for old API key RPCs
grep -r "create_api_key_for_user" src/
grep -r "get_api_keys_for_user" src/

# Search for old notification RPCs
grep -r "mark_notification_read" src/
grep -r "mark_all_notifications_read" src/
grep -r "get_unread_notification_count" src/
```

---

## 6. Error Handling

### RLS Permission Denied
```typescript
if (error?.code === '42501') {
  // User doesn't have permission (RLS blocked it)
  toast.error('You do not have permission to perform this action');
}
```

### Common Error Codes
- `42501` - RLS permission denied (user doesn't own the resource)
- `23505` - Unique violation (duplicate key)
- `23503` - Foreign key violation (referenced resource doesn't exist)

---

## 7. Benefits of Direct Queries

✅ **Better Performance**
- No function call overhead
- Direct Postgres query

✅ **Better Security**
- RLS enforced automatically
- No way to bypass permissions

✅ **Simpler Code**
- Fewer function parameters
- Standard Supabase query patterns

✅ **Better TypeScript**
- Auto-generated types from Supabase
- Better IDE autocomplete

---

## 8. Testing Checklist

After updating code, test:

### Webhooks
- [ ] Can create webhook for my own business
- [ ] Cannot create webhook for someone else's business (RLS blocks)
- [ ] Can view only my own business webhooks
- [ ] Can update/delete only my own webhooks

### API Keys
- [ ] Can create API key for myself
- [ ] Cannot create API key for another user (RLS blocks)
- [ ] Can view only my own API keys
- [ ] Can revoke only my own API keys

### Notifications
- [ ] Can mark my own notifications as read
- [ ] Cannot mark other users' notifications (RLS blocks)
- [ ] Unread count only shows my notifications
- [ ] Mark all only affects my notifications

---

## 9. Files to Update

Based on codebase structure, likely files:

```
src/components/
  ├── dev-console/
  │   ├── WebhookSettings.tsx        ← Update webhook code
  │   ├── APIKeysManager.tsx         ← Update API key code
  │   └── DeveloperConsole.tsx
  ├── dashboard/
  │   ├── NotificationCenter.tsx     ← Update notification code
  │   └── NotificationBell.tsx       ← Update unread count
```

---

## 10. Migration Timeline

**Day 12 (Today):**
- [ ] Update webhook creation/fetching
- [ ] Update API key creation/fetching
- [ ] Update notification marking
- [ ] Test locally

**Day 13:**
- [ ] Deploy to staging
- [ ] Integration testing
- [ ] Deploy to production

---

## ❓ FAQ

**Q: Will old code break immediately?**  
A: Yes, as soon as migrations are applied. The RPC functions will not exist.

**Q: Do I need to change my types?**  
A: No, the table structure is the same. RLS just enforces permissions.

**Q: What if I get permission denied errors?**  
A: User is trying to access a resource they don't own. This is correct behavior.

**Q: Can I still use RPCs for other functions?**  
A: Yes, but only for functions that remain (see `security-definer-justification.md`).

---

## 📞 Support

**Questions?** Contact the backend team  
**Issues?** Create ticket with `[DEFINER Migration]` tag  
**Documentation:** See `docs/security-definer-audit.md`

---

**Last Updated:** December 16, 2024  
**Status:** Ready for Day 12 implementation
