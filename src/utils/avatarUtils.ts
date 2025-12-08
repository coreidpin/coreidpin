// Avatar utility functions for generating smart default avatars

// Common Nigerian/African names by gender
const maleNames = [
  'chukwu', 'ade', 'olu', 'tunde', 'bola', 'segun', 'femi', 'kunle', 'yemi', 
  'emeka', 'chidi', 'obinna', 'ikenna', 'chibuike', 'nnamdi', 'chinedu',
  'akin', 'tolu', 'dare', 'seyi', 'jide', 'wale', 'kayode', 'biodun'
];

const femaleNames = [
  'ada', 'ngozi', 'chioma', 'amaka', 'ifeoma', 'ebere', 'nneka', 'kemi',
  'funmi', 'yetunde', 'folake', 'bukola', 'omolara', 'titilayo', 'blessing',
  'mercy', 'faith', 'grace', 'patience', 'joy', 'gift', 'peace', 'precious'
];

/**
 * Infer gender from name (Nigerian/African names)
 */
export function inferGenderFromName(name: string): 'male' | 'female' | 'neutral' {
  if (!name) return 'neutral';
  
  const lowerName = name.toLowerCase().trim();
  
  // Check first name
  const firstName = lowerName.split(' ')[0];
  
  // Check if name contains common male indicators
  if (maleNames.some(n => firstName.includes(n))) {
    return 'male';
  }
  
  // Check if name contains common female indicators
  if (femaleNames.some(n => firstName.includes(n))) {
    return 'female';
  }
  
  // Fallback: return neutral
  return 'neutral';
}

/**
 * Get avatar style based on job role
 */
export function getAvatarStyleFromRole(jobTitle: string): string {
  if (!jobTitle) return 'avataaars'; // Professional default
  
  const title = jobTitle.toLowerCase();
  
  // All roles use professional avataaars style as requested
  return 'avataaars';
}

/**
 * Generate default avatar URL using DiceBear API
 */
export function getDefaultAvatarUrl(
  userId: string,
  name: string,
  jobTitle?: string
): string {
  const gender = inferGenderFromName(name);
  const style = getAvatarStyleFromRole(jobTitle || '');
  const seed = userId || name; // Use userId as seed for consistency
  
  // DiceBear API v7
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&gender=${gender}&backgroundColor=b6e3f4`;
}

/**
 * Get profile avatar - returns uploaded photo or generated default
 */
export function getProfileAvatar(profile: {
  user_id?: string;
  profile_picture_url?: string;
  full_name?: string;
  name?: string;
  job_title?: string;
  role?: string;
}): string {
  // Use uploaded photo if available
  if (profile.profile_picture_url) {
    return profile.profile_picture_url;
  }
  
  // Generate default avatar
  const userId = profile.user_id || 'default';
  const name = profile.full_name || profile.name || 'User';
  const jobTitle = profile.role || profile.job_title;
  
  return getDefaultAvatarUrl(userId, name, jobTitle);
}
