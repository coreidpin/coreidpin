import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  type: 'success' | 'alert' | 'info' | 'warning';
  category: 'notification' | 'announcement';
  title: string;
  message: string;
  metadata: Record<string, any>;
  is_read: boolean;
  is_new: boolean;
  action_url: string | null;
  created_at: string;
  read_at: string | null;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from database
  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        // If table doesn't exist yet (migration not run), silently fail
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('Notifications table does not exist yet. Run migration to enable notifications.');
          setNotifications([]);
          setUnreadCount(0);
          setLoading(false);
          return;
        }
        throw error;
      }

      setNotifications(data || []);
      
      // Calculate unread count
      const unread = (data || []).filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set empty arrays on error to prevent crashes
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const { data, error } = await supabase.rpc('get_unread_notification_count');
      if (!error) {
        setUnreadCount(data || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        notification_id: notificationId
      } as any);

      if (error) {
        // Function doesn't exist yet
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          console.warn('Notification functions not available yet.');
          return;
        }
        throw error;
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: true, is_new: false, read_at: new Date().toISOString() }
            : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Don't throw - just log
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase.rpc('mark_all_notifications_read');
      if (error) {
        // Function doesn't exist yet
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          console.warn('Notification functions not available yet.');
          return;
        }
        throw error;
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, is_new: false, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Don't throw - just log
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const initSubscription = async () => {
      try {
        await fetchNotifications();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Set up realtime subscription
        const channel = supabase
          .channel('notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('New notification received:', payload);
              setNotifications(prev => [payload.new as Notification, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Notification updated:', payload);
              setNotifications(prev =>
                prev.map(n => (n.id === payload.new.id ? payload.new as Notification : n))
              );
              // Recalculate unread count
              fetchUnreadCount();
            }
          )
          .subscribe();

        cleanup = () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error setting up notifications subscription:', error);
        // Continue without realtime updates
      }
    };

    initSubscription();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
}
