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
  role: z.string().min(1, 'Role is required').max(50, 'Role must be less than 50 characters'),
  company: z.string().min(1, 'Company is required').max(100, 'Company must be less than 100 characters'),
  endorsement_text: z.string().min(20, 'Endorsement text must be at least 20 characters').max(500, 'Endorsement text must be less than 500 characters'),
});

export type EndorsementRequestFormData = z.infer<typeof endorsementRequestSchema>;
