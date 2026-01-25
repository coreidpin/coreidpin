import * as amplitude from '@amplitude/analytics-browser';
import * as sessionReplay from '@amplitude/session-replay-browser';

// Initialize Amplitude
let isInitialized = false;

export const initAmplitude = () => {
  if (isInitialized) return;
  
  try {
    // Initialize Amplitude with your API key
    amplitude.init('19609ed0ddc1ee5d2d22556bd8f134b2', {
      autocapture: {
        attribution: true,
        fileDownloads: true,
        formInteractions: true,
        pageViews: true,
        sessions: true,
        elementInteractions: true
      }
    });
    
    // Initialize session replay
    sessionReplay.init('19609ed0ddc1ee5d2d22556bd8f134b2', {
      sampleRate: 1
    }).promise;
    
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Amplitude:', error);
  }
};

// Track custom events
export const trackEvent = (eventName: string, eventProperties?: Record<string, any>) => {
  try {
    amplitude.track(eventName, eventProperties);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

// Identify user
export const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
  try {
    amplitude.setUserId(userId);
    if (userProperties) {
      const identifyEvent = new amplitude.Identify();
      Object.entries(userProperties).forEach(([key, value]) => {
        identifyEvent.set(key, value);
      });
      amplitude.identify(identifyEvent);
    }
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
};

// Reset user (on logout)
export const resetAmplitude = () => {
  try {
    amplitude.reset();
  } catch (error) {
    console.error('Failed to reset Amplitude:', error);
  }
};

export { amplitude };
