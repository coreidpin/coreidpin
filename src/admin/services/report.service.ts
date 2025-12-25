import { supabase } from '../../utils/supabase/client';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  report_type: 'engagement' | 'performance' | 'geographic' | 'custom';
  data_sources: string[];
  filters?: Record<string, any>;
  columns: string[];
  visualizations?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledReport {
  id: string;
  template_id: string;
  template_name: string;
  name: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule_config: {
    time?: string; // HH:MM format
    day_of_week?: number; // 0-6 for weekly
    day_of_month?: number; // 1-31 for monthly
    cron?: string; // Custom cron expression
  };
  recipients: string[];
  export_format: 'pdf' | 'csv' | 'xlsx' | 'json';
  last_run_at?: string;
  next_run_at?: string;
  is_active: boolean;
}

export interface ReportHistory {
  id: string;
  template_id: string;
  template_name: string;
  name: string;
  report_type: string;
  export_format: string;
  file_url?: string;
  file_size?: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  generated_at: string;
}

export interface CreateReportTemplateInput {
  name: string;
  description?: string;
  report_type: 'engagement' | 'performance' | 'geographic' | 'custom';
  data_sources: string[];
  filters?: Record<string, any>;
  columns: string[];
  visualizations?: Record<string, any>;
}

export interface CreateScheduledReportInput {
  template_id: string;
  name: string;
  schedule_type: 'daily' | 'weekly' | 'monthly';
  schedule_config: {
    time: string;
    day_of_week?: number;
    day_of_month?: number;
  };
  recipients: string[];
  export_format: 'pdf' | 'csv' | 'xlsx';
}

class ReportService {
  /**
   * Get all report templates
   */
  async getReportTemplates(filterType?: string): Promise<ReportTemplate[]> {
    const { data, error } = await supabase
      .rpc('get_report_templates', { filter_type: filterType || null });

    if (error) {
      console.error('Error fetching report templates:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Create a new report template
   */
  async createReportTemplate(template: CreateReportTemplateInput): Promise<ReportTemplate | null> {
    const { data, error } = await supabase
      .from('report_templates')
      .insert({
        ...template,
        data_sources: template.data_sources,
        filters: template.filters || {},
        columns: template.columns,
        visualizations: template.visualizations || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating report template:', error);
      return null;
    }

    return data;
  }

  /**
   * Update a report template
   */
  async updateReportTemplate(id: string, updates: Partial<CreateReportTemplateInput>): Promise<boolean> {
    const { error } = await supabase
      .from('report_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating report template:', error);
      return false;
    }

    return true;
  }

  /**
   * Delete a report template
   */
  async deleteReportTemplate(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('report_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting report template:', error);
      return false;
    }

    return true;
  }

  /**
   * Get all scheduled reports
   */
  async getScheduledReports(): Promise<ScheduledReport[]> {
    const { data, error } = await supabase
      .rpc('get_scheduled_reports');

    if (error) {
      console.error('Error fetching scheduled reports:', error);
return [];
    }

    return data || [];
  }

  /**
   * Create a scheduled report
   */
  async createScheduledReport(report: CreateScheduledReportInput): Promise<ScheduledReport | null> {
    // Calculate next run time
    const nextRunAt = this.calculateNextRunTime(
      report.schedule_type,
      report.schedule_config
    );

    const { data, error } = await supabase
      .from('scheduled_reports')
      .insert({
        ...report,
        schedule_config: report.schedule_config,
        recipients: report.recipients,
        next_run_at: nextRunAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating scheduled report:', error);
      return null;
    }

    return data;
  }

  /**
   * Update a scheduled report
   */
  async updateScheduledReport(id: string, updates: Partial<CreateScheduledReportInput>): Promise<boolean> {
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Recalculate next run if schedule changed
    if (updates.schedule_type || updates.schedule_config) {
      updateData.next_run_at = this.calculateNextRunTime(
        updates.schedule_type || 'daily',
        updates.schedule_config || { time: '09:00' }
      );
    }

    const { error } = await supabase
      .from('scheduled_reports')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating scheduled report:', error);
      return false;
    }

    return true;
  }

  /**
   * Delete a scheduled report
   */
  async deleteScheduledReport(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('scheduled_reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting scheduled report:', error);
      return false;
    }

    return true;
  }

  /**
   * Toggle scheduled report active status
   */
  async toggleScheduledReport(id: string, isActive: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('scheduled_reports')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      console.error('Error toggling scheduled report:', error);
      return false;
    }

    return true;
  }

  /**
   * Get report history
   */
  async getReportHistory(limit: number = 50, templateId?: string): Promise<ReportHistory[]> {
    const { data, error } = await supabase
      .rpc('get_report_history', {
        limit_count: limit,
        template_filter: templateId || null,
      });

    if (error) {
      console.error('Error fetching report history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Generate a report from template
   */
  async generateReport(templateId: string, parameters?: Record<string, any>): Promise<string | null> {
    const { data, error } = await supabase
      .rpc('create_report_from_template', {
        p_template_id: templateId,
        p_parameters: parameters || {},
      });

    if (error) {
      console.error('Error generating report:', error);
      return null;
    }

    return data; // Returns report ID
  }

  /**
   * Export report data to CSV
   */
  exportToCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) return;

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values with commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  }

  /**
   * Export report data to JSON
   */
  exportToJSON(data: any, filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
  }

  /**
   * Calculate next run time for scheduled report
   */
  private calculateNextRunTime(
    scheduleType: string,
    config: { time: string; day_of_week?: number; day_of_month?: number }
  ): string {
    const now = new Date();
    const [hours, minutes] = config.time.split(':').map(Number);
    
    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    switch (scheduleType) {
      case 'daily':
        // If time has passed today, schedule for tomorrow
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case 'weekly':
        // Schedule for specific day of week
        const targetDay = config.day_of_week || 1; // Default Monday
        const currentDay = nextRun.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd < 0 || (daysToAdd === 0 && nextRun <= now)) {
          daysToAdd += 7;
        }
        nextRun.setDate(nextRun.getDate() + daysToAdd);
        break;

      case 'monthly':
        // Schedule for specific day of month
        const targetDate = config.day_of_month || 1;
        nextRun.setDate(targetDate);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
    }

    return nextRun.toISOString();
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export const reportService = new ReportService();
