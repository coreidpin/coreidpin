interface LogEntry {
  timestamp: string;
  event: string;
  details: any;
  userAgent: string;
  url: string;
}

class SessionLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  log(event: string, details: any = {}) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console log for debugging

    // Store in localStorage for persistence
    try {
      localStorage.setItem('sessionLogs', JSON.stringify(this.logs.slice(0, 20)));
    } catch (error) {
      console.warn('Failed to store session logs:', error);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getRecentLogs(count: number = 10): LogEntry[] {
    return this.logs.slice(0, count);
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('sessionLogs');
  }

  // Load logs from localStorage on initialization
  loadStoredLogs() {
    try {
      const stored = localStorage.getItem('sessionLogs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load stored session logs:', error);
    }
  }
}

export const sessionLogger = new SessionLogger();

// Load stored logs on module initialization
sessionLogger.loadStoredLogs();

// Log authentication events
export const logAuthEvent = (event: string, details: any = {}) => {
  sessionLogger.log(`AUTH_${event}`, details);
};

// Log navigation events
export const logNavigationEvent = (event: string, details: any = {}) => {
  sessionLogger.log(`NAV_${event}`, details);
};

// Log error events
export const logErrorEvent = (event: string, error: any, details: any = {}) => {
  sessionLogger.log(`ERROR_${event}`, {
    error: error?.message || error,
    stack: error?.stack,
    ...details
  });
};
