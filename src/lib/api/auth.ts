import { apiRequest } from "../api-client";
import { setAuthToken, logout } from "../auth";

// Types
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username?: string;    // Auto-generated from email/name
  imageUrl?: string;    // DiceBear avatar URL
}

export interface GoogleSyncRequest {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  photoURL?: string;
  username?: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResendCodeRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

// Response Types
export interface RegisterResponse {
  success: boolean;
  statusCode: number;
  data: {
    success: boolean;
    message: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      emailVerified: boolean;
    };
    verification: {
      sent: boolean;
      method: string;
      expiresIn: string;
      email: string;
    };
    nextStep: string;
  };
}

export interface VerifyCodeResponse {
  success: boolean;
  statusCode: number;
  data: {
    success: boolean;
    message: string;
    token: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      emailVerified: boolean;
      role: string;
    };
  };
}

export interface LoginResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      emailVerified: boolean;
    };
  };
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    emailVerified: boolean;
  };
}

export interface ForgotPasswordResponse {
  success: boolean;
  statusCode: number;
  data: {
    success: boolean;
    message: string;
  };
}

export interface ResendCodeResponse {
  success: boolean;
  statusCode: number;
  data: {
    success: boolean;
    message: string;
    expiresIn: string;
    email: string;
  };
}

export interface ResetPasswordResponse {
  success: boolean;
  statusCode: number;
  data: {
    success: boolean;
    message: string;
  };
}

// Auth API Service
export const AuthApi = {
  /**   * Sync Google OAuth user to PostgreSQL database
   * @param data - Google user data from Firebase
   * @returns Promise with user and JWT tokens
   */
  syncGoogleUser: async (data: GoogleSyncRequest): Promise<any> => {
    const response = await apiRequest<any>("/auth/google/sync", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Store tokens automatically
    if (response.data?.tokens?.accessToken) {
      setAuthToken(response.data.tokens.accessToken, true);
    }

    // Store refresh token
    if (response.data?.tokens?.refreshToken) {
      localStorage.setItem("refreshToken", response.data.tokens.refreshToken);
    }

    // Store user data
    if (response.data?.user || response.user) {
      const user = response.data?.user || response.user;
      localStorage.setItem("user", JSON.stringify(user));
    }

    return response;
  },

  /**   * Register a new user account
   * @param data - User registration data
   * @returns Promise<RegisterResponse>
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return apiRequest<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Verify email with 6-digit code
   * @param data - Email and verification code
   * @returns Promise<VerifyCodeResponse>
   */
  verifyEmailCode: async (
    data: VerifyCodeRequest
  ): Promise<VerifyCodeResponse> => {
    const response = await apiRequest<VerifyCodeResponse>(
      "/auth/verify-email-code",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    // Store token automatically
    if (response.data?.token) {
      setAuthToken(response.data.token, true);
    }

    // Store user data
    if (response.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response;
  },

  /**
   * Resend verification code to email
   * @param data - Email address
   * @returns Promise<ResendCodeResponse>
   */
  resendVerificationCode: async (
    data: ResendCodeRequest
  ): Promise<ResendCodeResponse> => {
    return apiRequest<ResendCodeResponse>("/auth/resend-verification-code", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Login with email and password
   * @param data - Email and password
   * @returns Promise<LoginResponse>
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Handle both response formats (nested data or direct)
    const accessToken = response.data?.accessToken || response.accessToken;
    const refreshToken = response.data?.refreshToken || response.refreshToken;
    const user = response.data?.user || response.user;

    // Store tokens automatically
    if (accessToken) {
      setAuthToken(accessToken, true);
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    // Store user data
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    return response;
  },

  /**
   * Request password reset code
   * @param data - Email address
   * @returns Promise<ForgotPasswordResponse>
   */
  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> => {
    return apiRequest<ForgotPasswordResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Reset password with code
   * @param data - Email, code, and new password
   * @returns Promise<ResetPasswordResponse>
   */
  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> => {
    return apiRequest<ResetPasswordResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Logout user (clear tokens and session)
   */
  logout: () => {
    logout();
  },

  /**
   * Get current user from localStorage
   * @returns User object or null
   */
  getCurrentUser: () => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   * @returns boolean
   */
  isAuthenticated: () => {
    if (typeof document === "undefined") return false;
    return document.cookie.includes("auth-token=");
  },
  /**
   * Check if username is available
   * @param username - Username to check
   * @returns Promise<{ available: boolean; username: string }>
   */
  checkUsername: async (username: string): Promise<{ available: boolean; username: string }> => {
    return apiRequest<{ available: boolean; username: string }>(
      `/auth/check-username?username=${encodeURIComponent(username)}`
    );
  },};
