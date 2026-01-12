"use client";

/**
 * Authentication Context
 *
 * Provides unified auth state for all Firebase authentication methods:
 * - Google Sign-In (OAuth)
 * - Email/Password (Traditional)
 * - Email Link (Passwordless)
 *
 * Handles auth state changes and optional backend sync.
 * 
 * Phase 5: Added token refresh management and logout everywhere
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  signInWithGoogle,
  getGoogleRedirectResult,
  signOutFirebase,
  onFirebaseAuthStateChanged,
  createUserWithEmail,
  signInWithEmail,
  sendPasswordReset,
  resendEmailVerification,
  sendSignInLink,
  isEmailSignInLink,
  completeSignInWithEmailLink,
  getStoredEmailForSignIn,
  FirebaseUserService,
  type FirebaseUser,
  type FirestoreUserProfile,
} from "@/lib/firebase";
import { setAuthToken, logout as clearAuthTokens, logoutEverywhere } from "@/lib/auth";
import { startTokenRefreshCheck, stopTokenRefreshCheck, getTokenInfo } from "@/lib/token-refresh";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// User type that works for both Firebase and traditional auth
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  username?: string; // Username from backend (used for DiceBear avatar seed)
  phone?: string; // Phone number for checkout auto-fill
  photoURL?: string;
  imageUrl?: string; // DiceBear avatar URL from backend (e.g., https://api.dicebear.com/9.x/bottts-neutral/svg?seed=username)
  avatar?: string; // Alias for photoURL, used by profile components
  provider: "firebase" | "email" | "google" | "email-link";
  emailVerified: boolean;
  onboardingCompleted?: boolean;
  preferences?: FirestoreUserProfile["preferences"];
}

interface AuthContextType {
  // State
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Google OAuth
  signInWithGoogle: () => Promise<void>;

  // Email/Password
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;

  // Email Link (Passwordless)
  sendEmailSignInLink: (email: string) => Promise<void>;
  completeEmailLinkSignIn: (email: string, url: string) => Promise<void>;
  checkForEmailLink: () => boolean;
  getStoredEmail: () => string | null;

  // Profile Management
  updateUserProfile: (data: Partial<AuthUser>) => Promise<void>;
  refreshProfile: () => Promise<void>;

  // Common
  signOut: () => Promise<void>;
  syncFirebaseUserToBackend: (
    firebaseUser: FirebaseUser
  ) => Promise<AuthUser | null>;

  // Phase 5: Session Management
  signOutEverywhere: () => Promise<void>;
  getSessionInfo: () => { hasToken: boolean; expiresIn: string | null };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Phase 5: Start token refresh check when user is authenticated
   */
  useEffect(() => {
    if (user) {
      console.log("🔵 [Auth] Starting token refresh monitoring...");
      startTokenRefreshCheck();
    } else {
      stopTokenRefreshCheck();
    }

    return () => {
      stopTokenRefreshCheck();
    };
  }, [user]);

  /**
   * Convert Firestore profile to AuthUser
   */
  const profileToAuthUser = useCallback(
    (profile: FirestoreUserProfile, provider: AuthUser["provider"]): AuthUser => {
      return {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        displayName: profile.displayName || profile.firstName,
        phone: profile.phone,
        photoURL: profile.photoURL,
        avatar: profile.photoURL,
        provider,
        emailVerified: profile.emailVerified,
        onboardingCompleted: profile.onboardingCompleted,
        preferences: profile.preferences,
      };
    },
    []
  );

  /**
   * Sync Firebase Auth user to Firestore profile
   * Creates or updates profile in Firestore (not backend)
   */
  const syncToFirestoreProfile = useCallback(
    async (
      fbUser: FirebaseUser,
      provider: AuthUser["provider"],
      additionalData?: Partial<AuthUser>
    ): Promise<AuthUser> => {
      try {
        console.log("🔵 [Auth] Syncing to Firestore profile...");

        // Get or create Firestore profile
        const profile = await FirebaseUserService.createOrUpdateProfile(fbUser.uid, {
          email: fbUser.email || "",
          firstName: additionalData?.firstName || fbUser.displayName?.split(" ")[0],
          lastName: additionalData?.lastName || fbUser.displayName?.split(" ").slice(1).join(" "),
          displayName: additionalData?.displayName || fbUser.displayName || undefined,
          phone: additionalData?.phone,
          photoURL: fbUser.photoURL || undefined,
          provider,
          emailVerified: fbUser.emailVerified,
        });

        const authUser = profileToAuthUser(profile, provider);
        
        // Merge any additional data
        if (additionalData) {
          Object.assign(authUser, additionalData);
        }

        setUser(authUser);
        setFirebaseUser(fbUser);

        // Store in localStorage
        try {
          localStorage.setItem("user", JSON.stringify(authUser));
        } catch {
          console.error("Failed to store user in localStorage");
        }

        console.log("🟢 [Auth] Profile synced to Firestore");
        return authUser;
      } catch (error) {
        console.error("❌ [Auth] Firestore sync error:", error);
        
        // Fallback: create AuthUser from Firebase Auth data only
        const authUser: AuthUser = {
          id: fbUser.uid,
          email: fbUser.email || "",
          firstName: additionalData?.firstName || fbUser.displayName?.split(" ")[0],
          lastName: additionalData?.lastName || fbUser.displayName?.split(" ").slice(1).join(" "),
          displayName: additionalData?.displayName || fbUser.displayName || undefined,
          phone: additionalData?.phone,
          photoURL: fbUser.photoURL || undefined,
          avatar: fbUser.photoURL || undefined,
          provider,
          emailVerified: fbUser.emailVerified,
        };

        setUser(authUser);
        setFirebaseUser(fbUser);

        try {
          localStorage.setItem("user", JSON.stringify(authUser));
        } catch {}

        return authUser;
      }
    },
    [profileToAuthUser]
  );

  /**
   * Sync Google OAuth user to NestJS backend PostgreSQL database
   * Creates or updates user record and returns JWT for authenticated sessions
   * 
   * Backend Endpoint: POST /auth/google/sync
   * See: GOOGLE_AUTH_TESTING_GUIDE.md for full documentation
   */
  const syncFirebaseUserToBackend = useCallback(
    async (fbUser: FirebaseUser): Promise<AuthUser | null> => {
      try {
        console.log("🔵 [Auth] Syncing Google user to PostgreSQL backend...");
        
        // Extract name parts from Firebase displayName
        const nameParts = (fbUser.displayName || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Call backend API directly (no Next.js proxy needed)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            googleId: fbUser.uid,
            email: fbUser.email,
            firstName: firstName,
            lastName: lastName,
            photoURL: fbUser.photoURL || undefined,
            username: fbUser.email?.split("@")[0], // Generate username from email prefix
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("❌ [Auth] Backend sync failed:", data);
          throw new Error(data.message || "Failed to sync user to backend");
        }

        console.log("🟢 [Auth] Backend sync successful:", {
          userId: data.user?.id,
          username: data.user?.username,
          hasToken: !!data.tokens?.accessToken,
        });

        // Store JWT access token from backend
        if (data.tokens?.accessToken) {
          console.log("🟢 [Auth] Setting backend JWT token...");
          setAuthToken(data.tokens.accessToken, true);
          console.log("🟢 [Auth] JWT token stored successfully");
        } else {
          console.warn("⚠️ [Auth] No access token received from backend!");
        }

        // Store refresh token if available
        if (data.tokens?.refreshToken) {
          try {
            console.log("🟢 [Auth] Storing refresh token in localStorage...");
            localStorage.setItem("refreshToken", data.tokens.refreshToken);
          } catch (err) {
            console.error("❌ [Auth] Failed to store refresh token:", err);
          }
        }

        // Build unified auth user object with backend data
        // Backend returns: { id, email, username, firstName, lastName, imageUrl (DiceBear), role }
        const backendUser = data.user;
        const backendImageUrl = backendUser?.imageUrl; // DiceBear URL: https://api.dicebear.com/9.x/bottts-neutral/svg?seed={username}
        
        const authUser: AuthUser = {
          id: backendUser?.id || fbUser.uid,
          email: fbUser.email || "",
          firstName: backendUser?.firstName || firstName,
          lastName: backendUser?.lastName || lastName,
          displayName: fbUser.displayName || undefined,
          username: backendUser?.username || fbUser.email?.split("@")[0], // Backend username for DiceBear seed
          phone: backendUser?.phone || undefined,
          photoURL: fbUser.photoURL || undefined, // Google profile photo
          imageUrl: backendImageUrl || undefined, // DiceBear avatar from backend
          avatar: backendImageUrl || fbUser.photoURL || undefined, // Prefer DiceBear, fallback to Google photo
          provider: "google",
          emailVerified: fbUser.emailVerified,
        };

        setUser(authUser);

        // Persist to localStorage
        try {
          localStorage.setItem("user", JSON.stringify(authUser));
          console.log("🟢 [Auth] User data persisted to localStorage");
        } catch (err) {
          console.error("❌ [Auth] Failed to store user in localStorage:", err);
        }

        return authUser;
      } catch (error) {
        console.error(
          "❌ [Auth] Failed to sync Google user to PostgreSQL backend:",
          error
        );
        // Don't throw - allow user to continue with Firebase-only auth
        return null;
      }
    },
    []
  );

  /**
   * Handle Google sign-in redirect result
   */
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        // Check both storages for redirect marker
        const isReturningFromGoogle =
          sessionStorage.getItem("google_auth_redirect") ||
          localStorage.getItem("google_auth_redirect");

        const result = await getGoogleRedirectResult();

        if (result?.user) {
          sessionStorage.removeItem("google_auth_redirect");
          localStorage.removeItem("google_auth_redirect");
          toast.loading("Signing you in...", { id: "google-signin" });

          try {
            // Sync to Firestore profile first (for cart/wishlist/orders)
            await syncToFirestoreProfile(result.user, "google");
            
            // ✅ ALWAYS sync Google users to PostgreSQL backend (creates user record + JWT)
            console.log("🔵 [Auth] Syncing Google user to PostgreSQL...");
            const backendUser = await syncFirebaseUserToBackend(result.user);
            
            if (backendUser) {
              console.log("🟢 [Auth] Google → PostgreSQL sync successful!");
            } else {
              console.warn("⚠️ [Auth] PostgreSQL sync failed, continuing with Firebase-only auth");
            }
            
            toast.dismiss("google-signin");
            toast.success(
              `Welcome, ${result.user.displayName || result.user.email}!`
            );

            // Check for redirect URL in sessionStorage
            const redirectUrl = sessionStorage.getItem("auth-redirect-url");

            // Use window.location for full page reload
            if (redirectUrl) {
              sessionStorage.removeItem("auth-redirect-url");
              window.location.href = redirectUrl;
            } else {
              window.location.href = "/";
            }
          } catch (syncError) {
            toast.dismiss("google-signin");
            toast.error("Failed to complete sign-in. Please try again.");
            console.error("❌ [Auth Context] Sync error:", syncError);
          }
        } else if (isReturningFromGoogle === "true") {
          sessionStorage.setItem("awaiting_firebase_auth", "true");

          // Poll for Firebase user for up to 5 seconds
          let attempts = 0;
          const maxAttempts = 25;

          const pollForUser = async () => {
            attempts++;
            const { getCurrentUser } = await import("@/lib/firebase/auth");
            const currentUser = getCurrentUser();

            if (currentUser && !user) {
              sessionStorage.removeItem("awaiting_firebase_auth");
              sessionStorage.removeItem("google_auth_redirect");
              localStorage.removeItem("google_auth_redirect");

              try {
                setLoading(true);
                await syncToFirestoreProfile(currentUser, "google");
                
                // ✅ Sync to PostgreSQL backend
                console.log("🔵 [Auth] Syncing polled Google user to PostgreSQL...");
                await syncFirebaseUserToBackend(currentUser);
                
                toast.success(
                  `Welcome, ${currentUser.displayName || currentUser.email}!`
                );
                window.location.href = "/";
              } catch (error) {
                console.error("Failed to sync polled user:", error);
                setLoading(false);
              }
            } else if (attempts < maxAttempts) {
              setTimeout(pollForUser, 200);
            } else {
              sessionStorage.removeItem("awaiting_firebase_auth");
              sessionStorage.removeItem("google_auth_redirect");
              localStorage.removeItem("google_auth_redirect");
            }
          };

          pollForUser();
        }
      } catch (error) {
        console.error("Google redirect error:", error);
        toast.error("Sign-in failed. Please try again.");
        sessionStorage.removeItem("google_auth_redirect");
        sessionStorage.removeItem("awaiting_firebase_auth");
      }
    };

    handleRedirectResult();
  }, [syncToFirestoreProfile, syncFirebaseUserToBackend, router, user]);

  /**
   * Listen to Firebase auth state changes
   */
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);

      // Check if we're waiting for auth after redirect
      const awaitingAuth = sessionStorage.getItem("awaiting_firebase_auth");

      if (fbUser && awaitingAuth === "true") {
        sessionStorage.removeItem("awaiting_firebase_auth");
        sessionStorage.removeItem("google_auth_redirect");
        localStorage.removeItem("google_auth_redirect");

        try {
          setLoading(true);
          await syncToFirestoreProfile(fbUser, "google");
          toast.success(`Welcome, ${fbUser.displayName || fbUser.email}!`);
          window.location.href = "/";
          return;
        } catch (error) {
          console.error("Failed to sync after redirect:", error);
          toast.error("Failed to complete sign-in. Please try again.");
          setLoading(false);
        }
      }

      if (fbUser) {
        // Check if we have user data already
        console.log(
          "🔵 [Auth Context] Checking localStorage for existing user..."
        );
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.id === fbUser.uid || parsed.email === fbUser.email) {
              setUser(parsed);
            }
          }
        } catch {
          // Ignore parse errors
        }
      } else {
        // No Firebase user, check for traditional auth via cookie
        // Don't clear user if they logged in with email/password
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.provider === "email") {
              setUser(parsed);
            } else {
              // Firebase user logged out, clear state
              setUser(null);
            }
          }
        } catch {
          // Ignore parse errors
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Trigger Google sign-in (popup in dev, redirect in prod)
   */
  const handleSignInWithGoogle = async () => {
    const isDevelopment = process.env.NODE_ENV === "development";

    try {
      setLoading(true);

      // Store current redirect URL
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get("redirect");
        if (redirectUrl) {
          sessionStorage.setItem("auth-redirect-url", redirectUrl);
        }
      }

      const result = await signInWithGoogle();

      // In development, popup returns user immediately
      if (isDevelopment && result) {
        toast.loading("Signing you in...", { id: "google-signin" });

        try {
          // Sync to Firestore profile
          await syncToFirestoreProfile(result, "google");
          
          // Optional: sync to backend
          try {
            await syncFirebaseUserToBackend(result);
          } catch {
            console.warn("Backend sync failed, using Firebase only");
          }
          
          toast.dismiss("google-signin");
          toast.success(`Welcome, ${result.displayName || result.email}!`);

          const redirectUrl = sessionStorage.getItem("auth-redirect-url");
          if (redirectUrl) {
            sessionStorage.removeItem("auth-redirect-url");
            window.location.href = redirectUrl;
          } else {
            window.location.href = "/";
          }
        } catch (syncError) {
          toast.dismiss("google-signin");
          toast.error("Failed to complete sign-in. Please try again.");
          console.error("Sync error:", syncError);
          setLoading(false);
        }
      }
      // In production, redirect flow - control leaves page
    } catch (error) {
      setLoading(false);
      console.error("Sign-in error:", error);
      toast.error("Failed to start sign-in. Please try again.");
    }
  };

  // ============================================================================
  // EMAIL/PASSWORD AUTHENTICATION HANDLERS
  // ============================================================================

  /**
   * Sign up with email and password
   */
  const handleSignUpWithEmail = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    try {
      setLoading(true);
      const fbUser = await createUserWithEmail(email, password, displayName);

      // Sync to Firestore profile
      await syncToFirestoreProfile(fbUser, "email", {
        firstName: displayName?.split(" ")[0],
        lastName: displayName?.split(" ").slice(1).join(" "),
        displayName: fbUser.displayName || displayName,
      });

      toast.success("Account created!", {
        description: "Please check your email to verify your account.",
      });

      // Redirect to verification page or show verification prompt
      router.push("/login?verify=true");
    } catch (error: unknown) {
      console.error("Sign-up error:", error);
      const errorMessage = getFirebaseErrorMessage(error);
      toast.error("Sign-up failed", { description: errorMessage });
      // Re-throw with handled flag so pages can detect it but won't show duplicate errors
      const handledError = new Error(errorMessage);
      (handledError as Error & { handled: boolean }).handled = true;
      (handledError as Error & { code: string }).code = (error as { code?: string })?.code || 'unknown';
      throw handledError;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with email and password
   */
  const handleSignInWithEmailPassword = async (
    email: string,
    password: string
  ) => {
    try {
      setLoading(true);
      toast.loading("Signing you in...", { id: "email-signin" });

      const fbUser = await signInWithEmail(email, password);

      // Check if email is verified
      if (!fbUser.emailVerified) {
        toast.dismiss("email-signin");
        toast.warning("Please verify your email", {
          description: "Check your inbox for the verification link.",
          action: {
            label: "Resend",
            onClick: () => handleResendVerificationEmail(),
          },
        });
        setFirebaseUser(fbUser);
        setLoading(false);
        return;
      }

      // Sync to Firestore profile (primary)
      await syncToFirestoreProfile(fbUser, "email");

      // Optional: try to sync to backend for JWT (non-blocking)
      try {
        await syncFirebaseUserToBackend(fbUser);
      } catch {
        // Backend sync failed, but Firestore profile is still saved
        console.warn("Backend sync failed, using Firebase only");

        const authUser: AuthUser = {
          id: fbUser.uid,
          email: fbUser.email || email,
          firstName: fbUser.displayName?.split(" ")[0],
          lastName: fbUser.displayName?.split(" ").slice(1).join(" "),
          displayName: fbUser.displayName || undefined,
          provider: "email",
          emailVerified: fbUser.emailVerified,
        };

        setUser(authUser);
        localStorage.setItem("user", JSON.stringify(authUser));
      }

      toast.dismiss("email-signin");
      toast.success(`Welcome back, ${fbUser.displayName || email}!`);

      // Redirect
      const redirectUrl = sessionStorage.getItem("auth-redirect-url");
      if (redirectUrl) {
        sessionStorage.removeItem("auth-redirect-url");
        window.location.href = redirectUrl;
      } else {
        window.location.href = "/";
      }
    } catch (error: unknown) {
      toast.dismiss("email-signin");
      console.error("Sign-in error:", error);
      const errorMessage = getFirebaseErrorMessage(error);
      toast.error("Sign-in failed", { description: errorMessage });
      // Re-throw with handled flag so pages can detect it but won't show duplicate errors
      const handledError = new Error(errorMessage);
      (handledError as Error & { handled: boolean }).handled = true;
      (handledError as Error & { code: string }).code = (error as { code?: string })?.code || 'unknown';
      throw handledError;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send password reset email
   */
  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordReset(email);
      toast.success("Password reset email sent", {
        description: "Check your inbox for instructions.",
      });
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      const errorCode = (error as { code?: string })?.code;
      const errorMessage = getFirebaseErrorMessage(error);
      
      // For security, don't reveal if email doesn't exist
      if (errorCode === "auth/user-not-found") {
        // Show success even if user not found (security best practice)
        toast.success("Password reset email sent", {
          description: "If this email is registered, you'll receive instructions.",
        });
        // Still throw so the page can update state
        const handledError = new Error(errorMessage);
        (handledError as Error & { handled: boolean; code: string }).handled = true;
        (handledError as Error & { code: string }).code = errorCode || "unknown";
        throw handledError;
      }
      
      toast.error("Password reset failed", { description: errorMessage });
      // Re-throw with handled flag and original code
      const handledError = new Error(errorMessage);
      (handledError as Error & { handled: boolean; code: string }).handled = true;
      (handledError as Error & { code: string }).code = errorCode || "unknown";
      throw handledError;
    }
  };

  /**
   * Resend email verification
   */
  const handleResendVerificationEmail = async () => {
    try {
      await resendEmailVerification();
      toast.success("Verification email sent", {
        description: "Check your inbox for the verification link.",
      });
    } catch (error: unknown) {
      console.error("Resend verification error:", error);
      const errorMessage = getFirebaseErrorMessage(error);
      toast.error("Verification email failed", { description: errorMessage });
      // Re-throw with handled flag
      const handledError = new Error(errorMessage);
      (handledError as Error & { handled: boolean }).handled = true;
      throw handledError;
    }
  };

  // ============================================================================
  // EMAIL LINK (PASSWORDLESS) AUTHENTICATION HANDLERS
  // ============================================================================

  /**
   * Send email sign-in link
   */
  const handleSendEmailSignInLink = async (email: string) => {
    try {
      await sendSignInLink(email);
      toast.success("Sign-in link sent!", {
        description: `Check ${email} for the sign-in link.`,
      });
    } catch (error: unknown) {
      console.error("Send sign-in link error:", error);
      const errorMessage = getFirebaseErrorMessage(error);
      toast.error("Failed to send sign-in link", { description: errorMessage });
      // Re-throw with handled flag
      const handledError = new Error(errorMessage);
      (handledError as Error & { handled: boolean }).handled = true;
      throw handledError;
    }
  };

  /**
   * Complete email link sign-in
   */
  const handleCompleteEmailLinkSignIn = async (email: string, url: string) => {
    try {
      setLoading(true);
      toast.loading("Completing sign-in...", { id: "email-link-signin" });

      const fbUser = await completeSignInWithEmailLink(email, url);

      // Sync to Firestore profile
      // Email link users don't have a displayName by default
      await syncToFirestoreProfile(fbUser, "email-link");

      // Optional: try to sync to backend (non-blocking)
      try {
        await syncFirebaseUserToBackend(fbUser);
      } catch {
        // Backend sync failed, Firestore profile is primary
        console.warn("Backend sync failed, using Firebase only");
      }

      toast.dismiss("email-link-signin");
      toast.success(`Welcome, ${fbUser.displayName || email}!`);

      // Redirect
      const redirectUrl = sessionStorage.getItem("auth-redirect-url");
      if (redirectUrl) {
        sessionStorage.removeItem("auth-redirect-url");
        window.location.href = redirectUrl;
      } else {
        window.location.href = "/";
      }
    } catch (error: unknown) {
      toast.dismiss("email-link-signin");
      console.error("Email link sign-in error:", error);
      const errorMessage = getFirebaseErrorMessage(error);
      toast.error("Email link sign-in failed", { description: errorMessage });
      // Re-throw with handled flag
      const handledError = new Error(errorMessage);
      (handledError as Error & { handled: boolean }).handled = true;
      throw handledError;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if current URL is an email sign-in link
   */
  const handleCheckForEmailLink = (): boolean => {
    if (typeof window === "undefined") return false;
    return isEmailSignInLink(window.location.href);
  };

  /**
   * Get stored email for completing email link sign-in
   */
  const handleGetStoredEmail = (): string | null => {
    return getStoredEmailForSignIn();
  };

  /**
   * Sign out from all auth providers
   */
  const handleSignOut = async () => {
    try {
      // Stop token refresh monitoring
      stopTokenRefreshCheck();

      // Sign out from Firebase
      await signOutFirebase();

      // Clear traditional auth tokens
      clearAuthTokens();

      // Clear user state
      setUser(null);
      setFirebaseUser(null);

      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign-out error:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  /**
   * Phase 5: Sign out from all devices/sessions
   */
  const handleSignOutEverywhere = async () => {
    try {
      // Stop token refresh monitoring
      stopTokenRefreshCheck();

      toast.loading("Signing out from all devices...", { id: "logout-everywhere" });

      // Call backend to invalidate all sessions
      const success = await logoutEverywhere();

      // Sign out from Firebase
      await signOutFirebase();

      // Clear user state
      setUser(null);
      setFirebaseUser(null);

      toast.dismiss("logout-everywhere");
      
      if (success) {
        toast.success("Signed out from all devices");
      } else {
        toast.success("Signed out locally", {
          description: "Could not reach server to sign out other devices",
        });
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign-out everywhere error:", error);
      toast.dismiss("logout-everywhere");
      toast.error("Failed to sign out. Please try again.");
    }
  };

  /**
   * Phase 5: Get current session info
   */
  const handleGetSessionInfo = (): { hasToken: boolean; expiresIn: string | null } => {
    const info = getTokenInfo();
    return {
      hasToken: info.hasToken,
      expiresIn: info.expiresIn,
    };
  };

  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================

  /**
   * Update user profile in Firebase
   */
  const handleUpdateUserProfile = async (data: Partial<AuthUser>) => {
    if (!user?.id) {
      throw new Error("No user logged in");
    }

    try {
      await FirebaseUserService.updateProfile(user.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        phone: data.phone,
        photoURL: data.photoURL,
      });

      // Update local state
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated!");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
      throw error;
    }
  };

  /**
   * Refresh user profile from Firebase
   */
  const handleRefreshProfile = async () => {
    if (!user?.id) return;

    try {
      const profile = await FirebaseUserService.getProfile(user.id);
      if (profile) {
        const authUser = profileToAuthUser(profile, user.provider);
        setUser(authUser);
        localStorage.setItem("user", JSON.stringify(authUser));
      }
    } catch (error) {
      console.error("Profile refresh error:", error);
      // Don't throw - keep existing profile
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isAuthenticated: !!user || !!firebaseUser,
    // Google OAuth
    signInWithGoogle: handleSignInWithGoogle,
    // Email/Password
    signUpWithEmail: handleSignUpWithEmail,
    signInWithEmailPassword: handleSignInWithEmailPassword,
    resetPassword: handleResetPassword,
    resendVerificationEmail: handleResendVerificationEmail,
    // Email Link (Passwordless)
    sendEmailSignInLink: handleSendEmailSignInLink,
    completeEmailLinkSignIn: handleCompleteEmailLinkSignIn,
    checkForEmailLink: handleCheckForEmailLink,
    getStoredEmail: handleGetStoredEmail,
    // Profile Management
    updateUserProfile: handleUpdateUserProfile,
    refreshProfile: handleRefreshProfile,
    // Common
    signOut: handleSignOut,
    syncFirebaseUserToBackend,
    // Phase 5: Session Management
    signOutEverywhere: handleSignOutEverywhere,
    getSessionInfo: handleGetSessionInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Get human-readable error message from Firebase error
 */
function getFirebaseErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      // Sign-up errors
      case "auth/email-already-in-use":
        return "This email is already registered. Try signing in instead, or use Google/Email Link sign-in.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/operation-not-allowed":
        return "This sign-in method is not enabled. Please contact support.";
      
      // Sign-in errors
      case "auth/user-not-found":
        return "No account found with this email. Please sign up first.";
      case "auth/wrong-password":
        return "Incorrect password. Try again or use 'Forgot Password'.";
      case "auth/invalid-credential":
        return "Invalid email or password. If you signed up with Google or Email Link, please use that method instead.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      
      // Rate limiting
      case "auth/too-many-requests":
        return "Too many failed attempts. Please wait a few minutes before trying again.";
      
      // Network errors
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection and try again.";
      case "auth/internal-error":
        return "An internal error occurred. Please try again later.";
      
      // Email link errors
      case "auth/expired-action-code":
        return "This link has expired. Please request a new sign-in link.";
      case "auth/invalid-action-code":
        return "This link is invalid or has already been used. Please request a new one.";
      case "auth/missing-email":
        return "Please enter your email address to continue.";
      
      // Account linking errors
      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using a different sign-in method. Try signing in with Google or Email Link.";
      case "auth/credential-already-in-use":
        return "This credential is already associated with another account.";
      
      // Session errors
      case "auth/requires-recent-login":
        return "Please sign in again to complete this action.";
      case "auth/user-token-expired":
        return "Your session has expired. Please sign in again.";
      
      // Popup/redirect errors
      case "auth/popup-blocked":
        return "Sign-in popup was blocked. Please allow popups for this site.";
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled. Please try again.";
      case "auth/cancelled-popup-request":
        return "Sign-in was cancelled. Please try again.";
      
      default:
        console.warn("Unhandled Firebase error code:", code);
        return "An error occurred. Please try again.";
    }
  }
  return "An error occurred. Please try again.";
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
