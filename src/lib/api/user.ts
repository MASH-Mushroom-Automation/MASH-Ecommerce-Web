// API functions for user-related operations (hybrid: real endpoint if available, else mock)
import { UserProfile, UserOnboardingData, ApiResponse } from "@/types/api";

// Prefer NEXT_PUBLIC_API_ENDPOINT (used elsewhere) and fall back to NEXT_PUBLIC_API_URL
const API_ENDPOINT =
  process.env.NEXT_PUBLIC_API_ENDPOINT || process.env.NEXT_PUBLIC_API_URL;

function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Get user ID from localStorage or JWT token
 */
function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  
  // Try to get from localStorage user object
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.id) {
        console.log("[UserApi] Got user ID from localStorage:", parsed.id);
        return parsed.id;
      }
    }
  } catch {
    // Ignore parse errors
  }
  
  // Try to decode from JWT token
  try {
    const token = getAuthToken();
    if (token) {
      // JWT structure: header.payload.signature
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        // Backend typically uses 'sub' for user ID
        if (payload.sub) {
          console.log("[UserApi] Got user ID from JWT (sub):", payload.sub);
          return payload.sub;
        }
        if (payload.userId) {
          console.log("[UserApi] Got user ID from JWT (userId):", payload.userId);
          return payload.userId;
        }
        if (payload.id) {
          console.log("[UserApi] Got user ID from JWT (id):", payload.id);
          return payload.id;
        }
      }
    }
  } catch {
    // Ignore decode errors
  }
  
  console.warn("[UserApi] Could not get user ID");
  return null;
}

async function tryFetch<T = unknown>(
  input: string,
  init?: RequestInit
): Promise<{ ok: boolean; json: T | null; status: number }> {
  try {
    const res = await fetch(input, init);
    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }
    return { ok: res.ok, json: json as T | null, status: res.status };
  } catch {
    return { ok: false, json: null, status: 0 };
  }
}

function extractData<T>(json: unknown): T | null {
  if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(obj, "data")) {
      return obj.data as T;
    }
    return json as T;
  }
  return null;
}

// Mock data for user operations
const MOCK_USER_PROFILE: UserProfile = {
  // Core fields
  id: "1",
  clerkId: "user_2abcdefghijklmnop123", // Mock Clerk ID
  email: "john.doe@example.com",
  username: "johndoe",
  firstName: "John",
  lastName: "Doe",

  // Authorization
  role: "USER", // Default role
  isActive: true,
  twoFactorEnabled: false,

  // Phone number
  phoneNumber: "+1234567890",

  // Additional fields (legacy)
  phone: "+1234567890", // @deprecated
  avatar: "/placeholder-avatar.png",

  // Frontend computed fields
  sellerStatus: "none", // Not a seller yet
  isSeller: false, // @deprecated

  // Metadata
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  // Custom preferences
  preferences: {
    interests: ["cooking", "healthy-eating"],
    cookingLevel: "intermediate",
    notifications: true,
  },
};

// Profile cache
const CACHE_KEY = "user-profile-cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CachedProfile {
  data: UserProfile;
  timestamp: number;
}

function getCachedProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp }: CachedProfile = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - timestamp < CACHE_TTL) {
      console.log("[UserApi] Using cached profile");
      return data;
    }

    // Cache expired
    console.log("[UserApi] Cache expired");
    return null;
  } catch {
    return null;
  }
}

function setCachedProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    const cached: CachedProfile = {
      data: profile,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    console.log("[UserApi] Profile cached");
  } catch {
    // Ignore storage errors
  }
}

function clearProfileCache(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log("[UserApi] Cache cleared");
  } catch {
    // Ignore storage errors
  }
}

const MOCK_ONBOARDING_DATA: UserOnboardingData = {
  interests: ["cooking", "healthy-eating", "sustainability"],
  cookingLevel: "intermediate",
  completed: false,
};

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class UserApi {
  // Profile
  static async getProfile(options?: {
    skipCache?: boolean;
  }): Promise<ApiResponse<UserProfile>> {
    console.log("[UserApi] getProfile called", { skipCache: options?.skipCache });
    
    // Check cache first (unless skipCache is true)
    if (!options?.skipCache) {
      const cached = getCachedProfile();
      if (cached) {
        console.log("[UserApi] Returning cached profile:", cached);
        return { data: cached, success: true };
      }
    }

    console.log("[UserApi] API_ENDPOINT:", API_ENDPOINT);
    
    // If real API is configured, try it first
    if (API_ENDPOINT) {
      const token = getAuthToken();
      const userId = getUserId();
      console.log("[UserApi] Auth token present:", !!token);
      console.log("[UserApi] User ID:", userId);
      
      if (!userId) {
        console.warn("[UserApi] No user ID available, falling back to mock");
        await delay(300);
        return { data: MOCK_USER_PROFILE, success: true };
      }
      
      // Backend expects /api/v1/users/:id/profile
      const url = `${API_ENDPOINT}/api/v1/users/${userId}/profile`;
      console.log("[UserApi] Fetching from:", url);
      
      const { ok, json, status } = await tryFetch<unknown>(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      console.log("[UserApi] Response:", { ok, status, json });
      
      if (ok && json) {
        // Accept either {data: user} or raw user shape
        const data = extractData<UserProfile>(json);
        console.log("[UserApi] Extracted data:", data);
        
        if (data) {
          // Cache the profile
          setCachedProfile(data);
          return { data, success: true };
        } else {
          console.warn("[UserApi] Failed to extract data from response");
        }
      } else {
        console.warn("[UserApi] API request failed:", { ok, status });
      }
    } else {
      console.warn("[UserApi] No API_ENDPOINT configured");
    }

    // Fallback to mock
    console.log("[UserApi] Falling back to mock data");
    await delay(300);
    return { data: MOCK_USER_PROFILE, success: true };
  }

  // Clear cache (call after logout)
  static clearCache(): void {
    clearProfileCache();
  }

  static async updateProfile(
    profile: Partial<UserProfile>
  ): Promise<ApiResponse<UserProfile>> {
    console.log("[UserApi] updateProfile called with:", profile);
    
    // If real API is configured, try it first
    if (API_ENDPOINT) {
      const token = getAuthToken();
      const userId = getUserId();
      
      if (!userId) {
        console.warn("[UserApi] No user ID available for update");
        // Fallback to mock
        await delay(300);
        const updatedProfile = { ...MOCK_USER_PROFILE, ...profile };
        return { data: updatedProfile, success: true };
      }
      
      // Backend expects /api/v1/users/:id/profile
      const url = `${API_ENDPOINT}/api/v1/users/${userId}/profile`;
      console.log("[UserApi] Updating profile at:", url);
      
      const { ok, json, status } = await tryFetch<unknown>(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(profile),
      });
      
      console.log("[UserApi] Update response:", { ok, status, json });
      
      if (ok && json) {
        const data = extractData<UserProfile>(json);
        if (data) {
          // Update cache with new data
          setCachedProfile(data);
          return { data, success: true };
        }
      }
    }

    // Fallback to mock
    await delay(300);
    const updatedProfile = { ...MOCK_USER_PROFILE, ...profile };
    return { data: updatedProfile, success: true };
  }

  static async uploadAvatar(file: File): Promise<ApiResponse<string>> {
    // If real API is configured, try it first
    if (API_ENDPOINT) {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("file", file);
      const url = `${API_ENDPOINT}/api/v1/user/avatar`;
      const { ok, json } = await tryFetch<unknown>(url, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      if (ok && json) {
        // Accept either {data: url} or raw string url
        const data = extractData<string>(json);
        if (data) return { data, success: true };
      }
    }

    // Fallback to mock
    await delay(500);
    const avatarUrl = `/avatars/${Date.now()}.jpg`;
    return { data: avatarUrl, success: true };
  }

  // Onboarding
  static async getOnboardingData(): Promise<ApiResponse<UserOnboardingData>> {
    await delay(200);

    return {
      data: MOCK_ONBOARDING_DATA,
      success: true,
    };
  }

  static async updateOnboardingData(
    data: Partial<UserOnboardingData>
  ): Promise<ApiResponse<UserOnboardingData>> {
    await delay(300);

    const updatedData = { ...MOCK_ONBOARDING_DATA, ...data };

    return {
      data: updatedData,
      success: true,
    };
  }

  static async completeOnboarding(): Promise<ApiResponse<boolean>> {
    await delay(300);

    return {
      data: true,
      success: true,
    };
  }

  // Preferences
  static async updatePreferences(
    preferences: Partial<UserProfile["preferences"]>
  ): Promise<ApiResponse<UserProfile["preferences"]>> {
    await delay(200);

    const basePreferences = MOCK_USER_PROFILE.preferences ?? {
      interests: [],
      cookingLevel: "beginner",
      notifications: true,
    };

    const updatedPreferences = {
      ...basePreferences,
      ...preferences,
    };

    return {
      data: updatedPreferences,
      success: true,
    };
  }
}
