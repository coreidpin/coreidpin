/**
 * API utilities for Influential Professionals feature
 */

import { supabase } from './supabase/client';
import type {
  InfluentialProfessional,
  FlagshipProject,
  InviteProfessionalParams,
  InfluentialDirectoryFilter,
  InfluentialStats,
  FlagshipProjectInput,
  InfluentialCategory,
} from '../types/influential';

// ==========================================
// INFLUENTIAL PROFESSIONALS
// ==========================================

/**
 * Invite a professional to become influential
 */
export async function inviteProfessional(params: InviteProfessionalParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId, categories, invitedBy } = params;

    const { error } = await supabase
      .from('influential_professionals')
      .insert({
        user_id: userId,
        invited_by: invitedBy,
        categories,
        status: 'pending',
      });

    if (error) {
      console.error('Error inviting professional:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception inviting professional:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Accept an invitation to become influential
 */
export async function acceptInvitation(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('influential_professionals')
      .update({
        status: 'active',
        accepted_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error accepting invitation:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception accepting invitation:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Decline an invitation to become influential
 */
export async function declineInvitation(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('influential_professionals')
      .update({ status: 'declined' })
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error declining invitation:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception declining invitation:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Get influential professionals directory with filters
 */
export async function getInfluentialProfessionals(
  filters: InfluentialDirectoryFilter = {}
): Promise<{ data: any[]; total: number; error?: string }> {
  try {
    const {
      categories,
      sortBy = 'score',
      page = 1,
      limit = 20,
    } = filters;

    let query = supabase
      .from('influential_professionals')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          job_title,
          city,
          country,
          bio,
          skills
        )
      `, { count: 'exact' })
      .eq('status', 'active');

    // Apply category filter
    if (categories && categories.length > 0) {
      query = query.overlaps('categories', categories);
    }

    // Apply sorting
    switch (sortBy) {
      case 'score':
        query = query.order('influence_score', { ascending: false });
        break;
      case 'recent':
        query = query.order('accepted_at', { ascending: false });
        break;
      case 'name':
        query = query.order('profiles(full_name)', { ascending: true });
        break;
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching influential professionals:', error);
      return { data: [], total: 0, error: error.message };
    }

    return { data: data || [], total: count || 0 };
  } catch (err) {
    console.error('Exception fetching influential professionals:', err);
    return { data: [], total: 0, error: String(err) };
  }
}

/**
 * Get influential professional by user ID
 */
export async function getInfluentialByUserId(userId: string): Promise<InfluentialProfessional | null> {
  try {
    const { data, error } = await supabase
      .from('influential_professionals')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found is OK, user is not influential
        return null;
      }
      console.error('Error fetching influential status:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception fetching influential status:', err);
    return null;
  }
}

/**
 * Get influential professionals stats
 */
export async function getInfluentialStats(): Promise<InfluentialStats | null> {
  try {
    const { data, error } = await supabase
      .from('influential_professionals')
      .select('status, categories');

    if (error) {
      console.error('Error fetching influential stats:', error);
      return null;
    }

    const total = data?.length || 0;
    const active = data?.filter(i => i.status === 'active').length || 0;
    const pending = data?.filter(i => i.status === 'pending').length || 0;
    const declined = data?.filter(i => i.status === 'declined').length || 0;

    const byCategory: Record<InfluentialCategory, number> = {
      business_leader: 0,
      cto: 0,
      engineering_leader: 0,
      open_source_contributor: 0,
      product_leader: 0,
      designer: 0,
      researcher: 0,
    };

    data?.forEach(item => {
      if (item.status === 'active' && item.categories) {
        item.categories.forEach((cat: InfluentialCategory) => {
          if (cat in byCategory) {
            byCategory[cat]++;
          }
        });
      }
    });

    return {
      total,
      active,
      pending,
      declinedRate: total > 0 ? (declined / total) * 100 : 0,
      acceptanceRate: total > 0 ? (active / total) * 100 : 0,
      byCategory,
    };
  } catch (err) {
    console.error('Exception fetching influential stats:', err);
    return null;
  }
}

/**
 * Calculate and update influence score for a user
 */
export async function updateInfluenceScore(userId: string): Promise<{ success: boolean; score?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('calculate_influence_score', {
      target_user_id: userId,
    });

    if (error) {
      console.error('Error calculating influence score:', error);
      return { success: false, error: error.message };
    }

    const score = data as number;

    // Update the score in influential_professionals table
    const { error: updateError } = await supabase
      .from('influential_professionals')
      .update({ influence_score: score })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating influence score:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, score };
  } catch (err) {
    console.error('Exception updating influence score:', err);
    return { success: false, error: String(err) };
  }
}

// ==========================================
// FLAGSHIP PROJECTS
// ==========================================

/**
 * Save (create or update) a flagship project
 */
export async function saveFlagshipProject(
  userId: string,
  projectData: FlagshipProjectInput,
  projectId?: string
): Promise<{ success: boolean; data?: FlagshipProject; error?: string }> {
  try {
    if (projectId) {
      // Update existing project
      const { data, error } = await supabase
        .from('flagship_projects')
        .update({
          ...projectData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating flagship project:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } else {
      // Create new project
      const { data, error } = await supabase
        .from('flagship_projects')
        .insert({
          user_id: userId,
          ...projectData,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating flagship project:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    }
  } catch (err) {
    console.error('Exception saving flagship project:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Get flagship projects for a user
 */
export async function getFlagshipProjects(userId: string): Promise<FlagshipProject[]> {
  try {
    const { data, error } = await supabase
      .from('flagship_projects')
      .select('*')
      .eq('user_id', userId)
      .eq('is_visible', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flagship projects:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception fetching flagship projects:', err);
    return [];
  }
}

/**
 * Delete a flagship project
 */
export async function deleteFlagshipProject(userId: string, projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('flagship_projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting flagship project:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception deleting flagship project:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Toggle project visibility
 */
export async function toggleProjectVisibility(
  userId: string,
  projectId: string,
  isVisible: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('flagship_projects')
      .update({ is_visible: isVisible })
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error toggling project visibility:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception toggling project visibility:', err);
    return { success: false, error: String(err) };
  }
}
