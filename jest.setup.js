/**
 * Jest Setup for Testing Environment
 * 
 * Configures testing library and mocks for Calendly component tests.
 */

require('@testing-library/jest-dom');

// Add TextEncoder/TextDecoder for Node environment
if (typeof TextEncoder === 'undefined') {
  const util = require('util');
  global.TextEncoder = util.TextEncoder;
  global.TextDecoder = util.TextDecoder;
}

// Mock Next.js Request/Response for API route tests
if (typeof Request === 'undefined') {
  global.Request = class Request {};
  global.Response = class Response {};
  global.Headers = class Headers {};
}

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return props;
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }) => {
    return { children, href };
  },
}));

// Suppress console errors during tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
