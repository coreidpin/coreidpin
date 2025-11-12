import { test, expect } from '@playwright/test'

test.describe('Dashboard Permissions', () => {
  test('Employer dashboard does not show professional analytics chart', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.getByLabel('Email Address').fill('demo.employer@swipe.work')
    await page.locator('input#password').fill('demo123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByText('Find Verified Nigerian Talent')).toBeVisible({ timeout: 15000 })
    const chart = page.locator('[data-chart="chart-pin-analytics"]')
    await expect(chart).toHaveCount(0)
  })
})

