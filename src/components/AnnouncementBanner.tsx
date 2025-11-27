import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import "./announcement-banner.css";

/**
 * AnnouncementBanner
 *
 * Props:
 * - id: string (unique id for persistence)
 * - title: string (short)
 * - message: string (short)
 * - ctaText: string (button text)
 * - ctaHref: string (button link)
 * - onCtaClick: function (optional)
 * - variant: "info"|"success"|"warning"|"neutral" (affects subtle tint)
 * - initiallyVisible: boolean (default true)
 *
 * Usage:
 * <AnnouncementBanner
 *   id="feature-2025-11"
 *   title="New Update"
 *   message="We just added [Feature Name] to improve onboarding."
 *   ctaText="View update"
 *   ctaHref="/changelog"
 *   variant="info"
 * />
 */

const STORAGE_PREFIX = "announcement_dismissed_";

function AnnouncementBanner({
  id = "beta-testing-2025",
  title = "Help us build this right",
  message = "Sign up for beta testing",
  ctaText = "Join Beta",
  ctaHref,
  onCtaClick,
  variant = "info",
  initiallyVisible = true,
}) {
  const [visible, setVisible] = useState(initiallyVisible && !isDismissed(id));

  useEffect(() => {
    setVisible(initiallyVisible && !isDismissed(id));
  }, [id, initiallyVisible]);

  function dismiss() {
    try {
      if (id) localStorage.setItem(STORAGE_PREFIX + id, "1");
    } catch (e) {
      // ignore storage errors (e.g., private mode)
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      role="region"
      aria-label={`Announcement: ${title}`}
      className="announcement-banner relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        borderRadius: 8,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Animated gradient overlay - same as HeroProfileCard */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Subtle grid pattern - same as HeroProfileCard */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Icon container */}
      <div
        className="announcement-icon relative z-10 hidden sm:flex"
        style={{
          minWidth: 28,
          minHeight: 28,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.1)',
        }}
        aria-hidden
      >
        {/* Simple inline SVG icon (megaphone) */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 10v4h3l7 5V5L6 10H3z" fill="#ffffff" opacity="0.9" />
          <path d="M20 8v8a1 1 0 0 1-1.447.894L16 15H15V9h1l2.553-1.894A1 1 0 0 1 20 8z" fill="#3DE6B3" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontWeight: 600,
                color: '#ffffff',
                fontSize: '12px',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </div>
            <div
              className="hidden sm:block"
              style={{
                marginTop: 1,
                color: 'rgba(255,255,255,0.7)',
                fontSize: '11px',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {message}
            </div>
          </div>

          {/* CTA on wide screens */}
          <div className="cta-desktop relative z-10" style={{ marginLeft: 6 }}>
            {ctaText && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCtaClick}
                className="announcement-cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '5px 10px',
                  background: '#3DE6B3',
                  color: '#000000',
                  borderRadius: 5,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                }}
              >
                {ctaText}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Close button */}
      <div className="relative z-10" style={{ display: 'flex', alignItems: 'center' }}>
        <button
          onClick={dismiss}
          aria-label="Dismiss announcement"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 3,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M18 6L6 18" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 6l12 12" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

function isDismissed(id) {
  if (!id) return false;
  try {
    return localStorage.getItem(STORAGE_PREFIX + id) === "1";
  } catch (e) {
    return false;
  }
}

export { AnnouncementBanner };
export default AnnouncementBanner;
