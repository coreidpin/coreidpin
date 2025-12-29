/**
 * Tech Stack API Utilities
 * Extended functions for managing tech stack
 */

import { supabase } from './supabase/client';
import type { TechSkill, SkillCategory, SkillLevel, TechStackDistribution } from '../types/portfolio';

/**
 * Get all tech skills for a user
 */
export async function getTechStack(userId: string): Promise<TechSkill[]> {
  const { data, error } = await supabase
    .from('tech_stack')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Add a new tech skill
 */
export async function addTechSkill(
  userId: string,
  skill: {
    category: SkillCategory;
    name: string;
    level: SkillLevel;
    yearsExperience: number;
  }
): Promise<TechSkill> {
  // Get current count for display order
  const { count } = await supabase
    .from('tech_stack')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { data, error } = await supabase
    .from('tech_stack')
    .insert({
      user_id: userId,
      category: skill.category,
      name: skill.name,
      level: skill.level,
      years_experience: skill.yearsExperience,
      display_order: count || 0,
      last_used_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  // Recalculate percentages
  await calculatePercentages(userId);

  return data;
}

/**
 * Update a tech skill
 */
export async function updateTechSkill(
  id: string,
  updates: Partial<TechSkill>
): Promise<TechSkill> {
  const { data, error } = await supabase
    .from('tech_stack')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Recalculate percentages if years changed
  if (updates.yearsExperience !== undefined && data) {
    await calculatePercentages(data.userId);
  }

  return data;
}

/**
 * Remove a tech skill
 */
export async function removeTechSkill(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('tech_stack')
    .delete()
    .eq('id', id);

  if (error) throw error;

  // Recalculate percentages
  await calculatePercentages(userId);
}

/**
 * Calculate percentage distribution
 */
async function calculatePercentages(userId: string): Promise<void> {
  // Get all skills
  const skills = await getTechStack(userId);
  
  if (skills.length === 0) return;

  // Calculate total years
  const totalYears = skills.reduce((sum, skill) => sum + skill.yearsExperience, 0);

  if (totalYears === 0) return;

  // Update each skill's percentage
  const updates = skills.map(skill => 
    supabase
      .from('tech_stack')
      .update({ 
        percentage: Math.round((skill.yearsExperience / totalYears) * 100) 
      })
      .eq('id', skill.id)
  );

  await Promise.all(updates);
}

/**
 * Get tech stack distribution by category
 */
export async function getTechStackDistribution(userId: string): Promise<TechStackDistribution[]> {
  const skills = await getTechStack(userId);

  // Group by category
  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push({
      name: skill.name,
      percentage: skill.percentage || 0,
      level: skill.level
    });
    return acc;
  }, {} as Record<SkillCategory, Array<{ name: string; percentage: number; level: SkillLevel }>>);

  // Convert to array
  return Object.entries(grouped).map(([category, skillsList]) => ({
    category: category as SkillCategory,
    skills: skillsList
  }));
}

/**
 * Get top skills (by years of experience)
 */
export async function getTopSkills(userId: string, limit = 5): Promise<TechSkill[]> {
  const { data, error } = await supabase
    .from('tech_stack')
    .select('*')
    .eq('user_id', userId)
    .order('years_experience', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Get recently used skills
 */
export async function getRecentSkills(userId: string, limit = 5): Promise<TechSkill[]> {
  const { data, error } = await supabase
    .from('tech_stack')
    .select('*')
    .eq('user_id', userId)
    .not('last_used_at', 'is', null)
    .order('last_used_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Update last used date
 */
export async function updateLastUsed(id: string): Promise<void> {
  await supabase
    .from('tech_stack')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', id);
}

/**
 * Increment project count
 */
export async function incrementProjectCount(skillId: string): Promise<void> {
  const { data: skill } = await supabase
    .from('tech_stack')
    .select('project_count')
    .eq('id', skillId)
    .single();

  if (skill) {
    await supabase
      .from('tech_stack')
      .update({ project_count: (skill.project_count || 0) + 1 })
      .eq('id', skillId);
  }
}
