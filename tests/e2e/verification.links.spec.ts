import { test, expect } from '@playwright/test'
import fs from 'fs'

function ts() { return new Date().toISOString() }

test('Verification link scenarios', async ({ request }) => {
  const logs: any[] = []
  function log(entry: any) { logs.push({ ts: ts(), ...entry }) }

  const email = `e2e.${Date.now()}@example.com`
  const signRes = await request.post('/functions/v1/server/auth/dev/sign-token', { data: { email, minutes: 0 } })
  const signData = await signRes.json()
  log({ path: '/auth/dev/sign-token', status: signRes.status(), body: signData })
  expect(signData.success).toBeTruthy()

  const token = signData.token
  const validRes = await request.get(`/functions/v1/server/auth/verify-link?token=${encodeURIComponent(token)}`)
  const validData = await validRes.json()
  log({ path: '/auth/verify-link', status: validRes.status(), body: validData })
  expect(validRes.status()).toBe(400)

  const tampered = token.slice(0, -6) + 'xyz123'
  const badRes = await request.get(`/functions/v1/server/auth/verify-link?token=${encodeURIComponent(tampered)}`)
  const badData = await badRes.json()
  log({ path: '/auth/verify-link', status: badRes.status(), body: badData })
  expect(badData.success).toBeFalsy()

  fs.mkdirSync('tests/logs', { recursive: true })
  fs.writeFileSync('tests/logs/verification_links.json', JSON.stringify(logs, null, 2))
})
