"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isAuthenticatedSync } from "@/lib/auth";
import { HeroSection } from "./components/HeroSection";
import { ApplicationForm } from "./components/ApplicationForm";
import { SuccessModal } from "./components/SuccessModal";
import { useSellerApplicationForm } from "./hooks/useSellerApplicationForm";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUser";

// Re-export schema and types for components that need them
export { sellerApplicationSchema, type SellerApplicationForm } from "./schema";

interface SellerStatusResponse {
  hasPendingRequest: boolean;
  status: "none" | "pending" | "approved" | "rejected";
  requestId?: string;
  submittedAt?: Date;
}

type SellerStatusEnvelope = {
  data?: SellerStatusResponse;
  success?: boolean;
  statusCode?: number;
};

function normalizeSellerStatus(
  payload: SellerStatusResponse | SellerStatusEnvelope,
): SellerStatusResponse {
  const maybeEnvelope = payload as SellerStatusEnvelope;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && maybeEnvelope.data) {
    return maybeEnvelope.data;
  }
  return payload as SellerStatusResponse;
}

export default function StartSellingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const [statusChecked, setStatusChecked] = useState(false);

  // All form logic is now in the custom hook
  const {
    form,
    onSubmit,
    currentStep,
    showSuccessModal,
    isSubmitting,
    goToForm,
    goToHero,
  } = useSellerApplicationForm();

  // Gate: auth check → role check → API seller status check
  useEffect(() => {
    // Wait for auth context to finish loading
    if (authLoading) return;

    // Not logged in → redirect to login
    if (!user && !isAuthenticatedSync()) {
      toast.error("Please log in to apply as a seller");
      router.push("/login?redirect=/start-selling");
      return;
    }

    const checkSellerStatus = async () => {
      try {
        // Role check from JWT (source of truth for access decisions)
        const roleRes = await fetch("/api/auth/get-role", {
          method: "GET",
          credentials: "include",
        });
        if (roleRes.ok) {
          const roleData: { role?: string | null } = await roleRes.json();
          const role = (roleData?.role || "").toUpperCase();
          if (role === "ADMIN" || role === "SUPER_ADMIN") {
            router.push("/seller/dashboard");
            return;
          }
        }

        // Wait for profile to finish loading so we can avoid a flash for admins
        // (some providers may not have role in JWT consistently)
        if (profileLoading) return;

        // Fallback role check from backend user profile if available
        if (profile) {
          const role = (profile.role || "").toUpperCase();
          if (role === "ADMIN" || role === "SUPER_ADMIN") {
            router.push("/seller/dashboard");
            return;
          }
        }

        // For non-admin users, check seller application status via backend API (JWT-scoped)
        const statusRes = await fetch("/api/seller-status", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const raw = (await statusRes.json()) as
          | SellerStatusResponse
          | SellerStatusEnvelope;
        const res = normalizeSellerStatus(raw);
        console.log("[StartSelling] seller status:", res);

        switch (res?.status) {
          case "approved":
            router.push("/seller/dashboard");
            break;
          case "pending":
            router.push("/request-pending");
            break;
          default:
            // "none" or "rejected" → allow them to see the form
            setStatusChecked(true);
        }
      } catch {
        // API error → allow form access as fallback
        setStatusChecked(true);
      }
    };

    checkSellerStatus();
  }, [router, user, authLoading, profile, profileLoading]);

  // Show loading while auth, profile, or seller status is being resolved
  if (authLoading || profileLoading || !statusChecked) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showSuccessModal) {
    return <SuccessModal onClose={() => router.push("/")} />;
  }

  if (currentStep === 0) {
    return <HeroSection onContinue={goToForm} />;
  }

  return (
    <ApplicationForm
      form={form}
      onSubmit={onSubmit}
      onBack={goToHero}
      isSubmitting={isSubmitting}
    />
  );
}
