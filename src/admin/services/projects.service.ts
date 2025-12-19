import { BaseAPIClient, PaginationParams, PaginatedResponse } from './api';

export interface ProjectFilters {
  search?: string;
  status?: string[];
  category?: string[];
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  user_id: string;
  budget?: number;
  created_at: string;
  updated_at: string;
  owner?: {
    email: string;
    full_name?: string;
  };
}

/**
 * Service for project-related API operations
 */
export class ProjectsService extends BaseAPIClient {
  /**
   * Get paginated list of projects with filters
   */
  async getProjects(
    filters: ProjectFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 10 }
  ): Promise<PaginatedResponse<Project>> {
    try {
      // Build query
      let query = this.supabase
        .from('projects')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      // Apply pagination
      query = this.applyPagination(query, pagination);

      // Order by created_at desc
      query = query.order('created_at', { ascending: false });

      // Execute query
      const { data, error, count } = await query;

      if (error) this.handleError(error);

      // Transform data to flatten owner info if needed, or keep as is
      // For now, we keep the structure matching the interface
      const projects = (data || []).map(item => ({
        ...item,
        // Handle case where owner might be an array or object depending on relation
        // Remove owner handling since we removed the join
        // owner: Array.isArray(item.owner) ? item.owner[0] : item.owner
      }));

      return this.createPaginatedResponse(projects, count || 0, pagination);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<Project> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) this.handleError(error);

      return {
        ...data,
        // owner: Array.isArray(data.owner) ? data.owner[0] : data.owner
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update project status
   */
  async updateProjectStatus(id: string, status: Project['status']): Promise<Project> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .update({ status, updated_at: new Date().toISOString() })
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
   * Delete project
   */
  async deleteProject(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) this.handleError(error);
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Export singleton instance
export const projectsService = new ProjectsService();
