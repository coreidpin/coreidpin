import { supabase } from '../../utils/supabase/client';
import { handleSupabaseError, APIError, NetworkError } from './errors';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Base API client with common functionality
 */
export class BaseAPIClient {
  protected supabase = supabase;

  /**
   * Handle API errors consistently
   */
  protected handleError(error: any): never {
    // Check if it's already an APIError
    if (error instanceof APIError) {
      throw error;
    }

    // Check for network errors
    if (!navigator.onLine) {
      throw new NetworkError();
    }

    // Handle Supabase errors
    if (error.message || error.code) {
      handleSupabaseError(error);
    }

    // Unknown error
    throw new APIError('An unexpected error occurred');
  }

  /**
   * Apply pagination to a Supabase query
   */
  protected applyPagination<T>(
    query: any,
    params: PaginationParams
  ) {
    const { page, pageSize } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    return query.range(from, to);
  }

  /**
   * Create a paginated response
   */
  protected createPaginatedResponse<T>(
    data: T[],
    total: number,
    params: PaginationParams
  ): PaginatedResponse<T> {
    return {
      data,
      total,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(total / params.pageSize),
    };
  }

  /**
   * Retry a function with exponential backoff
   */
  protected async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
    throw new Error('Max retries exceeded');
  }
}

export { supabase };
