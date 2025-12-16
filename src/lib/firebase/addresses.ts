/**
 * Firebase Address Service
 *
 * Manages user delivery addresses stored in Firestore.
 * Addresses are stored in: users/{userId}/addresses/{addressId}
 *
 * Used by:
 * - Profile page (/profile/my-information) for managing saved addresses
 * - Checkout page (/checkout) for selecting delivery address
 * - Lalamove integration for accurate delivery quotes
 */

import {
  getFirestore,
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
  type Unsubscribe,
} from "firebase/firestore";
import { firebaseApp } from "./config";

const db = getFirestore(firebaseApp);

// ============================================================================
// Types
// ============================================================================

export interface AddressCoordinates {
  lat: number;
  lng: number;
}

export interface FirestoreAddress {
  id: string;
  label: string; // "Home", "Office", "Mom's House", etc.
  isDefault: boolean;
  street: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  zipPostal: string;
  landmark?: string;
  coordinates: AddressCoordinates;
  formattedAddress: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AddressInput {
  label: string;
  isDefault?: boolean;
  street: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  zipPostal: string;
  landmark?: string;
  coordinates: AddressCoordinates;
  formattedAddress: string;
}

// For use in checkout/orders
export interface DeliveryAddressData {
  address: string;
  lat: number;
  lng: number;
  landmark?: string;
  addressId?: string; // Reference to saved address
}

// ============================================================================
// Firebase Address Service
// ============================================================================

export class FirebaseAddressService {
  private static COLLECTION = "users";
  private static SUB_COLLECTION = "addresses";

  /**
   * Get the addresses collection reference for a user
   */
  private static getAddressesRef(userId: string) {
    return collection(db, this.COLLECTION, userId, this.SUB_COLLECTION);
  }

  /**
   * Get a specific address document reference
   */
  private static getAddressRef(userId: string, addressId: string) {
    return doc(db, this.COLLECTION, userId, this.SUB_COLLECTION, addressId);
  }

  // ==========================================================================
  // Create Operations
  // ==========================================================================

  /**
   * Add a new address for a user
   * @param userId - Firebase Auth user ID
   * @param address - Address data to save
   * @returns The newly created address ID
   */
  static async addAddress(userId: string, address: AddressInput): Promise<string> {
    try {
      const addressesRef = this.getAddressesRef(userId);
      const newDocRef = doc(addressesRef);
      const now = Timestamp.now();

      // If this is set as default, unset other defaults first
      if (address.isDefault) {
        await this.clearDefaultAddresses(userId);
      }

      const addressData: FirestoreAddress = {
        id: newDocRef.id,
        label: address.label || "Home",
        isDefault: address.isDefault || false,
        street: address.street,
        addressLine2: address.addressLine2,
        city: address.city,
        stateProvince: address.stateProvince,
        zipPostal: address.zipPostal,
        landmark: address.landmark,
        coordinates: address.coordinates,
        formattedAddress: address.formattedAddress,
        createdAt: now,
        updatedAt: now,
      };

      // Remove undefined fields
      const cleanData = Object.fromEntries(
        Object.entries(addressData).filter(([, v]) => v !== undefined)
      ) as FirestoreAddress;

      await setDoc(newDocRef, cleanData);

      console.log(`[FirebaseAddressService] Added address ${newDocRef.id} for user ${userId}`);
      return newDocRef.id;
    } catch (error) {
      console.error("[FirebaseAddressService] Error adding address:", error);
      throw error;
    }
  }

  // ==========================================================================
  // Read Operations
  // ==========================================================================

  /**
   * Get all addresses for a user
   * @param userId - Firebase Auth user ID
   * @returns Array of saved addresses, sorted by default first then by creation date
   */
  static async getAddresses(userId: string): Promise<FirestoreAddress[]> {
    try {
      const addressesRef = this.getAddressesRef(userId);
      const q = query(addressesRef, orderBy("isDefault", "desc"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const addresses: FirestoreAddress[] = [];
      snapshot.forEach((doc) => {
        addresses.push(doc.data() as FirestoreAddress);
      });

      return addresses;
    } catch (error) {
      console.error("[FirebaseAddressService] Error getting addresses:", error);
      return [];
    }
  }

  /**
   * Get a single address by ID
   * @param userId - Firebase Auth user ID
   * @param addressId - Address document ID
   * @returns The address or null if not found
   */
  static async getAddress(userId: string, addressId: string): Promise<FirestoreAddress | null> {
    try {
      const addressRef = this.getAddressRef(userId, addressId);
      const snapshot = await getDoc(addressRef);

      if (snapshot.exists()) {
        return snapshot.data() as FirestoreAddress;
      }
      return null;
    } catch (error) {
      console.error("[FirebaseAddressService] Error getting address:", error);
      return null;
    }
  }

  /**
   * Get the default address for a user
   * @param userId - Firebase Auth user ID
   * @returns The default address or null if none set
   */
  static async getDefaultAddress(userId: string): Promise<FirestoreAddress | null> {
    try {
      const addressesRef = this.getAddressesRef(userId);
      const q = query(addressesRef, where("isDefault", "==", true));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return snapshot.docs[0].data() as FirestoreAddress;
      }

      // Fallback: return first address if no default set
      const allAddresses = await this.getAddresses(userId);
      return allAddresses.length > 0 ? allAddresses[0] : null;
    } catch (error) {
      console.error("[FirebaseAddressService] Error getting default address:", error);
      return null;
    }
  }

  // ==========================================================================
  // Update Operations
  // ==========================================================================

  /**
   * Update an existing address
   * @param userId - Firebase Auth user ID
   * @param addressId - Address document ID
   * @param data - Partial address data to update
   */
  static async updateAddress(
    userId: string,
    addressId: string,
    data: Partial<AddressInput>
  ): Promise<void> {
    try {
      const addressRef = this.getAddressRef(userId, addressId);

      // If setting as default, clear other defaults first
      if (data.isDefault) {
        await this.clearDefaultAddresses(userId);
      }

      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      // Remove undefined fields
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([, v]) => v !== undefined)
      );

      await updateDoc(addressRef, cleanData);
      console.log(`[FirebaseAddressService] Updated address ${addressId}`);
    } catch (error) {
      console.error("[FirebaseAddressService] Error updating address:", error);
      throw error;
    }
  }

  /**
   * Set an address as the default
   * @param userId - Firebase Auth user ID
   * @param addressId - Address document ID to set as default
   */
  static async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    try {
      // Clear existing defaults
      await this.clearDefaultAddresses(userId);

      // Set new default
      const addressRef = this.getAddressRef(userId, addressId);
      await updateDoc(addressRef, {
        isDefault: true,
        updatedAt: Timestamp.now(),
      });

      console.log(`[FirebaseAddressService] Set address ${addressId} as default`);
    } catch (error) {
      console.error("[FirebaseAddressService] Error setting default address:", error);
      throw error;
    }
  }

  /**
   * Clear the default flag from all addresses
   * @param userId - Firebase Auth user ID
   */
  private static async clearDefaultAddresses(userId: string): Promise<void> {
    const addressesRef = this.getAddressesRef(userId);
    const q = query(addressesRef, where("isDefault", "==", true));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.forEach((doc) => {
      batch.update(doc.ref, { isDefault: false, updatedAt: Timestamp.now() });
    });

    if (!snapshot.empty) {
      await batch.commit();
    }
  }

  // ==========================================================================
  // Delete Operations
  // ==========================================================================

  /**
   * Delete an address
   * @param userId - Firebase Auth user ID
   * @param addressId - Address document ID to delete
   */
  static async deleteAddress(userId: string, addressId: string): Promise<void> {
    try {
      const addressRef = this.getAddressRef(userId, addressId);
      await deleteDoc(addressRef);
      console.log(`[FirebaseAddressService] Deleted address ${addressId}`);
    } catch (error) {
      console.error("[FirebaseAddressService] Error deleting address:", error);
      throw error;
    }
  }

  // ==========================================================================
  // Real-time Subscriptions
  // ==========================================================================

  /**
   * Subscribe to real-time address updates for a user
   * @param userId - Firebase Auth user ID
   * @param callback - Function called with updated addresses array
   * @returns Unsubscribe function
   */
  static subscribeToAddresses(
    userId: string,
    callback: (addresses: FirestoreAddress[]) => void
  ): Unsubscribe {
    const addressesRef = this.getAddressesRef(userId);
    const q = query(addressesRef, orderBy("isDefault", "desc"), orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        const addresses: FirestoreAddress[] = [];
        snapshot.forEach((doc) => {
          addresses.push(doc.data() as FirestoreAddress);
        });
        callback(addresses);
      },
      (error) => {
        console.error("[FirebaseAddressService] Subscription error:", error);
        callback([]);
      }
    );
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Convert a FirestoreAddress to DeliveryAddressData for checkout/orders
   * @param address - FirestoreAddress to convert
   * @returns DeliveryAddressData formatted for orders
   */
  static toDeliveryAddress(address: FirestoreAddress): DeliveryAddressData {
    return {
      address: address.formattedAddress,
      lat: address.coordinates.lat,
      lng: address.coordinates.lng,
      landmark: address.landmark,
      addressId: address.id,
    };
  }

  /**
   * Check if user has any saved addresses
   * @param userId - Firebase Auth user ID
   * @returns true if user has at least one saved address
   */
  static async hasAddresses(userId: string): Promise<boolean> {
    const addresses = await this.getAddresses(userId);
    return addresses.length > 0;
  }

  /**
   * Get address count for a user
   * @param userId - Firebase Auth user ID
   * @returns Number of saved addresses
   */
  static async getAddressCount(userId: string): Promise<number> {
    const addresses = await this.getAddresses(userId);
    return addresses.length;
  }
}

// Export types and service
export default FirebaseAddressService;
