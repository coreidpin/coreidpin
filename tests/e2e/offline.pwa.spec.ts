import { test, expect } from '@playwright/test';

test.describe('PWA offline banner and shell', () => {
  test('shows offline banner and shell remains navigable', async ({ page, context }) => {
    await page.goto('http://localhost:3000/');
    await context.setOffline(true);
    await page.reload();
    const banner = page.locator('text=You are offline');
    await expect(banner).toBeVisible();
    await expect(page.locator('#root')).toBeVisible();
    await context.setOffline(false);
  });
});

