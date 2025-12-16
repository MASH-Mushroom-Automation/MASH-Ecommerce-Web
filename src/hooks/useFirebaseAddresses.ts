/**
 * useFirebaseAddresses Hook
 *
 * React hook for managing user delivery addresses with Firebase.
 * Provides real-time subscription to address changes.
 *
 * Usage:
 * ```tsx
 * const {
 *   addresses,
 *   defaultAddress,
 *   loading,
 *   error,
 *   addAddress,
 *   updateAddress,
 *   deleteAddress,
 *   setAsDefault,
 * } = useFirebaseAddresses();
 * ```
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  FirebaseAddressService,
  type FirestoreAddress,
  type AddressInput,
  type DeliveryAddressData,
} from "@/lib/firebase/addresses";

// ============================================================================
// Types
// ============================================================================

export interface UseFirebaseAddressesReturn {
  /** Array of user's saved addresses */
  addresses: FirestoreAddress[];
  /** The user's default address, or first address if no default set */
  defaultAddress: FirestoreAddress | null;
  /** Whether addresses are currently loading */
  loading: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** Whether a mutation (add/update/delete) is in progress */
  mutating: boolean;
  /** Whether user has any saved addresses */
  hasAddresses: boolean;

  // Operations
  /** Add a new address */
  addAddress: (address: AddressInput) => Promise<string | null>;
  /** Update an existing address */
  updateAddress: (addressId: string, data: Partial<AddressInput>) => Promise<boolean>;
  /** Delete an address */
  deleteAddress: (addressId: string) => Promise<boolean>;
  /** Set an address as the default */
  setAsDefault: (addressId: string) => Promise<boolean>;
  /** Refresh addresses manually */
  refresh: () => Promise<void>;
  /** Convert address to delivery data format for orders */
  toDeliveryData: (address: FirestoreAddress) => DeliveryAddressData;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useFirebaseAddresses(): UseFirebaseAddressesReturn {
  const { user, isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<FirestoreAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);

  // Computed values
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;
  const hasAddresses = addresses.length > 0;

  // ==========================================================================
  // Real-time Subscription
  // ==========================================================================

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to real-time address updates
    const unsubscribe = FirebaseAddressService.subscribeToAddresses(
      user.id,
      (updatedAddresses) => {
        setAddresses(updatedAddresses);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, user?.id]);

  // ==========================================================================
  // Operations
  // ==========================================================================

  /**
   * Add a new address
   * @param address - Address data to save
   * @returns The new address ID, or null if failed
   */
  const addAddress = useCallback(
    async (address: AddressInput): Promise<string | null> => {
      if (!user?.id) {
        setError("Must be logged in to add address");
        return null;
      }

      setMutating(true);
      setError(null);

      try {
        const addressId = await FirebaseAddressService.addAddress(user.id, address);
        return addressId;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to add address";
        setError(message);
        console.error("[useFirebaseAddresses] Add error:", err);
        return null;
      } finally {
        setMutating(false);
      }
    },
    [user?.id]
  );

  /**
   * Update an existing address
   * @param addressId - ID of address to update
   * @param data - Partial address data to update
   * @returns true if successful
   */
  const updateAddress = useCallback(
    async (addressId: string, data: Partial<AddressInput>): Promise<boolean> => {
      if (!user?.id) {
        setError("Must be logged in to update address");
        return false;
      }

      setMutating(true);
      setError(null);

      try {
        await FirebaseAddressService.updateAddress(user.id, addressId, data);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update address";
        setError(message);
        console.error("[useFirebaseAddresses] Update error:", err);
        return false;
      } finally {
        setMutating(false);
      }
    },
    [user?.id]
  );

  /**
   * Delete an address
   * @param addressId - ID of address to delete
   * @returns true if successful
   */
  const deleteAddress = useCallback(
    async (addressId: string): Promise<boolean> => {
      if (!user?.id) {
        setError("Must be logged in to delete address");
        return false;
      }

      setMutating(true);
      setError(null);

      try {
        await FirebaseAddressService.deleteAddress(user.id, addressId);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete address";
        setError(message);
        console.error("[useFirebaseAddresses] Delete error:", err);
        return false;
      } finally {
        setMutating(false);
      }
    },
    [user?.id]
  );

  /**
   * Set an address as the default
   * @param addressId - ID of address to set as default
   * @returns true if successful
   */
  const setAsDefault = useCallback(
    async (addressId: string): Promise<boolean> => {
      if (!user?.id) {
        setError("Must be logged in to set default address");
        return false;
      }

      setMutating(true);
      setError(null);

      try {
        await FirebaseAddressService.setDefaultAddress(user.id, addressId);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to set default address";
        setError(message);
        console.error("[useFirebaseAddresses] Set default error:", err);
        return false;
      } finally {
        setMutating(false);
      }
    },
    [user?.id]
  );

  /**
   * Manually refresh addresses
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const freshAddresses = await FirebaseAddressService.getAddresses(user.id);
      setAddresses(freshAddresses);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to refresh addresses";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Convert address to delivery data format
   */
  const toDeliveryData = useCallback(
    (address: FirestoreAddress): DeliveryAddressData => {
      return FirebaseAddressService.toDeliveryAddress(address);
    },
    []
  );

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    addresses,
    defaultAddress,
    loading,
    error,
    mutating,
    hasAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setAsDefault,
    refresh,
    toDeliveryData,
  };
}

// Export types
export type { FirestoreAddress, AddressInput, DeliveryAddressData };
