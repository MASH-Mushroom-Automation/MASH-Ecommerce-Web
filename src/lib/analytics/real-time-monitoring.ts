/**
 * Real-Time Monitoring for Chatbot Analytics Dashboard
 * 
 * Provides auto-refresh polling and alerting for analytics metrics
 * Supports configurable intervals and pause/resume functionality
 */

export type RefreshInterval = 30000 | 60000 | 300000; // 30s, 1min, 5min in ms

export interface RefreshConfig {
  interval: RefreshInterval;
  enabled: boolean;
  lastRefreshed?: Date;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
}

/**
 * Real-time polling manager for analytics data
 */
export class RealTimeMonitor {
  private intervalId?: NodeJS.Timeout;
  private config: RefreshConfig;
  private onRefresh: () => Promise<void>;
  private onError: (error: Error) => void;
  private alerts: Alert[] = [];
  private alertCallbacks: ((alerts: Alert[]) => void)[] = [];
  
  constructor(
    onRefresh: () => Promise<void>,
    onError: (error: Error) => void,
    initialInterval: RefreshInterval = 60000
  ) {
    this.onRefresh = onRefresh;
    this.onError = onError;
    this.config = {
      interval: initialInterval,
      enabled: false,
    };
  }
  
  /**
   * Start auto-refresh polling
   */
  start(): void {
    if (this.config.enabled) {
      console.warn('[RealTimeMonitor] Already started');
      return;
    }
    
    this.config.enabled = true;
    this.scheduleRefresh();
    
    console.log(`[RealTimeMonitor] Started with ${this.config.interval}ms interval`);
  }
  
  /**
   * Stop auto-refresh polling
   */
  stop(): void {
    if (!this.config.enabled) {
      return;
    }
    
    this.config.enabled = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    
    console.log('[RealTimeMonitor] Stopped');
  }
  
  /**
   * Change refresh interval (restarts polling if active)
   */
  setInterval(interval: RefreshInterval): void {
    const wasEnabled = this.config.enabled;
    
    if (wasEnabled) {
      this.stop();
    }
    
    this.config.interval = interval;
    
    if (wasEnabled) {
      this.start();
    }
    
    console.log(`[RealTimeMonitor] Interval changed to ${interval}ms`);
  }
  
  /**
   * Get current refresh configuration
   */
  getConfig(): Readonly<RefreshConfig> {
    return { ...this.config };
  }
  
  /**
   * Trigger immediate refresh (doesn't reset interval)
   */
  async refreshNow(): Promise<void> {
    try {
      await this.onRefresh();
      this.config.lastRefreshed = new Date();
      console.log('[RealTimeMonitor] Manual refresh completed');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onError(err);
      this.addAlert({
        type: 'error',
        title: 'Refresh Failed',
        message: `Manual refresh failed: ${err.message}`,
      });
    }
  }
  
  /**
   * Add alert to queue
   */
  addAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'dismissed'>): void {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      dismissed: false,
    };
    
    this.alerts.push(newAlert);
    this.notifyAlertListeners();
  }
  
  /**
   * Dismiss alert by ID
   */
  dismissAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.dismissed = true;
      this.notifyAlertListeners();
    }
  }
  
  /**
   * Get all alerts (including dismissed)
   */
  getAllAlerts(): Alert[] {
    return [...this.alerts];
  }
  
  /**
   * Get active (non-dismissed) alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.dismissed);
  }
  
  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
    this.notifyAlertListeners();
  }
  
  /**
   * Subscribe to alert changes
   */
  onAlertsChange(callback: (alerts: Alert[]) => void): () => void {
    this.alertCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.alertCallbacks = [];
    this.alerts = [];
  }
  
  // Private methods
  
  private scheduleRefresh(): void {
    if (!this.config.enabled) {
      return;
    }
    
    this.intervalId = setInterval(async () => {
      try {
        await this.onRefresh();
        this.config.lastRefreshed = new Date();
        console.log('[RealTimeMonitor] Auto-refresh completed');
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('[RealTimeMonitor] Auto-refresh failed:', err);
        this.onError(err);
        this.addAlert({
          type: 'warning',
          title: 'Auto-Refresh Failed',
          message: `Failed to refresh data: ${err.message}`,
        });
      }
    }, this.config.interval);
  }
  
  private notifyAlertListeners(): void {
    const activeAlerts = this.getActiveAlerts();
    this.alertCallbacks.forEach(callback => {
      try {
        callback(activeAlerts);
      } catch (error) {
        console.error('[RealTimeMonitor] Alert callback error:', error);
      }
    });
  }
}

/**
 * Create a real-time monitor instance
 */
export function createRealTimeMonitor(
  onRefresh: () => Promise<void>,
  onError: (error: Error) => void,
  initialInterval?: RefreshInterval
): RealTimeMonitor {
  return new RealTimeMonitor(onRefresh, onError, initialInterval);
}

/**
 * Format time ago for last refresh timestamp
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 60) {
    return `${diffSec}s ago`;
  }
  
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour}h ago`;
  }
  
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

/**
 * Get interval display name
 */
export function getIntervalName(interval: RefreshInterval): string {
  switch (interval) {
    case 30000:
      return '30 seconds';
    case 60000:
      return '1 minute';
    case 300000:
      return '5 minutes';
    default:
      return `${interval / 1000}s`;
  }
}
