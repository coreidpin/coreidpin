/**
 * Skill Endorsements API
 * Functions for endorsing skills and managing endorsements
 */

import { supabase } from './supabase/client';

/**
 * Endorse a skill (Tech Stack item)
 * @param techStackId - The ID of the skill to endorse
 * @param endorserId - The ID of the user endorsing the skill
 */
export async function endorseSkill(techStackId: string, endorserId: string): Promise<void> {
  const { error } = await supabase
    .from('skill_endorsements')
    .insert({
      tech_stack_id: techStackId,
      endorser_id: endorserId
    });

  if (error) {
    // If unique constraint violation, it means already endorsed
    if (error.code === '23505') {
       return; // Already endorsed, treat as success or ignore
    }
    throw error;
  }
}

/**
 * Remove an endorsement
 * @param techStackId - The ID of the skill to un-endorse
 * @param endorserId - The ID of the user removing the endorsement
 */
export async function removeEndorsement(techStackId: string, endorserId: string): Promise<void> {
  const { error } = await supabase
    .from('skill_endorsements')
    .delete()
    .eq('tech_stack_id', techStackId)
    .eq('endorser_id', endorserId);

  if (error) throw error;
}

/**
 * Check if a user has endorsed a specific skill
 * @param techStackId 
 * @param endorserId 
 */
export async function hasUserEndorsed(techStackId: string, endorserId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('skill_endorsements')
    .select('id')
    .eq('tech_stack_id', techStackId)
    .eq('endorser_id', endorserId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking endorsement:', error);
    return false;
  }

  return !!data;
}

/**
 * Get all endorsements for a specific skill (optional, if we want to show list of endorsers)
 */
export async function getEndorsers(techStackId: string) {
  const { data, error } = await supabase
    .from('skill_endorsements')
    .select(`
      endorser_id,
      profiles:endorser_id (
        full_name,
        name,
        avatar_url,
        role,
        job_title
      )
    `)
    .eq('tech_stack_id', techStackId);

  if (error) throw error;
  return data;
}

/**
 * Get all endorsements made by a specific user (to check 'hasEndorsed' status effectively)
 */
export async function getUserEndorsements(endorserId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('skill_endorsements')
    .select('tech_stack_id')
    .eq('endorser_id', endorserId);

  if (error) {
    console.error('Error fetching user endorsements:', error);
    return [];
  }

  return data.map(d => d.tech_stack_id);
}
