"use client";

import { useState, useEffect } from "react";
import {
  addressApi,
  type Address,
  type CreateAddressRequest,
  type UpdateAddressRequest,
} from "@/lib/api/addresses";

export interface UseAddressesReturn {
  // Data
  addresses: Address[];
  loading: boolean;
  error: string | null;

  // Actions
  createAddress: (addressData: CreateAddressRequest) => Promise<boolean>;
  updateAddress: (addressData: UpdateAddressRequest) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultAddress: (id: string) => Promise<boolean>;
  refreshAddresses: () => Promise<void>;

  // State
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useAddresses(): UseAddressesReturn {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await addressApi.getAll();

      if (response.success && response.data) {
        setAddresses(response.data);
      } else {
        setError(response.error || "Failed to load addresses");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const createAddress = async (
    addressData: CreateAddressRequest
  ): Promise<boolean> => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await addressApi.create(addressData);

      if (response.success && response.data) {
        setAddresses((prev) => [...prev, response.data!]);
        return true;
      } else {
        setError(response.error || "Failed to create address");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const updateAddress = async (
    addressData: UpdateAddressRequest
  ): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);

      const response = await addressApi.update(addressData);

      if (response.success && response.data) {
        setAddresses((prev) =>
          prev.map((addr) =>
            addr.id === addressData.id ? response.data! : addr
          )
        );
        return true;
      } else {
        setError(response.error || "Failed to update address");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await addressApi.delete(id);

      if (response.success) {
        setAddresses((prev) => prev.filter((addr) => addr.id !== id));
        return true;
      } else {
        setError(response.error || "Failed to delete address");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const setDefaultAddress = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await addressApi.setDefault(id);

      if (response.success && response.data) {
        // Update all addresses - set the selected one as default, others as non-default
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            isDefault: addr.id === id,
          }))
        );
        return true;
      } else {
        setError(response.error || "Failed to set default address");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      return false;
    }
  };

  const refreshAddresses = async () => {
    await loadAddresses();
  };

  return {
    addresses,
    loading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refreshAddresses,
    isCreating,
    isUpdating,
    isDeleting,
  };
}
