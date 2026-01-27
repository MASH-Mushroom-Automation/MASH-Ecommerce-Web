/**
 * Mock PayMongo API for testing checkout payment flow
 */

export interface PaymentIntent {
  id: string;
  type: string;
  attributes: {
    amount: number;
    currency: string;
    status: string;
    client_key: string;
    payment_method_allowed: string[];
  };
}

export interface PaymentSource {
  id: string;
  type: string;
  attributes: {
    amount: number;
    currency: string;
    redirect: {
      checkout_url: string;
      success: string;
      failed: string;
    };
    status: string;
  };
}

export const mockPaymentIntentGCash: PaymentIntent = {
  id: "pi_123456789",
  type: "payment_intent",
  attributes: {
    amount: 50000, // Amount in cents (₱500.00)
    currency: "PHP",
    status: "awaiting_payment_method",
    client_key: "pk_test_client_key_123",
    payment_method_allowed: ["gcash", "grab_pay", "card"],
  },
};

export const mockPaymentSourceGCash: PaymentSource = {
  id: "src_gcash_123456",
  type: "source",
  attributes: {
    amount: 50000,
    currency: "PHP",
    redirect: {
      checkout_url: "https://test.paymongo.com/sources/gcash/redirect/123456",
      success: "http://localhost:3000/checkout/success",
      failed: "http://localhost:3000/checkout/failed",
    },
    status: "pending",
  },
};

export const mockPaymentSourceCard: PaymentSource = {
  id: "src_card_789012",
  type: "source",
  attributes: {
    amount: 100000,
    currency: "PHP",
    redirect: {
      checkout_url: "https://test.paymongo.com/sources/card/redirect/789012",
      success: "http://localhost:3000/checkout/success",
      failed: "http://localhost:3000/checkout/failed",
    },
    status: "pending",
  },
};

// Mock create payment intent
export const createPaymentIntent = jest.fn(
  async (amount: number, paymentMethods: string[]) => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (amount <= 0) {
      return {
        success: false,
        error: "Invalid amount",
      };
    }

    return {
      success: true,
      data: {
        ...mockPaymentIntentGCash,
        attributes: {
          ...mockPaymentIntentGCash.attributes,
          amount,
          payment_method_allowed: paymentMethods,
        },
      },
    };
  }
);

// Mock create payment source (for GCash, GrabPay, etc.)
export const createPaymentSource = jest.fn(
  async (
    type: "gcash" | "grab_pay" | "card",
    amount: number,
    orderId: string,
    description: string
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (amount <= 0) {
      return {
        success: false,
        error: "Invalid amount",
      };
    }

    const mockSource = type === "gcash" ? mockPaymentSourceGCash : mockPaymentSourceCard;

    return {
      success: true,
      data: {
        ...mockSource,
        attributes: {
          ...mockSource.attributes,
          amount,
        },
      },
      checkoutUrl: mockSource.attributes.redirect.checkout_url,
    };
  }
);

// Mock payment webhook (for testing payment confirmation)
export const mockPaymentWebhook = {
  data: {
    id: "evt_webhook_123",
    type: "event",
    attributes: {
      type: "source.chargeable",
      data: {
        id: "src_gcash_123456",
        type: "source",
        attributes: {
          status: "chargeable",
          amount: 50000,
        },
      },
    },
  },
};

// Error scenarios
export const createPaymentIntentError = jest.fn(async () => {
  throw new Error("PayMongo API service unavailable");
});

export const createPaymentSourceError = jest.fn(async () => {
  throw new Error("Failed to create payment source");
});

export const insufficientFundsError = jest.fn(async () => {
  return {
    success: false,
    error: "Insufficient funds in your GCash account",
  };
});

// Reset all mocks
export const resetPayMongoMocks = () => {
  createPaymentIntent.mockClear();
  createPaymentSource.mockClear();
  createPaymentIntentError.mockClear();
  createPaymentSourceError.mockClear();
  insufficientFundsError.mockClear();
};

export default {
  createPaymentIntent,
  createPaymentSource,
  mockPaymentIntentGCash,
  mockPaymentSourceGCash,
  mockPaymentSourceCard,
  mockPaymentWebhook,
  resetPayMongoMocks,
};
