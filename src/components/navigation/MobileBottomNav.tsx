import React from 'react';
import { Home, Briefcase, BarChart3, MessageSquare, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { colors } from '../../styles/designSystem';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  badge?: number;
}

export const MobileBottomNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  className,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Briefcase,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'inquiries',
      label: 'Leads',
      icon: MessageSquare,
    },
    {
      id: 'endorsements',
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom border-t',
        className
      )}
      style={{ 
        backgroundColor: colors.white, 
        borderColor: colors.neutral[200] 
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[64px] relative'
              )}
              style={{
                color: isActive ? colors.brand.primary[600] : colors.neutral[600],
                backgroundColor: isActive ? colors.brand.primary[50] : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = colors.neutral[900];
                  e.currentTarget.style.backgroundColor = colors.neutral[50];
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = colors.neutral[600];
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              aria-label={item.label}
            >
              {/* Badge */}
              {item.badge && item.badge > 0 && (
                <span 
                  className="absolute top-1 right-2 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  style={{ backgroundColor: colors.semantic.error, color: colors.white }}
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}

              {/* Icon */}
              <Icon
                className={cn(
                  'h-5 w-5 transition-all text-current',
                  isActive && 'scale-110'
                )}
              />

              {/* Label */}
              <span
                className={cn(
                  'text-xs font-medium transition-all',
                  isActive && 'font-semibold'
                )}
              >
                {item.label}
              </span>

              {/* Active Indicator */}
              {isActive && (
                <div 
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-t-full" 
                  style={{ backgroundColor: colors.brand.primary[600] }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Safe area for iOS devices */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};
