# 🔧 Quick Stats & Activity Heatmap - Real Data Integration

**Issue:** QuickStats and Activity Heatmap are using placeholder/sample data  
**Solution:** Connect to real database queries  
**Status:** 🔴 Needs Implementation

---

## ❌ **Current Problem**

### **QuickStats (Line 1365-1376):**
```typescript
<QuickStats 
  stats={{
    profileViews: stats.profileViews || 0,  // ❌ 'stats' undefined
    endorsements: stats.endorsements || 0,   // ❌ 'stats' undefined
    pinUsage: stats.pinUsage || 0,           // ❌ 'stats' undefined
    verifications: stats.verifications || 0  // ❌ 'stats' undefined
  }}
/>
```

### **Activity Heatmap (Line 1379-1400):**
```typescript
<ActivityHeatmap
  data={React.useMemo(() => {
    // ❌ Random sample data
    const count = Math.floor(Math.random() * 15);
    // ...
  }, [])}
/>
```

---

## ✅ **SOLUTION: Add Real Data Queries**

### **Step 1: Add State Variables**

Add after line 250 (after other useState declarations):

```typescript
// ✨ Phase 2 & 3: Stats Data
const [dashboardStats, setDashboardStats] = React.useState({
  profileViews: 0,
  endorsements: 0,
  pinUsage: 0,
  verifications: 0
});

const [statsTrends, setStatsTrends] = React.useState<{
  profileViews?: { change: number };
  endorsements?: { change: number };
  pinUsage?: { change: number };
  verifications?: { change: number };
}>({});

const [activityData, setActivityData] = React.useState<Array<{
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}>>([]);
```

---

### **Step 2: Fetch Dashboard Stats**

Add a new useEffect to fetch stats:

```typescript
// ✨ Fetch Dashboard Stats
React.useEffect(() => {
  if (!userId) return;

  async function fetchDashboardStats() {
    try {
      // Profile Views
      const { count: viewsCount } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', userId);

      // Endorsements Count
      const { count: endorsementsCount } = await supabase
        .from('endorsements')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', userId);

      // PIN Usage (if you have a pins table)
      const { count: pinCount } = await supabase
        .from('professional_pins')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', userId);

      // Verifications Count
      const { count: verificationsCount } = await supabase
        .from('verifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      setDashboardStats({
        profileViews: viewsCount || 0,
        endorsements: endorsementsCount || 0,
        pinUsage: pinCount || 0,
        verifications: verificationsCount || 0
      });

      // Calculate trends (compare to last period)
      // You can add more sophisticated trend calculation here
      setStatsTrends({
        profileViews: { change: 15 }, // Calculate real change %
        endorsements: { change: 8 },
        pinUsage: { change: -3 },
        verifications: { change: 12 }
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      handleError(error, 'Loading dashboard statistics');
    }
  }

  fetchDashboardStats();
}, [userId]);
```

---

### **Step 3: Fetch Activity Heatmap Data**

Add another useEffect for activity data:

```typescript
// ✨ Fetch Activity Heatmap Data
React.useEffect(() => {
  if (!userId) return;

  async function fetchActivityData() {
    try {
      // Fetch activities for the past year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { data: activities, error } = await supabase
        .from('user_activities') // Your activity tracking table
        .select('created_at, activity_type')
        .eq('user_id', userId)
        .gte('created_at', oneYearAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group activities by date
      const activityMap = new Map<string, number>();
      
      activities?.forEach(activity => {
        const date = activity.created_at.split('T')[0];
        activityMap.set(date, (activityMap.get(date) || 0) + 1);
      });

      // Generate full year data
      const heatmapData = [];
      const today = new Date();
      
      for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = activityMap.get(dateStr) || 0;
        
        // Calculate intensity level
        const level = count === 0 ? 0 
                    : count < 3 ? 1 
                    : count < 7 ? 2 
                    : count < 11 ? 3 
                    : 4;

        heatmapData.push({
          date: dateStr,
          count,
          level: level as 0 | 1 | 2 | 3 | 4
        });
      }

      setActivityData(heatmapData);

    } catch (error) {
      console.error('Error fetching activity data:', error);
      handleError(error, 'Loading activity overview');
    }
  }

  fetchActivityData();
}, [userId]);
```

---

### **Step 4: Update Component Props**

**QuickStats:** (Line 1365-1376)
```typescript
<QuickStats 
  stats={{
    profileViews: dashboardStats.profileViews,
    profileViewsChange: statsTrends.profileViews?.change,
    endorsements: dashboardStats.endorsements,
    endorsementsChange: statsTrends.endorsements?.change,
    pinUsage: dashboardStats.pinUsage,
    pinUsageChange: statsTrends.pinUsage?.change,
    verifications: dashboardStats.verifications,
    verificationsChange: statsTrends.verifications?.change
  }}
/>
```

**Activity Heatmap:** (Line 1379)
```typescript
<ActivityHeatmap
  data={activityData}
  onDayClick={(day) => {
    console.log('Clicked day:', day);
    toast.info(`${day.count} activities on ${new Date(day.date).toLocaleDateString()}`);
  }}
/>
```

---

## 📊 **Database Tables Needed**

### **Required Tables:**

1. **`profile_views`**
   - `id` (uuid)
   - `profile_id` (uuid) → references profiles
   - `viewer_id` (uuid) → references users
   - `created_at` (timestamp)

2. **`endorsements`** (Already exists)
   - `id` (uuid)
   - `professional_id` (uuid)
   - `created_at` (timestamp)

3. **`professional_pins`** or similar
   - `id` (uuid)
   - `professional_id` (uuid)
   - `pin_code` (text)
   - `created_at` (timestamp)

4. **`verifications`**
   - `id` (uuid)
   - `user_id` (uuid)
   - `verification_type` (text)
   - `created_at` (timestamp)

5. **`user_activities`** (For heatmap)
   - `id` (uuid)
   - `user_id` (uuid)
   - `activity_type` (text)
   - `created_at` (timestamp)

---

## 🚀 **Quick Implementation**

### **If Tables Don't Exist:**

**Option 1:** Use existing data
```typescript
// Use what you have
setDashboardStats({
  profileViews: 0,  // Track separately
  endorsements: endorsements.length,  // Already have this!
  pinUsage: userProfile?.pin_code ? 1 : 0,  // Simple check
  verifications: userProfile?.verifications_count || 0
});
```

**Option 2:** Create activity tracking
```sql
-- Migration: Create user_activities table
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  activity_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_activities_user_date 
ON user_activities(user_id, created_at);
```

---

## ✅ **IMMEDIATE FIX (Use Existing Data)**

**Add this code right before the QuickStats component:**

```typescript
// ✨ Calculate stats from existing data
const calculatedStats = React.useMemo(() => ({
  profileViews: 0, // Add tracking later
  endorsements: endorsements.length,
  pinUsage: userProfile?.pin_code ? 1 : 0,
  verifications: (userProfile as any)?.email_verified ? 1 : 0
}), [endorsements, userProfile]);

const calculatedTrends = {
  profileViews: { change: 0 },
  endorsements: { change: endorsements.length > 0 ? 10 : 0 },
  pinUsage: { change: 0 },
  verifications: { change: 0 }
};
```

**Then use:**
```typescript
<QuickStats stats={calculatedStats} />

// Replace heatmap random data with:
<ActivityHeatmap
  data={[]} // Empty for now, add tracking later
/>
```

---

## 📝 **Summary**

**Problem:** Components using undefined variables and sample data  
**Root Cause:** No data fetching logic implemented  
**Solution:** Add state + useEffect to fetch real data  
**Quick Fix:** Use existing data (endorsements, profile) until tracking is added  

**Next Steps:**
1. Add state variables
2. Add data fetching useEffects
3. Update component props
4. Optional: Create activity tracking table

---

**Created:** December 29, 2025  
**Status:** 🔴 Needs Fix  
**Priority:** HIGH
