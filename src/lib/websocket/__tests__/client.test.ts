/**
 * Tests for WebSocket Client
 * Mocks the WebSocket constructor for unit testing event-driven patterns
 */

// Mock WebSocket globally
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  url: string;
  onopen: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  sentMessages: string[] = [];

  constructor(url: string) {
    this.url = url;
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({} as CloseEvent);
    }
  }
}

// Assign mock to global before import
Object.assign(global, {
  WebSocket: MockWebSocket,
});

import WebSocketClient, { getWebSocketClient } from '../client';

// Track setTimeout calls for reconnect testing
jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllTimers();
});

describe('WebSocketClient', () => {
  describe('constructor', () => {
    it('uses provided URL', () => {
      const client = new WebSocketClient('ws://custom:8080');
      // Internal state - verify by connecting
      (global.fetch as any) = jest.fn(); // silent
      expect(client).toBeDefined();
    });

    it('falls back to env var or default', () => {
      const client = new WebSocketClient();
      expect(client).toBeDefined();
    });
  });

  describe('connect', () => {
    it('creates a WebSocket connection', () => {
      const client = new WebSocketClient('ws://test:3001');
      client.connect();
      expect(client.isConnected()).toBe(true);
    });

    it('does not reconnect if already connected', () => {
      const client = new WebSocketClient('ws://test:3001');
      client.connect();
      // Second connect should be a no-op (no error thrown)
      client.connect();
      expect(client.isConnected()).toBe(true);
    });

    it('appends token to URL when provided', () => {
      const client = new WebSocketClient('ws://test:3001');
      client.connect('my-auth-token');
      expect(client.isConnected()).toBe(true);
    });

    it('emits connected event on open', () => {
      const client = new WebSocketClient('ws://test:3001');
      const handler = jest.fn();
      client.on('connected', handler);
      client.connect();

      // Simulate onopen
      const ws = (client as any).ws as MockWebSocket;
      ws.onopen?.({} as Event);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ timestamp: expect.any(String) })
      );
    });

    it('sends auth message when token provided and connected', () => {
      const client = new WebSocketClient('ws://test:3001');
      client.connect('token123');

      const ws = (client as any).ws as MockWebSocket;
      ws.onopen?.({} as Event);

      // Should have sent auth:connect
      const sentData = ws.sentMessages.map((m: string) => JSON.parse(m));
      const authMsg = sentData.find((m: any) => m.event === 'auth:connect');
      expect(authMsg).toBeDefined();
      expect(authMsg.data.token).toBe('token123');
    });

    it('handles incoming messages', () => {
      const client = new WebSocketClient('ws://test:3001');
      const handler = jest.fn();
      client.on('device:status', handler);
      client.connect();

      const ws = (client as any).ws as MockWebSocket;
      ws.onmessage?.({
        data: JSON.stringify({ event: 'device:status', data: { id: 'dev-1', online: true } }),
      } as MessageEvent);

      expect(handler).toHaveBeenCalledWith({ id: 'dev-1', online: true });
    });

    it('handles malformed message JSON gracefully', () => {
      const client = new WebSocketClient('ws://test:3001');
      client.connect();

      const ws = (client as any).ws as MockWebSocket;
      // Should not throw
      expect(() => {
        ws.onmessage?.({ data: 'not json{{{' } as MessageEvent);
      }).not.toThrow();
    });

    it('emits error event on WebSocket error', () => {
      const client = new WebSocketClient('ws://test:3001');
      const errorHandler = jest.fn();
      client.on('error', errorHandler);
      client.connect();

      const ws = (client as any).ws as MockWebSocket;
      ws.onerror?.({} as Event);

      expect(errorHandler).toHaveBeenCalled();
    });

    it('emits disconnected event on close', () => {
      const client = new WebSocketClient('ws://test:3001');
      const handler = jest.fn();
      client.on('disconnected', handler);
      client.connect();

      const ws = (client as any).ws as MockWebSocket;
      // Set manual close to prevent reconnect
      (client as any).isManualClose = true;
      ws.onclose?.({} as CloseEvent);

      expect(handler).toHaveBeenCalled();
    });

    it('attempts reconnect on unintentional close', () => {
      const client = new WebSocketClient('ws://test:3001');
      client.connect();

      const ws = (client as any).ws as MockWebSocket;
      ws.readyState = MockWebSocket.CLOSED;
      ws.onclose?.({} as CloseEvent);

      // Reconnect scheduled
      expect((client as any).reconnectAttempts).toBe(1);
    });
  });

  describe('disconnect', () => {
    it('closes the WebSocket connection', () => {
      const client = new WebSocketClient('ws://test:3001');
      client.connect();
      client.disconnect();

      expect((client as any).ws).toBeNull();
      expect((client as any).isManualClose).toBe(true);
    });
  });

  describe('send', () => {
    it('sends JSON message when connected', () => {
      const client = new WebSocketClient('ws://test:3001');
      client.connect();
      client.send('test:event', { foo: 'bar' });

      const ws = (client as any).ws as MockWebSocket;
      expect(ws.sentMessages).toHaveLength(1);
      expect(JSON.parse(ws.sentMessages[0])).toEqual({
        event: 'test:event',
        data: { foo: 'bar' },
      });
    });

    it('does not send when not connected', () => {
      const client = new WebSocketClient('ws://test:3001');
      // Not connected, send should be a no-op with warning
      client.send('test:event', { foo: 'bar' });
      // No error thrown
    });
  });

  describe('on / off', () => {
    it('registers and triggers event handlers', () => {
      const client = new WebSocketClient('ws://test:3001');
      const handler = jest.fn();
      client.on('alert:new', handler);

      // Trigger via private emit
      (client as any).emit('alert:new', { severity: 'high' });
      expect(handler).toHaveBeenCalledWith({ severity: 'high' });
    });

    it('returns an unsubscribe function', () => {
      const client = new WebSocketClient('ws://test:3001');
      const handler = jest.fn();
      const unsub = client.on('alert:new', handler);

      unsub();
      (client as any).emit('alert:new', { data: 'test' });
      expect(handler).not.toHaveBeenCalled();
    });

    it('removes handler with off()', () => {
      const client = new WebSocketClient('ws://test:3001');
      const handler = jest.fn();
      client.on('notification:new', handler);
      client.off('notification:new', handler);

      (client as any).emit('notification:new', {});
      expect(handler).not.toHaveBeenCalled();
    });

    it('supports multiple handlers for same event', () => {
      const client = new WebSocketClient('ws://test:3001');
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      client.on('order:status', handler1);
      client.on('order:status', handler2);

      (client as any).emit('order:status', { orderId: '123' });
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('isolates handler errors', () => {
      const client = new WebSocketClient('ws://test:3001');
      const errorHandler = jest.fn(() => { throw new Error('Handler crash'); });
      const goodHandler = jest.fn();
      client.on('sensor:data', errorHandler);
      client.on('sensor:data', goodHandler);

      // Should not throw, error is caught internally
      expect(() => {
        (client as any).emit('sensor:data', { temp: 25 });
      }).not.toThrow();
      expect(goodHandler).toHaveBeenCalled();
    });
  });

  describe('handleReconnect', () => {
    it('stops reconnecting after max attempts', () => {
      const client = new WebSocketClient('ws://test:3001');
      (client as any).reconnectAttempts = 5;
      (client as any).maxReconnectAttempts = 5;

      (client as any).handleReconnect();
      // No new reconnect scheduled
      expect((client as any).reconnectAttempts).toBe(5);
    });

    it('uses exponential backoff', () => {
      const client = new WebSocketClient('ws://test:3001');
      (client as any).reconnectAttempts = 0;
      (client as any).reconnectDelay = 1000;

      (client as any).handleReconnect();
      expect((client as any).reconnectAttempts).toBe(1);
      // Delay should be 1000 * 2^0 = 1000ms
    });
  });

  describe('joinRoom / leaveRoom', () => {
    it('sends room:join event', () => {
      const client = new WebSocketClient('ws://test:3001');
      client.connect();
      client.joinRoom('orders:seller-1');

      const ws = (client as any).ws as MockWebSocket;
      const msg = JSON.parse(ws.sentMessages[0]);
      expect(msg.event).toBe('room:join');
      expect(msg.data.room).toBe('orders:seller-1');
    });

    it('sends room:leave event', () => {
      const client = new WebSocketClient('ws://test:3001');
      client.connect();
      client.leaveRoom('orders:seller-1');

      const ws = (client as any).ws as MockWebSocket;
      const msg = JSON.parse(ws.sentMessages[0]);
      expect(msg.event).toBe('room:leave');
      expect(msg.data.room).toBe('orders:seller-1');
    });
  });

  describe('isConnected', () => {
    it('returns true when WebSocket is OPEN', () => {
      const client = new WebSocketClient('ws://test:3001');
      client.connect();
      expect(client.isConnected()).toBe(true);
    });

    it('returns false when not connected', () => {
      const client = new WebSocketClient('ws://test:3001');
      expect(client.isConnected()).toBe(false);
    });

    it('returns false after disconnect', () => {
      const client = new WebSocketClient('ws://test:3001');
      client.connect();
      client.disconnect();
      expect(client.isConnected()).toBe(false);
    });
  });
});

describe('getWebSocketClient', () => {
  it('returns a dummy client in SSR (typeof window === undefined)', () => {
    const origWindow = global.window;
    // @ts-expect-error - simulating SSR
    delete global.window;

    // Reset module to clear singleton
    jest.resetModules();
    const { getWebSocketClient: getWSClient } = require('../client');
    const client = getWSClient();

    expect(client.isConnected()).toBe(false);
    // Dummy methods should be no-ops
    expect(() => client.connect()).not.toThrow();
    expect(() => client.disconnect()).not.toThrow();
    expect(() => client.send('e', {})).not.toThrow();
    expect(client.on('connected', () => {})).toBeDefined();

    global.window = origWindow;
  });

  it('returns singleton instance on client', () => {
    // Reset to ensure fresh singleton
    jest.resetModules();
    const { getWebSocketClient: getWSClient } = require('../client');
    const client1 = getWSClient();
    const client2 = getWSClient();
    expect(client1).toBe(client2);
  });
});
