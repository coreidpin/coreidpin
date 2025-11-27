import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Moon } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    emailAlerts: true,
    pushNotifications: true,
    smsAlerts: false,
    inDashboardAlerts: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notification Settings</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Email Alerts</p>
              <p className="text-xs text-gray-500">Receive notifications via email</p>
            </div>
          </div>
          <button
            onClick={() => toggleSetting('emailAlerts')}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              settings.emailAlerts ? 'bg-[#D4A574]' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.emailAlerts ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</p>
              <p className="text-xs text-gray-500">Browser push notifications</p>
            </div>
          </div>
          <button
            onClick={() => toggleSetting('pushNotifications')}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              settings.pushNotifications ? 'bg-[#D4A574]' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.pushNotifications ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">SMS Alerts</p>
              <p className="text-xs text-gray-500">Text message notifications</p>
            </div>
          </div>
          <button
            onClick={() => toggleSetting('smsAlerts')}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              settings.smsAlerts ? 'bg-[#D4A574]' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.smsAlerts ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">In-Dashboard Alerts</p>
              <p className="text-xs text-gray-500">Show alerts in dashboard</p>
            </div>
          </div>
          <button
            onClick={() => toggleSetting('inDashboardAlerts')}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              settings.inDashboardAlerts ? 'bg-[#D4A574]' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.inDashboardAlerts ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Quiet Hours</p>
                <p className="text-xs text-gray-500">Pause notifications during set hours</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('quietHoursEnabled')}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings.quietHoursEnabled ? 'bg-[#D4A574]' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.quietHoursEnabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {settings.quietHoursEnabled && (
            <div className="flex gap-3 ml-8">
              <input
                type="time"
                value={settings.quietHoursStart}
                onChange={(e) => setSettings(prev => ({ ...prev, quietHoursStart: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              />
              <span className="text-gray-500 self-center">to</span>
              <input
                type="time"
                value={settings.quietHoursEnd}
                onChange={(e) => setSettings(prev => ({ ...prev, quietHoursEnd: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
