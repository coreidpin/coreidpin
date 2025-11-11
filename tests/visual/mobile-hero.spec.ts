import { test, expect } from '@playwright/test';


test.describe('Hero mobile alignment & desktop stability', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="hero-text"]');
  });

  const viewports = [
    { label: 's20-ultra-412x915', width: 412, height: 915 },
    { label: 'mobile-320x640', width: 320, height: 640 },
    { label: 'mobile-375x812', width: 375, height: 812 },
    { label: 'mobile-414x896', width: 414, height: 896 },
    { label: 'mobile-428x926', width: 428, height: 926 },
  ];

  for (const vp of viewports) {
    test(`mobile visual check: ${vp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const hero = page.locator('[data-testid="hero-text"]');
      await expect(hero).toBeVisible();
      await expect(hero).toHaveScreenshot(`${vp.label}.png`, { maxDiffPixelRatio: 0.01 });
    });
  }

  test('desktop regression (no visual change)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const hero = page.locator('[data-testid="hero-text"]');
    await expect(hero).toBeVisible();
    await expect(hero).toHaveScreenshot('desktop-hero-1440x900.png', { maxDiffPixelRatio: 0.005 });
  });
});