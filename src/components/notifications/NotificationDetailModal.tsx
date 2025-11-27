import React from 'react';
import { X, Clock } from 'lucide-react';

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: {
    title: string;
    description: string;
    tag: 'Info' | 'Important' | 'Security' | 'System';
    timestamp: string;
    actionText?: string;
    actionHandler?: () => void;
  } | null;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  isOpen,
  onClose,
  notification,
}) => {
  if (!isOpen || !notification) return null;

  const tagColors = {
    Info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    Important: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    Security: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    System: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${tagColors[notification.tag]}`}>
                {notification.tag}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {notification.title}
            </h2>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {notification.description}
          </p>

          <div className="flex items-center gap-2 mt-6 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{notification.timestamp}</span>
          </div>
        </div>

        {notification.actionText && notification.actionHandler && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Close
            </button>
            <button
              onClick={() => {
                notification.actionHandler?.();
                onClose();
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#D4A574] hover:bg-[#C49564] text-white font-medium transition-colors"
            >
              {notification.actionText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDetailModal;
