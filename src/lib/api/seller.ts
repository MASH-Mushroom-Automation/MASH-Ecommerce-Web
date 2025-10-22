// API functions for seller-related operations
import {
  SellerDashboardStats,
  SellerSalesData,
  SellerProductPerformance,
  SellerOrder,
  SellerProduct,
  SellerRefund,
  SellerNotification,
  SellerAddress,
  ApiResponse,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Mock data for seller operations
const MOCK_SELLER_ORDERS: SellerOrder[] = [
  {
    id: "ORD-001",
    date: "2025-10-20",
    customer: "John Doe",
    items: 3,
    total: 450,
    status: "Pending",
  },
  {
    id: "ORD-002",
    date: "2025-10-19",
    customer: "Jane Smith",
    items: 2,
    total: 280,
    status: "Processing",
  },
  {
    id: "ORD-003",
    date: "2025-10-18",
    customer: "Mike Johnson",
    items: 1,
    total: 150,
    status: "Shipped",
  },
];

const MOCK_SELLER_PRODUCTS: SellerProduct[] = [
  {
    id: "1",
    name: "Fresh White Oyster Mushrooms",
    image: "/placeholder.png",
    price: 120,
    stock: 50,
    category: "Fresh Mushroom",
    status: "Active",
  },
  {
    id: "2",
    name: "Vibrant Pink Oyster Mushrooms",
    image: "/placeholder.png",
    price: 140,
    stock: 30,
    category: "Fresh Mushroom",
    status: "Active",
  },
];

const MOCK_SELLER_REFUNDS: SellerRefund[] = [
  {
    id: "REF-001",
    orderId: "ORD-004",
    date: "2025-10-15",
    customer: "Sarah Williams",
    amount: 150,
    reason: "Damaged product",
    status: "Pending",
  },
];

const MOCK_SELLER_NOTIFICATIONS: SellerNotification[] = [
  {
    id: "1",
    title: "New Order Received",
    message: "You have a new order from John Doe",
    type: "order",
    isRead: false,
    createdAt: "2025-10-20T10:00:00Z",
  },
];

const MOCK_SELLER_ADDRESSES: SellerAddress[] = [
  {
    id: "1",
    name: "Main Store",
    contactPerson: "Juan Dela Cruz",
    phone: "09123456789",
    address: "123 Main Street",
    barangay: "Diliman",
    barangayCode: "QC_DILIMAN",
    city: "Quezon City",
    cityCode: "QUEZON_CITY",
    region: "National Capital Region",
    regionCode: "NCR",
    province: "Metro Manila",
    postalCode: "1100",
    isDefault: true,
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class SellerApi {
  // Dashboard
  static async getDashboardStats(): Promise<ApiResponse<SellerDashboardStats>> {
    await delay(300);

    return {
      data: {
        totalSales: 1250,
        totalOrders: 45,
        totalProducts: 12,
        totalRevenue: 15600,
        salesGrowth: 12.5,
        orderGrowth: 8.3,
        revenueGrowth: 15.2,
      },
      success: true,
    };
  }

  static async getSalesData(): Promise<ApiResponse<SellerSalesData[]>> {
    await delay(200);

    const salesData = [
      { name: "Mon", sales: 4000, revenue: 4800 },
      { name: "Tue", sales: 3000, revenue: 3600 },
      { name: "Wed", sales: 5000, revenue: 6000 },
      { name: "Thu", sales: 2780, revenue: 3336 },
      { name: "Fri", sales: 1890, revenue: 2268 },
      { name: "Sat", sales: 6390, revenue: 7668 },
      { name: "Sun", sales: 3490, revenue: 4188 },
    ];

    return {
      data: salesData,
      success: true,
    };
  }

  static async getProductPerformance(): Promise<
    ApiResponse<SellerProductPerformance[]>
  > {
    await delay(200);

    const performanceData = [
      {
        name: "Fresh White Oyster Mushrooms",
        sales: 120,
        stock: 50,
        revenue: 14400,
      },
      {
        name: "Vibrant Pink Oyster Mushrooms",
        sales: 85,
        stock: 30,
        revenue: 11900,
      },
    ];

    return {
      data: performanceData,
      success: true,
    };
  }

  // Products
  static async getProducts(
    params: { page?: number; limit?: number; search?: string } = {}
  ): Promise<ApiResponse<SellerProduct[]>> {
    await delay(300);

    let filteredProducts = [...MOCK_SELLER_PRODUCTS];

    if (params.search) {
      filteredProducts = filteredProducts.filter((p) =>
        p.name.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      data: paginatedProducts,
      success: true,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit),
      },
    };
  }

  static async getProductById(
    id: string
  ): Promise<ApiResponse<SellerProduct | null>> {
    await delay(200);

    const product = MOCK_SELLER_PRODUCTS.find((p) => p.id === id);

    return {
      data: product || null,
      success: !!product,
      message: product ? undefined : "Product not found",
    };
  }

  // Orders
  static async getOrders(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    } = {}
  ): Promise<ApiResponse<SellerOrder[]>> {
    await delay(300);

    let filteredOrders = [...MOCK_SELLER_ORDERS];

    if (params.status) {
      filteredOrders = filteredOrders.filter((o) => o.status === params.status);
    }

    if (params.search) {
      filteredOrders = filteredOrders.filter(
        (o) =>
          o.customer.toLowerCase().includes(params.search!.toLowerCase()) ||
          o.id.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return {
      data: paginatedOrders,
      success: true,
      pagination: {
        page,
        limit,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit),
      },
    };
  }

  // Refunds
  static async getRefunds(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    } = {}
  ): Promise<ApiResponse<SellerRefund[]>> {
    await delay(300);

    let filteredRefunds = [...MOCK_SELLER_REFUNDS];

    if (params.status) {
      filteredRefunds = filteredRefunds.filter(
        (r) => r.status === params.status
      );
    }

    if (params.search) {
      filteredRefunds = filteredRefunds.filter(
        (r) =>
          r.customer.toLowerCase().includes(params.search!.toLowerCase()) ||
          r.id.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRefunds = filteredRefunds.slice(startIndex, endIndex);

    return {
      data: paginatedRefunds,
      success: true,
      pagination: {
        page,
        limit,
        total: filteredRefunds.length,
        totalPages: Math.ceil(filteredRefunds.length / limit),
      },
    };
  }

  // Notifications
  static async getNotifications(): Promise<ApiResponse<SellerNotification[]>> {
    await delay(200);

    return {
      data: MOCK_SELLER_NOTIFICATIONS,
      success: true,
    };
  }

  static async markNotificationAsRead(
    id: string
  ): Promise<ApiResponse<boolean>> {
    await delay(100);

    return {
      data: true,
      success: true,
    };
  }

  // Addresses
  static async getAddresses(): Promise<ApiResponse<SellerAddress[]>> {
    await delay(200);

    return {
      data: MOCK_SELLER_ADDRESSES,
      success: true,
    };
  }

  static async createAddress(
    address: Omit<SellerAddress, "id">
  ): Promise<ApiResponse<SellerAddress>> {
    await delay(300);

    const newAddress: SellerAddress = {
      ...address,
      id: Date.now().toString(),
    };

    return {
      data: newAddress,
      success: true,
    };
  }

  static async updateAddress(
    id: string,
    address: Partial<SellerAddress>
  ): Promise<ApiResponse<SellerAddress>> {
    await delay(300);

    const existingAddress = MOCK_SELLER_ADDRESSES.find((a) => a.id === id);
    if (!existingAddress) {
      return {
        data: {} as SellerAddress,
        success: false,
        message: "Address not found",
      };
    }

    const updatedAddress = { ...existingAddress, ...address };

    return {
      data: updatedAddress,
      success: true,
    };
  }

  static async deleteAddress(id: string): Promise<ApiResponse<boolean>> {
    await delay(200);

    return {
      data: true,
      success: true,
    };
  }
}
