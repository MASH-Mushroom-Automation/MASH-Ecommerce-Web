"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Store,
  TrendingUp,
  Users,
  Package,
  Shield,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { HeroSection } from "./components/HeroSection";
import { ApplicationForm } from "./components/ApplicationForm";
import { SuccessModal } from "./components/SuccessModal";

export const sellerApplicationSchema = z.object({
  // Business Information
  businessName: z.string().min(2, "Business name is required").max(24, "Business name must be 24 characters or less"),
  businessType: z.enum(["individual", "company"], {
    message: "Please select a business type",
  }),
  taxId: z
    .string()
    .optional()
    .refine((val) => (val ? /^\d+$/.test(val) : true), {
      message: "Tax ID must contain numbers only",
    }),
  
  // Contact Details
  fullName: z.string().min(2, "Full name is required").max(24, "Full name must be 24 characters or less"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^(09|\+639)\d{9}$/,
      "Please enter a valid Philippine phone number (e.g., 09123456789 or +639123456789)"
    ),
  address: z.string().min(10, "Please provide a complete address"),
  city: z.string().min(2, "City is required"),
  region: z.string().min(2, "Region is required"),
  
  // Product Information
  mushroomTypes: z.array(z.string()).min(1, "Select at least one mushroom type"),
  mushroomOther: z.string().optional(),
  productionCapacity: z.string().min(1, "Production capacity is required"),
  certifications: z.string().optional(),

  // Terms
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, "You must agree to the terms and conditions"),
});

export type SellerApplicationForm = z.infer<typeof sellerApplicationSchema>;

export default function StartSellingPage() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = hero, 1 = form

  const form = useForm<SellerApplicationForm>({
    resolver: zodResolver(sellerApplicationSchema),
    defaultValues: {
      businessName: "",
      businessType: "individual",
      taxId: "",
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      region: "",
      mushroomTypes: [],
      productionCapacity: "",
      certifications: "",
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: SellerApplicationForm) => {
    try {
      // TODO: Implement actual API call
      console.log("Submitting seller application:", data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Show success modal
      setShowSuccessModal(true);
      
      toast.success("Application submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
    }
  };

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
    return <HeroSection onContinue={() => setCurrentStep(1)} />;
  }

  return (
    <ApplicationForm
      form={form}
      onSubmit={onSubmit}
      onBack={() => setCurrentStep(0)}
    />
  );
}
