# 🏢 Shared Company Logo System - Implementation Plan

## 📋 **User Story (Updated):**

**As a** professional user  
**I want** to upload my company logo once  
**So that** ALL users who work at my company automatically get the logo on their profiles

---

## ✅ **System Architecture:**

### **How It Works:**

```
User A adds "PalmPay" + uploads logo
    ↓
Logo saved to shared companies table
    ↓
ALL users with "PalmPay" in work experience automatically get the logo!
    ↓
User B joins, adds "PalmPay"
    ↓
Logo already exists - automatically applied! ✅
```

**Benefits:**
- ✅ **Community-driven** - Users help each other
- ✅ **Consistent** - Same logo for all employees
- ✅ **Efficient** - Upload once, benefit everyone
- ✅ **LinkedIn-style** - Professional standard

---

## 🗄️ **Database Schema:**

### **1. Companies Table (Shared Data)**

```sql
-- Create companies table for shared company data
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Company Info
  name VARCHAR(255) NOT NULL UNIQUE,  -- "PalmPay", "Google", etc.
  name_lowercase VARCHAR(255) UNIQUE, -- For case-insensitive matching
  
  -- Logo
  logo_url TEXT,
  
  -- Additional Info (optional)
  website TEXT,
  industry VARCHAR(100),
  size VARCHAR(50),
  description TEXT,
  
  -- Metadata
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT companies_name_key UNIQUE (name),
  INDEX idx_companies_lowercase (name_lowercase)
);

-- Trigger to auto-generate lowercase name
CREATE OR REPLACE FUNCTION set_company_lowercase()
RETURNS TRIGGER AS $$
BEGIN
  NEW.name_lowercase = LOWER(TRIM(NEW.name));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_lowercase_trigger
BEFORE INSERT OR UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION set_company_lowercase();
```

### **2. Update Work Experience to Reference Companies**

```sql
-- Option A: Keep JSONB, add company lookup function
-- No schema change needed!

-- Option B: Add company_id reference (cleaner)
ALTER TABLE work_experience_entries
ADD COLUMN company_id UUID REFERENCES companies(id);

-- Hybrid: Store company name in JSONB, lookup logo dynamically
-- This is the easiest migration path!
```

---

## 🎯 **Implementation Flow:**

### **Scenario 1: First User Adds Company**

```tsx
// User adds "PalmPay" to work experience

const handleAddWorkExperience = async (data) => {
  const companyName = data.company; // "PalmPay"
  
  // 1. Check if company exists
  let { data: company } = await supabase
    .from('companies')
    .select('*')
    .ilike('name', companyName)
    .single();
  
  if (!company) {
    // 2. Company doesn't exist - create it!
    const { data: newCompany } = await supabase
      .from('companies')
      .insert({
        name: companyName,
        uploaded_by: userId
      })
      .select()
      .single();
    
    company = newCompany;
    
    // 3. Prompt user to upload logo
    setShowLogoUploadPrompt(true);
    setSelectedCompany(company);
  }
  
  // 4. Save work experience with company reference
  const workExp = {
    ...data,
    company_id: company.id,
    company_name: company.name,
    company_logo_url: company.logo_url // Will be null initially
  };
  
  await saveWorkExperience(workExp);
};
```

---

### **Scenario 2: User Uploads Logo**

```tsx
const handleCompanyLogoUpload = async (companyId: string, file: File) => {
  // 1. Upload to storage
  const fileName = `companies/${companyId}/${Date.now()}-${file.name}`;
  const { data } = await supabase.storage
    .from('company-logos')
    .upload(fileName, file);
  
  const { data: { publicUrl } } = supabase.storage
    .from('company-logos')
    .getPublicUrl(fileName);
  
  // 2. Update companies table
  await supabase
    .from('companies')
    .update({ 
      logo_url: publicUrl,
      uploaded_by: userId,
      uploaded_at: new Date().toISOString()
    })
    .eq('id', companyId);
  
  // 3. REFRESH ALL PROFILES with this company! ✅
  // This happens automatically on next page load
  // All users with this company_id get the logo!
  
  toast.success('Logo uploaded! All employees will see this logo.');
};
```

---

### **Scenario 3: Subsequent User Adds Same Company**

```tsx
// User B adds "PalmPay" (already exists with logo!)

const handleAddWorkExperience = async (data) => {
  // 1. Check if company exists
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .ilike('name', data.company)
    .single();
  
  if (company && company.logo_url) {
    // 2. Company exists with logo - auto-apply! ✅
    toast.success(`${company.name} logo found!`);
    
    const workExp = {
      ...data,
      company_id: company.id,
      company_name: company.name,
      company_logo_url: company.logo_url // ✅ Automatic!
    };
    
    return workExp;
  }
};
```

---

## 🎨 **UI Components:**

### **1. Logo Upload Prompt**

```tsx
// Show when user adds new company without logo
<Dialog open={showLogoUploadPrompt}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Help improve {companyName}'s profile</DialogTitle>
      <DialogDescription>
        You're the first to add {companyName}! Upload a company logo
        to help all {companyName} employees have better profiles.
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg">
        <Upload className="w-12 h-12 text-gray-400" />
        <div className="text-center">
          <p className="font-medium">Upload {companyName} Logo</p>
          <p className="text-sm text-gray-500">
            This will be shared with all {companyName} employees
          </p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleLogoUpload(e.target.files?.[0])}
          className="hidden"
          id="company-logo-upload"
        />
        <label htmlFor="company-logo-upload">
          <Button>Choose Logo</Button>
        </label>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setShowLogoUploadPrompt(false)}>
          Skip for now
        </Button>
        <Button onClick={tryAutoFetch}>
          Try Auto-Fetch Instead
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

---

### **2. Company Logo Display (with fallback)**

```tsx
// Automatically fetches logo from companies table
const CompanyLogo = ({ companyName, size = 'md' }) => {
  const [logo, setLogo] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch logo from companies table
    const fetchLogo = async () => {
      const { data } = await supabase
        .from('companies')
        .select('logo_url')
        .ilike('name', companyName)
        .single();
      
      setLogo(data?.logo_url);
    };
    
    fetchLogo();
  }, [companyName]);
  
  if (!logo) {
    return (
      <div className="w-12 h-12 rounded-lg border bg-gray-50 flex items-center justify-center">
        <Building2 className="w-6 h-6 text-gray-400" />
      </div>
    );
  }
  
  return (
    <img
      src={logo}
      alt={`${companyName} logo`}
      className="w-12 h-12 rounded-lg border object-cover bg-white p-1"
      loading="lazy"
    />
  );
};
```

---

### **3. Logo Management (for company admin)**

```tsx
// Allow users to update company logo
<Card>
  <CardHeader>
    <CardTitle>Manage {companyName} Logo</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center gap-4">
      {/* Current Logo */}
      <div className="w-16 h-16 rounded-lg border overflow-hidden">
        {currentLogo ? (
          <img src={currentLogo} alt={companyName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Upload New */}
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-2">
          {currentLogo 
            ? `Logo uploaded by ${uploadedBy} on ${uploadedAt}`
            : `No logo yet. Be the first to upload!`
          }
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoUpdate}
          className="hidden"
          id="update-logo"
        />
        <label htmlFor="update-logo">
          <Button size="sm">
            {currentLogo ? 'Update Logo' : 'Upload Logo'}
          </Button>
        </label>
      </div>
    </div>
    
    {currentLogo && (
      <p className="text-xs text-gray-500 mt-4">
        This logo is shared with all {employeeCount} {companyName} employees on CoreIDPin
      </p>
    )}
  </CardContent>
</Card>
```

---

## 🔍 **Smart Matching:**

### **Handle Company Name Variations**

```sql
-- Create function for fuzzy company matching
CREATE OR REPLACE FUNCTION find_company(company_name TEXT)
RETURNS TABLE(id UUID, name TEXT, logo_url TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.logo_url
  FROM companies c
  WHERE 
    -- Exact match
    c.name_lowercase = LOWER(TRIM(company_name))
    OR
    -- Similar match (handles variations)
    similarity(c.name_lowercase, LOWER(TRIM(company_name))) > 0.8
  ORDER BY 
    -- Prefer exact matches
    CASE WHEN c.name_lowercase = LOWER(TRIM(company_name)) THEN 1 ELSE 2 END,
    -- Then by similarity
    similarity(c.name_lowercase, LOWER(TRIM(company_name))) DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Enable pg_trgm extension for similarity
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**Examples:**
- User enters "PalmPay" → Matches "PalmPay"
- User enters "Palmpay" → Matches "PalmPay" ✅
- User enters "Palm Pay" → Matches "PalmPay" ✅
- User enters "PALMPAY" → Matches "PalmPay" ✅

---

## 📊 **Migration Strategy:**

### **For Existing Users:**

```sql
-- Create companies from existing work experience
INSERT INTO companies (name, name_lowercase)
SELECT DISTINCT 
  exp->>'company' as name,
  LOWER(TRIM(exp->>'company')) as name_lowercase
FROM profiles, 
     jsonb_array_elements(work_experience) as exp
WHERE exp->>'company' IS NOT NULL
ON CONFLICT (name_lowercase) DO NOTHING;

-- Auto-fetch logos for top companies
-- (Run as background job)
UPDATE companies
SET logo_url = 'https://logo.clearbit.com/' || 
                LOWER(REPLACE(name, ' ', '')) || '.com'
WHERE logo_url IS NULL
AND name IN ('PalmPay', 'Google', 'Microsoft', ...); -- Top companies
```

---

## ✅ **Key Features:**

### **1. Community-Driven**
✅ First user uploads logo  
✅ All employees benefit  
✅ Anyone can update/improve  

### **2. Automatic Propagation**
✅ Upload once  
✅ Applied to all users  
✅ Real-time updates  

### **3. Smart Matching**
✅ Case-insensitive  
✅ Handles variations  
✅ Fuzzy matching  

### **4. Quality Control**
✅ Logo verification system  
✅ Report inappropriate logos  
✅ Admin moderation  

---

## 🚀 **Implementation Timeline:**

### **Phase 1: Database (1 hour)**
- [x] Create companies table
- [x] Add indexes
- [x] Create matching function
- [x] Set up storage bucket

### **Phase 2: Backend Logic (2 hours)**
- [x] Company lookup function
- [x] Logo upload handler
- [x] Auto-fetch integration
- [x] Migration script

### **Phase 3: UI (2-3 hours)**
- [x] Logo upload prompt
- [x] Company logo component
- [x] Logo management interface
- [x] Integration with work experience form

### **Phase 4: Testing & Migration (1 hour)**
- [x] Test with sample data
- [x] Migrate existing companies
- [x] Auto-fetch popular logos
- [x] Deploy

**Total: 6-7 hours**

---

## 💡 **Best Practices:**

### **Logo Guidelines:**
```tsx
// Display guidelines to users
<div className="text-xs text-gray-500 space-y-1">
  <p>✅ Official company logo (PNG, JPG, SVG)</p>
  <p>✅ Square format preferred (1:1 ratio)</p>
  <p>✅ Minimum 200x200px</p>
  <p>✅ Maximum 2MB file size</p>
  <p>❌ No watermarks or text overlays</p>
  <p>❌ No low-quality or pixelated images</p>
</div>
```

---

## 🎯 **Expected Impact:**

### **User Benefits:**
- ✅ **Upload once, help many** - Community value
- ✅ **Consistent branding** - Same logo for all employees
- ✅ **Professional profiles** - All users benefit
- ✅ **Less work** - Don't need to find/upload yourself

### **Platform Benefits:**
- ✅ **Better data quality** - Centralized, verified
- ✅ **Storage efficiency** - One logo serves many users
- ✅ **Network effects** - More users = more complete data
- ✅ **LinkedIn parity** - Professional standard

---

## ✨ **Summary:**

**Shared Company Logo System:**
1. ✅ User adds company → Creates entry in companies table
2. ✅ User uploads logo → Saved to company, shared with ALL employees
3. ✅ Next user adds same company → Logo automatically applied!
4. ✅ Anyone can update → Community-driven improvement

**This is EXACTLY how LinkedIn does it!** 🎉

**Benefits:**
- Community-driven (users help each other)
- Efficient (upload once, benefit everyone)
- Consistent (same logo for all employees)
- Professional (matches industry standard)

**Ready to implement this shared system!** 🚀
