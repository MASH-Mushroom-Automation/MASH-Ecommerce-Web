import { useState, useCallback } from 'react';
import { InventoryApi, StockLevel, StockAlert, LowStockProduct } from '@/lib/api/inventory';

export function useInventory(productId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockLevel, setStockLevel] = useState<StockLevel | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);

  // Get inventory for a specific product
  const getInventory = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await InventoryApi.getInventory(productId);
      setStockLevel(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Update stock level
  const updateStock = useCallback(async (quantity: number) => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await InventoryApi.updateStock(productId, quantity);
      setStockLevel(response.data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stock');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Set stock alert
  const setStockAlert = useCallback(async (alert: Partial<StockAlert>) => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await InventoryApi.setStockAlert(productId, alert);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set stock alert');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Get all low stock products
  const getLowStockProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await InventoryApi.getLowStockProducts();
      setLowStockProducts(response.data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch low stock products');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    stockLevel,
    lowStockProducts,
    getInventory,
    updateStock,
    setStockAlert,
    getLowStockProducts,
  };
}
