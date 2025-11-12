import { test, expect } from '@playwright/test'
import fs from 'fs'

function ts() { return new Date().toISOString() }

test.describe('User Registration E2E', () => {
  test('Full workflow: registration → email verification → login → dashboard → refresh', async ({ page, request }) => {
    const logs: any[] = []
    function log(entry: any) { logs.push({ ts: ts(), ...entry }) }

    page.on('request', (req) => {
      log({ type: 'request', url: req.url(), method: req.method(), headers: req.headers() })
    })
    page.on('response', async (res) => {
      let body: any = null
      try { body = await res.text() } catch {}
      log({ type: 'response', url: res.url(), status: res.status(), body })
    })

    const email = `e2e.${Date.now()}@example.com`
    const password = 'StrongPwd!123'

    await page.goto('http://localhost:3000/')
    log({ type: 'ui', state: 'landing_loaded' })

    await page.getByRole('button', { name: /Get Your PIN|Dashboard/i }).click()
    log({ type: 'ui', state: 'onboarding_started' })

    await expect(page.getByText(/Basic Information/i)).toBeVisible()

    await page.getByRole('button', { name: /Continue/i }).click()
    await expect(page.getByText(/Full name is required/i)).toBeVisible()
    log({ type: 'ui', validation: 'step0_errors', errorsShown: true })

    await page.fill('#name', 'E2E Tester')
    await page.fill('#email', 'bad-email')
    await page.fill('#title', 'QA Engineer')
    await page.fill('#location', 'Lagos, Nigeria')
    await page.fill('#password', '123')
    await page.fill('#confirmPassword', '123')
    await page.getByRole('button', { name: /Continue/i }).click()
    await expect(page.getByText(/Enter a valid email/i)).toBeVisible()
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible()
    log({ type: 'ui', validation: 'step0_invalids', errorsShown: true })

    await page.fill('#email', email)
    await page.fill('#password', password)
    await page.fill('#confirmPassword', password)
    await page.getByRole('button', { name: /Continue/i }).click()
    await expect(page.getByText(/Professional Details/i)).toBeVisible()
    log({ type: 'ui', state: 'step1_loaded' })

    await page.getByRole('button', { name: /Continue/i }).click()
    await expect(page.getByText(/Current company is required/i)).toBeVisible()
    log({ type: 'ui', validation: 'step1_errors', errorsShown: true })

    await page.getByText('1-5').click()
    await page.getByText('Select...').nth(1).click()
    await page.getByText('Mid').click()
    await page.fill('input[placeholder="e.g., Stripe"]', 'Stripe')
    await page.getByRole('button', { name: /Continue/i }).click()
    await expect(page.getByText(/Skills/i)).toBeVisible()
    log({ type: 'ui', state: 'step2_loaded' })

    await page.getByRole('button', { name: /Continue/i }).click()
    await expect(page.getByText(/Add at least 3 top skills/i)).toBeVisible()
    log({ type: 'ui', validation: 'step2_errors', errorsShown: true })

    await page.fill('input[placeholder="e.g., React"]', 'React')
    await page.keyboard.press('Enter')
    await page.fill('input[placeholder="e.g., React"]', 'TypeScript')
    await page.keyboard.press('Enter')
    await page.fill('input[placeholder="e.g., React"]', 'Playwright')
    await page.keyboard.press('Enter')
    await page.getByText('Select...').nth(0).click()
    await page.getByText('Bachelor').click()
    await page.getByRole('button', { name: /Continue/i }).click()
    await expect(page.getByText(/Almost there!/i)).toBeVisible()
    log({ type: 'ui', state: 'step3_loaded' })

    await page.getByLabel('Enable', { exact: true }).nth(1).check()
    await page.getByRole('button', { name: /Finish/i }).click()
    log({ type: 'ui', state: 'submitted' })

    await page.waitForTimeout(2000)

    const signRes = await request.post('/functions/v1/server/auth/dev/sign-token', {
      data: { email, minutes: 60 }
    })
    const signData = await signRes.json()
    log({ type: 'net', path: '/auth/dev/sign-token', status: signRes.status(), body: signData })
    expect(signData.success).toBeTruthy()
    const token = signData.token

    await page.goto(`http://localhost:3000/?token=${encodeURIComponent(token)}`)
    await page.waitForTimeout(500)
    log({ type: 'ui', state: 'verify_link_called' })

    await page.goto('http://localhost:3000/login')
    await page.fill('#email', email)
    await page.fill('#password', password)
    await page.getByRole('button', { name: /Sign In/i }).click()
    await expect(page.getByText(/You have successfully logged in/i)).toBeVisible()
    await expect(page.getByText(/My PIN/i)).toBeVisible({ timeout: 5000 })
    log({ type: 'ui', state: 'dashboard_loaded' })

    await page.reload()
    await expect(page.getByText(/My PIN/i)).toBeVisible({ timeout: 5000 })
    log({ type: 'ui', state: 'dashboard_persist_after_refresh' })

    const tampered = token.slice(0, -4) + 'abcd'
    const badRes = await request.get(`/functions/v1/server/auth/verify-link?token=${encodeURIComponent(tampered)}`)
    const badData = await badRes.json()
    log({ type: 'net', path: '/auth/verify-link', status: badRes.status(), body: badData })
    expect(badData.success).toBeFalsy()

    const usedRes = await request.get(`/functions/v1/server/auth/verify-link?token=${encodeURIComponent(token)}`)
    const usedData = await usedRes.json()
    log({ type: 'net', path: '/auth/verify-link', status: usedRes.status(), body: usedData })
    expect(usedRes.status()).toBe(410)

    fs.mkdirSync('tests/logs', { recursive: true })
    fs.writeFileSync('tests/logs/registration_e2e.json', JSON.stringify(logs, null, 2))
  })
})
