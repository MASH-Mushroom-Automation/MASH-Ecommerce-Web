/**
 * Tests for src/lib/api/seller.ts
 * SellerApi - seller dashboard operations (mock data)
 * Uses real timers (delays are 100-500ms) for parallel-execution reliability.
 */
import { SellerApi } from "../seller";

// Mock dynamic import of sanity products
jest.mock("@/lib/sanity/products", () => ({
  fetchSellerProducts: jest.fn(),
}));

describe("SellerApi", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
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

    it("returns null for unknown order ID", async () => {
      const result = await SellerApi.getOrderById("NONEXISTENT");
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
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

    it("returns error for unknown order", async () => {
      const result = await SellerApi.updateOrderStatus(
        "NONEXISTENT",
        "CONFIRMED"
      );
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
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

    it("returns failure for unknown address ID", async () => {
      const result = await SellerApi.updateAddress("UNKNOWN-ID", {
        city: "Cebu",
      } as any);
      expect(result.success).toBe(false);
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
