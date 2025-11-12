import { test, expect } from '@playwright/test'

test.describe('Dashboard Analytics', () => {
  test('Professional dashboard shows PIN analytics chart', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.getByLabel('Email Address').fill('demo.professional@swipe.work')
    await page.locator('input#password').fill('demo123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByText('PIN Performance')).toBeVisible({ timeout: 15000 })
    const chart = page.locator('[data-chart="chart-pin-analytics"]')
    await expect(chart).toBeVisible({ timeout: 15000 })
  })
})

