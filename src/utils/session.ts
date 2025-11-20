import { supabase } from './supabase/client';
import { toast } from 'sonner';

/**
 * Phase 3: Session Persistence and Token Refresh
 * 
 * This module handles:
 * - Automatic token refresh when expired
 * - Session persistence across page reloads
 * - Graceful session expiry handling
 * - Multi-tab session synchronization
 */

export interface SessionState {
  accessToken: string;
  refreshToken: string;
  userId: string;
  userType: 'employer' | 'professional' | 'university';
  expiresAt: number; // Unix timestamp
}

/**
 * Storage keys for session data
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_ID: 'userId',
  USER_TYPE: 'userType',
  EXPIRES_AT: 'expiresAt',
  LAST_ACTIVITY: 'lastActivity',
} as const;

/**
 * Session configuration
 */
const SESSION_CONFIG = {
  // Refresh token if it expires in less than 5 minutes
  REFRESH_THRESHOLD_MS: 5 * 60 * 1000,
  // Auto-refresh every 30 minutes during active use
  AUTO_REFRESH_INTERVAL_MS: 30 * 60 * 1000,
  // Session timeout after 24 hours of inactivity
  INACTIVITY_TIMEOUT_MS: 24 * 60 * 60 * 1000,
  // Buffer time before token actually expires
  TOKEN_EXPIRY_BUFFER_MS: 60 * 1000,
} as const;

/**
 * Get current session state from localStorage
 */
export function getSessionState(): SessionState | null {
  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const userType = localStorage.getItem(STORAGE_KEYS.USER_TYPE) as SessionState['userType'];
    const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

    if (!accessToken || !refreshToken || !userId || !userType) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      userId,
      userType,
      expiresAt: expiresAt ? parseInt(expiresAt, 10) : Date.now() + 3600 * 1000,
    };
  } catch (error) {
    console.error('Failed to get session state:', error);
    return null;
  }
}

/**
 * Save session state to localStorage
 */
export function saveSessionState(session: SessionState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, session.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER_ID, session.userId);
    localStorage.setItem(STORAGE_KEYS.USER_TYPE, session.userType);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, session.expiresAt.toString());
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
  } catch (error) {
    console.error('Failed to save session state:', error);
  }
}

/**
 * Clear session state from localStorage
 */
export function clearSessionState(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear session state:', error);
  }
}

/**
 * Check if the current token is expired or about to expire
 */
export function isTokenExpired(expiresAt: number, bufferMs = SESSION_CONFIG.TOKEN_EXPIRY_BUFFER_MS): boolean {
  return Date.now() >= (expiresAt - bufferMs);
}

/**
 * Check if token needs refresh (expires soon)
 */
export function needsRefresh(expiresAt: number): boolean {
  const timeUntilExpiry = expiresAt - Date.now();
  return timeUntilExpiry < SESSION_CONFIG.REFRESH_THRESHOLD_MS;
}

/**
 * Refresh the access token using the refresh token
 * 
 * @returns Updated session state or null if refresh failed
 */
export async function refreshTokenIfNeeded(): Promise<SessionState | null> {
  const currentSession = getSessionState();
  
  if (!currentSession) {
    console.log('No session found, refresh not needed');
    return null;
  }

  // Check if token is still valid and doesn't need refresh
  if (!needsRefresh(currentSession.expiresAt)) {
    console.log('Token still valid, refresh not needed');
    return currentSession;
  }

  console.log('Token needs refresh, attempting refresh...');

  try {
    // Use Supabase's built-in refresh mechanism
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: currentSession.refreshToken,
    });

    if (error) {
      console.error('Token refresh failed:', error.message);
      throw error;
    }

    if (!data.session) {
      console.error('Token refresh succeeded but no session returned');
      throw new Error('No session after refresh');
    }

    // Calculate token expiry (Supabase tokens typically expire in 1 hour)
    const expiresAt = data.session.expires_at 
      ? data.session.expires_at * 1000 
      : Date.now() + 3600 * 1000;

    const newSession: SessionState = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      userId: data.session.user.id,
      userType: (data.session.user.user_metadata?.userType || 'professional') as SessionState['userType'],
      expiresAt,
    };

    // Save updated session
    saveSessionState(newSession);

    // Update Supabase session
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    console.log('Token refreshed successfully');
    return newSession;

  } catch (error: any) {
    console.error('Failed to refresh token:', error);
    
    // If refresh fails, clear session and notify user
    clearSessionState();
    await supabase.auth.signOut();
    
    return null;
  }
}

/**
 * Restore session from Supabase and localStorage
 * Call this on app initialization
 */
export async function restoreSession(): Promise<SessionState | null> {
  try {
    // First, try to get session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();

    if (session) {
      // Calculate expiry time
      const expiresAt = session.expires_at 
        ? session.expires_at * 1000 
        : Date.now() + 3600 * 1000;

      const sessionState: SessionState = {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        userId: session.user.id,
        userType: (session.user.user_metadata?.userType || 'professional') as SessionState['userType'],
        expiresAt,
      };

      // Save to localStorage
      saveSessionState(sessionState);
      console.log('Session restored successfully from Supabase');
      return sessionState;
    }

    // If Supabase session is missing, try to recover from localStorage
    // This handles cases where we use custom JWTs or Supabase client hasn't initialized fully
    console.log('No Supabase session found, checking localStorage...');
    const localSession = getSessionState();

    if (localSession) {
      // Check if token is expired
      if (isTokenExpired(localSession.expiresAt)) {
        console.log('Local session expired');
        clearSessionState();
        return null;
      }

      console.log('Recovering session from localStorage...');
      
      // Attempt to re-hydrate Supabase session
      const { error: setError } = await supabase.auth.setSession({
        access_token: localSession.accessToken,
        refresh_token: localSession.refreshToken
      });

      if (setError) {
        console.warn('Failed to re-hydrate Supabase session:', setError);
        // We still return localSession because it might be valid for our API calls
        // even if Supabase client rejects it for auto-refresh
      }

      return localSession;
    }

    clearSessionState();
    return null;

  } catch (error) {
    console.error('Failed to restore session:', error);
    clearSessionState();
    return null;
  }
}

/**
 * Check if session has expired due to inactivity
 */
export function isSessionInactive(): boolean {
  try {
    const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
    if (!lastActivity) return true;

    const lastActivityTime = parseInt(lastActivity, 10);
    const timeSinceActivity = Date.now() - lastActivityTime;

    return timeSinceActivity > SESSION_CONFIG.INACTIVITY_TIMEOUT_MS;
  } catch (error) {
    console.error('Failed to check session activity:', error);
    return true;
  }
}

/**
 * Update last activity timestamp
 */
export function updateActivity(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
  } catch (error) {
    console.error('Failed to update activity:', error);
  }
}

/**
 * Handle session expiry gracefully
 */
export async function handleSessionExpiry(reason: 'token_expired' | 'inactivity' | 'invalid'): Promise<void> {
  console.log(`Session expired: ${reason}`);
  
  // Clear all session data
  clearSessionState();
  await supabase.auth.signOut();

  // Show user-friendly message
  const messages = {
    token_expired: 'Your session has expired. Please log in again.',
    inactivity: 'You were logged out due to inactivity. Please log in again.',
    invalid: 'Your session is no longer valid. Please log in again.',
  };

  toast.error(messages[reason], {
    duration: 5000,
    description: 'You will be redirected to the login page.',
  });

  // Redirect to login after a short delay
  setTimeout(() => {
    window.location.href = '/';
  }, 2000);
}

/**
 * Set up periodic token refresh
 * Returns cleanup function to stop the interval
 */
export function setupAutoRefresh(): () => void {
  const intervalId = setInterval(async () => {
    const session = getSessionState();
    
    if (!session) {
      console.log('No session found, stopping auto-refresh');
      clearInterval(intervalId);
      return;
    }

    // Check for inactivity
    if (isSessionInactive()) {
      console.log('Session inactive, logging out');
      await handleSessionExpiry('inactivity');
      clearInterval(intervalId);
      return;
    }

    // Refresh token if needed
    if (needsRefresh(session.expiresAt)) {
      console.log('Auto-refreshing token...');
      const refreshedSession = await refreshTokenIfNeeded();
      
      if (!refreshedSession) {
        console.log('Auto-refresh failed, logging out');
        await handleSessionExpiry('token_expired');
        clearInterval(intervalId);
      }
    }

    // Update activity timestamp
    updateActivity();

  }, SESSION_CONFIG.AUTO_REFRESH_INTERVAL_MS);

  console.log('Auto-refresh setup complete');

  // Return cleanup function
  return () => {
    console.log('Cleaning up auto-refresh');
    clearInterval(intervalId);
  };
}

/**
 * Listen for storage events to sync session across tabs
 */
export function setupCrossTabSync(onSessionChange: (session: SessionState | null) => void): () => void {
  const handleStorageChange = (event: StorageEvent) => {
    // Only handle changes to our session keys
    if (!Object.values(STORAGE_KEYS).includes(event.key as any)) {
      return;
    }

    console.log('Session changed in another tab:', event.key);

    // If access token was removed, session is cleared
    if (event.key === STORAGE_KEYS.ACCESS_TOKEN && !event.newValue) {
      onSessionChange(null);
      return;
    }

    // Get updated session state
    const session = getSessionState();
    onSessionChange(session);
  };

  window.addEventListener('storage', handleStorageChange);

  console.log('Cross-tab sync setup complete');

  // Return cleanup function
  return () => {
    console.log('Cleaning up cross-tab sync');
    window.removeEventListener('storage', handleStorageChange);
  };
}

/**
 * Validate and refresh session if needed
 * Use this before making authenticated API calls
 */
export async function ensureValidSession(): Promise<string | null> {
  const session = getSessionState();

  if (!session) {
    console.log('No session found');
    return null;
  }

  // Check if token is expired
  if (isTokenExpired(session.expiresAt)) {
    console.log('Token expired, attempting refresh');
    const refreshedSession = await refreshTokenIfNeeded();
    
    if (!refreshedSession) {
      await handleSessionExpiry('token_expired');
      return null;
    }

    return refreshedSession.accessToken;
  }

  // Check if token needs refresh (expires soon)
  if (needsRefresh(session.expiresAt)) {
    console.log('Token expires soon, refreshing proactively');
    const refreshedSession = await refreshTokenIfNeeded();
    
    if (refreshedSession) {
      return refreshedSession.accessToken;
    }
    // If refresh fails, still return current token if it's not expired yet
  }

  return session.accessToken;
}
