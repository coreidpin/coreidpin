/**
 * Activity Tracking Utility
 * Tracks user actions for analytics and activity heatmap
 */

import { supabase } from './supabase/client';

export type ActivityType = 
  | 'login'
  | 'profile_update'
  | 'profile_view'
  | 'endorsement_received'
  | 'endorsement_given'
  | 'project_added'
  | 'project_updated'
  | 'verification_completed'
  | 'pin_generated'
  | 'pin_verified'
  | 'search_performed'
  | 'settings_updated'
  | 'export_data'
  | 'share_profile';

interface TrackActivityOptions {
  type: ActivityType;
  title?: string;
  metadata?: Record<string, any>;
}

/**
 * Track a user activity
 */
export async function trackActivity(options: TrackActivityOptions): Promise<void> {
  try {
    const { type, title, metadata = {} } = options;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Insert activity
    const { error } = await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: type,
        activity_title: title,
        metadata
      });

    if (error) {
      console.error('Error tracking activity:', error);
    }
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
}

/**
 * Track profile view
 */
export async function trackProfileView(profileUserId: string, viewerIp?: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('profile_views')
      .insert({
        profile_user_id: profileUserId,
        viewer_id: user?.id || null,
        viewer_ip: viewerIp
      });

    if (error) {
      console.error('Error tracking profile view:', error);
    }

    // Also track as user activity if logged in
    if (user) {
      await trackActivity({
        type: 'profile_view',
        title: 'Viewed a profile',
        metadata: { profile_user_id: profileUserId }
      });
    }
  } catch (error) {
    console.error('Error tracking profile view:', error);
  }
}

/**
 * Get activity summary for heatmap
 */
export async function getActivitySummary(
  userId: string,
  days: number = 365
): Promise<Array<{ date: string; count: number }>> {
  try {
    const { data, error} = await supabase
      .rpc('get_activity_summary', {
        p_user_id: userId,
        p_days: days
      });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      date: item.activity_date,
      count: parseInt(item.activity_count)
    }));
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    return [];
  }
}

/**
 * Get profile view count
 */
export async function getProfileViewCount(profileUserId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_user_id', profileUserId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching profile view count:', error);
    return 0;
  }
}

/**
 * Get profile view trend (change from previous period)
 */
export async function getProfileViewTrend(profileUserId: string, days: number = 30): Promise<number> {
  try {
    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000);

    // Current period
    const { count: currentCount } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_user_id', profileUserId)
      .gte('created_at', periodStart.toISOString());

    // Previous period
    const { count: previousCount } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_user_id', profileUserId)
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', periodStart.toISOString());

    const current = currentCount || 0;
    const previous = previousCount || 0;

    if (previous === 0) return current > 0 ? 100 : 0;

    const change = ((current - previous) / previous) * 100;
    return Math.round(change);
  } catch (error) {
    console.error('Error calculating profile view trend:', error);
    return 0;
  }
}

/**
 * Auto-track common events
 */
export const ActivityTracker = {
  // Track login
  login: () => trackActivity({ 
    type: 'login', 
    title: 'User logged in' 
  }),

  // Track profile update
  profileUpdate: (fields: string[]) => trackActivity({
    type: 'profile_update',
    title: 'Updated profile',
    metadata: { fields }
  }),

  // Track endorsement
  endorsementReceived: (endorserId: string) => trackActivity({
    type: 'endorsement_received',
    title: 'Received endorsement',
    metadata: { endorser_id: endorserId }
  }),

  endorsementGiven: (professionalId: string) => trackActivity({
    type: 'endorsement_given',
    title: 'Gave endorsement',
    metadata: { professional_id: professionalId }
  }),

  // Track project
  projectAdded: (projectTitle: string) => trackActivity({
    type: 'project_added',
    title: 'Added project',
    metadata: { project_title: projectTitle }
  }),

  projectUpdated: (projectId: string) => trackActivity({
    type: 'project_updated',
    title: 'Updated project',
    metadata: { project_id: projectId }
  }),

  // Track verification
  verificationCompleted: (verificationType: string) => trackActivity({
    type: 'verification_completed',
    title: 'Completed verification',
    metadata: { verification_type: verificationType }
  }),

  // Track PIN
  pinGenerated: () => trackActivity({
    type: 'pin_generated',
    title: 'Generated PIN'
  }),

  pinVerified: (pinCode: string) => trackActivity({
    type: 'pin_verified',
    title: 'Verified PIN',
    metadata: { pin_code: pinCode }
  }),

  // Track search
  search: (query: string, resultCount: number) => trackActivity({
    type: 'search_performed',
    title: 'Performed search',
    metadata: { query, result_count: resultCount }
  }),

  // Track settings
  settingsUpdated: (section: string) => trackActivity({
    type: 'settings_updated',
    title: 'Updated settings',
    metadata: { section }
  }),

  // Track export
  exportData: (format: string) => trackActivity({
    type: 'export_data',
    title: 'Exported data',
    metadata: { format }
  }),

  // Track share
  shareProfile: (platform: string) => trackActivity({
    type: 'share_profile',
    title: 'Shared profile',
    metadata: { platform }
  }),

  // Track endorsement requested
  endorsementRequested: (endorserName: string) => trackActivity({
    type: 'endorsement_received',
    title: 'Requested endorsement',
    metadata: { endorser_name: endorserName }
  }),

  // Track endorsement approved
  endorsementApproved: (endorserName: string) => trackActivity({
    type: 'endorsement_received',
    title: 'Approved endorsement',
    metadata: { endorser_name: endorserName }
  }),

  // Track endorsement rejected
  endorsementRejected: (endorserName: string) => trackActivity({
    type: 'endorsement_received',
    title: 'Rejected endorsement',
    metadata: { endorser_name: endorserName }
  }),

  // Track profile picture upload
  profilePictureUploaded: () => trackActivity({
    type: 'profile_update',
    title: 'Updated profile picture'
  }),

  // Track profile updated (alias for profileUpdate)
  profileUpdated: (fields: string[]) => trackActivity({
    type: 'profile_update',
    title: 'Updated profile',
    metadata: { fields }
  })
};
