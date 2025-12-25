# Quick Setup Instructions for Engagement Page

## 🚧 **Manual Steps Required**

The engagement metrics are ready but need manual routing setup:

### **1. Add Import to Router.tsx**

Add this import at the top (around line 50-70 with other lazy imports):

```typescript
const EngagementPage = lazy(() => import('../admin/pages/Engagement').then(m => ({ default: m.EngagementPage })));
```

### **2. Add Route to Router.tsx**

Add this route after `/admin/users` route (around line 765):

```tsx
<Route 
  path="/admin/engagement" 
  element={
    <AdminRoute>
      <Suspense fallback={<DashboardSkeleton />}>
        <EngagementPage />
      </Suspense>
    </AdminRoute>
  } 
/>
```

### **3. Add Navigation Item to AdminLayout.tsx**

In `src/admin/layouts/AdminLayout.tsx`, update the ANALYTICS navigation group (around line 28):

```typescript
{
  title: 'ANALYTICS',
  items: [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
    { icon: TrendingUp, label: 'Engagement', path: '/admin/engagement' }, // ADD THIS LINE
    { icon: Activity, label: 'Activity Logs', path: '/admin/logs' },
  ]
},
```

**Don't forget to add the import at the top:**
```typescript
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Settings, 
  Shield,
  Activity,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
  TrendingUp  // ADD THIS
} from 'lucide-react';
```

### **4. Deploy Database**

Deploy `supabase/migrations/20251225140000_create_engagement_functions.sql` to Supabase SQL Editor.

### **5. Test**

Navigate to `/admin/engagement` and verify everything works!

---

**Full deployment guide:** `docs/phase2-engagement-deployment.md`
