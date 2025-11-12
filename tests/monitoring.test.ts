import { describe, it, expect } from 'vitest'
import { collectPerformanceMetrics } from '../src/utils/monitoring'

describe('Monitoring metrics collection', () => {
  it('collects basic navigation timings', () => {
    const m = collectPerformanceMetrics()
    expect(m).toHaveProperty('navigationStart')
    expect(m).toHaveProperty('responseEnd')
    expect(m).toHaveProperty('domContentLoaded')
    expect(m).toHaveProperty('loadEventEnd')
  })
})

