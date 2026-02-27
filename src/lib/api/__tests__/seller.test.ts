/**
 * Tests for src/lib/api/seller.ts
 * SellerApi - seller dashboard operations via fetch-based API client.
 * Each method calls apiFetch() which calls global fetch.
 * We mock global.fetch with a URL-routing handler to return appropriate data.
 */
import { SellerApi } from "../seller";

// ─── Mock Data ─────────────────────────────────────────────────────────────

const MOCK_DASHBOARD_STATS = {
  totalRevenue: 125000,
  totalOrders: 50,
  totalProducts: 24,
  totalSales: 98500,
  salesGrowth: 12.5,
  orderGrowth: 8.5,
  revenueGrowth: 10.0,
};

const MOCK_SALES_DATA = [
  { name: "Mon", sales: 12000, revenue: 24000 },
  { name: "Tue", sales: 15000, revenue: 26500 },
  { name: "Wed", sales: 18000, revenue: 32000 },
  { name: "Thu", sales: 14000, revenue: 28000 },
  { name: "Fri", sales: 22000, revenue: 35000 },
  { name: "Sat", sales: 25000, revenue: 42390 },
  { name: "Sun", sales: 19000, revenue: 30000 },
];

const MOCK_PRODUCT_PERFORMANCE = [
  { name: "Oyster Mushrooms", sales: 245, revenue: 36750, stock: 120 },
  { name: "Shiitake Mushrooms", sales: 189, revenue: 28350, stock: 15 },
  { name: "Lion's Mane", sales: 156, revenue: 23400, stock: 0 },
];

const MOCK_PRODUCTS = [
  { id: "P-001", name: "Oyster Mushrooms", price: 150, stock: 120, category: "Mushrooms", status: "active", createdAt: "2024-01-01", updatedAt: "2024-01-15" },
  { id: "P-002", name: "Shiitake Mushrooms", price: 180, stock: 15, category: "Mushrooms", status: "active", createdAt: "2024-01-02", updatedAt: "2024-01-15" },
  { id: "P-003", name: "Lion's Mane", price: 200, stock: 0, category: "Mushrooms", status: "active", createdAt: "2024-01-03", updatedAt: "2024-01-15" },
];

const MOCK_ORDERS = [
  { id: "ORD-001", customer: "John Smith", status: "PENDING", total: 300, date: "2024-01-20", items: 2 },
  { id: "ORD-002", customer: "Alice Brown", status: "DELIVERED", total: 450, date: "2024-01-19", items: 3 },
  { id: "ORD-003", customer: "Bob Johnson", status: "PROCESSING", total: 150, date: "2024-01-18", items: 1 },
  { id: "ORD-004", customer: "Alice Chen", status: "DELIVERED", total: 200, date: "2024-01-17", items: 1 },
];

const MOCK_ORDER_DETAILS: Record<string, any> = {
  "ORD-001": {
    id: "ORD-001",
    customer: { name: "John Smith", email: "john@example.com", phone: "+639123456789" },
    items: [{ productId: "P-001", name: "Oyster Mushrooms", quantity: 2, price: 150, total: 300 }],
    total: 300,
    status: "PENDING",
    date: "2024-01-20",
    timeline: [{ status: "PENDING", date: "2024-01-20T10:00:00Z", note: "Order placed" }],
    shippingAddress: { street: "123 Main St", city: "Manila" },
  },
  "ORD-002": {
    id: "ORD-002",
    customer: { name: "Alice Brown", email: "alice@example.com", phone: "+639987654321" },
    items: [{ productId: "P-002", name: "Shiitake", quantity: 3, price: 150, total: 450 }],
    total: 450,
    status: "DELIVERED",
    date: "2024-01-19",
    timeline: [
      { status: "PENDING", date: "2024-01-19T08:00:00Z", note: "Order placed" },
      { status: "PROCESSING", date: "2024-01-19T09:00:00Z", note: "Processing" },
      { status: "DELIVERED", date: "2024-01-19T15:00:00Z", note: "Delivered" },
    ],
    shippingAddress: { street: "456 Oak Ave", city: "Quezon City" },
  },
};

const MOCK_REFUNDS = [
  { id: "REF-001", orderId: "ORD-005", amount: 150, status: "Pending", reason: "Defective", createdAt: "2024-01-20" },
  { id: "REF-002", orderId: "ORD-006", amount: 300, status: "Approved", reason: "Wrong item", createdAt: "2024-01-19" },
  { id: "REF-003", orderId: "ORD-007", amount: 200, status: "Pending", reason: "Late delivery", createdAt: "2024-01-18" },
];

const MOCK_NOTIFICATIONS = [
  { id: "notif-1", type: "order", message: "New order received", read: false, createdAt: "2024-01-20" },
  { id: "notif-2", type: "stock", message: "Low stock alert", read: true, createdAt: "2024-01-19" },
];

const MOCK_ADDRESSES = [
  { id: "addr-1", label: "Store", street: "123 Main St", city: "Manila", province: "Metro Manila", postalCode: "1000", country: "Philippines", isDefault: true },
  { id: "addr-2", label: "Warehouse", street: "456 Oak Ave", city: "Quezon City", province: "Metro Manila", postalCode: "1100", country: "Philippines", isDefault: false },
];

// ─── URL-Routing Fetch Mock ────────────────────────────────────────────────

function mockResponse(data: any, ok = true) {
  return Promise.resolve({
    ok,
    status: ok ? 200 : 404,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers(),
  });
}

function createFetchMock() {
  return jest.fn(async (url: string, init?: RequestInit) => {
    const method = (init?.method || "GET").toUpperCase();
    const [path, queryString] = url.split("?");
    const params = new URLSearchParams(queryString || "");
    let body: any = {};
    try {
      body = init?.body ? JSON.parse(init.body as string) : {};
    } catch {
      /* empty */
    }

    // ── Dashboard ───────────────────────────────
    if (path === "/api/seller/dashboard" && method === "GET") {
      return mockResponse({ success: true, data: MOCK_DASHBOARD_STATS });
    }

    // ── Sales Data ──────────────────────────────
    if (path === "/api/seller/sales-data" && method === "GET") {
      return mockResponse({ success: true, data: MOCK_SALES_DATA });
    }

    // ── Product Performance ─────────────────────
    if (path.startsWith("/api/seller/products/top-performing") && method === "GET") {
      return mockResponse({ success: true, data: MOCK_PRODUCT_PERFORMANCE });
    }

    // ── Products / Inventory ────────────────────
    if (path === "/api/seller/inventory" && method === "GET") {
      const id = params.get("id");
      if (id) {
        const product = MOCK_PRODUCTS.find((p) => p.id === id) || null;
        return mockResponse({ success: true, data: product });
      }

      let filtered = [...MOCK_PRODUCTS];
      const search = params.get("search");
      if (search) {
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
      }

      const page = parseInt(params.get("page") || "1");
      const limit = parseInt(params.get("limit") || "100");
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      return mockResponse({
        success: true,
        data: paginated,
        pagination: { page, limit, total: filtered.length },
      });
    }

    // ── Update Product ──────────────────────────
    if (path.match(/^\/api\/seller\/products\/[\w-]+$/) && method === "PUT") {
      const productId = path.split("/").pop()!;
      const today = new Date().toISOString().split("T")[0];
      const existing = MOCK_PRODUCTS.find((p) => p.id === productId) || { id: productId };
      return mockResponse({
        success: true,
        data: { ...existing, ...body, id: productId, updatedAt: today },
      });
    }

    // ── Delete Product ──────────────────────────
    if (path.match(/^\/api\/seller\/products\/[\w-]+$/) && method === "DELETE") {
      return mockResponse({ success: true, data: true });
    }

    // ── Order Status Update ─────────────────────
    if (path.match(/^\/api\/seller\/orders\/[\w-]+\/status$/) && method === "PATCH") {
      const orderId = path.split("/")[4];
      const detail = MOCK_ORDER_DETAILS[orderId];
      if (!detail) {
        return mockResponse({ success: false, message: "Order not found" }, false);
      }
      const newStatus = body.status;
      return mockResponse({
        success: true,
        data: {
          ...detail,
          status: newStatus,
          timeline: [
            ...detail.timeline,
            { status: newStatus, date: new Date().toISOString(), note: `Status updated to ${newStatus}` },
          ],
        },
      });
    }

    // ── Order Detail ────────────────────────────
    if (path.match(/^\/api\/seller\/orders\/[\w-]+$/) && method === "GET") {
      const orderId = path.split("/").pop()!;
      const detail = MOCK_ORDER_DETAILS[orderId];
      if (!detail) {
        return mockResponse({ success: false, message: "Order not found" }, false);
      }
      return mockResponse({ success: true, data: detail });
    }

    // ── Orders List ─────────────────────────────
    if (path === "/api/seller/orders" && method === "GET") {
      let filtered = [...MOCK_ORDERS];
      const status = params.get("status");
      const search = params.get("search");

      if (status) {
        filtered = filtered.filter((o) => o.status === status);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (o) => o.customer.toLowerCase().includes(s) || o.id.toLowerCase().includes(s)
        );
      }

      const page = parseInt(params.get("page") || "1");
      const limit = parseInt(params.get("limit") || "100");
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      return mockResponse({
        success: true,
        data: paginated,
        pagination: { page, limit, total: filtered.length },
      });
    }

    // ── Refunds ─────────────────────────────────
    if (path === "/api/seller/refunds" && method === "GET") {
      let filtered = [...MOCK_REFUNDS];
      const status = params.get("status");
      const search = params.get("search");

      if (status) {
        filtered = filtered.filter((r) => r.status === status);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (r) => r.reason.toLowerCase().includes(s) || r.orderId.toLowerCase().includes(s)
        );
      }

      const page = parseInt(params.get("page") || "1");
      const limit = parseInt(params.get("limit") || "100");
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      return mockResponse({
        success: true,
        data: paginated,
        pagination: { page, limit, total: filtered.length },
      });
    }

    // ── Notifications ───────────────────────────
    if (path === "/api/seller/notifications" && method === "GET") {
      return mockResponse({ success: true, data: MOCK_NOTIFICATIONS });
    }
    if (path === "/api/seller/notifications" && method === "POST") {
      return mockResponse({ success: true, data: true });
    }

    // ── Addresses ───────────────────────────────
    if (path === "/api/seller/addresses" && method === "GET") {
      return mockResponse({ success: true, data: MOCK_ADDRESSES });
    }
    if (path === "/api/seller/addresses" && method === "POST") {
      return mockResponse({ success: true, data: { id: `addr-${Date.now()}`, ...body } });
    }
    if (path === "/api/seller/addresses" && method === "PUT") {
      const addrId = body.id;
      const existing = MOCK_ADDRESSES.find((a) => a.id === addrId);
      if (!existing) {
        return mockResponse({ success: false, message: "Address not found" }, false);
      }
      return mockResponse({ success: true, data: { ...existing, ...body } });
    }
    if (path === "/api/seller/addresses" && method === "DELETE") {
      return mockResponse({ success: true, data: true });
    }

    // ── Fallback ────────────────────────────────
    return mockResponse({ success: false, message: "Not found" }, false);
  });
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("SellerApi", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    global.fetch = createFetchMock() as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ─── getDashboardStats ───────────────────────────────────────────────

  describe("getDashboardStats", () => {
    it("returns dashboard statistics", async () => {
      const result = await SellerApi.getDashboardStats();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("contains required stat fields", async () => {
      const result = await SellerApi.getDashboardStats();
      const stats = result.data!;
      expect(stats).toHaveProperty("totalRevenue");
      expect(stats).toHaveProperty("totalOrders");
      expect(stats).toHaveProperty("totalProducts");
      expect(stats).toHaveProperty("totalSales");
      expect(stats).toHaveProperty("salesGrowth");
    });

    it("returns numeric values for stats", async () => {
      const result = await SellerApi.getDashboardStats();
      const stats = result.data!;
      expect(typeof stats.totalRevenue).toBe("number");
      expect(typeof stats.totalOrders).toBe("number");
      expect(typeof stats.totalProducts).toBe("number");
    });
  });

  // ─── getSalesData ────────────────────────────────────────────────────

  describe("getSalesData", () => {
    it("returns sales data array", async () => {
      const result = await SellerApi.getSalesData();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("returns 7 days of sales data", async () => {
      const result = await SellerApi.getSalesData();
      expect(result.data).toHaveLength(7);
    });

    it("each day has name, sales and revenue", async () => {
      const result = await SellerApi.getSalesData();
      result.data!.forEach((day) => {
        expect(day).toHaveProperty("name");
        expect(day).toHaveProperty("sales");
        expect(day).toHaveProperty("revenue");
        expect(typeof day.revenue).toBe("number");
      });
    });
  });

  // ─── getProductPerformance ───────────────────────────────────────────

  describe("getProductPerformance", () => {
    it("returns product performance data", async () => {
      const result = await SellerApi.getProductPerformance();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("each product has name and sales metrics", async () => {
      const result = await SellerApi.getProductPerformance();
      result.data!.forEach((product) => {
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("sales");
        expect(product).toHaveProperty("revenue");
      });
    });
  });

  // ─── getProducts ─────────────────────────────────────────────────────

  describe("getProducts", () => {
    it("returns products with pagination", async () => {
      const result = await SellerApi.getProducts();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("returns pagination metadata", async () => {
      const result = await SellerApi.getProducts();
      expect(result.pagination).toBeDefined();
      expect(result.pagination).toHaveProperty("page");
      expect(result.pagination).toHaveProperty("total");
    });

    it("filters products by search term", async () => {
      const result = await SellerApi.getProducts({ search: "Oyster" });
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("paginates products correctly", async () => {
      const result = await SellerApi.getProducts({ page: 1, limit: 1 });
      expect(result.success).toBe(true);
      expect(result.data!.length).toBeLessThanOrEqual(1);
    });

    it("returns empty page when beyond range", async () => {
      const result = await SellerApi.getProducts({ page: 999, limit: 10 });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  // ─── getProductById ──────────────────────────────────────────────────

  describe("getProductById", () => {
    it("returns product when found", async () => {
      const list = await SellerApi.getProducts();
      const firstId = list.data![0]?.id;
      if (firstId) {
        const result = await SellerApi.getProductById(firstId);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.id).toBe(firstId);
      }
    });

    it("returns null for unknown product ID", async () => {
      const result = await SellerApi.getProductById("NONEXISTENT-ID");
      expect(result.data).toBeNull();
    });
  });

  // ─── getOrders ───────────────────────────────────────────────────────

  describe("getOrders", () => {
    it("returns all orders when no params given", async () => {
      const result = await SellerApi.getOrders();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data!.length).toBeGreaterThan(0);
    });

    it("returns pagination metadata", async () => {
      const result = await SellerApi.getOrders();
      expect(result.pagination).toBeDefined();
      expect(result.pagination!.page).toBe(1);
      expect(result.pagination!.total).toBeGreaterThan(0);
    });

    it("filters orders by status", async () => {
      const result = await SellerApi.getOrders({ status: "PENDING" });
      expect(result.success).toBe(true);
      result.data!.forEach((order) => {
        expect(order.status).toBe("PENDING");
      });
    });

    it("filters orders by search (customer name)", async () => {
      const result = await SellerApi.getOrders({ search: "John" });
      expect(result.success).toBe(true);
      result.data!.forEach((order) => {
        const matchesName = order.customer.toLowerCase().includes("john");
        const matchesId = order.id.toLowerCase().includes("john");
        expect(matchesName || matchesId).toBe(true);
      });
    });

    it("filters orders by search (order ID)", async () => {
      const result = await SellerApi.getOrders({ search: "ORD-001" });
      expect(result.success).toBe(true);
      expect(result.data!.length).toBeGreaterThan(0);
    });

    it("paginates orders", async () => {
      const result = await SellerApi.getOrders({ page: 1, limit: 2 });
      expect(result.data!.length).toBeLessThanOrEqual(2);
      expect(result.pagination!.page).toBe(1);
    });

    it("returns empty page for out-of-range page", async () => {
      const result = await SellerApi.getOrders({ page: 999, limit: 10 });
      expect(result.data).toHaveLength(0);
    });

    it("combines status and search filters", async () => {
      const result = await SellerApi.getOrders({
        status: "DELIVERED",
        search: "Alice",
      });
      expect(result.success).toBe(true);
      result.data!.forEach((order) => {
        expect(order.status).toBe("DELIVERED");
      });
    });
  });

  // ─── getOrderById ────────────────────────────────────────────────────

  describe("getOrderById", () => {
    it("returns order detail for existing order", async () => {
      const result = await SellerApi.getOrderById("ORD-001");
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBe("ORD-001");
    });

    it("returns customer info in order detail", async () => {
      const result = await SellerApi.getOrderById("ORD-001");
      expect(result.data!.customer).toBeDefined();
      expect(result.data!.customer.name).toBeTruthy();
      expect(result.data!.customer.email).toBeTruthy();
    });

    it("returns items in order detail", async () => {
      const result = await SellerApi.getOrderById("ORD-001");
      expect(Array.isArray(result.data!.items)).toBe(true);
      expect(result.data!.items.length).toBeGreaterThan(0);
    });

    it("returns timeline in order detail", async () => {
      const result = await SellerApi.getOrderById("ORD-001");
      expect(Array.isArray(result.data!.timeline)).toBe(true);
      expect(result.data!.timeline.length).toBeGreaterThan(0);
    });

    it("throws for unknown order ID", async () => {
      await expect(SellerApi.getOrderById("NONEXISTENT")).rejects.toThrow();
    });
  });

  // ─── updateOrderStatus ──────────────────────────────────────────────

  describe("updateOrderStatus", () => {
    it("updates status for existing order", async () => {
      const result = await SellerApi.updateOrderStatus("ORD-001", "CONFIRMED");
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.status).toBe("CONFIRMED");
    });

    it("adds timeline entry on status update", async () => {
      const result = await SellerApi.updateOrderStatus("ORD-002", "PROCESSING");
      const lastEntry = result.data!.timeline[result.data!.timeline.length - 1];
      expect(lastEntry.status).toBe("PROCESSING");
    });

    it("throws for unknown order", async () => {
      await expect(
        SellerApi.updateOrderStatus("NONEXISTENT", "CONFIRMED")
      ).rejects.toThrow();
    });
  });

  // ─── getRefunds ─────────────────────────────────────────────────────

  describe("getRefunds", () => {
    it("returns refunds list", async () => {
      const result = await SellerApi.getRefunds();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("returns pagination metadata", async () => {
      const result = await SellerApi.getRefunds();
      expect(result.pagination).toBeDefined();
      expect(result.pagination!.page).toBe(1);
    });

    it("filters refunds by status", async () => {
      const result = await SellerApi.getRefunds({ status: "Pending" });
      expect(result.success).toBe(true);
    });

    it("filters refunds by search", async () => {
      const result = await SellerApi.getRefunds({ search: "nonexistent" });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it("paginates refunds", async () => {
      const result = await SellerApi.getRefunds({ page: 1, limit: 1 });
      expect(result.data!.length).toBeLessThanOrEqual(1);
    });
  });

  // ─── getNotifications ───────────────────────────────────────────────

  describe("getNotifications", () => {
    it("returns notifications array", async () => {
      const result = await SellerApi.getNotifications();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  // ─── markNotificationAsRead ─────────────────────────────────────────

  describe("markNotificationAsRead", () => {
    it("returns success for valid notification", async () => {
      const result = await SellerApi.markNotificationAsRead("notif-1");
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });

  // ─── getAddresses ───────────────────────────────────────────────────

  describe("getAddresses", () => {
    it("returns addresses list", async () => {
      const result = await SellerApi.getAddresses();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  // ─── createAddress ──────────────────────────────────────────────────

  describe("createAddress", () => {
    it("creates a new address and returns it with an ID", async () => {
      const newAddr = {
        label: "Warehouse",
        street: "123 Test St",
        city: "Manila",
        province: "Metro Manila",
        postalCode: "1000",
        country: "Philippines",
        isDefault: false,
      };
      const result = await SellerApi.createAddress(newAddr as any);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBeTruthy();
    });
  });

  // ─── updateAddress ──────────────────────────────────────────────────

  describe("updateAddress", () => {
    it("updates an existing address", async () => {
      const list = await SellerApi.getAddresses();
      const firstId = list.data![0]?.id;
      if (firstId) {
        const result = await SellerApi.updateAddress(firstId, {
          city: "Cebu",
        } as any);
        expect(result.success).toBe(true);
      }
    });

    it("throws for unknown address ID", async () => {
      await expect(
        SellerApi.updateAddress("UNKNOWN-ID", { city: "Cebu" } as any)
      ).rejects.toThrow();
    });
  });

  // ─── deleteAddress ──────────────────────────────────────────────────

  describe("deleteAddress", () => {
    it("returns success", async () => {
      const result = await SellerApi.deleteAddress("addr-1");
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });

  // ─── updateProduct ──────────────────────────────────────────────────

  describe("updateProduct", () => {
    it("returns updated product with correct ID", async () => {
      const result = await SellerApi.updateProduct("P-001", {
        name: "Updated Name",
      });
      expect(result.success).toBe(true);
      expect(result.data!.id).toBe("P-001");
      expect(result.data!.name).toBe("Updated Name");
    });

    it("applies partial updates correctly", async () => {
      const result = await SellerApi.updateProduct("P-002", {
        price: 999,
        stock: 50,
      });
      expect(result.data!.price).toBe(999);
      expect(result.data!.stock).toBe(50);
    });

    it("sets updatedAt to today", async () => {
      const result = await SellerApi.updateProduct("P-001", { name: "X" });
      const today = new Date().toISOString().split("T")[0];
      expect(result.data!.updatedAt).toBe(today);
    });
  });

  // ─── deleteProduct ──────────────────────────────────────────────────

  describe("deleteProduct", () => {
    it("returns success for any product ID", async () => {
      const result = await SellerApi.deleteProduct("P-001");
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });
});
