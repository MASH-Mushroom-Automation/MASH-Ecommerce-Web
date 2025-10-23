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
  id: string;
  name: string;
  description: string;
  price: number;
  weight: string;
  images: string[];
  image: string;
  category: string;
  grower: string;
  tag?: string;
  inStock?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
}

export interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
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

export interface SellerOrder {
  id: string;
  date: string;
  customer: string;
  items: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
}

export interface SellerProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  category: string;
  status: "Active" | "Inactive" | "Out of Stock";
}

export interface SellerRefund {
  id: string;
  orderId: string;
  date: string;
  customer: string;
  amount: number;
  reason: string;
  status: "Pending" | "Processing" | "Approved" | "Rejected";
}

export interface SellerNotification {
  id: string;
  title: string;
  message: string;
  type: "order" | "refund" | "product" | "system";
  isRead: boolean;
  createdAt: string;
}

export interface SellerAddress {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  barangay: string;
  barangayCode: string;
  city: string;
  cityCode: string;
  region: string;
  regionCode: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

// User Types
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  preferences: {
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
  location?: string;
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
