import http from 'k6/http'
import { sleep, check } from 'k6'

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<800'],
  },
}

export default function () {
  const url = `${__ENV.BASE_URL || 'http://localhost:5173'}/functions/v1/server/login`
  const payload = JSON.stringify({ email: 'demo.professional@swipe.work', password: 'demo123' })
  const params = { headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'k6-csrf' } }
  const res = http.post(url, payload, params)
  check(res, { 'status is 200/400': (r) => [200, 400, 401, 429].includes(r.status) })
  sleep(1)
}
