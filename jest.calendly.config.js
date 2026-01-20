/**
 * Automated Test Suite for Calendly Appointment System
 * 
 * This script runs all tests for the Calendly integration and validates
 * the complete booking flow functionality.
 * 
 * Usage:
 *   npm run test:calendly           # Run all Calendly tests
 *   npm run test:calendly:watch     # Watch mode for development
 *   npm run test:calendly:coverage  # Generate coverage report
 * 
 * @see .github/SELLER_APPOINTMENT_SYSTEM_PLAN.md
 */

module.exports = {
  displayName: 'Calendly Appointment System',
  testMatch: [
    '**/components/appointments/__tests__/**/*.test.tsx',
    '**/components/appointments/__tests__/**/*.test.ts',
  ],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/components/appointments/**/*.{ts,tsx}',
    '!src/components/appointments/__tests__/**',
    '!src/components/appointments/index.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
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
};
