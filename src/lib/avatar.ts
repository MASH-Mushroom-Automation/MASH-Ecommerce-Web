/**
 * Avatar utility functions
 * Provides consistent avatar URL generation across the application
 * using DiceBear API for username-based avatars
 */

// DiceBear configuration
const DICEBEAR_BASE_URL = "https://api.dicebear.com/9.x";
const DICEBEAR_STYLE = "bottts-neutral"; // Robot style avatars
const FALLBACK_AVATAR = "/profile_placeholder.png";

/**
 * Generate a DiceBear avatar URL based on a seed
 * @param seed - The seed for generating a unique avatar (username, email prefix, or user id)
 * @param style - Optional DiceBear style (defaults to bottts-neutral)
 * @returns DiceBear avatar URL
 */
export function getDiceBearAvatar(seed: string, style: string = DICEBEAR_STYLE): string {
  if (!seed) return FALLBACK_AVATAR;
  
  // Sanitize the seed - lowercase and replace spaces with dashes
  const sanitizedSeed = seed.toLowerCase().replace(/\s+/g, '-');
  
  return `${DICEBEAR_BASE_URL}/${style}/svg?seed=${encodeURIComponent(sanitizedSeed)}`;
}

/**
 * User object type for avatar generation
 * Matches AuthUser from AuthContext with all avatar-related fields
 */
export interface AvatarUser {
  photoURL?: string | null;      // Google/Firebase profile photo
  imageUrl?: string | null;       // DiceBear URL from backend (e.g., https://api.dicebear.com/9.x/bottts-neutral/svg?seed=username)
  avatar?: string | null;         // Alias/computed avatar field
  displayName?: string | null;
  username?: string | null;       // Backend username - primary seed for DiceBear
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  id?: string;
}

/**
 * Get the best available avatar URL for a user
 * Priority:
 * 1. Custom photoURL (from Google OAuth or uploaded avatar)
 * 2. imageUrl from backend (DiceBear URL)
 * 3. avatar field if it's a valid URL
 * 4. Generate DiceBear from username/displayName
 * 5. Generate DiceBear from email prefix
 * 6. Generate DiceBear from user id
 * 7. Fallback to static placeholder
 * 
 * @param user - User object with possible avatar-related fields
 * @returns Avatar URL string
 */
export function getProfileAvatar(user: AvatarUser | null | undefined): string {
  if (!user) return FALLBACK_AVATAR;
  
  // Priority 1: Custom uploaded photoURL (usually from Google OAuth)
  if (user.photoURL) {
    return user.photoURL;
  }
  
  // Priority 2: imageUrl from backend (already a DiceBear URL)
  if (user.imageUrl) {
    return user.imageUrl;
  }
  
  // Priority 3: Check if avatar is a valid URL (not a placeholder)
  if (user.avatar && user.avatar !== FALLBACK_AVATAR && isValidAvatarUrl(user.avatar)) {
    return user.avatar;
  }
  
  // Priority 4: Generate from username or displayName
  if (user.username) {
    return getDiceBearAvatar(user.username);
  }
  
  if (user.displayName) {
    return getDiceBearAvatar(user.displayName);
  }
  
  // Priority 5: Generate from first + last name
  if (user.firstName || user.lastName) {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (fullName) {
      return getDiceBearAvatar(fullName);
    }
  }
  
  // Priority 6: Generate from email prefix (before @)
  if (user.email) {
    const emailPrefix = user.email.split('@')[0];
    if (emailPrefix) {
      return getDiceBearAvatar(emailPrefix);
    }
  }
  
  // Priority 7: Generate from user ID
  if (user.id) {
    return getDiceBearAvatar(user.id);
  }
  
  // Final fallback
  return FALLBACK_AVATAR;
}

/**
 * Check if a URL is a valid avatar URL (not a placeholder path)
 */
function isValidAvatarUrl(url: string): boolean {
  return url.startsWith('http://') || 
         url.startsWith('https://') || 
         url.startsWith('data:') ||
         url.includes('dicebear.com');
}

/**
 * Check if the avatar URL should bypass Next.js Image optimization.
 * Returns true for DiceBear SVGs and data URLs (base64 profile pictures).
 */
export function isDiceBearAvatar(url: string): boolean {
  return url.includes('dicebear.com') || url.startsWith('data:');
}

/**
 * Get initials from a user for fallback display
 */
export function getUserInitials(user: AvatarUser | null | undefined): string {
  if (!user) return "U";
  
  // Try first and last name
  const firstInitial = user.firstName?.[0] || user.displayName?.[0] || '';
  const lastInitial = user.lastName?.[0] || user.displayName?.split(' ')[1]?.[0] || '';
  
  const initials = (firstInitial + lastInitial).toUpperCase();
  
  if (initials) return initials;
  
  // Fallback to email initial
  if (user.email) {
    return user.email[0].toUpperCase();
  }
  
  return "U";
}
