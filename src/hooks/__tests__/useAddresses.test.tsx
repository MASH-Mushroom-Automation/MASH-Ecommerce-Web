/**
 * Tests for src/hooks/useAddresses.ts
 *
 * Hook:  useAddresses
 *
 * CRUD operations for user addresses via addressApi from @/lib/api/addresses.
 * Manages loading, creating, updating, deleting, and setting default addresses.
 * All API responses follow { success, data?, error? } pattern.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// ─── Manual mock for addressApi ───────────────────────────────

jest.mock("@/lib/api/addresses", () => ({
  addressApi: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    setDefault: jest.fn(),
  },
}));

const { addressApi: mockAddressApi } = jest.requireMock("@/lib/api/addresses") as {
  addressApi: {
    getAll: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    setDefault: jest.Mock;
  };
};

import { useAddresses } from "../useAddresses";

// ─── Test Data ────────────────────────────────────────────────

const mockAddress1 = {
  id: "addr-1",
  label: "Home",
  street: "123 Main St",
  city: "Manila",
  isDefault: true,
};

const mockAddress2 = {
  id: "addr-2",
  label: "Office",
  street: "456 Work Ave",
  city: "Cebu",
  isDefault: false,
};

const createRequest = {
  label: "New",
  street: "789 New Blvd",
  city: "Davao",
};

// ─── Setup ────────────────────────────────────────────────────

beforeEach(() => {
  mockAddressApi.getAll.mockClear();
  mockAddressApi.create.mockClear();
  mockAddressApi.update.mockClear();
  mockAddressApi.delete.mockClear();
  mockAddressApi.setDefault.mockClear();

  // Default: getAll returns two addresses
  mockAddressApi.getAll.mockResolvedValue({
    success: true,
    data: [mockAddress1, mockAddress2],
  });
});

// ═══════════════════════════════════════════════════════════════
// Loading & Fetching
// ═══════════════════════════════════════════════════════════════

describe("useAddresses - loading & fetching", () => {
  it("starts in loading state with empty addresses", () => {
    mockAddressApi.getAll.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useAddresses());

    expect(result.current.loading).toBe(true);
    expect(result.current.addresses).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("loads addresses on mount", async () => {
    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockAddressApi.getAll).toHaveBeenCalledTimes(1);
    expect(result.current.addresses).toHaveLength(2);
    expect(result.current.addresses[0].id).toBe("addr-1");
  });

  it("sets error when getAll fails with API error", async () => {
    mockAddressApi.getAll.mockResolvedValue({
      success: false,
      error: "Unauthorized",
    });
    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Unauthorized");
    expect(result.current.addresses).toEqual([]);
  });

  it("sets fallback error when getAll fails with no error message", async () => {
    mockAddressApi.getAll.mockResolvedValue({ success: false });
    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to load addresses");
  });

  it("sets error on exception thrown", async () => {
    mockAddressApi.getAll.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Network error");
  });

  it("handles non-Error exception with fallback message", async () => {
    mockAddressApi.getAll.mockRejectedValue("broken");
    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Unknown error occurred");
  });
});

// ═══════════════════════════════════════════════════════════════
// Create Address
// ═══════════════════════════════════════════════════════════════

describe("useAddresses - createAddress", () => {
  it("creates address and appends to list", async () => {
    const newAddr = { id: "addr-3", ...createRequest, isDefault: false };
    mockAddressApi.create.mockResolvedValue({ success: true, data: newAddr });

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean = false;
    await act(async () => {
      success = await result.current.createAddress(createRequest as any);
    });

    expect(success).toBe(true);
    expect(result.current.addresses).toHaveLength(3);
    expect(result.current.addresses[2].id).toBe("addr-3");
  });

  it("sets isCreating during creation", async () => {
    let resolveCreate: any;
    mockAddressApi.create.mockReturnValue(
      new Promise((res) => (resolveCreate = res))
    );

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let createPromise: Promise<boolean>;
    act(() => {
      createPromise = result.current.createAddress(createRequest as any);
    });

    expect(result.current.isCreating).toBe(true);

    await act(async () => {
      resolveCreate({ success: true, data: { id: "new", ...createRequest } });
      await createPromise!;
    });

    expect(result.current.isCreating).toBe(false);
  });

  it("returns false and sets error on API failure", async () => {
    mockAddressApi.create.mockResolvedValue({
      success: false,
      error: "Validation failed",
    });

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean = true;
    await act(async () => {
      success = await result.current.createAddress(createRequest as any);
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Validation failed");
    expect(result.current.addresses).toHaveLength(2); // unchanged
  });

  it("returns false on exception", async () => {
    mockAddressApi.create.mockRejectedValue(new Error("Create failed"));

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean = true;
    await act(async () => {
      success = await result.current.createAddress(createRequest as any);
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Create failed");
  });
});

// ═══════════════════════════════════════════════════════════════
// Update Address
// ═══════════════════════════════════════════════════════════════

describe("useAddresses - updateAddress", () => {
  it("updates existing address in the list", async () => {
    const updated = { ...mockAddress1, label: "New Home" };
    mockAddressApi.update.mockResolvedValue({ success: true, data: updated });

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean = false;
    await act(async () => {
      success = await result.current.updateAddress({ id: "addr-1", label: "New Home" } as any);
    });

    expect(success).toBe(true);
    expect(result.current.addresses[0].label).toBe("New Home");
  });

  it("sets isUpdating during update", async () => {
    let resolveUpdate: any;
    mockAddressApi.update.mockReturnValue(
      new Promise((res) => (resolveUpdate = res))
    );

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let updatePromise: Promise<boolean>;
    act(() => {
      updatePromise = result.current.updateAddress({ id: "addr-1" } as any);
    });

    expect(result.current.isUpdating).toBe(true);

    await act(async () => {
      resolveUpdate({ success: true, data: mockAddress1 });
      await updatePromise!;
    });

    expect(result.current.isUpdating).toBe(false);
  });

  it("returns false on API failure", async () => {
    mockAddressApi.update.mockResolvedValue({
      success: false,
      error: "Update not allowed",
    });

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean = true;
    await act(async () => {
      success = await result.current.updateAddress({ id: "addr-1" } as any);
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Update not allowed");
  });
});

// ═══════════════════════════════════════════════════════════════
// Delete Address
// ═══════════════════════════════════════════════════════════════

describe("useAddresses - deleteAddress", () => {
  it("deletes address and removes from list", async () => {
    mockAddressApi.delete.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean = false;
    await act(async () => {
      success = await result.current.deleteAddress("addr-1");
    });

    expect(success).toBe(true);
    expect(result.current.addresses).toHaveLength(1);
    expect(result.current.addresses[0].id).toBe("addr-2");
  });

  it("sets isDeleting during deletion", async () => {
    let resolveDelete: any;
    mockAddressApi.delete.mockReturnValue(
      new Promise((res) => (resolveDelete = res))
    );

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let deletePromise: Promise<boolean>;
    act(() => {
      deletePromise = result.current.deleteAddress("addr-1");
    });

    expect(result.current.isDeleting).toBe(true);

    await act(async () => {
      resolveDelete({ success: true });
      await deletePromise!;
    });

    expect(result.current.isDeleting).toBe(false);
  });

  it("returns false on API failure", async () => {
    mockAddressApi.delete.mockResolvedValue({
      success: false,
      error: "Cannot delete default",
    });

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean = true;
    await act(async () => {
      success = await result.current.deleteAddress("addr-1");
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Cannot delete default");
    expect(result.current.addresses).toHaveLength(2); // unchanged
  });

  it("returns false on exception", async () => {
    mockAddressApi.delete.mockRejectedValue(new Error("Delete failed"));

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean = true;
    await act(async () => {
      success = await result.current.deleteAddress("addr-1");
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Delete failed");
  });
});

// ═══════════════════════════════════════════════════════════════
// Set Default Address
// ═══════════════════════════════════════════════════════════════

describe("useAddresses - setDefaultAddress", () => {
  it("sets target address as default and others as non-default", async () => {
    mockAddressApi.setDefault.mockResolvedValue({
      success: true,
      data: { ...mockAddress2, isDefault: true },
    });

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean = false;
    await act(async () => {
      success = await result.current.setDefaultAddress("addr-2");
    });

    expect(success).toBe(true);
    const addr1 = result.current.addresses.find((a: any) => a.id === "addr-1");
    const addr2 = result.current.addresses.find((a: any) => a.id === "addr-2");
    expect(addr1?.isDefault).toBe(false);
    expect(addr2?.isDefault).toBe(true);
  });

  it("returns false on API failure", async () => {
    mockAddressApi.setDefault.mockResolvedValue({
      success: false,
      error: "Not found",
    });

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean = true;
    await act(async () => {
      success = await result.current.setDefaultAddress("invalid-id");
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Not found");
  });

  it("returns false on exception", async () => {
    mockAddressApi.setDefault.mockRejectedValue(new Error("Server error"));

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean = true;
    await act(async () => {
      success = await result.current.setDefaultAddress("addr-1");
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Server error");
  });
});

// ═══════════════════════════════════════════════════════════════
// Refresh Addresses
// ═══════════════════════════════════════════════════════════════

describe("useAddresses - refreshAddresses", () => {
  it("reloads addresses from API", async () => {
    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updatedAddresses = [{ ...mockAddress1, label: "Updated Home" }];
    mockAddressApi.getAll.mockResolvedValue({
      success: true,
      data: updatedAddresses,
    });

    await act(async () => {
      await result.current.refreshAddresses();
    });

    await waitFor(() => {
      expect(result.current.addresses).toHaveLength(1);
      expect(result.current.addresses[0].label).toBe("Updated Home");
    });
  });

  it("clears error on successful refresh", async () => {
    // First load fails
    mockAddressApi.getAll.mockResolvedValueOnce({
      success: false,
      error: "Initial error",
    });

    const { result } = renderHook(() => useAddresses());
    await waitFor(() => expect(result.current.error).toBe("Initial error"));

    // Refresh succeeds
    mockAddressApi.getAll.mockResolvedValue({
      success: true,
      data: [mockAddress1],
    });

    await act(async () => {
      await result.current.refreshAddresses();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.addresses).toHaveLength(1);
    });
  });
});
