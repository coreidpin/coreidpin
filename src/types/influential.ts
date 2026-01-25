/**
 * Type definitions for Influential Professionals feature
 */

export type InfluentialCategory = 
  | 'business_leader'
  | 'cto'
  | 'engineering_leader'
  | 'open_source_contributor'
  | 'product_leader'
  | 'designer'
  | 'researcher';

export const INFLUENTIAL_CATEGORY_LABELS: Record<InfluentialCategory, string> = {
  business_leader: 'Business Leader',
  cto: 'CTO',
  engineering_leader: 'Engineering Leader',
  open_source_contributor: 'Open Source Contributor',
  product_leader: 'Product Leader',
  designer: 'Designer',
  researcher: 'Researcher',
};

export type InfluentialStatus = 'pending' | 'active' | 'declined' | 'alumni';

export interface InfluentialProfessional {
  id: string;
  user_id: string;
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  status: InfluentialStatus;
  categories: InfluentialCategory[];
  influence_score: number;
  bio_headline: string | null;
  created_at: string;
  updated_at: string;
}

export interface FlagshipProject {
  id: string;
  user_id: string;
  title: string;
  description: string;
  impact_metrics: Record<string, string>;
  tech_stack: string[];
  project_url: string | null;
  media_urls: string[];
  start_date: string | null;
  end_date: string | null;
  is_ongoing: boolean;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface InfluentialDirectoryFilter {
  categories?: InfluentialCategory[];
  location?: string;
  skills?: string[];
  sortBy?: 'score' | 'recent' | 'name';
  page?: number;
  limit?: number;
}

export interface InfluentialStats {
  total: number;
  active: number;
  pending: number;
  declinedRate: number;
  acceptanceRate: number;
  byCategory: Record<InfluentialCategory, number>;
}

export interface InviteProfessionalParams {
  userId: string;
  categories: InfluentialCategory[];
  invitedBy: string;
  customMessage?: string;
}

export interface FlagshipProjectInput {
  title: string;
  description: string;
  impact_metrics?: Record<string, string>;
  tech_stack?: string[];
  project_url?: string;
  media_urls?: string[];
  start_date?: string;
  end_date?: string;
  is_ongoing?: boolean;
  display_order?: number;
  is_visible?: boolean;
}
