/**
 * Tests for FirebaseCartService
 * COVERAGE-007: Firebase Services - cart.ts
 */

jest.unmock("@/lib/firebase/cart");

import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { FirebaseCartService, type FirestoreCart } from "@/lib/firebase/cart";
import type { CartItem } from "@/types/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mockDocRef = { id: "cart-user1", path: "carts/user1" };

function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: "prod-1",
    quantity: 2,
    price: 100,
    name: "Test Product",
    image: "/img.jpg",
    slug: "test-product",
    stock: 10,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------
describe("FirebaseCartService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(doc).mockReturnValue(mockDocRef as any);
  });

  // ========================================================================
  // getCart
  // ========================================================================
  describe("getCart", () => {
    it("returns items when cart exists", async () => {
      const items = [makeCartItem()];
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ items } as unknown as FirestoreCart),
      } as any);

      const result = await FirebaseCartService.getCart("user1");

      expect(doc).toHaveBeenCalledWith(expect.anything(), "carts", "user1");
      expect(result).toEqual(items);
    });

    it("returns empty array when cart does not exist", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);

      const result = await FirebaseCartService.getCart("user1");
      expect(result).toEqual([]);
    });

    it("returns empty array when items field is missing", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({} as unknown as FirestoreCart),
      } as any);

      const result = await FirebaseCartService.getCart("user1");
      expect(result).toEqual([]);
    });

    it("returns empty array on Firestore error", async () => {
      jest.mocked(getDoc).mockRejectedValueOnce(new Error("Firestore fail"));

      const result = await FirebaseCartService.getCart("user1");
      expect(result).toEqual([]);
    });
  });

  // ========================================================================
  // saveCart
  // ========================================================================
  describe("saveCart", () => {
    it("saves sanitized items with setDoc merge", async () => {
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      const items = [makeCartItem({ grower: "Farm A", unit: "kg" })];
      await FirebaseCartService.saveCart("user1", items);

      expect(setDoc).toHaveBeenCalledTimes(1);
      const savedData = jest.mocked(setDoc).mock.calls[0][1] as any;
      expect(savedData.userId).toBe("user1");
      expect(savedData.items).toHaveLength(1);
      expect(savedData.items[0].grower).toBe("Farm A");
      expect(savedData.items[0].unit).toBe("kg");
      // merge option
      expect(jest.mocked(setDoc).mock.calls[0][2]).toEqual({ merge: true });
    });

    it("strips optional undefined/null fields from items", async () => {
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      const items = [makeCartItem({ grower: undefined, unit: null as any, comparePrice: undefined })];
      await FirebaseCartService.saveCart("user1", items);

      const savedItems = (jest.mocked(setDoc).mock.calls[0][1] as any).items;
      expect(savedItems[0]).not.toHaveProperty("grower");
      expect(savedItems[0]).not.toHaveProperty("unit");
      expect(savedItems[0]).not.toHaveProperty("comparePrice");
    });

    it("returns without saving when userId is empty", async () => {
      await FirebaseCartService.saveCart("", [makeCartItem()]);
      expect(setDoc).not.toHaveBeenCalled();
    });

    it("returns without saving when userId is 'undefined'", async () => {
      await FirebaseCartService.saveCart("undefined", [makeCartItem()]);
      expect(setDoc).not.toHaveBeenCalled();
    });

    it("handles null items array gracefully", async () => {
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      await FirebaseCartService.saveCart("user1", null as any);

      const savedItems = (jest.mocked(setDoc).mock.calls[0][1] as any).items;
      expect(savedItems).toEqual([]);
    });

    it("throws on Firestore write error", async () => {
      jest.mocked(setDoc).mockRejectedValueOnce(new Error("Write fail"));

      await expect(
        FirebaseCartService.saveCart("user1", [makeCartItem()])
      ).rejects.toThrow("Write fail");
    });
  });

  // ========================================================================
  // subscribeToCart
  // ========================================================================
  describe("subscribeToCart", () => {
    it("calls onUpdate with items when snapshot exists", () => {
      const mockUnsubscribe = jest.fn();
      jest.mocked(onSnapshot).mockImplementation((_ref: any, onNext: any) => {
        onNext({
          exists: () => true,
          data: () => ({ items: [makeCartItem()] } as unknown as FirestoreCart),
        });
        return mockUnsubscribe;
      });

      const onUpdate = jest.fn();
      const unsub = FirebaseCartService.subscribeToCart("user1", onUpdate);

      expect(onUpdate).toHaveBeenCalledWith([makeCartItem()]);
      expect(unsub).toBe(mockUnsubscribe);
    });

    it("calls onUpdate with empty array when snapshot does not exist", () => {
      jest.mocked(onSnapshot).mockImplementation((_ref: any, onNext: any) => {
        onNext({ exists: () => false, data: () => null });
        return jest.fn();
      });

      const onUpdate = jest.fn();
      FirebaseCartService.subscribeToCart("user1", onUpdate);

      expect(onUpdate).toHaveBeenCalledWith([]);
    });

    it("calls onError callback on snapshot error", () => {
      jest.mocked(onSnapshot).mockImplementation((_ref: any, _onNext: any, onErr: any) => {
        onErr(new Error("Snapshot error"));
        return jest.fn();
      });

      const onUpdate = jest.fn();
      const onError = jest.fn();
      FirebaseCartService.subscribeToCart("user1", onUpdate, onError);

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ========================================================================
  // clearCart
  // ========================================================================
  describe("clearCart", () => {
    it("writes empty items array", async () => {
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      await FirebaseCartService.clearCart("user1");

      expect(setDoc).toHaveBeenCalledTimes(1);
      const data = jest.mocked(setDoc).mock.calls[0][1] as any;
      expect(data.items).toEqual([]);
      expect(data.userId).toBe("user1");
    });

    it("throws on Firestore error", async () => {
      jest.mocked(setDoc).mockRejectedValueOnce(new Error("Clear fail"));

      await expect(FirebaseCartService.clearCart("user1")).rejects.toThrow("Clear fail");
    });
  });

  // ========================================================================
  // mergeWithLocalCart
  // ========================================================================
  describe("mergeWithLocalCart", () => {
    it("returns local items when Firebase cart is empty", async () => {
      // getCart returns []
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      const local = [makeCartItem({ productId: "local-1" })];
      const result = await FirebaseCartService.mergeWithLocalCart("user1", local);

      expect(result).toEqual(local);
      expect(setDoc).toHaveBeenCalled(); // saves local items
    });

    it("returns Firebase items when local cart is empty", async () => {
      const fbItems = [makeCartItem({ productId: "fb-1" })];
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ items: fbItems } as unknown as FirestoreCart),
      } as any);

      const result = await FirebaseCartService.mergeWithLocalCart("user1", []);

      expect(result).toEqual(fbItems);
      expect(setDoc).not.toHaveBeenCalled(); // no save needed
    });

    it("merges carts with local taking precedence", async () => {
      const fbItems = [
        makeCartItem({ productId: "shared", quantity: 1, name: "FB" }),
        makeCartItem({ productId: "fb-only", quantity: 3 }),
      ];
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ items: fbItems } as unknown as FirestoreCart),
      } as any);
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      const local = [
        makeCartItem({ productId: "shared", quantity: 5, name: "Local" }),
        makeCartItem({ productId: "local-only", quantity: 2 }),
      ];

      const result = await FirebaseCartService.mergeWithLocalCart("user1", local);

      expect(result).toHaveLength(3); // shared + fb-only + local-only
      const shared = result.find((i) => i.productId === "shared");
      expect(shared?.quantity).toBe(5); // local takes precedence
      expect(shared?.name).toBe("Local");
    });

    it("returns both empty when both carts empty", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);

      const result = await FirebaseCartService.mergeWithLocalCart("user1", []);
      expect(result).toEqual([]);
    });

    it("returns local items on Firestore error", async () => {
      jest.mocked(getDoc).mockRejectedValueOnce(new Error("Read fail"));

      const local = [makeCartItem()];
      const result = await FirebaseCartService.mergeWithLocalCart("user1", local);
      expect(result).toEqual(local);
    });
  });

  // ========================================================================
  // addItem
  // ========================================================================
  describe("addItem", () => {
    it("adds new item when cart is empty", async () => {
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      } as any);
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      const item = makeCartItem({ productId: "new-prod", quantity: 1 });
      const result = await FirebaseCartService.addItem("user1", item);

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe("new-prod");
    });

    it("increments quantity for existing product", async () => {
      const existing = [makeCartItem({ productId: "prod-1", quantity: 3 })];
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ items: existing } as unknown as FirestoreCart),
      } as any);
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      const item = makeCartItem({ productId: "prod-1", quantity: 2 });
      const result = await FirebaseCartService.addItem("user1", item);

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(5); // 3 + 2
    });

    it("adds alongside existing items", async () => {
      const existing = [makeCartItem({ productId: "prod-a" })];
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ items: existing } as unknown as FirestoreCart),
      } as any);
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      const item = makeCartItem({ productId: "prod-b" });
      const result = await FirebaseCartService.addItem("user1", item);

      expect(result).toHaveLength(2);
    });
  });

  // ========================================================================
  // removeItem
  // ========================================================================
  describe("removeItem", () => {
    it("removes item from cart", async () => {
      const existing = [
        makeCartItem({ productId: "keep" }),
        makeCartItem({ productId: "remove" }),
      ];
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ items: existing } as unknown as FirestoreCart),
      } as any);
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      const result = await FirebaseCartService.removeItem("user1", "remove");

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe("keep");
    });

    it("returns same list when productId not found", async () => {
      const existing = [makeCartItem({ productId: "stays" })];
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ items: existing } as unknown as FirestoreCart),
      } as any);
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      const result = await FirebaseCartService.removeItem("user1", "nonexistent");
      expect(result).toHaveLength(1);
    });
  });

  // ========================================================================
  // updateItemQuantity
  // ========================================================================
  describe("updateItemQuantity", () => {
    it("updates quantity for matching product", async () => {
      const existing = [makeCartItem({ productId: "prod-1", quantity: 2 })];
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ items: existing } as unknown as FirestoreCart),
      } as any);
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      const result = await FirebaseCartService.updateItemQuantity("user1", "prod-1", 7);

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(7);
    });

    it("removes item when quantity is zero", async () => {
      const existing = [makeCartItem({ productId: "prod-1", quantity: 3 })];
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ items: existing } as unknown as FirestoreCart),
      } as any);
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      const result = await FirebaseCartService.updateItemQuantity("user1", "prod-1", 0);

      expect(result).toHaveLength(0);
    });

    it("removes item when quantity is negative", async () => {
      const existing = [makeCartItem({ productId: "prod-1", quantity: 3 })];
      jest.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ items: existing } as unknown as FirestoreCart),
      } as any);
      jest.mocked(setDoc).mockResolvedValueOnce(undefined);

      const result = await FirebaseCartService.updateItemQuantity("user1", "prod-1", -1);

      expect(result).toHaveLength(0);
    });
  });
});
