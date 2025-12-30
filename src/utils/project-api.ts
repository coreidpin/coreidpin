/**
 * Engineering Project API
 * CRUD operations for engineering projects
 */

import { supabase } from './supabase/client';
import type { EngineeringProject, ProjectFormData } from '../types/portfolio';

/**
 * Create a new engineering project
 */
export async function createProject(userId: string, projectData: ProjectFormData): Promise<EngineeringProject> {
  const slug = generateSlug(projectData.name);
  
  const { data, error } = await supabase
    .from('engineering_projects')
    .insert({
      user_id: userId,
      name: projectData.name,
      slug,
      description: projectData.description,
      role: projectData.role,
      duration: projectData.duration,
      status: projectData.status,
      tech_stack: projectData.techStack,
      repository_url: projectData.repositoryUrl,
      live_demo_url: projectData.liveDemoUrl,
      cover_image: projectData.coverImage,
      screenshots: projectData.screenshots,
      impact: projectData.impact,
      is_featured: projectData.isFeatured,
      is_published: projectData.isPublished,
      view_count: 0
    })
    .select()
    .single();

  if (error) throw error;
  return transformProject(data);
}

/**
 * Get all projects for a user
 */
export async function getProjects(userId: string): Promise<EngineeringProject[]> {
  const { data, error } = await supabase
    .from('engineering_projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(transformProject);
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<EngineeringProject> {
  const { data, error } = await supabase
    .from('engineering_projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return transformProject(data);
}

/**
 * Update an existing project
 */
export async function updateProject(id: string, projectData: Partial<ProjectFormData>): Promise<EngineeringProject> {
  const updateData: any = {};
  
  if (projectData.name) updateData.name = projectData.name;
  if (projectData.description !== undefined) updateData.description = projectData.description;
  if (projectData.role) updateData.role = projectData.role;
  if (projectData.duration) updateData.duration = projectData.duration;
  if (projectData.status) updateData.status = projectData.status;
  if (projectData.techStack) updateData.tech_stack = projectData.techStack;
  if (projectData.repositoryUrl !== undefined) updateData.repository_url = projectData.repositoryUrl;
  if (projectData.liveDemoUrl !== undefined) updateData.live_demo_url = projectData.liveDemoUrl;
  if (projectData.coverImage !== undefined) updateData.cover_image = projectData.coverImage;
  if (projectData.screenshots) updateData.screenshots = projectData.screenshots;
  if (projectData.impact) updateData.impact = projectData.impact;
  if (projectData.isFeatured !== undefined) updateData.is_featured = projectData.isFeatured;
  if (projectData.isPublished !== undefined) updateData.is_published = projectData.isPublished;

  const { data, error } = await supabase
    .from('engineering_projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return transformProject(data);
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('engineering_projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Increment view count
 */
export async function incrementProjectViews(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_project_views', { project_id: id });
  if (error) console.error('Failed to increment views:', error);
}

/**
 * Transform database row to EngineeringProject type
 */
function transformProject(data: any): EngineeringProject {
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    slug: data.slug,
    description: data.description || '',
    role: data.role || '',
    duration: data.duration || '',
    status: data.status || 'In Progress',
    techStack: data.tech_stack || [],
    repositoryUrl: data.repository_url,
    liveDemoUrl: data.live_demo_url,
    coverImage: data.cover_image,
    screenshots: data.screenshots || [],
    impact: data.impact || {
      usersServed: undefined,
      performanceGain: '',
      scalability: '',
      testCoverage: undefined,
      customMetrics: []
    },
    isFeatured: data.is_featured || false,
    isPublished: data.is_published || false,
    viewCount: data.view_count || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

/**
 * Generate URL-friendly slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
