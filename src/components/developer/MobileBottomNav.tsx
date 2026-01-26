import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Key, BookOpen, Settings, MoreHorizontal } from 'lucide-react';
import { colors, spacing, shadows, borderRadius, typography } from '../../styles/designSystem';
import { MoreMenu } from './MoreMenu';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const primaryTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'docs', label: 'Docs', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${colors.neutral[200]}`,
          boxShadow: shadows.lg,
          padding: `${spacing.xs} ${spacing.sm}`,
          paddingBottom: 'max(env(safe-area-inset-bottom), 8px)', // Handle iPhone notch
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.xs,
                  padding: `${spacing.sm} ${spacing.xs}`,
                  minHeight: '52px',
                  minWidth: '64px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderRadius: borderRadius.md,
                }}
              >
                <Icon
                  size={20}
                  style={{
                    color: isActive ? colors.brand.primary[600] : colors.neutral[500],
                    transition: 'color 0.2s ease',
                  }}
                />
                <span
                  style={{
                    fontSize: typography.fontSize.xs[0],
                    fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.normal,
                    color: isActive ? colors.brand.primary[600] : colors.neutral[600],
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.label}
                </span>
                
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      width: '32px',
                      height: '3px',
                      borderRadius: borderRadius.full,
                      background: colors.brand.primary[600],
                    }}
                  />
                )}
              </motion.button>
            );
          })}

          {/* More Button */}
          <motion.button
            onClick={() => setShowMoreMenu(true)}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              padding: `${spacing.sm} ${spacing.xs}`,
              minHeight: '52px',
              minWidth: '64px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderRadius: borderRadius.md,
            }}
          >
            <MoreHorizontal
              size={20}
              style={{
                color: colors.neutral[500],
              }}
            />
            <span
              style={{
                fontSize: typography.fontSize.xs[0],
                fontWeight: typography.fontWeight.normal,
                color: colors.neutral[600],
              }}
            >
              More
            </span>
          </motion.button>
        </div>
      </motion.nav>

      {/* More Menu Overlay */}
      <MoreMenu 
        isOpen={showMoreMenu} 
        onClose={() => setShowMoreMenu(false)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          onTabChange(tab);
          setShowMoreMenu(false);
        }}
      />
    </>
  );
}
