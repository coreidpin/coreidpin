// Service Worker Registration for CoreID PWA

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      if (import.meta.env.PROD) {
        // Production mode - register service worker
        registerValidSW(swUrl);
      } else {
        // Development mode - check if service worker can be found
        checkValidServiceWorker(swUrl);
      }
    });
  }
}

async function registerValidSW(swUrl: string) {
  try {
    const registration = await navigator.serviceWorker.register(swUrl);
    
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (installingWorker == null) {
        return;
      }

      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New content available, notify user
            console.log('New content available! Please refresh.');
            
            // Optional: Show update notification to user
            showUpdateNotification(registration);
          } else {
            // Content cached for offline use
            console.log('Content cached for offline use.');
          }
        }
      });
    });
  } catch (error) {
    console.error('Service worker registration failed:', error);
  }
}

async function checkValidServiceWorker(swUrl: string) {
  try {
    const response = await fetch(swUrl, {
      headers: { 'Service-Worker': 'script' }
    });

    const contentType = response.headers.get('content-type');
    if (
      response.status === 404 ||
      (contentType != null && contentType.indexOf('javascript') === -1)
    ) {
      // Service worker not found, reload page
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      window.location.reload();
    } else {
      // Service worker found, proceed with registration
      registerValidSW(swUrl);
    }
  } catch (error) {
    console.log('No internet connection. App is running in offline mode.');
  }
}

function showUpdateNotification(registration: ServiceWorkerRegistration) {
  // You can customize this to show a toast or banner to the user
  const shouldUpdate = confirm(
    'New version available! Click OK to update.'
  );

  if (shouldUpdate && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => registration.unregister())
      .catch(error => console.error(error.message));
  }
}
