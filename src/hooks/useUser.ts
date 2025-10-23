// Custom hooks for user data fetching
import { useState, useEffect, useCallback } from "react";
import { UserApi } from "@/lib/api/user";
import { UserProfile, UserOnboardingData, ApiResponse } from "@/types/api";

// Profile hooks
export function useUserProfile() {
  // Try to hydrate profile from storage for instant UI update after login
  const getStoredUser = (): UserProfile | null => {
    try {
      if (typeof window !== "undefined") {
        const s = sessionStorage.getItem("user") || localStorage.getItem("user");
        if (s) return JSON.parse(s) as UserProfile;
      }
    } catch {
      // ignore parse errors
    }
    return null;
  };

  const [profile, setProfile] = useState<UserProfile | null>(getStoredUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Prefer hitting the local API route which proxies to the backend and
      // attaches auth from cookies (avoids CORS and ensures server-side auth).
      const res = await fetch("/api/user/profile", { method: "GET" });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error || "Failed to fetch profile");
      }
      const data = json?.data ?? json;
      setProfile(data);
      // Update storage with fresh data
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data));
          sessionStorage.setItem("user", JSON.stringify(data));
        }
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
      // Keep the profile from storage if API fails (don't set to null)
      // Only log the error but preserve the existing profile data
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (profileData: Partial<UserProfile>) => {
      try {
        const res = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profileData),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || "Failed to update profile");
        const data = json?.data ?? json;
        setProfile(data);
        // update storage
        try {
          localStorage.setItem("user", JSON.stringify(data));
          sessionStorage.setItem("user", JSON.stringify(data));
        } catch {}
        return { data, success: true };
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to update profile");
      }
    },
    []
  );

  const uploadAvatar = useCallback(async (file: File) => {
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: form,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to upload avatar");
      const data = json?.data ?? json;
      setProfile((prev) => (prev ? { ...prev, avatar: data } : null));
      return { data, success: true };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to upload avatar");
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    uploadAvatar,
  };
}

// Onboarding hooks
export function useUserOnboarding() {
  const [onboardingData, setOnboardingData] =
    useState<UserOnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOnboardingData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await UserApi.getOnboardingData();
      setOnboardingData(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch onboarding data"
      );
      setOnboardingData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOnboardingData = useCallback(
    async (data: Partial<UserOnboardingData>) => {
      try {
        const response = await UserApi.updateOnboardingData(data);
        setOnboardingData(response.data);
        return response;
      } catch (err) {
        throw new Error(
          err instanceof Error
            ? err.message
            : "Failed to update onboarding data"
        );
      }
    },
    []
  );

  const completeOnboarding = useCallback(async () => {
    try {
      const response = await UserApi.completeOnboarding();
      setOnboardingData((prev) => (prev ? { ...prev, completed: true } : null));
      return response;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to complete onboarding"
      );
    }
  }, []);

  useEffect(() => {
    fetchOnboardingData();
  }, [fetchOnboardingData]);

  return {
    onboardingData,
    loading,
    error,
    refetch: fetchOnboardingData,
    updateOnboardingData,
    completeOnboarding,
  };
}

// Preferences hooks
export function useUserPreferences() {
  const [preferences, setPreferences] = useState<
    UserProfile["preferences"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const profileResponse = await UserApi.getProfile();
      setPreferences(profileResponse.data.preferences);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch preferences"
      );
      setPreferences(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(
    async (prefs: Partial<UserProfile["preferences"]>) => {
      try {
        const response = await UserApi.updatePreferences(prefs);
        setPreferences(response.data);
        return response;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to update preferences"
        );
      }
    },
    []
  );

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    refetch: fetchPreferences,
    updatePreferences,
  };
}
