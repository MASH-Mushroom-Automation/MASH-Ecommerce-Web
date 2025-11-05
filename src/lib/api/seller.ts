// API functions for seller-related operations
import {
  SellerDashboardStats,
  SellerSalesData,
  SellerProductPerformance,
  SellerOrder,
  SellerOrderDetail,
  SellerOrderStatus,
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
    status: "Confirmed",
  },
  {
    id: "ORD-003",
    date: "2025-10-18",
    customer: "Mike Johnson",
    items: 1,
    total: 150,
    status: "Ready for Pickup",
  },
  {
    id: "ORD-004",
    date: "2025-10-17",
    customer: "Alice Brown",
    items: 4,
    total: 520,
    status: "Completed",
  },
  {
    id: "ORD-005",
    date: "2025-10-16",
    customer: "Mark Reyes",
    items: 2,
    total: 260,
    status: "Cancelled",
  },
];

const statusDescriptions: Record<SellerOrderStatus, string> = {
  Pending: "Order received and waiting for seller confirmation",
  Confirmed: "Seller confirmed the order and is preparing it",
  "Ready for Pickup": "Order ready for handover to the buyer",
  Completed: "Buyer received the order and confirmed completion",
  Cancelled: "Order was cancelled",
};

const createTimelineEntry = (
  status: SellerOrderStatus,
  date: string
) => ({
  status,
  date,
  description: statusDescriptions[status],
});

const MOCK_SELLER_ORDER_DETAILS: Record<string, SellerOrderDetail> = {
  "ORD-001": {
    id: "ORD-001",
    date: "2025-10-20",
    status: "Pending",
    customer: {
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+63 912 345 6789",
      address:
        "123 Main Street, Barangay San Antonio, Quezon City, Metro Manila 1105",
    },
    items: [
      { id: "P-101", name: "Fresh Shiitake Mushrooms", quantity: 2, price: 150, total: 300 },
      { id: "P-205", name: "Oyster Mushroom Growing Kit", quantity: 1, price: 150, total: 150 },
    ],
    coordination: {
      method: "Meet-up",
      location: "MASH Farm Hub - Quezon City",
      preferredDate: "2025-10-22",
      preferredTime: "10:00 AM",
      contactPerson: "John Doe",
      contactNumber: "+63 912 345 6789",
      instructions: "Bring your reusable bag for pickup.",
    },
    payment: {
      method: "GCash",
      status: "Paid",
      transactionId: "TXN-ORD-001-20251020",
    },
    totals: {
      subtotal: 450,
      coordinationFee: 0,
      total: 450,
    },
    notes: "Buyer prefers morning pickup and will message before arrival.",
    timeline: [
      createTimelineEntry("Pending", "2025-10-20 10:30 AM"),
    ],
    createdAt: "2025-10-20T10:30:00Z",
    updatedAt: "2025-10-20T10:30:00Z",
  },
  "ORD-002": {
    id: "ORD-002",
    date: "2025-10-19",
    status: "Confirmed",
    customer: {
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+63 917 111 2233",
      address: "45 Riverside Drive, Marikina City, Metro Manila",
    },
    items: [
      { id: "P-111", name: "Pink Oyster Mushrooms", quantity: 1, price: 180, total: 180 },
      { id: "P-130", name: "Dried Lion's Mane", quantity: 1, price: 100, total: 100 },
    ],
    coordination: {
      method: "Courier arranged by seller",
      location: "Seller warehouse",
      preferredDate: "2025-10-21",
      preferredTime: "1:00 PM",
      contactPerson: "Jane Smith",
      contactNumber: "+63 917 111 2233",
      instructions: "Buyer will book GrabExpress and share tracking.",
    },
    payment: {
      method: "Cash on Pickup",
      status: "Pending",
      transactionId: "",
    },
    totals: {
      subtotal: 280,
      total: 280,
    },
    timeline: [
      createTimelineEntry("Pending", "2025-10-19 09:10 AM"),
      createTimelineEntry("Confirmed", "2025-10-19 10:00 AM"),
    ],
    createdAt: "2025-10-19T09:10:00Z",
    updatedAt: "2025-10-19T10:00:00Z",
  },
  "ORD-003": {
    id: "ORD-003",
    date: "2025-10-18",
    status: "Ready for Pickup",
    customer: {
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      phone: "+63 915 222 3344",
      address: "78 Green Avenue, Makati City, Metro Manila",
    },
    items: [
      { id: "P-160", name: "Reishi Powder", quantity: 1, price: 150, total: 150 },
    ],
    coordination: {
      method: "Meet-up",
      location: "Makati Central Square"
        + ", Ground floor lobby",
      preferredDate: "2025-10-19",
      preferredTime: "6:00 PM",
      contactPerson: "Mike Johnson",
      contactNumber: "+63 915 222 3344",
      instructions: "Buyer will message when nearby.",
    },
    payment: {
      method: "PayMaya",
      status: "Paid",
      transactionId: "TXN-ORD-003-20251018",
    },
    totals: {
      subtotal: 150,
      coordinationFee: 0,
      total: 150,
    },
    timeline: [
      createTimelineEntry("Pending", "2025-10-18 08:05 AM"),
      createTimelineEntry("Confirmed", "2025-10-18 08:30 AM"),
      createTimelineEntry("Ready for Pickup", "2025-10-18 05:00 PM"),
    ],
    createdAt: "2025-10-18T08:05:00Z",
    updatedAt: "2025-10-18T17:00:00Z",
  },
  "ORD-004": {
    id: "ORD-004",
    date: "2025-10-17",
    status: "Completed",
    customer: {
      name: "Alice Brown",
      email: "alice.brown@email.com",
      phone: "+63 927 555 6677",
      address: "12 Sunrise Street, Pasig City, Metro Manila",
    },
    items: [
      { id: "P-101", name: "Fresh Shiitake Mushrooms", quantity: 2, price: 150, total: 300 },
      { id: "P-220", name: "Mushroom Jerky", quantity: 2, price: 110, total: 220 },
    ],
    coordination: {
      method: "Courier arranged by buyer",
      location: "Seller's Kitchen (Pasig)",
      preferredDate: "2025-10-18",
      preferredTime: "2:00 PM",
      contactPerson: "Alice Brown",
      contactNumber: "+63 927 555 6677",
      instructions: "Buyer booked Lalamove; parcel delivered.",
    },
    payment: {
      method: "Credit Card",
      status: "Paid",
      transactionId: "TXN-ORD-004-20251017",
    },
    totals: {
      subtotal: 520,
      coordinationFee: 0,
      total: 520,
    },
    notes: "Delivery completed and confirmed by buyer.",
    timeline: [
      createTimelineEntry("Pending", "2025-10-17 07:40 AM"),
      createTimelineEntry("Confirmed", "2025-10-17 08:10 AM"),
      createTimelineEntry("Ready for Pickup", "2025-10-17 12:00 PM"),
      createTimelineEntry("Completed", "2025-10-18 03:15 PM"),
    ],
    createdAt: "2025-10-17T07:40:00Z",
    updatedAt: "2025-10-18T15:15:00Z",
  },
};

const MOCK_SELLER_PRODUCTS: SellerProduct[] = [
  {
    id: "1",
    name: "Fresh White Oyster Mushrooms",
    image: "/white.jpg",
    price: 120,
    stock: 50,
    category: "Fresh Mushroom",
    status: "Active",
  },
  {
    id: "2",
    name: "Mushroom Chips",
    image: "/Pink-Oyster-1.webp",
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
        name: "Mushroom Chips",
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

  static async getOrderById(
    id: string
  ): Promise<ApiResponse<SellerOrderDetail | null>> {
    await delay(250);

    const orderDetail = MOCK_SELLER_ORDER_DETAILS[id];

    return {
      data: orderDetail ?? null,
      success: !!orderDetail,
      message: orderDetail ? undefined : "Order not found",
    };
  }

  static async updateOrderStatus(
    id: string,
    status: SellerOrderStatus
  ): Promise<ApiResponse<SellerOrderDetail | null>> {
    await delay(350);

    const orderDetail = MOCK_SELLER_ORDER_DETAILS[id];
    if (!orderDetail) {
      return {
        data: null,
        success: false,
        message: "Order not found",
      };
    }

    orderDetail.status = status;
    orderDetail.updatedAt = new Date().toISOString();
    orderDetail.timeline = [
      ...orderDetail.timeline,
      createTimelineEntry(status, new Date().toISOString()),
    ];

    const summaryOrder = MOCK_SELLER_ORDERS.find((order) => order.id === id);
    if (summaryOrder) {
      summaryOrder.status = status;
    }

    return {
      data: orderDetail,
      success: true,
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

  // Update product
  static async updateProduct(
    productId: string,
    productData: Partial<SellerProduct>
  ): Promise<ApiResponse<SellerProduct>> {
    await delay(500);

    // In a real application, you would make an API call to update the product
    // For now, we'll just simulate the update

    const updatedProduct: SellerProduct = {
      id: productId,
      name: productData.name || "Updated Product",
      description: productData.description || "Updated description",
      category: productData.category || "Fresh Mushroom",
      price: productData.price || 0,
      stock: productData.stock || 0,
      status: productData.status || "Active",
      image: productData.image || "/placeholder.png",
      weight: productData.weight || "500g",
      createdAt: "2025-01-15",
      updatedAt: new Date().toISOString().split("T")[0],
    };

    return {
      data: updatedProduct,
      success: true,
    };
  }

  // Delete product
  static async deleteProduct(productId: string): Promise<ApiResponse<boolean>> {
    await delay(500);

    // In a real application, you would make an API call to delete the product
    // For now, we'll just simulate the deletion

    return {
      data: true,
      success: true,
    };
  }
}
