/**
 * Username Generation Utilities
 * Generates unique usernames from email/name with availability checking
 */

import { apiRequest } from "@/lib/api-client";

/**
 * Generate username from email or name
 * @param email - User's email address
 * @param firstName - User's first name (optional)
 * @param lastName - User's last name (optional)
 * @returns Sanitized username
 */
export function generateUsername(
  email: string,
  firstName?: string,
  lastName?: string
): string {
  let username = '';
  
  // Try to use first name + last name
  if (firstName && lastName) {
    username = `${firstName}${lastName}`.toLowerCase();
  } else if (firstName) {
    username = firstName.toLowerCase();
  } else {
    // Fallback to email prefix (before @)
    username = email.split('@')[0];
  }
  
  // Sanitize: remove special chars, replace spaces/dots/hyphens with underscores
  username = username
    .replace(/[^a-z0-9_-]/g, '') // Remove special chars except underscore and hyphen
    .replace(/[\s.+-]+/g, '_')   // Replace spaces, dots, plus, hyphen with underscore
    .replace(/_{2,}/g, '_')      // Replace multiple underscores with single
    .replace(/^_|_$/g, '')       // Remove leading/trailing underscores
    .substring(0, 30);           // Max 30 chars
  
  return username || 'user'; // Fallback if completely invalid
}

/**
 * Check if username is available
 * @param username - Username to check
 * @returns Promise<boolean>
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  try {
    const response = await apiRequest<{ available: boolean }>(
      `/auth/check-username?username=${encodeURIComponent(username)}`
    );
    return response.available;
  } catch (error) {
    console.error("Error checking username availability:", error);
    // If API fails, assume unavailable to be safe
    return false;
  }
}

/**
 * Generate unique username by adding random numbers if taken
 * @param baseUsername - Base username to start with
 * @param maxAttempts - Maximum number of attempts (default: 10)
 * @returns Promise<string> - Available unique username
 */
export async function generateUniqueUsername(
  baseUsername: string,
  maxAttempts: number = 10
): Promise<string> {
  let username = baseUsername;
  let isAvailable = await isUsernameAvailable(username);
  
  // If taken, add random numbers
  let attempts = 0;
  while (!isAvailable && attempts < maxAttempts) {
    const random = Math.floor(Math.random() * 10000);
    username = `${baseUsername}${random}`;
    isAvailable = await isUsernameAvailable(username);
    attempts++;
  }
  
  // If still not available after max attempts, add timestamp
  if (!isAvailable) {
    username = `${baseUsername}${Date.now() % 100000}`;
  }
  
  return username;
}

/**
 * Validate username format
 * @param username - Username to validate
 * @returns Object with validation result and error message
 */
export function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  if (!username || username.length < 3) {
    return {
      valid: false,
      error: "Username must be at least 3 characters long",
    };
  }
  
  if (username.length > 30) {
    return {
      valid: false,
      error: "Username must be at most 30 characters long",
    };
  }
  
  if (!/^[a-z0-9_-]+$/.test(username)) {
    return {
      valid: false,
      error: "Username can only contain lowercase letters, numbers, underscores, and hyphens",
    };
  }
  
  if (/^[_-]|[_-]$/.test(username)) {
    return {
      valid: false,
      error: "Username cannot start or end with underscore or hyphen",
    };
  }
  
  return { valid: true };
}

/**
 * Format username for display (e.g., add @ prefix)
 * @param username - Username to format
 * @returns Formatted username
 */
export function formatUsername(username: string): string {
  return `@${username}`;
}

/**
 * Extract username from display name (remove @ prefix)
 * @param displayName - Display name with @ prefix
 * @returns Raw username
 */
export function extractUsername(displayName: string): string {
  return displayName.replace(/^@/, '');
}
