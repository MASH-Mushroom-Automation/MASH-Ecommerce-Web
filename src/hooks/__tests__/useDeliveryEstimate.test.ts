/**
 * Tests for src/hooks/useDeliveryEstimate.ts
 *
 * Verifies debounced quotation API calls, loading/error/estimate states,
 * null coordinate handling, abort on parameter change, and refetch.
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import { useDeliveryEstimate } from "../useDeliveryEstimate";

// ─── Mock fetch ──────────────────────────────────────────────

const mockFetch = jest.fn();
global.fetch = mockFetch;

// ─── Helpers ──────────────────────────────────────────────────

const defaultParams = {
  pickupLat: 14.5995,
  pickupLng: 120.9842,
  dropoffLat: 14.6091,
  dropoffLng: 120.9897,
  vehicleType: "MOTORCYCLE",
};

const mockQuotationResponse = {
  success: true,
  data: {
    quotationId: "q-123",
    price: "149.00",
    currency: "PHP",
    distance: { value: "5.2", unit: "km" },
    expiresAt: "2024-01-15T11:00:00Z",
  },
};

function setupFetchSuccess(data = mockQuotationResponse) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
}

function setupFetchError(status = 400, message = "Bad request") {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ message }),
  });
}

// ─── Tests ──────────────────────────────────────────────────

describe("useDeliveryEstimate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return loading true after debounce fires", async () => {
    setupFetchSuccess();
    const { result } = renderHook(() => useDeliveryEstimate(defaultParams));

    // Before debounce fires
    expect(result.current.loading).toBe(false);
    expect(result.current.estimate).toBeNull();

    // Advance past debounce
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.loading).toBe(true);
  });

  it("should return estimate on successful fetch", async () => {
    setupFetchSuccess();
    const { result } = renderHook(() => useDeliveryEstimate(defaultParams));

    act(() => {
      jest.advanceTimersByTime(500);
    });

    jest.useRealTimers();

    await waitFor(() => {
      expect(result.current.estimate).not.toBeNull();
    });

    expect(result.current.estimate?.quotationId).toBe("q-123");
    expect(result.current.estimate?.price).toBe("149.00");
    expect(result.current.estimate?.currency).toBe("PHP");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should return error on failed fetch", async () => {
    setupFetchError(400, "Invalid coordinates");
    const { result } = renderHook(() => useDeliveryEstimate(defaultParams));

    act(() => {
      jest.advanceTimersByTime(500);
    });

    jest.useRealTimers();

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error).toBe("Invalid coordinates");
    expect(result.current.estimate).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("should not fetch when coordinates are null", () => {
    const { result } = renderHook(() =>
      useDeliveryEstimate({
        pickupLat: null,
        pickupLng: null,
        dropoffLat: null,
        dropoffLng: null,
      })
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.estimate).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should not fetch when only pickup is null", () => {
    renderHook(() =>
      useDeliveryEstimate({
        pickupLat: null,
        pickupLng: null,
        dropoffLat: 14.6091,
        dropoffLng: 120.9897,
      })
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should debounce rapid param changes", () => {
    setupFetchSuccess();
    const { rerender } = renderHook(
      (props) => useDeliveryEstimate(props),
      { initialProps: defaultParams }
    );

    // Change params rapidly
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ ...defaultParams, dropoffLat: 14.61 });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ ...defaultParams, dropoffLat: 14.62 });

    // Before final debounce completes, no fetch yet
    expect(mockFetch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Only one fetch after debounce settles
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should call refetch to re-trigger fetch", async () => {
    setupFetchSuccess();
    setupFetchSuccess(); // for refetch
    const { result } = renderHook(() => useDeliveryEstimate(defaultParams));

    act(() => {
      jest.advanceTimersByTime(500);
    });

    jest.useRealTimers();

    await waitFor(() => {
      expect(result.current.estimate).not.toBeNull();
    });

    // Call refetch
    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it("should pass vehicleType to API", async () => {
    setupFetchSuccess();
    renderHook(() =>
      useDeliveryEstimate({ ...defaultParams, vehicleType: "SEDAN" })
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });

    jest.useRealTimers();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.serviceType).toBe("SEDAN");
  });
});
