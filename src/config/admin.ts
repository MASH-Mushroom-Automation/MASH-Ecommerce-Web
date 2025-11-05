// Admin Integration Configuration

export const ADMIN_CONFIG = {
  // Admin Dashboard URL (from environment)
  dashboardUrl: process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL || 'https://admin.mash-market.com',
  
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://api-admin.mash-market.com',
    version: 'v1',
    timeout: 30000, // 30 seconds
  },

  // WebSocket Configuration
  websocket: {
    url: process.env.NEXT_PUBLIC_ADMIN_WEBSOCKET_URL || 'wss://ws-admin.mash-market.com',
    reconnectInterval: 3000, // 3 seconds
    maxReconnectAttempts: 5,
  },

  // CORS Settings
  cors: {
    origin: process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Authorization',
      'X-Admin-Key',
      'X-Request-ID',
      'Content-Type'
    ],
    maxAge: 86400 // 24 hours
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: parseInt(process.env.ADMIN_RATE_LIMIT || '100'), // requests per window
    message: 'Too many requests from admin dashboard'
  },

  // Authentication
  auth: {
    tokenKey: 'admin_token',
    refreshTokenKey: 'admin_refresh_token',
    tokenExpiry: 3600, // 1 hour
    refreshTokenExpiry: 604800, // 1 week
  },

  // Feature Flags
  features: {
    enableWebSocket: true,
    enableAnalytics: true,
    enableActivityLogging: true,
    enableHealthCheck: true,
  },

  // Error Codes
  errorCodes: {
    ADMIN001: 'Authentication failed',
    ADMIN002: 'Invalid permissions',
    ADMIN003: 'Rate limit exceeded',
    ADMIN004: 'Invalid request data',
    ADMIN005: 'Resource not found',
    ADMIN006: 'Action not allowed',
  },

  // Analytics
  analytics: {
    enabled: true,
    sampleRate: 1.0, // 100% of requests
    errorTracking: true,
  },

  // Monitoring
  monitoring: {
    sentryDsn: process.env.ADMIN_SENTRY_DSN,
    datadogApiKey: process.env.ADMIN_DATADOG_API_KEY,
    logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  },
} as const;

// Type-safe config access
export type AdminConfig = typeof ADMIN_CONFIG;
export type AdminErrorCode = keyof typeof ADMIN_CONFIG.errorCodes;
