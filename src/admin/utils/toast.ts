import { toast as sonnerToast } from 'sonner';
import { APIError, NetworkError, ValidationError, UnauthorizedError } from '../services/errors';

/**
 * Enhanced toast utility with error handling
 */
export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description });
  },

  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description });
  },

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description });
  },

  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description });
  },

  /**
   * Handle API errors and show appropriate toast
   */
  handleError: (error: unknown, fallbackMessage: string = 'An error occurred') => {
    if (error instanceof NetworkError) {
      sonnerToast.error('Network Error', {
        description: 'Please check your internet connection and try again.',
      });
      return;
    }

    if (error instanceof UnauthorizedError) {
      sonnerToast.error('Unauthorized', {
        description: 'You do not have permission to perform this action.',
      });
      return;
    }

    if (error instanceof ValidationError) {
      const firstError = Object.values(error.errors)[0]?.[0];
      sonnerToast.error('Validation Error', {
        description: firstError || error.message,
      });
      return;
    }

    if (error instanceof APIError) {
      sonnerToast.error('Error', {
        description: error.message,
      });
      return;
    }

    if (error instanceof Error) {
      sonnerToast.error('Error', {
        description: error.message || fallbackMessage,
      });
      return;
    }

    sonnerToast.error('Error', {
      description: fallbackMessage,
    });
  },

  /**
   * Show a promise toast with loading, success, and error states
   */
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};
