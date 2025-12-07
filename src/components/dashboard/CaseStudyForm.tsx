import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { caseStudySchema, type CaseStudyFormData } from '@/lib/schemas';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/TagInput';
import { MediaUpload } from './MediaUpload';
import { Switch } from '@/components/ui/switch';
import type { CaseStudy } from '@/types/dashboard';

interface CaseStudyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CaseStudyFormData) => Promise<void>;
  caseStudy?: CaseStudy | null;
  userId: string;
  isLoading?: boolean;
}

export function CaseStudyForm({
  open,
  onOpenChange,
  onSubmit,
  caseStudy,
  userId,
  isLoading = false
}: CaseStudyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CaseStudyFormData>({
    resolver: zodResolver(caseStudySchema),
    defaultValues: {
      title: '',
      description: '',
      role: '',
      timeline: '',
      skills: [],
      challenge: '',
      solution: '',
      result: '',
      media_urls: [],
      is_portfolio_visible: true,
      project_type: 'case_study',
    },
  });

  const skills = watch('skills');
  const mediaUrls = watch('media_urls');
  const isVisible = watch('is_portfolio_visible');

  useEffect(() => {
    if (open && caseStudy) {
      reset(caseStudy);
    } else if (open) {
      reset({
        title: '',
        description: '',
        role: '',
        timeline: '',
        skills: [],
        challenge: '',
        solution: '',
        result: '',
        media_urls: [],
        is_portfolio_visible: true,
        project_type: 'case_study',
      });
    }
  }, [open, caseStudy, reset]);

  const handleFormSubmit = async (data: CaseStudyFormData) => {
    // Set featured image as first media URL if available
    const submitData = {
      ...data,
      featured_image_url: data.media_urls?.[0] || undefined,
    };
    await onSubmit(submitData as CaseStudyFormData);
    reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black">
            {caseStudy ? 'Edit Case Study' : 'Create Case Study'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-black">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-black">Project Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="E-commerce Platform Redesign"
                className="text-black"
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-black">Your Role *</Label>
                <Input
                  id="role"
                  {...register('role')}
                  placeholder="Lead Product Designer"
                  className="text-black"
                />
                {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline" className="text-black">Timeline *</Label>
                <Input
                  id="timeline"
                  {...register('timeline')}
                  placeholder="Jan 2024 - Mar 2024"
                  className="text-black"
                />
                {errors.timeline && <p className="text-sm text-red-600">{errors.timeline.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-black">Brief Description *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="A quick overview of the project..."
                rows={3}
                className="text-black"
              />
              {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
            </div>
          </div>

          {/* Case Study Structure */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-black">Case Study Details</h3>

            <div className="space-y-2">
              <Label htmlFor="challenge" className="text-black">The Challenge *</Label>
              <Textarea
                id="challenge"
                {...register('challenge')}
                placeholder="What problem were you solving? What was the context? (min 50 characters)"
                rows={4}
                className="text-black"
              />
              {errors.challenge && <p className="text-sm text-red-600">{errors.challenge.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution" className="text-black">The Solution *</Label>
              <Textarea
                id="solution"
                {...register('solution')}
                placeholder="How did you approach it? What did you build/implement? (min 50 characters)"
                rows={4}
                className="text-black"
              />
              {errors.solution && <p className="text-sm text-red-600">{errors.solution.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="result" className="text-black">The Result *</Label>
              <Textarea
                id="result"
                {...register('result')}
                placeholder="What were the outcomes? Metrics? Impact? (min 50 characters)"
                rows={4}
                className="text-black"
              />
              {errors.result && <p className="text-sm text-red-600">{errors.result.message}</p>}
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-black">Media & Assets</h3>
            <MediaUpload
              userId={userId}
              projectId={caseStudy?.id}
              existingUrls={mediaUrls || []}
              onChange={(urls) => setValue('media_urls', urls)}
            />
          </div>

          {/* Skills & Settings */}
          <div className="space-y-4">
            <TagInput
              label="Skills & Technologies *"
              value={skills || []}
              onChange={(newSkills) => setValue('skills', newSkills, { shouldValidate: true })}
              placeholder="React, TypeScript, Figma..."
              error={errors.skills?.message}
            />

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div>
                <Label htmlFor="visible" className="text-black font-medium">Show in Public Portfolio</Label>
                <p className="text-sm text-gray-600">Make this case study visible on your public profile</p>
              </div>
              <Switch
                id="visible"
                checked={isVisible}
                onCheckedChange={(checked) => setValue('is_portfolio_visible', checked)}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-2">
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
              {isLoading ? 'Saving...' : caseStudy ? 'Update Case Study' : 'Create Case Study'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
