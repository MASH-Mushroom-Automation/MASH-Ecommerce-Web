// Chatbot-specific early mocks (only used by chatbot test config)
// These mocks prevent network calls and stabilize AI behavior for integration tests

// Mock CartContext for chatbot tests
try {
  jest.mock('@/contexts/CartContext', () => ({
    __esModule: true,
    useCart: jest.fn(() => ({
      items: [],
      itemCount: 0,
      addItem: jest.fn(() => Promise.resolve()),
      addToCart: jest.fn(),
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getItemQuantity: jest.fn(() => 0),
    })),
    CartProvider: ({ children }) => children,
  }));
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[jest.chatbot.setupMocks] failed to mock CartContext', e.message);
}

// Mock Gemini service used by chatbot integration tests
try {
  jest.mock('@/services/chatbot/gemini-service', () => ({
    sendMessage: jest.fn(async (message, history = []) => ({
      success: true,
      content: message && message.length ? 'Hello! How can I help you?' : '',
      source: 'gemini',
      metadata: { model: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash' },
      rateLimit: { remaining: 5, resetTime: 30 },
    })),
    validateMessage: jest.fn((msg) => {
      if (!msg || !msg.toString().trim()) return { valid: false, error: 'Message cannot be empty' };
      if (msg.toString().length > 500) return { valid: false, error: 'Message is too long' };
      if (/^(.)\1{20,}$/.test(msg)) return { valid: false, error: 'Invalid message' };
      return { valid: true };
    }),
    getIntroMessage: jest.fn(() => ({ content: 'Hello! How can I help you?' })),
  }));
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[jest.chatbot.setupMocks] failed to mock gemini-service', e.message);
}