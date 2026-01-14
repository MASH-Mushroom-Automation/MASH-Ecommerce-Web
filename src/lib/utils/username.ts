/**
 * Username Generation Utilities
 * Simple username extraction from email (no availability checking)
 */

/**
 * Generate username from email only (part before @)
 * @param email - User's email address
 * @returns Sanitized username from email prefix
 * 
 * Example: ppnamias@gmail.com → ppnamias
 */
export function generateUsername(email: string): string {
  // Extract part before @ symbol
  const emailPrefix = email.split('@')[0];
  
  // Sanitize: remove special chars, keep only alphanumeric and underscore
  const username = emailPrefix
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')  // Remove all special chars except underscore
    .replace(/_{2,}/g, '_')      // Replace multiple underscores with single
    .replace(/^_|_$/g, '')       // Remove leading/trailing underscores
    .substring(0, 30);           // Max 30 chars
  
  return username || 'user'; // Fallback if completely invalid
}

/**
 * DEPRECATED: No longer checking username availability
 * Backend will handle conflicts with auto-generated usernames
 */
export async function generateUniqueUsername(baseUsername: string): Promise<string> {
  // Simply return the base username - no API checks
  // Backend will handle conflicts if username exists
  return baseUsername;
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
