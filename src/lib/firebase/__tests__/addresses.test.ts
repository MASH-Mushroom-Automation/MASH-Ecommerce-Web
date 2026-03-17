/**
 * Tests for FirebaseAddressService
 * COVERAGE-007: Firebase Services - addresses.ts
 */

// Unmock the service so we test the real implementation
jest.unmock("@/lib/firebase/addresses");

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import {
  FirebaseAddressService,
  type FirestoreAddress,
  type AddressInput,
} from "@/lib/firebase/addresses";

// Helper to build a mock FirestoreAddress
function makeMockAddress(overrides: Partial<FirestoreAddress> = {}): FirestoreAddress {
  return {
    id: "addr-1",
    label: "Home",
    isDefault: false,
    street: "123 Main St",
    city: "Manila",
    stateProvince: "NCR",
    zipPostal: "1000",
    coordinates: { lat: 14.5, lng: 121.0 },
    formattedAddress: "123 Main St, Manila, NCR 1000",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ...overrides,
  };
}

function makeAddressInput(overrides: Partial<AddressInput> = {}): AddressInput {
  return {
    label: "Home",
    street: "123 Main St",
    city: "Manila",
    stateProvince: "NCR",
    zipPostal: "1000",
    coordinates: { lat: 14.5, lng: 121.0 },
    formattedAddress: "123 Main St, Manila, NCR 1000",
    ...overrides,
  };
}

const mockDocRef = { id: "new-addr-id", path: "users/user1/addresses/new-addr-id" };

describe("FirebaseAddressService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: doc() returns a mock ref with id
    jest.mocked(doc).mockReturnValue(mockDocRef as any);
    jest.mocked(collection).mockReturnValue("addresses-collection-ref" as any);
    jest.mocked(query).mockReturnValue("query-ref" as any);
    jest.mocked(where).mockReturnValue("where-clause" as any);
    jest.mocked(orderBy).mockReturnValue("orderBy-clause" as any);
  });

  // ==========================================================================
  // addAddress
  // ==========================================================================
  describe("addAddress", () => {
    it("creates address document and returns ID", async () => {
      jest.mocked(setDoc).mockResolvedValue(undefined);
      jest.mocked(getDocs).mockResolvedValue({ docs: [], empty: true, forEach: jest.fn() } as any);

      const result = await FirebaseAddressService.addAddress("user1", makeAddressInput());

      expect(result).toBe("new-addr-id");
      expect(setDoc).toHaveBeenCalledTimes(1);
      const savedData = jest.mocked(setDoc).mock.calls[0][1] as any;
      expect(savedData.id).toBe("new-addr-id");
      expect(savedData.label).toBe("Home");
      expect(savedData.isDefault).toBe(false);
      expect(savedData.street).toBe("123 Main St");
    });

    it("clears existing defaults when isDefault is true", async () => {
      jest.mocked(getDocs).mockResolvedValue({ docs: [], empty: true, forEach: jest.fn() } as any);
      jest.mocked(setDoc).mockResolvedValue(undefined);
      const mockBatch = { update: jest.fn(), commit: jest.fn().mockResolvedValue(undefined), set: jest.fn(), delete: jest.fn() };
      jest.mocked(writeBatch).mockReturnValue(mockBatch as any);

      await FirebaseAddressService.addAddress("user1", makeAddressInput({ isDefault: true }));

      // getDocs called for clearDefaultAddresses query
      expect(getDocs).toHaveBeenCalled();
      expect(setDoc).toHaveBeenCalledTimes(1);
      const savedData = jest.mocked(setDoc).mock.calls[0][1] as any;
      expect(savedData.isDefault).toBe(true);
    });

    it("removes undefined optional fields from saved data", async () => {
      jest.mocked(setDoc).mockResolvedValue(undefined);
      jest.mocked(getDocs).mockResolvedValue({ docs: [], empty: true, forEach: jest.fn() } as any);

      await FirebaseAddressService.addAddress("user1", makeAddressInput());

      const savedData = jest.mocked(setDoc).mock.calls[0][1] as any;
      // addressLine2 and landmark are undefined in input, should be stripped
      expect(savedData).not.toHaveProperty("addressLine2");
      expect(savedData).not.toHaveProperty("landmark");
    });

    it("throws on Firestore error", async () => {
      jest.mocked(setDoc).mockRejectedValue(new Error("Permission denied"));

      await expect(
        FirebaseAddressService.addAddress("user1", makeAddressInput())
      ).rejects.toThrow("Permission denied");
    });
  });

  // ==========================================================================
  // getAddresses
  // ==========================================================================
  describe("getAddresses", () => {
    it("returns array of addresses ordered by default then date", async () => {
      const addr1 = makeMockAddress({ id: "a1", isDefault: true });
      const addr2 = makeMockAddress({ id: "a2", isDefault: false });
      jest.mocked(getDocs).mockResolvedValue({
        docs: [
          { data: () => addr1 },
          { data: () => addr2 },
        ],
        empty: false,
        forEach: function (cb: (d: any) => void) {
          this.docs.forEach(cb);
        },
      } as any);

      const result = await FirebaseAddressService.getAddresses("user1");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("a1");
      expect(query).toHaveBeenCalled();
      expect(orderBy).toHaveBeenCalledWith("isDefault", "desc");
      expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
    });

    it("returns empty array on error", async () => {
      jest.mocked(getDocs).mockRejectedValue(new Error("Network error"));

      const result = await FirebaseAddressService.getAddresses("user1");

      expect(result).toEqual([]);
    });
  });

  // ==========================================================================
  // getAddress
  // ==========================================================================
  describe("getAddress", () => {
    it("returns address when found", async () => {
      const addr = makeMockAddress({ id: "addr-x" });
      jest.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => addr,
      } as any);

      const result = await FirebaseAddressService.getAddress("user1", "addr-x");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("addr-x");
    });

    it("returns null when not found", async () => {
      jest.mocked(getDoc).mockResolvedValue({
        exists: () => false,
        data: () => null,
      } as any);

      const result = await FirebaseAddressService.getAddress("user1", "missing");

      expect(result).toBeNull();
    });

    it("returns null on error", async () => {
      jest.mocked(getDoc).mockRejectedValue(new Error("Firestore error"));

      const result = await FirebaseAddressService.getAddress("user1", "addr-x");

      expect(result).toBeNull();
    });
  });

  // ==========================================================================
  // getDefaultAddress
  // ==========================================================================
  describe("getDefaultAddress", () => {
    it("returns default address from query", async () => {
      const defaultAddr = makeMockAddress({ id: "default-1", isDefault: true });
      jest.mocked(getDocs).mockResolvedValue({
        docs: [{ data: () => defaultAddr }],
        empty: false,
        forEach: function (cb: (d: any) => void) { this.docs.forEach(cb); },
      } as any);

      const result = await FirebaseAddressService.getDefaultAddress("user1");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("default-1");
    });

    it("falls back to first address when no default set", async () => {
      const addr = makeMockAddress({ id: "fallback-1", isDefault: false });
      // First call (default query) returns empty, second call (getAddresses) returns addresses
      jest.mocked(getDocs)
        .mockResolvedValueOnce({ docs: [], empty: true, forEach: jest.fn() } as any)
        .mockResolvedValueOnce({
          docs: [{ data: () => addr }],
          empty: false,
          forEach: function (cb: (d: any) => void) { this.docs.forEach(cb); },
        } as any);

      const result = await FirebaseAddressService.getDefaultAddress("user1");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("fallback-1");
    });

    it("returns null when user has no addresses", async () => {
      jest.mocked(getDocs).mockResolvedValue({
        docs: [],
        empty: true,
        forEach: jest.fn(),
      } as any);

      const result = await FirebaseAddressService.getDefaultAddress("user1");

      expect(result).toBeNull();
    });
  });

  // ==========================================================================
  // updateAddress
  // ==========================================================================
  describe("updateAddress", () => {
    it("updates address with partial data", async () => {
      jest.mocked(updateDoc).mockResolvedValue(undefined);
      jest.mocked(getDocs).mockResolvedValue({ docs: [], empty: true, forEach: jest.fn() } as any);

      await FirebaseAddressService.updateAddress("user1", "addr-1", { label: "Work" });

      expect(updateDoc).toHaveBeenCalledTimes(1);
      const updateData = jest.mocked(updateDoc).mock.calls[0][1] as any;
      expect(updateData.label).toBe("Work");
      expect(updateData.updatedAt).toBeDefined();
    });

    it("clears other defaults when setting isDefault", async () => {
      const mockBatch = { update: jest.fn(), commit: jest.fn().mockResolvedValue(undefined), set: jest.fn(), delete: jest.fn() };
      jest.mocked(writeBatch).mockReturnValue(mockBatch as any);
      jest.mocked(getDocs).mockResolvedValue({ docs: [], empty: true, forEach: jest.fn() } as any);
      jest.mocked(updateDoc).mockResolvedValue(undefined);

      await FirebaseAddressService.updateAddress("user1", "addr-1", { isDefault: true });

      // clearDefaultAddresses should have been called
      expect(getDocs).toHaveBeenCalled();
    });

    it("throws on error", async () => {
      jest.mocked(updateDoc).mockRejectedValue(new Error("Permission denied"));

      await expect(
        FirebaseAddressService.updateAddress("user1", "addr-1", { label: "X" })
      ).rejects.toThrow("Permission denied");
    });
  });

  // ==========================================================================
  // setDefaultAddress
  // ==========================================================================
  describe("setDefaultAddress", () => {
    it("clears existing defaults and sets new default", async () => {
      const existingDefault = { ref: { path: "users/user1/addresses/old-default" } };
      jest.mocked(getDocs).mockResolvedValue({
        docs: [existingDefault],
        empty: false,
        forEach: function (cb: (d: any) => void) { this.docs.forEach(cb); },
      } as any);
      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
        set: jest.fn(),
        delete: jest.fn(),
      };
      jest.mocked(writeBatch).mockReturnValue(mockBatch as any);
      jest.mocked(updateDoc).mockResolvedValue(undefined);

      await FirebaseAddressService.setDefaultAddress("user1", "addr-2");

      // Batch should clear old default
      expect(mockBatch.update).toHaveBeenCalledWith(
        existingDefault.ref,
        expect.objectContaining({ isDefault: false })
      );
      expect(mockBatch.commit).toHaveBeenCalled();
      // Then updateDoc sets new default
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ isDefault: true })
      );
    });

    it("throws on error", async () => {
      jest.mocked(getDocs).mockRejectedValue(new Error("Network error"));

      await expect(
        FirebaseAddressService.setDefaultAddress("user1", "addr-1")
      ).rejects.toThrow("Network error");
    });
  });

  // ==========================================================================
  // deleteAddress
  // ==========================================================================
  describe("deleteAddress", () => {
    it("deletes address document", async () => {
      jest.mocked(deleteDoc).mockResolvedValue(undefined);

      await FirebaseAddressService.deleteAddress("user1", "addr-1");

      expect(deleteDoc).toHaveBeenCalledTimes(1);
    });

    it("throws on error", async () => {
      jest.mocked(deleteDoc).mockRejectedValue(new Error("Permission denied"));

      await expect(
        FirebaseAddressService.deleteAddress("user1", "addr-1")
      ).rejects.toThrow("Permission denied");
    });
  });

  // ==========================================================================
  // subscribeToAddresses
  // ==========================================================================
  describe("subscribeToAddresses", () => {
    it("calls onSnapshot and returns unsubscribe function", () => {
      const mockUnsub = jest.fn();
      jest.mocked(onSnapshot).mockImplementation((_ref: any, callback: any) => {
        const mockSnapshot = {
          forEach: (cb: (d: any) => void) => {
            cb({ data: () => makeMockAddress({ id: "s1" }) });
          },
        };
        callback(mockSnapshot);
        return mockUnsub;
      });

      const callback = jest.fn();
      const unsub = FirebaseAddressService.subscribeToAddresses("user1", callback);

      expect(callback).toHaveBeenCalledWith([expect.objectContaining({ id: "s1" })]);
      expect(typeof unsub).toBe("function");
    });

    it("calls callback with empty array on error", () => {
      jest.mocked(onSnapshot).mockImplementation((_ref: any, _success: any, errorCb: any) => {
        errorCb(new Error("Subscription error"));
        return jest.fn();
      });

      const callback = jest.fn();
      FirebaseAddressService.subscribeToAddresses("user1", callback);

      expect(callback).toHaveBeenCalledWith([]);
    });
  });

  // ==========================================================================
  // toDeliveryAddress
  // ==========================================================================
  describe("toDeliveryAddress", () => {
    it("transforms FirestoreAddress to DeliveryAddressData", () => {
      const addr = makeMockAddress({
        id: "addr-1",
        formattedAddress: "123 Main St",
        coordinates: { lat: 14.5, lng: 121.0 },
        landmark: "Near park",
      });

      const result = FirebaseAddressService.toDeliveryAddress(addr);

      expect(result).toEqual({
        address: "123 Main St",
        lat: 14.5,
        lng: 121.0,
        landmark: "Near park",
        addressId: "addr-1",
      });
    });

    it("handles address without landmark", () => {
      const addr = makeMockAddress({ landmark: undefined });

      const result = FirebaseAddressService.toDeliveryAddress(addr);

      expect(result.landmark).toBeUndefined();
    });
  });

  // ==========================================================================
  // hasAddresses & getAddressCount
  // ==========================================================================
  describe("hasAddresses", () => {
    it("returns true when addresses exist", async () => {
      jest.mocked(getDocs).mockResolvedValue({
        docs: [{ data: () => makeMockAddress() }],
        empty: false,
        forEach: function (cb: (d: any) => void) { this.docs.forEach(cb); },
      } as any);

      const result = await FirebaseAddressService.hasAddresses("user1");

      expect(result).toBe(true);
    });

    it("returns false when no addresses", async () => {
      jest.mocked(getDocs).mockResolvedValue({
        docs: [],
        empty: true,
        forEach: jest.fn(),
      } as any);

      const result = await FirebaseAddressService.hasAddresses("user1");

      expect(result).toBe(false);
    });
  });

  describe("getAddressCount", () => {
    it("returns count of addresses", async () => {
      jest.mocked(getDocs).mockResolvedValue({
        docs: [
          { data: () => makeMockAddress({ id: "a1" }) },
          { data: () => makeMockAddress({ id: "a2" }) },
          { data: () => makeMockAddress({ id: "a3" }) },
        ],
        empty: false,
        forEach: function (cb: (d: any) => void) { this.docs.forEach(cb); },
      } as any);

      const result = await FirebaseAddressService.getAddressCount("user1");

      expect(result).toBe(3);
    });
  });
});
