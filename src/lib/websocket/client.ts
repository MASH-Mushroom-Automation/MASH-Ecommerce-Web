"use client";

type WebSocketEventHandler = (data: any) => void;

interface WebSocketEvents {
  "device:status": WebSocketEventHandler;
  "sensor:data": WebSocketEventHandler;
  "alert:new": WebSocketEventHandler;
  "alert:resolved": WebSocketEventHandler;
  "order:status": WebSocketEventHandler;
  "notification:new": WebSocketEventHandler;
  "user:online": WebSocketEventHandler;
  "system:maintenance": WebSocketEventHandler;
  connected: WebSocketEventHandler;
  disconnected: WebSocketEventHandler;
  error: WebSocketEventHandler;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private listeners: Map<keyof WebSocketEvents, Set<WebSocketEventHandler>> = new Map();
  private isManualClose = false;

  constructor(url?: string) {
    this.url = url || process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
  }

  connect(token?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    try {
      const wsUrl = token ? `${this.url}?token=${token}` : this.url;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit("connected", { timestamp: new Date().toISOString() });

        // Send authentication if token provided
        if (token) {
          this.send("auth:connect", { token });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { event: eventType, data } = message;
          
          if (eventType) {
            this.emit(eventType as keyof WebSocketEvents, data);
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.emit("error", { error, timestamp: new Date().toISOString() });
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.stopHeartbeat();
        this.emit("disconnected", { timestamp: new Date().toISOString() });

        if (!this.isManualClose) {
          this.handleReconnect();
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.handleReconnect();
    }
  }

  disconnect() {
    this.isManualClose = true;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(event: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    } else {
      console.warn("WebSocket not connected. Message not sent:", event, data);
    }
  }

  on<E extends keyof WebSocketEvents>(event: E, handler: WebSocketEvents[E]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(handler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  off<E extends keyof WebSocketEvents>(event: E, handler: WebSocketEvents[E]) {
    this.listeners.get(event)?.delete(handler);
  }

  private emit<E extends keyof WebSocketEvents>(event: E, data: any) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    // Don't start heartbeat during test runs to avoid open handles
    if (process.env.NODE_ENV === 'test') return;

    this.heartbeatInterval = setInterval(() => {
      this.send("heartbeat", { timestamp: new Date().toISOString() });
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  joinRoom(room: string) {
    this.send("room:join", { room });
  }

  leaveRoom(room: string) {
    this.send("room:leave", { room });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (typeof window === "undefined") {
    // Return a dummy client for SSR
    return {
      connect: () => {},
      disconnect: () => {},
      send: () => {},
      on: () => () => {},
      off: () => {},
      joinRoom: () => {},
      leaveRoom: () => {},
      isConnected: () => false,
    } as any;
  }

  if (!wsClient) {
    wsClient = new WebSocketClient();
  }

  return wsClient;
}

export default WebSocketClient;
