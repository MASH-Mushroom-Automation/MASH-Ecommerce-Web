"use client";

/**
 * Start Selling Page
 * 
 * Entry point for seller registration using Issue #88 multi-step flow
 * Features:
 * - Hero section with benefits
 * - Multi-step registration wizard (4 steps)
 * - Form state persistence
 * - Success modal on completion
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isAuthenticated } from "@/lib/auth";
import { HeroSection } from "./components/HeroSection";
import { SellerRegistrationForm } from "@/components/seller/SellerRegistrationForm";
import { SuccessModal } from "./components/SuccessModal";

export default function StartSellingPage() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentView, setCurrentView] = useState<"hero" | "form">("hero");

  // Check authentication
  React.useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please log in to apply as a seller");
      router.push("/login?redirect=/start-selling");
    }
  }, [router]);

  const handleSuccess = () => {
    setShowSuccessModal(true);
    toast.success("Application submitted successfully!");
  };

  const handleCancel = () => {
    setCurrentView("hero");
  };

  if (showSuccessModal) {
    return <SuccessModal onClose={() => router.push("/")} />;
  }

  if (currentView === "hero") {
    return <HeroSection onContinue={() => setCurrentView("form")} />;
  }

  return (
    <SellerRegistrationForm
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
