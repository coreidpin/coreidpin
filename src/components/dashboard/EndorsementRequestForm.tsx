import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import type { EndorsementRequestFormData } from '@/lib/schemas';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EndorsementRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EndorsementRequestFormData) => Promise<void>;
  isLoading?: boolean;
}

export function EndorsementRequestForm({ open, onOpenChange, onSubmit, isLoading = false }: EndorsementRequestFormProps) {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<EndorsementRequestFormData>({
    mode: 'onBlur',
    defaultValues: {
      endorser_name: '',
      endorser_email: '',
      endorser_role: '',
      endorser_company: '',
      endorser_linkedin_url: '',
      relationship_type: '',
      company_worked_together: '',
      time_worked_together_start: '',
      time_worked_together_end: '',
      project_context: '',
      suggested_skills: [],
      custom_message: '',
    },
  });

  const customMessage = watch('custom_message');
  const suggestedSkills = watch('suggested_skills');

  useEffect(() => {
    if (open) {
      setStep(1);
      reset();
    }
  }, [open, reset]);

  const handleFormSubmit = async (data: EndorsementRequestFormData) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    setStep(1);
    reset();
    onOpenChange(false);
  };

  const handleNext = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setStep(step + 1);
    setIsProcessing(false);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black">Request Endorsement</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i + 1 <= step ? 'bg-black' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endorser_name">Endorser Name *</Label>
                <Input
                  id="endorser_name"
                  {...register('endorser_name')}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endorser_email">Endorser Email *</Label>
                <Input
                  id="endorser_email"
                  type="email"
                  {...register('endorser_email')}
                  placeholder="e.g. john@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endorser_role">Role/Title</Label>
                  <Input
                    id="endorser_role"
                    {...register('endorser_role')}
                    placeholder="e.g. CTO"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endorser_company">Company</Label>
                  <Input
                    id="endorser_company"
                    {...register('endorser_company')}
                    placeholder="e.g. Tech Corp"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endorser_linkedin_url">LinkedIn Profile (Optional)</Label>
                <Input
                  id="endorser_linkedin_url"
                  {...register('endorser_linkedin_url')}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="relationship_type">How did you work together?</Label>
                <select
                  id="relationship_type"
                  {...register('relationship_type')}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select relationship...</option>
                  <option value="manager">They were my manager</option>
                  <option value="colleague">We were colleagues</option>
                  <option value="direct_report">They reported to me</option>
                  <option value="client">They were my client</option>
                  <option value="mentor">They mentored me</option>
                  <option value="mentee">I mentored them</option>
                  <option value="collaborator">We collaborated on projects</option>
                  <option value="vendor">Vendor/Service provider</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_worked_together">Company/Organization (where you worked together)</Label>
                <Input
                  id="company_worked_together"
                  {...register('company_worked_together')}
                  placeholder="e.g. Acme Inc"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time_worked_together_start">Start Date</Label>
                  <Input
                    id="time_worked_together_start"
                    type="date"
                    {...register('time_worked_together_start')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time_worked_together_end">End Date</Label>
                  <Input
                    id="time_worked_together_end"
                    type="date"
                    {...register('time_worked_together_end')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_context">Project/Work Context (Optional)</Label>
                <Textarea
                  id="project_context"
                  {...register('project_context')}
                  placeholder="Briefly describe what you worked on together..."
                  rows={3}
                  maxLength={200}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="suggested_skills">Skills to Endorse (Optional)</Label>
                <Input
                  id="suggested_skills"
                  value={suggestedSkills?.join(', ') || ''}
                  onChange={(e) => setValue('suggested_skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="e.g. Leadership, JavaScript, Problem Solving"
                />
                <p className="text-xs text-gray-500">Comma-separated</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="custom_message">Personal Message (Optional)</Label>
                  <span className="text-xs text-gray-500">
                    {customMessage?.length || 0}/500
                  </span>
                </div>
                <Textarea
                  id="custom_message"
                  {...register('custom_message')}
                  placeholder="Add a personal note to include in your endorsement request..."
                  rows={6}
                  maxLength={500}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-row gap-2 pt-4">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="bg-white text-black border-2 border-black hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="bg-white text-black border-2 border-black hover:bg-gray-100"
            >
              Cancel
            </Button>
            {step < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isProcessing}
                className="bg-white text-black border-2 border-black hover:bg-gray-100"
              >
                {isProcessing ? 'Loading...' : 'Next'}
                {!isProcessing && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-white text-black border-2 border-black hover:bg-gray-100"
              >
                {isLoading ? 'Sending...' : 'Send Request'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
