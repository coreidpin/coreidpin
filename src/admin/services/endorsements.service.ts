import { BaseAPIClient, PaginationParams, PaginatedResponse } from './api';

export interface EndorsementFilters {
  search?: string;
  status?: string[];
}

export interface Endorsement {
  id: string;
  project_id: string;
  endorser_id: string;
  status: 'pending' | 'approved' | 'rejected';
  verification_status?: 'pending' | 'verified' | 'rejected' | 'flagged'; // DB might use this column name
  rating: number;
  comment?: string;
  skill_name?: string; // Matches UI expectation
  relationship?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  project?: {
    title: string;
    user_id: string;
    owner?: {
      email: string;
      full_name?: string;
    };
  };
  endorser?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

/**
 * Service for endorsement-related API operations
 */
export class EndorsementsService extends BaseAPIClient {
  /**
   * Get paginated list of endorsements with filters
   */
  async getEndorsements(
    filters: EndorsementFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 10 }
  ): Promise<PaginatedResponse<Endorsement>> {
    try {
      // Build query with nested joins to get endorsee (project owner) details
      let query = this.supabase
        .from('endorsements')
        .select(`
          *,
          project:projects(
            title, 
            user_id,
            owner:profiles(email, full_name)
          ),
          endorser:profiles!endorsements_endorser_id_fkey(email, full_name, avatar_url)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        // The UI uses 'verification_status', check if DB uses that or 'status'
        // We'll try to filter on 'verification_status' if that's what the column is called
        // or 'status' if that's it. The interface has both to be safe.
        // Based on previous file read, UI uses 'verification_status'.
        query = query.in('verification_status', filters.status);
      }

      if (filters.search) {
        query = query.or(`skill_name.ilike.%${filters.search}%,comment.ilike.%${filters.search}%`);
      }

      // Apply pagination
      query = this.applyPagination(query, pagination);

      // Order by created_at desc
      query = query.order('created_at', { ascending: false });

      // Execute query
      const { data, error, count } = await query;

      if (error) this.handleError(error);

      const endorsements = (data || []).map(item => ({
        ...item,
        project: Array.isArray(item.project) ? item.project[0] : item.project,
        endorser: Array.isArray(item.endorser) ? item.endorser[0] : item.endorser
      }));

      // Handle nested project.owner if it comes back as array (it shouldn't with single join but good to be safe)
      endorsements.forEach(e => {
        if (e.project && Array.isArray(e.project.owner)) {
          e.project.owner = e.project.owner[0];
        }
      });

      return this.createPaginatedResponse(endorsements, count || 0, pagination);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get endorsement by ID
   */
  async getEndorsementById(id: string): Promise<Endorsement> {
    try {
      const { data, error } = await this.supabase
        .from('endorsements')
        .select(`
          *,
          project:projects(
            title, 
            user_id,
            owner:profiles(email, full_name)
          ),
          endorser:profiles!endorsements_endorser_id_fkey(email, full_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) this.handleError(error);

      const endorsement = {
        ...data,
        project: Array.isArray(data.project) ? data.project[0] : data.project,
        endorser: Array.isArray(data.endorser) ? data.endorser[0] : data.endorser
      };

      if (endorsement.project && Array.isArray(endorsement.project.owner)) {
        endorsement.project.owner = endorsement.project.owner[0];
      }

      return endorsement;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Approve endorsement
   */
  async approveEndorsement(id: string): Promise<Endorsement> {
    try {
      const { data, error } = await this.supabase
        .from('endorsements')
        .update({ 
          verification_status: 'verified', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleError(error);

      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Reject endorsement
   */
  async rejectEndorsement(id: string): Promise<Endorsement> {
    try {
      const { data, error } = await this.supabase
        .from('endorsements')
        .update({ 
          verification_status: 'rejected', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleError(error);

      return data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Export singleton instance
export const endorsementsService = new EndorsementsService();
