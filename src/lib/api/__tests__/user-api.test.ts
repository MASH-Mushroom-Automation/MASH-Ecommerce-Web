/**
 * Tests for UserApi class - lib/api/user.ts
 * Covers: getProfile (cache, real API, mock), updateProfile, uploadAvatar, 
 * getOnboardingData, updateOnboardingData, completeOnboarding, updatePreferences, clearCache
 */

// Mock document.cookie
let mockCookie = "";
Object.defineProperty(document, "cookie", {
  get: () => mockCookie,
  set: (v: string) => { mockCookie = v; },
  configurable: true,
});

const originalFetch = global.fetch;
const originalLocalStorage = global.localStorage;

describe("UserApi", () => {
  let UserApi: any;

  beforeEach(() => {
    jest.resetModules();
    mockCookie = "";
    global.fetch = jest.fn();
    // Mock localStorage
    const store: Record<string, string> = {};
    Object.defineProperty(global, "localStorage", {
      value: {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, val: string) => { store[key] = val; }),
        removeItem: jest.fn((key: string) => { delete store[key]; }),
        clear: jest.fn(() => Object.keys(store).forEach(k => delete store[k])),
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  async function loadModule(envOverrides: Record<string, string> = {}) {
    const origEnv = { ...process.env };
    Object.assign(process.env, envOverrides);
    const mod = await import("@/lib/api/user");
    UserApi = mod.UserApi;
    // Restore env
    Object.keys(envOverrides).forEach(k => {
      if (origEnv[k] !== undefined) process.env[k] = origEnv[k];
      else delete process.env[k];
    });
    return mod;
  }

  describe("getProfile", () => {
    it("should return mock profile when no API endpoint configured", async () => {
      await loadModule({ NEXT_PUBLIC_API_ENDPOINT: "", NEXT_PUBLIC_API_URL: "" });
      const result = await UserApi.getProfile({ skipCache: true });
      expect(result.success).toBe(true);
      expect(result.data.email).toBe("john.doe@example.com");
    });

    it("should return cached profile when cache is valid", async () => {
      await loadModule({ NEXT_PUBLIC_API_ENDPOINT: "", NEXT_PUBLIC_API_URL: "" });
      // First call populates cache
      await UserApi.getProfile({ skipCache: true });
      // Manually set cache
      const cacheData = {
        data: { id: "cached", email: "cached@test.com" },
        timestamp: Date.now(),
      };
      (localStorage.setItem as jest.Mock).mockImplementation(() => {});
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(cacheData));
      const result = await UserApi.getProfile();
      expect(result.data.email).toBe("cached@test.com");
    });

    it("should skip cache when skipCache option is true", async () => {
      await loadModule({ NEXT_PUBLIC_API_ENDPOINT: "", NEXT_PUBLIC_API_URL: "" });
      const result = await UserApi.getProfile({ skipCache: true });
      expect(result.success).toBe(true);
    });

    it("should try real API when endpoint is configured", async () => {
      await loadModule({ NEXT_PUBLIC_API_ENDPOINT: "https://api.test.com" });
      // Set auth token in cookie
      mockCookie = "auth-token=jwt-abc123";
      // Set user in localStorage
      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === "user") return JSON.stringify({ id: "user-1" });
        return null;
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { id: "user-1", email: "real@test.com" } }),
      });
      const result = await UserApi.getProfile({ skipCache: true });
      expect(result.success).toBe(true);
      expect(result.data.email).toBe("real@test.com");
    });

    it("should fall back to mock when API call fails", async () => {
      await loadModule({ NEXT_PUBLIC_API_ENDPOINT: "https://api.test.com" });
      mockCookie = "auth-token=jwt-abc123";
      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === "user") return JSON.stringify({ id: "user-1" });
        return null;
      });
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
      const result = await UserApi.getProfile({ skipCache: true });
      expect(result.success).toBe(true);
      expect(result.data.email).toBe("john.doe@example.com");
    });

    it("should fall back to mock when no userId available", async () => {
      await loadModule({ NEXT_PUBLIC_API_ENDPOINT: "https://api.test.com" });
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      mockCookie = "";
      const result = await UserApi.getProfile({ skipCache: true });
      expect(result.success).toBe(true);
      expect(result.data.email).toBe("john.doe@example.com");
    });

    it("should extract userId from JWT token when localStorage has no user", async () => {
      await loadModule({ NEXT_PUBLIC_API_ENDPOINT: "https://api.test.com" });
      const payload = Buffer.from(JSON.stringify({ sub: "jwt-user-1" })).toString("base64");
      mockCookie = `auth-token=header.${payload}.signature`;
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { id: "jwt-user-1", email: "jwt@test.com" } }),
      });
      const result = await UserApi.getProfile({ skipCache: true });
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("jwt-user-1"),
        expect.anything(),
      );
    });
  });

  describe("clearCache", () => {
    it("should clear profile cache from localStorage", async () => {
      await loadModule({});
      UserApi.clearCache();
      expect(localStorage.removeItem).toHaveBeenCalledWith("user-profile-cache");
    });
  });

  describe("updateProfile", () => {
    it("should update profile and return updated data (mock)", async () => {
      await loadModule({ NEXT_PUBLIC_API_ENDPOINT: "", NEXT_PUBLIC_API_URL: "" });
      const result = await UserApi.updateProfile({ firstName: "Jane" });
      expect(result.success).toBe(true);
      expect(result.data.firstName).toBe("Jane");
    });

    it("should call real API when endpoint configured", async () => {
      await loadModule({ NEXT_PUBLIC_API_ENDPOINT: "https://api.test.com" });
      mockCookie = "auth-token=jwt-abc123";
      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === "user") return JSON.stringify({ id: "user-1" });
        return null;
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { id: "user-1", firstName: "Updated" } }),
      });
      const result = await UserApi.updateProfile({ firstName: "Updated" });
      expect(result.success).toBe(true);
      expect(result.data.firstName).toBe("Updated");
    });

    it("should fall back to mock when no userId", async () => {
      await loadModule({ NEXT_PUBLIC_API_ENDPOINT: "https://api.test.com" });
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      mockCookie = "";
      const result = await UserApi.updateProfile({ firstName: "Mock" });
      expect(result.success).toBe(true);
    });
  });

  describe("uploadAvatar", () => {
    it("should return mock avatar URL when no API endpoint", async () => {
      await loadModule({ NEXT_PUBLIC_API_ENDPOINT: "", NEXT_PUBLIC_API_URL: "" });
      const file = new File(["data"], "avatar.jpg", { type: "image/jpeg" });
      const result = await UserApi.uploadAvatar(file);
      expect(result.success).toBe(true);
      expect(result.data).toContain("/avatars/");
    });

    it("should upload to real API when endpoint configured", async () => {
      await loadModule({ NEXT_PUBLIC_API_ENDPOINT: "https://api.test.com" });
      mockCookie = "auth-token=jwt-abc123";
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: "https://cdn.test.com/avatar.jpg" }),
      });
      const file = new File(["data"], "avatar.jpg", { type: "image/jpeg" });
      const result = await UserApi.uploadAvatar(file);
      expect(result.success).toBe(true);
      expect(result.data).toBe("https://cdn.test.com/avatar.jpg");
    });
  });

  describe("getOnboardingData", () => {
    it("should return mock onboarding data", async () => {
      await loadModule({});
      const result = await UserApi.getOnboardingData();
      expect(result.success).toBe(true);
      expect(result.data.interests).toContain("cooking");
      expect(result.data.completed).toBe(false);
    });
  });

  describe("updateOnboardingData", () => {
    it("should merge data with mock onboarding data", async () => {
      await loadModule({});
      const result = await UserApi.updateOnboardingData({ completed: true });
      expect(result.success).toBe(true);
      expect(result.data.completed).toBe(true);
    });
  });

  describe("completeOnboarding", () => {
    it("should return success", async () => {
      await loadModule({});
      const result = await UserApi.completeOnboarding();
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });

  describe("updatePreferences", () => {
    it("should merge preferences with defaults", async () => {
      await loadModule({});
      const result = await UserApi.updatePreferences({ notifications: false });
      expect(result.success).toBe(true);
      expect(result.data.notifications).toBe(false);
      expect(result.data.interests).toBeDefined();
    });
  });
});
