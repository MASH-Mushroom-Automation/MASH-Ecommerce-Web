/**
 * Tests for src/lib/analytics.ts
 * Covers: GA availability checks, initGA, logPageView, logEvent,
 * logEcommerceEvent, and all convenience trackers (product view, add/remove cart,
 * purchase, search, button click)
 */

// Mock react-ga4
const mockInitialize = jest.fn();
const mockSend = jest.fn();
const mockEvent = jest.fn();

jest.mock("react-ga4", () => ({
  __esModule: true,
  default: {
    initialize: mockInitialize,
    send: mockSend,
    event: mockEvent,
  },
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

import {
  initGA,
  logPageView,
  logEvent,
  logEcommerceEvent,
  trackProductView,
  trackAddToCart,
  trackRemoveFromCart,
  trackPurchase,
  trackSearch,
  trackButtonClick,
} from "../analytics";

const originalEnv = { ...process.env };

beforeEach(() => {
  mockInitialize.mockReset();
  mockSend.mockReset();
  mockEvent.mockReset();
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("analytics", () => {
  describe("GA availability (isGAEnabled)", () => {
    it("does not initialize when no measurement ID set", () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      initGA();
      // react-ga4 initialize should not be called synchronously
      // but the function should return early
      expect(mockInitialize).not.toHaveBeenCalled();
    });

    it("does not initialize when measurement ID does not start with G-", () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "UA-123456";
      initGA();
      expect(mockInitialize).not.toHaveBeenCalled();
    });

    it("initializes when valid G- measurement ID is set", async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TESTID123";
      initGA();

      // Dynamic import resolves async, wait a tick
      await new Promise((r) => setTimeout(r, 10));
      expect(mockInitialize).toHaveBeenCalledWith("G-TESTID123");
    });
  });

  describe("logPageView", () => {
    it("does nothing when GA is not enabled", () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      logPageView("/home");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("sends pageview hit when GA is enabled", async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
      logPageView("/products");

      await new Promise((r) => setTimeout(r, 10));
      expect(mockSend).toHaveBeenCalledWith({
        hitType: "pageview",
        page: "/products",
      });
    });
  });

  describe("logEvent", () => {
    it("does nothing when GA is not enabled", () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      logEvent({ category: "Test", action: "click" });
      expect(mockEvent).not.toHaveBeenCalled();
    });

    it("sends event with all fields when GA is enabled", async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
      logEvent({
        category: "Button",
        action: "click",
        label: "Add to Cart",
        value: 42,
      });

      await new Promise((r) => setTimeout(r, 10));
      expect(mockEvent).toHaveBeenCalledWith({
        category: "Button",
        action: "click",
        label: "Add to Cart",
        value: 42,
      });
    });

    it("sends event without optional fields", async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
      logEvent({ category: "Nav", action: "navigate" });

      await new Promise((r) => setTimeout(r, 10));
      expect(mockEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "Nav",
          action: "navigate",
        })
      );
    });
  });

  describe("logEcommerceEvent", () => {
    it("does nothing when GA is not enabled", () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      logEcommerceEvent("view_item", {
        currency: "PHP",
        value: 100,
        items: [],
      });
      expect(mockEvent).not.toHaveBeenCalled();
    });

    it("sends ecommerce event with params when GA is enabled", async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
      const params = {
        currency: "PHP",
        value: 250,
        items: [
          { item_id: "p1", item_name: "Oyster Mushroom", price: 250, quantity: 1 },
        ],
      };

      logEcommerceEvent("view_item", params);

      await new Promise((r) => setTimeout(r, 10));
      expect(mockEvent).toHaveBeenCalledWith("view_item", params);
    });
  });

  describe("trackProductView", () => {
    it("sends view_item event with PHP currency", async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
      trackProductView({
        id: "prod-1",
        name: "Shiitake Mushroom",
        price: 199,
        category: "Premium",
      });

      await new Promise((r) => setTimeout(r, 10));
      expect(mockEvent).toHaveBeenCalledWith("view_item", {
        currency: "PHP",
        value: 199,
        items: [
          {
            item_id: "prod-1",
            item_name: "Shiitake Mushroom",
            price: 199,
            quantity: 1,
            item_category: "Premium",
          },
        ],
      });
    });

    it("works without category", async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
      trackProductView({ id: "p2", name: "Lion's Mane", price: 350 });

      await new Promise((r) => setTimeout(r, 10));
      expect(mockEvent).toHaveBeenCalledWith(
        "view_item",
        expect.objectContaining({
          value: 350,
        })
      );
    });
  });

  describe("trackAddToCart", () => {
    it("sends add_to_cart with quantity multiplied value", async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
      trackAddToCart({
        id: "prod-3",
        name: "Enoki",
        price: 120,
        quantity: 3,
        category: "Budget",
      });

      await new Promise((r) => setTimeout(r, 10));
      expect(mockEvent).toHaveBeenCalledWith("add_to_cart", {
        currency: "PHP",
        value: 360,
        items: [
          {
            item_id: "prod-3",
            item_name: "Enoki",
            price: 120,
            quantity: 3,
            item_category: "Budget",
          },
        ],
      });
    });

    it("defaults to quantity 1 when not specified", async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
      trackAddToCart({ id: "p1", name: "Maitake", price: 200 });

      await new Promise((r) => setTimeout(r, 10));
      expect(mockEvent).toHaveBeenCalledWith(
        "add_to_cart",
        expect.objectContaining({ value: 200 })
      );
    });
  });

  describe("trackRemoveFromCart", () => {
    it("sends remove_from_cart event", async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
      trackRemoveFromCart({
        id: "p5",
        name: "King Oyster",
        price: 280,
        quantity: 2,
      });

      await new Promise((r) => setTimeout(r, 10));
      expect(mockEvent).toHaveBeenCalledWith("remove_from_cart", {
        currency: "PHP",
        value: 560,
        items: [
          {
            item_id: "p5",
            item_name: "King Oyster",
            price: 280,
            quantity: 2,
          },
        ],
      });
    });

    it("defaults to quantity 1 when not specified", async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
      trackRemoveFromCart({ id: "p1", name: "Test", price: 100 });

      await new Promise((r) => setTimeout(r, 10));
      expect(mockEvent).toHaveBeenCalledWith(
        "remove_from_cart",
        expect.objectContaining({ value: 100 })
      );
    });
  });

  describe("trackPurchase", () => {
    it("sends purchase event with transaction_id", async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
      trackPurchase({
        transactionId: "ORD-001",
        value: 999,
        items: [
          { item_id: "p1", item_name: "Shiitake", price: 499, quantity: 1 },
          { item_id: "p2", item_name: "Oyster", price: 500, quantity: 1 },
        ],
      });

      await new Promise((r) => setTimeout(r, 10));
      expect(mockEvent).toHaveBeenCalledWith("purchase", {
        currency: "PHP",
        value: 999,
        items: expect.arrayContaining([
          expect.objectContaining({ item_id: "p1" }),
          expect.objectContaining({ item_id: "p2" }),
        ]),
        transaction_id: "ORD-001",
      });
    });
  });

  describe("trackSearch", () => {
    it("sends search event with search term as label", async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
      trackSearch("mushroom kit");

      await new Promise((r) => setTimeout(r, 10));
      expect(mockEvent).toHaveBeenCalledWith({
        category: "Search",
        action: "search",
        label: "mushroom kit",
      });
    });
  });

  describe("trackButtonClick", () => {
    it("sends button click event with name and location", async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
      trackButtonClick("Buy Now", "Product Detail");

      await new Promise((r) => setTimeout(r, 10));
      expect(mockEvent).toHaveBeenCalledWith({
        category: "Button",
        action: "click",
        label: "Buy Now - Product Detail",
      });
    });
  });
});
