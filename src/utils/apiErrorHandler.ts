import { handleSessionExpiry } from './session';

/**
 * Global API error handler
 * Intercepts 401 errors and handles token expiration
 */
export async function handleApiError(error: any, response?: Response): Promise<void> {
  // Handle 401 Unauthorized - token expired
  if (response?.status === 401 || error?.status === 401) {
    console.error('Unauthorized error detected, handling session expiry');
    await handleSessionExpiry('token_expired');
    return;
  }

  // Handle 403 Forbidden - invalid token
  if (response?.status === 403 || error?.status === 403) {
    console.error('Forbidden error detected, handling session expiry');
    await handleSessionExpiry('invalid');
    return;
  }

  // For other errors, just log them
  console.error('API Error:', error);
}

/**
 * Fetch wrapper with automatic error handling
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    const response = await fetch(url, options);

    // Check for auth errors
    if (response.status === 401 || response.status === 403) {
      await handleApiError(null, response);
      throw new Error('Authentication failed');
    }

    return response;
  } catch (error) {
    await handleApiError(error);
    throw error;
  }
}
