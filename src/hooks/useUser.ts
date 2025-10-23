// Custom hooks for user data fetching
import { useState, useEffect, useCallback } from "react";
import { UserApi } from "@/lib/api/user";
import { UserProfile, UserOnboardingData, ApiResponse } from "@/types/api";

// Profile hooks
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await UserApi.getProfile();
      setProfile(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (profileData: Partial<UserProfile>) => {
      try {
        const response = await UserApi.updateProfile(profileData);
        setProfile(response.data);
        return response;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to update profile"
        );
      }
    },
    []
  );

  const uploadAvatar = useCallback(async (file: File) => {
    try {
      const response = await UserApi.uploadAvatar(file);
      setProfile((prev) => (prev ? { ...prev, avatar: response.data } : null));
      return response;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to upload avatar"
      );
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
