import { z } from 'zod';

// Project schema
export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  role: z.string().min(1, 'Role is required').max(50, 'Role must be less than 50 characters'),
  timeline: z.string().min(1, 'Timeline is required').max(50, 'Timeline must be less than 50 characters'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// Endorsement request schema
export const endorsementRequestSchema = z.object({
  endorser_name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  endorser_email: z.string().email('Invalid email address'),
  endorser_role: z.union([z.string(), z.undefined()]).optional(),
  endorser_company: z.union([z.string(), z.undefined()]).optional(),
  endorser_linkedin_url: z.union([z.string(), z.undefined()]).optional(),
  relationship_type: z.union([z.string(), z.undefined()]).optional(),
  company_worked_together: z.union([z.string(), z.undefined()]).optional(),
  time_worked_together_start: z.union([z.string(), z.undefined()]).optional(),
  time_worked_together_end: z.union([z.string(), z.undefined()]).optional(),
  project_context: z.union([z.string(), z.undefined()]).optional(),
  suggested_skills: z.array(z.string()).optional(),
  custom_message: z.union([z.string(), z.undefined()]).optional(),
});

export type EndorsementRequestFormData = z.infer<typeof endorsementRequestSchema>;
