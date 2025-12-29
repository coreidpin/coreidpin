/**
 * Centralized Error Handler
 * Provides consistent error handling across the application
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  retryable: boolean;
  timestamp: number;
  context?: Record<string, any>;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 50;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle an error and return a user-friendly message
   */
  handle(error: unknown, context?: string): AppError {
    const appError = this.parseError(error, context);
    this.logError(appError);
    
    // In production, send to error tracking service
    if (import.meta.env.PROD) {
      this.reportToService(appError);
    }

    return appError;
  }

  /**
   * Parse unknown error into AppError
   */
  private parseError(error: unknown, context?: string): AppError {
    const timestamp = Date.now();

    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        message: 'Unable to connect. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        severity: 'high',
        retryable: true,
        timestamp,
        context: { type: 'network', original: context }
      };
    }

    // API errors
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as any).status;
      
      if (status === 401 || status === 403) {
        return {
          message: 'Session expired. Please log in again.',
          code: 'AUTH_ERROR',
          severity: 'high',
          retryable: false,
          timestamp,
          context: { type: 'auth', status }
        };
      }

      if (status === 404) {
        return {
          message: 'The requested resource was not found.',
          code: 'NOT_FOUND',
          severity: 'medium',
          retryable: false,
          timestamp
        };
      }

      if (status === 429) {
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          code: 'RATE_LIMIT',
          severity: 'medium',
          retryable: true,
          timestamp
        };
      }

      if (status >= 500) {
        return {
          message: 'Server error. Our team has been notified.',
          code: 'SERVER_ERROR',
          severity: 'high',
          retryable: true,
          timestamp,
          context: { type: 'server', status }
        };
      }
    }

    // Supabase errors
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as any).code;
      const message = (error as any).message || 'An error occurred';

      return {
        message: this.getSupabaseErrorMessage(code, message),
        code: code as string,
        severity: 'medium',
        retryable: code !== 'PGRST116', // Not retryable for auth errors
        timestamp,
        context: { type: 'supabase', code }
      };
    }

    // Generic error
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return {
      message: message || 'Something went wrong. Please try again.',
      code: 'UNKNOWN_ERROR',
      severity: 'medium',
      retryable: true,
      timestamp,
      context: { type: 'unknown', original: String(error) }
    };
  }

  /**
   * Get user-friendly Supabase error message
   */
  private getSupabaseErrorMessage(code: string, original: string): string {
    const messages: Record<string, string> = {
      'PGRST116': 'Session expired. Please log in again.',
      '23505': 'This record already exists.',
      '23503': 'Cannot delete: this item is referenced elsewhere.',
      '42P01': 'Database table not found. Please contact support.',
      '42501': 'Permission denied for this action.',
    };

    return messages[code] || original || 'A database error occurred.';
  }

  /**
   * Log error to internal store
   */
  private logError(error: AppError): void {
    this.errorLog.unshift(error);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Console log in development
    if (import.meta.env.DEV) {
      console.error('[ErrorHandler]', error);
    }
  }

  /**
   * Report to external error tracking service
   */
  private reportToService(error: AppError): void {
    // TODO: Integrate with Sentry, LogRocket, or similar
    // Example:
    // Sentry.captureException(error);
  }

  /**
   * Get recent errors (for debugging)
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errorLog.slice(0, count);
  }

  /**
   * Clear error log
   */
  clearLog(): void {
    this.errorLog = [];
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

/**
 * Retry helper with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Wait for online connection
 */
export function waitForOnline(timeout: number = 30000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      resolve(false);
    }, timeout);

    const onlineHandler = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', onlineHandler);
      resolve(true);
    };

    window.addEventListener('online', onlineHandler);
  });
}
