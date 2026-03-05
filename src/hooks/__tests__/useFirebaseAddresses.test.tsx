/**
 * Tests for src/hooks/useFirebaseAddresses.ts
 *
 * Hook:  useFirebaseAddresses
 *
 * Manages user delivery addresses with Firebase real-time subscription.
 * CRUD operations delegate to FirebaseAddressService static methods.
 * Requires authenticated user via useAuth().
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// ─── Module mock for FirebaseAddressService ───────────────────

const mockSubscribeToAddresses = jest.fn();
const mockAddAddress = jest.fn();
const mockUpdateAddress = jest.fn();
const mockDeleteAddress = jest.fn();
const mockSetDefaultAddress = jest.fn();
const mockGetAddresses = jest.fn();
const mockToDeliveryAddress = jest.fn();

jest.mock("@/lib/firebase/addresses", () => ({
  FirebaseAddressService: {
    subscribeToAddresses: (...args: unknown[]) => mockSubscribeToAddresses(...args),
    addAddress: (...args: unknown[]) => mockAddAddress(...args),
    updateAddress: (...args: unknown[]) => mockUpdateAddress(...args),
    deleteAddress: (...args: unknown[]) => mockDeleteAddress(...args),
    setDefaultAddress: (...args: unknown[]) => mockSetDefaultAddress(...args),
    getAddresses: (...args: unknown[]) => mockGetAddresses(...args),
    toDeliveryAddress: (...args: unknown[]) => mockToDeliveryAddress(...args),
  },
}));

// Grab global useAuth mock from jest.setupMocks.js
const mockUseAuth = jest.requireMock("@/contexts/AuthContext").useAuth;

import { useFirebaseAddresses } from "../useFirebaseAddresses";

// ─── Helpers ──────────────────────────────────────────────────

const authenticatedUser = {
  user: { id: "user-1", email: "test@test.com", displayName: "Test" },
  isAuthenticated: true,
  loading: false,
};

const unauthenticatedUser = {
  user: null,
  isAuthenticated: false,
  loading: false,
};

const makeAddress = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  userId: "user-1",
  label: "Home",
  fullName: "Test User",
  phone: "+639123456789",
  line1: "123 Test St",
  line2: "",
  city: "Manila",
  province: "Metro Manila",
  postalCode: "1000",
  country: "PH",
  isDefault: false,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  ...overrides,
});

let realtimeCallback: ((addresses: unknown[]) => void) | null = null;
const mockUnsubscribe = jest.fn();

// ─── Setup ────────────────────────────────────────────────────

beforeEach(() => {
  mockSubscribeToAddresses.mockReset();
  mockAddAddress.mockReset();
  mockUpdateAddress.mockReset();
  mockDeleteAddress.mockReset();
  mockSetDefaultAddress.mockReset();
  mockGetAddresses.mockReset();
  mockToDeliveryAddress.mockReset();
  mockUnsubscribe.mockClear();
  realtimeCallback = null;

  // Default: authenticated
  mockUseAuth.mockReturnValue(authenticatedUser);

  // Default subscription behavior: capture callback
  mockSubscribeToAddresses.mockImplementation(
    (_userId: string, callback: (addresses: unknown[]) => void) => {
      realtimeCallback = callback;
      return mockUnsubscribe;
    }
  );
});

// ─── Tests ────────────────────────────────────────────────────

describe("useFirebaseAddresses", () => {
  // ── Loading / Initial state ─────────────────────────────────

  it("starts in loading state for authenticated user", () => {
    const { result } = renderHook(() => useFirebaseAddresses());

    expect(result.current.loading).toBe(true);
    expect(result.current.addresses).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.mutating).toBe(false);
  });

  it("sets addresses from real-time subscription", async () => {
    const addresses = [
      makeAddress("addr-1", { isDefault: true }),
      makeAddress("addr-2"),
    ];

    const { result } = renderHook(() => useFirebaseAddresses());

    // Trigger real-time callback
    act(() => {
      realtimeCallback?.(addresses);
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.addresses).toHaveLength(2);
  });

  // ── Unauthenticated behavior ────────────────────────────────

  it("returns empty data when not authenticated", async () => {
    mockUseAuth.mockReturnValue(unauthenticatedUser);

    const { result } = renderHook(() => useFirebaseAddresses());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.addresses).toEqual([]);
    expect(result.current.hasAddresses).toBe(false);
    expect(mockSubscribeToAddresses).not.toHaveBeenCalled();
  });

  // ── Computed values ─────────────────────────────────────────

  it("computes defaultAddress from isDefault flag", async () => {
    const addresses = [
      makeAddress("addr-1"),
      makeAddress("addr-2", { isDefault: true }),
    ];

    const { result } = renderHook(() => useFirebaseAddresses());

    act(() => {
      realtimeCallback?.(addresses);
    });

    await waitFor(() => expect(result.current.defaultAddress).not.toBeNull());
    expect(result.current.defaultAddress!.id).toBe("addr-2");
  });

  it("defaults to first address when none has isDefault", async () => {
    const addresses = [makeAddress("addr-1"), makeAddress("addr-2")];

    const { result } = renderHook(() => useFirebaseAddresses());

    act(() => {
      realtimeCallback?.(addresses);
    });

    await waitFor(() => expect(result.current.defaultAddress).not.toBeNull());
    expect(result.current.defaultAddress!.id).toBe("addr-1");
  });

  it("returns null defaultAddress when no addresses", async () => {
    const { result } = renderHook(() => useFirebaseAddresses());

    act(() => {
      realtimeCallback?.([]);
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.defaultAddress).toBeNull();
  });

  it("computes hasAddresses correctly", async () => {
    const { result } = renderHook(() => useFirebaseAddresses());

    act(() => {
      realtimeCallback?.([makeAddress("addr-1")]);
    });

    await waitFor(() => expect(result.current.hasAddresses).toBe(true));
  });

  // ── Subscription lifecycle ──────────────────────────────────

  it("subscribes with user id", () => {
    renderHook(() => useFirebaseAddresses());

    expect(mockSubscribeToAddresses).toHaveBeenCalledWith(
      "user-1",
      expect.any(Function)
    );
  });

  it("unsubscribes on unmount", () => {
    const { unmount } = renderHook(() => useFirebaseAddresses());

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  // ── addAddress ──────────────────────────────────────────────

  it("addAddress returns id on success", async () => {
    mockAddAddress.mockResolvedValue("new-addr-1");

    const { result } = renderHook(() => useFirebaseAddresses());

    act(() => {
      realtimeCallback?.([]);
    });

    let addressId: string | null = null;
    await act(async () => {
      addressId = await result.current.addAddress({
        label: "Work",
        fullName: "Test",
        phone: "+639123456789",
        line1: "456 Work St",
        city: "Manila",
        province: "Metro Manila",
        postalCode: "1000",
        country: "PH",
      });
    });

    expect(addressId).toBe("new-addr-1");
    expect(mockAddAddress).toHaveBeenCalledWith("user-1", expect.objectContaining({ label: "Work" }));
    expect(result.current.mutating).toBe(false);
  });

  it("addAddress returns null when not authenticated", async () => {
    mockUseAuth.mockReturnValue(unauthenticatedUser);

    const { result } = renderHook(() => useFirebaseAddresses());

    let addressId: string | null = null;
    await act(async () => {
      addressId = await result.current.addAddress({
        label: "Home",
        fullName: "Test",
        phone: "+639123456789",
        line1: "123 St",
        city: "Manila",
        province: "Metro Manila",
        postalCode: "1000",
        country: "PH",
      });
    });

    expect(addressId).toBeNull();
    expect(result.current.error).toBe("Must be logged in to add address");
  });

  it("addAddress handles errors", async () => {
    mockAddAddress.mockRejectedValue(new Error("Firebase error"));

    const { result } = renderHook(() => useFirebaseAddresses());

    act(() => {
      realtimeCallback?.([]);
    });

    let addressId: string | null = null;
    await act(async () => {
      addressId = await result.current.addAddress({
        label: "Home",
        fullName: "Test",
        phone: "+639123456789",
        line1: "123 St",
        city: "Manila",
        province: "Metro Manila",
        postalCode: "1000",
        country: "PH",
      });
    });

    expect(addressId).toBeNull();
    expect(result.current.error).toBe("Firebase error");
    expect(result.current.mutating).toBe(false);
  });

  // ── updateAddress ───────────────────────────────────────────

  it("updateAddress returns true on success", async () => {
    mockUpdateAddress.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFirebaseAddresses());

    act(() => {
      realtimeCallback?.([]);
    });

    let success = false;
    await act(async () => {
      success = await result.current.updateAddress("addr-1", { label: "Office" });
    });

    expect(success).toBe(true);
    expect(mockUpdateAddress).toHaveBeenCalledWith("user-1", "addr-1", { label: "Office" });
  });

  it("updateAddress returns false when not authenticated", async () => {
    mockUseAuth.mockReturnValue(unauthenticatedUser);

    const { result } = renderHook(() => useFirebaseAddresses());

    let success = false;
    await act(async () => {
      success = await result.current.updateAddress("addr-1", { label: "Office" });
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Must be logged in to update address");
  });

  it("updateAddress handles errors", async () => {
    mockUpdateAddress.mockRejectedValue(new Error("Update failed"));

    const { result } = renderHook(() => useFirebaseAddresses());

    act(() => {
      realtimeCallback?.([]);
    });

    let success = false;
    await act(async () => {
      success = await result.current.updateAddress("addr-1", { label: "Office" });
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Update failed");
  });

  // ── deleteAddress ───────────────────────────────────────────

  it("deleteAddress returns true on success", async () => {
    mockDeleteAddress.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFirebaseAddresses());

    act(() => {
      realtimeCallback?.([]);
    });

    let success = false;
    await act(async () => {
      success = await result.current.deleteAddress("addr-1");
    });

    expect(success).toBe(true);
    expect(mockDeleteAddress).toHaveBeenCalledWith("user-1", "addr-1");
  });

  it("deleteAddress returns false when not authenticated", async () => {
    mockUseAuth.mockReturnValue(unauthenticatedUser);

    const { result } = renderHook(() => useFirebaseAddresses());

    let success = false;
    await act(async () => {
      success = await result.current.deleteAddress("addr-1");
    });

    expect(success).toBe(false);
  });

  it("deleteAddress handles errors", async () => {
    mockDeleteAddress.mockRejectedValue(new Error("Delete failed"));

    const { result } = renderHook(() => useFirebaseAddresses());

    act(() => {
      realtimeCallback?.([]);
    });

    let success = false;
    await act(async () => {
      success = await result.current.deleteAddress("addr-1");
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Delete failed");
  });

  // ── setAsDefault ────────────────────────────────────────────

  it("setAsDefault returns true on success", async () => {
    mockSetDefaultAddress.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFirebaseAddresses());

    act(() => {
      realtimeCallback?.([]);
    });

    let success = false;
    await act(async () => {
      success = await result.current.setAsDefault("addr-2");
    });

    expect(success).toBe(true);
    expect(mockSetDefaultAddress).toHaveBeenCalledWith("user-1", "addr-2");
  });

  it("setAsDefault returns false when not authenticated", async () => {
    mockUseAuth.mockReturnValue(unauthenticatedUser);

    const { result } = renderHook(() => useFirebaseAddresses());

    let success = false;
    await act(async () => {
      success = await result.current.setAsDefault("addr-2");
    });

    expect(success).toBe(false);
  });

  it("setAsDefault handles errors", async () => {
    mockSetDefaultAddress.mockRejectedValue(new Error("Default failed"));

    const { result } = renderHook(() => useFirebaseAddresses());

    act(() => {
      realtimeCallback?.([]);
    });

    let success = false;
    await act(async () => {
      success = await result.current.setAsDefault("addr-2");
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Default failed");
  });

  // ── refresh ─────────────────────────────────────────────────

  it("refresh re-fetches addresses via getAddresses", async () => {
    const freshAddresses = [makeAddress("addr-new")];
    mockGetAddresses.mockResolvedValue(freshAddresses);

    const { result } = renderHook(() => useFirebaseAddresses());

    act(() => {
      realtimeCallback?.([]);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockGetAddresses).toHaveBeenCalledWith("user-1");
    expect(result.current.addresses).toHaveLength(1);
    expect(result.current.addresses[0].id).toBe("addr-new");
  });

  it("refresh handles errors gracefully", async () => {
    mockGetAddresses.mockRejectedValue(new Error("Refresh failed"));

    const { result } = renderHook(() => useFirebaseAddresses());

    act(() => {
      realtimeCallback?.([]);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.error).toBe("Refresh failed");
    expect(result.current.loading).toBe(false);
  });

  it("refresh does nothing when not authenticated", async () => {
    mockUseAuth.mockReturnValue(unauthenticatedUser);

    const { result } = renderHook(() => useFirebaseAddresses());

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockGetAddresses).not.toHaveBeenCalled();
  });

  // ── toDeliveryData ──────────────────────────────────────────

  it("delegates toDeliveryData to FirebaseAddressService", () => {
    const address = makeAddress("addr-1");
    const deliveryData = { fullName: "Test", phone: "+639123456789", line1: "123 St" };
    mockToDeliveryAddress.mockReturnValue(deliveryData);

    const { result } = renderHook(() => useFirebaseAddresses());

    const converted = result.current.toDeliveryData(address as any);

    expect(mockToDeliveryAddress).toHaveBeenCalledWith(address);
    expect(converted).toEqual(deliveryData);
  });
});
