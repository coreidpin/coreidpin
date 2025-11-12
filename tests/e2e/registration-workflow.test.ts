/**
 * End-to-End Registration Workflow Test
 * 
 * This comprehensive test suite validates the entire user registration workflow:
 * 1. Account Creation
 * 2. Email Verification
 * 3. Dashboard Access
 * 4. Session Persistence
 * 
 * @see docs/test-reports/registration-workflow-report.md for detailed test results
 */

import { test, expect, Page } from '@playwright/test';
import { supabase } from '../../src/utils/supabase/client';

// Test Data
const TEST_USER = {
  name: 'Test Professional User',
  title: 'Senior Software Engineer',
  email: `test-${Date.now()}@example.com`,
  location: 'Lagos, Nigeria',
  password: 'TestPass123!@#',
  confirmPassword: 'TestPass123!@#',
  phone: '+2348012345678',
  yearsOfExperience: '5-10' as const,
  currentCompany: 'Google',
  seniority: 'Senior' as const,
  topSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'],
  highestEducation: 'Bachelor' as const,
};

interface TestLog {
  timestamp: string;
  step: string;
  action: string;
  status: 'success' | 'failure' | 'warning';
  details: any;
  networkRequests?: any[];
  uiState?: any;
  errors?: any[];
}

class RegistrationTester {
  private page: Page;
  private logs: TestLog[] = [];
  private verificationCode: string | null = null;

  constructor(page: Page) {
    this.page = page;
  }

  private log(step: string, action: string, status: 'success' | 'failure' | 'warning', details: any) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      step,
      action,
      status,
      details,
    });
  }

  async navigateToRegistration() {
    this.log('Navigation', 'Navigate to registration page', 'success', { url: 'http://localhost:3001' });
    
    await this.page.goto('http://localhost:3001');
    await this.page.waitForLoadState('networkidle');
    
    // Click "Get Started" button
    const getStartedBtn = this.page.locator('text=Get Started').first();
    await expect(getStartedBtn).toBeVisible();
    await getStartedBtn.click();
    
    await this.page.waitForTimeout(1000);
    this.log('Navigation', 'Clicked Get Started button', 'success', { visible: true });
  }

  async fillStep1InvalidInputs() {
    this.log('Step 1 - Validation', 'Test invalid email format', 'success', {});
    
    // Test invalid email
    await this.page.fill('input[type="email"]', 'invalid-email');
    await this.page.click('text=Continue');
    
    const emailError = await this.page.locator('text=/email/i').first();
    const hasError = await emailError.isVisible().catch(() => false);
    
    this.log('Step 1 - Validation', 'Invalid email validation', hasError ? 'success' : 'failure', {
      errorVisible: hasError,
    });

    // Test weak password
    await this.page.fill('input[type="email"]', TEST_USER.email);
    await this.page.fill('input[type="password"]', 'weak');
    await this.page.click('text=Continue');
    
    const passwordError = await this.page.locator('text=/password/i').first();
    const hasPasswordError = await passwordError.isVisible().catch(() => false);
    
    this.log('Step 1 - Validation', 'Weak password validation', hasPasswordError ? 'success' : 'failure', {
      errorVisible: hasPasswordError,
    });
  }

  async fillStep1ValidInputs() {
    this.log('Step 1 - Form Fill', 'Fill basic information', 'success', TEST_USER);
    
    // Fill all Step 1 fields
    await this.page.fill('input[placeholder*="John"]', TEST_USER.name);
    await this.page.fill('input[placeholder*="Software"]', TEST_USER.title);
    await this.page.fill('input[type="email"]', TEST_USER.email);
    await this.page.fill('input[placeholder*="Lagos"]', TEST_USER.location);
    
    const passwordInputs = await this.page.locator('input[type="password"]').all();
    await passwordInputs[0].fill(TEST_USER.password);
    await passwordInputs[1].fill(TEST_USER.confirmPassword);
    
    await this.page.fill('input[type="tel"]', TEST_USER.phone);
    
    this.log('Step 1 - Form Fill', 'All fields filled successfully', 'success', {
      fieldsCount: 7,
    });
    
    await this.page.click('text=Continue');
    await this.page.waitForTimeout(1000);
  }

  async fillStep2() {
    this.log('Step 2 - Experience', 'Fill professional background', 'success', {});
    
    // Select years of experience
    await this.page.click('text=Years of Experience');
    await this.page.waitForTimeout(500);
    await this.page.click(`text=${TEST_USER.yearsOfExperience}`);
    
    // Fill current company
    await this.page.fill('input[placeholder*="Microsoft"]', TEST_USER.currentCompany);
    
    // Select seniority
    await this.page.click('text=Seniority Level');
    await this.page.waitForTimeout(500);
    await this.page.click(`text=${TEST_USER.seniority}`);
    
    this.log('Step 2 - Experience', 'Professional background filled', 'success', {
      yearsOfExperience: TEST_USER.yearsOfExperience,
      company: TEST_USER.currentCompany,
      seniority: TEST_USER.seniority,
    });
    
    await this.page.click('text=Continue');
    await this.page.waitForTimeout(1000);
  }

  async fillStep3() {
    this.log('Step 3 - Skills', 'Add skills and education', 'success', {});
    
    // Add skills
    for (const skill of TEST_USER.topSkills) {
      await this.page.fill('input[placeholder*="React"]', skill);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(300);
    }
    
    // Select education
    await this.page.click('text=Highest Education');
    await this.page.waitForTimeout(500);
    await this.page.click(`text=${TEST_USER.highestEducation}`);
    
    this.log('Step 3 - Skills', 'Skills and education added', 'success', {
      skillsCount: TEST_USER.topSkills.length,
      education: TEST_USER.highestEducation,
    });
    
    await this.page.click('text=Continue');
    await this.page.waitForTimeout(1000);
  }

  async fillStep4AndSubmit() {
    this.log('Step 4 - Verification', 'Configure verification methods', 'success', {});
    
    // Enable email verification (required)
    const emailCheckbox = await this.page.locator('input#verifyEmail');
    const isChecked = await emailCheckbox.isChecked();
    
    if (!isChecked) {
      await emailCheckbox.check();
    }
    
    // Enable AI verification
    await this.page.locator('input#verifyAI').check();
    
    this.log('Step 4 - Verification', 'Verification methods selected', 'success', {
      email: true,
      ai: true,
    });
    
    // Listen for network requests
    const requestPromises: Promise<any>[] = [];
    
    this.page.on('request', (request) => {
      if (request.url().includes('/functions/v1/')) {
        requestPromises.push(Promise.resolve({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
        }));
      }
    });
    
    this.page.on('response', async (response) => {
      if (response.url().includes('/functions/v1/')) {
        const body = await response.json().catch(() => null);
        this.log('Network', 'API Response', response.ok() ? 'success' : 'failure', {
          url: response.url(),
          status: response.status(),
          body,
        });
      }
    });
    
    // Submit registration
    await this.page.click('text=Finish');
    
    this.log('Step 4 - Submission', 'Registration submitted', 'success', {
      timestamp: new Date().toISOString(),
    });
    
    // Wait for submission to complete
    await this.page.waitForTimeout(5000);
  }

  async checkEmailVerification() {
    this.log('Email Verification', 'Check email sent', 'success', {});
    
    // Query database for verification code
    const { data, error } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', TEST_USER.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      this.log('Email Verification', 'Verification code not found in database', 'failure', { error });
      return false;
    }
    
    this.verificationCode = data.code;
    
    this.log('Email Verification', 'Verification code retrieved', 'success', {
      codeLength: this.verificationCode?.length,
      expiresAt: data.expires_at,
      verified: data.verified,
    });
    
    return true;
  }

  async testVerificationEdgeCases() {
    this.log('Email Verification', 'Test edge cases', 'success', {});
    
    // Test 1: Invalid code
    const invalidResponse = await fetch(`https://${process.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/verify-email-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        code: '000000',
      }),
    });
    
    const invalidResult = await invalidResponse.json();
    
    this.log('Email Verification', 'Invalid code test', invalidResult.success === false ? 'success' : 'failure', {
      expected: 'failure',
      actual: invalidResult,
    });
    
    // Test 2: Valid code
    if (this.verificationCode) {
      const validResponse = await fetch(`https://${process.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/verify-email-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: TEST_USER.email,
          code: this.verificationCode,
        }),
      });
      
      const validResult = await validResponse.json();
      
      this.log('Email Verification', 'Valid code test', validResult.success === true ? 'success' : 'failure', {
        expected: 'success',
        actual: validResult,
      });
      
      // Test 3: Reuse same code (should fail)
      const reuseResponse = await fetch(`https://${process.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/verify-email-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: TEST_USER.email,
          code: this.verificationCode,
        }),
      });
      
      const reuseResult = await reuseResponse.json();
      
      this.log('Email Verification', 'Reuse code test', reuseResult.success === false ? 'success' : 'failure', {
        expected: 'failure',
        actual: reuseResult,
      });
    }
  }

  async loginAndAccessDashboard() {
    this.log('Dashboard Access', 'Attempt login', 'success', {});
    
    await this.page.goto('http://localhost:3001/login');
    await this.page.waitForLoadState('networkidle');
    
    await this.page.fill('input[type="email"]', TEST_USER.email);
    await this.page.fill('input[type="password"]', TEST_USER.password);
    await this.page.click('button:has-text("Login")');
    
    await this.page.waitForTimeout(3000);
    
    // Check if dashboard is visible
    const dashboardVisible = await this.page.locator('text=/dashboard/i').isVisible().catch(() => false);
    
    this.log('Dashboard Access', 'Dashboard loaded', dashboardVisible ? 'success' : 'failure', {
      url: this.page.url(),
      dashboardVisible,
    });
    
    return dashboardVisible;
  }

  async testDashboardRefresh() {
    this.log('Dashboard Refresh', 'Test page refresh persistence', 'success', {});
    
    const urlBeforeRefresh = this.page.url();
    
    // Refresh page
    await this.page.reload({ waitUntil: 'networkidle' });
    await this.page.waitForTimeout(2000);
    
    const urlAfterRefresh = this.page.url();
    const stillOnDashboard = await this.page.locator('text=/dashboard/i').isVisible().catch(() => false);
    
    this.log('Dashboard Refresh', 'Session persisted after refresh', stillOnDashboard ? 'success' : 'failure', {
      urlBefore: urlBeforeRefresh,
      urlAfter: urlAfterRefresh,
      sessionPersisted: stillOnDashboard,
    });
    
    return stillOnDashboard;
  }

  getLogs() {
    return this.logs;
  }
}

test.describe('User Registration Workflow E2E', () => {
  let tester: RegistrationTester;

  test.beforeEach(async ({ page }) => {
    tester = new RegistrationTester(page);
  });

  test('Complete registration workflow', async ({ page }) => {
    // Step 1: Navigate to registration
    await tester.navigateToRegistration();
    
    // Step 2: Test form validation with invalid inputs
    await tester.fillStep1InvalidInputs();
    
    // Step 3: Fill Step 1 with valid inputs
    await tester.fillStep1ValidInputs();
    
    // Step 4: Fill Step 2
    await tester.fillStep2();
    
    // Step 5: Fill Step 3
    await tester.fillStep3();
    
    // Step 6: Fill Step 4 and submit
    await tester.fillStep4AndSubmit();
    
    // Step 7: Check email verification
    const emailSent = await tester.checkEmailVerification();
    expect(emailSent).toBeTruthy();
    
    // Step 8: Test verification edge cases
    await tester.testVerificationEdgeCases();
    
    // Step 9: Login and access dashboard
    const dashboardLoaded = await tester.loginAndAccessDashboard();
    expect(dashboardLoaded).toBeTruthy();
    
    // Step 10: Test dashboard refresh
    const sessionPersisted = await tester.testDashboardRefresh();
    expect(sessionPersisted).toBeTruthy();
    
    // Generate test report
    const logs = tester.getLogs();
    console.log('\n=== REGISTRATION WORKFLOW TEST REPORT ===\n');
    console.log(JSON.stringify(logs, null, 2));
  });
});
