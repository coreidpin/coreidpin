/**
 * Custom API Error class for handling API-related errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
    
    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
}

/**
 * Handle Supabase errors and convert to APIError
 */
export const handleSupabaseError = (error: any): never => {
  // Extract meaningful error message
  const message = error.message || error.error_description || 'An error occurred';
  
  throw new APIError(
    message,
    error.code,
    error.status,
    error.details
  );
};

/**
 * Network error handler
 */
export class NetworkError extends APIError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

/**
 * Validation error handler
 */
export class ValidationError extends APIError {
  constructor(message: string, public errors: Record<string, string[]> = {}) {
    super(message, 'VALIDATION_ERROR', 422, errors);
    this.name = 'ValidationError';
  }
}

/**
 * Unauthorized error handler
 */
export class UnauthorizedError extends APIError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}
