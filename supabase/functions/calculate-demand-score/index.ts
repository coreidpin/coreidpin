import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemandMetrics {
  profileViews: number;
  viewGrowth: number;
  saves: number;
  contactRequests: number;
  matchingJobs: number;
}

/**
 * Calculate demand score using weighted algorithm
 * Returns a score between 0.0 and 10.0
 */
function calculateDemandScore(metrics: DemandMetrics): number {
  // Normalize each metric to 0-1 scale
  const viewScore = Math.min(metrics.profileViews / 100, 1);
  const growthScore = Math.min(Math.max(metrics.viewGrowth / 50, 0), 1);
  const saveScore = Math.min(metrics.saves / 20, 1);
  const contactScore = Math.min(metrics.contactRequests / 10, 1);
  const jobScore = Math.min(metrics.matchingJobs / 50, 1);
  
  // Weighted average (totals to 100%)
  const score = (
    viewScore * 0.30 +      // 30% weight on views
    saveScore * 0.25 +      // 25% weight on saves
    contactScore * 0.20 +   // 20% weight on contacts
    growthScore * 0.15 +    // 15% weight on growth
    jobScore * 0.10         // 10% weight on job matches
  ) * 10;
  
  return Math.min(10, Math.max(0, Number(score.toFixed(1))));
}

/**
 * Calculate percentile rank for a score
 */
function calculatePercentile(score: number, allScores: number[]): number {
  if (allScores.length === 0) return 50;
  
  const sorted = [...allScores].sort((a, b) => a - b);
  const rank = sorted.filter(s => s < score).length;
  return Math.round((rank / sorted.length) * 100);
}

/**
 * Get analytics metrics for a user in the last 30 days
 */
async function getAnalyticsMetrics(supabase: any, userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // Get events from last 30 days
  const { data: recentEvents, error: recentError } = await supabase
    .from('profile_analytics_events')
    .select('event_type')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (recentError) {
    console.error('Error fetching recent events:', recentError);
    return null;
  }

  // Get events from 30-60 days ago for growth calculation
  const { data: previousEvents, error: previousError } = await supabase
    .from('profile_analytics_events')
    .select('event_type')
    .eq('user_id', userId)
    .gte('created_at', sixtyDaysAgo.toISOString())
    .lt('created_at', thirtyDaysAgo.toISOString());

  if (previousError) {
    console.error('Error fetching previous events:', previousError);
  }

  const recentViews = recentEvents?.filter(e => e.event_type === 'view').length || 0;
  const previousViews = previousEvents?.filter(e => e.event_type === 'view').length || 0;
  
  // Calculate growth percentage
  const viewGrowth = previousViews > 0 
    ? ((recentViews - previousViews) / previousViews) * 100 
    : 0;

  return {
    profileViews: recentViews,
    viewGrowth: Number(viewGrowth.toFixed(2)),
    saves: recentEvents?.filter(e => e.event_type === 'save').length || 0,
    contactRequests: recentEvents?.filter(e => e.event_type === 'contact_request').length || 0,
  };
}

/**
 * Count matching jobs for a user's profile
 */
async function countMatchingJobs(supabase: any, userId: string): Promise<number> {
  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('skills, city, years_of_experience')
    .eq('user_id', userId)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching profile:', profileError);
    return 0;
  }

  const userSkills = profile.skills || [];
  if (userSkills.length === 0) return 0;

  // Count active jobs that match user's skills and location
  const { count, error: jobError } = await supabase
    .from('job_postings')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('location', profile.city || '')
    .overlaps('skills_required', userSkills);

  if (jobError) {
    console.error('Error counting jobs:', jobError);
    return 0;
  }

  return count || 0;
}

/**
 * Calculate and store demand score for a user
 */
async function calculateUserDemandScore(supabase: any, userId: string) {
  console.log(`Calculating demand score for user: ${userId}`);

  // Get analytics metrics
  const analyticsMetrics = await getAnalyticsMetrics(supabase, userId);
  if (!analyticsMetrics) {
    throw new Error('Failed to fetch analytics metrics');
  }

  // Get matching jobs count
  const matchingJobs = await countMatchingJobs(supabase, userId);

  // Calculate demand score
  const metrics: DemandMetrics = {
    ...analyticsMetrics,
    matchingJobs,
  };

  const demandScore = calculateDemandScore(metrics);

  // Get all scores for percentile calculation
  const { data: allMetrics } = await supabase
    .from('pin_demand_metrics')
    .select('demand_score');

  const allScores = allMetrics?.map((m: any) => m.demand_score) || [];
  const percentileRank = calculatePercentile(demandScore, allScores);

  // Upsert demand metrics
  const { error: upsertError } = await supabase
    .from('pin_demand_metrics')
    .upsert({
      user_id: userId,
      demand_score: demandScore,
      percentile_rank: percentileRank,
      profile_views_30d: analyticsMetrics.profileViews,
      profile_views_growth: analyticsMetrics.viewGrowth,
      profile_saves: analyticsMetrics.saves,
      contact_requests_30d: analyticsMetrics.contactRequests,
      matching_jobs_count: matchingJobs,
      last_calculated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });

  if (upsertError) {
    console.error('Error upserting demand metrics:', upsertError);
    throw upsertError;
  }

  console.log(`Demand score calculated: ${demandScore} (${percentileRank}th percentile)`);

  return {
    userId,
    demandScore,
    percentileRank,
    metrics,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { userId, batchMode } = await req.json();

    if (batchMode) {
      // Batch mode: calculate for all users
      console.log('Running batch calculation for all users...');

      const { data: profiles } = await supabaseClient
        .from('profiles')
        .select('user_id')
        .limit(1000); // Process in batches of 1000

      if (!profiles || profiles.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No profiles found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      const results = [];
      for (const profile of profiles) {
        try {
          const result = await calculateUserDemandScore(supabaseClient, profile.user_id);
          results.push(result);
        } catch (error) {
          console.error(`Error calculating for user ${profile.user_id}:`, error);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: results.length,
          results: results.slice(0, 10) // Return first 10 for verification
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (userId) {
      // Single user mode
      const result = await calculateUserDemandScore(supabaseClient, userId);

      return new Response(
        JSON.stringify({ success: true, data: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'userId or batchMode required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in calculate-demand-score function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
