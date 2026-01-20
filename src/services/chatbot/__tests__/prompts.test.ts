/**
 * Unit Tests for Prompts
 * 
 * Tests system prompts and query type detection.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 2, Task 2.6
 */

import {
  INTRO_PROMPT,
  PRODUCT_RECOMMENDATION_PROMPT,
  GENERAL_SUPPORT_PROMPT,
  PRODUCT_DISCOVERY_PROMPT,
  FALLBACK_PROMPT,
  getSystemPrompt,
  detectQueryType,
} from '../prompts';

describe('Prompts', () => {
  describe('Prompt Constants', () => {
    it('should have intro prompt', () => {
      expect(INTRO_PROMPT).toContain('MASH AI Assistant');
      expect(INTRO_PROMPT).toContain('mushroom');
    });
    
    it('should have product recommendation prompt', () => {
      expect(PRODUCT_RECOMMENDATION_PROMPT).toContain('recipe');
      expect(PRODUCT_RECOMMENDATION_PROMPT).toContain('recommend');
    });
    
    it('should have general support prompt', () => {
      expect(GENERAL_SUPPORT_PROMPT).toContain('customer support');
    });
    
    it('should have product discovery prompt', () => {
      expect(PRODUCT_DISCOVERY_PROMPT).toContain('browse');
      expect(PRODUCT_DISCOVERY_PROMPT).toContain('explore');
    });
    
    it('should have fallback prompt', () => {
      expect(FALLBACK_PROMPT).toContain('general question');
    });
  });
  
  describe('detectQueryType', () => {
    it('should detect recipe queries', () => {
      expect(detectQueryType('what mushroom for beef pepper garlic recipe')).toBe('recommendation');
      expect(detectQueryType('how to cook oyster mushrooms')).toBe('recommendation');
      expect(detectQueryType('best mushroom for soup')).toBe('recommendation');
    });
    
    it('should detect support queries', () => {
      expect(detectQueryType('where is my order')).toBe('support');
      expect(detectQueryType('how to track shipping')).toBe('support');
      expect(detectQueryType('return policy')).toBe('support');
    });
    
    it('should detect discovery queries', () => {
      expect(detectQueryType('show me products')).toBe('discovery');
      expect(detectQueryType('browse mushrooms')).toBe('discovery');
      expect(detectQueryType('what do you have')).toBe('discovery');
    });
    
    it('should default to general for unclear queries', () => {
      expect(detectQueryType('hello')).toBe('general');
      expect(detectQueryType('tell me about your company')).toBe('general');
      expect(detectQueryType('random question')).toBe('general');
    });
  });
  
  describe('getSystemPrompt', () => {
    it('should return recommendation prompt for recipe queries', () => {
      const prompt = getSystemPrompt('recommendation');
      expect(prompt).toBe(PRODUCT_RECOMMENDATION_PROMPT);
    });
    
    it('should return support prompt for support queries', () => {
      const prompt = getSystemPrompt('support');
      expect(prompt).toBe(GENERAL_SUPPORT_PROMPT);
    });
    
    it('should return discovery prompt for browsing queries', () => {
      const prompt = getSystemPrompt('discovery');
      expect(prompt).toBe(PRODUCT_DISCOVERY_PROMPT);
    });
    
    it('should return fallback prompt for general queries', () => {
      const prompt = getSystemPrompt('general');
      expect(prompt).toBe(FALLBACK_PROMPT);
    });
    
    it('should include product context when provided', () => {
      const context = {
        availableProducts: [
          { name: 'Blue Oyster Mushroom', category: 'Oyster', price: 200 },
          { name: 'King Oyster Mushroom', category: 'Oyster', price: 250 },
        ],
      };
      
      const prompt = getSystemPrompt('recommendation', context);
      expect(prompt).toContain('Blue Oyster Mushroom');
      expect(prompt).toContain('King Oyster Mushroom');
    });
  });
});
