/**
 * Backend API Client for MASH
 * Handles communication between Clerk frontend and NestJS backend
 */

const BACKEND_API_URL =
  process.env.CLERK_BACKEND_API ||
  "https://mash-backend-api-production.up.railway.app/api/v1";

export interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  clerkId?: string;
  googleId?: string;
  hasPassword: boolean;
  linkedProviders: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OAuthLinkResponse {
  success: boolean;
  message: string;
  user?: BackendUser;
}

export interface OAuthStatusResponse {
  success: boolean;
  data: {
    linkedProviders: string[];
    hasPassword: boolean;
    canUnlinkProvider: boolean;
  };
}

export class BackendAPI {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || BACKEND_API_URL;
  }

  /**
   * Get authentication headers with Clerk token
   */
  private async getHeaders(clerkToken?: string): Promise<HeadersInit> {
    return {
      "Content-Type": "application/json",
      ...(clerkToken && { Authorization: `Bearer ${clerkToken}` }),
    };
  }

  /**
   * Get user profile from backend
   */
  async getUser(clerkToken: string): Promise<BackendUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: await this.getHeaders(clerkToken),
      });

      if (!response.ok) {
        console.error("Failed to fetch user from backend:", response.status);
        return null;
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error fetching user from backend:", error);
      return null;
    }
  }

  /**
   * Get OAuth account status (linked providers, can unlink, etc.)
   */
  async getOAuthStatus(clerkToken: string): Promise<OAuthStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/social/status`, {
        headers: await this.getHeaders(clerkToken),
      });

      if (!response.ok) {
        return {
          success: false,
          data: {
            linkedProviders: [],
            hasPassword: false,
            canUnlinkProvider: false,
          },
        };
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching OAuth status:", error);
      return {
        success: false,
        data: {
          linkedProviders: [],
          hasPassword: false,
          canUnlinkProvider: false,
        },
      };
    }
  }

  /**
   * Link Google account to existing backend user
   */
  async linkGoogleAccount(
    clerkToken: string,
    googleAccessToken: string
  ): Promise<OAuthLinkResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/social/link/google`, {
        method: "POST",
        headers: await this.getHeaders(clerkToken),
        body: JSON.stringify({ accessToken: googleAccessToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Failed to link Google account",
        };
      }

      return {
        success: true,
        message: "Google account linked successfully",
        user: data.data || data.user,
      };
    } catch (error) {
      console.error("Error linking Google account:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to link account",
      };
    }
  }

  /**
   * Unlink social provider from backend user
   */
  async unlinkSocialAccount(
    clerkToken: string,
    provider: string
  ): Promise<OAuthLinkResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/auth/social/unlink/${provider}`,
        {
          method: "DELETE",
          headers: await this.getHeaders(clerkToken),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `Failed to unlink ${provider}`,
        };
      }

      return {
        success: true,
        message: `${provider} account unlinked successfully`,
        user: data.data || data.user,
      };
    } catch (error) {
      console.error(`Error unlinking ${provider}:`, error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to unlink account",
      };
    }
  }

  /**
   * Sync Clerk user with backend (called after Clerk sign-up/sign-in)
   */
  async syncClerkUser(
    clerkToken: string,
    userData: {
      clerkId: string;
      email: string;
      firstName: string;
      lastName: string;
      googleId?: string;
    }
  ): Promise<BackendUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/clerk-sync`, {
        method: "POST",
        headers: await this.getHeaders(clerkToken),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        console.error("Failed to sync user with backend:", response.status);
        return null;
      }

      const data = await response.json();
      return data.data || data.user;
    } catch (error) {
      console.error("Error syncing user with backend:", error);
      return null;
    }
  }
}

// Export singleton instance
export const backendAPI = new BackendAPI();
