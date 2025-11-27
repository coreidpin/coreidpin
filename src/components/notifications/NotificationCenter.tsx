import React, { useState } from 'react';
import { X, Bell, Megaphone, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'alert' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  isNew: boolean;
  category: 'notification' | 'announcement';
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  onMarkAsRead,
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'announcements'>('notifications');

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const filteredNotifications = notifications.filter(
    n => activeTab === 'notifications' ? n.category === 'notification' : n.category === 'announcement'
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />
      
      <div className="fixed top-0 right-0 w-full md:w-[420px] h-full bg-white dark:bg-gray-900 shadow-2xl z-50 animate-slide-in-right">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'text-[#D4A574] border-b-2 border-[#D4A574]'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'announcements'
                ? 'text-[#D4A574] border-b-2 border-[#D4A574]'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4 inline mr-2" />
            Announcements
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-140px)]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-br from-[#D4A574]/20 to-[#D4A574]/5 flex items-center justify-center">
                <Bell className="w-12 h-12 text-[#D4A574]/40" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                You're all caught up—no wahala!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No new notifications at the moment
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    onNotificationClick(notification);
                    onMarkAsRead(notification.id);
                  }}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                    notification.isNew ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        {notification.isNew && (
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">
                        {notification.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;
