/**
 * Rate Limiting Middleware (STORY-TEST-016)
 * 
 * Implements in-memory rate limiting for critical API endpoints
 * to prevent abuse and ensure service availability.
 * 
 * For production with multiple servers, consider using Upstash Redis
 * or a distributed rate limiting solution.
 */

import { NextRequest, NextResponse } from "next/server";

// Rate limit configuration
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// Store for tracking request counts
interface RequestRecord {
  count: number;
  resetAt: number;
}

// In-memory store (use Redis in production for distributed systems)
const requestStore = new Map<string, RequestRecord>();

// Cleanup old entries every 5 minutes
// Avoid starting background interval during tests which can cause open handles and OOM
if (process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestStore.entries()) {
      if (now > record.resetAt) {
        requestStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Rate limiting configurations for different endpoint categories
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Auth endpoints - strict limits to prevent brute force
  "auth-login": {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  "auth-register": {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  "auth-forgot-password": {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  "auth-verify-email": {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  
  // Order endpoints - moderate limits
  "orders": {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },
  
  // Payment endpoints - strict limits for security
  "payments": {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  
  // General API - generous limits
  "api-general": {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
};

/**
 * Get rate limit key for request
 * Combines IP address and endpoint category for granular control
 */
function getRateLimitKey(req: NextRequest, category: string): string {
  const ip = req.ip || req.headers.get("x-forwarded-for") || "anonymous";
  return `${category}:${ip}`;
}

/**
 * Check if request should be rate limited
 * @returns null if allowed, NextResponse with 429 if rate limited
 */
export function checkRateLimit(
  req: NextRequest,
  category: string
): NextResponse | null {
  const config = RATE_LIMITS[category] || RATE_LIMITS["api-general"];
  const key = getRateLimitKey(req, category);
  const now = Date.now();
  
  // Get or create request record
  let record = requestStore.get(key);
  
  if (!record || now > record.resetAt) {
    // Create new record or reset expired one
    record = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    requestStore.set(key, record);
    return null; // Allow request
  }
  
  // Check if limit exceeded
  if (record.count >= config.maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    
    return new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(record.resetAt).toISOString(),
        },
      }
    );
  }
  
  // Increment count and allow request
  record.count++;
  return null;
}

/**
 * Get category for API endpoint
 */
export function getCategoryForPath(pathname: string): string {
  // Auth endpoints
  if (pathname.includes("/api/auth/login")) return "auth-login";
  if (pathname.includes("/api/auth/register")) return "auth-register";
  if (pathname.includes("/api/auth/forgot-password")) return "auth-forgot-password";
  if (pathname.includes("/api/auth/verify-email")) return "auth-verify-email";
  if (pathname.includes("/api/auth/verify-otp")) return "auth-verify-email";
  
  // Payment endpoints
  if (pathname.includes("/api/payment")) return "payments";
  
  // Order endpoints
  if (pathname.includes("/api/orders")) return "orders";
  
  // Default to general API limits
  return "api-general";
}

/**
 * Apply rate limiting to a request
 * Returns a response if rate limited, null if allowed
 */
export function applyRateLimit(req: NextRequest): NextResponse | null {
  const pathname = req.nextUrl.pathname;
  
  // Only apply rate limiting to API routes
  if (!pathname.startsWith("/api/")) {
    return null;
  }
  
  const category = getCategoryForPath(pathname);
  return checkRateLimit(req, category);
}

/**
 * Reset rate limit for a specific IP and category (for testing)
 */
export function resetRateLimit(ip: string, category: string): void {
  const key = `${category}:${ip}`;
  requestStore.delete(key);
}

/**
 * Get current rate limit status for debugging
 */
export function getRateLimitStatus(req: NextRequest, category: string): {
  remaining: number;
  resetAt: Date;
  total: number;
} {
  const config = RATE_LIMITS[category] || RATE_LIMITS["api-general"];
  const key = getRateLimitKey(req, category);
  const record = requestStore.get(key);
  
  if (!record) {
    return {
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowMs),
      total: config.maxRequests,
    };
  }
  
  return {
    remaining: Math.max(0, config.maxRequests - record.count),
    resetAt: new Date(record.resetAt),
    total: config.maxRequests,
  };
}
