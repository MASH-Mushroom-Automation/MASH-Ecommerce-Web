/**
 * Jest Configuration for Sanity CMS Schema Tests
 * Tests schema structure, field definitions, validations, and completeness
 * 
 * Run with: npx jest --config jest.sanity.config.js
 */

/** @type {import('jest').Config} */
module.exports = {
  displayName: 'sanity-schemas',
  testEnvironment: 'node',

  // Test only schema test files
  testMatch: [
    '<rootDir>/src/__tests__/sanity-schemas/**/*.test.{js,ts}',
  ],

  // No ignore patterns for studio (we need to import from it)
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],

  // Transform TypeScript
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

  // Allow transforming Sanity packages and studio files
  transformIgnorePatterns: [
    '/node_modules/(?!(sanity|@sanity)/)',
  ],

  // Module mapping - explicitly use root __mocks__ for sanity packages
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^sanity$': '<rootDir>/__mocks__/sanity.js',
    '^@sanity/icons$': '<rootDir>/__mocks__/@sanity/icons.js',
  },

  // Roots - only look at root and studio for test files and modules
  roots: ['<rootDir>'],

  // Setup files to explicitly mock sanity before tests
  setupFiles: ['<rootDir>/jest.sanity.setup.js'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Verbose output
  verbose: true,

  // Clear mocks
  clearMocks: true,
};
