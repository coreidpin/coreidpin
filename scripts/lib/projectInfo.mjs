import 'dotenv/config';

export function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || null;
}

export function getProjectRef() {
  const url = getSupabaseUrl();
  if (!url) return null;
  const m = url.replace(/\/$/, '').match(/^https?:\/\/([^\.]+)\.supabase\.co$/i);
  return m ? m[1] : null;
}

export function getProjectInfo() {
  const supabaseUrl = getSupabaseUrl();
  const projectRef = getProjectRef();
  return { supabaseUrl, projectRef };
}

export default getProjectInfo;
