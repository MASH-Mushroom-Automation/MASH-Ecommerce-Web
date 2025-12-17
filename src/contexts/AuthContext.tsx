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
  type FirebaseUser,
} from "@/lib/firebase";
import { setAuthToken, logout as clearAuthTokens } from "@/lib/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// User type that works for both Firebase and traditional auth
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string; // Phone number for checkout auto-fill
  photoURL?: string;
  avatar?: string; // Alias for photoURL, used by profile components
  provider: "firebase" | "email" | "google" | "email-link";
  emailVerified: boolean;
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

  // Common
  signOut: () => Promise<void>;
  syncFirebaseUserToBackend: (
    firebaseUser: FirebaseUser
  ) => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Sync Firebase user to NestJS backend
   * Creates or updates user record and returns JWT
   */
  const syncFirebaseUserToBackend = useCallback(
    async (fbUser: FirebaseUser): Promise<AuthUser | null> => {
      try {
        const idToken = await fbUser.getIdToken();

        // Call our Next.js API route which will sync with NestJS backend
        const response = await fetch("/api/auth/firebase-sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            idToken,
            user: {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
              emailVerified: fbUser.emailVerified,
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to sync user");
        }

        // Store the JWT token from backend
        if (data.accessToken) {
          console.log("🟢 [Auth Context] Setting auth token in cookie...");
          setAuthToken(data.accessToken, true);
          console.log("🟢 [Auth Context] Auth token stored successfully");
        } else {
          console.warn(
            "⚠️ [Auth Context] No access token received from backend!"
          );
        }

        // Store refresh token if available
        if (data.refreshToken) {
          try {
            console.log(
              "🟢 [Auth Context] Storing refresh token in localStorage..."
            );
            localStorage.setItem("refreshToken", data.refreshToken);
          } catch {
            // Ignore storage errors
          }
        }

        // Build auth user object
        const imageUrl =
          data.user?.imageUrl || data.user?.profileImageUrl || fbUser.photoURL;
        const authUser: AuthUser = {
          id: data.user?.id || fbUser.uid,
          email: fbUser.email || "",
          firstName: data.user?.firstName || fbUser.displayName?.split(" ")[0],
          lastName:
            data.user?.lastName ||
            fbUser.displayName?.split(" ").slice(1).join(" "),
          displayName: fbUser.displayName || undefined,
          phone: data.user?.phone || undefined,
          photoURL: imageUrl || undefined,
          avatar: imageUrl || undefined,
          provider: "firebase",
          emailVerified: fbUser.emailVerified,
        };

        setUser(authUser);

        // Store in localStorage for persistence
        try {
          localStorage.setItem("user", JSON.stringify(authUser));
        } catch {
          console.error("Failed to store user in localStorage");
        }

        return authUser;
      } catch (error) {
        console.error(
          "❌ [Auth Context] Failed to sync Firebase user to backend:",
          error
        );
        throw error;
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
            await syncFirebaseUserToBackend(result.user);
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
  }, [syncFirebaseUserToBackend, router, user]);

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
          await syncFirebaseUserToBackend(fbUser);
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
          await syncFirebaseUserToBackend(result);
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

      // Build auth user (email not verified yet)
      const authUser: AuthUser = {
        id: fbUser.uid,
        email: fbUser.email || email,
        firstName: displayName?.split(" ")[0],
        lastName: displayName?.split(" ").slice(1).join(" "),
        displayName: fbUser.displayName || displayName,
        provider: "email",
        emailVerified: false,
      };

      setUser(authUser);
      setFirebaseUser(fbUser);

      // Store in localStorage
      try {
        localStorage.setItem("user", JSON.stringify(authUser));
      } catch {
        // Ignore storage errors
      }

      toast.success("Account created!", {
        description: "Please check your email to verify your account.",
      });

      // Redirect to verification page or show verification prompt
      router.push("/login?verify=true");
    } catch (error: unknown) {
      console.error("Sign-up error:", error);
      const errorMessage = getFirebaseErrorMessage(error);
      toast.error(errorMessage);
      throw error;
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

      // Sync to backend (optional, for backend integration)
      try {
        await syncFirebaseUserToBackend(fbUser);
      } catch {
        // Backend sync failed, but user is still authenticated via Firebase
        console.warn("Backend sync failed, using Firebase auth only");

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
      toast.error(errorMessage);
      throw error;
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
      const errorMessage = getFirebaseErrorMessage(error);
      toast.error(errorMessage);
      throw error;
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
      toast.error(errorMessage);
      throw error;
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
      toast.error(errorMessage);
      throw error;
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

      // Sync to backend (optional)
      try {
        await syncFirebaseUserToBackend(fbUser);
      } catch {
        // Backend sync failed, use Firebase auth only
        const authUser: AuthUser = {
          id: fbUser.uid,
          email: fbUser.email || email,
          displayName: fbUser.displayName || undefined,
          provider: "email-link",
          emailVerified: true, // Email link verifies the email
        };

        setUser(authUser);
        localStorage.setItem("user", JSON.stringify(authUser));
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
      toast.error(errorMessage);
      throw error;
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
    // Common
    signOut: handleSignOut,
    syncFirebaseUserToBackend,
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
      case "auth/email-already-in-use":
        return "This email is already registered. Try signing in instead.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/user-not-found":
        return "No account found with this email. Try signing up instead.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-credential":
        return "Invalid email or password. Please check your credentials.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/user-disabled":
        return "This account has been disabled. Contact support.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      case "auth/expired-action-code":
        return "This link has expired. Please request a new one.";
      case "auth/invalid-action-code":
        return "Invalid link. Please request a new sign-in link.";
      default:
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
