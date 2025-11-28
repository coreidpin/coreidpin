// Enhanced Endorsement System Types

export type RelationshipType = 
  | 'manager'
  | 'colleague'
  | 'direct_report'
  | 'client'
  | 'mentor'
  | 'mentee'
  | 'collaborator'
  | 'vendor'
  | 'other';

export type EndorsementStatus =
  | 'draft'
  | 'requested'
  | 'pending_professional'
  | 'accepted'
  | 'rejected'
  | 'revoked'
  | 'expired';

export type VisibilityLevel = 'public' | 'connections_only' | 'private';

export type VerificationMethod = 'email' | 'linkedin' | 'platform_user' | 'manual' | 'none';

export interface ProfessionalEndorsement {
  id: string;
  professional_id: string;
  endorser_id?: string;
  
  // Relationship
  relationship_type?: RelationshipType;
  company_worked_together?: string;
  time_worked_together_start?: string;
  time_worked_together_end?: string;
  project_context?: string;
  
  // Endorser details
  endorser_name: string;
  endorser_email?: string;
  endorser_role?: string;
  endorser_company?: string;
  endorser_linkedin_url?: string;
  
  // Content
  skills_endorsed: string[];
  headline?: string;
  text: string;
  template_used?: string;
  
  // Verification
  verification_method: VerificationMethod;
  verified: boolean;
  verification_token?: string;
  verification_expires_at?: string;
  verified_at?: string;
  
  // Status
  status: EndorsementStatus;
  visibility: VisibilityLevel;
  
  // Metadata
  mutual_endorsement_id?: string;
  featured: boolean;
  endorsement_weight: number;
  display_order: number;
  
  // Timestamps
  requested_at: string;
  responded_at?: string;
  accepted_at?: string;
  rejected_at?: string;
  revoked_at?: string;
  created_at: string;
  updated_at: string;
  
  metadata?: Record<string, any>;
}

export interface SkillEndorsement {
  id: string;
  professional_id: string;
  endorser_id: string;
  skill_name: string;
  skill_category?: string;
  strength: number;
  created_at: string;
}

export interface EndorsementTemplate {
  id: string;
  name: string;
  category: string;
  headline_template: string;
  body_template: string;
  suggested_skills: string[];
  active: boolean;
  created_at: string;
}

export interface EndorsementStats {
  professional_id: string;
  public_endorsements: number;
  pending_endorsements: number;
  featured_endorsements: number;
  unique_endorsers: number;
  avg_weight: number;
  all_endorsed_skills: string[];
}

export interface SkillEndorsementCount {
  professional_id: string;
  skill_name: string;
  endorsement_count: number;
  avg_strength: number;
  endorser_ids: string[];
}

// Form interfaces
export interface RequestEndorsementForm {
  endorser_name: string;
  endorser_email: string;
  endorser_role?: string;
  endorser_company?: string;
  endorser_linkedin_url?: string;
  relationship_type?: RelationshipType;
  company_worked_together?: string;
  time_worked_together_start?: string;
  time_worked_together_end?: string;
  project_context?: string;
  suggested_skills?: string[];
  custom_message?: string;
}

export interface WriteEndorsementForm {
  headline?: string;
  text: string;
  template_used?: string;
  skills_endorsed: string[];
  confirm_relationship: boolean;
}

export interface EndorsementFilters {
  status?: EndorsementStatus[];
  visibility?: VisibilityLevel[];
  verified_only?: boolean;
  featured_only?: boolean;
  has_skills?: string[];
  relationship_type?: RelationshipType[];
  min_weight?: number;
}

// Display interfaces
export interface DisplayEndorsement extends ProfessionalEndorsement {
  endorser_profile?: {
    name: string;
    role?: string;
    company?: string;
    profile_picture_url?: string;
    is_platform_user: boolean;
  };
  skill_endorsement_counts?: Record<string, number>;
  relationship_duration?: string; // Formatted like "2 years, 3 months"
}

export interface GroupedEndorsements {
  featured: DisplayEndorsement[];
  by_skill: Record<string, DisplayEndorsement[]>;
  recent: DisplayEndorsement[];
  all: DisplayEndorsement[];
}
