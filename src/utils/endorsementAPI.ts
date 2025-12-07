import { supabase } from './supabase/client';
import type {
  ProfessionalEndorsement,
  SkillEndorsement,
  EndorsementTemplate,
  RequestEndorsementForm,
  WriteEndorsementForm,
  EndorsementFilters,
  DisplayEndorsement,
  GroupedEndorsements
} from '../types/endorsement';

export class EndorsementAPI {
  // ============================================================================
  // Professional Endorsements (Full Testimonials)
  // ============================================================================

  /**
   * Request an endorsement from someone
   */
  static async requestEndorsement(data: RequestEndorsementForm): Promise<{ success: boolean; endorsement?: ProfessionalEndorsement; error?: string }> {
    try {
      // Check localStorage for auth tokens
      const allKeys = Object.keys(localStorage);
      console.log('All localStorage keys:', allKeys);
      allKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(key + ':', value?.substring(0, 150));
      });
      
      const authKeys = allKeys.filter(k => k.includes('auth') || k.includes('supabase') || k.includes('sb-') || k.includes('gidipin'));
      console.log('Auth storage keys found:', authKeys);
      
      // Get userId from localStorage (custom auth system)
      const userId = localStorage.getItem('userId');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (!userId || !isAuthenticated) {
        console.error('No userId or not authenticated');
        throw new Error('Not authenticated - Please log in again');
      }
      
      console.log('Using userId from localStorage:', userId);

      // Check if endorser is a platform user
      let endorser_id: string | null = null;
      if (data.endorser_email) {
        const { data: endorserProfile } = await (supabase
          .from('profiles') as any)
          .select('user_id')
          .eq('email', data.endorser_email)
          .single();
        
        endorser_id = endorserProfile?.user_id || null;
      }

      // Generate verification token
      const verification_token = crypto.randomUUID();
      const verification_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const { data: endorsement, error } = await (supabase
        .from('professional_endorsements_v2') as any)
        .insert({
          professional_id: userId,
          endorser_id,
          endorser_name: data.endorser_name,
          endorser_email: data.endorser_email,
          endorser_role: data.endorser_role || null,
          endorser_company: data.endorser_company || null,
          endorser_linkedin_url: data.endorser_linkedin_url || null,
          relationship_type: data.relationship_type || null,
          company_worked_together: data.company_worked_together || null,
          time_worked_together_start: data.time_worked_together_start || null,
          time_worked_together_end: data.time_worked_together_end || null,
          project_context: data.project_context || null,
          skills_endorsed: data.suggested_skills || [],
          status: 'requested',
          verification_token,
          verification_expires_at: verification_expires_at.toISOString(),
          verification_method: endorser_id ? 'platform_user' : 'email',
          text: data.custom_message || 'Endorsement request pending',
          metadata: { custom_message: data.custom_message }
        })
        .select()
        .single();

      if (error) throw error;

      // Send email notification to endorser
      if (endorsement && data.endorser_email) {
        try {
          const verificationUrl = `${window.location.origin}/endorse/${verification_token}`;
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const functionUrl = `${supabaseUrl}/functions/v1/send-endorsement-email`;
          
          console.log('📧 Sending email...');
          console.log('Function URL:', functionUrl);
          
          const emailResponse = await fetch(functionUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              to: data.endorser_email,
              endorserName: data.endorser_name,
              professionalName: localStorage.getItem('userName') || 'A professional',
              verificationUrl,
              customMessage: data.custom_message
            })
          });
          
          const emailResult = await emailResponse.json();
          console.log('Email result:', emailResult);
          
          if (!emailResult.success) {
            console.error('❌ Email failed:', emailResult.error);
            // We don't throw here to avoid rolling back the endorsement creation,
            // but we return the error so the UI can show a warning
            return { 
              success: true, 
              endorsement: endorsement as ProfessionalEndorsement,
              error: `Endorsement created but email failed: ${emailResult.error}`
            };
          }
        } catch (emailError: any) {
          console.error('❌ Email exception:', emailError);
          return { 
            success: true, 
            endorsement: endorsement as ProfessionalEndorsement,
            error: `Endorsement created but email failed: ${emailError.message}`
          };
        }
      }

      return { success: true, endorsement: endorsement as ProfessionalEndorsement };
    } catch (error: any) {
      console.error('Failed to request endorsement:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Write/submit an endorsement (by endorser)
   */
  static async submitEndorsement(
    token: string,
    data: WriteEndorsementForm
  ): Promise<{ success: boolean; endorsement?: ProfessionalEndorsement; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Verify token and get endorsement request
      const { data: endorsement, error: fetchError } = await (supabase
        .from('professional_endorsements_v2') as any)
        .select()
        .eq('verification_token', token)
        .single();

      if (fetchError || !endorsement) {
        return { success: false, error: 'Invalid or expired verification link' };
      }

      // Check expiration
      if (new Date(endorsement.verification_expires_at) < new Date()) {
        return { success: false, error: 'Verification link has expired' };
      }

      // Update endorsement
      const { data: updated, error: updateError } = await (supabase
        .from('professional_endorsements_v2') as any)
        .update({
          headline: data.headline,
          text: data.text,
          template_used: data.template_used,
          skills_endorsed: data.skills_endorsed,
          status: 'pending_professional',
          responded_at: new Date().toISOString(),
          verified: true,
          verified_at: new Date().toISOString(),
          verification_token: null, // Clear token after use
        })
        .eq('id', endorsement.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return { success: true, endorsement: updated as ProfessionalEndorsement };
    } catch (error: any) {
      console.error('Failed to submit endorsement:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get endorsements for a professional
   */
  static async getEndorsements(
    professionalId: string,
    filters?: EndorsementFilters
  ): Promise<{ success: boolean; endorsements?: DisplayEndorsement[]; error?: string }> {
    try {
      let query = (supabase
        .from('professional_endorsements_v2') as any)
        .select(`
          *,
          endorser_profile:endorser_id(
            name,
            role,
            company,
            profile_picture_url
          )
        `)
        .eq('professional_id', professionalId);

      // Apply filters
      if (filters?.status) {
        query = query.in('status', filters.status);
      }
      if (filters?.visibility) {
        query = query.in('visibility', filters.visibility);
      }
      if (filters?.verified_only) {
        query = query.eq('verified', true);
      }
      if (filters?.featured_only) {
        query = query.eq('featured', true);
      }
      if (filters?.relationship_type) {
        query = query.in('relationship_type', filters.relationship_type);
      }
      if (filters?.min_weight) {
        query = query.gte('endorsement_weight', filters.min_weight);
      }

      query = query.order('display_order', { ascending: true });
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, endorsements: data as DisplayEndorsement[] };
    } catch (error: any) {
      console.error('Failed to fetch endorsements:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Accept/reject an endorsement (by professional)
   */
  static async respondToEndorsement(
    endorsementId: string,
    action: 'accept' | 'reject',
    visibility: 'public' | 'connections_only' | 'private' = 'public'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates: any = {
        status: action === 'accept' ? 'accepted' : 'rejected',
        visibility: action === 'accept' ? visibility : 'private',
      };

      if (action === 'accept') {
        updates.accepted_at = new Date().toISOString();
      } else {
        updates.rejected_at = new Date().toISOString();
      }

      const { error } = await (supabase
        .from('professional_endorsements_v2') as any)
        .update(updates)
        .eq('id', endorsementId)
        .eq('professional_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Failed to respond to endorsement:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Feature/unfeature an endorsement
   */
  static async toggleFeatured(endorsementId: string, featured: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await (supabase
        .from('professional_endorsements_v2') as any)
        .update({ featured })
        .eq('id', endorsementId)
        .eq('professional_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Failed to toggle featured status:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // Skill Endorsements (Quick endorsements)
  // ============================================================================

  /**
   * Endorse a skill
   */
  static async endorseSkill(
    professionalId: string,
    skillName: string,
    strength: number = 5
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (user.id === professionalId) {
        throw new Error('Cannot endorse your own skills');
      }

      const { error } = await (supabase
        .from('skill_endorsements') as any)
        .insert({
          professional_id: professionalId,
          endorser_id: user.id,
          skill_name: skillName,
          strength
        });

      if (error) {
        // Check if already endorsed
        if (error.code === '23505') { // Unique violation
          return { success: false, error: 'You have already endorsed this skill' };
        }
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Failed to endorse skill:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get skill endorsement counts for a professional
   */
  static async getSkillEndorsements(professionalId: string): Promise<{ 
    success: boolean; 
    skills?: Array<{ skill_name: string; count: number; avg_strength: number }>; 
    error?: string 
  }> {
    try {
      const { data, error } = await (supabase
        .from('skill_endorsement_counts') as any)
        .select()
        .eq('professional_id', professionalId);

      if (error) throw error;

      return { success: true, skills: data };
    } catch (error: any) {
      console.error('Failed to fetch skill endorsements:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // Templates
  // ============================================================================

  /**
   * Get endorsement templates
   */
  static async getTemplates(): Promise<{ success: boolean; templates?: EndorsementTemplate[]; error?: string }> {
    try {
      const { data, error } = await (supabase
        .from('endorsement_templates') as any)
        .select()
        .eq('active', true)
        .order('category');

      if (error) throw error;

      return { success: true, templates: data as EndorsementTemplate[] };
    } catch (error: any) {
      console.error('Failed to fetch templates:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  /**
   * Group endorsements by category for display
   */
  static groupEndorsements(endorsements: DisplayEndorsement[]): GroupedEndorsements {
    const result: GroupedEndorsements = {
      featured: [],
      by_skill: {},
      recent: [],
      all: endorsements
    };

    // Featured endorsements
    result.featured = endorsements
      .filter(e => e.featured)
      .sort((a, b) => a.display_order - b.display_order)
      .slice(0, 5);

    // Group by skill
    endorsements.forEach(endorsement => {
      endorsement.skills_endorsed?.forEach(skill => {
        if (!result.by_skill[skill]) {
          result.by_skill[skill] = [];
        }
        result.by_skill[skill].push(endorsement);
      });
    });

    // Recent (last 5)
    result.recent = endorsements
      .filter(e => e.status === 'accepted')
      .sort((a, b) => new Date(b.accepted_at || b.created_at).getTime() - new Date(a.accepted_at || a.created_at).getTime())
      .slice(0, 5);

    return result;
  }
}
