# Form Validation Implementation Plan
**Date:** December 14, 2025  
**Status:** Ready for Implementation

---

## 🎯 IMPLEMENTATION STRATEGY

### **Phase 1: Foundation ✅ COMPLETE**
- ✅ Created `src/utils/validation.ts` with all validation utilities
- ✅ Backward compatible (optional fields return `null` if empty)
- ✅ Comprehensive error messages
- ✅ Nigerian-specific validators (BVN, NIN, TIN)

---

## 📋 NEXT PHASE: Work Experience Form Validation

### **Current Logic Analysis:**

**File:** `src/components/IdentityManagementPage.tsx`  
**Function:** `handleSaveWork()` (Lines 232-307)

**Existing Validation:**
```typescript
// Line 233-236
if (!tempWork.company || !tempWork.role) {
  toast.error('Company and Role are required');
  return;
}

// Line 238-241
if (!tempWork.start_date) {
  toast.error('Start Date is required');
  return;
}
```

**Data Structure (tempWork state):**
```typescript
{
  company: string,              // Required
  role: string,                 // Required
  start_date: string,           // Required
  end_date: string,             // Optional (but logic needed)
  current: boolean,             // Flag
  description: string,          // Optional
  company_logo_url: string | null | undefined,  // Optional
  proof_documents: ProofDocument[],  // Optional
  employment_type: EmploymentType | '',  // Optional
  skills: string[],             // Optional
  achievements: string[]        // Optional
}
```

**Save Logic:**
1. Formats dates from `YYYY-MM` to `YYYY-MM-DD`
2. Nullifies end_date if `current === true`
3. Nullifies employment_type, skills, achievements if empty
4. Inserts or updates in `work_experiences` table
5. Calls `fetchWorkExperiences()` (function not found - might be in parent or async)
6. Closes modal and resets state

---

## 🔧 PROPOSED VALIDATION ENHANCEMENTS

### **Step 1: Add Field-Level Validation State**

```typescript
// Add near line 103 (after tempWork state)
const [workErrors, setWorkErrors] = useState<Record<string, string>>({});
const [workTouched, setWorkTouched] = useState<Record<string, boolean>>({});
```

### **Step 2: Create Validation Function**

```typescript
// Add before handleSaveWork (around line 230)
const validateWorkExperience = (): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Required: Company (2-100 chars)
  const companyError = validators.required(tempWork.company, 'Company name');
  if (companyError) {
    errors.company = companyError;
  } else {
    const lengthError = validators.stringLength(tempWork.company, 2, 100, 'Company name');
    if (lengthError) errors.company = lengthError;
  }

  // Required: Role (2-100 chars)
  const roleError = validators.required(tempWork.role, 'Job title');
  if (roleError) {
    errors.role = roleError;
  } else {
    const lengthError = validators.stringLength(tempWork.role, 2, 100, 'Job title');
    if (lengthError) errors.role = lengthError;
  }

  // Required: Start date
  const startError = validators.required(tempWork.start_date, 'Start date');
  if (startError) {
    errors.start_date = startError;
  } else {
    // Valid date check
    const validError = validators.date.valid(tempWork.start_date, 'Start date');
    if (validError) {
      errors.start_date = validError;
    } else {
      // Not in future (allow current month)
      const futureError = validators.date.notFuture(tempWork.start_date + '-01', 'Start date');
      if (futureError) errors.start_date = futureError;
      
      // Work history range check
      const rangeError = validators.date.workHistoryRange(tempWork.start_date + '-01', 'Start date');
      if (rangeError) errors.start_date = rangeError;
    }
  }

  // End date logic
  if (tempWork.current && tempWork.end_date && tempWork.end_date.trim()) {
    errors.end_date = 'Current role cannot have an end date';
  } else if (!tempWork.current && tempWork.end_date) {
    // Validate end date format
    const validError = validators.date.valid(tempWork.end_date, 'End date');
    if (validError) {
      errors.end_date = validError;
    } else {
      // End date should be after start date
      const afterError = validators.date.isAfter(
        tempWork.start_date + '-01',
        tempWork.end_date + '-01',
        'Start date',
        'End date'
      );
      if (afterError) errors.end_date = afterError;
    }
  }

  // Optional: Description (max 1000 chars)
  if (tempWork.description) {
    const lengthError = validators.stringLength(tempWork.description, 0, 1000, 'Description');
    if (lengthError) errors.description = lengthError;
  }

  // Optional: Skills array (max 20 items, each 2-50 chars)
  if (tempWork.skills && tempWork.skills.length > 0) {
    const arrayError = validators.array.maxLength(tempWork.skills, 20, 'Skills');
    if (arrayError) {
      errors.skills = arrayError;
    } else {
      // Validate each skill length
      tempWork.skills.forEach((skill, idx) => {
        const skillError = validators.stringLength(skill, 2, 50, `Skill #${idx + 1}`);
        if (skillError) {
          errors.skills = `Skill "${skill}": must be 2-50 characters`;
        }
      });
    }
  }

  // Optional: Achievements array (max 10 items, each 10-500 chars)
  if (tempWork.achievements && tempWork.achievements.length > 0) {
    const arrayError = validators.array.maxLength(tempWork.achievements, 10, 'Achievements');
    if (arrayError) {
      errors.achievements = arrayError;
    } else {
      // Validate each achievement length
      tempWork.achievements.forEach((achievement, idx) => {
        const achError = validators.stringLength(achievement, 10, 500, `Achievement #${idx + 1}`);
        if (achError) {
          errors.achievements = `Achievement ${idx + 1}: must be 10-500 characters`;
        }
      });
    }
  }

  // Optional: Company logo URL
  if (tempWork.company_logo_url) {
    const urlError = validators.url(tempWork.company_logo_url, 'Company logo URL');
    if (urlError) errors.company_logo_url = urlError;
  }

  return errors;
};
```

### **Step 3: Update handleSaveWork**

```typescript
const handleSaveWork = async () => {
  // VALIDATE FIRST
  const errors = validateWorkExperience();
  
  // Check if there are errors
  if (Object.keys(errors).length > 0) {
    setWorkErrors(errors);
    
    // Show first error in toast
    const firstError = Object.values(errors)[0];
    toast.error(firstError);
    
    // Scroll to first error field (enhanced UX)
    const firstErrorField = Object.keys(errors)[0];
    console.log('Validation error in field:', firstErrorField);
    
    return; // STOP - don't save
  }

  // Clear errors if validation passed
  setWorkErrors({});
  
  // EXISTING SAVE LOGIC (keep exactly as is)
  try {
    setSaving(true);
    const session = getSessionState();
    if (!session?.userId) return;

    const formatDate = (dateString: string) => {
      if (!dateString) return null;
      return dateString.length === 7 ? `${dateString}-01` : dateString;
    };

    const workData = {
      user_id: session.userId,
      company_name: tempWork.company,
      job_title: tempWork.role,
      start_date: formatDate(tempWork.start_date),
      end_date: (tempWork.current || !tempWork.end_date) ? null : formatDate(tempWork.end_date),
      is_current: tempWork.current,
      description: tempWork.description,
      company_logo_url: tempWork.company_logo_url,
      employment_type: tempWork.employment_type || null,
      skills: tempWork.skills.length > 0 ? tempWork.skills : null,
      achievements: tempWork.achievements.length > 0 ? tempWork.achievements : null
    };

    // REST OF EXISTING SAVE LOGIC...
  } catch (error: any) {
    console.error('Error saving work:', error);
    toast.error(`Failed to save experience: ${error.message || 'Unknown error'}`);
  } finally {
    setSaving(false);
  }
};
```

---

## 🎨 VISUAL ENHANCEMENTS (Optional - Phase 2)

### **Add Error Display Below Fields**

```typescript
// Example for company field (around line 2074)
<div className="space-y-1.5">
  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
    Company
    <span className="text-red-500 ml-1">*</span>
  </Label>
  <Input 
    value={tempWork.company}
    onChange={(e) => {
      setTempWork({ ...tempWork, company: e.target.value });
      // Clear error on change
      if (workErrors.company) {
        setWorkErrors(prev => ({ ...prev, company: '' }));
      }
    }}
    onBlur={() => {
      // Validate on blur
      setWorkTouched(prev => ({ ...prev, company: true }));
      const error = validators.required(tempWork.company, 'Company name') ||
                    validators.stringLength(tempWork.company, 2, 100, 'Company name');
      if (error) {
        setWorkErrors(prev => ({ ...prev, company: error }));
      }
    }}
    className={`bg-white border-slate-200 text-slate-900 h-11 sm:h-9 text-base sm:text-sm ${
      workErrors.company && workTouched.company ? 'border-red-500' : ''
    }`}
    placeholder="e.g. Acme Corp"
  />
  {workErrors.company && workTouched.company && (
    <p className="text-xs text-red-600 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {workErrors.company}
    </p>
  )}
</div>
```

---

## ⚠️ SAFETY CHECKS

### **What Won't Break:**
✅ **Existing save logic** - We only ADD validation before it  
✅ **Data format** - No changes to data structure  
✅ **State management** - Only adding new error states  
✅ **Database** - No schema changes needed  
✅ **Modal UI** - Only adding error messages  

### **What to Test:**
1. **Happy path** - Valid data saves successfully
2. **Empty required fields** - Shows appropriate errors
3. **Invalid dates** - Catches date logic issues
4. **Current role with end date** - Prevents invalid state
5. **Array limits** - Prevents too many skills/achievements
6. **Editing existing** - Works with pre-filled data
7. **Modal close** - Errors clear properly

---

## 📊 IMPLEMENTATION TIMELINE

### **Immediate (Today):**
- ✅ Validation utilities created
- ⏳ Add validation function to IdentityManagementPage
- ⏳ Update handleSaveWork with validation call
- ⏳ Test with various scenarios

### **Phase 2 (Tomorrow):**
- ⏳ Add visual error indicators
- ⏳ Real-time validation on blur
- ⏳ Required field asterisks

### **Phase 3 (Next Week):**
- ⏳ Repeat for other critical forms
- ⏳ Create reusable ValidatedInput component

---

## 🚀 READY TO PROCEED?

**Next Step:**  
Update `IdentityManagementPage.tsx` with:
1. Import validation utilities
2. Add error states
3. Add validateWorkExperience function
4. Update handleSaveWork to call validation

**Estimated Time:** 15-20 minutes  
**Risk Level:** 🟢 **Low** (only adding, not changing existing logic)

---

**Shall I proceed with implementing the Work Experience validation?**
