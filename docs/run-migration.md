# Database Migration Guide

## 🚀 Quick Start (5 Minutes)

Your new portfolio features need database tables to store data. Let's set them up!

---

## Option 1: Supabase Dashboard (Recommended)

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click "SQL Editor" in the left sidebar

### Step 2: Copy the Migration
1. Open the file: `supabase/migrations/20250129_portfolio_features.sql`
2. Copy **ALL** content (406 lines)

### Step 3: Run the Migration
1. In SQL Editor, paste the SQL
2. Click "Run" button (or press `Ctrl+Enter`)
3. Wait for "Success" message

### Step 4: Verify Tables Created
Run this query to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'case_studies',
  'tech_stack',
  'engineering_projects',
  'product_launches',
  'articles',
  'featured_items'
);
```

You should see all 6 tables listed.

---

## Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Navigate to project root
cd C:/Users/PALMPAY/.gemini/antigravity/scratch/coreidpin

# Push migration
supabase db push

# Or apply specific migration
supabase migration up
```

---

## ✅ Verification Checklist

After running the migration, verify:

- [ ] 6 tables created
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] Helper functions available

### Quick Test:
Try adding a featured item or tech skill in your dashboard. If it saves and appears after refresh, it's working! ✅

---

## 🐛 Troubleshooting

### Error: "relation already exists"
**Cause**: Tables already exist from a previous run.  
**Solution**: Either:
1. Drop tables first: `DROP TABLE IF EXISTS featured_items CASCADE;`
2. Or skip if tables already exist (it's fine!)

### Error: "permission denied"
**Cause**: RLS policies are too restrictive.  
**Solution**: Check you're logged in and your `user_id` is set correctly.

### Error: "function does not exist"
**Cause**: Helper functions didn't create.  
**Solution**: Run just the function creation part of the migration.

---

## 📊 What Gets Created

### Tables (6):
1. **featured_items** - Featured content (0-5 items per user)
2. **tech_stack** - Technical skills with proficiency
3. **engineering_projects** - Project portfolio
4. **case_studies** - Design case studies
5. **product_launches** - Product manager launches
6. **articles** - Thought leadership articles

### Functions (2):
1. **generate_case_study_slug()** - Auto-generate URL slugs
2. **calculate_tech_stack_percentage()** - Auto-calc skill distribution

### Policies (24):
- Row Level Security for all tables
- Users can only edit their own data
- Public can view published content

---

## 🎯 After Migration

Your dashboard features will now:
- ✅ Save data to database
- ✅ Persist across page refreshes
- ✅ Be viewable by others (when published)
- ✅ Calculate percentages automatically

---

## Next Steps After Migration

1. **Test Featured Section**:
   - Add a featured item
   - Refresh page
   - ✅ Should still be there!

2. **Test Tech Stack**:
   - Add TypeScript skill
   - Add React skill
   - ✅ Percentages should auto-calculate!

3. **Build Next Feature**:
   - Case Study Creator
   - Product Launch Showcase
   - Or integrate into Public PIN

---

## 🆘 Need Help?

If migration fails, share the error message and we can debug together!

Common issues and fixes are listed in Troubleshooting section above.
