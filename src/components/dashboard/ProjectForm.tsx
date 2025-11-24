import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { projectSchema, type ProjectFormData } from '@/lib/schemas';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/TagInput';
import type { Project } from '@/types/dashboard';

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  project?: Project | null;
  isLoading?: boolean;
}

export function ProjectForm({ open, onOpenChange, onSubmit, project, isLoading = false }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    mode: 'onSubmit', // Only validate when form is submitted
    defaultValues: {
      title: '',
      description: '',
      role: '',
      timeline: '',
      skills: [],
    },
  });

  const skills = watch('skills');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (project) {
        // Editing existing project
        reset({
          title: project.title,
          description: project.description,
          role: project.role,
          timeline: project.timeline,
          skills: project.skills || [],
        });
      } else {
        // Adding new project
        reset({
          title: '',
          description: '',
          role: '',
          timeline: '',
          skills: [],
        });
      }
    }
  }, [open, project, reset]);

  const handleFormSubmit = async (data: ProjectFormData) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black">
            {project ? 'Edit Project' : 'Add Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-black font-medium">Project Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g. E-commerce Platform"
              className="text-black"
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-black font-medium">Your Role</Label>
            <Input
              id="role"
              {...register('role')}
              placeholder="e.g. Lead Developer"
              className="text-black"
            />
            {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-black font-medium">Timeline</Label>
            <Input
              id="timeline"
              {...register('timeline')}
              placeholder="e.g. Jan 2023 - Present"
              className="text-black"
            />
            {errors.timeline && <p className="text-sm text-red-600">{errors.timeline.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-black font-medium">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the project and your contribution..."
              rows={4}
              className="text-black"
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <TagInput
            label="Skills"
            value={skills}
            onChange={(newSkills) => setValue('skills', newSkills, { shouldValidate: true })}
            placeholder="Type a skill and press Enter"
            error={errors.skills?.message}
          />

          <DialogFooter className="flex flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-white text-black border-2 border-black hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-white text-black border-2 border-black hover:bg-gray-100"
            >
              {isLoading ? 'Saving...' : project ? 'Update Project' : 'Add Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
