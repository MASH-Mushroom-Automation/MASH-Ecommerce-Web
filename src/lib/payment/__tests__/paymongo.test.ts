/**
 * Tests for PayMongo Payment Service
 * Covers all exported functions with fetch mocking
 */

// Mock crypto for verifyWebhookSignature
const mockCreateHmac = jest.fn();
jest.mock('crypto', () => ({
  createHmac: (...args: unknown[]) => {
    mockCreateHmac(...args);
    return {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('expected_signature_hex'),
    };
  },
}));

// We need to control env vars BEFORE the module loads
const originalEnv = process.env;

beforeEach(() => {
  process.env = {
    ...originalEnv,
    PAYMONGO_SECRET_KEY: 'sk_test_secret123',
    NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY: 'pk_test_public123',
    NEXT_PUBLIC_APP_URL: 'https://www.mashmarket.app',
  };
  jest.resetModules();
  (global.fetch as jest.Mock) = jest.fn();
});

afterEach(() => {
  process.env = originalEnv;
  jest.restoreAllMocks();
});

async function loadModule() {
  return import('../paymongo');
}

describe('isPayMongoConfigured', () => {
  it('returns true when both keys are set', async () => {
    const { isPayMongoConfigured } = await loadModule();
    expect(isPayMongoConfigured()).toBe(true);
  });

  it('returns false when secret key is empty', async () => {
    process.env.PAYMONGO_SECRET_KEY = '';
    const { isPayMongoConfigured } = await loadModule();
    expect(isPayMongoConfigured()).toBe(false);
  });

  it('returns false when public key is empty', async () => {
    process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY = '';
    const { isPayMongoConfigured } = await loadModule();
    expect(isPayMongoConfigured()).toBe(false);
  });
});

describe('getPublicKey', () => {
  it('returns the public key', async () => {
    const { getPublicKey } = await loadModule();
    expect(getPublicKey()).toBe('pk_test_public123');
  });
});

describe('createEWalletPayment', () => {
  it('returns error when not configured', async () => {
    process.env.PAYMONGO_SECRET_KEY = '';
    const { createEWalletPayment } = await loadModule();
    const result = await createEWalletPayment('gcash', 100, 'ord-1', 'ORD-001', 'test@test.com', 'John', '+639171234567');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Payment service not configured');
  });

  it('creates GCash payment source successfully', async () => {
    const { createEWalletPayment } = await loadModule();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: 'src_123',
          attributes: {
            redirect: { checkout_url: 'https://checkout.gcash.com/pay' },
            status: 'pending',
          },
        },
      }),
    });

    const result = await createEWalletPayment('gcash', 100, 'ord-1', 'ORD-001', 'test@test.com', 'John', '+639171234567');
    expect(result.success).toBe(true);
    expect(result.paymentId).toBe('src_123');
    expect(result.checkoutUrl).toBe('https://checkout.gcash.com/pay');
    expect(result.status).toBe('pending');

    // Verify fetch was called with correct args
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.paymongo.com/v1/sources',
      expect.objectContaining({ method: 'POST' })
    );

    // Verify amount is in centavos
    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(callBody.data.attributes.amount).toBe(10000); // 100 * 100
    expect(callBody.data.attributes.currency).toBe('PHP');
    expect(callBody.data.attributes.type).toBe('gcash');
  });

  it('handles API error response', async () => {
    const { createEWalletPayment } = await loadModule();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        errors: [{ detail: 'Invalid amount' }],
      }),
    });

    const result = await createEWalletPayment('gcash', 0, 'ord-1', 'ORD-001', 'test@test.com', 'John', '+639171234567');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid amount');
  });

  it('handles API error without detail', async () => {
    const { createEWalletPayment } = await loadModule();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    const result = await createEWalletPayment('gcash', 100, 'ord-1', 'ORD-001', 'test@test.com', 'John', '+639171234567');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to create payment');
  });

  it('handles network error', async () => {
    const { createEWalletPayment } = await loadModule();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

    const result = await createEWalletPayment('gcash', 100, 'ord-1', 'ORD-001', 'test@test.com', 'John', '+639171234567');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Network failure');
  });

  it('handles non-Error throw', async () => {
    const { createEWalletPayment } = await loadModule();
    (global.fetch as jest.Mock).mockRejectedValueOnce('string error');

    const result = await createEWalletPayment('gcash', 100, 'ord-1', 'ORD-001', 'test@test.com', 'John', '+639171234567');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Payment error');
  });
});

describe('createCardPaymentIntent', () => {
  it('returns error when not configured', async () => {
    process.env.PAYMONGO_SECRET_KEY = '';
    const { createCardPaymentIntent } = await loadModule();
    const result = await createCardPaymentIntent(100, 'ord-1', 'ORD-001', 'test@test.com', 'John');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Payment service not configured');
  });

  it('creates card payment intent successfully', async () => {
    const { createCardPaymentIntent } = await loadModule();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: 'pi_123',
          attributes: { status: 'awaiting_payment_method' },
        },
      }),
    });

    const result = await createCardPaymentIntent(250.50, 'ord-1', 'ORD-001', 'test@test.com', 'John');
    expect(result.success).toBe(true);
    expect(result.paymentId).toBe('pi_123');
    expect(result.status).toBe('awaiting_payment_method');

    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(callBody.data.attributes.amount).toBe(25050);
    expect(callBody.data.attributes.payment_method_allowed).toEqual(['card']);
  });

  it('uses custom description when provided', async () => {
    const { createCardPaymentIntent } = await loadModule();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { id: 'pi_123', attributes: { status: 'pending' } },
      }),
    });

    await createCardPaymentIntent(100, 'ord-1', 'ORD-001', 'test@test.com', 'John', 'Custom desc');
    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(callBody.data.attributes.description).toBe('Custom desc');
  });

  it('handles API error', async () => {
    const { createCardPaymentIntent } = await loadModule();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: [{ detail: 'Bad request' }] }),
    });

    const result = await createCardPaymentIntent(100, 'ord-1', 'ORD-001', 'test@test.com', 'John');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Bad request');
  });

  it('handles network error', async () => {
    const { createCardPaymentIntent } = await loadModule();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Timeout'));

    const result = await createCardPaymentIntent(100, 'ord-1', 'ORD-001', 'test@test.com', 'John');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Timeout');
  });
});

describe('attachPaymentMethod', () => {
  it('returns error when not configured', async () => {
    process.env.PAYMONGO_SECRET_KEY = '';
    const { attachPaymentMethod } = await loadModule();
    const result = await attachPaymentMethod('pi_123', 'pm_456', 'https://return.url');
    expect(result.success).toBe(false);
  });

  it('attaches payment method successfully', async () => {
    const { attachPaymentMethod } = await loadModule();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: 'pi_123',
          attributes: {
            status: 'awaiting_next_action',
            next_action: { redirect: { url: 'https://3ds.verify.com' } },
          },
        },
      }),
    });

    const result = await attachPaymentMethod('pi_123', 'pm_456', 'https://return.url');
    expect(result.success).toBe(true);
    expect(result.checkoutUrl).toBe('https://3ds.verify.com');
  });

  it('handles API error', async () => {
    const { attachPaymentMethod } = await loadModule();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: [{ detail: 'Invalid PM' }] }),
    });

    const result = await attachPaymentMethod('pi_123', 'pm_456', 'https://return.url');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid PM');
  });

  it('handles network error', async () => {
    const { attachPaymentMethod } = await loadModule();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Connection refused'));

    const result = await attachPaymentMethod('pi_123', 'pm_456', 'https://return.url');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Connection refused');
  });
});

describe('getSourceStatus', () => {
  it('returns failed when not configured', async () => {
    process.env.PAYMONGO_SECRET_KEY = '';
    const { getSourceStatus } = await loadModule();
    const result = await getSourceStatus('src_123');
    expect(result.status).toBe('failed');
    expect(result.paid).toBe(false);
  });

  it('returns source status with payments', async () => {
    const { getSourceStatus } = await loadModule();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          attributes: {
            status: 'chargeable',
            payments: [{ id: 'pay_123' }],
          },
        },
      }),
    });

    const result = await getSourceStatus('src_123');
    expect(result.status).toBe('chargeable');
    expect(result.paid).toBe(true);
    expect(result.paymentId).toBe('pay_123');
  });

  it('returns paid when status is chargeable even without payments', async () => {
    const { getSourceStatus } = await loadModule();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          attributes: { status: 'chargeable', payments: [] },
        },
      }),
    });

    const result = await getSourceStatus('src_123');
    expect(result.paid).toBe(true);
  });

  it('handles API error', async () => {
    const { getSourceStatus } = await loadModule();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    const result = await getSourceStatus('src_123');
    expect(result.status).toBe('failed');
    expect(result.paid).toBe(false);
  });

  it('handles network error', async () => {
    const { getSourceStatus } = await loadModule();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Timeout'));

    const result = await getSourceStatus('src_123');
    expect(result.status).toBe('failed');
    expect(result.paid).toBe(false);
  });
});

describe('getPaymentIntentStatus', () => {
  it('returns failed when not configured', async () => {
    process.env.PAYMONGO_SECRET_KEY = '';
    const { getPaymentIntentStatus } = await loadModule();
    const result = await getPaymentIntentStatus('pi_123');
    expect(result.status).toBe('failed');
    expect(result.paid).toBe(false);
  });

  it('returns succeeded status as paid', async () => {
    const { getPaymentIntentStatus } = await loadModule();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          attributes: {
            status: 'succeeded',
            payments: [{ id: 'pay_456' }],
          },
        },
      }),
    });

    const result = await getPaymentIntentStatus('pi_123');
    expect(result.status).toBe('succeeded');
    expect(result.paid).toBe(true);
    expect(result.paymentId).toBe('pay_456');
  });

  it('returns pending status as not paid', async () => {
    const { getPaymentIntentStatus } = await loadModule();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          attributes: { status: 'awaiting_payment_method', payments: [] },
        },
      }),
    });

    const result = await getPaymentIntentStatus('pi_123');
    expect(result.paid).toBe(false);
  });

  it('handles network error', async () => {
    const { getPaymentIntentStatus } = await loadModule();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('err'));

    const result = await getPaymentIntentStatus('pi_123');
    expect(result.status).toBe('failed');
  });
});

describe('createPaymentFromSource', () => {
  it('returns error when not configured', async () => {
    process.env.PAYMONGO_SECRET_KEY = '';
    const { createPaymentFromSource } = await loadModule();
    const result = await createPaymentFromSource('src_123', 100, 'Order payment');
    expect(result.success).toBe(false);
  });

  it('creates payment successfully', async () => {
    const { createPaymentFromSource } = await loadModule();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: 'pay_789',
          attributes: { status: 'processing' },
        },
      }),
    });

    const result = await createPaymentFromSource('src_123', 199.99, 'Order #123');
    expect(result.success).toBe(true);
    expect(result.paymentId).toBe('pay_789');

    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(callBody.data.attributes.amount).toBe(19999);
    expect(callBody.data.attributes.source.id).toBe('src_123');
  });

  it('handles API error', async () => {
    const { createPaymentFromSource } = await loadModule();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: [{ detail: 'Source not chargeable' }] }),
    });

    const result = await createPaymentFromSource('src_123', 100, 'Payment');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Source not chargeable');
  });

  it('handles network error', async () => {
    const { createPaymentFromSource } = await loadModule();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network down'));

    const result = await createPaymentFromSource('src_123', 100, 'Payment');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Network down');
  });
});

describe('verifyWebhookSignature', () => {
  it('returns true when test signature matches', async () => {
    const { verifyWebhookSignature } = await loadModule();
    const signature = 't=1234567890,te=expected_signature_hex,li=other_sig';
    const result = verifyWebhookSignature('payload', signature, 'webhook_secret');
    expect(result).toBe(true);
  });

  it('returns true when live signature matches', async () => {
    const { verifyWebhookSignature } = await loadModule();
    const signature = 't=1234567890,te=no_match,li=expected_signature_hex';
    const result = verifyWebhookSignature('payload', signature, 'webhook_secret');
    expect(result).toBe(true);
  });

  it('returns false when neither signature matches', async () => {
    const { verifyWebhookSignature } = await loadModule();
    const signature = 't=1234567890,te=wrong_sig,li=also_wrong';
    const result = verifyWebhookSignature('payload', signature, 'webhook_secret');
    expect(result).toBe(false);
  });

  it('returns false on malformed signature', async () => {
    const { verifyWebhookSignature } = await loadModule();
    // Force the crypto mock to throw
    mockCreateHmac.mockImplementationOnce(() => { throw new Error('bad'); });
    const result = verifyWebhookSignature('payload', 'malformed', 'secret');
    expect(result).toBe(false);
  });
});

describe('default export', () => {
  it('exports all functions', async () => {
    const mod = await loadModule();
    expect(mod.default).toBeDefined();
    expect(mod.default.isPayMongoConfigured).toBeDefined();
    expect(mod.default.createEWalletPayment).toBeDefined();
    expect(mod.default.createCardPaymentIntent).toBeDefined();
    expect(mod.default.attachPaymentMethod).toBeDefined();
    expect(mod.default.getSourceStatus).toBeDefined();
    expect(mod.default.getPaymentIntentStatus).toBeDefined();
    expect(mod.default.createPaymentFromSource).toBeDefined();
    expect(mod.default.verifyWebhookSignature).toBeDefined();
    expect(mod.default.getPublicKey).toBeDefined();
  });
});
