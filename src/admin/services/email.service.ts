import { supabase } from '../../utils/supabase/client';

export interface EmailPreferences {
  id: string;
  user_id: string;
  marketing_emails: boolean;
  product_updates: boolean;
  announcements: boolean;
  weekly_digest: boolean;
  account_alerts: boolean;
  all_emails: boolean;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QueuedEmail {
  id: string;
  user_id: string | null;
  to_email: string;
  template_id: string;
  subject: string;
  variables: Record<string, any>;
  priority: 'high' | 'normal' | 'low';
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  scheduled_for: string;
  sent_at: string | null;
 error_message: string | null;
  created_at: string;
}

export interface EmailLog {
  id: string;
  queue_id: string;
  user_id: string | null;
  email_type: string;
  to_email: string;
  template_id: string;
  status: string;
  opened_at: string | null;
  clicked_at: string | null;
  open_count: number;
  click_count: number;
  created_at: string;
}

export interface EmailStatistics {
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_failed: number;
  pending_count: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
}

export class EmailService {
  /**
   * Get email statistics
   */
  async getStatistics(startDate?: string, endDate?: string): Promise<EmailStatistics> {
    const { data, error } = await supabase.rpc('get_email_statistics', {
      p_start_date: startDate,
      p_end_date: endDate
    } as any);

    if (error) throw error;

    // Calculate rates
    const stats = data as any;
    const deliveryRate = stats.total_sent > 0 ? (stats.total_delivered / stats.total_sent) * 100 : 0;
    const openRate = stats.total_delivered > 0 ? (stats.total_opened / stats.total_delivered) * 100 : 0;
    const clickRate = stats.total_delivered > 0 ? (stats.total_clicked / stats.total_delivered) * 100 : 0;

    return {
      ...stats,
      delivery_rate: Math.round(deliveryRate * 10) / 10,
      open_rate: Math.round(openRate * 10) / 10,
      click_rate: Math.round(clickRate * 10) / 10
    };
  }

  /**
   * Queue an email
   */
  async queueEmail(params: {
    userId: string;
    toEmail: string;
    templateId: string;
    subject: string;
    variables?: Record<string, any>;
    priority?: 'high' | 'normal' | 'low';
    scheduledFor?: string;
  }): Promise<string> {
    const { data, error } = await supabase.rpc('queue_email', {
      p_user_id: params.userId,
      p_to_email: params.toEmail,
      p_template_id: params.templateId,
      p_subject: params.subject,
      p_variables: params.variables || {},
      p_priority: params.priority || 'normal',
      p_scheduled_for: params.scheduledFor
    } as any);

    if (error) throw error;
    return data;
  }

  /**
   * Get email queue
   */
  async getEmailQueue(filters?: {
    status?: string;
    templateId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ emails: QueuedEmail[]; total: number }> {
    let query = supabase
      .from('email_queue')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.templateId) {
      query = query.eq('template_id', filters.templateId);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      emails: data || [],
      total: count || 0
    };
  }

  /**
   * Get email logs
   */
  async getEmailLogs(filters?: {
    userId?: string;
    templateId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: EmailLog[]; total: number }> {
    let query = supabase
      .from('email_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.templateId) {
      query = query.eq('template_id', filters.templateId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      logs: data || [],
      total: count || 0
    };
  }

  /**
   * Get user email preferences
   */
  async getUserPreferences(userId: string): Promise<EmailPreferences | null> {
    const { data, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Update email preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<Omit<EmailPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<void> {
    const { error } = await supabase.rpc('update_email_preferences', {
      p_user_id: userId,
      p_marketing_emails: preferences.marketing_emails,
      p_product_updates: preferences.product_updates,
      p_announcements: preferences.announcements,
      p_weekly_digest: preferences.weekly_digest,
      p_account_alerts: preferences.account_alerts,
      p_all_emails: preferences.all_emails
    } as any);

    if (error) throw error;
  }

  /**
   * Cancel queued email
   */
  async cancelEmail(queueId: string): Promise<void> {
    const { error } = await supabase
      .from('email_queue')
      .update({ status: 'cancelled' })
      .eq('id', queueId);

    if (error) throw error;
  }

  /**
   * Retry failed email
   */
  async retryEmail(queueId: string): Promise<void> {
    const { error } = await supabase
      .from('email_queue')
      .update({ 
        status: 'pending',
        attempts: 0,
        error_message: null,
        scheduled_for: new Date().toISOString()
      })
      .eq('id', queueId);

    if (error) throw error;
  }

  /**
   * Send test email
   */
  async sendTestEmail(params: {
    toEmail: string;
    template: string;
    variables?: Record<string, any>;
  }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Queue test email with high priority
    await this.queueEmail({
      userId: user.id,
      toEmail: params.toEmail,
      templateId: params.template,
      subject: `[TEST] ${params.template} template`,
      variables: params.variables || {},
      priority: 'high'
    });
  }

  /**
   * Get template preview
   */
  getTemplatePreview(template: string, variables: Record<string, any> = {}): string {
    // This would ideally call the Edge Function to generate HTML
    // For now, return a simple preview
    return `Preview of ${template} template with variables: ${JSON.stringify(variables)}`;
  }
}

export const emailService = new EmailService();
