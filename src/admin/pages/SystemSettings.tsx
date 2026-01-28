import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Settings,
  Globe,
  Flag,
  Mail,
  Shield,
  Code,
  Server,
  Save,
  RefreshCw,
  History,
  ArrowLeft
} from 'lucide-react';
import { systemSettingsService, type SettingsByCategory } from '../services/system-settings.service';

type TabType = 'general' | 'features' | 'email' | 'security' | 'api' | 'system';

export function SystemSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [settings, setSettings] = useState<SettingsByCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await systemSettingsService.getSettingsByCategory();
      setSettings(data);
      // Initialize form data with current settings
      setFormData(data[activeTab] || {});
    } catch (error) {
      console.error('Failed to load settings:', error);
      alert('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    if (hasChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to switch tabs?')) {
        return;
      }
    }
    setActiveTab(tab);
    setFormData(settings?.[tab] || {});
    setHasChanges(false);
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const updates = Object.entries(formData).map(([key, data]: [string, any]) => ({
        category: activeTab,
        key,
        value: data.value
      }));

      const result = await systemSettingsService.updateMultipleSettings(updates);
      
      if (result.success) {
        alert('Settings saved successfully!');
        setHasChanges(false);
        await loadSettings();
      } else {
        alert('Failed to save settings: ' + result.message);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general' as TabType, label: 'General', icon: Globe },
    { id: 'features' as TabType, label: 'Features', icon: Flag },
    { id: 'email' as TabType, label: 'Email', icon: Mail },
    { id: 'security' as TabType, label: 'Security', icon: Shield },
    { id: 'api' as TabType, label: 'API', icon: Code },
    { id: 'system' as TabType, label: 'System', icon: Server },
  ];

  const renderInput = (key: string, data: any) => {
    const value = data.value;
    const dataType = data.data_type;
    const description = data.description;
    const isSensitive = data.is_sensitive;

    switch (dataType) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between py-3">
            <div>
              <label className="text-sm font-medium text-gray-900">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
            <button
              onClick={() => handleInputChange(key, !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        );

      case 'number':
        return (
          <div className="py-3">
            <label className="text-sm font-medium text-gray-900 block mb-1">
              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </label>
            <p className="text-xs text-gray-500 mb-2">{description}</p>
            <input
              type="number"
              value={value}
              onChange={(e) => handleInputChange(key, Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      default: // string
        return (
          <div className="py-3">
            <label className="text-sm font-medium text-gray-900 block mb-1">
              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </label>
            <p className="text-xs text-gray-500 mb-2">{description}</p>
            <input
              type={isSensitive ? 'password' : 'text'}
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={isSensitive ? '••••••••' : ''}
            />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-1">Configure your platform settings and preferences</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {tabs.find(t => t.id === activeTab)?.label} Settings
            </CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={loadSettings}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 ${
                  hasChanges && !isSaving
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 divide-y divide-gray-200">
            {formData && Object.keys(formData).length > 0 ? (
              Object.entries(formData).map(([key, data]:  [string, any]) => (
                <div key={key}>
                  {renderInput(key, data)}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No settings available for this category
              </div>
            )}
          </div>

          {hasChanges && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ You have unsaved changes. Click "Save Changes" to apply them.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SystemSettings;
