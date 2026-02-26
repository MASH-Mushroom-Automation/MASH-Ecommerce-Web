/**
 * Tests for src/hooks/useWebSocket.ts
 *
 * Hooks:  useWebSocket, useWebSocketEvent, useDeviceSensorData,
 *         useRealtimeNotifications, useOrderStatusUpdates,
 *         useDeviceStatus, useSystemAlerts
 *
 * Uses getWebSocketClient() singleton from @/lib/websocket/client.
 * WebSocket client exposes: on(), connect(), isConnected(), send(),
 * joinRoom(), leaveRoom(). All hooks compose via useWebSocketEvent.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// ─── WebSocket Client Mock ───────────────────────────────────

type EventHandler = (...args: any[]) => void;
const eventHandlers: Record<string, EventHandler[]> = {};

const mockWsClient = {
  on: jest.fn((event: string, handler: EventHandler) => {
    if (!eventHandlers[event]) eventHandlers[event] = [];
    eventHandlers[event].push(handler);
    // Return unsubscribe function
    return jest.fn(() => {
      const idx = eventHandlers[event]?.indexOf(handler);
      if (idx !== undefined && idx >= 0) eventHandlers[event].splice(idx, 1);
    });
  }),
  connect: jest.fn(),
  isConnected: jest.fn(() => false),
  send: jest.fn(),
  joinRoom: jest.fn(),
  leaveRoom: jest.fn(),
};

jest.mock("@/lib/websocket/client", () => ({
  getWebSocketClient: () => mockWsClient,
}));

import {
  useWebSocket,
  useWebSocketEvent,
  useDeviceSensorData,
  useRealtimeNotifications,
  useOrderStatusUpdates,
  useDeviceStatus,
  useSystemAlerts,
} from "../useWebSocket";

// ─── Helpers ──────────────────────────────────────────────────

/** Emit an event to all registered handlers */
function emitEvent(event: string, data?: any) {
  eventHandlers[event]?.forEach((handler) => handler(data));
}

// ─── Setup ────────────────────────────────────────────────────

beforeEach(() => {
  mockWsClient.on.mockClear();
  mockWsClient.connect.mockClear();
  mockWsClient.isConnected.mockClear();
  mockWsClient.send.mockClear();
  mockWsClient.joinRoom.mockClear();
  mockWsClient.leaveRoom.mockClear();

  // Reset event handlers
  Object.keys(eventHandlers).forEach((key) => delete eventHandlers[key]);

  // Default: not connected
  mockWsClient.isConnected.mockReturnValue(false);

  // Re-setup on() to capture handlers
  mockWsClient.on.mockImplementation((event: string, handler: EventHandler) => {
    if (!eventHandlers[event]) eventHandlers[event] = [];
    eventHandlers[event].push(handler);
    return jest.fn(() => {
      const idx = eventHandlers[event]?.indexOf(handler);
      if (idx !== undefined && idx >= 0) eventHandlers[event].splice(idx, 1);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// useWebSocket
// ═══════════════════════════════════════════════════════════════

describe("useWebSocket", () => {
  it("starts disconnected and triggers connect", () => {
    renderHook(() => useWebSocket());

    expect(mockWsClient.connect).toHaveBeenCalled();
  });

  it("reports isConnected=true when client already connected", () => {
    mockWsClient.isConnected.mockReturnValue(true);
    const { result } = renderHook(() => useWebSocket());

    expect(result.current.isConnected).toBe(true);
    expect(mockWsClient.connect).not.toHaveBeenCalled();
  });

  it("subscribes to connected/disconnected events", () => {
    renderHook(() => useWebSocket());

    const eventNames = mockWsClient.on.mock.calls.map((c: any[]) => c[0]);
    expect(eventNames).toContain("connected");
    expect(eventNames).toContain("disconnected");
  });

  it("updates isConnected on connected event", () => {
    const { result } = renderHook(() => useWebSocket());

    expect(result.current.isConnected).toBe(false);

    act(() => {
      emitEvent("connected");
    });

    expect(result.current.isConnected).toBe(true);
  });

  it("updates isConnected on disconnected event", () => {
    mockWsClient.isConnected.mockReturnValue(true);
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      emitEvent("disconnected");
    });

    expect(result.current.isConnected).toBe(false);
  });

  it("exposes send function that delegates to ws client", () => {
    const { result } = renderHook(() => useWebSocket());

    result.current.send("test-event", { key: "value" });
    expect(mockWsClient.send).toHaveBeenCalledWith("test-event", { key: "value" });
  });

  it("exposes joinRoom function", () => {
    const { result } = renderHook(() => useWebSocket());

    result.current.joinRoom("room-123");
    expect(mockWsClient.joinRoom).toHaveBeenCalledWith("room-123");
  });

  it("exposes leaveRoom function", () => {
    const { result } = renderHook(() => useWebSocket());

    result.current.leaveRoom("room-123");
    expect(mockWsClient.leaveRoom).toHaveBeenCalledWith("room-123");
  });

  it("exposes ws client reference", () => {
    const { result } = renderHook(() => useWebSocket());

    expect(result.current.ws).toBe(mockWsClient);
  });

  it("unsubscribes on unmount", () => {
    const unsubConnect = jest.fn();
    const unsubDisconnect = jest.fn();
    let callCount = 0;
    mockWsClient.on.mockImplementation((event: string, handler: EventHandler) => {
      if (!eventHandlers[event]) eventHandlers[event] = [];
      eventHandlers[event].push(handler);
      callCount++;
      return callCount === 1 ? unsubConnect : unsubDisconnect;
    });

    const { unmount } = renderHook(() => useWebSocket());
    unmount();

    expect(unsubConnect).toHaveBeenCalled();
    expect(unsubDisconnect).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// useWebSocketEvent
// ═══════════════════════════════════════════════════════════════

describe("useWebSocketEvent", () => {
  it("subscribes to the specified event", () => {
    const handler = jest.fn();
    renderHook(() => useWebSocketEvent("test:event", handler));

    expect(mockWsClient.on).toHaveBeenCalledWith("test:event", handler);
  });

  it("calls handler when event is emitted", () => {
    const handler = jest.fn();
    renderHook(() => useWebSocketEvent("test:event", handler));

    act(() => {
      emitEvent("test:event", { payload: "data" });
    });

    expect(handler).toHaveBeenCalledWith({ payload: "data" });
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = jest.fn();
    mockWsClient.on.mockReturnValueOnce(unsubscribe);

    const handler = jest.fn();
    const { unmount } = renderHook(() => useWebSocketEvent("test:event", handler));
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// useDeviceSensorData
// ═══════════════════════════════════════════════════════════════

describe("useDeviceSensorData", () => {
  it("starts with null sensor data", () => {
    const { result } = renderHook(() => useDeviceSensorData("device-1"));

    expect(result.current.sensorData).toBeNull();
    expect(result.current.lastUpdate).toBeNull();
  });

  it("updates sensor data on matching device event", () => {
    const { result } = renderHook(() => useDeviceSensorData("device-1"));

    const sensorPayload = { deviceId: "device-1", temperature: 25, humidity: 60 };

    act(() => {
      emitEvent("sensor:data", sensorPayload);
    });

    expect(result.current.sensorData).toEqual(sensorPayload);
    expect(result.current.lastUpdate).toBeInstanceOf(Date);
  });

  it("ignores events for different device ID", () => {
    const { result } = renderHook(() => useDeviceSensorData("device-1"));

    act(() => {
      emitEvent("sensor:data", { deviceId: "device-2", temperature: 30 });
    });

    expect(result.current.sensorData).toBeNull();
  });

  it("accepts all events when no deviceId is specified", () => {
    const { result } = renderHook(() => useDeviceSensorData());

    act(() => {
      emitEvent("sensor:data", { deviceId: "any", temperature: 20 });
    });

    expect(result.current.sensorData).toEqual({ deviceId: "any", temperature: 20 });
  });
});

// ═══════════════════════════════════════════════════════════════
// useRealtimeNotifications
// ═══════════════════════════════════════════════════════════════

describe("useRealtimeNotifications", () => {
  it("starts with empty notifications and zero unread", () => {
    const { result } = renderHook(() => useRealtimeNotifications());

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it("adds new notification and increments unread count", () => {
    const { result } = renderHook(() => useRealtimeNotifications());

    act(() => {
      emitEvent("notification:new", { id: "n1", message: "Hello" });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].message).toBe("Hello");
    expect(result.current.unreadCount).toBe(1);
  });

  it("prepends new notifications (most recent first)", () => {
    const { result } = renderHook(() => useRealtimeNotifications());

    act(() => {
      emitEvent("notification:new", { id: "n1", message: "First" });
    });
    act(() => {
      emitEvent("notification:new", { id: "n2", message: "Second" });
    });

    expect(result.current.notifications[0].message).toBe("Second");
    expect(result.current.notifications[1].message).toBe("First");
    expect(result.current.unreadCount).toBe(2);
  });

  it("markAsRead marks notification and decrements unread", () => {
    const { result } = renderHook(() => useRealtimeNotifications());

    act(() => {
      emitEvent("notification:new", { id: "n1", message: "Test" });
    });

    expect(result.current.unreadCount).toBe(1);

    act(() => {
      result.current.markAsRead("n1");
    });

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it("markAsRead does not go below zero", () => {
    const { result } = renderHook(() => useRealtimeNotifications());

    act(() => {
      result.current.markAsRead("nonexistent");
    });

    expect(result.current.unreadCount).toBe(0);
  });

  it("clearAll removes all notifications and resets unread", () => {
    const { result } = renderHook(() => useRealtimeNotifications());

    act(() => {
      emitEvent("notification:new", { id: "n1", message: "A" });
      emitEvent("notification:new", { id: "n2", message: "B" });
    });

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// useOrderStatusUpdates
// ═══════════════════════════════════════════════════════════════

describe("useOrderStatusUpdates", () => {
  it("starts with null order status", () => {
    const { result } = renderHook(() => useOrderStatusUpdates("order-1"));

    expect(result.current).toBeNull();
  });

  it("updates status for matching order", () => {
    const { result } = renderHook(() => useOrderStatusUpdates("order-1"));

    act(() => {
      emitEvent("order:status", { orderId: "order-1", status: "shipped" });
    });

    expect(result.current).toEqual({ orderId: "order-1", status: "shipped" });
  });

  it("ignores events for different order ID", () => {
    const { result } = renderHook(() => useOrderStatusUpdates("order-1"));

    act(() => {
      emitEvent("order:status", { orderId: "order-2", status: "delivered" });
    });

    expect(result.current).toBeNull();
  });

  it("accepts all events when no orderId specified", () => {
    const { result } = renderHook(() => useOrderStatusUpdates());

    act(() => {
      emitEvent("order:status", { orderId: "any", status: "processing" });
    });

    expect(result.current).toEqual({ orderId: "any", status: "processing" });
  });
});

// ═══════════════════════════════════════════════════════════════
// useDeviceStatus
// ═══════════════════════════════════════════════════════════════

describe("useDeviceStatus", () => {
  it("starts with null device status and lastSeen", () => {
    const { result } = renderHook(() => useDeviceStatus("device-1"));

    expect(result.current.deviceStatus).toBeNull();
    expect(result.current.lastSeen).toBeNull();
  });

  it("updates device status for matching device", () => {
    const { result } = renderHook(() => useDeviceStatus("device-1"));

    act(() => {
      emitEvent("device:status", {
        deviceId: "device-1",
        status: "online",
        timestamp: "2025-01-01T00:00:00Z",
      });
    });

    expect(result.current.deviceStatus).toBe("online");
    expect(result.current.lastSeen).toBeInstanceOf(Date);
  });

  it("ignores events for different device ID", () => {
    const { result } = renderHook(() => useDeviceStatus("device-1"));

    act(() => {
      emitEvent("device:status", {
        deviceId: "device-2",
        status: "offline",
        timestamp: "2025-01-01T00:00:00Z",
      });
    });

    expect(result.current.deviceStatus).toBeNull();
  });

  it("accepts all events when no deviceId specified", () => {
    const { result } = renderHook(() => useDeviceStatus());

    act(() => {
      emitEvent("device:status", {
        deviceId: "any",
        status: "offline",
        timestamp: "2025-01-01T00:00:00Z",
      });
    });

    expect(result.current.deviceStatus).toBe("offline");
  });
});

// ═══════════════════════════════════════════════════════════════
// useSystemAlerts
// ═══════════════════════════════════════════════════════════════

describe("useSystemAlerts", () => {
  it("starts with empty alerts", () => {
    const { result } = renderHook(() => useSystemAlerts());

    expect(result.current.alerts).toEqual([]);
  });

  it("adds new alert (prepends)", () => {
    const { result } = renderHook(() => useSystemAlerts());

    act(() => {
      emitEvent("alert:new", { id: "a1", message: "Warning" });
    });

    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts[0].message).toBe("Warning");
  });

  it("removes alert on resolved event", () => {
    const { result } = renderHook(() => useSystemAlerts());

    act(() => {
      emitEvent("alert:new", { id: "a1", message: "Warning" });
      emitEvent("alert:new", { id: "a2", message: "Critical" });
    });

    expect(result.current.alerts).toHaveLength(2);

    act(() => {
      emitEvent("alert:resolved", { alertId: "a1" });
    });

    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts[0].id).toBe("a2");
  });

  it("dismissAlert removes alert by id", () => {
    const { result } = renderHook(() => useSystemAlerts());

    act(() => {
      emitEvent("alert:new", { id: "a1", message: "Test" });
    });

    act(() => {
      result.current.dismissAlert("a1");
    });

    expect(result.current.alerts).toEqual([]);
  });

  it("dismissAlert is a no-op for non-existent alert", () => {
    const { result } = renderHook(() => useSystemAlerts());

    act(() => {
      emitEvent("alert:new", { id: "a1", message: "Test" });
    });

    act(() => {
      result.current.dismissAlert("nonexistent");
    });

    expect(result.current.alerts).toHaveLength(1);
  });
});
