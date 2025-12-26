import React, { useEffect, useState } from 'react';
import { AnnouncementBanner } from './AnnouncementBanner';
import { notificationService } from '../admin/services/notification.service';

/**
 * LiveAnnouncementBanner
 * Fetches and displays active announcements from the database
 */
export function LiveAnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
    // Poll for new announcements every 5 minutes
    const interval = setInterval(loadAnnouncements, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAnnouncements = async () => {
    try {
      // Get user type from localStorage
      const userType = localStorage.getItem('userType') || 'professional';
      
      const activeAnnouncements = await notificationService.getActiveAnnouncements(userType);
      
      setAnnouncements(activeAnnouncements);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // Auto-rotate announcements every 10 seconds if there are multiple
  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(handleNext, 10000);
      return () => clearInterval(interval);
    }
  }, [announcements.length, currentIndex]);

  if (loading || announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <AnnouncementBanner
      id={currentAnnouncement.id}
      title={currentAnnouncement.title}
      message={currentAnnouncement.message}
      variant={currentAnnouncement.type}
      ctaText={announcements.length > 1 ? `${currentIndex + 1}/${announcements.length}` : undefined}
      ctaHref="#"
      onCtaClick={announcements.length > 1 ? handleNext : undefined}
    />
  );
}
