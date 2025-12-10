"use client";

/**
 * Authentication Context
 * 
 * Provides unified auth state for both Firebase and traditional auth.
 * Handles Google sign-in redirect flow and backend sync.
 */

import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useCallback,
  type ReactNode 
} from 'react';
import { 
  signInWithGoogle, 
  getGoogleRedirectResult,
  signOutFirebase,
  onFirebaseAuthStateChanged,
  type FirebaseUser 
} from '@/lib/firebase';
import { setAuthToken, logout as clearAuthTokens } from '@/lib/auth';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

// User type that works for both Firebase and traditional auth
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  photoURL?: string;
  provider: 'firebase' | 'email';
  emailVerified: boolean;
}

interface AuthContextType {
  // State
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  syncFirebaseUserToBackend: (firebaseUser: FirebaseUser) => Promise<AuthUser | null>;
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
  const syncFirebaseUserToBackend = useCallback(async (fbUser: FirebaseUser): Promise<AuthUser | null> => {
    try {
      const idToken = await fbUser.getIdToken();
      
      // Call our Next.js API route which will sync with NestJS backend
      const response = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        throw new Error(data.error || 'Failed to sync user');
      }

      // Store the JWT token from backend
      if (data.accessToken) {
        setAuthToken(data.accessToken, true);
      }

      // Store refresh token if available
      if (data.refreshToken) {
        try {
          localStorage.setItem('refreshToken', data.refreshToken);
        } catch {
          // Ignore storage errors
        }
      }

      // Build auth user object
      const authUser: AuthUser = {
        id: data.user?.id || fbUser.uid,
        email: fbUser.email || '',
        firstName: data.user?.firstName || fbUser.displayName?.split(' ')[0],
        lastName: data.user?.lastName || fbUser.displayName?.split(' ').slice(1).join(' '),
        displayName: fbUser.displayName || undefined,
        photoURL: fbUser.photoURL || undefined,
        provider: 'firebase',
        emailVerified: fbUser.emailVerified,
      };

      setUser(authUser);
      
      // Store in localStorage for persistence
      try {
        localStorage.setItem('user', JSON.stringify(authUser));
      } catch {
        // Ignore storage errors
      }

      return authUser;
    } catch (error) {
      console.error('Failed to sync Firebase user to backend:', error);
      throw error;
    }
  }, []);

  /**
   * Handle Google sign-in redirect result
   */
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getGoogleRedirectResult();
        
        if (result?.user) {
          // User just signed in via redirect
          toast.loading('Signing you in...', { id: 'google-signin' });
          
          try {
            await syncFirebaseUserToBackend(result.user);
            toast.dismiss('google-signin');
            toast.success(`Welcome, ${result.user.displayName || result.user.email}!`);
            
            // Check for redirect URL in sessionStorage (set before redirect)
            const redirectUrl = sessionStorage.getItem('auth-redirect-url');
            if (redirectUrl) {
              sessionStorage.removeItem('auth-redirect-url');
              router.push(redirectUrl);
            } else {
              router.push('/');
            }
            router.refresh();
          } catch (syncError) {
            toast.dismiss('google-signin');
            toast.error('Failed to complete sign-in. Please try again.');
            console.error('Sync error:', syncError);
          }
        }
      } catch (error) {
        console.error('Google redirect error:', error);
        toast.error('Sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, [syncFirebaseUserToBackend, router]);

  /**
   * Listen to Firebase auth state changes
   */
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        // Check if we have user data already
        try {
          const storedUser = localStorage.getItem('user');
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
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.provider === 'email') {
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
   * Trigger Google sign-in with redirect
   */
  const handleSignInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Store current redirect URL before redirect
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get('redirect');
        if (redirectUrl) {
          sessionStorage.setItem('auth-redirect-url', redirectUrl);
        }
      }
      
      await signInWithGoogle();
      // Page will redirect to Google, then back
    } catch (error) {
      setLoading(false);
      console.error('Sign-in error:', error);
      toast.error('Failed to start sign-in. Please try again.');
    }
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
      
      toast.success('Signed out successfully');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign-out error:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isAuthenticated: !!user || !!firebaseUser,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    syncFirebaseUserToBackend,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
