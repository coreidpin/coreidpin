
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/mobile-fix.css";
import { toast } from 'sonner';
// import { registerServiceWorker } from './registerServiceWorker'; // Removed

import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Register service worker for PWA support
// registerServiceWorker(); // Removed
