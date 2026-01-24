/**
 * Rate Limiter for Chatbot
 * 
 * Prevents API quota abuse by limiting messages per user per time window.
 * Uses in-memory storage (resets on server restart).
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 2, Task 2.4
 */

import { MAX_MESSAGES_PER_MINUTE } from './config';
import type { RateLimitState } from '@/types/chatbot';

// In-memory storage for rate limiting
const rateLimitStore = new Map<string, RateLimitState>();

// Time window in milliseconds (1 minute)
const WINDOW_MS = 60 * 1000;

/**
 * Checks if a user has exceeded the rate limit
 * 
 * @param userId - User identifier (IP address or user ID)
 * @returns RateLimitState with current status
 */
export function checkRateLimit(userId: string): RateLimitState {
  const now = Date.now();
  const existing = rateLimitStore.get(userId);
  
  // No previous record - create new
  if (!existing) {
    const newState: RateLimitState = {
      userId,
      messageCount: 1,
      windowStart: now,
      isLimited: false,
    };
    rateLimitStore.set(userId, newState);
    return newState;
  }
  
  // Check if window has expired
  const windowExpired = now - existing.windowStart > WINDOW_MS;
  
  if (windowExpired) {
    // Reset window
    const newState: RateLimitState = {
      userId,
      messageCount: 1,
      windowStart: now,
      isLimited: false,
    };
    rateLimitStore.set(userId, newState);
    return newState;
  }
  
  // Increment count in current window
  const newCount = existing.messageCount + 1;
  const isLimited = newCount > MAX_MESSAGES_PER_MINUTE;
  
  const updatedState: RateLimitState = {
    userId,
    messageCount: newCount,
    windowStart: existing.windowStart,
    isLimited,
  };
  
  rateLimitStore.set(userId, updatedState);
  return updatedState;
}

/**
 * Gets remaining messages for a user
 * 
 * @param userId - User identifier
 * @returns Number of messages remaining in current window
 */
export function getRemainingMessages(userId: string): number {
  const state = rateLimitStore.get(userId);
  
  if (!state) {
    return MAX_MESSAGES_PER_MINUTE;
  }
  
  const now = Date.now();
  const windowExpired = now - state.windowStart > WINDOW_MS;
  
  if (windowExpired) {
    return MAX_MESSAGES_PER_MINUTE;
  }
  
  return Math.max(0, MAX_MESSAGES_PER_MINUTE - state.messageCount);
}

/**
 * Gets time until rate limit resets (in seconds)
 * 
 * @param userId - User identifier
 * @returns Seconds until reset, or 0 if not limited
 */
export function getResetTime(userId: string): number {
  const state = rateLimitStore.get(userId);
  
  if (!state) {
    return 0;
  }
  
  const now = Date.now();
  const elapsed = now - state.windowStart;
  const remaining = WINDOW_MS - elapsed;
  
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Resets rate limit for a user (admin use)
 * 
 * @param userId - User identifier
 */
export function resetRateLimit(userId: string): void {
  rateLimitStore.delete(userId);
}

/**
 * Cleans up expired rate limit entries
 * Should be called periodically to prevent memory leaks
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  
  for (const [userId, state] of rateLimitStore.entries()) {
    const windowExpired = now - state.windowStart > WINDOW_MS;
    
    if (windowExpired) {
      rateLimitStore.delete(userId);
    }
  }
}

// Auto-cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
