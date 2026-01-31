/**
 * Mock Lalamove API for testing checkout flow
 */

export interface LalamoveQuotation {
  quotationId: string;
  price: number;
  distance: number;
  estimatedDeliveryTime: string;
  currency: string;
}

export interface LalamoveOrder {
  orderId: string;
  status: string;
  trackingUrl: string;
}

export const mockQuotationSuccess: LalamoveQuotation = {
  quotationId: "QUOTE-123456",
  price: 150.0,
  distance: 5.2,
  estimatedDeliveryTime: "30-45 minutes",
  currency: "PHP",
};

export const mockQuotationExpensive: LalamoveQuotation = {
  quotationId: "QUOTE-789012",
  price: 450.0,
  distance: 25.8,
  estimatedDeliveryTime: "90-120 minutes",
  currency: "PHP",
};

export const mockOrderCreation: LalamoveOrder = {
  orderId: "ORDER-ABC123",
  status: "ASSIGNING_DRIVER",
  trackingUrl: "https://lalamove.com/track/ORDER-ABC123",
};

// Mock quotation endpoint
export const createQuotation = jest.fn(
  async (pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const distance = Math.sqrt(
      Math.pow(dropoff.lat - pickup.lat, 2) + Math.pow(dropoff.lng - pickup.lng, 2)
    ) * 100; // Approximate distance

    if (distance > 50) {
      return {
        success: false,
        error: "Delivery location too far from pickup point",
      };
    }

    const basePrice = 100;
    const pricePerKm = 20;
    const totalPrice = basePrice + distance * pricePerKm;

    return {
      success: true,
      data: {
        quotationId: `QUOTE-${Date.now()}`,
        price: Math.round(totalPrice * 100) / 100,
        distance: Math.round(distance * 10) / 10,
        estimatedDeliveryTime: distance < 10 ? "30-45 minutes" : "60-90 minutes",
        currency: "PHP",
      },
    };
  }
);

// Mock order creation endpoint
export const createOrder = jest.fn(async (quotationId: string, orderDetails: any) => {
  await new Promise((resolve) => setTimeout(resolve, 150));

  if (!quotationId || !quotationId.startsWith("QUOTE-")) {
    return {
      success: false,
      error: "Invalid quotation ID",
    };
  }

  return {
    success: true,
    data: mockOrderCreation,
  };
});

// Error scenarios
export const createQuotationError = jest.fn(async () => {
  throw new Error("Lalamove API service unavailable");
});

export const createOrderError = jest.fn(async () => {
  throw new Error("Failed to create Lalamove order");
});

// Reset all mocks
export const resetLalamoveMocks = () => {
  createQuotation.mockClear();
  createOrder.mockClear();
  createQuotationError.mockClear();
  createOrderError.mockClear();
};

export default {
  createQuotation,
  createOrder,
  mockQuotationSuccess,
  mockQuotationExpensive,
  mockOrderCreation,
  resetLalamoveMocks,
};
