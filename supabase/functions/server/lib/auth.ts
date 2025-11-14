import { getSupabaseClient } from './supabaseClient.tsx';

const supabase = getSupabaseClient();

export async function requireAuth(c: any, next: any) {
  try {
    const authz = c.req.header('Authorization') || '';
    const cookie = c.req.header('Cookie') || '';
    
    let token = '';
    if (authz.startsWith('Bearer ')) {
      token = authz.slice(7);
    } else if (cookie) {
      const match = /sb_access_token=([^;]+)/.exec(cookie);
      if (match) token = decodeURIComponent(match[1]);
    }

    if (!token) {
      return c.json({ success: false, error: 'No token provided' }, 401);
    }

    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data?.user) {
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }

    c.set('userId', data.user.id);
    c.set('user', data.user);
    
    await next();
  } catch (error: any) {
    return c.json({ success: false, error: 'Authentication failed' }, 401);
  }
}