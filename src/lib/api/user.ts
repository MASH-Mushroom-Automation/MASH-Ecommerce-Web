// API functions for user-related operations
import { UserProfile, UserOnboardingData, ApiResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

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
    await delay(300);

    return {
      data: MOCK_USER_PROFILE,
      success: true,
    };
  }

  static async updateProfile(
    profile: Partial<UserProfile>
  ): Promise<ApiResponse<UserProfile>> {
    await delay(300);

    const updatedProfile = { ...MOCK_USER_PROFILE, ...profile };

    return {
      data: updatedProfile,
      success: true,
    };
  }

  static async uploadAvatar(file: File): Promise<ApiResponse<string>> {
    await delay(500);

    // Mock file upload
    const avatarUrl = `/avatars/${Date.now()}.jpg`;

    return {
      data: avatarUrl,
      success: true,
    };
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
