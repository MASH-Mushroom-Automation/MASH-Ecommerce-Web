// Custom hooks for user data fetching
import { useState, useEffect, useCallback } from "react";
import { UserApi } from "@/lib/api/user";
import { UserProfile, UserOnboardingData } from "@/types/api";

import { getCookieJSON, setCookie, getCookie } from "@/lib/cookies";

// Profile hooks
export function useUserProfile() {
  // Try to hydrate profile from cookie for instant UI update
  const getStoredUser = (): UserProfile | null => {
    try {
      if (typeof globalThis.window !== "undefined") {
        const u = getCookieJSON<UserProfile>("user");
        if (u) return u;
      }
    } catch {
      // ignore parse errors
    }
    return null;
  };

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear profile state - can be called externally
  const clearProfile = useCallback(() => {
    setProfile(null);
    setLoading(false);
    setError(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if user is Firebase-authenticated (Google OAuth)
      // Firebase users don't have backend JWT tokens
      const storedUser = getStoredUser();

      // Determine Firebase user by either an ephemeral session token or the stored profile provider
      const hasFirebaseToken = (typeof globalThis.window !== "undefined") && (
        !!sessionStorage.getItem("firebase-token") ||
        (storedUser && (storedUser as any).authProvider === "FIREBASE_GOOGLE")
      );

      if (hasFirebaseToken && storedUser) {
        // For Firebase users, data is already in cookie storage from AuthContext
        // No need to call backend API (which would return 401)
        console.log('[useUserProfile] Firebase user detected, using cookie-stored profile');
        setProfile(storedUser);
        setLoading(false);
        return;
      }

      // For email/password users, fetch from backend API
      const res = await fetch("/api/user/profile", { method: "GET" });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error || "Failed to fetch profile");
      }
      const data = json?.data ?? json;
      setProfile(data);
      // Update cookie with fresh data (30 day expiry)
      try {
        if (typeof globalThis.window !== "undefined") {
          setCookie("user", data, { maxAge: 60 * 60 * 24 * 30 });
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
        // update cookie
        try {
          setCookie("user", data, { maxAge: 60 * 60 * 24 * 30 });
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
    const storedProfile = getStoredUser();
    if (storedProfile) {
      setProfile(storedProfile);
      setLoading(false);
    }

    fetchProfile();
  }, [fetchProfile]);

  // We rely on cookie-based auth and visibility checks to detect logout (cookies have no storage events)

  // Also check auth cookie periodically to detect logout
  useEffect(() => {
    const checkAuth = () => {
      const hasAuthCookie = document.cookie.includes("auth-token=");
      const hasStoredUser = !!getCookie("user");
      
      // If no auth cookie and no stored user, clear profile
      if (!hasAuthCookie && !hasStoredUser && profile) {
        clearProfile();
      }
    };

    // Check on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [profile, clearProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    uploadAvatar,
    clearProfile,
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
