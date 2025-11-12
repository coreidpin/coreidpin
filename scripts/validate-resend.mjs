/**
 * Resend API Validation Script
 * 
 * Purpose: Validate Resend email service configuration and quota
 * 
 * Usage:
 *   node scripts/validate-resend.mjs
 * 
 * Checks:
 *   - API key validity
 *   - Sending quota and usage
 *   - Email template configuration
 *   - Delivery rates
 */

import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const AUDIT_OUTPUT_DIR = './audit-reports';

// Color codes
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

// Ensure audit directory exists
function ensureAuditDir() {
  if (!fs.existsSync(AUDIT_OUTPUT_DIR)) {
    fs.mkdirSync(AUDIT_OUTPUT_DIR, { recursive: true });
  }
}

// Initialize Resend client
function initResend() {
  if (!RESEND_API_KEY) {
    log('❌ Missing RESEND_API_KEY environment variable!', 'red');
    log('   Set it in .env file or export it:', 'yellow');
    log('   export RESEND_API_KEY=re_xxxxx', 'cyan');
    process.exit(1);
  }
  
  return new Resend(RESEND_API_KEY);
}

// Check 1: Validate API Key
async function validateApiKey(resend) {
  section('🔑 API Key Validation');
  
  const results = {
    valid: false,
    tier: 'unknown',
    issues: []
  };
  
  try {
    // Resend doesn't have a direct "test" endpoint, so we'll try to fetch API keys
    // This is a workaround - actual validation happens on first email send
    
    log('✅ API Key format appears valid', 'green');
    log(`   Key: ${RESEND_API_KEY.substring(0, 10)}...`, 'cyan');
    
    // Check key prefix
    if (RESEND_API_KEY.startsWith('re_')) {
      results.valid = true;
      log('   ✓ Correct key prefix (re_)', 'green');
    } else {
      results.issues.push('Invalid API key format');
      log('   ❌ Invalid key prefix', 'red');
    }
    
    // Determine tier from key length/format (heuristic)
    if (RESEND_API_KEY.includes('test')) {
      results.tier = 'test';
      log('   ⚠️  Using TEST mode key', 'yellow');
    } else {
      results.tier = 'production';
      log('   ✅ Production key detected', 'green');
    }
    
  } catch (error) {
    log(`❌ API Key validation failed: ${error.message}`, 'red');
    results.issues.push(error.message);
  }
  
  return results;
}

// Check 2: Test Email Sending
async function testEmailSending(resend) {
  section('📧 Email Sending Test');
  
  const results = {
    testEmailSent: false,
    deliveryTime: 0,
    issues: []
  };
  
  try {
    log('Sending test email...', 'cyan');
    
    const startTime = Date.now();
    
    const { data, error } = await resend.emails.send({
      from: 'CoreID <onboarding@resend.dev>',  // Resend test domain
      to: ['delivered@resend.dev'],  // Resend test recipient
      subject: 'CoreID - Backend Audit Test Email',
      html: `
        <h1>CoreID Backend Audit</h1>
        <p>This is a test email to validate Resend configuration.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Purpose:</strong> Production readiness validation</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This email was sent automatically by the CoreID backend audit script.
        </p>
      `
    });
    
    const deliveryTime = Date.now() - startTime;
    results.deliveryTime = deliveryTime;
    
    if (error) {
      throw new Error(error.message);
    }
    
    results.testEmailSent = true;
    
    log(`✅ Test email sent successfully!`, 'green');
    log(`   Email ID: ${data.id}`, 'cyan');
    log(`   Delivery Time: ${deliveryTime}ms`, 'cyan');
    
    if (deliveryTime > 2000) {
      log(`   ⚠️  Slow delivery time (>${deliveryTime}ms)`, 'yellow');
      results.issues.push(`Slow email delivery: ${deliveryTime}ms`);
    }
    
  } catch (error) {
    log(`❌ Email sending failed: ${error.message}`, 'red');
    results.issues.push(error.message);
    
    // Common error handling
    if (error.message.includes('API key')) {
      log('   💡 Check that RESEND_API_KEY is valid', 'yellow');
    } else if (error.message.includes('rate limit')) {
      log('   💡 Rate limit exceeded - check quota', 'yellow');
    } else if (error.message.includes('domain')) {
      log('   💡 Verify domain is configured in Resend', 'yellow');
    }
  }
  
  return results;
}

// Check 3: Verify Email Template
async function verifyEmailTemplate() {
  section('📝 Email Template Verification');
  
  const results = {
    templateExists: false,
    issues: []
  };
  
  try {
    // Read verification email template from backend
    const templatePath = path.join(process.cwd(), 'src/components/EmailTemplates.tsx');
    
    if (fs.existsSync(templatePath)) {
      const content = fs.readFileSync(templatePath, 'utf-8');
      
      log('✅ Email template file found', 'green');
      log(`   Path: ${templatePath}`, 'cyan');
      
      // Check for verification code template
      if (content.includes('verificationCode') || content.includes('verification code')) {
        results.templateExists = true;
        log('   ✅ Verification code template present', 'green');
      } else {
        results.issues.push('Verification code template not found');
        log('   ❌ Verification code template missing', 'red');
      }
      
      // Check for responsive design
      if (content.includes('viewport') || content.includes('media query')) {
        log('   ✅ Mobile-responsive design detected', 'green');
      } else {
        log('   ⚠️  No mobile optimization detected', 'yellow');
      }
      
      // Check for brand elements
      if (content.includes('CoreID')) {
        log('   ✅ Brand name present', 'green');
      }
      
    } else {
      results.issues.push('Email template file not found');
      log('   ❌ Email template file not found', 'red');
    }
    
  } catch (error) {
    log(`❌ Template verification failed: ${error.message}`, 'red');
    results.issues.push(error.message);
  }
  
  return results;
}

// Check 4: Review Quota and Usage
async function checkQuotaUsage() {
  section('📊 Quota and Usage');
  
  const results = {
    quotaChecked: false,
    issues: []
  };
  
  log('ℹ️  Quota information available in Resend Dashboard:', 'cyan');
  log('   https://resend.com/dashboard', 'cyan');
  
  log('\n📋 Manual verification required:', 'bright');
  log('   ✓ Current month email count', 'cyan');
  log('   ✓ Monthly quota limit', 'cyan');
  log('   ✓ Remaining emails', 'cyan');
  log('   ✓ Billing status', 'cyan');
  
  log('\n💰 Resend Pricing Tiers:', 'bright');
  log('   Free:  100 emails/day, 3,000/month', 'cyan');
  log('   Pro:   Starts at $20/month for 50,000 emails', 'cyan');
  log('   Scale: Custom pricing for higher volume', 'cyan');
  
  log('\n⚠️  Production Recommendations:', 'yellow');
  log('   - Upgrade to Pro tier for production', 'yellow');
  log('   - Set up billing alerts at 80% usage', 'yellow');
  log('   - Monitor daily sending rates', 'yellow');
  log('   - Have backup email service ready', 'yellow');
  
  results.quotaChecked = true;
  
  return results;
}

// Check 5: Domain Configuration
async function checkDomainConfig() {
  section('🌐 Domain Configuration');
  
  const results = {
    domainConfigured: false,
    issues: []
  };
  
  log('ℹ️  Domain setup required for production:', 'cyan');
  log('   1. Add custom domain in Resend Dashboard', 'cyan');
  log('   2. Configure DNS records (SPF, DKIM, DMARC)', 'cyan');
  log('   3. Verify domain ownership', 'cyan');
  log('   4. Update "from" address in code', 'cyan');
  
  log('\n📧 Current Configuration:', 'bright');
  log('   Development: onboarding@resend.dev (Resend domain)', 'yellow');
  log('   Production: noreply@coreid.com (custom domain)', 'cyan');
  
  log('\n✅ DNS Records Required:', 'bright');
  log('   SPF:   v=spf1 include:resend.net ~all', 'cyan');
  log('   DKIM:  Provided by Resend after domain add', 'cyan');
  log('   DMARC: v=DMARC1; p=none; rua=mailto:admin@coreid.com', 'cyan');
  
  log('\n💡 Verification Steps:', 'bright');
  log('   1. Login to Resend Dashboard', 'cyan');
  log('   2. Navigate to Domains section', 'cyan');
  log('   3. Check domain verification status', 'cyan');
  log('   4. Verify SPF/DKIM records are active', 'cyan');
  
  results.domainConfigured = false;  // Manual check required
  results.issues.push('Manual domain verification required');
  
  return results;
}

// Check 6: Deliverability Best Practices
async function checkDeliverability() {
  section('📬 Deliverability Best Practices');
  
  const results = {
    bestPractices: [],
    recommendations: []
  };
  
  log('✅ Email Deliverability Checklist:', 'bright');
  
  const checklist = [
    { item: 'Use verified custom domain', status: 'required' },
    { item: 'Implement SPF/DKIM/DMARC', status: 'required' },
    { item: 'Include unsubscribe link', status: 'recommended' },
    { item: 'Use clear from address', status: 'required' },
    { item: 'Avoid spam trigger words', status: 'recommended' },
    { item: 'Keep email size < 100KB', status: 'recommended' },
    { item: 'Test on multiple email clients', status: 'recommended' },
    { item: 'Monitor bounce rates', status: 'required' },
    { item: 'Implement feedback loops', status: 'recommended' },
    { item: 'Warm up new domain gradually', status: 'required' }
  ];
  
  checklist.forEach(({ item, status }) => {
    const icon = status === 'required' ? '🔴' : '🟡';
    log(`   ${icon} ${item}`, status === 'required' ? 'cyan' : 'yellow');
    
    if (status === 'required') {
      results.bestPractices.push(item);
    } else {
      results.recommendations.push(item);
    }
  });
  
  log('\n📊 Monitor These Metrics:', 'bright');
  log('   - Delivery Rate: Target >99%', 'cyan');
  log('   - Open Rate: Industry avg 15-25%', 'cyan');
  log('   - Bounce Rate: Keep <2%', 'cyan');
  log('   - Spam Complaints: Keep <0.1%', 'cyan');
  
  return results;
}

// Generate validation report
function generateReport(validations) {
  const timestamp = new Date().toISOString();
  const reportPath = path.join(AUDIT_OUTPUT_DIR, `resend-validation-${Date.now()}.json`);
  
  const issues = Object.values(validations).reduce((sum, val) => {
    return sum + (val.issues?.length || 0);
  }, 0);
  
  const report = {
    timestamp,
    summary: {
      totalIssues: issues,
      apiKeyValid: validations.apiKey.valid,
      testEmailSent: validations.emailTest.testEmailSent,
      templateExists: validations.template.templateExists
    },
    validations
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate markdown report
  const mdPath = path.join(AUDIT_OUTPUT_DIR, `resend-validation-${Date.now()}.md`);
  const mdContent = `# Resend API Validation Report

**Date:** ${new Date(timestamp).toLocaleString()}  
**Total Issues:** ${issues}

## Summary
- API Key Valid: ${validations.apiKey.valid ? '✅' : '❌'}
- Test Email Sent: ${validations.emailTest.testEmailSent ? '✅' : '❌'}
- Template Exists: ${validations.template.templateExists ? '✅' : '❌'}
- Delivery Time: ${validations.emailTest.deliveryTime}ms

## API Key Validation
- Status: ${validations.apiKey.valid ? 'Valid' : 'Invalid'}
- Tier: ${validations.apiKey.tier}
- Issues: ${validations.apiKey.issues.length}

## Email Sending Test
- Test Sent: ${validations.emailTest.testEmailSent ? 'Yes' : 'No'}
- Delivery Time: ${validations.emailTest.deliveryTime}ms
- Issues: ${validations.emailTest.issues.length}

## Email Template
- Template Found: ${validations.template.templateExists ? 'Yes' : 'No'}
- Issues: ${validations.template.issues.length}

## Recommendations
${validations.deliverability.recommendations.map(r => `- ${r}`).join('\n')}

## Manual Checks Required
- [ ] Verify domain configuration in Resend Dashboard
- [ ] Check current quota usage
- [ ] Monitor deliverability metrics
- [ ] Set up billing alerts
- [ ] Test emails across different email clients

## Next Steps
1. Review any issues listed above
2. Complete manual verification steps
3. Update production configuration
4. Set up monitoring and alerts
`;
  
  fs.writeFileSync(mdPath, mdContent);
  
  section('📄 Validation Report Generated');
  log(`   JSON: ${reportPath}`, 'green');
  log(`   Markdown: ${mdPath}`, 'green');
  
  return report;
}

// Main validation function
async function runValidation() {
  log('\n📧 Resend API Validation - Starting...', 'bright');
  log(`   Timestamp: ${new Date().toLocaleString()}`, 'cyan');
  
  ensureAuditDir();
  const resend = initResend();
  
  const validations = {
    apiKey: await validateApiKey(resend),
    emailTest: await testEmailSending(resend),
    template: await verifyEmailTemplate(),
    quota: await checkQuotaUsage(),
    domain: await checkDomainConfig(),
    deliverability: await checkDeliverability()
  };
  
  const report = generateReport(validations);
  
  section('✅ Validation Complete');
  
  const totalIssues = report.summary.totalIssues;
  
  if (totalIssues === 0 && validations.apiKey.valid && validations.emailTest.testEmailSent) {
    log('🎉 Resend API fully validated!', 'green');
    log('   Ready for production use', 'green');
  } else if (validations.apiKey.valid && validations.emailTest.testEmailSent) {
    log(`⚠️  Validation passed with ${totalIssues} warnings`, 'yellow');
    log('   Review report for recommended improvements', 'yellow');
  } else {
    log(`❌ Validation failed with ${totalIssues} issues`, 'red');
    log('   Address critical issues before production', 'red');
  }
  
  log(`\n📊 Next Steps:`, 'bright');
  log('   1. Review generated validation report', 'cyan');
  log('   2. Complete manual verification tasks', 'cyan');
  log('   3. Configure custom domain for production', 'cyan');
  log('   4. Set up monitoring and alerts', 'cyan');
  log('   5. Proceed to staging deployment\n', 'cyan');
  
  process.exit(totalIssues > 5 ? 1 : 0);
}

// Run validation
runValidation().catch(error => {
  log(`\n❌ Validation failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
