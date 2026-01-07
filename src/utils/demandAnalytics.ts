import { supabase } from './supabase/client';

/**
 * Dynamic PIN Market Value - Analytics Tracking
 * Tracks profile engagement events for demand score calculation
 */

export type EventType = 'view' | 'save' | 'contact_request' | 'share';
export type ViewerType = 'employer' | 'professional' | 'anonymous';

interface AnalyticsEvent {
  user_id: string;
  event_type: EventType;
  viewer_type?: ViewerType;
  viewer_id?: string;
}

/**
 * Track when a profile is viewed
 * @param profileUserId - The user_id of the profile being viewed
 * @param viewerType - Type of viewer (employer, professional, or anonymous)
 * @param viewerId - Optional user_id of the viewer if logged in
 */
export async function trackProfileView(
  profileUserId: string,
  viewerType: ViewerType = 'anonymous',
  viewerId?: string
): Promise<void> {
  try {
    const { error } = await (supabase
      .from('profile_analytics_events')
      .insert({
        user_id: profileUserId,
        event_type: 'view',
        viewer_type: viewerType,
        viewer_id: viewerId
      } as any) as any);

    if (error) {
      console.error('Failed to track profile view:', error);
    }
  } catch (error) {
    console.error('Error tracking profile view:', error);
  }
}

/**
 * Track when an employer saves a profile
 * @param profileUserId - The user_id of the profile being saved
 * @param employerId - The user_id of the employer saving the profile
 */
export async function trackProfileSave(
  profileUserId: string,
  employerId: string
): Promise<void> {
  try {
    const { error } = await (supabase
      .from('profile_analytics_events')
      .insert({
        user_id: profileUserId,
        event_type: 'save',
        viewer_type: 'employer',
        viewer_id: employerId
      } as any) as any);

    if (error) {
      console.error('Failed to track profile save:', error);
    }
  } catch (error) {
    console.error('Error tracking profile save:', error);
  }
}

/**
 * Track when someone requests to contact a professional
 * @ profileUserId - The user_id of the profile being contacted
 * @param contacterId - The user_id of the person making the request
 * @param contacterType - Type of person making contact
 */
export async function trackContactRequest(
  profileUserId: string,
  contacterId: string,
  contacterType: ViewerType = 'employer'
): Promise<void> {
  try {
    const { error } = await (supabase
      .from('profile_analytics_events')
      .insert({
        user_id: profileUserId,
        event_type: 'contact_request',
        viewer_type: contacterType,
        viewer_id: contacterId
      } as any) as any);

    if (error) {
      console.error('Failed to track contact request:', error);
    }
  } catch (error) {
    console.error('Error tracking contact request:', error);
  }
}

/**
 * Track when a profile is shared
 * @param profileUserId - The user_id of the profile being shared
 * @param sharerId - Optional user_id of the person sharing
 */
export async function trackProfileShare(
  profileUserId: string,
  sharerId?: string
): Promise<void> {
  try {
    const { error } = await (supabase
      .from('profile_analytics_events')
      .insert({
        user_id: profileUserId,
        event_type: 'share',
        viewer_type: sharerId ? 'professional' : 'anonymous',
        viewer_id: sharerId
      } as any) as any);

    if (error) {
      console.error('Failed to track profile share:', error);
    }
  } catch (error) {
    console.error('Error tracking profile share:', error);
  }
}

/**
 * Get analytics summary for a user
 * @param userId - The user_id to get analytics for
 * @param days - Number of days to look back (default: 30)
 */
export async function getAnalyticsSummary(
  userId: string,
  days: number = 30
): Promise<{
  views: number;
  saves: number;
  contacts: number;
  shares: number;
} | null> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await (supabase
      .from('profile_analytics_events')
      .select('event_type')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString()) as any);

    if (error) {
      console.error('Failed to fetch analytics summary:', error);
      return null;
    }

    const summary = {
      views: ((data || []) as any[]).filter(e => e.event_type === 'view').length,
      saves: ((data || []) as any[]).filter(e => e.event_type === 'save').length,
      contacts: ((data || []) as any[]).filter(e => e.event_type === 'contact_request').length,
      shares: ((data || []) as any[]).filter(e => e.event_type === 'share').length
    };

    return summary;
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    return null;
  }
}

/**
 * Get demand metrics (score and percentile) for a user
 */
export async function getDemandMetrics(userId: string) {
  try {
    const { data, error } = await supabase
      .from('pin_demand_metrics')
      .select('demand_score, percentile_rank')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // Ignore "no rows found"
        console.error('Failed to fetch demand metrics:', error);
      }
      return null;
    }

    return {
      demandScore: Number(data?.demand_score || 0),
      percentileRank: (data as any)?.percentile_rank || 0
    };
  } catch (error) {
    console.error('Error getting demand metrics:', error);
    return null;
  }
}

/**
 * Get recent geographic pings for a user
 */
export async function getGeographicPings(userId: string, limit: number = 5) {
  try {
    const { data, error } = await (supabase.rpc('get_recent_geographic_pings', {
      p_user_id: userId,
      p_limit: limit
    } as any) as any);

    if (error) {
      console.error('Failed to fetch geo pings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting geo pings:', error);
    return [];
  }
}

/**
 * Get industry trends for a user
 */
export async function getIndustryTrends(userId: string) {
  try {
    const { data, error } = await (supabase.rpc('get_industry_trends', {
      p_user_id: userId
    } as any) as any);

    if (error) {
      console.error('Failed to fetch industry trends:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting industry trends:', error);
    return [];
  }
}
