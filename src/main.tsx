
import { createRoot } from "react-dom/client";
import { checkFrontendEnv } from "./utils/envCheck";
  import App from "./App.tsx";
  import "./index.css";

  // Validate frontend env at startup
  checkFrontendEnv();

  createRoot(document.getElementById("root")!).render(<App />);
  