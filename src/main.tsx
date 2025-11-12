
import { createRoot } from "react-dom/client";
import { checkFrontendEnv } from "./utils/envCheck";
  import App from "./App.tsx";
  import "./index.css";
  import { toast } from 'sonner@2.0.3';
  import ErrorBoundary from './components/ErrorBoundary';

  // Validate frontend env at startup
  checkFrontendEnv();

  createRoot(document.getElementById("root")!).render(<ErrorBoundary><App /></ErrorBoundary>);
  try {
    window.addEventListener('error', (e) => {
      try { toast.error('Unexpected error'); } catch {}
      import('./utils/monitoring').then(({ recordClientError }) => {
        try { recordClientError('window.onerror', String(e.error?.message || e.message || 'error'), (e.filename || '') + ':' + (e.lineno || '')); } catch {}
      }).catch(() => {})
    });
    window.addEventListener('unhandledrejection', (e: any) => {
      try { toast.error('Unhandled error'); } catch {}
      import('./utils/monitoring').then(({ recordClientError }) => {
        try { recordClientError('unhandledrejection', String(e?.reason?.message || e?.reason || 'rejection'), ''); } catch {}
      }).catch(() => {})
    });
  } catch {}
  if ((import.meta as any)?.env?.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.onupdatefound = () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.onstatechange = () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              try {
                toast.info('Update available', {
                  action: { label: 'Reload', onClick: () => window.location.reload() }
                });
              } catch {}
            }
          };
        };
      }).catch(() => {});
    });
  }
  
