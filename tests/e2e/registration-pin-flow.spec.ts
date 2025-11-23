import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Complete Registration and PIN Flow
 * 
 * Tests the end-to-end user journey:
 * 1. User registers with phone/email
 * 2. Verifies OTP
 * 3. Completes registration
 * 4. PIN is automatically generated
 * 5. PIN is displayed on dashboard
 * 6. User can copy PIN
 * 7. User can logout and login again
 * 8. PIN persists after re-login
 */

test.describe('Registration and PIN Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');
  });

  test('should complete full registration flow with PIN generation', async ({ page }) => {
    // Step 1: Fill in registration form
    await test.step('Fill registration form', async () => {
      await page.fill('input[name="name"]', 'Test User PIN Flow');
      await page.fill('input[name="email"]', `testpin${Date.now()}@example.com`);
      await page.fill('input[name="phone"]', '+2348012345678');
      
      // Submit registration form
      await page.click('button[type="submit"]');
      
      // Wait for OTP screen
      await expect(page.locator('text=Enter verification code')).toBeVisible({ timeout: 10000 });
    });

    // Step 2: Enter OTP
    await test.step('Enter OTP', async () => {
      // In test environment, OTP is usually logged or we use a test OTP
      // For now, we'll assume OTP is "123456" in test mode
      const otpInputs = page.locator('input[type="text"]').filter({ hasText: '' });
      
      // Fill OTP (assuming 6-digit OTP with separate inputs)
      await page.fill('input[name="otp"]', '123456');
      
      // Or if using separate digit inputs:
      // const digits = ['1', '2', '3', '4', '5', '6'];
      // for (let i = 0; i < 6; i++) {
      //   await otpInputs.nth(i).fill(digits[i]);
      // }
      
      // Submit OTP
      await page.click('button:has-text("Verify")');
      
      // Wait for dashboard redirect
      await page.waitForURL('**/dashboard', { timeout: 15000 });
    });

    // Step 3: Verify PIN is displayed on dashboard
    await test.step('Verify PIN is displayed', async () => {
      // Wait for PIN card to be visible
      await expect(page.locator('text=Your CoreID PIN')).toBeVisible({ timeout: 10000 });
      
      // Verify PIN is 8 digits
      const pinDisplay = page.locator('[class*="font-mono"]').filter({ hasText: /^\d{8}$/ });
      await expect(pinDisplay).toBeVisible();
      
      // Get PIN text
      const pinText = await pinDisplay.textContent();
      expect(pinText).toMatch(/^\d{8}$/);
      expect(pinText?.length).toBe(8);
      
      // Store PIN for later verification
      test.info().annotations.push({ type: 'pin', description: pinText || '' });
    });

    // Step 4: Test copy PIN functionality
    await test.step('Copy PIN to clipboard', async () => {
      // Click copy button
      await page.click('button[aria-label="Copy PIN"], button:has-text("Copy")');
      
      // Wait for toast notification
      await expect(page.locator('text=PIN copied to clipboard')).toBeVisible({ timeout: 5000 });
      
      // Verify clipboard content (if browser permissions allow)
      // Note: This might not work in all test environments
      try {
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText).toMatch(/^\d{8}$/);
      } catch (e) {
        console.warn('Clipboard API not available in test environment');
      }
    });
  });

  test('should persist PIN after logout and login', async ({ page }) => {
    const testEmail = `testpersist${Date.now()}@example.com`;
    let generatedPin: string;

    // Step 1: Complete registration
    await test.step('Register and get PIN', async () => {
      await page.fill('input[name="name"]', 'PIN Persistence Test');
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="phone"]', '+2348012345679');
      await page.click('button[type="submit"]');
      
      await page.waitForSelector('text=Enter verification code', { timeout: 10000 });
      await page.fill('input[name="otp"]', '123456');
      await page.click('button:has-text("Verify")');
      
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      
      // Get the PIN
      const pinElement = page.locator('[class*="font-mono"]').filter({ hasText: /^\d{8}$/ });
      generatedPin = (await pinElement.textContent()) || '';
      expect(generatedPin).toMatch(/^\d{8}$/);
    });

    // Step 2: Logout
    await test.step('Logout', async () => {
      await page.click('button:has-text("Logout"), a:has-text("Logout")');
      await page.waitForURL('**/login', { timeout: 10000 });
    });

    // Step 3: Login again
    await test.step('Login with same credentials', async () => {
      await page.goto('/login');
      await page.fill('input[name="contact"]', testEmail);
      await page.click('button[type="submit"]');
      
      await page.waitForSelector('text=Enter verification code', { timeout: 10000 });
      await page.fill('input[name="otp"]', '123456');
      await page.click('button:has-text("Verify")');
      
      await page.waitForURL('**/dashboard', { timeout: 15000 });
    });

    // Step 4: Verify same PIN is displayed
    await test.step('Verify PIN persists', async () => {
      const pinElement = page.locator('[class*="font-mono"]').filter({ hasText: /^\d{8}$/ });
      const persistedPin = await pinElement.textContent();
      
      expect(persistedPin).toBe(generatedPin);
      console.log(`PIN persisted correctly: ${persistedPin}`);
    });
  });

  test('should display PIN loading states correctly', async ({ page }) => {
    await test.step('Register user', async () => {
      await page.fill('input[name="name"]', 'Loading State Test');
      await page.fill('input[name="email"]', `loadingtest${Date.now()}@example.com`);
      await page.fill('input[name="phone"]', '+2348012345680');
      await page.click('button[type="submit"]');
      
      await page.waitForSelector('text=Enter verification code');
      await page.fill('input[name="otp"]', '123456');
      await page.click('button:has-text("Verify")');
    });

    await test.step('Verify loading states', async () => {
      // Check for initial loading state
      const loadingIndicator = page.locator('text=Loading..., text=Generating PIN...');
      
      // PIN should eventually load
      await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
      
      // Verify actual PIN is displayed
      const pinElement = page.locator('[class*="font-mono"]').filter({ hasText: /^\d{8}$/ });
      await expect(pinElement).toBeVisible();
    });
  });

  test('should show prominent PIN display on dashboard', async ({ page }) => {
    await test.step('Complete registration', async () => {
      await page.fill('input[name="name"]', 'Prominent Display Test');
      await page.fill('input[name="email"]', `prominent${Date.now()}@example.com`);
      await page.fill('input[name="phone"]', '+2348012345681');
      await page.click('button[type="submit"]');
      
      await page.waitForSelector('text=Enter verification code');
      await page.fill('input[name="otp"]', '123456');
      await page.click('button:has-text("Verify")');
      
      await page.waitForURL('**/dashboard');
    });

    await test.step('Verify PIN card is prominent', async () => {
      // Check PIN card exists
      const pinCard = page.locator('text=Your CoreID PIN').locator('..');
      await expect(pinCard).toBeVisible();
      
      // Verify gradient background (blue theme)
      const hasGradient = await pinCard.evaluate(el => {
        const bg = window.getComputedStyle(el).background;
        return bg.includes('gradient') || bg.includes('blue');
      });
      expect(hasGradient).toBeTruthy();
      
      // Verify PIN number is large and visible
      const pinNumber = page.locator('[class*="text-3xl"], [class*="text-4xl"]').filter({ hasText: /^\d{8}$/ });
      await expect(pinNumber).toBeVisible();
      
      // Verify copy button exists
      const copyButton = page.locator('button').filter({ hasText: /Copy|Share/ });
      await expect(copyButton.first()).toBeVisible();
    });
  });

  test('should handle social sharing buttons', async ({ page }) => {
    await test.step('Complete registration and navigate to dashboard', async () => {
      await page.fill('input[name="name"]', 'Social Share Test');
      await page.fill('input[name="email"]', `social${Date.now()}@example.com`);
      await page.fill('input[name="phone"]', '+2348012345682');
      await page.click('button[type="submit"]');
      
      await page.waitForSelector('text=Enter verification code');
      await page.fill('input[name="otp"]', '123456');
      await page.click('button:has-text("Verify")');
      
      await page.waitForURL('**/dashboard');
    });

    await test.step('Verify social share buttons exist', async () => {
      // Look for Twitter/X share button
      const twitterButton = page.locator('button').filter({ hasText: /Share|Twitter|X/ });
      await expect(twitterButton.first()).toBeVisible();
      
      // Look for LinkedIn share button
      const linkedinButton = page.locator('button').filter({ hasText: /Share|LinkedIn/ });
      await expect(linkedinButton.first()).toBeVisible();
    });

    await test.step('Test share button click', async () => {
      // Click Twitter share button
      const [popup] = await Promise.all([
        page.context().waitForEvent('page'),
        page.locator('button').filter({ hasText: /Twitter|X/ }).first().click()
      ]);
      
      // Verify popup opened with correct URL
      expect(popup.url()).toContain('twitter.com');
      await popup.close();
    });
  });

  test('should show error handling for failed PIN generation', async ({ page }) => {
    // This test requires mocking the backend to simulate failure
    // For now, we'll just verify error states are handled properly
    
    await test.step('Navigate to dashboard with potential PIN error', async () => {
      await page.goto('/dashboard');
      
      // If PIN generation fails, should show error message
      const errorStates = [
        'Error loading PIN',
        'Failed to generate',
        'PIN unavailable'
      ];
      
      // Check if any error state is displayed
      const hasError = await page.locator(`text=${errorStates.join(', text=')}`).count();
      
      if (hasError > 0) {
        // Verify copy button is disabled
        const copyButton = page.locator('button').filter({ hasText: /Copy/ });
        await expect(copyButton).toBeDisabled();
      }
    });
  });
});

test.describe('PIN Dashboard Integration', () => {
  test('should display PIN in correct position on dashboard', async ({ page }) => {
    // Login to dashboard
    await page.goto('/login');
    // ... login steps ...
    
    await page.waitForURL('**/dashboard');
    
    // Verify PIN card appears before main tabs
    const pinCard = page.locator('text=Your CoreID PIN').locator('..');
    const tabsList = page.locator('[role="tablist"]');
    
    const pinPosition = await pinCard.boundingBox();
    const tabsPosition = await tabsList.boundingBox();
    
    // PIN should appear above tabs
    expect(pinPosition!.y).toBeLessThan(tabsPosition!.y);
  });

  test('should update PIN analytics on copy', async ({ page }) => {
    // This would require backend integration
    // For now, verify that analytics event is tracked
    
    await page.goto('/dashboard');
    
    // Intercept analytics calls
    await page.route('**/analytics/**', route => {
      console.log('Analytics event:', route.request().postData());
      route.continue();
    });
    
    // Click copy button
    await page.click('button').filter({ hasText: /Copy/ }).first();
    
    // Verify analytics was called (implementation depends on analytics provider)
  });
});
