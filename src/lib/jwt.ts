/**
 * JWT Token Utilities
 * Helper functions to decode and extract information from JWT tokens
 */

/**
 * Decode JWT token without verification
 * Note: This does NOT verify the signature - use only for extracting payload data
 * Works in both browser and Node.js environments
 */
export function decodeJWT(token: string): {
  sub?: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
} | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Base64 URL decode - handle both browser and Node.js
    let decoded: string;
    if (typeof Buffer !== "undefined") {
      // Node.js environment
      decoded = Buffer.from(payload, "base64url").toString("utf-8");
    } else {
      // Browser environment - use atob with URL-safe base64 conversion
      // Convert base64url to base64
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      // Add padding if needed
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      decoded = atob(padded);
    }
    
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

/**
 * Extract user ID from JWT token
 * The user ID is typically in the 'sub' (subject) field
 */
export function getUserIdFromToken(token: string): string | null {
  const decoded = decodeJWT(token);
  return decoded?.sub || null;
}

/**
 * Extract user email from JWT token
 */
export function getEmailFromToken(token: string): string | null {
  const decoded = decodeJWT(token);
  return decoded?.email || null;
}

/**
 * Extract user role from JWT token
 */
export function getRoleFromToken(token: string): string | null {
  const decoded = decodeJWT(token);
  return decoded?.role || null;
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true; // Consider expired if no expiration time
  }

  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  return Date.now() >= expirationTime;
}

