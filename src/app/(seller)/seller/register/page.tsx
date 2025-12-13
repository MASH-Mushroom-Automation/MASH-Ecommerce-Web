/**
 * Seller Registration Page
 * 
 * Entry point for new sellers to register on the platform
 */

"use client";

import { SellerRegistrationForm } from "@/components/seller/SellerRegistrationForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAuthenticated } from "@/lib/auth";
import { toast } from "sonner";

export default function SellerRegistrationPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      toast.error("Please log in to register as a seller");
      router.push("/login?redirect=/seller/register");
    }
  }, [router]);

  const handleSuccess = () => {
    router.push("/seller/registration-success");
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <SellerRegistrationForm onSuccess={handleSuccess} onCancel={handleCancel} />
  );
}
