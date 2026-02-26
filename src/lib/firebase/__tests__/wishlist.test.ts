/**
 * Tests for FirebaseWishlistService
 * COVERAGE-007: Firebase Services - wishlist.ts
 */

jest.unmock("@/lib/firebase/wishlist");

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  onSnapshot,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import {
  FirebaseWishlistService,
  type WishlistItemInput,
} from "@/lib/firebase/wishlist";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mockDocRef = { id: "prod-1", path: "users/user1/wishlist/prod-1" };
const mockCollRef = { id: "wishlist" };

function makeWishlistInput(
  overrides: Partial<WishlistItemInput> = {}
): WishlistItemInput {
  return {
    productId: "prod-1",
    name: "King Oyster Mushroom",
    price: 120,
    image: "/king.jpg",
    ...overrides,
  };
}

function makeWishlistDoc(data: Record<string, unknown>) {
  return {
    id: data.id || "prod-1",
    data: () => data,
    exists: () => true,
    ref: mockDocRef,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------
describe("FirebaseWishlistService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(doc).mockReturnValue(mockDocRef as any);
    jest.mocked(collection).mockReturnValue(mockCollRef as any);
    jest.mocked(query).mockReturnValue({} as any);
  });

  // ========================================================================
  // addItem
  // ========================================================================
  describe("addItem", () => {
    it("adds a new item to wishlist", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      const result = await FirebaseWishlistService.addItem(
        "user1",
        makeWishlistInput()
      );

      expect(result).toBe("prod-1");
      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          productId: "prod-1",
          name: "King Oyster Mushroom",
          price: 120,
        })
      );
    });

    it("returns existing ID if item already in wishlist", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ productId: "prod-1" }),
      } as any);

      const result = await FirebaseWishlistService.addItem(
        "user1",
        makeWishlistInput()
      );

      expect(result).toBe("prod-1");
      expect(setDoc).not.toHaveBeenCalled();
    });

    it("generates compound ID for variant items", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      const result = await FirebaseWishlistService.addItem(
        "user1",
        makeWishlistInput({ variantId: "var-red" })
      );

      // We verify doc was called with the compound ID path
      expect(doc).toHaveBeenCalledWith(
        expect.anything(),
        "users",
        "user1",
        "wishlist",
        "prod-1_var-red"
      );
    });

    it("strips undefined values from document", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      await FirebaseWishlistService.addItem(
        "user1",
        makeWishlistInput({ image: undefined })
      );

      const savedData = jest.mocked(setDoc).mock.calls[0][1];
      expect(savedData).not.toHaveProperty("image");
    });

    it("throws on Firestore error", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);
      jest.mocked(setDoc).mockRejectedValueOnce(new Error("Firestore down"));

      await expect(
        FirebaseWishlistService.addItem("user1", makeWishlistInput())
      ).rejects.toThrow("Firestore down");
    });

    it("includes createdAt timestamp", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      await FirebaseWishlistService.addItem("user1", makeWishlistInput());

      const savedData = jest.mocked(setDoc).mock.calls[0][1] as any;
      expect(savedData.createdAt).toBeDefined();
    });
  });

  // ========================================================================
  // getWishlist
  // ========================================================================
  describe("getWishlist", () => {
    it("returns all wishlist items", async () => {
      const items = [
        { productId: "prod-1", name: "Mushroom A", price: 100 },
        { productId: "prod-2", name: "Mushroom B", price: 200 },
      ];
      const mockDocs = items.map((item) => makeWishlistDoc(item));
      jest.mocked(getDocs).mockResolvedValueOnce({
        docs: mockDocs,
        empty: false,
        forEach: (cb: (doc: any) => void) => mockDocs.forEach(cb),
      } as any);

      const result = await FirebaseWishlistService.getWishlist("user1");

      expect(result).toHaveLength(2);
      expect(result[0].productId).toBe("prod-1");
      expect(result[1].productId).toBe("prod-2");
    });

    it("returns empty array when no items", async () => {
      jest.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
        empty: true,
        forEach: () => {},
      } as any);

      const result = await FirebaseWishlistService.getWishlist("user1");

      expect(result).toEqual([]);
    });

    it("returns empty array on error", async () => {
      jest.mocked(getDocs).mockRejectedValueOnce(new Error("Network error"));

      const result = await FirebaseWishlistService.getWishlist("user1");

      expect(result).toEqual([]);
    });
  });

  // ========================================================================
  // isInWishlist
  // ========================================================================
  describe("isInWishlist", () => {
    it("returns true when item exists", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({}),
      } as any);

      const result = await FirebaseWishlistService.isInWishlist(
        "user1",
        "prod-1"
      );

      expect(result).toBe(true);
    });

    it("returns false when item not found", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);

      const result = await FirebaseWishlistService.isInWishlist(
        "user1",
        "prod-1"
      );

      expect(result).toBe(false);
    });

    it("returns false on error", async () => {
      jest.mocked(getDoc).mockRejectedValueOnce(new Error("Network error"));

      const result = await FirebaseWishlistService.isInWishlist(
        "user1",
        "prod-1"
      );

      expect(result).toBe(false);
    });

    it("generates correct ref for variant lookup", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);

      await FirebaseWishlistService.isInWishlist("user1", "prod-1", "var-sm");

      expect(doc).toHaveBeenCalledWith(
        expect.anything(),
        "users",
        "user1",
        "wishlist",
        "prod-1_var-sm"
      );
    });
  });

  // ========================================================================
  // getWishlistCount
  // ========================================================================
  describe("getWishlistCount", () => {
    it("returns number of items", async () => {
      const items = [
        { productId: "p1" },
        { productId: "p2" },
        { productId: "p3" },
      ];
      const mockDocs = items.map((i) => makeWishlistDoc(i));
      jest.mocked(getDocs).mockResolvedValueOnce({
        docs: mockDocs,
        empty: false,
        forEach: (cb: (doc: any) => void) => mockDocs.forEach(cb),
      } as any);

      const count = await FirebaseWishlistService.getWishlistCount("user1");

      expect(count).toBe(3);
    });

    it("returns 0 when wishlist is empty", async () => {
      jest.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
        empty: true,
        forEach: () => {},
      } as any);

      const count = await FirebaseWishlistService.getWishlistCount("user1");

      expect(count).toBe(0);
    });
  });

  // ========================================================================
  // removeItem
  // ========================================================================
  describe("removeItem", () => {
    it("deletes the wishlist item document", async () => {
      jest.mocked(deleteDoc).mockResolvedValueOnce(undefined);

      await FirebaseWishlistService.removeItem("user1", "prod-1");

      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it("throws on Firestore error", async () => {
      jest.mocked(deleteDoc).mockRejectedValueOnce(
        new Error("Permission denied")
      );

      await expect(
        FirebaseWishlistService.removeItem("user1", "prod-1")
      ).rejects.toThrow("Permission denied");
    });
  });

  // ========================================================================
  // clearWishlist
  // ========================================================================
  describe("clearWishlist", () => {
    it("batch-deletes all wishlist items", async () => {
      const mockBatchDelete = jest.fn();
      const mockBatchCommit = jest.fn().mockResolvedValue(undefined);
      jest.mocked(writeBatch).mockReturnValue({
        set: jest.fn(),
        update: jest.fn(),
        delete: mockBatchDelete,
        commit: mockBatchCommit,
      } as any);

      const mockDocs = [
        { ref: { id: "p1" }, data: () => ({}) },
        { ref: { id: "p2" }, data: () => ({}) },
      ];
      jest.mocked(getDocs).mockResolvedValueOnce({
        docs: mockDocs,
        empty: false,
        forEach: (cb: (doc: any) => void) => mockDocs.forEach(cb),
      } as any);

      await FirebaseWishlistService.clearWishlist("user1");

      expect(mockBatchDelete).toHaveBeenCalledTimes(2);
      expect(mockBatchCommit).toHaveBeenCalled();
    });

    it("handles empty wishlist gracefully", async () => {
      const mockBatchCommit = jest.fn().mockResolvedValue(undefined);
      jest.mocked(writeBatch).mockReturnValue({
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        commit: mockBatchCommit,
      } as any);

      jest.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
        empty: true,
        forEach: () => {},
      } as any);

      await FirebaseWishlistService.clearWishlist("user1");

      expect(mockBatchCommit).toHaveBeenCalled();
    });

    it("throws on batch commit error", async () => {
      jest.mocked(writeBatch).mockReturnValue({
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        commit: jest.fn().mockRejectedValue(new Error("Batch failed")),
      } as any);

      jest.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
        empty: true,
        forEach: () => {},
      } as any);

      await expect(
        FirebaseWishlistService.clearWishlist("user1")
      ).rejects.toThrow("Batch failed");
    });
  });

  // ========================================================================
  // subscribeToWishlist
  // ========================================================================
  describe("subscribeToWishlist", () => {
    it("sets up onSnapshot listener and returns unsubscribe", () => {
      const mockUnsubscribe = jest.fn();
      jest.mocked(onSnapshot).mockReturnValue(mockUnsubscribe as any);

      const callback = jest.fn();
      const unsub = FirebaseWishlistService.subscribeToWishlist(
        "user1",
        callback
      );

      expect(onSnapshot).toHaveBeenCalled();
      expect(unsub).toBe(mockUnsubscribe);
    });

    it("calls callback with items on snapshot update", () => {
      let snapshotCallback: (snapshot: any) => void = () => {};
      jest.mocked(onSnapshot).mockImplementation((q, onNext: any) => {
        snapshotCallback = onNext;
        return jest.fn() as any;
      });

      const callback = jest.fn();
      FirebaseWishlistService.subscribeToWishlist("user1", callback);

      // Simulate snapshot
      const mockDocs = [
        { data: () => ({ productId: "p1", name: "Item 1" }) },
      ];
      snapshotCallback({
        forEach: (fn: (doc: any) => void) => mockDocs.forEach(fn),
      });

      expect(callback).toHaveBeenCalledWith([
        expect.objectContaining({ productId: "p1" }),
      ]);
    });

    it("calls callback with empty array on error", () => {
      let errorCallback: (error: Error) => void = () => {};
      jest
        .mocked(onSnapshot)
        .mockImplementation((q, _onNext: any, onError: any) => {
          errorCallback = onError;
          return jest.fn() as any;
        });

      const callback = jest.fn();
      FirebaseWishlistService.subscribeToWishlist("user1", callback);

      // Simulate error
      errorCallback(new Error("Permission denied"));

      expect(callback).toHaveBeenCalledWith([]);
    });
  });

  // ========================================================================
  // mergeLocalStorageWishlist
  // ========================================================================
  describe("mergeLocalStorageWishlist", () => {
    it("adds each local item to Firebase wishlist", async () => {
      // Each addItem call will check if exists then setDoc
      jest.mocked(getDoc).mockResolvedValue({
        exists: () => false,
        data: () => null,
      } as any);
      jest.mocked(setDoc).mockResolvedValue(undefined);

      const localItems = [
        makeWishlistInput({ productId: "p1" }),
        makeWishlistInput({ productId: "p2" }),
      ];

      await FirebaseWishlistService.mergeLocalStorageWishlist(
        "user1",
        localItems
      );

      // setDoc called once per item (since none exist)
      expect(setDoc).toHaveBeenCalledTimes(2);
    });

    it("skips items that already exist in Firebase", async () => {
      jest.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ productId: "p1" }),
      } as any);

      const localItems = [makeWishlistInput({ productId: "p1" })];

      await FirebaseWishlistService.mergeLocalStorageWishlist(
        "user1",
        localItems
      );

      expect(setDoc).not.toHaveBeenCalled();
    });

    it("handles empty local wishlist", async () => {
      await FirebaseWishlistService.mergeLocalStorageWishlist("user1", []);

      expect(setDoc).not.toHaveBeenCalled();
    });

    it("throws if merge encounters error", async () => {
      jest.mocked(getDoc).mockRejectedValueOnce(new Error("Merge failed"));

      await expect(
        FirebaseWishlistService.mergeLocalStorageWishlist("user1", [
          makeWishlistInput(),
        ])
      ).rejects.toThrow("Merge failed");
    });
  });
});
