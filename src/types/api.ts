// API Response Types for CMS Integration

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Product Types
export interface ProductApiResponse {
  // Core fields
  id: string;
  name: string;
  slug: string; // Backend required - URL-friendly identifier
  sku?: string; // Backend optional - Stock Keeping Unit
  description?: string; // Should be in backend, currently missing

  // Pricing
  price: number;
  comparePrice?: number; // Backend optional - Original price for discounts
  costPrice?: number; // Backend optional - Cost for profit calculations

  // Inventory
  stock: number; // Backend required - Current stock level
  minStock: number; // Backend required - Low stock alert threshold
  inStock?: boolean; // Computed field: stock > 0

  // Physical attributes
  weight?: string; // Should be in backend, currently missing (e.g., "250g", "1kg")

  // Media
  images: string[]; // Backend required - Array of image URLs
  image: string; // Computed field: images[0] for convenience

  // Categorization
  category: string; // Frontend uses single category (will migrate to categories[])
  categories?: string[]; // Backend uses array - multiple category support
  tag?: string; // Frontend uses single tag (will migrate to tags[])
  tags?: string[]; // Backend uses array - multiple tags

  // Relations
  grower?: string; // Frontend field - grower name
  growerId?: string; // Should be in backend - relation to User

  // Status flags
  isActive: boolean; // Backend required - Product visibility
  isFeatured: boolean; // Backend required - Featured on homepage
  isDeleted: boolean; // Backend required - Soft delete flag

  // Metadata
  createdAt: string; // Backend required
  updatedAt: string; // Backend required
}

export interface ProductsListParams {
  page?: number;
  limit?: number;
  category?: string;
  grower?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// Cart Types
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  // Product details for display (stored when adding to cart)
  name: string;
  image: string;
  slug: string;
  grower?: string;
  unit?: string;
  stock: number;
  comparePrice?: number;
  sellerId?: string; // Seller/grower ID for order routing
}

// Product data required for adding to cart
export interface AddToCartProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  stock: number;
  grower?: string;
  unit?: string;
  comparePrice?: number;
  sellerId?: string; // Seller/grower ID for order routing
}

export interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export interface UserAddress {
  // Core fields
  id: string;
  userId?: string; // Backend has this - relation to User

  // Address type
  type?: string; // "shipping", "billing", "home", "work"

  // Contact information
  firstName: string; // Separated from "name" field
  lastName: string; // Backend requires separate names
  phone: string;

  // Address lines
  street1: string; // Main address line (was "address")
  street2?: string; // Optional second line

  // Philippines-specific fields
  barangay?: string; // PH: Smallest admin division
  barangayCode?: string; // PH: Barangay PSGC code

  // City/Municipality
  city: string;
  cityCode?: string; // PH: City/Municipality PSGC code

  // Province/State
  state: string; // Province for PH, State for other countries
  stateCode?: string; // PH: Province PSGC code
  province?: string; // Alias for state (PH-specific, might be duplicate)

  // Region (PH-specific)
  region?: string; // PH: Region name (e.g., "NCR", "Region III")
  regionCode?: string; // PH: Region PSGC code

  // Postal
  postalCode: string;

  // Country
  country: string; // Default "Philippines" for PH addresses

  // Flags
  isDefault: boolean;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface WishlistItem {
  id?: string; // Unique ID for wishlist item
  productId: string;
  userId?: string; // Backend relation to User
  addedAt: string; // Alias for createdAt
  createdAt?: string; // Backend metadata
  updatedAt?: string; // Backend metadata
}

// Seller Types
export interface SellerDashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  salesGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
}

export interface SellerSalesData {
  name: string;
  sales: number;
  revenue: number;
}

export interface SellerProductPerformance {
  name: string;
  sales: number;
  stock: number;
  revenue: number;
}

// Backend OrderStatus enum - matches Prisma schema
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

// @deprecated - Use OrderStatus instead
export type SellerOrderStatus = OrderStatus;

export interface SellerOrder {
  id: string;
  date: string;
  customer: string;
  items: number;
  total: number;
  status: SellerOrderStatus;
  isActive?: boolean; // Backend flag - order is active/not cancelled
  createdAt?: string; // Backend metadata
  updatedAt?: string; // Backend metadata
}

export interface SellerOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SellerOrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface SellerOrderCoordination {
  method: string;
  location: string;
  preferredDate: string;
  preferredTime: string;
  contactPerson: string;
  contactNumber: string;
  instructions?: string;
}

export interface SellerOrderPayment {
  method: string;
  status: string;
  transactionId: string;
}

export interface SellerOrderTotals {
  subtotal: number;
  coordinationFee?: number;
  total: number;
}

export interface SellerOrderTimelineEntry {
  status: SellerOrderStatus;
  date: string;
  description: string;
}

export interface SellerOrderDetail {
  id: string;
  date: string;
  status: SellerOrderStatus;
  customer: SellerOrderCustomer;
  items: SellerOrderItem[];
  coordination: SellerOrderCoordination;
  payment: SellerOrderPayment;
  totals: SellerOrderTotals;
  notes?: string;
  timeline: SellerOrderTimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface SellerProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  category: string;
  status: "Active" | "Inactive" | "Out of Stock"; // Frontend display status
  description?: string;
  weight?: string;

  // Backend flags (different from display status)
  isActive?: boolean; // Backend flag - product is published/visible
  isDeleted?: boolean; // Backend flag - soft delete

  // Metadata (make required, not optional)
  createdAt: string; // Required in backend
  updatedAt: string; // Required in backend
}

export interface SellerRefund {
  id: string;
  orderId: string;
  date: string; // Display date (might be different from createdAt)
  customer: string;
  amount: number;
  reason: string;
  status: "Pending" | "Processing" | "Approved" | "Rejected";

  // Metadata
  createdAt?: string; // Backend metadata
  updatedAt?: string; // Backend metadata
}

export interface SellerNotification {
  id: string;
  title: string;
  message: string;
  type: "order" | "refund" | "product" | "system";
  isRead: boolean;

  // Metadata
  createdAt: string; // Already present
  updatedAt?: string; // Add for backend compatibility
}

export interface SellerAddress {
  // Core fields
  id: string;
  userId?: string; // Backend relation to User/Seller

  // Business information
  name: string; // Business/Store name
  contactPerson: string; // Contact person name
  phone: string;

  // Address lines
  street1?: string; // Main address (was "address")
  street2?: string; // Optional second line
  address?: string; // Keep for backward compatibility

  // Philippines-specific fields (all present in current schema)
  barangay: string; // PH: Barangay name
  barangayCode: string; // PH: Barangay PSGC code
  city: string; // City/Municipality
  cityCode: string; // City/Municipality PSGC code
  region: string; // PH: Region name
  regionCode: string; // PH: Region PSGC code
  province: string; // PH: Province name
  postalCode: string;

  // Country (add for backend compatibility)
  country?: string; // Default "Philippines"

  // Flags
  isDefault: boolean;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

// User Types
export type SellerStatus = "none" | "pending" | "approved";

// Backend UserRole enum - matches Prisma schema
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN" | "GROWER" | "BUYER";

export interface UserProfile {
  // Core fields (from backend)
  id: string;
  clerkId: string; // Required for Clerk authentication
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;

  // Authorization (from backend)
  role: UserRole; // User role: USER, ADMIN, SUPER_ADMIN, GROWER, BUYER
  isActive: boolean; // Account status
  twoFactorEnabled: boolean; // 2FA status
  emailVerified?: boolean; // Email verification status

  // Profile image (DiceBear URL from backend)
  // Format: https://api.dicebear.com/9.x/bottts-neutral/svg?seed={username|email}
  imageUrl?: string;

  // Phone number (from backend)
  phoneNumber?: string; // Backend field name

  // Additional fields (for legacy compatibility)
  phone?: string; // @deprecated Use phoneNumber instead
  avatar?: string; // @deprecated Use imageUrl instead

  // Frontend computed/compatibility fields
  sellerStatus: SellerStatus; // Computed from role: role === 'GROWER' ? 'approved' : 'none' or 'pending'
  isSeller?: boolean; // @deprecated - Use sellerStatus === 'approved' or role === 'GROWER' instead

  // Metadata (from backend)
  createdAt: string;
  updatedAt: string;

  // Custom preferences (may need to be JSON field in backend)
  preferences?: {
    interests: string[];
    cookingLevel: string;
    notifications: boolean;
  };
}

export interface UserOnboardingData {
  interests: string[];
  cookingLevel: string;
  completed: boolean;
}

// Main Page Types
export interface Grower {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  logo?: string;
  banner?: string;
  location?: string;
  region?: string;
  tagline?: string;
  coords: {
    lat: number;
    lng: number;
  };
}

export interface HomePageData {
  featuredProducts: ProductApiResponse[];
  topGrowers: Grower[];
  heroSlides: string[];
}
