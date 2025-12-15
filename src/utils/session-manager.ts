import { supabase } from './supabase/client';
import { toast } from 'sonner';

/**
 * SessionManager - Handles token refresh and session management
 * Singleton pattern ensures only one instance across the app
 */
export class SessionManager {
  private static instance: SessionManager;
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Initialize session manager
   * Call this once on app startup
   */
  async init(): Promise<boolean> {
    console.log('🔐 Initializing SessionManager...');
    
    // Check if we have valid tokens
    const hasTokens = this.hasValidTokens();
    
    if (!hasTokens) {
      console.log('⚠️ No valid tokens found');
      return false;
    }

    // Sync existing tokens with Supabase auth (for RLS)
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken && refreshToken) {
      await this.syncSupabaseSession(accessToken, refreshToken);
    }

    // Check and refresh if needed
    const refreshed = await this.checkAndRefreshToken();
    
    if (refreshed) {
      // Setup auto-refresh timer
      this.setupAutoRefresh();
      console.log('✅ Session initialized successfully');
      return true;
    } else {
      console.log('❌ Session initialization failed');
      return false;
    }
  }

  /**
   * Check if user has tokens in localStorage
   */
  private hasValidTokens(): boolean {
    const userId = localStorage.getItem('userId');
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const expiresAt = localStorage.getItem('expiresAt');

    return !!(userId && accessToken && refreshToken && expiresAt);
  }

  /**
   * Check token expiry and refresh if needed
   */
  private async checkAndRefreshToken(): Promise<boolean> {
    const expiresAt = localStorage.getItem('expiresAt');
    if (!expiresAt) return false;

    const expiresAtMs = parseInt(expiresAt);
    const now = Date.now();
    const timeUntilExpiry = expiresAtMs - now;

    // Refresh if expiring in next 5 minutes
    if (timeUntilExpiry < 5 * 60 * 1000) {
      console.log('🔄 Token expiring soon, refreshing...');
      return await this.refreshToken();
    }

    // Token still valid
    const minutesRemaining = Math.floor(timeUntilExpiry / 1000 / 60);
    console.log(`✅ Token valid for ${minutesRemaining} more minutes`);
    return true;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<boolean> {
    // Prevent concurrent refreshes
    if (this.isRefreshing) {
      console.log('⏳ Refresh already in progress...');
      return false;
    }

    this.isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      console.log('🔄 Refreshing token...');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/auth-refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({ refreshToken })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Token refresh failed');
      }

      const data = await response.json();
      
      // Update localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('expiresAt', data.expiresAt.toString());
      localStorage.setItem('userId', data.userId);

      // Sync with Supabase client
      await this.syncSupabaseSession(data.accessToken, data.refreshToken);

      console.log('✅ Token refreshed successfully');
      return true;

    } catch (error: any) {
      console.error('❌ Token refresh failed:', error);
      
      // Check if refresh token expired
      if (error.message?.includes('expired') || error.message?.includes('Invalid')) {
        this.handleRefreshFailure();
      }
      
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Sync tokens with Supabase client
   */
  private async syncSupabaseSession(accessToken: string, refreshToken: string) {
    try {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) {
        console.warn('⚠️ Supabase session sync warning:', error.message);
        // Don't fail - custom auth might not work with Supabase session
      } else {
        console.log('✅ Supabase session synced');
      }
    } catch (err) {
      console.warn('⚠️ Failed to sync Supabase session:', err);
    }
  }

  /**
   * Setup automatic token refresh
   * Checks every minute
   */
  private setupAutoRefresh() {
    // Clear any existing timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    // Check every minute
    this.refreshTimer = setInterval(async () => {
      await this.checkAndRefreshToken();
    }, 60 * 1000);

    console.log('⏰ Auto-refresh timer set up (checks every 60s)');
  }

  /**
   * Handle refresh failure (likely token expired)
   */
  private handleRefreshFailure() {
    console.log('❌ Session expired, logging out...');
    
    // Clear all session data
    this.clearSession();

    // Show user-friendly message
    toast.error('Your session has expired. Please log in again.', {
      duration: 5000
    });

    // Redirect to login after short delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  }

  /**
   * Clear session data
   */
  clearSession() {
    localStorage.removeItem('userId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresAt');

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    console.log('🗑️ Session cleared');
  }

  /**
   * Manually logout
   */
  async logout() {
    console.log('🚪 Logging out...');
    
    // Could call logout endpoint here to invalidate session on server
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        // Mark session as inactive in database
        await fetch(
          `${supabaseUrl}/functions/v1/auth-logout`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({ refreshToken })
          }
        );
      } catch (error) {
        console.error('Error calling logout endpoint:', error);
        // Continue with local logout even if server call fails
      }
    }

    this.clearSession();
    window.location.href = '/login';
  }

  /**
   * Get current session info
   */
  getSessionInfo() {
    const expiresAt = localStorage.getItem('expiresAt');
    if (!expiresAt) return null;

    const expiresAtMs = parseInt(expiresAt);
    const now = Date.now();
    const timeUntilExpiry = expiresAtMs - now;

    return {
      userId: localStorage.getItem('userId'),
      expiresAt: expiresAtMs,
      expiresIn: timeUntilExpiry,
      expiresInMinutes: Math.floor(timeUntilExpiry / 1000 / 60),
      isExpired: timeUntilExpiry <= 0
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const sessionInfo = this.getSessionInfo();
    return !!(sessionInfo && !sessionInfo.isExpired);
  }

  /**
   * Destroy session manager
   * Call this on app unmount/cleanup
   */
  destroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    console.log('🔒 SessionManager destroyed');
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();
