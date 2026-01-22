/**
 * Jest Configuration for MASH E-Commerce Platform
 * Optimized for Next.js 16 + TypeScript + React Testing Library
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Path to Next.js app for loading next.config.js and .env files
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // Use jsdom for DOM APIs
  testEnvironment: 'jest-environment-jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/test-utils/**',
    '!src/app/layout.tsx',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/error.tsx',
    '!src/app/**/not-found.tsx',
  ],

  // Coverage thresholds (fixed: coverageThreshold not coverageThresholds)
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/studio/',
    '/coverage/',
    '/scripts/',
  ],

  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
          dynamicImport: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Verbose output
  verbose: true,

  // Maximum workers (optimize for CI/CD)
  maxWorkers: '50%',

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

// Export config
module.exports = createJestConfig(customJestConfig);
