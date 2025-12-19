/**
 * Profile Completion Utility
 * 
 * Centralized logic for calculating profile completion percentage and identifying 
 * missing fields. This ensures consistency across the UI (banners, dashboards)
 * and the database (feature gating).
 */

export interface ProfileCompletionResult {
  completion: number;
  missingFields: string[];
}

/**
 * Calculates the completion percentage of a user profile based on the presence
 * of key fields. Supports various naming conventions used in the database.
 * 
 * @param profileData - The profile data object from Supabase or API
 * @returns Object containing completion percentage and list of human-readable missing fields
 */
export function calculateProfileCompletion(profileData: any): ProfileCompletionResult {
  if (!profileData) {
    return { completion: 0, missingFields: ['Full Profile'] };
  }

  const allFields: Record<string, any> = {
    'Full Name': profileData?.full_name || profileData?.name || profileData?.displayName,
    'Job Title': profileData?.job_title || profileData?.role || profileData?.title || profileData?.position,
    'Email': profileData?.email,
    'Phone': profileData?.phone || profileData?.mobile,
    'Bio': profileData?.bio || profileData?.summary || profileData?.about,
    'Skills': profileData?.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0,
    'LinkedIn': profileData?.linkedin_url || profileData?.linkedin,
    'Location': profileData?.city || profileData?.location || profileData?.nationality || profileData?.country,
    'Profile Picture': profileData?.profile_picture_url || profileData?.avatar_url,
    'Years of Experience': profileData?.years_of_experience !== undefined && profileData?.years_of_experience !== null,
    'Work History': (profileData?.work_history && profileData.work_history.length > 0) || 
                    (profileData?.work_experience && profileData.work_experience.length > 0),
    'Portfolio': profileData?.portfolio_url || profileData?.website || profileData?.portfolio || profileData?.github_url,
  };

  const fieldKeys = Object.keys(allFields);
  const totalFields = fieldKeys.length;
  
  const completedFieldsCount = fieldKeys.filter(key => {
    const val = allFields[key];
    if (val === undefined || val === null || val === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === 'boolean') return val;
    return true;
  }).length;
  
  const completion = Math.round((completedFieldsCount / totalFields) * 100);

  const missingFields = fieldKeys
    .filter(key => {
      const value = allFields[key];
      if (value === undefined || value === null || value === '') return true;
      if (Array.isArray(value) && value.length === 0) return true;
      if (typeof value === 'boolean') return !value;
      return false;
    });

  return {
    completion,
    missingFields,
  };
}

/**
 * Checks if a specific milestone has been reached
 */
export const milestones = {
  isBasicComplete: (completion: number) => completion >= 50,
  isFeatureUnlocked: (completion: number) => completion >= 80,
  isFullyComplete: (completion: number) => completion >= 100,
};
