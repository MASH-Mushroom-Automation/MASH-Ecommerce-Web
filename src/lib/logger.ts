/**
 * Custom Logger Utility
 * 
 * Production: Only shows errors and warnings
 * Development: Shows all logs with clear formatting
 * Testing: Suppressed (handled by Jest)
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isTesting: boolean;
}

class Logger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      isTesting: process.env.NODE_ENV === 'test',
    };
  }

  /**
   * Info logs - Only in development
   */
  info(message: string, ...args: any[]) {
    if (this.config.isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Debug logs - Only in development
   */
  debug(message: string, ...args: any[]) {
    if (this.config.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Warning logs - Development and Production
   */
  warn(message: string, ...args: any[]) {
    if (!this.config.isTesting) {
      console.warn(`⚠️ [WARN] ${message}`, ...args);
    }
  }

  /**
   * Error logs - Always shown (except in tests)
   */
  error(message: string, error?: any) {
    if (!this.config.isTesting) {
      console.error(`❌ [ERROR] ${message}`, error || '');
      
      // Send to error tracking service in production
      if (this.config.isProduction && typeof window !== 'undefined') {
        // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
        this.reportError(message, error);
      }
    }
  }

  /**
   * API logs - Only in development
   */
  api(method: string, url: string, status?: number) {
    if (this.config.isDevelopment) {
      const statusEmoji = status && status >= 200 && status < 300 ? '✅' : '❌';
      console.log(`${statusEmoji} [API] ${method} ${url}`, status ? `Status: ${status}` : '');
    }
  }

  /**
   * Performance logs - Only in development
   */
  perf(label: string, duration: number) {
    if (this.config.isDevelopment) {
      console.log(`⏱️ [PERF] ${label}: ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Clear console - Development only
   */
  clear() {
    if (this.config.isDevelopment && typeof console.clear === 'function') {
      console.clear();
    }
  }

  /**
   * Report error to tracking service (production)
   */
  private reportError(message: string, error: any) {
    // Placeholder for error tracking integration
    // Example: Sentry.captureException(error, { extra: { message } });
  }
}

// Export singleton instance
export const logger = new Logger();

// Helper to suppress console in tests
export const suppressTestLogs = () => {
  if (process.env.NODE_ENV === 'test') {
    global.console = {
      ...console,
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      // Keep error and warn for test debugging
    };
  }
};
