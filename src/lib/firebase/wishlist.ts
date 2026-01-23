/**
 * Firebase Wishlist Service
 *
 * Manages user wishlist stored in Firestore.
 * Wishlist items are stored in: users/{userId}/wishlist/{wishlistItemId}
 *
 * Features:
 * - Persistent wishlist across devices
 * - Real-time sync
 * - Auto-merge with localStorage wishlist on login
 */

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  onSnapshot,
  Timestamp,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { firebaseApp } from "./config";

const db = getFirestore(firebaseApp);

// ============================================================================
// Types
// ============================================================================

export interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  image?: string;
  createdAt: Timestamp;
}

export interface WishlistItemInput {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  image?: string;
}

// ============================================================================
// Firebase Wishlist Service
// ============================================================================

export class FirebaseWishlistService {
  private static COLLECTION = "users";
  private static SUB_COLLECTION = "wishlist";

  /**
   * Get wishlist collection reference for a user
   */
  private static getWishlistRef(userId: string) {
    return collection(db, this.COLLECTION, userId, this.SUB_COLLECTION);
  }

  /**
   * Get a specific wishlist item reference
   */
  private static getWishlistItemRef(userId: string, wishlistItemId: string) {
    return doc(db, this.COLLECTION, userId, this.SUB_COLLECTION, wishlistItemId);
  }

  /**
   * Generate wishlist item ID from product and variant
   */
  private static generateWishlistItemId(productId: string, variantId?: string): string {
    return variantId ? `${productId}_${variantId}` : productId;
  }

  // ==========================================================================
  // Create Operations
  // ==========================================================================

  /**
   * Add item to wishlist
   */
  static async addItem(userId: string, item: WishlistItemInput): Promise<string> {
    try {
      const wishlistItemId = this.generateWishlistItemId(item.productId, item.variantId);
      const wishlistItemRef = this.getWishlistItemRef(userId, wishlistItemId);
      
      // Check if already in wishlist
      const existingDoc = await getDoc(wishlistItemRef);
      if (existingDoc.exists()) {
        console.log(`[FirebaseWishlistService] Item ${wishlistItemId} already in wishlist`);
        return wishlistItemId;
      }

      const wishlistItem: WishlistItem = {
        id: wishlistItemId,
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        price: item.price,
        image: item.image,
        createdAt: Timestamp.now(),
      };

      const cleanData = Object.fromEntries(
        Object.entries(wishlistItem).filter(([, v]) => v !== undefined)
      ) as WishlistItem;

      await setDoc(wishlistItemRef, cleanData);
      console.log(`[FirebaseWishlistService] Added wishlist item ${wishlistItemId}`);
      
      return wishlistItemId;
    } catch (error) {
      console.error("[FirebaseWishlistService] Error adding wishlist item:", error);
      throw error;
    }
  }

  // ==========================================================================
  // Read Operations
  // ==========================================================================

  /**
   * Get all wishlist items for a user
   */
  static async getWishlist(userId: string): Promise<WishlistItem[]> {
    try {
      const wishlistRef = this.getWishlistRef(userId);
      const q = query(wishlistRef);
      const snapshot = await getDocs(q);

      const items: WishlistItem[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as WishlistItem);
      });

      return items;
    } catch (error) {
      console.error("[FirebaseWishlistService] Error getting wishlist:", error);
      return [];
    }
  }

  /**
   * Check if item is in wishlist
   */
  static async isInWishlist(userId: string, productId: string, variantId?: string): Promise<boolean> {
    try {
      const wishlistItemId = this.generateWishlistItemId(productId, variantId);
      const wishlistItemRef = this.getWishlistItemRef(userId, wishlistItemId);
      const doc = await getDoc(wishlistItemRef);
      return doc.exists();
    } catch (error) {
      console.error("[FirebaseWishlistService] Error checking wishlist:", error);
      return false;
    }
  }

  /**
   * Get wishlist count
   */
  static async getWishlistCount(userId: string): Promise<number> {
    const items = await this.getWishlist(userId);
    return items.length;
  }

  // ==========================================================================
  // Delete Operations
  // ==========================================================================

  /**
   * Remove item from wishlist
   */
  static async removeItem(userId: string, wishlistItemId: string): Promise<void> {
    try {
      const wishlistItemRef = this.getWishlistItemRef(userId, wishlistItemId);
      await deleteDoc(wishlistItemRef);
      console.log(`[FirebaseWishlistService] Removed wishlist item ${wishlistItemId}`);
    } catch (error) {
      console.error("[FirebaseWishlistService] Error removing wishlist item:", error);
      throw error;
    }
  }

  /**
   * Clear entire wishlist
   */
  static async clearWishlist(userId: string): Promise<void> {
    try {
      const wishlistRef = this.getWishlistRef(userId);
      const snapshot = await getDocs(query(wishlistRef));

      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`[FirebaseWishlistService] Cleared wishlist for user ${userId}`);
    } catch (error) {
      console.error("[FirebaseWishlistService] Error clearing wishlist:", error);
      throw error;
    }
  }

  // ==========================================================================
  // Real-time Subscriptions
  // ==========================================================================

  /**
   * Subscribe to real-time wishlist updates
   */
  static subscribeToWishlist(
    userId: string,
    callback: (items: WishlistItem[]) => void
  ): Unsubscribe {
    const wishlistRef = this.getWishlistRef(userId);
    const q = query(wishlistRef);

    return onSnapshot(
      q,
      (snapshot) => {
        const items: WishlistItem[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as WishlistItem);
        });
        callback(items);
      },
      (error) => {
        console.error("[FirebaseWishlistService] Subscription error:", error);
        callback([]);
      }
    );
  }

  // ==========================================================================
  // Migration Helpers
  // ==========================================================================

  /**
   * Merge client-side wishlist into Firebase wishlist
   * Accepts items read from cookies (preferred) or localStorage (fallback)
   * Call this when user signs in
   */
  static async mergeLocalStorageWishlist(
    userId: string,
    localWishlistItems: WishlistItemInput[]
  ): Promise<void> {
    try {
      console.log(`[FirebaseWishlistService] Merging ${localWishlistItems.length} client-side items (cookie or localStorage fallback)`);
      
      for (const item of localWishlistItems) {
        await this.addItem(userId, item);
      }
      
      console.log(`[FirebaseWishlistService] Wishlist merge complete`);
    } catch (error) {
      console.error("[FirebaseWishlistService] Error merging wishlist:", error);
      throw error;
    }
  }
}

export default FirebaseWishlistService;
