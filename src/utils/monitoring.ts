export type PerformanceMetrics = {
  navigationStart: number
  responseEnd: number
  domContentLoaded: number
  loadEventEnd: number
}

export function collectPerformanceMetrics(): PerformanceMetrics {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  if (nav) {
    return {
      navigationStart: nav.startTime,
      responseEnd: nav.responseEnd,
      domContentLoaded: nav.domContentLoadedEventEnd,
      loadEventEnd: nav.loadEventEnd,
    }
  }
  const timing = performance.timing as any
  return {
    navigationStart: timing?.navigationStart || 0,
    responseEnd: timing?.responseEnd || 0,
    domContentLoaded: timing?.domContentLoadedEventEnd || 0,
    loadEventEnd: timing?.loadEventEnd || 0,
  }
}

export function initMonitoring() {
  try {
    const send = async () => {
      const metrics = collectPerformanceMetrics()
      const payload = JSON.stringify({ type: 'web-vitals-basic', metrics, ts: new Date().toISOString() })
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const url = origin ? new URL('/functions/v1/server/diagnostics/metrics', origin).toString() : '/functions/v1/server/diagnostics/metrics'
      const anonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      const auth = accessToken || anonKey || ''
      try {
        await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(auth ? { 'Authorization': `Bearer ${auth}`, 'apikey': auth } : {}) }, body: payload, keepalive: true })
      } catch {
        if (navigator.sendBeacon) {
          try { navigator.sendBeacon(url, payload) } catch {}
        }
      }
      try { localStorage.setItem('lastMetrics', payload) } catch {}
    }
    if (document.readyState === 'complete') send().catch(() => {})
    else window.addEventListener('load', () => { send().catch(() => {}) }, { once: true } as any)
  } catch {}
}

export function recordApiLatency(endpoint: string, ms: number) {
  try {
    const payload = JSON.stringify({ type: 'api-latency', endpoint, ms, ts: new Date().toISOString() })
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = origin ? new URL('/functions/v1/server/diagnostics/metrics', origin).toString() : '/functions/v1/server/diagnostics/metrics'
    const anonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const auth = accessToken || anonKey || ''
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(auth ? { 'Authorization': `Bearer ${auth}`, 'apikey': auth } : {}) }, body: payload, keepalive: true }).catch(() => {
      if (navigator.sendBeacon) {
        try { navigator.sendBeacon(url, payload) } catch {}
      }
    })
  } catch {}
}

export function recordClientError(kind: string, message: string, detail: string) {
  try {
    const payload = JSON.stringify({ type: 'client-error', kind, message, detail, ts: new Date().toISOString() })
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = origin ? new URL('/functions/v1/server/diagnostics/errors', origin).toString() : '/functions/v1/server/diagnostics/errors'
    const anonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const auth = accessToken || anonKey || ''
    if (!auth) return
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth}`, 'apikey': auth }, body: payload, keepalive: true }).catch(() => {
      if (navigator.sendBeacon) { try { navigator.sendBeacon(url, payload) } catch {} }
    })
  } catch {}
}
