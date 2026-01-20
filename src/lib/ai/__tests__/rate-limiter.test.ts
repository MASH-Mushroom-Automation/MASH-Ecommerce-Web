/**
 * Unit Tests for Rate Limiter
 * 
 * Tests rate limiting functionality for chatbot messages.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 2, Task 2.6
 */

import {
  checkRateLimit,
  getRemainingMessages,
  getResetTime,
  resetRateLimit,
  cleanupExpiredEntries,
} from '../rate-limiter';

// Mock timers for testing
jest.useFakeTimers();

describe('Rate Limiter', () => {
  const testUserId = 'test-user-123';
  
  beforeEach(() => {
    // Reset rate limit before each test
    resetRateLimit(testUserId);
    jest.clearAllTimers();
  });
  
  afterEach(() => {
    resetRateLimit(testUserId);
  });
  
  describe('checkRateLimit', () => {
    it('should allow first message', () => {
      const result = checkRateLimit(testUserId);
      
      expect(result.isLimited).toBe(false);
      expect(result.messageCount).toBe(1);
      expect(result.userId).toBe(testUserId);
    });
    
    it('should allow up to 10 messages', () => {
      // Send 10 messages
      for (let i = 1; i <= 10; i++) {
        const result = checkRateLimit(testUserId);
        expect(result.isLimited).toBe(false);
        expect(result.messageCount).toBe(i);
      }
    });
    
    it('should block 11th message', () => {
      // Send 10 allowed messages
      for (let i = 1; i <= 10; i++) {
        checkRateLimit(testUserId);
      }
      
      // 11th should be blocked
      const result = checkRateLimit(testUserId);
      expect(result.isLimited).toBe(true);
      expect(result.messageCount).toBe(11);
    });
    
    it('should reset after 60 seconds', () => {
      // Send 10 messages
      for (let i = 1; i <= 10; i++) {
        checkRateLimit(testUserId);
      }
      
      // Advance time by 61 seconds
      jest.advanceTimersByTime(61 * 1000);
      
      // Should be allowed again
      const result = checkRateLimit(testUserId);
      expect(result.isLimited).toBe(false);
      expect(result.messageCount).toBe(1);
    });
  });
  
  describe('getRemainingMessages', () => {
    it('should return 10 for new user', () => {
      const remaining = getRemainingMessages(testUserId);
      expect(remaining).toBe(10);
    });
    
    it('should decrease after each message', () => {
      checkRateLimit(testUserId); // 1 message
      expect(getRemainingMessages(testUserId)).toBe(9);
      
      checkRateLimit(testUserId); // 2 messages
      expect(getRemainingMessages(testUserId)).toBe(8);
      
      checkRateLimit(testUserId); // 3 messages
      expect(getRemainingMessages(testUserId)).toBe(7);
    });
    
    it('should return 0 when limit exceeded', () => {
      // Send 11 messages
      for (let i = 1; i <= 11; i++) {
        checkRateLimit(testUserId);
      }
      
      expect(getRemainingMessages(testUserId)).toBe(0);
    });
  });
  
  describe('getResetTime', () => {
    it('should return 0 for new user', () => {
      const resetTime = getResetTime(testUserId);
      expect(resetTime).toBe(0);
    });
    
    it('should return countdown in seconds', () => {
      checkRateLimit(testUserId);
      
      // Should be ~60 seconds
      const resetTime = getResetTime(testUserId);
      expect(resetTime).toBeGreaterThanOrEqual(59);
      expect(resetTime).toBeLessThanOrEqual(60);
    });
    
    it('should decrease over time', () => {
      checkRateLimit(testUserId);
      
      // Advance 30 seconds
      jest.advanceTimersByTime(30 * 1000);
      
      const resetTime = getResetTime(testUserId);
      expect(resetTime).toBeGreaterThanOrEqual(29);
      expect(resetTime).toBeLessThanOrEqual(30);
    });
  });
  
  describe('resetRateLimit', () => {
    it('should reset user rate limit', () => {
      // Send 5 messages
      for (let i = 1; i <= 5; i++) {
        checkRateLimit(testUserId);
      }
      
      expect(getRemainingMessages(testUserId)).toBe(5);
      
      // Reset
      resetRateLimit(testUserId);
      
      // Should be back to 10
      expect(getRemainingMessages(testUserId)).toBe(10);
    });
  });
  
  describe('cleanupExpiredEntries', () => {
    it('should remove expired entries', () => {
      const user1 = 'user1';
      const user2 = 'user2';
      
      // Create entries
      checkRateLimit(user1);
      checkRateLimit(user2);
      
      // Advance past window (61 seconds)
      jest.advanceTimersByTime(61 * 1000);
      
      // Cleanup
      cleanupExpiredEntries();
      
      // Both should be reset
      expect(getRemainingMessages(user1)).toBe(10);
      expect(getRemainingMessages(user2)).toBe(10);
    });
  });
});
