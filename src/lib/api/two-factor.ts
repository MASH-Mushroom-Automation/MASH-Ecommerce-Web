/**
 * Two-Factor Authentication API Client
 *
 * Frontend API client for managing 2FA operations.
 * Uses apiRequest from api-client which auto-includes auth headers.
 *
 * Endpoints proxied through Next.js API routes:
 * - POST /auth/2fa/enable   -> Enable 2FA for current user
 * - POST /auth/2fa/disable  -> Disable 2FA (requires OTP confirmation)
 * - POST /auth/2fa/verify   -> Verify OTP during login
 * - POST /auth/2fa/send     -> Send/resend OTP to phone
 */

import { apiRequest } from "../api-client";
import type { LoginResponse } from "./auth";

// ── Response Types ──────────────────────────────────────────────────────────

export interface TwoFactorApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    emailVerified: boolean;
  };
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
}

export interface TwoFactorSendResponse {
  success: boolean;
  message: string;
  phoneNumber?: string;
  expiresAt?: string;
  expiresIn?: number;
}

// ── API Client ──────────────────────────────────────────────────────────────

export const TwoFactorApi = {
  /**
   * Enable 2FA for the currently authenticated user.
   * Requires an active auth session (token in cookie).
   * @returns Promise with success status
   */
  enable: async (): Promise<TwoFactorApiResponse> => {
    return apiRequest<TwoFactorApiResponse>("/auth/2fa/enable", {
      method: "POST",
    });
  },

  /**
   * Disable 2FA for the currently authenticated user.
   * Requires OTP confirmation to prevent unauthorized disabling.
   * @param code - 6-digit OTP code to confirm identity
   * @returns Promise with success status
   */
  disable: async (code: string): Promise<TwoFactorApiResponse> => {
    return apiRequest<TwoFactorApiResponse>("/auth/2fa/disable", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },

  /**
   * Verify a 2FA OTP code during login flow.
   * Uses the temporary token issued after email/password authentication.
   * @param code - 6-digit OTP code
   * @param tempToken - Temporary token from initial login
   * @param rememberDevice - Whether to trust this device for future logins
   * @returns Promise with auth tokens and user data (same as LoginResponse)
   */
  verify: async (
    code: string,
    tempToken: string,
    rememberDevice: boolean = false
  ): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>("/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ code, tempToken, rememberDevice }),
    });
  },

  /**
   * Send (or resend) an OTP code to the user's phone for 2FA login.
   * @param tempToken - Temporary token from initial login
   * @returns Promise with send confirmation
   */
  sendOTP: async (tempToken: string): Promise<TwoFactorSendResponse> => {
    return apiRequest<TwoFactorSendResponse>("/auth/2fa/send", {
      method: "POST",
      body: JSON.stringify({ tempToken }),
    });
  },
};
