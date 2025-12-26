import { supabase } from '../../utils/supabase/client';

export interface SystemSetting {
  id: string;
  category: string;
  key: string;
  value: any;
  description: string;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  is_sensitive: boolean;
  updated_at: string;
  updated_by: string | null;
}

export interface SettingsHistory {
  id: string;
  category: string;
  key: string;
  old_value: any;
  new_value: any;
  changed_by: string | null;
  changed_at: string;
}

export interface SettingsByCategory {
  general: Record<string, any>;
  features: Record<string, any>;
  email: Record<string, any>;
  security: Record<string, any>;
  api: Record<string, any>;
  system: Record<string, any>;
}

/**
 * Service for system settings management
 */
export class SystemSettingsService {
  /**
   * Get all settings
   */
  async getSettings(category?: string): Promise<SystemSetting[]> {
    const { data, error } = await supabase.rpc('get_system_settings', {
      p_category: category || null
    });

    if (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get settings organized by category
   */
  async getSettingsByCategory(): Promise<SettingsByCategory> {
    const settings = await this.getSettings();
    
    const organized: SettingsByCategory = {
      general: {},
      features: {},
      email: {},
      security: {},
      api: {},
      system: {}
    };

    settings.forEach(setting => {
      const category = setting.category as keyof SettingsByCategory;
      if (organized[category]) {
        // Parse JSON value
        let value = setting.value;
        if (typeof value === 'string') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // Keep as string if not valid JSON
          }
        }
        organized[category][setting.key] = {
          value,
          description: setting.description,
          data_type: setting.data_type,
          is_sensitive: setting.is_sensitive
        };
      }
    });

    return organized;
  }

  /**
   * Update a setting
   */
  async updateSetting(
    category: string,
    key: string,
    value: any,
    userId?: string
  ): Promise<{ success: boolean; message: string }> {
    // Convert value to JSONB format
    let jsonValue = value;
    if (typeof value === 'string') {
      jsonValue = JSON.stringify(value);
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      jsonValue = value;
    } else {
      jsonValue = JSON.stringify(value);
    }

    const { data, error } = await supabase.rpc('update_system_setting', {
      p_category: category,
      p_key: key,
      p_value: jsonValue,
      p_user_id: userId || null
    });

    if (error) {
      console.error('Error updating setting:', error);
      return { success: false, message: error.message };
    }

    return data?.[0] || { success: false, message: 'Unknown error' };
  }

  /**
   * Update multiple settings at once
   */
  async updateMultipleSettings(
    settings: Array<{ category: string; key: string; value: any }>,
    userId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      for (const setting of settings) {
        const result = await this.updateSetting(
          setting.category,
          setting.key,
          setting.value,
          userId
        );
        if (!result.success) {
          return result;
        }
      }
      return { success: true, message: 'All settings updated successfully' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get settings history
   */
  async getSettingsHistory(
    category?: string,
    limit: number = 50
  ): Promise<SettingsHistory[]> {
    const { data, error } = await supabase.rpc('get_settings_history', {
      p_category: category || null,
      p_limit: limit
    });

    if (error) {
      console.error('Error fetching settings history:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a specific setting value
   */
  async getSettingValue(category: string, key: string): Promise<any> {
    const settings = await this.getSettings(category);
    const setting = settings.find(s => s.key === key);
    
    if (!setting) {
      return null;
    }

    // Parse JSON value
    let value = setting.value;
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        // Keep as string
      }
    }

    return value;
  }

  /**
   * Check if feature is enabled
   */
  async isFeatureEnabled(featureKey: string): Promise<boolean> {
    try {
      const value = await this.getSettingValue('features', featureKey);
      return value === true || value === 'true';
    } catch (error) {
      console.error('Error checking feature flag:', error);
      return false;
    }
  }

  /**
   * Format setting value for display
   */
  formatValue(value: any, dataType: string): string {
    if (value === null || value === undefined) {
      return 'Not set';
    }

    switch (dataType) {
      case 'boolean':
        return value ? 'Enabled' : 'Disabled';
      case 'number':
        return value.toString();
      case 'json':
        return JSON.stringify(value, null, 2);
      default:
        return value.toString();
    }
  }

  /**
   * Validate setting value based on data type
   */
  validateValue(value: any, dataType: string): boolean {
    switch (dataType) {
      case 'boolean':
        return typeof value === 'boolean';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'string':
        return typeof value === 'string';
      case 'json':
        try {
          JSON.stringify(value);
          return true;
        } catch {
          return false;
        }
      default:
        return true;
    }
  }
}

// Export singleton instance
export const systemSettingsService = new SystemSettingsService();
