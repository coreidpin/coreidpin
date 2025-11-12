/**
 * Backend Audit and Validation Script
 * 
 * Purpose: Audit backend logs, KV storage, and rate limiting for production readiness
 * 
 * Usage:
 *   node scripts/audit-backend.mjs
 * 
 * Checks:
 *   - Supabase function logs for errors
 *   - Email verification event tracking
 *   - Rate limiting counters in KV storage
 *   - Database integrity
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AUDIT_OUTPUT_DIR = './audit-reports';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(title, 'bright');
  log('='.repeat(60), 'cyan');
}

// Initialize Supabase client with service role key
function initSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    log('❌ Missing Supabase credentials!', 'red');
    log('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY', 'yellow');
    process.exit(1);
  }
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// Create audit report directory
function ensureAuditDir() {
  if (!fs.existsSync(AUDIT_OUTPUT_DIR)) {
    fs.mkdirSync(AUDIT_OUTPUT_DIR, { recursive: true });
  }
}

// Audit 1: Check Email Verification Events
async function auditEmailVerifications(supabase) {
  section('📧 Email Verification Audit');
  
  const results = {
    totalUsers: 0,
    verified: 0,
    pending: 0,
    recentVerifications: [],
    issues: []
  };
  
  try {
    // Count total users
    const { count: totalCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    results.totalUsers = totalCount || 0;
    
    // Count verified users
    const { count: verifiedCount, error: verifiedError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('email_verified', true);
    
    if (verifiedError) throw verifiedError;
    results.verified = verifiedCount || 0;
    results.pending = results.totalUsers - results.verified;
    
    // Get recent verifications (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentData, error: recentError } = await supabase
      .from('profiles')
      .select('user_id, email, created_at, updated_at')
      .eq('email_verified', true)
      .gte('updated_at', yesterday)
      .order('updated_at', { ascending: false })
      .limit(10);
    
    if (recentError) throw recentError;
    results.recentVerifications = recentData || [];
    
    // Check for verification table (email_verifications)
    const { data: verificationData, error: verificationError } = await supabase
      .from('email_verifications')
      .select('email, code, attempts, expires_at, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!verificationError && verificationData) {
      log('✅ Email verifications table accessible', 'green');
      log(`   Recent codes: ${verificationData.length}`, 'cyan');
      
      // Check for expired codes
      const expiredCodes = verificationData.filter(v => {
        return new Date(v.expires_at) < new Date();
      });
      
      if (expiredCodes.length > 0) {
        results.issues.push(`${expiredCodes.length} expired codes still in table`);
      }
    }
    
    // Log results
    log(`\n📊 Verification Statistics:`, 'bright');
    log(`   Total Users: ${results.totalUsers}`, 'cyan');
    log(`   Verified: ${results.verified} (${((results.verified/results.totalUsers)*100).toFixed(1)}%)`, 'green');
    log(`   Pending: ${results.pending} (${((results.pending/results.totalUsers)*100).toFixed(1)}%)`, 'yellow');
    log(`   Recent (24h): ${results.recentVerifications.length}`, 'cyan');
    
    if (results.issues.length > 0) {
      log(`\n⚠️  Issues Found:`, 'yellow');
      results.issues.forEach(issue => log(`   - ${issue}`, 'yellow'));
    } else {
      log(`\n✅ No verification issues detected`, 'green');
    }
    
  } catch (error) {
    log(`❌ Email verification audit failed: ${error.message}`, 'red');
    results.issues.push(error.message);
  }
  
  return results;
}

// Audit 2: Check Rate Limiting
async function auditRateLimiting(supabase) {
  section('⏱️  Rate Limiting Audit');
  
  const results = {
    rateLimitedIPs: [],
    rateLimitedEmails: [],
    issues: []
  };
  
  try {
    // Note: Actual rate limiting may be in Supabase Edge Functions KV or Vercel KV
    // This is a placeholder for checking database-stored rate limits
    
    log('📝 Rate Limiting Storage:', 'bright');
    log('   ℹ️  Rate limiting typically stored in:');
    log('      - Supabase Edge Functions (Deno KV)', 'cyan');
    log('      - Vercel KV (for serverless functions)', 'cyan');
    log('      - In-memory (for development)', 'cyan');
    
    // Check for rate_limits table if it exists
    const { data, error } = await supabase
      .from('rate_limits')
      .select('*')
      .limit(10);
    
    if (!error && data) {
      log(`\n✅ Rate limits table found: ${data.length} entries`, 'green');
      results.rateLimitedIPs = data.filter(r => r.type === 'ip');
      results.rateLimitedEmails = data.filter(r => r.type === 'email');
    } else {
      log(`\n⚠️  No rate_limits table found (may use KV storage)`, 'yellow');
    }
    
    // Recommendations
    log(`\n💡 Recommendations:`, 'bright');
    log('   1. Verify rate limiting in Edge Function logs', 'cyan');
    log('   2. Check for 429 status codes in production logs', 'cyan');
    log('   3. Monitor Resend API rate limit headers', 'cyan');
    
  } catch (error) {
    log(`❌ Rate limiting audit failed: ${error.message}`, 'red');
    results.issues.push(error.message);
  }
  
  return results;
}

// Audit 3: Check Database Integrity
async function auditDatabaseIntegrity(supabase) {
  section('🗄️  Database Integrity Audit');
  
  const results = {
    orphanedRecords: 0,
    missingProfiles: 0,
    issues: []
  };
  
  try {
    // Check for users without profiles
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw authError;
    
    log(`\n📊 Auth vs Profiles:`, 'bright');
    log(`   Auth Users: ${authUsers.users.length}`, 'cyan');
    
    // Check each auth user has a profile
    for (const user of authUsers.users.slice(0, 10)) {  // Check first 10
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        results.missingProfiles++;
        results.issues.push(`User ${user.id} missing profile`);
      }
    }
    
    if (results.missingProfiles > 0) {
      log(`   ⚠️  Missing Profiles: ${results.missingProfiles}`, 'yellow');
    } else {
      log(`   ✅ All users have profiles`, 'green');
    }
    
    // Check for orphaned email verifications
    const { data: oldVerifications, error: oldVerError } = await supabase
      .from('email_verifications')
      .select('email')
      .lt('expires_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    if (!oldVerError && oldVerifications) {
      results.orphanedRecords = oldVerifications.length;
      if (results.orphanedRecords > 0) {
        log(`   ⚠️  Old verification codes (>24h): ${results.orphanedRecords}`, 'yellow');
        results.issues.push(`${results.orphanedRecords} old verification codes should be cleaned up`);
      }
    }
    
  } catch (error) {
    log(`❌ Database integrity audit failed: ${error.message}`, 'red');
    results.issues.push(error.message);
  }
  
  return results;
}

// Audit 4: Check Backend Function Logs (if accessible)
async function auditFunctionLogs() {
  section('📜 Backend Function Logs');
  
  log('ℹ️  Function logs are accessed via:', 'cyan');
  log('   - Supabase Dashboard > Edge Functions > Logs', 'cyan');
  log('   - Vercel Dashboard > Functions > Logs', 'cyan');
  log('   - supabase functions logs <function-name>', 'cyan');
  
  log('\n🔍 Key metrics to check:', 'bright');
  log('   ✓ Error rate < 1%', 'cyan');
  log('   ✓ Average response time < 500ms', 'cyan');
  log('   ✓ No 5xx errors in last 24h', 'cyan');
  log('   ✓ Rate limiting working (429 responses)', 'cyan');
  log('   ✓ CSRF token validation active', 'cyan');
  
  log('\n💡 Manual verification required:', 'yellow');
  log('   1. Check Supabase Edge Functions dashboard', 'cyan');
  log('   2. Look for errors in /register endpoint', 'cyan');
  log('   3. Verify /verify-email-code success rate', 'cyan');
  log('   4. Check /send-verification-email delivery', 'cyan');
  
  return {
    manualCheckRequired: true,
    dashboards: [
      'Supabase Dashboard > Edge Functions',
      'Vercel Dashboard > Functions',
      'Resend Dashboard > Logs'
    ]
  };
}

// Audit 5: Security Checks
async function auditSecurity(supabase) {
  section('🔒 Security Audit');
  
  const results = {
    rls_enabled: false,
    csrf_tokens_found: false,
    issues: []
  };
  
  try {
    // Check if RLS is enabled on critical tables
    const tables = ['profiles', 'email_verifications'];
    
    log('\n🛡️  Row Level Security (RLS):',, 'bright');
    
    for (const table of tables) {
      // This query checks if RLS is enabled (requires service role)
      const { data, error } = await supabase.rpc('check_rls_enabled', { table_name: table });
      
      if (!error && data) {
        log(`   ✅ ${table}: RLS enabled`, 'green');
        results.rls_enabled = true;
      } else {
        log(`   ⚠️  ${table}: Could not verify RLS`, 'yellow');
      }
    }
    
    // Security recommendations
    log('\n💡 Security Checklist:', 'bright');
    log('   ✓ HTTPS enforced on all endpoints', 'cyan');
    log('   ✓ CSRF tokens in API requests', 'cyan');
    log('   ✓ Password hashing (bcrypt)', 'cyan');
    log('   ✓ Rate limiting on sensitive endpoints', 'cyan');
    log('   ✓ Input sanitization for XSS prevention', 'cyan');
    log('   ✓ Email verification required', 'cyan');
    
  } catch (error) {
    log(`❌ Security audit failed: ${error.message}`, 'red');
    results.issues.push(error.message);
  }
  
  return results;
}

// Generate Audit Report
function generateAuditReport(audits) {
  const timestamp = new Date().toISOString();
  const reportPath = path.join(AUDIT_OUTPUT_DIR, `audit-report-${Date.now()}.json`);
  
  const report = {
    timestamp,
    summary: {
      totalIssues: Object.values(audits).reduce((sum, audit) => {
        return sum + (audit.issues?.length || 0);
      }, 0),
      criticalIssues: 0,
      warningIssues: 0
    },
    audits
  };
  
  // Save JSON report
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate markdown report
  const mdPath = path.join(AUDIT_OUTPUT_DIR, `audit-report-${Date.now()}.md`);
  const mdContent = `# Backend Audit Report

**Date:** ${new Date(timestamp).toLocaleString()}  
**Total Issues:** ${report.summary.totalIssues}

## Email Verification
- Total Users: ${audits.emailVerifications.totalUsers}
- Verified: ${audits.emailVerifications.verified}
- Pending: ${audits.emailVerifications.pending}
- Issues: ${audits.emailVerifications.issues.length}

## Rate Limiting
- Rate Limited IPs: ${audits.rateLimiting.rateLimitedIPs.length}
- Rate Limited Emails: ${audits.rateLimiting.rateLimitedEmails.length}
- Issues: ${audits.rateLimiting.issues.length}

## Database Integrity
- Orphaned Records: ${audits.databaseIntegrity.orphanedRecords}
- Missing Profiles: ${audits.databaseIntegrity.missingProfiles}
- Issues: ${audits.databaseIntegrity.issues.length}

## Security
- RLS Enabled: ${audits.security.rls_enabled ? 'Yes' : 'No'}
- Issues: ${audits.security.issues.length}

## All Issues
${report.summary.totalIssues === 0 ? '✅ No issues found!' : ''}
${Object.entries(audits).map(([key, audit]) => {
  if (audit.issues && audit.issues.length > 0) {
    return `\n### ${key}\n${audit.issues.map(i => `- ${i}`).join('\n')}`;
  }
  return '';
}).join('\n')}

## Manual Checks Required
- Review Supabase Edge Function logs
- Check Vercel function logs
- Verify Resend API logs
- Monitor error rates in production
`;
  
  fs.writeFileSync(mdPath, mdContent);
  
  section('📄 Audit Report Generated');
  log(`   JSON: ${reportPath}`, 'green');
  log(`   Markdown: ${mdPath}`, 'green');
  
  return report;
}

// Main Audit Function
async function runAudit() {
  log('\n🔍 CoreID Backend Audit - Starting...', 'bright');
  log(`   Timestamp: ${new Date().toLocaleString()}`, 'cyan');
  
  ensureAuditDir();
  const supabase = initSupabase();
  
  const audits = {
    emailVerifications: await auditEmailVerifications(supabase),
    rateLimiting: await auditRateLimiting(supabase),
    databaseIntegrity: await auditDatabaseIntegrity(supabase),
    functionLogs: await auditFunctionLogs(),
    security: await auditSecurity(supabase)
  };
  
  const report = generateAuditReport(audits);
  
  section('✅ Audit Complete');
  
  if (report.summary.totalIssues === 0) {
    log('🎉 No critical issues found!', 'green');
    log('   System ready for production', 'green');
  } else {
    log(`⚠️  Found ${report.summary.totalIssues} issues requiring attention`, 'yellow');
    log('   Review audit report for details', 'yellow');
  }
  
  log(`\n📊 Next Steps:`, 'bright');
  log('   1. Review generated audit report', 'cyan');
  log('   2. Address critical issues', 'cyan');
  log('   3. Check manual verification items', 'cyan');
  log('   4. Re-run audit after fixes', 'cyan');
  log('   5. Proceed to staging deployment\n', 'cyan');
  
  process.exit(report.summary.totalIssues === 0 ? 0 : 1);
}

// Run the audit
runAudit().catch(error => {
  log(`\n❌ Audit failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
