/**
 * Automated Test Suite for AI Chatbot System
 * 
 * This configuration runs all tests for the AI chatbot feature with
 * phase-by-phase validation and automated progression.
 * 
 * Usage:
 *   npm run test:chatbot                    # Run all chatbot tests
 *   npm run test:chatbot:watch              # Watch mode for development
 *   npm run test:chatbot:coverage           # Generate coverage report
 *   npm run test:chatbot:phase -- phase-1   # Run specific phase tests
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md
 */

module.exports = {
  displayName: 'AI Chatbot System',
  testMatch: [
    // Phase 1: Foundation
    '**/lib/ai/__tests__/config.test.ts',
    '**/lib/ai/__tests__/gemini-client.test.ts',
    
    // Phase 2: Gemini Integration
    '**/services/chatbot/__tests__/gemini-service.test.ts',
    '**/services/chatbot/__tests__/prompts.test.ts',
    '**/app/api/chatbot/__tests__/message.test.ts',
    
    // Phase 3: RAG System
    '**/lib/ai/__tests__/sanity-rag.test.ts',
    '**/lib/ai/__tests__/search-engine.test.ts',
    '**/lib/ai/__tests__/context-builder.test.ts',
    
    // Phase 4: UI Components
    '**/components/chatbot/__tests__/**/*.test.tsx',
    '**/contexts/__tests__/ChatContext.test.tsx',
    
    // Phase 5: Advanced Features
    '**/lib/analytics/__tests__/chatbot-events.test.ts',
    
    // Phase 6: Production
    '**/app/api/chatbot/__tests__/stream.test.ts',
    '**/lib/ai/__tests__/retry-handler.test.ts',
    '**/__tests__/integration/chatbot-e2e.test.ts',
    
    // Catch-all for any chatbot tests
    '**/__tests__/**/chatbot/**/*.test.{ts,tsx}',
  ],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/lib/ai/**/*.{ts,tsx}',
    'src/services/chatbot/**/*.{ts,tsx}',
    'src/components/chatbot/**/*.{ts,tsx}',
    'src/contexts/ChatContext.tsx',
    'src/app/api/chatbot/**/*.{ts,tsx}',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },
  testTimeout: 10000,
  verbose: true,
};
