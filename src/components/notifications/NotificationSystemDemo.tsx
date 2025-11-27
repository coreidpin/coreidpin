import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import {
  NotificationCenter,
  NotificationCard,
  NotificationDetailModal,
  AnnouncementBanner,
  NotificationSettings,
  ToastContainer,
} from './index';

const NotificationSystemDemo: React.FC = () => {
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string }>>([]);

  const sampleNotifications = [
    {
      id: '1',
      type: 'success' as const,
      title: 'Profile Verified',
      message: 'Your professional profile has been successfully verified',
      timestamp: '2h ago',
      isNew: true,
      category: 'notification' as const,
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'New Connection Request',
      message: 'John Doe wants to connect with you',
      timestamp: '5h ago',
      isNew: true,
      category: 'notification' as const,
    },
    {
      id: '3',
      type: 'warning' as const,
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Sunday 2AM - 4AM',
      timestamp: '1d ago',
      isNew: false,
      category: 'announcement' as const,
    },
  ];

  const cardItems = [
    {
      id: '1',
      icon: 'security' as const,
      message: 'Complete your security verification to unlock all features',
      cta: 'Verify now',
      ctaAction: () => addToast('info', 'Redirecting to verification...'),
    },
    {
      id: '2',
      icon: 'success' as const,
      message: 'Your profile is 85% complete. Add more details to stand out',
      cta: 'Complete profile',
      ctaAction: () => addToast('info', 'Opening profile editor...'),
    },
  ];

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification({
      title: notification.title,
      description: notification.message + '\n\nThis is a detailed view of the notification with more information.',
      tag: 'Info' as const,
      timestamp: notification.timestamp,
      actionText: 'Take Action',
      actionHandler: () => addToast('success', 'Action completed!'),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification System Demo</h1>
          <button
            onClick={() => setNotificationCenterOpen(true)}
            className="relative p-3 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
          >
            <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>

        {showBanner && (
          <AnnouncementBanner
            title="New Feature Released!"
            message="We've added enhanced security features to protect your professional identity"
            ctaText="Learn More"
            ctaAction={() => addToast('info', 'Opening feature guide...')}
            onDismiss={() => setShowBanner(false)}
            variant="info"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NotificationCard title="Latest Updates" items={cardItems} />
          <NotificationSettings />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Test Toast Notifications</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => addToast('success', 'Operation completed successfully!')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Success Toast
            </button>
            <button
              onClick={() => addToast('error', 'An error occurred. Please try again.')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Error Toast
            </button>
            <button
              onClick={() => addToast('info', 'Here is some information for you.')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Info Toast
            </button>
            <button
              onClick={() => addToast('warning', 'Warning: Please review your settings.')}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Warning Toast
            </button>
          </div>
        </div>
      </div>

      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        notifications={sampleNotifications}
        onNotificationClick={handleNotificationClick}
        onMarkAsRead={(id) => console.log('Mark as read:', id)}
      />

      <NotificationDetailModal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        notification={selectedNotification}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} position="bottom-right" />
    </div>
  );
};

export default NotificationSystemDemo;
