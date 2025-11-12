import { test, expect } from '@playwright/test';

test.describe('Onboarding selector', () => {
  test('desktop split-screen shows two options only', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000/');
    // Open dialog via primary CTA
    await page.getByRole('button', { name: /get your pin/i }).click();
    await expect(page.getByText(/Join\s+PIN/i)).toBeVisible();

    // Ensure University option is not present
    await expect(page.getByText(/University/i)).toHaveCount(0);
    // Ensure Professional and Employer are present
    await expect(page.getByText(/Professional/i)).toBeVisible();
    await expect(page.getByText(/Employer/i)).toBeVisible();

    // Visual snapshot
    await expect(page).toHaveScreenshot('onboarding-desktop.png', { fullPage: false });
  });

  test('mobile single-column shows two options only', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
    await page.goto('http://localhost:3000/');
    await page.getByRole('button', { name: /get your pin/i }).click();
    await expect(page.getByText(/Join\s+PIN/i)).toBeVisible();

    await expect(page.getByText(/University/i)).toHaveCount(0);
    await expect(page.getByText(/Professional/i)).toBeVisible();
    await expect(page.getByText(/Employer/i)).toBeVisible();

    await expect(page).toHaveScreenshot('onboarding-mobile.png', { fullPage: false });
  });
});