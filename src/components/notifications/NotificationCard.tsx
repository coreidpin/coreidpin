import React from 'react';
import { ArrowRight, CheckCircle, AlertCircle, Info, Shield } from 'lucide-react';

interface NotificationItem {
  id: string;
  icon: 'success' | 'alert' | 'info' | 'security';
  message: string;
  cta: string;
  ctaAction: () => void;
}

interface NotificationCardProps {
  title: string;
  items: NotificationItem[];
}

const NotificationCard: React.FC<NotificationCardProps> = ({ title, items }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'security': return <Shield className="w-5 h-5 text-[#D4A574]" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
            <div className="flex-shrink-0 mt-0.5">{getIcon(item.icon)}</div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{item.message}</p>
              <button onClick={item.ctaAction} className="text-sm font-medium text-[#D4A574] hover:text-[#C49564] transition-colors inline-flex items-center gap-1 group-hover:gap-2">
                {item.cta}
                <ArrowRight className="w-4 h-4 transition-all" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCard;
