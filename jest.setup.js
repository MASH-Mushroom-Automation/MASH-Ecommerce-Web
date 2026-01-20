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

// Mock Firebase/Firestore for analytics
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve({ id: 'mock-id' })),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000 })),
    fromDate: jest.fn((date) => ({ seconds: date.getTime() / 1000 })),
  },
  serverTimestamp: jest.fn(() => ({ _methodName: 'serverTimestamp' })),
  updateDoc: jest.fn(() => Promise.resolve()),
  doc: jest.fn(),
  increment: jest.fn((value) => ({ _methodName: 'increment', _operand: value })),
}));

// Mock analytics module
jest.mock('@/lib/analytics/chatbot-analytics', () => ({
  startConversation: jest.fn(() => Promise.resolve()),
  updateConversationMetrics: jest.fn(() => Promise.resolve()),
  incrementMessageCount: jest.fn(() => Promise.resolve()),
  markConversionFromChatbot: jest.fn(() => Promise.resolve()),
  logQuery: jest.fn(() => Promise.resolve()),
  getTopQueries: jest.fn(() => Promise.resolve([])),
  logProductClick: jest.fn(() => Promise.resolve()),
  markProductClickConversion: jest.fn(() => Promise.resolve()),
  getTopClickedProducts: jest.fn(() => Promise.resolve([])),
  logError: jest.fn(() => Promise.resolve()),
  getErrorStats: jest.fn(() => Promise.resolve({ totalErrors: 0, errorsByType: {} })),
  getDailyStats: jest.fn(() => Promise.resolve({})),
  getWeeklyStats: jest.fn(() => Promise.resolve([])),
  exportToCSV: jest.fn(() => ''),
  downloadCSV: jest.fn(),
}));

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
