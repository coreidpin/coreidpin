export interface Project {
  id: string;
  title: string;
  description: string;
  role: string;
  timeline: string;
  skills: string[];
  links: string[];
  created_at?: string;
  
  // Case study fields
  challenge?: string;
  solution?: string;
  result?: string;
  media_urls?: string[];
  featured_image_url?: string;
  video_url?: string;
  is_portfolio_visible?: boolean;
  project_type?: 'case_study' | 'portfolio_item' | 'basic';
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
  id?: string;
  text: string;
  type: 'verification' | 'api' | 'view' | 'endorsement' | 'pin_scan' | 'update' | string;
  timestamp?: string; // ISO string
  meta?: any;
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
  work_experience?: {
    company: string;
    role: string;
    start_date: string;
    end_date: string;
    current: boolean;
    description: string;
    company_logo_url?: string;
    proof_documents?: Array<{
      url: string;
      filename: string;
      type: 'certificate' | 'offer_letter' | 'reference' | 'other';
      uploaded_at: string;
      size?: number;
    }>;
  }[];
  skills?: string[];
  tools?: string[];
  industry_tags?: string[];
  certifications?: any[];
}

// Case study type with required structured fields
export interface CaseStudy extends Project {
  challenge: string;
  solution: string;
  result: string;
  project_type: 'case_study';
}
