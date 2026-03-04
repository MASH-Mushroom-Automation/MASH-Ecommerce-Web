jest.mock('resend', () => ({ Resend: jest.fn().mockImplementation((key: string) => ({ key })) }));

describe('resend email config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('exports null resend client when RESEND_API_KEY is not set', () => {
    delete process.env.RESEND_API_KEY;
    const { resend, isEmailConfigured } = require('../resend');
    expect(resend).toBeNull();
    expect(isEmailConfigured()).toBe(false);
  });

  it('creates Resend client when RESEND_API_KEY is set', () => {
    process.env.RESEND_API_KEY = 're_test_key';
    const { resend, isEmailConfigured } = require('../resend');
    expect(resend).toBeDefined();
    expect(resend).not.toBeNull();
    expect(isEmailConfigured()).toBe(true);
  });

  it('returns testFrom address in non-production environment', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
    const { getFromAddress, EMAIL_CONFIG } = require('../resend');
    expect(getFromAddress()).toBe(EMAIL_CONFIG.testFrom);
  });

  it('returns production from address in production', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
    const { getFromAddress, EMAIL_CONFIG } = require('../resend');
    expect(getFromAddress()).toBe(EMAIL_CONFIG.from);
  });

  it('uses custom EMAIL_FROM_ADDRESS when set', () => {
    process.env.EMAIL_FROM_ADDRESS = 'Custom Sender <custom@example.com>';
    const { EMAIL_CONFIG } = require('../resend');
    expect(EMAIL_CONFIG.from).toBe('Custom Sender <custom@example.com>');
  });

  it('uses default from address when EMAIL_FROM_ADDRESS not set', () => {
    delete process.env.EMAIL_FROM_ADDRESS;
    const { EMAIL_CONFIG } = require('../resend');
    expect(EMAIL_CONFIG.from).toContain('onboarding@resend.dev');
  });

  it('uses custom EMAIL_REPLY_TO when set', () => {
    process.env.EMAIL_REPLY_TO = 'reply@example.com';
    const { EMAIL_CONFIG } = require('../resend');
    expect(EMAIL_CONFIG.replyTo).toBe('reply@example.com');
  });

  it('uses default reply-to when EMAIL_REPLY_TO not set', () => {
    delete process.env.EMAIL_REPLY_TO;
    const { EMAIL_CONFIG } = require('../resend');
    expect(EMAIL_CONFIG.replyTo).toBe('support@mash.ph');
  });
});
