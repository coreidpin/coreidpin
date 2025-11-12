import { test, expect } from '@playwright/test'
import fs from 'fs'

function ts() { return new Date().toISOString() }

test('Login with demo and dashboard persistence', async ({ page }) => {
  const logs: any[] = []
  function log(entry: any) { logs.push({ ts: ts(), ...entry }) }

  await page.goto('http://localhost:3000/login')
  await page.fill('#email', 'demo.professional@swipe.work')
  await page.fill('#password', 'demo123')
  await page.getByRole('button', { name: /Sign In/i }).click()
  await expect(page.getByText(/You have successfully logged in/i)).toBeVisible()
  await expect(page.getByText(/My PIN/i)).toBeVisible({ timeout: 5000 })
  log({ type: 'ui', state: 'dashboard_loaded' })

  await page.reload()
  await expect(page.getByText(/My PIN/i)).toBeVisible({ timeout: 5000 })
  log({ type: 'ui', state: 'dashboard_persist_after_refresh' })

  fs.mkdirSync('tests/logs', { recursive: true })
  fs.writeFileSync('tests/logs/login_dashboard.json', JSON.stringify(logs, null, 2))
})
