/**
 * Tests for src/hooks/useUser.ts
 *
 * Hooks:  useUserProfile, useUserOnboarding, useUserPreferences
 *
 * Three independent hooks for user data management:
 * - useUserProfile: Cookie hydration, Firebase/email auth detection, fetch/update/avatar
 * - useUserOnboarding: CRUD via UserApi for onboarding data
 * - useUserPreferences: CRUD via UserApi for user preferences
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// ─── Module mock for UserApi ──────────────────────────────────

const mockGetOnboardingData = jest.fn();
const mockUpdateOnboardingData = jest.fn();
const mockCompleteOnboarding = jest.fn();
const mockGetProfile = jest.fn();
const mockUpdatePreferences = jest.fn();

jest.mock("@/lib/api/user", () => ({
  UserApi: {
    getOnboardingData: (...args: unknown[]) => mockGetOnboardingData(...args),
    updateOnboardingData: (...args: unknown[]) => mockUpdateOnboardingData(...args),
    completeOnboarding: (...args: unknown[]) => mockCompleteOnboarding(...args),
    getProfile: (...args: unknown[]) => mockGetProfile(...args),
    updatePreferences: (...args: unknown[]) => mockUpdatePreferences(...args),
  },
}));

// Grab global cookie mocks from jest.setupMocks.js
const { getCookieJSON, setCookie, getCookie } = jest.requireMock("@/lib/cookies");

import {
  useUserProfile,
  useUserOnboarding,
  useUserPreferences,
} from "../useUser";

// ─── Helpers ──────────────────────────────────────────────────

const mockProfile = {
  id: "user-1",
  email: "test@test.com",
  firstName: "Test",
  lastName: "User",
  displayName: "Test User",
  avatar: null,
  authProvider: "EMAIL",
};

const mockFirebaseProfile = {
  ...mockProfile,
  authProvider: "FIREBASE_GOOGLE",
};

const mockOnboardingData = {
  completed: false,
  currentStep: 2,
  steps: { welcome: true, profile: true, preferences: false },
};

const mockPreferences = {
  notifications: true,
  newsletter: false,
  theme: "light",
};

// Save and restore original fetch
const originalFetch = global.fetch;

// ─── Setup ────────────────────────────────────────────────────

beforeEach(() => {
  // Clear UserApi mocks
  mockGetOnboardingData.mockReset();
  mockUpdateOnboardingData.mockReset();
  mockCompleteOnboarding.mockReset();
  mockGetProfile.mockReset();
  mockUpdatePreferences.mockReset();

  // Clear cookie mocks
  getCookieJSON.mockClear();
  setCookie.mockClear();
  getCookie.mockClear();

  // Default cookie behavior
  getCookieJSON.mockReturnValue(null);
  getCookie.mockReturnValue(null);

  // Reset fetch mock
  global.fetch = jest.fn();

  // Clear sessionStorage
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.clear();
  }
});

afterEach(() => {
  global.fetch = originalFetch;
});

// ═══════════════════════════════════════════════════════════════
// useUserProfile
// ═══════════════════════════════════════════════════════════════

describe("useUserProfile", () => {
  it("starts in loading state", () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useUserProfile());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("hydrates profile from cookie immediately", async () => {
    getCookieJSON.mockReturnValue(mockProfile);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    const { result } = renderHook(() => useUserProfile());

    // Profile should be available quickly from cookie
    await waitFor(() => expect(result.current.profile).not.toBeNull());
    expect(result.current.profile!.email).toBe("test@test.com");
  });

  it("detects Firebase user via sessionStorage token", async () => {
    getCookieJSON.mockReturnValue(mockFirebaseProfile);
    sessionStorage.setItem("firebase-token", "mock-token");

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Firebase user: should NOT call backend fetch
    expect(global.fetch).not.toHaveBeenCalledWith("/api/user/profile", expect.anything());
    expect(result.current.profile?.authProvider).toBe("FIREBASE_GOOGLE");
  });

  it("detects Firebase user via authProvider in stored profile", async () => {
    getCookieJSON.mockReturnValue(mockFirebaseProfile);

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile?.authProvider).toBe("FIREBASE_GOOGLE");
  });

  it("fetches profile from API for email users", async () => {
    getCookieJSON.mockReturnValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(global.fetch).toHaveBeenCalledWith("/api/user/profile", { method: "GET" });
    expect(result.current.profile?.email).toBe("test@test.com");
  });

  it("handles fetch error gracefully", async () => {
    getCookieJSON.mockReturnValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Unauthorized" }),
    });

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Unauthorized");
  });

  it("updates cookie after successful API fetch", async () => {
    getCookieJSON.mockReturnValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.profile).not.toBeNull());

    expect(setCookie).toHaveBeenCalledWith("user", mockProfile, { maxAge: 60 * 60 * 24 * 30 });
  });

  // ── updateProfile ─────────────────────────────────────────

  it("updateProfile sends PUT request", async () => {
    getCookieJSON.mockReturnValue(mockProfile);
    // Initial fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const updatedProfile = { ...mockProfile, firstName: "Updated" };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: updatedProfile }),
    });

    let response: unknown;
    await act(async () => {
      response = await result.current.updateProfile({ firstName: "Updated" });
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Updated" }),
    });
    expect((response as any).success).toBe(true);
  });

  it("updateProfile throws on failure", async () => {
    getCookieJSON.mockReturnValue(null);
    // Initial fetch succeeds
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Update fails
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Validation error" }),
    });

    await expect(
      act(async () => {
        await result.current.updateProfile({ firstName: "" });
      })
    ).rejects.toThrow("Validation error");
  });

  // ── uploadAvatar ──────────────────────────────────────────

  it("uploadAvatar sends POST with FormData", async () => {
    getCookieJSON.mockReturnValue(mockProfile);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const avatarUrl = "https://cdn.test.com/avatar.jpg";
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: avatarUrl }),
    });

    const mockFile = new File(["test"], "avatar.jpg", { type: "image/jpeg" });

    let response: unknown;
    await act(async () => {
      response = await result.current.uploadAvatar(mockFile);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/user/avatar", {
      method: "POST",
      body: expect.any(FormData),
    });
    expect((response as any).success).toBe(true);
  });

  it("uploadAvatar throws on failure", async () => {
    getCookieJSON.mockReturnValue(null);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "File too large" }),
    });

    const mockFile = new File(["test"], "big.jpg", { type: "image/jpeg" });

    await expect(
      act(async () => {
        await result.current.uploadAvatar(mockFile);
      })
    ).rejects.toThrow("File too large");
  });

  // ── clearProfile ──────────────────────────────────────────

  it("clearProfile resets state", async () => {
    getCookieJSON.mockReturnValue(mockProfile);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.profile).not.toBeNull());

    act(() => {
      result.current.clearProfile();
    });

    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // ── refetch ───────────────────────────────────────────────

  it("refetch re-fetches from API", async () => {
    getCookieJSON.mockReturnValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockProfile }),
    });

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refetch();
    });

    // fetch called at least twice (initial + refetch)
    expect((global.fetch as jest.Mock).mock.calls.filter(
      (c: unknown[]) => c[0] === "/api/user/profile"
    ).length).toBeGreaterThanOrEqual(2);
  });
});

// ═══════════════════════════════════════════════════════════════
// useUserOnboarding
// ═══════════════════════════════════════════════════════════════

describe("useUserOnboarding", () => {
  it("starts in loading state and fetches onboarding data", async () => {
    mockGetOnboardingData.mockResolvedValue({ data: mockOnboardingData });

    const { result } = renderHook(() => useUserOnboarding());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.onboardingData).toEqual(mockOnboardingData);
    expect(result.current.error).toBeNull();
  });

  it("handles fetch error", async () => {
    mockGetOnboardingData.mockRejectedValue(new Error("Onboarding fetch failed"));

    const { result } = renderHook(() => useUserOnboarding());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Onboarding fetch failed");
    expect(result.current.onboardingData).toBeNull();
  });

  it("updateOnboardingData updates state", async () => {
    mockGetOnboardingData.mockResolvedValue({ data: mockOnboardingData });
    const updatedData = { ...mockOnboardingData, currentStep: 3 };
    mockUpdateOnboardingData.mockResolvedValue({ data: updatedData });

    const { result } = renderHook(() => useUserOnboarding());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateOnboardingData({ currentStep: 3 } as any);
    });

    expect(result.current.onboardingData?.currentStep).toBe(3);
  });

  it("updateOnboardingData throws on error", async () => {
    mockGetOnboardingData.mockResolvedValue({ data: mockOnboardingData });

    const { result } = renderHook(() => useUserOnboarding());

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockUpdateOnboardingData.mockRejectedValue(new Error("Update failed"));

    await expect(
      act(async () => {
        await result.current.updateOnboardingData({ currentStep: 99 } as any);
      })
    ).rejects.toThrow("Update failed");
  });

  it("completeOnboarding sets completed to true optimistically", async () => {
    mockGetOnboardingData.mockResolvedValue({ data: mockOnboardingData });
    mockCompleteOnboarding.mockResolvedValue({ data: { ...mockOnboardingData, completed: true } });

    const { result } = renderHook(() => useUserOnboarding());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(result.current.onboardingData?.completed).toBe(true);
  });

  it("completeOnboarding throws on error", async () => {
    mockGetOnboardingData.mockResolvedValue({ data: mockOnboardingData });

    const { result } = renderHook(() => useUserOnboarding());

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockCompleteOnboarding.mockRejectedValue(new Error("Complete failed"));

    await expect(
      act(async () => {
        await result.current.completeOnboarding();
      })
    ).rejects.toThrow("Complete failed");
  });

  it("refetch re-fetches onboarding data", async () => {
    mockGetOnboardingData.mockResolvedValue({ data: mockOnboardingData });

    const { result } = renderHook(() => useUserOnboarding());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const updatedData = { ...mockOnboardingData, currentStep: 5 };
    mockGetOnboardingData.mockResolvedValue({ data: updatedData });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.onboardingData?.currentStep).toBe(5);
  });
});

// ═══════════════════════════════════════════════════════════════
// useUserPreferences
// ═══════════════════════════════════════════════════════════════

describe("useUserPreferences", () => {
  it("starts in loading state and fetches preferences", async () => {
    mockGetProfile.mockResolvedValue({
      data: { ...mockProfile, preferences: mockPreferences },
    });

    const { result } = renderHook(() => useUserPreferences());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.preferences).toEqual(mockPreferences);
    expect(result.current.error).toBeNull();
  });

  it("handles fetch error", async () => {
    mockGetProfile.mockRejectedValue(new Error("Profile fetch failed"));

    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Profile fetch failed");
    expect(result.current.preferences).toBeNull();
  });

  it("updatePreferences updates state", async () => {
    mockGetProfile.mockResolvedValue({
      data: { ...mockProfile, preferences: mockPreferences },
    });

    const updatedPrefs = { ...mockPreferences, newsletter: true };
    mockUpdatePreferences.mockResolvedValue({ data: updatedPrefs });

    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updatePreferences({ newsletter: true } as any);
    });

    expect(result.current.preferences?.newsletter).toBe(true);
  });

  it("updatePreferences throws on error", async () => {
    mockGetProfile.mockResolvedValue({
      data: { ...mockProfile, preferences: mockPreferences },
    });

    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockUpdatePreferences.mockRejectedValue(new Error("Prefs update failed"));

    await expect(
      act(async () => {
        await result.current.updatePreferences({ theme: "dark" } as any);
      })
    ).rejects.toThrow("Prefs update failed");
  });

  it("refetch re-fetches preferences from getProfile", async () => {
    mockGetProfile.mockResolvedValue({
      data: { ...mockProfile, preferences: mockPreferences },
    });

    const { result } = renderHook(() => useUserPreferences());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const newPrefs = { ...mockPreferences, theme: "dark" };
    mockGetProfile.mockResolvedValue({
      data: { ...mockProfile, preferences: newPrefs },
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.preferences?.theme).toBe("dark");
  });
});
