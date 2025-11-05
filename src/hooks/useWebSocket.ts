"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getWebSocketClient } from "@/lib/websocket/client";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(getWebSocketClient());

  useEffect(() => {
    const ws = wsRef.current;

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    const unsubConnect = ws.on("connected", handleConnected);
    const unsubDisconnect = ws.on("disconnected", handleDisconnected);

    // Connect if not already connected
    if (!ws.isConnected()) {
      ws.connect();
    } else {
      setIsConnected(true);
    }

    return () => {
      unsubConnect();
      unsubDisconnect();
    };
  }, []);

  const send = useCallback((event: string, data: any) => {
    wsRef.current.send(event, data);
  }, []);

  const joinRoom = useCallback((room: string) => {
    wsRef.current.joinRoom(room);
  }, []);

  const leaveRoom = useCallback((room: string) => {
    wsRef.current.leaveRoom(room);
  }, []);

  return {
    isConnected,
    send,
    joinRoom,
    leaveRoom,
    ws: wsRef.current,
  };
}

// Hook for listening to specific WebSocket events
export function useWebSocketEvent<T = any>(
  event: string,
  handler: (data: T) => void,
  deps: any[] = []
) {
  const wsRef = useRef(getWebSocketClient());

  useEffect(() => {
    const ws = wsRef.current;
    const unsubscribe = ws.on(event as any, handler);

    return () => {
      unsubscribe();
    };
  }, [event, ...deps]);
}

// Hook for real-time device sensor data
export function useDeviceSensorData(deviceId?: string) {
  const [sensorData, setSensorData] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useWebSocketEvent(
    "sensor:data",
    (data: any) => {
      if (!deviceId || data.deviceId === deviceId) {
        setSensorData(data);
        setLastUpdate(new Date());
      }
    },
    [deviceId]
  );

  return { sensorData, lastUpdate };
}

// Hook for real-time notifications
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useWebSocketEvent("notification:new", (data: any) => {
    setNotifications((prev) => [data, ...prev]);
    setUnreadCount((prev) => prev + 1);
  });

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
  };
}

// Hook for real-time order status updates
export function useOrderStatusUpdates(orderId?: string) {
  const [orderStatus, setOrderStatus] = useState<any>(null);

  useWebSocketEvent(
    "order:status",
    (data: any) => {
      if (!orderId || data.orderId === orderId) {
        setOrderStatus(data);
      }
    },
    [orderId]
  );

  return orderStatus;
}

// Hook for device status monitoring
export function useDeviceStatus(deviceId?: string) {
  const [deviceStatus, setDeviceStatus] = useState<"online" | "offline" | null>(null);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);

  useWebSocketEvent(
    "device:status",
    (data: any) => {
      if (!deviceId || data.deviceId === deviceId) {
        setDeviceStatus(data.status);
        setLastSeen(new Date(data.timestamp));
      }
    },
    [deviceId]
  );

  return { deviceStatus, lastSeen };
}

// Hook for system alerts
export function useSystemAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useWebSocketEvent("alert:new", (data: any) => {
    setAlerts((prev) => [data, ...prev]);
  });

  useWebSocketEvent("alert:resolved", (data: any) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== data.alertId));
  });

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  return { alerts, dismissAlert };
}
