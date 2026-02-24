"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAuth } from "firebase/auth";
import { UserApi } from "@/lib/api/user";
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";
import { PhoneVerificationSection } from "@/components/profile/PhoneVerificationSection";
import { PasswordManager } from "@/components/profile/PasswordManager";
import { AddressManager } from "@/components/profile/AddressManager";

export default function MyInformationPage() {
  const { user: authUser, isAuthenticated, updateUserProfile } = useAuth();

  // Fallback: get user from localStorage if AuthContext doesn't have it yet
  const [localUser, setLocalUser] = useState<typeof authUser>(null);

  useEffect(() => {
    if (!authUser) {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setLocalUser(parsed);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, [authUser]);

  // Use authUser from context, or fallback to localStorage
  const user = authUser || localUser;

  // Auth provider detection
  const [authProvider, setAuthProvider] = useState<
    "google" | "email" | "unknown"
  >("unknown");
  const [hasPassword, setHasPassword] = useState(false);

  // Phone state (orchestrated here, rendered by PhoneVerificationSection)
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Backend profile data
  const [backendProfile, setBackendProfile] = useState<{
    phoneNumber?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null>(null);

  /**
   * Fetch user profile from backend API (with caching)
   */
  useEffect(() => {
    const fetchBackendProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await UserApi.getProfile();

        if (response.success && response.data) {
          setBackendProfile(response.data);

          // Update phone number from backend - prefer phoneNumber, fallback to phone
          const phone = response.data.phoneNumber || response.data.phone;
          if (phone) {
            setPhoneNumber(phone);
          }
        }
      } catch (error) {
        console.error("[Profile] Failed to fetch backend profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    // Only fetch if user is authenticated (has auth-token)
    const hasAuthToken = document.cookie.includes("auth-token=");
    if (hasAuthToken) {
      fetchBackendProfile();
    } else {
      setProfileLoading(false);
    }
  }, []);

  /**
   * Initialize phone number from user profile (fallback to context/localStorage if backend didn't have it)
   */
  useEffect(() => {
    // Only set from context/localStorage if backend didn't provide phone number
    const backendPhone = backendProfile?.phoneNumber || backendProfile?.phone;
    if (!backendPhone && user?.phone && !phoneNumber) {
      setPhoneNumber(user.phone);
    }
  }, [
    user?.phone,
    backendProfile?.phoneNumber,
    backendProfile?.phone,
    phoneNumber,
  ]);

  /**
   * Detect authentication provider on mount
   */
  useEffect(() => {
    const detectAuthProvider = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setAuthProvider("unknown");
        return;
      }

      try {
        const providerData = currentUser.providerData;

        if (providerData.length === 0) {
          setAuthProvider("unknown");
          return;
        }

        const hasGoogleProvider = providerData.some(
          (provider) => provider.providerId === "google.com",
        );

        const hasEmailProvider = providerData.some(
          (provider) => provider.providerId === "password",
        );

        if (hasGoogleProvider && !hasEmailProvider) {
          setAuthProvider("google");
          setHasPassword(false);
        } else if (hasEmailProvider) {
          setAuthProvider("email");
          setHasPassword(true);
        } else if (hasGoogleProvider && hasEmailProvider) {
          setAuthProvider("google");
          setHasPassword(true);
        } else {
          setAuthProvider("unknown");
        }
      } catch (error) {
        console.error("[Profile] Error detecting auth provider:", error);
      }
    };

    if (isAuthenticated) {
      detectAuthProvider();
    }
  }, [isAuthenticated, user]);

  // ---------------------------------------------------------------------------
  // Phone verification callbacks
  // ---------------------------------------------------------------------------

  const handlePhoneVerified = (verifiedPhone: string) => {
    setPhoneNumber(verifiedPhone);
    setPhoneVerified(true);
    setBackendProfile((prev) =>
      prev
        ? { ...prev, phoneNumber: verifiedPhone }
        : { phoneNumber: verifiedPhone },
    );
    // Update localStorage
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.phone = verifiedPhone;
        localStorage.setItem("user", JSON.stringify(parsed));
      }
    } catch {
      // Ignore localStorage errors
    }
  };

  const handlePhoneSaved = async (phone: string) => {
    try {
      const response = await UserApi.updateProfile({ phoneNumber: phone });
      if (response.success) {
        setPhoneNumber(phone);
        setBackendProfile((prev) =>
          prev
            ? { ...prev, phoneNumber: phone }
            : { phoneNumber: phone },
        );
        if (updateUserProfile) {
          await updateUserProfile({ phone });
        }
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            parsed.phone = phone;
            localStorage.setItem("user", JSON.stringify(parsed));
          }
        } catch {
          // Ignore localStorage errors
        }
      }
    } catch (error) {
      console.error("[Profile] Error saving phone:", error);
    }
  };

  const handlePasswordLinked = () => {
    setHasPassword(true);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account information and delivery addresses
        </p>
      </div>

      {/* Account Information Card */}
      <ProfileInfoCard
        user={user}
        authProvider={authProvider}
        hasPassword={hasPassword}
        profileLoading={profileLoading}
        backendProfile={backendProfile}
        updateUserProfile={updateUserProfile}
        phoneSection={
          <PhoneVerificationSection
            user={user ? { uid: user.id, phone: user.phone, phoneNumber: phoneNumber } : null}
            phoneVerified={phoneVerified}
            phoneNumber={phoneNumber}
            onPhoneVerified={handlePhoneVerified}
            onPhoneSaved={handlePhoneSaved}
            onPhoneChange={(phone) => setPhoneNumber(phone)}
          />
        }
        passwordSection={
          <PasswordManager
            authProvider={authProvider}
            hasPassword={hasPassword}
            onPasswordLinked={handlePasswordLinked}
          />
        }
      />

      {/* Addresses Section */}
      <AddressManager
        isAuthenticated={isAuthenticated}
        userId={user?.id}
      />
    </div>
  );
}
