export function checkFrontendEnv() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  const urlOk = !!url && /^https:\/\/[-a-z0-9]+\.supabase\.co\/?$/i.test(url.trim());
  const anonOk = !!anon && !/\s/.test(anon);

  if (!urlOk || !anonOk) {
    const issues: string[] = [];
    if (!urlOk) issues.push('VITE_SUPABASE_URL missing or invalid');
    if (!anonOk) issues.push('VITE_SUPABASE_ANON_KEY missing or contains whitespace');
    // Log a clear, actionable message without breaking dev unexpectedly
    console.error('Frontend environment validation failed:', issues);
  }
}
