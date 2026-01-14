/**
 * GitHub-Style Profile Features API
 * Phase 2: Backend utilities for enhanced profile features
 */

import { supabase } from '../../utils/supabase/client';

// =====================================================
// 1. Professional README Management
// =====================================================

export interface ProfessionalReadmeData {
  professional_summary?: string;
  headline?: string;
  specialties?: string[];
  current_focus?: string[];
  open_to?: string[];
}

export const updateProfessionalReadme = async (
  userId: string,
  data: ProfessionalReadmeData
) => {
  const { data: result, error } = await supabase
    .from('profiles')
    .update(data)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return result;
};

export const getProfessionalReadme = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('professional_summary, headline, specialties, current_focus, open_to')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

// =====================================================
// 2. Pinned Items Management
// =====================================================

export interface PinnedItem {
  item_type: 'work' | 'project';
  item_id: string;
  title: string;
  description: string;
  date_range: string;
  is_verified: boolean;
  pin_order: number;
}

export const getPinnedItems = async (userId: string): Promise<PinnedItem[]> => {
  const { data, error } = await supabase
    .rpc('get_pinned_items', { p_user_id: userId });

  if (error) throw error;
  return data || [];
};

export const pinWorkExperience = async (
  userId: string,
  experienceId: string,
  pinOrder: number
) => {
  // Check current pin count
  const { count } = await supabase
    .from('work_experiences')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_pinned', true);

  if (count && count >= 6) {
    throw new Error('Maximum 6 pinned items allowed');
  }

  const { data, error } = await supabase
    .from('work_experiences')
    .update({ is_pinned: true, pin_order: pinOrder })
    .eq('id', experienceId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const unpinWorkExperience = async (
  userId: string,
  experienceId: string
) => {
  const { data, error } = await supabase
    .from('work_experiences')
    .update({ is_pinned: false, pin_order: null })
    .eq('id', experienceId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// --- Project Pinning ---

export const pinProject = async (
  userId: string,
  projectId: string,
  pinOrder: number
) => {
  // Check current pin count
  const items = await getPinnedItems(userId);
  if (items.length >= 6) {
    throw new Error('Maximum 6 pinned items allowed');
  }

  const { data, error } = await supabase
    .from('professional_projects')
    .update({ is_pinned: true, pin_order: pinOrder })
    .eq('id', projectId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const unpinProject = async (
  userId: string,
  projectId: string
) => {
  const { data, error } = await supabase
    .from('professional_projects')
    .update({ is_pinned: false, pin_order: null })
    .eq('id', projectId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// --- Unified Toggle ---

export const toggleItemPin = async (
  itemId: string,
  type: 'work' | 'project',
  shouldPin: boolean
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (shouldPin) {
      // Get current max order
      const items = await getPinnedItems(user.id);
      const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.pin_order || 0)) : 0;
      
      if (type === 'work') {
        await pinWorkExperience(user.id, itemId, maxOrder + 1);
      } else {
        await pinProject(user.id, itemId, maxOrder + 1);
      }
    } else {
      if (type === 'work') {
        await unpinWorkExperience(user.id, itemId);
      } else {
        await unpinProject(user.id, itemId);
      }
    }
    return true;
  } catch (error) {
    console.error('Toggle pin error:', error);
    return false;
  }
};

export const reorderPinnedItems = async (
  userId: string,
  itemOrders: { id: string; order: number }[]

) => {
  // Update all items in parallel
  const updates = itemOrders.map(({ id, order }) =>
    supabase
      .from('work_experiences')
      .update({ pin_order: order })
      .eq('id', id)
      .eq('user_id', userId)
  );

  const results = await Promise.all(updates);
  const errors = results.filter(r => r.error);
  
  if (errors.length > 0) {
    throw new Error('Failed to reorder some items');
  }

  return true;
};

// =====================================================
// 3. Connections/Following System
// =====================================================

export interface Connection {
  id: string;
  follower_id: string;
  following_id: string;
  connected_at: string;
}

export const followUser = async (targetUserId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_connections')
    .insert({
      follower_id: user.id,
      following_id: targetUserId
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Already following this user');
    }
    throw error;
  }

  return data;
};

export const unfollowUser = async (targetUserId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('user_connections')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId);

  if (error) throw error;
  return true;
};

export const getFollowers = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_connections')
    .select(`
      follower_id,
      connected_at,
      profiles!user_connections_follower_id_fkey (
        user_id,
        full_name,
        profile_picture_url,
        role,
        city
      )
    `)
    .eq('following_id', userId)
    .order('connected_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getFollowing = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_connections')
    .select(`
      following_id,
      connected_at,
      profiles!user_connections_following_id_fkey (
        user_id,
        full_name,
        profile_picture_url,
        role,
        city
      )
    `)
    .eq('follower_id', userId)
    .order('connected_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const isFollowing = async (targetUserId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('user_connections')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single();

  return !!data && !error;
};

export const getConnectionStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('followers_count, following_count, endorsements_count')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

// =====================================================
// 4. Achievements System
// =====================================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: any;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement extends Achievement {
  earned_at: string;
  metadata?: any;
}

export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      earned_at,
      metadata,
      achievements (
        id,
        name,
        description,
        icon,
        criteria,
        rarity
      )
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(item => ({
    ...(item.achievements as Achievement),
    earned_at: item.earned_at,
    metadata: item.metadata
  }));
};

export const getAllAchievements = async (): Promise<Achievement[]> => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('rarity', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const checkAndUnlockAchievements = async (userId: string) => {
  // Get user's current state
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!profile) return [];

  // Get work experiences count
  const { count: workCount } = await supabase
    .from('work_experiences')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get activity count for this year
  const { count: activityCount } = await supabase
    .from('profile_analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', new Date(new Date().getFullYear(), 0, 1).toISOString());

  // Get all achievements
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*');

  // Get already earned achievements
  const { data: earnedAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const earnedIds = new Set(earnedAchievements?.map(a => a.achievement_id) || []);
  const newlyUnlocked: Achievement[] = [];

  // Check each achievement
  for (const achievement of allAchievements || []) {
    if (earnedIds.has(achievement.id)) continue;

    const criteria = achievement.criteria;
    let unlocked = false;

    // Check criteria
    if (criteria.email_verified && criteria.work_experiences) {
      unlocked = profile.email_verified && (workCount || 0) >= criteria.work_experiences;
    } else if (criteria.profile_completion) {
      // Calculate completion percentage
      const fields = ['full_name', 'bio', 'role', 'city', 'industry'];
      const filled = fields.filter(f => profile[f]).length;
      const completion = (filled / fields.length) * 100;
      unlocked = completion >= criteria.profile_completion;
    } else if (criteria.endorsements) {
      unlocked = (profile.endorsements_count || 0) >= criteria.endorsements;
    } else if (criteria.yearly_activities) {
      unlocked = (activityCount || 0) >= criteria.yearly_activities;
    } else if (criteria.followers) {
      unlocked = (profile.followers_count || 0) >= criteria.followers;
    } else if (criteria.verifications) {
      unlocked = (workCount || 0) >= criteria.verifications;
    }

    if (unlocked) {
      // Award achievement
      await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
          metadata: { auto_unlocked: true }
        });

      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
};

// =====================================================
// 5. Enhanced Activity Tracking
// =====================================================

export interface ActivityDay {
  date: string;
  count: number;
  types: {
    verification: number;
    engagement: number;
    content: number;
    achievement: number;
  };
}

export const getActivityTimeline = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ActivityDay[]> => {
  const start = startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const end = endDate || new Date();

  const { data, error } = await supabase
    .from('profile_analytics_events')
    .select('created_at, event_category')
    .eq('user_id', userId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Group by day
  const dayMap = new Map<string, ActivityDay>();

  (data || []).forEach(event => {
    const date = new Date(event.created_at).toISOString().split('T')[0];
    
    if (!dayMap.has(date)) {
      dayMap.set(date, {
        date,
        count: 0,
        types: { verification: 0, engagement: 0, content: 0, achievement: 0 }
      });
    }

    const day = dayMap.get(date)!;
    day.count++;
    
    if (event.event_category) {
      day.types[event.event_category as keyof typeof day.types]++;
    }
  });

  return Array.from(dayMap.values()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

export const trackActivity = async (
  userId: string,
  eventType: string,
  eventCategory: 'verification' | 'engagement' | 'content' | 'achievement',
  metadata?: any
) => {
  const { error } = await supabase
    .from('profile_analytics_events')
    .insert({
      user_id: userId,
      event_type: eventType,
      event_category: eventCategory,
      metadata
    });

  if (error) throw error;

  // Check for achievement unlocks after activity
  await checkAndUnlockAchievements(userId);
};
