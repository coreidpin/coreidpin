
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env vars
// Note: We need to point to the .env file in the root
// Since we are running this with node, we might need to be careful with paths
dotenv.config();

// Hardcoded for verification script (copied from info.tsx)
const projectId = "evcqpapvcvmljgqiuzsq";
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Y3FwYXB2Y3ZtbGpncWl1enNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3ODk2MzIsImV4cCI6MjA3ODM2NTYzMn0.U4XapYqi_4KAemNTwx88mLVBKVrzBp0_mMrIgZwcXa8";

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDb() {
  console.log('Verifying DB connection and tables...');

  // 1. Check system_settings
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .limit(1);

    if (error) {
        if (error.code === '42P01') {
            console.error('❌ Table system_settings does NOT exist.');
        } else {
            console.error('❌ Error accessing system_settings:', error);
        }
    } else {
        console.log('✅ Table system_settings exists. Rows found:', data.length);
    }
  } catch (e) {
      console.error('Exception checking system_settings:', e);
  }

  // 2. Check admin_users
  try {
    const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .limit(1);
    
    if (adminError) {
         if (adminError.code === '42P01') {
            console.error('❌ Table admin_users does NOT exist.');
        } else {
            console.error('❌ Error accessing admin_users:', adminError);
        }
    } else {
        console.log('✅ Table admin_users exists.');
    }
  } catch (e) {
    console.error('Exception checking admin_users:', e);
  }

}

verifyDb().catch(console.error);
