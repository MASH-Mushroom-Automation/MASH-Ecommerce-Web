"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isAuthenticated } from "@/lib/auth";
import { HeroSection } from "./components/HeroSection";
import { ApplicationForm } from "./components/ApplicationForm";
import { SuccessModal } from "./components/SuccessModal";
import { PendingApplicationModal } from "./components/PendingApplicationModal";
import { FailedApplicationModal } from "./components/FailedApplicationModal";
import { useSellerApplicationForm } from "./hooks/useSellerApplicationForm";
import { Loader2 } from "lucide-react";

// Re-export schema and types for components that need them
export { sellerApplicationSchema, type SellerApplicationForm } from "./schema";

export default function StartSellingPage() {
  const router = useRouter();

  // All form logic is now in the custom hook
  const {
    form,
    onSubmit,
    currentStep,
    showSuccessModal,
    isSubmitting,
    verificationStatus,
    isCheckingStatus,
    hasPendingApplication,
    hasFailedApplication,
    startResubmission,
    goToForm,
    goToHero,
  } = useSellerApplicationForm();

  // Check authentication
  React.useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please log in to apply as a seller");
      router.push("/login?redirect=/start-selling");
    }
  }, [router]);

  // Redirect to seller dashboard if application is approved
  React.useEffect(() => {
    if (verificationStatus?.status === "APPROVED") {
      toast.success("Your seller application has been approved!");
      router.push("/seller/dashboard");
    }
  }, [verificationStatus, router]);

  // Show loading state while checking verification status or redirecting approved users
  if (isCheckingStatus || verificationStatus?.status === "APPROVED") {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-12">
        <div className="bg-background rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 max-w-md w-full text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {verificationStatus?.status === "APPROVED"
              ? "Redirecting to seller dashboard..."
              : "Checking application status..."}
          </p>
        </div>
      </div>
    );
  }

  // Show pending application modal if user already has a pending application
  if (hasPendingApplication) {
    return (
      <PendingApplicationModal
        onClose={() => router.push("/")}
        verificationStatus={verificationStatus}
      />
    );
  }

  // Show failed application modal if application was rejected/failed
  if (hasFailedApplication) {
    return (
      <FailedApplicationModal
        onClose={() => router.push("/")}
        verificationStatus={verificationStatus}
        onStartResubmission={startResubmission}
      />
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
