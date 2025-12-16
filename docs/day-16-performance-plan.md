# Week 3, Day 16 - Performance Audit & Optimization
**Date:** December 16, 2024  
**Focus:** Database Performance, Query Optimization, Indexing  
**Status:** 🚧 In Progress

---

## 📋 Day 16 Objectives

1. Audit critical query performance
2. Identify missing indexes
3. Optimize slow queries (<50ms target)
4. Run EXPLAIN ANALYZE on key operations
5. Add composite indexes where needed
6. Document performance benchmarks

---

## 🎯 Performance Targets

| Metric | Target | Importance |
|--------|--------|------------|
| **Query Response Time** | <50ms | Critical |
| **RLS Policy Evaluation** | <10ms | High |
| **Index Hit Ratio** | >99% | High |
| **Sequential Scans** | Minimize | Medium |
| **Connection Pool Usage** | <80% | Medium |

---

## 🔍 Critical Queries to Audit

### 1. Authentication & Sessions
- User login lookup
- Session validation
- Token refresh queries

### 2. Profile Operations
- Profile fetch by user_id
- Profile completion calculation
- Public profile lookup

### 3. Work Experience
- User's work history
- Verification status check
- Timeline queries

### 4. Business Operations
- Business profile lookup
- API keys fetch
- Webhook configuration
- Usage logs query

### 5. Notifications
- Unread count
- Recent notifications
- Mark as read bulk operation

### 6. Analytics
- PIN verification stats
- API usage aggregation
- Monthly partition queries

---

## 📊 Audit Scripts

### Script 1: Index Usage Analysis

```sql
-- Find tables with missing indexes (sequential scans)
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    CASE 
        WHEN seq_scan + idx_scan > 0 
        THEN ROUND(100.0 * idx_scan / (seq_scan + idx_scan), 2)
        ELSE 0
    END as index_usage_percentage
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY seq_scan DESC, tablename;
```

### Script 2: Slow Query Detection

```sql
-- Find slow queries (requires pg_stat_statements extension)
SELECT 
    query,
    calls,
    mean_exec_time,
    max_exec_time,
    stddev_exec_time,
    rows
FROM pg_stat_statements
WHERE mean_exec_time > 50  -- Queries averaging >50ms
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Script 3: Table Bloat Check

```sql
-- Check for table bloat
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    n_dead_tup,
    n_live_tup,
    ROUND(100 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_tuple_percent
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_live_tup > 0
ORDER BY n_dead_tup DESC;
```

### Script 4: Missing Indexes Detection

```sql
-- Suggest missing indexes based on sequential scans
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    seq_tup_read / seq_scan as avg_seq_tup_read,
    idx_scan
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 0
  AND seq_tup_read / seq_scan > 10000  -- Large scans
ORDER BY seq_tup_read DESC;
```

---

## 🚀 Performance Optimization Migration

### Critical Indexes to Add

```sql
-- User sessions - for token refresh
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token_active
    ON user_sessions(refresh_token) 
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_expires
    ON user_sessions(user_id, refresh_token_expires_at)
    WHERE is_active = true;

-- Profiles - for feature gating
CREATE INDEX IF NOT EXISTS idx_profiles_completion
    ON profiles(user_id, profile_completion_percentage);

-- Work experiences - for profile completion
CREATE INDEX IF NOT EXISTS idx_work_exp_user_current
    ON work_experiences(user_id, is_current)
    WHERE is_current = true;

-- Notifications - for unread count
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON notifications(user_id, created_at DESC)
    WHERE is_read = false;

-- API Keys - for business lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_user_active
    ON api_keys(user_id, is_active)
    WHERE is_active = true;

-- Webhooks - for business lookups
CREATE INDEX IF NOT EXISTS idx_webhooks_business_active
    ON webhooks(business_id, is_active)
    WHERE is_active = true;

-- Business profiles - for ownership checks
CREATE INDEX IF NOT EXISTS idx_business_profiles_user
    ON business_profiles(user_id, id);
```

---

## 📈 Query Optimization Examples

### Before: Slow Profile Fetch
```sql
-- Slow: Multiple queries, no index use
SELECT * FROM profiles WHERE user_id = $1;
SELECT * FROM work_experiences WHERE user_id = $1;
SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false;
```

### After: Optimized with Indexes
```sql
-- Fast: Single query with proper indexes
SELECT 
    p.*,
    (SELECT json_agg(we) FROM work_experiences we WHERE we.user_id = p.user_id) as work_exp,
    (SELECT COUNT(*) FROM notifications n WHERE n.user_id = p.user_id AND n.is_read = false) as unread_count
FROM profiles p
WHERE p.user_id = $1;
```

### Before: Slow Unread Count
```sql
-- Slow: Full table scan
SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false;
```

### After: Covered by Partial Index
```sql
-- Fast: Index-only scan
CREATE INDEX idx_notifications_user_unread 
    ON notifications(user_id) 
    WHERE is_read = false;
-- Query automatically uses this index
```

---

## 🧪 Load Testing Plan

### Tool: k6 (Load Testing)

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '3m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '2m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests <500ms
    http_req_failed: ['rate<0.01'],   // <1% errors
  },
};

export default function () {
  // Test profile fetch
  const profileRes = http.get('http://localhost:3000/api/profile');
  check(profileRes, {
    'profile status 200': (r) => r.status === 200,
    'profile response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

---

## 📊 Benchmarking Queries

### Test Suite

```sql
-- Enable timing
\timing on

-- Test 1: Profile fetch (should be <10ms)
EXPLAIN ANALYZE
SELECT * FROM profiles WHERE user_id = 'test-uuid';

-- Test 2: Unread notifications (should be <5ms)
EXPLAIN ANALYZE
SELECT COUNT(*) 
FROM notifications 
WHERE user_id = 'test-uuid' AND is_read = false;

-- Test 3: User sessions lookup (should be <10ms)
EXPLAIN ANALYZE
SELECT * 
FROM user_sessions 
WHERE refresh_token = 'test-token' AND is_active = true;

-- Test 4: Business API keys (should be <10ms)
EXPLAIN ANALYZE
SELECT * 
FROM api_keys 
WHERE user_id = 'test-uuid' AND is_active = true;

-- Test 5: Work experience timeline (should be <20ms)
EXPLAIN ANALYZE
SELECT * 
FROM work_experiences 
WHERE user_id = 'test-uuid'
ORDER BY start_date DESC;
```

---

## 🎯 Success Metrics

| Test | Target | Measurement |
|------|--------|-------------|
| Profile Fetch | <10ms | EXPLAIN ANALYZE |
| Unread Count | <5ms | EXPLAIN ANALYZE |
| Session Lookup | <10ms | EXPLAIN ANALYZE |
| API Keys Fetch | <10ms | EXPLAIN ANALYZE |
| Work Timeline | <20ms | EXPLAIN ANALYZE |
| 100 Concurrent Users | <500ms p95 | k6 load test |
| Error Rate | <1% | k6 load test |

---

## 📝 Deliverables

1. **Performance Audit Script** ✅ (Created)
2. **Index Optimization Migration** ⏳
3. **Query Benchmarks** ⏳
4. **Load Test Results** ⏳
5. **Performance Report** ⏳
6. **Optimization Recommendations** ⏳

---

## 🔮 Expected Improvements

**Before Optimization:**
- Profile fetch: 50-100ms
- Unread count: 30-50ms
- Sequential scans: Common
- Index usage: ~70%

**After Optimization:**
- Profile fetch: <10ms
- Unread count: <5ms
- Sequential scans: Rare
- Index usage: >95%

**Impact:**
- 5-10x faster queries
- Better user experience
- Ready for scale (10,000+ users)

---

**Day 16 Status:** 🚧 **In Progress**  
**Next Task:** Create performance audit scripts  
**Estimated Time:** 3-4 hours

---

**Updated:** December 16, 2024  
**Author:** Development Team  
**Next:** Run audits, apply optimizations, measure results
