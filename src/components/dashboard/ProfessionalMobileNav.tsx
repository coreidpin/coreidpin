import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Briefcase, Activity, MoreHorizontal, Users, Mail } from 'lucide-react';
import { colors, spacing, shadows, borderRadius, typography } from '../../styles/designSystem';

interface ProfessionalMobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface MoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Inline MoreMenu component for Professional Dashboard
function ProfessionalMoreMenu({ isOpen, onClose, activeTab, onTabChange }: MoreMenuProps) {
  const secondaryTabs = [
    { id: 'endorsements', label: 'Endorsements', icon: Users },
    { id: 'inquiries', label: 'Inquiries', icon: Mail },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 60,
            }}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 61,
              background: colors.white,
              borderTopLeftRadius: borderRadius['2xl'],
              borderTopRightRadius: borderRadius['2xl'],
              boxShadow: shadows['2xl'],
              paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: spacing.lg,
                borderBottom: `1px solid ${colors.neutral[200]}`,
              }}
            >
              <h3
                style={{
                  fontSize: typography.fontSize.lg[0],
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.neutral[900],
                }}
              >
                More Options
              </h3>
              <button
                onClick={onClose}
                style={{
                  background: colors.neutral[100],
                  border: 'none',
                  borderRadius: borderRadius.full,
                  padding: spacing.sm,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s ease',
                  width: '32px',
                  height: '32px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.neutral[200];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.neutral[100];
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.neutral[600]} strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <div style={{ padding: spacing.md }}>
              {secondaryTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.md,
                      padding: spacing.md,
                      marginBottom: spacing.xs,
                      background: isActive ? colors.neutral[100] : 'transparent',
                      border: 'none',
                      borderRadius: borderRadius.lg,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minHeight: '56px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = colors.neutral[50];
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div
                      style={{
                        padding: spacing.sm,
                        background: isActive ? colors.neutral[900] : colors.neutral[100],
                        borderRadius: borderRadius.lg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon
                        size={20}
                        style={{
                          color: isActive ? colors.white : colors.neutral[600],
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: typography.fontSize.base[0],
                        fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.normal,
                        color: isActive ? colors.neutral[900] : colors.neutral[700],
                        textAlign: 'left',
                      }}
                    >
                      {tab.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function ProfessionalMobileNav({ activeTab, onTabChange }: ProfessionalMobileNavProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const primaryTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'analytics', label: 'Analytics', icon: Activity },
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
          paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
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
                  position: 'relative',
                }}
              >
                <Icon
                  size={20}
                  style={{
                    color: isActive ? colors.black : colors.neutral[500],
                    transition: 'color 0.2s ease',
                  }}
                />
                <span
                  style={{
                    fontSize: typography.fontSize.xs[0],
                    fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.normal,
                    color: isActive ? colors.black : colors.neutral[600],
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.label}
                </span>
                
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="professionalActiveTab"
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      width: '32px',
                      height: '3px',
                      borderRadius: borderRadius.full,
                      background: colors.black,
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
      <ProfessionalMoreMenu 
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
