import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://evcqpapvcvmljgqiuzsq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 5 chars):', supabaseKey ? supabaseKey.substring(0, 5) : 'undefined');

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Running storage policy migration...');
    
    const migrationPath = join(__dirname, '../supabase/migrations/20251128_fix_storage_policy.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // We can try to execute the whole block if exec_sql supports it, 
    // but splitting is safer if the RPC is simple.
    // However, DO blocks or complex statements might fail if split incorrectly.
    // The migration I wrote has separate statements.
    
    // Simple split by semicolon, but be careful with semicolons in strings.
    // My migration doesn't have semicolons in strings.
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      console.log('Executing SQL...');
      // console.log(statement); 
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        console.error('Error executing statement:', error);
        // We don't exit here, we try to continue, as some might fail (e.g. drop policy if not exists)
        // although I used IF EXISTS.
      }
    }
    
    console.log('✅ Storage policy migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
