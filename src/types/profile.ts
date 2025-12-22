export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  displayName?: string;
  job_title?: string;
  role?: string;
  phone?: string;
  mobile?: string;
  bio?: string;
  about?: string;
  summary?: string;
  skills?: string[];
  linkedin_url?: string;
  linkedin?: string;
  city?: string;
  location?: string;
  country?: string;
  nationality?: string;
  profile_picture_url?: string;
  avatar_url?: string;
  years_of_experience?: string | number;
  work_history?: any[];
  work_experience?: any[];
  portfolio_url?: string;
  website?: string;
  [key: string]: any; // Allow for dynamic fields for now
}
