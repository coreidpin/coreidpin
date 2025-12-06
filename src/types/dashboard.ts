export interface Project {
  id: string;
  title: string;
  description: string;
  role: string;
  timeline: string;
  skills: string[];
  links: string[];
  media_urls?: string[];
  featured_image_url?: string;
  created_at?: string;
}

export interface Endorsement {
  id: string;
  endorserName: string;
  role: string;
  company: string;
  text: string;
  date: string;
  verified: boolean;
  status: 'pending' | 'accepted' | 'rejected';
  endorser_email?: string; // Used in form
}

export interface DashboardStats {
  profileViews: number;
  pinUsage: number;
  verifications: number;
  apiCalls: number;
  countries: number;
  companies: number;
  projects: number;
  endorsements: number;
}

export interface ActivityNotification {
  text: string;
  type: 'verification' | 'api' | 'view' | string;
}

export interface ChartDataPoint {
  day: number;
  actions: number;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  user_type: string;
  recovery_email?: string;
  linkedin?: string;
  website?: string;
  work_experience?: any[];
  skills?: string[];
  tools?: string[];
  industry_tags?: string[];
  certifications?: any[];
}
