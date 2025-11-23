import React, { useState } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export type ActionButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void | Promise<void>;
  variant?: ActionButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  confirmationMessage?: string;
  confirmationTitle?: string;
  className?: string;
}

const variantStyles: Record<ActionButtonVariant, string> = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'hover:bg-slate-100 text-slate-700',
};

export function ActionButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  confirmationMessage,
  confirmationTitle = 'Are you sure?',
  className,
}: ActionButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    if (confirmationMessage) {
      setIsConfirmOpen(true);
    } else {
      await executeAction();
    }
  };

  const executeAction = async () => {
    try {
      setIsProcessing(true);
      await Promise.resolve(onClick());
    } finally {
      setIsProcessing(false);
      setIsConfirmOpen(false);
    }
  };

  const isLoading = loading || isProcessing;
  const isDisabled = disabled || isLoading;

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isDisabled}
        size={size}
        className={cn(variantStyles[variant], className)}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          Icon && <Icon className="h-4 w-4 mr-2" />
        )}
        {children}
      </Button>

      {confirmationMessage && (
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmationTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmationMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={executeAction}
                disabled={isProcessing}
                className={variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
