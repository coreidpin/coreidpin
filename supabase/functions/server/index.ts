import app from "./index.tsx";

// Start the Edge Function request handler using Hono
// Supabase Edge Functions expect a fetch handler via Deno.serve
Deno.serve(app.fetch);

export default app;