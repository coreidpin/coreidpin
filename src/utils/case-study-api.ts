/**
 * Case Study API Utilities
 * Functions for managing design case studies
 */

import { supabase } from './supabase/client';
import type { CaseStudy, CaseStudyFormData } from '../types/portfolio';

/**
 * Generate unique slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Get all case studies for a user
 */
export async function getCaseStudies(
  userId: string,
  publishedOnly = false
): Promise<CaseStudy[]> {
  let query = supabase
    .from('case_studies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (publishedOnly) {
    query = query.eq('is_published', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Get a single case study by slug
 */
export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

/**
 * Create a new case study
 */
export async function createCaseStudy(
  userId: string,
  caseStudy: CaseStudyFormData
): Promise<CaseStudy> {
  // Generate slug
  const baseSlug = generateSlug(caseStudy.title);
  let slug = baseSlug;
  let counter = 1;

  // Ensure unique slug
  while (await getCaseStudyBySlug(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const { data, error } = await supabase
    .from('case_studies')
    .insert({
      user_id: userId,
      slug,
      ...caseStudy
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a case study
 */
export async function updateCaseStudy(
  id: string,
  updates: Partial<CaseStudyFormData>
): Promise<CaseStudy> {
  const { data, error } = await supabase
    .from('case_studies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a case study
 */
export async function deleteCaseStudy(id: string): Promise<void> {
  const { error } = await supabase
    .from('case_studies')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Publish/unpublish a case study
 */
export async function toggleCaseStudyPublish(
  id: string,
  isPublished: boolean
): Promise<void> {
  await updateCaseStudy(id, { isPublished });
}

/**
 * Increment view count
 */
export async function incrementCaseStudyViews(id: string): Promise<void> {
  const { data: caseStudy } = await supabase
    .from('case_studies')
    .select('view_count')
    .eq('id', id)
    .single();

  if (caseStudy) {
    await supabase
      .from('case_studies')
      .update({ view_count: (caseStudy.view_count || 0) + 1 })
      .eq('id', id);
  }
}

/**
 * Get featured case studies
 */
export async function getFeaturedCaseStudies(userId: string): Promise<CaseStudy[]> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('user_id', userId)
    .eq('is_featured', true)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) throw error;
  return data || [];
}
