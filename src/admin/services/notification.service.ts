import { supabase } from '../../utils/supabase/client';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target_audience: 'all' | 'business' | 'professional' | 'admin' | 'individual';
  is_active: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string | null;
  link: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationStatistics {
  total_announcements: number;
  active_announcements: number;
  total_notifications: number;
  unread_notifications: number;
  announcements_by_type: Record<string, number>;
  notifications_by_category: Record<string, number>;
}

/**
 * Service for announcements and notifications
 */
export class NotificationService {
  /**
   * Get active announcements for current user
   */
  async getActiveAnnouncements(userType: string = 'individual'): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase.rpc('get_active_announcements', {
        p_user_type: userType
      });

      if (error) {
        console.error('Failed to fetch announcements:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get active announcements error:', error);
      return [];
    }
  }

  /**
   * Get all announcements (admin)
   */
  async getAllAnnouncements(
    isActive?: boolean,
    page: number = 1,
    limit: number = 50
  ): Promise<{ announcements: Announcement[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase.rpc('get_all_announcements', {
        p_is_active: isActive ?? null,
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        console.error('Failed to fetch all announcements:', error);
        throw error;
      }

      const announcements = data || [];
      const total = announcements.length > 0 ? announcements[0].total_count : 0;

      return { announcements, total };
    } catch (error) {
      console.error('Get all announcements error:', error);
      return { announcements: [], total: 0 };
    }
  }

  /**
   * Create announcement
   */
  async createAnnouncement(params: {
    title: string;
    message: string;
    type: string;
    target_audience: string;
    priority?: string;
    starts_at?: string;
    ends_at?: string;
  }): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase.rpc('create_announcement', {
        p_title: params.title,
        p_message: params.message,
        p_type: params.type,
        p_target_audience: params.target_audience,
        p_priority: params.priority || 'normal',
        p_starts_at: params.starts_at || new Date().toISOString(),
        p_ends_at: params.ends_at || null,
        p_created_by: user?.id || null
      });

      if (error) {
        console.error('Failed to create announcement:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Create announcement error:', error);
      return null;
    }
  }

  /**
   * Update announcement
   */
  async updateAnnouncement(
    id: string,
    params: {
      title: string;
      message: string;
      type: string;
      target_audience: string;
      priority: string;
      is_active: boolean;
      ends_at: string | null;
    }
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_announcement', {
        p_id: id,
        p_title: params.title,
        p_message: params.message,
        p_type: params.type,
        p_target_audience: params.target_audience,
        p_priority: params.priority,
        p_is_active: params.is_active,
        p_ends_at: params.ends_at
      });

      if (error) {
        console.error('Failed to update announcement:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Update announcement error:', error);
      return false;
    }
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('delete_announcement', {
        p_id: id
      });

      if (error) {
        console.error('Failed to delete announcement:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Delete announcement error:', error);
      return false;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    isRead?: boolean,
    page: number = 1,
    limit: number = 50
  ): Promise<{ notifications: Notification[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase.rpc('get_user_notifications', {
        p_user_id: userId,
        p_is_read: isRead ?? null,
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        console.error('Failed to fetch notifications:', error);
        throw error;
      }

      const notifications = data || [];
      const total = notifications.length > 0 ? notifications[0].total_count : 0;

      return { notifications, total };
    } catch (error) {
      console.error('Get user notifications error:', error);
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('mark_notification_read', {
        p_id: id
      });

      if (error) {
        console.error('Failed to mark notification as read:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Mark as read error:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('mark_all_notifications_read', {
        p_user_id: userId
      });

      if (error) {
        console.error('Failed to mark all as read:', error);
        throw error;
      }

      return data || 0;
    } catch (error) {
      console.error('Mark all as read error:', error);
      return 0;
    }
  }

  /**
   * Create notification
   */
  async createNotification(params: {
    user_id: string;
    title: string;
    message: string;
    type?: string;
    category?: string;
    link?: string;
  }): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_notification', {
        p_user_id: params.user_id,
        p_title: params.title,
        p_message: params.message,
        p_type: params.type || 'info',
        p_category: params.category || null,
        p_link: params.link || null
      });

      if (error) {
        console.error('Failed to create notification:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Create notification error:', error);
      return null;
    }
  }

  /**
   * Get notification statistics
   */
  async getStatistics(): Promise<NotificationStatistics | null> {
    try {
      const { data, error } = await supabase.rpc('get_notification_statistics');

      if (error) {
        console.error('Failed to fetch notification statistics:', error);
        throw error;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Get notification statistics error:', error);
      return null;
    }
  }

  /**
   * Get type color for badges
   */
  getTypeColor(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }

  /**
   * Get priority color
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get announcement icon based on type
   */
  getTypeIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
