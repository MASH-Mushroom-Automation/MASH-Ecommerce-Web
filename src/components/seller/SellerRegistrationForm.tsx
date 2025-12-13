/**
 * Seller Registration Form Component
 * 
 * Multi-step wizard for seller registration with:
 * - Progress indicator
 * - Form state persistence
 * - Step validation
 * - Mobile-responsive design
 */

"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ArrowLeft, ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";

// Validation schemas
import type {
  SellerRegistrationFormData,
} from "@/lib/validations/seller-registration";

// Step components
import { BusinessInfoStep } from "./steps/BusinessInfoStep";
import { ContactInfoStep } from "./steps/ContactInfoStep";
import { TaxLegalInfoStep } from "./steps/TaxLegalInfoStep";
import { TermsConditionsStep } from "./steps/TermsConditionsStep";

// Progress indicator
import { ProgressIndicator, Step } from "./ProgressIndicator";

// Form storage utilities
import {
  saveFormData,
  getFormData,
  clearFormData,
  saveCurrentStep,
  getCurrentStep,
  clearCurrentStep,
} from "@/lib/utils/form-storage";

const STEPS: Step[] = [
  {
    id: 1,
    title: "Business Info",
    description: "Basic details",
  },
  {
    id: 2,
    title: "Contact Info",
    description: "Contact details",
  },
  {
    id: 3,
    title: "Tax & Legal",
    description: "Legal information",
  },
  {
    id: 4,
    title: "Review & Submit",
    description: "Terms & conditions",
  },
];

interface SellerRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SellerRegistrationForm({
  onSuccess,
  onCancel,
}: SellerRegistrationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDraftWarning, setShowDraftWarning] = useState(false);

  const form = useForm<SellerRegistrationFormData>({
    mode: "onChange",
    defaultValues: {
      businessName: "",
      businessDescription: "",
      businessCategory: "",
      businessType: "individual" as const,
      establishedYear: "",
      contactPersonName: "",
      email: "",
      phoneNumber: "",
      alternativePhone: "",
      businessAddress: {
        street: "",
        barangay: "",
        city: "",
        province: "",
        region: "",
        postalCode: "",
      },
      taxIdNumber: "",
      dtiRegistrationNumber: "",
      secRegistrationNumber: "",
      businessPermitNumber: "",
      bankAccountName: "",
      bankName: "",
      bankAccountNumber: "",
      agreeToTerms: false,
      agreeToSellerPolicy: false,
      agreeToPrivacyPolicy: false,
      acknowledgeDataAccuracy: false,
    },
  });

  // Load saved form data on mount
  useEffect(() => {
    const savedData = getFormData();
    const savedStep = getCurrentStep();

    if (savedData && Object.keys(savedData).length > 0) {
      setShowDraftWarning(true);
      
      // Restore form data
      Object.keys(savedData).forEach((key) => {
        const value = savedData[key as keyof SellerRegistrationFormData];
        if (value !== undefined) {
          form.setValue(key as keyof SellerRegistrationFormData, value);
        }
      });

      // Restore current step
      if (savedStep > 0 && savedStep <= STEPS.length) {
        setCurrentStep(savedStep);
      }

      toast.info("Draft restored", {
        description: "Your previous progress has been restored.",
      });
    }
  }, [form]);

  // Save form data whenever it changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      saveFormData(value as Partial<SellerRegistrationFormData>);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Save current step
  useEffect(() => {
    saveCurrentStep(currentStep);
  }, [currentStep]);

  const handleNext = async () => {
    const isValid = await form.trigger();

    if (!isValid) {
      toast.error("Please fix the errors before continuing");
      return;
    }

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    // Move to next step
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveDraft = () => {
    saveFormData(form.getValues());
    toast.success("Draft saved", {
      description: "Your progress has been saved. You can continue later.",
    });
  };

  const handleDiscardDraft = () => {
    clearFormData();
    clearCurrentStep();
    form.reset();
    setCurrentStep(1);
    setCompletedSteps([]);
    setShowDraftWarning(false);
    toast.info("Draft discarded");
  };

  const onSubmit = async (data: SellerRegistrationFormData) => {
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/seller/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      // Clear saved form data
      clearFormData();
      clearCurrentStep();

      toast.success("Registration submitted!", {
        description: "We'll review your application and get back to you within 2-3 business days.",
      });

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/seller/registration-success");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed", {
        description: "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BusinessInfoStep form={form} />;
      case 2:
        return <ContactInfoStep form={form} />;
      case 3:
        return <TaxLegalInfoStep form={form} />;
      case 4:
        return <TermsConditionsStep form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Become a MASH Seller
          </h1>
          <p className="text-muted-foreground">
            Complete the registration process to start selling your products
          </p>
        </div>

        {/* Draft Warning */}
        {showDraftWarning && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have a saved draft from a previous session.{" "}
              <button
                onClick={handleDiscardDraft}
                className="underline font-medium hover:text-primary"
              >
                Start over
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Indicator */}
        <ProgressIndicator
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />

        {/* Form Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {renderStepContent()}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 sm:flex-none"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              onClick={handleSaveDraft}
              className="flex-1 sm:flex-none"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            )}

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 sm:flex-none"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help?{" "}
          <a href="/support" className="text-primary hover:underline">
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  );
}
