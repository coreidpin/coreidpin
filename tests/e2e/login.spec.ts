import { test, expect } from '@playwright/test';

test.describe('Login E2E', () => {
  test('Demo user login shows success and redirects to dashboard', async ({ page }) => {
    await page.goto('/');

    // Open login page via Navbar
    await page.getByRole('button', { name: 'Login' }).click();

    await page.getByLabel('Email Address').fill('demo.professional@swipe.work');
    await page.locator('input#password').fill('demo123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Assert the WelcomeToast appears, then confirm dashboard redirect
    await expect(page.getByText('Welcome to Your Professional Dashboard!')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});