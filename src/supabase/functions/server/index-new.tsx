import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

// Import route modules
import { auth } from "./routes/auth.tsx";
import { profile } from "./routes/profile.tsx";
import { ai } from "./routes/ai.tsx";
import { professionals } from "./routes/professionals.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-5cd3a043/health", (c) => {
  return c.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "nwanne-api"
  });
});

// Mount route modules
app.route("/make-server-5cd3a043", auth);
app.route("/make-server-5cd3a043/profile", profile);
app.route("/make-server-5cd3a043/ai", ai);
app.route("/make-server-5cd3a043/professionals", professionals);

// 404 handler
app.notFound((c) => {
  return c.json({ 
    error: "Not Found",
    path: c.req.path,
    message: "The requested endpoint does not exist"
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ 
    error: "Internal Server Error",
    message: err.message
  }, 500);
});

// Start server
Deno.serve(app.fetch);
