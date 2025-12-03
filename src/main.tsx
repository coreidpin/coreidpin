
import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App";
import "./index.css";
import { toast } from 'sonner';
import { registerServiceWorker } from './registerServiceWorker';

  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );

// Register service worker for PWA support
registerServiceWorker();


  

  
