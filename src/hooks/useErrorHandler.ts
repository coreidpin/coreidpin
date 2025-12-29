import { useState, useCallback } from 'react';
import { errorHandler, AppError, retryWithBackoff } from '../utils/errorHandler';
import { toast } from 'sonner';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  retryable?: boolean;
  onError?: (error: AppError) => void;
}

interface UseErrorHandlerReturn {
  error: AppError | null;
  isError: boolean;
  clearError: () => void;
  handleError: (error: unknown, context?: string) => void;
  retry: <T>(fn: () => Promise<T>, maxRetries?: number) => Promise<T | null>;
}

/**
 * Hook for consistent error handling across components
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const { showToast = true, retryable = true, onError } = options;
  const [error, setError] = useState<AppError | null>(null);

  const handleError = useCallback((err: unknown, context?: string) => {
    const appError = errorHandler.handle(err, context);
    setError(appError);

    // Show toast notification
    if (showToast) {
      const toastOptions = {
        duration: appError.severity === 'critical' ? 10000 : 5000,
      };

      if (appError.retryable && retryable) {
        toast.error(appError.message, {
          ...toastOptions,
          action: {
            label: 'Retry',
            onClick: () => {
              // Caller should implement retry logic
              setError(null);
            }
          }
        });
      } else {
        toast.error(appError.message, toastOptions);
      }
    }

    // Call custom error handler
    if (onError) {
      onError(appError);
    }
  }, [showToast, retryable, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async <T,>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T | null> => {
    try {
      clearError();
      const result = await retryWithBackoff(fn, maxRetries);
      return result;
    } catch (err) {
      handleError(err, 'Retry failed');
      return null;
    }
  }, [handleError, clearError]);

  return {
    error,
    isError: error !== null,
    clearError,
    handleError,
    retry
  };
}

/**
 * Hook for handling async operations with loading and error states
 */
interface UseAsyncOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
}

interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T> {
  const { immediate = false, onSuccess, onError: onErrorCallback } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const { error, handleError, clearError } = useErrorHandler({
    showToast: true,
    onError: onErrorCallback
  });

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setLoading(true);
    clearError();

    try {
      const result = await asyncFunction(...args);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      handleError(err, asyncFunction.name || 'Async operation');
      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, onSuccess, handleError, clearError]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    clearError();
  }, [clearError]);

  // Execute immediately if requested
  // useEffect(() => {
  //   if (immediate) {
  //     execute();
  //   }
  // }, [immediate]); // Intentionally minimal deps

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}
