import React from 'react';
import { X, ArrowRight } from 'lucide-react';

interface AnnouncementBannerProps {
  title: string;
  message: string;
  ctaText?: string;
  ctaAction?: () => void;
  onDismiss: () => void;
  variant?: 'info' | 'warning' | 'success';
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  title,
  message,
  ctaText,
  ctaAction,
  onDismiss,
  variant = 'info',
}) => {
  const variantStyles = {
    info: 'bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-800',
    warning: 'bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border-amber-200 dark:border-amber-800',
    success: 'bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-green-200 dark:border-green-800',
  };

  return (
    <div
      className={`relative w-full rounded-2xl border p-5 overflow-hidden ${variantStyles[variant]}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23000000' fill-opacity='0.02'/%3E%3C/svg%3E")`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{message}</p>
          
          {ctaText && ctaAction && (
            <button onClick={ctaAction} className="inline-flex items-center gap-2 text-sm font-medium text-[#D4A574] hover:text-[#C49564] transition-colors group">
              {ctaText}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        <button onClick={onDismiss} className="flex-shrink-0 p-1 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
