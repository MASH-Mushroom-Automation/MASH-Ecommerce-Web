import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  MapPin,
} from "lucide-react";
import { OrderStatus } from "@/lib/firebase/orders";

export const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending_approval: {
    label: "Pending Approval",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-200",
    icon: AlertCircle,
  },
  approved: {
    label: "Approved",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    icon: XCircle,
  },
  processing: {
    label: "Processing",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
    icon: Package,
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    color: "text-cyan-700",
    bgColor: "bg-cyan-50 border-cyan-200",
    icon: MapPin,
  },
  shipped: {
    label: "Shipped",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50 border-indigo-200",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    icon: CheckCircle,
  },
  completed: {
    label: "Completed",
    color: "text-gray-700",
    bgColor: "bg-gray-50 border-gray-200",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    icon: XCircle,
  },
};
