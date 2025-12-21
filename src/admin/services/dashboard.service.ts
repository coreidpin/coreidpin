import { BaseAPIClient } from './api';

export interface DashboardStats {
  totalUsers: number;
  activeProfessionals: number;
  dailySignups: number; // New user signups in last 24h
  emailVerificationRate: number; // Placeholder or calculate if possible
  pinActivationRate: number; // Placeholder or calculate if possible
  apiIntegrations: number; // Placeholder or count API keys
  activePartners: number;
  endorsementActivity: number; // Endorsements this month
}

export interface RecentActivityItem {
  id: string;
  action: string;
  user: string; // Email or name
  time: string; // ISO string
  type: 'user' | 'security' | 'api' | 'endorsement';
}

export interface SystemHealthData {
  apiStatus: 'Operational' | 'Degraded' | 'Down';
  dbStatus: 'Healthy' | 'Issue' | 'Down';
  latency: number; // ms
  uptime: number; // percentage (hardcoded/mocked for now)
}

export class DashboardService extends BaseAPIClient {
  /**
   * Get overall dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // 1. Total Users
      const { count: totalUsers } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 2. Active Professionals (identity_type = 'professional')
      const { count: activeProfessionals } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('identity_type', 'professional')
        .eq('is_suspended', false);

      // 3. activePartners (identity_type = 'employer' or 'business')
      // Note: check logic in users.service.ts. It implies 'employer'.
      const { count: activePartners } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('identity_type', 'employer');

      // 4. Daily Signups (created_at > 24h ago)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: dailySignups } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo);

      // 5. Endorsement Activity (Use 'endorsements' table)
      // Count for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { count: endorsementActivity } = await this.supabase
        .from('endorsements')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // 6. API Integrations (Count api_keys)
      const { count: apiIntegrations } = await this.supabase
        .from('api_keys')
        .select('*', { count: 'exact', head: true });

      // 7. PIN Activation Rate
      // Count distinct users who have a PIN set in professional_pins
      const { count: pinCount } = await this.supabase
        .from('professional_pins')
        .select('*', { count: 'exact', head: true });
      
      const pinActivationRate = totalUsers && totalUsers > 0 
        ? ((pinCount || 0) / totalUsers) * 100 
        : 0;

      // 8. Email Verification Rate
      // We calculate this by checking the ratio of verified profiles (professionals/employers/business) to total users.
      // Standard users effectively have verified emails if they've reached these stages.
      const { count: verifiedProfiles } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('identity_type', ['professional', 'employer', 'business']);

      const emailVerificationRate = totalUsers && totalUsers > 0
        ? ((verifiedProfiles || 0) / totalUsers) * 100
        : 0;

      return {
        totalUsers: totalUsers || 0,
        activeProfessionals: activeProfessionals || 0,
        dailySignups: dailySignups || 0,
        activePartners: activePartners || 0,
        endorsementActivity: endorsementActivity || 0,
        emailVerificationRate: parseFloat(emailVerificationRate.toFixed(1)),
        pinActivationRate: parseFloat(pinActivationRate.toFixed(1)),
        apiIntegrations: apiIntegrations || 0
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Return zeroes on error to prevent crash
      return {
        totalUsers: 0,
        activeProfessionals: 0,
        dailySignups: 0,
        emailVerificationRate: 0,
        pinActivationRate: 0,
        apiIntegrations: 0,
        activePartners: 0,
        endorsementActivity: 0
      };
    }
  }

  /**
   * Get unified recent activity feed
   */
  async getRecentActivity(): Promise<RecentActivityItem[]> {
    try {
      // Fetch recent audit events (registrations, OTPs, etc.)
      const { data: auditEvents } = await this.supabase
        .from('audit_events')
        .select('id, event_type, user_id, meta, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent endorsements
      const { data: endorsements } = await this.supabase
        .from('endorsements')
        .select('id, skill_name, created_at') 
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: RecentActivityItem[] = [];

      // Map audit events
      if (auditEvents) {
        auditEvents.forEach((event: any) => {
          let userLabel = 'Visitor';
          if (event.user_id) userLabel = 'Registered User';
          if (event.meta?.phone_hash) userLabel = `Ph: ...${event.meta.phone_hash.slice(-4)}`;

          activities.push({
            id: event.id,
            action: this.formatAuditEvent(event.event_type, event.meta),
            user: userLabel,
            time: event.created_at,
            type: this.getEventType(event.event_type)
          });
        });
      }

      // Map endorsements
      if (endorsements) {
        endorsements.forEach((end: any) => {
          activities.push({
            id: end.id,
            action: `Endorsement created: ${end.skill_name}`,
            user: 'Professional',
            time: end.created_at,
            type: 'endorsement'
          });
        });
      }

      // Sort combined list by time desc and take top 10
      return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      return [];
    }
  }

  private formatAuditEvent(eventType: string, meta: any): string {
    switch (eventType) {
      case 'registration_started': return 'New registration started';
      case 'registration_finalized': return 'User registration completed';
      case 'otp_sent': return 'OTP code sent';
      case 'otp_verified': return 'OTP verified successfully';
      case 'pin_issued': return 'New security PIN set';
      case 'welcome_email_sent': return 'Welcome email sent';
      case 'email_verified': return 'Email address verified';
      default: return eventType.replace(/_/g, ' ');
    }
  }

  private getEventType(eventType: string): 'user' | 'security' | 'api' | 'endorsement' {
    if (eventType.includes('otp') || eventType.includes('pin')) return 'security';
    if (eventType.includes('registration') || eventType.includes('email')) return 'user';
    return 'api';
  }

  /**
   * Check system health (ping DB)
   */
  async getSystemHealth(): Promise<SystemHealthData> {
    const start = performance.now();
    try {
      // Ping database (lightweight HEAD request)
      const { error } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      const end = performance.now();
      const latency = Math.round(end - start);

      if (error) throw error;

      return {
        apiStatus: 'Operational',
        dbStatus: 'Healthy',
        latency,
        uptime: 100 
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        apiStatus: 'Degraded',
        dbStatus: 'Issue',
        latency: 0,
        uptime: 0
      };
    }
  }

  private formatAuthAction(eventType: string): string {
    switch (eventType) {
      case 'login': return 'User logged in';
      case 'logout': return 'User logged out';
      case 'failed_login': return 'Failed login attempt';
      default: return eventType.replace('_', ' ');
    }
  }
}

export const dashboardService = new DashboardService();
