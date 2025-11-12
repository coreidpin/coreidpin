import { test, expect } from '@playwright/test'

test.describe('Brand color consistency', () => {
  test('Navbar uses brand background and foreground', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    const header = page.locator('header').first()
    const bg = await header.evaluate((el) => getComputedStyle(el).backgroundColor)
    const color = await header.evaluate((el) => getComputedStyle(el).color)
    expect(bg).toBe('rgb(11, 19, 43)')
    expect(color).toBe('rgb(255, 255, 255)')
  })

  test('Primary button uses brand colors', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    const btn = page.getByRole('button', { name: /get started|join/i }).first()
    const bg = await btn.evaluate((el) => getComputedStyle(el).backgroundColor)
    const color = await btn.evaluate((el) => getComputedStyle(el).color)
    expect(bg).toBe('rgb(50, 240, 140)')
    expect(color).toBe('rgb(11, 19, 43)')
  })
})

