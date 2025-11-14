// Monitoring and metrics collection for registration system

interface MetricData {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

interface RegistrationMetrics {
  registrationAttempts: number
  registrationSuccesses: number
  registrationFailures: number
  emailVerifications: number
  verificationRate: number
  avgResponseTime: number
  systemSyncSuccesses: number
  systemSyncFailures: number
}

class MonitoringService {
  private metrics: MetricData[] = []
  private registrationMetrics: RegistrationMetrics = {
    registrationAttempts: 0,
    registrationSuccesses: 0,
    registrationFailures: 0,
    emailVerifications: 0,
    verificationRate: 0,
    avgResponseTime: 0,
    systemSyncSuccesses: 0,
    systemSyncFailures: 0
  }

  // Record registration attempt
  recordRegistrationAttempt(success: boolean, responseTime: number, error?: string) {
    this.registrationMetrics.registrationAttempts++
    
    if (success) {
      this.registrationMetrics.registrationSuccesses++
    } else {
      this.registrationMetrics.registrationFailures++
    }

    // Update average response time
    this.registrationMetrics.avgResponseTime = 
      (this.registrationMetrics.avgResponseTime + responseTime) / 2

    this.recordMetric('registration_attempt', 1, {
      success: success.toString(),
      error: error || 'none'
    })

    this.recordMetric('registration_response_time', responseTime)
  }

  // Record email verification
  recordEmailVerification(success: boolean, timeToVerify?: number) {
    if (success) {
      this.registrationMetrics.emailVerifications++
      
      // Calculate verification rate
      this.registrationMetrics.verificationRate = 
        (this.registrationMetrics.emailVerifications / this.registrationMetrics.registrationSuccesses) * 100
    }

    this.recordMetric('email_verification', 1, {
      success: success.toString(),
      time_to_verify: timeToVerify?.toString() || 'unknown'
    })
  }

  // Record system synchronization
  recordSystemSync(success: boolean, syncType: string, duration: number) {
    if (success) {
      this.registrationMetrics.systemSyncSuccesses++
    } else {
      this.registrationMetrics.systemSyncFailures++
    }

    this.recordMetric('system_sync', 1, {
      success: success.toString(),
      type: syncType,
      duration: duration.toString()
    })
  }

  // Record security events
  recordSecurityEvent(eventType: string, severity: 'low' | 'medium' | 'high', details: Record<string, any>) {
    this.recordMetric('security_event', 1, {
      type: eventType,
      severity,
      ...details
    })

    // Alert on high severity events
    if (severity === 'high') {
      this.sendAlert(`High severity security event: ${eventType}`, details)
    }
  }

  // Record performance metrics
  recordPerformanceMetric(operation: string, duration: number, success: boolean) {
    this.recordMetric(`performance_${operation}`, duration, {
      success: success.toString()
    })

    // Alert if operation exceeds SLA
    const slaThresholds = {
      registration: 500, // 500ms
      email_delivery: 10000, // 10s
      system_sync: 1000 // 1s
    }

    if (slaThresholds[operation as keyof typeof slaThresholds] && 
        duration > slaThresholds[operation as keyof typeof slaThresholds]) {
      this.sendAlert(`SLA breach: ${operation} took ${duration}ms`, { operation, duration })
    }
  }

  // Record general metric
  private recordMetric(name: string, value: number, tags?: Record<string, string>) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      tags
    })

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // Send to external monitoring service (implement based on your service)
    this.sendToMonitoringService(name, value, tags)
  }

  // Get current metrics summary
  getMetricsSummary(): RegistrationMetrics & { availability: number } {
    const totalAttempts = this.registrationMetrics.registrationAttempts
    const successRate = totalAttempts > 0 
      ? (this.registrationMetrics.registrationSuccesses / totalAttempts) * 100 
      : 100

    // Calculate availability (99.9% SLA target)
    const availability = Math.min(successRate, 99.9)

    return {
      ...this.registrationMetrics,
      availability
    }
  }

  // Health check endpoint data
  getHealthStatus() {
    const metrics = this.getMetricsSummary()
    
    return {
      status: metrics.availability >= 99.9 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      metrics: {
        registrationSuccessRate: metrics.registrationSuccesses / Math.max(metrics.registrationAttempts, 1) * 100,
        verificationRate: metrics.verificationRate,
        avgResponseTime: metrics.avgResponseTime,
        availability: metrics.availability
      },
      sla: {
        availability: '99.9%',
        responseTime: '<500ms',
        emailDelivery: '<10s',
        systemSync: '<1s'
      }
    }
  }

  // Send alert (implement with your alerting system)
  private sendAlert(message: string, details: Record<string, any>) {
    console.error('ALERT:', message, details)
    
    // Implement with your alerting service (PagerDuty, Slack, etc.)
    // Example: await fetch('/api/alerts', { method: 'POST', body: JSON.stringify({ message, details }) })
  }

  // Send metrics to external service (implement based on your monitoring stack)
  private sendToMonitoringService(name: string, value: number, tags?: Record<string, string>) {
    // Implement with your monitoring service (DataDog, New Relic, CloudWatch, etc.)
    // Example: await fetch('/api/metrics', { method: 'POST', body: JSON.stringify({ name, value, tags }) })
    
    // For development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`Metric: ${name} = ${value}`, tags)
    }
  }

  // Export metrics for external consumption
  exportMetrics() {
    return {
      summary: this.getMetricsSummary(),
      rawMetrics: this.metrics.slice(-100), // Last 100 metrics
      health: this.getHealthStatus()
    }
  }
}

// Singleton instance
export const monitoring = new MonitoringService()

// Middleware to automatically track API performance
export function trackApiPerformance(operation: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function(...args: any[]) {
      const startTime = Date.now()
      let success = false
      
      try {
        const result = await method.apply(this, args)
        success = true
        return result
      } catch (error) {
        throw error
      } finally {
        const duration = Date.now() - startTime
        monitoring.recordPerformanceMetric(operation, duration, success)
      }
    }

    return descriptor
  }
}

// Utility functions for common monitoring tasks
export const trackRegistration = (success: boolean, responseTime: number, error?: string) => {
  monitoring.recordRegistrationAttempt(success, responseTime, error)
}

export const trackVerification = (success: boolean, timeToVerify?: number) => {
  monitoring.recordEmailVerification(success, timeToVerify)
}

export const trackSystemSync = (success: boolean, syncType: string, duration: number) => {
  monitoring.recordSystemSync(success, syncType, duration)
}

export const trackSecurityEvent = (eventType: string, severity: 'low' | 'medium' | 'high', details: Record<string, any>) => {
  monitoring.recordSecurityEvent(eventType, severity, details)
}

export const recordClientError = (error: Error, context?: Record<string, any>) => {
  monitoring.recordSecurityEvent('client_error', 'medium', {
    message: error.message,
    stack: error.stack,
    ...context
  })
}