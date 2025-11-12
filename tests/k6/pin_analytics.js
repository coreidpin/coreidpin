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
  const base = __ENV.BASE_URL || 'http://localhost:5173'
  const pin = __ENV.PIN || 'P-0000'
  const url = `${base}/functions/v1/server/pin/${pin}/analytics`
  const params = { headers: { 'Authorization': `Bearer ${__ENV.ACCESS_TOKEN || ''}` } }
  const res = http.get(url, params)
  check(res, { 'status ok/forbidden': (r) => [200, 403, 401].includes(r.status) })
  sleep(1)
}
