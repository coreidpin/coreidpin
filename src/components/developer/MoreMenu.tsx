import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Webhook, X } from 'lucide-react';
import { colors, spacing, shadows, borderRadius, typography } from '../../styles/designSystem';

interface MoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MoreMenu({ isOpen, onClose, activeTab, onTabChange }: MoreMenuProps) {
  const secondaryTabs = [
    { id: 'team', label: 'Team', icon: Users },
    { id: 'verify', label: 'Verify Identity', icon: Shield },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
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
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.neutral[200];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.neutral[100];
                }}
              >
                <X size={20} color={colors.neutral[600]} />
              </button>
            </div>

            {/* Menu Items */}
            <div
              style={{
                padding: spacing.md,
              }}
            >
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
                      background: isActive ? colors.brand.primary[50] : 'transparent',
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
                        background: isActive ? colors.brand.primary[100] : colors.neutral[100],
                        borderRadius: borderRadius.lg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon
                        size={20}
                        style={{
                          color: isActive ? colors.brand.primary[600] : colors.neutral[600],
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: typography.fontSize.base[0],
                        fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.normal,
                        color: isActive ? colors.brand.primary[700] : colors.neutral[700],
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
