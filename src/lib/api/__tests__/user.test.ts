/**
 * Tests for src/lib/api/user.ts
 * UserApi - user profile CRUD with localStorage cache + backend fallback
 */
import { UserApi } from "../user";

// Mock global fetch
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

describe("UserApi", () => {
  // Cache key used by user.ts (must match source)
  const CACHE_KEY = "user-profile-cache";

  beforeEach(() => {
    jest.useFakeTimers();
    mockFetch.mockReset();
    // Default: backend unavailable
    mockFetch.mockResolvedValue({
      ok: false,
      status: 0,
      json: async () => null,
    });
    // Clear localStorage
    localStorage.clear();
    // Set up document.cookie for auth token extraction
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
      configurable: true,
    });
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  async function resolve<T>(promise: Promise<T>): Promise<T> {
    await jest.advanceTimersByTimeAsync(1500);
    return promise;
  }

  // ─── getProfile ──────────────────────────────────────────────────────

  describe("getProfile", () => {
    it("returns mock profile when backend is unavailable", async () => {
      const result = await resolve(UserApi.getProfile());
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.email).toBeTruthy();
    });

    it("includes all required profile fields", async () => {
      const result = await resolve(UserApi.getProfile());
      const profile = result.data!;
      expect(profile.id).toBeDefined();
      expect(profile.email).toBeDefined();
      expect(profile.firstName).toBeDefined();
      expect(profile.lastName).toBeDefined();
      expect(profile.role).toBeDefined();
    });

    it("returns cached profile on second call", async () => {
      // First call populates cache (mock fallback stores in cache via setCachedProfile)
      const first = await resolve(UserApi.getProfile());
      expect(first.success).toBe(true);

      // Second call should use cache (no delay)
      const second = await resolve(UserApi.getProfile());
      expect(second.success).toBe(true);
      expect(second.data!.email).toBe(first.data!.email);
    });

    it("skips cache when skipCache option is true", async () => {
      // Populate cache
      await resolve(UserApi.getProfile());

      // Call with skipCache
      const result = await resolve(
        UserApi.getProfile({ skipCache: true })
      );
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("returns cached profile from localStorage if present", async () => {
      // Manually seed valid cache
      const seededProfile = {
        data: {
          id: "cached-id",
          email: "cached@test.com",
          firstName: "Cached",
          lastName: "User",
          role: "USER",
          isActive: true,
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(seededProfile));

      const result = await resolve(UserApi.getProfile());
      expect(result.success).toBe(true);
      expect(result.data!.id).toBe("cached-id");
      expect(result.data!.email).toBe("cached@test.com");
    });

    it("ignores expired cache", async () => {
      const expired = {
        data: {
          id: "old",
          email: "old@test.com",
          firstName: "Old",
          lastName: "User",
          role: "USER",
          isActive: true,
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago (TTL = 5 min)
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(expired));

      const result = await resolve(UserApi.getProfile());
      expect(result.success).toBe(true);
      // Should NOT use the expired cache
      expect(result.data!.id).not.toBe("old");
    });

    it("handles corrupted cache gracefully", async () => {
      localStorage.setItem(CACHE_KEY, "not-valid-json{{{");
      const result = await resolve(UserApi.getProfile());
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  // ─── clearCache ─────────────────────────────────────────────────────

  describe("clearCache", () => {
    it("removes cached profile from localStorage", () => {
      // Manually seed a valid cache entry
      const cached = {
        data: { id: "test", email: "test@test.com" },
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
      expect(localStorage.getItem(CACHE_KEY)).not.toBeNull();

      UserApi.clearCache();
      expect(localStorage.getItem(CACHE_KEY)).toBeNull();
    });
  });

  // ─── updateProfile ──────────────────────────────────────────────────

  describe("updateProfile", () => {
    it("returns updated profile", async () => {
      const result = await resolve(
        UserApi.updateProfile({ firstName: "Updated" })
      );
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.firstName).toBe("Updated");
    });

    it("merges partial updates with mock profile", async () => {
      const result = await resolve(
        UserApi.updateProfile({ lastName: "NewLast" })
      );
      expect(result.data!.lastName).toBe("NewLast");
      // Other fields should still be present
      expect(result.data!.email).toBeTruthy();
    });
  });

  // ─── uploadAvatar ──────────────────────────────────────────────────

  describe("uploadAvatar", () => {
    it("returns avatar URL on mock fallback", async () => {
      const file = new File(["data"], "avatar.jpg", {
        type: "image/jpeg",
      });
      const result = await resolve(UserApi.uploadAvatar(file));
      expect(result.success).toBe(true);
      expect(result.data).toContain("/avatars/");
    });
  });

  // ─── getOnboardingData ──────────────────────────────────────────────

  describe("getOnboardingData", () => {
    it("returns onboarding data", async () => {
      const result = await resolve(UserApi.getOnboardingData());
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.interests).toBeDefined();
      expect(Array.isArray(result.data!.interests)).toBe(true);
    });

    it("includes cooking level", async () => {
      const result = await resolve(UserApi.getOnboardingData());
      expect(result.data!.cookingLevel).toBeDefined();
    });
  });

  // ─── updateOnboardingData ──────────────────────────────────────────

  describe("updateOnboardingData", () => {
    it("merges partial data with existing", async () => {
      const result = await resolve(
        UserApi.updateOnboardingData({
          cookingLevel: "expert",
        })
      );
      expect(result.success).toBe(true);
      expect(result.data!.cookingLevel).toBe("expert");
      // Other fields preserved
      expect(result.data!.interests).toBeDefined();
    });
  });

  // ─── completeOnboarding ────────────────────────────────────────────

  describe("completeOnboarding", () => {
    it("returns success", async () => {
      const result = await resolve(UserApi.completeOnboarding());
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });

  // ─── updatePreferences ────────────────────────────────────────────

  describe("updatePreferences", () => {
    it("returns updated preferences", async () => {
      const result = await resolve(
        UserApi.updatePreferences({ notifications: false })
      );
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.notifications).toBe(false);
    });

    it("preserves other preference fields", async () => {
      const result = await resolve(
        UserApi.updatePreferences({ cookingLevel: "advanced" })
      );
      expect(result.data!.cookingLevel).toBe("advanced");
      // interests should still be there
      expect(result.data!.interests).toBeDefined();
    });
  });
});
