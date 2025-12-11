// Debug Session Storage
// Run this in your browser console while on the Developer Console page

console.log('=== SESSION DEBUG ===');
console.log('All localStorage keys:', Object.keys(localStorage));
console.log('auth_session:', localStorage.getItem('auth_session'));
console.log('All localStorage items:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`  ${key}:`, localStorage.getItem(key)?.substring(0, 100));
}

// Check Supabase session
import { supabase } from './src/utils/supabase/client';
const { data: { session } } = await supabase.auth.getSession();
console.log('Supabase session:', session);
console.log('Access token:', session?.access_token?.substring(0, 50));
