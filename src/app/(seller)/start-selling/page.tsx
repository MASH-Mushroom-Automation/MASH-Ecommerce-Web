"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isAuthenticated } from "@/lib/auth";
import { HeroSection } from "./components/HeroSection";
import { ApplicationForm } from "./components/ApplicationForm";
import { SuccessModal } from "./components/SuccessModal";
import { useSellerApplicationForm } from "./hooks/useSellerApplicationForm";

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
