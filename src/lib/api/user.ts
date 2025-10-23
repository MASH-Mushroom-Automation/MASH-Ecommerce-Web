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
  id: "1",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+63 912 345 6789",
  avatar: "/placeholder.png",
  preferences: {
    interests: ["cooking", "healthy-eating"],
    cookingLevel: "intermediate",
    notifications: true,
  },
};

const MOCK_ONBOARDING_DATA: UserOnboardingData = {
  interests: ["cooking", "healthy-eating", "sustainability"],
  cookingLevel: "intermediate",
  completed: false,
};

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class UserApi {
  // Profile
  static async getProfile(): Promise<ApiResponse<UserProfile>> {
    // If real API is configured, try it first
    if (API_ENDPOINT) {
      const token = getAuthToken();
      // Backend exposes users under /api/v1/users/profile
      const url = `${API_ENDPOINT}/api/v1/users/profile`;
      const { ok, json } = await tryFetch<unknown>(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (ok && json) {
        // Accept either {data: user} or raw user shape
        const data = extractData<UserProfile>(json);
        if (data) return { data, success: true };
      }
    }

    // Fallback to mock
    await delay(300);
    return { data: MOCK_USER_PROFILE, success: true };
  }

  static async updateProfile(
    profile: Partial<UserProfile>
  ): Promise<ApiResponse<UserProfile>> {
    // If real API is configured, try it first
    if (API_ENDPOINT) {
      const token = getAuthToken();
  const url = `${API_ENDPOINT}/api/v1/users/profile`;
      const { ok, json } = await tryFetch<unknown>(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(profile),
      });
      if (ok && json) {
        const data = extractData<UserProfile>(json);
        if (data) return { data, success: true };
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

    const updatedPreferences = {
      ...MOCK_USER_PROFILE.preferences,
      ...preferences,
    };

    return {
      data: updatedPreferences,
      success: true,
    };
  }
}
