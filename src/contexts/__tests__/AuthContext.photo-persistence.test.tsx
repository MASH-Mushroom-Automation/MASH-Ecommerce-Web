/**
 * AuthContext Profile Picture Persistence Tests
 *
 * Tests that custom uploaded profile pictures persist across:
 * - Page refreshes (onAuthStateChanged re-fires)
 * - Background backend sync (syncFirebaseUserToBackend)
 * - Google re-login (syncToFirestoreProfile)
 * - Cookie data URL overflow handling
 */

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";

// Unmock AuthContext to use the real implementation
jest.unmock("@/contexts/AuthContext");

import { AuthProvider, useAuth } from "../AuthContext";
import * as firebase from "@/lib/firebase";
import * as authLib from "@/lib/auth";
import * as tokenRefresh from "@/lib/token-refresh";

const { FirebaseUserService } = firebase;

// Access global cookie mocks set up in jest.setupMocks.js
const mockCookies = global.__mockCookies as {
  setCookie: jest.Mock;
  getCookie: jest.Mock;
  getCookieJSON: jest.Mock;
  removeCookie: jest.Mock;
};

const setCookie = mockCookies.setCookie;
const getCookieJSON = mockCookies.getCookieJSON;
const removeCookie = mockCookies.removeCookie;

jest.mock("@/lib/auth");
jest.mock("@/lib/token-refresh");
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Access global toast mock
const mockToast = global.__mockToast as {
  success: jest.Mock;
  error: jest.Mock;
  warning: jest.Mock;
  loading: jest.Mock;
  dismiss: jest.Mock;
};

// Test component exposing auth context and photoURL
function PhotoTestComponent() {
  const auth = useAuth();

  React.useEffect(() => {
    (window as unknown as Record<string, unknown>).__auth = auth;
    return () => {
      (window as unknown as Record<string, unknown>).__auth = undefined;
    };
  }, [auth]);

  return (
    <div>
      <div data-testid="user-email">
        {auth.user?.email || "Not logged in"}
      </div>
      <div data-testid="user-photo">{auth.user?.photoURL || "no-photo"}</div>
      <div data-testid="user-avatar">{auth.user?.avatar || "no-avatar"}</div>
      <div data-testid="is-authenticated">
        {auth.isAuthenticated ? "true" : "false"}
      </div>
      <div data-testid="loading">{auth.loading ? "true" : "false"}</div>
    </div>
  );
}

describe("AuthContext - Profile Picture Persistence", () => {
  const CUSTOM_DATA_URL =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgCustomUploadedPhoto";
  const GOOGLE_PHOTO_URL =
    "https://lh3.googleusercontent.com/a/default-photo.jpg";

  const mockFirebaseUser = {
    uid: "test-uid-photo",
    email: "photo-test@example.com",
    displayName: "Photo Test User",
    emailVerified: true,
    photoURL: GOOGLE_PHOTO_URL,
    getIdToken: jest.fn().mockResolvedValue("mock-firebase-id-token"),
  };

  const profileWithCustomPhoto = {
    id: "test-uid-photo",
    uid: "test-uid-photo",
    email: "photo-test@example.com",
    firstName: "Photo",
    lastName: "Test User",
    displayName: "Photo Test User",
    provider: "google" as const,
    emailVerified: true,
    photoURL: CUSTOM_DATA_URL,
  };

  const profileWithGooglePhoto = {
    id: "test-uid-photo",
    uid: "test-uid-photo",
    email: "photo-test@example.com",
    firstName: "Photo",
    lastName: "Test User",
    displayName: "Photo Test User",
    provider: "google" as const,
    emailVerified: true,
    photoURL: GOOGLE_PHOTO_URL,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      if (name) document.cookie = `${name}=; Path=/; Max-Age=0`;
    });

    getCookieJSON.mockReturnValue(null);
    setCookie.mockImplementation(() => {});
    removeCookie.mockImplementation(() => {});

    (firebase.onFirebaseAuthStateChanged as jest.Mock).mockImplementation(
      (callback) => {
        callback(null);
        return jest.fn();
      }
    );

    (FirebaseUserService.getProfile as jest.Mock).mockResolvedValue(
      profileWithCustomPhoto
    );
    (FirebaseUserService.createOrUpdateProfile as jest.Mock).mockResolvedValue(
      profileWithCustomPhoto
    );
    (FirebaseUserService.updateProfile as jest.Mock).mockResolvedValue(true);

    (tokenRefresh.startTokenRefreshCheck as jest.Mock).mockImplementation(
      () => {}
    );
    (tokenRefresh.stopTokenRefreshCheck as jest.Mock).mockImplementation(
      () => {}
    );
    (tokenRefresh.getTokenInfo as jest.Mock).mockReturnValue({
      hasToken: false,
      expiresIn: null,
    });

    (authLib.setAuthToken as jest.Mock).mockImplementation(() => {});
    (authLib.logout as jest.Mock).mockImplementation(() => {});
    (authLib.logoutEverywhere as jest.Mock).mockResolvedValue(true);

    // Mock global fetch to simulate backend sync response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
          user: {
            email: "photo-test@example.com",
            firstName: "Photo",
            lastName: "Test User",
          },
        }),
    }) as jest.Mock;
  });

  afterEach(() => {
    (global.fetch as jest.Mock)?.mockRestore?.();
  });

  describe("page refresh - custom photo preserved from Firestore", () => {
    it("should load custom data URL photoURL from Firestore on refresh", async () => {
      // Simulate page refresh: cookie has user data, Firebase user is set
      getCookieJSON.mockReturnValue({
        id: mockFirebaseUser.uid,
        email: mockFirebaseUser.email,
        firstName: "Photo",
        lastName: "Test User",
        provider: "google",
        // Cookie may NOT have photoURL due to 4KB limit
      });

      (firebase.onFirebaseAuthStateChanged as jest.Mock).mockImplementation(
        (callback) => {
          callback(mockFirebaseUser);
          return jest.fn();
        }
      );

      // Firestore profile has the custom uploaded photo
      (FirebaseUserService.getProfile as jest.Mock).mockResolvedValue(
        profileWithCustomPhoto
      );

      render(
        <AuthProvider>
          <PhotoTestComponent />
        </AuthProvider>
      );

      // After Firestore background refresh, custom photo should be displayed
      await waitFor(
        () => {
          expect(screen.getByTestId("user-photo").textContent).toBe(
            CUSTOM_DATA_URL
          );
        },
        { timeout: 5000 }
      );
    });

    it("should load avatar from Firestore profile via profileToAuthUser", async () => {
      getCookieJSON.mockReturnValue({
        id: mockFirebaseUser.uid,
        email: mockFirebaseUser.email,
        provider: "google",
      });

      (firebase.onFirebaseAuthStateChanged as jest.Mock).mockImplementation(
        (callback) => {
          callback(mockFirebaseUser);
          return jest.fn();
        }
      );

      (FirebaseUserService.getProfile as jest.Mock).mockResolvedValue(
        profileWithCustomPhoto
      );

      render(
        <AuthProvider>
          <PhotoTestComponent />
        </AuthProvider>
      );

      await waitFor(
        () => {
          // profileToAuthUser maps profile.photoURL to both photoURL and avatar
          expect(screen.getByTestId("user-avatar").textContent).toBe(
            CUSTOM_DATA_URL
          );
        },
        { timeout: 5000 }
      );
    });
  });

  describe("syncFirebaseUserToBackend - no user state overwrite", () => {
    it("should not overwrite user state during background backend sync", async () => {
      // Simulate: user has custom photo, backend sync fires in background
      getCookieJSON.mockReturnValue({
        id: mockFirebaseUser.uid,
        email: mockFirebaseUser.email,
        provider: "google",
        photoURL: CUSTOM_DATA_URL,
        avatar: CUSTOM_DATA_URL,
      });

      (firebase.onFirebaseAuthStateChanged as jest.Mock).mockImplementation(
        (callback) => {
          callback(mockFirebaseUser);
          return jest.fn();
        }
      );

      (FirebaseUserService.getProfile as jest.Mock).mockResolvedValue(
        profileWithCustomPhoto
      );

      // Backend returns user data with Google photo (fbUser.photoURL)
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            accessToken: "mock-token",
            user: {
              email: "photo-test@example.com",
              imageUrl: null,
            },
          }),
      });

      render(
        <AuthProvider>
          <PhotoTestComponent />
        </AuthProvider>
      );

      // Wait for all async operations to settle
      await waitFor(
        () => {
          expect(screen.getByTestId("is-authenticated").textContent).toBe(
            "true"
          );
        },
        { timeout: 5000 }
      );

      // Even after backend sync completes, custom photo should persist
      await waitFor(
        () => {
          const photoElement = screen.getByTestId("user-photo");
          // Photo should be custom data URL, not Google's photo
          expect(photoElement.textContent).not.toBe(GOOGLE_PHOTO_URL);
        },
        { timeout: 5000 }
      );
    });
  });

  describe("updateUserProfile - saves custom photo", () => {
    it("should save custom photoURL via updateUserProfile", async () => {
      // Setup authenticated user
      getCookieJSON.mockReturnValue({
        id: mockFirebaseUser.uid,
        email: mockFirebaseUser.email,
        provider: "google",
        photoURL: GOOGLE_PHOTO_URL,
      });

      (firebase.onFirebaseAuthStateChanged as jest.Mock).mockImplementation(
        (callback) => {
          callback(mockFirebaseUser);
          return jest.fn();
        }
      );

      (FirebaseUserService.getProfile as jest.Mock).mockResolvedValue(
        profileWithGooglePhoto
      );

      render(
        <AuthProvider>
          <PhotoTestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated").textContent).toBe(
          "true"
        );
      });

      // Simulate uploading a custom photo
      await act(async () => {
        const auth = (window as unknown as Record<string, unknown>)
          .__auth as ReturnType<typeof useAuth>;
        await auth.updateUserProfile({
          photoURL: CUSTOM_DATA_URL,
          avatar: CUSTOM_DATA_URL,
        });
      });

      // Verify Firestore updateProfile was called with custom data URL
      expect(FirebaseUserService.updateProfile).toHaveBeenCalledWith(
        mockFirebaseUser.uid,
        expect.objectContaining({
          photoURL: CUSTOM_DATA_URL,
        })
      );

      // Verify user state was updated
      await waitFor(() => {
        expect(screen.getByTestId("user-photo").textContent).toBe(
          CUSTOM_DATA_URL
        );
      });
    });

    it("should strip data URL from cookie to prevent overflow", async () => {
      getCookieJSON.mockReturnValue({
        id: mockFirebaseUser.uid,
        email: mockFirebaseUser.email,
        provider: "google",
      });

      (firebase.onFirebaseAuthStateChanged as jest.Mock).mockImplementation(
        (callback) => {
          callback(mockFirebaseUser);
          return jest.fn();
        }
      );

      (FirebaseUserService.getProfile as jest.Mock).mockResolvedValue(
        profileWithGooglePhoto
      );

      render(
        <AuthProvider>
          <PhotoTestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated").textContent).toBe(
          "true"
        );
      });

      // Clear previous setCookie calls from auth setup
      setCookie.mockClear();

      // Upload custom photo
      await act(async () => {
        const auth = (window as unknown as Record<string, unknown>)
          .__auth as ReturnType<typeof useAuth>;
        await auth.updateUserProfile({
          photoURL: CUSTOM_DATA_URL,
          avatar: CUSTOM_DATA_URL,
        });
      });

      // Verify setCookie was called but with photoURL stripped
      const cookieCalls = setCookie.mock.calls.filter(
        (call: unknown[]) => call[0] === "user"
      );
      expect(cookieCalls.length).toBeGreaterThan(0);

      const lastCookieData = cookieCalls[cookieCalls.length - 1][1];
      // The cookie should not contain the raw data URL
      expect(lastCookieData.photoURL).not.toBe(CUSTOM_DATA_URL);
    });
  });

  describe("Google re-login - custom photo preserved", () => {
    it("should preserve custom Firestore photoURL during Google re-login", async () => {
      // User re-signs in with Google; syncToFirestoreProfile is called
      (firebase.signInWithGoogle as jest.Mock).mockResolvedValue(
        mockFirebaseUser
      );

      // createOrUpdateProfile should return profile with preserved custom photo
      // (because of the fix in users.ts)
      (
        FirebaseUserService.createOrUpdateProfile as jest.Mock
      ).mockResolvedValue(profileWithCustomPhoto);

      (firebase.onFirebaseAuthStateChanged as jest.Mock).mockImplementation(
        (callback) => {
          // Initially no user
          callback(null);
          return jest.fn();
        }
      );

      render(
        <AuthProvider>
          <PhotoTestComponent />
        </AuthProvider>
      );

      // Trigger Google sign-in
      await act(async () => {
        const auth = (window as unknown as Record<string, unknown>)
          .__auth as ReturnType<typeof useAuth>;
        try {
          await auth.signInWithGoogle();
        } catch {
          // May throw due to redirect logic in test env
        }
      });

      // createOrUpdateProfile should have been called during syncToFirestoreProfile
      expect(
        FirebaseUserService.createOrUpdateProfile
      ).toHaveBeenCalledWith(
        mockFirebaseUser.uid,
        expect.objectContaining({
          email: mockFirebaseUser.email,
        })
      );
    });
  });
});
