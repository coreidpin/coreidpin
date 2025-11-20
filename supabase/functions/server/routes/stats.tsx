import { Hono } from "npm:hono";
import { getSupabaseClient, getAuthUser } from "../lib/supabaseClient.tsx";

const stats = new Hono();

// Get dashboard stats overview
stats.get("/dashboard", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = getSupabaseClient();

    // Get user's PIN ID first
    const { data: pinData } = await supabase
      .from('professional_pins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const pinId = pinData?.id;

    // Profile Views - count from profile_shares table
    const { count: profileViewsCount } = await supabase
      .from('profile_shares')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // PIN Usage - count views from pin_analytics
    const { count: pinUsageCount } = pinId ? await supabase
      .from('pin_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('pin_id', pinId)
      .eq('event_type', 'view') : { count: 0 };

    // Verifications - could be from PIN verifications or profile verification status
    // For now, use verification_status from professional_pins
    const { data: pinVerification } = pinId ? await supabase
      .from('professional_pins')
      .select('verification_status')
      .eq('id', pinId)
      .single() : { data: null };

    const verifications = pinVerification?.verification_status === 'verified' ? 1 : 0;

    // Projects - count from professional_projects table
    const { count: projectsCount } = await supabase
      .from('professional_projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Endorsements - count accepted endorsements from professional_endorsements table
    const { count: endorsementsCount } = await supabase
      .from('professional_endorsements')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', user.id)
      .eq('status', 'accepted');

    // Profile Views - count from profile_views table (prefer this over profile_shares)
    const { count: viewsCount } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_user_id', user.id);

    // Use profile_views if available, otherwise fall back to profile_shares
    const profileViews = viewsCount !== null ? viewsCount : (profileViewsCount || 0);

    // API Calls - count from api_usage_logs table
    const { count: apiCallsCount } = await supabase
      .from('api_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Countries - placeholder until IP geolocation tracking is implemented
    const countries = 0;

    // Companies - placeholder until verification source tracking is implemented
    const companies = 0;

    return c.json({
      success: true,
      stats: {
        profileViews,
        pinUsage: pinUsageCount || 0,
        verifications,
        apiCalls: apiCallsCount || 0,
        countries,
        companies,
        projects: projectsCount || 0,
        endorsements: endorsementsCount || 0
      }
    });
  } catch (error: any) {
    console.error("Get dashboard stats error:", error);
    return c.json({ error: `Failed to get stats: ${error.message}` }, 500);
  }
});

// Get PIN analytics summary
stats.get("/pin-analytics", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = getSupabaseClient();

    // Get user's PIN ID
    const { data: pinData } = await supabase
      .from('professional_pins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!pinData?.id) {
      return c.json({
        success: true,
        analytics: {
          totalViews: 0,
          totalShares: 0,
          totalCopies: 0,
          viewsLast7Days: 0,
          viewsLast30Days: 0,
          uniqueViewers: 0,
          chartData: []
        }
      });
    }

    const pinId = pinData.id;

    // Use the existing get_pin_analytics_summary function
    const { data: analyticsSummary, error: analyticsError } = await supabase
      .rpc('get_pin_analytics_summary', { p_pin_id: pinId });

    if (analyticsError) {
      console.error("Analytics RPC error:", analyticsError);
      // Return zeros if function fails
      return c.json({
        success: true,
        analytics: {
          totalViews: 0,
          totalShares: 0,
          totalCopies: 0,
          viewsLast7Days: 0,
          viewsLast30Days: 0,
          uniqueViewers: 0,
          chartData: []
        }
      });
    }

    // Get chart data for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: chartDataRaw } = await supabase
      .from('pin_analytics')
      .select('created_at, event_type')
      .eq('pin_id', pinId)
      .eq('event_type', 'view')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group by day for chart
    const chartDataMap = new Map<number, number>();
    chartDataRaw?.forEach((event: any) => {
      const date = new Date(event.created_at);
      const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      const day = 30 - daysDiff;
      chartDataMap.set(day, (chartDataMap.get(day) || 0) + 1);
    });

    const chartData = Array.from({ length: 6 }, (_, i) => {
      const day = i === 0 ? 1 : (i === 1 ? 7 : (i === 2 ? 14 : (i === 3 ? 21 : (i === 4 ? 28 : 30))));
      const actions = chartDataMap.get(day) || 0;
      return { day, actions };
    });

    const summary = analyticsSummary?.[0] || {
      total_views: 0,
      total_shares: 0,
      total_copies: 0,
      views_last_7_days: 0,
      views_last_30_days: 0,
      unique_viewers: 0
    };

    return c.json({
      success: true,
      analytics: {
        totalViews: Number(summary.total_views || 0),
        totalShares: Number(summary.total_shares || 0),
        totalCopies: Number(summary.total_copies || 0),
        viewsLast7Days: Number(summary.views_last_7_days || 0),
        viewsLast30Days: Number(summary.views_last_30_days || 0),
        uniqueViewers: Number(summary.unique_viewers || 0),
        chartData
      }
    });
  } catch (error: any) {
    console.error("Get PIN analytics error:", error);
    return c.json({ error: `Failed to get analytics: ${error.message}` }, 500);
  }
});

// Get recent activity feed
stats.get("/activity", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    if (!user?.id || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = getSupabaseClient();

    // Get user's PIN ID
    const { data: pinData } = await supabase
      .from('professional_pins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const activities: any[] = [];

    // Get recent profile shares
    const { data: shares } = await supabase
      .from('profile_shares')
      .select('*')
      .eq('user_id', user.id)
      .order('shared_at', { ascending: false })
      .limit(5);

    shares?.forEach((share: any) => {
      activities.push({
        type: 'share',
        text: `Profile shared via ${share.shared_via}`,
        timestamp: share.shared_at,
        icon: 'share'
      });
    });

    // Get recent PIN analytics events if PIN exists
    if (pinData?.id) {
      const { data: pinEvents } = await supabase
        .from('pin_analytics')
        .select('*')
        .eq('pin_id', pinData.id)
        .order('created_at', { ascending: false })
        .limit(5);

      pinEvents?.forEach((event: any) => {
        const eventTexts: Record<string, string> = {
          view: 'PIN was viewed',
          share: 'PIN was shared',
          copy: 'PIN was copied',
          download: 'PIN was downloaded'
        };
        
        activities.push({
          type: event.event_type,
          text: eventTexts[event.event_type] || 'PIN activity',
          timestamp: event.created_at,
          icon: event.event_type === 'view' ? 'eye' : event.event_type
        });
      });
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Return top 10 most recent
    const recentActivities = activities.slice(0, 10);

    return c.json({
      success: true,
      activities: recentActivities
    });
  } catch (error: any) {
    console.error("Get activity feed error:", error);
    return c.json({ error: `Failed to get activity: ${error.message}` }, 500);
  }
});

export { stats };
