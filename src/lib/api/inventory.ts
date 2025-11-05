// Inventory API client
import { ApiResponse } from "@/types/api";

export interface StockLevel {
  productId: string;
  quantity: number;
  threshold: number;
  lastUpdated: string;
}

export interface StockAlert {
  productId: string;
  threshold: number;
  enabled: boolean;
  notifyEmail: boolean;
  notifySMS: boolean;
}

export interface LowStockProduct {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
  lastUpdated: string;
}

export const InventoryApi = {
  // Get product inventory
  getInventory: async (productId: string): Promise<ApiResponse<StockLevel>> => {
    const res = await fetch(`/api/products/${productId}/inventory`);
    if (!res.ok) throw new Error("Failed to fetch inventory");
    return res.json();
  },

  // Update stock levels
  updateStock: async (productId: string, quantity: number): Promise<ApiResponse<StockLevel>> => {
    const res = await fetch(`/api/products/${productId}/inventory`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity })
    });
    if (!res.ok) throw new Error("Failed to update stock");
    return res.json();
  },

  // Configure stock alerts
  setStockAlert: async (productId: string, alert: Partial<StockAlert>): Promise<ApiResponse<StockAlert>> => {
    const res = await fetch(`/api/products/${productId}/stock-alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alert)
    });
    if (!res.ok) throw new Error("Failed to set stock alert");
    return res.json();
  },

  // Get low stock products
  getLowStockProducts: async (): Promise<ApiResponse<LowStockProduct[]>> => {
    const res = await fetch("/api/inventory/low-stock");
    if (!res.ok) throw new Error("Failed to fetch low stock products");
    return res.json();
  }
};
