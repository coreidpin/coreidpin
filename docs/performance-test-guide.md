# ⚡ Performance Test - Quick Guide

**Time:** 04:32 AM  
**File:** `scripts/test-performance-simple.sql` (OPEN)

---

## 🎯 Quick 2-Step Process

### **STEP 1: Get User ID** (30 seconds)

In Supabase SQL Editor, run:
```sql
SELECT user_id, email, full_name 
FROM profiles 
WHERE user_id IS NOT NULL
LIMIT 1;
```

**Copy the `user_id`** (looks like: `a1b2c3d4-e5f6-...`)

---

### **STEP 2: Run Performance Tests** (3 minutes)

In the open file `test-performance-simple.sql`:

1. **Find** all instances of `'YOUR-USER-ID-HERE'` (there are 5)
2. **Replace** each with your actual user_id
3. **Copy Test 1** (lines 19-24) → Paste in Supabase → RUN
4. Check "Execution Time" at bottom
5. Repeat for Tests 2, 3, 4, 5

---

## ✅ What to Look For

Each test shows **"Execution Time: X.XXX ms"** at the end.

**Grading:**
- < 10ms = ✅ **EXCELLENT** (A+)
- < 50ms = ✅ **GOOD** (A)
- < 100ms = ⚠️ **ACCEPTABLE** (B)
- > 100ms = ⚠️ **NEEDS WORK** (C)

---

## 📊 Expected Results

**Test 1: Profile Query** → < 10ms ✅  
**Test 2: Feature Access** → < 20ms ✅  
**Test 3: Join Query** → < 50ms ✅  
**Test 4: Business Profile** → < 50ms ✅  
**Test 5: Notifications** → < 100ms ✅

All should be in the GREEN zone!

---

## ⏱️ Timeline

- Get user ID: **30 sec**
- Update file: **1 min**
- Run 5 tests: **3 min**
- **Total: ~5 minutes**

---

**You've got this!** Just like the RLS test - copy, paste, check results! 🚀
