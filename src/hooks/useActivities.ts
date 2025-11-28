import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { Activity } from '../utils/activityTracker';

export function useActivities(limit: number = 10) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;
      setActivities(data || []);
    } catch (err: any) {
      console.error('Failed to fetch activities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error: countError } = await supabase
        .from('user_activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (countError) throw countError;
      setUnreadCount(count || 0);
    } catch (err: any) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  const markAsRead = useCallback(async (activityId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('user_activities')
        .update({ read: true })
        .eq('id', activityId);

      if (updateError) throw updateError;

      // Update local state
      setActivities(prev => 
        prev.map(a => a.id === activityId ? { ...a, read: true } : a)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Failed to mark activity as read:', err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: updateError } = await supabase
        .from('user_activities')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (updateError) throw updateError;

      // Update local state
      setActivities(prev => prev.map(a => ({ ...a, read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Failed to mark all as read:', err);
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([fetchActivities(), fetchUnreadCount()]);
  }, [fetchActivities, fetchUnreadCount]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Set up realtime subscription
  useEffect(() => {
    let channel: any = null;

    const setupSubscription = async () => {
      try {
        const { data: { user: userData } } = await supabase.auth.getUser();
        
        if (!userData) return;

        channel = supabase
          .channel('user_activities')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'user_activities',
              filter: `user_id=eq.${userData.id}`
            },
            (payload) => {
              console.log('New activity:', payload);
              setActivities(prev => [payload.new as Activity, ...prev].slice(0, limit));
              setUnreadCount(prev => prev + 1);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'user_activities',
              filter: `user_id=eq.${userData.id}`
            },
            (payload) => {
              setActivities(prev =>
                prev.map(a => a.id === payload.new.id ? payload.new as Activity : a)
              );
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to setup realtime subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [limit]);

  return {
    activities,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh
  };
}
