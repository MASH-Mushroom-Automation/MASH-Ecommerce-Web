/**
 * Firebase User Profile Service
 *
 * Manages user profile data in Firestore.
 * Stores user information when they sign up and provides profile management.
 *
 * Collection: users/{userId}
 * Subcollections: users/{userId}/addresses (see addresses.ts)
 */

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
import { firebaseApp } from "./config";

// Initialize Firestore
const db = getFirestore(firebaseApp);

// ============================================================================
// Types
// ============================================================================

export interface FirestoreUserProfile {
  id: string;
  uid: string; // Firebase Auth UID
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  photoURL?: string;
  
  // Auth metadata
  provider: "email" | "google" | "email-link";
  emailVerified: boolean;
  
  // Preferences
  preferences?: {
    cookingLevel?: string;
    interests?: string[];
    dietaryRestrictions?: string[];
    newsletterSubscribed?: boolean;
  };
  
  // Onboarding
  onboardingCompleted?: boolean;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}

export interface UserProfileInput {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  photoURL?: string;
  provider?: "email" | "google" | "email-link";
  emailVerified?: boolean;
  preferences?: FirestoreUserProfile["preferences"];
  onboardingCompleted?: boolean;
}

// ============================================================================
// Firebase User Profile Service
// ============================================================================

export const FirebaseUserService = {
  COLLECTION: "users",

  /**
   * Create or update user profile in Firestore
   * Called after successful authentication
   */
  async createOrUpdateProfile(
    userId: string,
    data: UserProfileInput
  ): Promise<FirestoreUserProfile> {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      const existingDoc = await getDoc(userRef);

      const now = serverTimestamp();

      if (existingDoc.exists()) {
        // Update existing profile - only update fields that are provided
        const updateData: Record<string, unknown> = {
          updatedAt: now,
          lastLoginAt: now,
        };
        
        // Always update email if provided (critical for e-commerce features)
        if (data.email !== undefined) updateData.email = data.email;
        
        // Only add fields that have values
        if (data.firstName !== undefined) updateData.firstName = data.firstName;
        if (data.lastName !== undefined) updateData.lastName = data.lastName;
        if (data.displayName !== undefined) updateData.displayName = data.displayName;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.photoURL !== undefined) updateData.photoURL = data.photoURL;
        if (data.provider !== undefined) updateData.provider = data.provider;
        if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;
        if (data.preferences !== undefined) updateData.preferences = data.preferences;
        if (data.onboardingCompleted !== undefined) updateData.onboardingCompleted = data.onboardingCompleted;

        await updateDoc(userRef, updateData);

        // Return merged data with email ensured
        const existing = existingDoc.data() as FirestoreUserProfile;
        return {
          ...existing,
          ...data,
          id: userId,
          uid: userId,
          // Ensure email is always present
          email: data.email || existing.email,
        } as FirestoreUserProfile;
      } else {
        // Create new profile
        const newProfile = {
          id: userId,
          uid: userId,
          email: data.email,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          displayName: data.displayName || data.firstName || null,
          phone: data.phone || null,
          photoURL: data.photoURL || null,
          provider: data.provider || "email",
          emailVerified: data.emailVerified || false,
          preferences: data.preferences || null,
          onboardingCompleted: data.onboardingCompleted || false,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
        };

        await setDoc(userRef, newProfile);

        return {
          ...newProfile,
          createdAt: new Date() as unknown as Timestamp,
          updatedAt: new Date() as unknown as Timestamp,
        } as unknown as FirestoreUserProfile;
      }
    } catch (error) {
      console.error("[FirebaseUserService] Create/update error:", error);
      throw error;
    }
  },

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<FirestoreUserProfile | null> {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as FirestoreUserProfile;
    } catch (error: unknown) {
      // Handle offline error gracefully
      if (error && typeof error === "object" && "code" in error) {
        const errorCode = (error as { code: string }).code;
        if (errorCode === "unavailable" || errorCode === "failed-precondition") {
          console.warn("[FirebaseUserService] Client offline, returning null");
          return null;
        }
      }
      console.error("[FirebaseUserService] Get profile error:", error);
      throw error;
    }
  },

  /**
   * Update user profile
   * Creates document if it doesn't exist (using setDoc with merge: true)
   */
  async updateProfile(
    userId: string,
    data: Partial<UserProfileInput>
  ): Promise<boolean> {
    try {
      const userRef = doc(db, this.COLLECTION, userId);

      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if ((updateData as Record<string, unknown>)[key] === undefined) {
          delete (updateData as Record<string, unknown>)[key];
        }
      });

      // Use setDoc with merge: true to create document if it doesn't exist
      await setDoc(userRef, updateData, { merge: true });
      return true;
    } catch (error) {
      console.error("[FirebaseUserService] Update error:", error);
      throw error;
    }
  },

  /**
   * Update user's display name
   */
  async updateDisplayName(
    userId: string,
    firstName: string,
    lastName?: string
  ): Promise<boolean> {
    try {
      const displayName = lastName ? `${firstName} ${lastName}` : firstName;
      return await this.updateProfile(userId, {
        firstName,
        lastName,
        displayName,
      });
    } catch (error) {
      console.error("[FirebaseUserService] Update name error:", error);
      throw error;
    }
  },

  /**
   * Update user's phone number
   */
  async updatePhone(userId: string, phone: string): Promise<boolean> {
    return await this.updateProfile(userId, { phone });
  },

  /**
   * Update onboarding completion status
   */
  async completeOnboarding(
    userId: string,
    preferences?: FirestoreUserProfile["preferences"]
  ): Promise<boolean> {
    return await this.updateProfile(userId, {
      onboardingCompleted: true,
      preferences,
    });
  },

  /**
   * Check if a profile exists
   */
  async profileExists(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      const snapshot = await getDoc(userRef);
      return snapshot.exists();
    } catch (error) {
      console.error("[FirebaseUserService] Check exists error:", error);
      return false;
    }
  },

  /**
   * Enable/disable network (useful for handling offline state)
   */
  async goOnline(): Promise<void> {
    try {
      await enableNetwork(db);
    } catch (error) {
      console.error("[FirebaseUserService] Enable network error:", error);
    }
  },

  async goOffline(): Promise<void> {
    try {
      await disableNetwork(db);
    } catch (error) {
      console.error("[FirebaseUserService] Disable network error:", error);
    }
  },
};

export { db };
