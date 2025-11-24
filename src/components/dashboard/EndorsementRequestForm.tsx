import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { endorsementRequestSchema, type EndorsementRequestFormData } from '@/lib/schemas';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EndorsementRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EndorsementRequestFormData) => Promise<void>;
  isLoading?: boolean;
}

export function EndorsementRequestForm({ open, onOpenChange, onSubmit, isLoading = false }: EndorsementRequestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<EndorsementRequestFormData>({
    resolver: zodResolver(endorsementRequestSchema),
    mode: 'onSubmit', // Only validate when form is submitted
    defaultValues: {
      endorser_name: '',
      endorser_email: '',
      role: '',
      company: '',
      endorsement_text: '',
    },
  });

  const endorsementText = watch('endorsement_text');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset({
        endorser_name: '',
        endorser_email: '',
        role: '',
        company: '',
        endorsement_text: '',
      });
    }
  }, [open, reset]);

  const handleFormSubmit = async (data: EndorsementRequestFormData) => {
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
          <DialogTitle className="text-xl font-bold text-black">Request Endorsement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="endorser_name" className="text-black font-medium">Endorser Name</Label>
            <Input
              id="endorser_name"
              {...register('endorser_name')}
              placeholder="e.g. John Doe"
              className="text-black"
            />
            {errors.endorser_name && <p className="text-sm text-red-600">{errors.endorser_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endorser_email" className="text-black font-medium">Endorser Email</Label>
            <Input
              id="endorser_email"
              type="email"
              {...register('endorser_email')}
              placeholder="e.g. john@company.com"
              className="text-black"
            />
            {errors.endorser_email && <p className="text-sm text-red-600">{errors.endorser_email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-black font-medium">Role</Label>
              <Input
                id="role"
                {...register('role')}
                placeholder="e.g. CTO"
                className="text-black"
              />
              {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-black font-medium">Company</Label>
              <Input
                id="company"
                {...register('company')}
                placeholder="e.g. Tech Corp"
                className="text-black"
              />
              {errors.company && <p className="text-sm text-red-600">{errors.company.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="endorsement_text" className="text-black font-medium">Endorsement Text</Label>
              <span className="text-xs text-black">
                {endorsementText?.length || 0}/500
              </span>
            </div>
            <Textarea
              id="endorsement_text"
              {...register('endorsement_text')}
              placeholder="What would you like them to endorse you for?"
              rows={4}
              className="text-black"
            />
            {errors.endorsement_text && <p className="text-sm text-red-600">{errors.endorsement_text.message}</p>}
          </div>

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
              {isLoading ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
