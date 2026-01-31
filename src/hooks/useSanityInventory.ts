/**
 * useSanityInventory Hook
 * 
 * Custom React hook for real-time inventory tracking from Sanity CMS.
 * Monitors stock levels, low stock alerts, and out-of-stock products.
 * 
 * Phase 7: Inventory Management System
 */

import { useState, useEffect, useCallback } from 'react';
import { sanityClient, listenSafe } from '@/lib/sanity/client';

export interface InventoryStatus {
  productId: string;
  productName: string;
  quantityInStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  allowBackorders: boolean;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
  trackInventory: boolean;
}

interface UseSanityInventoryReturn {
  inventory: InventoryStatus[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
}

/**
 * Fetch and monitor inventory from Sanity CMS with real-time updates
 * 
 * @returns inventory array, loading state, error, refetch function, and stock counts
 * 
 * @example
 * const { inventory, lowStockCount, outOfStockCount } = useSanityInventory();
 */
export function useSanityInventory(): UseSanityInventoryReturn {
  const [inventory, setInventory] = useState<InventoryStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      console.log('📦 [INVENTORY] Fetching inventory from Sanity CMS...');
      
      const query = `*[_type == "product" && inventory.trackInventory == true] {
        _id,
        name,
        "quantityInStock": coalesce(inventory.quantityInStock, 0),
        "lowStockThreshold": coalesce(inventory.lowStockThreshold, 10),
        "allowBackorders": coalesce(inventory.allowBackorders, false),
        "trackInventory": coalesce(inventory.trackInventory, false)
      }`;

      const data = await sanityClient.fetch(query);
      
      const processedInventory: InventoryStatus[] = data.map((item: any) => {
        const isOutOfStock = item.quantityInStock === 0;
        const isLowStock = !isOutOfStock && item.quantityInStock <= item.lowStockThreshold;
        
        return {
          productId: item._id,
          productName: item.name,
          quantityInStock: item.quantityInStock || 0,
          lowStockThreshold: item.lowStockThreshold || 10,
          isLowStock,
          isOutOfStock,
          allowBackorders: item.allowBackorders || false,
          trackInventory: item.trackInventory,
          stockStatus: isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'
        };
      });

      setInventory(processedInventory);
      setLoading(false);
      setError(null);

      console.log('📊 [INVENTORY] Inventory loaded:', {
        total: processedInventory.length,
        inStock: processedInventory.filter(i => i.stockStatus === 'in-stock').length,
        lowStock: processedInventory.filter(i => i.isLowStock).length,
        outOfStock: processedInventory.filter(i => i.isOutOfStock).length
      });

    } catch (err) {
      console.error('❌ [INVENTORY] Error fetching inventory:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch inventory'));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();

    // 🔄 Real-time subscription for inventory updates
    console.log('🧹 [INVENTORY] Setting up real-time subscription...');
    
    const subscription = listenSafe('*[_type == "product"]')
      .subscribe((update) => {
        if (update.type === 'mutation') {
          console.log('🔄 [INVENTORY] Product updated in real-time! Refreshing inventory...');
          fetchInventory();
        }
      });

    return () => {
      console.log('🧹 [INVENTORY] Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [fetchInventory]);

  // Calculate stock counts
  const lowStockCount = inventory.filter(i => i.isLowStock).length;
  const outOfStockCount = inventory.filter(i => i.isOutOfStock).length;
  const inStockCount = inventory.filter(i => i.stockStatus === 'in-stock').length;

  return {
    inventory,
    loading,
    error,
    refetch: fetchInventory,
    lowStockCount,
    outOfStockCount,
    inStockCount
  };
}

/**
 * Convenience hook for fetching inventory status of a single product
 * 
 * @param productId - The Sanity document ID of the product
 * @returns Product inventory status, loading state, and error
 * 
 * @example
 * const { inventory, isInStock, isLowStock } = useProductInventory(product._id);
 */
export function useProductInventory(productId: string) {
  const { inventory, loading, error } = useSanityInventory();
  
  const productInventory = inventory.find(i => i.productId === productId);
  
  return {
    inventory: productInventory,
    loading,
    error,
    isInStock: productInventory ? !productInventory.isOutOfStock : false,
    isLowStock: productInventory?.isLowStock || false,
    quantityInStock: productInventory?.quantityInStock || 0
  };
}
