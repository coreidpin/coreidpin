import React, { useEffect, useState } from "react";
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

const bgByVariant = {
  info: "#F5F8FF",
  success: "#F3FFF7",
  warning: "#FFF8F0",
  neutral: "#F7F7F8",
};

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
    <div
      role="region"
      aria-label={`Announcement: ${title}`}
      className="announcement-banner"
      style={{
        background: bgByVariant[variant] || bgByVariant.info,
        borderRadius: 8,
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 6px 22px rgba(9,10,11,0.06)",
      }}
    >
      {/* Icon container */}
      <div
        className="announcement-icon"
        style={{
          minWidth: 36,
          minHeight: 36,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.04)",
        }}
        aria-hidden
      >
        {/* Simple inline SVG icon (megaphone) */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 10v4h3l7 5V5L6 10H3z" fill="#0A0B0D" opacity="0.9" />
          <path d="M20 8v8a1 1 0 0 1-1.447.894L16 15H15V9h1l2.553-1.894A1 1 0 0 1 20 8z" fill="#7BB8FF" />
        </svg>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                color: "#0A0B0D",
                fontSize: 15,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </div>
            <div
              style={{
                marginTop: 4,
                color: "#333",
                fontSize: 14,
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {message}
            </div>
          </div>

          {/* CTA on wide screens */}
          <div className="cta-desktop" style={{ marginLeft: 12 }}>
            {ctaText && (
              <button
                onClick={onCtaClick}
                className="announcement-cta"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "8px 14px",
                  background: "#0A2540",
                  color: "#FFFFFF",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {ctaText}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile CTA fallback shown via CSS; close button */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={dismiss}
          aria-label="Dismiss announcement"
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 6,
            borderRadius: 6,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M18 6L6 18" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 6l12 12" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
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
