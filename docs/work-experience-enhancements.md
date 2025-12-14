# Work Experience Enhancements - LinkedIn-Style Features

## Overview
Add professional LinkedIn-style features to work experience entries:
- ✅ Location display (already exists, needs refinement)
- 🆕 Employment type (Full-time, Part-time, Contract, etc.)
- 🆕 Skills section (collapsed/expandable)
- 🆕 Key achievements/highlights

---

## Phase 1: Database Schema Updates

### 1.1 Update `work_experiences` Table

```sql
-- File: supabase/migrations/20251214120000_add_work_experience_enhancements.sql

-- Add new columns to work_experiences table
ALTER TABLE work_experiences
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS skills TEXT[], -- Array of skill names
ADD COLUMN IF NOT EXISTS achievements TEXT[]; -- Array of achievement descriptions

-- Add check constraint for employment_type
ALTER TABLE work_experiences
ADD CONSTRAINT valid_employment_type
CHECK (employment_type IN (
  'full_time',
  'part_time',
  'contract',
  'freelance',
  'internship',
  'apprenticeship',
  'seasonal',
  'self_employed'
));

-- Create index for skills search (GIN index for array columns)
CREATE INDEX IF NOT EXISTS idx_work_experiences_skills ON work_experiences USING GIN(skills);

-- Add comments
COMMENT ON COLUMN work_experiences.employment_type IS 'Type of employment: full_time, part_time, contract, etc.';
COMMENT ON COLUMN work_experiences.skills IS 'Array of skills used in this role';
COMMENT ON COLUMN work_experiences.achievements IS 'Array of key achievements/highlights';
```

### 1.2 Sample Data
```sql
-- Example update
UPDATE work_experiences
SET 
  employment_type = 'full_time',
  skills = ARRAY['Product Management', 'Agile', 'Strategic Planning', 'Team Leadership'],
  achievements = ARRAY[
    'Led product vision and execution for next-gen platform',
    'Increased user engagement by 45%',
    'Managed cross-functional team of 12 people'
  ]
WHERE id = 'some-experience-id';
```

---

## Phase 2: TypeScript Types & Interfaces

### 2.1 Update Work Experience Interface

```typescript
// File: src/components/portfolio/WorkTimeline.tsx

export type EmploymentType = 
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'freelance'
  | 'internship'
  | 'apprenticeship'
  | 'seasonal'
  | 'self_employed';

export interface WorkExperience {
  id: string;
  job_title: string;
  company_name: string;
  company_logo_url?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
  employment_type?: EmploymentType; // 🆕 NEW
  description?: string;
  skills?: string[]; // 🆕 NEW
  achievements?: string[]; // 🆕 NEW
  verification_status?: string | boolean;
  proof_documents?: ProofDocument[];
}
```

### 2.2 Employment Type Labels

```typescript
// File: src/utils/employmentTypes.ts

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  freelance: 'Freelance',
  internship: 'Internship',
  apprenticeship: 'Apprenticeship',
  seasonal: 'Seasonal',
  self_employed: 'Self-employed'
};

export const EMPLOYMENT_TYPE_OPTIONS = Object.entries(EMPLOYMENT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);
```

---

## Phase 3: Frontend Components - Update WorkTimeline

Key additions to WorkTimeline.tsx:
1. Employment type display next to company name
2. Expandable skills section with animation
3. Key achievements list
4. Improved location display

See full implementation in implementation plan.

---

## Phase 4: Form Updates (Adding/Editing Work Experience)

Add three new form fields:
1. **Employment Type Dropdown** - Select from predefined options
2. **Skills Tag Input** - Press Enter to add skills
3. **Achievements List** - Dynamic list with add/remove

---

## Phase 5: Required New UI Components

### 5.1 TagInput Component
Multi-tag input for skills - press Enter to add, click X to remove

### 5.2 DynamicListInput Component  
Text area list for achievements - add/remove/reorder items

---

## Implementation Timeline

| Phase | Duration | Priority |
|-------|----------|----------|
| Database Schema | 1 hour | P0 - Critical |
| TypeScript Updates | 1 hour | P0 - Critical |
| WorkTimeline Component | 3 hours | P0 - Critical |
| Form Components | 3 hours | P1 - High |
| UI Components (TagInput, etc.) | 2 hours | P1 - High |
| Testing & Polish | 2 hours | P1 - High |

**Total Estimated Time: ~12 hours**

---

## Example Usage

```typescript
const exampleExperience: WorkExperience = {
  id: '123',
  job_title: 'Chief Product Officer',
  company_name: 'Fastamoni',
  employment_type: 'full_time',
  location: 'Remote',
  skills: ['Product Management', 'Strategic Planning', 'Agile'],
  achievements: [
    'Launched platform serving 10K+ users in 6 months',
    'Increased retention by 45%'
  ],
  // ... other fields
};
```
