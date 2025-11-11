import { Badge } from "@/components/ui/badge";

/**
 * Unified status badge styling for seller dashboard tables
 * Provides consistent visual design across Orders, Products, Inventory, Refunds, and Dashboard
 */

export type OrderStatus = 
  | "PENDING" 
  | "CONFIRMED" 
  | "PROCESSING" 
  | "READY_FOR_PICKUP" 
  | "COMPLETED" 
  | "CANCELLED" 
  | "SHIPPED" 
  | "DELIVERED" 
  | "REFUNDED";

export type ProductStatus = "Active" | "Out of Stock" | "Draft";

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

export type RefundStatus = "Pending" | "Processing" | "Approved" | "Rejected";

type StatusType = OrderStatus | ProductStatus | InventoryStatus | RefundStatus | string;

interface StatusConfig {
  variant: "outline" | "destructive" | "secondary" | "default";
  className: string;
  label: string;
}

const statusConfigs: Record<string, StatusConfig> = {
  // Order statuses
  PENDING: {
    variant: "outline",
    className: "bg-yellow-100/10 text-yellow-700 dark:text-yellow-600 border-yellow-300",
    label: "Pending",
  },
  CONFIRMED: {
    variant: "outline",
    className: "bg-blue-100/10 text-blue-700 dark:text-blue-600 border-blue-300",
    label: "Confirmed",
  },
  PROCESSING: {
    variant: "outline",
    className: "bg-purple-100/10 text-purple-700 dark:text-purple-600 border-purple-300",
    label: "Processing",
  },
  READY_FOR_PICKUP: {
    variant: "outline",
    className: "bg-orange-100/10 text-orange-700 dark:text-orange-600 border-orange-300",
    label: "Ready for Pickup",
  },
  COMPLETED: {
    variant: "outline",
    className: "bg-primary/10 text-primary border-primary/30",
    label: "Completed",
  },
  CANCELLED: {
    variant: "destructive",
    className: "",
    label: "Cancelled",
  },
  SHIPPED: {
    variant: "outline",
    className: "bg-indigo-100/10 text-indigo-700 dark:text-indigo-600 border-indigo-300",
    label: "Shipped",
  },
  DELIVERED: {
    variant: "outline",
    className: "bg-green-100/10 text-green-700 dark:text-green-600 border-green-300",
    label: "Delivered",
  },
  REFUNDED: {
    variant: "outline",
    className: "bg-red-100/10 text-red-700 dark:text-red-600 border-red-300",
    label: "Refunded",
  },

  // Product statuses
  Active: {
    variant: "outline",
    className: "bg-green-100/10 text-green-700 dark:text-green-600 border-green-300",
    label: "Active",
  },
  "Out of Stock": {
    variant: "destructive",
    className: "",
    label: "Out of Stock",
  },
  Draft: {
    variant: "outline",
    className: "bg-gray-100/10 text-gray-700 dark:text-gray-400 border-gray-300",
    label: "Draft",
  },

  // Inventory statuses
  in_stock: {
    variant: "outline",
    className: "bg-green-100/10 text-green-700 dark:text-green-600 border-green-300",
    label: "In Stock",
  },
  low_stock: {
    variant: "outline",
    className: "bg-yellow-100/10 text-yellow-700 dark:text-yellow-600 border-yellow-300",
    label: "Low Stock",
  },
  out_of_stock: {
    variant: "destructive",
    className: "",
    label: "Out of Stock",
  },

  // Refund statuses
  Pending: {
    variant: "outline",
    className: "bg-yellow-100/10 text-yellow-700 dark:text-yellow-600 border-yellow-300",
    label: "Pending",
  },
  Processing: {
    variant: "outline",
    className: "bg-purple-100/10 text-purple-700 dark:text-purple-600 border-purple-300",
    label: "Processing",
  },
  Approved: {
    variant: "outline",
    className: "bg-green-100/10 text-green-700 dark:text-green-600 border-green-300",
    label: "Approved",
  },
  Rejected: {
    variant: "destructive",
    className: "",
    label: "Rejected",
  },
};

/**
 * Get status badge component with unified styling
 * @param status - Status value
 * @returns JSX Badge component
 */
export function getStatusBadge(status: StatusType) {
  const config = statusConfigs[status] || {
    variant: "outline" as const,
    className: "bg-gray-100/10 text-gray-700 dark:text-gray-400 border-gray-300",
    label: status,
  };

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

/**
 * Get status color classes for custom badge implementations
 * @param status - Status value
 * @returns className string
 */
export function getStatusColor(status: StatusType): string {
  const config = statusConfigs[status];
  return config?.className || "bg-gray-100/10 text-gray-700 dark:text-gray-400 border-gray-300";
}

/**
 * Get human-readable label for status
 * @param status - Status value
 * @returns Display label
 */
export function getStatusLabel(status: StatusType): string {
  const config = statusConfigs[status];
  return config?.label || status;
}
