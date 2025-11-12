import { test, expect } from '@playwright/test'
import fs from 'fs'

function ts() { return new Date().toISOString() }

test('Registration form validations (Step 0)', async ({ page }) => {
  const logs: any[] = []
  function log(entry: any) { logs.push({ ts: ts(), ...entry }) }

  await page.goto('http://localhost:3000/')
  await page.getByRole('button', { name: /Get Your PIN|Dashboard/i }).click()
  await expect(page.getByText(/Basic Information/i)).toBeVisible()

  await page.getByRole('button', { name: /Continue/i }).click()
  log({ type: 'ui', state: 'submit_empty' })
  await expect(page.getByText(/Full name is required/i)).toBeVisible()
  await expect(page.getByText(/Professional Title is required/i)).toBeVisible()
  await expect(page.getByText(/Email is required|Email Address/i)).toBeVisible()
  await expect(page.getByText(/Location is required/i)).toBeVisible()
  await expect(page.getByText(/Password is required/i)).toBeVisible()
  log({ type: 'ui', validations: 'required_fields_shown' })

  await page.fill('#email', 'invalid')
  await page.fill('#password', 'short')
  await page.fill('#confirmPassword', 'short')
  await page.getByRole('button', { name: /Continue/i }).click()
  await expect(page.getByText(/Enter a valid email/i)).toBeVisible()
  await expect(page.getByText(/at least 8 characters/i)).toBeVisible()
  log({ type: 'ui', validations: 'format_errors_shown' })

  fs.mkdirSync('tests/logs', { recursive: true })
  fs.writeFileSync('tests/logs/registration_validation.json', JSON.stringify(logs, null, 2))
})
