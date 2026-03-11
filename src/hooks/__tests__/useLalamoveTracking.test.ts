/**
 * Tests for src/hooks/useLalamoveTracking.ts
 *
 * Verifies real-time Firestore onSnapshot subscription, loading/error/data
 * states, cleanup on unmount, and null orderId handling.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// ─── Module mock ──────────────────────────────────────────────

const mockSubscribeToOrder = jest.fn();

jest.mock("@/lib/firebase/orders", () => ({
  FirebaseOrdersService: {
    subscribeToOrder: (...args: unknown[]) => mockSubscribeToOrder(...args),
  },
}));

import { useLalamoveTracking } from "../useLalamoveTracking";

// ─── Helpers ──────────────────────────────────────────────────

const makeOrder = (trackingOverrides: Record<string, unknown> = {}) => ({
  id: "order-1",
  orderNumber: "MASH-001",
  userId: "u1",
  status: "shipped",
  items: [],
  subtotal: 100,
  deliveryFee: 50,
  tax: 0,
  total: 150,
  lalamoveTracking: {
    orderId: "llm-1",
    quotationId: "q-1",
    status: "ON_GOING",
    driver: {
      id: "d-1",
      name: "Juan Cruz",
      phone: "+639171234567",
      plateNumber: "ABC 1234",
    },
    lastUpdated: new Date().toISOString(),
    ...trackingOverrides,
  },
});

// ─── Setup ─────────────────────────────────────────────────────

let capturedOnUpdate: ((order: unknown) => void) | null = null;
let capturedOnError: ((err: Error) => void) | null = null;
const mockUnsubscribe = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  capturedOnUpdate = null;
  capturedOnError = null;

  mockSubscribeToOrder.mockImplementation(
    (_orderId: string, onUpdate: (order: unknown) => void, onError: (err: Error) => void) => {
      capturedOnUpdate = onUpdate;
      capturedOnError = onError;
      return mockUnsubscribe;
    }
  );
});

// ─── Tests ─────────────────────────────────────────────────────

describe("useLalamoveTracking", () => {
  it("should return loading=true initially when orderId is provided", () => {
    const { result } = renderHook(() => useLalamoveTracking("order-1"));

    expect(result.current.loading).toBe(true);
    expect(result.current.tracking).toBeNull();
    expect(result.current.order).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should call subscribeToOrder with the orderId", () => {
    renderHook(() => useLalamoveTracking("order-1"));

    expect(mockSubscribeToOrder).toHaveBeenCalledTimes(1);
    expect(mockSubscribeToOrder).toHaveBeenCalledWith(
      "order-1",
      expect.any(Function),
      expect.any(Function)
    );
  });

  it("should update tracking when onSnapshot fires with order data", async () => {
    const { result } = renderHook(() => useLalamoveTracking("order-1"));

    act(() => {
      capturedOnUpdate!(makeOrder());
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.tracking).not.toBeNull();
      expect(result.current.tracking!.status).toBe("ON_GOING");
      expect(result.current.tracking!.driver?.name).toBe("Juan Cruz");
      expect(result.current.order).not.toBeNull();
    });
  });

  it("should set tracking to null when order has no lalamoveTracking", async () => {
    const { result } = renderHook(() => useLalamoveTracking("order-1"));

    act(() => {
      capturedOnUpdate!({ id: "order-1", status: "pending" });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.tracking).toBeNull();
    });
  });

  it("should set error when onSnapshot fires an error", async () => {
    const { result } = renderHook(() => useLalamoveTracking("order-1"));

    act(() => {
      capturedOnError!(new Error("Permission denied"));
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Permission denied");
    });
  });

  it("should return defaults and not subscribe when orderId is null", () => {
    const { result } = renderHook(() => useLalamoveTracking(null));

    expect(mockSubscribeToOrder).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.tracking).toBeNull();
    expect(result.current.order).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should return defaults and not subscribe when orderId is undefined", () => {
    const { result } = renderHook(() => useLalamoveTracking(undefined));

    expect(mockSubscribeToOrder).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it("should unsubscribe when unmounted", () => {
    const { unmount } = renderHook(() => useLalamoveTracking("order-1"));

    expect(mockUnsubscribe).not.toHaveBeenCalled();
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it("should re-subscribe when orderId changes", () => {
    const { rerender } = renderHook(
      ({ id }: { id: string | null }) => useLalamoveTracking(id),
      { initialProps: { id: "order-1" } }
    );

    expect(mockSubscribeToOrder).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribe).not.toHaveBeenCalled();

    rerender({ id: "order-2" });

    // Old subscription cleaned up, new one created
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    expect(mockSubscribeToOrder).toHaveBeenCalledTimes(2);
    expect(mockSubscribeToOrder).toHaveBeenLastCalledWith(
      "order-2",
      expect.any(Function),
      expect.any(Function)
    );
  });

  it("should update tracking when status changes via onSnapshot", async () => {
    const { result } = renderHook(() => useLalamoveTracking("order-1"));

    // First snapshot
    act(() => {
      capturedOnUpdate!(makeOrder({ status: "ASSIGNING_DRIVER" }));
    });

    await waitFor(() => {
      expect(result.current.tracking!.status).toBe("ASSIGNING_DRIVER");
    });

    // Second snapshot — status change
    act(() => {
      capturedOnUpdate!(makeOrder({ status: "COMPLETED" }));
    });

    await waitFor(() => {
      expect(result.current.tracking!.status).toBe("COMPLETED");
    });
  });

  it("should handle null order from onSnapshot gracefully", async () => {
    const { result } = renderHook(() => useLalamoveTracking("order-1"));

    act(() => {
      capturedOnUpdate!(null);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.tracking).toBeNull();
      expect(result.current.order).toBeNull();
    });
  });
});
