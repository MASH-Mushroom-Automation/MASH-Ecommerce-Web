/**
 * Tests for src/hooks/useFirebaseNotifications.ts
 *
 * Exports:  useFirebaseNotifications, formatNotificationTime, getNotificationIcon
 *
 * useFirebaseNotifications manages notifications with Firebase real-time
 * subscription, computed unread counts, and optimistic CRUD operations.
 *
 * formatNotificationTime converts Firestore timestamps to relative strings.
 * getNotificationIcon maps notification types to emoji icons.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// ─── Module mock for FirebaseNotificationsService ─────────────

const mockGetUserNotifications = jest.fn();
const mockSubscribeToNotifications = jest.fn();
const mockMarkAsRead = jest.fn();
const mockMarkAllAsRead = jest.fn();
const mockDeleteNotification = jest.fn();
const mockDeleteAllNotifications = jest.fn();

jest.mock("@/lib/firebase/notifications", () => ({
  FirebaseNotificationsService: {
    getUserNotifications: (...args: unknown[]) => mockGetUserNotifications(...args),
    subscribeToNotifications: (...args: unknown[]) => mockSubscribeToNotifications(...args),
    markAsRead: (...args: unknown[]) => mockMarkAsRead(...args),
    markAllAsRead: (...args: unknown[]) => mockMarkAllAsRead(...args),
    deleteNotification: (...args: unknown[]) => mockDeleteNotification(...args),
    deleteAllNotifications: (...args: unknown[]) => mockDeleteAllNotifications(...args),
  },
}));

// Grab global useAuth mock from jest.setupMocks.js
const mockUseAuth = jest.requireMock("@/contexts/AuthContext").useAuth;

import {
  useFirebaseNotifications,
  formatNotificationTime,
  getNotificationIcon,
} from "../useFirebaseNotifications";

// ─── Helpers ──────────────────────────────────────────────────

const authenticatedUser = {
  user: { id: "user-1", email: "test@test.com", displayName: "Test" },
  isAuthenticated: true,
  loading: false,
};

const unauthenticatedUser = {
  user: null,
  isAuthenticated: false,
  loading: false,
};

const makeNotification = (
  id: string,
  overrides: Record<string, unknown> = {}
) => ({
  id,
  userId: "user-1",
  type: "order_placed" as const,
  title: `Notification ${id}`,
  message: `Message for ${id}`,
  read: false,
  createdAt: new Date("2025-06-01T10:00:00Z"),
  ...overrides,
});

let realtimeCallback: ((notifications: unknown[]) => void) | null = null;
const mockUnsubscribe = jest.fn();

// ─── Setup ────────────────────────────────────────────────────

beforeEach(() => {
  mockGetUserNotifications.mockReset();
  mockSubscribeToNotifications.mockReset();
  mockMarkAsRead.mockReset();
  mockMarkAllAsRead.mockReset();
  mockDeleteNotification.mockReset();
  mockDeleteAllNotifications.mockReset();
  mockUnsubscribe.mockClear();
  realtimeCallback = null;

  // Default: authenticated
  mockUseAuth.mockReturnValue(authenticatedUser);

  // Default: capture realtime callback
  mockSubscribeToNotifications.mockImplementation(
    (_userId: string, callback: (data: unknown[]) => void, _maxResults?: number) => {
      realtimeCallback = callback;
      return mockUnsubscribe;
    }
  );
});

// ═══════════════════════════════════════════════════════════════
// useFirebaseNotifications
// ═══════════════════════════════════════════════════════════════

describe("useFirebaseNotifications", () => {
  // ── Initial / Loading state ─────────────────────────────────

  it("starts in loading state with realtime enabled", () => {
    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: true })
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it("subscribes to realtime updates when user is authenticated", () => {
    renderHook(() => useFirebaseNotifications({ realtime: true }));

    expect(mockSubscribeToNotifications).toHaveBeenCalledWith(
      "user-1",
      expect.any(Function),
      50 // default maxResults
    );
  });

  it("receives notifications via realtime callback", async () => {
    const notifications = [
      makeNotification("n1"),
      makeNotification("n2", { read: true }),
    ];

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: true })
    );

    act(() => {
      realtimeCallback?.(notifications);
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("unsubscribes on unmount", () => {
    const { unmount } = renderHook(() =>
      useFirebaseNotifications({ realtime: true })
    );

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  // ── Non-realtime (autoFetch) ────────────────────────────────

  it("fetches via getUserNotifications when realtime=false", async () => {
    const notifications = [makeNotification("n1")];
    mockGetUserNotifications.mockResolvedValue(notifications);

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: false, autoFetch: true })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGetUserNotifications).toHaveBeenCalledWith("user-1", 50);
    expect(result.current.notifications).toHaveLength(1);
  });

  it("handles fetch error in non-realtime mode", async () => {
    mockGetUserNotifications.mockRejectedValue(new Error("Fetch error"));

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: false, autoFetch: true })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to load notifications");
  });

  it("does not fetch when no user", async () => {
    mockUseAuth.mockReturnValue(unauthenticatedUser);

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: false, autoFetch: true })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGetUserNotifications).not.toHaveBeenCalled();
    expect(result.current.notifications).toEqual([]);
  });

  // ── Computed values ─────────────────────────────────────────

  it("computes unreadNotifications and unreadCount", async () => {
    const notifications = [
      makeNotification("n1", { read: false }),
      makeNotification("n2", { read: true }),
      makeNotification("n3", { read: false }),
    ];

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: true })
    );

    act(() => {
      realtimeCallback?.(notifications);
    });

    await waitFor(() => expect(result.current.unreadCount).toBe(2));
    expect(result.current.unreadNotifications).toHaveLength(2);
    expect(result.current.unreadNotifications.every((n) => !n.read)).toBe(true);
  });

  // ── markAsRead ──────────────────────────────────────────────

  it("markAsRead returns true on success", async () => {
    mockMarkAsRead.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: true })
    );

    act(() => {
      realtimeCallback?.([makeNotification("n1")]);
    });

    let success = false;
    await act(async () => {
      success = await result.current.markAsRead("n1");
    });

    expect(success).toBe(true);
    expect(mockMarkAsRead).toHaveBeenCalledWith("n1");
  });

  it("markAsRead does optimistic update when not realtime", async () => {
    const notifications = [
      makeNotification("n1", { read: false }),
      makeNotification("n2", { read: false }),
    ];
    mockGetUserNotifications.mockResolvedValue(notifications);
    mockMarkAsRead.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: false, autoFetch: true })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAsRead("n1");
    });

    // Optimistic: n1 should now be read
    const n1 = result.current.notifications.find((n) => n.id === "n1");
    expect(n1?.read).toBe(true);
    expect(result.current.unreadCount).toBe(1);
  });

  it("markAsRead returns false on error", async () => {
    mockMarkAsRead.mockRejectedValue(new Error("Mark failed"));

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: true })
    );

    act(() => {
      realtimeCallback?.([makeNotification("n1")]);
    });

    let success = false;
    await act(async () => {
      success = await result.current.markAsRead("n1");
    });

    expect(success).toBe(false);
  });

  // ── markAllAsRead ───────────────────────────────────────────

  it("markAllAsRead returns true on success", async () => {
    mockMarkAllAsRead.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: true })
    );

    act(() => {
      realtimeCallback?.([makeNotification("n1"), makeNotification("n2")]);
    });

    let success = false;
    await act(async () => {
      success = await result.current.markAllAsRead();
    });

    expect(success).toBe(true);
    expect(mockMarkAllAsRead).toHaveBeenCalledWith("user-1");
  });

  it("markAllAsRead optimistic update when not realtime", async () => {
    const notifications = [
      makeNotification("n1", { read: false }),
      makeNotification("n2", { read: false }),
    ];
    mockGetUserNotifications.mockResolvedValue(notifications);
    mockMarkAllAsRead.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: false, autoFetch: true })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every((n) => n.read)).toBe(true);
  });

  it("markAllAsRead returns false when no user", async () => {
    mockUseAuth.mockReturnValue(unauthenticatedUser);

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: false })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    let success = false;
    await act(async () => {
      success = await result.current.markAllAsRead();
    });

    expect(success).toBe(false);
  });

  // ── deleteNotification ──────────────────────────────────────

  it("deleteNotification returns true on success", async () => {
    mockDeleteNotification.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: true })
    );

    act(() => {
      realtimeCallback?.([makeNotification("n1")]);
    });

    let success = false;
    await act(async () => {
      success = await result.current.deleteNotification("n1");
    });

    expect(success).toBe(true);
    expect(mockDeleteNotification).toHaveBeenCalledWith("n1");
  });

  it("deleteNotification optimistic update when not realtime", async () => {
    const notifications = [makeNotification("n1"), makeNotification("n2")];
    mockGetUserNotifications.mockResolvedValue(notifications);
    mockDeleteNotification.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: false, autoFetch: true })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notifications).toHaveLength(2);

    await act(async () => {
      await result.current.deleteNotification("n1");
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe("n2");
  });

  it("deleteNotification returns false on error", async () => {
    mockDeleteNotification.mockRejectedValue(new Error("Delete failed"));

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: true })
    );

    act(() => {
      realtimeCallback?.([makeNotification("n1")]);
    });

    let success = false;
    await act(async () => {
      success = await result.current.deleteNotification("n1");
    });

    expect(success).toBe(false);
  });

  // ── clearAll ────────────────────────────────────────────────

  it("clearAll returns true on success", async () => {
    mockDeleteAllNotifications.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: true })
    );

    act(() => {
      realtimeCallback?.([makeNotification("n1")]);
    });

    let success = false;
    await act(async () => {
      success = await result.current.clearAll();
    });

    expect(success).toBe(true);
    expect(mockDeleteAllNotifications).toHaveBeenCalledWith("user-1");
  });

  it("clearAll optimistic update when not realtime", async () => {
    const notifications = [makeNotification("n1"), makeNotification("n2")];
    mockGetUserNotifications.mockResolvedValue(notifications);
    mockDeleteAllNotifications.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: false, autoFetch: true })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notifications).toHaveLength(2);

    await act(async () => {
      await result.current.clearAll();
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it("clearAll returns false when no user", async () => {
    mockUseAuth.mockReturnValue(unauthenticatedUser);

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: false })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    let success = false;
    await act(async () => {
      success = await result.current.clearAll();
    });

    expect(success).toBe(false);
  });

  // ── refresh ─────────────────────────────────────────────────

  it("refresh re-fetches notifications", async () => {
    const initialNotifications = [makeNotification("n1")];
    mockGetUserNotifications.mockResolvedValueOnce(initialNotifications);

    const { result } = renderHook(() =>
      useFirebaseNotifications({ realtime: false, autoFetch: true })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    const refreshedNotifications = [
      makeNotification("n1"),
      makeNotification("n2"),
    ];
    mockGetUserNotifications.mockResolvedValueOnce(refreshedNotifications);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.notifications).toHaveLength(2);
  });

  // ── Custom options ──────────────────────────────────────────

  it("respects custom maxResults", () => {
    renderHook(() =>
      useFirebaseNotifications({ realtime: true, maxResults: 10 })
    );

    expect(mockSubscribeToNotifications).toHaveBeenCalledWith(
      "user-1",
      expect.any(Function),
      10
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// formatNotificationTime
// ═══════════════════════════════════════════════════════════════

describe("formatNotificationTime", () => {
  it('returns "Unknown time" for null', () => {
    expect(formatNotificationTime(null)).toBe("Unknown time");
  });

  it('returns "Unknown time" for undefined', () => {
    expect(formatNotificationTime(undefined)).toBe("Unknown time");
  });

  it('returns "Just now" for < 60 seconds ago', () => {
    const now = new Date();
    expect(formatNotificationTime(now)).toBe("Just now");
  });

  it('returns "Xm ago" for minutes', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatNotificationTime(fiveMinAgo)).toBe("5m ago");
  });

  it('returns "Xh ago" for hours', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatNotificationTime(threeHoursAgo)).toBe("3h ago");
  });

  it('returns "Xd ago" for days (< 7)', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatNotificationTime(twoDaysAgo)).toBe("2d ago");
  });

  it("returns localized date for >= 7 days", () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const result = formatNotificationTime(twoWeeksAgo);
    // Should contain month and day (e.g., "Jun 1" or "Jan 15")
    expect(result).not.toContain("ago");
    expect(result.length).toBeGreaterThan(0);
  });

  it("handles Firestore timestamp with toDate()", () => {
    const firestoreTimestamp = {
      toDate: () => new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    };

    expect(formatNotificationTime(firestoreTimestamp)).toBe("10m ago");
  });
});

// ═══════════════════════════════════════════════════════════════
// getNotificationIcon
// ═══════════════════════════════════════════════════════════════

describe("getNotificationIcon", () => {
  const iconMap: [string, string][] = [
    ["order_placed", "📦"],
    ["order_approved", "✅"],
    ["order_rejected", "❌"],
    ["order_processing", "⏳"],
    ["order_shipped", "🚚"],
    ["order_delivered", "📬"],
    ["order_completed", "🎉"],
    ["driver_assigned", "🧑‍✈️"],
    ["delivery_update", "📍"],
    ["promo", "🎁"],
    ["system", "ℹ️"],
  ];

  it.each(iconMap)('returns %s icon for type "%s"', (type, expectedIcon) => {
    expect(getNotificationIcon(type as any)).toBe(expectedIcon);
  });

  it('returns fallback bell icon for unknown type', () => {
    expect(getNotificationIcon("unknown_type" as any)).toBe("🔔");
  });
});
