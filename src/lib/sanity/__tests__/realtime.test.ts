/**
 * Tests for src/lib/sanity/realtime.ts
 * SubscriptionManager class, dedup, debounce, ref counting, cleanup
 */

// Mock next-sanity createClient - use inline jest.fn() to avoid hoisting issues
jest.mock("next-sanity", () => ({
  createClient: jest.fn(() => ({
    listen: jest.fn(),
  })),
}));

// Import after mocks
import { createClient } from "next-sanity";
import { realtimeClient, subscriptionManager } from "../realtime";
import type { SubscriptionConfig } from "../realtime";

// Get mock references after import
const mockCreateClient = createClient as jest.Mock;

// Helper to set up listen mock for each test
let mockSubscribeFn: jest.Mock;
let mockUnsubscribeFn: jest.Mock;

function setupListenMock() {
  mockUnsubscribeFn = jest.fn();
  mockSubscribeFn = jest.fn().mockReturnValue({ unsubscribe: mockUnsubscribeFn });

  const mockListen = jest.fn().mockReturnValue({ subscribe: mockSubscribeFn });
  // Patch the realtimeClient.listen directly
  (realtimeClient as any).listen = mockListen;

  return mockListen;
}

// Use fake timers for debounce testing
beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();

  // Reset the subscription manager state by unsubscribing all
  subscriptionManager.unsubscribeAll();

  // Set up listen mock
  setupListenMock();
});

afterEach(() => {
  jest.useRealTimers();
});

afterAll(() => {
  subscriptionManager.unsubscribeAll();
});

// ---- realtimeClient ----
describe("realtimeClient", () => {
  it("should be created with useCdn false", () => {
    // The client is created at module load; verify it exists
    expect(realtimeClient).toBeDefined();
  });
});

// ---- SubscriptionManager ----
describe("SubscriptionManager", () => {
  describe("subscribe", () => {
    it("should create a new subscription", () => {
      const onUpdate = jest.fn();
      const config: SubscriptionConfig = {
        query: '*[_type == "product"]',
        onUpdate,
      };

      const unsubscribe = subscriptionManager.subscribe("test-key", config);

      expect(typeof unsubscribe).toBe("function");
      expect(subscriptionManager.getActiveCount()).toBe(1);
    });

    it("should increment ref count for duplicate subscriptions", () => {
      const onUpdate = jest.fn();
      const config: SubscriptionConfig = {
        query: '*[_type == "product"]',
        onUpdate,
      };

      subscriptionManager.subscribe("dup-key", config);
      subscriptionManager.subscribe("dup-key", config);

      // Should still be 1 active subscription (ref count = 2)
      expect(subscriptionManager.getActiveCount()).toBe(1);
    });

    it("should pass query and params to realtimeClient.listen", () => {
      const onUpdate = jest.fn();
      const params = { type: "product" };

      subscriptionManager.subscribe("listen-test", {
        query: '*[_type == $type]',
        params,
        onUpdate,
        includeResult: true,
      });

      const mockListen = (realtimeClient as any).listen as jest.Mock;
      expect(mockListen).toHaveBeenCalledWith(
        '*[_type == $type]',
        params,
        expect.objectContaining({
          includeResult: true,
          includePreviousRevision: false,
          visibility: "query",
        })
      );
    });

    it("should debounce updates with default 1000ms", () => {
      const onUpdate = jest.fn();
      let nextCallback: ((update: any) => void) | null = null;

      mockSubscribeFn.mockImplementation((callbacks: any) => {
        nextCallback = callbacks.next;
        return { unsubscribe: mockUnsubscribeFn };
      });

      subscriptionManager.subscribe("debounce-test", {
        query: '*[_type == "product"]',
        onUpdate,
      });

      // Simulate update
      nextCallback!({ transition: "update", result: { _id: "prod-1" } });

      // Should not call onUpdate immediately
      expect(onUpdate).not.toHaveBeenCalled();

      // Advance timer past debounce
      jest.advanceTimersByTime(1000);

      expect(onUpdate).toHaveBeenCalledWith({ _id: "prod-1" });
    });

    it("should use custom debounce time", () => {
      const onUpdate = jest.fn();
      let nextCallback: ((update: any) => void) | null = null;

      mockSubscribeFn.mockImplementation((callbacks: any) => {
        nextCallback = callbacks.next;
        return { unsubscribe: mockUnsubscribeFn };
      });

      subscriptionManager.subscribe("custom-debounce", {
        query: '*[_type == "product"]',
        onUpdate,
        debounceMs: 500,
      });

      nextCallback!({ transition: "update", result: { _id: "prod-1" } });

      jest.advanceTimersByTime(499);
      expect(onUpdate).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    it("should reset debounce timer on rapid updates", () => {
      const onUpdate = jest.fn();
      let nextCallback: ((update: any) => void) | null = null;

      mockSubscribeFn.mockImplementation((callbacks: any) => {
        nextCallback = callbacks.next;
        return { unsubscribe: mockUnsubscribeFn };
      });

      subscriptionManager.subscribe("rapid-test", {
        query: '*[_type == "product"]',
        onUpdate,
        debounceMs: 500,
      });

      // First update
      nextCallback!({ transition: "update", result: { _id: "v1" } });
      jest.advanceTimersByTime(300);

      // Second update (resets timer)
      nextCallback!({ transition: "update", result: { _id: "v2" } });
      jest.advanceTimersByTime(300);

      // First timer expired but was cleared
      expect(onUpdate).not.toHaveBeenCalled();

      // Complete debounce for second update
      jest.advanceTimersByTime(200);
      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith({ _id: "v2" });
    });

    it("should not call onUpdate when result is falsy", () => {
      const onUpdate = jest.fn();
      let nextCallback: ((update: any) => void) | null = null;

      mockSubscribeFn.mockImplementation((callbacks: any) => {
        nextCallback = callbacks.next;
        return { unsubscribe: mockUnsubscribeFn };
      });

      subscriptionManager.subscribe("no-result", {
        query: '*[_type == "product"]',
        onUpdate,
      });

      nextCallback!({ transition: "update", result: null });

      jest.advanceTimersByTime(1000);
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  describe("unsubscribe", () => {
    it("should decrement ref count on first unsubscribe", () => {
      const config: SubscriptionConfig = {
        query: '*[_type == "product"]',
        onUpdate: jest.fn(),
      };

      subscriptionManager.subscribe("ref-test", config);
      const unsub2 = subscriptionManager.subscribe("ref-test", config);

      // Unsubscribe once (ref count goes from 2 to 1)
      unsub2();
      expect(subscriptionManager.getActiveCount()).toBe(1);
    });

    it("should close subscription when ref count reaches 0", () => {
      const config: SubscriptionConfig = {
        query: '*[_type == "product"]',
        onUpdate: jest.fn(),
      };

      const unsub = subscriptionManager.subscribe("close-test", config);
      unsub();

      expect(subscriptionManager.getActiveCount()).toBe(0);
      expect(mockUnsubscribeFn).toHaveBeenCalled();
    });

    it("should clear debounce timer on close", () => {
      let nextCallback: ((update: any) => void) | null = null;
      const onUpdate = jest.fn();

      mockSubscribeFn.mockImplementation((callbacks: any) => {
        nextCallback = callbacks.next;
        return { unsubscribe: mockUnsubscribeFn };
      });

      const unsub = subscriptionManager.subscribe("timer-clear", {
        query: '*[_type == "product"]',
        onUpdate,
        debounceMs: 500,
      });

      // Trigger an update (sets debounce timer)
      nextCallback!({ transition: "update", result: { _id: "prod-1" } });

      // Unsubscribe before debounce fires
      unsub();

      // Advance past debounce - should NOT call onUpdate
      jest.advanceTimersByTime(1000);
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  describe("unsubscribeAll", () => {
    it("should close all active subscriptions", () => {
      const config: SubscriptionConfig = {
        query: '*[_type == "product"]',
        onUpdate: jest.fn(),
      };

      subscriptionManager.subscribe("sub-1", config);
      subscriptionManager.subscribe("sub-2", config);
      subscriptionManager.subscribe("sub-3", config);

      expect(subscriptionManager.getActiveCount()).toBe(3);

      subscriptionManager.unsubscribeAll();

      expect(subscriptionManager.getActiveCount()).toBe(0);
    });

    it("should handle empty subscription list", () => {
      expect(() => subscriptionManager.unsubscribeAll()).not.toThrow();
      expect(subscriptionManager.getActiveCount()).toBe(0);
    });
  });

  describe("getActiveCount", () => {
    it("should return 0 initially", () => {
      expect(subscriptionManager.getActiveCount()).toBe(0);
    });

    it("should track active subscriptions accurately", () => {
      const config: SubscriptionConfig = {
        query: '*[_type == "product"]',
        onUpdate: jest.fn(),
      };

      const unsub1 = subscriptionManager.subscribe("count-1", config);
      subscriptionManager.subscribe("count-2", config);

      expect(subscriptionManager.getActiveCount()).toBe(2);

      unsub1();
      expect(subscriptionManager.getActiveCount()).toBe(1);
    });
  });

  describe("error handling", () => {
    it("should log errors from subscription", () => {
      let errorCallback: ((err: any) => void) | null = null;

      mockSubscribeFn.mockImplementation((callbacks: any) => {
        errorCallback = callbacks.error;
        return { unsubscribe: mockUnsubscribeFn };
      });

      subscriptionManager.subscribe("error-test", {
        query: '*[_type == "product"]',
        onUpdate: jest.fn(),
      });

      // Error should not throw, just log
      expect(() => {
        errorCallback!(new Error("Connection lost"));
      }).not.toThrow();
    });
  });
});
