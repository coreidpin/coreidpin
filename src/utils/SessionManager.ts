/**
 * SessionManager - Handles automatic token refresh for seamless authentication
 * 
 * Features:
 * - Automatic token refresh (5 minutes before expiry)
 * - Token rotation support (10% probability)
 * - localStorage persistence
 * - Singleton pattern
 * - Error handling with auto-logout
 * 
 * Week 4, Day 18
 */

interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}

export class SessionManager {
  private static instance: SessionManager;
  private session: Session | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private readonly REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes before expiry
  private readonly STORAGE_KEY = 'gidipin_session';

  private constructor() {
    // Private constructor for singleton
  }

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
   * Loads session from localStorage and schedules refresh
   */
  async init(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored) as Session;
        
        // Check if token is still valid
        if (session.expiresAt > Date.now()) {
          this.session = session;
          this.scheduleRefresh();
          console.log('✅ Session restored from storage');
        } else {
          console.log('⚠️ Stored session expired, clearing...');
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('❌ Failed to init session manager:', error);
      this.clearSession();
    }
  }

  /**
   * Set new session after login
   */
  async setSession(accessToken: string, refreshToken: string): Promise<void> {
    try {
      // Decode JWT to get payload
      const payload = this.decodeJWT(accessToken);
      
      if (!payload || !payload.exp || !payload.sub) {
        throw new Error('Invalid access token format');
      }

      this.session = {
        accessToken,
        refreshToken,
        expiresAt: payload.exp * 1000, // Convert to milliseconds
        userId: payload.sub,
      };

      // Persist to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.session));

      // Schedule auto-refresh
      this.scheduleRefresh();

      console.log('✅ Session established, auto-refresh scheduled');
      
      // Create session record in database
      await this.createSessionRecord();
    } catch (error) {
      console.error('❌ Failed to set session:', error);
      throw error;
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    if (!this.session) return null;
    
    // Check if token is expired
    if (this.session.expiresAt <= Date.now()) {
      console.warn('⚠️ Access token expired');
      return null;
    }
    
    return this.session.accessToken;
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.session?.userId || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.session !== null && this.session.expiresAt > Date.now();
  }

  /**
   * Clear session and logout
   */
  clearSession(): void {
    // Clear timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Clear session
    this.session = null;
    this.isRefreshing = false;

    // Clear localStorage
    localStorage.removeItem(this.STORAGE_KEY);

    console.log('✅ Session cleared');
  }

  /**
   * Schedule automatic token refresh
   * Refreshes 5 minutes before expiry
   */
  private scheduleRefresh(): void {
    if (!this.session) return;

    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const now = Date.now();
    const timeUntilRefresh = this.session.expiresAt - now - this.REFRESH_BUFFER_MS;

    if (timeUntilRefresh > 0) {
      console.log(`⏰ Token refresh scheduled in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes`);
      
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, timeUntilRefresh);
    } else {
      // Token is about to expire or already expired, refresh immediately
      console.log('⚠️ Token expiring soon, refreshing immediately...');
      this.refreshToken();
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshToken(): Promise<void> {
    if (!this.session) {
      console.error('❌ No session to refresh');
      return;
    }

    // Prevent concurrent refresh attempts
    if (this.isRefreshing) {
      console.log('⏳ Refresh already in progress...');
      return;
    }

    this.isRefreshing = true;

    try {
      console.log('🔄 Refreshing access token...');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.session.accessToken}`,
          },
          body: JSON.stringify({
            refresh_token: this.session.refreshToken,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Token refresh failed');
      }

      const data = await response.json();

      // Update session with new tokens
      await this.setSession(
        data.access_token,
        data.refresh_token || this.session.refreshToken // Use new refresh_token if rotated
      );

      console.log('✅ Token refreshed successfully');
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      
      // Clear session and redirect to login
      this.clearSession();
      
      // Emit event for app to handle
      window.dispatchEvent(new CustomEvent('session-expired'));
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login?reason=session-expired';
      }, 1000);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Create session record in database via Edge Function
   */
  private async createSessionRecord(): Promise<void> {
    if (!this.session) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-create-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.session.accessToken}`,
          },
          body: JSON.stringify({
            user_id: this.session.userId,
            refresh_token: this.session.refreshToken,
            device_info: this.getDevicei(),
            ip_address: null, // Will be captured server-side
          }),
        }
      );

      if (!response.ok) {
        console.warn('⚠️ Failed to create session record (non-critical)');
      } else {
        console.log('✅ Session record created in database');
      }
    } catch (error) {
      // Non-critical error, don't fail the session
      console.warn('⚠️ Failed to create session record:', error);
    }
  }

  /**
   * Decode JWT token payload
   */
  private decodeJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  }

  /**
   * Get basic device information
   */
  private getDeviceInfo(): string {
    return `${navigator.userAgent} | ${navigator.platform}`;
  }

  /**
   * Manual refresh (for testing or user-triggered refresh)
   */
  async manualRefresh(): Promise<void> {
    if (!this.session) {
      throw new Error('No active session');
    }
    await this.refreshToken();
  }

  /**
   * Destroy session manager (cleanup on unmount)
   */
  destroy(): void {
    this.clearSession();
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();
