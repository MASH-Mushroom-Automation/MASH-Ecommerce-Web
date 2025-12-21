/**
 * Firebase Cart Service
 *
 * Manages shopping cart data in Firestore for authenticated users.
 * Provides real-time sync and offline persistence.
 */

import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Timestamp,
  getFirestore,
} from "firebase/firestore";
import { firebaseApp } from "./config";
import { CartItem } from "@/types/api";

// Initialize Firestore
const db = getFirestore(firebaseApp);

/**
 * Cart document structure in Firestore
 */
export interface FirestoreCart {
  userId: string;
  items: CartItem[];
  updatedAt: Timestamp;
  version: number;
}

/**
 * Firebase Cart Service
 *
 * Handles all cart operations with Firestore:
 * - Get cart
 * - Save cart
 * - Subscribe to real-time updates
 * - Clear cart
 * - Merge carts (for login scenarios)
 */
export class FirebaseCartService {
  private static readonly COLLECTION = "carts";

  /**
   * Get user's cart from Firestore
   */
  static async getCart(userId: string): Promise<CartItem[]> {
    try {
      const cartRef = doc(db, this.COLLECTION, userId);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const data = cartSnap.data() as FirestoreCart;
        return data.items || [];
      }
      return [];
    } catch (error) {
      console.error("[FirebaseCartService] Error getting cart:", error);
      return [];
    }
  }

  /**
   * Save cart to Firestore
   */
  static async saveCart(userId: string, items: CartItem[]): Promise<void> {
    // Validate userId is not undefined
    if (!userId || userId === 'undefined') {
      console.error("[FirebaseCartService] Invalid userId:", userId);
      return; // Don't attempt to save with invalid userId
    }

    try {
      const cartRef = doc(db, this.COLLECTION, userId);
      await setDoc(
        cartRef,
        {
          userId,
          items: items || [],
          updatedAt: Timestamp.now(),
          version: Date.now(),
        },
        { merge: true }
      );
      console.log("[FirebaseCartService] Cart saved for user:", userId);
    } catch (error) {
      console.error("[FirebaseCartService] Error saving cart:", error);
      throw error;
    }
  }

  /**
   * Subscribe to cart changes (real-time sync)
   * Returns unsubscribe function
   */
  static subscribeToCart(
    userId: string,
    onUpdate: (items: CartItem[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const cartRef = doc(db, this.COLLECTION, userId);

    const unsubscribe = onSnapshot(
      cartRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as FirestoreCart;
          onUpdate(data.items || []);
        } else {
          onUpdate([]);
        }
      },
      (error) => {
        console.error("[FirebaseCartService] Snapshot error:", error);
        if (onError) {
          onError(error);
        }
      }
    );

    return unsubscribe;
  }

  /**
   * Clear user's cart
   */
  static async clearCart(userId: string): Promise<void> {
    try {
      const cartRef = doc(db, this.COLLECTION, userId);
      const cartData: FirestoreCart = {
        userId: userId,
        items: [],
        updatedAt: Timestamp.now(),
        version: Date.now(),
      };
      await setDoc(cartRef, cartData);
      console.log("[FirebaseCartService] Cart cleared for user:", userId);
    } catch (error) {
      console.error("[FirebaseCartService] Error clearing cart:", error);
      throw error;
    }
  }

  /**
   * Merge local cart with Firebase cart on login
   * Strategy: Keep items from both, prefer local quantity for duplicates
   */
  static async mergeWithLocalCart(
    userId: string,
    localItems: CartItem[]
  ): Promise<CartItem[]> {
    try {
      const firebaseItems = await this.getCart(userId);

      if (firebaseItems.length === 0) {
        // No Firebase cart, use local cart
        if (localItems.length > 0) {
          await this.saveCart(userId, localItems);
        }
        return localItems;
      }

      if (localItems.length === 0) {
        // No local cart, use Firebase cart
        return firebaseItems;
      }

      // Merge: create map of Firebase items by productId
      const itemMap = new Map<string, CartItem>();

      // Add Firebase items first
      for (const item of firebaseItems) {
        itemMap.set(item.productId, item);
      }

      // Override/add local items (local takes precedence)
      for (const item of localItems) {
        itemMap.set(item.productId, item);
      }

      const mergedItems = Array.from(itemMap.values());

      // Save merged cart
      await this.saveCart(userId, mergedItems);

      console.log("[FirebaseCartService] Cart merged:", {
        firebaseCount: firebaseItems.length,
        localCount: localItems.length,
        mergedCount: mergedItems.length,
      });

      return mergedItems;
    } catch (error) {
      console.error("[FirebaseCartService] Error merging carts:", error);
      // On error, return local items
      return localItems;
    }
  }

  /**
   * Add item to cart (convenience method)
   * Fetches current cart, adds item, saves back
   */
  static async addItem(userId: string, item: CartItem): Promise<CartItem[]> {
    const currentItems = await this.getCart(userId);

    const existingIndex = currentItems.findIndex(
      (i) => i.productId === item.productId
    );

    let updatedItems: CartItem[];

    if (existingIndex >= 0) {
      // Update quantity
      updatedItems = currentItems.map((i, idx) =>
        idx === existingIndex
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      // Add new item
      updatedItems = [...currentItems, item];
    }

    await this.saveCart(userId, updatedItems);
    return updatedItems;
  }

  /**
   * Remove item from cart
   */
  static async removeItem(
    userId: string,
    productId: string
  ): Promise<CartItem[]> {
    const currentItems = await this.getCart(userId);
    const updatedItems = currentItems.filter((i) => i.productId !== productId);
    await this.saveCart(userId, updatedItems);
    return updatedItems;
  }

  /**
   * Update item quantity
   */
  static async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<CartItem[]> {
    const currentItems = await this.getCart(userId);

    const updatedItems =
      quantity <= 0
        ? currentItems.filter((i) => i.productId !== productId)
        : currentItems.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          );

    await this.saveCart(userId, updatedItems);
    return updatedItems;
  }
}
